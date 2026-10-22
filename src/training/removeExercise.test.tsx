// @vitest-environment jsdom
// Take a planned exercise out of today's workout (spec T-130).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'
import { KEEP_WORKOUTS, readHidden, saveHidden } from './hiddenExercises'
import type { Plan } from './types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const TODAY = '2026-10-12'
const BENCH = exerciseById.get('bench-press')!.name
const ROW = exerciseById.get('barbell-row')!.name
const plan: Plan = { id: 'p1', name: 'PPL', hardWeeks: 4, blockStartedOn: '2026-10-05', days: [
  { id: 'a', dayIndex: 0, name: 'Push', exercises: [
    { exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 },
    { exerciseId: 'barbell-row', sets: 3, repMin: 6, repMax: 10 },
  ] },
] }

const startPush = async () => {
  const store = memoryWorkoutStore({ plans: [plan] })
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(await screen.findByRole('button', { name: /^Push/ }))
  await screen.findByRole('region', { name: BENCH })
  return store
}

describe('remove an exercise from today (T-130)', () => {
  it('1. ✕ takes a planned exercise out of today, and Undo brings it back', async () => {
    const store = await startPush()
    fireEvent.click(screen.getByRole('button', { name: `Remove ${ROW} from this workout` }))
    expect(screen.queryByRole('region', { name: ROW })).toBeNull()
    expect(screen.getByRole('status').textContent).toContain(`${ROW} removed from this workout.`)
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByRole('region', { name: ROW })).toBeTruthy()
    // The plan itself keeps the exercise.
    expect((await store.plans())[0].days[0].exercises.map((e) => e.exerciseId)).toEqual(['bench-press', 'barbell-row'])
  })

  it('2. another exercise can be added in its place', async () => {
    await startPush()
    fireEvent.click(screen.getByRole('button', { name: `Remove ${ROW} from this workout` }))
    fireEvent.click(screen.getByRole('button', { name: '+ Add exercise' }))
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'dips' } })
    const dips = exerciseById.get('dips')!.name
    fireEvent.click(screen.getAllByRole('button', { name: new RegExp(`^${dips}`) })[0])
    expect(await screen.findByRole('region', { name: dips })).toBeTruthy()
    expect(screen.queryByRole('region', { name: ROW })).toBeNull()
  })

  it('3. an exercise with logged sets has no ✕', async () => {
    await startPush()
    const card = within(screen.getByRole('region', { name: BENCH }))
    fireEvent.change(card.getByLabelText(`${BENCH} weight (kg)`), { target: { value: '60' } })
    fireEvent.change(card.getByLabelText(`${BENCH} reps`), { target: { value: '8' } })
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    await card.findByText(/Set 1:/)
    expect(card.queryByRole('button', { name: `Remove ${BENCH} from this workout` })).toBeNull()
  })

  it('4. the removed exercise stays out when the workout is opened again', async () => {
    await startPush()
    fireEvent.click(screen.getByRole('button', { name: `Remove ${ROW} from this workout` }))
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    fireEvent.click(await screen.findByRole('button', { name: /^Push/ }))
    await screen.findByRole('region', { name: BENCH })
    expect(screen.queryByRole('region', { name: ROW })).toBeNull()
  })

  it('5. only the last workouts are kept on the phone', () => {
    for (let i = 0; i < KEEP_WORKOUTS + 2; i++) saveHidden(`w${i}`, ['x'])
    expect(readHidden('w0')).toEqual([])
    expect(readHidden(`w${KEEP_WORKOUTS + 1}`)).toEqual(['x'])
  })
})
