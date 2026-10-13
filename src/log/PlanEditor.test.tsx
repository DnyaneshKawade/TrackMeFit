// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { FoodLog, type DietAnswers } from './FoodLog'
import { memoryLogStore } from './memoryStore'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import { buildMealPlan } from '../engine/mealPlan'
import { PROTEIN_PICKS, planFoodsFor } from '../profile/planFoods'
import { memoryMealPlanStore, type MealPlanStore } from '../profile/mealPlanStore'
import { excludedTags } from '../profile/dietRules'
import { memoryTargetStore } from '../targets/stores'
import type { DietTarget } from '../targets/types'
import type { Food } from '../food/types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const DAY = '2026-10-14'
const TARGET: DietTarget = { id: 't1', kcal: 2400, proteinG: 130, fatG: 67, carbG: 319, startsOn: '2026-10-01', source: 'manual', setBy: 'me' }
const veg = { dietPref: 'veg' as const, foodRules: [], allergies: [], currentDiet: { counts: { 'tmf:dish:roti': 4, 'tmf:dish:dal-tadka': 2 } }, medical: {} }

const POHA: Food = {
  id: 'tmf:dish:poha',
  name: 'Poha',
  state: 'cooked',
  per100g: { kcal: 130, proteinG: 2.5, carbG: 24, fatG: 3 },
  portions: [{ label: '1 plate (150 g)', grams: 150 }],
  source: 'trackMeFit',
  tags: ['onion_garlic'],
}
const CHICKEN: Food = {
  id: 'tmf:dish:chicken-curry',
  name: 'Chicken curry',
  state: 'cooked',
  per100g: { kcal: 180, proteinG: 15, carbG: 4, fatG: 11 },
  portions: [{ label: '1 katori (150 g)', grams: 150 }],
  source: 'trackMeFit',
  tags: ['meat', 'onion_garlic'],
}

/** "+ Add a food" in a plan meal, then the full Add food search (T-061b). */
async function addFound(meal: string, query: string, name: string) {
  const region = within(screen.getByRole('region', { name: 'Change your meal plan' })).getByRole('region', { name: meal })
  fireEvent.click(within(region).getByRole('button', { name: '+ Add a food' }))
  const sheet = await screen.findByRole('region', { name: `Add food to ${meal} in your plan` })
  fireEvent.change(within(sheet).getByLabelText('Search foods'), { target: { value: query } })
  fireEvent.click(await within(sheet).findByRole('button', { name: new RegExp(`^${name}`) }))
  fireEvent.click(await within(sheet).findByRole('button', { name: `Add to ${meal} in your plan` }))
  await screen.findByRole('region', { name: 'Change your meal plan' })
}

async function setup(opts: { plan?: boolean; diet?: DietAnswers; weight?: number | null; target?: boolean; mealPlans?: MealPlanStore } = {}) {
  const mealPlans = opts.mealPlans ?? memoryMealPlanStore()
  const picks = PROTEIN_PICKS.filter((p) => ['paneer', 'dal'].includes(p.key)).flatMap((p) => p.foods)
  const plan = buildMealPlan({ targets: TARGET, weightKg: 70, base: [], picks, foods: planFoodsFor(excludedTags('veg')) })
  if (opts.plan !== false) await mealPlans.save(plan, picks)
  const weight = opts.weight === undefined ? 70 : opts.weight
  render(
    <FoodLog
      store={memoryLogStore()}
      loadFoods={() => Promise.resolve(localFinder(createSearchIndex([POHA, CHICKEN])))}
      today={DAY}
      diet={opts.diet ?? veg}
      mealPlans={mealPlans}
      targets={memoryTargetStore('me', opts.target === false ? [] : [TARGET])}
      userId="me"
      latestWeight={() => Promise.resolve(weight)}
    />,
  )
  return { plan, mealPlans }
}
const openEditor = async () => {
  fireEvent.click(await screen.findByRole('button', { name: 'Change plan' }))
  return screen.findByRole('region', { name: 'Change your meal plan' })
}
const check = () => screen.getByRole('status', { name: 'Plan check' }).textContent!

describe('change the meal plan (T-061)', () => {
  it('1, 2. changes an amount, swaps, removes and adds, with the check updating each time', async () => {
    const { plan } = await setup()
    const editor = await openEditor()
    const lunch = within(editor).getByRole('region', { name: 'Lunch' })
    const first = plan.meals.find((m) => m.name === 'Lunch')!.items[0]
    const before = check()
    expect(before).toMatch(/The day comes to about .* kcal and \d+ g protein\. /)

    const grams = within(lunch).getByLabelText(`${first.name} grams at Lunch`)
    fireEvent.change(grams, { target: { value: String(first.grams * 2) } })
    fireEvent.blur(grams)
    await waitFor(() => expect(check()).not.toBe(before))
    expect(within(lunch).getAllByText(/You changed this\./).length).toBe(1)

    const items = () => within(lunch).getAllByRole('listitem').length
    const n = items()
    fireEvent.click(within(lunch).getByRole('button', { name: `Remove ${first.name} from Lunch` }))
    expect(items()).toBe(n - 1)
    await addFound('Lunch', 'poha', 'Poha')
    const after = within(screen.getByRole('region', { name: 'Change your meal plan' })).getByRole('region', { name: 'Lunch' })
    expect(within(after).getAllByRole('listitem')).toHaveLength(n)
    expect(within(after).getByLabelText('Poha grams at Lunch')).toHaveProperty('value', '150')

    const lunchNow = () => within(screen.getByRole('region', { name: 'Change your meal plan' })).getByRole('region', { name: 'Lunch' })
    const swap = within(lunchNow()).queryAllByRole('combobox', { name: /^Swap / })[0] as HTMLSelectElement
    const from = swap.getAttribute('aria-label')!.replace(/^Swap (.*) at Lunch$/, '$1')
    fireEvent.change(swap, { target: { value: swap.options[1].value } })
    expect(within(lunchNow()).queryByLabelText(`${from} grams at Lunch`)).toBeNull()
  })

  it('2. the check says how far the plan is from the targets', async () => {
    await setup()
    const editor = await openEditor()
    const breakfast = within(editor).getByRole('region', { name: 'Breakfast' })
    while (within(breakfast).queryAllByRole('button', { name: /^Remove / }).length) fireEvent.click(within(breakfast).getAllByRole('button', { name: /^Remove / })[0])
    expect(check()).toMatch(/This plan has [\d,]+ kcal less than your target\./)
  })

  it('3. "Save plan" saves the changes and the Food tab shows them; "Cancel" keeps the old plan', async () => {
    const { plan, mealPlans } = await setup()
    const editor = await openEditor()
    const snack = plan.meals.find((m) => m.name === 'Snack')!.items[0]
    fireEvent.click(within(within(editor).getByRole('region', { name: 'Snack' })).getByRole('button', { name: `Remove ${snack.name} from Snack` }))
    fireEvent.click(within(editor).getByRole('button', { name: 'Cancel' }))
    await screen.findByRole('region', { name: 'Your meal plan' })
    expect((await mealPlans.latest())!.plan).toEqual(plan)

    await openEditor()
    await addFound('Lunch', 'poha', 'Poha')
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }))
    await screen.findByRole('region', { name: 'Your meal plan' })
    const saved = (await mealPlans.latest())!.plan
    expect(saved.meals.find((m) => m.name === 'Lunch')!.items.find((i) => i.foodId === POHA.id)).toMatchObject({ grams: 150, weighed: 'as eaten' })
    expect(within(screen.getByRole('region', { name: 'Lunch' })).getAllByRole('checkbox', { name: 'Ate Poha' }).length).toBe(1)
  })

  it('3. a failed save keeps the editor open with the changes', async () => {
    const store = memoryMealPlanStore()
    let fail = false
    const flaky: MealPlanStore = { latest: store.latest, save: (p, k) => (fail ? Promise.reject(new TypeError('Failed to fetch')) : store.save(p, k)) }
    await setup({ mealPlans: flaky })
    await openEditor()
    fail = true
    await addFound('Lunch', 'poha', 'Poha')
    const editor = screen.getByRole('region', { name: 'Change your meal plan' })
    fireEvent.click(within(editor).getByRole('button', { name: 'Save plan' }))
    expect((await within(editor).findByRole('alert')).textContent).toBe('Couldn’t save the plan. Try again.')
    expect(within(editor).getByLabelText('Poha grams at Lunch')).toBeTruthy()
  })

  it('4. "Make a new plan" builds one from the picked protein foods, and "Use this plan" saves it', async () => {
    const { mealPlans } = await setup()
    const editor = await openEditor()
    fireEvent.click(within(editor).getByRole('button', { name: 'Make a new plan' }))
    const picks = await screen.findByRole('group', { name: 'Protein foods you like' })
    fireEvent.click(within(picks).getByRole('button', { name: /Soya/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Use this plan' }))
    await screen.findByRole('region', { name: 'Your meal plan' })
    const saved = (await mealPlans.latest())!
    expect(saved.picks.some((id) => id.includes('soya'))).toBe(true)
  })

  it('4. with no weight logged, a new plan asks for today’s weight first', async () => {
    await setup({ plan: false, weight: null })
    fireEvent.click(await screen.findByRole('button', { name: 'Make a meal plan' }))
    const weight = await screen.findByLabelText('Your weight today (kg)')
    fireEvent.change(weight, { target: { value: '68' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('group', { name: 'Protein foods you like' })).toBeTruthy()
  })

  it('5. with no plan, the Food tab offers "Make a meal plan" once targets are set', async () => {
    await setup({ plan: false })
    expect(await screen.findByRole('button', { name: 'Make a meal plan' })).toBeTruthy()
    cleanup()
    await setup({ plan: false, target: false })
    await screen.findByRole('button', { name: 'Set your daily targets' })
    expect(screen.queryByRole('button', { name: 'Make a meal plan' })).toBeNull()
  })

  it('6. a health answer stops an automatic plan, but the current plan can still be changed by hand', async () => {
    await setup({ diet: { ...veg, medical: { eatingDisorder: true } } })
    const editor = await openEditor()
    expect(within(editor).getByRole('region', { name: 'Lunch' })).toBeTruthy()
    fireEvent.click(within(editor).getByRole('button', { name: 'Make a new plan' }))
    expect((await screen.findByText(/we don’t make an automatic meal plan/)).textContent).toMatch(/coach or your doctor/)
  })

  it('7 (T-061b). "Add a food" searches every food; amounts scale and a veg day swaps a non-veg dish', async () => {
    const nonveg = { ...veg, dietPref: 'nonveg' as const, foodRules: ['nonveg_off:tue'] }
    const { mealPlans } = await setup({ diet: nonveg })
    await openEditor()
    const sheetOpen = within(screen.getByRole('region', { name: 'Change your meal plan' })).getByRole('region', { name: 'Dinner' })
    fireEvent.click(within(sheetOpen).getByRole('button', { name: '+ Add a food' }))
    const sheet = await screen.findByRole('region', { name: 'Add food to Dinner in your plan' })
    // Plans need an amount, so there is no calories-only quick add here.
    expect(within(sheet).queryByRole('button', { name: 'Quick add' })).toBeNull()
    fireEvent.click(within(sheet).getByRole('button', { name: 'Close' }))
    await addFound('Dinner', 'chicken', 'Chicken curry')
    const grams = screen.getByLabelText('Chicken curry grams at Dinner')
    fireEvent.change(grams, { target: { value: '300' } })
    fireEvent.blur(grams)
    fireEvent.click(screen.getByRole('button', { name: 'Save plan' }))
    await screen.findByRole('region', { name: 'Your meal plan' })
    const item = (await mealPlans.latest())!.plan.meals.find((m) => m.name === 'Dinner')!.items.find((i) => i.foodId === CHICKEN.id)!
    expect(item).toMatchObject({ grams: 300, tags: ['meat', 'onion_garlic'] })
    expect(Math.round(item.macros.kcal)).toBe(540)
    // On the non-veg-free Tuesday it is swapped like the plan's own chicken.
    cleanup()
    render(
      <FoodLog
        store={memoryLogStore()}
        loadFoods={() => Promise.resolve(localFinder(createSearchIndex([POHA, CHICKEN])))}
        today="2026-10-13"
        diet={nonveg}
        mealPlans={mealPlans}
      />,
    )
    const dinner = await screen.findByRole('region', { name: 'Dinner' })
    await screen.findByRole('region', { name: 'Your meal plan' })
    expect(within(dinner).queryByText('Chicken curry')).toBeNull()
  })
})
