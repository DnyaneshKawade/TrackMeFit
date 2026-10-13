// "Want us to suggest a day of meals?" on the plan step: protein picks in
// plain words, a live protein check, the plan in raw grams with a cooked view
// and swaps, and nothing kept until "Use this plan". Loaded only when shown.

import { useMemo, useState } from 'react'
import type { Macros } from '../engine/diet'
import { buildMealPlan, cookedGrams, swapItem, swapOptions, type MealName, type MealPlan } from '../engine/mealPlan'
import type { DietTag } from '../food/types'
import { PLAN_FOODS_BY_ID, planFoodsFor, proteinPicksFor, typicalDayToBase } from './planFoods'
import { SUGGESTION_NOTE } from './types'

export interface AcceptedMealPlan {
  plan: MealPlan
  picks: string[]
}

const fmt = (n: number) => n.toLocaleString('en-IN')

export default function MealPlanStep({
  targets,
  weightKg,
  counts,
  excluded,
  blocked,
  accepted,
  onAccept,
}: {
  targets: Macros
  weightKg: number
  counts: Record<string, number>
  excluded: Set<DietTag>
  /** The health check said a doctor or coach should plan meals. */
  blocked: boolean
  accepted: AcceptedMealPlan | null
  onAccept: (a: AcceptedMealPlan | null) => void
}) {
  const [phase, setPhase] = useState<'ask' | 'pick' | 'no'>(accepted ? 'pick' : 'ask')
  const [keys, setKeys] = useState<string[]>([])
  const [lowerProtein, setLowerProtein] = useState<number | null>(null)
  const [edits, setEdits] = useState<{ meal: MealName; from: string; to: string }[]>([])
  const [cooked, setCooked] = useState<Set<string>>(new Set())

  const foods = useMemo(() => planFoodsFor(excluded), [excluded])
  const choices = useMemo(() => proteinPicksFor(excluded), [excluded])
  const allowedIds = useMemo(() => new Set(foods.map((f) => f.id)), [foods])
  const picks = useMemo(
    () => choices.filter((c) => keys.includes(c.key)).flatMap((c) => c.foods.filter((id) => allowedIds.has(id))),
    [choices, keys, allowedIds],
  )
  const base = useMemo(() => typicalDayToBase(counts), [counts])
  const goal = useMemo(() => (lowerProtein === null ? targets : { ...targets, proteinG: lowerProtein }), [targets, lowerProtein])
  const plan = useMemo(() => {
    if (!picks.length) return null
    let p = buildMealPlan({ targets: goal, weightKg, base, picks, foods })
    for (const e of edits) p = swapItem(p, e.meal, e.from, PLAN_FOODS_BY_ID.get(e.to)!, foods)
    return p
  }, [goal, weightKg, base, picks, foods, edits])

  if (blocked)
    return (
      <section className="meal-plan" aria-label="Meal plan">
        <p className="info">
          Because of your health answers, we don’t make an automatic meal plan. A coach or your doctor can plan your meals with you.
        </p>
      </section>
    )

  if (accepted && phase !== 'pick')
    return (
      <section className="meal-plan" aria-label="Meal plan">
        <p className="info" role="status">
          Your meal plan will be saved when you finish.{' '}
          <button type="button" className="link" onClick={() => onAccept(null)}>
            Remove it
          </button>
        </p>
      </section>
    )

  if (phase === 'ask' || phase === 'no')
    return (
      <section className="meal-plan" aria-label="Meal plan">
        <h2>Want us to suggest a day of meals?</h2>
        <p className="muted">We start from your typical day and add the protein foods you like. Every amount is in grams.</p>
        {phase === 'no' && <p className="muted">No problem. You can log food your own way.</p>}
        <div className="choice">
          <button type="button" className="primary" onClick={() => setPhase('pick')}>
            Yes, suggest a plan
          </button>
          {phase === 'ask' && (
            <button type="button" className="link" onClick={() => setPhase('no')}>
              Not now
            </button>
          )}
        </div>
      </section>
    )

  const toggle = (k: string) => {
    setEdits([])
    setLowerProtein(null)
    setKeys(keys.includes(k) ? keys.filter((x) => x !== k) : [...keys, k])
  }
  const addFood = (id: string) => {
    const c = choices.find((x) => x.foods.includes(id))
    if (c && !keys.includes(c.key)) toggle(c.key)
  }

  return (
    <section className="meal-plan" aria-label="Meal plan">
      <h2>Which protein foods do you like?</h2>
      <p className="muted">Pick a few. Most Indian meals are short on protein, so the plan adds these to your usual food.</p>
      <div className="choice" role="group" aria-label="Protein foods you like">
        {choices.map((c) => (
          <button key={c.key} type="button" aria-pressed={keys.includes(c.key)} onClick={() => toggle(c.key)}>
            {c.label}
          </button>
        ))}
      </div>

      {plan && (
        <>
          <p className={plan.feasibility.feasible ? 'info' : 'error'} role="status" aria-label="Protein check">
            {plan.feasibility.message}
          </p>
          {!plan.feasibility.feasible && (
            <div className="choice">
              {plan.feasibility.suggestions.map((s) => (
                <button key={s.id} type="button" onClick={() => addFood(s.id)}>
                  Add {s.name.toLowerCase()}
                </button>
              ))}
              <button type="button" className="link" onClick={() => setLowerProtein(plan.feasibility.reachableProteinG)}>
                Use {plan.feasibility.reachableProteinG} g protein instead
              </button>
            </div>
          )}
          {lowerProtein !== null && (
            <p className="muted">
              Protein for this plan is {lowerProtein} g instead of {targets.proteinG} g, because you chose to keep to these foods.
            </p>
          )}

          {plan.meals.map((m) => (
            <section key={m.name} className="plan-meal" aria-label={m.name}>
              <h3>
                {m.name} <small className="muted">{fmt(m.macros.kcal)} kcal, {Math.round(m.macros.proteinG)} g protein</small>
              </h3>
              <ul className="plan-items">
                {m.items.map((i) => {
                  const f = PLAN_FOODS_BY_ID.get(i.foodId)!
                  const key = `${m.name}:${i.foodId}`
                  const showCooked = cooked.has(key) && cookedGrams(f, i.grams) !== null
                  const options = swapOptions(f, foods)
                  return (
                    <li key={i.foodId}>
                      <span>
                        <strong>{i.name}</strong>{' '}
                        {showCooked ? `about ${cookedGrams(f, i.grams)} g cooked` : `${i.grams} g ${i.weighed}`}
                        {!showCooked && i.hint && <span className="muted">, {i.hint}</span>}
                        <small className="muted reason">{i.reason}</small>
                      </span>
                      <span className="item-actions">
                        {cookedGrams(f, i.grams) !== null && (
                          <button
                            type="button"
                            className="link"
                            aria-pressed={showCooked}
                            aria-label={`Cooked weight for ${i.name} at ${m.name}`}
                            onClick={() => {
                              const next = new Set(cooked)
                              if (next.has(key)) next.delete(key)
                              else next.add(key)
                              setCooked(next)
                            }}
                          >
                            Cooked
                          </button>
                        )}
                        {options.length > 0 && (
                          <select
                            aria-label={`Swap ${i.name} at ${m.name}`}
                            value=""
                            onChange={(e) => e.target.value && setEdits([...edits, { meal: m.name, from: i.foodId, to: e.target.value }])}
                          >
                            <option value="">Swap</option>
                            {options.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}

          <p className="info" role="status" aria-label="Plan total">
            The day comes to about {fmt(plan.totals.kcal)} kcal and {Math.round(plan.totals.proteinG)} g protein (your target: {fmt(goal.kcal)} kcal,{' '}
            {goal.proteinG} g protein).
          </p>
          {plan.notes.map((n) => (
            <p key={n} className="muted">
              {n}
            </p>
          ))}
          <p className="muted disclaimer">{SUGGESTION_NOTE}</p>
          <div className="choice">
            <button
              type="button"
              className="primary"
              onClick={() => {
                onAccept({ plan, picks })
                setPhase('ask')
              }}
            >
              Use this plan
            </button>
            <button
              type="button"
              className="link"
              onClick={() => {
                onAccept(null)
                setPhase('no')
              }}
            >
              Not now
            </button>
          </div>
        </>
      )}
    </section>
  )
}
