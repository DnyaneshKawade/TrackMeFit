// The searchable food list: our Indian dishes, USDA raw foods with Indian
// names, and Indian packaged products from Open Food Facts. Pure: the caller
// passes in the data tables.

import type { Food } from './types'
import { buildIndianDatabase } from './indian/database'
import { RAW_FOODS } from './indian/raw-foods'
import { parseOffProducts } from './off'

export function buildCatalogue(usdaCsv: string, offCsv: string): Food[] {
  const db = buildIndianDatabase(usdaCsv)
  const foods: Food[] = db.dishes.map((d) => d.food)
  for (const raw of RAW_FOODS) {
    const usda = db.ingredients.get(`usda:${raw.fdcId}`)
    if (usda) foods.push({ ...usda, name: raw.name, aliases: raw.aliases })
  }
  foods.push(...parseOffProducts(offCsv))
  const seen = new Set<string>()
  return foods.filter((f) => !seen.has(f.id) && seen.add(f.id))
}
