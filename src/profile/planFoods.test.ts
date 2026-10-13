import { describe, expect, it } from 'vitest'
import usdaCsv from '../../data/usda/sr_legacy_macros.csv?raw'
import { buildIndianDatabase } from '../food/indian/database'
import { parseUsdaMacros } from '../food/indian/resolve'
import { tagsFromText } from '../food/dietTags'
import { ALL_DIET_ITEMS } from './currentDiet'
import { PLAN_FOODS, PROTEIN_PICKS, PLAN_FOODS_BY_ID, proteinPicksFor, typicalDayToBase } from './planFoods'
import { excludedTags } from './dietRules'

const db = buildIndianDatabase(usdaCsv)
const usda = new Map(parseUsdaMacros(usdaCsv).map((r) => [r.fdcId, r]))
// Stand-ins until packet labels arrive (T-031).
const STAND_INS: Record<string, string> = { 'tmf:ing:paneer': '172223', 'tmf:ing:soya-chunks': '174275', 'usda:173177': '173177' }

describe('plan foods', () => {
  it('match our ingredient database, or the named USDA stand-in', () => {
    for (const f of PLAN_FOODS) {
      const values = STAND_INS[f.id] ? usda.get(STAND_INS[f.id])!.per100g : db.ingredients.get(f.id)?.per100g
      expect(values, f.id).toBeTruthy()
      expect(f.per100g, f.id).toEqual(values)
      expect(!!f.standIn, f.id).toBe(!!STAND_INS[f.id])
    }
  })

  it('carry the tags their names imply, and sensible limits', () => {
    for (const f of PLAN_FOODS) {
      for (const t of tagsFromText(f.name)) expect(f.tags, f.name).toContain(t)
      expect(f.maxPerMealG, f.name).toBeLessThanOrEqual(f.maxPerDayG)
    }
    expect(PLAN_FOODS_BY_ID.get('tmf:ing:soya-chunks')!.maxPerDayG).toBe(50)
    expect(PLAN_FOODS_BY_ID.get('tmf:ing:rice')!.maxPerDayG).toBe(150)
  })

  it('offers protein choices the diet allows, in plain words', () => {
    expect(proteinPicksFor(excludedTags('veg')).map((p) => p.label)).not.toContain('Chicken')
    expect(proteinPicksFor(excludedTags('vegan')).map((p) => p.label)).toEqual(['Dal, chana and rajma', 'Soya chunks', 'Tofu', 'Peanuts'])
    expect(PROTEIN_PICKS.every((p) => p.foods.every((id) => PLAN_FOODS_BY_ID.has(id)))).toBe(true)
  })

  it('turns a typical day into raw foods', () => {
    expect(typicalDayToBase({ 'tmf:dish:roti': 4, 'tmf:dish:steamed-rice': 2, 'tmf:dish:dal-tadka': 2, 'tmf:dish:samosa': 1 })).toEqual([
      { foodId: 'tmf:ing:atta', grams: 120 },
      { foodId: 'tmf:ing:rice', grams: 100 },
      { foodId: 'tmf:ing:toor-dal', grams: 50 },
      { foodId: 'tmf:ing:ghee', grams: 6 },
    ])
    const mapped = new Set(['tmf:dish:samosa', 'tmf:dish:gulab-jamun-milk-powder'])
    for (const item of ALL_DIET_ITEMS) if (!mapped.has(item.id)) expect(typicalDayToBase({ [item.id]: 1 }).length, item.id).toBeGreaterThan(0)
  })
})
