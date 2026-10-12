// Recipe calculation: our own Indian dishes are computed from raw ingredients
// (the "recipe calculation method" used by food composition tables), so every
// number traces back to a public-domain ingredient value and a recipe we wrote.

import type { Food, Per100g, Portion } from './types'
import { energyMismatch } from './types'

export interface RecipeIngredient {
  /** Food id of a raw ingredient, e.g. "usda:172420" or "tmf:ing:toor-dal". */
  foodId: string
  /** Raw weight in grams as it goes into the pot. Water counts too (0 kcal). */
  grams: number
}

export interface Recipe {
  id: string
  name: string
  ingredients: RecipeIngredient[]
  /** Weight of the finished dish. If unknown, the raw total times yieldFactor. */
  cookedWeightG?: number
  /** Cooked weight / raw weight; 1 means no water lost. Used when cookedWeightG is missing. */
  yieldFactor?: number
  portions: Portion[]
  /** False until someone has cooked the recipe and weighed the result. */
  yieldVerified: boolean
}

export interface RecipeResult {
  food: Food
  rawWeightG: number
  cookedWeightG: number
  /** Relative gap between stated calories and macro calories (should be small). */
  energyMismatch: number
}

export class MissingIngredientsError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Missing ingredients: ${missing.join(', ')}`)
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Calories and macros per 100 g of the cooked dish. */
export function computeRecipe(recipe: Recipe, lookup: (id: string) => Food | undefined): RecipeResult {
  if (recipe.ingredients.length === 0) throw new Error(`${recipe.id} has no ingredients`)
  const missing = recipe.ingredients.map((i) => i.foodId).filter((id) => !lookup(id))
  if (missing.length) throw new MissingIngredientsError([...new Set(missing)])

  const total: Per100g = { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 }
  let rawWeightG = 0
  for (const ing of recipe.ingredients) {
    if (ing.grams <= 0) throw new Error(`${recipe.id}: ${ing.foodId} needs a positive weight`)
    const p = lookup(ing.foodId)!.per100g
    const k = ing.grams / 100
    total.kcal += p.kcal * k
    total.proteinG += p.proteinG * k
    total.carbG += p.carbG * k
    total.fatG += p.fatG * k
    rawWeightG += ing.grams
  }

  const cookedWeightG = recipe.cookedWeightG ?? rawWeightG * (recipe.yieldFactor ?? 1)
  if (cookedWeightG <= 0) throw new Error(`${recipe.id}: cooked weight must be positive`)
  const per = 100 / cookedWeightG
  const per100g: Per100g = {
    kcal: Math.round(total.kcal * per),
    proteinG: round1(total.proteinG * per),
    carbG: round1(total.carbG * per),
    fatG: round1(total.fatG * per),
  }

  return {
    food: {
      id: recipe.id,
      name: recipe.name,
      state: 'cooked',
      per100g,
      portions: recipe.portions,
      source: 'trackMeFit',
      sourceId: recipe.id,
    },
    rawWeightG,
    cookedWeightG: Math.round(cookedWeightG),
    energyMismatch: energyMismatch(per100g),
  }
}

/** For people who weigh raw and cook in a batch: how much raw food is in the
 * cooked portion on the plate. E.g. 200 g raw rice cooked to 560 g; a 280 g
 * plate holds 100 g raw rice. */
export function rawEquivalent(platedCookedG: number, batchRawG: number, batchCookedG: number): number {
  if (batchCookedG <= 0 || batchRawG <= 0) throw new Error('Batch weights must be positive')
  return Math.round((platedCookedG * batchRawG) / batchCookedG)
}
