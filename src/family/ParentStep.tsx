// A teen waits here until a parent says yes (spec T-086). The parent uses
// their own Track Me Fit account and enters the teen's code.

import { useState } from 'react'
import { familyError, showParentCode, type FamilyStore, type ParentCode } from './family'

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export function ParentStep({ store, onDone, onSignOut }: { store: FamilyStore; onDone: () => void; onSignOut: () => void }) {
  const [code, setCode] = useState<ParentCode | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const make = async () => {
    setError('')
    try {
      setCode(await store.newCode())
    } catch (e) {
      setError(familyError(e))
    }
  }
  const check = async () => {
    setError('')
    setNote('')
    try {
      if (await store.myParent()) onDone()
      else setNote('Your parent hasn’t said yes yet.')
    } catch (e) {
      setError(familyError(e))
    }
  }
  return (
    <main className="auth">
      <h1 className="auth-brand">Track Me Fit</h1>
      <section aria-label="Ask a parent">
        <h2>Ask a parent to say yes</h2>
        <p>You are under 18. A parent must say yes before you use Track Me Fit.</p>
        <ol>
          <li>Your parent signs in with their own Track Me Fit account.</li>
          <li>They open Account and find Your child.</li>
          <li>They type your code there and say yes.</li>
        </ol>
        <p className="auth-hint">Until you are 18, you can’t link to a coach. The app won’t ask you to eat less.</p>
        {code ? (
          <p>
            Your code: <strong className="code">{showParentCode(code.code)}</strong>
            <br />
            <span className="auth-hint">It works until {day(code.until)}.</span>
          </p>
        ) : (
          <button className="auth-primary" onClick={() => void make()}>Show my code</button>
        )}
        {code && <button className="auth-primary" onClick={() => void check()}>My parent said yes</button>}
        {note && <p role="status">{note}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
      </section>
      <button className="link" onClick={onSignOut}>Sign out</button>
    </main>
  )
}
