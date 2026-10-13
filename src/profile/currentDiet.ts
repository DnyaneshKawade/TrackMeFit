// A rough picture of what someone eats now, from counts of everyday Indian
// foods. Values per portion come from foods in our database (the test keeps
// them in step), so the estimate is only as rough as the counts.

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

export interface CurrentDiet {
  counts: Record<string, number>
  kcal: number
  proteinG: number
}

export const MAX_COUNT = 20

/** Daily calories and protein for the counts given. */
export function estimateDiet(counts: Record<string, number>): CurrentDiet {
  let kcal = 0
  let protein = 0
  const kept: Record<string, number> = {}
  for (const item of DIET_ITEMS) {
    const n = Math.min(MAX_COUNT, Math.max(0, Math.round(counts[item.id] ?? 0)))
    if (!n) continue
    kept[item.id] = n
    kcal += n * item.kcal
    protein += n * item.proteinG
  }
  return { counts: kept, kcal: Math.round(kcal / 10) * 10, proteinG: Math.round(protein) }
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
