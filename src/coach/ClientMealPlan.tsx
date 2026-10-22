// A client's meal plan on their coach's page (spec T-078): what it is, who
// saved it, and the same editor the client uses. Row-level security lets
// only the active, approved coach save it.

import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import type { FoodFinder } from '../food/finder'
import type { DietTag } from '../food/types'
import { excludedTags } from '../profile/dietRules'
import type { MealPlanStore, SavedMealPlan } from '../profile/mealPlanStore'
import type { ProfileInfo, ProfileStore } from '../profile/types'
import type { ProgressStore } from '../progress/types'
import type { DietTarget } from '../targets/types'

const PlanEditor = lazy(() => import('../log/PlanEditor'))

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN')

export function ClientMealPlan({
  mealPlans,
  profile,
  progress,
  target,
  coachId,
  first,
  loadFoods,
}: {
  mealPlans: MealPlanStore
  profile: ProfileStore
  progress: ProgressStore
  /** The client's targets today; null when none are set. */
  target: DietTarget | null
  coachId: string
  first: string
  loadFoods?: () => Promise<FoodFinder>
}) {
  const [saved, setSaved] = useState<SavedMealPlan | null | undefined>(undefined)
  const [info, setInfo] = useState<ProfileInfo | null>(null)
  const [editing, setEditing] = useState(false)
  const [index, setIndex] = useState<FoodFinder | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    mealPlans.latest().then(setSaved, () => (setSaved(null), setError('Couldn’t load the meal plan. Check your connection.')))
    profile.get().then(setInfo, () => setInfo(null))
  }, [mealPlans, profile])

  // The client's food rules: veg, allergies and foods they don't eat.
  const excluded = useMemo(() => (info ? excludedTags(info.dietPref, info.foodRules, info.allergies) : new Set<DietTag>()), [info])

  if (editing) {
    return (
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <PlanEditor
          saved={saved ?? null}
          name={first}
          targets={target ? { kcal: target.kcal, proteinG: target.proteinG, carbG: target.carbG, fatG: target.fatG } : null}
          excluded={excluded}
          // The health check asks for a doctor or coach to plan meals; this is the coach.
          blocked={false}
          counts={info?.currentDiet?.counts ?? {}}
          loadWeight={async () => {
            const list = await progress.weighIns()
            return list.length ? list[list.length - 1].kg : null
          }}
          search={{
            index,
            recent: [],
            myFoods: [],
            prepare: () => void (!index && loadFoods?.().then(setIndex)),
            onCreate: () => Promise.reject(new Error(`Only ${first} can add new foods.`)),
            onRemoveFood: () => Promise.resolve(),
          }}
          onSave={async (plan, picks) => {
            setSaved(await mealPlans.save(plan, picks))
            setEditing(false)
          }}
          onClose={() => setEditing(false)}
        />
      </Suspense>
    )
  }

  return (
    <section aria-label="Meal plan">
      <h3>Meal plan</h3>
      {error && <p className="error" role="alert">{error}</p>}
      {saved === undefined ? (
        <p className="muted">Loading…</p>
      ) : saved ? (
        <>
          <p>
            About {fmt(saved.plan.totals.kcal)} calories and {fmt(saved.plan.totals.proteinG)} g protein a day.
          </p>
          <p className="muted">
            {saved.createdBy === coachId ? 'Set by you' : saved.createdBy ? `Set by ${first}` : 'Set'} on {shortDate(saved.createdAt)}.
          </p>
        </>
      ) : (
        <p className="muted">No meal plan yet.</p>
      )}
      {saved !== undefined && (
        <button className="link" onClick={() => setEditing(true)}>
          {saved ? 'Change meal plan' : 'Make a meal plan'}
        </button>
      )}
    </section>
  )
}
