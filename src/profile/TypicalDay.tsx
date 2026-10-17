import { useEffect, useMemo, useState } from 'react'
import { memoryCustomFoodStore, type CustomFood } from '../food/custom'
import type { FoodFinder } from '../food/finder'
import { AddFood } from '../log/AddFood'
import { QUICK_ADD_ID, type LogEntry, type NewLogEntry } from '../log/types'
import { DIET_ITEMS, MAX_COUNT, checkCustom, describeDiet, estimateDiet, type DietExtra, type DietItem } from './currentDiet'

const NO_RECENT: LogEntry[] = []
const NO_FOODS: CustomFood[] = []

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const set = (v: number) => onChange(Math.max(0, Math.min(MAX_COUNT, v)))
  return (
    <span className="stepper">
      <button type="button" aria-label={`Less ${label}`} onClick={() => set(value - 1)} disabled={!value}>
        −
      </button>
      <output aria-label={`${label} per day`}>{value}</output>
      <button type="button" aria-label={`More ${label}`} onClick={() => set(value + 1)}>
        +
      </button>
    </span>
  )
}

/** Counts of everyday foods, plus any other food from the database or the
 * person's own entry, with a running estimate. */
export function TypicalDay({
  items = DIET_ITEMS,
  counts,
  extras,
  weightKg,
  loadFoods,
  onChange,
}: {
  /** Everyday foods to show, already filtered by diet (dietItemsFor). */
  items?: DietItem[]
  counts: Record<string, number>
  extras: DietExtra[]
  weightKg: number
  loadFoods?: () => Promise<FoodFinder>
  onChange: (counts: Record<string, number>, extras: DietExtra[]) => void
}) {
  const [adding, setAdding] = useState<'search' | 'custom' | null>(null)
  const [index, setIndex] = useState<FoodFinder | null>(null)
  const [indexError, setIndexError] = useState(false)
  const [custom, setCustom] = useState({ name: '', kcal: '', protein: '' })
  const [customError, setCustomError] = useState<string | null>(null)

  useEffect(() => {
    if (adding !== 'search' || index || !loadFoods) return
    let live = true
    loadFoods().then(
      (i) => live && setIndex(i),
      () => live && setIndexError(true),
    )
    return () => {
      live = false
    }
  }, [adding, index, loadFoods])

  // Foods made with "New food" here are kept only in the usual day.
  const created = useMemo(() => memoryCustomFoodStore(), [])
  const diet = estimateDiet(counts, extras, items)

  const setExtraCount = (id: string, count: number) =>
    onChange(
      counts,
      count ? extras.map((e) => (e.id === id ? { ...e, count } : e)) : extras.filter((e) => e.id !== id),
    )

  const addExtra = (e: DietExtra) => {
    const existing = extras.find((x) => x.id === e.id)
    onChange(counts, existing ? extras.map((x) => (x.id === e.id ? { ...x, count: Math.min(MAX_COUNT, x.count + 1) } : x)) : [...extras, e])
    setAdding(null)
  }

  /** A food from the Add food page as one usual-day item, with its tags. */
  const extraFromEntry = async (e: NewLogEntry): Promise<DietExtra> => {
    if (e.foodId === QUICK_ADD_ID) {
      const n = extras.filter((x) => x.id.startsWith('custom:')).length + 1
      return { id: `custom:${n}:${e.foodName}`, name: e.foodName, portion: 'your amount', kcal: e.kcal, proteinG: e.proteinG, count: 1 }
    }
    const food = (await index?.byIds([e.foodId]).catch(() => null))?.get(e.foodId)
    // One of the food's portions keeps its name; the first keeps the plain id.
    const portion = food?.portions.find((p) => p.grams === e.grams)
    const id = portion && portion === food?.portions[0] ? e.foodId : `${e.foodId}:${e.grams}`
    const x: DietExtra = { id, name: e.foodName, portion: portion?.label ?? `${e.grams} g`, kcal: e.kcal, proteinG: e.proteinG, count: 1 }
    if (food?.tags?.length) x.tags = food.tags
    return x
  }

  const addCustom = () => {
    const problem = checkCustom(custom.name, custom.kcal, custom.protein)
    setCustomError(problem)
    if (problem) return
    const n = extras.filter((e) => e.id.startsWith('custom:')).length + 1
    addExtra({
      id: `custom:${n}:${custom.name.trim()}`,
      name: custom.name.trim(),
      portion: 'your amount',
      kcal: Math.round(Number(custom.kcal)),
      proteinG: custom.protein.trim() ? Math.round(Number(custom.protein) * 10) / 10 : 0,
      count: 1,
    })
    setCustom({ name: '', kcal: '', protein: '' })
  }

  return (
    <>
      <p className="muted">About what you eat on a usual day, all meals together. A guess is fine.</p>
      <ul className="counters">
        {items.map((item) => (
          <li key={item.id}>
            <span>
              {item.label}
              <small className="muted">
                {item.portion}, {item.grams} g
              </small>
            </span>
            <Stepper label={item.label} value={counts[item.id] ?? 0} onChange={(n) => onChange({ ...counts, [item.id]: n }, extras)} />
          </li>
        ))}
        {extras.map((e) => (
          <li key={e.id}>
            <span>
              {e.name}
              <small className="muted">
                {e.portion}, {e.kcal} kcal
              </small>
            </span>
            <Stepper label={e.name} value={e.count} onChange={(n) => setExtraCount(e.id, n)} />
          </li>
        ))}
      </ul>

      {adding === null && (
        <div className="add-other">
          {loadFoods && (
            <button type="button" className="add" onClick={() => setAdding('search')}>
              + Add another food
            </button>
          )}
          <button type="button" className="link" onClick={() => setAdding('custom')}>
            Can’t find it? Enter it yourself
          </button>
        </div>
      )}

      {adding === 'search' && (
        <AddFood
          meal="snacks"
          target="your usual day"
          date=""
          index={index}
          recent={NO_RECENT}
          myFoods={NO_FOODS}
          onAdd={async (entry) => addExtra(await extraFromEntry(entry))}
          onCreate={(food) => created.add(food)}
          onRemoveFood={async () => undefined}
          onClose={() => setAdding(null)}
        />
      )}
      {adding === 'search' && indexError && <p className="error">Couldn’t load the food list. Check your connection, or enter it yourself.</p>}

      {adding === 'custom' && (
        <section className="add-panel" aria-label="Enter a food yourself">
          <p className="muted">For anything not in our list. Give the total for a usual day.</p>
          <label className="field">
            <span>Food</span>
            <input aria-label="Food name" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
          </label>
          <div className="two">
            <label className="field">
              <span>Calories a day</span>
              <input aria-label="Calories a day" inputMode="numeric" value={custom.kcal} onChange={(e) => setCustom({ ...custom, kcal: e.target.value })} />
            </label>
            <label className="field">
              <span>Protein (g, optional)</span>
              <input aria-label="Protein (g, optional)" inputMode="decimal" value={custom.protein} onChange={(e) => setCustom({ ...custom, protein: e.target.value })} />
            </label>
          </div>
          {customError && <p className="error">{customError}</p>}
          <button type="button" className="primary" onClick={addCustom}>
            Add
          </button>
          <button type="button" className="link" onClick={() => setAdding(null)}>
            Cancel
          </button>
        </section>
      )}

      <p className="info" role="status" aria-label="Usual day">
        {describeDiet(diet, weightKg)}
      </p>
    </>
  )
}
