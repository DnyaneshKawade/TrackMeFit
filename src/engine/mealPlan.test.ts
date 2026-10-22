import { describe, expect, it } from 'vitest'
import { MAX_PROTEIN_PER_MEAL_KG, SUGAR_MAX_G, VEG_G, amountHint, buildMealPlan, checkFeasibility, cookedGrams, swapItem, swapOptions, vegDayPlan, addItem, addFoundItem, planCheck, removeItem, setItemGrams, tidyPlan, MAX_PLAN_GRAMS, type MealPlan, type MealPlanInput } from './mealPlan'
import { PLAN_FOODS_BY_ID, PROTEIN_PICKS, planFoodsFor, typicalDayToBase } from '../profile/planFoods'
import { excludedTags } from '../profile/dietRules'
import { dailyTargets } from './nutrients'

const picks = (...keys: string[]) => PROTEIN_PICKS.filter((p) => keys.includes(p.key)).flatMap((p) => p.foods)
const USUAL_VEG_DAY = { 'tmf:dish:roti': 4, 'tmf:dish:dal-tadka': 2, 'tmf:dish:steamed-rice': 1, 'usda:170886': 1, 'tmf:dish:chai': 2, 'tmf:dish:aloo-gobi': 1 }

// Asha: vegetarian, 70 kg, 2,200 calories and 112 g protein (1.6 g/kg).
const asha: MealPlanInput = {
  targets: { kcal: 2200, proteinG: 112, fatG: 61, carbG: 300 },
  weightKg: 70,
  base: typicalDayToBase(USUAL_VEG_DAY),
  picks: picks('paneer', 'soya', 'dal', 'curd'),
  foods: planFoodsFor(excludedTags('veg')),
}

const items = (p: MealPlan) => p.meals.flatMap((m) => m.items.map((i) => ({ ...i, meal: m.name })))
const dayGrams = (p: MealPlan, id: string) => items(p).filter((i) => i.foodId === id).reduce((s, i) => s + i.grams, 0)

describe('meal plan (T-058)', () => {
  const plan = buildMealPlan(asha)

  it('3. keeps the usual day’s foods and adds picked protein foods', () => {
    for (const id of ['tmf:ing:atta', 'tmf:ing:rice', 'tmf:ing:toor-dal', 'tmf:ing:curd', 'tmf:ing:milk']) expect(dayGrams(plan, id), id).toBeGreaterThan(0)
    expect(items(plan).filter((i) => i.reason.startsWith('Added for protein')).length).toBeGreaterThan(0)
    expect(items(plan).every((i) => asha.foods.some((f) => f.id === i.foodId))).toBe(true)
  })

  it('4. gives every amount in grams, raw or dry by default, with a cooked or piece hint', () => {
    for (const i of items(plan)) {
      expect(Number.isInteger(i.grams) && i.grams > 0).toBe(true)
      expect(['raw', 'dry', 'as sold']).toContain(i.weighed)
    }
    const rice = items(plan).find((i) => i.foodId === 'tmf:ing:rice')!
    expect(rice.weighed).toBe('raw')
    expect(rice.hint).toMatch(/^about [\d½]+ katori cooked rice$/)
    expect(amountHint(PLAN_FOODS_BY_ID.get('tmf:ing:atta')!, 90)).toBe('about 3 roti')
    expect(amountHint(PLAN_FOODS_BY_ID.get('tmf:ing:egg')!, 100)).toBe('about 2 eggs')
  })

  it('5. never goes over a food’s per-meal or per-day limit, and says when a limit was hit', () => {
    for (const i of items(plan)) expect(i.grams, `${i.name} at ${i.meal}`).toBeLessThanOrEqual(PLAN_FOODS_BY_ID.get(i.foodId)!.maxPerMealG)
    for (const f of asha.foods) expect(dayGrams(plan, f.id), f.name).toBeLessThanOrEqual(f.maxPerDayG)
    // Big amounts in the usual day don't carry over.
    const lots = buildMealPlan({ ...asha, base: [...asha.base, { foodId: 'tmf:ing:rice', grams: 500 }, { foodId: 'tmf:ing:soya-chunks', grams: 200 }] })
    expect(dayGrams(lots, 'tmf:ing:rice')).toBeLessThanOrEqual(150)
    expect(dayGrams(lots, 'tmf:ing:soya-chunks')).toBeLessThanOrEqual(50)
    const short = buildMealPlan({ ...asha, picks: picks('curd'), weightKg: 120, targets: { kcal: 3600, proteinG: 300, fatG: 100, carbG: 450 } })
    expect(short.notes.some((n) => /is kept to \d+ g .* a day. That is a fair amount for one food./.test(n))).toBe(true)
  })

  it('6. fills a protein gap with other allowed foods, says so, and says how much it can reach when still short', () => {
    // Curd alone can't reach 160 g: other veg protein foods come in, never whey.
    const hard = buildMealPlan({ ...asha, targets: { kcal: 2600, proteinG: 160, fatG: 70, carbG: 330 }, weightKg: 90, picks: picks('curd') })
    expect(items(hard).some((i) => i.reason === 'Added because your picks were not enough for your protein.')).toBe(true)
    expect(hard.notes.some((n) => /^Your picks were not enough for your protein\. So we added .+\. You can swap them\.$/.test(n))).toBe(true)
    expect(items(hard).some((i) => PLAN_FOODS_BY_ID.get(i.foodId)!.group === 'supplement')).toBe(false)
    expect(items(hard).every((i) => (PLAN_FOODS_BY_ID.get(i.foodId)!.tags ?? []).every((t) => !excludedTags('veg').has(t)))).toBe(true)
    // Too much protein for the calories: it says how much it reaches.
    const f = checkFeasibility({ ...asha, targets: { kcal: 1800, proteinG: 200, fatG: 50, carbG: 200 }, weightKg: 90, picks: picks('curd') })
    expect(f.feasible).toBe(false)
    expect(f.message).toMatch(new RegExp(`about ${f.reachableProteinG} g of your 200 g protein`))
    expect(f.suggestions.every((s) => s.tags.every((t) => !excludedTags('veg').has(t)))).toBe(true)
    expect(checkFeasibility(asha)).toMatchObject({ feasible: true, suggestions: [] })
  })

  it('7. lands within 8% of calories and 5 g of protein', () => {
    expect(plan.onTarget).toBe(true)
    expect(Math.abs(plan.totals.kcal - 2200)).toBeLessThanOrEqual(0.08 * 2200)
    expect(Math.abs(plan.totals.proteinG - 112)).toBeLessThanOrEqual(5)
  })

  it('8. spreads protein over at least 3 meals, none above 0.55 g/kg, each item with a reason', () => {
    const max = MAX_PROTEIN_PER_MEAL_KG * 70
    for (const m of plan.meals) expect(m.macros.proteinG, m.name).toBeLessThanOrEqual(max + 0.1)
    expect(plan.meals.filter((m) => m.macros.proteinG >= 0.2 * 70).length).toBeGreaterThanOrEqual(3)
    expect(items(plan).every((i) => i.reason.length > 0)).toBe(true)
  })

  it('9. uses only foods the day allows (a veg day for someone who eats chicken)', () => {
    const vegDay = buildMealPlan({ ...asha, picks: picks('chicken', 'eggs', 'paneer', 'dal'), foods: planFoodsFor(excludedTags('veg')) })
    expect(items(vegDay).some((i) => i.foodId === 'tmf:ing:chicken' || i.foodId === 'tmf:ing:egg')).toBe(false)
    const jain = buildMealPlan({ ...asha, foods: planFoodsFor(excludedTags('jain')) })
    expect(items(jain).every((i) => (PLAN_FOODS_BY_ID.get(i.foodId)!.tags ?? []).every((t) => !excludedTags('jain').has(t)))).toBe(true)
    const vegan = buildMealPlan({ ...asha, picks: picks('soya', 'tofu', 'dal', 'paneer'), foods: planFoodsFor(excludedTags('vegan')) })
    expect(items(vegan).some((i) => i.foodId === 'tmf:ing:paneer' || i.foodId === 'tmf:ing:curd')).toBe(false)
    expect(vegan.notes).toContain('Foods your diet leaves out were not carried into the plan.')
  })

  it('11. adds ICMR basics: 400 g vegetables, fruit, oil near 27 g per 2,000 calories, sugar at most 25 g', () => {
    expect(dayGrams(plan, 'tmf:ing:cauliflower')).toBeGreaterThanOrEqual(VEG_G)
    expect(items(plan).some((i) => PLAN_FOODS_BY_ID.get(i.foodId)!.group === 'fruit')).toBe(true)
    const fat = items(plan).filter((i) => PLAN_FOODS_BY_ID.get(i.foodId)!.group === 'fat').reduce((s, i) => s + i.grams, 0)
    expect(fat).toBeLessThanOrEqual(Math.round((27 * 2200) / 2000) + 8) // ghee from the usual day can add a little
    const sweet = buildMealPlan({ ...asha, base: typicalDayToBase({ ...USUAL_VEG_DAY, 'tmf:dish:chai': 6 }) })
    expect(dayGrams(sweet, 'tmf:ing:sugar')).toBeLessThanOrEqual(SUGAR_MAX_G)
  })

  it('12. pairs a cereal with dal, dairy or soya at lunch and dinner for vegetarians', () => {
    for (const name of ['Lunch', 'Dinner']) {
      const groups = plan.meals.find((m) => m.name === name)!.items.map((i) => PLAN_FOODS_BY_ID.get(i.foodId)!.group)
      expect(groups, name).toContain('cereal')
      expect(groups.some((g) => g === 'pulse' || g === 'dairy' || g === 'soy'), name).toBe(true)
    }
  })

  it('works for a non-vegetarian with no usual day, using eggs and chicken', () => {
    const p = buildMealPlan({ targets: dailyTargets({ kcal: 2400, weightKg: 80, heightCm: 178 }).values, weightKg: 80, base: [], picks: picks('eggs', 'chicken'), foods: planFoodsFor(excludedTags('nonveg')) })
    expect(p.onTarget).toBe(true)
    for (const m of p.meals) expect(m.macros.proteinG, m.name).toBeLessThanOrEqual(MAX_PROTEIN_PER_MEAL_KG * 80 + 0.1)
    expect(dayGrams(p, 'tmf:ing:chicken')).toBeGreaterThan(0)
    expect(dayGrams(p, 'tmf:ing:egg') % 50).toBe(0)
  })

  it('marks foods whose values are borrowed until we have an Indian label', () => {
    const paneer = items(plan).find((i) => i.foodId === 'tmf:ing:paneer')
    if (paneer) expect(paneer.reason).toMatch(/until we have an Indian label/)
    const soya = items(plan).find((i) => i.foodId === 'tmf:ing:soya-chunks')!
    expect(soya.reason).toMatch(/USDA defatted soy flour/)
  })
})

describe('swaps and cooked weights (T-058b)', () => {
  const plan = buildMealPlan(asha)
  const food = (id: string) => PLAN_FOODS_BY_ID.get(id)!

  it('10. offers any protein food for a protein food and the same kind otherwise', () => {
    const forDal = swapOptions(food('tmf:ing:toor-dal'), asha.foods).map((f) => f.id)
    expect(forDal).toContain('tmf:ing:paneer')
    expect(forDal).not.toContain('tmf:ing:toor-dal')
    expect(forDal).not.toContain('tmf:ing:chicken') // not in a veg plan
    expect(swapOptions(food('tmf:ing:rice'), asha.foods).every((f) => f.group === 'cereal')).toBe(true)
  })

  it('10. swaps keep about the same protein, stay within limits, and update the totals', () => {
    const lunch = plan.meals.find((m) => m.name === 'Lunch')!
    const dal = lunch.items.find((i) => i.foodId === 'tmf:ing:toor-dal')!
    const swapped = swapItem(plan, 'Lunch', dal.foodId, food('tmf:ing:paneer'), asha.foods)
    const after = swapped.meals.find((m) => m.name === 'Lunch')!
    expect(after.items.some((i) => i.foodId === 'tmf:ing:toor-dal')).toBe(false)
    const paneer = after.items.find((i) => i.foodId === 'tmf:ing:paneer')!
    expect(paneer.grams).toBeLessThanOrEqual(food('tmf:ing:paneer').maxPerMealG)
    expect(paneer.reason).toMatch(/^Swapped in for toor dal/)
    expect(Math.abs(after.macros.proteinG - lunch.macros.proteinG)).toBeLessThan(5)
    const sum = swapped.meals.reduce((s, m) => s + m.macros.kcal, 0)
    expect(swapped.totals.kcal).toBeCloseTo(sum, 5)
    expect(plan.meals.find((m) => m.name === 'Lunch')).toBe(lunch) // the original plan is untouched
  })

  it('10. swaps a cereal for the same calories', () => {
    const lunch = plan.meals.find((m) => m.name === 'Lunch')!
    const rice = lunch.items.find((i) => i.foodId === 'tmf:ing:rice')!
    const after = swapItem(plan, 'Lunch', rice.foodId, food('tmf:ing:atta'), asha.foods).meals.find((m) => m.name === 'Lunch')!
    expect(after.items.find((i) => i.foodId === 'tmf:ing:atta')).toBeTruthy()
    // Within one roti, since roti come whole.
    expect(Math.abs(after.macros.kcal - lunch.macros.kcal)).toBeLessThan(105)
  })

  it('4. gives a cooked weight for foods that change when cooked', () => {
    expect(cookedGrams(food('tmf:ing:rice'), 60)).toBeGreaterThan(150)
    expect(cookedGrams(food('tmf:ing:toor-dal'), 25)).toBe(150)
    expect(cookedGrams(food('tmf:ing:milk'), 200)).toBeNull()
  })
})

describe('non-veg-free day plan (T-058c)', () => {
  const nonveg = planFoodsFor(excludedTags('nonveg'))
  const usual = buildMealPlan({ targets: { kcal: 2400, proteinG: 130, fatG: 67, carbG: 319 }, weightKg: 80, base: [], picks: picks('eggs', 'chicken', 'paneer'), foods: nonveg })
  const vegIds = new Set(planFoodsFor(new Set([...excludedTags('nonveg'), 'meat', 'fish', 'egg'])).map((f) => f.id))

  it('5. swaps meat, fish and eggs for veg protein foods with about the same protein, and says why', () => {
    const day = vegDayPlan(usual, nonveg, vegIds, picks('eggs', 'chicken', 'paneer'), 'Tuesday is your non-veg-free day')
    expect(items(day).every((i) => vegIds.has(i.foodId))).toBe(true)
    expect(items(day).some((i) => /^Tuesday is your non-veg-free day, so chicken is swapped for /.test(i.reason))).toBe(true)
    expect(Math.abs(day.totals.proteinG - usual.totals.proteinG)).toBeLessThanOrEqual(15) // cereals trimmed for calories carry some protein
    expect(Math.abs(day.totals.kcal - usual.totals.kcal)).toBeLessThanOrEqual(usual.totals.kcal * 0.05)
    for (const i of items(day)) expect(i.grams, i.name).toBeLessThanOrEqual(PLAN_FOODS_BY_ID.get(i.foodId)!.maxPerMealG)
    expect(vegDayPlan(day, nonveg, vegIds, [], 'Tuesday is your non-veg-free day')).toBe(day) // nothing left to swap
  })

  it('5. uses the picks first, then any other allowed protein food', () => {
    // Paneer, toor dal, soya and tofu are left out: moong dal steps in.
    const fallbacks = new Set(['tmf:ing:paneer', 'tmf:ing:toor-dal', 'tmf:ing:soya-chunks', 'usda:172475'])
    const some = new Set([...vegIds].filter((id) => !fallbacks.has(id) && PLAN_FOODS_BY_ID.get(id)!.group !== 'dairy'))
    const day = vegDayPlan(usual, nonveg, some, [], 'Tuesday is your non-veg-free day')
    const swapped = items(day).filter((i) => i.reason.includes('is swapped for'))
    expect(swapped.length).toBeGreaterThan(0)
    expect(swapped.every((i) => some.has(i.foodId) && PLAN_FOODS_BY_ID.get(i.foodId)!.group !== 'supplement')).toBe(true)
  })

  it('5. drops an item with a note when no veg protein food is allowed', () => {
    const none = new Set([...vegIds].filter((id) => !['pulse', 'dairy', 'soy', 'supplement'].includes(PLAN_FOODS_BY_ID.get(id)!.group)))
    const day = vegDayPlan(usual, nonveg, none, [], 'You made today a veg day')
    expect(items(day).some((i) => i.foodId === 'tmf:ing:chicken')).toBe(false)
    expect(day.notes.some((n) => /^You made today a veg day, so .* is left out/.test(n))).toBe(true)
  })
})

describe('changing a plan by hand (T-061)', () => {
  const plan = buildMealPlan(asha)
  const food = (id: string) => PLAN_FOODS_BY_ID.get(id)!
  const sum = (p: MealPlan) => Math.round(p.meals.reduce((t, m) => t + m.items.reduce((s, i) => s + i.macros.kcal, 0), 0))

  it('1. changes an amount, keeps totals in step, and marks the item as changed', () => {
    const lunch = plan.meals.find((m) => m.name === 'Lunch')!
    const changed = setItemGrams(plan, 'Lunch', 0, lunch.items[0].grams * 2, asha.foods)
    const item = changed.meals.find((m) => m.name === 'Lunch')!.items[0]
    expect(item.grams).toBe(lunch.items[0].grams * 2)
    expect(item.macros.kcal).toBeCloseTo(lunch.items[0].macros.kcal * 2, 0)
    expect(item.reason).toMatch(/^You changed this\./)
    expect(Math.round(changed.totals.kcal)).toBe(sum(changed))
    expect(setItemGrams(plan, 'Lunch', 0, 99999, asha.foods).meals.find((m) => m.name === 'Lunch')!.items[0].grams).toBe(MAX_PLAN_GRAMS)
    // Above the usual daily amount: allowed, with a note.
    const rice = setItemGrams(plan, 'Lunch', lunch.items.findIndex((i) => i.foodId === 'tmf:ing:rice'), 400, asha.foods)
    expect(rice.meals.find((m) => m.name === 'Lunch')!.items.find((i) => i.foodId === 'tmf:ing:rice')!.reason).toMatch(/More than the usual \d+ g raw a day\./)
  })

  it('1. removes an item and adds a food, merging with the same food in that meal', () => {
    const snack = plan.meals.find((m) => m.name === 'Snack')!
    const fewer = removeItem(plan, 'Snack', 0)
    expect(fewer.meals.find((m) => m.name === 'Snack')!.items).toHaveLength(snack.items.length - 1)
    expect(Math.round(fewer.totals.kcal)).toBe(sum(fewer))
    const banana = food('usda:173944')
    const more = addItem(fewer, 'Snack', banana)
    const added = more.meals.find((m) => m.name === 'Snack')!.items.find((i) => i.foodId === banana.id)!
    expect(added.grams).toBeGreaterThan(0)
    const twice = addItem(more, 'Snack', banana, 50)
    expect(twice.meals.find((m) => m.name === 'Snack')!.items.filter((i) => i.foodId === banana.id)).toHaveLength(1)
    expect(twice.meals.find((m) => m.name === 'Snack')!.items.find((i) => i.foodId === banana.id)!.grams).toBe(added.grams + 50)
  })

  it('1. an emptied meal is dropped on save; adding to a missing meal puts it back in order', () => {
    let p = plan
    while (p.meals.find((m) => m.name === 'Snack')!.items.length) p = removeItem(p, 'Snack', 0)
    expect(tidyPlan(p).meals.map((m) => m.name)).toEqual(['Breakfast', 'Lunch', 'Dinner'])
    const back = addItem(tidyPlan(p), 'Snack', food('tmf:ing:curd'))
    expect(back.meals.map((m) => m.name)).toEqual(['Breakfast', 'Lunch', 'Snack', 'Dinner'])
  })

  it('2. the check says in plain words how far the day is from the targets', () => {
    const t = { kcal: 2000, proteinG: 100, fatG: 60, carbG: 250 }
    expect(planCheck({ ...t, kcal: 2050, proteinG: 103 }, t)).toBe('This plan is close to your targets.')
    expect(planCheck({ ...t, kcal: 1700, proteinG: 80 }, t)).toBe('This plan has 300 calories less than your target. It has 20 g less protein than your target.')
    expect(planCheck({ ...t, proteinG: 130 }, t)).toBe('This plan has 30 g more protein than your target.')
  })

  it('1 (T-061b). a food from search keeps its amount and calories, merges, and scales when changed', () => {
    const poha = { foodId: 'tmf:dish:poha', name: 'Poha', grams: 150, macros: { kcal: 195, proteinG: 3.8, carbG: 36, fatG: 4.5 }, tags: ['onion_garlic' as const] }
    const once = addFoundItem(plan, 'Breakfast', poha)
    const item = () => once.meals.find((m) => m.name === 'Breakfast')!.items.find((i) => i.foodId === poha.foodId)!
    expect(item()).toMatchObject({ grams: 150, weighed: 'as eaten', reason: 'You added this.', tags: ['onion_garlic'] })
    expect(Math.round(once.totals.kcal)).toBe(Math.round(plan.totals.kcal + 195))
    const twice = addFoundItem(once, 'Breakfast', poha)
    expect(twice.meals.find((m) => m.name === 'Breakfast')!.items.filter((i) => i.foodId === poha.foodId)).toHaveLength(1)
    const at = once.meals.find((m) => m.name === 'Breakfast')!.items.indexOf(item())
    const half = setItemGrams(once, 'Breakfast', at, 75, asha.foods).meals.find((m) => m.name === 'Breakfast')!.items[at]
    expect(half.grams).toBe(75)
    expect(half.macros.kcal).toBeCloseTo(97.5)
  })
})

describe('clean meal plan (T-068b)', () => {
  const food = (id: string) => PLAN_FOODS_BY_ID.get(id)!
  const nonveg = (kcal: number, keys = ['eggs', 'chicken']) =>
    buildMealPlan({ targets: dailyTargets({ kcal, weightKg: 80, heightCm: 178 }).values, weightKg: 80, base: [], picks: picks(...keys), foods: planFoodsFor(excludedTags('nonveg')) })
  const plans = [buildMealPlan(asha), nonveg(2400), nonveg(2900), buildMealPlan({ ...asha, targets: dailyTargets({ kcal: 1500, weightKg: 70, heightCm: 160 }).values })]
  const groupsIn = (p: MealPlan, meal: string) => p.meals.find((m) => m.name === meal)?.items.map((i) => food(i.foodId).group) ?? []

  it('1. breakfast, lunch and dinner each have one cereal base, and lunch has at most two', () => {
    for (const p of plans)
      for (const meal of ['Breakfast', 'Lunch', 'Dinner']) {
        const cereals = groupsIn(p, meal).filter((g) => g === 'cereal').length
        expect(cereals, meal).toBeGreaterThanOrEqual(1)
        expect(cereals, meal).toBeLessThanOrEqual(2)
      }
    expect(groupsIn(plans[0], 'Breakfast').filter((g) => g === 'cereal')).toHaveLength(1)
  })

  it('2. no meal has more than one dal', () => {
    for (const p of [...plans, buildMealPlan({ ...asha, picks: picks('dal'), targets: { ...asha.targets, proteinG: 140 } })])
      for (const m of p.meals) expect(groupsIn(p, m.name).filter((g) => g === 'pulse').length, m.name).toBeLessThanOrEqual(1)
  })

  it('3. every amount is a whole step of its food and at least its smallest amount', () => {
    for (const p of plans)
      for (const i of items(p)) {
        const f = food(i.foodId)
        if (f.group === 'fruit') continue // one whole piece
        const step = f.stepG ?? 5
        expect(i.grams % step, `${i.name} ${i.grams}`).toBe(0)
        expect(i.grams, i.name).toBeGreaterThanOrEqual(f.minG ?? step)
      }
  })

  it('4. hints are in whole or half units', () => {
    expect(amountHint(food('tmf:ing:atta'), 60)).toBe('about 2 roti')
    expect(amountHint(food('tmf:ing:toor-dal'), 25)).toBe('about 1 katori cooked dal')
    expect(amountHint(food('tmf:ing:milk'), 100)).toBe('about ½ glass')
    expect(amountHint(food('tmf:ing:rice'), 75)).toBe('about 1½ katori cooked rice')
  })

  it('5. the usual day sets the foods, not the amounts; fried food never carries over; sugar only with milk', () => {
    const fried = buildMealPlan({ ...asha, base: typicalDayToBase({ ...USUAL_VEG_DAY, 'tmf:dish:samosa': 3, 'tmf:dish:gulab-jamun': 2 }) })
    expect(fried.meals).toEqual(buildMealPlan(asha).meals)
    const lots = buildMealPlan({ ...asha, base: typicalDayToBase({ ...USUAL_VEG_DAY, 'tmf:dish:roti': 12 }) })
    expect(dayGrams(lots, 'tmf:ing:atta')).toBe(dayGrams(buildMealPlan(asha), 'tmf:ing:atta'))
    for (const p of plans)
      for (const m of p.meals) if (m.items.some((i) => i.foodId === 'tmf:ing:sugar')) expect(m.items.some((i) => i.foodId === 'tmf:ing:milk'), m.name).toBe(true)
    const noChai = buildMealPlan({ ...asha, base: typicalDayToBase({ ...USUAL_VEG_DAY, 'tmf:dish:chai': 0, 'tmf:dish:toned-milk': 1 }) })
    expect(dayGrams(noChai, 'tmf:ing:sugar')).toBe(0)
  })

  it('6. adds another cereal when every cereal is at its limit, and lands within 8 % of calories', () => {
    const big = nonveg(2900)
    expect(Math.abs(big.totals.kcal - 2900)).toBeLessThanOrEqual(0.08 * 2900)
    expect(groupsIn(big, 'Dinner').filter((g) => g === 'cereal').length).toBe(2)
    for (const p of plans) expect(Math.abs(p.totals.kcal - p.targets.kcal), String(p.targets.kcal)).toBeLessThanOrEqual(0.08 * p.targets.kcal)
  })

  it('7. dinner uses a different protein food from lunch', () => {
    const p = nonveg(2400, ['dal', 'chicken'])
    const main = (meal: string) => p.meals.find((m) => m.name === meal)!.items.find((i) => ['pulse', 'meat'].includes(food(i.foodId).group))!.foodId
    expect(main('Lunch')).toBe('tmf:ing:toor-dal')
    expect(main('Dinner')).toBe('tmf:ing:chicken')
  })

  it('8. no meal goes over 0.55 g protein per kg, even with big cereal portions', () => {
    for (const p of plans) for (const m of p.meals) expect(m.macros.proteinG, m.name).toBeLessThanOrEqual(MAX_PROTEIN_PER_MEAL_KG * 80 + 0.1)
  })

  it('9. veg-day swaps use at least the smallest amount', () => {
    const p = nonveg(2400, ['chicken', 'paneer'])
    const veg = vegDayPlan(p, planFoodsFor(excludedTags('nonveg')), new Set(planFoodsFor(excludedTags('veg')).map((f) => f.id)), picks('chicken', 'paneer'), 'Tuesday is your non-veg-free day')
    const swapped = items(veg).filter((i) => i.reason.includes('is swapped for'))
    expect(swapped.length).toBeGreaterThan(0)
    for (const i of swapped) expect(i.grams, i.name).toBeGreaterThanOrEqual(food(i.foodId).minG ?? 0)
  })
})

describe('new plan foods (T-068a2)', () => {
  const food = (id: string) => PLAN_FOODS_BY_ID.get(id)!
  const NEW = ['tmf:ing:besan', 'tmf:ing:sattu', 'usda:170903', 'usda:171269', 'usda:172195', 'tmf:ing:low-fat-paneer']

  it('1. besan, sattu, hung curd, skimmed milk, skimmed milk powder and low-fat paneer are plan foods with a protein pick', () => {
    for (const id of NEW) {
      expect(PLAN_FOODS_BY_ID.has(id), id).toBe(true)
      expect(PROTEIN_PICKS.some((p) => p.foods.includes(id)), id).toBe(true)
    }
  })

  it('2. picked new foods are used in the plan', () => {
    const lean = buildMealPlan({ ...asha, picks: picks('low-fat-paneer', 'low-fat-dairy', 'besan'), base: [] })
    const used = new Set(items(lean).map((i) => i.foodId))
    expect(NEW.filter((id) => used.has(id)).length).toBeGreaterThanOrEqual(3)
    expect(items(lean).every((i) => !i.reason.startsWith('Added because your picks'))).toBe(true)
  })

  it('3. foods of one kind are not put in one meal together', () => {
    const big = buildMealPlan({ ...asha, picks: picks('curd'), weightKg: 120, targets: { kcal: 3600, proteinG: 260, fatG: 100, carbG: 450 } })
    for (const m of big.meals) {
      const kinds = m.items.map((i) => food(i.foodId).kind).filter(Boolean)
      expect(new Set(kinds).size, m.name).toBe(kinds.length)
    }
  })

  it('4. hints use chilla, katori, glass and tbsp', () => {
    expect(amountHint(food('tmf:ing:besan'), 60)).toBe('about 2 chilla')
    expect(amountHint(food('usda:170903'), 100)).toBe('about 1 katori')
    expect(amountHint(food('usda:171269'), 200)).toBe('about 1 glass')
    expect(amountHint(food('usda:172195'), 20)).toBe('about 2 tbsp')
    expect(amountHint(food('tmf:ing:sattu'), 30)).toBe('about 1 glass of drink')
  })
})
