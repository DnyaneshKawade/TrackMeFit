// @vitest-environment jsdom
// Assisted machines in a workout and in records (spec T-117).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById } from './exercises'
import type { Session } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const NAME = exerciseById.get('assisted-pull-up')!.name
const past = (id: string, on: string, ...sets: [number, number][]): Session => ({
  id,
  performedOn: on,
  planDayId: null,
  name: 'Workout',
  sets: sets.map(([weightKg, reps], setIndex) => ({ id: `${id}${setIndex}`, exerciseId: 'assisted-pull-up', setIndex, weightKg, reps, rir: null })),
})
const SESSIONS = [past('a', '2026-10-01', [45, 8], [45, 8]), past('b', '2026-10-08', [40, 10], [40, 10])]

describe('assisted machines (T-117)', () => {
  it('6. the workout card suggests less help, skips warm-ups and marks less help as a record', async () => {
    const store = memoryWorkoutStore({ sessions: SESSIONS })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'assisted pull' } })
    fireEvent.click(screen.getByRole('button', { name: /^Assisted pull-up \(machine\)/ }))
    const card = within(await screen.findByRole('region', { name: NAME }))
    expect(card.getByText('The weight here is help. Less help is progress.')).toBeTruthy()
    expect(await card.findByText('Last time: 40 kg help × 10, 10')).toBeTruthy()
    expect(card.getByText(/Try 35 kg help × 6\./)).toBeTruthy()
    expect(card.queryByText(/Warm-up first/)).toBeNull()
    expect((card.getByLabelText(`${NAME} weight (kg)`) as HTMLInputElement).value).toBe('35')
    fireEvent.change(card.getByLabelText(`${NAME} reps`), { target: { value: '7' } })
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    expect(await card.findByText(/Set 1: 35 kg help × 7/)).toBeTruthy()
    expect(card.getByRole('status').textContent).toMatch(/New record: least help\. Your best before was 40 kg\./)
  })

  it('7. records and the graph show least help', async () => {
    render(<Workouts store={memoryWorkoutStore({ sessions: SESSIONS })} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Records and progress' }))
    fireEvent.click(await screen.findByRole('button', { name: new RegExp(`^${NAME.replace(/[()]/g, '\\$&')}`) }))
    const view = within(await screen.findByRole('region', { name: `Records for ${NAME}` }))
    expect((await view.findByText('Least help')).nextElementSibling!.textContent).toMatch(/^40 kg help × 10 · 8 Oct/)
    expect(view.queryByText('Heaviest')).toBeNull()
    fireEvent.click(view.getByRole('button', { name: 'Graph' }))
    expect(view.getByRole('option', { name: 'Least help (lower is better)' })).toBeTruthy()
    expect(view.getByRole('img').getAttribute('aria-label')).toMatch(/from 45 kg on 1 Oct to 40 kg on 8 Oct/)
    fireEvent.click(view.getByRole('button', { name: 'History' }))
    // Only the first set at 40 kg beat the old best; the second tied it.
    expect(view.getAllByLabelText('New record')).toHaveLength(1)
  })
})
