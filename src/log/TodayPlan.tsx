// The saved meal plan on the Food tab (T-058c). On a veg day the
// meat, fish and egg items are swapped for veg protein foods, with the reason.
// Loaded only when the person has a saved plan.

import { useMemo } from 'react'
import { vegDayPlan } from '../engine/mealPlan'
import type { DietTag } from '../food/types'
import type { SavedMealPlan } from '../profile/mealPlanStore'
import { PLAN_FOODS, planFoodsFor } from '../profile/planFoods'

export default function TodayPlan({ saved, excluded, vegWhy }: { saved: SavedMealPlan; excluded: Set<DietTag>; vegWhy: string | null }) {
  const plan = useMemo(() => {
    if (!vegWhy) return saved.plan
    const allowed = new Set(planFoodsFor(excluded).map((f) => f.id))
    return vegDayPlan(saved.plan, PLAN_FOODS, allowed, saved.picks, vegWhy)
  }, [saved, excluded, vegWhy])

  return (
    <details className="today-plan" aria-label="Your meal plan">
      <summary>
        Your meal plan{vegWhy ? ', veg today' : ''}{' '}
        <span className="muted">
          about {plan.totals.kcal.toLocaleString('en-IN')} kcal, {Math.round(plan.totals.proteinG)} g protein
        </span>
      </summary>
      {plan.meals.map((m) => (
        <section key={m.name} aria-label={`Plan ${m.name}`}>
          <h4>{m.name}</h4>
          <ul>
            {m.items.map((i) => (
              <li key={i.foodId}>
                <strong>{i.name}</strong> {i.grams} g {i.weighed}
                {i.hint && <span className="muted">, {i.hint}</span>}
                {vegWhy && i.reason.startsWith(vegWhy) && <small className="muted reason">{i.reason}</small>}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {plan.notes
        .filter((n) => (vegWhy && n.startsWith(vegWhy)) || n.startsWith('Cereals are'))
        .map((n) => (
          <p key={n} className="muted">
            {n}
          </p>
        ))}
    </details>
  )
}
