// Gym weights in kg or lb (spec T-101). Pure functions, no I/O. Weights are
// always saved in kg; lb is only how they are shown and typed.

export type WeightUnit = 'kg' | 'lb'

export const LB_PER_KG = 2.20462

/** A saved kg weight in the person's unit: kg as it is, lb to the nearest 0.5. */
export function shownWeight(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? Math.round(kg * 100) / 100 : Math.round(kg * LB_PER_KG * 2) / 2
}

/** "52.5 kg" or "115 lb". */
export const weightText = (kg: number, unit: WeightUnit) => `${shownWeight(kg, unit)} ${unit}`

/** A typed weight back to kg for saving. */
export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : Math.round((value / LB_PER_KG) * 1000) / 1000
}

/** The + and − step: the exercise's kg step, or double it in lb (2.5 kg is about 5 lb). */
export const stepIn = (incrementKg: number, unit: WeightUnit) => (unit === 'kg' ? incrementKg : incrementKg * 2)
