// Is a date a veg day for the person? Their non-veg-free weekdays apply on
// their own; any day can also be made a veg day, or a weekday made a non-veg
// day, by the person's own choice (seasons like Shravan or Navratri are left
// to that choice, DK 13 Oct 2026). Pure, so the plan and the log decide the
// same way. Spec: specs/T-058c-nonveg-free-days.md.

import type { DietTag } from '../food/types'

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** What a veg day leaves out. */
export const NONVEG_TAGS: DietTag[] = ['meat', 'fish', 'egg']

/** The person's choice for one date: make it a veg day, or eat non-veg on a usual veg day. */
export type DayChoice = 'veg' | 'nonveg' | null

/** The weekday's name when it is one of the person's non-veg-free days, or null. */
export function nonvegWeekday(date: string, rules: readonly string[]): string | null {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return rules.includes(`nonveg_off:${WEEKDAYS[weekday]}`) ? WEEKDAY_NAMES[weekday] : null
}

/** Why this date is a veg day ("Tuesday", "your choice"), or null when it isn't. */
export function vegDayReason(date: string, rules: readonly string[], choice: DayChoice): string | null {
  if (choice === 'veg') return 'your choice'
  if (choice === 'nonveg') return null
  return nonvegWeekday(date, rules)
}

/** The diet's exclusions plus meat, fish and egg on a veg day. */
export function dayExcluded(base: Set<DietTag>, vegDay: boolean): Set<DietTag> {
  return vegDay ? new Set([...base, ...NONVEG_TAGS]) : base
}
