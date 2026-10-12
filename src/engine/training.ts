// Training engine: weekly sets per muscle, set distribution, effort targets,
// weight progression and deloads. Built on RP Strength's published principles
// (volume landmarks, mesocycles, deloads), adjusted for newer evidence:
// performance leads decisions, sets are counted fractionally, and sets per
// muscle per session are capped. Pure functions, no I/O.

export type Muscle =
  | 'chest' | 'back' | 'quads' | 'hamstrings' | 'glutes' | 'sideDelts'
  | 'rearDelts' | 'biceps' | 'triceps' | 'calves' | 'abs' | 'traps'

export type Experience = 'beginner' | 'intermediate' | 'advanced'

export interface Landmarks {
  mv: number
  mev: number
  mavLow: number
  mavHigh: number
  mrv: number
}

/** Population starting points, sets per week. Each user's own values are
 * learned over time. */
export const LANDMARKS: Record<Muscle, Landmarks> = {
  chest: { mv: 8, mev: 10, mavLow: 12, mavHigh: 20, mrv: 22 },
  back: { mv: 8, mev: 10, mavLow: 14, mavHigh: 22, mrv: 25 },
  quads: { mv: 6, mev: 8, mavLow: 12, mavHigh: 18, mrv: 20 },
  hamstrings: { mv: 4, mev: 6, mavLow: 10, mavHigh: 16, mrv: 20 },
  glutes: { mv: 0, mev: 0, mavLow: 4, mavHigh: 12, mrv: 16 },
  sideDelts: { mv: 6, mev: 8, mavLow: 16, mavHigh: 22, mrv: 26 },
  rearDelts: { mv: 0, mev: 6, mavLow: 12, mavHigh: 18, mrv: 22 },
  biceps: { mv: 4, mev: 6, mavLow: 14, mavHigh: 20, mrv: 26 },
  triceps: { mv: 4, mev: 6, mavLow: 10, mavHigh: 14, mrv: 18 },
  calves: { mv: 4, mev: 6, mavLow: 8, mavHigh: 16, mrv: 20 },
  abs: { mv: 0, mev: 0, mavLow: 10, mavHigh: 16, mrv: 20 },
  traps: { mv: 0, mev: 0, mavLow: 12, mavHigh: 20, mrv: 26 },
}

const EXPERIENCE_SCALE: Record<Experience, number> = { beginner: 0.6, intermediate: 1, advanced: 1.2 }

/** Week-1 sets for a muscle. Priority muscles start one MAV step higher. */
export function startingSets(muscle: Muscle, experience: Experience, priority = false, landmarks = LANDMARKS[muscle]): number {
  const base = priority ? landmarks.mavLow : landmarks.mev
  return Math.round(base * EXPERIENCE_SCALE[experience])
}

export type Performance = 'up' | 'same' | 'down'
export type Recovery = 'fresh' | 'bitSore' | 'verySore'
export type Effort = 'easy' | 'right' | 'hard'

export interface MuscleFeedback {
  /** Calculated from logs: reps or load at the same effort versus last time. */
  performance: Performance
  /** "Was this muscle still sore or tired from last time?" */
  recovery: Recovery
  /** "Easy, just right, or too hard?" */
  effort: Effort
  /** "Did anything hurt?" */
  pain: boolean
  /** Consecutive sessions (including this one) where performance went down. */
  downStreak: number
}

export interface SetDecision {
  sets: number
  change: number
  recoverySession: boolean
  swapExercise: boolean
  why: string
}

/** Next week's sets for one muscle. Performance leads; soreness is only a
 * recovery check, never a reason to add sets. */
export function nextWeekSets(current: number, f: MuscleFeedback, landmarks: Landmarks): SetDecision {
  let change = 0
  let recoverySession = false
  let swapExercise = false
  let why: string

  if (f.pain || f.recovery === 'verySore') {
    change = -2
    swapExercise = f.pain
    why = f.pain ? 'Something hurt, so we cut sets and suggest a different exercise.' : 'Still very sore from last time, so we cut back.'
  } else if (f.performance === 'down') {
    if (f.downStreak >= 2) {
      change = -2
      recoverySession = true
      why = 'Performance dropped two sessions running, so we cut sets and add an easier session.'
    } else {
      why = 'Performance dipped once; holding sets to see if it was a one-off.'
    }
  } else if (f.recovery === 'bitSore') {
    why = 'A bit sore going in, so sets stay the same.'
  } else if (f.performance === 'up' && f.effort === 'easy') {
    change = 2
    why = 'Getting stronger and it felt easy, so two more sets.'
  } else if (f.effort === 'hard') {
    why = 'It felt hard, so sets stay the same.'
  } else {
    change = 1
    why = f.performance === 'up' ? 'Getting stronger and recovering well, so one more set.' : 'Recovering well, so one more set.'
  }

  const sets = Math.max(Math.min(current, landmarks.mv), Math.min(landmarks.mrv, current + change))
  return { sets, change: sets - current, recoverySession, swapExercise, why }
}

/** Fractional volume: sets for a primary mover count 1, for a secondary mover 0.5. */
export interface ExerciseSets {
  primary: Muscle[]
  secondary?: Muscle[]
  sets: number
}
export function fractionalVolume(work: ExerciseSets[]): Partial<Record<Muscle, number>> {
  const out: Partial<Record<Muscle, number>> = {}
  for (const w of work) {
    for (const m of w.primary) out[m] = (out[m] ?? 0) + w.sets
    for (const m of w.secondary ?? []) out[m] = (out[m] ?? 0) + 0.5 * w.sets
  }
  return out
}

export const MAX_SETS_PER_SESSION = 10

/** Spread a muscle's weekly sets over its sessions as evenly as possible,
 * never more than the per-session cap. Returns sets per session; the total may
 * be below the weekly target when the cap binds, which tells the planner to add
 * a training day. */
export function distributeSets(weeklySets: number, sessions: number, cap = MAX_SETS_PER_SESSION): number[] {
  if (sessions <= 0) return []
  const base = Math.floor(weeklySets / sessions)
  const extra = weeklySets % sessions
  return Array.from({ length: sessions }, (_, i) => Math.min(cap, base + (i < extra ? 1 : 0)))
}

/** Target reps in reserve for a week of the block. Most sets stop 1-2 short of
 * failure; only safe isolation exercises reach failure in the last hard week. */
export function targetRir(week: number, hardWeeks: number, isolation: boolean, deload = false): number {
  if (deload) return 4
  const ramp = [3, 2, 1, 1]
  const idx = Math.round(((week - 1) / Math.max(1, hardWeeks - 1)) * (ramp.length - 1))
  const rir = ramp[Math.min(ramp.length - 1, Math.max(0, idx))]
  return isolation && week >= hardWeeks ? 0 : rir
}

/** Estimated one-rep max from a set, counting reps left in the tank (Epley). */
export function estimatedOneRepMax(weight: number, reps: number, rir = 0): number {
  return weight * (1 + (reps + rir) / 30)
}

export interface LoadInput {
  weight: number
  repsDone: number[]
  repRange: [number, number]
  /** Smallest available jump for this exercise (e.g. 2.5 kg plates, next dumbbell). */
  increment: number
  /** Sessions in a row (including this one) with a set below the rep range. */
  missStreak: number
}

export interface LoadDecision {
  weight: number
  targetReps: number
  why: string
}

const MAX_JUMP_FRACTION = 0.1

/** Double progression. Hit the top of the range on every set: add weight, or
 * reps if the next jump is too big. Missed the bottom twice: drop 5-10%. */
export function nextLoad(i: LoadInput): LoadDecision {
  const [lo, hi] = i.repRange
  const topOfRange = i.repsDone.length > 0 && i.repsDone.every((r) => r >= hi)
  if (topOfRange) {
    if (i.weight > 0 && i.increment / i.weight > MAX_JUMP_FRACTION) {
      return { weight: i.weight, targetReps: hi + 1, why: 'The next weight is a big jump, so add a rep to each set first.' }
    }
    return { weight: i.weight + i.increment, targetReps: lo, why: `Hit ${hi} reps on every set, so the weight goes up.` }
  }
  if (i.missStreak >= 2) {
    const dropped = Math.max(0, Math.floor((i.weight * 0.92) / i.increment) * i.increment)
    return { weight: dropped, targetReps: lo, why: 'Missed the target twice, so the weight comes down a little.' }
  }
  const best = Math.max(0, ...i.repsDone)
  return { weight: i.weight, targetReps: Math.min(hi, best + 1), why: 'Same weight; aim for one more rep.' }
}

export interface DeloadCheck {
  week: number
  plannedHardWeeks: number
  musclesDown: number
  musclesTrained: number
  userRunDown: boolean
}

/** Deload at the end of the block, or early when many muscles regress at once
 * or the user reports feeling run down. */
export function shouldDeload(c: DeloadCheck): boolean {
  if (c.week > c.plannedHardWeeks) return true
  if (c.userRunDown) return true
  return c.musclesTrained > 0 && c.musclesDown / c.musclesTrained >= 0.5
}

/** Deload week: half the sets (rounded up), week-1 weights, 4+ reps in reserve. */
export function deloadSets(sets: number): number {
  return Math.ceil(sets / 2)
}
