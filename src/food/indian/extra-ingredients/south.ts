// Extra catalogue ingredients needed by recipes/south.ts.
// Only foods that are neither in USDA SR Legacy nor in ingredients.ts.

import type { Ingredient } from '../ingredients'
import { ingredient, label } from '../define'

export const INGREDIENTS_SOUTH: Ingredient[] = [
  ingredient('south-roasted-gram', 'Roasted gram (pottukadalai / dalia)', ['pottukadalai', 'putnalu', 'hurigadale', 'dalia', 'roasted chana dal', 'fried gram'],
    label('Not in USDA. Take values from a roasted gram (pottukadalai) packet label.')),
  ingredient('south-gongura', 'Gongura (sorrel leaves), fresh', ['gongura', 'pulicha keerai', 'ambadi', 'sorrel leaves', 'roselle leaves'],
    label('Not in USDA (USDA "Roselle" is the calyx, not the leaf). Take values from a packaged fresh gongura leaves label.')),
  ingredient('south-foxtail-millet', 'Foxtail millet (thinai), raw', ['thinai', 'korralu', 'navane', 'kangni', 'foxtail millet'],
    label('Not in USDA. Take values from a foxtail millet packet label.')),
  ingredient('south-little-millet', 'Little millet (samai), raw', ['samai', 'saame', 'sama', 'kutki', 'little millet'],
    label('Not in USDA. Take values from a little millet packet label.')),
  ingredient('south-pearl-millet', 'Pearl millet (kambu / bajra), raw', ['kambu', 'sajjalu', 'sajje', 'bajra', 'pearl millet'],
    label('Not in USDA. Take values from a pearl millet (bajra) packet label.')),
  ingredient('south-matta-rice', 'Kerala matta rice (red parboiled), raw', ['matta rice', 'kerala red rice', 'rosematta', 'chemba rice', 'palakkadan matta'],
    label('Not in USDA. Take values from a Kerala matta rice packet label.')),
]
