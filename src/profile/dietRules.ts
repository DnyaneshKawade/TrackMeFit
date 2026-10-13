// Which foods a person's diet leaves out, from what they eat, their food rules
// and allergies. Pure, so onboarding, the typical day and later the meal plan
// all decide the same way.

import type { DietTag, Food } from '../food/types'
import type { DietPref } from './types'

const DIET_EXCLUDES: Record<DietPref, DietTag[]> = {
  nonveg: [],
  eggetarian: ['meat', 'fish'],
  veg: ['meat', 'fish', 'egg'],
  jain: ['meat', 'fish', 'egg', 'honey', 'root', 'onion_garlic'],
  vegan: ['meat', 'fish', 'egg', 'dairy', 'honey'],
}

const ALLERGY_EXCLUDES: Record<string, DietTag> = { milk: 'dairy', egg: 'egg', seafood: 'fish' }

export const NO_ONION_GARLIC = 'no_onion_garlic'
const NONVEG_OFF = 'nonveg_off:'

export const NONVEG_OFF_DAYS: [string, string][] = [
  ['nonveg_off:mon', 'Mon'],
  ['nonveg_off:tue', 'Tue'],
  ['nonveg_off:wed', 'Wed'],
  ['nonveg_off:thu', 'Thu'],
  ['nonveg_off:fri', 'Fri'],
  ['nonveg_off:sat', 'Sat'],
  ['nonveg_off:sun', 'Sun'],
]

export const NONVEG_OFF_SEASONS: [string, string][] = [
  ['nonveg_off:shravan', 'Shravan'],
  ['nonveg_off:navratri', 'Navratri'],
  ['nonveg_off:chaturmas', 'Chaturmas'],
  ['nonveg_off:ramadan', 'Ramadan fasting days'],
  ['nonveg_off:lent', 'Lent'],
]

/** Non-veg-free days and seasons only apply to people who eat non-veg or eggs. */
export const hasNonvegOff = (diet: DietPref | null) => diet === 'nonveg' || diet === 'eggetarian'

export const isNonvegOff = (rule: string) => rule.startsWith(NONVEG_OFF)

/** Food rules with non-veg-free picks removed when the diet has no non-veg. */
export function cleanRules(diet: DietPref | null, rules: string[]): string[] {
  return hasNonvegOff(diet) ? rules : rules.filter((r) => !isNonvegOff(r))
}

/** Everything the person's diet, rules and allergies leave out. */
export function excludedTags(diet: DietPref | null, rules: string[] = [], allergies: string[] = []): Set<DietTag> {
  const out = new Set<DietTag>(diet ? DIET_EXCLUDES[diet] : [])
  if (rules.includes(NO_ONION_GARLIC)) out.add('onion_garlic')
  for (const a of allergies) if (ALLERGY_EXCLUDES[a]) out.add(ALLERGY_EXCLUDES[a])
  return out
}

/** True when none of the food's tags is left out. Untagged foods are allowed. */
export const allows = (excluded: Set<DietTag>, tags: readonly DietTag[] = []) => !tags.some((t) => excluded.has(t))

/** Foods the person can eat, in the same order. */
export const allowedFoods = (foods: Food[], excluded: Set<DietTag>) =>
  excluded.size ? foods.filter((f) => allows(excluded, f.tags)) : foods
