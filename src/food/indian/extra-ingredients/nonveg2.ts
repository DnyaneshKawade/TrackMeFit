// Extra catalogue ingredients needed by recipes/nonveg2.ts.
// Only foods that are neither in USDA SR Legacy nor in another catalogue file.

import { ingredient, label } from '../define'
import type { Ingredient } from '../ingredients'

export const INGREDIENTS_NONVEG2: Ingredient[] = [
  ingredient('nonveg2-bombil', 'Bombil (Bombay duck), fresh, cleaned', ['bombil', 'bombli', 'bombay duck', 'loitta', 'bummalo'],
    label('Not in USDA. Take values from a cleaned fresh or frozen bombil pack label.')),
  ingredient('nonveg2-dried-bombil', 'Dried bombil (sukha bombil)', ['sukhe bombil', 'sukat bombil', 'dried bombay duck', 'loitta shutki'],
    label('Not in USDA. Take values from a dried bombil packet label.')),
  ingredient('nonveg2-dried-prawns', 'Dried prawns / shrimp (javla, sode, karandi)', ['javla', 'jawla', 'sode', 'sukat', 'kolim', 'dried shrimp', 'dry prawns', 'chemmeen unakka', 'chingri shutki'],
    label('Not in USDA. Take values from a dried prawns packet label.')),
  ingredient('nonveg2-ngari', 'Ngari (Manipuri fermented fish)', ['ngari', 'fermented fish', 'shidol', 'hentak'],
    label('Not in USDA. Take values from a packaged ngari label.')),
  ingredient('nonveg2-goat-trotters', 'Goat trotters (paya), cleaned, edible part', ['paya', 'mutton paya', 'trotters', 'aattukaal', 'kharode'],
    label('Not in USDA. Take values from a cleaned goat paya pack label (edible part).')),
]
