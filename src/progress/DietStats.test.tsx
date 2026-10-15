// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { memoryLogStore } from '../log/memoryStore'
import { shiftDate, type LogEntry, type LogStore } from '../log/types'
import { memoryTargetStore } from '../targets/stores'
import type { DietTarget } from '../targets/types'
import { DietStats } from './DietStats'

afterEach(cleanup)

const TODAY = '2026-10-13'
const TARGET: DietTarget = { id: 't', startsOn: '2026-09-01', kcal: 2000, proteinG: 100, carbG: 250, fatG: 60, source: 'manual', setBy: 'me' }

let n = 0
const entry = (daysAgo: number, kcal: number, proteinG: number, foodName = 'Dal tadka'): LogEntry => ({
  id: String(++n),
  loggedOn: shiftDate(TODAY, -daysAgo),
  meal: 'lunch',
  foodId: `tmf:dish:${foodName.toLowerCase().replace(/ /g, '-')}`,
  foodName,
  grams: 200,
  kcal,
  proteinG,
  carbG: 200,
  fatG: 50,
})

async function show(entries: LogEntry[], targets: DietTarget[] = [TARGET], log: LogStore = memoryLogStore(entries)) {
  render(<DietStats log={log} targets={memoryTargetStore('me', targets)} today={TODAY} />)
  return screen.findByRole('region', { name: 'Food stats' })
}

const avg = (label: string) => within(screen.getByLabelText('Average per day')).getByText(label).nextElementSibling!.textContent

describe('food stats on Progress (T-062)', () => {
  it('1, 3, 4, 5. shows the week’s averages against targets, days on target, the protein streak, a chart and top foods', async () => {
    const section = await show([
      entry(1, 2000, 100),
      entry(2, 1900, 95, 'Poha'),
      entry(3, 1000, 40),
      entry(10, 3000, 150, 'Biryani'),
      entry(0, 500, 20, 'Poha'),
    ])
    await within(section).findByLabelText('Average per day')
    expect(avg('Calories')).toBe('1,633 of 2,000')
    expect(avg('Protein')).toBe('78 g of 100 g')
    expect(within(section).getByLabelText('Days on target').textContent).toBe('2 of 3 logged days on target.')
    expect(within(section).getByLabelText('Protein streak').textContent).toBe('Protein streak: 2 days')
    expect(within(section).getByRole('img', { name: 'Calories each day from 7 Oct to 13 Oct' })).toBeTruthy()
    const top = within(within(section).getByRole('region', { name: 'Most logged foods' })).getAllByRole('listitem').map((li) => li.textContent)
    expect(top).toEqual(['Dal tadka2 times', 'Poha2 times'])
    expect(within(section).queryByText('Biryani')).toBeNull()
  })

  it('2. "30 days" shows the last 30 days', async () => {
    const section = await show([entry(1, 2000, 100), entry(10, 3000, 150, 'Biryani')])
    await within(section).findByLabelText('Days on target')
    fireEvent.click(within(section).getByRole('button', { name: '30 days' }))
    expect(within(section).getByLabelText('Days on target').textContent).toBe('1 of 2 logged days on target.')
    expect(within(section).getByText('Biryani')).toBeTruthy()
    expect(within(section).getByRole('img', { name: 'Calories each day from 14 Sept to 13 Oct' })).toBeTruthy()
  })

  it('6. says what to do with no food or no targets', async () => {
    let section = await show([])
    expect(await within(section).findByText('Log food for a few days to see your stats.')).toBeTruthy()
    expect(within(section).queryByRole('img')).toBeNull()
    cleanup()
    section = await show([entry(1, 1800, 90)], [])
    expect(await within(section).findByText('Set your daily targets to see days on target.')).toBeTruthy()
    expect(avg('Calories')).toBe('1,800')
    expect(within(section).queryByLabelText('Days on target')).toBeNull()
  })

  it('shows an error when the log can’t be read, and nothing without a range query', async () => {
    const failing: LogStore = { ...memoryLogStore(), listRange: () => Promise.reject(new TypeError('Failed to fetch')) }
    const section = await show([], [TARGET], failing)
    expect(await within(section).findByText('Couldn’t load your food stats.')).toBeTruthy()
    cleanup()
    const noRange: LogStore = { ...memoryLogStore() }
    delete noRange.listRange
    render(<DietStats log={noRange} today={TODAY} />)
    expect(screen.queryByRole('region', { name: 'Food stats' })).toBeNull()
  })
})

describe('fasting days in food stats (T-041c)', () => {
  it('3. fasting days are marked in the chart and left out of the averages', async () => {
    const fastDay = shiftDate(TODAY, -2)
    const days = [entry(1, 2000, 100), entry(2, 300, 5), entry(3, 2000, 100)]
    const section = await show(days, [TARGET], memoryLogStore(days, [fastDay]))
    expect(await within(section).findByText(/Bars with a dashed outline are fasting days\./)).toBeTruthy()
    expect(avg('Calories')).toBe('2,000 of 2,000')
    expect(within(section).getByText('Fasting days are left out of the averages, days on target and the protein streak.')).toBeTruthy()
  })
})
