import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { withMine, type FoodFinder } from '../food/finder'
import { memoryCustomFoodStore, type CustomFood, type CustomFoodStore, type NewCustomFood } from '../food/custom'
import { remaining, type DietTarget, type TargetStore, type TargetValues } from '../targets/types'
import { localDate, MEALS, shiftDate, totals, type LogEntry, type LogStore, type Meal, type NewLogEntry } from './types'
import { noAutoMealPlan, type DietPref } from '../profile/types'
import type { DietTag } from '../food/types'
import type { MealPlanStore, SavedMealPlan } from '../profile/mealPlanStore'
import { SyncNote } from '../sync/SyncNote'
import { useSync } from '../sync/useSync'
import { excludedTags, hasNonvegOff } from '../profile/dietRules'
import { dayExcluded, nonvegWeekday, vegDayReason, type DayChoice } from '../profile/nonvegDays'
import { EntryRow, MealSection } from './MealSection'
import { daysLogged, mealNow, weekStart } from './week'
import './log.css'

// The food search loads when first opened, to keep the first load small.
const AddFood = lazy(() => import('./AddFood').then((m) => ({ default: m.AddFood })))
const TodayPlan = lazy(() => import('./TodayPlan'))
const PlanEditor = lazy(() => import('./PlanEditor'))
const TargetsForm = lazy(() => import('../targets/TargetsForm').then((m) => ({ default: m.TargetsForm })))
const noWeight = () => Promise.resolve(null)

/** The person's diet answers, for non-veg-free days and the meal plan. */
export interface DietAnswers {
  dietPref: DietPref | null
  foodRules: string[]
  allergies: string[]
  /** The usual day from signup, for a new meal plan (T-061). */
  currentDiet?: { counts: Record<string, number> } | null
  /** Health answers: some mean a doctor or coach should plan meals. */
  medical?: Record<string, boolean>
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

// "Not now" on a weekly step hides it for the rest of the day, on this device.
const laterKey = (targetId: string, date: string) => `tmf:step-later:${targetId}:${date}`
function saidLater(targetId: string, date: string): boolean {
  try {
    return localStorage.getItem(laterKey(targetId, date)) === '1'
  } catch {
    return false
  }
}
function sayLater(targetId: string, date: string) {
  try {
    localStorage.setItem(laterKey(targetId, date), '1')
  } catch {
    // Not kept; it is hidden until the page reloads.
  }
}

/** A weekly calorie step the person can take (T-067a), or a reason to stay
 * at this level for now (T-067d). */
export interface StepOffer {
  values: TargetValues
  message: string
  hold?: boolean
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
  latestWeight = noWeight,
  nextStep,
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
  /** The latest weight, for a new meal plan; null when none is logged. */
  latestWeight?: () => Promise<number | null>
  /** The next weekly calorie step for the current target, if one is due. */
  nextStep?: (target: DietTarget) => Promise<StepOffer | null>
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
  const [planning, setPlanning] = useState(false)
  const [choice, setChoice] = useState<DayChoice>(() => readChoice(date))
  const [offer, setOffer] = useState<StepOffer | null>(null)
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
  const dietExcluded = useMemo(() => (diet ? excludedTags(diet.dietPref, diet.foodRules, diet.allergies) : new Set<DietTag>()), [diet])
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

  useEffect(() => {
    setOffer(null)
    if (!nextStep || !target || date !== today || saidLater(target.id, today)) return
    let live = true
    // A convenience: if it can't be worked out, nothing is offered.
    nextStep(target).then(
      (o) => live && setOffer(o),
      () => {},
    )
    return () => {
      live = false
    }
  }, [nextStep, target, date, today])

  const takeStep = async () => {
    if (!offer) return
    const saved = await targets!.save(offer.values, today, 'suggested')
    setOffer(null)
    setTarget(saved)
  }
  const stepLater = () => {
    if (target) sayLater(target.id, today)
    setOffer(null)
  }
  // Staying for now: the next check is a week away.
  const holdOk = () => {
    if (target) for (let d = 0; d < 7; d++) sayLater(target.id, shiftDate(today, d))
    setOffer(null)
  }

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

  // Days logged earlier this week, for the kind weekly count. Optional: no count if it fails.
  const [earlier, setEarlier] = useState<string[] | null>(null)
  useEffect(() => {
    const from = weekStart(today)
    if (!store.listRange || from >= today) return setEarlier([])
    store.listRange(from, shiftDate(today, -1)).then((es) => setEarlier(es.map((e) => e.loggedOn)), () => setEarlier(null))
  }, [store, today])

  /** Loads food search, recent foods and the person's own foods. */
  const prepareSearch = () => {
    if (!index) void loadFoods().then(setIndex)
    // Offers are a convenience: if they can't load, search still works.
    setRecent(null)
    store.recent().then(setRecent, () => setRecent([]))
    if (!myFoods) custom.list().then(setMyFoods, () => setMyFoods([]))
  }
  const openAdd = (meal: Meal) => {
    setAdding(meal)
    prepareSearch()
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
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <TargetsForm initial={target ?? null} onSave={saveTargets} onCancel={() => setEditingTargets(false)} />
        </Suspense>
      </main>
    )
  }

  if (planning && mealPlans) {
    return (
      <main className="log">
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <PlanEditor
            saved={saved}
            targets={target ? { kcal: target.kcal, proteinG: target.proteinG, carbG: target.carbG, fatG: target.fatG } : null}
            excluded={dietExcluded}
            blocked={!!diet?.medical && noAutoMealPlan(diet.medical)}
            counts={diet?.currentDiet?.counts ?? {}}
            loadWeight={latestWeight}
            search={{ index: allFoods, recent, myFoods: myFoods ?? [], prepare: prepareSearch, onCreate: createFood, onRemoveFood: removeFood }}
            onSave={async (plan, picks) => {
              setSaved(await mealPlans.save(plan, picks))
              setPlanning(false)
            }}
            onDelete={
              mealPlans.remove
                ? async () => {
                    await mealPlans.remove!()
                    setSaved(null)
                    setPlanning(false)
                  }
                : undefined
            }
            onClose={() => setPlanning(false)}
          />
        </Suspense>
      </main>
    )
  }

  if (adding) {
    return (
      <main className="log">
        <Suspense fallback={<p className="muted">Loading…</p>}>
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
        </Suspense>
      </main>
    )
  }

  const day = totals(entries ?? [])
  const week = earlier && date === today && entries ? daysLogged(earlier, today, entries.length > 0) : 0
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

      {/* With targets, the ring card shows the day, so the totals are for screen readers only. */}
      <dl className="macros day-total" data-quiet={targets && target ? '' : undefined} aria-label="Day total">
        <div><dt>Calories</dt><dd>{day.kcal}</dd></div>
        <div><dt>Protein</dt><dd>{day.proteinG} g</dd></div>
        <div><dt>Carbs</dt><dd>{day.carbG} g</dd></div>
        <div><dt>Fat</dt><dd>{day.fatG} g</dd></div>
      </dl>

      {targets && target && <LeftToday target={target} eaten={day} byCoach={!!userId && target.setBy !== userId} onEdit={() => setEditingTargets(true)} />}
      {week > 0 && (
        <p className="week" role="status" aria-label="This week">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6" /></svg>
          <span><strong>{week} of 7 days</strong> logged this week.</span>
        </p>
      )}
      {offer && (
        <p className="info" role="status" aria-label="Next step">
          {offer.message}{' '}
          {offer.hold ? (
            <button className="link" onClick={holdOk}>OK</button>
          ) : (
            <>
              <button className="link" onClick={() => void takeStep()}>Use it</button>{' '}
              <button className="link" onClick={stepLater}>Not now</button>
            </>
          )}
        </p>
      )}
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
      {!saved && mealPlans && target && (
        <button className="set-targets" onClick={() => setPlanning(true)}>
          Make a meal plan
        </button>
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
              onChangePlan={mealPlans ? () => setPlanning(true) : undefined}
              byCoach={!!userId && !!saved.createdBy && saved.createdBy !== userId}
            />
          </Suspense>
        ) : (
          <div className="meals">
            <h2>Meals</h2>
            {plainMeals}
          </div>
        ))}
      {entries && date === today && (
        <button className="fab" onClick={() => openAdd(mealNow(new Date()))}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Add food
        </button>
      )}
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
  // What is eaten, then how far it is from the target (T-133).
  const gap = (key: keyof TargetValues, unit: string) =>
    `${num(Math.abs(left[key]))}${unit} ${left[key] >= 0 ? 'left' : 'over'} of ${num(target[key])}${unit}`
  const bars: [string, keyof TargetValues][] = [
    ['Protein', 'proteinG'],
    ['Carbs', 'carbG'],
    ['Fat', 'fatG'],
  ]
  return (
    <section className="left" aria-label="Eaten today">
      <div className="calories" aria-label="Calories">
        <div className="ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="ring-track" cx="60" cy="60" r="52" />
            <circle className="ring-fill" cx="60" cy="60" r="52" pathLength="100" strokeDasharray={`${share(eaten.kcal, target.kcal)} 100`} />
          </svg>
          <span className="ring-text">
            <strong>{num(eaten.kcal)}</strong>
            <span>calories eaten</span>
          </span>
        </div>
        <small className="gap" data-over={left.kcal < 0 ? '' : undefined}>{gap('kcal', '')}</small>
      </div>
      <div className="bars">
        {bars.map(([name, key]) => (
          <div key={key} aria-label={name}>
            <span>
              <strong>{name} {num(eaten[key])} g</strong> eaten
            </span>
            <span className="bar" aria-hidden="true">
              <span style={{ width: `${share(eaten[key], target[key])}%` }} />
            </span>
            <small className="gap" data-over={left[key] < 0 ? '' : undefined}>{gap(key, ' g')}</small>
          </div>
        ))}
      </div>
      <footer>
        <span className="muted">{byCoach ? 'Targets set by your coach' : 'Your daily targets'}</span>
        <button className="link" onClick={onEdit}>Edit targets</button>
      </footer>
    </section>
  )
}

/** A number as people write it: 2,015 or 141.4. */
const num = (n: number) => (Math.round(n * 10) / 10).toLocaleString('en-IN')

/** How much of a target is eaten, as 0 to 100. */
const share = (eaten: number, target: number) => (target > 0 ? Math.min(100, Math.max(0, (eaten / target) * 100)) : 0)
