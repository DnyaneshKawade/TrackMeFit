// Changing the meal plan from the Food tab (spec T-061): amounts, swaps,
// removing and adding foods, with a check against the targets; or a new plan
// made the same way as at signup. Nothing is kept until the person saves.
// Loaded only when opened.

import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import type { Macros } from '../engine/diet'
import { MEALS, addFoundItem, emptyPlan, planCheck, removeItem, setItemGrams, swapItem, swapOptions, tidyPlan, type MealName, type MealPlan } from '../engine/mealPlan'
import type { DietTag } from '../food/types'
import type { CustomFood, NewCustomFood } from '../food/custom'
import type { FoodFinder } from '../food/finder'
import type { Food } from '../food/types'
import type { AcceptedMealPlan } from '../profile/MealPlanStep'
import type { SavedMealPlan } from '../profile/mealPlanStore'
import { PLAN_FOODS_BY_ID, planFoodsFor } from '../profile/planFoods'
import { ConfirmDelete } from '../ui/ConfirmDelete'
import { AddFood } from './AddFood'
import { PLAN_MEAL } from './planTicks'
import type { LogEntry, NewLogEntry } from './types'

/** The Food tab's food search, to add any food to the plan (T-061b). */
export interface PlanSearch {
  index: FoodFinder | null
  recent: LogEntry[] | null
  myFoods: CustomFood[]
  /** Starts loading the above. */
  prepare: () => void
  onCreate: (food: NewCustomFood) => Promise<Food>
  onRemoveFood: (id: string) => Promise<void>
}
import '../training/training.css'
import '../profile/profile.css'

const MealPlanStep = lazy(() => import('../profile/MealPlanStep'))

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN')

export default function PlanEditor({
  saved,
  name,
  targets,
  excluded,
  blocked,
  counts,
  loadWeight,
  search,
  onSave,
  onDelete,
  onClose,
}: {
  saved: SavedMealPlan | null
  /** The client's first name when their coach edits the plan (T-078). */
  name?: string
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
  search: PlanSearch
  onSave: (plan: MealPlan, picks: string[]) => Promise<void>
  /** Deletes the saved plan; only the person can, not their coach (T-129). */
  onDelete?: () => Promise<void>
  onClose: () => void
}) {
  const [mode, setMode] = useState<'edit' | 'new'>(saved ? 'edit' : 'new')
  const [plan, setPlan] = useState<MealPlan | null>(saved?.plan ?? null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState<MealName | null>(null)
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

  const whose = name ? `${name}’s` : 'your'
  const own = mode === 'edit' && !saved
  const title = mode === 'edit' ? (own ? `Build ${whose} own meal plan` : `Change ${whose} meal plan`) : name ? `New meal plan for ${name}` : 'New meal plan'
  const empty = !plan || plan.meals.every((m) => m.items.length === 0)
  const buildOwn = () => {
    if (!targets) return
    setPlan(emptyPlan(targets))
    setMode('edit')
  }

  if (adding && plan) {
    const meal = adding
    const addFound = async (e: NewLogEntry) => {
      const food = (await search.index?.byIds([e.foodId]).catch(() => null))?.get(e.foodId)
      const macros = { kcal: e.kcal, proteinG: e.proteinG, carbG: e.carbG, fatG: e.fatG }
      setPlan(addFoundItem(plan, meal, { foodId: e.foodId, name: e.foodName, grams: e.grams ?? 0, macros, tags: food?.tags }))
      setAdding(null)
    }
    return (
      <AddFood
        meal={PLAN_MEAL[meal]}
        target={`${meal} in ${whose} plan`}
        quickAdd={false}
        date=""
        index={search.index}
        recent={search.recent}
        myFoods={search.myFoods}
        onAdd={addFound}
        onCreate={search.onCreate}
        onRemoveFood={search.onRemoveFood}
        onClose={() => setAdding(null)}
      />
    )
  }

  return (
    <section className="plan-editor meal-plan" aria-label={title}>
      <header className="sheet-head">
        <h2>{title}</h2>
        <button className="link" onClick={onClose}>Cancel</button>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      {mode === 'edit' && plan ? (
        <EditPlan
          plan={plan}
          foods={foods}
          goal={targets ?? plan.targets}
          onChange={setPlan}
          onAdd={(meal) => {
            search.prepare()
            setAdding(meal)
          }}
        />
      ) : (
        <>
          {targets && (
            <div className="own-plan">
              <button className="secondary" onClick={buildOwn}>Build my own plan</button>
              <p className="muted">Start with empty meals and add each food yourself.</p>
            </div>
          )}
          <NewPlan targets={targets} excluded={excluded} blocked={blocked} counts={counts} loadWeight={loadWeight} onAccept={(a) => void save(a.plan, a.picks)} />
        </>
      )}
      {mode === 'edit' && plan && (
        <div className="editor-actions">
          <button className="primary" disabled={busy || empty} onClick={() => void save(plan, saved?.picks ?? [])}>
            Save plan
          </button>
          {empty && <p className="muted">Add at least one food to save the plan.</p>}
          <button className="link" onClick={() => setMode('new')}>
            Make a new plan
          </button>
          {saved && onDelete && (
            <ConfirmDelete label="Delete meal plan" danger question="Delete your meal plan? Foods you already logged stay. You can’t undo this." onConfirm={onDelete} />
          )}
        </div>
      )}
    </section>
  )
}

function EditPlan({
  plan,
  foods,
  goal,
  onChange,
  onAdd,
}: {
  plan: MealPlan
  foods: ReturnType<typeof planFoodsFor>
  goal: Macros
  onChange: (p: MealPlan) => void
  onAdd: (meal: MealName) => void
}) {
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
            <button className="add" onClick={() => onAdd(name)}>
              + Add a food
            </button>
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
