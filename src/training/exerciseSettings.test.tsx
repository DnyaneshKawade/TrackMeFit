// @vitest-environment jsdom
// Exercise settings: own weight step, rest time and notes (spec T-112).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { memoryExerciseStore } from './exerciseStore'
import { exerciseById, setExerciseSettings } from './exercises'
import type { Plan, Session } from './types'

afterEach(() => {
  cleanup()
  setExerciseSettings([])
})

const TODAY = '2026-10-12'
const EX = 'lat-pulldown'
const NAME = exerciseById.get(EX)!.name
const plan: Plan = { id: 'p1', name: 'Pull', hardWeeks: 4, blockStartedOn: '2026-10-01', days: [{ id: 'd1', dayIndex: 0, name: 'Pull A', exercises: [{ exerciseId: EX, sets: 2, repMin: 10, repMax: 12 }] }] }
const before: Session = {
  id: 's0',
  performedOn: '2026-10-08',
  planDayId: 'd1',
  name: 'Pull A',
  sets: [0, 1].map((i) => ({ id: `s0-${i}`, exerciseId: EX, setIndex: i, weightKg: 40, reps: 12, rir: 2 })),
}

const open = async (exercises = memoryExerciseStore(), sessions: Session[] = []) => {
  render(<Workouts store={memoryWorkoutStore({ plans: [plan], sessions })} exercises={exercises} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: /^Pull A/ }))
  return within(await screen.findByRole('region', { name: NAME }))
}
const settings = (card: ReturnType<typeof within>) => within(card.getByRole('group', { name: `Settings for ${NAME}` }))

describe('exercise settings (T-112)', () => {
  it('1. saves a weight step, rest time and notes, and the card uses them', async () => {
    const exercises = memoryExerciseStore()
    const card = await open(exercises)
    fireEvent.click(card.getByRole('button', { name: `Settings for ${NAME}` }))
    const form = settings(card)
    expect(form.getByLabelText('Weight step (kg)').getAttribute('placeholder')).toBe('2.5')
    fireEvent.change(form.getByLabelText('Weight step (kg)'), { target: { value: '1' } })
    fireEvent.change(form.getByLabelText('Rest (seconds)'), { target: { value: '60' } })
    fireEvent.change(form.getByLabelText('Machine or seat notes'), { target: { value: 'Seat 4, pin 3' } })
    fireEvent.click(form.getByRole('button', { name: 'Save settings' }))
    expect(await card.findByText('Setup: Seat 4, pin 3')).toBeTruthy()
    expect(await exercises.settings()).toEqual([{ exerciseId: EX, stepKg: 1, restSec: 60, note: 'Seat 4, pin 3' }])

    fireEvent.change(card.getByLabelText(`${NAME} weight (kg)`), { target: { value: '40' } })
    fireEvent.click(card.getByRole('button', { name: `More weight for ${NAME}` }))
    expect((card.getByLabelText(`${NAME} weight (kg)`) as HTMLInputElement).value).toBe('41')
    fireEvent.change(card.getByLabelText(`${NAME} reps`), { target: { value: '10' } })
    fireEvent.click(card.getByRole('button', { name: 'Log set' }))
    expect((await screen.findByRole('timer', { name: 'Rest' })).textContent).toMatch(/Rest 1:00/)
  })

  it('2. weight advice moves by the own step', async () => {
    const card = await open(memoryExerciseStore({ settings: [{ exerciseId: EX, stepKg: 1 }] }), [before])
    expect(await card.findByText(/Try 41 kg × 10\./)).toBeTruthy()
  })

  it('3. checks the boxes, and empty boxes go back to the usual', async () => {
    const exercises = memoryExerciseStore({ settings: [{ exerciseId: EX, note: 'Seat 4' }] })
    const card = await open(exercises)
    expect(await card.findByText('Setup: Seat 4')).toBeTruthy()
    fireEvent.click(card.getByRole('button', { name: `Settings for ${NAME}` }))
    const form = settings(card)
    fireEvent.change(form.getByLabelText('Weight step (kg)'), { target: { value: '50' } })
    fireEvent.click(form.getByRole('button', { name: 'Save settings' }))
    expect(form.getByRole('alert').textContent).toBe('The weight step must be 0.25 to 20 kg.')
    fireEvent.change(form.getByLabelText('Weight step (kg)'), { target: { value: '' } })
    fireEvent.change(form.getByLabelText('Rest (seconds)'), { target: { value: '5' } })
    fireEvent.click(form.getByRole('button', { name: 'Save settings' }))
    expect(form.getByRole('alert').textContent).toBe('Rest must be 15 to 600 seconds.')
    fireEvent.change(form.getByLabelText('Rest (seconds)'), { target: { value: '' } })
    fireEvent.change(form.getByLabelText('Machine or seat notes'), { target: { value: '' } })
    fireEvent.click(form.getByRole('button', { name: 'Save settings' }))
    await screen.findByRole('button', { name: `Settings for ${NAME}` })
    expect(card.queryByText(/Setup:/)).toBeNull()
    expect(await exercises.settings()).toEqual([])
    expect(exerciseById.get(EX)!.increment).toBe(2.5)
  })

  it('4. a failed save says so and keeps the form open', async () => {
    const exercises = memoryExerciseStore()
    exercises.saveSetting = async () => {
      throw new Error('offline')
    }
    const card = await open(exercises)
    fireEvent.click(card.getByRole('button', { name: `Settings for ${NAME}` }))
    fireEvent.change(settings(card).getByLabelText('Rest (seconds)'), { target: { value: '60' } })
    fireEvent.click(settings(card).getByRole('button', { name: 'Save settings' }))
    expect(await settings(card).findByText('Couldn’t save. Check your connection and try again.')).toBeTruthy()
  })
})
