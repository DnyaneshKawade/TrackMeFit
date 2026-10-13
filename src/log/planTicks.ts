// Ticking off the saved meal plan on the Food tab (spec T-060). A tick logs
// the planned amount as a normal entry that remembers its plan item, so an
// untick removes only that entry and never food added by hand.

import type { Meal as PlanMeal, MealName, PlanItem } from '../engine/mealPlan'
import type { LogEntry, Meal, NewLogEntry } from './types'

export const PLAN_MEAL: Record<MealName, Meal> = { Breakfast: 'breakfast', Lunch: 'lunch', Snack: 'snacks', Dinner: 'dinner' }

/** Plan, meal, position and food: a veg-day swap is a different item. */
export const planItemKey = (planId: string, meal: MealName, index: number, foodId: string) => `${planId}:${meal}:${index}:${foodId}`

const round1 = (n: number) => Math.round(n * 10) / 10

/** The log entry a tick makes: the planned amount with the plan's calories. */
export function planEntry(item: PlanItem, key: string, meal: MealName, loggedOn: string): NewLogEntry {
  const { kcal, proteinG, carbG, fatG } = item.macros
  return {
    loggedOn,
    meal: PLAN_MEAL[meal],
    foodId: item.foodId,
    foodName: item.name,
    grams: Math.round(item.grams),
    kcal: Math.round(kcal),
    proteinG: round1(proteinG),
    carbG: round1(carbG),
    fatG: round1(fatG),
    planItem: key,
  }
}

/** The same entry at another amount, with calories and macros scaled. */
export function resized(entry: NewLogEntry, grams: number): NewLogEntry {
  const f = entry.grams ? grams / entry.grams : 0
  return {
    ...entry,
    grams: Math.round(grams),
    kcal: Math.round(entry.kcal * f),
    proteinG: round1(entry.proteinG * f),
    carbG: round1(entry.carbG * f),
    fatG: round1(entry.fatG * f),
  }
}

export interface PlanRow {
  key: string
  meal: MealName
  item: PlanItem
}

/** Every item of the plan with its key, meal by meal. */
export function planRows(planId: string, meals: PlanMeal[]): PlanRow[] {
  return meals.flatMap((m) => m.items.map((item, i) => ({ key: planItemKey(planId, m.name, i, item.foodId), meal: m.name, item })))
}

/** The day's entries logged from the plan, by plan item. */
export function tickedEntries(entries: LogEntry[]): Map<string, LogEntry> {
  const byKey = new Map<string, LogEntry>()
  for (const e of entries) if (e.planItem) byKey.set(e.planItem, e)
  return byKey
}

export type TickState = 'all' | 'some' | 'none'

export function tickState(keys: string[], ticked: Map<string, unknown>): TickState {
  const n = keys.filter((k) => ticked.has(k)).length
  return n === 0 ? 'none' : n === keys.length ? 'all' : 'some'
}
