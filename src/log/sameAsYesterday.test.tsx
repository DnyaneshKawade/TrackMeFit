// @vitest-environment jsdom
// "Same as yesterday" on each meal (spec T-160).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { FoodLog } from './FoodLog'
import { memoryLogStore } from './memoryStore'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import { buildMealPlan } from '../engine/mealPlan'
import { PROTEIN_PICKS, planFoodsFor } from '../profile/planFoods'
import { memoryMealPlanStore } from '../profile/mealPlanStore'
import { excludedTags } from '../profile/dietRules'
import type { LogEntry, LogStore } from './types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const TODAY = '2026-10-14'
const YESTERDAY = '2026-10-13'
const POHA: LogEntry = { id: 'e1', loggedOn: YESTERDAY, meal: 'breakfast', foodId: 'tmf:dish:poha', foodName: 'Poha', grams: 150, kcal: 195, proteinG: 3.8, carbG: 36, fatG: 4.5, planItem: 'p1' }
const TEA: LogEntry = { id: 'e2', loggedOn: YESTERDAY, meal: 'breakfast', foodId: 'quick', foodName: 'Tea', grams: null, kcal: 80, proteinG: 2, carbG: 10, fatG: 3 }
const DAL: LogEntry = { id: 'e3', loggedOn: YESTERDAY, meal: 'lunch', foodId: 'tmf:dish:dal', foodName: 'Dal', grams: 200, kcal: 220, proteinG: 12, carbG: 30, fatG: 5 }
const EGG: LogEntry = { id: 'e4', loggedOn: TODAY, meal: 'lunch', foodId: 'tmf:egg', foodName: 'Egg', grams: 50, kcal: 70, proteinG: 6, carbG: 0, fatG: 5 }

const show = (store: LogStore, extra = {}) =>
  render(<FoodLog store={store} loadFoods={() => Promise.resolve(localFinder(createSearchIndex([])))} today={TODAY} {...extra} />)
const meal = (name: string) => within(screen.getByRole('region', { name }))
const day = async (store: LogStore, date = TODAY) => (await store.listDay(date)).map((e) => `${e.meal} ${e.foodName} ${e.grams} ${e.kcal}`).sort()

describe('same as yesterday (T-160)', () => {
  it('1. one tap adds all of yesterday’s breakfast to today', async () => {
    const store = memoryLogStore([POHA, TEA])
    show(store)
    const button = await screen.findByRole('button', { name: 'Same as yesterday for Breakfast' })
    expect(meal('Breakfast').getByText('Poha, Tea · 275 calories')).toBeTruthy()
    fireEvent.click(button)
    await waitFor(async () => expect(await day(store)).toEqual(['breakfast Poha 150 195', 'breakfast Tea null 80']))
    expect(meal('Breakfast').getByText('Poha')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Same as yesterday for Breakfast' })).toBeNull()
    // Yesterday stays as it was, and the copy is not a plan tick.
    expect(await day(store, YESTERDAY)).toEqual(['breakfast Poha 150 195', 'breakfast Tea null 80'])
    expect((await store.listDay(TODAY)).every((e) => e.planItem === undefined)).toBe(true)
  })

  it('2. no offer for a meal that is empty yesterday or already logged today', async () => {
    const store = memoryLogStore([POHA, DAL, EGG])
    show(store)
    await screen.findByRole('button', { name: 'Same as yesterday for Breakfast' })
    expect(screen.getAllByRole('button', { name: /^Same as/ })).toHaveLength(1)
  })

  it('3. on an earlier day it offers the day before that', async () => {
    const store = memoryLogStore([{ ...DAL, loggedOn: '2026-10-12' }])
    show(store)
    fireEvent.click(await screen.findByRole('button', { name: 'Previous day' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Same as the day before for Lunch' }))
    await waitFor(async () => expect(await day(store, YESTERDAY)).toEqual(['lunch Dal 200 220']))
  })

  it('4. it is offered with a meal plan too', async () => {
    const picks = PROTEIN_PICKS.filter((p) => p.key === 'paneer').flatMap((p) => p.foods)
    const plan = buildMealPlan({ targets: { kcal: 2400, proteinG: 130, fatG: 67, carbG: 319 }, weightKg: 70, base: [], picks, foods: planFoodsFor(excludedTags('veg')) })
    const mealPlans = memoryMealPlanStore('me')
    await mealPlans.save(plan, picks)
    const store = memoryLogStore([DAL])
    show(store, { diet: { dietPref: 'veg', foodRules: [], allergies: [] }, mealPlans, userId: 'me' })
    await screen.findByRole('button', { name: 'Change plan' })
    fireEvent.click(await screen.findByRole('button', { name: 'Same as yesterday for Lunch' }))
    await waitFor(async () => expect(await day(store)).toEqual(['lunch Dal 200 220']))
  })
})
