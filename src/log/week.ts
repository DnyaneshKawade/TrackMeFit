// The kind weekly count on the Food tab (spec T-101c): days with food logged
// this week, Monday to today. Pure functions, no I/O.

import { shiftDate, type Meal } from './types'

/** The Monday on or before a date (YYYY-MM-DD). */
export function weekStart(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay() // 0 is Sunday
  return shiftDate(date, -((day + 6) % 7))
}

/** Days with food logged this week. Earlier days come from the store; today from the open day. */
export function daysLogged(earlier: Iterable<string>, today: string, todayLogged: boolean): number {
  const from = weekStart(today)
  const days = new Set<string>()
  for (const d of earlier) if (d >= from && d < today) days.add(d)
  return days.size + (todayLogged ? 1 : 0)
}

/** The meal the "Add food" button picks by the time (T-101d): breakfast
 * before 11, lunch before 4 pm, snacks before 7 pm, then dinner. */
export function mealNow(now: Date): Meal {
  const h = now.getHours()
  return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 19 ? 'snacks' : 'dinner'
}
