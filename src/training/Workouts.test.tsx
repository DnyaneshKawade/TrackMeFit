// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import { offlineWorkoutStore } from './offlineStore'
import type { KeyValue } from '../sync/outbox'
import type { Plan, WorkoutStore } from './types'
import { memoryExerciseStore } from './exerciseStore'
import { exerciseById, setCustomExercises } from './exercises'

afterEach(() => {
  cleanup()
  setCustomExercises([])
})

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
    type('Bench press (barbell) reps left', '0')
    click('Log set')
    expect(await within(bench).findByText('Set 2: 62.5 kg × 5 · 0 reps left')).toBeTruthy()

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
    expect(within(bench).getByText('· Waiting for internet')).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Waiting for internet' }).textContent).toBe('2 workout entries saved on this phone. They will go online when you have internet.')

    net.online = true
    await act(() => store.sync.run())
    expect(within(bench).queryByText('· Waiting for internet')).toBeNull()
    expect(screen.queryByRole('status', { name: 'Waiting for internet' })).toBeNull()
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

describe('logger (T-043b)', () => {
  const pushPull: Plan = {
    id: 'p2',
    name: 'Upper',
    days: [
      {
        id: 'u1',
        dayIndex: 0,
        name: 'Upper',
        exercises: [
          { exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10, supersetNext: true },
          { exerciseId: 'lat-pulldown', sets: 3, repMin: 8, repMax: 12 },
          { exerciseId: 'db-curl', sets: 2, repMin: 10, repMax: 15 },
        ],
      },
    ],
  }
  const startUpper = async (store = memoryWorkoutStore({ plans: [pushPull] })) => {
    render(<Workouts store={store} exercises={memoryExerciseStore()} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click(/^Upper/)
    return screen.findByRole('region', { name: 'Superset: Bench press (barbell) and Lat pulldown' })
  }
  const logSet = (name: string, w: string, r: string) => {
    type(`${name} weight (kg)`, w)
    type(`${name} reps`, r)
    fireEvent.click(within(screen.getByRole('region', { name })).getByRole('button', { name: 'Log set' }))
  }

  it('9, 10. a plan superset shows together; rest comes after the last exercise, for the longest rest', async () => {
    const group = await startUpper()
    expect(within(group).getByText('Superset: do one set of each, then rest.')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Dumbbell curl' }).closest('.superset')).toBeNull()
    logSet('Bench press (barbell)', '60', '8')
    expect(await within(group).findByRole('status')).toHaveProperty('textContent', 'Now do Lat pulldown')
    expect(screen.queryByRole('timer', { name: 'Rest' })).toBeNull()
    logSet('Lat pulldown', '50', '10')
    // Bench press is a big lift, so the group rests 2:30, not the 1:30 of a pulldown's partner curl.
    expect((await screen.findByRole('timer', { name: 'Rest' })).textContent).toMatch(/Rest 2:30/)
    expect(within(group).getByRole('status').textContent).toBe('Now do Bench press (barbell)')
  })

  it('9. a superset can be made or ended during a workout', async () => {
    await startUpper()
    click('Superset Bench press (barbell) with the next exercise')
    expect(screen.queryByRole('region', { name: /^Superset:/ })).toBeNull()
    click('Superset Lat pulldown with the next exercise')
    expect(screen.getByRole('region', { name: 'Superset: Lat pulldown and Dumbbell curl' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Superset Dumbbell curl with the next exercise' })).toBeNull()
  })

  it('9. a superset is saved with the plan', async () => {
    const store = memoryWorkoutStore({ plans: [ppl] })
    render(<Workouts store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Push Pull Legs/ }))
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add exercise' })[0])
    type('Search exercises', 'pec deck')
    click(/^Pec deck/)
    const link = screen.getByRole('button', { name: 'Superset Bench press (barbell) with the next exercise' })
    fireEvent.click(link)
    expect(link.textContent).toBe('Superset with Pec deck')
    click('Save plan')
    await screen.findByRole('button', { name: /^Push Pull Legs/ })
    const [saved] = await store.plans()
    expect(saved.days[0].exercises.map((e) => [e.exerciseId, !!e.supersetNext])).toEqual([['bench-press', true], ['pec-deck', false]])
  })

  it('11. favourites show first and stay', async () => {
    const exercises = memoryExerciseStore()
    render(<Workouts store={memoryWorkoutStore()} exercises={exercises} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click('Empty workout')
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    click('Favourite Leg press')
    const favs = await screen.findByRole('region', { name: 'Favourites' })
    expect(within(favs).getAllByRole('listitem').map((li) => li.querySelector('.result-name')!.textContent)).toEqual(['Leg press'])
    expect(await exercises.favourites()).toEqual(['leg-press'])
    click('Favourite Leg press')
    expect(screen.queryByRole('region', { name: 'Favourites' })).toBeNull()
    expect(await exercises.favourites()).toEqual([])
  })

  it('12, 13. a new exercise is checked, saved, logged and found again', async () => {
    const exercises = memoryExerciseStore()
    const store = memoryWorkoutStore()
    render(<Workouts store={store} exercises={exercises} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click('Empty workout')
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    type('Search exercises', 'landmine press')
    click('Add “landmine press” as a new exercise')
    type('Exercise name', 'Leg press')
    click('Save exercise')
    expect(screen.getByRole('alert').textContent).toBe('Leg press is already in the list.')
    type('Exercise name', 'Landmine press')
    fireEvent.change(screen.getByLabelText('Main muscle'), { target: { value: 'sideDelts' } })
    fireEvent.change(screen.getByLabelText('Equipment'), { target: { value: 'barbell' } })
    click('Save exercise')
    const card = await screen.findByRole('region', { name: 'Landmine press' })
    type('Landmine press weight (kg)', '20')
    click('More weight for Landmine press')
    expect((screen.getByLabelText('Landmine press weight (kg)') as HTMLInputElement).value).toBe('22.5')
    type('Landmine press reps', '10')
    fireEvent.click(within(card).getByRole('button', { name: 'Log set' }))
    expect((await screen.findByRole('timer', { name: 'Rest' })).textContent).toMatch(/Rest 2:30/)
    const [saved] = await exercises.custom()
    expect(saved).toMatchObject({ name: 'Landmine press', primary: 'sideDelts', equipment: 'barbell', isolation: false })
    expect(exerciseById.get(saved.id)?.primary).toBe('sideDelts')
    fireEvent.click(screen.getByRole('button', { name: '+ Add exercise' }))
    type('Search exercises', 'landmine')
    expect(screen.getByRole('button', { name: /^Landmine press.*your exercise/ })).toBeTruthy()
  })

  it('12. own exercises load with the workouts', async () => {
    const exercises = memoryExerciseStore({ custom: [{ id: 'custom:9', name: 'Neck curl', primary: 'traps', equipment: 'machine', isolation: true }] })
    const store = memoryWorkoutStore({
      sessions: [{ id: 's1', performedOn: TODAY, planDayId: null, name: 'Workout', sets: [{ id: 'a', exerciseId: 'custom:9', setIndex: 0, weightKg: 10, reps: 15, rir: null }] }],
    })
    render(<Workouts store={store} exercises={exercises} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /sets logged/ }))
    expect(await screen.findByText('Set 1: 10 kg × 15')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Neck curl' })).toBeTruthy()
  })
})

describe('own exercises (T-043c)', () => {
  const neck = { id: 'custom:9', name: 'Neck curl', primary: 'traps' as const, equipment: 'machine' as const, isolation: true }
  const openPicker = async (exercises = memoryExerciseStore({ custom: [neck] }), store = memoryWorkoutStore()) => {
    render(<Workouts store={store} exercises={exercises} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start a workout' }))
    click('Empty workout')
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    return exercises
  }

  it('14. an own exercise can be edited; built-in ones have no Edit', async () => {
    const exercises = await openPicker()
    expect(screen.queryByRole('button', { name: 'Edit Leg press' })).toBeNull()
    click('Edit Neck curl')
    const form = screen.getByRole('form', { name: 'Edit exercise' })
    expect((within(form).getByLabelText('Exercise name') as HTMLInputElement).value).toBe('Neck curl')
    expect((within(form).getByLabelText('Main muscle') as HTMLSelectElement).value).toBe('traps')
    type('Exercise name', 'Neck flexion')
    fireEvent.change(screen.getByLabelText('Equipment'), { target: { value: 'cable' } })
    click('Save changes')
    expect(await screen.findByRole('button', { name: /^Neck flexion.*your exercise/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Neck curl/ })).toBeNull()
    expect((await exercises.custom())[0]).toMatchObject({ id: 'custom:9', name: 'Neck flexion', equipment: 'cable' })
    expect(exerciseById.get('custom:9')?.name).toBe('Neck flexion')
  })

  it('15. an edit is checked like a new exercise, but may keep its own name', async () => {
    await openPicker()
    click('Edit Neck curl')
    type('Exercise name', 'leg press')
    click('Save changes')
    expect(screen.getByRole('alert').textContent).toBe('Leg press is already in the list.')
    type('Exercise name', ' ')
    click('Save changes')
    expect(screen.getByRole('alert').textContent).toBe('Give the exercise a name.')
    type('Exercise name', 'Neck curl')
    fireEvent.click(screen.getByRole('checkbox'))
    click('Save changes')
    expect(await screen.findByRole('button', { name: /^Neck curl/ })).toBeTruthy()
  })

  it('16. removing hides the exercise but past sets keep it; Undo brings it back', async () => {
    const store = memoryWorkoutStore({
      sessions: [{ id: 's0', performedOn: '2026-10-01', planDayId: null, name: 'Workout', sets: [{ id: 'a', exerciseId: 'custom:9', setIndex: 0, weightKg: 10, reps: 15, rir: null }] }],
    })
    const exercises = await openPicker(undefined, store)
    click('Edit Neck curl')
    expect(screen.getByText('Past sets, records and plans keep this exercise.')).toBeTruthy()
    click('Remove from my list')
    expect((await screen.findByRole('status')).textContent).toMatch(/^Removed Neck curl from your list\. Past sets stay\./)
    expect(screen.queryByRole('button', { name: /^Neck curl/ })).toBeNull()
    type('Search exercises', 'neck')
    expect(screen.getByText('No exercise matches “neck”.')).toBeTruthy()
    expect((await exercises.custom())[0].hidden).toBe(true)
    // Past sets still know its name.
    expect(exerciseById.get('custom:9')?.name).toBe('Neck curl')
    click('Undo')
    expect(await screen.findByRole('button', { name: /^Neck curl/ })).toBeTruthy()
    expect((await exercises.custom())[0].hidden).toBeUndefined()
  })

  it('16. a failed save or removal keeps the form open and says so', async () => {
    const base = memoryExerciseStore({ custom: [neck] })
    await openPicker({ ...base, updateCustom: () => Promise.reject(new TypeError('offline')), setHidden: () => Promise.reject(new TypeError('offline')) })
    click('Edit Neck curl')
    click('Remove from my list')
    expect((await screen.findByRole('alert')).textContent).toBe('Couldn’t remove the exercise. Check your connection and try again.')
    click('Save changes')
    expect(await screen.findByText('Couldn’t save the exercise. Check your connection and try again.')).toBeTruthy()
    expect(screen.getByRole('form', { name: 'Edit exercise' })).toBeTruthy()
  })
})
