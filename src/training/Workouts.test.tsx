// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import type { Plan } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

const ppl: Plan = {
  id: 'p1',
  name: 'Push Pull Legs',
  days: [
    { id: 'd1', dayIndex: 0, name: 'Push', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }] },
    { id: 'd2', dayIndex: 1, name: 'Legs', exercises: [{ exerciseId: 'back-squat', sets: 3, repMin: 5, repMax: 8 }] },
  ],
}

describe('workout plans', () => {
  it('builds a plan with a day and an exercise', async () => {
    const store = memoryWorkoutStore()
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: '+ New plan' }))
    type('Plan name', 'Full body')
    type('Day 1 name', 'Day A')
    click('+ Add exercise')
    type('Search exercises', 'squat')
    click(/^Back squat/)
    expect((screen.getByLabelText('Back squat lowest reps') as HTMLInputElement).value).toBe('6')
    type('Back squat sets', '4')
    click('Save plan')
    expect(await screen.findByRole('button', { name: /Full body/ })).toBeTruthy()
    const [saved] = await store.plans()
    expect(saved.days[0]).toMatchObject({ name: 'Day A', exercises: [{ exerciseId: 'back-squat', sets: 4, repMin: 6, repMax: 10 }] })
  })

  it('lists what is wrong instead of saving an incomplete plan', async () => {
    render(<Workouts store={memoryWorkoutStore()} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: '+ New plan' }))
    click('Save plan')
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/Give the plan a name/)
    expect(alert.textContent).toMatch(/add at least one exercise/)
  })

  it('deletes a plan', async () => {
    const store = memoryWorkoutStore({ plans: [ppl] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /Push Pull Legs/ }))
    click('Delete plan')
    await waitFor(() => expect(screen.queryByRole('button', { name: /Push Pull Legs/ })).toBeNull())
    expect(await store.plans()).toEqual([])
  })
})

describe('logging a workout', () => {
  it('starts a plan day, suggests the next load from last time and logs sets', async () => {
    const store = memoryWorkoutStore({
      plans: [ppl],
      sessions: [
        {
          id: 's0',
          performedOn: '2026-10-09',
          planDayId: 'd1',
          name: 'Push',
          sets: [0, 1, 2].map((i) => ({ id: `x${i}`, exerciseId: 'bench-press', setIndex: i, weightKg: 60, reps: 10, rir: 1 })),
        },
      ],
    })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click(/^Push/)

    const bench = await screen.findByRole('region', { name: 'Bench press (barbell)' })
    expect(within(bench).getByText('3 × 6–10')).toBeTruthy()
    expect(await within(bench).findByText('Last time: 60 kg × 10, 10, 10')).toBeTruthy()
    expect(within(bench).getByText(/Try 62.5 kg × 6/)).toBeTruthy()
    expect((screen.getByLabelText('Bench press (barbell) weight (kg)') as HTMLInputElement).value).toBe('62.5')

    click('Log set')
    expect(await within(bench).findByText('Set 1: 62.5 kg × 6')).toBeTruthy()
    type('Bench press (barbell) reps', '5')
    type('Bench press (barbell) reps in reserve', '0')
    click('Log set')
    expect(await within(bench).findByText('Set 2: 62.5 kg × 5 · 0 in reserve')).toBeTruthy()

    click('Remove set 1 of Bench press (barbell)')
    await waitFor(() => expect(within(bench).queryByText(/Set 2/)).toBeNull())

    click('Done')
    expect(await screen.findByText('1 sets logged')).toBeTruthy()
  })

  it('runs an empty workout with any exercise and checks set values', async () => {
    render(<Workouts store={memoryWorkoutStore()} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click('Empty workout')
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    type('Search exercises', 'pushdown')
    click(/^Triceps pushdown/)
    click('Log set')
    expect((await screen.findByRole('alert')).textContent).toBe('Enter weight and reps.')
    type('Triceps pushdown weight (kg)', '25')
    type('Triceps pushdown reps', '12')
    click('Log set')
    expect(await screen.findByText('Set 1: 25 kg × 12')).toBeTruthy()
  })
})
