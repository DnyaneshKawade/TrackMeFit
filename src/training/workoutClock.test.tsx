// @vitest-environment jsdom
// Keep the screen on and a workout clock (spec T-116).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'
import { KEEP_START_MS, markStart, readStart } from './workoutClock'

const TODAY = '2026-10-12'
const BENCH = exerciseById.get('bench-press')!.name

/** A fake Wake Lock that counts the locks held. */
function fakeWakeLock() {
  const held = { requests: 0, released: 0 }
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: {
      request: async () => {
        held.requests++
        return { release: async () => void held.released++ }
      },
    },
  })
  return held
}

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  delete (navigator as { wakeLock?: unknown }).wakeLock
})

const startWorkout = async () => {
  const store = memoryWorkoutStore()
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
  return store
}

describe('screen on and workout clock (T-116)', () => {
  it('1. keeps the screen on during a workout, asks again when the app shows, and lets go after', async () => {
    const held = fakeWakeLock()
    await startWorkout()
    await screen.findByRole('button', { name: 'Screen stays on' })
    expect(held.requests).toBe(1)
    act(() => void document.dispatchEvent(new Event('visibilitychange')))
    expect(held.requests).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    await screen.findByRole('button', { name: 'Start a workout' })
    expect(held.released).toBeGreaterThan(0)
  })

  it('2. the person can let the screen sleep, and the choice is kept', async () => {
    const held = fakeWakeLock()
    await startWorkout()
    const before = held.released
    fireEvent.click(await screen.findByRole('button', { name: 'Screen stays on' }))
    expect(screen.getByRole('button', { name: 'Keep the screen on' }).getAttribute('aria-pressed')).toBe('false')
    await act(async () => {})
    expect(held.released).toBe(before + 1)
    expect(localStorage.getItem('tmf:keep-awake')).toBe('0')
  })

  it('3. with no Wake Lock, nothing shows and the workout works', async () => {
    await startWorkout()
    await screen.findByRole('region', { name: 'Workout' })
    expect(screen.queryByRole('button', { name: /screen/ })).toBeNull()
    expect(screen.queryByRole('timer', { name: 'Workout time' })).toBeNull()
  })

  it('4. the clock starts at the first set and keeps going', async () => {
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

  it('5. keeps one start per workout and clears old ones', () => {
    const now = 1_800_000_000_000
    localStorage.setItem('tmf:workout-start:old', String(now - KEEP_START_MS - 1))
    localStorage.setItem('tmf:workout-start:recent', String(now - 1000))
    expect(markStart('w1', now)).toBe(now)
    expect(markStart('w1', now + 5000)).toBe(now)
    expect(readStart('old')).toBeNull()
    expect(readStart('recent')).toBe(now - 1000)
  })
})
