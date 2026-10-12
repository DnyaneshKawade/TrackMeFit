import { describe, expect, it } from 'vitest'
import usdaCsv from '../../../data/usda/sr_legacy_macros.csv?raw'
import { buildIndianDatabase } from './database'
import { amountFor } from '../types'
import { ingredientById } from './ingredients'

// Runs against the real USDA SR Legacy table in data/usda/.
const db = buildIndianDatabase(usdaCsv)
const dish = (key: string) => db.dishes.find((d) => d.food.id === `tmf:dish:${key}`)!

describe('Indian food database built from USDA', () => {
  it('matches every USDA ingredient; only label ingredients are left', () => {
    for (const u of db.unresolvedIngredients) expect(ingredientById.get(u.id)?.values.kind, u.id).toBe('label')
  })

  it('computes every dish except those waiting on label values', () => {
    for (const d of db.pendingDishes) {
      for (const id of d.missing) expect(ingredientById.get(id)?.values.kind, `${d.id}: ${id}`).toBe('label')
    }
    expect(db.pendingDishes.map((d) => d.id)).toContain('tmf:dish:paneer-bhurji')
    expect(db.dishes.length).toBeGreaterThanOrEqual(22)
  })

  it('finds every usda:<fdc_id> ingredient used by a recipe', () => {
    const missing = db.pendingDishes.flatMap((d) => d.missing).filter((id) => id.startsWith('usda:'))
    expect(missing).toEqual([])
  })

  // Dish calories are summed from USDA's measured energy, while protein x 4 +
  // carbs x 4 + fat x 9 overstates it for vegetables and fruit (USDA carbs
  // include fibre). So the check allows 20%, or 15 kcal per 100 g for light foods.
  it('has calories that roughly agree with the macros for every dish', () => {
    for (const d of db.dishes) {
      const gap = d.energyMismatch * d.food.per100g.kcal
      expect(d.energyMismatch < 0.2 || gap < 15, `${d.food.id}: ${d.energyMismatch.toFixed(2)}`).toBe(true)
    }
  })

  it('keeps every dish between 0 and 900 kcal per 100 g', () => {
    for (const d of db.dishes) {
      expect(d.food.per100g.kcal, d.food.id).toBeGreaterThanOrEqual(0)
      expect(d.food.per100g.kcal, d.food.id).toBeLessThanOrEqual(900)
    }
  })

  it('has more than 1,000 computed dishes', () => {
    expect(db.dishes.length).toBeGreaterThan(1000)
  })

  it('keeps USDA ids on ingredients for attribution', () => {
    expect(db.ingredients.get('tmf:ing:rice')).toMatchObject({ source: 'usda', sourceId: '169756' })
  })

  // Sense checks against well-known values, with generous ranges.
  it('gives sensible values for everyday foods', () => {
    expect(dish('steamed-rice').food.per100g.kcal).toBeGreaterThan(110)
    expect(dish('steamed-rice').food.per100g.kcal).toBeLessThan(135)
    const roti = amountFor(dish('roti').food, 40)
    expect(roti.kcal).toBeGreaterThan(90)
    expect(roti.kcal).toBeLessThan(115)
    const dal = amountFor(dish('dal-tadka').food, 150)
    expect(dal.proteinG).toBeGreaterThan(4)
    expect(dal.proteinG).toBeLessThan(8)
  })

  it('carries search aliases onto the dishes', () => {
    expect(dish('roti').food.aliases).toContain('chapati')
  })
})
