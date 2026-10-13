import { useState } from 'react'
import { carbsFromRest, checkTarget, macroMismatch, type TargetValues } from './types'

type Field = keyof TargetValues
const FIELDS: { key: Field; label: string; unit: string }[] = [
  { key: 'kcal', label: 'Calories', unit: 'kcal' },
  { key: 'proteinG', label: 'Protein', unit: 'g' },
  { key: 'carbG', label: 'Carbs', unit: 'g' },
  { key: 'fatG', label: 'Fat', unit: 'g' },
]

const toNum = (s: string) => (s.trim() === '' ? undefined : Number(s))

export function TargetsForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: TargetValues | null
  onSave: (v: TargetValues) => Promise<void>
  onCancel: () => void
}) {
  const [text, setText] = useState<Record<Field, string>>(() => ({
    kcal: initial ? String(initial.kcal) : '',
    proteinG: initial ? String(initial.proteinG) : '',
    carbG: initial ? String(initial.carbG) : '',
    fatG: initial ? String(initial.fatG) : '',
  }))
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const values = Object.fromEntries(FIELDS.map((f) => [f.key, toNum(text[f.key])])) as Partial<TargetValues>
  const complete = FIELDS.every((f) => values[f.key] !== undefined && !Number.isNaN(values[f.key]))
  const note = complete ? macroMismatch(values as TargetValues) : null
  const canFill = [values.kcal, values.proteinG, values.fatG].every((n) => n !== undefined && !Number.isNaN(n))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = checkTarget(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    setFormError(null)
    try {
      await onSave(values as TargetValues)
    } catch {
      setFormError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <form className="targets" onSubmit={save} noValidate>
      <header className="sheet-head">
        <h2>Daily targets</h2>
        <button type="button" className="link" onClick={onCancel}>Close</button>
      </header>
      <p className="muted">Enter what you or your coach decided. New targets start today; earlier days keep theirs.</p>
      {FIELDS.map((f) => (
        <label key={f.key} className="target-field">
          <span>{f.label}</span>
          <span className="target-input">
            <input
              aria-label={f.label}
              inputMode="numeric"
              value={text[f.key]}
              onChange={(e) => setText({ ...text, [f.key]: e.target.value })}
            />
            <span className="muted">{f.unit}</span>
          </span>
          {errors[f.key] && <small className="error">{errors[f.key]}</small>}
        </label>
      ))}
      <button
        type="button"
        className="link"
        disabled={!canFill}
        onClick={() => setText({ ...text, carbG: String(carbsFromRest(values.kcal!, values.proteinG!, values.fatG!)) })}
      >
        Fill carbs from the calories left
      </button>
      {note && <p className="muted" role="note">{note}</p>}
      {formError && <p className="error" role="alert">{formError}</p>}
      <button className="primary" type="submit" disabled={busy}>Save targets</button>
    </form>
  )
}
