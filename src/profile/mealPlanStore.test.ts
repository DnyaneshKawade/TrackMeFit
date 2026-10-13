import { describe, expect, it } from 'vitest'
import { memoryMealPlanStore } from './mealPlanStore'
import { buildMealPlan } from '../engine/mealPlan'
import { PLAN_FOODS, PROTEIN_PICKS } from './planFoods'

describe('meal plan store', () => {
  it('returns nothing until a plan is saved, then the latest plan with its picks', async () => {
    const store = memoryMealPlanStore()
    expect(await store.latest()).toBeNull()
    const picks = PROTEIN_PICKS.find((p) => p.key === 'paneer')!.foods
    const plan = buildMealPlan({ targets: { kcal: 2000, proteinG: 100, fatG: 55, carbG: 270 }, weightKg: 60, base: [], picks, foods: PLAN_FOODS })
    await store.save(plan, picks)
    await store.save(plan, ['tmf:ing:curd'])
    expect(await store.latest()).toMatchObject({ plan, picks: ['tmf:ing:curd'] })
  })
})
