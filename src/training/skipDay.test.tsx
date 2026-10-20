// @vitest-environment jsdom
// Skip a workout day (spec T-110).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { RecordsView } from './RecordsView'
import { memoryWorkoutStore } from './memoryStore'
import type { Plan, Session } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))

const day = (id: string, dayIndex: number, name: string) => ({ id, dayIndex, name, exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }] })
const plan = (days = [day('a', 0, 'Push'), day('b', 1, 'Pull'), day('c', 2, 'Legs')]): Plan => ({ id: 'p1', name: 'PPL', hardWeeks: 4, blockStartedOn: '2026-10-05', days })
const done = (id: string, on: string, planDayId: string): Session => ({
  id,
  performedOn: on,
  planDayId,
  name: 'Push',
  sets: [{ id: `${id}-1`, exerciseId: 'bench-press', setIndex: 0, weightKg: 60, reps: 8, rir: 2 }],
})
const card = () => within(screen.getByRole('button', { name: /^PPL/ }))

describe('skip a workout day (T-110)', () => {
  it('1. the next day follows the last one done, and a skip moves the plan on', async () => {
    const store = memoryWorkoutStore({ plans: [plan()], sessions: [done('s1', '2026-10-06', 'a')] })
    render(<Workouts store={store} today={TODAY} />)
    expect(await screen.findByText('Next: Pull')).toBeTruthy()
    click('Start a workout')
    expect(screen.getByRole('button', { name: /^Pull.*next up/ })).toBeTruthy()
    click('Skip Pull')
    expect(screen.getByText(/Your plan moves on to Legs\./)).toBeTruthy()
    click('Busy')
    click('Skip this workout')
    expect(await screen.findByText('Skipped: Busy')).toBeTruthy()
    expect(card().getByText('Next: Legs')).toBeTruthy()
    expect((await store.summaries(TODAY, TODAY))[0]).toMatchObject({ planDayId: 'b', skipped: { reason: 'Busy' }, exerciseIds: [] })
  })

  it('2. a skip counts towards the block week, like a workout done', async () => {
    const store = memoryWorkoutStore({ plans: [plan([day('a', 0, 'Full body')])] })
    render(<Workouts store={store} today={TODAY} />)
    expect(await screen.findByText('Week 1 of 4')).toBeTruthy()
    click('Start a workout')
    click('Skip Full body')
    expect(screen.getByText(/starts this day again next time/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Other reason'), { target: { value: 'Wedding in the family' } })
    click('Skip this workout')
    expect(await screen.findByText('Week 2 of 4')).toBeTruthy()
    expect(screen.getByText('Skipped: Wedding in the family')).toBeTruthy()
  })

  it('3. the week review says how many workouts were skipped and why', async () => {
    const store = memoryWorkoutStore({ plans: [plan()], sessions: [done('s1', '2026-10-06', 'a')] })
    await store.skipDay('2026-10-08', plan().days[1], 'Ill')
    await store.skipDay('2026-10-01', plan().days[2]) // more than a week ago
    await store.skipDay('2026-10-10', plan().days[2])
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Review week for PPL' }))
    expect(await screen.findByText('You skipped 2 workouts this week: Ill.')).toBeTruthy()
  })

  it('4. the calendar counts only workouts done', async () => {
    const store = memoryWorkoutStore({ plans: [plan()], sessions: [done('s1', TODAY, 'a')] })
    await store.skipDay(TODAY, plan().days[1])
    render(<RecordsView store={store} today={TODAY} onClose={() => {}} />)
    expect(await screen.findByText('1 workout in October 2026.')).toBeTruthy()
  })

  it('5. a failed skip says so and keeps the screen open', async () => {
    const store = memoryWorkoutStore({ plans: [plan()] })
    store.skipDay = async () => {
      throw new Error('offline')
    }
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click('Skip Push')
    click('Skip this workout')
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByText('Couldn’t skip. Skipping needs a connection. Try again.')).toBeTruthy()
  })
})
