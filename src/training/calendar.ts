// Month calendar for workouts (spec T-044). Pure helpers.

/** "2026-10" for a date. */
export const monthOf = (date: string) => date.slice(0, 7)

/** The month before or after, as "YYYY-MM". */
export function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + by, 1))
  return d.toISOString().slice(0, 7)
}

/** First and last date of a month. */
export function monthRange(month: string): [string, string] {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return [`${month}-01`, `${month}-${String(last).padStart(2, '0')}`]
}

/** Weeks of the month, Monday first; null pads the days outside the month. */
export function monthGrid(month: string): (string | null)[][] {
  const [from, to] = monthRange(month)
  const [y, m] = month.split('-').map(Number)
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
  const days = Number(to.slice(8))
  const cells: (string | null)[] = Array(lead).fill(null)
  for (let d = 1; d <= days; d++) cells.push(`${from.slice(0, 8)}${String(d).padStart(2, '0')}`)
  while (cells.length % 7) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
