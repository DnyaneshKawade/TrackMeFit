// Food stats for a range of days (spec T-062): average calories and macros
// per logged day against the targets, days on target, the protein streak and
// the most-logged foods. Pure functions, no I/O.

import type { Macros } from './diet'

export interface StatsEntry extends Macros {
  /** Local date, YYYY-MM-DD. */
  loggedOn: string
  foodId: string
  foodName: string
}

export interface StatsTarget extends Macros {
  startsOn: string
}

export interface StatsDay {
  date: string
  /** What was eaten; null when nothing was logged. */
  eaten: Macros | null
  /** The target in force on the day; null when none was set. */
  target: Macros | null
  /** Calories within 10% of the target; null without food or a target, or on a fasting day. */
  onTarget: boolean | null
  /** Marked as a fasting day (T-041c): left out of averages and days on target. */
  fasting: boolean
}

export interface DietStats {
  days: StatsDay[]
  /** Finished days (before today) with food logged, fasting days left out. */
  loggedDays: number
  /** Fasting days in the range. */
  fastingDays: number
  /** Averages over those days; null when there are none. */
  average: Macros | null
  /** Today's target, or the latest one in the range, to compare with. */
  target: Macros | null
  /** Finished, logged days on target; null without targets. */
  daysOnTarget: number | null
  /** Days in a row, up to today, with at least 90% of the protein target. */
  proteinStreak: number | null
  topFoods: { name: string; times: number }[]
  /** Plain words for the person. */
  notes: string[]
}

export const ON_TARGET_SHARE = 0.1
export const PROTEIN_SHARE = 0.9
const QUICK_ADD_ID = 'quick'
const NO_FASTS: ReadonlySet<string> = new Set()

const ZERO: Macros = { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 }
const add = (a: Macros, b: Macros): Macros => ({ kcal: a.kcal + b.kcal, proteinG: a.proteinG + b.proteinG, carbG: a.carbG + b.carbG, fatG: a.fatG + b.fatG })
const macrosOf = (t: Macros): Macros => ({ kcal: t.kcal, proteinG: t.proteinG, carbG: t.carbG, fatG: t.fatG })
const round1 = (n: number) => Math.round(n * 10) / 10

function nextDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + 1))
  return t.toISOString().slice(0, 10)
}

/** Every date from `from` to `to`, both included. */
export function datesBetween(from: string, to: string): string[] {
  const out: string[] = []
  for (let d = from; d <= to && out.length < 400; d = nextDate(d)) out.push(d)
  return out
}

export const metProtein = (eaten: Macros, target: Macros) => eaten.proteinG >= target.proteinG * PROTEIN_SHARE
export const kcalOnTarget = (eaten: Macros, target: Macros) => Math.abs(eaten.kcal - target.kcal) <= target.kcal * ON_TARGET_SHARE

export function dietStats(
  entries: StatsEntry[],
  targets: StatsTarget[],
  from: string,
  today: string,
  topCount = 5,
  fasting: ReadonlySet<string> = NO_FASTS,
): DietStats {
  // One pass to group entries by day and count foods.
  const byDay = new Map<string, Macros>()
  const foods = new Map<string, { name: string; times: number }>()
  for (const e of entries) {
    if (e.loggedOn < from || e.loggedOn > today) continue
    byDay.set(e.loggedOn, add(byDay.get(e.loggedOn) ?? ZERO, e))
    if (e.foodId === QUICK_ADD_ID) continue
    const f = foods.get(e.foodId)
    if (f) f.times++
    else foods.set(e.foodId, { name: e.foodName, times: 1 })
  }

  // Targets sorted once, then walked with the dates.
  const sorted = [...targets].sort((a, b) => a.startsOn.localeCompare(b.startsOn))
  let ti = -1
  const days: StatsDay[] = datesBetween(from, today).map((date) => {
    while (ti + 1 < sorted.length && sorted[ti + 1].startsOn <= date) ti++
    const target = ti >= 0 ? macrosOf(sorted[ti]) : null
    const eaten = byDay.get(date) ?? null
    const fast = fasting.has(date)
    return { date, eaten, target, onTarget: eaten && target && !fast ? kcalOnTarget(eaten, target) : null, fasting: fast }
  })

  // A fasting day is meant to be low, so it doesn't pull the averages down.
  const finished = days.filter((d) => d.date < today && d.eaten && !d.fasting)
  const fastingDays = days.filter((d) => d.fasting).length
  const sum = finished.reduce((s, d) => add(s, d.eaten!), ZERO)
  const n = finished.length
  const average = n ? { kcal: Math.round(sum.kcal / n), proteinG: round1(sum.proteinG / n), carbG: round1(sum.carbG / n), fatG: round1(sum.fatG / n) } : null
  const target = days[days.length - 1]?.target ?? null
  const hasTargets = days.some((d) => d.target)
  const withTarget = finished.filter((d) => d.target)
  const daysOnTarget = hasTargets ? withTarget.filter((d) => d.onTarget).length : null

  // The streak counts back from today; today counts only once it is met.
  // Fasting days are skipped: they neither add to nor break the streak.
  let proteinStreak: number | null = null
  if (hasTargets) {
    proteinStreak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      const d = days[i]
      if (d.fasting) continue
      const met = d.eaten && d.target ? metProtein(d.eaten, d.target) : false
      if (met) proteinStreak++
      else if (d.date !== today) break
    }
  }

  const topFoods = [...foods.values()].sort((a, b) => b.times - a.times || a.name.localeCompare(b.name)).slice(0, topCount)

  const notes: string[] = []
  if (!entries.some((e) => e.loggedOn >= from && e.loggedOn <= today)) notes.push('Log food for a few days to see your stats.')
  else if (!hasTargets) notes.push('Set your daily targets to see days on target.')
  else {
    notes.push(`On target means calories within ${ON_TARGET_SHARE * 100}% of your target.`)
    notes.push(`The protein streak counts days with at least ${PROTEIN_SHARE * 100}% of your protein target.`)
  }
  if (fastingDays) notes.push('Fasting days are left out of the averages, days on target and the protein streak.')
  if (n && n < days.length - 1) notes.push('Days with nothing logged are left out of the averages. Today is left out until it is over.')
  else if (n) notes.push('Today is left out of the averages until it is over.')

  return { days, loggedDays: n, fastingDays, average, target, daysOnTarget, proteinStreak, topFoods, notes }
}
