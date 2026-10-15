// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Clients } from './Clients'
import { emptyClient, memoryCoachStore } from './store'
import type { ClientStores } from './ClientView'
import { memoryLogStore } from '../log/memoryStore'
import { memoryTargetStore } from '../targets/stores'
import { memoryProgressStore } from '../progress/stores'
import { memoryPhotoStore } from '../progress/photoStore'
import { memoryWorkoutStore } from '../training/memoryStore'
import { shiftDate } from '../log/types'

afterEach(cleanup)

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
