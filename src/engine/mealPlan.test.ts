import { describe, expect, it } from 'vitest'
import { MAX_PROTEIN_PER_MEAL_KG, SUGAR_MAX_G, VEG_G, amountHint, buildMealPlan, checkFeasibility, cookedGrams, swapItem, swapOptions, vegDayPlan, type MealPlan, type MealPlanInput } from './mealPlan'
import { PLAN_FOODS_BY_ID, PROTEIN_PICKS, planFoodsFor, typicalDayToBase } from '../profile/planFoods'
import { excludedTags } from '../profile/dietRules'

const picks = (...keys: string[]) => PROTEIN_PICKS.filter((p) => keys.includes(p.key)).flatMap((p) => p.foods)
const USUAL_VEG_DAY = { 'tmf:dish:roti': 4, 'tmf:dish:dal-tadka': 2, 'tmf:dish:steamed-rice': 1, 'usda:170886': 1, 'tmf:dish:chai': 2, 'tmf:dish:aloo-gobi': 1 }

// Asha: vegetarian, 70 kg, 2,200 kcal and 112 g protein (1.6 g/kg).
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
    expect(rice.hint).toMatch(/^about \d+ g cooked$/)
    expect(amountHint(PLAN_FOODS_BY_ID.get('tmf:ing:atta')!, 90)).toBe('about 3 roti')
    expect(amountHint(PLAN_FOODS_BY_ID.get('tmf:ing:egg')!, 100)).toBe('about 2 eggs')
  })

  it('5. never goes over a food’s per-meal or per-day limit, and says when a limit was hit', () => {
    for (const i of items(plan)) expect(i.grams, `${i.name} at ${i.meal}`).toBeLessThanOrEqual(PLAN_FOODS_BY_ID.get(i.foodId)!.maxPerMealG)
    for (const f of asha.foods) expect(dayGrams(plan, f.id), f.name).toBeLessThanOrEqual(f.maxPerDayG)
    const lots = buildMealPlan({ ...asha, base: [...asha.base, { foodId: 'tmf:ing:rice', grams: 500 }, { foodId: 'tmf:ing:soya-chunks', grams: 200 }] })
    expect(dayGrams(lots, 'tmf:ing:rice')).toBeLessThanOrEqual(150)
    expect(dayGrams(lots, 'tmf:ing:soya-chunks')).toBeLessThanOrEqual(50)
    expect(lots.notes).toContain('Soya chunks is kept to 50 g dry a day, a sensible amount for one food.')
  })

  it('6. says how much protein the picks can reach when it is not enough, and suggests more', () => {
    const hard: MealPlanInput = { ...asha, targets: { kcal: 2600, proteinG: 160, fatG: 70, carbG: 330 }, weightKg: 90, picks: picks('curd') }
    const f = checkFeasibility(hard)
    expect(f.feasible).toBe(false)
    expect(f.reachableProteinG).toBeLessThan(155)
    expect(f.message).toMatch(new RegExp(`about ${f.reachableProteinG} g of your 160 g protein`))
    expect(f.suggestions.length).toBeGreaterThan(0)
    expect(f.suggestions.every((s) => s.tags.every((t) => !excludedTags('veg').has(t)))).toBe(true)
    expect(checkFeasibility(asha)).toMatchObject({ feasible: true, suggestions: [] })
  })

  it('7. lands within 5% of calories and 5 g of protein', () => {
    expect(plan.onTarget).toBe(true)
    expect(Math.abs(plan.totals.kcal - 2200)).toBeLessThanOrEqual(110)
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

  it('11. adds ICMR basics: 400 g vegetables, fruit, oil near 27 g per 2,000 kcal, sugar at most 25 g', () => {
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
    const p = buildMealPlan({ targets: { kcal: 2400, proteinG: 130, fatG: 67, carbG: 319 }, weightKg: 80, base: [], picks: picks('eggs', 'chicken'), foods: planFoodsFor(excludedTags('nonveg')) })
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
    expect(Math.abs(after.macros.kcal - lunch.macros.kcal)).toBeLessThan(60)
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

  it('5. drops an item with a note when no veg protein food is allowed', () => {
    const none = new Set([...vegIds].filter((id) => !['pulse', 'dairy', 'soy', 'supplement'].includes(PLAN_FOODS_BY_ID.get(id)!.group)))
    const day = vegDayPlan(usual, nonveg, none, [], 'You made today a veg day')
    expect(items(day).some((i) => i.foodId === 'tmf:ing:chicken')).toBe(false)
    expect(day.notes.some((n) => /^You made today a veg day, so .* is left out/.test(n))).toBe(true)
  })
})
