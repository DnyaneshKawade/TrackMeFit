import { useState, type FormEvent } from 'react'
import { friendlyAuthError, type AuthService, type Role } from './types'
import { checkEmail, checkName, checkPassword } from './validate'
import './auth.css'

type Mode = 'signIn' | 'signUp' | 'reset'

export function SignIn({ auth }: { auth: AuthService }) {
  const [mode, setMode] = useState<Mode>('signIn')
  const [role, setRole] = useState<Role>('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const switchMode = (m: Mode) => {
    setMode(m)
    setErrors({})
    setNotice(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const found: Record<string, string> = {}
    const emailErr = checkEmail(email)
    if (emailErr) found.email = emailErr
    if (mode !== 'reset') {
      const pwErr = mode === 'signUp' ? checkPassword(password) : password ? null : 'Enter your password.'
      if (pwErr) found.password = pwErr
    }
    if (mode === 'signUp') {
      const nameErr = checkName(name)
      if (nameErr) found.name = nameErr
    }
    setErrors(found)
    setNotice(null)
    if (Object.keys(found).length) return

    setBusy(true)
    try {
      if (mode === 'signIn') await auth.signIn(email, password)
      else if (mode === 'reset') {
        await auth.resetPassword(email)
        setNotice('If that email has an account, we sent it a reset link.')
      } else {
        const { needsEmailConfirm } = await auth.signUp({ email, password, name, role })
        if (needsEmailConfirm) setNotice('Almost done. Open the link we emailed you to confirm your account.')
      }
    } catch (err) {
      setErrors({ form: friendlyAuthError(err) })
    } finally {
      setBusy(false)
    }
  }

  const google = async () => {
    setErrors({})
    try {
      await auth.signInWithGoogle()
    } catch (err) {
      setErrors({ form: friendlyAuthError(err) })
    }
  }

  return (
    <main className="auth">
      <h1 className="auth-brand">Track Me Fit</h1>
      <p className="auth-tagline">Your diet and training, made simple.</p>

      {mode !== 'reset' && (
        <div className="auth-tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'signIn'} onClick={() => switchMode('signIn')}>Sign in</button>
          <button role="tab" aria-selected={mode === 'signUp'} onClick={() => switchMode('signUp')}>Create account</button>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        {mode === 'signUp' && (
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
        )}

        {mode === 'signUp' && (
          <Field label="Your name" error={errors.name}>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>
        )}
        <Field label="Email" error={errors.email}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" />
        </Field>
        {mode !== 'reset' && (
          <Field label="Password" error={errors.password}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            />
          </Field>
        )}

        {errors.form && <p className="auth-error" role="alert">{errors.form}</p>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}

        <button className="auth-primary" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signIn' ? 'Sign in' : mode === 'signUp' ? 'Create account' : 'Send reset link'}
        </button>
      </form>

      {mode !== 'reset' && <button className="auth-google" onClick={google}>Continue with Google</button>}
      {mode === 'signUp' && <p className="auth-hint">With Google, you pick coach or not on the next screen.</p>}
      <p className="auth-hint">
        {mode === 'signUp' && 'See what we keep and why: '}
        <a href="/privacy.html" target="_blank" rel="noreferrer">Privacy policy</a>
      </p>

      {mode === 'signIn' && <button className="auth-link" onClick={() => switchMode('reset')}>Forgot password?</button>}
      {mode === 'reset' && <button className="auth-link" onClick={() => switchMode('signIn')}>Back to sign in</button>}
    </main>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      {children}
      {error && <small className="auth-error">{error}</small>}
    </label>
  )
}
