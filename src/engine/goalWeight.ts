// How far the person is from their goal weight, and when they may reach it
// at the current pace (spec T-154). Pure functions, no I/O; each result
// carries the plain words the screen shows.

import { trendWeights, type WeighIn } from './diet'

/** A YYYY-MM-DD date moved by some days, in UTC so it never slips a day. */
const shiftDate = (iso: string, days: number) => new Date(Date.parse(iso + 'T00:00:00Z') + days * 86_400_000).toISOString().slice(0, 10)

export interface GoalWeight {
  goalKg: number
  /** The first weigh-in, where the journey started. */
  startKg: number
  /** The trend weight now. */
  nowKg: number
  /** How much is left, always 0 or more. */
  toGoKg: number
  /** How much of the way is done, 0 to 100. */
  percent: number
  reached: boolean
  /** "Goal 70 kg. 2.4 kg to go." */
  text: string
}

/** Days of trend needed before a date range is shown. */
export const PACE_DAYS = 14
/** No date is shown when the goal is more than this many weeks away. */
export const MAX_WEEKS = 104

const round1 = (n: number) => Math.round(n * 10) / 10

/** Null without weigh-ins, or when the goal is where the person started. */
export function goalWeight(weighIns: WeighIn[], goalKg: number | null): GoalWeight | null {
  if (!goalKg || !weighIns.length) return null
  const trend = trendWeights(weighIns)
  const startKg = trend[0].kg
  const nowKg = round1(trend[trend.length - 1].kg)
  const way = goalKg - startKg
  if (Math.abs(way) < 0.5) return null
  const done = (nowKg - startKg) / way
  const reached = done >= 1
  const toGoKg = reached ? 0 : round1(Math.abs(goalKg - nowKg))
  const percent = Math.round(Math.min(1, Math.max(0, done)) * 100)
  const text = reached ? `Goal ${goalKg} kg. You reached it!` : `Goal ${goalKg} kg. ${toGoKg} kg to go.`
  return { goalKg, startKg, nowKg, toGoKg, percent, reached, text }
}

export interface GoalDates {
  /** Earliest and latest likely dates, YYYY-MM-DD; null when none is shown. */
  from: string | null
  to: string | null
  /** Why there is a range, or why there isn't one. */
  reason: string
}

const weeksText = (w: number) => (w === 1 ? '1 week' : `${w} weeks`)

/** When the goal may be reached at the pace of the last 2 weeks. It is a
 * range, 20% either side, because weight never moves in a straight line. */
export function goalDates(weighIns: WeighIn[], goalKg: number | null, today: string): GoalDates {
  const g = goalWeight(weighIns, goalKg)
  const none = (reason: string): GoalDates => ({ from: null, to: null, reason })
  if (!g) return none('Add your goal weight and weigh in to see your progress.')
  if (g.reached) return none('You reached your goal weight.')
  const trend = trendWeights(weighIns)
  const last = trend[trend.length - 1]
  const back = shiftDate(last.date, -PACE_DAYS)
  const before = [...trend].reverse().find((t) => t.date <= back)
  if (!before) return none('Weigh in for 2 weeks. Then we can show a likely date.')
  const perWeek = ((last.kg - before.kg) / PACE_DAYS) * 7
  const toward = Math.sign(g.goalKg - g.nowKg) === Math.sign(perWeek) && Math.abs(perWeek) >= 0.05
  if (!toward) return none('Your weight is not moving toward your goal yet. No date for now.')
  const weeks = g.toGoKg / Math.abs(perWeek)
  if (weeks > MAX_WEEKS) return none('At this pace, your goal is over 2 years away.')
  const early = Math.max(1, Math.round(weeks / 1.2))
  const late = Math.max(early, Math.round(weeks / 0.8))
  return {
    from: shiftDate(today, early * 7),
    to: shiftDate(today, late * 7),
    reason: `You moved ${round1(Math.abs(perWeek))} kg a week lately. That is about ${weeksText(early)} to ${weeksText(late)} more. It is a guess, not a promise.`,
  }
}
