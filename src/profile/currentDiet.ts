// A rough picture of what someone eats now, from counts of everyday Indian
// foods. Values per portion come from foods in our database (the test keeps
// them in step), so the estimate is only as rough as the counts. People can
// add any other food from the database, or type in their own.

import { amountFor, type DietTag, type Food } from '../food/types'
import { allows } from './dietRules'

export interface DietItem {
  /** Food id in the catalogue. */
  id: string
  label: string
  portion: string
  /** Grams in one portion. */
  grams: number
  kcal: number
  proteinG: number
  /** What the everyday version of this food usually has that some diets
   * leave out. Set by hand: "Dal" means any dal, not only the recipe used
   * for its numbers, so ghee in that recipe does not hide dal from vegans. */
  tags: DietTag[]
  /** Shown instead when the person's diet leaves this one out. */
  alt?: DietItem
}

export const DIET_ITEMS: DietItem[] = [
  { id: 'tmf:dish:roti', label: 'Roti or chapati', portion: '1 roti', grams: 40, kcal: 102, proteinG: 4, tags: [] },
  { id: 'tmf:dish:plain-paratha', label: 'Paratha', portion: '1 paratha', grams: 75, kcal: 240, proteinG: 6.6, tags: [] },
  { id: 'tmf:dish:steamed-rice', label: 'Rice (cooked)', portion: '1 katori', grams: 150, kcal: 183, proteinG: 3.6, tags: [] },
  { id: 'tmf:dish:plain-dosa', label: 'Dosa, or 2 idlis', portion: '1 dosa', grams: 85, kcal: 179, proteinG: 4.7, tags: [] },
  {
    id: 'tmf:dish:dal-tadka', label: 'Dal', portion: '1 katori', grams: 150, kcal: 111, proteinG: 5.6, tags: ['onion_garlic'],
    alt: { id: 'tmf:dish:jain-dal-tadka', label: 'Dal (no onion or garlic)', portion: '1 katori', grams: 150, kcal: 111, proteinG: 5.6, tags: [] },
  },
  {
    id: 'tmf:dish:aloo-gobi', label: 'Sabzi', portion: '1 katori', grams: 150, kcal: 129, proteinG: 3.2, tags: ['root', 'onion_garlic'],
    alt: { id: 'tmf:dish:jain-mix-veg', label: 'Sabzi (no roots, onion or garlic)', portion: '1 katori', grams: 150, kcal: 108, proteinG: 3.6, tags: [] },
  },
  { id: 'usda:170886', label: 'Curd (dahi)', portion: '1 katori', grams: 150, kcal: 95, proteinG: 7.9, tags: ['dairy'] },
  { id: 'tmf:dish:toned-milk', label: 'Milk', portion: '1 glass', grams: 200, kcal: 100, proteinG: 6.6, tags: ['dairy'] },
  { id: 'tmf:dish:chai', label: 'Tea or coffee with milk and sugar', portion: '1 cup', grams: 120, kcal: 66, proteinG: 2.2, tags: ['dairy'] },
  { id: 'tmf:dish:boiled-egg', label: 'Eggs', portion: '1 egg', grams: 50, kcal: 72, proteinG: 6.3, tags: ['egg'] },
  { id: 'tmf:dish:chicken-curry', label: 'Chicken, fish or mutton', portion: '1 katori', grams: 150, kcal: 173, proteinG: 19.7, tags: ['meat', 'fish'] },
  { id: 'usda:173944', label: 'Fruit', portion: '1 piece', grams: 118, kcal: 105, proteinG: 1.3, tags: [] },
  { id: 'tmf:dish:samosa', label: 'Fried snacks', portion: '1 samosa or plate of pakoras', grams: 110, kcal: 311, proteinG: 4.7, tags: [] },
  { id: 'tmf:dish:gulab-jamun-milk-powder', label: 'Sweets', portion: '1 piece', grams: 40, kcal: 139, proteinG: 3.2, tags: ['dairy'] },
]

/** Every item, alternatives included, for adding up saved counts. */
export const ALL_DIET_ITEMS: DietItem[] = DIET_ITEMS.flatMap((i) => (i.alt ? [i, i.alt] : [i]))

/** The typical-day list for a diet: each item, its alternative when the item
 * is left out, or nothing when both are. */
export function dietItemsFor(excluded: Set<DietTag>): DietItem[] {
  const out: DietItem[] = []
  for (const item of DIET_ITEMS) {
    if (allows(excluded, item.tags)) out.push(item)
    else if (item.alt && allows(excluded, item.alt.tags)) out.push(item.alt)
  }
  return out
}

/** Extras the diet allows; a custom entry has no tags and always stays. */
export const allowedExtras = (extras: DietExtra[], excluded: Set<DietTag>) => extras.filter((e) => allows(excluded, e.tags))

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
  tags?: DietTag[]
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
  const e: DietExtra = { id: food.id, name, portion: portion?.label ?? '100 g', kcal: a.kcal, proteinG: a.proteinG, count: 1 }
  if (food.tags?.length) e.tags = food.tags
  return e
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

/** Daily calories and protein for the counts and extras given. Only counts
 * for `items` are kept, so items hidden by the diet drop out. */
export function estimateDiet(counts: Record<string, number>, extras: DietExtra[] = [], items: DietItem[] = ALL_DIET_ITEMS): CurrentDiet {
  let kcal = 0
  let protein = 0
  const kept: Record<string, number> = {}
  for (const item of items) {
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
  const base = `That’s about ${d.kcal.toLocaleString('en-IN')} calories and ${d.proteinG} g protein a day.`
  if (perKg === null) return base
  const r = Math.round(perKg * 10) / 10
  if (perKg < 0.8) return `${base} Protein is low at ${r} g per kg of body weight. Most people do better with 1.2 to 2 g.`
  if (perKg < 1.2) return `${base} Protein is ${r} g per kg. More would help you build muscle.`
  return `${base} Protein is ${r} g per kg, a good amount.`
}
