// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { ClientMealPlan } from './ClientMealPlan'
import { buildMealPlan } from '../engine/mealPlan'
import { PROTEIN_PICKS, planFoodsFor } from '../profile/planFoods'
import { memoryMealPlanStore, type SavedMealPlan } from '../profile/mealPlanStore'
import { excludedTags } from '../profile/dietRules'
import { memoryProfileStore } from '../profile/stores'
import { memoryProgressStore } from '../progress/stores'
import type { DietTarget } from '../targets/types'

afterEach(cleanup)

const COACH = 'coach-1'
const TARGET: DietTarget = { id: 't1', kcal: 2000, proteinG: 110, fatG: 60, carbG: 250, startsOn: '2026-10-01', source: 'manual', setBy: COACH }

function setup(saved: boolean) {
  const picks = PROTEIN_PICKS.filter((p) => ['paneer', 'dal'].includes(p.key)).flatMap((p) => p.foods)
  const plan = buildMealPlan({ targets: TARGET, weightKg: 60, base: [], picks, foods: planFoodsFor(excludedTags('veg')) })
  const before: SavedMealPlan[] = saved ? [{ id: 'p0', plan, picks, createdAt: '2026-10-10T08:00:00Z', createdBy: 'asha' }] : []
  const mealPlans = memoryMealPlanStore(COACH, before)
  render(
    <ClientMealPlan
      mealPlans={mealPlans}
      profile={memoryProfileStore({ dietPref: 'veg' })}
      progress={memoryProgressStore([{ date: '2026-10-14', kg: 60 }])}
      target={TARGET}
      coachId={COACH}
      first="Asha"
    />,
  )
  return { mealPlans, plan }
}

describe('coach meal plans (T-078)', () => {
  it('1. the coach sees the client’s plan, its size, and who set it and when', async () => {
    const { plan } = setup(true)
    const section = await screen.findByRole('region', { name: 'Meal plan' })
    expect(await within(section).findByText(`About ${Math.round(plan.totals.kcal).toLocaleString('en-IN')} kcal and ${Math.round(plan.totals.proteinG)} g protein a day.`)).toBeTruthy()
    expect(within(section).getByText('Set by Asha on 10 Oct.')).toBeTruthy()
    cleanup()
    setup(false)
    expect(await screen.findByText('No meal plan yet.')).toBeTruthy()
  })

  it('2. the coach changes the plan in the same editor, and it is saved as theirs', async () => {
    const { mealPlans } = setup(true)
    fireEvent.click(await screen.findByRole('button', { name: 'Change meal plan' }))
    const editor = await screen.findByRole('region', { name: 'Change Asha’s meal plan' })
    expect(within(editor).getByRole('status', { name: 'Plan check' })).toBeTruthy()
    fireEvent.click(within(editor).getByRole('button', { name: 'Save plan' }))
    expect(await screen.findByText(/^Set by you on/)).toBeTruthy()
    expect((await mealPlans.latest())!.createdBy).toBe(COACH)
  })

  it('2. a new plan for a veg client offers only veg protein foods', async () => {
    const { mealPlans } = setup(false)
    fireEvent.click(await screen.findByRole('button', { name: 'Make a meal plan' }))
    const picks = await screen.findByRole('group', { name: 'Protein foods you like' })
    expect(within(picks).queryByRole('button', { name: /Chicken/ })).toBeNull()
    fireEvent.click(within(picks).getByRole('button', { name: /Soya/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Use this plan' }))
    expect(await screen.findByText(/^Set by you on/)).toBeTruthy()
    expect((await mealPlans.latest())!.picks.some((id) => id.includes('soya'))).toBe(true)
  })
})
