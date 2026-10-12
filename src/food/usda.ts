// Maps USDA FoodData Central records to our Food model.
// FDC data is public domain (CC0). The API key must stay on the server: FDC
// deactivates keys found in public code, so the browser never calls FDC
// directly.

import type { Food, Portion } from './types'

// FDC nutrient ids (with legacy nutrient numbers in comments).
const ENERGY_KCAL = 1008 // 208
const ENERGY_ATWATER_GENERAL = 2047 // 957, used by some Foundation foods
const ENERGY_ATWATER_SPECIFIC = 2048 // 958
const PROTEIN = 1003 // 203
const FAT = 1004 // 204
const CARBS = 1005 // 205

const NUMBER_TO_ID: Record<string, number> = {
  '208': ENERGY_KCAL,
  '957': ENERGY_ATWATER_GENERAL,
  '958': ENERGY_ATWATER_SPECIFIC,
  '203': PROTEIN,
  '204': FAT,
  '205': CARBS,
}

/** A nutrient as it appears in FDC search results. */
interface SearchNutrient {
  nutrientId?: number
  nutrientNumber?: string
  unitName?: string
  value?: number
}

/** A nutrient as it appears in FDC food-detail responses. */
interface DetailNutrient {
  nutrient?: { id?: number; number?: string; unitName?: string }
  amount?: number
}

interface FdcPortion {
  gramWeight?: number
  portionDescription?: string
  modifier?: string
  amount?: number
  measureUnit?: { name?: string }
}

export interface FdcFood {
  fdcId: number
  description: string
  dataType?: string
  brandOwner?: string
  brandName?: string
  gtinUpc?: string
  servingSize?: number
  servingSizeUnit?: string
  householdServingFullText?: string
  foodNutrients?: (SearchNutrient | DetailNutrient)[]
  foodPortions?: FdcPortion[]
}

interface Normalised {
  id: number
  unit: string
  value: number
}

function normalise(n: SearchNutrient | DetailNutrient): Normalised | null {
  if ('nutrient' in n && n.nutrient) {
    const id = n.nutrient.id ?? NUMBER_TO_ID[n.nutrient.number ?? '']
    if (id === undefined || n.amount === undefined) return null
    return { id, unit: (n.nutrient.unitName ?? '').toLowerCase(), value: n.amount }
  }
  const s = n as SearchNutrient
  const id = s.nutrientId ?? NUMBER_TO_ID[s.nutrientNumber ?? '']
  if (id === undefined || s.value === undefined) return null
  return { id, unit: (s.unitName ?? '').toLowerCase(), value: s.value }
}

function energyKcal(ns: Normalised[]): number | null {
  for (const id of [ENERGY_KCAL, ENERGY_ATWATER_SPECIFIC, ENERGY_ATWATER_GENERAL]) {
    const kcal = ns.find((n) => n.id === id && n.unit === 'kcal')
    if (kcal) return kcal.value
  }
  const kj = ns.find((n) => [ENERGY_KCAL, ENERGY_ATWATER_SPECIFIC, ENERGY_ATWATER_GENERAL].includes(n.id) && n.unit === 'kj')
  return kj ? kj.value / 4.184 : null
}

const grams = (ns: Normalised[], id: number) => ns.find((n) => n.id === id)?.value ?? 0

function portionsOf(f: FdcFood): Portion[] {
  const out: Portion[] = []
  for (const p of f.foodPortions ?? []) {
    if (!p.gramWeight) continue
    const unit = p.measureUnit?.name && p.measureUnit.name !== 'undetermined' ? p.measureUnit.name : ''
    const label = p.portionDescription || [p.amount ?? 1, unit, p.modifier].filter(Boolean).join(' ')
    out.push({ label: label.trim(), grams: p.gramWeight })
  }
  if (f.servingSize && f.servingSizeUnit?.toLowerCase() === 'g') {
    out.push({ label: f.householdServingFullText || '1 serving', grams: f.servingSize })
  }
  return out
}

/** Converts an FDC record (search or detail shape) to a Food. Returns null
 * when calories are missing, since the app cannot use such a record. Values
 * from FDC are per 100 g for all data types we use. */
export function fromFdc(f: FdcFood): Food | null {
  const ns = (f.foodNutrients ?? []).map(normalise).filter((n): n is Normalised => n !== null)
  const kcal = energyKcal(ns)
  if (kcal === null) return null
  const branded = f.dataType === 'Branded'
  const description = f.description.trim()
  return {
    id: `usda:${f.fdcId}`,
    name: description,
    brand: branded ? f.brandName || f.brandOwner : undefined,
    state: branded ? 'asSold' : /\braw\b/i.test(description) ? 'raw' : /\b(cooked|boiled|baked|fried|roasted|steamed)\b/i.test(description) ? 'cooked' : 'asSold',
    per100g: {
      kcal: Math.round(kcal),
      proteinG: grams(ns, PROTEIN),
      carbG: grams(ns, CARBS),
      fatG: grams(ns, FAT),
    },
    portions: portionsOf(f),
    source: 'usda',
    sourceId: String(f.fdcId),
    barcode: f.gtinUpc,
  }
}
