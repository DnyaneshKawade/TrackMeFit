// Extra catalogue ingredients needed by recipes/westeast.ts.
// Only foods that are neither in USDA SR Legacy nor in ingredients.ts. Values
// come from package labels; nothing is typed in by hand.

import { ingredient, label } from '../define'
import type { Ingredient } from '../ingredients'

export const INGREDIENTS_WESTEAST: Ingredient[] = [
  ingredient('westeast-ker', 'Ker (dried caper berries)', ['ker', 'kair', 'kerda', 'dried ker'],
    label('Not in USDA. Take values from a dried ker packet label.')),
  ingredient('westeast-sangri', 'Sangri (dried khejri beans)', ['sangri', 'sangria', 'khejri beans'],
    label('Not in USDA. Take values from a dried sangri packet label.')),
  ingredient('westeast-papad', 'Papad (urad), uncooked', ['papad', 'papadum', 'appalam', 'urad papad'],
    label('Not in USDA. Take values from an urad papad packet label.')),
  ingredient('westeast-tindora', 'Tindora (ivy gourd), raw', ['tindora', 'tendli', 'tondli', 'kundru', 'ivy gourd', 'tendle'],
    label('Not in USDA. Take values from a fresh or frozen tindora packet label.')),
  ingredient('westeast-gavar', 'Gavar (cluster beans), raw', ['gavar', 'guar', 'gawar', 'cluster beans', 'guvar'],
    label('Not in USDA. Take values from a fresh or frozen cluster beans packet label.')),
  ingredient('westeast-banana-flower', 'Banana flower (mocha), raw', ['mocha', 'banana blossom', 'kele ka phool', 'kolar mocha'],
    label('Not in USDA. Take values from a banana flower packet label.')),
]
