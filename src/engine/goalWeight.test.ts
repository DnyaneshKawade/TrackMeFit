// Goal weight progress and likely dates (spec T-154).
import { describe, expect, it } from 'vitest'
import { goalDates, goalWeight } from './goalWeight'
import type { WeighIn } from './diet'

/** One weigh-in a day from a start date, changing by `perDay` kg. */
const days = (start: string, n: number, fromKg: number, perDay: number): WeighIn[] =>
  Array.from({ length: n }, (_, i) => ({
    date: new Date(Date.parse(start + 'T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10),
    kg: Math.round((fromKg + i * perDay) * 100) / 100,
  }))

describe('goal weight (T-154)', () => {
  it('1. says how many kg are left and how much of the way is done', () => {
    const g = goalWeight([{ date: '2026-10-01', kg: 80 }, { date: '2026-10-02', kg: 72.4 }], 70)!
    // The trend moves a tenth of the way to each new weight: 80 then 79.24.
    expect(g).toMatchObject({ startKg: 80, nowKg: 79.2, toGoKg: 9.2, percent: 8, reached: false })
    expect(g.text).toBe('Goal 70 kg. 9.2 kg to go.')
  })

  it('2. works for gaining too, and says when the goal is reached', () => {
    const gain = goalWeight([{ date: '2026-10-01', kg: 55 }], 60)!
    expect(gain.text).toBe('Goal 60 kg. 5 kg to go.')
    const done = goalWeight(days('2026-08-01', 60, 75, -0.1), 70)!
    expect(done).toMatchObject({ reached: true, toGoKg: 0, percent: 100, text: 'Goal 70 kg. You reached it!' })
  })

  it('3. is not shown without a goal, without weigh-ins, or with the goal at the start', () => {
    expect(goalWeight([{ date: '2026-10-01', kg: 70 }], null)).toBeNull()
    expect(goalWeight([], 70)).toBeNull()
    expect(goalWeight([{ date: '2026-10-01', kg: 70.2 }], 70)).toBeNull()
  })

  it('4. gives a date range at the pace of the last 2 weeks, as a guess', () => {
    // 0.5 kg a week down for 4 weeks, from 80 kg, aiming for 74 kg.
    const list = days('2026-09-01', 29, 80, -0.5 / 7)
    const d = goalDates(list, 74, '2026-09-29')
    const m = d.reason.match(/^You moved 0\.[45] kg a week lately\. That is about (\d+) weeks to (\d+) weeks more\. It is a guess, not a promise\.$/)!
    const after = (weeks: string) => new Date(Date.parse('2026-09-29T00:00:00Z') + Number(weeks) * 7 * 86_400_000).toISOString().slice(0, 10)
    expect(d.from).toBe(after(m[1]))
    expect(d.to).toBe(after(m[2]))
    expect(Number(m[2])).toBeGreaterThan(Number(m[1]))
  })

  it('5. gives no date with too little data, the wrong way, or too far away', () => {
    expect(goalDates(days('2026-09-01', 10, 80, -0.1), 74, '2026-09-10')).toMatchObject({ from: null, reason: 'Weigh in for 2 weeks. Then we can show a likely date.' })
    expect(goalDates(days('2026-09-01', 29, 80, 0.05), 74, '2026-09-29')).toMatchObject({ from: null, reason: 'Your weight is not moving toward your goal yet. No date for now.' })
    expect(goalDates(days('2026-09-01', 29, 120, -0.01), 60, '2026-09-29')).toMatchObject({ from: null, reason: 'At this pace, your goal is over 2 years away.' })
    expect(goalDates([], 74, '2026-09-29').from).toBeNull()
  })
})
