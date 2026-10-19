// The age question everyone answers once (spec T-086), people and coaches,
// email and Google sign-ups alike. It can't be skipped.

import { useState } from 'react'
import { ageOn, MAX_AGE, MIN_AGE } from '../profile/types'

/** What is wrong with a birth date, or null. */
function ageProblem(date: string, today: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) return 'Pick your date of birth.'
  const age = ageOn(date, today)
  if (age < MIN_AGE) return `Track Me Fit is for people ${MIN_AGE} and older.`
  if (age > MAX_AGE) return 'Check the year of birth.'
  return null
}

export function AgeStep({ today, onSave, onSignOut }: { today: string; onSave: (birthDate: string) => Promise<void>; onSignOut: () => void }) {
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <main className="auth">
      <h1 className="auth-brand">Track Me Fit</h1>
      <p className="auth-tagline">One question first.</p>
      <form
        aria-label="Your age"
        onSubmit={async (e) => {
          e.preventDefault()
          const problem = ageProblem(date, today)
          setError(problem ?? '')
          if (problem) return
          setBusy(true)
          try {
            await onSave(date)
          } catch (err) {
            const msg = String((err as Error)?.message ?? err)
            setError(
              /coaches must be 18/.test(msg)
                ? 'Coaches must be 18 or older. Write to trackmefit5@gmail.com to use the app for yourself.'
                : /under 13/.test(msg)
                  ? `Track Me Fit is for people ${MIN_AGE} and older.`
                  : 'Couldn’t save. Check your connection and try again.',
            )
            setBusy(false)
          }
        }}
      >
        <label className="auth-field">
          Date of birth
          <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
        </label>
        <p className="auth-hint">We ask everyone once. Under 18, a parent says yes first.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-primary" disabled={busy}>Continue</button>
      </form>
      <button className="link" onClick={onSignOut}>Sign out</button>
    </main>
  )
}
