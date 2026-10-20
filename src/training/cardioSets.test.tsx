// @vitest-environment jsdom
// Cardio sets (spec T-114).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { setFromRow } from './supabaseStore'
import type { Session } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'

const startEmpty = async (sessions: Session[] = []) => {
  const store = memoryWorkoutStore({ sessions })
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
  fireEvent.click(await screen.findByRole('button', { name: '+ Add cardio' }))
  return store
}

describe('cardio sets (T-114)', () => {
  it('6. logs a time and distance with no weight or reps, and shows the speed', async () => {
    const store = await startEmpty()
    fireEvent.click(screen.getByRole('button', { name: 'Treadmill' }))
    const card = within(await screen.findByRole('region', { name: 'Treadmill' }))
    fireEvent.change(card.getByLabelText('Treadmill time'), { target: { value: '25:30' } })
    fireEvent.change(card.getByLabelText('Treadmill distance (km)'), { target: { value: '3,2' } })
    fireEvent.click(card.getByRole('button', { name: 'Log' }))
    expect(await card.findByText('3.2 km in 25:30 · 7.5 km/h')).toBeTruthy()
    const [set] = (await store.sessionsOn(TODAY))[0].sets
    expect(set).toMatchObject({ exerciseId: 'cardio-treadmill', weightKg: 0, reps: 0, rir: null, seconds: 1530, distanceKm: 3.2 })
    // Cardio alone asks no muscle questions at the end.
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(await screen.findByRole('button', { name: 'Start a workout' })).toBeTruthy()
  })

  it('7. needs a time, and a time-only move has no distance box', async () => {
    const store = await startEmpty()
    fireEvent.click(screen.getByRole('button', { name: 'Skipping rope' }))
    const card = within(await screen.findByRole('region', { name: 'Skipping rope' }))
    expect(card.queryByLabelText(/distance/)).toBeNull()
    fireEvent.click(card.getByRole('button', { name: 'Log' }))
    expect(card.getByRole('alert').textContent).toMatch(/Enter the time/)
    fireEvent.change(card.getByLabelText('Skipping rope time'), { target: { value: '10' } })
    fireEvent.click(card.getByRole('button', { name: 'Log' }))
    expect(await card.findByText('10:00')).toBeTruthy()
    expect((await store.sessionsOn(TODAY))[0].sets[0]).toMatchObject({ seconds: 600 })
    expect((await store.sessionsOn(TODAY))[0].sets[0].distanceKm).toBeUndefined()
  })

  it('8. records show the farthest, longest and fastest, with past entries', async () => {
    const cardio = (id: string, on: string, seconds: number, distanceKm?: number): Session => ({
      id,
      performedOn: on,
      planDayId: null,
      name: 'Cardio',
      sets: [{ id: id + 'x', exerciseId: 'cardio-run', setIndex: 0, weightKg: 0, reps: 0, rir: null, seconds, ...(distanceKm ? { distanceKm } : {}) }],
    })
    const store = memoryWorkoutStore({ sessions: [cardio('a', '2026-10-01', 1800, 5), cardio('b', '2026-10-05', 900, 3), cardio('c', '2026-10-08', 2400)] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Records and progress' }))
    fireEvent.click(await screen.findByRole('button', { name: /^Run/ }))
    const view = within(await screen.findByRole('region', { name: 'Run' }))
    expect((await view.findByText('Farthest')).nextElementSibling!.textContent).toMatch(/^5 km in 30:00/)
    expect(view.getByText('Longest').nextElementSibling!.textContent).toMatch(/^40:00/)
    expect(view.getByText('Fastest').nextElementSibling!.textContent).toMatch(/^12 km\/h · 5 Oct/)
    expect(within(view.getByRole('list', { name: 'Past entries' })).getAllByRole('listitem')).toHaveLength(3)
  })

  it('9. reads the time and distance from the database row', () => {
    const row = { id: 'r', exercise_id: 'cardio-rower', set_index: 0, weight_kg: '0', reps: 0, rir: null, duration_sec: 600, distance_km: '2.50' }
    expect(setFromRow(row)).toMatchObject({ seconds: 600, distanceKm: 2.5 })
    expect(setFromRow({ ...row, duration_sec: null, distance_km: null })).not.toHaveProperty('seconds')
  })
})
