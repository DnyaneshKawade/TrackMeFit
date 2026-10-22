// Catch up to Steady (spec T-059c): once someone gaining on Catch up reaches
// a healthy trend weight, suggest Steady. Pure, and kept apart from the
// onboarding code so the Progress tab stays small.

import { gainLadder, surplusKcal } from '../engine/diet'
import { carbsFromRest, type TargetValues } from '../targets/types'
import type { ProfileInfo } from './types'

/** Indian adult cut-offs: normal is 18.5 to 22.9. */
export const NORMAL_BMI = { min: 18.5, max: 22.9 }

const pctText = (r: number) => `${Number(Math.abs(r * 100).toFixed(3))} %`

/** A suggestion to move from Catch up to Steady once the trend reaches a
 * healthy weight (T-059c). Applied only when the person says yes. */
export interface PaceSwitch {
  rate: number
  healthyMinKg: number
  /** How much lower the daily calories go; 0 when they already match. */
  kcalLess: number
  /** The calorie target with the lower calories (carbs give way), when one is set. */
  target: TargetValues | null
  message: string
}

export function steadySwitch(p: ProfileInfo, trendKg: number | null, target: TargetValues | null): PaceSwitch | null {
  if (p.goal !== 'gain' || !p.experience || !p.heightCm || p.goalRate === null || trendKg === null) return null
  const [, steady, faster] = gainLadder(p.experience)
  // Catch up is the only gain pace above Faster.
  if (p.goalRate <= faster + 1e-9) return null
  const healthyMinKg = Math.ceil(NORMAL_BMI.min * (p.heightCm / 100) ** 2)
  if (trendKg < healthyMinKg) return null
  const kcalLess = Math.max(0, surplusKcal(p.goalRate, trendKg) - surplusKcal(steady, trendKg))
  const kg = Math.round(steady * trendKg * 100) / 100
  let next: TargetValues | null = null
  if (target) {
    const kcal = Math.max(0, target.kcal - kcalLess)
    next = { kcal, proteinG: target.proteinG, fatG: target.fatG, carbG: carbsFromRest(kcal, target.proteinG, target.fatG) }
  }
  const message =
    `Your average weight is ${trendKg} kg. That is a healthy weight for your height (from ${healthyMinKg} kg). You don’t need Catch up now. ` +
    `Steady gains ${pctText(steady)} of your weight a week (about ${kg} kg). More of what you add is muscle.` +
    (kcalLess ? ` That’s about ${kcalLess} calories a day less${next ? `: ${target!.kcal.toLocaleString('en-IN')} to ${next.kcal.toLocaleString('en-IN')} calories` : ''}.` : '')
  return { rate: steady, healthyMinKg, kcalLess, target: next, message }
}
