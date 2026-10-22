// @vitest-environment jsdom
// Today checklist, "Day done" and the evening peek (spec T-156).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { FoodLog } from './FoodLog'
import { memoryLogStore } from './memoryStore'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import { memoryTargetStore } from '../targets/stores'
import { memoryWorkoutStore } from '../training/memoryStore'
import { trainingToday } from '../training/today'
import type { LogEntry, Meal } from './types'
import type { Plan, Session } from '../training/types'

afterEach(cleanup)

const DAY = '2026-10-14' // a Wednesday
const TARGET = { id: 't', startsOn: '2026-10-01', kcal: 2000, proteinG: 120, carbG: 250, fatG: 60, source: 'manual' as const, setBy: 'me' }
const entry = (meal: Meal, kcal: number): LogEntry => ({ id: `${meal}-${kcal}`, loggedOn: DAY, meal, foodId: 'quick', foodName: `${meal} food`, grams: null, kcal, proteinG: 30, carbG: 60, fatG: 15 })

const show = (entries: LogEntry[], extra = {}) =>
  render(
    <FoodLog
      store={memoryLogStore(entries)}
      loadFoods={() => Promise.resolve(localFinder(createSearchIndex([])))}
      targets={memoryTargetStore('me', [TARGET])}
      userId="me"
      today={DAY}
      hour={20}
      weighIns={() => Promise.resolve([{ date: DAY, kg: 70 }])}
      training={() => Promise.resolve({ workout: 'done' as const, tomorrow: 'Lower A' })}
      {...extra}
    />,
  )

describe('today checklist (T-156)', () => {
  it('1. all done: "4 of 4", "Day done ✓" on the ring, and a peek at tomorrow', async () => {
    show([entry('breakfast', 500), entry('lunch', 700), entry('dinner', 750)])
    const list = within(await screen.findByRole('region', { name: 'Today checklist' }))
    expect(await list.findByRole('heading', { name: 'Today: 4 of 4 done' })).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Eaten today' })).getByText('Day done ✓')).toBeTruthy()
    expect(screen.getByText('Tomorrow: Lower A.')).toBeTruthy()
  })

  it('2. part done: unticked items say "not yet", and over the target gets a kind line', async () => {
    show([entry('breakfast', 1200), entry('lunch', 1300)], { weighIns: () => Promise.resolve([]), training: () => Promise.resolve({ workout: 'todo' as const, tomorrow: 'Upper B' }) })
    const list = within(await screen.findByRole('region', { name: 'Today checklist' }))
    expect(await list.findByRole('heading', { name: 'Today: 0 of 4 done' })).toBeTruthy()
    expect(list.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['○ Meals: 2 of 3, not yet', '○ Calories near your target, not yet', '○ Workout, not yet', '○ Weigh-in, not yet'])
    expect(screen.getByText('That’s OK. Tomorrow is a new day.')).toBeTruthy()
    expect(screen.queryByText('Day done ✓')).toBeNull()
  })

  it('3. no peek before 7 pm', async () => {
    show([entry('breakfast', 500)], { hour: 18 })
    await screen.findByRole('region', { name: 'Today checklist' })
    expect(screen.queryByText(/^Tomorrow/)).toBeNull()
  })

  it('4. the workout state and tomorrow come from the plan and this week', async () => {
    const plan: Plan = { id: 'p', name: 'Plan', days: ['A', 'B', 'C'].map((n, i) => ({ id: `d${i}`, dayIndex: i, name: `Day ${n}`, exercises: [] })) }
    const done = (id: string, on: string, day: string): Session => ({ id, performedOn: on, planDayId: day, name: day, sets: [] })
    // Monday Day A: today is still to do (Day B), so tomorrow is Day C.
    expect(await trainingToday(memoryWorkoutStore({ plans: [plan], sessions: [done('s1', '2026-10-12', 'd0')] }), DAY)).toEqual({ workout: 'todo', tomorrow: 'Day C' })
    // Day B done today: tomorrow is Day C.
    expect(await trainingToday(memoryWorkoutStore({ plans: [plan], sessions: [done('s1', '2026-10-12', 'd0'), done('s2', DAY, 'd1')] }), DAY)).toEqual({ workout: 'done', tomorrow: 'Day C' })
    // All 3 done by Tuesday: today and tomorrow are rest days.
    const week = [done('s1', '2026-10-12', 'd0'), done('s2', '2026-10-12', 'd1'), done('s3', '2026-10-13', 'd2')]
    expect(await trainingToday(memoryWorkoutStore({ plans: [plan], sessions: week }), DAY)).toEqual({ workout: 'rest', tomorrow: 'Rest day' })
    // No plan: no workout item.
    expect(await trainingToday(memoryWorkoutStore(), DAY)).toEqual({ workout: null, tomorrow: null })
  })
})
