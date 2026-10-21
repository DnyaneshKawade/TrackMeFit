// Exercise goals (spec T-119), like "100 kg squat". Pure functions, no I/O.

import { startOf } from './myo'
import { e1rm, type Lift, type StrengthSession } from './strength'
import { weightText, type WeightUnit } from './units'

export interface Goal {
  kg: number
  reps: number
}

export interface GoalProgress {
  /** Heaviest working set with at least the goal's reps. */
  best: Lift | null
  /** The first set that met the goal, if any. */
  reached: Lift | null
  /** How far the best is towards the goal weight, 0 to 100. */
  percent: number
  /** Plain words for the person. */
  text: string
}

const goalText = (g: Goal, unit: WeightUnit) => `${weightText(g.kg, unit)} × ${g.reps}`

export function goalProgress(sessions: StrengthSession[], goal: Goal, unit: WeightUnit = 'kg'): GoalProgress {
  let best: Lift | null = null
  let reached: Lift | null = null
  for (const s of [...sessions].sort((a, b) => a.performedOn.localeCompare(b.performedOn)))
    for (const raw of s.sets) {
      const x = startOf(raw)
      if (x.tag === 'warmup' || x.tag === 'drop' || x.reps < goal.reps) continue
      const lift = { weightKg: x.weightKg, reps: x.reps, performedOn: s.performedOn }
      if (!best || x.weightKg > best.weightKg) best = lift
      if (!reached && x.weightKg >= goal.kg) reached = lift
    }
  const percent = best ? Math.min(100, Math.round((best.weightKg / goal.kg) * 100)) : 0
  const text = reached
    ? `Goal reached: ${goalText(goal, unit)}. Time to set a new one.`
    : best
      ? `Goal: ${goalText(goal, unit)}. Your best is ${weightText(best.weightKg, unit)} × ${best.reps}, ${percent}% of the way.`
      : `Goal: ${goalText(goal, unit)}. Do a set of ${goal.reps} or more reps to see your progress.`
  return { best, reached, percent, text }
}

/** Where the goal sits on a graph: the weight on "heaviest", the one-rep
 * max guess on "e1rm". Null for graphs the goal doesn't fit. */
export function goalLine(goal: Goal, kind: string): number | null {
  if (kind === 'heaviest') return goal.kg
  if (kind === 'e1rm') return Math.round((e1rm(goal.kg, goal.reps) ?? goal.kg) * 2) / 2
  return null
}
