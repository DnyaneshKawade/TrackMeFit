// Weekly check-ins (T-026e): a person with a coach answers five short
// questions once a week; the coach reads them and replies.

import type { SupabaseClient } from '@supabase/supabase-js'
import { shiftDate } from '../log/types'
import type { WeighIn } from '../progress/types'

export type Score = 1 | 2 | 3 | 4 | 5
export type Question = 'energy' | 'sleep' | 'mood' | 'diet' | 'training'

/** Each question is scored from 1 (poor) to 5 (great). */
export const QUESTIONS: { key: Question; label: string }[] = [
  { key: 'energy', label: 'Energy' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'mood', label: 'Mood' },
  { key: 'diet', label: 'Sticking to your food plan' },
  { key: 'training', label: 'Training' },
]

export const MAX_NOTE = 500
export const MAX_REPLY = 1000

export interface Answers extends Record<Question, Score> {
  note: string
  ask: string
}

export interface CheckIn extends Answers {
  id: string
  /** The Monday of the week it is for. */
  weekStart: string
  reply: string | null
  repliedOn: string | null
}

export interface CheckInStore {
  /** Newest first. */
  list(limit?: number): Promise<CheckIn[]>
  /** Adds this week's check-in, or changes it while there is no reply. */
  save(weekStart: string, answers: Answers): Promise<CheckIn>
  /** The coach's reply. */
  reply(id: string, text: string): Promise<CheckIn>
}

/** The Monday on or before a date. */
export function weekStart(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay() // 0 is Sunday
  return shiftDate(date, -((day + 6) % 7))
}

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
export const weekLabel = (monday: string) => `Week of ${shortDate(monday)}`

/** "Energy 4 · Sleep 3 · …" */
export const scoreLine = (c: Answers) => QUESTIONS.map((q) => `${q.label} ${c[q.key]}`).join(' · ')

/** Problems that stop a check-in being saved, in plain words. */
export function checkAnswers(a: Partial<Answers>): string[] {
  const problems: string[] = []
  const missing = QUESTIONS.filter((q) => !a[q.key])
  if (missing.length) problems.push(`Pick a number for ${missing.map((q) => q.label.toLowerCase()).join(', ')}.`)
  if ((a.note ?? '').length > MAX_NOTE || (a.ask ?? '').length > MAX_NOTE) problems.push(`Keep each note to ${MAX_NOTE} letters.`)
  return problems
}

/** Average weight in the check-in week and the change from the week before, for the coach. */
export function weekWeight(weighIns: WeighIn[], monday: string): { avg: number; change: number | null } | null {
  const avgOf = (from: string) => {
    const to = shiftDate(from, 6)
    const kg = weighIns.filter((w) => w.date >= from && w.date <= to).map((w) => w.kg)
    return kg.length ? kg.reduce((a, b) => a + b, 0) / kg.length : null
  }
  const now = avgOf(monday)
  if (now === null) return null
  const before = avgOf(shiftDate(monday, -7))
  const r = (n: number) => Math.round(n * 10) / 10
  return { avg: r(now), change: before === null ? null : r(now - before) }
}

/** "Average 70.2 kg, down 0.4 kg from the week before." */
export function describeWeekWeight(w: ReturnType<typeof weekWeight>): string {
  if (!w) return 'No weigh-ins that week.'
  if (w.change === null) return `Average ${w.avg} kg. No weigh-ins the week before.`
  if (w.change === 0) return `Average ${w.avg} kg, the same as the week before.`
  return `Average ${w.avg} kg, ${w.change < 0 ? 'down' : 'up'} ${Math.abs(w.change)} kg from the week before.`
}

export function memoryCheckInStore(start: CheckIn[] = [], today = new Date().toISOString().slice(0, 10)): CheckInStore {
  let rows = structuredClone(start)
  let n = 1
  const sorted = () => [...rows].sort((a, b) => b.weekStart.localeCompare(a.weekStart))
  return {
    async list(limit = 12) {
      return structuredClone(sorted().slice(0, limit))
    },
    async save(week, answers) {
      const old = rows.find((r) => r.weekStart === week)
      if (old?.reply) throw new Error('already replied')
      const row: CheckIn = { ...answers, id: old?.id ?? `c${n++}`, weekStart: week, reply: null, repliedOn: null }
      rows = [...rows.filter((r) => r.weekStart !== week), row]
      return structuredClone(row)
    },
    async reply(id, text) {
      const row = rows.find((r) => r.id === id)
      if (!row || !text.trim()) throw new Error('reply not valid')
      Object.assign(row, { reply: text.trim(), repliedOn: today })
      return structuredClone(row)
    },
  }
}

interface Row {
  id: string
  week_start: string
  energy: Score
  sleep: Score
  mood: Score
  diet: Score
  training: Score
  note: string
  ask: string
  coach_reply: string | null
  replied_at: string | null
}

const COLUMNS = 'id, week_start, energy, sleep, mood, diet, training, note, ask, coach_reply, replied_at'

export const checkInFromRow = (r: Row): CheckIn => ({
  id: r.id,
  weekStart: r.week_start,
  energy: r.energy,
  sleep: r.sleep,
  mood: r.mood,
  diet: r.diet,
  training: r.training,
  note: r.note,
  ask: r.ask,
  reply: r.coach_reply,
  repliedOn: r.replied_at ? r.replied_at.slice(0, 10) : null,
})

/** Check-ins of one person; their coach uses it with the client's id. */
export function supabaseCheckInStore(sb: SupabaseClient, userId: string): CheckInStore {
  const check = <T>({ data, error }: { data: T; error: unknown }): T => {
    if (error) throw error
    return data
  }
  const one = async (id: string) => checkInFromRow(check(await sb.from('check_ins').select(COLUMNS).eq('id', id).single()) as Row)
  return {
    async list(limit = 12) {
      const rows = check(await sb.from('check_ins').select(COLUMNS).eq('user_id', userId).order('week_start', { ascending: false }).limit(limit))
      return (rows as Row[]).map(checkInFromRow)
    },
    async save(week, a) {
      const values = { energy: a.energy, sleep: a.sleep, mood: a.mood, diet: a.diet, training: a.training, note: a.note.trim(), ask: a.ask.trim() }
      const found = check(await sb.from('check_ins').select('id').eq('user_id', userId).eq('week_start', week).maybeSingle()) as { id: string } | null
      if (found) {
        // Nothing changes once the coach has replied.
        const changed = check(await sb.from('check_ins').update(values).eq('id', found.id).select('id')) as unknown[]
        if (!changed.length) throw new Error('already replied')
        return one(found.id)
      }
      const row = check(await sb.from('check_ins').insert({ user_id: userId, week_start: week, ...values }).select(COLUMNS).single())
      return checkInFromRow(row as Row)
    },
    async reply(id, text) {
      check(await sb.rpc('reply_check_in', { check_in: id, reply: text }))
      return one(id)
    },
  }
}
