// Meal plan engine: a suggested day of clean, home-style meals. Each main
// meal has a cereal base, one protein food and vegetables, using the foods
// the person already eats and the protein foods they picked. Amounts are
// whole units (a roti, half a katori) in raw grams, within a per-meal and
// per-day cap, and every item says why it is there. Pure: foods and targets
// are passed in. Specs: specs/T-058-meal-plan.md, specs/T-068b-clean-meal-plan.md. Evidence: ICMR-NIN "My Plate for the Day"
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
  /** Amounts move in this step: a roti (30 g atta), half a katori, an egg. */
  stepG?: number
  /** The smallest amount in a meal, so a plan never says "10 g atta". */
  minG?: number
  /** A protein food that goes with a meal, not the main one (milk, curd). */
  side?: boolean
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
  /** How the grams are meant; "as eaten" for a food added from search (T-061b). */
  weighed: PlanFood['weighed'] | 'as eaten'
  /** "about 180 g cooked", "3 roti", "2 eggs". */
  hint?: string
  macros: Macros
  reason: string
  /** Diet tags of a food added from search, so a veg day can swap it. */
  tags?: DietTag[]
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
  targets: Macros
  meals: Meal[]
  totals: Macros
  feasibility: Feasibility
  /** True when calories are within 8% and protein within 5 g of target. */
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
const minOf = (f: PlanFood) => f.minG ?? step(f)
/** Cereals start at this share of calories (ICMR "My Plate" has about 45 %). */
const CEREAL_SHARE = 0.4
const MEAL_SHARE: Record<MealName, number> = { Breakfast: 0.25, Lunch: 0.4, Snack: 0, Dinner: 0.35 }
/** A day 8 % off its calories is close enough: better than odd amounts. */
export const CLOSE_ENOUGH = 0.08
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

/** 1.5 as "1½", 0.5 as "½". */
const halves = (n: number) => (n % 1 ? `${Math.floor(n) || ''}½` : String(n))

export function amountHint(f: PlanFood, grams: number): string | undefined {
  if (f.piece) {
    const n = Math.round((grams / f.piece.grams) * 2) / 2
    return `about ${halves(n)} ${n === 1 || n < 1 ? f.piece.one : f.piece.many}`
  }
  if (f.cookedFactor) return `about ${Math.round((grams * f.cookedFactor) / 10) * 10} g cooked`
  return undefined
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
    : `These foods give about ${reachable} g of your ${target} g protein. Each food has a fair daily limit.` +
      (suggestions.length ? ` Adding ${suggestions.map((s) => s.name.toLowerCase()).join(', ')} will help.` : '')
  return { reachableProteinG: reachable, feasible, message, suggestions }
}

/** Builds the suggested day (spec T-068b). Each main meal gets a cereal base,
 * one main protein food (never two dals) and vegetables; breakfast and the
 * snack get a protein food where the diet allows. Amounts start at each
 * food's smallest amount and grow in whole steps (a roti, half a katori).
 * The usual day decides which clean foods the person eats, never how much;
 * fried snacks and sweets never reach it (see typicalDayToBase). Nothing here
 * is saved; the person accepts it. */
export function buildMealPlan(input: MealPlanInput): MealPlan {
  const { targets, weightKg } = input
  const byId = new Map(input.foods.map((f) => [f.id, f]))
  const notes: string[] = []
  const usual = new Set<string>()
  let usualSugar = 0
  for (const b of input.base) {
    const f = byId.get(b.foodId)
    if (!f) continue
    usual.add(f.id)
    if (f.group === 'sugar') usualSugar += b.grams
  }
  if (input.base.some((b) => !byId.has(b.foodId))) notes.push('Foods your diet leaves out were not carried into the plan.')

  const slots = new Map<MealName, Map<string, number>>(MEALS.map((m) => [m, new Map()]))
  const why = new Map<string, string>()
  const inMeal = (m: MealName, id: string) => slots.get(m)!.get(id) ?? 0
  const inDay = (id: string) => MEALS.reduce((s, m) => s + inMeal(m, id), 0)
  const fits = (m: MealName, f: PlanFood) => mealsFor(f).includes(m)
  const room = (m: MealName, f: PlanFood) => Math.min(f.maxPerMealG - inMeal(m, f.id), f.maxPerDayG - inDay(f.id))
  const has = (m: MealName, test: (f: PlanFood) => boolean) => [...slots.get(m)!.keys()].some((id) => test(byId.get(id)!))
  const put = (m: MealName, f: PlanFood, grams: number, reason: string) => {
    slots.get(m)!.set(f.id, grams)
    if (!why.has(f.id)) why.set(f.id, reason)
  }
  const proteinReason = (f: PlanFood) => (usual.has(f.id) ? 'From your usual day.' : `Added for protein: ${round1(f.per100g.proteinG)} g protein per 100 g.`)
  const usualFirst = (list: PlanFood[]) => [...list].sort((a, b) => Number(usual.has(b.id)) - Number(usual.has(a.id)))

  // 1. Choose the foods for each meal.
  const cereals = input.foods.filter((f) => f.group === 'cereal')
  const myCereals = cereals.filter((c) => usual.has(c.id))
  const cerealFor = (m: MealName): PlanFood[] => {
    const mine = myCereals.filter((c) => fits(m, c))
    const any = cereals.filter((c) => fits(m, c))
    // Breakfast: one cereal, oats or sooji when the person eats them.
    if (m === 'Breakfast') return [mine.find((c) => c.meals?.includes('Breakfast')) ?? mine[0] ?? any[0]].filter(Boolean)
    // Lunch can be roti and rice together; dinner keeps to one.
    return (mine.length ? mine : any).slice(0, m === 'Lunch' ? 2 : 1)
  }
  const choices = usualFirst(input.foods.filter((f) => PROTEIN_GROUPS.includes(f.group) || f.group === 'nut').filter((f) => input.picks.includes(f.id) || usual.has(f.id)))
  const isMain = (f: PlanFood) => !f.side && f.group !== 'nut' && f.group !== 'supplement'
  const mains = choices.filter(isMain)
  const fallback = input.foods.find((f) => f.group === 'pulse')
  const mainFor = (m: MealName, not?: PlanFood): PlanFood | undefined => {
    const ok = mains.filter((f) => fits(m, f))
    const pulse = ok.find((f) => f.group === 'pulse')
    if (m === 'Lunch') return pulse ?? ok.find((f) => f.group !== 'egg') ?? ok[0] ?? fallback
    // Dinner: a different kind of food from lunch when there is a choice,
    // the leanest first; eggs last.
    const same = (f: PlanFood) => Number(f.id === not?.id) + Number(f.group === not?.group)
    return [...ok].sort((a, b) => same(a) - same(b) || Number(a.group === 'egg') - Number(b.group === 'egg') || leanness(b) - leanness(a))[0] ?? not ?? fallback
  }
  const sideFor = (m: MealName, not?: PlanFood): PlanFood | undefined => {
    const ok = choices.filter((f) => fits(m, f) && f.id !== not?.id)
    const rank = (f: PlanFood) => (f.group === 'egg' ? 0 : f.side ? 1 : f.group === 'dairy' ? 2 : f.group === 'supplement' ? 3 : f.group === 'nut' ? 4 : 5)
    return [...ok].sort((a, b) => rank(a) - rank(b))[0]
  }

  // Cereals start at about 40 % of calories, the base of each main meal.
  for (const m of MEALS) {
    const base = m === 'Snack' ? [] : cerealFor(m)
    for (const c of base) {
      const kcal = (CEREAL_SHARE * targets.kcal * MEAL_SHARE[m]) / base.length
      const grams = Math.max(minOf(c), Math.min(floorTo(c, room(m, c)), roundTo(c, (kcal / c.per100g.kcal) * 100)))
      if (room(m, c) < grams) continue
      put(m, c, grams, usual.has(c.id) ? 'From your usual day, as the base of the meal.' : 'A cereal as the base of the meal.')
    }
  }
  const lunch = mainFor('Lunch')
  if (lunch) put('Lunch', lunch, minOf(lunch), proteinReason(lunch))
  const dinner = mainFor('Dinner', lunch)
  if (dinner) put('Dinner', dinner, minOf(dinner), proteinReason(dinner))
  const breakfast = sideFor('Breakfast')
  if (breakfast) put('Breakfast', breakfast, minOf(breakfast), proteinReason(breakfast))
  const snack = choices.filter((f) => fits('Snack', f) && (f.side || f.group === 'nut' || f.group === 'supplement')).sort((a, b) => Number(a.id === breakfast?.id) - Number(b.id === breakfast?.id))[0]
  if (snack) put('Snack', snack, minOf(snack), proteinReason(snack))
  const curd = choices.find((f) => f.side && fits('Lunch', f) && f.meals?.includes('Lunch'))
  if (curd && !has('Lunch', (f) => f.id === curd.id)) put('Lunch', curd, minOf(curd), proteinReason(curd))

  const veg = input.foods.find((f) => f.group === 'veg')
  if (veg) for (const m of ['Lunch', 'Dinner'] as MealName[]) put(m, veg, Math.min(VEG_G / 2, veg.maxPerMealG), 'ICMR suggests about 400 g of vegetables a day.')
  const fruit = usualFirst(input.foods.filter((f) => f.group === 'fruit'))[0]
  if (fruit) put('Snack', fruit, fruit.piece?.grams ?? FRUIT_G, 'ICMR suggests about 100 g of fruit a day.')
  // Sugar only for the person's own tea or milk, and kept low.
  const sugar = input.foods.find((f) => f.group === 'sugar')
  const withMilk = (['Breakfast', 'Snack'] as MealName[]).find((m) => has(m, (f) => f.id === 'tmf:ing:milk'))
  if (sugar && usualSugar > 0 && withMilk) put(withMilk, sugar, roundTo(sugar, Math.min(usualSugar, sugar.maxPerMealG)), 'Added sugar is kept low. ICMR says 25 g a day at most.')
  const fats = input.foods.filter((f) => f.group === 'fat')
  const fat = fats.find((f) => usual.has(f.id)) ?? fats[0]

  // 2. Fill protein, fat and calories in whole steps, in a few passes, since
  // each food brings some of all three.
  const total = () => {
    let t = ZERO
    for (const m of MEALS) for (const [id, g] of slots.get(m)!) t = add(t, macrosFor(byId.get(id)!, g))
    return t
  }
  const mealProtein = (m: MealName) => [...slots.get(m)!].reduce((s, [id, g]) => s + (byId.get(id)!.per100g.proteinG * g) / 100, 0)
  const mealKcal = (m: MealName) => [...slots.get(m)!].reduce((s, [id, g]) => s + (byId.get(id)!.per100g.kcal * g) / 100, 0)
  const maxProtein = MAX_PROTEIN_PER_MEAL_KG * weightKg
  const isProteinFood = (f: PlanFood) => PROTEIN_GROUPS.includes(f.group) || f.group === 'nut'
  const grow = (m: MealName, f: PlanFood) => slots.get(m)!.set(f.id, inMeal(m, f.id) + step(f))
  const shrink = (m: MealName, f: PlanFood) => slots.get(m)!.set(f.id, inMeal(m, f.id) - step(f))
  const entries = (test: (f: PlanFood) => boolean) => MEALS.flatMap((m) => [...slots.get(m)!.keys()].map((id) => ({ m, f: byId.get(id)! }))).filter(({ f }) => test(f))

  const fillProtein = () => {
    for (let guard = 0; guard < 200 && targets.proteinG - total().proteinG > 1; guard++) {
      const options = entries(isProteinFood).filter(({ m, f }) => room(m, f) >= step(f) && mealProtein(m) + (f.per100g.proteinG * step(f)) / 100 <= maxProtein + 1)
      if (options.length) {
        const best = options.sort((a, b) => leanness(b.f) - leanness(a.f) || mealProtein(a.m) - mealProtein(b.m))[0]
        grow(best.m, best.f)
        continue
      }
      // Every chosen food is at its limit: add another one to a meal,
      // never a second dal.
      const extra = MEALS.flatMap((m) =>
        choices
          .filter((f) => fits(m, f) && !slots.get(m)!.has(f.id) && !(f.group === 'pulse' && has(m, (x) => x.group === 'pulse')) && room(m, f) >= minOf(f) && mealProtein(m) + (f.per100g.proteinG * minOf(f)) / 100 <= maxProtein + 1)
          .map((f) => ({ m, f })),
      ).sort((a, b) => mealProtein(a.m) - mealProtein(b.m) || leanness(b.f) - leanness(a.f))[0]
      if (!extra) break
      put(extra.m, extra.f, minOf(extra.f), proteinReason(extra.f))
    }
  }
  const fitFat = () => {
    if (!fat) return
    const others = total().fatG - (inDay(fat.id) * fat.per100g.fatG) / 100
    const cap = Math.min(fat.maxPerDayG, Math.round((27 * targets.kcal) / 2000))
    const short = total().kcal < targets.kcal * (1 - CLOSE_ENOUGH / 2)
    // Keep oil added for calories while calories are still short.
    const want = Math.max(2 * step(fat), short ? inDay(fat.id) : 0, Math.min(cap, roundTo(fat, ((targets.fatG - others) / fat.per100g.fatG) * 100)))
    const lunchG = ceilTo(fat, want / 2)
    put('Lunch', fat, Math.min(fat.maxPerMealG, lunchG), 'Cooking fat, kept near ICMR’s 27 g per 2,000 kcal.')
    put('Dinner', fat, Math.min(fat.maxPerMealG, want - lunchG), 'Cooking fat, kept near ICMR’s 27 g per 2,000 kcal.')
  }
  const snackFillers = ['tmf:ing:curd', 'tmf:ing:milk', 'tmf:ing:peanuts'].map((id) => byId.get(id)).filter((f): f is PlanFood => !!f && fits('Snack', f))
  const fitCalories = () => {
    for (let guard = 0; guard < 200; guard++) {
      const kcal = total().kcal
      const ups = entries((f) => f.group === 'cereal').filter(({ m, f }) => room(m, f) >= step(f))
      const unit = (f: PlanFood) => (f.per100g.kcal * step(f)) / 100
      const up = ups.sort((a, b) => mealKcal(a.m) - mealKcal(b.m))[0]
      if (up && targets.kcal - kcal > unit(up.f) / 2) {
        grow(up.m, up.f)
        continue
      }
      // Every cereal is at its limit and calories are still short: add
      // another cereal to a main meal, like rice with dinner roti.
      if (!up && targets.kcal - kcal > targets.kcal * (CLOSE_ENOUGH / 2)) {
        const extra = (['Dinner', 'Lunch'] as MealName[])
          .flatMap((m) => cereals.filter((c) => fits(m, c) && !slots.get(m)!.has(c.id) && room(m, c) >= minOf(c)).map((c) => ({ m, c })))
          .sort((a, b) => mealKcal(a.m) - mealKcal(b.m) || Number(usual.has(b.c.id)) - Number(usual.has(a.c.id)))[0]
        if (extra) {
          put(extra.m, extra.c, minOf(extra.c), usual.has(extra.c.id) ? 'From your usual day, as the base of the meal.' : 'A cereal as the base of the meal.')
          continue
        }
        // Still short: a little more oil, up to ICMR's level.
        const oilCap = fat ? Math.min(fat.maxPerDayG, Math.round((27 * targets.kcal) / 2000)) : 0
        const oil = fat && inDay(fat.id) + step(fat) <= oilCap ? (['Lunch', 'Dinner'] as MealName[]).find((m) => room(m, fat) >= step(fat)) : undefined
        if (fat && oil) {
          grow(oil, fat)
          continue
        }
        // Still short: a bigger snack of curd, milk or peanuts.
        const more = snackFillers.find((f) => slots.get('Snack')!.has(f.id) && room('Snack', f) >= step(f))
        if (more) {
          grow('Snack', more)
          continue
        }
        const next = snackFillers.find((f) => !slots.get('Snack')!.has(f.id) && room('Snack', f) >= minOf(f))
        if (next) {
          put('Snack', next, minOf(next), usual.has(next.id) ? 'From your usual day.' : 'A filling snack for your calories.')
          continue
        }
      }
      if (kcal <= targets.kcal * 1.02) break
      // Over: take back protein steps that protein can spare, then cereals.
      // Far over: protein steps too, since calories come first.
      const protein = total().proteinG
      const spare = (f: PlanFood, far: boolean) => far || protein - (f.per100g.proteinG * step(f)) / 100 >= targets.proteinG - 3
      const lessProtein = (far: boolean) =>
        entries(isProteinFood)
          .filter(({ m, f }) => inMeal(m, f.id) - step(f) >= minOf(f) && spare(f, far))
          .sort((a, b) => leanness(a.f) - leanness(b.f))[0]
      const down =
        lessProtein(false) ??
        entries((f) => f.group === 'cereal').filter(({ m, f }) => inMeal(m, f.id) - step(f) >= minOf(f)).sort((a, b) => mealKcal(b.m) - mealKcal(a.m))[0] ??
        (kcal > targets.kcal * 1.05 ? lessProtein(true) : undefined)
      if (!down) break
      shrink(down.m, down.f)
    }
  }
  // Cereals bring protein too: take back protein steps that overshoot.
  const trimProtein = () => {
    for (let guard = 0; guard < 100; guard++) {
      const { proteinG, kcal } = total()
      const over = proteinG - targets.proteinG
      // A little extra protein is fine; going short on calories is not.
      const keepsKcal = (f: PlanFood) => kcal - (f.per100g.kcal * step(f)) / 100 >= targets.kcal * (1 - CLOSE_ENOUGH / 2)
      const cut = entries(isProteinFood)
        .filter(({ m, f }) => inMeal(m, f.id) - step(f) >= minOf(f) && (f.per100g.proteinG * step(f)) / 100 <= over && keepsKcal(f))
        .sort((a, b) => leanness(a.f) - leanness(b.f))[0]
      if (over <= 3 || !cut) break
      shrink(cut.m, cut.f)
    }
    // Bigger cereals can push a meal past its protein limit: take steps
    // back, then drop a food that was added only for protein.
    for (const m of MEALS)
      for (let guard = 0; guard < 50 && mealProtein(m) > maxProtein + 0.1; guard++) {
        const here = entries(isProteinFood).filter((e) => e.m === m)
        const less = here.filter(({ f }) => inMeal(m, f.id) - step(f) >= minOf(f)).sort((a, b) => leanness(a.f) - leanness(b.f))[0]
        if (less) {
          shrink(m, less.f)
          continue
        }
        const added = here.find(({ f }) => f.id !== lunch?.id && f.id !== dinner?.id && f.id !== breakfast?.id && f.id !== snack?.id)
        if (!added) break
        slots.get(m)!.delete(added.f.id)
      }
  }
  for (let pass = 0; pass < 4; pass++) {
    fillProtein()
    fitFat()
    fitCalories()
    trimProtein()
  }

  const totals = total()
  if (targets.proteinG - totals.proteinG > 5)
    for (const f of choices) if (inDay(f.id) >= f.maxPerDayG) notes.push(`${f.name} is kept to ${fmtG(f.maxPerDayG)} ${f.weighed} a day. That is a fair amount for one food.`)
  if (totals.kcal > targets.kcal * (1 + CLOSE_ENOUGH)) notes.push('Even small amounts of these foods go over your calories. Try leaner protein picks.')

  const meals = MEALS.map((name) => {
    const items: PlanItem[] = [...slots.get(name)!]
      .filter(([, g]) => g > 0)
      .map(([id, g]) => {
        const f = byId.get(id)!
        const reason = (why.get(id) ?? '') + (f.standIn ? ` Values from ${f.standIn} until we have an Indian label.` : '')
        return { foodId: id, name: f.name, grams: g, weighed: f.weighed, hint: amountHint(f, g), macros: macrosFor(f, g), reason: reason.trim() }
      })
    return { name, items, macros: items.reduce((t, i) => add(t, i.macros), ZERO) }
  }).filter((m) => m.items.length)
  return { targets, meals, totals, feasibility: feasibilityOf(input, totals.proteinG), onTarget: isOnTarget(totals, targets), notes: [...new Set(notes)] }
}

const isOnTarget = (totals: Macros, targets: Macros) =>
  Math.abs(totals.kcal - targets.kcal) <= targets.kcal * CLOSE_ENOUGH && Math.abs(totals.proteinG - targets.proteinG) <= 5

/** Foods an item can be swapped for: any protein food for a protein food,
 * otherwise the same group (one cereal for another). */
export function swapOptions(from: PlanFood, foods: PlanFood[]): PlanFood[] {
  const protein = PROTEIN_GROUPS.includes(from.group)
  return foods.filter((f) => f.id !== from.id && (protein ? PROTEIN_GROUPS.includes(f.group) : f.group === from.group))
}

/** Swaps one item for another food: the same protein for protein foods, the
 * same calories otherwise, within the new food's limits. Totals update; the
 * person sees the change before accepting anything. */
export function swapItem(plan: MealPlan, meal: MealName, fromId: string, to: PlanFood, foods: PlanFood[]): MealPlan {
  const byId = new Map(foods.map((f) => [f.id, f]))
  const from = byId.get(fromId)
  const target = plan.meals.find((m) => m.name === meal)
  const item = target?.items.find((i) => i.foodId === fromId)
  if (!from || !target || !item) return plan
  const usedElsewhere = plan.meals.flatMap((m) => m.items).filter((i) => i.foodId === to.id && !(i === item)).reduce((sum, i) => sum + i.grams, 0)
  const inThisMeal = target.items.find((i) => i.foodId === to.id)?.grams ?? 0
  const protein = PROTEIN_GROUPS.includes(from.group)
  const want = protein ? (item.macros.proteinG / to.per100g.proteinG) * 100 : (item.macros.kcal / to.per100g.kcal) * 100
  const grams = Math.max(minOf(to), Math.min(roundTo(to, want), floorTo(to, to.maxPerMealG - inThisMeal), floorTo(to, to.maxPerDayG - usedElsewhere)))
  const merged = inThisMeal + grams
  const swapped: PlanItem = {
    foodId: to.id,
    name: to.name,
    grams: merged,
    weighed: to.weighed,
    hint: amountHint(to, merged),
    macros: macrosFor(to, merged),
    reason: `Swapped in for ${from.name.toLowerCase()}.` + (to.standIn ? ` Values from ${to.standIn} until we have an Indian label.` : ''),
  }
  const meals = plan.meals.map((m) => {
    if (m !== target) return m
    const items = m.items.filter((i) => i.foodId !== fromId && i.foodId !== to.id)
    items.splice(Math.max(0, m.items.indexOf(item)), 0, swapped)
    return { ...m, items, macros: items.reduce((t, i) => add(t, i.macros), ZERO) }
  })
  const totals = meals.reduce((t, m) => add(t, m.macros), ZERO)
  return { ...plan, meals, totals, onTarget: isOnTarget(totals, plan.targets) }
}

/** Grams of protein per meal the evidence suggests for this weight. */
export const proteinPerMeal = (weightKg: number) => ({ aim: round1(PROTEIN_PER_MEAL_KG * weightKg), max: round1(MAX_PROTEIN_PER_MEAL_KG * weightKg) })

export { MAIN_MEALS }

/** Cooked weight for a raw amount, to the nearest 10 g, when known. */
export const cookedGrams = (f: PlanFood, grams: number): number | null =>
  f.cookedFactor ? Math.round((grams * f.cookedFactor) / 10) * 10 : null

/** Veg protein foods to fall back on when the person picked none, best first. */
export const VEG_FALLBACKS = ['tmf:ing:paneer', 'tmf:ing:toor-dal', 'tmf:ing:soya-chunks', 'usda:172475']

/** The plan for a non-veg-free day: each item the day leaves out is swapped
 * for an allowed protein food of about the same protein (the person's picks
 * first, then VEG_FALLBACKS), with the day's reason (`why`, e.g. "Tuesday is
 * your non-veg-free day"). Items with no allowed
 * swap are dropped with a note. Spec: specs/T-058c-nonveg-free-days.md. */
export function vegDayPlan(plan: MealPlan, foods: PlanFood[], allowed: Set<string>, picks: string[], why: string): MealPlan {
  const byId = new Map(foods.map((f) => [f.id, f]))
  const choices = [...picks, ...VEG_FALLBACKS]
    .filter((id, i, all) => all.indexOf(id) === i && allowed.has(id))
    .map((id) => byId.get(id))
    .filter((f): f is PlanFood => !!f && PROTEIN_GROUPS.includes(f.group))
  let out = plan
  const notes: string[] = []
  const used = (id: string) => out.meals.flatMap((m) => m.items).filter((i) => i.foodId === id).reduce((sum, i) => sum + i.grams, 0)
  const inMeal = (meal: MealName, id: string) => out.meals.find((m) => m.name === meal)?.items.find((i) => i.foodId === id)?.grams ?? 0
  const setMeal = (meal: MealName, items: PlanItem[]) => {
    out = { ...out, meals: out.meals.map((m) => (m.name === meal ? { ...m, items, macros: items.reduce((t, i) => add(t, i.macros), ZERO) } : m)) }
  }
  for (const meal of plan.meals)
    for (const item of meal.items) {
      if (allowed.has(item.foodId)) continue
      const from = item.name.toLowerCase()
      const swappedFor = (to: PlanFood) => `${why}, so ${from} is swapped for ${to.name.toLowerCase()}.`
      // Fill the item's protein from the choices in order, each within its limits.
      let need = item.macros.proteinG
      const added: PlanItem[] = []
      for (const to of choices) {
        if (need < 2) break
        const room = Math.min(to.maxPerMealG - inMeal(meal.name, to.id), to.maxPerDayG - used(to.id))
        const grams = Math.min(Math.max(minOf(to), roundTo(to, (need / to.per100g.proteinG) * 100)), floorTo(to, room))
        if (grams < minOf(to)) continue
        const merged = inMeal(meal.name, to.id) + grams
        const current = out.meals.find((m) => m.name === meal.name)!.items
        const swapped: PlanItem = { foodId: to.id, name: to.name, grams: merged, weighed: to.weighed, hint: amountHint(to, merged), macros: macrosFor(to, merged), reason: swappedFor(to) }
        setMeal(meal.name, [...current.filter((i) => i.foodId !== to.id), swapped])
        added.push(swapped)
        need -= macrosFor(to, grams).proteinG
      }
      const current = out.meals.find((m) => m.name === meal.name)!.items
      const at = current.findIndex((i) => i.foodId === item.foodId)
      const rest = current.filter((i) => i.foodId !== item.foodId)
      // Keep the swapped foods where the old item was.
      const moved = rest.filter((i) => added.some((a) => a.foodId === i.foodId))
      const others = rest.filter((i) => !moved.includes(i))
      others.splice(Math.max(0, Math.min(at, others.length)), 0, ...moved)
      setMeal(meal.name, others)
      if (!added.length) notes.push(`${why}, so ${from} is left out. Add dal or another protein food you eat.`)
    }
  if (out === plan) return plan
  // Veg protein foods bring more calories than chicken or fish, so take the
  // extra back from cereals, a step at a time, largest first.
  const kcalOf = () => out.meals.reduce((t, m) => t + m.macros.kcal, 0)
  let trimmed = false
  while (kcalOf() > plan.totals.kcal * 1.02) {
    const cereals = out.meals.flatMap((m) => m.items.map((i) => ({ meal: m.name, i, f: byId.get(i.foodId)! }))).filter(({ f, i }) => f?.group === 'cereal' && i.grams > 2 * step(f))
    if (!cereals.length) break
    const { meal, i, f } = cereals.reduce((a, b) => (b.i.grams > a.i.grams ? b : a))
    const grams = i.grams - step(f)
    setMeal(meal, out.meals.find((m) => m.name === meal)!.items.map((x) => (x === i ? { ...x, grams, hint: amountHint(f, grams), macros: macrosFor(f, grams) } : x)))
    trimmed = true
  }
  if (trimmed) notes.push('Cereals are a little less today, to keep calories about the same.')
  const meals = out.meals.filter((m) => m.items.length)
  const totals = meals.reduce((t, m) => add(t, m.macros), ZERO)
  return { ...out, meals, totals, onTarget: isOnTarget(totals, plan.targets), notes: [...plan.notes, ...notes] }
}

// Changing a saved plan by hand (T-061). The person's changes are kept as
// they make them; the check says how far the day is from their targets.

/** Most grams one item can have when changed by hand. */
export const MAX_PLAN_GRAMS = 2000

function withItems(plan: MealPlan, meal: MealName, edit: (items: PlanItem[]) => PlanItem[]): MealPlan {
  const has = plan.meals.some((m) => m.name === meal)
  const all = has ? plan.meals : [...plan.meals, { name: meal, items: [], macros: ZERO }].sort((a, b) => MEALS.indexOf(a.name) - MEALS.indexOf(b.name))
  const meals = all.map((m) => {
    if (m.name !== meal) return m
    const items = edit(m.items)
    return { ...m, items, macros: items.reduce((t, i) => add(t, i.macros), ZERO) }
  })
  const totals = meals.reduce((t, m) => add(t, m.macros), ZERO)
  return { ...plan, meals, totals, onTarget: isOnTarget(totals, plan.targets) }
}

function changedItem(f: PlanFood, grams: number): PlanItem {
  const over = grams > f.maxPerDayG ? ` More than the usual ${f.maxPerDayG} g ${f.weighed} a day.` : ''
  return { foodId: f.id, name: f.name, grams, weighed: f.weighed, hint: amountHint(f, grams), macros: macrosFor(f, grams), reason: `You changed this.${over}` }
}

const scale = (m: Macros, k: number): Macros => ({ kcal: m.kcal * k, proteinG: m.proteinG * k, carbG: m.carbG * k, fatG: m.fatG * k })

/** The item at this place with a new amount, from 1 to MAX_PLAN_GRAMS g.
 * A food added from search keeps its calories per gram. */
export function setItemGrams(plan: MealPlan, meal: MealName, index: number, grams: number, foods: PlanFood[]): MealPlan {
  const item = plan.meals.find((m) => m.name === meal)?.items[index]
  if (!item) return plan
  const g = Math.round(Math.min(MAX_PLAN_GRAMS, Math.max(1, grams)))
  const f = foods.find((x) => x.id === item.foodId)
  const next: PlanItem | null = f
    ? changedItem(f, g)
    : item.grams > 0
      ? { ...item, grams: g, macros: scale(item.macros, g / item.grams), reason: 'You changed this.' }
      : null
  return next ? withItems(plan, meal, (items) => items.map((x, i) => (i === index ? next : x))) : plan
}

/** A food from the full food search (T-061b), as the person chose its
 * amount; the same food already in the meal gets the amount added. */
export function addFoundItem(plan: MealPlan, meal: MealName, found: { foodId: string; name: string; grams: number; macros: Macros; tags?: DietTag[] }): MealPlan {
  return withItems(plan, meal, (items) => {
    const at = items.findIndex((i) => i.foodId === found.foodId && i.weighed === 'as eaten')
    if (at >= 0) {
      const old = items[at]
      return items.map((x, i) => (i === at ? { ...old, grams: Math.min(MAX_PLAN_GRAMS, old.grams + found.grams), macros: add(old.macros, found.macros) } : x))
    }
    const item: PlanItem = { foodId: found.foodId, name: found.name, grams: Math.min(MAX_PLAN_GRAMS, found.grams), weighed: 'as eaten', macros: found.macros, reason: 'You added this.' }
    if (found.tags?.length) item.tags = found.tags
    return [...items, item]
  })
}

export function removeItem(plan: MealPlan, meal: MealName, index: number): MealPlan {
  return withItems(plan, meal, (items) => items.filter((_, i) => i !== index))
}

/** Adds a food to a meal: 100 g (or its usual meal limit, if less) unless
 * an amount is given; a food already in the meal gets the amount added. */
export function addItem(plan: MealPlan, meal: MealName, f: PlanFood, grams?: number): MealPlan {
  const amount = grams ?? Math.max(step(f), roundTo(f, Math.min(100, f.maxPerMealG)))
  return withItems(plan, meal, (items) => {
    const at = items.findIndex((i) => i.foodId === f.id)
    if (at < 0) return [...items, changedItem(f, Math.min(MAX_PLAN_GRAMS, amount))]
    return items.map((x, i) => (i === at ? changedItem(f, Math.min(MAX_PLAN_GRAMS, x.grams + amount)) : x))
  })
}

/** The plan as saved: meals left empty are dropped. */
export const tidyPlan = (plan: MealPlan): MealPlan => ({ ...plan, meals: plan.meals.filter((m) => m.items.length) })

/** How the day compares with the targets, in plain words. */
export function planCheck(totals: Macros, targets: Macros): string {
  const kcal = Math.round(totals.kcal - targets.kcal)
  const protein = Math.round(totals.proteinG - targets.proteinG)
  const kcalOk = Math.abs(kcal) <= targets.kcal * CLOSE_ENOUGH
  const proteinOk = Math.abs(protein) <= 5
  if (kcalOk && proteinOk) return 'This plan is close to your targets.'
  const parts: string[] = []
  if (!kcalOk) parts.push(`This plan has ${Math.abs(kcal).toLocaleString('en-IN')} kcal ${kcal > 0 ? 'more' : 'less'} than your target.`)
  if (!proteinOk) parts.push(`It has ${Math.abs(protein)} g ${protein > 0 ? 'more' : 'less'} protein than your target.`)
  if (kcalOk) parts[0] = parts[0].replace(/^It has/, 'This plan has')
  return parts.join(' ')
}
