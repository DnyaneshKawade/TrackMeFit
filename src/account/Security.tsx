// Sign-in and security on the Account page (spec T-091): the email and how
// the person signs in, change password (old one first) and change email.
// A Google user can add a password after a code sent to their email (T-091b).

import { useState } from 'react'
import { friendlyAuthError } from '../auth/types'
import { checkEmail, checkPassword } from '../auth/validate'

export interface SecurityProps {
  email: string
  signInWith: 'email' | 'google'
  changePassword?: (oldPassword: string, newPassword: string) => Promise<void>
  changeEmail?: (email: string) => Promise<void>
  sendPasswordCode?: () => Promise<void>
  addPassword?: (code: string, password: string) => Promise<void>
}

function ChangePassword({ save, onDone }: { save: (o: string, n: string) => Promise<void>; onDone: (note: string) => void }) {
  const [old, setOld] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      aria-label="Change password"
      onSubmit={async (e) => {
        e.preventDefault()
        const problem = (!old ? 'Type your old password.' : null) ?? checkPassword(next) ?? (next !== again ? 'The two passwords are not the same.' : null)
        setError(problem ?? '')
        if (problem) return
        setBusy(true)
        try {
          await save(old, next)
          onDone('Your new password is saved.')
        } catch (err) {
          setError(friendlyAuthError(err))
          setBusy(false)
        }
      }}
    >
      <label>
        Old password
        <input type="password" value={old} autoComplete="current-password" onChange={(e) => setOld(e.target.value)} />
      </label>
      <label>
        New password
        <input type="password" value={next} autoComplete="new-password" onChange={(e) => setNext(e.target.value)} />
      </label>
      <label>
        Type it again
        <input type="password" value={again} autoComplete="new-password" onChange={(e) => setAgain(e.target.value)} />
      </label>
      <p className="muted">Use at least 8 characters, with letters and a number.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <span className="actions">
        <button className="primary" disabled={busy}>Save new password</button>
        <button type="button" className="link" disabled={busy} onClick={() => onDone('')}>Cancel</button>
      </span>
    </form>
  )
}

function ChangeEmail({ current, save, onDone }: { current: string; save: (email: string) => Promise<void>; onDone: (note: string) => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      aria-label="Change email"
      onSubmit={async (e) => {
        e.preventDefault()
        const problem = checkEmail(email) ?? (email.trim().toLowerCase() === current.toLowerCase() ? 'This is already your email.' : null)
        setError(problem ?? '')
        if (problem) return
        setBusy(true)
        try {
          await save(email)
          onDone(`We sent a link to ${current} and to ${email.trim()}. Open both links to finish.`)
        } catch (err) {
          setError(friendlyAuthError(err))
          setBusy(false)
        }
      }}
    >
      <label>
        New email
        <input type="email" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <span className="actions">
        <button className="primary" disabled={busy}>Send links</button>
        <button type="button" className="link" disabled={busy} onClick={() => onDone('')}>Cancel</button>
      </span>
    </form>
  )
}

function AddPassword({ email, send, save, onDone }: {
  email: string
  send: () => Promise<void>
  save: (code: string, password: string) => Promise<void>
  onDone: (note: string) => void
}) {
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const sendCode = async () => {
    setBusy(true)
    setError('')
    try {
      await send()
      setSent(true)
    } catch (err) {
      setError(friendlyAuthError(err))
    }
    setBusy(false)
  }
  return (
    <form
      aria-label="Add a password"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!sent) return void sendCode()
        const problem = (!code.trim() ? 'Type the code from the email.' : null) ?? checkPassword(next) ?? (next !== again ? 'The two passwords are not the same.' : null)
        setError(problem ?? '')
        if (problem) return
        setBusy(true)
        try {
          await save(code, next)
          onDone('Your password is saved. You can also sign in with your email now.')
        } catch (err) {
          setError(friendlyAuthError(err))
          setBusy(false)
        }
      }}
    >
      {!sent ? (
        <p>We send a code to {email} first. This keeps your account safe.</p>
      ) : (
        <>
          <p>We sent a code to {email}.</p>
          <label>
            Code from the email
            <input value={code} inputMode="numeric" autoComplete="one-time-code" onChange={(e) => setCode(e.target.value)} />
          </label>
          <label>
            New password
            <input type="password" value={next} autoComplete="new-password" onChange={(e) => setNext(e.target.value)} />
          </label>
          <label>
            Type it again
            <input type="password" value={again} autoComplete="new-password" onChange={(e) => setAgain(e.target.value)} />
          </label>
          <p className="muted">Use at least 8 characters, with letters and a number.</p>
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <span className="actions">
        <button className="primary" disabled={busy}>{sent ? 'Save password' : 'Send me a code'}</button>
        {sent && (
          <button type="button" className="link" disabled={busy} onClick={() => void sendCode()}>Send a new code</button>
        )}
        <button type="button" className="link" disabled={busy} onClick={() => onDone('')}>Cancel</button>
      </span>
    </form>
  )
}

export function Security({ email, signInWith, changePassword, changeEmail, sendPasswordCode, addPassword }: SecurityProps) {
  const [open, setOpen] = useState<'password' | 'email' | 'add' | null>(null)
  const [note, setNote] = useState('')
  const done = (n: string) => {
    setOpen(null)
    setNote(n)
  }
  const google = signInWith === 'google'
  return (
    <section aria-label="Sign-in and security">
      <h3>Sign-in and security</h3>
      <dl className="security">
        <dt>Email</dt>
        <dd>{email}</dd>
        <dt>You sign in with</dt>
        <dd>{google ? 'Google' : 'Email and password'}</dd>
      </dl>
      {google && <p className="muted">Google keeps your Google password. You can also add a password for this app.</p>}
      {note && <p role="status">{note}</p>}
      {open === 'password' && changePassword ? (
        <ChangePassword save={changePassword} onDone={done} />
      ) : open === 'email' && changeEmail ? (
        <ChangeEmail current={email} save={changeEmail} onDone={done} />
      ) : open === 'add' && sendPasswordCode && addPassword ? (
        <AddPassword email={email} send={sendPasswordCode} save={addPassword} onDone={done} />
      ) : (
        <span className="actions">
          {!google && changePassword && (
            <button className="link" onClick={() => (setOpen('password'), setNote(''))}>Change password</button>
          )}
          {google && sendPasswordCode && addPassword && (
            <button className="link" onClick={() => (setOpen('add'), setNote(''))}>Add a password</button>
          )}
          {!google && changeEmail && (
            <button className="link" onClick={() => (setOpen('email'), setNote(''))}>Change email</button>
          )}
        </span>
      )}
    </section>
  )
}
