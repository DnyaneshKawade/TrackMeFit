// Shared food model. Every food stores calories and macros per 100 g of the
// state it was measured in (raw, cooked or as sold), plus optional portions.

export type FoodState = 'raw' | 'cooked' | 'asSold'

/** Where a food record came from. Licences differ per source, so the source is
 * kept on every record and shown to the user. */
export type FoodSource =
  | 'usda' // USDA FoodData Central, public domain (CC0)
  | 'ifct' // Indian Food Composition Tables 2017, ICMR-NIN (licence to confirm)
  | 'indb' // Indian Nutrient Databank (licence to confirm)
  | 'openFoodFacts' // ODbL, attribution + share-alike; kept separate
  | 'trackMeFit' // our own curated entries
  | 'user' // added by a user, private to them
  | 'aiEstimate' // estimated, always labelled as an estimate

export interface Per100g {
  kcal: number
  proteinG: number
  carbG: number
  fatG: number
}

export interface Portion {
  /** e.g. "1 katori", "1 roti", "1 piece" */
  label: string
  grams: number
}

export interface Food {
  id: string
  name: string
  brand?: string
  state: FoodState
  per100g: Per100g
  portions: Portion[]
  source: FoodSource
  /** Id in the source database, for refreshing and attribution. */
  sourceId?: string
  barcode?: string
}

export interface MacroAmount extends Per100g {
  grams: number
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Calories and macros for a given weight of a food. */
export function amountFor(food: Food, grams: number): MacroAmount {
  const k = grams / 100
  return {
    grams,
    kcal: Math.round(food.per100g.kcal * k),
    proteinG: round1(food.per100g.proteinG * k),
    carbG: round1(food.per100g.carbG * k),
    fatG: round1(food.per100g.fatG * k),
  }
}

/** Grams for a number of portions, e.g. 1.5 katori. */
export function gramsForPortions(portion: Portion, count: number): number {
  return Math.round(portion.grams * count)
}

/** Portions for a weight, e.g. 150 g is about 1 katori. */
export function portionsForGrams(portion: Portion, grams: number): number {
  return round1(grams / portion.grams)
}

/** Macros from calories should roughly agree with stated calories. Flags user
 * or label entries that are likely typos. Returns the relative gap. */
export function energyMismatch(p: Per100g): number {
  const fromMacros = p.proteinG * 4 + p.carbG * 4 + p.fatG * 9
  if (p.kcal === 0) return fromMacros === 0 ? 0 : 1
  return Math.abs(fromMacros - p.kcal) / p.kcal
}
