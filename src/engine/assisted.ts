// Assisted machines (spec T-117), like the assisted pull-up. The weight is
// help, so less weight is progress. Pure functions, no I/O.

import { startOf } from './myo'
import { weightText, type WeightUnit } from './units'
import { rangeStart, type GraphRange, type Lift, type StrengthSession, type StrengthSet } from './strength'

export { assistedNext, type AssistedInput } from './assistedLoad'

const working = (s: StrengthSet) => s.tag !== 'warmup' && s.tag !== 'drop' && s.reps > 0
const oldestFirst = (sessions: StrengthSession[]) => [...sessions].sort((a, b) => a.performedOn.localeCompare(b.performedOn))
/** Less help wins; with the same help, more reps win. */
const better = (a: { weightKg: number; reps: number }, b: { weightKg: number; reps: number } | null) =>
  !b || a.weightKg < b.weightKg || (a.weightKg === b.weightKg && a.reps > b.reps)

export interface AssistedRecords {
  leastHelp: Lift | null
  mostReps: Lift | null
  notes: string[]
}

export function assistedRecords(sessions: StrengthSession[]): AssistedRecords {
  let leastHelp: Lift | null = null
  let mostReps: Lift | null = null
  for (const session of oldestFirst(sessions))
    for (const raw of session.sets) {
      const s = startOf(raw)
      if (!working(s)) continue
      const lift = { weightKg: s.weightKg, reps: s.reps, performedOn: session.performedOn }
      if (better(s, leastHelp)) leastHelp = lift
      if (!mostReps || s.reps > mostReps.reps) mostReps = lift
    }
  const notes = leastHelp ? ['The weight here is help. Less help means you are stronger.', 'Warm-ups and drop sets are left out.'] : ['Log this exercise to see your records.']
  return { leastHelp, mostReps, notes }
}

/** A new record for least help (spec T-117). Null on the first workout and on ties. */
export function assistedNewRecord(past: StrengthSession[], today: StrengthSet[], logged: StrengthSet, unit: WeightUnit = 'kg'): string | null {
  const set = startOf(logged)
  if (!working(set) || !past.some((p) => p.sets.some(working))) return null
  const old = assistedRecords([...past, { performedOn: '9999-12-31', sets: today }]).leastHelp
  if (!old || !better(set, old)) return null
  return set.weightKg < old.weightKg
    ? `New record: least help. Your best before was ${weightText(old.weightKg, unit)}.`
    : `New record: ${set.reps} reps with ${weightText(set.weightKg, unit)} of help.`
}

export type AssistedGraphKind = 'help' | 'reps' | 'sets'
export const ASSISTED_GRAPH_KINDS: [AssistedGraphKind, string][] = [
  ['help', 'Least help (lower is better)'],
  ['reps', 'Most reps in a set'],
  ['sets', 'Total sets'],
]

/** One value per workout, oldest first: the least help used, the most reps, or the sets done. */
export function assistedGraph(sessions: StrengthSession[], kind: AssistedGraphKind, range: GraphRange, today: string): { date: string; value: number }[] {
  const from = rangeStart(range, today)
  const out: { date: string; value: number }[] = []
  for (const s of oldestFirst(sessions)) {
    if (from && s.performedOn < from) continue
    const sets = s.sets.map(startOf).filter(working)
    if (!sets.length) continue
    const value = kind === 'help' ? Math.min(...sets.map((x) => x.weightKg)) : kind === 'sets' ? sets.length : Math.max(...sets.map((x) => x.reps))
    out.push({ date: s.performedOn, value })
  }
  return out
}

/** Past workouts newest first, each set marked when it was a new record then. */
export function assistedHistory(sessions: StrengthSession[]): { performedOn: string; sets: (StrengthSet & { record: boolean })[] }[] {
  let best: { weightKg: number; reps: number } | null = null
  const out: { performedOn: string; sets: (StrengthSet & { record: boolean })[] }[] = []
  for (const s of oldestFirst(sessions)) {
    const first = best === null
    const sets = s.sets.map((x) => {
      const w = startOf(x)
      if (!working(w)) return { ...x, record: false }
      const record = !first && better(w, best)
      if (better(w, best)) best = w
      return { ...x, record }
    })
    out.push({ performedOn: s.performedOn, sets })
  }
  return out.reverse()
}
