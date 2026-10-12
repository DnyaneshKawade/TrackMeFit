// Extra catalogue ingredients needed by recipes/regional2.ts.

import type { Ingredient } from '../ingredients'
import { ingredient, label } from '../define'

export const INGREDIENTS_REGIONAL2: Ingredient[] = [
  ingredient('regional2-kokum', 'Kokum (dried rind)', ['kokum', 'amsul', 'bhirand', 'kokam', 'dried kokum'],
    label('Not in USDA. Take values from a dried kokum packet label.')),
  ingredient('regional2-black-rice', 'Black rice (chak-hao), raw', ['chak hao', 'chakhao', 'black rice', 'manipuri black rice', 'forbidden rice'],
    label('Not in USDA. Take values from a black rice (chak-hao) packet label.')),
  ingredient('regional2-chhurpi', 'Chhurpi (soft, fresh)', ['chhurpi', 'churpi', 'soft chhurpi', 'datshi', 'yak cheese soft'],
    label('Not in USDA. Take values from a soft chhurpi packet label.')),
  ingredient('regional2-gundruk', 'Gundruk (dried fermented leafy greens)', ['gundruk', 'gundru', 'fermented greens'],
    label('Not in USDA. Take values from a gundruk packet label.')),
  ingredient('regional2-kantola', 'Kantola (spine gourd), raw', ['kantola', 'kakoda', 'kankoda', 'kartoli', 'kakrol', 'spine gourd', 'teasel gourd'],
    label('Not in USDA. Take values from a fresh or frozen kantola packet label.')),
  ingredient('regional2-fresh-turmeric', 'Fresh turmeric root (kachi haldi)', ['kachi haldi', 'fresh turmeric', 'raw turmeric', 'haldi gaanth'],
    label('Not in USDA (only the ground spice is). Take values from a fresh turmeric root pack label.')),
  ingredient('regional2-raw-papaya', 'Raw papaya (green), raw', ['kacha papita', 'raw papaya', 'green papaya', 'amita', 'pepe'],
    label('Not in USDA (USDA has ripe papaya only). Take values from a raw papaya pack label.')),
  ingredient('regional2-raw-mango', 'Raw mango (green), raw', ['kachi kairi', 'kairi', 'raw mango', 'green mango', 'kancha aam', 'ambi', 'kacha aam', 'mangai', 'mamidikaya', 'mavinakayi', 'pacha manga'],
    label('Not in USDA (USDA has ripe mango only). Take values from a raw mango pack label.')),
  ingredient('regional2-elephant-apple', 'Elephant apple (outenga), raw', ['outenga', 'ou tenga', 'chalta', 'elephant apple'],
    label('Not in USDA. Take values from an elephant apple pack label.')),
  ingredient('regional2-green-chana', 'Green chickpeas (hara chana, choliya), fresh', ['hara chana', 'choliya', 'cholia', 'hare chane', 'green chickpeas', 'harbhara', 'jinjara', 'pothi'],
    label('Not in USDA. Take values from a fresh or frozen green chickpeas packet label.')),
  ingredient('regional2-kachri', 'Kachri (dried wild cucumber)', ['kachri', 'kachari', 'sukhi kachri', 'wild cucumber dried'],
    label('Not in USDA. Take values from a dried kachri packet label.')),
]
