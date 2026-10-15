import { describe, expect, it } from 'vitest'
import { spreadFastingDay } from './fasting'

describe('spreading a fasting day (T-041c)', () => {
  it('5. spreads the missed calories over the rest of the week, Monday to Sunday', () => {
    // Thursday 15 Oct 2026: Friday, Saturday and Sunday are left.
    expect(spreadFastingDay(2000, 800, '2026-10-15')).toEqual({
      extraPerDay: 400,
      days: 3,
      until: '2026-10-18',
      text: 'You ate 1,200 kcal less than your target. If you like, eat about 400 kcal more on each of the next 3 days, until Sunday. Your targets don’t change.',
    })
    // Saturday: only Sunday is left.
    expect(spreadFastingDay(2000, 1700, '2026-10-17')?.text).toBe(
      'You ate 300 kcal less than your target. If you like, eat about 300 kcal more on Sunday. Your targets don’t change.',
    )
  })

  it('5. a Sunday uses the next 3 days', () => {
    expect(spreadFastingDay(2000, 1400, '2026-10-18')).toMatchObject({ extraPerDay: 200, days: 3, until: '2026-10-21' })
  })

  it('5. never suggests more than a fifth of the target extra in a day, and says so', () => {
    const s = spreadFastingDay(2000, 0, '2026-10-16')!
    expect(s.extraPerDay).toBe(400)
    expect(s.text).toMatch(/We suggest no more than this a day, so it won’t make up all of it\./)
  })

  it('5. says nothing when the day is close to target or over it', () => {
    expect(spreadFastingDay(2000, 1950, '2026-10-15')).toBeNull()
    expect(spreadFastingDay(2000, 2300, '2026-10-15')).toBeNull()
  })
})
