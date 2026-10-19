import { describe, expect, it } from 'vitest'
import { afterBreak, breakLoad } from './training'
import { daysBetween, suggestNext, type PastSession } from '../training/types'
import { exerciseById } from '../training/exercises'

// Back after a break (spec T-082f).

const bench = exerciseById.get('bench-press')!
const past = (performedOn: string, reps = 8): PastSession[] => [
  { performedOn, sets: [0, 1, 2].map((i) => ({ id: `s${i}`, exerciseId: 'bench-press', setIndex: i, weightKg: 100, reps, rir: 2 })) },
]

describe('back after a break (T-082f)', () => {
  it('1. under 10 days off, the normal step applies', () => {
    expect(afterBreak(9)).toBeNull()
    expect(daysBetween('2026-10-01', '2026-10-10')).toBe(9)
    expect(suggestNext(past('2026-10-01'), bench, [6, 10], 2, '2026-10-10')).toMatchObject({ weight: 100, targetReps: 9 })
  })

  it('2. 10 to 20 days off starts 10% lighter at the same reps, with the reason', () => {
    expect(suggestNext(past('2026-10-01'), bench, [6, 10], 2, '2026-10-11')).toEqual({
      weight: 90,
      targetReps: 8,
      why: 'You had 10 days off. So start 10% lighter today.',
    })
    expect(afterBreak(20)?.cut).toBe(0.1)
  })

  it('3. 21 to 42 days off starts 20% lighter, and 43 or more starts 30% lighter', () => {
    expect(afterBreak(21)?.cut).toBe(0.2)
    expect(afterBreak(42)?.cut).toBe(0.2)
    expect(suggestNext(past('2026-09-01'), bench, [6, 10], 2, '2026-10-14')).toEqual({
      weight: 70,
      targetReps: 8,
      why: 'You had 43 days off. So start 30% lighter today.',
    })
  })

  it('4. the lighter weight rounds down to the weight step and reps stay inside the range', () => {
    // 62.5 × 0.9 = 56.25 → 55 with 2.5 kg steps; 4 reps last time → 6, the bottom of the range.
    expect(breakLoad(62.5, 4, [6, 10], 2.5, 14)).toMatchObject({ weight: 55, targetReps: 6 })
    expect(breakLoad(62.5, 12, [6, 10], 2.5, 14)).toMatchObject({ targetReps: 10 })
    expect(breakLoad(0, 10, [8, 12], 2.5, 30)).toMatchObject({ weight: 0 })
  })

  it('5. with no date for today, nothing changes', () => {
    expect(suggestNext(past('2026-01-01'), bench, [6, 10], 2)).toMatchObject({ weight: 100, targetReps: 9 })
  })
})
