import { describe, expect, it } from 'vitest'
import { monthGrid, monthRange, shiftMonth } from './calendar'

describe('workout calendar (T-044)', () => {
  it('1. lays out a month in weeks starting on Monday', () => {
    const g = monthGrid('2026-10')
    // 1 October 2026 is a Thursday.
    expect(g[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'])
    expect(g[g.length - 1]).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', null])
    expect(g.every((w) => w.length === 7)).toBe(true)
  })

  it('1. moves between months, across years and leap days', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(monthRange('2028-02')).toEqual(['2028-02-01', '2028-02-29'])
  })
})
