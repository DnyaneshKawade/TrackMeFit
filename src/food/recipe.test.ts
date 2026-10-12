import { describe, expect, it } from 'vitest'
import { computeRecipe, MissingIngredientsError, rawEquivalent, type Recipe } from './recipe'
import type { Food } from './types'
import { INGREDIENTS, ingredientById } from './indian/ingredients'
import { RECIPES } from './indian/recipes'

// Round test numbers, not real food values.
const food = (id: string, kcal: number, proteinG: number, carbG: number, fatG: number): Food => ({
  id,
  name: id,
  state: 'raw',
  per100g: { kcal, proteinG, carbG, fatG },
  portions: [],
  source: 'usda',
})
const fixtures = new Map([
  ['dal', food('dal', 340, 20, 60, 2)],
  ['ghee', food('ghee', 900, 0, 0, 100)],
  ['water', food('water', 0, 0, 0, 0)],
])
const lookup = (id: string) => fixtures.get(id)

const dal: Recipe = {
  id: 'test:dal',
  name: 'Test dal',
  ingredients: [
    { foodId: 'dal', grams: 100 },
    { foodId: 'water', grams: 400 },
    { foodId: 'ghee', grams: 10 },
  ],
  cookedWeightG: 500,
  portions: [{ label: '1 katori', grams: 150 }],
  yieldVerified: true,
}

describe('computeRecipe', () => {
  it('divides the pot total by the cooked weight', () => {
    // Pot: 340 + 90 = 430 kcal, 20 g protein, 60 g carbs, 12 g fat in 500 g.
    const { food: f, rawWeightG, cookedWeightG } = computeRecipe(dal, lookup)
    expect(rawWeightG).toBe(510)
    expect(cookedWeightG).toBe(500)
    expect(f.per100g).toEqual({ kcal: 86, proteinG: 4, carbG: 12, fatG: 2.4 })
    expect(f.state).toBe('cooked')
    expect(f.source).toBe('trackMeFit')
  })

  it('uses the yield factor when the cooked weight is unknown', () => {
    const { cookedWeightG, food: f } = computeRecipe({ ...dal, cookedWeightG: undefined, yieldFactor: 0.8 }, lookup)
    expect(cookedWeightG).toBe(408)
    expect(f.per100g.kcal).toBe(Math.round((430 * 100) / 408))
  })

  it('assumes no weight change without cooked weight or yield factor', () => {
    expect(computeRecipe({ ...dal, cookedWeightG: undefined }, lookup).cookedWeightG).toBe(510)
  })

  it('lists every missing ingredient once', () => {
    const bad = { ...dal, ingredients: [...dal.ingredients, { foodId: 'paneer', grams: 50 }, { foodId: 'paneer', grams: 5 }] }
    expect(() => computeRecipe(bad, lookup)).toThrow(MissingIngredientsError)
    try {
      computeRecipe(bad, lookup)
    } catch (e) {
      expect((e as MissingIngredientsError).missing).toEqual(['paneer'])
    }
  })

  it('rejects empty recipes and zero weights', () => {
    expect(() => computeRecipe({ ...dal, ingredients: [] }, lookup)).toThrow()
    expect(() => computeRecipe({ ...dal, ingredients: [{ foodId: 'dal', grams: 0 }] }, lookup)).toThrow()
    expect(() => computeRecipe({ ...dal, cookedWeightG: 0 }, lookup)).toThrow()
  })

  it('reports how well calories match the macros', () => {
    expect(computeRecipe(dal, lookup).energyMismatch).toBeLessThan(0.05)
  })
})

describe('rawEquivalent', () => {
  it('converts a cooked plate back to raw weight', () => {
    expect(rawEquivalent(280, 200, 560)).toBe(100)
    expect(rawEquivalent(150, 100, 620)).toBe(24)
  })

  it('rejects empty batches', () => {
    expect(() => rawEquivalent(100, 0, 300)).toThrow()
    expect(() => rawEquivalent(100, 100, 0)).toThrow()
  })
})

describe('Indian ingredient list', () => {
  it('has unique ids and USDA descriptions', () => {
    expect(new Set(INGREDIENTS.map((i) => i.id)).size).toBe(INGREDIENTS.length)
    const descriptions = INGREDIENTS.flatMap((i) => (i.values.kind === 'usda' ? [i.values.description] : []))
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it('gives every ingredient a search alias', () => {
    for (const i of INGREDIENTS) expect(i.aliases.length, i.id).toBeGreaterThan(0)
  })
})

describe('Indian standard recipes', () => {
  it('has unique ids', () => {
    expect(new Set(RECIPES.map((r) => r.id)).size).toBe(RECIPES.length)
  })

  it('uses only known ingredients with positive weights', () => {
    for (const r of RECIPES) {
      for (const i of r.ingredients) {
        // usda:<fdc_id> ingredients are checked against the USDA table in database.test.ts
        if (!i.foodId.startsWith('usda:')) expect(ingredientById.has(i.foodId), `${r.id}: ${i.foodId}`).toBe(true)
        expect(i.grams, `${r.id}: ${i.foodId}`).toBeGreaterThan(0)
      }
    }
  })

  it('has cooked weights between 60% and 105% of the raw weight', () => {
    for (const r of RECIPES) {
      const raw = r.ingredients.reduce((s, i) => s + i.grams, 0)
      const ratio = r.cookedWeightG! / raw
      expect(ratio, r.id).toBeGreaterThanOrEqual(0.6)
      expect(ratio, r.id).toBeLessThanOrEqual(1.05)
    }
  })

  it('gives every dish a portion and a search alias', () => {
    for (const r of RECIPES) {
      expect(r.portions.length, r.id).toBeGreaterThan(0)
      for (const p of r.portions) expect(p.grams, r.id).toBeGreaterThan(0)
      expect(r.aliases.length, r.id).toBeGreaterThan(0)
    }
  })
})
