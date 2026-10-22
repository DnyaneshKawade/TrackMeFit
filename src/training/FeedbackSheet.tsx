import { useState } from 'react'
import type { Effort, Muscle, Pump } from '../engine/training'
import { exerciseById, MUSCLE_NAMES } from './exercises'
import type { Feedback } from './progression'

const PUMP: [Pump, string][] = [['low', 'Low'], ['some', 'Some'], ['great', 'Great']]
const EFFORT: [Effort, string][] = [['easy', 'Easy'], ['right', 'Just right'], ['hard', 'Too hard']]

/** Quick questions per muscle trained, used for next week's sets. How it
 * healed is asked at its first set next time instead (T-082g).
 * "Something hurt" is asked per exercise, so a swap fits that lift (T-108). */
export function FeedbackSheet({
  muscles,
  exercises = [],
  onSave,
  onSkip,
}: {
  muscles: Muscle[]
  /** The exercises done, each asked about under its main muscle. */
  exercises?: string[]
  onSave: (f: Feedback[]) => Promise<void>
  onSkip: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, Partial<Feedback>>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [hurt, setHurt] = useState<Set<string>>(new Set())
  const set = (m: Muscle, patch: Partial<Feedback>) => setAnswers((a) => ({ ...a, [m]: { ...a[m], ...patch } }))
  const toggle = (id: string, on: boolean) =>
    setHurt((h) => {
      const next = new Set(h)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  const doneFor = (m: Muscle) => exercises.filter((id) => exerciseById.get(id)?.primary === m)

  const save = async () => {
    const done = muscles
      .map((m) => {
        const ids = doneFor(m).filter((id) => hurt.has(id))
        return { muscle: m, ...answers[m], pain: ids.length > 0, ...(ids.length ? { hurt: ids } : {}) }
      })
      .filter((f): f is Feedback => !!f.effort)
    setBusy(true)
    try {
      await onSave(done)
    } catch {
      setError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <section className="sheet feedback" aria-label="How did it feel?">
      <header className="sheet-head">
        <h2>How did it feel?</h2>
        <button className="link" onClick={onSkip}>Skip</button>
      </header>
      <p className="muted">Your answers set next week’s sets. Skip any muscle you’re unsure about.</p>
      {muscles.map((m) => {
        const name = MUSCLE_NAMES[m]
        const a = answers[m] ?? {}
        return (
          <fieldset key={m} className="feedback-muscle">
            <legend>{name}</legend>
            <div className="choice" role="group" aria-label={`${name}: how hard?`}>
              <span className="muted">How hard?</span>
              {EFFORT.map(([v, label]) => (
                <button key={v} aria-pressed={a.effort === v} onClick={() => set(m, { effort: v })}>{label}</button>
              ))}
            </div>
            <div className="choice" role="group" aria-label={`${name}: pump?`}>
              <span className="muted">Pump? (you can skip this)</span>
              {PUMP.map(([v, label]) => (
                <button key={v} aria-pressed={a.pump === v} onClick={() => set(m, { pump: a.pump === v ? undefined : v })}>{label}</button>
              ))}
            </div>
            {doneFor(m).map((id) => (
              <label key={id} className="pain">
                <input type="checkbox" checked={hurt.has(id)} onChange={(e) => toggle(id, e.target.checked)} /> Something hurt in{' '}
                {exerciseById.get(id)?.name.toLowerCase()}
              </label>
            ))}
          </fieldset>
        )
      })}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy} onClick={save}>Save</button>
    </section>
  )
}
