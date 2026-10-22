// @vitest-environment jsdom
// Ticked food shows what is eaten and how far it is from the targets (spec T-133).
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
import { memoryTargetStore } from '../targets/stores'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const DAY = '2026-10-14'
const diet = { dietPref: 'nonveg' as const, foodRules: [], allergies: [] }
const TARGET = { id: 't', startsOn: '2026-10-01', kcal: 2000, proteinG: 120, carbG: 250, fatG: 60, source: 'manual' as const, setBy: 'me' }

async function setup() {
  const picks = PROTEIN_PICKS.filter((p) => ['chicken', 'paneer'].includes(p.key)).flatMap((p) => p.foods)
  const plan = buildMealPlan({ targets: { kcal: 2400, proteinG: 130, fatG: 67, carbG: 319 }, weightKg: 80, base: [], picks, foods: planFoodsFor(excludedTags('nonveg')) })
  const mealPlans = memoryMealPlanStore('me')
  await mealPlans.save(plan, picks)
  render(
    <FoodLog
      store={memoryLogStore()}
      loadFoods={() => Promise.resolve(localFinder(createSearchIndex([])))}
      today={DAY}
      diet={diet}
      mealPlans={mealPlans}
      targets={memoryTargetStore('me', [TARGET])}
      userId="me"
    />,
  )
  await screen.findByRole('region', { name: 'Your meal plan' })
  return plan
}

const card = () => screen.getByRole('region', { name: 'Eaten today' })
const part = (name: string) => within(card()).getByLabelText(name)

describe('eaten today against the targets (T-133)', () => {
  it('1. before anything is eaten, it shows 0 eaten and the whole target left', async () => {
    await setup()
    expect(part('Calories').textContent).toBe('0calories eaten2,000 left of 2,000')
    expect(part('Protein').textContent).toBe('Protein 0 g eaten120 g left of 120 g')
  })

  it('2. ticking a plan food adds it to the calories and protein eaten', async () => {
    const plan = await setup()
    const item = plan.meals[0].items[0]
    fireEvent.click(within(screen.getByRole('main')).getAllByRole('checkbox', { name: `Ate ${item.name}` })[0])
    const kcal = Math.round(item.macros.kcal)
    await waitFor(() => expect(within(part('Calories')).getByText(kcal.toLocaleString('en-IN'))).toBeTruthy())
    expect(within(part('Calories')).getByText(`${(2000 - kcal).toLocaleString('en-IN')} left of 2,000`)).toBeTruthy()
  })

  it('3. eating more than a target says how much over, and marks it', async () => {
    await setup()
    fireEvent.click(within(screen.getByRole('main')).getByRole('checkbox', { name: 'Ate the whole plan' }))
    await waitFor(() => expect(part('Calories').textContent).toMatch(/ over of 2,000$/))
    const gap = within(part('Calories')).getByText(/ over of 2,000$/)
    expect(gap.hasAttribute('data-over')).toBe(true)
    expect(part('Protein').textContent).toMatch(/^Protein [\d,.]+ g eaten[\d,.]+ g over of 120 g$/)
  })
})
