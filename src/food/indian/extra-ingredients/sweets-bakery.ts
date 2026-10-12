// Extra catalogue ingredients needed by recipes/sweets-bakery.ts.

import type { Ingredient } from '../ingredients'
import { ingredient, label } from '../define'

export const INGREDIENTS_SWEETS_BAKERY: Ingredient[] = [
  ingredient('sweets-bakery-gulkand', 'Gulkand (rose petal preserve)', ['gulkand', 'gulkhand', 'rose petal jam', 'gul kand'],
    label('Not in USDA. Take values from a gulkand jar label.')),
  ingredient('sweets-bakery-nannari-syrup', 'Nannari syrup (sarsaparilla)', ['nannari', 'nannari sarbath syrup', 'sugandhi syrup', 'anantmool syrup'],
    label('Not in USDA. Take values from a nannari syrup bottle label.')),
  ingredient('sweets-bakery-bael-pulp', 'Bael fruit pulp', ['bael', 'bel', 'wood apple pulp', 'bilva', 'bel phal'],
    label('Not in USDA. Take values from a bael pulp pack label.')),
  ingredient('sweets-bakery-halim-seeds', 'Halim seeds (garden cress seeds)', ['aliv', 'halim', 'haleem seeds', 'garden cress seeds', 'chandrashoor', 'asaliya'],
    label('Not in USDA (only the leaves are). Take values from a halim seeds packet label.')),
]
