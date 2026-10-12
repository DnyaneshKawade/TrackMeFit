// All Track Me Fit standard Indian recipes. Typical home-style amounts,
// written by us. Cooked weights are first estimates (yieldVerified: false)
// until someone cooks the dish and weighs the pot; small amounts of spices,
// salt and herbs are left out because they add almost no calories.

import type { IndianRecipe } from './define'
import { RECIPES_CORE } from './recipes/core'
import { RECIPES_NORTH } from './recipes/north'
import { RECIPES_SOUTH } from './recipes/south'
import { RECIPES_WESTEAST } from './recipes/westeast'
import { RECIPES_SNACKS } from './recipes/snacks'
import { RECIPES_NONVEG_SWEETS } from './recipes/nonveg-sweets'

export type { IndianRecipe } from './define'

export const RECIPES: IndianRecipe[] = [
  ...RECIPES_CORE,
  ...RECIPES_NORTH,
  ...RECIPES_SOUTH,
  ...RECIPES_WESTEAST,
  ...RECIPES_SNACKS,
  ...RECIPES_NONVEG_SWEETS,
]
