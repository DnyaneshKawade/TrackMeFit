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

  it('has calories that agree with the macros for every dish', () => {
    for (const d of db.dishes) expect(d.energyMismatch, d.food.id).toBeLessThan(0.1)
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
