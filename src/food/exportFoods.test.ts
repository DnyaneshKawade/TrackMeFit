import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildCatalogue } from './catalogue'
import { splitBySource, toCsv } from './foodRows'

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
