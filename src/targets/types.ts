// Calorie and macro targets. Set by hand by the person or their coach; newer
// targets take over from their start date, and old ones stay as history.

import type { Per100g } from '../food/types'

export interface TargetValues {
  kcal: number
  proteinG: number
  carbG: number
  fatG: number
}

export interface DietTarget extends TargetValues {
  id: string
  /** Local date, YYYY-MM-DD. */
  startsOn: string
  source: 'manual' | 'suggested'
  setBy: string
}

export interface TargetStore {
  /** The target in force on a date, or null if none has been set. */
  forDate(date: string): Promise<DietTarget | null>
  /** `suggested` marks targets the engine proposed and the person accepted. */
  save(values: TargetValues, startsOn: string, source?: DietTarget['source']): Promise<DietTarget>
}

export const LIMITS: Record<keyof TargetValues, [number, number]> = {
  kcal: [800, 6000],
  proteinG: [0, 400],
  carbG: [0, 800],
  fatG: [0, 300],
}

const NAMES: Record<keyof TargetValues, string> = { kcal: 'Calories', proteinG: 'Protein', carbG: 'Carbs', fatG: 'Fat' }

/** Field errors in plain words; empty when the values can be saved. */
export function checkTarget(v: Partial<Record<keyof TargetValues, number>>): Partial<Record<keyof TargetValues, string>> {
  const errors: Partial<Record<keyof TargetValues, string>> = {}
  for (const key of Object.keys(LIMITS) as (keyof TargetValues)[]) {
    const [min, max] = LIMITS[key]
    const n = v[key]
    if (n === undefined || Number.isNaN(n)) errors[key] = `Enter ${NAMES[key].toLowerCase()}.`
    else if (!Number.isInteger(n)) errors[key] = 'Use a whole number.'
    else if (n < min || n > max) errors[key] = `${NAMES[key]} must be between ${min} and ${max}.`
  }
  return errors
}

export const macroKcal = (v: Omit<TargetValues, 'kcal'>) => v.proteinG * 4 + v.carbG * 4 + v.fatG * 9

/** A note when the macros don't add up to the calorie target (more than 5% off). */
export function macroMismatch(v: TargetValues): string | null {
  const fromMacros = macroKcal(v)
  const gap = fromMacros - v.kcal
  if (Math.abs(gap) <= v.kcal * 0.05) return null
  return `Your protein, carbs and fat add up to ${fromMacros} kcal, ${Math.abs(gap)} ${gap > 0 ? 'more' : 'less'} than your calorie target.`
}

/** Carbs that fill the calories left after protein and fat. */
export function carbsFromRest(kcal: number, proteinG: number, fatG: number): number {
  return Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4))
}

/** Newest target starting on or before the date. Ties go to the later one in the list. */
export function targetOn<T extends { startsOn: string }>(targets: T[], date: string): T | null {
  let best: T | null = null
  for (const t of targets) if (t.startsOn <= date && (!best || t.startsOn >= best.startsOn)) best = t
  return best
}

/** What is left for the day; negative when over. */
export function remaining(target: TargetValues, eaten: Per100g): TargetValues {
  const r1 = (n: number) => Math.round(n * 10) / 10
  return {
    kcal: Math.round(target.kcal - eaten.kcal),
    proteinG: r1(target.proteinG - eaten.proteinG),
    carbG: r1(target.carbG - eaten.carbG),
    fatG: r1(target.fatG - eaten.fatG),
  }
}
