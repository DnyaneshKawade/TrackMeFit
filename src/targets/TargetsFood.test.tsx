// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { FoodLog } from '../log/FoodLog'
import { memoryLogStore } from '../log/memoryStore'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import { memoryTargetStore } from './stores'
import type { TargetStore } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const loadFoods = () => Promise.resolve(localFinder(createSearchIndex([])))
const lunch = { id: 'l', loggedOn: TODAY, meal: 'lunch' as const, foodId: 'x', foodName: 'Dal chawal', grams: 350, kcal: 500, proteinG: 15, carbG: 85, fatG: 10 }

function setup(targets: TargetStore, userId = 'me') {
  render(<FoodLog store={memoryLogStore([lunch])} loadFoods={loadFoods} targets={targets} userId={userId} today={TODAY} />)
}
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

describe('daily targets on the food log', () => {
  it('asks to set targets, saves them and shows what is left', async () => {
    const targets = memoryTargetStore('me')
    setup(targets)
    fireEvent.click(await screen.findByRole('button', { name: 'Set your daily targets' }))
    await screen.findByLabelText('Calories')
    type('Calories', '2000')
    type('Protein', '120')
    type('Fat', '60')
    fireEvent.click(screen.getByRole('button', { name: 'Fill carbs from the calories left' }))
    expect((screen.getByLabelText('Carbs') as HTMLInputElement).value).toBe('245')
    fireEvent.click(screen.getByRole('button', { name: 'Save targets' }))

    const left = await screen.findByRole('region', { name: 'Left for the day' })
    expect(within(left).getByText('1500 calories left')).toBeTruthy()
    expect(within(left).getByText('Protein 105 g left')).toBeTruthy()
    expect((await targets.forDate(TODAY))?.kcal).toBe(2000)
  })

  it('blocks invalid targets with a plain message', async () => {
    const targets = { ...memoryTargetStore(), save: vi.fn() }
    setup(targets)
    fireEvent.click(await screen.findByRole('button', { name: 'Set your daily targets' }))
    await screen.findByLabelText('Calories')
    type('Calories', '500')
    fireEvent.click(screen.getByRole('button', { name: 'Save targets' }))
    expect(await screen.findByText('Calories must be between 800 and 6000.')).toBeTruthy()
    expect(screen.getByText('Enter protein.')).toBeTruthy()
    expect(targets.save).not.toHaveBeenCalled()
  })

  it('warns when macros don’t match calories but still allows saving', async () => {
    setup(memoryTargetStore())
    fireEvent.click(await screen.findByRole('button', { name: 'Set your daily targets' }))
    await screen.findByLabelText('Calories')
    type('Calories', '1500')
    type('Protein', '150')
    type('Carbs', '250')
    type('Fat', '70')
    expect(screen.getByRole('note').textContent).toMatch(/2230 calories\. That is 730 more/)
    fireEvent.click(screen.getByRole('button', { name: 'Save targets' }))
    expect(await screen.findByText('1000 calories left')).toBeTruthy()
  })

  it('shows when the coach set the targets and when the day is over', async () => {
    const targets = memoryTargetStore('coach-1', [
      { id: 't', startsOn: '2026-10-01', kcal: 1200, proteinG: 100, carbG: 100, fatG: 40, source: 'manual', setBy: 'coach-1' },
    ])
    setup(targets, 'me')
    expect(await screen.findByText(/set by your coach/)).toBeTruthy()
    expect(screen.getByText('Protein 85 g left')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Edit targets' }))
    await screen.findByLabelText('Calories')
    expect((screen.getByLabelText('Calories') as HTMLInputElement).value).toBe('1200')
    type('Calories', '400')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByText('700 calories left')).toBeTruthy()
  })
})

describe('next calorie step on the food log (T-067a)', () => {
  const week1 = { id: 'w1', startsOn: '2026-10-05', kcal: 1820, proteinG: 102, carbG: 196, fatG: 51, source: 'suggested' as const, setBy: 'me' }
  const offer = { values: { kcal: 1570, proteinG: 102, carbG: 133, fatG: 51 }, message: 'Ready for your next step? Eat about 1,570 calories a day from today.' }
  // Like the real one: a step that just started has no next step yet.
  const show = (targets: TargetStore, nextStep = vi.fn(async (t: { id: string }) => (t.id === 'w1' ? offer : null))) => {
    render(<FoodLog store={memoryLogStore([lunch])} loadFoods={loadFoods} targets={targets} userId="me" nextStep={nextStep} today={TODAY} />)
    return nextStep
  }

  it('6. nothing changes until "Use it"; then the step starts today as a suggested target', async () => {
    const targets = memoryTargetStore('me', [week1])
    const nextStep = show(targets)
    const card = await screen.findByRole('status', { name: 'Next step' })
    expect(card.textContent).toMatch(/^Ready for your next step\? Eat about 1,570 calories a day from today\./)
    expect(nextStep).toHaveBeenCalledWith(week1)
    expect((await targets.forDate(TODAY))?.kcal).toBe(1820)
    fireEvent.click(within(card).getByRole('button', { name: 'Use it' }))
    expect(await screen.findByText(/of 1570 calories/)).toBeTruthy()
    expect(screen.queryByRole('status', { name: 'Next step' })).toBeNull()
    expect(await targets.forDate(TODAY)).toMatchObject({ kcal: 1570, startsOn: TODAY, source: 'suggested' })
  })

  it('6. "Not now" hides the step for the rest of the day', async () => {
    localStorage.clear()
    const targets = memoryTargetStore('me', [week1])
    show(targets)
    fireEvent.click(within(await screen.findByRole('status', { name: 'Next step' })).getByRole('button', { name: 'Not now' }))
    expect(screen.queryByRole('status', { name: 'Next step' })).toBeNull()
    cleanup()
    const nextStep = show(targets)
    await screen.findByRole('region', { name: 'Left for the day' })
    expect(nextStep).not.toHaveBeenCalled()
    expect((await targets.forDate(TODAY))?.kcal).toBe(1820)
    localStorage.clear()
  })

  it('6 (T-067d). a hold has only OK, and OK hides it for a week', async () => {
    localStorage.clear()
    const targets = memoryTargetStore('me', [week1])
    const hold = { ...offer, values: week1, hold: true, message: 'You are losing about 0.6 kg a week. That is your pace, so stay at 1,820 calories for now.' }
    show(targets, vi.fn(async () => hold))
    const card = await screen.findByRole('status', { name: 'Next step' })
    expect(within(card).queryByRole('button', { name: 'Use it' })).toBeNull()
    fireEvent.click(within(card).getByRole('button', { name: 'OK' }))
    expect(screen.queryByRole('status', { name: 'Next step' })).toBeNull()
    expect((await targets.forDate(TODAY))?.kcal).toBe(1820)
    const keys = Object.keys(localStorage).filter((k) => k.includes('w1'))
    expect(keys).toHaveLength(7)
    localStorage.clear()
  })
})
