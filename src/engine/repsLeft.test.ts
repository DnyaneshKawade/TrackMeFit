import { describe, expect, it } from 'vitest'
import { nextLoad, type LoadInput } from './training'
import { suggestNext } from '../training/types'
import { exerciseById } from '../training/exercises'

// Weight steps that use the reps left (spec T-082b).

const base: LoadInput = { weight: 60, repsDone: [8, 8, 8], repRange: [6, 10], increment: 2.5, missStreak: 0, targetRir: 1 }

describe('weight steps from reps left (T-082b)', () => {
  it('1. 2 or more reps left above the aim adds weight now, with the reason', () => {
    expect(nextLoad({ ...base, rirDone: [3, 3, 3] })).toEqual({
      weight: 62.5,
      targetReps: 6,
      why: 'You had 3 reps left, but the aim was 1. So the weight goes up.',
    })
    // 1 above the aim is within how far off people guess: same as before.
    expect(nextLoad({ ...base, rirDone: [2, 2, 2] })).toMatchObject({ weight: 60, targetReps: 9 })
  })

  it('2. fewer reps left than the aim keeps the weight and reps', () => {
    expect(nextLoad({ ...base, targetRir: 2, rirDone: [1, 0, 1] })).toEqual({
      weight: 60,
      targetReps: 8,
      why: 'You went closer to failure than planned. So keep the same weight and reps.',
    })
  })

  it('3. with no reps left logged, the old rules stay', () => {
    expect(nextLoad({ ...base, rirDone: [null, null, null] })).toMatchObject({ weight: 60, targetReps: 9, why: 'Same weight; aim for one more rep.' })
    expect(nextLoad({ ...base, rirDone: [3, 3, 3], targetRir: undefined })).toMatchObject({ weight: 60, targetReps: 9 })
  })

  it('4. the top of the range and two misses still win, and a big jump adds no weight', () => {
    expect(nextLoad({ ...base, repsDone: [10, 10], rirDone: [0, 0] }).weight).toBe(62.5)
    expect(nextLoad({ ...base, repsDone: [5, 4], missStreak: 2, rirDone: [4, 4] }).weight).toBe(55)
    // Below the range once: reps left can't add weight.
    expect(nextLoad({ ...base, repsDone: [8, 5], rirDone: [4, 4] }).weight).toBe(60)
    expect(nextLoad({ ...base, weight: 10, rirDone: [4, 4, 4] })).toMatchObject({ weight: 10, targetReps: 9 })
  })

  it('5. last time’s logged reps left reach the suggestion', () => {
    const bench = exerciseById.get('bench-press')!
    const sets = [0, 1, 2].map((i) => ({ id: `s${i}`, exerciseId: 'bench-press', setIndex: i, weightKg: 60, reps: 8, rir: 4 }))
    expect(suggestNext([{ performedOn: '2026-10-10', sets }], bench, [6, 10], 2)).toMatchObject({ weight: 62.5, targetReps: 6 })
    expect(suggestNext([{ performedOn: '2026-10-10', sets }], bench, [6, 10])).toMatchObject({ weight: 60, targetReps: 9 })
  })
})
