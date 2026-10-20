// Skip a workout day (spec T-110): the plan moves on to the next day, and the
// skip shows in the week review. The reason is optional.

import { useState } from 'react'
import { MAX_SKIP_REASON, type PlanDay } from './types'

const REASONS = ['Busy', 'Ill', 'Travel', 'Too sore']

export function SkipView({ day, next, onSkip, onClose }: { day: PlanDay; next?: PlanDay; onSkip: (reason?: string) => Promise<void>; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const skip = async () => {
    setBusy(true)
    setError(null)
    try {
      await onSkip(reason.trim() || undefined)
    } catch {
      setError('Couldn’t skip. Skipping needs a connection. Try again.')
      setBusy(false)
    }
  }
  return (
    <section className="sheet" aria-label={`Skip ${day.name}`}>
      <header className="sheet-head">
        <h2>Skip {day.name}?</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      <p>{next ? `Your plan moves on to ${next.name}.` : 'Your plan starts this day again next time.'} The skip shows in your week review.</p>
      <div className="choice" role="group" aria-label="Reason">
        <span className="muted">Why? (you can leave this out)</span>
        {REASONS.map((r) => (
          <button key={r} aria-pressed={reason === r} onClick={() => setReason(reason === r ? '' : r)}>{r}</button>
        ))}
      </div>
      <input aria-label="Other reason" placeholder="Other reason" maxLength={MAX_SKIP_REASON} value={REASONS.includes(reason) ? '' : reason} onChange={(e) => setReason(e.target.value)} />
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy} onClick={skip}>Skip this workout</button>
    </section>
  )
}
