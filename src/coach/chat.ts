// Chat between a person and their coach (T-026f). Messages belong to one
// coach link; there are no push alerts, so the sender can nudge on WhatsApp.

import type { SupabaseClient } from '@supabase/supabase-js'

export const MAX_MESSAGE = 1000
/** Messages loaded at a time; "Show earlier" loads the page before. */
export const PAGE = 30

export interface Message {
  id: string
  body: string
  /** True when the signed-in person sent it. */
  mine: boolean
  /** ISO time. */
  sentAt: string
  /** The other side has opened the chat since. */
  read: boolean
}

export interface ChatStore {
  /** Newest first; `before` is the sentAt of the oldest message already shown. */
  list(linkId: string, before?: string, limit?: number): Promise<Message[]>
  send(linkId: string, body: string): Promise<Message>
  /** Marks the other side's messages as read. */
  markRead(linkId: string): Promise<void>
  /** Unread messages from the other side, by link id, in one request. */
  unread(): Promise<Map<string, number>>
  /** Calls back with each new or changed message in a chat while it is open
   * (T-026h); returns a function that stops listening. */
  watch?(linkId: string, onChange: (m: Message) => void): () => void
}

/** Puts a new or changed message in a newest-first list, once. */
export function upsertMessage(list: Message[], m: Message): Message[] {
  const at = list.findIndex((x) => x.id === m.id)
  if (at >= 0) return list.map((x, i) => (i === at ? m : x))
  return [m, ...list].sort((a, b) => b.sentAt.localeCompare(a.sentAt))
}

/** "15 Oct, 2:30 pm" */
export const sentLabel = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

/** The WhatsApp nudge after sending, since the app has no alerts yet. */
export function nudgeText(body: string, appUrl: string): string {
  const text = body.trim().replace(/\s+/g, ' ')
  const short = text.length > 100 ? `${text.slice(0, 97)}…` : text
  return `I sent you a message on Track Me Fit. "${short}" Open the app to reply: ${appUrl}`
}

export const nudgeLink = (body: string, appUrl: string) => `https://wa.me/?text=${encodeURIComponent(nudgeText(body, appUrl))}`

/** Problem that stops a message being sent, or null. */
export function checkMessage(body: string): string | null {
  if (!body.trim()) return 'Write a message first.'
  if (body.trim().length > MAX_MESSAGE) return `Keep a message to ${MAX_MESSAGE} letters.`
  return null
}

interface Stored {
  id: string
  linkId: string
  sender: string
  body: string
  sentAt: string
  readAt: string | null
}

type Listener = (linkId: string, row: Stored) => void

// One counter for all memory stores, so two stores sharing rows never repeat an id.
let seq = 0

/** For tests: `rows` and `listeners` are shared so two stores (person and
 * coach) can talk and see each other's changes live. */
export function memoryChatStore(me: string, rows: Stored[] = [], now = () => new Date().toISOString(), listeners: Set<Listener> = new Set()): ChatStore {
  const view = (r: Stored): Message => ({ id: r.id, body: r.body, mine: r.sender === me, sentAt: r.sentAt, read: r.readAt !== null })
  const tell = (r: Stored) => listeners.forEach((l) => l(r.linkId, r))
  return {
    async list(linkId, before, limit = PAGE) {
      return rows
        .filter((r) => r.linkId === linkId && (!before || r.sentAt < before))
        .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
        .slice(0, limit)
        .map(view)
    },
    async send(linkId, body) {
      const row: Stored = { id: `m${rows.length}-${++seq}`, linkId, sender: me, body: body.trim(), sentAt: now(), readAt: null }
      rows.push(row)
      tell(row)
      return view(row)
    },
    async markRead(linkId) {
      for (const r of rows)
        if (r.linkId === linkId && r.sender !== me && !r.readAt) {
          r.readAt = now()
          tell(r)
        }
    },
    watch(linkId, onChange) {
      const l: Listener = (link, r) => link === linkId && onChange(view(r))
      listeners.add(l)
      return () => listeners.delete(l)
    },
    async unread() {
      const counts = new Map<string, number>()
      for (const r of rows) if (r.sender !== me && !r.readAt) counts.set(r.linkId, (counts.get(r.linkId) ?? 0) + 1)
      return counts
    },
  }
}

interface Row {
  id: string
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
}

const COLUMNS = 'id, sender_id, body, created_at, read_at'

/** Row-level security limits reads and sends to the two sides of an active link. */
export function supabaseChatStore(sb: SupabaseClient, me: string): ChatStore {
  const check = <T>({ data, error }: { data: T; error: unknown }): T => {
    if (error) throw error
    return data
  }
  const view = (r: Row): Message => ({ id: r.id, body: r.body, mine: r.sender_id === me, sentAt: r.created_at, read: r.read_at !== null })
  return {
    async list(linkId, before, limit = PAGE) {
      let q = sb.from('chat_messages').select(COLUMNS).eq('link_id', linkId)
      if (before) q = q.lt('created_at', before)
      const rows = check(await q.order('created_at', { ascending: false }).limit(limit))
      return (rows as Row[]).map(view)
    },
    async send(linkId, body) {
      const row = check(await sb.from('chat_messages').insert({ link_id: linkId, body: body.trim() }).select(COLUMNS).single())
      return view(row as Row)
    },
    async markRead(linkId) {
      check(await sb.rpc('mark_chat_read', { link: linkId }))
    },
    async unread() {
      const rows = check(await sb.from('chat_messages').select('link_id').is('read_at', null).neq('sender_id', me)) as { link_id: string }[]
      const counts = new Map<string, number>()
      for (const r of rows) counts.set(r.link_id, (counts.get(r.link_id) ?? 0) + 1)
      return counts
    },
    watch(linkId, onChange) {
      // Realtime checks the same row-level security as reads.
      const channel = sb
        .channel(`chat:${linkId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `link_id=eq.${linkId}` }, (change) => {
          if (change.new && 'id' in change.new) onChange(view(change.new as Row))
        })
        .subscribe()
      return () => void sb.removeChannel(channel)
    },
  }
}
