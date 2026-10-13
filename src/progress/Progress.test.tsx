// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { shiftDate } from '../log/types'
import { Progress } from './Progress'
import { memoryProgressStore } from './stores'
import { EMPTY_PROFILE, type ProfileInfo } from '../profile/types'
import { memoryTargetStore } from '../targets/stores'
import { memoryLogStore } from '../log/memoryStore'

afterEach(cleanup)

const TODAY = '2026-10-13'
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('progress tab', () => {
  it('shows food stats when the food log is given (T-062)', async () => {
    render(<Progress store={memoryProgressStore()} goal="lose" today={TODAY} log={memoryLogStore()} />)
    const stats = await screen.findByRole('region', { name: 'Food stats' })
    expect(await within(stats).findByText('Log food for a few days to see your stats.')).toBeTruthy()
  })

  it('saves today’s weight and updates it instead of adding a second one', async () => {
    const store = memoryProgressStore()
    render(<Progress store={store} goal="lose" today={TODAY} />)
    await screen.findByRole('heading', { name: 'Progress' })
    type('Today’s weight (kg)', '500')
    click('Save')
    expect(await screen.findByText(/between 20 and 350/)).toBeTruthy()

    type('Today’s weight (kg)', '64.5')
    click('Save')
    expect(await screen.findByRole('button', { name: 'Update' })).toBeTruthy()
    expect(screen.getByText(/Weigh in most mornings for a week/)).toBeTruthy()

    type('Today’s weight (kg)', '64.2')
    click('Update')
    await screen.findByText('64.2 kg')
    expect(await store.weighIns()).toEqual([{ date: TODAY, kg: 64.2 }])
  })

  it('shows the trend, the goal advice and the chart', async () => {
    const weighIns = Array.from({ length: 14 }, (_, i) => ({ date: shiftDate(TODAY, i - 13), kg: Math.round((70 - 0.08 * i) * 10) / 10 }))
    render(<Progress store={memoryProgressStore(weighIns)} goal="lose" today={TODAY} />)
    const trend = await screen.findByRole('region', { name: 'Average weight' })
    expect(trend.textContent).toMatch(/Your average weight is .* kg, down .* kg over the last week\./)
    expect(trend.textContent).toMatch(/isn’t dropping yet|good pace/)
    expect(screen.getByRole('img', { name: /^Weight from/ })).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Recent weigh-ins' })).getAllByRole('listitem')).toHaveLength(7)
  })

  it('removes a weigh-in', async () => {
    const store = memoryProgressStore([{ date: TODAY, kg: 70 }])
    render(<Progress store={store} goal={null} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Remove/ }))
    await screen.findByRole('button', { name: 'Save' })
    expect(await store.weighIns()).toEqual([])
  })

  it('adds measurements and shows the change since the first', async () => {
    const store = memoryProgressStore([], [{ date: '2026-09-01', waistCm: 85 }])
    render(<Progress store={store} goal="lose" today={TODAY} />)
    const section = await screen.findByRole('region', { name: 'Measurements' })
    expect(section.textContent).toMatch(/Waist85 cm/)
    click('Add')
    click('Save measurements')
    expect(screen.getByText('Fill in at least one measurement.')).toBeTruthy()
    type('Waist (cm)', '82.5')
    click('Save measurements')
    expect(await screen.findByText(/^down 2.5 cm since 1 Sep/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edit today’s' })).toBeTruthy()
  })
})

describe('Catch up to Steady (T-059c)', () => {
  const profile: ProfileInfo = { ...EMPTY_PROFILE, goal: 'gain', experience: 'beginner', heightCm: 170, goalRate: 0.01 }
  const weighIns = Array.from({ length: 14 }, (_, i) => ({ date: shiftDate(TODAY, i - 13), kg: 54.5 }))
  afterEach(() => localStorage.clear())

  it('5. offers Steady with the lower calories, and switches only on the person’s OK', async () => {
    const targets = memoryTargetStore('me', [{ id: 't', startsOn: '2026-09-01', kcal: 2600, proteinG: 120, carbG: 330, fatG: 70, source: 'suggested', setBy: 'me' }])
    const calls: [number, unknown][] = []
    render(<Progress store={memoryProgressStore(weighIns)} goal="gain" profile={profile} targets={targets} onSwitchPace={async (r, t) => void calls.push([r, t])} today={TODAY} />)
    const card = await screen.findByRole('region', { name: 'Switch to Steady' })
    await within(card).findByText(/2,600 to 2,300 kcal/)
    expect(calls).toEqual([])
    fireEvent.click(within(card).getByRole('button', { name: 'Switch to Steady' }))
    await waitFor(() => expect(calls).toEqual([[0.005, { kcal: 2300, proteinG: 120, fatG: 70, carbG: 298 }]]))
  })

  it('6. "Not now" hides it for two weeks', async () => {
    render(<Progress store={memoryProgressStore(weighIns)} goal="gain" profile={profile} onSwitchPace={async () => {}} today={TODAY} />)
    fireEvent.click(within(await screen.findByRole('region', { name: 'Switch to Steady' })).getByRole('button', { name: 'Not now' }))
    expect(screen.queryByRole('region', { name: 'Switch to Steady' })).toBeNull()
    cleanup()
    render(<Progress store={memoryProgressStore(weighIns)} goal="gain" profile={profile} onSwitchPace={async () => {}} today={shiftDate(TODAY, 13)} />)
    await screen.findByRole('heading', { name: 'Progress' })
    expect(screen.queryByRole('region', { name: 'Switch to Steady' })).toBeNull()
    cleanup()
    render(<Progress store={memoryProgressStore(weighIns)} goal="gain" profile={profile} onSwitchPace={async () => {}} today={shiftDate(TODAY, 14)} />)
    expect(await screen.findByRole('region', { name: 'Switch to Steady' })).toBeTruthy()
  })
})
