// A day's food log. Each entry keeps a snapshot of the food's name and macros
// at logging time, so later data fixes don't rewrite history.

import { amountFor, type Food, type Per100g } from '../food/types'

export const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'] as const
export type Meal = (typeof MEALS)[number]
export const MEAL_NAMES: Record<Meal, string> = { breakfast: 'Breakfast', lunch: 'Lunch', snacks: 'Snacks', dinner: 'Dinner' }

export interface NewLogEntry extends Per100g {
  /** Local date, YYYY-MM-DD. */
  loggedOn: string
  meal: Meal
  foodId: string
  foodName: string
  grams: number
}

export interface LogEntry extends NewLogEntry {
  id: string
}

export interface LogStore {
  listDay(date: string): Promise<LogEntry[]>
  add(entry: NewLogEntry): Promise<LogEntry>
  remove(id: string): Promise<void>
}

export const MAX_GRAMS = 5000

export function entryFor(food: Food, grams: number, meal: Meal, loggedOn: string): NewLogEntry {
  if (!(grams > 0 && grams <= MAX_GRAMS)) throw new Error(`Amount must be between 1 and ${MAX_GRAMS} g`)
  const { kcal, proteinG, carbG, fatG } = amountFor(food, grams)
  const name = food.brand ? `${food.name} (${food.brand})` : food.name
  return { loggedOn, meal, foodId: food.id, foodName: name, grams: Math.round(grams), kcal, proteinG, carbG, fatG }
}

const round1 = (n: number) => Math.round(n * 10) / 10

export function totals(entries: Per100g[]): Per100g {
  const t = entries.reduce(
    (s, e) => ({ kcal: s.kcal + e.kcal, proteinG: s.proteinG + e.proteinG, carbG: s.carbG + e.carbG, fatG: s.fatG + e.fatG }),
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  )
  return { kcal: Math.round(t.kcal), proteinG: round1(t.proteinG), carbG: round1(t.carbG), fatG: round1(t.fatG) }
}

/** Today's date on the person's own clock (not UTC). */
export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return localDate(new Date(y, m - 1, d + days))
}
