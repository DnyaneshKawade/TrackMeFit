import { describe, expect, it } from 'vitest'
import usdaCsv from '../../../data/usda/sr_legacy_macros.csv?raw'
import { parseUsdaMacros } from './resolve'
import { RAW_FOODS } from './raw-foods'

// Runs against the real USDA SR Legacy table in data/usda/.
const usdaIds = new Set(parseUsdaMacros(usdaCsv).map((r) => r.fdcId))

describe('raw foods picked from USDA SR Legacy', () => {
  it('has at least 1,000 foods', () => {
    expect(RAW_FOODS.length).toBeGreaterThanOrEqual(1000)
  })

  it('points every food at a row in the USDA table', () => {
    const missing = RAW_FOODS.filter((f) => !usdaIds.has(String(f.fdcId))).map((f) => `${f.fdcId} ${f.name}`)
    expect(missing).toEqual([])
  })

  it('uses each USDA row once', () => {
    const seen = new Set<number>()
    const dupes = RAW_FOODS.filter((f) => seen.size === seen.add(f.fdcId).size).map((f) => `${f.fdcId} ${f.name}`)
    expect(dupes).toEqual([])
  })

  it('has unique names', () => {
    const seen = new Set<string>()
    const dupes = RAW_FOODS.filter((f) => seen.size === seen.add(f.name.toLowerCase()).size).map((f) => f.name)
    expect(dupes).toEqual([])
  })

  it('gives every food at least one non-empty alias', () => {
    const bare = RAW_FOODS.filter((f) => f.aliases.length === 0 || f.aliases.some((a) => !a.trim())).map((f) => f.name)
    expect(bare).toEqual([])
  })
})
