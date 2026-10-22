// @vitest-environment jsdom
// Open a past workout from the calendar to edit or delete it (spec T-128).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'
import type { Session } from './types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const TODAY = '2026-10-12'
const SQUAT = exerciseById.get('back-squat')!.name
const past = (): Session => ({
  id: 's1',
  performedOn: '2026-10-09',
  planDayId: null,
  name: 'Legs',
  sets: [
    { id: 'a', exerciseId: 'back-squat', setIndex: 0, weightKg: 100, reps: 5, rir: null },
    { id: 'b', exerciseId: 'back-squat', setIndex: 1, weightKg: 100, reps: 4, rir: null },
  ],
})

const openPast = async () => {
  const store = memoryWorkoutStore({ sessions: [past()] })
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Records and progress' }))
  fireEvent.click(await screen.findByRole('button', { name: /Friday, 9 October/ }))
  const list = screen.getByRole('list', { name: /Workouts on Friday, 9 October/ })
  fireEvent.click(within(list).getByRole('button', { name: 'Open Legs on Friday, 9 October' }))
  await screen.findByText('Past workout on 9 Oct 2026.')
  return store
}

describe('open a past workout (T-128)', () => {
  it('1. a past workout opens from its calendar day with its sets', async () => {
    await openPast()
    const card = within(screen.getByRole('region', { name: SQUAT }))
    expect(card.getByText(/Set 1: 100 kg × 5/)).toBeTruthy()
    expect(card.getByText(/Set 2: 100 kg × 4/)).toBeTruthy()
  })

  it('2. sets can be added and removed, and save on that day', async () => {
    const store = await openPast()
    const card = within(screen.getByRole('region', { name: SQUAT }))
    fireEvent.change(card.getByLabelText(`${SQUAT} weight (kg)`), { target: { value: '90' } })
    fireEvent.change(card.getByLabelText(`${SQUAT} reps`), { target: { value: '8' } })
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    await card.findByText(/Set 3: 90 kg × 8/)
    fireEvent.click(card.getByRole('button', { name: `Remove set 1 of ${SQUAT}` }))
    await card.findByText('Set removed.', { exact: false })
    const [saved] = await store.sessionsOn('2026-10-09')
    expect(saved.sets.map((s) => [s.weightKg, s.reps])).toEqual([[100, 4], [90, 8]])
  })

  it('3. a past workout can be deleted after a second tap, and the calendar shows it gone', async () => {
    const store = await openPast()
    fireEvent.click(screen.getByRole('button', { name: 'Delete this workout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))
    expect(await screen.findByRole('region', { name: 'Records and progress' })).toBeTruthy()
    expect(await store.sessionsOn('2026-10-09')).toEqual([])
    const cal = await screen.findByRole('region', { name: 'Workout calendar' })
    await within(cal).findByRole('button', { name: 'Month before' })
    await expect.poll(() => within(cal).queryByRole('button', { name: /9 October: \d workout/ })).toBeNull()
  })

  it('4. Done goes back to Records without asking how the muscles feel', async () => {
    await openPast()
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(await screen.findByRole('region', { name: 'Records and progress' })).toBeTruthy()
    expect(screen.queryByRole('group', { name: /feel/i })).toBeNull()
  })
})
