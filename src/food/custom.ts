// Foods and recipes people add themselves. Private to them (and their coach),
// stored per 100 g like every other food, with source 'user'.

import type { SupabaseClient } from '@supabase/supabase-js'
import { energyMismatch, type Food, type FoodState, type Per100g, type Portion } from './types'

export interface RecipePart {
  foodId: string
  name: string
  /** Weight as it goes into the pot. */
  grams: number
}

export interface RecipeInfo {
  ingredients: RecipePart[]
  cookedWeightG: number
  servings: number | null
}

export interface NewCustomFood {
  name: string
  brand?: string
  state: FoodState
  per100g: Per100g
  portions: Portion[]
  recipe?: RecipeInfo
}

export interface CustomFood extends Food {
  recipe?: RecipeInfo
}

export interface CustomFoodStore {
  list(): Promise<CustomFood[]>
  add(food: NewCustomFood): Promise<CustomFood>
  remove(id: string): Promise<void>
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Values as typed into the form, before checking. */
export interface FoodForm {
  name: string
  brand: string
  state: FoodState
  /** 'serving' when the values are for one serving of `servingG` grams. */
  basis: '100g' | 'serving'
  servingG: string
  servingName: string
  kcal: string
  protein: string
  carbs: string
  fat: string
}

export const EMPTY_FOOD_FORM: FoodForm = {
  name: '',
  brand: '',
  state: 'asSold',
  basis: '100g',
  servingG: '',
  servingName: '',
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
}

export type FoodFormErrors = Partial<Record<keyof FoodForm | 'form', string>>

const num = (s: string) => (s.trim() ? Number(s.replace(',', '.')) : NaN)
/** Macros are optional and count as 0 when left empty. */
const macro = (s: string) => (s.trim() ? num(s) : 0)

/** Checks the form and turns it into a food, or returns what needs fixing.
 * A label can be per 100 g or per serving; both are stored per 100 g. */
export function foodFromForm(f: FoodForm): { food: NewCustomFood; warning: string | null } | { errors: FoodFormErrors } {
  const errors: FoodFormErrors = {}
  const name = f.name.trim()
  if (!name) errors.name = 'Give the food a name.'
  else if (name.length > 120) errors.name = 'Keep the name under 120 characters.'

  let factor = 1
  if (f.basis === 'serving') {
    const g = num(f.servingG)
    if (!(g > 0 && g <= 2000)) errors.servingG = 'Serving size should be between 1 and 2000 g.'
    else factor = 100 / g
  }

  const kcal = num(f.kcal)
  if (!Number.isFinite(kcal) || kcal < 0) errors.kcal = 'Enter the calories.'
  const values = { protein: macro(f.protein), carbs: macro(f.carbs), fat: macro(f.fat) }
  for (const k of ['protein', 'carbs', 'fat'] as const) {
    if (!Number.isFinite(values[k]) || values[k] < 0) errors[k] = 'Enter a number, or leave it empty.'
  }
  if (Object.keys(errors).length) return { errors }

  const per100g: Per100g = {
    kcal: Math.round(kcal * factor),
    proteinG: round1(values.protein * factor),
    carbG: round1(values.carbs * factor),
    fatG: round1(values.fat * factor),
  }
  if (per100g.kcal > 950) return { errors: { kcal: 'That’s more than any food has. Pure oil is 900 calories per 100 g. Check the number and the serving size.' } }
  if (per100g.proteinG + per100g.carbG + per100g.fatG > 101)
    return { errors: { form: 'Protein, carbs and fat add up to more than the food weighs. Check the numbers and the serving size.' } }

  const portions: Portion[] =
    f.basis === 'serving' ? [{ label: f.servingName.trim() || '1 serving', grams: Math.round(num(f.servingG)) }] : []
  const brand = f.brand.trim()
  const food: NewCustomFood = { name, state: f.state, per100g, portions, ...(brand ? { brand } : {}) }
  const hasMacros = per100g.proteinG + per100g.carbG + per100g.fatG > 0
  const warning =
    hasMacros && energyMismatch(per100g) > 0.2
      ? 'The calories don’t match the protein, carbs and fat. Check the label again. Worth a second look at the label.'
      : null
  return { food, warning }
}

/** Calories and macros per 100 g of a cooked recipe, from what went into the
 * pot and what the pot weighed after cooking. */
export function recipeFood(
  name: string,
  parts: { food: Food; grams: number }[],
  cookedWeightG: number | null,
  servings: number | null,
): { food: NewCustomFood } | { error: string } {
  if (!name.trim()) return { error: 'Give the recipe a name.' }
  if (!parts.length) return { error: 'Add at least one ingredient.' }
  if (parts.some((p) => !(p.grams > 0 && p.grams <= 20000))) return { error: 'Each ingredient needs a weight between 1 and 20000 g.' }
  const rawG = parts.reduce((s, p) => s + p.grams, 0)
  const cooked = cookedWeightG ?? rawG
  if (!(cooked > 0 && cooked <= 50000)) return { error: 'The cooked weight should be between 1 and 50000 g.' }
  if (servings !== null && !(Number.isInteger(servings) && servings >= 1 && servings <= 100))
    return { error: 'Servings should be a whole number from 1 to 100.' }

  const total = { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 }
  for (const { food, grams } of parts) {
    const k = grams / 100
    total.kcal += food.per100g.kcal * k
    total.proteinG += food.per100g.proteinG * k
    total.carbG += food.per100g.carbG * k
    total.fatG += food.per100g.fatG * k
  }
  const per = 100 / cooked
  const per100g: Per100g = {
    kcal: Math.round(total.kcal * per),
    proteinG: round1(total.proteinG * per),
    carbG: round1(total.carbG * per),
    fatG: round1(total.fatG * per),
  }
  if (per100g.kcal > 950) return { error: 'The cooked weight looks too low for these ingredients. Weigh the finished dish.' }
  const portions: Portion[] = servings ? [{ label: '1 serving', grams: Math.round(cooked / servings) }] : []
  return {
    food: {
      name: name.trim(),
      state: 'cooked',
      per100g,
      portions,
      recipe: {
        ingredients: parts.map((p) => ({ foodId: p.food.id, name: p.food.name, grams: Math.round(p.grams) })),
        cookedWeightG: Math.round(cooked),
        servings,
      },
    },
  }
}

const toFood = (id: string, f: NewCustomFood): CustomFood => ({
  id,
  name: f.name,
  ...(f.brand ? { brand: f.brand } : {}),
  state: f.state,
  per100g: f.per100g,
  portions: f.portions,
  source: 'user',
  sourceId: id.replace(/^custom:/, ''),
  ...(f.recipe ? { recipe: f.recipe } : {}),
})

export function memoryCustomFoodStore(initial: NewCustomFood[] = []): CustomFoodStore {
  let next = 1
  const rows: CustomFood[] = initial.map((f) => toFood(`custom:${next++}`, f))
  return {
    async list() {
      return [...rows].reverse()
    },
    async add(f) {
      const food = toFood(`custom:${next++}`, f)
      rows.push(food)
      return food
    },
    async remove(id) {
      const i = rows.findIndex((r) => r.id === id)
      if (i >= 0) rows.splice(i, 1)
    },
  }
}

export interface CustomFoodRow {
  id: string
  name: string
  brand: string | null
  state: FoodState
  kcal: number | string
  protein_g: number | string
  carb_g: number | string
  fat_g: number | string
  portions: Portion[] | null
  recipe: RecipeInfo | null
}

export const customFromRow = (r: CustomFoodRow): CustomFood =>
  toFood(`custom:${r.id}`, {
    name: r.name,
    ...(r.brand ? { brand: r.brand } : {}),
    state: r.state,
    per100g: { kcal: Number(r.kcal), proteinG: Number(r.protein_g), carbG: Number(r.carb_g), fatG: Number(r.fat_g) },
    portions: r.portions ?? [],
    ...(r.recipe ? { recipe: r.recipe } : {}),
  })

export const customToRow = (f: NewCustomFood): Omit<CustomFoodRow, 'id'> => ({
  name: f.name,
  brand: f.brand ?? null,
  state: f.state,
  kcal: f.per100g.kcal,
  protein_g: f.per100g.proteinG,
  carb_g: f.per100g.carbG,
  fat_g: f.per100g.fatG,
  portions: f.portions,
  recipe: f.recipe ?? null,
})

const COLUMNS = 'id, name, brand, state, kcal, protein_g, carb_g, fat_g, portions, recipe'

export function supabaseCustomFoodStore(sb: SupabaseClient, userId: string): CustomFoodStore {
  return {
    async list() {
      const { data, error } = await sb.from('custom_foods').select(COLUMNS).eq('owner_id', userId).order('created_at', { ascending: false })
      if (error) throw error
      return (data as CustomFoodRow[]).map(customFromRow)
    },
    async add(f) {
      const { data, error } = await sb.from('custom_foods').insert(customToRow(f)).select(COLUMNS).single()
      if (error) throw error
      return customFromRow(data as CustomFoodRow)
    },
    async remove(id) {
      const { error } = await sb.from('custom_foods').delete().eq('id', id.replace(/^custom:/, ''))
      if (error) throw error
    },
  }
}
