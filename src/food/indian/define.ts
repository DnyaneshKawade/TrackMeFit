// Shared helpers for writing Indian ingredients and recipes.

import type { Portion } from '../types'
import type { Recipe, RecipeIngredient } from '../recipe'
import type { Ingredient, ValueSource } from './ingredients'

export interface IndianRecipe extends Recipe {
  aliases: string[]
}

/** Standard Indian portions, in grams of the cooked dish. */
export const KATORI: Portion = { label: '1 katori (150 g)', grams: 150 }
export const PLATE: Portion = { label: '1 plate (250 g)', grams: 250 }
export const GLASS: Portion = { label: '1 glass (200 ml)', grams: 200 }
export const CUP: Portion = { label: '1 cup (120 ml)', grams: 120 }
export const piece = (label: string, grams: number): Portion => ({ label, grams })

/** An ingredient from our catalogue (ingredients.ts or extra-ingredients/). */
export const ing = (key: string, grams: number): RecipeIngredient => ({ foodId: `tmf:ing:${key}`, grams })

/** Any USDA SR Legacy food by its fdc_id (see data/usda/sr_legacy_macros.csv). */
export const usdaIng = (fdcId: number, grams: number): RecipeIngredient => ({ foodId: `usda:${fdcId}`, grams })

export const r = (
  key: string,
  name: string,
  aliases: string[],
  ingredients: RecipeIngredient[],
  cookedWeightG: number,
  portions: Portion[],
): IndianRecipe => ({
  id: `tmf:dish:${key}`,
  name,
  aliases,
  ingredients,
  cookedWeightG,
  portions,
  yieldVerified: false,
})

export const usda = (description: string): ValueSource => ({ kind: 'usda', description })
export const label = (note: string): ValueSource => ({ kind: 'label', note })

/** Catalogue entry; id becomes "tmf:ing:<key>". */
export const ingredient = (key: string, name: string, aliases: string[], values: ValueSource): Ingredient => ({
  id: `tmf:ing:${key}`,
  name,
  aliases,
  values,
})
