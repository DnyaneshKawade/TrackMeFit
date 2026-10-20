// @vitest-environment jsdom
// Block controls (spec T-109).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById, similarExercise } from './exercises'
import type { Plan } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const nameOf = (id: string) => exerciseById.get(id)!.name

const plan = (over: Partial<Plan> = {}): Plan => ({
  id: 'p1',
  name: 'Upper',
  hardWeeks: 4,
  blockStartedOn: TODAY,
  days: [
    {
      id: 'd1',
      dayIndex: 0,
      name: 'Upper A',
      exercises: [
        { exerciseId: 'bench-press', sets: 4, repMin: 6, repMax: 10 },
        { exerciseId: 'lat-pulldown', sets: 3, repMin: 8, repMax: 12 },
        { exerciseId: 'shrug', sets: 3, repMin: 10, repMax: 15 },
      ],
    },
  ],
  ...over,
})

const openBlock = async () => fireEvent.click(await screen.findByRole('button', { name: 'Block for Upper' }))

describe('block controls (T-109)', () => {
  it('1. sets 3 to 7 hard weeks and saves the choice', async () => {
    const store = memoryWorkoutStore({ plans: [plan()] })
    render(<Workouts store={store} today={TODAY} />)
    await openBlock()
    const group = within(screen.getByRole('group', { name: 'Hard weeks before the light week' }))
    expect(group.getAllByRole('button').map((b) => b.textContent)).toEqual(['3', '4', '5', '6', '7'])
    fireEvent.click(group.getByRole('button', { name: '6' }))
    click('Save 6 hard weeks')
    expect(await screen.findByText('Week 1 of 6')).toBeTruthy()
    expect((await store.plans())[0].hardWeeks).toBe(6)
  })

  it('2. ends a block early: the light week starts now', async () => {
    const store = memoryWorkoutStore({ plans: [plan()] })
    render(<Workouts store={store} today={TODAY} />)
    await openBlock()
    click('Light week now')
    expect(await screen.findByText('Light week')).toBeTruthy()
    expect((await store.plans())[0].blockStartedOn).toBe('2026-10-19')
    // Already in the light week, so the early end is not offered again.
    await openBlock()
    expect(screen.queryByRole('button', { name: 'Light week now' })).toBeNull()
  })

  it('3. starts the next block at week 1 with only the swaps picked', async () => {
    const store = memoryWorkoutStore({ plans: [plan({ blockStartedOn: '2026-09-01', blockStartWeek: 2 })] })
    const to = similarExercise(exerciseById.get('bench-press')!, new Set(['bench-press', 'lat-pulldown', 'shrug']))!
    render(<Workouts store={store} today={TODAY} />)
    await openBlock()
    fireEvent.click(screen.getByLabelText(`Swap ${nameOf('bench-press')} for ${to.name}`))
    click('Start next block')
    expect(await screen.findByText('Week 1 of 4')).toBeTruthy()
    const saved = (await store.plans())[0]
    expect(saved).toMatchObject({ blockStartedOn: TODAY, blockStartWeek: 1 })
    expect(saved.days[0].exercises.map((e) => e.exerciseId)).toEqual([to.id, 'lat-pulldown', 'shrug'])
    expect(saved.days[0].exercises[0]).toMatchObject({ sets: 4, repMin: 6, repMax: 10 })
  })

  it('4. the light week lets traps be skipped and halves the rest', async () => {
    const store = memoryWorkoutStore({ plans: [plan({ blockStartedOn: '2026-10-19' })] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click(/^Upper A/)
    const shrug = within(await screen.findByRole('region', { name: nameOf('shrug') }))
    expect(shrug.getByText('Light week: you can skip this one. Rows, pulls and carries work it too.')).toBeTruthy()
    const bench = within(screen.getByRole('region', { name: nameOf('bench-press') }))
    expect(bench.getByText('Light week: 2 sets at your week-1 weights. Stop while you could still do 4 more reps.')).toBeTruthy()
  })
})
