// Muscle priority: Grow more, Grow and Keep (spec T-082h).
import { describe, expect, it } from 'vitest'
import { LANDMARKS, keepTarget, nextWeekSets, startingSets, type MuscleFeedback } from './training'

const chest = LANDMARKS.chest // mv 8, mev 10, mavLow 12, mavHigh 20, mrv 22
const up: MuscleFeedback = { performance: 'up', recovery: 'healedEarly', effort: 'right', pain: false, downStreak: 0 }

describe('muscle priority (T-082h)', () => {
  it('1. Grow stops adding at the top of MAV, with a reason', () => {
    expect(nextWeekSets(19, up, chest)).toMatchObject({ sets: 20, why: 'Sets go up to 20. That is the usual top for this muscle.' })
    expect(nextWeekSets(20, up, chest)).toMatchObject({ sets: 20, change: 0, why: 'This is the usual top for this muscle, so sets stay. Pick "Grow more" to go higher.' })
    expect(nextWeekSets(12, up, chest, 'grow').sets).toBe(14)
  })

  it('2. Grow more may climb to MRV, then holds', () => {
    expect(nextWeekSets(20, up, chest, 'more').sets).toBe(22)
    expect(nextWeekSets(22, up, chest, 'more')).toMatchObject({ sets: 22, why: 'This is the most this muscle can heal from, so sets stay.' })
  })

  it('3. Keep holds the muscle at MV and never adds sets', () => {
    expect(keepTarget(chest)).toBe(8)
    expect(keepTarget(LANDMARKS.glutes)).toBe(2)
    expect(nextWeekSets(14, up, chest, 'keep')).toMatchObject({ sets: 8, change: -6, why: 'You chose Keep, so sets go down to 8.' })
    expect(nextWeekSets(6, up, chest, 'keep')).toMatchObject({ sets: 6, change: 0, why: 'You chose Keep, so sets stay the same.' })
    const hurt = nextWeekSets(8, { ...up, pain: true }, chest, 'keep')
    expect(hurt).toMatchObject({ sets: 6, swapExercise: true })
    expect(hurt.why).toMatch(/Something hurt/)
  })

  it('4. week-1 sets: Grow more starts at MAV low, Keep at its holding sets', () => {
    expect(startingSets('chest', 'intermediate')).toBe(10)
    expect(startingSets('chest', 'intermediate', 'more')).toBe(12)
    expect(startingSets('chest', 'intermediate', 'keep')).toBe(8)
  })
})
