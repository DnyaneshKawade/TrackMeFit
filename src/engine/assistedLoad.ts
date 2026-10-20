// Next help for an assisted machine (spec T-117). Kept apart from the
// records code so the workout list loads less.

import { afterBreak, type LoadDecision } from './training'

export interface AssistedInput {
  /** Help used last time, kg. */
  help: number
  repsDone: number[]
  repRange: [number, number]
  increment: number
  /** Sessions in a row (including this one) with a set below the rep range. */
  missStreak: number
  daysOff?: number
}

/** Double progression in reverse: hit the top of the range, and the help
 * goes down. Missed twice, or back after a break, and the help goes up. */
export function assistedNext(i: AssistedInput): LoadDecision {
  const [lo, hi] = i.repRange
  const step = i.increment > 0 ? i.increment : 1
  const back = afterBreak(i.daysOff ?? 0)
  if (back) {
    const steps = back.cut >= 0.3 ? 3 : back.cut >= 0.2 ? 2 : 1
    return { weight: i.help + steps * step, targetReps: Math.min(hi, Math.max(lo, ...i.repsDone)), why: `You had ${Math.floor(i.daysOff!)} days off. So use a little more help today.` }
  }
  if (i.repsDone.length > 0 && i.repsDone.every((r) => r >= hi)) {
    if (i.help <= 0) return { weight: 0, targetReps: hi, why: 'You need no help now. Try the exercise without the machine.' }
    return { weight: Math.max(0, i.help - step), targetReps: lo, why: `Hit ${hi} reps on every set, so the help goes down.` }
  }
  if (i.missStreak >= 2) return { weight: i.help + step, targetReps: lo, why: 'Missed the target twice, so use a little more help.' }
  return { weight: i.help, targetReps: Math.min(hi, Math.max(0, ...i.repsDone) + 1), why: 'Same help; aim for one more rep.' }
}
