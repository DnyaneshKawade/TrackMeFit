// @vitest-environment jsdom
// Delete a workout, undo a skip, and put back a removed set (spec T-123).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import type { Plan, Session } from './types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const plan: Plan = { id: 'p1', name: 'PPL', hardWeeks: 4, blockStartedOn: '2026-10-05', days: [
  { id: 'a', dayIndex: 0, name: 'Push', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }] },
  { id: 'b', dayIndex: 1, name: 'Pull', exercises: [{ exerciseId: 'barbell-row', sets: 3, repMin: 6, repMax: 10 }] },
] }
const today = (sets = 2): Session => ({
  id: 's1',
  performedOn: TODAY,
  planDayId: null,
  name: 'Workout',
  sets: Array.from({ length: sets }, (_, i) => ({ id: `x${i}`, exerciseId: 'bench-press', setIndex: i, weightKg: 60 + i * 5, reps: 8, rir: 2 })),
})

describe('delete and put back (T-123)', () => {
  it('1. a workout is deleted with its sets only after a second tap', async () => {
    const store = memoryWorkoutStore({ sessions: [today()] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Workout.*2 sets logged/ }))
    click('Delete this workout')
    const ask = screen.getByRole('group', { name: 'Delete this workout?' })
    expect(within(ask).getByText('Delete this workout and its 2 sets? You can’t undo this.')).toBeTruthy()
    fireEvent.click(within(ask).getByRole('button', { name: 'Keep it' }))
    expect(await store.sessionsOn(TODAY)).toHaveLength(1)
    click('Delete this workout')
    click('Yes, delete')
    expect(await screen.findByText('No workout logged today.')).toBeTruthy()
    expect(await store.sessionsOn(TODAY)).toEqual([])
    expect(await store.exerciseHistory('bench-press')).toEqual([])
  })

  it('2. a skip can be taken back, so the plan’s next day returns', async () => {
    const store = memoryWorkoutStore({ plans: [plan] })
    render(<Workouts store={store} today={TODAY} />)
    expect(await screen.findByText('Next: Push')).toBeTruthy()
    click('Start a workout')
    click('Skip Push')
    click('Busy')
    click('Skip this workout')
    expect(await screen.findByText('Next: Pull')).toBeTruthy()
    click('Undo skip of Push')
    expect(await screen.findByText('Next: Push')).toBeTruthy()
    expect(screen.queryByText('Skipped: Busy')).toBeNull()
    expect(await store.summaries(TODAY, TODAY)).toEqual([])
  })

  it('3. a removed set can be put back with Undo', async () => {
    const store = memoryWorkoutStore({ sessions: [today()] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Workout.*2 sets logged/ }))
    const card = await screen.findByRole('region', { name: 'Bench press (barbell)' })
    fireEvent.click(within(card).getByRole('button', { name: 'Remove set 1 of Bench press (barbell)' }))
    expect(await within(card).findByText(/Set removed\./)).toBeTruthy()
    expect((await store.sessionsOn(TODAY))[0].sets.map((s) => s.weightKg)).toEqual([65])
    fireEvent.click(within(card).getByRole('button', { name: 'Undo' }))
    await within(card).findByText(/^Set 2:/)
    expect(within(card).queryByText(/Set removed\./)).toBeNull()
    expect((await store.sessionsOn(TODAY))[0].sets.map((s) => s.weightKg).sort()).toEqual([60, 65])
  })
})
