// The Account page (spec T-042a5): download my data, ask for a change, and
// delete my account.

import { useEffect, useState } from 'react'
import { localDate } from '../log/types'
import { dataError, fileName, saveFile, type DataRequest, type DataStore } from './data'
import { Security, type SecurityProps } from './Security'
import './account.css'

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function Download({ store, save }: { store: DataStore; save: (name: string, text: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <section aria-label="Download my data">
      <h3>Download my data</h3>
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
      <h3>Ask for a change</h3>
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

export function Account({
  store,
  onBack,
  onDeleted,
  onSignOutAll,
  security,
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
  save?: (name: string, text: string) => void
}) {
  return (
    <main className="log account">
      <button className="link" onClick={onBack}>Back</button>
      <h2>Your account and data</h2>
      <p>
        <a href="/privacy.html" target="_blank" rel="noreferrer">Read our privacy policy</a>
      </p>
      {security && <Security {...security} />}
      <Download store={store} save={save} />
      <AskForChange store={store} />
      {onSignOutAll && <SignOutAll onSignOutAll={onSignOutAll} />}
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
}) {
  const [store, setStore] = useState<DataStore | null>(null)
  useEffect(() => {
    void load().then(setStore)
  }, [load])
  return store ? <Account store={store} {...rest} /> : <main className="log account"><p className="muted">Loading…</p></main>
}
