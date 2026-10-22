// @vitest-environment jsdom
// Change the amount of a logged food, or copy it to another meal (spec T-134).
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { FoodLog } from './FoodLog'
import { memoryLogStore } from './memoryStore'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import { buildMealPlan, copyItem } from '../engine/mealPlan'
import { PROTEIN_PICKS, planFoodsFor } from '../profile/planFoods'
import { memoryMealPlanStore } from '../profile/mealPlanStore'
import { excludedTags } from '../profile/dietRules'
import type { LogEntry, LogStore } from './types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const DAY = '2026-10-14'
const POHA: LogEntry = { id: 'e1', loggedOn: DAY, meal: 'breakfast', foodId: 'tmf:dish:poha', foodName: 'Poha', grams: 150, kcal: 195, proteinG: 3.8, carbG: 36, fatG: 4.5 }
const QUICK: LogEntry = { id: 'e2', loggedOn: DAY, meal: 'snacks', foodId: 'quick-add', foodName: 'Tea', grams: null, kcal: 80, proteinG: 2, carbG: 10, fatG: 3 }

const show = (store: LogStore) =>
  render(<FoodLog store={store} loadFoods={() => Promise.resolve(localFinder(createSearchIndex([])))} today={DAY} />)
const meal = (name: string) => screen.getByRole('region', { name })
const day = async (store: LogStore) => (await store.listDay(DAY)).map((e) => `${e.meal} ${e.foodName} ${e.grams} ${e.kcal}`).sort()

describe('change or copy a logged food (T-134)', () => {
  it('1. a new amount changes the calories, protein, carbs and fat to match', async () => {
    const store = memoryLogStore([POHA])
    show(store)
    fireEvent.click(await screen.findByRole('button', { name: 'Change Poha' }))
    const edit = screen.getByRole('group', { name: 'Change Poha' })
    fireEvent.change(within(edit).getByLabelText('Amount (g)'), { target: { value: '300' } })
    fireEvent.click(within(edit).getByRole('button', { name: 'Save' }))
    await waitFor(async () => expect(await day(store)).toEqual(['breakfast Poha 300 390']))
    const [e] = await store.listDay(DAY)
    expect(e).toMatchObject({ proteinG: 7.6, carbG: 72, fatG: 9 })
    expect(within(meal('Breakfast')).getByText('300 g · 390 calories · P 7.6 · C 72 · F 9')).toBeTruthy()
    expect(screen.queryByRole('group', { name: 'Change Poha' })).toBeNull()
  })

  it('2. "Copy to Lunch" adds the same food to lunch, and breakfast keeps it', async () => {
    const store = memoryLogStore([POHA])
    show(store)
    fireEvent.click(await screen.findByRole('button', { name: 'Change Poha' }))
    fireEvent.click(within(screen.getByRole('group', { name: 'Change Poha' })).getByRole('button', { name: 'Copy to Lunch' }))
    expect(await screen.findByText('Copied to Lunch.')).toBeTruthy()
    expect(await day(store)).toEqual(['breakfast Poha 150 195', 'lunch Poha 150 195'])
    expect(within(meal('Lunch')).getByText('Poha')).toBeTruthy()
  })

  it('3. a quick add has no amount to change, but can still be copied', async () => {
    const store = memoryLogStore([QUICK])
    show(store)
    fireEvent.click(await screen.findByRole('button', { name: 'Change Tea' }))
    const edit = screen.getByRole('group', { name: 'Change Tea' })
    expect(within(edit).queryByLabelText('Amount (g)')).toBeNull()
    expect(within(edit).getAllByRole('button').map((b) => b.textContent)).toEqual(['Breakfast', 'Lunch', 'Dinner'])
  })

  it('4. in the meal plan, "Copy to" puts the same food and amount in another meal', async () => {
    const picks = PROTEIN_PICKS.filter((p) => p.key === 'paneer').flatMap((p) => p.foods)
    const plan = buildMealPlan({ targets: { kcal: 2400, proteinG: 130, fatG: 67, carbG: 319 }, weightKg: 70, base: [], picks, foods: planFoodsFor(excludedTags('veg')) })
    const first = plan.meals[0]
    const copied = copyItem(plan, first.name, 0, 'Dinner')
    const dinner = copied.meals.find((m) => m.name === 'Dinner')!
    expect(dinner.items.at(-1)).toMatchObject({ foodId: first.items[0].foodId, grams: first.items[0].grams, reason: `You copied this from ${first.name}.` })
    expect(copied.meals[0].items).toHaveLength(first.items.length)
    expect(copied.totals.kcal).toBeGreaterThan(plan.totals.kcal)

    const mealPlans = memoryMealPlanStore('me')
    await mealPlans.save(plan, picks)
    render(<FoodLog store={memoryLogStore()} loadFoods={() => Promise.resolve(localFinder(createSearchIndex([])))} today={DAY} diet={{ dietPref: 'veg', foodRules: [], allergies: [] }} mealPlans={mealPlans} userId="me" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Change plan' }))
    const editor = await screen.findByRole('region', { name: 'Change your meal plan' })
    const before = within(within(editor).getByRole('region', { name: 'Dinner' })).getAllByRole('listitem').length
    const name = first.items[0].name
    fireEvent.change(within(within(editor).getByRole('region', { name: first.name })).getAllByLabelText(`Copy ${name} to another meal`)[0], { target: { value: 'Dinner' } })
    expect(within(within(editor).getByRole('region', { name: 'Dinner' })).getAllByRole('listitem')).toHaveLength(before + 1)
  })
})
