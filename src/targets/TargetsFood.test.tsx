// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { FoodLog } from '../log/FoodLog'
import { memoryLogStore } from '../log/memoryStore'
import { createSearchIndex } from '../food/search'
import { memoryTargetStore } from './stores'
import type { TargetStore } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const loadIndex = () => Promise.resolve(createSearchIndex([]))
const lunch = { id: 'l', loggedOn: TODAY, meal: 'lunch' as const, foodId: 'x', foodName: 'Dal chawal', grams: 350, kcal: 500, proteinG: 15, carbG: 85, fatG: 10 }

function setup(targets: TargetStore, userId = 'me') {
  render(<FoodLog store={memoryLogStore([lunch])} loadIndex={loadIndex} targets={targets} userId={userId} today={TODAY} />)
}
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

describe('daily targets on the food log', () => {
  it('asks to set targets, saves them and shows what is left', async () => {
    const targets = memoryTargetStore('me')
    setup(targets)
    fireEvent.click(await screen.findByRole('button', { name: 'Set your daily targets' }))
    type('Calories', '2000')
    type('Protein', '120')
    type('Fat', '60')
    fireEvent.click(screen.getByRole('button', { name: 'Fill carbs from the calories left' }))
    expect((screen.getByLabelText('Carbs') as HTMLInputElement).value).toBe('245')
    fireEvent.click(screen.getByRole('button', { name: 'Save targets' }))

    const left = await screen.findByRole('region', { name: 'Left for the day' })
    expect(within(left).getByText('1500 kcal left')).toBeTruthy()
    expect(within(left).getByText('Protein 105 g left')).toBeTruthy()
    expect((await targets.forDate(TODAY))?.kcal).toBe(2000)
  })

  it('blocks invalid targets with a plain message', async () => {
    const targets = { ...memoryTargetStore(), save: vi.fn() }
    setup(targets)
    fireEvent.click(await screen.findByRole('button', { name: 'Set your daily targets' }))
    type('Calories', '500')
    fireEvent.click(screen.getByRole('button', { name: 'Save targets' }))
    expect(await screen.findByText('Calories must be between 800 and 6000.')).toBeTruthy()
    expect(screen.getByText('Enter protein.')).toBeTruthy()
    expect(targets.save).not.toHaveBeenCalled()
  })

  it('warns when macros don’t match calories but still allows saving', async () => {
    setup(memoryTargetStore())
    fireEvent.click(await screen.findByRole('button', { name: 'Set your daily targets' }))
    type('Calories', '1500')
    type('Protein', '150')
    type('Carbs', '250')
    type('Fat', '70')
    expect(screen.getByRole('note').textContent).toMatch(/2230 kcal, 730 more/)
    fireEvent.click(screen.getByRole('button', { name: 'Save targets' }))
    expect(await screen.findByText('1000 kcal left')).toBeTruthy()
  })

  it('shows when the coach set the targets and when the day is over', async () => {
    const targets = memoryTargetStore('coach-1', [
      { id: 't', startsOn: '2026-10-01', kcal: 1200, proteinG: 100, carbG: 100, fatG: 40, source: 'manual', setBy: 'coach-1' },
    ])
    setup(targets, 'me')
    expect(await screen.findByText(/set by your coach/)).toBeTruthy()
    expect(screen.getByText('Protein 85 g left')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Edit targets' }))
    expect((screen.getByLabelText('Calories') as HTMLInputElement).value).toBe('1200')
    type('Calories', '400')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByText('700 kcal left')).toBeTruthy()
  })
})
