// @vitest-environment jsdom
// "Still sore?" at the first set next workout, and the pump after it (spec T-082g).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import type { Plan, Session } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const HEAL = 'How did your chest heal since last time?'

const plan: Plan = {
  id: 'p1',
  name: 'Upper',
  hardWeeks: 4,
  blockStartedOn: '2026-10-05',
  days: [
    {
      id: 'd1',
      dayIndex: 0,
      name: 'Upper A',
      exercises: [
        { exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 },
        { exerciseId: 'incline-db-press', sets: 3, repMin: 8, repMax: 12 },
        { exerciseId: 'lat-pulldown', sets: 3, repMin: 8, repMax: 12 },
      ],
    },
  ],
}
const past: Session = {
  id: 's0',
  performedOn: '2026-10-09',
  planDayId: 'd1',
  name: 'Upper A',
  sets: ['bench-press', 'incline-db-press'].flatMap((ex) => [0, 1].map((i) => ({ id: `${ex}-${i}`, exerciseId: ex, setIndex: i, weightKg: 40, reps: 8, rir: 2 }))),
}

async function start() {
  const store = memoryWorkoutStore({ plans: [plan], sessions: [past] })
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  click(/^Upper A/)
  return store
}

describe('soreness timing (T-082g)', () => {
  it('6. asks how the muscle healed at its first exercise only', async () => {
    await start()
    const heal = await screen.findByRole('group', { name: HEAL })
    expect(within(screen.getByRole('region', { name: 'Bench press (barbell)' })).getByRole('group', { name: HEAL })).toBe(heal)
    expect(screen.getAllByRole('group', { name: HEAL })).toHaveLength(1) // not again for the incline press
    expect(screen.queryByRole('group', { name: /How did your back heal/ })).toBeNull() // no back history yet
  })

  it('7. saves the answer and hides the question', async () => {
    const store = await start()
    fireEvent.click(within(await screen.findByRole('group', { name: HEAL })).getByRole('button', { name: 'Still sore' }))
    expect(screen.queryByRole('group', { name: HEAL })).toBeNull()
    expect(await store.feedbackSince(TODAY)).toEqual([{ muscle: 'chest', recovery: 'stillSore', pain: false, stillSoreTimes: 1 }])
  })

  it('8. the after-workout sheet asks effort and an optional pump, and both answers merge', async () => {
    const store = await start()
    fireEvent.click(within(await screen.findByRole('group', { name: HEAL })).getByRole('button', { name: 'Healed a while ago' }))
    fireEvent.change(screen.getByLabelText('Bench press (barbell) weight (kg)'), { target: { value: '40' } })
    fireEvent.change(screen.getByLabelText('Bench press (barbell) reps'), { target: { value: '8' } })
    fireEvent.click(within(screen.getByRole('region', { name: 'Bench press (barbell)' })).getByRole('button', { name: 'Log set' }))
    await screen.findByText('Set 1: 40 kg × 8')
    click('Done')
    click('Next')
    const chest = within(screen.getByRole('group', { name: 'Chest' }))
    expect(chest.queryByRole('button', { name: /sore/i })).toBeNull() // soreness is no longer asked here
    fireEvent.click(chest.getByRole('button', { name: 'Easy' }))
    fireEvent.click(within(chest.getByRole('group', { name: 'Chest: pump?' })).getByRole('button', { name: 'Low' }))
    click('Save')
    await screen.findByText('1 sets logged')
    expect(await store.feedbackSince(TODAY)).toEqual([{ muscle: 'chest', recovery: 'healedEarly', effort: 'easy', pump: 'low', pain: false }])
  })
})
