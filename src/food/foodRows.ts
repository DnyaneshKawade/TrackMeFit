// Foods as rows of the database tables `foods` and `off_products` (T-038),
// and back. The search columns use the same normalize as the app's own
// search, so the database and the bundled list rank alike.

import { normalize } from './search'
import type { DietTag, Food, FoodSource, FoodState, Portion } from './types'

export interface FoodRow {
  id: string
  name: string
  aliases: string[]
  brand: string | null
  source: FoodSource
  source_id: string | null
  barcode: string | null
  state: FoodState
  kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  portions: Portion[]
  tags: DietTag[]
  tags_guessed: boolean
  search_name: string
  search_aliases: string[]
  search_terms: string
}

export function toRow(f: Food): FoodRow {
  const searchAliases = (f.aliases ?? []).map(normalize).filter(Boolean)
  const searchName = normalize(f.name)
  return {
    id: f.id,
    name: f.name,
    aliases: f.aliases ?? [],
    brand: f.brand ?? null,
    source: f.source,
    source_id: f.sourceId ?? null,
    barcode: f.barcode ?? null,
    state: f.state,
    kcal: f.per100g.kcal,
    protein_g: f.per100g.proteinG,
    carb_g: f.per100g.carbG,
    fat_g: f.per100g.fatG,
    portions: f.portions,
    tags: f.tags ?? [],
    tags_guessed: !!f.tagsGuessed,
    search_name: searchName,
    search_aliases: searchAliases,
    search_terms: [searchName, ...searchAliases, normalize(f.brand ?? '')].filter(Boolean).join(' '),
  }
}

/** A row from the API back to the app's food. Numbers may arrive as strings. */
export function fromRow(r: FoodRow): Food {
  const food: Food = {
    id: r.id,
    name: r.name,
    state: r.state,
    per100g: { kcal: Number(r.kcal), proteinG: Number(r.protein_g), carbG: Number(r.carb_g), fatG: Number(r.fat_g) },
    // Rows imported before the {} fix carry an object here; treat it as none.
    portions: Array.isArray(r.portions) ? r.portions : [],
    source: r.source,
  }
  if (r.aliases?.length) food.aliases = r.aliases
  if (r.brand) food.brand = r.brand
  if (r.source_id) food.sourceId = r.source_id
  if (r.barcode) food.barcode = r.barcode
  if (r.tags?.length || r.tags_guessed) food.tags = r.tags ?? []
  if (r.tags_guessed) food.tagsGuessed = true
  return food
}

const COLUMNS: (keyof FoodRow)[] = [
  'id', 'name', 'aliases', 'brand', 'source', 'source_id', 'barcode', 'state', 'kcal', 'protein_g', 'carb_g', 'fat_g',
  'portions', 'tags', 'tags_guessed', 'search_name', 'search_aliases', 'search_terms',
]

// Postgres array literal: {"a","b"} with quotes and backslashes escaped.
const pgArray = (xs: string[]) => `{${xs.map((x) => `"${x.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`
// Text array columns; `portions` is jsonb and is always written as JSON, so
// a food without portions is [] and not {} (which the app can't read).
const TEXT_ARRAYS = new Set<keyof FoodRow>(['aliases', 'tags', 'search_aliases'])
const csvCell = (c: keyof FoodRow, v: unknown) => {
  const s = v === null ? '' : TEXT_ARRAYS.has(c) ? pgArray(v as string[]) : typeof v === 'object' ? JSON.stringify(v) : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV for the Supabase Table Editor import: one header line, one line per food. */
export function toCsv(foods: Food[]): string {
  const lines = [COLUMNS.join(',')]
  for (const f of foods) {
    const r = toRow(f)
    lines.push(COLUMNS.map((c) => csvCell(c, r[c])).join(','))
  }
  return lines.join('\n') + '\n'
}

/** Splits the catalogue: Open Food Facts (ODbL) goes to its own table. */
export const splitBySource = (foods: Food[]) => ({
  foods: foods.filter((f) => f.source !== 'openFoodFacts'),
  off: foods.filter((f) => f.source === 'openFoodFacts'),
})
