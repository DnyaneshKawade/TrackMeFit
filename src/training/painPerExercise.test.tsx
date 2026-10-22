// @vitest-environment jsdom
// "Something hurt" per exercise, with a swap for that lift only (spec T-108).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { exerciseById, similarExercise } from './exercises'
import type { Plan, Session } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const BENCH = 'bench-press'
const PULL = 'lat-pulldown'

const plan: Plan = {
  id: 'p1',
  name: 'Upper',
  hardWeeks: 4,
  blockStartedOn: '2026-10-05',
  days: [{ id: 'd1', dayIndex: 0, name: 'Upper A', exercises: [{ exerciseId: BENCH, sets: 3, repMin: 6, repMax: 10 }, { exerciseId: PULL, sets: 3, repMin: 8, repMax: 12 }] }],
}
const session = (id: string, on: string, ids: string[]): Session => ({
  id,
  performedOn: on,
  planDayId: 'd1',
  name: 'Upper A',
  sets: ids.flatMap((ex) => [0, 1, 2].map((i) => ({ id: `${id}-${ex}-${i}`, exerciseId: ex, setIndex: i, weightKg: 60, reps: 8, rir: 2 }))),
})
const nameOf = (id: string) => exerciseById.get(id)!.name

describe('something hurt, per exercise (T-108)', () => {
  it('1. asks about each exercise done and saves only the ones that hurt', async () => {
    const store = memoryWorkoutStore({ plans: [plan], sessions: [session('s1', TODAY, [BENCH, PULL])] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Upper A/ }))
    click('Done')
    click('Next') // past the finish screen (T-155)
    const chest = within(screen.getByRole('group', { name: 'Chest' }))
    expect(chest.getByLabelText(`Something hurt in ${nameOf(BENCH).toLowerCase()}`)).toBeTruthy()
    expect(chest.queryByLabelText(/Something hurt in lat/)).toBeNull()
    fireEvent.click(chest.getByRole('button', { name: 'Just right' }))
    fireEvent.click(chest.getByLabelText(`Something hurt in ${nameOf(BENCH).toLowerCase()}`))
    const back = within(screen.getByRole('group', { name: 'Back' }))
    fireEvent.click(back.getByRole('button', { name: 'Just right' }))
    click('Save')
    await screen.findByText('Today’s training')
    const saved = await store.feedbackSince(TODAY)
    expect(saved.find((f) => f.muscle === 'chest')).toEqual({ muscle: 'chest', effort: 'right', pain: true, hurt: [BENCH] })
    expect(saved.find((f) => f.muscle === 'back')).toEqual({ muscle: 'back', effort: 'right', pain: false })
  })

  it('2. the review swaps only the lift that hurt, once accepted', async () => {
    const to = similarExercise(exerciseById.get(BENCH)!, new Set([BENCH, PULL]))!
    const store = memoryWorkoutStore({
      plans: [plan],
      sessions: [session('s1', '2026-10-09', [BENCH, PULL])],
      feedback: [{ sessionId: 's1', muscle: 'chest', recovery: 'fresh', effort: 'right', pain: true, hurt: [BENCH] }],
    })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Review week for Upper' }))
    expect(await screen.findByText(`${nameOf(BENCH)} hurt, so we swap it for ${to.name}.`)).toBeTruthy()
    expect(screen.queryByText('Try a different exercise for this muscle.')).toBeNull()
    expect((await store.plans())[0].days[0].exercises[0].exerciseId).toBe(BENCH)
    click('Apply these changes')
    await screen.findByText('Today’s training')
    const [first, second] = (await store.plans())[0].days[0].exercises
    expect(first).toMatchObject({ exerciseId: to.id, repMin: 6, repMax: 10 })
    expect(second.exerciseId).toBe(PULL)
  })

  it('3. older answers without the exercise still suggest a change for the muscle', async () => {
    const store = memoryWorkoutStore({
      plans: [plan],
      sessions: [session('s1', '2026-10-09', [BENCH])],
      feedback: [{ sessionId: 's1', muscle: 'chest', recovery: 'fresh', effort: 'right', pain: true }],
    })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Review week for Upper' }))
    expect(await screen.findByText('Try a different exercise for this muscle.')).toBeTruthy()
  })

  it('4. an extra exercise that hurt is named but the plan is left alone', async () => {
    const extra = 'push-up'
    const store = memoryWorkoutStore({
      plans: [plan],
      sessions: [session('s1', '2026-10-09', [BENCH])],
      feedback: [{ sessionId: 's1', muscle: 'chest', recovery: 'fresh', effort: 'right', pain: true, hurt: [extra] }],
    })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Review week for Upper' }))
    expect(await screen.findByText(`${nameOf(extra)} hurt. Try a different exercise next time.`)).toBeTruthy()
  })
})
