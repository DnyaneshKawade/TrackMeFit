// @vitest-environment jsdom
// Build your own meal plan, change it, and delete it (spec T-129).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { FoodLog } from './FoodLog'
import { memoryLogStore } from './memoryStore'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import { memoryMealPlanStore, type MealPlanStore } from '../profile/mealPlanStore'
import { memoryTargetStore } from '../targets/stores'
import type { DietTarget } from '../targets/types'
import type { Food } from '../food/types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const DAY = '2026-10-14'
const TARGET: DietTarget = { id: 't1', kcal: 2400, proteinG: 130, fatG: 67, carbG: 319, startsOn: '2026-10-01', source: 'manual', setBy: 'me' }
const veg = { dietPref: 'veg' as const, foodRules: [], allergies: [], currentDiet: { counts: {} }, medical: {} }
const POHA: Food = {
  id: 'tmf:dish:poha',
  name: 'Poha',
  state: 'cooked',
  per100g: { kcal: 130, proteinG: 2.5, carbG: 24, fatG: 3 },
  portions: [{ label: '1 plate (150 g)', grams: 150 }],
  source: 'trackMeFit',
  tags: ['onion_garlic'],
}

const setup = (mealPlans: MealPlanStore = memoryMealPlanStore()) => {
  render(
    <FoodLog
      store={memoryLogStore()}
      loadFoods={() => Promise.resolve(localFinder(createSearchIndex([POHA])))}
      today={DAY}
      diet={veg}
      mealPlans={mealPlans}
      targets={memoryTargetStore('me', [TARGET])}
      userId="me"
      latestWeight={() => Promise.resolve(70)}
    />,
  )
  return mealPlans
}

const buildWithPoha = async () => {
  fireEvent.click(await screen.findByRole('button', { name: 'Make a meal plan' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Build my own plan' }))
  const editor = await screen.findByRole('region', { name: 'Build your own meal plan' })
  fireEvent.click(within(within(editor).getByRole('region', { name: 'Breakfast' })).getByRole('button', { name: '+ Add a food' }))
  const sheet = await screen.findByRole('region', { name: 'Add food to Breakfast in your plan' })
  fireEvent.change(within(sheet).getByLabelText('Search foods'), { target: { value: 'poha' } })
  fireEvent.click(await within(sheet).findByRole('button', { name: /^Poha/ }))
  fireEvent.click(await within(sheet).findByRole('button', { name: 'Add to Breakfast in your plan' }))
  return screen.findByRole('region', { name: 'Build your own meal plan' })
}

describe('build your own meal plan (T-129)', () => {
  it('1. "Build my own plan" starts with four empty meals and cannot be saved empty', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Make a meal plan' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Build my own plan' }))
    const editor = await screen.findByRole('region', { name: 'Build your own meal plan' })
    for (const meal of ['Breakfast', 'Lunch', 'Snack', 'Dinner']) {
      expect(within(within(editor).getByRole('region', { name: meal })).queryAllByRole('listitem')).toHaveLength(0)
    }
    expect((within(editor).getByRole('button', { name: 'Save plan' }) as HTMLButtonElement).disabled).toBe(true)
    expect(within(editor).getByText('Add at least one food to save the plan.')).toBeTruthy()
  })

  it('2. foods added to the meals are saved as the plan and shown on the Food tab', async () => {
    const store = setup()
    const editor = await buildWithPoha()
    expect(within(editor).getByLabelText('Poha grams at Breakfast')).toBeTruthy()
    fireEvent.click(within(editor).getByRole('button', { name: 'Save plan' }))
    await screen.findByRole('region', { name: 'Your meal plan' })
    const saved = (await store.latest())!.plan
    expect(saved.meals.flatMap((m) => m.items.map((i) => [m.name, i.foodId]))).toEqual([['Breakfast', POHA.id]])
  })

  it('3. the saved plan can be changed again with "Change plan"', async () => {
    const store = setup()
    fireEvent.click(within(await buildWithPoha()).getByRole('button', { name: 'Save plan' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Change plan' }))
    const editor = await screen.findByRole('region', { name: 'Change your meal plan' })
    const grams = within(editor).getByLabelText('Poha grams at Breakfast')
    fireEvent.change(grams, { target: { value: '300' } })
    fireEvent.blur(grams)
    fireEvent.click(within(editor).getByRole('button', { name: 'Save plan' }))
    await screen.findByRole('region', { name: 'Your meal plan' })
    expect((await store.latest())!.plan.meals[0].items[0].grams).toBe(300)
  })

  it('4. the plan is deleted only after a second tap, and "Make a meal plan" comes back', async () => {
    const store = setup()
    fireEvent.click(within(await buildWithPoha()).getByRole('button', { name: 'Save plan' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Change plan' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete meal plan' }))
    expect(screen.getByText('Delete your meal plan? Foods you already logged stay. You can’t undo this.')).toBeTruthy()
    expect(await store.latest()).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }))
    expect(await screen.findByRole('button', { name: 'Make a meal plan' })).toBeTruthy()
    expect(await store.latest()).toBeNull()
  })
})
