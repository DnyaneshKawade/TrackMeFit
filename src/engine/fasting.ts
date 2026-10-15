// Spreading a fasting day's missed calories over the next days (spec T-041c).
// Only a suggestion: targets never change, the person decides. Pure, no I/O.

/** Below this, the day is close enough to target to say nothing. */
export const MIN_SPREAD_KCAL = 100
/** The most extra suggested for one day, as a share of the day's target. */
export const MAX_EXTRA_SHARE = 0.2
/** On a Sunday the week is over, so the next few days are used. */
export const SUNDAY_DAYS = 3

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const round10 = (n: number) => Math.round(n / 10) * 10
const weekday = (date: string) => new Date(date + 'T00:00:00Z').getUTCDay()
const shift = (date: string, days: number) => new Date(Date.parse(date + 'T00:00:00Z') + days * 86_400_000).toISOString().slice(0, 10)

export interface Spread {
  /** Extra calories suggested on each of the next days. */
  extraPerDay: number
  days: number
  /** The last of those days. */
  until: string
  /** Plain words for the person. */
  text: string
}

/** How the calories missed on a fasting day could be eaten over the rest of
 * the week (Monday to Sunday). Null when little was missed. */
export function spreadFastingDay(targetKcal: number, eatenKcal: number, date: string): Spread | null {
  const missed = Math.round(targetKcal - eatenKcal)
  if (missed < MIN_SPREAD_KCAL) return null
  const day = weekday(date)
  const days = day === 0 ? SUNDAY_DAYS : 7 - day
  const until = shift(date, days)
  const even = round10(missed / days)
  const extraPerDay = Math.min(round10(targetKcal * MAX_EXTRA_SHARE), even)
  const when = days === 1 ? `on ${WEEKDAYS[weekday(until)]}` : `on each of the next ${days} days, until ${WEEKDAYS[weekday(until)]}`
  const parts = [
    `You ate ${missed.toLocaleString('en-IN')} kcal less than your target.`,
    `If you like, eat about ${extraPerDay} kcal more ${when}.`,
  ]
  if (extraPerDay < even) parts.push('We suggest no more than this a day, so it won’t make up all of it.')
  parts.push('Your targets don’t change.')
  return { extraPerDay, days, until, text: parts.join(' ') }
}
