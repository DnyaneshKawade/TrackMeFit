import { describe, expect, it } from 'vitest'
import { formatRest, restLeft, restSeconds } from './restTimer'

describe('rest timer (T-043a)', () => {
  it('3. rests 2 min 30 s after big lifts and 1 min 30 s after isolation work', () => {
    expect(restSeconds({ isolation: false })).toBe(150)
    expect(restSeconds({ isolation: true })).toBe(90)
  })

  it('3. counts from the clock and never goes below zero', () => {
    const end = 1_000_000
    expect(restLeft(end, end - 150_000)).toBe(150)
    expect(restLeft(end, end - 149_001)).toBe(150)
    expect(restLeft(end, end - 1)).toBe(1)
    expect(restLeft(end, end + 5000)).toBe(0)
    expect(formatRest(150)).toBe('2:30')
    expect(formatRest(9)).toBe('0:09')
  })
})
