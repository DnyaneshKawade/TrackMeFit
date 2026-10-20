// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { blockWeekByWorkouts, workoutsInBlock } from './progression'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import type { Plan, Session } from './types'

afterEach(cleanup)

const plan: Plan = {
  id: 'p1',
  name: 'Upper Lower',
  hardWeeks: 4,
  blockStartedOn: '2026-10-01',
  days: [
    { id: 'u', dayIndex: 0, name: 'Upper', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }] },
    { id: 'l', dayIndex: 1, name: 'Lower', exercises: [{ exerciseId: 'back-squat', sets: 3, repMin: 6, repMax: 10 }] },
  ],
}
const done = (id: string, performedOn: string, planDayId: string | null): Session => ({ id, performedOn, planDayId, name: 'W', sets: [] })

describe('block weeks counted by workouts done (T-107)', () => {
  it('1. missed days wait: no workouts for two weeks is still week 1', () => {
    expect(blockWeekByWorkouts({ startedOn: '2026-10-01', today: '2026-10-15', done: 0, daysPerWeek: 2 })).toBe(1)
    expect(blockWeekByWorkouts({ startedOn: '2026-10-01', today: '2026-10-15', done: 1, daysPerWeek: 2 })).toBe(1)
    expect(blockWeekByWorkouts({ startedOn: '2026-10-01', today: '2026-10-15', done: 2, daysPerWeek: 2 })).toBe(2)
  })

  it('2. only this block’s plan workouts count, two on one day count as two', () => {
    const list = [done('a', '2026-09-30', 'u'), done('b', '2026-10-02', 'u'), done('c', '2026-10-02', 'l'), done('d', '2026-10-03', null), done('e', '2026-10-04', 'other')]
    expect(workoutsInBlock(plan, list, '2026-10-15')).toBe(2)
  })

  it('3. a start date still ahead is the light week; a coach can start at a later week', () => {
    expect(blockWeekByWorkouts({ startedOn: '2026-10-20', today: '2026-10-15', done: 0, daysPerWeek: 2 })).toBe(0)
    expect(blockWeekByWorkouts({ startedOn: '2026-10-15', today: '2026-10-15', done: 0, daysPerWeek: 2, startWeek: 3 })).toBe(3)
    expect(blockWeekByWorkouts({ startedOn: '2026-10-15', today: '2026-10-20', done: 2, daysPerWeek: 2, startWeek: 3 })).toBe(4)
  })

  it('4. the plan shows the week from workouts done, and falls back to dates offline', async () => {
    const store = memoryWorkoutStore({ plans: [plan], sessions: [done('b', '2026-10-02', 'u'), done('c', '2026-10-06', 'l'), done('f', '2026-10-09', 'u')] })
    // 22 days in, but only 3 workouts of a 2-day plan: week 2.
    const { unmount } = render(<Workouts store={store} today="2026-10-23" />)
    expect(await screen.findByText('Week 2 of 4')).toBeTruthy()
    unmount()
    render(<Workouts store={{ ...store, summaries: () => Promise.reject(new TypeError('Failed to fetch')) }} today="2026-10-23" />)
    expect(await screen.findByText('Week 4 of 4')).toBeTruthy()
  })
})
