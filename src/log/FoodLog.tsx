import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { withMine, type FoodFinder } from '../food/finder'
import { memoryCustomFoodStore, type CustomFood, type CustomFoodStore, type NewCustomFood } from '../food/custom'
import { AddFood } from './AddFood'
import { TargetsForm } from '../targets/TargetsForm'
import { remaining, type DietTarget, type TargetStore, type TargetValues } from '../targets/types'
import { localDate, MEALS, shiftDate, totals, type LogEntry, type LogStore, type Meal, type NewLogEntry } from './types'
import type { DietPref } from '../profile/types'
import type { MealPlanStore, SavedMealPlan } from '../profile/mealPlanStore'
import { SyncNote } from '../sync/SyncNote'
import { useSync } from '../sync/useSync'
import { excludedTags, hasNonvegOff } from '../profile/dietRules'
import { dayExcluded, nonvegWeekday, vegDayReason, type DayChoice } from '../profile/nonvegDays'
import { EntryRow, MealSection } from './MealSection'
import './log.css'

const TodayPlan = lazy(() => import('./TodayPlan'))

/** The person's diet answers, for non-veg-free days and the meal plan. */
export interface DietAnswers {
  dietPref: DietPref | null
  foodRules: string[]
  allergies: string[]
}

// "Make today a veg day" and "I’m eating non-veg today" are a per-device
// convenience for one date; storage may be off.
const choiceKey = (date: string) => `tmf:veg-day:${date}`
function readChoice(date: string): DayChoice {
  try {
    const v = localStorage.getItem(choiceKey(date))
    return v === 'veg' || v === 'nonveg' ? v : null
  } catch {
    return null
  }
}
function writeChoice(date: string, choice: DayChoice) {
  try {
    if (choice) localStorage.setItem(choiceKey(date), choice)
    else localStorage.removeItem(choiceKey(date))
  } catch {
    // Not kept; the choice still applies until the page reloads.
  }
}

function dayLabel(date: string, today: string): string {
  if (date === today) return 'Today'
  if (date === shiftDate(today, -1)) return 'Yesterday'
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function FoodLog({
  store,
  loadFoods,
  foods: foodStore,
  targets,
  userId,
  diet,
  mealPlans,
  today = localDate(),
}: {
  store: LogStore
  /** Food search: the database, or the bundled list as a backup. */
  loadFoods: () => Promise<FoodFinder>
  /** The person's own foods and recipes. */
  foods?: CustomFoodStore
  targets?: TargetStore
  userId?: string
  diet?: DietAnswers
  mealPlans?: MealPlanStore | null
  today?: string
}) {
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<LogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState<Meal | null>(null)
  const [index, setIndex] = useState<FoodFinder | null>(null)
  const [target, setTarget] = useState<DietTarget | null | undefined>(undefined)
  const [editingTargets, setEditingTargets] = useState(false)
  const [recent, setRecent] = useState<LogEntry[] | null>(null)
  const [myFoods, setMyFoods] = useState<CustomFood[] | null>(null)
  const [fallbackFoods] = useState(() => memoryCustomFoodStore())
  const custom = foodStore ?? fallbackFoods
  const allFoods = useMemo(() => (index ? withMine(index, myFoods ?? []) : null), [index, myFoods])
  const [saved, setSaved] = useState<SavedMealPlan | null>(null)
  const [choice, setChoice] = useState<DayChoice>(() => readChoice(date))
  // Entries waiting on the phone to sync (T-027).
  const sync = store.sync
  const { pending } = useSync(sync)
  useEffect(() => setChoice(readChoice(date)), [date])
  const eatsNonveg = !!diet && hasNonvegOff(diet.dietPref)
  const weekday = eatsNonveg ? nonvegWeekday(date, diet!.foodRules) : null
  const vegReason = eatsNonveg ? vegDayReason(date, diet!.foodRules, choice) : null
  const vegWhy = vegReason === null ? null : weekday && choice !== 'veg' ? `${weekday} is your non-veg-free day` : 'You made today a veg day'
  const excluded = useMemo(
    () => dayExcluded(diet ? excludedTags(diet.dietPref, diet.foodRules, diet.allergies) : new Set(), vegReason !== null),
    [diet, vegReason],
  )
  const nonvegNote = vegWhy ? `${vegWhy}. ${excluded.has('dairy') ? 'Dal or soya' : 'Paneer, dal or soya'} would fit instead. It’s your choice.` : null

  useEffect(() => {
    if (!mealPlans) return
    let live = true
    // The plan is a convenience: if it can't load, the log still works.
    mealPlans.latest().then(
      (p) => live && setSaved(p),
      () => live && setSaved(null),
    )
    return () => {
      live = false
    }
  }, [mealPlans])

  const choose = (next: DayChoice) => {
    writeChoice(date, next)
    setChoice(next)
  }

  useEffect(() => {
    if (!targets) return
    let live = true
    setTarget(undefined)
    targets.forDate(date).then(
      (t) => live && setTarget(t),
      () => live && setTarget(null),
    )
    return () => {
      live = false
    }
  }, [targets, date])

  const saveTargets = async (v: TargetValues) => {
    const saved = await targets!.save(v, today)
    if (date >= today) setTarget(saved)
    setEditingTargets(false)
  }

  const load = useCallback(async () => {
    setError(null)
    try {
      setEntries(await store.listDay(date))
    } catch {
      setEntries([])
      setError('Couldn’t load this day. Check your connection.')
    }
  }, [store, date])

  useEffect(() => {
    setEntries(null)
    void load()
  }, [load])

  const openAdd = (meal: Meal) => {
    setAdding(meal)
    if (!index) void loadFoods().then(setIndex)
    // Offers are a convenience: if they can't load, search still works.
    setRecent(null)
    store.recent().then(setRecent, () => setRecent([]))
    if (!myFoods) custom.list().then(setMyFoods, () => setMyFoods([]))
  }

  const add = async (entry: NewLogEntry) => {
    const saved = await store.add(entry)
    if (saved.loggedOn === date) setEntries((list) => [...(list ?? []), saved])
    setAdding(null)
  }

  const createFood = async (food: NewCustomFood) => {
    const saved = await custom.add(food)
    setMyFoods((list) => [saved, ...(list ?? [])])
    return saved
  }

  const removeFood = async (id: string) => {
    await custom.remove(id)
    setMyFoods((list) => (list ?? []).filter((f) => f.id !== id))
  }

  // Ticking the meal plan (T-060): log or remove entries one by one, in order,
  // so a lost connection leaves the day as far as it got.
  const tick = async (add: NewLogEntry[], removeIds: string[]) => {
    try {
      for (const id of removeIds) {
        await store.remove(id)
        setEntries((list) => (list ?? []).filter((e) => e.id !== id))
      }
      for (const entry of add) {
        const saved = await store.add(entry)
        setEntries((list) => [...(list ?? []), saved])
      }
    } catch {
      setError('Couldn’t update the plan ticks. Try again.')
    }
  }

  const remove = async (id: string) => {
    try {
      await store.remove(id)
      setEntries((list) => (list ?? []).filter((e) => e.id !== id))
    } catch {
      setError('Couldn’t remove that. Try again.')
    }
  }

  if (editingTargets) {
    return (
      <main className="log">
        <TargetsForm initial={target ?? null} onSave={saveTargets} onCancel={() => setEditingTargets(false)} />
      </main>
    )
  }

  if (adding) {
    return (
      <main className="log">
        <AddFood
          meal={adding}
          date={date}
          index={allFoods}
          recent={recent}
          myFoods={myFoods ?? []}
          onAdd={add}
          onCreate={createFood}
          onRemoveFood={removeFood}
          onClose={() => setAdding(null)}
          nonvegOff={nonvegNote}
        />
      </main>
    )
  }

  const day = totals(entries ?? [])
  const plainMeals = MEALS.map((meal) => {
    const items = (entries ?? []).filter((e) => e.meal === meal)
    return (
      <MealSection key={meal} meal={meal} entries={items} onAdd={() => openAdd(meal)}>
        {items.map((e) => (
          <EntryRow key={e.id} entry={e} pending={pending.has(e.id)} onRemove={() => void remove(e.id)} />
        ))}
      </MealSection>
    )
  })
  return (
    <main className="log">
      <nav className="day-nav">
        <button aria-label="Previous day" onClick={() => setDate(shiftDate(date, -1))}>‹</button>
        <h2>{dayLabel(date, today)}</h2>
        <button aria-label="Next day" disabled={date >= today} onClick={() => setDate(shiftDate(date, 1))}>›</button>
      </nav>

      <dl className="macros day-total" aria-label="Day total">
        <div><dt>Calories</dt><dd>{day.kcal}</dd></div>
        <div><dt>Protein</dt><dd>{day.proteinG} g</dd></div>
        <div><dt>Carbs</dt><dd>{day.carbG} g</dd></div>
        <div><dt>Fat</dt><dd>{day.fatG} g</dd></div>
      </dl>

      {targets && target && <LeftToday target={target} eaten={day} byCoach={!!userId && target.setBy !== userId} onEdit={() => setEditingTargets(true)} />}
      {targets && target === null && (
        <button className="set-targets" onClick={() => setEditingTargets(true)}>Set your daily targets</button>
      )}

      {eatsNonveg && (
        <p className="info" role="status" aria-label="Veg day">
          {vegWhy ? `${vegWhy}.` : weekday ? `${weekday} is usually a veg day, but you’re eating non-veg today.` : null}{' '}
          {vegWhy ? (
            weekday && choice !== 'veg' ? (
              <button className="link" onClick={() => choose('nonveg')}>I’m eating non-veg today</button>
            ) : (
              <button className="link" onClick={() => choose(null)}>Not a veg day</button>
            )
          ) : weekday ? (
            <button className="link" onClick={() => choose(null)}>Make it a veg day again</button>
          ) : (
            <button className="link" onClick={() => choose('veg')}>Make today a veg day</button>
          )}
        </p>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <SyncNote sync={sync} noun={['entry', 'entries']} />
      {entries === null && <p className="muted">Loading…</p>}

      {entries &&
        (saved ? (
          <Suspense fallback={plainMeals}>
            <TodayPlan
              saved={saved}
              excluded={excluded}
              vegWhy={vegWhy}
              date={date}
              entries={entries}
              pending={pending}
              onTick={tick}
              onRemove={(id) => void remove(id)}
              onAdd={openAdd}
            />
          </Suspense>
        ) : (
          plainMeals
        ))}
    </main>
  )
}

function LeftToday({
  target,
  eaten,
  byCoach,
  onEdit,
}: {
  target: DietTarget
  eaten: TargetValues
  byCoach: boolean
  onEdit: () => void
}) {
  const left = remaining(target, eaten)
  const amount = (n: number, unit: string) => (n >= 0 ? `${n}${unit} left` : `${-n}${unit} over`)
  return (
    <section className="left" aria-label="Left for the day">
      <header>
        <span className={left.kcal < 0 ? 'big over' : 'big'}>{amount(left.kcal, ' kcal')}</span>
        <button className="link" onClick={onEdit}>Edit targets</button>
      </header>
      <span className="muted">
        of {target.kcal} kcal{byCoach ? ' · set by your coach' : ''}
      </span>
      <div className="bars">
        <span>Protein {amount(left.proteinG, ' g')}</span>
        <span>Carbs {amount(left.carbG, ' g')}</span>
        <span>Fat {amount(left.fatG, ' g')}</span>
      </div>
    </section>
  )
}
