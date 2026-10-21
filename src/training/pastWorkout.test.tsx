// @vitest-environment jsdom
// Log a workout for an earlier day (spec T-126).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'

const TODAY = '2026-10-12'
const BENCH = exerciseById.get('bench-press')!.name

afterEach(cleanup)

const openStart = async () => {
  const store = memoryWorkoutStore()
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  return store
}

const logBench = async () => {
  fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
  fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'bench press barbell' } })
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${BENCH.replace(/[()]/g, '\\$&')}`) }))
  const card = within(await screen.findByRole('region', { name: BENCH }))
  fireEvent.change(card.getByLabelText(`${BENCH} weight (kg)`), { target: { value: '60' } })
  fireEvent.change(card.getByLabelText(`${BENCH} reps`), { target: { value: '10' } })
  fireEvent.click(card.getByRole('button', { name: 'Log set' }))
  await card.findByText(/Set 1:/)
}

describe('past workout (T-126)', () => {
  it('1. the workout date starts at today and cannot be in the future', async () => {
    await openStart()
    const date = screen.getByLabelText('Workout date') as HTMLInputElement
    expect(date.value).toBe(TODAY)
    expect(date.max).toBe(TODAY)
    expect(date.min).toBe('2025-10-12')
  })

  it('2. a workout started after picking an earlier date is saved on that date with its sets', async () => {
    const store = await openStart()
    fireEvent.change(screen.getByLabelText('Workout date'), { target: { value: '2026-10-09' } })
    expect(screen.getByText('This workout is logged on 9 Oct.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
    await logBench()
    const saved = await store.sessionsOn('2026-10-09')
    expect(saved).toHaveLength(1)
    expect(saved[0].sets).toHaveLength(1)
    expect(await store.sessionsOn(TODAY)).toHaveLength(0)
  })

  it('3. a past workout shows its date and no live workout clock or rest timer', async () => {
    await openStart()
    fireEvent.change(screen.getByLabelText('Workout date'), { target: { value: '2026-10-09' } })
    fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
    expect(await screen.findByText('Past workout on 9 Oct 2026.')).toBeTruthy()
    await logBench()
    expect(screen.queryByRole('timer', { name: 'Workout time' })).toBeNull()
    expect(screen.queryByRole('timer', { name: 'Rest' })).toBeNull()
  })

  it('4. a date outside the allowed range falls back to today', async () => {
    const store = await openStart()
    fireEvent.change(screen.getByLabelText('Workout date'), { target: { value: '2027-01-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
    await screen.findByRole('button', { name: '+ Add exercise' })
    await logBench()
    expect(await store.sessionsOn(TODAY)).toHaveLength(1)
  })
})
