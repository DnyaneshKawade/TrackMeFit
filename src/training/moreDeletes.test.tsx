// @vitest-environment jsdom
// Bring back a removed exercise and clear exercise settings (spec T-124).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { memoryExerciseStore } from './exerciseStore'
import { exerciseById, setExerciseSettings } from './exercises'

afterEach(() => {
  cleanup()
  setExerciseSettings([])
})

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const tyre = { id: 'custom:9', name: 'Tyre flip', primary: 'traps' as const, equipment: 'machine' as const, isolation: true, hidden: true }

const openPicker = async (exercises: ReturnType<typeof memoryExerciseStore>) => {
  render(<Workouts store={memoryWorkoutStore()} exercises={exercises} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  click('Empty workout')
  fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
}

describe('more deletes (T-124)', () => {
  it('1. a removed own exercise can be brought back later', async () => {
    const exercises = memoryExerciseStore({ custom: [tyre] })
    await openPicker(exercises)
    // A search keeps the list short, so the test stays quick.
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'tyre' } })
    expect(screen.queryByRole('button', { name: /^Tyre flip/ })).toBeNull()
    fireEvent.click(screen.getByText('Removed exercises (1)'))
    click('Bring back Tyre flip')
    expect(await screen.findByRole('button', { name: /^Tyre flip/ })).toBeTruthy()
    expect(screen.queryByText(/^Removed exercises/)).toBeNull()
    expect((await exercises.custom())[0].hidden).toBeUndefined()
  })

  it('2. all settings for an exercise can be cleared at once', async () => {
    const exercises = memoryExerciseStore({ settings: [{ exerciseId: 'back-squat', restSec: 180, note: 'Rack 5', goalKg: 100, goalReps: 1 }] })
    const name = exerciseById.get('back-squat')!.name
    await openPicker(exercises)
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'back squat' } })
    click(new RegExp(`^${name}`))
    const card = within(await screen.findByRole('region', { name }))
    fireEvent.click(await card.findByRole('button', { name: `Settings for ${name}` }))
    fireEvent.click(card.getByRole('button', { name: 'Clear all settings' }))
    fireEvent.click(card.getByRole('button', { name: 'Yes, clear' }))
    await card.findByRole('button', { name: `Settings for ${name}` })
    expect(await exercises.settings()).toEqual([])
    expect(exerciseById.get('back-squat')!.goal).toBeUndefined()
  })
})
