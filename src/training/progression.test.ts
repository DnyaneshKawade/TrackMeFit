import { describe, expect, it } from 'vitest'
import { applySetChange, blockWeek, isDeloadWeek, musclePerformance, performanceTrend, reviewWeek, weekLabel, weeklySets } from './progression'
import type { PastSession, Plan } from './types'

const s = (on: string, weightKg: number, reps: number): PastSession => ({
  performedOn: on,
  sets: [{ id: on, exerciseId: 'x', setIndex: 0, weightKg, reps, rir: null }],
})

const plan: Plan = {
  id: 'p',
  name: 'Upper Lower',
  days: [
    {
      id: 'a',
      dayIndex: 0,
      name: 'Upper',
      exercises: [
        { exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 },
        { exerciseId: 'barbell-row', sets: 3, repMin: 6, repMax: 10 },
      ],
    },
    {
      id: 'b',
      dayIndex: 1,
      name: 'Upper 2',
      exercises: [
        { exerciseId: 'incline-db-press', sets: 4, repMin: 8, repMax: 12 },
        { exerciseId: 'lat-pulldown', sets: 3, repMin: 8, repMax: 12 },
      ],
    },
  ],
}

describe('training block weeks', () => {
  it('counts weeks from the block start; before the start is the deload week', () => {
    expect(blockWeek('2026-10-01', '2026-10-01')).toBe(1)
    expect(blockWeek('2026-10-01', '2026-10-07')).toBe(1)
    expect(blockWeek('2026-10-01', '2026-10-08')).toBe(2)
    expect(blockWeek('2026-10-08', '2026-10-03')).toBe(0)
    expect(weekLabel(2, 4)).toBe('Week 2 of 4')
    expect(weekLabel(5, 4)).toBe('Light week')
    expect(isDeloadWeek(0, 4)).toBe(true)
  })
})

describe('performance', () => {
  it('compares each session with the one before by estimated one-rep max', () => {
    expect(performanceTrend([s('c', 62.5, 8), s('b', 60, 8), s('a', 60, 10)])).toEqual(['up', 'down'])
    expect(performanceTrend([s('b', 60, 8)])).toEqual([])
    expect(performanceTrend([s('b', 60, 8), s('a', 60, 8)])).toEqual(['same'])
  })
  it('a muscle is down if any main exercise is down, and counts the streak', () => {
    expect(musclePerformance([['up'], ['same']])).toEqual({ performance: 'up', downStreak: 0 })
    expect(musclePerformance([['up'], ['down', 'down']])).toEqual({ performance: 'down', downStreak: 2 })
    expect(musclePerformance([[]])).toEqual({ performance: 'same', downStreak: 0 })
  })
})

describe('sets', () => {
  it('counts weekly sets, secondary movers as half', () => {
    // bench 3 + incline 4 = 7 chest; triceps 0.5 * 7 = 3.5
    expect(weeklySets(plan)).toMatchObject({ chest: 7, back: 6, triceps: 3.5, biceps: 3 })
  })
  it('adds sets to the exercise with the fewest and removes from the one with the most', () => {
    const more = applySetChange(plan, 'chest', 2)
    expect(more.days[0].exercises[0].sets).toBe(5)
    expect(more.days[1].exercises[0].sets).toBe(4)
    const fewer = applySetChange(plan, 'chest', -1)
    expect(fewer.days[1].exercises[0].sets).toBe(3)
    expect(plan.days[0].exercises[0].sets).toBe(3) // original untouched
  })
  it('never goes below 1 set per exercise or past the per-session cap', () => {
    expect(applySetChange(plan, 'back', -10).days.flatMap((d) => d.exercises.map((e) => e.sets))).toEqual([3, 1, 4, 1])
    const capped = applySetChange(plan, 'chest', 30)
    expect(capped.days[0].exercises[0].sets).toBe(10)
    expect(capped.days[1].exercises[0].sets).toBe(10)
  })
})

describe('week review', () => {
  const base = { plan, week: 2, hardWeeks: 4, histories: {}, runDown: false }
  it('holds sets for muscles without feedback', () => {
    const r = reviewWeek({ ...base, feedback: [] })
    expect(r.deload).toBe(false)
    expect(r.muscles.find((m) => m.muscle === 'chest')).toMatchObject({ sets: 7, nextSets: 7, why: 'No feedback after training yet, so sets stay the same.' })
    expect(r.proposed).toEqual(plan)
  })
  it('adds sets when getting stronger and it felt easy, with the engine reason', () => {
    const r = reviewWeek({
      ...base,
      histories: { 'bench-press': [s('b', 62.5, 8), s('a', 60, 8)] },
      feedback: [{ muscle: 'chest', recovery: 'fresh', effort: 'easy', pain: false }],
    })
    const chest = r.muscles.find((m) => m.muscle === 'chest')!
    expect(chest).toMatchObject({ sets: 7, nextSets: 9, why: 'Getting stronger and it felt easy, so two more sets.' })
    expect(r.proposed.days[0].exercises[0].sets).toBe(5)
  })
  it('cuts sets and suggests a swap when something hurt, but never below maintenance', () => {
    const bigBack = applySetChange(plan, 'back', 6) // 12 back sets
    const r = reviewWeek({ ...base, plan: bigBack, feedback: [{ muscle: 'back', recovery: 'fresh', effort: 'right', pain: true }] })
    const back = r.muscles.find((m) => m.muscle === 'back')!
    expect(back).toMatchObject({ sets: 12, nextSets: 10 })
    expect(back.decision?.swapExercise).toBe(true)
    // At 6 sets back is already under its maintenance volume (8), so it holds.
    const small = reviewWeek({ ...base, feedback: [{ muscle: 'back', recovery: 'fresh', effort: 'right', pain: true }] })
    expect(small.muscles.find((m) => m.muscle === 'back')!.nextSets).toBe(6)
  })
  it('calls a deload after the hard weeks, when run down, or when half the muscles drop', () => {
    expect(reviewWeek({ ...base, week: 5, feedback: [] })).toMatchObject({ deload: true, why: "You've finished 4 hard weeks, so this is a light week." })
    expect(reviewWeek({ ...base, runDown: true, feedback: [] }).why).toMatch(/You feel tired/)
    const drops = reviewWeek({ ...base, feedback: [], histories: { 'bench-press': [s('b', 50, 8), s('a', 60, 8)] } })
    expect(drops.deload).toBe(true)
    expect(drops.proposed).toEqual(plan)
  })
})
