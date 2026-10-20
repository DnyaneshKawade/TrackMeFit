// @vitest-environment jsdom
// Copy a past workout (spec T-113).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'
import type { Session, SetLog } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const BENCH = exerciseById.get('bench-press')!.name
const ROW = exerciseById.get('lat-pulldown')!.name
const set = (id: string, exerciseId: string, setIndex: number, weightKg: number, reps: number, tag?: SetLog['tag']): SetLog => ({ id, exerciseId, setIndex, weightKg, reps, rir: 2, ...(tag ? { tag } : {}) })
const past: Session = {
  id: 'old',
  performedOn: '2026-10-08',
  planDayId: null,
  name: 'Workout',
  sets: [set('w', 'bench-press', 0, 20, 10, 'warmup'), set('a', 'bench-press', 1, 60, 10), set('b', 'bench-press', 2, 60, 8), set('c', 'lat-pulldown', 3, 45, 12)],
}

const startEmpty = async (sessions: Session[] = [past]) => {
  const store = memoryWorkoutStore({ sessions })
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Copy a past workout' }))
  return store
}

describe('copy a past workout (T-113)', () => {
  it('1. copies the ticked exercises, filling the boxes without logging anything', async () => {
    const store = await startEmpty()
    fireEvent.click(await screen.findByRole('button', { name: /^Workout.*8 Oct.*2 exercises/ }))
    fireEvent.click(await screen.findByLabelText(ROW))
    fireEvent.click(screen.getByRole('button', { name: 'Copy 1 exercise' }))
    const card = within(await screen.findByRole('region', { name: BENCH }))
    expect(card.getByText('Copied from 8 Oct: 60 kg × 10, 8')).toBeTruthy()
    expect((card.getByLabelText(`${BENCH} weight (kg)`) as HTMLInputElement).value).toBe('60')
    expect((card.getByLabelText(`${BENCH} reps`) as HTMLInputElement).value).toBe('10')
    expect(screen.queryByRole('region', { name: ROW })).toBeNull()
    expect((await store.sessionsOn(TODAY))[0].sets).toEqual([])
  })

  it('2. after each set, the next copied set fills the boxes, and can be changed', async () => {
    const store = await startEmpty()
    fireEvent.click(await screen.findByRole('button', { name: /8 Oct/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Copy 2 exercises' }))
    const card = within(await screen.findByRole('region', { name: BENCH }))
    fireEvent.change(card.getByLabelText(`${BENCH} weight (kg)`), { target: { value: '62.5' } })
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    await card.findByText(/Set 1: 62.5 kg × 10/)
    expect((card.getByLabelText(`${BENCH} reps`) as HTMLInputElement).value).toBe('8')
    expect((card.getByLabelText(`${BENCH} weight (kg)`) as HTMLInputElement).value).toBe('60')
    expect(within(screen.getByRole('region', { name: ROW })).getByText('Copied from 8 Oct: 45 kg × 12')).toBeTruthy()
    expect((await store.sessionsOn(TODAY))[0].sets.map((s) => [s.weightKg, s.reps])).toEqual([[62.5, 10]])
  })

  it('3. lists only workouts done in the last 90 days, newest first, without skips', async () => {
    const old: Session = { ...past, id: 'older', performedOn: '2026-06-01' }
    const skipped: Session = { id: 'sk', performedOn: '2026-10-10', planDayId: 'x', name: 'Legs', sets: [], skipped: {} }
    const later: Session = { ...past, id: 'later', performedOn: '2026-10-11', name: 'Upper' }
    await startEmpty([past, old, skipped, later])
    const list = within(await screen.findByRole('region', { name: 'Copy a past workout' }))
    await list.findByText('Upper')
    expect(list.getAllByRole('button').filter((b) => b.className === 'day-button').map((b) => b.textContent)).toEqual([
      'Upper11 Oct · 2 exercises',
      'Workout8 Oct · 2 exercises',
    ])
  })

  it('4. says so when there is nothing to copy', async () => {
    await startEmpty([])
    expect(await screen.findByText('No workouts in the last 90 days.')).toBeTruthy()
  })
})
