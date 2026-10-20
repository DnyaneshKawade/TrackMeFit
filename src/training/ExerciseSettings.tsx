// The person's own settings for one exercise (spec T-112): weight step, rest
// time and machine or seat notes. Empty boxes keep the usual values.

import { useState } from 'react'
import { useWeightUnit } from '../settings/units'
import { shownWeight, stepIn } from '../engine/units'
import { restSeconds } from './restTimer'
import { baseExercise, exerciseSetting, MAX_SETUP_NOTE, REST_RANGE, STEP_KG_RANGE, type ExerciseSetting } from './exercises'

const num = (s: string) => Number(s.replace(',', '.'))

export function ExerciseSettings({ exerciseId, onSave, onClose }: { exerciseId: string; onSave: (s: ExerciseSetting) => Promise<void>; onClose: () => void }) {
  const unit = useWeightUnit()
  const base = baseExercise(exerciseId)
  const now = exerciseSetting(exerciseId)
  // In lb the step shows doubled, as on the + and − buttons.
  const [step, setStep] = useState(now?.stepKg ? String(shownWeight(stepIn(now.stepKg, unit), 'kg')) : '')
  const [rest, setRest] = useState(now?.restSec ? String(now.restSec) : '')
  const [note, setNote] = useState(now?.note ?? '')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (!base) return null

  const save = async () => {
    const stepKg = step.trim() ? (unit === 'kg' ? num(step) : num(step) / 2) : undefined
    const restSec = rest.trim() ? num(rest) : undefined
    if (stepKg !== undefined && !(stepKg >= STEP_KG_RANGE[0] && stepKg <= STEP_KG_RANGE[1]))
      return setError(`The weight step must be ${stepIn(STEP_KG_RANGE[0], unit)} to ${stepIn(STEP_KG_RANGE[1], unit)} ${unit}.`)
    if (restSec !== undefined && !(Number.isInteger(restSec) && restSec >= REST_RANGE[0] && restSec <= REST_RANGE[1]))
      return setError(`Rest must be ${REST_RANGE[0]} to ${REST_RANGE[1]} seconds.`)
    setBusy(true)
    setError(null)
    try {
      await onSave({ exerciseId, ...(stepKg ? { stepKg } : {}), ...(restSec ? { restSec } : {}), ...(note.trim() ? { note: note.trim() } : {}) })
      onClose()
    } catch {
      setError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <div className="exercise-settings" role="group" aria-label={`Settings for ${base.name}`}>
      <label>
        <span>Weight step ({unit})</span>
        <input inputMode="decimal" placeholder={String(stepIn(base.increment, unit))} value={step} onChange={(e) => setStep(e.target.value)} />
      </label>
      <label>
        <span>Rest (seconds)</span>
        <input inputMode="numeric" placeholder={String(restSeconds(base))} value={rest} onChange={(e) => setRest(e.target.value)} />
      </label>
      <label>
        <span>Machine or seat notes</span>
        <input placeholder="Like seat 4, pin 3" maxLength={MAX_SETUP_NOTE} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <p className="muted">Leave a box empty to use the usual value.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy} onClick={save}>Save settings</button>
      <button className="link" onClick={onClose}>Cancel</button>
    </div>
  )
}
