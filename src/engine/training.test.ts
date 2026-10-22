import { describe, expect, it } from 'vitest'
import {
  LANDMARKS,
  deloadSets,
  distributeSets,
  estimatedOneRepMax,
  fractionalVolume,
  nextLoad,
  nextWeekSets,
  shouldDeload,
  startingSets,
  targetRir,
  type MuscleFeedback,
} from './training'

const fb = (over: Partial<MuscleFeedback>): MuscleFeedback => ({
  performance: 'same', recovery: 'healedEarly', effort: 'right', pain: false, downStreak: 0, ...over,
})

describe('startingSets', () => {
  it('starts at MEV scaled by experience', () => {
    expect(startingSets('chest', 'intermediate')).toBe(10)
    expect(startingSets('chest', 'beginner')).toBe(6)
    expect(startingSets('chest', 'advanced')).toBe(12)
  })
  it('starts priority muscles higher', () => {
    expect(startingSets('biceps', 'intermediate', 'more')).toBe(14)
  })
})

describe('nextWeekSets', () => {
  const chest = LANDMARKS.chest
  it('adds two sets when stronger and easy', () => {
    expect(nextWeekSets(10, fb({ performance: 'up', effort: 'easy' }), chest).sets).toBe(12)
  })
  it('adds one set when recovering well', () => {
    expect(nextWeekSets(10, fb({ performance: 'up', recovery: 'onTime' }), chest).sets).toBe(11)
    expect(nextWeekSets(10, fb({}), chest).sets).toBe(11)
  })
  it('holds when still sore or it felt hard', () => {
    expect(nextWeekSets(10, fb({ performance: 'up', recovery: 'stillSore' }), chest).change).toBe(0)
    expect(nextWeekSets(10, fb({ effort: 'hard' }), chest).change).toBe(0)
  })
  it('never adds sets because of soreness alone', () => {
    expect(nextWeekSets(10, fb({ recovery: 'stillSore', performance: 'up', effort: 'easy' }), chest).change).toBeLessThanOrEqual(0)
  })
  it('holds after one bad session, cuts after two', () => {
    expect(nextWeekSets(14, fb({ performance: 'down', downStreak: 1 }), chest).change).toBe(0)
    const two = nextWeekSets(14, fb({ performance: 'down', downStreak: 2 }), chest)
    expect(two.sets).toBe(12)
    expect(two.recoverySession).toBe(true)
  })
  it('cuts sets and swaps the exercise on pain', () => {
    const d = nextWeekSets(14, fb({ pain: true, performance: 'up' }), chest)
    expect(d.sets).toBe(12)
    expect(d.swapExercise).toBe(true)
  })
  it('stays within MV and MRV', () => {
    expect(nextWeekSets(22, fb({ performance: 'up', effort: 'easy' }), chest).sets).toBe(22)
    expect(nextWeekSets(9, fb({ pain: true }), chest).sets).toBe(8)
  })
  it('always explains the change', () => {
    expect(nextWeekSets(10, fb({}), chest).why.length).toBeGreaterThan(10)
  })
})

describe('fractionalVolume', () => {
  it('counts secondary movers as half sets', () => {
    const v = fractionalVolume([
      { primary: ['back'], secondary: ['biceps'], sets: 4 },
      { primary: ['biceps'], sets: 3 },
    ])
    expect(v.back).toBe(4)
    expect(v.biceps).toBe(5)
  })
})

describe('distributeSets', () => {
  it('spreads sets evenly', () => {
    expect(distributeSets(14, 2)).toEqual([7, 7])
    expect(distributeSets(13, 3)).toEqual([5, 4, 4])
  })
  it('caps sets per session', () => {
    expect(distributeSets(24, 2)).toEqual([10, 10])
  })
})

describe('targetRir', () => {
  it('ramps 3, 2, 1, 1 over a 4-week block', () => {
    expect([1, 2, 3, 4].map((w) => targetRir(w, 4, false))).toEqual([3, 2, 1, 1])
  })
  it('allows failure only on isolation work in the last hard week', () => {
    expect(targetRir(4, 4, true)).toBe(0)
    expect(targetRir(3, 4, true)).toBe(1)
  })
  it('uses 4 in reserve on deloads', () => {
    expect(targetRir(5, 4, true, true)).toBe(4)
  })
})

describe('estimatedOneRepMax', () => {
  it('counts reps in reserve', () => {
    expect(estimatedOneRepMax(100, 5, 0)).toBeCloseTo(116.67, 1)
    expect(estimatedOneRepMax(100, 5, 2)).toBeCloseTo(123.33, 1)
  })
})

describe('nextLoad', () => {
  it('adds weight after hitting the top of the range on every set', () => {
    expect(nextLoad({ weight: 60, repsDone: [10, 10, 10], repRange: [8, 10], increment: 2.5, missStreak: 0 })).toMatchObject({ weight: 62.5, targetReps: 8 })
  })
  it('adds reps when the next dumbbell is too big a jump', () => {
    expect(nextLoad({ weight: 10, repsDone: [12, 12], repRange: [8, 12], increment: 2.5, missStreak: 0 })).toMatchObject({ weight: 10, targetReps: 13 })
  })
  it('keeps weight and aims for one more rep otherwise', () => {
    expect(nextLoad({ weight: 60, repsDone: [10, 9, 8], repRange: [8, 10], increment: 2.5, missStreak: 0 })).toMatchObject({ weight: 60, targetReps: 10 })
  })
  it('drops weight after missing the range twice', () => {
    expect(nextLoad({ weight: 60, repsDone: [7, 6], repRange: [8, 10], increment: 2.5, missStreak: 2 }).weight).toBe(55)
  })
})

describe('deloads', () => {
  it('triggers at block end, when run down, or when half the muscles regress', () => {
    const base = { week: 3, plannedHardWeeks: 4, musclesDown: 0, musclesTrained: 8, userRunDown: false }
    expect(shouldDeload(base)).toBe(false)
    expect(shouldDeload({ ...base, week: 5 })).toBe(true)
    expect(shouldDeload({ ...base, userRunDown: true })).toBe(true)
    expect(shouldDeload({ ...base, musclesDown: 4 })).toBe(true)
  })
  it('halves sets, rounding up', () => {
    expect(deloadSets(15)).toBe(8)
  })
})
