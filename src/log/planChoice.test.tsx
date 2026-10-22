// @vitest-environment jsdom
// Two ways to make a meal plan: build my own or suggest a plan (spec T-131).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { FoodLog } from './FoodLog'
import { memoryLogStore } from './memoryStore'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import { memoryMealPlanStore } from '../profile/mealPlanStore'
import { memoryTargetStore } from '../targets/stores'
import type { DietTarget } from '../targets/types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const DAY = '2026-10-14'
const TARGET: DietTarget = { id: 't1', kcal: 2400, proteinG: 130, fatG: 67, carbG: 319, startsOn: '2026-10-01', source: 'manual', setBy: 'me' }
const veg = { dietPref: 'veg' as const, foodRules: [], allergies: [], currentDiet: { counts: {} }, medical: {} }

const setup = () =>
  render(
    <FoodLog
      store={memoryLogStore()}
      loadFoods={() => Promise.resolve(localFinder(createSearchIndex([])))}
      today={DAY}
      diet={veg}
      mealPlans={memoryMealPlanStore()}
      targets={memoryTargetStore('me', [TARGET])}
      userId="me"
      latestWeight={() => Promise.resolve(70)}
    />,
  )

const openChoice = async () => {
  setup()
  fireEvent.click(await screen.findByRole('button', { name: 'Make a meal plan' }))
  return screen.findByRole('group', { name: 'How to make the plan' })
}

describe('two ways to make a meal plan (T-131)', () => {
  it('1. "Make a meal plan" shows two choices and no protein question yet', async () => {
    const choice = await openChoice()
    expect(within(choice).getAllByRole('button').map((b) => b.textContent)).toEqual(['Build my own plan', 'Suggest a plan'])
    expect(screen.queryByRole('group', { name: 'Protein foods you like' })).toBeNull()
  })

  it('2. "Suggest a plan" asks for protein foods, and "Back" returns to the choices', async () => {
    const choice = await openChoice()
    fireEvent.click(within(choice).getByRole('button', { name: 'Suggest a plan' }))
    expect(await screen.findByRole('group', { name: 'Protein foods you like' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('group', { name: 'How to make the plan' })).toBeTruthy()
    expect(screen.queryByRole('group', { name: 'Protein foods you like' })).toBeNull()
  })

  it('3. "Build my own plan" shows four empty meals', async () => {
    const choice = await openChoice()
    fireEvent.click(within(choice).getByRole('button', { name: 'Build my own plan' }))
    const editor = await screen.findByRole('region', { name: 'Build your own meal plan' })
    for (const meal of ['Breakfast', 'Lunch', 'Snack', 'Dinner']) {
      expect(within(within(editor).getByRole('region', { name: meal })).queryAllByRole('listitem')).toHaveLength(0)
    }
  })

  it('4. "Make a new plan" from a saved plan shows the same two choices', async () => {
    const choice = await openChoice()
    fireEvent.click(within(choice).getByRole('button', { name: 'Suggest a plan' }))
    const picks = await screen.findByRole('group', { name: 'Protein foods you like' })
    fireEvent.click(within(picks).getAllByRole('button')[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Use this plan' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Change plan' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Make a new plan' }))
    expect(await screen.findByRole('group', { name: 'How to make the plan' })).toBeTruthy()
  })
})
