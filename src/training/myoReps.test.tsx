// @vitest-environment jsdom
// Myo-reps set type (spec T-111).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'
import { parseMiniReps, workingSets, type Plan, type SetLog } from './types'
import { exerciseRecords, myoText, newRecord } from '../engine/strength'
import { performanceTrend } from './progression'

afterEach(cleanup)

const TODAY = '2026-10-12'
const EX = 'lat-pulldown'
const NAME = exerciseById.get(EX)!.name
const plan: Plan = { id: 'p1', name: 'Pull', hardWeeks: 4, blockStartedOn: TODAY, days: [{ id: 'd1', dayIndex: 0, name: 'Pull A', exercises: [{ exerciseId: EX, sets: 2, repMin: 10, repMax: 15 }] }] }

const openWorkout = async (store = memoryWorkoutStore({ plans: [plan] })) => {
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: /^Pull A/ }))
  const card = within(await screen.findByRole('region', { name: NAME }))
  fireEvent.change(card.getByLabelText(`${NAME} weight (kg)`), { target: { value: '40' } })
  fireEvent.change(card.getByLabelText(`${NAME} reps`), { target: { value: '15' } })
  fireEvent.click(card.getByRole('button', { name: 'Myo-reps' }))
  return { store, card }
}

const myo = (over: Partial<SetLog> = {}): SetLog => ({ id: 'm', exerciseId: EX, setIndex: 0, weightKg: 40, reps: 23, rir: 1, tag: 'myo', miniReps: [5, 4, 4], ...over })

describe('myo-reps (T-111)', () => {
  it('1. logs a start set and mini-sets as one set with the total reps', async () => {
    const { store, card } = await openWorkout()
    expect(card.getByText(/one hard start set, then mini-sets/)).toBeTruthy()
    fireEvent.change(card.getByLabelText(`${NAME} mini-set reps`), { target: { value: '5 4, 4' } })
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    expect(await card.findByText(/Set 1: 40 kg × 28 · myo-reps \(15 \+ 5 \+ 4 \+ 4\)/)).toBeTruthy()
    const [s] = (await store.sessionsOn(TODAY))[0].sets
    expect(s).toMatchObject({ reps: 28, tag: 'myo', miniReps: [5, 4, 4] })
    // The next set starts plain again.
    expect(card.queryByLabelText(`${NAME} mini-set reps`)).toBeNull()
  })

  it('2. asks for the mini-sets and saves nothing until they are right', async () => {
    const { store, card } = await openWorkout()
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    expect(card.getByRole('alert').textContent).toBe('Enter the mini-set reps, like 5 4 4. Each is 1 to 30 reps.')
    fireEvent.change(card.getByLabelText(`${NAME} mini-set reps`), { target: { value: '5 40' } })
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    expect(card.getByRole('alert')).toBeTruthy()
    expect((await store.sessionsOn(TODAY))[0].sets).toEqual([])
    expect(parseMiniReps('5 4 4')).toEqual([5, 4, 4])
    expect(parseMiniReps('')).toBeNull()
    expect(parseMiniReps('1 1 1 1 1 1 1 1 1 1 1')).toBeNull()
  })

  it('3. records and progress use the start set, not the total', () => {
    expect(myoText(myo())).toBe('10 + 5 + 4 + 4')
    expect(workingSets([myo()])[0].reps).toBe(10)
    const r = exerciseRecords([{ performedOn: TODAY, sets: [myo()] }])
    expect(r.mostReps?.reps).toBe(10)
    expect(r.bestE1rm?.e1rm).toBe(53.5) // 40 × (1 + 10/30)
    expect(r.notes).toContain('Myo-reps count by their start set.')
    // 23 total reps at 40 kg is not a record over 40 kg × 12.
    expect(newRecord([{ performedOn: '2026-10-01', sets: [{ weightKg: 40, reps: 12 }] }], [], myo())).toBeNull()
    // Same start set, more mini-set reps: progress stays the same.
    const trend = performanceTrend([
      { performedOn: TODAY, sets: [myo({ reps: 30, miniReps: [8, 6, 6] })] },
      { performedOn: '2026-10-05', sets: [myo()] },
    ])
    expect(trend).toEqual(['same'])
  })
})
