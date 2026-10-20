// @vitest-environment jsdom
// A workout clock from the first set (spec T-116).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'
import { KEEP_START_MS, markStart, readStart } from './workoutClock'

const TODAY = '2026-10-12'
const BENCH = exerciseById.get('bench-press')!.name

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const startWorkout = async () => {
  const store = memoryWorkoutStore()
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
  return store
}

describe('workout clock (T-116)', () => {
  it('1. no clock shows before the first set, and the screen is left alone', async () => {
    await startWorkout()
    await screen.findByRole('region', { name: 'Workout' })
    expect(screen.queryByRole('timer', { name: 'Workout time' })).toBeNull()
    expect(screen.queryByRole('button', { name: /screen/i })).toBeNull()
  })

  it('2. the clock starts at the first set and keeps going', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await startWorkout()
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'bench press barbell' } })
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${BENCH.replace(/[()]/g, '\\$&')}`) }))
    expect(screen.queryByRole('timer', { name: 'Workout time' })).toBeNull()
    const card = within(await screen.findByRole('region', { name: BENCH }))
    fireEvent.change(card.getByLabelText(`${BENCH} weight (kg)`), { target: { value: '60' } })
    fireEvent.change(card.getByLabelText(`${BENCH} reps`), { target: { value: '10' } })
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    expect((await screen.findByRole('timer', { name: 'Workout time' })).textContent).toBe('⏱ 0:00')
    await act(async () => void vi.advanceTimersByTime(65_000))
    expect(screen.getByRole('timer', { name: 'Workout time' }).textContent).toBe('⏱ 1:05')
  })

  it('3. keeps one start per workout and clears old ones', () => {
    const now = 1_800_000_000_000
    localStorage.setItem('tmf:workout-start:old', String(now - KEEP_START_MS - 1))
    localStorage.setItem('tmf:workout-start:recent', String(now - 1000))
    expect(markStart('w1', now)).toBe(now)
    expect(markStart('w1', now + 5000)).toBe(now)
    expect(readStart('old')).toBeNull()
    expect(readStart('recent')).toBe(now - 1000)
  })
})
