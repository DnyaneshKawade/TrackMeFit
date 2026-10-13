// Meal plan engine: a suggested day of meals that starts from what the
// person already eats, adds the protein foods they picked to close the
// protein gap, then fits calories with their own cereals and fats. Every
// amount is raw (uncooked, dry) grams within a per-meal and per-day cap, and
// every item says why it is there. Pure: foods and targets are passed in.
// Spec: specs/T-058-meal-plan.md. Evidence: ICMR-NIN "My Plate for the Day"
// (2024), Morton et al. 2018, Schoenfeld and Aragon 2018.

import type { DietTag, Per100g } from '../food/types'
import type { Macros } from './diet'

export type FoodGroup = 'cereal' | 'pulse' | 'dairy' | 'soy' | 'egg' | 'meat' | 'fish' | 'nut' | 'fat' | 'veg' | 'fruit' | 'sugar' | 'supplement'

export interface PlanFood {
  id: string
  name: string
  group: FoodGroup
  /** Per 100 g as weighed: raw, dry, or as sold. */
  per100g: Per100g
  /** How the weight is meant: "raw", "dry" (dals, flour, soya) or "as sold". */
  weighed: 'raw' | 'dry' | 'as sold'
  /** Grams cooked per gram raw, for the "about N g cooked" hint. */
  cookedFactor?: number
  /** A countable piece, e.g. 30 g atta = 1 roti, 50 g = 1 egg. */
  piece?: { grams: number; one: string; many: string }
  /** Amounts move in this step (5 g, or 50 g for eggs). */
  stepG?: number
  maxPerMealG: number
  maxPerDayG: number
  /** Meals this food usually goes in; defaults by group. */
  meals?: MealName[]
  tags: DietTag[]
  /** Values borrowed from a similar USDA food until we have an Indian label. */
  standIn?: string
}

export interface MealPlanInput {
  targets: Macros
  weightKg: number
  /** The person's usual day as raw foods (see typicalDayToBase). */
  base: { foodId: string; grams: number }[]
  /** Protein foods the person picked. */
  picks: string[]
  /** Foods the person's diet allows, already filtered. */
  foods: PlanFood[]
}

export interface PlanItem {
  foodId: string
  name: string
  grams: number
  weighed: PlanFood['weighed']
  /** "about 180 g cooked", "3 roti", "2 eggs". */
  hint?: string
  macros: Macros
  reason: string
}

export interface Meal {
  name: MealName
  items: PlanItem[]
  macros: Macros
}

export type MealName = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'
export const MEALS: MealName[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner']

export interface Feasibility {
  /** Most protein these foods can give within their caps and the calories. */
  reachableProteinG: number
  feasible: boolean
  message: string
  /** Allowed protein foods not picked, best first, to close the gap. */
  suggestions: PlanFood[]
}

export interface MealPlan {
  meals: Meal[]
  totals: Macros
  feasibility: Feasibility
  /** True when calories are within 5% and protein within 5 g of target. */
  onTarget: boolean
  /** Plan-level notes: caps hit, foods left out, what to check. */
  notes: string[]
}

/** ICMR-NIN "My Plate": about 400 g vegetables and 100 g fruit a day. */
export const VEG_G = 400
export const FRUIT_G = 100
/** ICMR-NIN: added sugar at most 25 g a day. */
export const SUGAR_MAX_G = 25
/** Schoenfeld and Aragon 2018: 0.4 g/kg per meal, up to 0.55 g/kg. */
export const PROTEIN_PER_MEAL_KG = 0.4
export const MAX_PROTEIN_PER_MEAL_KG = 0.55
const PROTEIN_GROUPS: FoodGroup[] = ['pulse', 'dairy', 'soy', 'egg', 'meat', 'fish', 'supplement']
const MAIN_MEALS: MealName[] = ['Breakfast', 'Lunch', 'Dinner']
const DEFAULT_MEALS: Partial<Record<FoodGroup, MealName[]>> = {
  cereal: ['Breakfast', 'Lunch', 'Dinner'],
  veg: ['Lunch', 'Dinner'],
  fat: ['Lunch', 'Dinner'],
  fruit: ['Snack'],
  sugar: ['Breakfast', 'Snack'],
  pulse: ['Lunch', 'Dinner'],
  meat: ['Lunch', 'Dinner'],
  fish: ['Lunch', 'Dinner'],
}
const mealsFor = (f: PlanFood): MealName[] => f.meals ?? DEFAULT_MEALS[f.group] ?? MEALS

const round1 = (n: number) => Math.round(n * 10) / 10
const step = (f: PlanFood) => f.stepG ?? 5
const floorTo = (f: PlanFood, g: number) => Math.floor(g / step(f) + 1e-9) * step(f)
const ceilTo = (f: PlanFood, g: number) => Math.ceil(g / step(f) - 1e-9) * step(f)
const roundTo = (f: PlanFood, g: number) => Math.round(g / step(f)) * step(f)

export function macrosFor(f: PlanFood, grams: number): Macros {
  const k = grams / 100
  return {
    kcal: Math.round(f.per100g.kcal * k),
    proteinG: round1(f.per100g.proteinG * k),
    carbG: round1(f.per100g.carbG * k),
    fatG: round1(f.per100g.fatG * k),
  }
}

const add = (a: Macros, b: Macros): Macros => ({
  kcal: a.kcal + b.kcal,
  proteinG: round1(a.proteinG + b.proteinG),
  carbG: round1(a.carbG + b.carbG),
  fatG: round1(a.fatG + b.fatG),
})
const ZERO: Macros = { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 }

/** Protein per 100 kcal: the leanest protein foods fill a gap first. */
const leanness = (f: PlanFood) => f.per100g.proteinG / Math.max(1, f.per100g.kcal)

const fmtG = (g: number) => `${g} g`

export function amountHint(f: PlanFood, grams: number): string | undefined {
  if (f.piece) {
    const n = Math.round((grams / f.piece.grams) * 2) / 2
    return `about ${n} ${n === 1 ? f.piece.one : f.piece.many}`
  }
  if (f.cookedFactor) return `about ${Math.round((grams * f.cookedFactor) / 10) * 10} g cooked`
  return undefined
}

type Day = Map<string, number>

function totalsOf(day: Day, byId: Map<string, PlanFood>, only?: (f: PlanFood) => boolean): Macros {
  let t = ZERO
  for (const [id, g] of day) {
    const f = byId.get(id)!
    if (!only || only(f)) t = add(t, macrosFor(f, g))
  }
  return t
}

/** Whether the picks can reach the protein target within their caps and
 * the calories, from the plan itself so the two always agree. */
export const checkFeasibility = (input: MealPlanInput): Feasibility => buildMealPlan(input).feasibility

function feasibilityOf(input: MealPlanInput, proteinG: number): Feasibility {
  const target = input.targets.proteinG
  const reachable = Math.round(proteinG)
  const feasible = reachable >= target - 5
  const pickedIds = new Set(input.picks)
  const suggestions = feasible
    ? []
    : input.foods
        .filter((f) => PROTEIN_GROUPS.includes(f.group) && !pickedIds.has(f.id))
        .sort((a, b) => leanness(b) - leanness(a))
        .slice(0, 3)
  const message = feasible
    ? `With these foods you can reach your ${target} g protein.`
    : `With these foods you can reach about ${reachable} g of your ${target} g protein, because each food has a sensible daily limit.` +
      (suggestions.length ? ` Adding ${suggestions.map((s) => s.name.toLowerCase()).join(', ')} would help.` : '')
  return { reachableProteinG: reachable, feasible, message, suggestions }
}

/** Builds the suggested day. Nothing here is saved; the person accepts it. */
export function buildMealPlan(input: MealPlanInput): MealPlan {
  const { targets, weightKg } = input
  const byId = new Map(input.foods.map((f) => [f.id, f]))
  const day: Day = new Map()
  const why = new Map<string, string>()
  const notes: string[] = []
  const set = (f: PlanFood, g: number, reason?: string) => {
    if (g <= 0) day.delete(f.id)
    else day.set(f.id, g)
    if (reason && !why.has(f.id)) why.set(f.id, reason)
  }
  const capNote = (f: PlanFood) => notes.push(`${f.name} is kept to ${fmtG(f.maxPerDayG)} ${f.weighed} a day, a sensible amount for one food.`)

  // 1. The usual day, within the caps.
  const left = new Set<string>()
  for (const b of input.base) {
    const f = byId.get(b.foodId)
    if (!f) {
      left.add(b.foodId)
      continue
    }
    const g = (day.get(f.id) ?? 0) + b.grams
    if (g > f.maxPerDayG) capNote(f)
    set(f, roundTo(f, Math.min(g, f.maxPerDayG)), 'From your usual day.')
  }
  if (left.size) notes.push('Foods your diet leaves out were not carried into the plan.')

  // 2. Basics from ICMR-NIN "My Plate": vegetables and fruit.
  const veg = input.foods.find((f) => f.group === 'veg')
  if (veg && (day.get(veg.id) ?? 0) < VEG_G)
    set(veg, Math.min(VEG_G, veg.maxPerDayG), day.has(veg.id) ? 'More vegetables: ICMR suggests about 400 g a day.' : 'ICMR suggests about 400 g of vegetables a day.')
  const fruits = input.foods.filter((f) => f.group === 'fruit')
  if (fruits.length && !fruits.some((f) => day.has(f.id))) set(fruits[0], FRUIT_G, 'ICMR suggests about 100 g of fruit a day.')
  for (const f of input.foods.filter((x) => x.group === 'sugar' && day.has(x.id)))
    if (day.get(f.id)! > SUGAR_MAX_G) set(f, SUGAR_MAX_G, 'Added sugar is kept to 25 g a day (ICMR).')

  // 3. Close the protein gap with the picked foods: more of what they already
  // eat first, then the leanest new ones.
  const picks = input.picks
    .map((id) => byId.get(id))
    .filter((f): f is PlanFood => !!f)
    .sort((a, b) => Number(day.has(b.id)) - Number(day.has(a.id)) || leanness(b) - leanness(a))
  const added = new Map<string, number>()
  const fillProtein = () => {
    for (const f of picks) {
      const gap = targets.proteinG - totalsOf(day, byId).proteinG
      if (gap <= 0) break
      const have = day.get(f.id) ?? 0
      const need = ceilTo(f, (gap / f.per100g.proteinG) * 100)
      const room = floorTo(f, f.maxPerDayG - have)
      const addG = Math.min(need, room)
      if (addG <= 0) continue
      if (need > room) capNote(f)
      added.set(f.id, (added.get(f.id) ?? 0) + addG)
      set(f, have + addG, `Added for protein: ${round1(f.per100g.proteinG)} g protein per 100 g.`)
    }
  }
  // Cereals and vegetables bring protein too: take back what overshoots,
  // from the last foods added.
  const trimProtein = () => {
    for (const f of [...picks].reverse()) {
      const over = totalsOf(day, byId).proteinG - targets.proteinG
      if (over <= 2) return
      const extra = added.get(f.id) ?? 0
      const cut = Math.min(extra, floorTo(f, (over / f.per100g.proteinG) * 100))
      if (cut <= 0) continue
      added.set(f.id, extra - cut)
      set(f, day.get(f.id)! - cut)
    }
  }

  // 4. Fit fat, then calories with cereals. Protein foods also bring fat and
  // carbs, so settle it in a few passes.
  const fats = input.foods.filter((f) => f.group === 'fat')
  const fatFood = fats.find((f) => day.has(f.id)) ?? fats[0]
  const fatCap = (f: PlanFood) => Math.min(f.maxPerDayG, Math.round((27 * targets.kcal) / 2000))
  const cereals = () => input.foods.filter((f) => f.group === 'cereal' && day.has(f.id))
  for (let pass = 0; pass < 5; pass++) {
    fillProtein()
    if (fatFood) {
      const otherFat = totalsOf(day, byId, (f) => f.id !== fatFood.id).fatG
      const want = ((targets.fatG - otherFat) / fatFood.per100g.fatG) * 100
      set(fatFood, roundTo(fatFood, Math.max(5, Math.min(want, fatCap(fatFood)))), 'Cooking fat, kept near ICMR’s 27 g per 2,000 kcal.')
    }
    if (!cereals().length) {
      const c = input.foods.find((f) => f.group === 'cereal')
      if (c) set(c, 50, 'A cereal for energy.')
    }
    const nonCereal = totalsOf(day, byId, (f) => f.group !== 'cereal').kcal
    const cerealKcal = totalsOf(day, byId, (f) => f.group === 'cereal').kcal
    const want = targets.kcal - nonCereal
    if (cerealKcal <= 0) break
    const scale = Math.max(0, want / cerealKcal)
    for (const c of cereals()) {
      const g = roundTo(c, Math.min(c.maxPerDayG, day.get(c.id)! * scale))
      set(c, g, 'Your usual cereal, amount set to fit your calories.')
    }
    // Still short and every cereal at its cap: add another the diet allows.
    const short = targets.kcal - totalsOf(day, byId).kcal
    if (short > targets.kcal * 0.05 && cereals().every((c) => day.get(c.id)! >= c.maxPerDayG)) {
      const extra = input.foods.find((f) => f.group === 'cereal' && !day.has(f.id))
      if (extra) set(extra, roundTo(extra, Math.min(extra.maxPerDayG, (short / extra.per100g.kcal) * 100)), 'Another cereal, since the first is at its limit.')
    }
    trimProtein()
  }

  const totals = totalsOf(day, byId)
  const feasibility = feasibilityOf(input, totals.proteinG)
  const onTarget = Math.abs(totals.kcal - targets.kcal) <= targets.kcal * 0.05 && Math.abs(totals.proteinG - targets.proteinG) <= 5
  if (totals.kcal > targets.kcal * 1.05) notes.push('Even at small amounts these foods go over your calories; try leaner protein picks.')

  return { meals: splitMeals(day, byId, why, weightKg), totals, feasibility, onTarget, notes: [...new Set(notes)] }
}

/** Spreads the day over four meals: cereals and vegetables with the main
 * meals, fruit as a snack, and protein in portions given to whichever meal
 * has the least so far, never more than a food's per-meal cap. Pulses go to
 * lunch and dinner, so vegetarian main meals pair a cereal with dal. Then no
 * meal is left above 0.55 g protein per kg (Schoenfeld and Aragon 2018). */
export function splitMeals(day: Day, byId: Map<string, PlanFood>, why: Map<string, string>, weightKg: number): Meal[] {
  const parts = new Map<MealName, Map<string, number>>(MEALS.map((m) => [m, new Map()]))
  const put = (m: MealName, f: PlanFood, g: number) => {
    if (g <= 0) return
    const p = parts.get(m)!
    p.set(f.id, (p.get(f.id) ?? 0) + g)
  }
  const proteinIn = (m: MealName) => {
    let s = 0
    for (const [id, g] of parts.get(m)!) s += (byId.get(id)!.per100g.proteinG * g) / 100
    return s
  }
  const isProtein = (f: PlanFood) => PROTEIN_GROUPS.includes(f.group) || f.group === 'nut'

  const foods = [...day].map(([id, g]) => ({ f: byId.get(id)!, g }))
  for (const { f, g } of foods) {
    if (isProtein(f)) continue
    const meals = mealsFor(f)
    let leftG = g
    meals.forEach((m, i) => {
      const share = i === meals.length - 1 ? leftG : Math.min(leftG, roundTo(f, g / meals.length))
      put(m, f, share)
      leftG -= share
    })
  }
  // Protein in portions: pulses first, then the biggest sources.
  const protein = foods
    .filter(({ f }) => isProtein(f))
    .sort((a, b) => Number(b.f.group === 'pulse') - Number(a.f.group === 'pulse') || b.g * b.f.per100g.proteinG - a.g * a.f.per100g.proteinG)
  for (const { f, g } of protein) {
    const allowed = mealsFor(f)
    const n = Math.min(allowed.length, Math.max(Math.ceil(g / f.maxPerMealG), f.group === 'pulse' && g >= 2 * step(f) ? 2 : 1))
    const portion = ceilTo(f, g / n)
    let leftG = g
    for (let i = 0; i < n && leftG > 0; i++) {
      const free = allowed.filter((m) => !parts.get(m)!.has(f.id))
      const m = (free.length ? free : allowed).reduce((a, b) => (proteinIn(b) < proteinIn(a) ? b : a))
      const take = Math.min(portion, leftG)
      put(m, f, take)
      leftG -= take
    }
  }
  // Move protein out of any meal above the per-meal maximum, into meals the
  // food suits that have room, a step at a time (some roti can move to
  // breakfast as well as dal or paneer).
  const max = MAX_PROTEIN_PER_MEAL_KG * weightKg
  const moveOne = (top: MealName): boolean => {
    const excess = proteinIn(top) - max
    for (const [id, g] of [...parts.get(top)!].sort(([a], [b]) => byId.get(a)!.per100g.proteinG - byId.get(b)!.per100g.proteinG)) {
      const f = byId.get(id)!
      if (f.group === 'veg' || f.group === 'fat' || f.per100g.proteinG < 5) continue
      // When needed, dal or soya can go to breakfast (moong chilla, soya
      // poha) and a roti to the snack (a roti roll).
      const extra: MealName[] = f.group === 'pulse' || f.group === 'soy' ? ['Breakfast'] : f.id === 'tmf:ing:atta' ? ['Breakfast', 'Snack'] : []
      const options = [...new Set([...mealsFor(f), ...extra])]
      const dest = options
        .filter((m) => m !== top && proteinIn(m) < max && (parts.get(m)!.get(id) ?? 0) < f.maxPerMealG)
        .sort((a, b) => proteinIn(a) - proteinIn(b))[0]
      if (!dest) continue
      const perG = f.per100g.proteinG / 100
      const room = Math.min((max - proteinIn(dest)) / perG, f.maxPerMealG - (parts.get(dest)!.get(id) ?? 0))
      const take = Math.min(g, ceilTo(f, excess / perG), floorTo(f, room))
      if (take <= 0) continue
      if (take === g) parts.get(top)!.delete(id)
      else parts.get(top)!.set(id, g - take)
      put(dest, f, take)
      return true
    }
    return false
  }
  for (let guard = 0; guard < 50; guard++) {
    const over = MEALS.filter((m) => proteinIn(m) > max + 0.05)
    if (!over.length || !over.some(moveOne)) break
  }

  return MEALS.map((name) => {
    const items: PlanItem[] = [...parts.get(name)!].map(([id, g]) => {
      const f = byId.get(id)!
      let reason = why.get(id) ?? ''
      if (f.standIn) reason += ` Values from ${f.standIn} until we have an Indian label.`
      return { foodId: id, name: f.name, grams: g, weighed: f.weighed, hint: amountHint(f, g), macros: macrosFor(f, g), reason: reason.trim() }
    })
    return { name, items, macros: items.reduce((t, i) => add(t, i.macros), ZERO) }
  }).filter((m) => m.items.length)
}

/** Grams of protein per meal the evidence suggests for this weight. */
export const proteinPerMeal = (weightKg: number) => ({ aim: round1(PROTEIN_PER_MEAL_KG * weightKg), max: round1(MAX_PROTEIN_PER_MEAL_KG * weightKg) })

export { MAIN_MEALS }
