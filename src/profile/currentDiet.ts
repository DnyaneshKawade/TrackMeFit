// A rough picture of what someone eats now, from counts of everyday Indian
// foods. Values per portion come from foods in our database (the test keeps
// them in step), so the estimate is only as rough as the counts. People can
// add any other food from the database, or type in their own.

import { amountFor, type Food } from '../food/types'

export interface DietItem {
  /** Food id in the catalogue. */
  id: string
  label: string
  portion: string
  kcal: number
  proteinG: number
}

export const DIET_ITEMS: DietItem[] = [
  { id: 'tmf:dish:roti', label: 'Roti or chapati', portion: '1 roti', kcal: 102, proteinG: 4 },
  { id: 'tmf:dish:plain-paratha', label: 'Paratha', portion: '1 paratha', kcal: 240, proteinG: 6.6 },
  { id: 'tmf:dish:steamed-rice', label: 'Rice', portion: '1 katori', kcal: 183, proteinG: 3.6 },
  { id: 'tmf:dish:plain-dosa', label: 'Dosa, or 2 idlis', portion: '1 dosa', kcal: 179, proteinG: 4.7 },
  { id: 'tmf:dish:dal-tadka', label: 'Dal', portion: '1 katori', kcal: 111, proteinG: 5.6 },
  { id: 'tmf:dish:aloo-gobi', label: 'Sabzi', portion: '1 katori', kcal: 129, proteinG: 3.2 },
  { id: 'usda:170886', label: 'Curd (dahi)', portion: '1 katori', kcal: 95, proteinG: 7.9 },
  { id: 'tmf:dish:toned-milk', label: 'Milk', portion: '1 glass', kcal: 100, proteinG: 6.6 },
  { id: 'tmf:dish:chai', label: 'Tea or coffee with sugar', portion: '1 cup', kcal: 66, proteinG: 2.2 },
  { id: 'tmf:dish:boiled-egg', label: 'Eggs', portion: '1 egg', kcal: 72, proteinG: 6.3 },
  { id: 'tmf:dish:chicken-curry', label: 'Chicken, fish or mutton', portion: '1 katori', kcal: 173, proteinG: 19.7 },
  { id: 'usda:173944', label: 'Fruit', portion: '1 piece', kcal: 105, proteinG: 1.3 },
  { id: 'tmf:dish:samosa', label: 'Fried snacks', portion: '1 samosa or plate of pakoras', kcal: 311, proteinG: 4.7 },
  { id: 'tmf:dish:gulab-jamun-milk-powder', label: 'Sweets', portion: '1 piece', kcal: 139, proteinG: 3.2 },
]

/** Grams per portion for the items whose catalogue entry has no portion. */
export const PORTION_GRAMS: Record<string, number> = { 'usda:170886': 150, 'usda:173944': 118 }

/** A food added by the person beyond the list: any food from the database,
 * or their own entry with calories they type in. */
export interface DietExtra {
  /** Food id, or `custom:<n>` for their own entry. */
  id: string
  name: string
  portion: string
  /** Per portion. */
  kcal: number
  proteinG: number
  count: number
}

export interface CurrentDiet {
  counts: Record<string, number>
  extras?: DietExtra[]
  kcal: number
  proteinG: number
}

export const MAX_COUNT = 20
export const MAX_CUSTOM_KCAL = 5000

const clampCount = (n: number) => Math.min(MAX_COUNT, Math.max(0, Math.round(n || 0)))

/** An extra row for a food from the database, one usual portion (or 100 g). */
export function extraFromFood(food: Food): DietExtra {
  const portion = food.portions[0]
  const grams = portion?.grams ?? 100
  const a = amountFor(food, grams)
  const name = food.brand ? `${food.name}, ${food.brand}` : food.name
  return { id: food.id, name, portion: portion?.label ?? '100 g', kcal: a.kcal, proteinG: a.proteinG, count: 1 }
}

/** Checks a typed-in food. Returns an error message, or null when fine. */
export function checkCustom(name: string, kcal: string, protein: string): string | null {
  if (!name.trim()) return 'Say what the food is.'
  const k = Number(kcal)
  if (!kcal.trim() || !Number.isFinite(k) || k <= 0 || k > MAX_CUSTOM_KCAL) return `Calories should be between 1 and ${MAX_CUSTOM_KCAL}.`
  if (protein.trim()) {
    const p = Number(protein)
    if (!Number.isFinite(p) || p < 0 || p * 4 > k + 1) return 'Protein can’t give more calories than the food has.'
  }
  return null
}

/** Daily calories and protein for the counts and extras given. */
export function estimateDiet(counts: Record<string, number>, extras: DietExtra[] = []): CurrentDiet {
  let kcal = 0
  let protein = 0
  const kept: Record<string, number> = {}
  for (const item of DIET_ITEMS) {
    const n = clampCount(counts[item.id] ?? 0)
    if (!n) continue
    kept[item.id] = n
    kcal += n * item.kcal
    protein += n * item.proteinG
  }
  const keptExtras = extras.map((e) => ({ ...e, count: clampCount(e.count) })).filter((e) => e.count > 0)
  for (const e of keptExtras) {
    kcal += e.count * e.kcal
    protein += e.count * e.proteinG
  }
  const out: CurrentDiet = { counts: kept, kcal: Math.round(kcal / 10) * 10, proteinG: Math.round(protein) }
  if (keptExtras.length) out.extras = keptExtras
  return out
}

/** One plain sentence about the estimate, with protein per kg when the
 * weight is known. */
export function describeDiet(d: CurrentDiet, weightKg: number | null): string {
  if (!d.kcal) return 'Add what you eat on a usual day.'
  const perKg = weightKg ? d.proteinG / weightKg : null
  const base = `That’s about ${d.kcal.toLocaleString('en-IN')} kcal and ${d.proteinG} g protein a day.`
  if (perKg === null) return base
  const r = Math.round(perKg * 10) / 10
  if (perKg < 0.8) return `${base} Protein is low at ${r} g per kg of body weight; most people do better with 1.2 to 2.`
  if (perKg < 1.2) return `${base} Protein is ${r} g per kg; more would help you keep or build muscle.`
  return `${base} Protein is ${r} g per kg, a good amount.`
}
