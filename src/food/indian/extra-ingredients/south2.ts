// Extra catalogue ingredients needed by recipes/south2.ts.
// Only foods that are neither in USDA SR Legacy nor in another catalogue file.

import type { Ingredient } from '../ingredients'
import { ingredient, label } from '../define'

export const INGREDIENTS_SOUTH2: Ingredient[] = [
  ingredient('south2-snake-gourd', 'Snake gourd, raw', ['pudalangai', 'potlakaya', 'padavalanga', 'padavalakai', 'chichinda', 'snake gourd'],
    label('Not in USDA. Take values from a fresh snake gourd pack label.')),
  ingredient('south2-banana-stem', 'Banana stem (inner core), raw', ['vazhaithandu', 'vazhapindi', 'arati doota', 'bale dindu', 'banana stem'],
    label('Not in USDA. Take values from a fresh banana stem pack label.')),
  ingredient('south2-kodo-millet', 'Kodo millet (varagu), raw', ['varagu', 'varagu arisi', 'arikelu', 'haraka', 'kodra', 'kodo millet'],
    label('Not in USDA. Take values from a kodo millet packet label.')),
  ingredient('south2-jackfruit-seeds', 'Jackfruit seeds, raw', ['chakkakuru', 'pala kottai', 'panasa ginjalu', 'halasina beeja', 'jackfruit seeds'],
    label('Not in USDA. Take values from a jackfruit seeds pack label.')),
  ingredient('south2-amla', 'Amla (Indian gooseberry), raw', ['amla', 'nellikai', 'nellikka', 'usirikaya', 'nellikayi', 'indian gooseberry', 'awla'],
    label('Not in USDA (USDA "Gooseberries" is the European fruit). Take values from a fresh amla pack label.')),
  ingredient('south2-malabar-spinach', 'Malabar spinach (basale), raw', ['basale soppu', 'bachali kura', 'pasalai keerai', 'vaali', 'poi saag', 'malabar spinach'],
    label('Not in USDA. Take values from a fresh Malabar spinach pack label.')),
  ingredient('south2-mor-milagai', 'Mor milagai (sun-dried curd chillies), uncooked', ['mor milagai', 'majjiga mirapakayalu', 'sandige menasinakai', 'curd chillies', 'moru mulaku'],
    label('Not in USDA. Take values from a mor milagai packet label.')),
  ingredient('south2-curry-leaves', 'Curry leaves, fresh', ['karuveppilai', 'karivepaku', 'kadi patta', 'karibevu', 'curry leaves'],
    label('Not in USDA. Take values from a fresh curry leaves pack label.')),
  ingredient('south2-niger-seeds', 'Niger seeds (gurellu)', ['gurellu', 'huchellu', 'karale', 'ramtil', 'niger seeds'],
    label('Not in USDA. Take values from a niger seeds packet label.')),
]
