// "Choose a new password" after a "Forgot password" email link (spec T-085).
// The link signs the person in; this screen saves the new password.

import { useState } from 'react'
import { friendlyAuthError, type AuthService } from './types'
import { checkPassword } from './validate'
import './auth.css'

export function NewPassword({ auth, onDone }: { auth: AuthService; onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = checkPassword(password) ?? (password !== again ? 'The two passwords are not the same.' : null)
    setError(problem)
    if (problem || !auth.updatePassword) return
    setBusy(true)
    try {
      await auth.updatePassword(password)
      setSaved(true)
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  if (saved) {
    return (
      <main className="auth">
        <h1 className="auth-brand">Track Me Fit</h1>
        <p role="status">Your new password is saved. Use it next time you sign in.</p>
        <button className="primary" onClick={onDone}>Open the app</button>
      </main>
    )
  }
  return (
    <main className="auth">
      <h1 className="auth-brand">Track Me Fit</h1>
      <form aria-label="Choose a new password" onSubmit={(e) => void save(e)}>
        <h2>Choose a new password</h2>
        <label>
          New password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </label>
        <label>
          Type it again
          <input type="password" value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" />
        </label>
        <p className="muted">Use at least 8 characters, with letters and a number.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>Save new password</button>
        <button type="button" className="link" onClick={onDone} disabled={busy}>Not now</button>
      </form>
    </main>
  )
}
