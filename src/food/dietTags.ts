// What a food contains that some diets leave out: meat, fish, egg, dairy,
// honey, root vegetables (Jain) and onion or garlic. Pure. Dishes are tagged
// from their recipe's ingredients; other foods from their name and aliases,
// which is a guess and is marked as one.

import { normalize } from './search'
import type { DietTag } from './types'

export type { DietTag } from './types'

// Plant foods whose names contain an animal word, removed before matching.
const NOT_ANIMAL = [
  'coconut milk', 'almond milk', 'soy milk', 'soya milk', 'oat milk', 'rice milk', 'cashew milk',
  'peanut butter', 'nut butter', 'cocoa butter', 'almond butter', 'coconut cream', 'cream of tartar',
  'eggplant', 'egg plant', 'eggless', 'without egg', 'veg mayonnaise', 'vegan',
]

const WORDS: Record<DietTag, string[]> = {
  meat: [
    'chicken', 'murgh', 'mutton', 'lamb', 'goat', 'gosht', 'beef', 'pork', 'bacon', 'ham', 'sausage', 'salami',
    'pepperoni', 'keema', 'kheema', 'turkey', 'duck', 'liver', 'meat', 'meats', 'gelatin', 'gelatine', 'veal', 'venison',
  ],
  fish: [
    'fish', 'prawn', 'prawns', 'shrimp', 'shrimps', 'crab', 'lobster', 'tuna', 'salmon', 'rohu', 'pomfret', 'surmai',
    'bangda', 'mackerel', 'sardine', 'sardines', 'hilsa', 'ilish', 'squid', 'oyster', 'oysters', 'mussel', 'mussels',
    'clam', 'clams', 'anchovy', 'anchovies', 'basa', 'seafood', 'machli', 'machhli', 'macher', 'jhinga', 'kolambi', 'cod', 'tilapia',
  ],
  egg: ['egg', 'eggs', 'anda', 'omelette', 'omelet', 'mayonnaise'],
  dairy: [
    'milk', 'curd', 'dahi', 'paneer', 'ghee', 'butter', 'cheese', 'cream', 'khoya', 'khoa', 'mawa', 'yogurt', 'yoghurt',
    'lassi', 'chaas', 'buttermilk', 'whey', 'casein', 'malai', 'rabri', 'rabdi', 'chhena', 'chena', 'condensed', 'kulfi', 'shrikhand',
  ],
  honey: ['honey', 'shahad'],
  onion_garlic: ['onion', 'onions', 'garlic', 'pyaz', 'pyaaz', 'kanda', 'lehsun', 'lahsun', 'lasun', 'shallot', 'shallots', 'leek', 'scallion', 'scallions'],
  root: [
    'potato', 'potatoes', 'aloo', 'carrot', 'carrots', 'gajar', 'radish', 'mooli', 'beetroot', 'beet', 'sweet potato',
    'shakarkandi', 'yam', 'suran', 'jimikand', 'arbi', 'colocasia', 'turnip', 'shalgam', 'ginger', 'adrak',
  ],
}

// Animal milk products named after the animal.
const REWRITE: [string, string][] = [
  ['goat milk', 'milk'], ['goats milk', 'milk'], ['goat cheese', 'cheese'], ['buffalo milk', 'milk'],
]

/** Tags found in a piece of text (a name, aliases, a description). */
export function tagsFromText(text: string): Set<DietTag> {
  let s = ` ${normalize(text)} `
  for (const [from, to] of REWRITE) s = s.split(` ${from} `).join(` ${to} `)
  for (const p of NOT_ANIMAL) s = s.split(` ${p} `).join(' ')
  const out = new Set<DietTag>()
  for (const tag of Object.keys(WORDS) as DietTag[]) {
    if (WORDS[tag].some((w) => s.includes(` ${w} `))) out.add(tag)
  }
  return out
}

/** Tags for a dish: everything its ingredients carry. */
export function tagsFromIngredients(ingredientTexts: string[]): Set<DietTag> {
  const out = new Set<DietTag>()
  for (const t of ingredientTexts) for (const tag of tagsFromText(t)) out.add(tag)
  return out
}
