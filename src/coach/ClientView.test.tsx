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
import { memoryCheckInStore } from './checkIns'
import { memoryChatStore, type ChatStore } from './chat'
import { customExercises, exerciseById, setCustomExercises } from '../training/exercises'
import type { Plan, WorkoutStore } from '../training/types'
import { memoryProfileStore } from '../profile/stores'

afterEach(() => {
  cleanup()
  setCustomExercises([])
})

const TODAY = '2026-10-15'
const COACH = 'coach-1'

function setup(stores: Partial<ClientStores> = {}, chat?: ChatStore, templates?: WorkoutStore) {
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
    checkIns: memoryCheckInStore([], TODAY),
    ...stores,
  }
  const client = { ...emptyClient('l1', 'Asha Rao'), trainingDays: 3 }
  render(<Clients store={memoryCoachStore({ clients: [client] })} storesFor={() => all} coachId={COACH} today={TODAY} chat={chat} templates={templates} />)
  return all
}

describe('open button (T-079)', () => {
  it('1. each client has an Open button that opens the client page; 2. a line says what it is for', async () => {
    setup()
    expect(await screen.findByText('Tap Open to set targets, plans and more.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Open Asha Rao' }))
    expect(await screen.findByRole('region', { name: 'Targets' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Workout plans' })).toBeTruthy()
  })
})

describe('chat on the client page (T-026f)', () => {
  it('5. the coach opens a client with a new message, reads it there, and the count clears', async () => {
    const rows: Parameters<typeof memoryChatStore>[1] = [{ id: 'm1', linkId: 'l1', sender: 'client-l1', body: 'Is curd okay at night?', sentAt: '2026-10-15T03:00:00.000Z', readAt: null }]
    setup({}, memoryChatStore(COACH, rows))
    expect(await screen.findByText('1 new message')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Asha Rao' }))
    const chat = screen.getByRole('region', { name: 'Messages' })
    expect(await within(chat).findByText('Is curd okay at night?')).toBeTruthy()
    expect(within(chat).getByLabelText('Message to Asha')).toBeTruthy()
    await waitFor(() => expect(rows[0].readAt).not.toBeNull())
    fireEvent.click(screen.getByRole('button', { name: '← All clients' }))
    await screen.findByRole('button', { name: 'Invite a client' })
    expect(screen.queryByText('1 new message')).toBeNull()
  })
})

describe('about this client (T-084)', () => {
  it('3. the coach sees the client’s sign-up answers, read only', async () => {
    setup({ profile: memoryProfileStore({ fullName: 'Asha Rao', sex: 'female', heightCm: 160, dietPref: 'veg', allergies: ['peanuts'], medical: { thyroid: true }, onboardedAt: '2026-10-01T00:00:00Z' }) })
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    fireEvent.click(await screen.findByText('About Asha'))
    const about = await screen.findByRole('region', { name: 'About you' })
    expect(about.textContent).toContain('Height160 cm')
    expect(about.textContent).toContain('Weight70 kg')
    expect(screen.getByRole('region', { name: 'Health check' }).textContent).toContain('A thyroid condition')
    expect(screen.getByRole('region', { name: 'Food habits' }).textContent).toContain('AllergiesPeanuts')
    expect(within(about.closest('details')!).queryByRole('button')).toBeNull()
    expect(screen.getByText('Asha’s sign-up answers. Only Asha can change them.')).toBeTruthy()
  })

  it('3. a client who skipped the questions shows a note', async () => {
    setup({ profile: memoryProfileStore({ fullName: 'Asha Rao' }) })
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    expect(await screen.findByText('Asha has not answered the sign-up questions yet.')).toBeTruthy()
  })
})

describe('opening a client (T-026c)', () => {
  it('1. shows what needs attention, targets, weight, food stats, workouts and photos', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    expect(screen.getByRole('heading', { name: 'Asha Rao' })).toBeTruthy()
    expect(within(screen.getByRole('list', { name: 'Needs attention' })).getByText('No food logged yet.')).toBeTruthy()
    const targets = screen.getByRole('region', { name: 'Targets' })
    expect(await within(targets).findByText(/1800 calories, 120 g protein, 200 g carbs, 60 g fat/)).toBeTruthy()
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
    expect(await within(targets).findByText(/1700 calories, 120 g protein/)).toBeTruthy()
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

const clientExercises = () => memoryExerciseStore({ custom: [{ id: 'custom:c1', name: 'Band W raise', primary: 'rearDelts', equipment: 'cable', isolation: true }] })

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
    await waitFor(() => expect(exerciseById.get('custom:c1')?.name).toBe('Band W raise'))
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Upper Lower' }))
    expect(screen.getByText('Band W raise')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Delete plan' })).toBeNull()
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add exercise' })[0])
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'band w' } })
    expect(screen.getByRole('button', { name: /Band W raise/ })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'coach move' } })
    expect(screen.queryByRole('button', { name: /Coach move/ })).toBeNull()
    cleanup()
    expect(customExercises().map((e) => e.id)).toEqual(['custom:mine'])
  })
})

describe('check-ins on the client page (T-026e)', () => {
  it('4. the coach reads a check-in with the week’s weight and replies once', async () => {
    const checkIns = memoryCheckInStore(
      [{ id: 'c1', weekStart: '2026-10-12', energy: 2, sleep: 3, mood: 4, diet: 2, training: 5, note: 'Office party', ask: 'Can I swap rice for roti?', reply: null, repliedOn: null }],
      TODAY,
    )
    setup({ checkIns })
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    const week = await screen.findByRole('article', { name: 'Week of 12 Oct' })
    expect(within(week).getByText(/Energy 2 · Sleep 3/)).toBeTruthy()
    expect(within(week).getByText('“Office party”')).toBeTruthy()
    expect(within(week).getByText(/Average 70\.\d kg, down 0\.\d kg from the week before\./)).toBeTruthy()
    fireEvent.click(within(week).getByRole('button', { name: 'Send reply' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Write a reply first.')
    fireEvent.change(within(week).getByLabelText('Reply to Asha'), { target: { value: 'Yes, two rotis.' } })
    fireEvent.click(within(week).getByRole('button', { name: 'Send reply' }))
    expect(await within(week).findByText('Yes, two rotis.')).toBeTruthy()
    expect(within(week).queryByRole('button', { name: 'Send reply' })).toBeNull()
    expect((await checkIns.list())[0].reply).toBe('Yes, two rotis.')
  })
})

describe('program templates (T-026g)', () => {
  const ppl: Plan = {
    id: 't1',
    name: 'Push Pull Legs',
    hardWeeks: 4,
    days: [
      { id: 'td1', dayIndex: 0, name: 'Push', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }, { exerciseId: 'custom:mine', sets: 3, repMin: 10, repMax: 15 }] },
      { id: 'td2', dayIndex: 1, name: 'Legs', exercises: [{ exerciseId: 'back-squat', sets: 3, repMin: 5, repMax: 8 }] },
    ],
  }

  it('2. the coach makes a template on the Clients tab and sees it listed', async () => {
    const templates = memoryWorkoutStore()
    setup({}, undefined, templates)
    const section = await screen.findByRole('region', { name: 'Program templates' })
    expect(await within(section).findByText('No templates yet.')).toBeTruthy()
    fireEvent.click(within(section).getByRole('button', { name: '+ New template' }))
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Beginner 3 day' } })
    fireEvent.change(screen.getByLabelText('Day 1 name'), { target: { value: 'Day A' } })
    fireEvent.click(screen.getByRole('button', { name: '+ Add exercise' }))
    fireEvent.click(screen.getAllByRole('button', { name: /Back squat/ })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }))
    expect(await within(await screen.findByRole('region', { name: 'Program templates' })).findByText('Beginner 3 day')).toBeTruthy()
    expect((await templates.plans()).map((p) => p.name)).toEqual(['Beginner 3 day'])
  })

  it('3. the coach adds a template to a client at week 3, and their own exercises are left out', async () => {
    const stores = setup({ workouts: coachWorkouts([]) }, undefined, memoryWorkoutStore({ plans: [ppl] }))
    fireEvent.click(await screen.findByRole('button', { name: 'Asha Rao' }))
    const plans = screen.getByRole('region', { name: 'Workout plans' })
    fireEvent.click(await within(plans).findByRole('button', { name: '+ Start a program' }))
    fireEvent.change(within(plans).getByLabelText('Start at week'), { target: { value: '3' } })
    expect(within(plans).getByText('Asha joins in week 3 of 4. The light week comes after week 4, as for others on it.')).toBeTruthy()
    fireEvent.click(within(plans).getByRole('button', { name: 'Add to Asha’s plans' }))
    expect((await within(plans).findByRole('status')).textContent).toBe(
      'Added Push Pull Legs. Asha joins in week 3 of 4. The light week comes after week 4, as for others on it. 1 of your own exercises was left out, because Asha can’t see them.',
    )
    expect(await within(plans).findByText('Push · Legs')).toBeTruthy()
    const [copy] = await stores.workouts.plans()
    expect(copy.id).not.toBe('t1')
    // Starts today at week 3; later weeks count the workouts done (T-107).
    expect(copy.blockStartedOn).toBe('2026-10-15')
    expect(copy.blockStartWeek).toBe(3)
    expect(copy.days[0].exercises.map((e) => e.exerciseId)).toEqual(['bench-press'])
  })
})

describe('choose what your coach sees (T-096)', () => {
  const answers = memoryProfileStore({ fullName: 'Asha Rao', sex: 'female', onboardedAt: '2026-10-01T00:00:00Z', medical: { diabetes: true } })

  it('4. photos and health answers the client keeps private say "Not shared"', async () => {
    setup({ profile: answers, shares: async () => ({ photos: false, health: false }) })
    fireEvent.click(await screen.findByRole('button', { name: 'Open Asha Rao' }))
    const photos = await screen.findByRole('region', { name: 'Progress photos' })
    expect(within(photos).getByText('Not shared. Asha can share photos from their Progress page.')).toBeTruthy()
    fireEvent.click(await screen.findByText('About Asha'))
    const health = await screen.findByRole('region', { name: 'Health check' })
    expect(within(health).getByText('Not shared')).toBeTruthy()
  })

  it('5. shared parts show as before', async () => {
    setup({ profile: answers, shares: async () => ({ photos: true, health: true }) })
    fireEvent.click(await screen.findByRole('button', { name: 'Open Asha Rao' }))
    fireEvent.click(await screen.findByText('About Asha'))
    const health = await screen.findByRole('region', { name: 'Health check' })
    expect(within(health).queryByText('Not shared')).toBeNull()
    expect(within(health).getByText(/Diabetes/)).toBeTruthy()
    expect(screen.queryByText(/Not shared\. Asha/)).toBeNull()
  })
})
