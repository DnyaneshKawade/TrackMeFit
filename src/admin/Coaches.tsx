// The Coaches page (spec T-042a3): the Coach approval switch, coaches by
// status with their client counts, and each coach's details for review.

import { useEffect, useState } from 'react'
import {
  adminError,
  COACH_PAGE,
  type AdminService,
  type CoachDecision,
  type CoachFile,
  type CoachGroup,
  type CoachRow,
  type CoachStatus,
} from './service'
import { ReasonForm } from './ReasonForm'

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const GROUPS: { value: CoachGroup; label: string }[] = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'approved', label: 'Approved' },
  { value: 'paused', label: 'Paused' },
  { value: 'not approved', label: 'Not approved' },
]
const STATUS: Record<CoachStatus, string> = {
  approved: 'Approved',
  waiting: 'Waiting',
  'needs more': 'Needs more',
  'not approved': 'Not approved',
  paused: 'Paused',
}
/** The steps each status allows, as the database allows them. */
const STEPS: Record<CoachStatus, { decision: CoachDecision; button: string }[]> = {
  waiting: [
    { decision: 'approve', button: 'Approve' },
    { decision: 'ask more', button: 'Ask for more' },
    { decision: 'decline', button: 'Decline' },
  ],
  'needs more': [
    { decision: 'approve', button: 'Approve' },
    { decision: 'ask more', button: 'Ask for more' },
    { decision: 'decline', button: 'Decline' },
  ],
  'not approved': [{ decision: 'approve', button: 'Approve' }],
  approved: [{ decision: 'pause', button: 'Pause' }],
  paused: [{ decision: 'approve', button: 'End pause' }],
}
const QUESTION: Record<CoachDecision, (who: string) => string> = {
  approve: (who) => `Approve ${who} as a coach?`,
  'ask more': (who) => `What more do you need from ${who}?`,
  decline: (who) => `Decline ${who}? They can apply again in 30 days.`,
  pause: (who) => `Pause ${who}? They can't see clients until you end it.`,
}

const nameOf = (c: CoachRow) => c.name || c.email

function Switch({ service }: { service: AdminService }) {
  const [on, setOn] = useState<boolean | null>(null)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    service.coachApproval().then(setOn, (e) => setError(adminError(e)))
  }, [service])
  if (on === null) return error ? <p className="error" role="alert">{error}</p> : null
  return (
    <section aria-label="Coach approval switch">
      <p>
        <strong>Coach approval is {on ? 'on' : 'off'}.</strong> {on ? 'New coaches wait for your check.' : 'New coaches can start right away.'}
      </p>
      <p className="muted">Coaches who are working now stay approved.</p>
      {asking ? (
        <ReasonForm
          question={on ? 'Turn coach approval off?' : 'Turn coach approval on?'}
          button={on ? 'Turn off' : 'Turn on'}
          onCancel={() => setAsking(false)}
          onSave={(reason) =>
            void service.setCoachApproval(!on, reason).then(
              () => {
                setOn(!on)
                setAsking(false)
              },
              (e) => setError(adminError(e)),
            )
          }
        />
      ) : (
        <button className="link" onClick={() => setAsking(true)}>{on ? 'Turn off' : 'Turn on'}</button>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

function CoachView({ service, userId, onBack }: { service: AdminService; userId: string; onBack: () => void }) {
  const [c, setC] = useState<CoachFile | null>(null)
  const [pending, setPending] = useState<CoachDecision | 'limit' | null>(null)
  const [limit, setLimit] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const load = () =>
    service.coach(userId).then(
      (x) => {
        setC(x)
        setLimit(String(x.clientLimit))
      },
      (e) => setError(adminError(e)),
    )
  useEffect(() => {
    void load()
  }, [service, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn: () => Promise<void>) => {
    setError('')
    setDone('')
    try {
      await fn()
      setPending(null)
      setDone('Done. It is saved in the admin log.')
      await load()
    } catch (e) {
      setError(adminError(e))
    }
  }

  if (!c)
    return (
      <section aria-label="Coach">
        <button className="link" onClick={onBack}>Back to coaches</button>
        {error ? <p className="error" role="alert">{error}</p> : <p className="muted">Loading…</p>}
      </section>
    )
  const who = nameOf(c)
  return (
    <section aria-label={`Coach ${who}`}>
      <button className="link" onClick={onBack}>Back to coaches</button>
      <h3>{who}</h3>
      <p className="muted">
        {STATUS[c.status]} since {day(c.statusAt)}. Clients: {c.clients} of {c.clientLimit}.
      </p>
      {c.note && <p>Last note to the coach: {c.note}</p>}
      <dl className="coach-details">
        <dt>Email</dt>
        <dd>{c.email}</dd>
        <dt>Phone</dt>
        <dd>{c.phone || 'Not given'}</dd>
        <dt>City</dt>
        <dd>{c.city || 'Not given'}</dd>
        <dt>Years coaching</dt>
        <dd>{c.years ?? 'Not given'}</dd>
        <dt>Link</dt>
        <dd>{c.link || 'Not given'}</dd>
        {c.answer && (
          <>
            <dt>Their answer</dt>
            <dd>{c.answer}</dd>
          </>
        )}
      </dl>
      <h4>Certificates</h4>
      {c.certificates.length ? (
        <ul className="certs">
          {c.certificates.map((x) => (
            <li key={x.id}>
              <a href={x.url} target="_blank" rel="noreferrer">
                <img src={x.url} alt={x.name} width={240} />
              </a>
              <span>{x.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No certificates added.</p>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {done && <p role="status">{done}</p>}
      {pending === 'limit' ? (
        <ReasonForm
          question={`Change ${who}'s client limit?`}
          button="Save"
          onCancel={() => setPending(null)}
          onSave={(reason) => void act(() => service.setClientLimit(c.userId, Number(limit), reason))}
        >
          <label>
            Client limit
            <input inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </label>
        </ReasonForm>
      ) : pending ? (
        <ReasonForm
          question={QUESTION[pending](who)}
          button={STEPS[c.status].find((s) => s.decision === pending)?.button ?? 'Save'}
          label={pending === 'approve' ? 'Reason' : 'Note for the coach'}
          onCancel={() => setPending(null)}
          onSave={(reason) => void act(() => service.decideCoach(c.userId, pending, reason))}
        />
      ) : (
        <span className="actions">
          {STEPS[c.status].map((s) => (
            <button key={s.decision} className="link" onClick={() => setPending(s.decision)}>{s.button}</button>
          ))}
          <button className="link" onClick={() => setPending('limit')}>Change client limit</button>
        </span>
      )}
    </section>
  )
}

export function Coaches({ service }: { service: AdminService }) {
  const [group, setGroup] = useState<CoachGroup>('waiting')
  const [rows, setRows] = useState<CoachRow[] | null>(null)
  const [more, setMore] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = async (g: CoachGroup, after?: CoachRow) => {
    setError('')
    try {
      const page = await service.coaches(g, after)
      setRows((old) => (after ? [...(old ?? []), ...page] : page))
      setMore(page.length === COACH_PAGE)
    } catch (e) {
      setError(adminError(e))
    }
  }
  useEffect(() => {
    if (open) return
    setRows(null)
    void load(group)
  }, [service, group, open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (open) return <CoachView service={service} userId={open} onBack={() => setOpen(null)} />

  return (
    <section aria-label="Coaches">
      <h3>Coaches</h3>
      <Switch service={service} />
      <nav className="tabs" role="tablist" aria-label="Coach lists">
        {GROUPS.map((g) => (
          <button key={g.value} role="tab" aria-selected={group === g.value} onClick={() => setGroup(g.value)}>{g.label}</button>
        ))}
      </nav>
      {group === 'waiting' && <p className="muted">The coach who has waited longest comes first.</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {rows === null ? (
        <p className="muted">Loading…</p>
      ) : !rows.length ? (
        <p className="muted">No coaches here.</p>
      ) : (
        <ul className="admin-team">
          {rows.map((c) => (
            <li key={c.userId} aria-label={nameOf(c)}>
              <div>
                <strong>{nameOf(c)}</strong>
                <div className="muted">{c.email}</div>
                <div className="muted">
                  {STATUS[c.status]} since {day(c.statusAt)}. Clients: {c.clients} of {c.clientLimit}.
                  {!c.hasDetails && ' No details yet.'}
                </div>
              </div>
              <span className="actions">
                <button className="link" aria-label={`Open ${nameOf(c)}`} onClick={() => setOpen(c.userId)}>Open</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {more && rows && (
        <button className="link" onClick={() => void load(group, rows[rows.length - 1])}>Show more</button>
      )}
    </section>
  )
}
