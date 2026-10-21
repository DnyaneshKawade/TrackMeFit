// @vitest-environment jsdom
// Exercise goals (spec T-119).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { memoryExerciseStore } from './exerciseStore'
import { exerciseById, setExerciseSettings } from './exercises'
import type { Session } from './types'

afterEach(() => {
  cleanup()
  setExerciseSettings([])
})

const TODAY = '2026-10-12'
const EX = 'back-squat'
const NAME = exerciseById.get(EX)!.name
const day = (id: string, on: string, kg: number, reps: number): Session => ({
  id,
  performedOn: on,
  planDayId: null,
  name: 'Legs',
  sets: [{ id: id + 'x', exerciseId: EX, setIndex: 0, weightKg: kg, reps, rir: null }],
})
const SESSIONS = [day('a', '2026-10-01', 80, 3), day('b', '2026-10-08', 90, 2)]

const openCard = async (exercises = memoryExerciseStore()) => {
  render(<Workouts store={memoryWorkoutStore({ sessions: SESSIONS })} exercises={exercises} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
  fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
  fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'back squat' } })
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${NAME}`) }))
  return within(await screen.findByRole('region', { name: NAME }))
}

describe('exercise goals (T-119)', () => {
  it('5. a goal is set in the exercise settings and shows on records and the graph', async () => {
    const exercises = memoryExerciseStore()
    const card = await openCard(exercises)
    fireEvent.click(card.getByRole('button', { name: `Settings for ${NAME}` }))
    const form = within(card.getByRole('group', { name: `Settings for ${NAME}` }))
    fireEvent.change(form.getByLabelText('Goal weight (kg)'), { target: { value: '100' } })
    fireEvent.click(form.getByRole('button', { name: 'Save settings' }))
    await screen.findByRole('button', { name: `Settings for ${NAME}` })
    expect(await exercises.settings()).toEqual([{ exerciseId: EX, goalKg: 100, goalReps: 1 }])
    expect(exerciseById.get(EX)!.goal).toEqual({ kg: 100, reps: 1 })

    fireEvent.click(card.getByRole('button', { name: `History and graph for ${NAME}` }))
    const page = within(await screen.findByRole('region', { name: `Records for ${NAME}` }))
    expect((await page.findByRole('status')).textContent).toBe('Goal: 100 kg × 1. Your best is 90 kg × 2, 90% of the way.')
    fireEvent.click(page.getByRole('button', { name: 'Graph' }))
    fireEvent.change(page.getByRole('combobox'), { target: { value: 'heaviest' } })
    expect(page.getByText(/The dashed line is your goal, 100 kg\./)).toBeTruthy()
    expect(document.querySelector('.goal-line')).not.toBeNull()
  })

  it('6. checks the goal and shows when it is reached', async () => {
    const card = await openCard()
    fireEvent.click(card.getByRole('button', { name: `Settings for ${NAME}` }))
    const form = within(card.getByRole('group', { name: `Settings for ${NAME}` }))
    fireEvent.change(form.getByLabelText('Goal weight (kg)'), { target: { value: '700' } })
    fireEvent.click(form.getByRole('button', { name: 'Save settings' }))
    expect(form.getByRole('alert').textContent).toBe('The goal must be 1 to 600 kg.')
    fireEvent.change(form.getByLabelText('Goal weight (kg)'), { target: { value: '85' } })
    fireEvent.change(form.getByLabelText('Goal reps'), { target: { value: '0' } })
    fireEvent.click(form.getByRole('button', { name: 'Save settings' }))
    expect(form.getByRole('alert').textContent).toBe('Goal reps must be 1 to 30.')
    fireEvent.change(form.getByLabelText('Goal reps'), { target: { value: '2' } })
    fireEvent.click(form.getByRole('button', { name: 'Save settings' }))
    await screen.findByRole('button', { name: `Settings for ${NAME}` })
    fireEvent.click(card.getByRole('button', { name: `History and graph for ${NAME}` }))
    const page = within(await screen.findByRole('region', { name: `Records for ${NAME}` }))
    expect((await page.findByRole('status')).textContent).toBe('🎯 Goal reached: 85 kg × 2. Time to set a new one.')
  })

  it('7. assisted machines have no goal boxes', async () => {
    render(<Workouts store={memoryWorkoutStore()} exercises={memoryExerciseStore()} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'assisted pull' } })
    fireEvent.click(screen.getByRole('button', { name: /^Assisted pull-up \(machine\)/ }))
    const name = exerciseById.get('assisted-pull-up')!.name
    const card = within(await screen.findByRole('region', { name }))
    fireEvent.click(card.getByRole('button', { name: `Settings for ${name}` }))
    expect(card.queryByLabelText(/Goal weight/)).toBeNull()
  })
})
