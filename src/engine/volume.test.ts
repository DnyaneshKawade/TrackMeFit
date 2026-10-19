import { describe, expect, it } from 'vitest'
import { LANDMARKS } from './training'
import { volumeBand, weeklyVolume } from './volume'

// Weekly sets per muscle (spec T-082d).

describe('weekly sets per muscle (T-082d)', () => {
  it('1. sets below the lowest useful amount are low, with the range to aim for', () => {
    expect(volumeBand(6, LANDMARKS.chest)).toEqual({ band: 'low', why: 'Low. Aim for 10 to 20 sets.' })
  })

  it('2. sets in the range are good; above it high; at the limit too many', () => {
    expect(volumeBand(10, LANDMARKS.chest).band).toBe('good')
    expect(volumeBand(20, LANDMARKS.chest).band).toBe('good')
    expect(volumeBand(21, LANDMARKS.chest)).toEqual({ band: 'high', why: 'High. More than 20 sets is hard to recover from.' })
    expect(volumeBand(22, LANDMARKS.chest)).toEqual({ band: 'max', why: 'Too many. Keep it under 22 sets, or you may not recover.' })
  })

  it('3. only trained muscles show, most sets first, with helper half sets kept', () => {
    expect(weeklyVolume({ chest: 9, triceps: 4.5, back: 0, biceps: Number.NaN })).toEqual([
      { muscle: 'chest', sets: 9, band: 'low', why: 'Low. Aim for 10 to 20 sets.' },
      { muscle: 'triceps', sets: 4.5, band: 'low', why: 'Low. Aim for 6 to 14 sets.' },
    ])
    // A muscle that needs no sets of its own is never low.
    expect(weeklyVolume({ glutes: 2 })[0].band).toBe('good')
  })
})
