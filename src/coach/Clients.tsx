import { useEffect, useState } from 'react'
import { inviteMessage, showCode, type CoachLink, type CoachStore, type Invite } from './store'
import '../log/log.css'
import '../progress/progress.css'

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/** The coach's Clients tab: invite with a code, see clients, end a link (T-026a). */
export function Clients({ store }: { store: CoachStore }) {
  const [clients, setClients] = useState<CoachLink[] | null>(null)
  const [invite, setInvite] = useState<Invite | null>(null)
  const [copied, setCopied] = useState(false)
  const [ending, setEnding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    store.clients().then(setClients, () => {
      setClients([])
      setError('Couldn’t load your clients. Check your connection.')
    })
  }, [store])

  const makeInvite = async () => {
    setError(null)
    setCopied(false)
    try {
      setInvite(await store.createInvite())
    } catch {
      setError('Couldn’t make a code. Check your connection.')
    }
  }

  const copy = async () => {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(showCode(invite.code))
      setCopied(true)
    } catch {
      setError('Couldn’t copy. Select the code and copy it.')
    }
  }

  const end = async (c: CoachLink) => {
    try {
      await store.end(c.id)
      setClients((list) => list?.filter((x) => x.id !== c.id) ?? null)
      setEnding(null)
    } catch {
      setError('Couldn’t end the link. Check your connection.')
    }
  }

  return (
    <main className="log progress clients">
      <h2>Clients</h2>
      <section aria-label="Invite a client">
        <button className="primary" onClick={() => void makeInvite()}>Invite a client</button>
        {invite && (
          <div className="invite">
            <p>
              Code: <strong className="code">{showCode(invite.code)}</strong>
            </p>
            <p className="muted">It works once, until {day(invite.expiresAt)}. Your client enters it under Your coach on the Progress tab.</p>
            <div className="actions">
              <a className="link" href={`https://wa.me/?text=${encodeURIComponent(inviteMessage(invite.code))}`} target="_blank" rel="noreferrer">
                Share on WhatsApp
              </a>
              <button className="link" onClick={() => void copy()}>{copied ? 'Copied' : 'Copy code'}</button>
            </div>
          </div>
        )}
      </section>
      {error && <p className="error" role="alert">{error}</p>}
      <section aria-label="Your clients">
        <h3>Your clients{clients?.length ? ` (${clients.length})` : ''}</h3>
        {clients === null ? (
          <p className="muted">Loading…</p>
        ) : !clients.length ? (
          <p className="muted">No clients yet. Send a code to someone you coach.</p>
        ) : (
          <ul className="weigh-list">
            {clients.map((c) => (
              <li key={c.id}>
                <span>{c.name}</span>
                {ending === c.id ? (
                  <>
                    <button className="link" onClick={() => void end(c)}>Yes, end</button>
                    <button className="link" onClick={() => setEnding(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span />
                    <button className="link" aria-label={`End link with ${c.name}`} onClick={() => setEnding(c.id)}>End</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
