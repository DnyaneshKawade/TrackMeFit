// Coach links (spec T-026a): a coach makes a one-time code, the person who
// enters it joins that coach. Either side can end the link.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClientSummary, Goal } from '../engine/attention'
import { shiftDate } from '../log/types'

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

/** A client in the coach's list, with what the attention rules need (T-026b). */
export type ClientRow = ClientSummary & { linkId: string }

export interface CoachStore {
  /** The person's active coach, if any. */
  myCoach(): Promise<CoachLink | null>
  /** Joins the coach whose code this is; returns the coach's name. */
  join(code: string): Promise<string>
  /** A coach's active clients with last week's numbers, in two requests. */
  clients(today: string): Promise<ClientRow[]>
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

/** A client row with nothing logged yet, for tests and new clients. */
export const emptyClient = (linkId: string, name: string): ClientRow => ({
  linkId,
  clientId: `client-${linkId}`,
  name,
  goal: null,
  trainingDays: null,
  lastFoodOn: null,
  foodDays: 0,
  avgKcal: null,
  avgProteinG: null,
  targetKcal: null,
  targetProteinG: null,
  weighIns: [],
  workouts: 0,
  lastWorkoutOn: null,
})

/** For tests and offline previews: codes map to coach names. */
export function memoryCoachStore(start: { coach?: CoachLink | null; clients?: ClientRow[]; codes?: Record<string, string> } = {}): CoachStore {
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
      return [...clients]
    },
    async createInvite() {
      const code = `ABCDE${String(++n).padStart(5, '0')}`
      return { code, expiresAt: '2026-10-22T00:00:00Z' }
    },
    async end(id) {
      if (coach?.id === id) coach = null
      clients = clients.filter((c) => c.linkId !== id)
    },
  }
}

interface SummaryRow {
  link_id: string
  client_id: string
  full_name: string
  goal: Goal | null
  training_days: number | null
  last_food_on: string | null
  food_days: number
  avg_kcal: number | string | null
  avg_protein_g: number | string | null
  target_kcal: number | null
  target_protein_g: number | null
  workouts: number
  last_workout_on: string | null
}

type LinkRow = { id: string; coach_id: string; coach: { full_name: string } | null }

export function supabaseCoachStore(sb: SupabaseClient, userId: string): CoachStore {
  // The coach's name comes with the link in one request.
  const select = 'id, coach_id, coach:profiles!coach_clients_coach_id_fkey(full_name)'
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
    async clients(today) {
      const { data, error } = await sb.rpc('client_summaries', { today })
      if (error) throw error
      const rows = data as SummaryRow[]
      if (!rows.length) return []
      // Weigh-ins for every client in one request, three weeks back.
      const w = await sb
        .from('weigh_ins')
        .select('user_id, measured_on, weight_kg')
        .in('user_id', rows.map((r) => r.client_id))
        .gte('measured_on', shiftDate(today, -21))
      if (w.error) throw w.error
      const byClient = new Map<string, { date: string; kg: number }[]>()
      for (const x of w.data as { user_id: string; measured_on: string; weight_kg: number | string }[]) {
        const list = byClient.get(x.user_id) ?? []
        list.push({ date: x.measured_on, kg: Number(x.weight_kg) })
        byClient.set(x.user_id, list)
      }
      const num = (v: number | string | null) => (v === null ? null : Number(v))
      return rows.map((r) => ({
        linkId: r.link_id,
        clientId: r.client_id,
        name: r.full_name || 'No name yet',
        goal: r.goal,
        trainingDays: r.training_days,
        lastFoodOn: r.last_food_on,
        foodDays: r.food_days,
        avgKcal: num(r.avg_kcal),
        avgProteinG: num(r.avg_protein_g),
        targetKcal: r.target_kcal,
        targetProteinG: r.target_protein_g,
        weighIns: byClient.get(r.client_id) ?? [],
        workouts: r.workouts,
        lastWorkoutOn: r.last_workout_on,
      }))
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
