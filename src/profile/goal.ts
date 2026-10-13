// BMI and goal-weight helpers for onboarding. Pure; every result carries the
// sentence the screen shows.

import { bmi, defaultRate, indianBmiBand, type BmiBand } from '../engine/diet'
import { shiftDate } from '../log/types'
import type { Experience, GoalChoice } from './types'

/** Indian adult cut-offs: normal is 18.5 to 22.9. */
export const NORMAL_BMI = { min: 18.5, max: 22.9 }

const BAND_WORDS: Record<BmiBand, string> = {
  under: 'underweight',
  normal: 'in the healthy range',
  overweight: 'overweight',
  obese: 'in the obese range',
}

export interface BmiResult {
  value: number
  band: BmiBand
  /** Weights with a normal BMI at this height, in whole kg. */
  healthyMinKg: number
  healthyMaxKg: number
  message: string
}

export function bmiResult(weightKg: number, heightCm: number): BmiResult {
  const value = Math.round(bmi(weightKg, heightCm) * 10) / 10
  const band = indianBmiBand(value)
  const m2 = (heightCm / 100) ** 2
  const healthyMinKg = Math.ceil(NORMAL_BMI.min * m2)
  const healthyMaxKg = Math.floor(NORMAL_BMI.max * m2)
  const message =
    `Your BMI is ${value}, ${BAND_WORDS[band]} for Indian adults. ` +
    `At your height that range is ${healthyMinKg} to ${healthyMaxKg} kg. ` +
    'BMI can’t tell muscle from fat, so treat it as a rough guide.'
  return { value, band, healthyMinKg, healthyMaxKg, message }
}

/** Checks an optional target weight against the goal. Null when fine. */
export function checkTargetWeight(text: string, currentKg: number, goal: GoalChoice | null): string | null {
  if (!text.trim()) return null
  const t = Number(text)
  if (!Number.isFinite(t) || t < 20 || t > 350) return 'Target weight should be between 20 and 350 kg.'
  if (goal === 'lose' && t >= currentKg) return 'To lose fat, the target should be below your weight today.'
  if (goal === 'gain' && t <= currentKg) return 'To gain, the target should be above your weight today.'
  return null
}

export interface Timeline {
  weeks: number
  /** yyyy-mm-dd of the expected arrival. */
  byDate: string
  message: string
}

const ENGINE_GOAL = { lose: 'loseFat', gain: 'buildMuscle', maintain: 'maintain', recomp: 'maintain' } as const

/** How long reaching the target takes at the engine's default weekly rate.
 * Null for goals that don't aim to change weight. */
export function goalTimeline(
  currentKg: number,
  targetKg: number,
  goal: GoalChoice,
  experience: Experience,
  today: string,
): Timeline | null {
  const rate = defaultRate(ENGINE_GOAL[goal], experience)
  if (!rate) return null
  const perWeek = Math.abs(rate) * currentKg
  const weeks = Math.max(1, Math.ceil(Math.abs(targetKg - currentKg) / perWeek))
  const byDate = shiftDate(today, weeks * 7)
  const month = new Date(byDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const pace = Math.round(perWeek * 100) / 100
  const message = `At about ${pace} kg a week, a pace that protects muscle, you’d get there in around ${weeks} weeks (${month}).`
  return { weeks, byDate, message }
}
