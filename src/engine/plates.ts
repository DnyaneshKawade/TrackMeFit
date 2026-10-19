// Plate calculator (spec T-044): which plates go on each side of the bar.
// Pure function, no I/O. Uses the plates most Indian gyms have, or the usual
// lb plates for people who lift in lb (T-101).

import type { WeightUnit } from './units'

export const INDIAN_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]
export const BARS = [20, 15, 10]
export const LB_PLATES = [45, 35, 25, 10, 5, 2.5]
export const LB_BARS = [45, 35, 25]

/** The plates and bars for a unit. */
export const gymFor = (unit: WeightUnit) => (unit === 'lb' ? { plates: LB_PLATES, bars: LB_BARS } : { plates: INDIAN_PLATES, bars: BARS })

export interface PlateLoad {
  /** Plates for one side, heaviest first. */
  perSide: number[]
  /** The weight this loads, bar included. */
  loaded: number
  exact: boolean
  /** Plain words for the person; empty when the weight loads exactly. */
  reason: string
}

const fmt = (n: number) => String(Math.round(n * 100) / 100)

/** Largest plates first. A weight that can't be made rounds down, never up.
 * Weights, bar and plates are all in `unit`. */
export function platesFor(targetKg: number, barKg = 20, plates = INDIAN_PLATES, unit: WeightUnit = 'kg'): PlateLoad {
  if (!(targetKg > 0)) return { perSide: [], loaded: barKg, exact: false, reason: 'Enter a weight.' }
  if (targetKg < barKg) return { perSide: [], loaded: barKg, exact: false, reason: `The bar alone weighs ${fmt(barKg)} ${unit}.` }
  // Work in hundredths of a kg so 1.25 kg plates add up without rounding errors.
  let left = Math.floor(((targetKg - barKg) / 2) * 100 + 1e-6)
  const perSide: number[] = []
  for (const p of [...plates].sort((a, b) => b - a)) {
    const size = Math.round(p * 100)
    while (left >= size && perSide.length < 20) {
      perSide.push(p)
      left -= size
    }
  }
  const loaded = barKg + 2 * perSide.reduce((s, p) => s + p, 0)
  const exact = Math.abs(loaded - targetKg) < 1e-6
  return { perSide, loaded, exact, reason: exact ? '' : `${fmt(targetKg)} ${unit} can’t be loaded exactly. The closest lower weight is ${fmt(loaded)} ${unit}.` }
}

/** "20 + 5 + 1.25 kg", or "No plates" for the bar alone. */
export const describePlates = (perSide: number[], unit: WeightUnit = 'kg') => (perSide.length ? `${perSide.map(fmt).join(' + ')} ${unit}` : 'No plates')
