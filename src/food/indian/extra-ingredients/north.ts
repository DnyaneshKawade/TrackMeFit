// Extra catalogue ingredients needed by recipes/north.ts.
// Only foods that are neither in USDA SR Legacy nor in the base catalogue.

import type { Ingredient } from '../ingredients'
import { ingredient, label } from '../define'

export const INGREDIENTS_NORTH: Ingredient[] = [
  ingredient('north-tinda', 'Tinda (Indian round gourd)', ['tinda', 'tinde', 'round gourd', 'apple gourd'],
    label('Not in USDA. Take values from a tinda pack label.')),
  ingredient('north-raw-jackfruit', 'Raw jackfruit (kathal), unripe', ['kathal', 'kacha kathal', 'raw jackfruit', 'green jackfruit'],
    label('Not in USDA (USDA has ripe jackfruit only). Take values from a raw jackfruit pack label.')),
  ingredient('north-boondi', 'Boondi (salted, fried)', ['boondi', 'raita boondi', 'khari boondi'],
    label('Not in USDA. Take values from a plain salted boondi packet label.')),
  ingredient('north-soya-chaap', 'Soya chaap sticks', ['soya chaap', 'chaap', 'soy chaap'],
    label('Not in USDA. Take values from a soya chaap packet label.')),
  ingredient('north-singhara-atta', 'Singhara atta (water chestnut flour)', ['singhara atta', 'singhade ka atta', 'water chestnut flour'],
    label('Not in USDA. Take values from a singhara atta packet label.')),
  ingredient('north-samak-rice', 'Samak rice (barnyard millet), dry', ['samak', 'sama ke chawal', 'vrat ke chawal', 'jhangora', 'barnyard millet'],
    label('Not in USDA. Take values from a samak rice packet label.')),
]
