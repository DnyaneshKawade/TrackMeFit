// Turns the USDA SR Legacy macros table (data/usda/sr_legacy_macros.csv, made
// by scripts/usda/extract_macros.py) plus package-label values into Food
// records for our ingredients, so recipes can be computed.

import type { Food, Per100g } from '../types'
import type { Ingredient } from './ingredients'

export interface UsdaRow {
  fdcId: string
  description: string
  per100g: Per100g
}

/** Splits one CSV line, handling quoted fields with commas and "" escapes. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') quoted = false
      else cur += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  out.push(cur)
  return out
}

export function parseUsdaMacros(csv: string): UsdaRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim())
  const header = splitCsvLine(lines[0])
  const col = (name: string) => {
    const i = header.indexOf(name)
    if (i < 0) throw new Error(`USDA table is missing column ${name}`)
    return i
  }
  const [id, desc, kcal, p, c, f] = ['fdc_id', 'description', 'kcal', 'protein_g', 'carb_g', 'fat_g'].map(col)
  return lines.slice(1).map((line) => {
    const v = splitCsvLine(line)
    return {
      fdcId: v[id],
      description: v[desc],
      per100g: { kcal: Number(v[kcal]), proteinG: Number(v[p]), carbG: Number(v[c]), fatG: Number(v[f]) },
    }
  })
}

export interface Resolved {
  foods: Map<string, Food>
  /** Ingredients with no value yet, and why. */
  unresolved: { id: string; reason: string }[]
}

/** Matches each ingredient to its exact USDA description, or to label values
 * entered by hand (keyed by ingredient id). */
export function resolveIngredients(
  ingredients: Ingredient[],
  usda: UsdaRow[],
  labels: Record<string, Per100g> = {},
): Resolved {
  const byDescription = new Map(usda.map((r) => [r.description, r]))
  const foods = new Map<string, Food>()
  const unresolved: Resolved['unresolved'] = []
  for (const ing of ingredients) {
    const base = { id: ing.id, name: ing.name, state: 'raw' as const, portions: [] }
    const v = ing.values
    if (v.kind === 'fixed') {
      foods.set(ing.id, { ...base, per100g: v.per100g, source: 'trackMeFit' })
    } else if (v.kind === 'usda') {
      const row = byDescription.get(v.description)
      if (row) foods.set(ing.id, { ...base, per100g: row.per100g, source: 'usda', sourceId: row.fdcId })
      else unresolved.push({ id: ing.id, reason: `No USDA record named "${v.description}"` })
    } else if (labels[ing.id] ?? v.per100g) {
      foods.set(ing.id, { ...base, per100g: labels[ing.id] ?? v.per100g!, source: 'trackMeFit', sourceId: 'label' })
    } else {
      unresolved.push({ id: ing.id, reason: v.note })
    }
  }
  return { foods, unresolved }
}
