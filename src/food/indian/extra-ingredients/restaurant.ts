// Extra catalogue ingredients needed by recipes/restaurant.ts.
// Only foods that are neither in USDA SR Legacy nor in another catalogue file.

import type { Ingredient } from '../ingredients'
import { ingredient, label } from '../define'

export const INGREDIENTS_RESTAURANT: Ingredient[] = [
  ingredient('restaurant-baby-corn', 'Baby corn, fresh', ['baby corn', 'babycorn', 'young corn'],
    label('Not in USDA (only mature sweet corn is). Take values from a fresh baby corn pack label.')),
  ingredient('restaurant-blue-curacao-syrup', 'Blue curacao syrup (non-alcoholic)', ['blue curacao', 'blue lagoon syrup'],
    label('Not in USDA. Take values from a non-alcoholic blue curacao mocktail syrup bottle label.')),
  ingredient('restaurant-hazelnut-syrup', 'Hazelnut coffee syrup', ['hazelnut syrup', 'coffee syrup hazelnut'],
    label('Not in USDA. Take values from a hazelnut flavoured coffee syrup bottle label.')),
]
