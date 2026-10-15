import { useEffect, useState } from 'react'
import { checkMessage, MAX_MESSAGE, nudgeLink, PAGE, sentLabel, type ChatStore, type Message } from './chat'

/** Messages with the coach or a client (T-026f), oldest at the top. Opening it
 * marks the other side's messages as read. */
export function Chat({
  store,
  linkId,
  name,
  appUrl = typeof window === 'undefined' ? '' : window.location.origin,
}: {
  store: ChatStore
  linkId: string
  /** The other person's first name. */
  name: string
  appUrl?: string
}) {
  // Newest first, as loaded; shown in reverse.
  const [messages, setMessages] = useState<Message[] | null>(null)
  const [more, setMore] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    store.list(linkId).then(
      (page) => {
        setMessages(page)
        setMore(page.length === PAGE)
        if (page.some((m) => !m.mine && !m.read)) store.markRead(linkId).catch(() => undefined)
      },
      () => {
        setMessages([])
        setError('Couldn’t load messages. Check your connection.')
      },
    )
  }, [store, linkId])

  const earlier = async () => {
    if (!messages?.length) return
    try {
      const page = await store.list(linkId, messages[messages.length - 1].sentAt)
      setMessages([...messages, ...page])
      setMore(page.length === PAGE)
    } catch {
      setError('Couldn’t load earlier messages. Check your connection.')
    }
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = checkMessage(draft)
    if (problem) return setError(problem)
    setBusy(true)
    setError(null)
    try {
      const m = await store.send(linkId, draft)
      setMessages((list) => [m, ...(list ?? [])])
      setSent(m.body)
      setDraft('')
    } catch {
      setError('Couldn’t send. Check your connection and try again.')
    }
    setBusy(false)
  }

  return (
    <section aria-label="Messages" className="chat">
      <h3>Messages</h3>
      {messages === null ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          {more && (
            <button className="link" onClick={() => void earlier()}>
              Show earlier messages
            </button>
          )}
          {!messages.length && <p className="muted">No messages yet. Ask {name} anything here.</p>}
          <ol className="chat-list">
            {[...messages].reverse().map((m) => (
              <li key={m.id} className={m.mine ? 'mine' : 'theirs'} aria-label={`${m.mine ? 'You' : name}, ${sentLabel(m.sentAt)}`}>
                <p>{m.body}</p>
                <small className="muted">
                  {m.mine ? 'You' : name} · {sentLabel(m.sentAt)}
                  {m.mine && m.read ? ' · Seen' : ''}
                </small>
              </li>
            ))}
          </ol>
        </>
      )}
      <form onSubmit={send} noValidate>
        <label className="field">
          <span>Message to {name}</span>
          <textarea value={draft} maxLength={MAX_MESSAGE} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <button className="primary" disabled={busy}>Send</button>
      </form>
      {sent && (
        <p className="muted">
          Sent. The app doesn’t alert {name} yet.{' '}
          <a className="link" href={nudgeLink(sent, appUrl)} target="_blank" rel="noreferrer">
            Tell {name} on WhatsApp
          </a>
        </p>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}
