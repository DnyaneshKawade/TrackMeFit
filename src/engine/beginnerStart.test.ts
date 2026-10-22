// Beginner start: add weight each workout on big lifts, then switch (spec T-082j).
import { describe, expect, it } from 'vitest'
import { beginnerLinear, nextLoad, type LoadInput } from './training'

const base: LoadInput = { weight: 40, repsDone: [6, 6, 6], repRange: [6, 10], increment: 2.5, missStreak: 0 }

describe('beginner start (T-082j)', () => {
  it('1. adds weight each workout when every set reaches the range', () => {
    expect(nextLoad({ ...base, linear: true })).toEqual({ weight: 42.5, targetReps: 6, why: 'You hit 6 reps on every set. Beginners add weight each workout.' })
    // Without the beginner start, the same workout aims for one more rep.
    expect(nextLoad(base)).toMatchObject({ weight: 40, targetReps: 7 })
  })

  it('2. needs 2 or more reps left on logged sets, and a small jump', () => {
    expect(nextLoad({ ...base, linear: true, rirDone: [3, 2, 1] }).weight).toBe(40)
    expect(nextLoad({ ...base, linear: true, rirDone: [3, null, 2] }).weight).toBe(42.5)
    expect(nextLoad({ ...base, linear: true, repsDone: [6, 6, 5] }).weight).toBe(40)
    expect(nextLoad({ ...base, linear: true, weight: 20, increment: 5 }).weight).toBe(20) // a 25% jump
    expect(nextLoad({ ...base, linear: true, weight: 0 }).weight).toBe(0) // bodyweight
  })

  it('3. two misses in a row switch the lift to adding reps first, with a reason', () => {
    expect(nextLoad({ ...base, linear: true, repsDone: [5, 4, 4], missStreak: 2 })).toEqual({
      weight: 35,
      targetReps: 6,
      why: 'Your quick beginner gains have slowed. So the weight comes down a little. Now add reps first.',
    })
  })

  it('4. lasts 8 weeks from the first workout and ends after an earlier double miss', () => {
    expect(beginnerLinear({ daysSinceFirst: 20, misses: [false, false] })).toBe(true)
    expect(beginnerLinear({ daysSinceFirst: 56, misses: [] })).toBe(true)
    expect(beginnerLinear({ daysSinceFirst: 57, misses: [] })).toBe(false)
    expect(beginnerLinear({ daysSinceFirst: null, misses: [] })).toBe(false)
    expect(beginnerLinear({ daysSinceFirst: 20, misses: [true, true] })).toBe(true) // the switch happens now
    expect(beginnerLinear({ daysSinceFirst: 20, misses: [false, true, true] })).toBe(false) // already switched
  })
})
