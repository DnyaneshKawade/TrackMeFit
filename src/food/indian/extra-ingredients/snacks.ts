// Extra catalogue ingredients needed by recipes/snacks.ts.
// Only foods that are in neither USDA SR Legacy nor the main catalogue.

import { ingredient, label } from '../define'
import type { Ingredient } from '../ingredients'

export const INGREDIENTS_SNACKS: Ingredient[] = [
  ingredient('snacks-whey-protein', 'Whey protein powder', ['whey', 'protein powder', 'protein scoop'],
    label('Not in USDA. Take values from a common whey protein concentrate tub label (per 100 g powder).')),
  ingredient('snacks-sugarcane-juice', 'Sugarcane juice', ['ganne ka ras', 'ganna juice', 'oos ras', 'kabbu juice'],
    label('Not in USDA. Take values from a packaged sugarcane juice label.')),
  ingredient('snacks-muesli', 'Muesli (fruit and nut), dry', ['muesli', 'museli', 'fruit and nut muesli'],
    label('Not in USDA. Take values from a common Indian fruit-and-nut muesli packet label.')),
  ingredient('snacks-malt-drink-powder', 'Malted health drink powder', ['bournvita', 'horlicks', 'boost', 'complan', 'malt drink'],
    label('Not in USDA. Take values from a common Indian malted chocolate health drink jar label.')),
]
