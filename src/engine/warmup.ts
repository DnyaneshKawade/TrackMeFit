// Warm-up sets (spec T-082c): lighter sets before the first working set,
// rounded to weights the gym has. Pure function, no I/O. Warm-ups are logged
// with the warm-up tag, so they never count as working sets.

import { platesFor } from './plates'

export interface WarmupInput {
  /** The first working set's weight, kg. */
  workingKg: number
  workingReps: number
  equipment: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'smith' | 'kettlebell'
  isolation: boolean
  /** An earlier exercise today already trained this muscle. */
  warm: boolean
  /** Smallest usual weight jump for this exercise, kg. */
  increment: number
  barKg?: number
}

export interface WarmupSet {
  weight: number
  reps: number
}

export interface WarmupPlan {
  sets: WarmupSet[]
  why: string
}

/** Steps as a share of the working weight, with reps; lighter first. */
const FULL: [number, number][] = [[0.5, 8], [0.7, 4], [0.85, 2]]

export function warmupSets(i: WarmupInput): WarmupPlan {
  const bar = i.barKg ?? 20
  const barbell = i.equipment === 'barbell' || i.equipment === 'smith'
  if (i.equipment === 'bodyweight' || !(i.workingKg > 0)) return { sets: [], why: '' }
  if (i.isolation && i.warm) return { sets: [], why: 'This muscle is already warm, so go straight to your working sets.' }

  let steps: [number, number][]
  let why: string
  if (i.isolation) {
    steps = [[0.5, 10]]
    why = 'One light set gets the muscle ready.'
  } else if (i.warm) {
    steps = [[0.7, 4]]
    why = 'This muscle is already warm, so one set is enough.'
  } else {
    // A heavy top set, 8 reps or fewer, gets one more step close to it.
    steps = i.workingReps <= 8 ? FULL : FULL.slice(0, 2)
    why = 'Build up in steps, so the heavy sets feel smooth and safe.'
  }

  const round = (kg: number) =>
    barbell ? platesFor(Math.max(kg, bar), bar).loaded : Math.max(i.increment, Math.floor(kg / i.increment + 1e-9) * i.increment)
  const sets: WarmupSet[] = []
  if (barbell && !i.isolation && !i.warm && i.workingKg >= bar + 2 * i.increment) sets.push({ weight: bar, reps: 10 })
  for (const [share, reps] of steps) {
    const weight = Math.round(round(i.workingKg * share) * 100) / 100
    const last = sets[sets.length - 1]
    // Skip a step too close to the last one or to the working weight.
    if (weight > i.workingKg - i.increment || (last && weight < last.weight + i.increment)) continue
    sets.push({ weight, reps })
  }
  return sets.length ? { sets, why } : { sets: [], why: 'The working weight is light, so no warm-up sets are needed.' }
}
