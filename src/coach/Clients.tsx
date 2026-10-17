import { useEffect, useState } from 'react'
import { sortByAttention, type ClientAttention } from '../engine/attention'
import { localDate } from '../log/types'
import type { ChatStore } from './chat'
import { PlanEditor } from '../training/PlanEditor'
import type { Plan, WorkoutStore } from '../training/types'
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
  templates,
}: {
  store: CoachStore
  /** A client's stores, to open them (T-026c). */
  storesFor?: (clientId: string) => ClientStores
  coachId?: string
  today?: string
  /** Messages with clients, and unread counts on the list (T-026f). */
  chat?: ChatStore
  /** The coach's program templates (T-026g). */
  templates?: WorkoutStore
}) {
  const [clients, setClients] = useState<ClientAttention<ClientRow>[] | null>(null)
  const [open, setOpen] = useState<{ item: ClientAttention<ClientRow>; stores: ClientStores } | null>(null)
  const [invite, setInvite] = useState<Invite | null>(null)
  const [copied, setCopied] = useState(false)
  const [ending, setEnding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unread, setUnread] = useState<Map<string, number>>(new Map())
  const [programs, setPrograms] = useState<Plan[] | null>(null)
  const [limit, setLimit] = useState<number | null>(null)
  const [editingProgram, setEditingProgram] = useState<Plan | null>(null)

  useEffect(() => {
    store.clients(today).then(
      (rows) => setClients(sortByAttention(rows, today)),
      () => {
        setClients([])
        setError('Couldn’t load your clients. Check your connection.')
      },
    )
  }, [store, today])

  useEffect(() => {
    store.clientLimit().then(setLimit, () => undefined)
  }, [store])

  useEffect(() => {
    templates?.plans().then(setPrograms, () => {
      setPrograms([])
      setError('Couldn’t load your program templates. Check your connection.')
    })
  }, [templates])

  const saveProgram = async (p: Plan) => {
    await templates!.savePlan(p)
    setPrograms(await templates!.plans())
    setEditingProgram(null)
  }

  const deleteProgram = async (id: string) => {
    await templates!.deletePlan(id)
    setPrograms(await templates!.plans())
    setEditingProgram(null)
  }

  // Counted again when the coach comes back from a client's page.
  useEffect(() => {
    if (chat && !open) chat.unread().then(setUnread, () => undefined)
  }, [chat, open])

  const makeInvite = async () => {
    setError(null)
    setCopied(false)
    try {
      setInvite(await store.createInvite())
    } catch (err) {
      setError(
        /client limit reached/i.test(String((err as Error)?.message))
          ? `You have ${clients?.length ?? limit} clients, the most allowed now. End a link to invite someone new.`
          : 'Couldn’t make a code. Check your connection.',
      )
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
    return (
      <ClientView
        client={open.item.client}
        flags={open.item.flags}
        stores={open.stores}
        coachId={coachId}
        today={today}
        chat={chat}
        programs={programs ?? []}
        onBack={() => setOpen(null)}
      />
    )

  if (editingProgram)
    return (
      <main className="log">
        <PlanEditor
          initial={editingProgram}
          onSave={saveProgram}
          onDelete={editingProgram.id ? () => deleteProgram(editingProgram.id!) : undefined}
          onClose={() => setEditingProgram(null)}
        />
      </main>
    )

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
        <h3>Your clients{clients && limit ? ` (${clients.length} of ${limit})` : clients?.length ? ` (${clients.length})` : ''}</h3>
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
      {templates && (
        <section aria-label="Program templates">
          <h3>Program templates</h3>
          <p className="muted">Make a plan once. Then add it to any client from their page.</p>
          {programs === null ? (
            <p className="muted">Loading…</p>
          ) : programs.length ? (
            <ul className="session-list">
              {programs.map((p) => (
                <li key={p.id} className="plan-card">
                  <div>
                    <strong>{p.name}</strong>
                    <br />
                    <span className="muted">{p.days.map((d) => d.name).join(' · ')}</span>
                  </div>
                  <button className="link" aria-label={`Edit ${p.name}`} onClick={() => setEditingProgram(p)}>Edit</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No templates yet.</p>
          )}
          <button className="add" onClick={() => setEditingProgram({ name: '', days: [{ dayIndex: 0, name: '', exercises: [] }] })}>+ New template</button>
        </section>
      )}
    </main>
  )
}
