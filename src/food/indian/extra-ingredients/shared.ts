// Label ingredients used by several recipe files (merged from duplicates).

import type { Ingredient } from '../ingredients'
import { ingredient, label } from '../define'

export const INGREDIENTS_SHARED: Ingredient[] = [
  ingredient('methi-leaves', 'Fenugreek leaves (methi), fresh', ['methi', 'methi saag', 'hari methi', 'fenugreek leaves', 'methi bhaji', 'fresh methi', 'fenugreek greens'],
    label('Not in USDA (only the seed is). Take values from a fresh methi leaves pack label.')),
  ingredient('parwal', 'Parwal (pointed gourd)', ['parwal', 'parval', 'potol', 'pointed gourd', 'patal', 'potala'],
    label('Not in USDA. Take values from a parwal pack label.')),
  ingredient('horse-gram', 'Horse gram (kulthi), dry', ['kollu', 'ulavalu', 'hurali', 'muthira', 'kulthi', 'gahat', 'kulath', 'horse gram', 'kulith'],
    label('Not in USDA. Take values from a horse gram (gahat) packet label.')),
  ingredient('schezwan-sauce', 'Schezwan sauce', ['schezwan chutney', 'szechuan sauce', 'chings schezwan'],
    label('Not in USDA. Take values from a common Indian schezwan sauce/chutney bottle label.')),
  ingredient('rose-syrup', 'Rose sharbat syrup', ['rooh afza', 'rose syrup', 'sharbat', 'rose sharbat', 'gulab sharbat'],
    label('Not in USDA. Take values from a common rose sharbat syrup bottle label.')),
]
