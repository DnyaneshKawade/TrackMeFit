// Plateau check for one exercise (spec T-082e). Pure functions, no I/O.
// No new best in 3 sessions in a row gives one of three choices, each with
// a plain reason. Thresholds follow Dr. Muscle and Stronglifts practice.

import { estimatedOneRepMax } from './training'

export interface PlateauSet {
  weightKg: number
  reps: number
  rir: number | null
}

/** Working sets only, newest session first. */
export interface PlateauSession {
  performedOn: string
  sets: PlateauSet[]
}

export interface PlateauInput {
  history: PlateauSession[]
  repRange: [number, number]
  increment: number
  /** This muscle's sets a week in the plan, and the low end of its best range. */
  weeklySets?: number
  mavLow?: number
  /** A similar exercise to try at the next block. */
  swapName?: string
  /** Today's date; a long gap since the last session is a break, not a plateau. */
  today?: string
}

export type PlateauAdvice =
  | { action: 'lighter'; weight: number; why: string }
  | { action: 'addSet'; why: string }
  | { action: 'swap'; why: string }

/** Sessions without a new best before it counts as a plateau. */
export const PLATEAU_SESSIONS = 3
/** A new best must beat the old one by at least 1%. */
const MIN_GAIN = 1.01
/** Sessions further apart than this don't count as "in a row". */
const MAX_GAP_DAYS = 10
/** The lighter session takes 10% off. */
const LIGHTER = 0.9
const REP_CAP = 12

const dayNumber = (d: string) => Date.parse(d + 'T00:00:00Z') / 86400000

/** Best estimated one-rep max in a session, using reps left. 0 when no set counts. */
export function sessionBest(sets: PlateauSet[]): number {
  let best = 0
  for (const s of sets) {
    if (s.weightKg <= 0 || s.reps < 1 || s.reps > REP_CAP) continue
    best = Math.max(best, estimatedOneRepMax(s.weightKg, s.reps, s.rir ?? 0))
  }
  return best
}

/** Null unless the last 3 sessions, about weekly, all failed to beat the best before them. */
export function plateauCheck(i: PlateauInput): PlateauAdvice | null {
  const h = i.history
  if (h.length <= PLATEAU_SESSIONS) return null
  if (i.today && dayNumber(i.today) - dayNumber(h[0].performedOn) > MAX_GAP_DAYS) return null
  for (let k = 0; k < PLATEAU_SESSIONS; k++) {
    if (dayNumber(h[k].performedOn) - dayNumber(h[k + 1].performedOn) > MAX_GAP_DAYS) return null
  }
  const bests = h.map((s) => sessionBest(s.sets))
  const before = Math.max(...bests.slice(PLATEAU_SESSIONS))
  const recent = bests.slice(0, PLATEAU_SESSIONS)
  if (before <= 0 || recent.some((b) => b <= 0 || b >= before * MIN_GAIN)) return null

  const lead = `No new best in ${PLATEAU_SESSIONS} sessions.`
  const last = h[0].sets
  if (last.some((s) => s.reps < i.repRange[0])) {
    const top = Math.max(...last.map((s) => s.weightKg))
    const step = i.increment > 0 ? i.increment : 1
    const weight = Math.round(Math.floor((top * LIGHTER) / step + 1e-9) * step * 100) / 100
    return { action: 'lighter', weight, why: `${lead} You also missed the target. So do one lighter session to recover.` }
  }
  if (i.weeklySets !== undefined && i.mavLow !== undefined && i.weeklySets < i.mavLow) {
    return { action: 'addSet', why: `${lead} This muscle gets ${i.weeklySets} sets a week. So add one set here.` }
  }
  const swap = i.swapName ? `try ${i.swapName} instead` : 'try a similar exercise instead'
  return { action: 'swap', why: `${lead} At your next block, ${swap}.` }
}
