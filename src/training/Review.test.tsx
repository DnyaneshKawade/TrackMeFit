// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import type { Plan, Session } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))

const plan = (blockStartedOn: string): Plan => ({
  id: 'p1',
  name: 'Upper',
  hardWeeks: 4,
  blockStartedOn,
  days: [{ id: 'd1', dayIndex: 0, name: 'Upper A', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }, { exerciseId: 'lat-pulldown', sets: 3, repMin: 8, repMax: 12 }] }],
})
const benchSession = (id: string, on: string, w: number): Session => ({
  id,
  performedOn: on,
  planDayId: 'd1',
  name: 'Upper A',
  sets: [0, 1, 2].map((i) => ({ id: `${id}-${i}`, exerciseId: 'bench-press', setIndex: i, weightKg: w, reps: 8, rir: 2 })),
})

describe('feedback after a workout', () => {
  it('asks how each trained muscle felt and saves the answers', async () => {
    const store = memoryWorkoutStore({ plans: [plan('2026-10-05')] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click(/^Upper A/)
    expect(await screen.findByText('Week 2 of 4')).toBeTruthy()
    expect(screen.getAllByText('Stop each set about 2 reps short of failure.').length).toBe(2)
    fireEvent.change(screen.getByLabelText('Bench press (barbell) weight (kg)'), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Bench press (barbell) reps'), { target: { value: '8' } })
    fireEvent.click(within(screen.getByRole('region', { name: 'Bench press (barbell)' })).getByRole('button', { name: 'Log set' }))
    await screen.findByText('Set 1: 60 kg × 8')
    click('Done')

    const chest = within(screen.getByRole('group', { name: 'Chest' }))
    fireEvent.click(chest.getByRole('button', { name: 'Fresh' }))
    fireEvent.click(chest.getByRole('button', { name: 'Easy' }))
    expect(screen.queryByRole('group', { name: 'Back' })).toBeNull() // no back sets logged
    click('Save')
    await screen.findByText('1 sets logged')
    expect(await store.feedbackSince('2026-10-12')).toEqual([{ muscle: 'chest', recovery: 'fresh', effort: 'easy', pain: false }])
  })
})

describe('week review', () => {
  it('suggests set changes with reasons and applies them only when accepted', async () => {
    const store = memoryWorkoutStore({
      plans: [plan('2026-10-05')],
      sessions: [benchSession('s1', '2026-10-05', 60), benchSession('s2', '2026-10-09', 62.5)],
      feedback: [{ sessionId: 's2', muscle: 'chest', recovery: 'fresh', effort: 'easy', pain: false }],
    })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Review week for Upper' }))
    expect(await screen.findByText('Chest: 3 → 5 sets')).toBeTruthy()
    expect(screen.getByText('Getting stronger and it felt easy, so two more sets.')).toBeTruthy()
    expect(screen.getByText(/Back: 3 sets/)).toBeTruthy()
    expect((await store.plans())[0].days[0].exercises[0].sets).toBe(3)
    click('Apply these changes')
    await screen.findByText('Today’s training')
    expect((await store.plans())[0].days[0].exercises[0].sets).toBe(5)
  })

  it('calls a deload when run down and starts the new block after it', async () => {
    const store = memoryWorkoutStore({ plans: [plan('2026-10-05')] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Review week for Upper' }))
    fireEvent.click(await screen.findByLabelText(/I feel run down/))
    expect(screen.getByText('You feel run down, so take a deload week now.')).toBeTruthy()
    click('Deload this week, new block next week')
    expect(await screen.findByText('Deload week')).toBeTruthy()
    expect((await store.plans())[0].blockStartedOn).toBe('2026-10-19')

    fireEvent.click(screen.getByRole('button', { name: 'Start a workout' }))
    click(/^Upper A/)
    expect(await screen.findAllByText('Deload: 2 sets at your week-1 weights, stopping 4 or more reps short of failure.')).toHaveLength(2)
    expect(screen.queryByText(/Try /)).toBeNull()
  })
})
