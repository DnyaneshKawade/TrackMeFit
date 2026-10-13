// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { shiftDate } from '../log/types'
import { Progress } from './Progress'
import { memoryProgressStore } from './stores'

afterEach(cleanup)

const TODAY = '2026-10-13'
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('progress tab', () => {
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
    const trend = await screen.findByRole('region', { name: 'Weight trend' })
    expect(trend.textContent).toMatch(/Your trend weight is .* kg, down .* kg over the last week\./)
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
