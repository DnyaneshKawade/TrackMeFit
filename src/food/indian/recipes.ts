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
import { RECIPES_RESTAURANT } from './recipes/restaurant'
import { RECIPES_SOUTH2 } from './recipes/south2'
import { RECIPES_NONVEG2 } from './recipes/nonveg2'
import { RECIPES_SWEETS_BAKERY } from './recipes/sweets-bakery'
import { RECIPES_THALI_DIET } from './recipes/thali-diet'
import { RECIPES_REGIONAL2 } from './recipes/regional2'

export type { IndianRecipe } from './define'

export const RECIPES: IndianRecipe[] = [
  ...RECIPES_CORE,
  ...RECIPES_NORTH,
  ...RECIPES_SOUTH,
  ...RECIPES_WESTEAST,
  ...RECIPES_SNACKS,
  ...RECIPES_NONVEG_SWEETS,
  ...RECIPES_RESTAURANT,
  ...RECIPES_SOUTH2,
  ...RECIPES_NONVEG2,
  ...RECIPES_SWEETS_BAKERY,
  ...RECIPES_THALI_DIET,
  ...RECIPES_REGIONAL2,
]
