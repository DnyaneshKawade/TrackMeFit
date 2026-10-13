// Changing the meal plan from the Food tab (spec T-061): amounts, swaps,
// removing and adding foods, with a check against the targets; or a new plan
// made the same way as at signup. Nothing is kept until the person saves.
// Loaded only when opened.

import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import type { Macros } from '../engine/diet'
import { MEALS, addItem, planCheck, removeItem, setItemGrams, swapItem, swapOptions, tidyPlan, type MealName, type MealPlan } from '../engine/mealPlan'
import type { DietTag } from '../food/types'
import type { AcceptedMealPlan } from '../profile/MealPlanStep'
import type { SavedMealPlan } from '../profile/mealPlanStore'
import { PLAN_FOODS_BY_ID, planFoodsFor } from '../profile/planFoods'
import '../training/training.css'
import '../profile/profile.css'

const MealPlanStep = lazy(() => import('../profile/MealPlanStep'))

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN')

export default function PlanEditor({
  saved,
  targets,
  excluded,
  blocked,
  counts,
  loadWeight,
  onSave,
  onClose,
}: {
  saved: SavedMealPlan | null
  /** Today's calorie and macro targets; null when none are set. */
  targets: Macros | null
  /** Foods the person's diet leaves out (not the day's veg rule). */
  excluded: Set<DietTag>
  /** The health check said a doctor or coach should plan meals. */
  blocked: boolean
  /** The usual day from signup, for a new plan. */
  counts: Record<string, number>
  /** The latest weight, for a new plan; null when none is logged. */
  loadWeight: () => Promise<number | null>
  onSave: (plan: MealPlan, picks: string[]) => Promise<void>
  onClose: () => void
}) {
  const [mode, setMode] = useState<'edit' | 'new'>(saved ? 'edit' : 'new')
  const [plan, setPlan] = useState<MealPlan | null>(saved?.plan ?? null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const foods = useMemo(() => planFoodsFor(excluded), [excluded])

  const save = async (p: MealPlan, picks: string[]) => {
    setBusy(true)
    setError(null)
    try {
      await onSave(tidyPlan(p), picks)
    } catch {
      setError('Couldn’t save the plan. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="plan-editor meal-plan" aria-label={mode === 'edit' ? 'Change your meal plan' : 'New meal plan'}>
      <header className="sheet-head">
        <h2>{mode === 'edit' ? 'Change your meal plan' : 'New meal plan'}</h2>
        <button className="link" onClick={onClose}>Cancel</button>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      {mode === 'edit' && plan ? (
        <EditPlan plan={plan} foods={foods} goal={targets ?? plan.targets} onChange={setPlan} />
      ) : (
        <NewPlan targets={targets} excluded={excluded} blocked={blocked} counts={counts} loadWeight={loadWeight} onAccept={(a) => void save(a.plan, a.picks)} />
      )}
      {mode === 'edit' && plan && (
        <div className="editor-actions">
          <button className="primary" disabled={busy} onClick={() => void save(plan, saved!.picks)}>
            Save plan
          </button>
          <button className="link" onClick={() => setMode('new')}>
            Make a new plan
          </button>
        </div>
      )}
    </section>
  )
}

function EditPlan({ plan, foods, goal, onChange }: { plan: MealPlan; foods: ReturnType<typeof planFoodsFor>; goal: Macros; onChange: (p: MealPlan) => void }) {
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const byMeal = new Map(plan.meals.map((m) => [m.name, m]))
  return (
    <>
      <p className="info" role="status" aria-label="Plan check">
        The day comes to about {fmt(plan.totals.kcal)} kcal and {Math.round(plan.totals.proteinG)} g protein. {planCheck(plan.totals, goal)}
      </p>
      {MEALS.map((name: MealName) => {
        const items = byMeal.get(name)?.items ?? []
        return (
          <section key={name} className="plan-meal" aria-label={name}>
            <h3>{name}</h3>
            <ul className="plan-items">
              {items.map((i, index) => {
                const f = PLAN_FOODS_BY_ID.get(i.foodId)
                const key = `${name}:${index}:${i.foodId}`
                const text = amounts[key] ?? String(i.grams)
                const commit = () => {
                  const g = Number(text.replace(',', '.'))
                  setAmounts((a) => {
                    const next = { ...a }
                    delete next[key]
                    return next
                  })
                  if (g > 0 && g !== i.grams) onChange(setItemGrams(plan, name, index, g, foods))
                }
                const options = f ? swapOptions(f, foods) : []
                return (
                  <li key={key}>
                    <span>
                      <strong>{i.name}</strong>{' '}
                      <input
                        className="grams"
                        aria-label={`${i.name} grams at ${name}`}
                        inputMode="decimal"
                        value={text}
                        onChange={(e) => setAmounts({ ...amounts, [key]: e.target.value })}
                        onBlur={commit}
                        onKeyDown={(e) => e.key === 'Enter' && commit()}
                      />{' '}
                      g {i.weighed}
                      {i.hint && <span className="muted">, {i.hint}</span>}
                      <small className="muted reason">
                        {fmt(i.macros.kcal)} kcal, {Math.round(i.macros.proteinG)} g protein. {i.reason}
                      </small>
                    </span>
                    <span className="item-actions">
                      {options.length > 0 && (
                        <select aria-label={`Swap ${i.name} at ${name}`} value="" onChange={(e) => e.target.value && onChange(swapItem(plan, name, i.foodId, PLAN_FOODS_BY_ID.get(e.target.value)!, foods))}>
                          <option value="">Swap</option>
                          {options.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <button className="link" aria-label={`Remove ${i.name} from ${name}`} onClick={() => onChange(removeItem(plan, name, index))}>
                        Remove
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
            <select className="add-food" aria-label={`Add a food to ${name}`} value="" onChange={(e) => e.target.value && onChange(addItem(plan, name, PLAN_FOODS_BY_ID.get(e.target.value)!))}>
              <option value="">+ Add a food</option>
              {foods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </section>
        )
      })}
    </>
  )
}

function NewPlan({
  targets,
  excluded,
  blocked,
  counts,
  loadWeight,
  onAccept,
}: {
  targets: Macros | null
  excluded: Set<DietTag>
  blocked: boolean
  counts: Record<string, number>
  loadWeight: () => Promise<number | null>
  onAccept: (a: AcceptedMealPlan) => void
}) {
  const [weight, setWeight] = useState<number | null | undefined>(undefined)
  const [typed, setTyped] = useState('')
  useEffect(() => {
    let live = true
    loadWeight().then(
      (w) => live && setWeight(w),
      () => live && setWeight(null),
    )
    return () => {
      live = false
    }
  }, [loadWeight])

  if (!targets) return <p className="info">Set your daily targets first. The plan is made to fit them.</p>
  if (weight === undefined) return <p className="muted">Loading…</p>
  if (weight === null && !blocked) {
    const kg = Number(typed.replace(',', '.'))
    return (
      <form
        className="set-row"
        onSubmit={(e) => {
          e.preventDefault()
          if (kg >= 25 && kg <= 300) setWeight(kg)
        }}
      >
        <label>
          Your weight today (kg){' '}
          <input inputMode="decimal" value={typed} onChange={(e) => setTyped(e.target.value)} />
        </label>
        <button className="primary" disabled={!(kg >= 25 && kg <= 300)}>
          Next
        </button>
      </form>
    )
  }
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <MealPlanStep
        targets={targets}
        weightKg={weight ?? 0}
        counts={counts}
        excluded={excluded}
        blocked={blocked}
        accepted={null}
        start="pick"
        onAccept={(a) => a && onAccept(a)}
      />
    </Suspense>
  )
}
