// @vitest-environment jsdom
// Light week choice: week-1 weights, or the same weight with 3 reps left (spec T-082n).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'
import { lightWeek } from '../engine/training'
import type { Plan, Session } from './types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const TODAY = '2026-10-12'
const BENCH = exerciseById.get('bench-press')!.name
// A light week: the block's start date is still ahead.
const PLAN: Plan = {
  id: 'p1',
  name: 'Upper',
  hardWeeks: 4,
  blockStartedOn: '2026-10-19',
  days: [{ id: 'd1', dayIndex: 0, name: 'Upper A', exercises: [{ exerciseId: 'bench-press', sets: 4, repMin: 6, repMax: 10 }] }],
}
const LAST: Session = {
  id: 's1',
  performedOn: '2026-10-08',
  planDayId: 'd1',
  name: 'Upper A',
  sets: [{ id: 'x1', exerciseId: 'bench-press', setIndex: 0, weightKg: 80, reps: 8, rir: 1 }],
}

const open = async (experience: 'beginner' | 'intermediate' = 'intermediate') => {
  const store = memoryWorkoutStore({ plans: [PLAN], sessions: [LAST] })
  render(<Workouts store={store} today={TODAY} answers={{ trainingDays: 3, experience, equipment: 'gym' }} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: /^Upper A/ }))
  return within(await screen.findByRole('region', { name: BENCH }))
}
const weightBox = (card: ReturnType<typeof within>) => card.getByLabelText(`${BENCH} weight (kg)`) as HTMLInputElement

describe('light week choice (T-082n)', () => {
  it('1. the engine: week-1 weights with 4 reps left, or last weight with 3 left', () => {
    expect(lightWeek({ sets: 4, load: 'week1', beginner: false, lastWeightKg: 80 })).toMatchObject({ sets: 2, rir: 4, weightKg: null, load: 'week1' })
    expect(lightWeek({ sets: 4, load: 'same', beginner: false, lastWeightKg: 80 })).toMatchObject({
      sets: 2,
      rir: 3,
      weightKg: 80,
      load: 'same',
      reason: "Light week: 2 sets at last time's weight. Stop while you could still do 3 more reps.",
    })
  })

  it('2. the engine: beginners and people with no weight from last time get week-1 weights', () => {
    expect(lightWeek({ sets: 3, load: 'same', beginner: true, lastWeightKg: 80 })).toMatchObject({ rir: 4, weightKg: null, load: 'week1' })
    expect(lightWeek({ sets: 3, load: 'same', beginner: false, lastWeightKg: null })).toMatchObject({ rir: 4, weightKg: null, load: 'week1' })
  })

  it('3. week-1 weights is the default; "Same weight" fills last weight and is kept', async () => {
    const card = await open()
    const group = within(screen.getByRole('group', { name: 'Light week weights' }))
    expect(group.getByRole('button', { name: 'Week-1 weights' }).getAttribute('aria-pressed')).toBe('true')
    expect(card.getByText('Light week: 2 sets at your week-1 weights. Stop while you could still do 4 more reps.')).toBeTruthy()
    expect(weightBox(card).value).toBe('')
    fireEvent.click(group.getByRole('button', { name: 'Same weight, 3 reps left' }))
    expect(await card.findByText("Light week: 2 sets at last time's weight. Stop while you could still do 3 more reps.")).toBeTruthy()
    await waitFor(() => expect(weightBox(card).value).toBe('80'))
    expect(localStorage.getItem('tmf:light-load')).toBe('same')
  })

  it('4. beginners see no choice and keep week-1 weights', async () => {
    localStorage.setItem('tmf:light-load', 'same')
    const card = await open('beginner')
    expect(screen.queryByRole('group', { name: 'Light week weights' })).toBeNull()
    expect(card.getByText('Light week: 2 sets at your week-1 weights. Stop while you could still do 4 more reps.')).toBeTruthy()
  })
})
