// The finish screen after a workout (spec T-155): time, sets, weight lifted,
// new records and one strength trend line. Pure functions, no I/O; every
// line is plain words for the person.

import { e1rm, exerciseRecords, startOf, type StrengthSession, type StrengthSet } from './strength'
import { shownWeight, weightText, type WeightUnit } from './units'

export interface SummarySet extends StrengthSet {
  exerciseId: string
  /** Cardio has time instead of weight and reps. */
  seconds?: number
}

export interface WorkoutSummary {
  /** Whole minutes from the first set; null when the start isn't known. */
  minutes: number | null
  /** Working sets: warm-ups and drop sets are left out. */
  sets: number
  /** Weight times reps over the working sets, in kg. */
  liftedKg: number
  /** "Bench press: heaviest weight, 82.5 kg." One per exercise at most. */
  records: string[]
  /** One line on how strength moved lately, or null with too little history. */
  trend: string | null
}

/** A clock left running longer than this was forgotten, so no time is shown. */
export const MAX_MINUTES = 300
/** The trend looks back this many days, and needs at least 2 weeks. */
export const TREND_DAYS = 56
const MIN_TREND_DAYS = 14
/** Within 2.5% either way counts as steady. */
const STEADY = 0.025

const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86_400_000)
const working = (s: StrengthSet) => s.tag !== 'warmup' && s.tag !== 'drop' && s.reps > 0
const bestE1rm = (sets: StrengthSet[]) => Math.max(0, ...sets.map(startOf).filter(working).map((s) => e1rm(s.weightKg, s.reps) ?? 0))
const round05 = (n: number) => Math.round(n * 2) / 2

/** Earlier workouts, each with its sets, split by exercise in one pass. */
export function byExercise(past: { performedOn: string; sets: SummarySet[] }[]): Map<string, StrengthSession[]> {
  const out = new Map<string, StrengthSession[]>()
  for (const p of past) {
    const mine = new Map<string, StrengthSet[]>()
    for (const s of p.sets) mine.set(s.exerciseId, [...(mine.get(s.exerciseId) ?? []), s])
    for (const [id, sets] of mine) out.set(id, [...(out.get(id) ?? []), { performedOn: p.performedOn, sets }])
  }
  return out
}

export function workoutSummary({
  today,
  sets,
  past,
  seconds,
  nameOf,
  unit = 'kg',
}: {
  today: string
  sets: SummarySet[]
  /** Earlier workouts by exercise (see `byExercise`); null when they couldn't load. */
  past: Map<string, StrengthSession[]> | null
  /** Seconds since the first set, if known. */
  seconds: number | null
  nameOf: (exerciseId: string) => string
  unit?: WeightUnit
}): WorkoutSummary {
  const strength = sets.filter((s) => s.seconds === undefined && working(s))
  const minutes = seconds === null ? null : Math.round(seconds / 60)
  const liftedKg = Math.round(strength.map(startOf).reduce((t, s) => t + s.weightKg * s.reps, 0))
  const ids = [...new Set(strength.map((s) => s.exerciseId))]
  const todayOf = (id: string) => strength.filter((s) => s.exerciseId === id)

  const records: string[] = []
  let trend: { text: string; gain: number } | null = null
  for (const id of ids) {
    const before = (past?.get(id) ?? []).filter((p) => p.performedOn < today)
    if (!before.some((p) => p.sets.some(working))) continue
    const old = exerciseRecords(before)
    const now = exerciseRecords([...before, { performedOn: today, sets: todayOf(id) }])
    if (now.heaviest && old.heaviest && now.heaviest.weightKg > old.heaviest.weightKg)
      records.push(`${nameOf(id)}: heaviest weight, ${weightText(now.heaviest.weightKg, unit)}.`)
    else if (now.bestE1rm && old.bestE1rm && now.bestE1rm.e1rm > old.bestE1rm.e1rm)
      records.push(`${nameOf(id)}: best one-rep max guess, ${weightText(now.bestE1rm.e1rm, unit)}.`)

    // Strength trend: today's best one-rep max guess against the oldest
    // workout in the last 8 weeks, at least 2 weeks back.
    const first = [...before].sort((a, b) => a.performedOn.localeCompare(b.performedOn)).find((p) => dayNum(today) - dayNum(p.performedOn) <= TREND_DAYS && bestE1rm(p.sets) > 0)
    const days = first ? dayNum(today) - dayNum(first.performedOn) : 0
    const from = first ? bestE1rm(first.sets) : 0
    const to = bestE1rm(todayOf(id))
    if (!first || days < MIN_TREND_DAYS || !to) continue
    const gain = (to - from) / from
    const change = round05(to - from)
    // A drop is not called steady; then no line is better than a wrong one.
    if ((change <= 0 && gain < -STEADY) || (trend && gain <= trend.gain)) continue
    const weeks = Math.round(days / 7)
    const text =
      change > 0
        ? `${nameOf(id)}: one-rep max guess up ${shownWeight(change, unit)} ${unit} in ${weeks} weeks.`
        : `${nameOf(id)}: strength held steady over ${weeks} weeks.`
    trend = { text, gain }
  }
  return { minutes: minutes !== null && minutes <= MAX_MINUTES ? minutes : null, sets: strength.length, liftedKg, records, trend: trend?.text ?? null }
}
