// The Requests page (spec T-042a5): people's requests to correct their data.
// Open ones come oldest first with the days left out of 90.

import { useEffect, useState } from 'react'
import { adminError, REQUEST_PAGE, type AdminService, type RequestRow } from './service'
import { ReasonForm } from './ReasonForm'

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const nameOf = (r: RequestRow) => r.name || r.email
const daysLeft = (n: number) => (n < 0 ? `${-n} days late` : n === 1 ? '1 day left' : `${n} days left`)

export function Requests({ service }: { service: AdminService }) {
  const [status, setStatus] = useState<'open' | 'closed'>('open')
  const [rows, setRows] = useState<RequestRow[] | null>(null)
  const [more, setMore] = useState(false)
  const [closing, setClosing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  const load = async (s: 'open' | 'closed', after?: RequestRow) => {
    setError('')
    try {
      const page = await service.requests(s, after)
      setRows((old) => (after ? [...(old ?? []), ...page] : page))
      setMore(page.length === REQUEST_PAGE)
    } catch (e) {
      setError(adminError(e))
    }
  }
  useEffect(() => {
    setRows(null)
    void load(status)
  }, [service, status]) // eslint-disable-line react-hooks/exhaustive-deps

  const close = async (id: string, answer: string) => {
    setError('')
    setDone('')
    try {
      await service.closeRequest(id, answer)
      setClosing(null)
      setDone('Closed. They can read your answer now.')
      await load(status)
    } catch (e) {
      setError(adminError(e))
    }
  }

  return (
    <section aria-label="Requests">
      <h3>Requests</h3>
      <p className="muted">People ask here to fix their data. Answer within 90 days.</p>
      <nav className="tabs" role="tablist" aria-label="Request lists">
        <button role="tab" aria-selected={status === 'open'} onClick={() => setStatus('open')}>Open</button>
        <button role="tab" aria-selected={status === 'closed'} onClick={() => setStatus('closed')}>Closed</button>
      </nav>
      {status === 'open' && <p className="muted">The oldest request comes first.</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {done && <p role="status">{done}</p>}
      {rows === null ? (
        <p className="muted">Loading…</p>
      ) : !rows.length ? (
        <p className="muted">No requests here.</p>
      ) : (
        <ul className="admin-team">
          {rows.map((r) => (
            <li key={r.id} aria-label={`Request from ${nameOf(r)}`}>
              <div>
                <strong>{nameOf(r)}</strong>
                <div className="muted">{r.email}</div>
                <p>{r.note}</p>
                <div className="muted">
                  Sent on {day(r.createdAt)}.{' '}
                  {r.status === 'open' ? daysLeft(r.daysLeft) + '.' : `Closed on ${day(r.closedAt ?? r.createdAt)}.`}
                </div>
                {r.answer && <p>Your answer: {r.answer}</p>}
              </div>
              {r.status === 'open' &&
                (closing === r.id ? (
                  <ReasonForm
                    question={`Close the request from ${nameOf(r)}?`}
                    button="Close"
                    label="Answer for them"
                    onCancel={() => setClosing(null)}
                    onSave={(answer) => void close(r.id, answer)}
                  />
                ) : (
                  <span className="actions">
                    <button className="link" aria-label={`Answer ${nameOf(r)}`} onClick={() => setClosing(r.id)}>Answer and close</button>
                  </span>
                ))}
            </li>
          ))}
        </ul>
      )}
      {more && rows && (
        <button className="link" onClick={() => void load(status, rows[rows.length - 1])}>Show more</button>
      )}
    </section>
  )
}
