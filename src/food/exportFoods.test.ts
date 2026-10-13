import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildCatalogue } from './catalogue'
import { fromRow, splitBySource, toCsv, toRow } from './foodRows'

// The CSVs DK imports into Supabase (T-038) must match the bundled list.
// If this fails, run `npm run export-foods` and commit the files.
describe('food export (T-038)', () => {
  const parts = splitBySource(buildCatalogue(readFileSync('data/usda/sr_legacy_macros.csv', 'utf8'), readFileSync('data/off/india_products.csv', 'utf8')))

  it('foods.csv matches the bundled list, with no Open Food Facts rows', () => {
    expect(readFileSync('data/export/foods.csv', 'utf8')).toBe(toCsv(parts.foods))
    expect(parts.foods.some((f) => f.source === 'openFoodFacts')).toBe(false)
  })

  it('off_products.csv holds only Open Food Facts rows', () => {
    expect(readFileSync('data/export/off_products.csv', 'utf8')).toBe(toCsv(parts.off))
    expect(parts.off.every((f) => f.source === 'openFoodFacts')).toBe(true)
  })
})

describe('foods without portions (fix)', () => {
  const plain = { id: 'usda:1', name: 'Arrowroot flour', state: 'raw', per100g: { kcal: 357, proteinG: 0.3, carbG: 88, fatG: 0.1 }, portions: [], source: 'usda' } as const

  it('writes no portions as a JSON [] so the database stores an array', () => {
    const line = toCsv([{ ...plain, portions: [] }]).split('\n')[1]
    expect(line).toContain(',raw,357,0.3,88,0.1,[],{},')
  })

  it('reads a row stored with {} portions as having none, instead of crashing the amount screen', () => {
    const row = { ...toRow({ ...plain, portions: [] }), portions: {} as never }
    expect(fromRow(row).portions).toEqual([])
  })
})
