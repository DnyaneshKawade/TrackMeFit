// Builds our Indian food database: ingredient values from the USDA table and
// package labels, then every standard recipe computed from them.

import type { Per100g } from '../types'
import { computeRecipe, MissingIngredientsError, type RecipeResult } from '../recipe'
import { INGREDIENTS } from './ingredients'
import { RECIPES } from './recipes'
import { parseUsdaMacros, resolveIngredients, type Resolved } from './resolve'

export interface IndianDatabase {
  ingredients: Resolved['foods']
  unresolvedIngredients: Resolved['unresolved']
  dishes: RecipeResult[]
  /** Dishes that can't be computed yet, with the ingredients they wait on. */
  pendingDishes: { id: string; missing: string[] }[]
}

export function buildIndianDatabase(usdaCsv: string, labels: Record<string, Per100g> = {}): IndianDatabase {
  const { foods, unresolved } = resolveIngredients(INGREDIENTS, parseUsdaMacros(usdaCsv), labels)
  const dishes: RecipeResult[] = []
  const pendingDishes: IndianDatabase['pendingDishes'] = []
  for (const recipe of RECIPES) {
    try {
      const result = computeRecipe(recipe, (id) => foods.get(id))
      result.food.aliases = recipe.aliases
      dishes.push(result)
    } catch (e) {
      if (!(e instanceof MissingIngredientsError)) throw e
      pendingDishes.push({ id: recipe.id, missing: e.missing })
    }
  }
  return { ingredients: foods, unresolvedIngredients: unresolved, dishes, pendingDishes }
}
