// @vitest-environment jsdom
// The workout finish screen before the feedback questions (spec T-155).
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
const BENCH = 'bench-press'

const plan: Plan = {
  id: 'p1',
  name: 'Upper Lower',
  hardWeeks: 4,
  blockStartedOn: '2026-10-05',
  days: [
    { id: 'd1', dayIndex: 0, name: 'Upper A', exercises: [{ exerciseId: BENCH, sets: 3, repMin: 6, repMax: 10 }] },
    { id: 'd2', dayIndex: 1, name: 'Lower A', exercises: [{ exerciseId: 'back-squat', sets: 3, repMin: 6, repMax: 10 }] },
  ],
}
const session = (id: string, on: string, kg: number): Session => ({
  id,
  performedOn: on,
  planDayId: 'd1',
  name: 'Upper A',
  sets: [
    { id: `${id}-w`, exerciseId: BENCH, setIndex: 0, weightKg: 20, reps: 10, rir: null, tag: 'warmup' },
    ...[1, 2, 3].map((i) => ({ id: `${id}-${i}`, exerciseId: BENCH, setIndex: i, weightKg: kg, reps: 8, rir: 2 })),
  ],
})

describe('workout finish screen (T-155)', () => {
  it('1. shows time, sets, weight lifted, a record, a trend line and the next workout, then the questions', async () => {
    localStorage.setItem('tmf:workout-start:s2', String(Date.now() - 52 * 60_000))
    const store = memoryWorkoutStore({ plans: [plan], sessions: [session('s1', '2026-09-21', 60), session('s2', TODAY, 65)] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Upper A/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    const done = within(screen.getByRole('region', { name: 'Workout done' }))
    const stats = done.getAllByRole('definition').map((d) => d.textContent)
    expect(stats).toEqual(['52 min', '3', '1,560 kg'])
    expect(await done.findByText('Bench press (barbell): heaviest weight, 65 kg.')).toBeTruthy()
    expect(done.getByText('Bench press (barbell): one-rep max guess up 6.5 kg in 3 weeks.')).toBeTruthy()
    expect(done.getByText('Next workout: Lower A')).toBeTruthy()
    fireEvent.click(done.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('group', { name: 'Chest' })).toBeTruthy()
  })

  it('2. without history or a clock, it still shows the sets and weight', async () => {
    const store = memoryWorkoutStore({ plans: [plan], sessions: [session('s2', TODAY, 65)] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Upper A/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    const done = within(screen.getByRole('region', { name: 'Workout done' }))
    expect(done.getAllByRole('definition').map((d) => d.textContent)).toEqual(['3', '1,560 kg'])
    expect(done.queryByRole('list', { name: 'New records' })).toBeNull()
  })
})
