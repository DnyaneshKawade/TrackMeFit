// The People page (spec T-042a2): owners find an account and act on it.
// Account facts only, never food logs, weights or health answers.

import { useEffect, useState } from 'react'
import { adminError, PEOPLE_PAGE, type AccountAction, type AdminService, type PersonRow } from './service'
import { ReasonForm } from './ReasonForm'

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/** One change waiting for its reason. */
type Pending =
  | { kind: 'account'; action: AccountAction }
  | { kind: 'end link' }
  | { kind: 'role'; role: 'user' | 'coach' }

const label = (p: PersonRow) => p.name || p.email

function question(p: PersonRow, pending: Pending): { text: string; button: string } {
  const who = label(p)
  if (pending.kind === 'end link') return { text: `End ${who}'s link with ${p.coachName}?`, button: 'End link' }
  if (pending.kind === 'role') return { text: pending.role === 'coach' ? `Make ${who} a coach?` : `Move ${who} to "For myself"?`, button: 'Save' }
  switch (pending.action) {
    case 'block':
      return { text: `Block ${who}? They are signed out and can't sign in.`, button: 'Block' }
    case 'unblock':
      return { text: `Let ${who} sign in again?`, button: 'Unblock' }
    case 'sign out':
      return { text: `Sign ${who} out on every phone and computer?`, button: 'Sign out' }
    case 'resend confirm':
      return { text: `Send ${who} the confirm email again?`, button: 'Send' }
    case 'delete':
      return { text: `Delete ${who} and all their data and photos? This can't be undone.`, button: 'Yes, delete' }
  }
}

function Person({ p, me, onAct }: { p: PersonRow; me: string; onAct: (pending: Pending, reason: string) => Promise<boolean> }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const notes = [
    p.role === 'coach' ? 'Coach' : 'For myself',
    p.adminLevel && (p.adminLevel === 'owner' ? 'Owner admin' : 'Content admin'),
    p.blocked && 'Blocked',
    !p.confirmed && 'Email not confirmed',
    p.onboarded ? 'Set-up done' : 'Set-up not done',
  ].filter(Boolean)
  const ask = pending && question(p, pending)
  return (
    <li aria-label={label(p)}>
      <div>
        <strong>{label(p)}</strong>
        {p.userId === me && ' (you)'}
        <div className="muted">{[p.email, p.phone].filter(Boolean).join(' · ')}</div>
        <div className="muted">{notes.join(' · ')}</div>
        <div className="muted">
          Joined {day(p.joinedAt)}. {p.lastActiveAt ? `Last seen ${day(p.lastActiveAt)}.` : 'Not seen yet.'}
          {p.coachName && ` Coach: ${p.coachName}.`}
        </div>
      </div>
      {pending && ask ? (
        <ReasonForm
          question={ask.text}
          button={ask.button}
          onSave={(reason) => void onAct(pending, reason).then((ok) => ok && setPending(null))}
          onCancel={() => setPending(null)}
        />
      ) : (
        <span className="actions">
          <button className="link" onClick={() => setPending({ kind: 'account', action: p.blocked ? 'unblock' : 'block' })}>{p.blocked ? 'Unblock' : 'Block'}</button>
          <button className="link" onClick={() => setPending({ kind: 'account', action: 'sign out' })}>Sign out everywhere</button>
          {!p.confirmed && <button className="link" onClick={() => setPending({ kind: 'account', action: 'resend confirm' })}>Resend confirm email</button>}
          {p.coachName && <button className="link" onClick={() => setPending({ kind: 'end link' })}>End coach link</button>}
          <button className="link" onClick={() => setPending({ kind: 'role', role: p.role === 'coach' ? 'user' : 'coach' })}>{p.role === 'coach' ? 'Move to "For myself"' : 'Make coach'}</button>
          <button className="link danger" aria-label={`Delete ${label(p)}`} onClick={() => setPending({ kind: 'account', action: 'delete' })}>Delete</button>
        </span>
      )}
    </li>
  )
}

export function People({ service, me }: { service: AdminService; me: string }) {
  const [search, setSearch] = useState('')
  const [shown, setShown] = useState('')
  const [rows, setRows] = useState<PersonRow[] | null>(null)
  const [more, setMore] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const load = async (q: string, after?: PersonRow) => {
    setError('')
    try {
      const page = await service.people(q, after)
      setRows((old) => (after ? [...(old ?? []), ...page] : page))
      setMore(page.length === PEOPLE_PAGE)
      setShown(q)
    } catch (e) {
      setError(adminError(e))
    }
  }
  useEffect(() => {
    void load('')
  }, [service]) // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (p: PersonRow, pending: Pending, reason: string) => {
    setError('')
    setDone('')
    try {
      if (pending.kind === 'account') await service.accountAction(p.userId, pending.action, reason)
      if (pending.kind === 'end link') await service.endCoachLink(p.userId, reason)
      if (pending.kind === 'role') await service.setRole(p.userId, pending.role, reason)
      setDone(pending.kind === 'account' && pending.action === 'delete' ? `${label(p)} was deleted.` : 'Done. It is saved in the admin log.')
      await load(shown)
      return true
    } catch (e) {
      setError(adminError(e))
      return false
    }
  }

  return (
    <section aria-label="People">
      <h3>People</h3>
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault()
          void load(search)
        }}
      >
        <label>
          Search by name, email or phone
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <button className="primary">Search</button>
      </form>
      <p className="muted">Every change needs a reason. It is saved in the admin log.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {done && <p role="status">{done}</p>}
      {rows === null ? (
        <p className="muted">Loading…</p>
      ) : !rows.length ? (
        <p className="muted">No one found.</p>
      ) : (
        <ul className="admin-team">
          {rows.map((p) => (
            <Person key={p.userId} p={p} me={me} onAct={(pending, reason) => act(p, pending, reason)} />
          ))}
        </ul>
      )}
      {more && rows && (
        <button className="link" onClick={() => void load(shown, rows[rows.length - 1])}>Show more</button>
      )}
    </section>
  )
}
