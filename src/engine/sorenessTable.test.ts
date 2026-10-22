// Soreness timing, pump and the new set-change table (spec T-082g).
import { describe, expect, it } from 'vitest'
import { LANDMARKS, nextWeekSets, toRecovery, type MuscleFeedback } from './training'
import { latestFeedback } from '../training/progression'

const chest = LANDMARKS.chest
const fb = (over: Partial<MuscleFeedback>): MuscleFeedback => ({ performance: 'same', recovery: 'onTime', effort: 'right', pain: false, downStreak: 0, ...over })
const change = (over: Partial<MuscleFeedback>) => nextWeekSets(12, fb(over), chest).change

describe('set-change table (T-082g)', () => {
  it('1. follows the table: performance first, then how it healed', () => {
    expect(change({ performance: 'up', recovery: 'healedEarly' })).toBe(2)
    expect(change({ performance: 'up', recovery: 'never', effort: 'easy' })).toBe(2)
    expect(change({ performance: 'up', recovery: 'healedEarly', beginner: true })).toBe(1)
    expect(change({ performance: 'up', recovery: 'onTime' })).toBe(1)
    expect(change({ performance: 'same', recovery: 'healedEarly' })).toBe(1)
    expect(change({ performance: 'same', recovery: 'onTime' })).toBe(0)
    expect(change({ performance: 'up', recovery: 'stillSore' })).toBe(0)
    expect(change({ recovery: 'stillSore', stillSoreTimes: 2 })).toBe(-1)
    expect(change({ performance: 'down', downStreak: 1, recovery: 'never' })).toBe(0)
    expect(change({ performance: 'down', downStreak: 2 })).toBe(-2)
    expect(nextWeekSets(12, fb({ pain: true, performance: 'up', recovery: 'never' }), chest)).toMatchObject({ change: -2, swapExercise: true })
    expect(nextWeekSets(12, fb({ recovery: 'stillSore', stillSoreTimes: 2 }), chest).why).toBe('Still sore twice this week, so one set less.')
  })

  it('2. pump only breaks a tie: low pump with early healing adds one, never alone', () => {
    const low = nextWeekSets(12, fb({ recovery: 'healedEarly', pump: 'low' }), chest)
    expect(low).toMatchObject({ change: 2, why: 'Healing well, so one more set. The pump was low, so one more.' })
    expect(change({ recovery: 'healedEarly', pump: 'great' })).toBe(1)
    expect(change({ recovery: 'healedEarly', pump: 'low', beginner: true })).toBe(1)
    expect(change({ recovery: 'onTime', pump: 'low' })).toBe(0)
    expect(change({ recovery: 'stillSore', pump: 'low' })).toBe(0)
    expect(change({ recovery: 'healedEarly', pump: 'low', effort: 'hard' })).toBe(0)
  })

  it('3. no healing answer: one more set only when getting stronger', () => {
    expect(change({ recovery: null, performance: 'up' })).toBe(1)
    expect(nextWeekSets(12, fb({ recovery: null }), chest)).toMatchObject({ change: 0, why: 'No soreness answer yet, so sets stay the same.' })
  })

  it('4. old answers still count: fresh, a bit sore and very sore', () => {
    expect([toRecovery('fresh'), toRecovery('bitSore'), toRecovery('verySore'), toRecovery('onTime'), toRecovery(null), toRecovery('odd')]).toEqual([
      'healedEarly',
      'onTime',
      'stillSore',
      'onTime',
      null,
      null,
    ])
  })

  it('5. the week joins how it healed (next workout) with effort, pump and pain (after the workout)', () => {
    expect(
      latestFeedback([
        { muscle: 'chest', effort: 'right', pain: false, pump: 'low' }, // Monday, after the workout
        { muscle: 'chest', recovery: 'stillSore', pain: false }, // Thursday, first set
        { muscle: 'chest', recovery: 'stillSore', effort: 'hard', pain: true, hurt: ['bench-press'] }, // Thursday, after
        { muscle: 'back', recovery: 'fresh', effort: 'easy', pain: false }, // an old answer
      ]),
    ).toEqual([
      { muscle: 'chest', recovery: 'stillSore', stillSoreTimes: 2, effort: 'hard', pain: true, hurt: ['bench-press'] },
      { muscle: 'back', recovery: 'healedEarly', effort: 'easy', pain: false },
    ])
  })
})
