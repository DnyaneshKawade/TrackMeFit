// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Clients } from './Clients'
import { emptyClient, memoryCoachStore } from './store'
import type { ClientStores } from './ClientView'
import { memoryLogStore } from '../log/memoryStore'
import { memoryTargetStore } from '../targets/stores'
import { memoryProgressStore } from '../progress/stores'
import { memoryPhotoStore } from '../progress/photoStore'
import { memoryWorkoutStore } from '../training/memoryStore'
import { shiftDate } from '../log/types'
import { memoryExerciseStore } from '../training/exerciseStore'
import { customExercises, exerciseById, setCustomExercises } from '../training/exercises'
import type { Plan, WorkoutStore } from '../training/types'

afterEach(() => {
  cleanup()
  setCustomExercises([])
})

const TODAY = '2026-10-15'
const COACH = 'coach-1'

function setup(stores: Partial<ClientStores> = {}) {
  const all: ClientStores = {
    log: memoryLogStore(),
    targets: memoryTargetStore('client-l1', [
      { id: 't1', startsOn: '2026-10-01', kcal: 1800, proteinG: 120, carbG: 200, fatG: 60, source: 'manual', setBy: 'client-l1' },
    ]),
    progress: memoryProgressStore(Array.from({ length: 10 }, (_, i) => ({ date: shiftDate(TODAY, -i), kg: 70 + i * 0.1 }))),
    photos: memoryPhotoStore([{ id: 'p1', date: TODAY, pose: 'front' }]),
    workouts: memoryWorkoutStore({
      sessions: [{ id: 's1', performedOn: shiftDate(TODAY, -2), planDayId: null, name: 'Upper A', sets: [] }],
    }),
    exercises: memoryExerciseStore(),
    ...stores,
  }
  const client = { ...emptyClient('l1', 'Asha Rao'), trainingDays: 3 }
  render(<Clients store={memoryCoachStore({ clients: [client] })} storesFor={() => all} coachId={COACH} today={TODAY} />)
  return all
}

describe('opening a client (T-026c)', () => {
  it('1. shows what needs attention, targets, weight, food stats, workouts and photos', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    expect(screen.getByRole('heading', { name: 'Asha Rao' })).toBeTruthy()
    expect(within(screen.getByRole('list', { name: 'Needs attention' })).getByText('No food logged yet.')).toBeTruthy()
    const targets = screen.getByRole('region', { name: 'Targets' })
    expect(await within(targets).findByText(/1800 kcal, 120 g protein, 200 g carbs, 60 g fat/)).toBeTruthy()
    expect(within(targets).getByText('Set by Asha from 1 Oct.')).toBeTruthy()
    expect(await within(screen.getByRole('region', { name: 'Weight' })).findByText(/Your average weight is/)).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Food stats' })).toBeTruthy()
    expect(await within(screen.getByRole('region', { name: 'Workouts' })).findByText('Upper A')).toBeTruthy()
    const photos = screen.getByRole('region', { name: 'Progress photos' })
    expect(await within(photos).findByRole('img', { name: 'Front, 15 Oct' })).toBeTruthy()
  })

  it('2. photos are read-only for the coach', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    const photos = screen.getByRole('region', { name: 'Progress photos' })
    await within(photos).findByRole('img')
    expect(within(photos).queryByRole('button', { name: /Remove/ })).toBeNull()
    expect(within(photos).queryByLabelText(/Add today’s/)).toBeNull()
  })

  it('3. the coach changes the client’s targets, starting today', async () => {
    const stores = setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Change targets' }))
    fireEvent.change(screen.getByLabelText('Calories'), { target: { value: '1700' } })
    fireEvent.click(screen.getByRole('button', { name: /Save/ }))
    const targets = screen.getByRole('region', { name: 'Targets' })
    expect(await within(targets).findByText(/1700 kcal, 120 g protein/)).toBeTruthy()
    const now = await stores.targets.forDate(TODAY)
    expect([now?.kcal, now?.startsOn, now?.source]).toEqual([1700, TODAY, 'manual'])
  })

  it('4. "All clients" goes back to the list', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    fireEvent.click(screen.getByRole('button', { name: '← All clients' }))
    expect(await screen.findByRole('button', { name: 'Invite a client' })).toBeTruthy()
  })
})

const upper: Plan = {
  id: 'p1',
  name: 'Upper Lower',
  changedBy: 'client-l1',
  changedOn: '2026-10-01',
  days: [
    { id: 'd1', dayIndex: 0, name: 'Upper', exercises: [{ exerciseId: 'custom:c1', sets: 3, repMin: 8, repMax: 12 }] },
    { id: 'd2', dayIndex: 1, name: 'Lower', exercises: [{ exerciseId: 'back-squat', sets: 3, repMin: 5, repMax: 8 }] },
  ],
}

/** The memory store, with saves recorded as made by the coach, as the database does. */
function coachWorkouts(plans: Plan[]): WorkoutStore {
  const store = memoryWorkoutStore({ plans })
  return { ...store, savePlan: (p) => store.savePlan({ ...p, changedBy: COACH, changedOn: TODAY }) }
}

const clientExercises = () => memoryExerciseStore({ custom: [{ id: 'custom:c1', name: 'Band pull-apart', primary: 'rearDelts', equipment: 'cable', isolation: true }] })

describe('a coach edits a client’s plan (T-026d)', () => {
  it('1. shows the client’s plans with their days and who changed them last', async () => {
    setup({ workouts: coachWorkouts([upper]) })
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    const plans = screen.getByRole('region', { name: 'Workout plans' })
    expect(await within(plans).findByText('Upper Lower')).toBeTruthy()
    expect(within(plans).getByText('Upper · Lower')).toBeTruthy()
    expect(within(plans).getByText('Changed by Asha on 1 Oct.')).toBeTruthy()
  })

  it('2. the coach changes a plan and the list shows "Changed by you"', async () => {
    const stores = setup({ workouts: coachWorkouts([upper]), exercises: clientExercises() })
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Upper Lower' }))
    fireEvent.change(screen.getByLabelText('Back squat sets'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }))
    const plans = await screen.findByRole('region', { name: 'Workout plans' })
    expect(await within(plans).findByText('Changed by you on 15 Oct.')).toBeTruthy()
    const [saved] = await stores.workouts.plans()
    expect(saved.days[1].exercises[0].sets).toBe(4)
  })

  it('3. the coach makes a new plan for the client', async () => {
    const stores = setup({ workouts: coachWorkouts([]) })
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    expect(await within(screen.getByRole('region', { name: 'Workout plans' })).findByText('No plan yet.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '+ New plan' }))
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Full body' } })
    fireEvent.change(screen.getByLabelText('Day 1 name'), { target: { value: 'Day A' } })
    fireEvent.click(screen.getByRole('button', { name: '+ Add exercise' }))
    fireEvent.click(screen.getAllByRole('button', { name: /Back squat/ })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }))
    expect(await within(await screen.findByRole('region', { name: 'Workout plans' })).findByText('Full body')).toBeTruthy()
    expect((await stores.workouts.plans()).map((p) => p.name)).toEqual(['Full body'])
  })

  it('4. the coach sees and picks the client’s own exercises, can’t delete the plan, and gets their own exercises back after', async () => {
    const mine = { id: 'custom:mine', name: 'Coach move', aliases: [], primary: 'chest' as const, secondary: [], equipment: 'cable' as const, isolation: true, increment: 2.5 }
    setCustomExercises([mine])
    setup({ workouts: coachWorkouts([upper]), exercises: clientExercises() })
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    await waitFor(() => expect(exerciseById.get('custom:c1')?.name).toBe('Band pull-apart'))
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Upper Lower' }))
    expect(screen.getByText('Band pull-apart')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Delete plan' })).toBeNull()
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add exercise' })[0])
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'band pull' } })
    expect(screen.getByRole('button', { name: /Band pull-apart/ })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'coach move' } })
    expect(screen.queryByRole('button', { name: /Coach move/ })).toBeNull()
    cleanup()
    expect(customExercises().map((e) => e.id)).toEqual(['custom:mine'])
  })
})
