// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { FoodLog } from './FoodLog'
import { memoryLogStore } from './memoryStore'
import { createSearchIndex } from '../food/search'
import type { Food } from '../food/types'
import type { LogStore } from './types'

afterEach(cleanup)

const foods: Food[] = [
  {
    id: 'tmf:dish:dal-tadka',
    name: 'Dal tadka',
    aliases: ['yellow dal'],
    state: 'cooked',
    per100g: { kcal: 120, proteinG: 6, carbG: 15, fatG: 4 },
    portions: [{ label: '1 katori (150 g)', grams: 150 }],
    source: 'trackMeFit',
  },
  {
    id: 'usda:168893',
    name: 'Atta (whole wheat flour)',
    aliases: ['atta'],
    state: 'raw',
    per100g: { kcal: 340, proteinG: 13, carbG: 72, fatG: 2.5 },
    portions: [],
    source: 'usda',
  },
]
const loadIndex = () => Promise.resolve(createSearchIndex(foods))
const TODAY = '2026-10-12'

function setup(store: LogStore = memoryLogStore()) {
  render(<FoodLog store={store} loadIndex={loadIndex} today={TODAY} />)
  return store
}

async function addFood(meal: string, query: string, pick: string) {
  const section = await screen.findByRole('region', { name: meal })
  fireEvent.click(within(section).getByRole('button', { name: '+ Add food' }))
  fireEvent.change(screen.getByLabelText('Search foods'), { target: { value: query } })
  fireEvent.click(await screen.findByRole('button', { name: new RegExp(pick) }))
}


describe('food log', () => {
  it('logs a dish by katori and shows it under the meal with day totals', async () => {
    const store = setup()
    await addFood('Lunch', 'yellow', 'Dal tadka')
    expect((screen.getByLabelText('Unit') as HTMLSelectElement).value).toBe('0')
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1.5' } })
    expect(screen.getByText(/Cooked weight · 225 g/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add to Lunch' }))

    const lunch = await screen.findByRole('region', { name: 'Lunch' })
    expect(within(lunch).getByText('Dal tadka')).toBeTruthy()
    expect(within(lunch).getByText(/225 g · 270 kcal/)).toBeTruthy()
    expect(within(screen.getByLabelText('Day total')).getByText('270')).toBeTruthy()
    expect(await store.listDay(TODAY)).toHaveLength(1)
  })

  it('logs a raw ingredient in grams', async () => {
    setup()
    await addFood('Breakfast', 'atta', 'Atta')
    expect(screen.getByText('Weigh it raw')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '60' } })
    expect(within(screen.getByLabelText('This amount')).getByText('204')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add to Breakfast' }))
    const breakfast = await screen.findByRole('region', { name: 'Breakfast' })
    expect(within(breakfast).getByText(/60 g · 204 kcal/)).toBeTruthy()
  })

  it('switching to grams keeps the same amount', async () => {
    setup()
    await addFood('Dinner', 'dal', 'Dal tadka')
    fireEvent.change(screen.getByLabelText('Unit'), { target: { value: '-1' } })
    expect((screen.getByLabelText('Amount') as HTMLInputElement).value).toBe('150')
  })

  it('blocks empty or impossible amounts', async () => {
    setup()
    await addFood('Lunch', 'dal', 'Dal tadka')
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '' } })
    expect(screen.getByText(/Enter an amount/)).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Add to Lunch' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('removes an entry', async () => {
    setup()
    await addFood('Snacks', 'dal', 'Dal tadka')
    fireEvent.click(screen.getByRole('button', { name: 'Add to Snacks' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Remove Dal tadka' }))
    await waitFor(() => expect(screen.queryByText('Dal tadka')).toBeNull())
  })

  it('moves between days and never into the future', async () => {
    const store = memoryLogStore([
      { id: 'y', loggedOn: '2026-10-11', meal: 'dinner', foodId: 'x', foodName: 'Khichdi', grams: 300, kcal: 330, proteinG: 12, carbG: 55, fatG: 6 },
    ])
    setup(store)
    expect(screen.getByRole('heading', { name: 'Today' })).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Next day' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    expect(await screen.findByText('Khichdi')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Yesterday' })).toBeTruthy()
  })

  it('says so when saving fails and keeps the form open', async () => {
    const store = { ...memoryLogStore(), add: vi.fn().mockRejectedValue(new Error('offline')) }
    setup(store)
    await addFood('Lunch', 'dal', 'Dal tadka')
    fireEvent.click(screen.getByRole('button', { name: 'Add to Lunch' }))
    expect((await screen.findByRole('alert')).textContent).toMatch(/Couldn’t save/)
    expect(screen.getByRole('button', { name: 'Add to Lunch' })).toBeTruthy()
  })
})
