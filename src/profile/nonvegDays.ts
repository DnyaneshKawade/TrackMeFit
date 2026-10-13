// Is a date one of the person's non-veg-free days? Weekdays come straight
// from the date; seasons from a table of estimated dates per year (see
// specs/T-058c-nonveg-free-days.md for sources). Pure, so the plan and the
// log decide the same way.

import type { DietTag } from '../food/types'
import { NONVEG_OFF_SEASONS } from './dietRules'

type Range = [from: string, to: string] // inclusive, YYYY-MM-DD

/** Estimated season dates. Shravan is the Amanta month (Maharashtra, Gujarat, south). */
export const SEASON_DATES: Record<string, Record<number, Range[]>> = {
  shravan: { 2026: [['2026-08-13', '2026-09-11']], 2027: [['2027-08-02', '2027-08-31']] },
  navratri: {
    2026: [['2026-03-19', '2026-03-27'], ['2026-10-11', '2026-10-19']],
    2027: [['2027-04-07', '2027-04-15'], ['2027-09-30', '2027-10-08']],
  },
  chaturmas: { 2026: [['2026-07-25', '2026-11-20']], 2027: [['2027-07-14', '2027-11-10']] },
  ramadan: { 2026: [['2026-02-19', '2026-03-20']], 2027: [['2027-02-09', '2027-03-10']] },
  lent: { 2026: [['2026-02-18', '2026-04-04']], 2027: [['2027-02-10', '2027-03-27']] },
}

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SEASON_NAMES = new Map(NONVEG_OFF_SEASONS.map(([k, label]) => [k.slice('nonveg_off:'.length), label]))

/** What a non-veg-free day leaves out. */
export const NONVEG_TAGS: DietTag[] = ['meat', 'fish', 'egg']

/** Why this date is non-veg-free for the person ("Tuesday", "Shravan"), or null. */
export function nonvegOffReason(date: string, rules: readonly string[]): string | null {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  if (rules.includes(`nonveg_off:${WEEKDAYS[weekday]}`)) return WEEKDAY_NAMES[weekday]
  for (const [season, years] of Object.entries(SEASON_DATES)) {
    if (!rules.includes(`nonveg_off:${season}`)) continue
    if ((years[y] ?? []).some(([from, to]) => date >= from && date <= to)) return SEASON_NAMES.get(season) ?? season
  }
  return null
}

/** The diet's exclusions plus meat, fish and egg on a non-veg-free day. */
export function dayExcluded(base: Set<DietTag>, offToday: boolean): Set<DietTag> {
  return offToday ? new Set([...base, ...NONVEG_TAGS]) : base
}
