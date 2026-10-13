// @vitest-environment jsdom
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

const TUESDAY = '2026-10-13'
const WEDNESDAY = '2026-10-14'
const diet = { dietPref: 'nonveg' as const, foodRules: ['nonveg_off:tue'], allergies: [] }

async function setup(opts: { today?: string; store?: LogStore; entries?: LogEntry[] } = {}) {
  const picks = PROTEIN_PICKS.filter((p) => ['chicken', 'paneer'].includes(p.key)).flatMap((p) => p.foods)
  const plan = buildMealPlan({ targets: { kcal: 2400, proteinG: 130, fatG: 67, carbG: 319 }, weightKg: 80, base: [], picks, foods: planFoodsFor(excludedTags('nonveg')) })
  const mealPlans = memoryMealPlanStore()
  await mealPlans.save(plan, picks)
  const store = opts.store ?? memoryLogStore(opts.entries)
  render(<FoodLog store={store} loadFoods={() => Promise.resolve(localFinder(createSearchIndex([])))} today={opts.today ?? WEDNESDAY} diet={diet} mealPlans={mealPlans} />)
  const box = await screen.findByRole('group', { name: 'Your meal plan' })
  // Ticks are ready once the day has loaded.
  await waitFor(() => expect((within(box).getByRole('checkbox', { name: 'Ate the whole plan' }) as HTMLInputElement).disabled).toBe(false))
  return { plan, store, box }
}
const checkbox = (box: HTMLElement, name: string) => within(box).getByRole('checkbox', { name }) as HTMLInputElement
const meal = (name: string) => screen.getByRole('region', { name })
const logged = async (store: LogStore, date = WEDNESDAY) => (await store.listDay(date)).map((e) => e.foodName)

describe('tick off the meal plan (T-060)', () => {
  it('1. each item, meal and the whole plan has a tick box, all unticked at first', async () => {
    const { plan, box } = await setup()
    expect(checkbox(box, 'Ate the whole plan').checked).toBe(false)
    for (const m of plan.meals) {
      expect(checkbox(box, `Ate all of ${m.name}`).checked).toBe(false)
      for (const i of m.items) expect(within(box).getAllByRole('checkbox', { name: `Ate ${i.name}` }).length).toBeGreaterThan(0)
    }
  })

  it('2. ticking an item logs the planned amount under the matching meal', async () => {
    const { plan, store, box } = await setup()
    const snack = plan.meals.find((m) => m.name === 'Snack')!
    const item = snack.items[0]
    fireEvent.click(within(within(box).getByRole('region', { name: 'Plan Snack' })).getAllByRole('checkbox', { name: `Ate ${item.name}` })[0])
    await waitFor(async () => expect(await logged(store)).toEqual([item.name]))
    const [e] = await store.listDay(WEDNESDAY)
    expect(e).toMatchObject({ meal: 'snacks', grams: Math.round(item.grams), kcal: Math.round(item.macros.kcal) })
    expect(within(meal('Snacks')).getByText(item.name)).toBeTruthy()
    await waitFor(() => expect(within(within(box).getByRole('region', { name: 'Plan Snack' })).getAllByRole('checkbox', { name: `Ate ${item.name}` })[0]).toHaveProperty('checked', true))
  })

  it('3. unticking removes only the entry the tick made, never one added by hand', async () => {
    const { plan, store, box } = await setup()
    const item = plan.meals[0].items[0]
    // The same food, added by hand.
    await store.add({ loggedOn: WEDNESDAY, meal: 'breakfast', foodId: item.foodId, foodName: item.name, grams: 50, kcal: 50, proteinG: 1, carbG: 1, fatG: 1 })
    const tick = () => within(within(box).getByRole('region', { name: `Plan ${plan.meals[0].name}` })).getAllByRole('checkbox', { name: `Ate ${item.name}` })[0]
    fireEvent.click(tick())
    await waitFor(async () => expect((await store.listDay(WEDNESDAY)).length).toBe(2))
    await waitFor(() => expect((tick() as HTMLInputElement).checked).toBe(true))
    fireEvent.click(tick())
    await waitFor(async () => expect((await store.listDay(WEDNESDAY)).map((e) => e.grams)).toEqual([50]))
  })

  it('4. ticking a meal logs its items; it shows part-ticked when some are', async () => {
    const { plan, store, box } = await setup()
    const lunch = plan.meals.find((m) => m.name === 'Lunch')!
    const region = within(box).getByRole('region', { name: 'Plan Lunch' })
    fireEvent.click(within(region).getAllByRole('checkbox', { name: `Ate ${lunch.items[0].name}` })[0])
    await waitFor(() => expect(checkbox(box, 'Ate all of Lunch').indeterminate).toBe(true))
    fireEvent.click(checkbox(box, 'Ate all of Lunch'))
    await waitFor(() => expect(checkbox(box, 'Ate all of Lunch').checked).toBe(true))
    // No doubles: the first item was logged once.
    expect((await store.listDay(WEDNESDAY)).length).toBe(lunch.items.length)
    fireEvent.click(checkbox(box, 'Ate all of Lunch'))
    await waitFor(async () => expect(await logged(store)).toEqual([]))
  })

  it('5. "Ate the whole plan" logs every item, and unticking it removes them', async () => {
    const { plan, store, box } = await setup()
    const all = plan.meals.flatMap((m) => m.items)
    fireEvent.click(checkbox(box, 'Ate the whole plan'))
    await waitFor(async () => expect((await store.listDay(WEDNESDAY)).length).toBe(all.length))
    await waitFor(() => expect(checkbox(box, 'Ate the whole plan').checked).toBe(true))
    expect(box.textContent).toMatch(new RegExp(`${all.length} of ${all.length} eaten`))
    fireEvent.click(checkbox(box, 'Ate the whole plan'))
    await waitFor(async () => expect(await logged(store)).toEqual([]))
  })

  it('6. changing the amount of a ticked item keeps it ticked with the new calories', async () => {
    const { plan, store, box } = await setup()
    const item = plan.meals[0].items[0]
    const region = within(box).getByRole('region', { name: `Plan ${plan.meals[0].name}` })
    fireEvent.click(within(region).getAllByRole('checkbox', { name: `Ate ${item.name}` })[0])
    fireEvent.click(await within(region).findByRole('button', { name: `Change amount of ${item.name}` }))
    const half = Math.round(item.grams / 2)
    fireEvent.change(within(region).getByLabelText(`${item.name} amount eaten (g)`), { target: { value: String(half) } })
    fireEvent.click(within(region).getByRole('button', { name: 'Save' }))
    await waitFor(async () => expect((await store.listDay(WEDNESDAY)).map((e) => e.grams)).toEqual([half]))
    const [e] = await store.listDay(WEDNESDAY)
    expect(e.kcal).toBe(Math.round(Math.round(item.macros.kcal) * (half / Math.round(item.grams))))
    await waitFor(() => expect((within(region).getAllByRole('checkbox', { name: `Ate ${item.name}` })[0] as HTMLInputElement).checked).toBe(true))
  })

  it('7. on a veg day the ticks log the veg items, not chicken', async () => {
    const { store, box } = await setup({ today: TUESDAY })
    fireEvent.click(checkbox(box, 'Ate the whole plan'))
    await waitFor(() => expect(checkbox(box, 'Ate the whole plan').checked).toBe(true))
    const names = await logged(store, TUESDAY)
    expect(names.length).toBeGreaterThan(0)
    expect(names.join(' ')).not.toMatch(/Chicken/)
  })

  it('9. ticks show again after reload from what was logged, for that date only', async () => {
    const first = await setup()
    fireEvent.click(checkbox(first.box, 'Ate all of Breakfast'))
    await waitFor(() => expect(checkbox(first.box, 'Ate all of Breakfast').checked).toBe(true))
    const entries = await first.store.listDay(WEDNESDAY)
    cleanup()
    const again = await setup({ entries })
    expect(checkbox(again.box, 'Ate all of Breakfast').checked).toBe(true)
    cleanup()
    // Another day starts unticked: nothing is logged ahead.
    const other = await setup({ entries, today: '2026-10-15' })
    expect(checkbox(other.box, 'Ate all of Breakfast').checked).toBe(false)
  })
})
