// Raw ingredients our Indian dishes are built from. Values are not typed in by
// hand: each ingredient names the USDA SR Legacy record it comes from (public
// domain), and the importer fills calories and macros from USDA. Ingredients
// USDA does not have (paneer, poha) take values from a package label.

import { INGREDIENTS_SHARED } from './extra-ingredients/shared'
import { INGREDIENTS_NORTH } from './extra-ingredients/north'
import { INGREDIENTS_SOUTH } from './extra-ingredients/south'
import { INGREDIENTS_WESTEAST } from './extra-ingredients/westeast'
import { INGREDIENTS_SNACKS } from './extra-ingredients/snacks'
import { INGREDIENTS_NONVEG_SWEETS } from './extra-ingredients/nonveg-sweets'
import { INGREDIENTS_RESTAURANT } from './extra-ingredients/restaurant'
import { INGREDIENTS_SOUTH2 } from './extra-ingredients/south2'
import { INGREDIENTS_NONVEG2 } from './extra-ingredients/nonveg2'
import { INGREDIENTS_SWEETS_BAKERY } from './extra-ingredients/sweets-bakery'
import { INGREDIENTS_THALI_DIET } from './extra-ingredients/thali-diet'
import { INGREDIENTS_REGIONAL2 } from './extra-ingredients/regional2'

export type ValueSource =
  | { kind: 'usda'; description: string }
  | { kind: 'label'; note: string }
  | { kind: 'fixed'; per100g: { kcal: number; proteinG: number; carbG: number; fatG: number } }

export interface Ingredient {
  /** Food id used in recipes: "tmf:ing:<key>". */
  id: string
  name: string
  /** Other names people search for, in Hinglish and English. */
  aliases: string[]
  values: ValueSource
}

const usda = (description: string): ValueSource => ({ kind: 'usda', description })

const list: (Omit<Ingredient, 'id'> & { key: string })[] = [
  // Dals and pulses (dry, raw)
  { key: 'toor-dal', name: 'Toor dal (arhar), dry', aliases: ['arhar', 'tuvar', 'pigeon pea'], values: usda('Pigeon peas (red gram), mature seeds, raw') },
  { key: 'moong-dal', name: 'Moong dal, dry', aliases: ['mung', 'green gram'], values: usda('Mung beans, mature seeds, raw') },
  { key: 'masoor-dal', name: 'Masoor dal (red lentils), dry', aliases: ['red lentil', 'lal masoor'], values: usda('Lentils, pink or red, raw') },
  { key: 'urad-dal', name: 'Urad dal, dry', aliases: ['black gram', 'udad'], values: usda('Mungo beans, mature seeds, raw') },
  { key: 'rajma', name: 'Rajma (kidney beans), dry', aliases: ['kidney beans'], values: usda('Beans, kidney, red, mature seeds, raw') },
  { key: 'chana', name: 'Kabuli chana (chickpeas), dry', aliases: ['chole', 'chickpeas', 'garbanzo'], values: usda('Chickpeas (garbanzo beans, bengal gram), mature seeds, raw') },
  { key: 'besan', name: 'Besan (gram flour)', aliases: ['chickpea flour', 'gram flour'], values: usda('Chickpea flour (besan)') },

  // Grains
  { key: 'rice', name: 'Rice, white, raw', aliases: ['chawal', 'basmati', 'sona masoori'], values: usda('Rice, white, long-grain, regular, raw, unenriched') },
  { key: 'atta', name: 'Atta (whole wheat flour)', aliases: ['wheat flour', 'gehu atta'], values: usda("Wheat flour, whole-grain (Includes foods for USDA's Food Distribution Program)") },
  { key: 'sooji', name: 'Sooji (semolina)', aliases: ['rava', 'semolina'], values: usda('Semolina, unenriched') },
  { key: 'poha', name: 'Poha (flattened rice), dry', aliases: ['chivda', 'aval', 'flattened rice'], values: { kind: 'label', note: 'Not in USDA. Take values from a common Indian poha packet label.' } },

  // Fats
  { key: 'ghee', name: 'Ghee', aliases: ['desi ghee', 'clarified butter'], values: usda('Butter oil, anhydrous') },
  { key: 'oil', name: 'Cooking oil', aliases: ['tel', 'refined oil', 'mustard oil', 'sunflower oil'], values: usda('Oil, soybean, salad or cooking') },

  // Dairy and protein
  { key: 'paneer', name: 'Paneer', aliases: ['cottage cheese'], values: { kind: 'label', note: 'Not in USDA. Take values from a common Indian paneer packet label.' } },
  { key: 'milk', name: 'Milk, whole (full cream)', aliases: ['doodh', 'full cream milk'], values: usda('Milk, whole, 3.25% milkfat, with added vitamin D') },
  { key: 'curd', name: 'Curd (dahi), whole milk', aliases: ['dahi', 'yogurt'], values: usda('Yogurt, plain, whole milk') },
  { key: 'egg', name: 'Egg, whole', aliases: ['anda', 'eggs'], values: usda('Egg, whole, raw, fresh') },
  { key: 'chicken', name: 'Chicken, meat only, raw', aliases: ['murgi', 'chicken curry cut'], values: usda('Chicken, broilers or fryers, meat only, raw') },
  { key: 'peanuts', name: 'Peanuts (moongphali), raw', aliases: ['moongphali', 'groundnut'], values: usda('Peanuts, all types, raw') },

  // Vegetables
  { key: 'onion', name: 'Onion', aliases: ['pyaz', 'kanda'], values: usda('Onions, raw') },
  { key: 'tomato', name: 'Tomato', aliases: ['tamatar'], values: usda('Tomatoes, red, ripe, raw, year round average') },
  { key: 'potato', name: 'Potato', aliases: ['aloo', 'batata'], values: usda('Potatoes, flesh and skin, raw') },
  { key: 'cauliflower', name: 'Cauliflower', aliases: ['gobi', 'phool gobi'], values: usda('Cauliflower, raw') },
  { key: 'spinach', name: 'Spinach', aliases: ['palak'], values: usda('Spinach, raw') },
  { key: 'okra', name: 'Bhindi (okra)', aliases: ['bhindi', 'ladies finger', 'okra'], values: usda('Okra, raw') },
  { key: 'carrot', name: 'Carrot', aliases: ['gajar'], values: usda('Carrots, raw') },

  // Other
  { key: 'sugar', name: 'Sugar', aliases: ['cheeni', 'shakkar'], values: usda('Sugars, granulated') },
  // Indian staples not in USDA; values come from package labels
  { key: 'jaggery', name: 'Jaggery (gur)', aliases: ['gur', 'gud', 'vellam', 'bella'], values: { kind: 'label', note: 'Not in USDA. Take values from a jaggery packet label.' } },
  { key: 'khoya', name: 'Khoya (mawa)', aliases: ['mawa', 'khoa'], values: { kind: 'label', note: 'Not in USDA. Take values from a khoya packet label.' } },
  { key: 'makhana', name: 'Makhana (fox nuts)', aliases: ['phool makhana', 'lotus seeds'], values: { kind: 'label', note: 'Not in USDA. Take values from a makhana packet label.' } },
  { key: 'soya-chunks', name: 'Soya chunks, dry', aliases: ['soya badi', 'nutrela', 'meal maker'], values: { kind: 'label', note: 'Not in USDA. Take values from a soya chunks packet label.' } },
  { key: 'ragi-flour', name: 'Ragi flour (finger millet)', aliases: ['nachni', 'nachni atta', 'finger millet flour'], values: { kind: 'label', note: 'Not in USDA. Take values from a ragi flour packet label.' } },
  { key: 'sattu', name: 'Sattu (roasted gram flour)', aliases: ['chana sattu'], values: { kind: 'label', note: 'Not in USDA. Take values from a sattu packet label.' } },
  { key: 'vermicelli', name: 'Vermicelli (seviyan), dry', aliases: ['seviyan', 'semiya', 'sewai'], values: { kind: 'label', note: 'Not in USDA. Take values from a vermicelli packet label.' } },

  { key: 'water', name: 'Water', aliases: ['pani'], values: { kind: 'fixed', per100g: { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 } } },
]

const BASE: Ingredient[] = list.map(({ key, ...rest }) => ({ id: `tmf:ing:${key}`, ...rest }))

export const INGREDIENTS: Ingredient[] = [
  ...BASE,
  ...INGREDIENTS_SHARED,
  ...INGREDIENTS_NORTH,
  ...INGREDIENTS_SOUTH,
  ...INGREDIENTS_WESTEAST,
  ...INGREDIENTS_SNACKS,
  ...INGREDIENTS_NONVEG_SWEETS,
  ...INGREDIENTS_RESTAURANT,
  ...INGREDIENTS_SOUTH2,
  ...INGREDIENTS_NONVEG2,
  ...INGREDIENTS_SWEETS_BAKERY,
  ...INGREDIENTS_THALI_DIET,
  ...INGREDIENTS_REGIONAL2,
]

export const ingredientById = new Map(INGREDIENTS.map((i) => [i.id, i]))
