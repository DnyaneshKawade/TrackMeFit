// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { FoodLog } from './FoodLog'
import { memoryLogStore } from './memoryStore'
import { offlineLogStore } from './offlineStore'
import { createSearchIndex } from '../food/search'
import { localFinder } from '../food/finder'
import type { Food } from '../food/types'
import type { LogStore } from './types'
import { memoryCustomFoodStore } from '../food/custom'

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
const loadFoods = () => Promise.resolve(localFinder(createSearchIndex(foods)))
const TODAY = '2026-10-12'

function setup(store: LogStore = memoryLogStore()) {
  render(<FoodLog store={store} loadFoods={loadFoods} today={TODAY} />)
  return store
}

async function addFood(meal: string, query: string, pick: string) {
  const section = await screen.findByRole('region', { name: meal })
  fireEvent.click(within(section).getByRole('button', { name: /^Add food to/ }))
  fireEvent.change(await screen.findByLabelText('Search foods'), { target: { value: query } })
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

describe('faster logging', () => {
  const openAdd = async (meal: string) => {
    const section = await screen.findByRole('region', { name: meal })
    fireEvent.click(within(section).getByRole('button', { name: /^Add food to/ }))
  }
  const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

  it('quick adds calories without a food or weight', async () => {
    const store = setup()
    await openAdd('Dinner')
    fireEvent.click(screen.getByRole('button', { name: 'Quick add' }))
    type('What was it? (optional)', 'Wedding buffet')
    fireEvent.click(screen.getByRole('button', { name: 'Add to Dinner' }))
    expect((await screen.findByRole('alert')).textContent).toMatch(/Calories should be/)
    type('Calories', '900')
    type('Protein (g)', '30')
    fireEvent.click(screen.getByRole('button', { name: 'Add to Dinner' }))
    const dinner = await screen.findByRole('region', { name: 'Dinner' })
    expect(within(dinner).getByText('Wedding buffet')).toBeTruthy()
    expect(within(dinner).getByText(/Quick add · 900 kcal · P 30/)).toBeTruthy()
    expect((await store.listDay(TODAY))[0]).toMatchObject({ foodId: 'quick', grams: null })
  })

  it('offers foods logged before, and adds one again with one tap', async () => {
    const store = memoryLogStore([
      { id: 'a', loggedOn: '2026-10-10', meal: 'breakfast', foodId: 'tmf:dish:dal-tadka', foodName: 'Dal tadka', grams: 150, kcal: 180, proteinG: 9, carbG: 22.5, fatG: 6 },
      { id: 'b', loggedOn: '2026-10-11', meal: 'snacks', foodId: 'quick', foodName: 'Vada pav', grams: null, kcal: 300, proteinG: 0, carbG: 0, fatG: 0 },
    ])
    setup(store)
    await openAdd('Lunch')
    const recent = await screen.findByRole('region', { name: 'Recent' })
    expect(within(recent).getByText('Vada pav')).toBeTruthy()
    fireEvent.click(within(recent).getByRole('button', { name: 'Add Dal tadka again' }))
    const lunch = await screen.findByRole('region', { name: 'Lunch' })
    expect(within(lunch).getByText(/150 g · 180 kcal/)).toBeTruthy()
    expect((await store.listDay(TODAY))[0]).toMatchObject({ meal: 'lunch', foodId: 'tmf:dish:dal-tadka' })
  })

  it('opens a recent food to change the amount', async () => {
    setup(memoryLogStore([
      { id: 'a', loggedOn: '2026-10-10', meal: 'breakfast', foodId: 'tmf:dish:dal-tadka', foodName: 'Dal tadka', grams: 150, kcal: 180, proteinG: 9, carbG: 22.5, fatG: 6 },
    ]))
    await openAdd('Lunch')
    const recent = await screen.findByRole('region', { name: 'Recent' })
    fireEvent.click(await within(recent).findByRole('button', { name: /^Dal tadka/ }))
    expect(screen.getByLabelText('Amount')).toBeTruthy()
  })

  it('creates a food from a per-serving label, logs it, and finds it in search next time', async () => {
    const foods = memoryCustomFoodStore()
    render(<FoodLog store={memoryLogStore()} loadFoods={loadFoods} foods={foods} today={TODAY} />)
    await openAdd('Snacks')
    type('Search foods', 'chikki')
    fireEvent.click(await screen.findByRole('button', { name: 'Add “chikki” as a new food' }))
    // The form loads when first opened.
    expect(((await screen.findByLabelText('Name')) as HTMLInputElement).value).toBe('chikki')
    fireEvent.click(screen.getByLabelText('One serving'))
    type('Serving size (g)', '25')
    type('Serving name (optional)', '1 piece')
    type('Calories per serving', '120')
    type('Protein (g)', '3')
    type('Carbs (g)', '15')
    type('Fat (g)', '5.5')
    fireEvent.click(screen.getByRole('button', { name: 'Save and log it' }))

    // Opens on the new food's own serving.
    expect(await screen.findByRole('heading', { name: 'chikki' })).toBeTruthy()
    expect(screen.getByRole('option', { name: '1 piece' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add to Snacks' }))
    const snacks = await screen.findByRole('region', { name: 'Snacks' })
    expect(within(snacks).getByText(/25 g · 120 kcal/)).toBeTruthy()
    expect((await foods.list())[0]).toMatchObject({ name: 'chikki', per100g: { kcal: 480, proteinG: 12, carbG: 60, fatG: 22 } })

    fireEvent.click(within(snacks).getByRole('button', { name: /^Add food to/ }))
    type('Search foods', 'chik')
    expect(await screen.findByText(/480 kcal per 100 g · My food/)).toBeTruthy()
  })

  it('asks before saving a label whose numbers don’t add up', async () => {
    const foods = memoryCustomFoodStore()
    render(<FoodLog store={memoryLogStore()} loadFoods={loadFoods} foods={foods} today={TODAY} />)
    await openAdd('Snacks')
    fireEvent.click(screen.getByRole('button', { name: 'New food' }))
    await screen.findByLabelText('Name')
    type('Name', 'Odd bar')
    type('Calories per 100 g', '100')
    type('Protein (g)', '20')
    type('Carbs (g)', '20')
    type('Fat (g)', '10')
    fireEvent.click(screen.getByRole('button', { name: 'Save and log it' }))
    expect((await screen.findByRole('status')).textContent).toMatch(/don’t match/)
    expect(await foods.list()).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Save and log it' }))
    expect(await screen.findByRole('heading', { name: 'Odd bar' })).toBeTruthy()
  })

  it('builds a recipe from ingredients and the cooked weight', async () => {
    const foods = memoryCustomFoodStore()
    render(<FoodLog store={memoryLogStore()} loadFoods={loadFoods} foods={foods} today={TODAY} />)
    await openAdd('Breakfast')
    fireEvent.click(screen.getByRole('button', { name: 'New recipe' }))
    await screen.findByLabelText('Recipe name')
    type('Recipe name', 'Atta dosa')
    type('Add an ingredient', 'atta')
    fireEvent.click(await screen.findByRole('button', { name: /^Atta/ }))
    type('Atta (whole wheat flour) grams', '200')
    type('Cooked weight (g, optional)', '500')
    type('Servings (optional)', '4')
    expect(screen.getByLabelText('Recipe values').textContent).toMatch(/136 kcal and 5.2 g protein per 100 g; one serving is 125 g/)
    fireEvent.click(screen.getByRole('button', { name: 'Save and log it' }))
    expect(await screen.findByRole('heading', { name: 'Atta dosa' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Add to Breakfast' }))
    const breakfast = await screen.findByRole('region', { name: 'Breakfast' })
    expect(within(breakfast).getByText(/125 g · 170 kcal/)).toBeTruthy()
    expect((await foods.list())[0].recipe).toEqual({ ingredients: [{ foodId: 'usda:168893', name: 'Atta (whole wheat flour)', grams: 200 }], cookedWeightG: 500, servings: 4 })
  })

  it('deletes one of your foods after asking', async () => {
    const foods = memoryCustomFoodStore([{ name: 'Chikki', state: 'asSold', per100g: { kcal: 480, proteinG: 12, carbG: 60, fatG: 22 }, portions: [] }])
    render(<FoodLog store={memoryLogStore()} loadFoods={loadFoods} foods={foods} today={TODAY} />)
    await openAdd('Snacks')
    fireEvent.click(await screen.findByRole('button', { name: 'My foods' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete Chikki' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.queryByText('Chikki')).toBeNull())
    expect(await foods.list()).toHaveLength(0)
  })
})

/** The day once the meal plan has loaded into the meals (T-063). */
const planShown = async () => {
  await screen.findByRole('region', { name: 'Your meal plan' })
  return screen.getByRole('main')
}

describe('veg days (T-058c)', () => {
  const CHICKEN: Food = {
    id: 'tmf:dish:chicken-curry',
    name: 'Chicken curry',
    state: 'cooked',
    per100g: { kcal: 180, proteinG: 15, carbG: 4, fatG: 11 },
    portions: [{ label: '1 katori (150 g)', grams: 150 }],
    source: 'trackMeFit',
    tags: ['meat', 'onion_garlic'],
  }
  const TUESDAY = '2026-10-13'
  const diet = { dietPref: 'nonveg' as const, foodRules: ['nonveg_off:tue'], allergies: [] }
  const withPlan = async () => {
    const { buildMealPlan } = await import('../engine/mealPlan')
    const { PROTEIN_PICKS, planFoodsFor } = await import('../profile/planFoods')
    const { memoryMealPlanStore } = await import('../profile/mealPlanStore')
    const { excludedTags } = await import('../profile/dietRules')
    const picks = PROTEIN_PICKS.filter((p) => ['chicken', 'paneer'].includes(p.key)).flatMap((p) => p.foods)
    const plan = buildMealPlan({ targets: { kcal: 2400, proteinG: 130, fatG: 67, carbG: 319 }, weightKg: 80, base: [], picks, foods: planFoodsFor(excludedTags('nonveg')) })
    const store = memoryMealPlanStore()
    await store.save(plan, picks)
    return store
  }
  const show = (mealPlans?: Awaited<ReturnType<typeof withPlan>>, today = TUESDAY) =>
    render(
      <FoodLog store={memoryLogStore()} loadFoods={() => Promise.resolve(localFinder(createSearchIndex([...foods, CHICKEN])))} today={today} diet={diet} mealPlans={mealPlans} />,
    )
  afterEach(() => localStorage.clear())

  it('4, 5. shows the saved plan, with chicken swapped for a veg food on a non-veg-free weekday', async () => {
    show(await withPlan())
    expect(screen.getByRole('status', { name: 'Veg day' }).textContent).toMatch(/Tuesday is your non-veg-free day/)
    const plan = await planShown()
    expect(plan.textContent).toMatch(/veg today/)
    expect(plan.textContent).not.toMatch(/Chicken/)
    // Paneer is already at its daily limit, so dal comes next.
    expect(plan.textContent).toMatch(/so chicken is swapped for toor dal/)
  })

  it('4, 7. shows the usual plan on other days, and the person can make any day a veg day', async () => {
    show(await withPlan(), '2026-10-14')
    const plan = await planShown()
    expect(plan.textContent).toMatch(/Chicken/)
    fireEvent.click(screen.getByRole('button', { name: 'Make today a veg day' }))
    expect(screen.getByRole('status', { name: 'Veg day' }).textContent).toMatch(/You made today a veg day/)
    await waitFor(() => expect(screen.getByRole('main').textContent).not.toMatch(/Chicken/))
    fireEvent.click(screen.getByRole('button', { name: 'Not a veg day' }))
    await waitFor(() => expect(screen.getByRole('main').textContent).toMatch(/Chicken/))
  })

  it('6. mentions the veg day when logging chicken, and still lets the person log it', async () => {
    show()
    await addFood('Dinner', 'chicken', 'Chicken curry')
    expect(screen.getByRole('note', { name: 'Non-veg-free day' }).textContent).toMatch(/Tuesday is your non-veg-free day.*Paneer, dal or soya would fit instead/)
    fireEvent.click(screen.getByRole('button', { name: 'Add to Dinner' }))
    const dinner = await screen.findByRole('region', { name: 'Dinner' })
    expect(within(dinner).getByText('Chicken curry')).toBeTruthy()
  })

  it('6. says nothing extra when logging a veg food', async () => {
    show()
    await addFood('Lunch', 'yellow', 'Dal tadka')
    expect(screen.queryByRole('note', { name: 'Non-veg-free day' })).toBeNull()
  })

  it('7. “I’m eating non-veg today” brings back the usual plan for that date only', async () => {
    show(await withPlan())
    fireEvent.click(screen.getByRole('button', { name: 'I’m eating non-veg today' }))
    expect(screen.getByRole('status', { name: 'Veg day' }).textContent).toMatch(/you’re eating non-veg today/)
    await waitFor(() => expect(screen.getByRole('main').textContent).toMatch(/Chicken/))
    cleanup()
    show(await withPlan())
    expect(screen.getByRole('button', { name: 'Make it a veg day again' })).toBeTruthy()
    cleanup()
    show(undefined, '2026-10-20') // the next Tuesday is a veg day again
    expect(screen.getByRole('button', { name: 'I’m eating non-veg today' })).toBeTruthy()
  })

  it('shows no veg-day line for vegetarians', () => {
    render(<FoodLog store={memoryLogStore()} loadFoods={loadFoods} today={TUESDAY} diet={{ dietPref: 'veg', foodRules: [], allergies: [] }} />)
    expect(screen.queryByRole('status', { name: 'Veg day' })).toBeNull()
  })
})

describe('offline logging (T-027)', () => {
  function offlineSetup() {
    const inner = memoryLogStore()
    const net = { online: true }
    const offline = () => Promise.reject(new TypeError('Failed to fetch'))
    const server: LogStore = {
      listDay: (d) => (net.online ? inner.listDay(d) : offline()),
      recent: () => (net.online ? inner.recent() : offline()),
      add: (e, id) => (net.online ? inner.add(e, id) : offline()),
      remove: (id) => (net.online ? inner.remove(id) : offline()),
    }
    const data = new Map<string, string>()
    const storage = { get: (k: string) => data.get(k) ?? null, set: (k: string, v: string) => void data.set(k, v), remove: (k: string) => void data.delete(k) }
    const store = offlineLogStore(server, { storage, accountId: 'me' })
    setup(store)
    return { inner, net, store }
  }

  it('1, 2. an entry added offline shows at once as not synced, and syncs when back online', async () => {
    const { inner, net, store } = offlineSetup()
    await screen.findByRole('region', { name: 'Lunch' })
    net.online = false
    await addFood('Lunch', 'yellow', 'Dal tadka')
    fireEvent.click(screen.getByRole('button', { name: 'Add to Lunch' }))
    const lunch = await screen.findByRole('region', { name: 'Lunch' })
    expect(within(lunch).getByText('Dal tadka')).toBeTruthy()
    expect(within(lunch).getByText('Waiting for internet')).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Waiting for internet' }).textContent).toMatch(/1 entry saved on this phone/)
    net.online = true
    await store.sync!.run()
    await waitFor(() => expect(screen.queryByText('Waiting for internet')).toBeNull())
    expect(screen.queryByRole('status', { name: 'Waiting for internet' })).toBeNull()
    expect(await inner.listDay(TODAY)).toHaveLength(1)
  })

  it('4. removing an entry offline takes it off the day at once', async () => {
    const { net, inner } = offlineSetup()
    await addFood('Lunch', 'yellow', 'Dal tadka')
    fireEvent.click(screen.getByRole('button', { name: 'Add to Lunch' }))
    await screen.findByText('Dal tadka')
    net.online = false
    fireEvent.click(screen.getByRole('button', { name: 'Remove Dal tadka' }))
    await waitFor(() => expect(screen.queryByText('Dal tadka')).toBeNull())
    expect(screen.queryByRole('alert')).toBeNull()
    expect(await inner.listDay(TODAY)).toHaveLength(1)
  })
})

describe('new look on the Food tab (T-101c)', () => {
  it('3. shows how many days have food logged this week', async () => {
    const at = (id: string, loggedOn: string) => ({ id, loggedOn, meal: 'lunch' as const, foodId: 'x', foodName: 'Roti', grams: 40, kcal: 120, proteinG: 4, carbG: 23, fatG: 1, createdAt: loggedOn })
    const store = memoryLogStore([at('a', '2026-10-11'), at('b', TODAY), at('c', TODAY)])
    setup(store)
    expect((await screen.findByRole('status', { name: 'This week' })).textContent).toBe('1 of 7 days logged this week.')
  })

  it('4. says nothing about the week before any food is logged', async () => {
    setup()
    await screen.findByRole('region', { name: 'Breakfast' })
    expect(screen.queryByRole('status', { name: 'This week' })).toBeNull()
  })
})
