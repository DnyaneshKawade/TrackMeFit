// Personal records and a strength graph for one exercise (spec T-044). Pure
// functions, no I/O. Only working sets count: warm-ups and drop sets are
// left out, as in the rest of the logger.

import { startOf } from './myo'
import { weightText, type WeightUnit } from './units'

export { myoText, startOf } from './myo'

export interface StrengthSet {
  weightKg: number
  reps: number
  tag?: 'warmup' | 'drop' | 'failure' | 'myo'
  /** Myo-reps: the mini-sets after the start set; `reps` is the total (T-111). */
  miniReps?: number[]
}

export interface StrengthSession {
  performedOn: string
  sets: StrengthSet[]
}

export interface Lift {
  weightKg: number
  reps: number
  performedOn: string
}

export interface ExerciseRecords {
  heaviest: Lift | null
  /** Best estimated one-rep max, rounded to 0.5 kg, with the set it came from. */
  bestE1rm: (Lift & { e1rm: number }) | null
  mostReps: Lift | null
  /** Heaviest weight for at least this many reps. Only counts with a lift. */
  repMaxes: (Lift & { target: number })[]
  /** Oldest first: the best estimated one-rep max (or most reps) per workout. */
  points: { date: string; value: number }[]
  /** What the graph shows: estimated one-rep max, or reps for no-weight work. */
  measure: 'e1rm' | 'reps'
  notes: string[]
}

/** Above this many reps the estimate is a poor guess, so the set isn't used. */
export const REP_CAP = 12
export const REP_MAX_TARGETS = [1, 2, 3, 5, 8, 10, 12]

const round05 = (n: number) => Math.round(n * 2) / 2

/** Epley estimate; a single rep is its own weight. Null above the rep cap. */
export function e1rm(weightKg: number, reps: number): number | null {
  if (reps < 1 || reps > REP_CAP || weightKg <= 0) return null
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30)
}

const working = (s: StrengthSet) => s.tag !== 'warmup' && s.tag !== 'drop' && s.reps > 0

export function exerciseRecords(sessions: StrengthSession[]): ExerciseRecords {
  // Oldest first, so the first set to reach a record keeps it on a tie.
  const ordered = [...sessions].sort((a, b) => a.performedOn.localeCompare(b.performedOn))
  let heaviest: Lift | null = null
  let best: (Lift & { e1rm: number }) | null = null
  let mostReps: Lift | null = null
  const repMax = new Map<number, Lift>()
  const perSession: { date: string; e1rm: number; reps: number }[] = []

  for (const session of ordered) {
    let sessionE1rm = 0
    let sessionReps = 0
    for (const raw of session.sets) {
      const s = startOf(raw)
      if (!working(s)) continue
      const lift = { weightKg: s.weightKg, reps: s.reps, performedOn: session.performedOn }
      if (s.weightKg > 0 && (!heaviest || s.weightKg > heaviest.weightKg)) heaviest = lift
      if (!mostReps || s.reps > mostReps.reps) mostReps = lift
      sessionReps = Math.max(sessionReps, s.reps)
      const est = e1rm(s.weightKg, s.reps)
      if (est !== null) {
        sessionE1rm = Math.max(sessionE1rm, est)
        if (!best || est > best.e1rm) best = { ...lift, e1rm: est }
      }
      if (s.weightKg > 0)
        for (const target of REP_MAX_TARGETS) {
          if (target > s.reps) break
          const old = repMax.get(target)
          if (!old || s.weightKg > old.weightKg) repMax.set(target, lift)
        }
    }
    if (sessionReps > 0) perSession.push({ date: session.performedOn, e1rm: sessionE1rm, reps: sessionReps })
  }

  const measure = heaviest ? 'e1rm' : 'reps'
  const points = perSession
    .filter((p) => (measure === 'e1rm' ? p.e1rm > 0 : true))
    .map((p) => ({ date: p.date, value: measure === 'e1rm' ? round05(p.e1rm) : p.reps }))

  const notes: string[] = []
  if (!perSession.length) notes.push('Log this exercise to see your records.')
  else if (measure === 'e1rm') {
    notes.push(`Worked out from sets of ${REP_CAP} reps or fewer. Higher reps give a poor guess.`)
    notes.push('Heaviest for 5 reps: the most you lifted 5 or more times.')
    if (!best) notes.push(`Do ${REP_CAP} reps or fewer in a set for your one-rep max.`)
  } else notes.push('You did this with no weight. So the graph shows your most reps.')
  notes.push('Warm-ups and drop sets are left out.')
  if (sessions.some((x) => x.sets.some((s) => s.tag === 'myo'))) notes.push('Myo-reps count by their start set.')

  return {
    heaviest,
    bestE1rm: best ? { ...best, e1rm: round05(best.e1rm) } : null,
    mostReps,
    repMaxes: REP_MAX_TARGETS.flatMap((target) => {
      const l = repMax.get(target)
      return l ? [{ ...l, target }] : []
    }),
    points,
    measure,
    notes,
  }
}

export interface NewRecord {
  kind: 'heaviest' | 'e1rm' | 'reps'
  /** Plain words for the person, with the old best. */
  text: string
}

/** Does this set beat the person's best (spec T-044b)? Earlier workouts and
 * the sets already done today count. Null for warm-ups, drop sets, ties, and
 * the first workout with an exercise, which only sets the starting point. */
export function newRecord(past: StrengthSession[], today: StrengthSet[], logged: StrengthSet, unit: WeightUnit = 'kg'): NewRecord | null {
  const set = startOf(logged)
  if (!working(set)) return null
  if (!past.some((p) => p.sets.some(working))) return null
  const before = exerciseRecords([...past, { performedOn: '9999-12-31', sets: today }])
  const old = before.heaviest
  if (old && set.weightKg > old.weightKg) return { kind: 'heaviest', text: `New record: heaviest weight. Your best before was ${weightText(old.weightKg, unit)}.` }
  const est = e1rm(set.weightKg, set.reps)
  const best = before.bestE1rm
  if (est !== null && best && round05(est) > best.e1rm)
    return { kind: 'e1rm', text: `New record: best one-rep max guess, ${weightText(round05(est), unit)}. Your best before was ${weightText(best.e1rm, unit)}.` }
  const most = before.mostReps
  if (!old && set.weightKg === 0 && most && set.reps > most.reps) return { kind: 'reps', text: `New record: most reps in a set. Your best before was ${most.reps}.` }
  return null
}

/** What the strength graph can show (T-106), like FitNotes' graph choices. */
export type GraphKind = 'e1rm' | 'heaviest' | 'reps' | 'bestSet' | 'volume' | 'totalReps'
export const GRAPH_KINDS: [GraphKind, string][] = [
  ['e1rm', 'One-rep max guess'],
  ['heaviest', 'Heaviest weight'],
  ['reps', 'Most reps in a set'],
  ['bestSet', 'Best set (weight × reps)'],
  ['volume', 'Total weight lifted'],
  ['totalReps', 'Total reps'],
]
/** Graph kinds shown in kg or lb; the others are counts. */
export const WEIGHT_KINDS = new Set<GraphKind>(['e1rm', 'heaviest', 'bestSet', 'volume'])

export type GraphRange = '1m' | '3m' | '6m' | '1y' | 'all'
export const GRAPH_RANGES: [GraphRange, string][] = [
  ['1m', '1 month'],
  ['3m', '3 months'],
  ['6m', '6 months'],
  ['1y', '1 year'],
  ['all', 'All'],
]
const RANGE_MONTHS: Record<Exclude<GraphRange, 'all'>, number> = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }

/** The first day a range covers, or null for all of it. */
export function rangeStart(range: GraphRange, today: string): string | null {
  if (range === 'all') return null
  const d = new Date(`${today}T00:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() - RANGE_MONTHS[range])
  return d.toISOString().slice(0, 10)
}

/** One value per workout for the chosen graph, oldest first. Working sets
 * only; workouts with nothing to show (no weight for a weight graph) are left out. */
export function graphPoints(sessions: StrengthSession[], kind: GraphKind, range: GraphRange, today: string): { date: string; value: number }[] {
  const from = rangeStart(range, today)
  const out: { date: string; value: number }[] = []
  for (const s of [...sessions].sort((a, b) => a.performedOn.localeCompare(b.performedOn))) {
    if (from && s.performedOn < from) continue
    const sets = s.sets.filter(working)
    if (!sets.length) continue
    let value = 0
    for (const x of sets) {
      if (kind === 'e1rm') value = Math.max(value, e1rm(x.weightKg, x.reps) ?? 0)
      else if (kind === 'heaviest') value = Math.max(value, x.weightKg)
      else if (kind === 'reps') value = Math.max(value, x.reps)
      else if (kind === 'bestSet') value = Math.max(value, x.weightKg * x.reps)
      else if (kind === 'volume') value += x.weightKg * x.reps
      else value += x.reps
    }
    if (value > 0) out.push({ date: s.performedOn, value: kind === 'e1rm' ? round05(value) : Math.round(value * 10) / 10 })
  }
  return out
}

/** Past workouts newest first, each set marked when it set a new record at
 * the time: heaviest weight or best one-rep max guess (T-106). The first
 * workout only sets the starting point, so it has no marks. */
export function historyWithRecords(sessions: StrengthSession[]): { performedOn: string; sets: (StrengthSet & { record: boolean })[] }[] {
  let heaviest = 0
  let best = 0
  let first = true
  const out: { performedOn: string; sets: (StrengthSet & { record: boolean })[] }[] = []
  for (const s of [...sessions].sort((a, b) => a.performedOn.localeCompare(b.performedOn))) {
    const sets = s.sets.map((x) => {
      if (!working(x)) return { ...x, record: false }
      const est = round05(e1rm(x.weightKg, x.reps) ?? 0)
      const record = !first && ((x.weightKg > 0 && x.weightKg > heaviest) || (est > 0 && est > best))
      heaviest = Math.max(heaviest, x.weightKg)
      best = Math.max(best, est)
      return { ...x, record }
    })
    if (s.sets.some(working)) first = false
    out.push({ performedOn: s.performedOn, sets })
  }
  return out.reverse()
}
