// Extra catalogue ingredients needed by recipes/nonveg-sweets.ts.
// Only foods that are neither in USDA SR Legacy nor in ingredients.ts.

import { ingredient, label } from '../define'
import type { Ingredient } from '../ingredients'

export const INGREDIENTS_NONVEG_SWEETS: Ingredient[] = [
  ingredient('nonveg-sweets-gond', 'Edible gum (gond)', ['gond', 'dink', 'gaund', 'edible gum'],
    label('Not in USDA. Take values from an edible gum (gond) packet label.')),
]
