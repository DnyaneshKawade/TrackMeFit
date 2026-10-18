// The raw foods a suggested meal plan is built from, with whole units (a
// roti, half a katori), smallest amounts, fair per-meal and per-day limits
// (raw or dry weight), and how a usual day turns into them. Values per 100 g match our ingredient database (a test keeps them in
// step). Paneer, soya chunks, whey, sattu and hung curd borrow values from a
// similar USDA food until we have Indian packet labels (T-031). Low-fat paneer
// uses the Amul High Protein Paneer label.

import type { PlanFood } from '../engine/mealPlan'
import type { DietTag } from '../food/types'
import { allows } from './dietRules'

const f = (x: PlanFood) => x

export const PLAN_FOODS: PlanFood[] = [
  // Cereals
  f({ id: 'tmf:ing:atta', name: 'Atta (for roti)', group: 'cereal', weighed: 'dry', per100g: { kcal: 340, proteinG: 13.21, carbG: 71.97, fatG: 2.5 },
    cookedFactor: 1.33, piece: { grams: 30, one: 'roti', many: 'roti' }, stepG: 30, minG: 30, maxPerMealG: 90, maxPerDayG: 240, tags: [] }),
  f({ id: 'tmf:ing:rice', name: 'Rice', group: 'cereal', weighed: 'raw', per100g: { kcal: 365, proteinG: 7.13, carbG: 79.95, fatG: 0.66 },
    cookedFactor: 3, piece: { grams: 50, one: 'katori cooked rice', many: 'katori cooked rice' }, stepG: 25, minG: 25, maxPerMealG: 100, maxPerDayG: 150, meals: ['Lunch', 'Dinner'], tags: [] }),
  f({ id: 'usda:173904', name: 'Oats', group: 'cereal', weighed: 'dry', per100g: { kcal: 379, proteinG: 13.15, carbG: 67.7, fatG: 6.52 },
    stepG: 10, minG: 30, maxPerMealG: 60, maxPerDayG: 80, meals: ['Breakfast'], tags: [] }),
  f({ id: 'tmf:ing:sooji', name: 'Sooji (rava)', group: 'cereal', weighed: 'dry', per100g: { kcal: 360, proteinG: 12.68, carbG: 72.83, fatG: 1.05 },
    stepG: 10, minG: 30, maxPerMealG: 60, maxPerDayG: 80, meals: ['Breakfast'], tags: [] }),
  // Pulses
  f({ id: 'tmf:ing:toor-dal', name: 'Toor dal', group: 'pulse', weighed: 'dry', per100g: { kcal: 343, proteinG: 21.7, carbG: 62.78, fatG: 1.49 },
    cookedFactor: 6, piece: { grams: 25, one: 'katori cooked dal', many: 'katori cooked dal' }, stepG: 25, minG: 25, maxPerMealG: 50, maxPerDayG: 100, tags: [] }),
  f({ id: 'tmf:ing:moong-dal', name: 'Moong dal', group: 'pulse', weighed: 'dry', per100g: { kcal: 347, proteinG: 23.86, carbG: 62.62, fatG: 1.15 },
    cookedFactor: 6, piece: { grams: 25, one: 'katori cooked dal', many: 'katori cooked dal' }, stepG: 25, minG: 25, maxPerMealG: 50, maxPerDayG: 100, tags: [] }),
  f({ id: 'tmf:ing:chana', name: 'Chana (chickpeas)', group: 'pulse', weighed: 'dry', per100g: { kcal: 378, proteinG: 20.47, carbG: 62.95, fatG: 6.04 },
    cookedFactor: 2.5, piece: { grams: 25, one: 'katori cooked', many: 'katori cooked' }, stepG: 25, minG: 25, maxPerMealG: 50, maxPerDayG: 100, tags: [] }),
  f({ id: 'tmf:ing:rajma', name: 'Rajma', group: 'pulse', weighed: 'dry', per100g: { kcal: 337, proteinG: 22.53, carbG: 61.29, fatG: 1.06 },
    cookedFactor: 2.5, piece: { grams: 25, one: 'katori cooked', many: 'katori cooked' }, stepG: 25, minG: 25, maxPerMealG: 50, maxPerDayG: 100, tags: [] }),
  f({ id: 'tmf:ing:besan', name: 'Besan (for chilla)', group: 'pulse', weighed: 'dry', per100g: { kcal: 387, proteinG: 22.39, carbG: 57.82, fatG: 6.69 },
    piece: { grams: 30, one: 'chilla', many: 'chilla' }, stepG: 30, minG: 30, maxPerMealG: 60, maxPerDayG: 90, meals: ['Breakfast', 'Dinner'], tags: [] }),
  f({ id: 'tmf:ing:sattu', name: 'Sattu', group: 'pulse', weighed: 'dry', per100g: { kcal: 378, proteinG: 20.47, carbG: 62.95, fatG: 6.04 },
    piece: { grams: 30, one: 'glass of drink', many: 'glasses of drink' }, stepG: 15, minG: 30, side: true, maxPerMealG: 45, maxPerDayG: 60, meals: ['Breakfast', 'Snack'], tags: [],
    standIn: 'USDA raw chickpeas (sattu is roasted chana)' }),
  // Soy
  f({ id: 'tmf:ing:soya-chunks', name: 'Soya chunks', group: 'soy', weighed: 'dry', per100g: { kcal: 327, proteinG: 51.46, carbG: 33.92, fatG: 1.22 },
    cookedFactor: 3, stepG: 10, minG: 20, maxPerMealG: 30, maxPerDayG: 50, meals: ['Lunch', 'Dinner'], tags: [], standIn: 'USDA defatted soy flour' }),
  f({ id: 'usda:172475', name: 'Tofu', group: 'soy', weighed: 'as sold', per100g: { kcal: 144, proteinG: 17.27, carbG: 2.78, fatG: 8.72 },
    stepG: 25, minG: 50, maxPerMealG: 150, maxPerDayG: 200, tags: [] }),
  // Dairy
  f({ id: 'tmf:ing:paneer', name: 'Paneer', group: 'dairy', weighed: 'as sold', per100g: { kcal: 299, proteinG: 18.09, carbG: 2.98, fatG: 23.82 },
    stepG: 25, minG: 50, maxPerMealG: 100, maxPerDayG: 150, kind: 'paneer', tags: ['dairy'], standIn: 'USDA queso fresco (a similar fresh cheese)' }),
  f({ id: 'tmf:ing:low-fat-paneer', name: 'Low-fat paneer', group: 'dairy', weighed: 'as sold', per100g: { kcal: 170, proteinG: 25, carbG: 4, fatG: 6 },
    stepG: 25, minG: 50, maxPerMealG: 100, maxPerDayG: 150, kind: 'paneer', tags: ['dairy'] }),
  f({ id: 'usda:170903', name: 'Hung curd', group: 'dairy', weighed: 'as sold', per100g: { kcal: 73, proteinG: 9.95, carbG: 3.94, fatG: 1.92 },
    piece: { grams: 100, one: 'katori', many: 'katori' }, stepG: 50, minG: 100, side: true, maxPerMealG: 150, maxPerDayG: 250, meals: ['Breakfast', 'Lunch', 'Snack', 'Dinner'], kind: 'curd', tags: ['dairy'],
    standIn: 'USDA low-fat Greek yogurt' }),
  f({ id: 'tmf:ing:curd', name: 'Curd (dahi)', group: 'dairy', weighed: 'as sold', per100g: { kcal: 61, proteinG: 3.47, carbG: 4.66, fatG: 3.25 },
    piece: { grams: 100, one: 'katori', many: 'katori' }, stepG: 50, minG: 100, side: true, maxPerMealG: 200, maxPerDayG: 400, meals: ['Breakfast', 'Lunch', 'Snack', 'Dinner'], kind: 'curd', tags: ['dairy'] }),
  f({ id: 'tmf:ing:milk', name: 'Milk', group: 'dairy', weighed: 'as sold', per100g: { kcal: 61, proteinG: 3.15, carbG: 4.8, fatG: 3.25 },
    piece: { grams: 200, one: 'glass', many: 'glasses' }, stepG: 100, minG: 100, side: true, maxPerMealG: 300, maxPerDayG: 500, meals: ['Breakfast', 'Snack'], kind: 'milk', tags: ['dairy'] }),
  f({ id: 'usda:171269', name: 'Skimmed milk', group: 'dairy', weighed: 'as sold', per100g: { kcal: 34, proteinG: 3.37, carbG: 4.96, fatG: 0.08 },
    piece: { grams: 200, one: 'glass', many: 'glasses' }, stepG: 100, minG: 100, side: true, maxPerMealG: 300, maxPerDayG: 500, meals: ['Breakfast', 'Snack'], kind: 'milk', tags: ['dairy'] }),
  f({ id: 'usda:172195', name: 'Skimmed milk powder', group: 'dairy', weighed: 'as sold', per100g: { kcal: 362, proteinG: 36.16, carbG: 51.98, fatG: 0.77 },
    piece: { grams: 10, one: 'tbsp', many: 'tbsp' }, stepG: 10, minG: 10, side: true, maxPerMealG: 20, maxPerDayG: 30, meals: ['Breakfast', 'Snack'], tags: ['dairy'] }),
  f({ id: 'usda:173177', name: 'Whey protein', group: 'supplement', weighed: 'as sold', per100g: { kcal: 359, proteinG: 58.14, carbG: 29.07, fatG: 1.16 },
    piece: { grams: 30, one: 'scoop', many: 'scoops' }, stepG: 15, minG: 15, maxPerMealG: 30, maxPerDayG: 50, meals: ['Breakfast', 'Snack'], tags: ['dairy'], standIn: 'USDA whey protein isolate' }),
  // Egg, meat, fish
  f({ id: 'tmf:ing:egg', name: 'Eggs', group: 'egg', weighed: 'raw', per100g: { kcal: 143, proteinG: 12.56, carbG: 0.72, fatG: 9.51 },
    piece: { grams: 50, one: 'egg', many: 'eggs' }, stepG: 50, minG: 50, maxPerMealG: 200, maxPerDayG: 300, tags: ['egg'] }),
  f({ id: 'tmf:ing:chicken', name: 'Chicken', group: 'meat', weighed: 'raw', per100g: { kcal: 119, proteinG: 21.39, carbG: 0, fatG: 3.08 },
    cookedFactor: 0.75, stepG: 25, minG: 75, maxPerMealG: 200, maxPerDayG: 300, tags: ['meat'] }),
  f({ id: 'usda:175176', name: 'Fish', group: 'fish', weighed: 'raw', per100g: { kcal: 96, proteinG: 20.08, carbG: 0, fatG: 1.7 },
    cookedFactor: 0.8, stepG: 25, minG: 75, maxPerMealG: 200, maxPerDayG: 300, tags: ['fish'] }),
  // Nuts, fats
  f({ id: 'tmf:ing:peanuts', name: 'Peanuts', group: 'nut', weighed: 'raw', per100g: { kcal: 567, proteinG: 25.8, carbG: 16.13, fatG: 49.24 },
    stepG: 10, minG: 20, maxPerMealG: 30, maxPerDayG: 40, meals: ['Breakfast', 'Snack'], tags: [] }),
  f({ id: 'tmf:ing:oil', name: 'Cooking oil', group: 'fat', weighed: 'as sold', per100g: { kcal: 884, proteinG: 0, carbG: 0, fatG: 100 },
    piece: { grams: 5, one: 'tsp', many: 'tsp' }, maxPerMealG: 15, maxPerDayG: 40, tags: [] }),
  f({ id: 'tmf:ing:ghee', name: 'Ghee', group: 'fat', weighed: 'as sold', per100g: { kcal: 876, proteinG: 0.28, carbG: 0, fatG: 99.48 },
    piece: { grams: 5, one: 'tsp', many: 'tsp' }, maxPerMealG: 15, maxPerDayG: 40, tags: ['dairy'] }),
  // Vegetables, fruit, sugar
  f({ id: 'tmf:ing:cauliflower', name: 'Vegetables (gobi, beans, gourds, greens)', group: 'veg', weighed: 'raw', per100g: { kcal: 25, proteinG: 1.92, carbG: 4.97, fatG: 0.28 },
    stepG: 50, minG: 100, maxPerMealG: 250, maxPerDayG: 500, tags: [] }),
  f({ id: 'usda:173944', name: 'Banana', group: 'fruit', weighed: 'raw', per100g: { kcal: 89, proteinG: 1.09, carbG: 22.84, fatG: 0.33 },
    piece: { grams: 118, one: 'banana', many: 'bananas' }, maxPerMealG: 150, maxPerDayG: 250, tags: [] }),
  f({ id: 'tmf:ing:sugar', name: 'Sugar', group: 'sugar', weighed: 'as sold', per100g: { kcal: 387, proteinG: 0, carbG: 99.98, fatG: 0 },
    piece: { grams: 5, one: 'tsp', many: 'tsp' }, maxPerMealG: 10, maxPerDayG: 25, tags: [] }),
]

export const PLAN_FOODS_BY_ID = new Map(PLAN_FOODS.map((x) => [x.id, x]))

/** Protein choices in plain words, mapped to plan foods. */
export const PROTEIN_PICKS: { key: string; label: string; foods: string[] }[] = [
  { key: 'paneer', label: 'Paneer', foods: ['tmf:ing:paneer'] },
  { key: 'low-fat-paneer', label: 'Low-fat paneer', foods: ['tmf:ing:low-fat-paneer'] },
  { key: 'curd', label: 'Curd and milk', foods: ['tmf:ing:curd', 'tmf:ing:milk'] },
  { key: 'low-fat-dairy', label: 'Hung curd and skimmed milk', foods: ['usda:170903', 'usda:171269', 'usda:172195'] },
  { key: 'dal', label: 'Dal, chana and rajma', foods: ['tmf:ing:moong-dal', 'tmf:ing:chana', 'tmf:ing:rajma', 'tmf:ing:toor-dal'] },
  { key: 'besan', label: 'Besan and sattu', foods: ['tmf:ing:besan', 'tmf:ing:sattu'] },
  { key: 'soya', label: 'Soya chunks', foods: ['tmf:ing:soya-chunks'] },
  { key: 'tofu', label: 'Tofu', foods: ['usda:172475'] },
  { key: 'eggs', label: 'Eggs', foods: ['tmf:ing:egg'] },
  { key: 'chicken', label: 'Chicken', foods: ['tmf:ing:chicken'] },
  { key: 'fish', label: 'Fish', foods: ['usda:175176'] },
  { key: 'whey', label: 'Whey protein', foods: ['usda:173177'] },
  { key: 'peanuts', label: 'Peanuts', foods: ['tmf:ing:peanuts'] },
]

/** Plan foods the diet allows. */
export const planFoodsFor = (excluded: Set<DietTag>) => PLAN_FOODS.filter((x) => allows(excluded, x.tags))

/** Protein choices with at least one allowed food. */
export const proteinPicksFor = (excluded: Set<DietTag>) =>
  PROTEIN_PICKS.filter((p) => p.foods.some((id) => allows(excluded, PLAN_FOODS_BY_ID.get(id)!.tags)))

/** One portion of each typical-day row, as raw foods. Roti is 30 g atta;
 * a katori of cooked rice is 50 g raw; a katori of dal is 25 g dry dal plus
 * a little fat. Fried snacks and sweets are not carried into a plan. */
const TYPICAL_TO_RAW: Record<string, { foodId: string; grams: number }[]> = {
  'tmf:dish:roti': [{ foodId: 'tmf:ing:atta', grams: 30 }],
  'tmf:dish:plain-paratha': [{ foodId: 'tmf:ing:atta', grams: 50 }, { foodId: 'tmf:ing:ghee', grams: 8 }],
  'tmf:dish:steamed-rice': [{ foodId: 'tmf:ing:rice', grams: 50 }],
  'tmf:dish:plain-dosa': [{ foodId: 'tmf:ing:rice', grams: 35 }, { foodId: 'tmf:ing:oil', grams: 5 }],
  'tmf:dish:dal-tadka': [{ foodId: 'tmf:ing:toor-dal', grams: 25 }, { foodId: 'tmf:ing:ghee', grams: 3 }],
  'tmf:dish:jain-dal-tadka': [{ foodId: 'tmf:ing:toor-dal', grams: 25 }, { foodId: 'tmf:ing:ghee', grams: 3 }],
  'tmf:dish:aloo-gobi': [{ foodId: 'tmf:ing:cauliflower', grams: 130 }, { foodId: 'tmf:ing:oil', grams: 6 }],
  'tmf:dish:jain-mix-veg': [{ foodId: 'tmf:ing:cauliflower', grams: 130 }, { foodId: 'tmf:ing:oil', grams: 6 }],
  'usda:170886': [{ foodId: 'tmf:ing:curd', grams: 150 }],
  'tmf:dish:toned-milk': [{ foodId: 'tmf:ing:milk', grams: 200 }],
  'tmf:dish:chai': [{ foodId: 'tmf:ing:milk', grams: 60 }, { foodId: 'tmf:ing:sugar', grams: 8 }],
  'tmf:dish:boiled-egg': [{ foodId: 'tmf:ing:egg', grams: 50 }],
  'tmf:dish:chicken-curry': [{ foodId: 'tmf:ing:chicken', grams: 90 }, { foodId: 'tmf:ing:oil', grams: 5 }],
  'usda:173944': [{ foodId: 'usda:173944', grams: 118 }],
}

/** The typical day's counts as raw plan foods, amounts added up per food. */
export function typicalDayToBase(counts: Record<string, number>): { foodId: string; grams: number }[] {
  const total = new Map<string, number>()
  for (const [id, n] of Object.entries(counts)) {
    for (const part of TYPICAL_TO_RAW[id] ?? []) total.set(part.foodId, (total.get(part.foodId) ?? 0) + part.grams * n)
  }
  return [...total].map(([foodId, grams]) => ({ foodId, grams }))
}
