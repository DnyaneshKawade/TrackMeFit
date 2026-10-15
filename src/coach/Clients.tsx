import { useEffect, useState } from 'react'
import { sortByAttention, type ClientAttention } from '../engine/attention'
import { localDate } from '../log/types'
import type { ChatStore } from './chat'
import { ClientView, type ClientStores } from './ClientView'
import { inviteMessage, showCode, type ClientRow, type CoachStore, type Invite } from './store'
import '../log/log.css'
import '../progress/progress.css'

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/** The coach's Clients tab: invite with a code (T-026a), see clients sorted by
 * who needs attention with the reasons (T-026b), end a link. */
export function Clients({
  store,
  storesFor,
  coachId = '',
  today = localDate(),
  chat,
}: {
  store: CoachStore
  /** A client's stores, to open them (T-026c). */
  storesFor?: (clientId: string) => ClientStores
  coachId?: string
  today?: string
  /** Messages with clients, and unread counts on the list (T-026f). */
  chat?: ChatStore
}) {
  const [clients, setClients] = useState<ClientAttention<ClientRow>[] | null>(null)
  const [open, setOpen] = useState<{ item: ClientAttention<ClientRow>; stores: ClientStores } | null>(null)
  const [invite, setInvite] = useState<Invite | null>(null)
  const [copied, setCopied] = useState(false)
  const [ending, setEnding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unread, setUnread] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    store.clients(today).then(
      (rows) => setClients(sortByAttention(rows, today)),
      () => {
        setClients([])
        setError('Couldn’t load your clients. Check your connection.')
      },
    )
  }, [store, today])

  // Counted again when the coach comes back from a client's page.
  useEffect(() => {
    if (chat && !open) chat.unread().then(setUnread, () => undefined)
  }, [chat, open])

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

  const end = async (c: ClientRow) => {
    try {
      await store.end(c.linkId)
      setClients((list) => list?.filter((x) => x.client.linkId !== c.linkId) ?? null)
      setEnding(null)
    } catch {
      setError('Couldn’t end the link. Check your connection.')
    }
  }

  if (open)
    return <ClientView client={open.item.client} flags={open.item.flags} stores={open.stores} coachId={coachId} today={today} chat={chat} onBack={() => setOpen(null)} />

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
          <>
            <p className="muted">Clients who need you most come first.</p>
            <ul className="client-list">
              {clients.map((item) => {
                const { client: c, flags } = item
                return (
                  <li key={c.linkId} aria-label={c.name}>
                    <div className="client-head">
                      {storesFor ? (
                        <button className="link client-name" onClick={() => setOpen({ item, stores: storesFor(c.clientId) })}>
                          {c.name}
                        </button>
                      ) : (
                        <strong>{c.name}</strong>
                      )}
                      {ending === c.linkId ? (
                        <span className="actions">
                          <button className="link" onClick={() => void end(c)}>Yes, end</button>
                          <button className="link" onClick={() => setEnding(null)}>Cancel</button>
                        </span>
                      ) : (
                        <button className="link" aria-label={`End link with ${c.name}`} onClick={() => setEnding(c.linkId)}>End</button>
                      )}
                    </div>
                    {(unread.get(c.linkId) ?? 0) > 0 && (
                      <p className="unread">{unread.get(c.linkId) === 1 ? '1 new message' : `${unread.get(c.linkId)} new messages`}</p>
                    )}
                    {flags.length ? (
                      <ul className="flags">
                        {flags.map((f) => (
                          <li key={f.reason}>{f.reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted on-track">On track this week.</p>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </main>
  )
}
