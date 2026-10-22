// @vitest-environment jsdom
// Beginner start in a workout (spec T-082j).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import type { Plan, Session } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const plan: Plan = {
  id: 'p1',
  name: 'Full body',
  hardWeeks: 4,
  blockStartedOn: '2026-10-05',
  days: [{ id: 'd1', dayIndex: 0, name: 'Day A', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }, { exerciseId: 'db-curl', sets: 3, repMin: 10, repMax: 15 }] }],
}
const past: Session = {
  id: 's0',
  performedOn: '2026-10-09',
  planDayId: 'd1',
  name: 'Day A',
  sets: [
    ...[0, 1, 2].map((i) => ({ id: `b${i}`, exerciseId: 'bench-press', setIndex: i, weightKg: 40, reps: 6, rir: 2 })),
    ...[0, 1, 2].map((i) => ({ id: `c${i}`, exerciseId: 'db-curl', setIndex: i, weightKg: 10, reps: 10, rir: 2 })),
  ],
}

async function start(experience: 'beginner' | 'intermediate') {
  render(<Workouts store={memoryWorkoutStore({ plans: [plan], sessions: [past] })} today={TODAY} answers={{ trainingDays: 3, experience, equipment: 'gym' }} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
  fireEvent.click(screen.getByRole('button', { name: /^Day A/ }))
}

describe('beginner start (T-082j)', () => {
  it('5. a beginner adds weight on a big lift, but not on a one-joint move', async () => {
    await start('beginner')
    expect(await screen.findByText('You hit 6 reps on every set. Beginners add weight each workout.')).toBeTruthy()
    expect((screen.getByLabelText('Bench press (barbell) weight (kg)') as HTMLInputElement).value).toBe('42.5')
    expect(screen.getAllByText('You hit 6 reps on every set. Beginners add weight each workout.')).toHaveLength(1)
    expect(screen.getByText('Same weight; aim for one more rep.')).toBeTruthy() // the curl
  })

  it('6. others still add a rep first', async () => {
    await start('intermediate')
    expect(await screen.findAllByText('Same weight; aim for one more rep.')).toHaveLength(2)
  })
})
