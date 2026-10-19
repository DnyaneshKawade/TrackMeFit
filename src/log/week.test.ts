// Spec T-101c: the kind weekly count.
import { describe, expect, it } from 'vitest'
import { daysLogged, mealNow, weekStart } from './week'

describe('T-101c weekly count', () => {
  it('1. the week starts on Monday', () => {
    expect(weekStart('2026-10-14')).toBe('2026-10-12') // Wednesday
    expect(weekStart('2026-10-12')).toBe('2026-10-12') // Monday
    expect(weekStart('2026-10-18')).toBe('2026-10-12') // Sunday
  })

  it('2. counts each day with food once, this week only', () => {
    const earlier = ['2026-10-11', '2026-10-12', '2026-10-12', '2026-10-13']
    expect(daysLogged(earlier, '2026-10-14', true)).toBe(3)
    expect(daysLogged(earlier, '2026-10-14', false)).toBe(2)
    expect(daysLogged([], '2026-10-12', false)).toBe(0)
  })
})

describe('T-101d Add food button', () => {
  it('3. picks the meal by the time of day', () => {
    const at = (h: number) => mealNow(new Date(2026, 9, 19, h))
    expect([at(8), at(11), at(16), at(19), at(23)]).toEqual(['breakfast', 'lunch', 'snacks', 'dinner', 'dinner'])
  })
})
