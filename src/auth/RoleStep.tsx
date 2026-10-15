import { useState } from 'react'
import type { Role } from './types'
import './auth.css'

/** The first screen of a new Google account: who the account is for (T-066).
 * Email sign-ups answer this on the sign-up form instead. */
export function RoleStep({ name, onChoose }: { name: string; onChoose: (role: Role) => Promise<void> }) {
  const [role, setRole] = useState<Role>('user')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await onChoose(role)
    } catch {
      setError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <main className="auth">
      <h1 className="auth-brand">Track Me Fit</h1>
      <p className="auth-tagline">{name ? `Welcome, ${name.split(' ')[0]}.` : 'Welcome.'} One question first.</p>
      <fieldset className="auth-roles">
        <legend>I am</legend>
        <label className={role === 'user' ? 'picked' : ''}>
          <input type="radio" name="role" checked={role === 'user'} onChange={() => setRole('user')} />
          <strong>Tracking my own fitness</strong>
          <span>Log food and workouts, with or without a coach</span>
        </label>
        <label className={role === 'coach' ? 'picked' : ''}>
          <input type="radio" name="role" checked={role === 'coach'} onChange={() => setRole('coach')} />
          <strong>A coach</strong>
          <span>Plan and track your clients</span>
        </label>
      </fieldset>
      <p className="auth-hint">You can’t change this later.</p>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-primary" disabled={busy} onClick={() => void save()}>Continue</button>
    </main>
  )
}
