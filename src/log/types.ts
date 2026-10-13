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
  /** Null for a quick add (calories typed in, no food or weight). */
  grams: number | null
}

export interface LogEntry extends NewLogEntry {
  id: string
}

export interface LogStore {
  listDay(date: string): Promise<LogEntry[]>
  add(entry: NewLogEntry): Promise<LogEntry>
  remove(id: string): Promise<void>
  /** Recent entries across days, newest first, to offer again. */
  recent(): Promise<LogEntry[]>
}

export const MAX_GRAMS = 5000

export function entryFor(food: Food, grams: number, meal: Meal, loggedOn: string): NewLogEntry {
  if (!(grams > 0 && grams <= MAX_GRAMS)) throw new Error(`Amount must be between 1 and ${MAX_GRAMS} g`)
  const { kcal, proteinG, carbG, fatG } = amountFor(food, grams)
  const name = food.brand ? `${food.name} (${food.brand})` : food.name
  return { loggedOn, meal, foodId: food.id, foodName: name, grams: Math.round(grams), kcal, proteinG, carbG, fatG }
}

const round1 = (n: number) => Math.round(n * 10) / 10

export const QUICK_ADD_ID = 'quick'
export const MAX_QUICK_KCAL = 5000

/** Values typed into quick add. */
export interface QuickForm {
  name: string
  kcal: string
  protein: string
  carbs: string
  fat: string
}

export const EMPTY_QUICK_FORM: QuickForm = { name: '', kcal: '', protein: '', carbs: '', fat: '' }

/** Checks quick add: calories are needed, macros are optional. Returns the
 * entry, or a message saying what to fix. */
export function quickEntry(f: QuickForm, meal: Meal, loggedOn: string): NewLogEntry | string {
  const n = (s: string) => (s.trim() ? Number(s.replace(',', '.')) : 0)
  const kcal = n(f.kcal)
  if (!f.kcal.trim() || !Number.isFinite(kcal) || kcal <= 0 || kcal > MAX_QUICK_KCAL) return `Calories should be between 1 and ${MAX_QUICK_KCAL}.`
  const [proteinG, carbG, fatG] = [n(f.protein), n(f.carbs), n(f.fat)]
  if (![proteinG, carbG, fatG].every((v) => Number.isFinite(v) && v >= 0)) return 'Protein, carbs and fat should be numbers, or left empty.'
  if (proteinG * 4 + carbG * 4 + fatG * 9 > kcal * 1.2 + 5) return 'Protein, carbs and fat add up to more calories than you entered.'
  const name = f.name.trim().slice(0, 120) || 'Quick add'
  return { loggedOn, meal, foodId: QUICK_ADD_ID, foodName: name, grams: null, kcal: Math.round(kcal), proteinG: round1(proteinG), carbG: round1(carbG), fatG: round1(fatG) }
}

/** The same food and amount again, on another day or meal. */
export function repeatEntry(e: NewLogEntry, meal: Meal, loggedOn: string): NewLogEntry {
  const { foodId, foodName, grams, kcal, proteinG, carbG, fatG } = e
  return { loggedOn, meal, foodId, foodName, grams, kcal, proteinG, carbG, fatG }
}

export interface RecentFood {
  /** The latest time it was logged. */
  entry: LogEntry
  times: number
}

const sameFood = (e: LogEntry) => (e.foodId === QUICK_ADD_ID ? `${QUICK_ADD_ID}:${e.foodName}:${e.kcal}` : e.foodId)

/** Foods to offer again, from recent entries (newest first): the ones logged
 * 3 or more times as "often", the rest as "recent". Each food appears once,
 * with the amount from the latest time. */
export function recentFoods(entries: LogEntry[], limit = 8): { often: RecentFood[]; recent: RecentFood[] } {
  const byFood = new Map<string, RecentFood>()
  for (const e of entries) {
    const key = sameFood(e)
    const seen = byFood.get(key)
    if (seen) seen.times++
    else byFood.set(key, { entry: e, times: 1 })
  }
  const all = [...byFood.values()]
  const often = all.filter((r) => r.times >= 3).sort((a, b) => b.times - a.times).slice(0, 5)
  const recent = all.filter((r) => !often.includes(r)).slice(0, limit)
  return { often, recent }
}

/** The amount shown on a log line; quick adds have no weight. */
export const amountLabel = (e: { grams: number | null }) => (e.grams === null ? 'Quick add' : `${e.grams} g`)

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
