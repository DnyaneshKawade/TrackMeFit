import { useCallback, useEffect, useMemo, useState } from 'react'
import { withFoods, type SearchIndex } from '../food/search'
import { memoryCustomFoodStore, type CustomFood, type CustomFoodStore, type NewCustomFood } from '../food/custom'
import { AddFood } from './AddFood'
import { TargetsForm } from '../targets/TargetsForm'
import { remaining, type DietTarget, type TargetStore, type TargetValues } from '../targets/types'
import { amountLabel, localDate, MEAL_NAMES, MEALS, shiftDate, totals, type LogEntry, type LogStore, type Meal, type NewLogEntry } from './types'
import './log.css'

function dayLabel(date: string, today: string): string {
  if (date === today) return 'Today'
  if (date === shiftDate(today, -1)) return 'Yesterday'
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function FoodLog({
  store,
  loadIndex,
  foods: foodStore,
  targets,
  userId,
  today = localDate(),
}: {
  store: LogStore
  loadIndex: () => Promise<SearchIndex>
  /** The person's own foods and recipes. */
  foods?: CustomFoodStore
  targets?: TargetStore
  userId?: string
  today?: string
}) {
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<LogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState<Meal | null>(null)
  const [index, setIndex] = useState<SearchIndex | null>(null)
  const [target, setTarget] = useState<DietTarget | null | undefined>(undefined)
  const [editingTargets, setEditingTargets] = useState(false)
  const [recent, setRecent] = useState<LogEntry[] | null>(null)
  const [myFoods, setMyFoods] = useState<CustomFood[] | null>(null)
  const [fallbackFoods] = useState(() => memoryCustomFoodStore())
  const custom = foodStore ?? fallbackFoods
  const allFoods = useMemo(() => (index ? withFoods(index, myFoods ?? []) : null), [index, myFoods])

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
    if (!index) void loadIndex().then(setIndex)
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
        />
      </main>
    )
  }

  const day = totals(entries ?? [])
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

      {error && <p className="error" role="alert">{error}</p>}
      {entries === null && <p className="muted">Loading…</p>}

      {entries &&
        MEALS.map((meal) => {
          const items = entries.filter((e) => e.meal === meal)
          return (
            <section key={meal} className="meal" aria-label={MEAL_NAMES[meal]}>
              <header>
                <h3>{MEAL_NAMES[meal]}</h3>
                <span className="muted">{totals(items).kcal} kcal</span>
              </header>
              <ul>
                {items.map((e) => (
                  <li key={e.id}>
                    <div>
                      <span>{e.foodName}</span>
                      <span className="muted">
                        {amountLabel(e)} · {e.kcal} kcal · P {e.proteinG} · C {e.carbG} · F {e.fatG}
                      </span>
                    </div>
                    <button className="link" aria-label={`Remove ${e.foodName}`} onClick={() => void remove(e.id)}>✕</button>
                  </li>
                ))}
              </ul>
              <button className="add" onClick={() => openAdd(meal)}>+ Add food</button>
            </section>
          )
        })}
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
