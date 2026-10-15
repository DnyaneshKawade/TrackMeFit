// Coach links (spec T-026a): a coach makes a one-time code, the person who
// enters it joins that coach. Either side can end the link.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface Invite {
  code: string
  expiresAt: string
}

export interface CoachLink {
  id: string
  /** The other person: the client for a coach, the coach for a client. */
  personId: string
  name: string
}

export interface CoachStore {
  /** The person's active coach, if any. */
  myCoach(): Promise<CoachLink | null>
  /** Joins the coach whose code this is; returns the coach's name. */
  join(code: string): Promise<string>
  /** A coach's active clients, by name. */
  clients(): Promise<CoachLink[]>
  /** A new one-time code for a coach, valid for 7 days. */
  createInvite(): Promise<Invite>
  /** Ends a link, from either side. */
  end(linkId: string): Promise<void>
}

/** "ABCDE12345" shown as "ABCDE-12345" so it is easy to read out. */
export const showCode = (code: string) => (code.length === 10 ? `${code.slice(0, 5)}-${code.slice(5)}` : code)

/** The message a coach sends, ready for WhatsApp. */
export const inviteMessage = (code: string) =>
  `Join me as your coach on Track Me Fit. Open the app, go to Progress, and enter this code under Your coach: ${showCode(code)}`

export const byName = (a: CoachLink, b: CoachLink) => a.name.localeCompare(b.name)

/** For tests and offline previews: codes map to coach names. */
export function memoryCoachStore(start: { coach?: CoachLink | null; clients?: CoachLink[]; codes?: Record<string, string> } = {}): CoachStore {
  let coach = start.coach ?? null
  let clients = [...(start.clients ?? [])]
  const codes = new Map(Object.entries(start.codes ?? {}))
  let n = 0
  return {
    async myCoach() {
      return coach
    },
    async join(code) {
      const clean = code.replace(/[^a-z0-9]/gi, '').toUpperCase()
      const name = codes.get(clean)
      if (name === undefined) throw new Error('invite not valid')
      codes.delete(clean)
      coach = { id: `link-${++n}`, personId: `coach-${n}`, name }
      return name
    },
    async clients() {
      return [...clients].sort(byName)
    },
    async createInvite() {
      const code = `ABCDE${String(++n).padStart(5, '0')}`
      return { code, expiresAt: '2026-10-22T00:00:00Z' }
    },
    async end(id) {
      if (coach?.id === id) coach = null
      clients = clients.filter((c) => c.id !== id)
    },
  }
}

type LinkRow = { id: string; coach_id: string; client_id: string; coach: { full_name: string } | null; client: { full_name: string } | null }

export function supabaseCoachStore(sb: SupabaseClient, userId: string): CoachStore {
  // Names come with the link in one request; the database shows each side the other's profile.
  const select = 'id, coach_id, client_id, coach:profiles!coach_clients_coach_id_fkey(full_name), client:profiles!coach_clients_client_id_fkey(full_name)'
  return {
    async myCoach() {
      const { data, error } = await sb.from('coach_clients').select(select).eq('client_id', userId).eq('status', 'active').limit(1)
      if (error) throw error
      const r = (data as unknown as LinkRow[])[0]
      return r ? { id: r.id, personId: r.coach_id, name: r.coach?.full_name || 'Your coach' } : null
    },
    async join(code) {
      const { data, error } = await sb.rpc('join_coach', { invite_code: code })
      if (error) throw error
      return (data as string) || 'your coach'
    },
    async clients() {
      const { data, error } = await sb.from('coach_clients').select(select).eq('coach_id', userId).eq('status', 'active')
      if (error) throw error
      return (data as unknown as LinkRow[]).map((r) => ({ id: r.id, personId: r.client_id, name: r.client?.full_name || 'No name yet' })).sort(byName)
    },
    async createInvite() {
      const { data, error } = await sb.from('coach_invites').insert({ coach_id: userId }).select('code, expires_at').single()
      if (error) throw error
      const row = data as { code: string; expires_at: string }
      return { code: row.code, expiresAt: row.expires_at }
    },
    async end(id) {
      const { error } = await sb.from('coach_clients').update({ status: 'ended' }).eq('id', id)
      if (error) throw error
    },
  }
}
