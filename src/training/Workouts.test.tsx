// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { offlineWorkoutStore } from './offlineStore'
import type { KeyValue } from '../sync/outbox'
import type { Plan, WorkoutStore } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

const mapStorage = (): KeyValue => {
  const data = new Map<string, string>()
  return { get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v), remove: (k) => void data.delete(k) }
}

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
    expect(await screen.findByRole('button', { name: /^Full body/ })).toBeTruthy()
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
    fireEvent.click(await screen.findByRole('button', { name: /^Push Pull Legs/ }))
    click('Delete plan')
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Push Pull Legs/ })).toBeNull())
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
    click('Skip')
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

describe('offline workouts (T-027b)', () => {
  it('logs a workout with no connection, marks the sets, and clears the marks once synced', async () => {
    const server = memoryWorkoutStore({ plans: [ppl] })
    const net = { online: true }
    const gated = Object.fromEntries(
      Object.entries(server).map(([k, f]) => [k, (...a: unknown[]) => (net.online ? (f as (...a: unknown[]) => unknown)(...a) : Promise.reject(new TypeError('Failed to fetch')))]),
    ) as unknown as WorkoutStore
    const store = offlineWorkoutStore(gated, { storage: mapStorage(), accountId: 'me' })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    net.online = false
    click(/^Push/)
    const bench = await screen.findByRole('region', { name: 'Bench press (barbell)' })
    type('Bench press (barbell) weight (kg)', '60')
    type('Bench press (barbell) reps', '8')
    click('Log set')
    expect(await within(bench).findByText('Set 1: 60 kg × 8')).toBeTruthy()
    expect(within(bench).getByText('· Not synced yet')).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Sync' }).textContent).toBe('2 workout entries saved on this phone. They’ll sync when you’re online.')

    net.online = true
    await act(() => store.sync.run())
    expect(within(bench).queryByText('· Not synced yet')).toBeNull()
    expect(screen.queryByRole('status', { name: 'Sync' })).toBeNull()
    expect((await server.sessionsOn(TODAY))[0].sets.map((s) => s.weightKg)).toEqual([60])
  })
})

describe('logger (T-043a)', () => {
  const lastPush = (sets: { w: number; reps: number; tag?: 'warmup' | 'drop' }[]) =>
    memoryWorkoutStore({
      plans: [ppl],
      sessions: [
        {
          id: 's0',
          performedOn: '2026-10-09',
          planDayId: 'd1',
          name: 'Push',
          sets: sets.map((s, i) => ({ id: `x${i}`, exerciseId: 'bench-press', setIndex: i, weightKg: s.w, reps: s.reps, rir: null, ...(s.tag ? { tag: s.tag } : {}) })),
        },
      ],
    })
  const openPush = async (store: WorkoutStore) => {
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click(/^Push/)
    return screen.findByRole('region', { name: 'Bench press (barbell)' })
  }
  const value = (label: string) => (screen.getByLabelText(label) as HTMLInputElement).value

  it('1, 5. fills in from last time, ignoring warm-ups, so the next set is one tap', async () => {
    const bench = await openPush(lastPush([{ w: 40, reps: 12, tag: 'warmup' }, { w: 60, reps: 10 }, { w: 60, reps: 10 }, { w: 60, reps: 10 }]))
    expect(await within(bench).findByText('Last time: 60 kg × 10, 10, 10')).toBeTruthy()
    // The warm-up doesn't pull the suggestion down: 60 × 10 at the top of the range means go up.
    expect(within(bench).getByText(/Try 62.5 kg × 6/)).toBeTruthy()
    click('Log set')
    await within(bench).findByText('Set 1: 62.5 kg × 6')
    click('Log set')
    expect(await within(bench).findByText('Set 2: 62.5 kg × 6')).toBeTruthy()
  })

  it('2. − and + move weight by the usual jump and reps by one, never below 0', async () => {
    await openPush(memoryWorkoutStore({ plans: [ppl] }))
    type('Bench press (barbell) weight (kg)', '2.5')
    type('Bench press (barbell) reps', '1')
    click('More weight for Bench press (barbell)')
    expect(value('Bench press (barbell) weight (kg)')).toBe('5')
    click('Less weight for Bench press (barbell)')
    click('Less weight for Bench press (barbell)')
    click('Less weight for Bench press (barbell)')
    expect(value('Bench press (barbell) weight (kg)')).toBe('0')
    click('More reps for Bench press (barbell)')
    expect(value('Bench press (barbell) reps')).toBe('2')
    click('Fewer reps for Bench press (barbell)')
    click('Fewer reps for Bench press (barbell)')
    click('Fewer reps for Bench press (barbell)')
    expect(value('Bench press (barbell) reps')).toBe('0')
  })

  it('3. a set starts the rest timer, which can be changed, runs out and is skipped', async () => {
    await openPush(memoryWorkoutStore({ plans: [ppl] }))
    type('Bench press (barbell) weight (kg)', '60')
    type('Bench press (barbell) reps', '8')
    click('Log set')
    const timer = await screen.findByRole('timer', { name: 'Rest' })
    expect(timer.textContent).toMatch(/Rest 2:30/)
    click('15 seconds more rest')
    expect(screen.getByRole('timer', { name: 'Rest' }).textContent).toMatch(/Rest 2:4[45]/)
    while (screen.queryByRole('button', { name: '15 seconds less rest' })) click('15 seconds less rest')
    expect(await screen.findByText('Rest over')).toBeTruthy()
    click('OK')
    expect(screen.queryByRole('timer', { name: 'Rest' })).toBeNull()
  })

  it('4, 6. a tag and a note go with the next set only', async () => {
    const store = memoryWorkoutStore({ plans: [ppl] })
    const bench = await openPush(store)
    type('Bench press (barbell) weight (kg)', '40')
    type('Bench press (barbell) reps', '10')
    click('Warm-up')
    click('+ Note')
    type('Bench press (barbell) set note', 'Shoulder felt tight')
    click('Log set')
    await waitFor(() => expect(within(bench).getByRole('list').textContent).toMatch(/Set 1: 40 kg × 10 · warm-up/))
    expect(within(bench).getByText('Shoulder felt tight')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Warm-up' }).getAttribute('aria-pressed')).toBe('false')
    click('Log set')
    expect(await within(bench).findByText('Set 2: 40 kg × 10')).toBeTruthy()
    const [s] = await store.sessionsOn(TODAY)
    expect(s.sets.map((x) => [x.tag, x.note])).toEqual([['warmup', 'Shoulder felt tight'], [undefined, undefined]])
  })

  it('7. workout notes are saved and show when the workout is opened again', async () => {
    const store = memoryWorkoutStore({ plans: [ppl] })
    await openPush(store)
    const notes = screen.getByLabelText('Workout notes')
    fireEvent.change(notes, { target: { value: 'Gym was packed, short rests' } })
    fireEvent.blur(notes)
    await waitFor(async () => expect((await store.sessionsOn(TODAY))[0].note).toBe('Gym was packed, short rests'))
    click('Done')
    fireEvent.click(await screen.findByRole('button', { name: /sets logged/ }))
    expect(((await screen.findByLabelText('Workout notes')) as HTMLTextAreaElement).value).toBe('Gym was packed, short rests')
  })
})
