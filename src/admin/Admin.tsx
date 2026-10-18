// The Admin tab (spec T-042a1): the second step at sign-in, then the People
// page (T-042a2), the Coaches page (T-042a3), the Requests page (T-042a5) and the admin team for owners. The database checks every rule; these screens only ask.

import { useEffect, useState } from 'react'
import { adminError, type AdminAccess, type AdminLevel, type AdminMember, type AdminService, type NewFactor, type SecondStep } from './service'
import { ReasonForm } from './ReasonForm'
import { People } from './People'
import { Coaches } from './Coaches'
import { Requests } from './Requests'
import './admin.css'

const LEVELS: { value: AdminLevel; label: string }[] = [
  { value: 'content', label: 'Content (foods and exercises)' },
  { value: 'owner', label: 'Owner (people and admins)' },
]
const levelName = (l: AdminLevel) => (l === 'owner' ? 'Owner' : 'Content')
const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function CodeForm({ onCode, button }: { onCode: (code: string) => Promise<void>; button: string }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        try {
          await onCode(code)
        } catch (err) {
          setError(adminError(err))
        } finally {
          setBusy(false)
        }
      }}
    >
      <label>
        6-digit code
        <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy || code.replace(/\D/g, '').length !== 6}>{button}</button>
    </form>
  )
}

function SecondStepScreen({ step, service, onDone }: { step: SecondStep; service: AdminService; onDone: () => void }) {
  const [factor, setFactor] = useState<NewFactor | null>(null)
  const [error, setError] = useState('')
  if (step === 'needs code')
    return (
      <section aria-label="Second step">
        <h3>Enter your code</h3>
        <p>Admin pages need a second step each time you sign in.</p>
        <p>Open your code app and enter the 6-digit code.</p>
        <CodeForm button="Continue" onCode={async (c) => { await service.verify(c); onDone() }} />
      </section>
    )
  return (
    <section aria-label="Second step">
      <h3>Turn on the second step</h3>
      <p>Admins must use a second step to sign in.</p>
      <p>Then a stolen password alone can't open admin pages.</p>
      {!factor ? (
        <>
          <p>First, get a code app on your phone, like Google Authenticator.</p>
          {error && <p className="error" role="alert">{error}</p>}
          <button
            className="primary"
            onClick={async () => {
              try {
                setFactor(await service.setUp())
              } catch (e) {
                setError(adminError(e))
              }
            }}
          >
            Set it up
          </button>
        </>
      ) : (
        <>
          <p>Scan this picture with your code app.</p>
          <img className="qr" src={factor.qr} alt="Picture to scan with your code app" width={180} height={180} />
          <p className="muted">
            Can't scan? Type this key: <code>{factor.secret}</code>
          </p>
          <p>Then enter the code the app shows.</p>
          <CodeForm button="Turn on" onCode={async (c) => { await service.verify(c, factor.factorId); onDone() }} />
        </>
      )}
    </section>
  )
}

/** One change waiting for its reason. */
type Pending = { kind: 'level'; member: AdminMember; level: AdminLevel } | { kind: 'remove'; member: AdminMember }

function Team({ service, me }: { service: AdminService; me: string }) {
  const [team, setTeam] = useState<AdminMember[] | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<Pending | null>(null)
  const [email, setEmail] = useState('')
  const [level, setLevel] = useState<AdminLevel>('content')
  const [addReason, setAddReason] = useState('')

  const load = async () => {
    try {
      setTeam(await service.team())
    } catch (e) {
      setError(adminError(e))
    }
  }
  useEffect(() => {
    void load()
  }, [service]) // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn: () => Promise<void>) => {
    setError('')
    try {
      await fn()
      setPending(null)
      await load()
      return true
    } catch (e) {
      setError(adminError(e))
      return false
    }
  }

  return (
    <section aria-label="Admin team">
      <h3>Admin team</h3>
      <p className="muted">Every change needs a reason. It is saved in the admin log.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {team === null ? (
        <p className="muted">Loading…</p>
      ) : (
        <ul className="admin-team">
          {team.map((m) => (
            <li key={m.userId} aria-label={m.name || m.email}>
              <div>
                <strong>{m.name || m.email}</strong>
                {m.userId === me && ' (you)'}
                <div className="muted">{m.email}</div>
                <div className="muted">
                  {levelName(m.level)} admin. {m.lastActionAt ? `Last change on ${day(m.lastActionAt)}.` : 'No changes yet.'}
                </div>
              </div>
              {pending?.member.userId === m.userId ? (
                <ReasonForm
                  question={pending.kind === 'remove' ? `Remove ${m.name || m.email} as admin?` : `Make ${m.name || m.email} ${pending.level === 'owner' ? 'an owner' : 'a content admin'}?`}
                  button={pending.kind === 'remove' ? 'Remove' : 'Save'}
                  onSave={(reason) => void act(() => (pending.kind === 'remove' ? service.remove(m.userId, reason) : service.setLevel(m.userId, pending.level, reason)))}
                  onCancel={() => setPending(null)}
                />
              ) : (
                <span className="actions">
                  <button className="link" onClick={() => setPending({ kind: 'level', member: m, level: m.level === 'owner' ? 'content' : 'owner' })}>
                    {m.level === 'owner' ? 'Make content admin' : 'Make owner'}
                  </button>
                  <button className="link" aria-label={`Remove ${m.name || m.email}`} onClick={() => setPending({ kind: 'remove', member: m })}>Remove</button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <form
        className="add-admin"
        aria-label="Add an admin"
        onSubmit={async (e) => {
          e.preventDefault()
          if (await act(() => service.add(email, level, addReason))) {
            setEmail('')
            setAddReason('')
          }
        }}
      >
        <h4>Add an admin</h4>
        <p className="muted">They need a Track Me Fit account first.</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Level
          <select value={level} onChange={(e) => setLevel(e.target.value as AdminLevel)}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>
        <label>
          Reason
          <input value={addReason} onChange={(e) => setAddReason(e.target.value)} />
        </label>
        <button className="primary" disabled={!email.trim() || !addReason.trim()}>Add admin</button>
      </form>
    </section>
  )
}

export function Admin({ service, me, level }: { service: AdminService; me: string; level: AdminLevel }) {
  const [step, setStep] = useState<SecondStep | null>(null)
  const [page, setPage] = useState<'people' | 'coaches' | 'requests' | 'team'>('people')
  useEffect(() => {
    void service.secondStep().then(setStep)
  }, [service])
  return (
    <main className="log admin">
      <h2>Admin</h2>
      {step === null ? (
        <p className="muted">Loading…</p>
      ) : step !== 'on' ? (
        <SecondStepScreen step={step} service={service} onDone={() => setStep('on')} />
      ) : level === 'owner' ? (
        <>
          <nav className="tabs" role="tablist" aria-label="Admin pages">
            <button role="tab" aria-selected={page === 'people'} onClick={() => setPage('people')}>People</button>
            <button role="tab" aria-selected={page === 'coaches'} onClick={() => setPage('coaches')}>Coaches</button>
            <button role="tab" aria-selected={page === 'requests'} onClick={() => setPage('requests')}>Requests</button>
            <button role="tab" aria-selected={page === 'team'} onClick={() => setPage('team')}>Admin team</button>
          </nav>
          {page === 'people' ? (
            <People service={service} me={me} />
          ) : page === 'coaches' ? (
            <Coaches service={service} />
          ) : page === 'requests' ? (
            <Requests service={service} />
          ) : (
            <Team service={service} me={me} />
          )}
        </>
      ) : (
        <p>You are a content admin. Food and exercise pages come next.</p>
      )}
    </main>
  )
}

/** The tab as the app opens it: loads the admin code, then shows the pages. */
export function AdminTab({ access, me, level }: { access: AdminAccess; me: string; level: AdminLevel }) {
  const [service, setService] = useState<AdminService | null>(null)
  useEffect(() => {
    void access.load().then(setService)
  }, [access])
  return service ? <Admin service={service} me={me} level={level} /> : <main className="log admin"><p className="muted">Loading…</p></main>
}
