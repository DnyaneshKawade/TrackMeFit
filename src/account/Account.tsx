// The Account page (spec T-042a5): download my data, ask for a change, and
// delete my account.

import { useEffect, useState } from 'react'
import { localDate } from '../log/types'
import { dataError, fileName, saveFile, type DataRequest, type DataStore } from './data'
import type { CoachStore } from '../coach/store'
import { Security, type SecurityProps } from './Security'
import { FamilyPart } from '../family/FamilyPart'
import type { FamilyStore } from '../family/family'
import type { WeightUnit } from '../engine/units'
import './account.css'

export interface UnitsProps {
  unit: WeightUnit
  onChange: (unit: WeightUnit) => Promise<void>
}

/** kg or lb for gym weights (T-101). Saved with the account, so every phone matches. */
function Units({ unit, onChange }: UnitsProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pick = async (u: WeightUnit) => {
    if (u === unit) return
    setBusy(true)
    setError('')
    try {
      await onChange(u)
    } catch {
      setError('Couldn’t save this. Check your connection.')
    }
    setBusy(false)
  }
  return (
    <section aria-label="Units">
      <h3>Units</h3>
      <p>Gym weights in:</p>
      <span className="range" role="group" aria-label="Gym weights in">
        {(['kg', 'lb'] as const).map((u) => (
          <button key={u} className="chip" aria-pressed={u === unit} disabled={busy} onClick={() => void pick(u)}>
            {u}
          </button>
        ))}
      </span>
      <p className="muted">Your body weight stays in kg. Old sets show in the new unit too.</p>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function Download({ store, save }: { store: DataStore; save: (name: string, text: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <section aria-label="Download my data">
      <h4>Download my data</h4>
      <p>You get one file with everything we keep about you.</p>
      <p className="muted">Links to your photos in it work for 7 days.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <button
        className="primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError('')
          try {
            save(fileName(localDate()), JSON.stringify(await store.exportAll(), null, 2))
          } catch (e) {
            setError(dataError(e))
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy ? 'Getting your data…' : 'Download my data'}
      </button>
    </section>
  )
}

function AskForChange({ store }: { store: DataStore }) {
  const [list, setList] = useState<DataRequest[] | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const load = () => store.requests().then(setList, (e) => setError(dataError(e)))
  useEffect(() => {
    void load()
  }, [store]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section aria-label="Ask for a change">
      <h4>Ask for a change</h4>
      <p>You can fix most things yourself in the app.</p>
      <p>If something is wrong that you can't fix, tell us here.</p>
      <p className="muted">We answer within 90 days.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setError('')
          setSent(false)
          try {
            await store.ask(note)
            setNote('')
            setSent(true)
            await load()
          } catch (err) {
            setError(dataError(err))
          }
        }}
      >
        <label>
          What is wrong?
          <textarea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        {sent && <p role="status">Sent. You will see our answer here.</p>}
        <button className="primary" disabled={!note.trim()}>Send</button>
      </form>
      {list && list.length > 0 && (
        <ul className="requests" aria-label="My requests">
          {list.map((r) => (
            <li key={r.id}>
              <p>{r.note}</p>
              <p className="muted">
                Sent on {day(r.createdAt)}. {r.status === 'open' ? 'Waiting for an answer.' : `Answered on ${day(r.closedAt ?? r.createdAt)}.`}
              </p>
              {r.answer && <p>Our answer: {r.answer}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** "I want to coach" (T-103): asks the owner to make this account a coach,
 * so nobody signs up twice. The answer shows here. */
function CoachAsk({ store }: { store: DataStore }) {
  const [asked, setAsked] = useState<DataRequest | null | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const load = () =>
    store.requests().then(
      (list) => setAsked(list.find((r) => r.kind === 'coach') ?? null),
      () => setAsked(null),
    )
  useEffect(() => {
    void load()
  }, [store]) // eslint-disable-line react-hooks/exhaustive-deps
  if (asked === undefined) return null
  return (
    <section aria-label="Coach other people">
      <h3>Coach other people</h3>
      {asked?.status === 'open' ? (
        <p>We have your request from {day(asked.createdAt)}. We will answer here.</p>
      ) : open ? (
        <form
          aria-label="Ask to coach"
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            try {
              await store.askToCoach(note.trim() || 'I want to coach.')
              setOpen(false)
              await load()
            } catch (err) {
              setError(dataError(err))
            }
          }}
        >
          <p>We check every coach before they take clients.</p>
          <p className="muted">You keep this account. Your own log stays yours.</p>
          <label>
            Tell us about your coaching (if you like)
            <textarea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <span className="actions">
            <button className="primary">Send my request</button>
            <button type="button" className="link" onClick={() => setOpen(false)}>Cancel</button>
          </span>
        </form>
      ) : (
        <>
          {asked?.answer && <p>Our answer: {asked.answer}</p>}
          <p>Do you want to coach others? Ask us here. You don’t need a new account.</p>
          <button className="link" onClick={() => setOpen(true)}>I want to coach</button>
        </>
      )}
    </section>
  )
}

function SignOutAll({ onSignOutAll }: { onSignOutAll: () => Promise<void> }) {
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <section aria-label="Sign out on all devices">
      <h3>Sign out on all devices</h3>
      <p>Lost your phone? This signs you out everywhere, this phone too.</p>
      {!asking ? (
        <button className="link" onClick={() => setAsking(true)}>Sign out on all devices</button>
      ) : (
        <span className="actions">
          <span>Sign out everywhere?</span>
          <button
            className="primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              setError('')
              try {
                await onSignOutAll()
              } catch {
                setError('Couldn’t sign out. Check your connection.')
                setBusy(false)
              }
            }}
          >
            Yes, sign out
          </button>
          <button className="link" disabled={busy} onClick={() => setAsking(false)}>Cancel</button>
        </span>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

function DeleteAccount({ store, onDeleted }: { store: DataStore; onDeleted: () => void }) {
  const [asking, setAsking] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <section aria-label="Delete my account">
      <h3>Delete my account</h3>
      <p>This removes your account, food log, workouts, weight and photos.</p>
      <p>It can't be undone. You may want to download your data first.</p>
      {!asking ? (
        <button className="link danger" onClick={() => setAsking(true)}>Delete my account</button>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setError('')
            try {
              await store.deleteMe()
              onDeleted()
            } catch (err) {
              setError(dataError(err))
              setBusy(false)
            }
          }}
        >
          <label>
            Type DELETE to say yes
            <input value={typed} autoComplete="off" onChange={(e) => setTyped(e.target.value)} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <span className="actions">
            <button className="primary danger" disabled={busy || typed.trim() !== 'DELETE'}>
              {busy ? 'Deleting…' : 'Delete forever'}
            </button>
            <button
              type="button"
              className="link"
              onClick={() => {
                setAsking(false)
                setTyped('')
              }}
            >
              Cancel
            </button>
          </span>
        </form>
      )}
    </section>
  )
}

/** Who sees your data (T-092). Joining and stopping stay on the Progress tab. */
function CoachPart({ coach, onOpen }: { coach: CoachStore; onOpen?: () => void }) {
  const [link, setLink] = useState<{ name: string; since?: string | null } | null | undefined>(undefined)
  useEffect(() => {
    coach.myCoach().then(setLink, () => setLink(null))
  }, [coach])
  return (
    <section aria-label="Your coach">
      <h3>Your coach</h3>
      {link === undefined ? (
        <p className="muted">Loading…</p>
      ) : link ? (
        <p>
          You share your data with <strong>{link.name}</strong>
          {link.since ? ` since ${day(link.since)}` : ''}.
        </p>
      ) : (
        <p>You have no coach. Nobody else sees your data.</p>
      )}
      {onOpen && (
        <button className="link" onClick={onOpen}>{link ? 'See what they see, or stop sharing' : 'Join a coach'}</button>
      )}
    </section>
  )
}

export function Account({
  store,
  onBack,
  onDeleted,
  onSignOutAll,
  security,
  onDetails,
  coach,
  onCoach,
  family,
  canCoach,
  units,
  save = saveFile,
}: {
  store: DataStore
  onBack: () => void
  /** Clears what this device keeps once the account is gone. */
  onDeleted: () => void
  /** Signs out on every device, this one too (T-090). */
  onSignOutAll?: () => Promise<void>
  /** Email, how they sign in, and changing them (T-091). */
  security?: SecurityProps
  /** Opens "Your details" (T-092). */
  onDetails?: () => void
  /** The person's coach link, shown read only; coaches have none (T-092). */
  coach?: CoachStore
  /** Opens the Progress tab, where joining and stopping happen. */
  onCoach?: () => void
  /** A teen's parent, or an adult's children (T-086). */
  family?: { store: FamilyStore; teen: boolean }
  /** Adults who aren't coaches can ask to become one (T-103). */
  canCoach?: boolean
  /** kg or lb for gym weights (T-101). */
  units?: UnitsProps
  save?: (name: string, text: string) => void
}) {
  return (
    <main className="log account">
      <button className="link" onClick={onBack}>Back</button>
      <h2>Your account and data</h2>
      {onDetails && (
        <section aria-label="Your details">
          <h3>Your details</h3>
          <p>Your answers from sign-up: about you, health, training, goal and food.</p>
          <button className="link" onClick={onDetails}>See and change your details</button>
        </section>
      )}
      {units && <Units {...units} />}
      {security && <Security {...security} />}
      {onSignOutAll && <SignOutAll onSignOutAll={onSignOutAll} />}
      {coach && <CoachPart coach={coach} onOpen={onCoach} />}
      {canCoach && <CoachAsk store={store} />}
      {family && <FamilyPart store={family.store} teen={family.teen} />}
      <section aria-label="Your data and privacy">
        <h3>Your data and privacy</h3>
        <p>
          <a href="/privacy.html" target="_blank" rel="noreferrer">Read our privacy policy</a>
        </p>
        <Download store={store} save={save} />
        <AskForChange store={store} />
      </section>
      <DeleteAccount store={store} onDeleted={onDeleted} />
    </main>
  )
}

/** The page as the app opens it: loads the data code, then shows the page. */
export function AccountTab({
  load,
  ...rest
}: {
  load: () => Promise<DataStore>
  onBack: () => void
  onDeleted: () => void
  onSignOutAll?: () => Promise<void>
  security?: SecurityProps
  onDetails?: () => void
  coach?: CoachStore
  onCoach?: () => void
  family?: { store: FamilyStore; teen: boolean }
  canCoach?: boolean
  units?: UnitsProps
}) {
  const [store, setStore] = useState<DataStore | null>(null)
  useEffect(() => {
    void load().then(setStore)
  }, [load])
  return store ? <Account store={store} {...rest} /> : <main className="log account"><p className="muted">Loading…</p></main>
}
