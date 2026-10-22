// @vitest-environment jsdom
// Muscle priority in the plan editor and the week review (spec T-082h).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { PlanEditor } from './PlanEditor'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { reviewWeek } from './progression'
import type { Plan } from './types'

afterEach(cleanup)

const plan: Plan = {
  id: 'p1',
  name: 'Upper',
  hardWeeks: 4,
  blockStartedOn: '2026-10-05',
  days: [
    { id: 'd1', dayIndex: 0, name: 'Upper A', exercises: [{ exerciseId: 'bench-press', sets: 5, repMin: 6, repMax: 10 }, { exerciseId: 'lat-pulldown', sets: 3, repMin: 8, repMax: 12 }] },
    { id: 'd2', dayIndex: 1, name: 'Upper B', exercises: [{ exerciseId: 'incline-db-press', sets: 5, repMin: 8, repMax: 12 }] },
  ],
}

describe('muscle priority (T-082h)', () => {
  it('5. the plan editor sets Grow more or Keep per muscle, Grow by default', async () => {
    const onSave = vi.fn<(p: Plan) => Promise<void>>(async () => {})
    render(<PlanEditor initial={plan} onSave={onSave} onClose={() => {}} />)
    const chest = within(screen.getByRole('group', { name: 'Chest focus' }))
    expect(chest.getByRole('button', { name: 'Grow' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(chest.getByRole('button', { name: 'Keep' }))
    fireEvent.click(within(screen.getByRole('group', { name: 'Back focus' })).getByRole('button', { name: 'Grow more' }))
    expect(chest.getByRole('button', { name: 'Keep' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priorities: { chest: 'keep', back: 'more' } }))
  })

  it('7. picking Grow again removes the saved choice', () => {
    const onSave = vi.fn<(p: Plan) => Promise<void>>(async () => {})
    render(<PlanEditor initial={{ ...plan, priorities: { chest: 'keep' } }} onSave={onSave} onClose={() => {}} />)
    fireEvent.click(within(screen.getByRole('group', { name: 'Chest focus' })).getByRole('button', { name: 'Grow' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }))
    expect(onSave.mock.calls[0][0]).not.toHaveProperty('priorities')
  })

  it('8. the week review brings a kept muscle down, even with no answers, once accepted', async () => {
    const kept = { ...plan, priorities: { chest: 'keep' as const } }
    const r = reviewWeek({ plan: kept, week: 2, hardWeeks: 4, histories: {}, feedback: [], runDown: false })
    expect(r.muscles.find((m) => m.muscle === 'chest')).toMatchObject({ sets: 10, nextSets: 8, why: 'You chose Keep, so sets go down to 8.' })
    expect(r.muscles.find((m) => m.muscle === 'back')).toMatchObject({ nextSets: 3, decision: null })

    const store = memoryWorkoutStore({ plans: [kept] })
    render(<Workouts store={store} today="2026-10-12" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Review week for Upper' }))
    expect(await screen.findByText('You chose Keep, so sets go down to 8.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Apply these changes' }))
    await screen.findByText('Today’s training')
    const saved = (await store.plans())[0]
    expect(saved.days.flatMap((d) => d.exercises).filter((e) => e.exerciseId !== 'lat-pulldown').reduce((n, e) => n + e.sets, 0)).toBe(8)
    expect(saved.priorities).toEqual({ chest: 'keep' })
  })
})
