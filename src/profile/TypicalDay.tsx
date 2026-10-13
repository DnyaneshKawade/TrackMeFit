import { useEffect, useMemo, useState } from 'react'
import type { FoodFinder } from '../food/finder'
import { useFoodSearch } from '../food/useFoodSearch'
import type { DietTag } from '../food/types'
import { DIET_ITEMS, MAX_COUNT, checkCustom, describeDiet, estimateDiet, extraFromFood, type DietExtra, type DietItem } from './currentDiet'
import { allowedFoods } from './dietRules'

const NOTHING_EXCLUDED = new Set<DietTag>()

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
  excluded = NOTHING_EXCLUDED,
  counts,
  extras,
  weightKg,
  loadFoods,
  onChange,
}: {
  /** Everyday foods to show, already filtered by diet (dietItemsFor). */
  items?: DietItem[]
  /** What the diet leaves out; search results follow it too. */
  excluded?: Set<DietTag>
  counts: Record<string, number>
  extras: DietExtra[]
  weightKg: number
  loadFoods?: () => Promise<FoodFinder>
  onChange: (counts: Record<string, number>, extras: DietExtra[]) => void
}) {
  const [adding, setAdding] = useState<'search' | 'custom' | null>(null)
  const [index, setIndex] = useState<FoodFinder | null>(null)
  const [indexError, setIndexError] = useState(false)
  const [query, setQuery] = useState('')
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

  // Search wider, then drop what the diet leaves out, so 8 allowed foods show.
  const found = useFoodSearch(index, query, 40)
  const results = useMemo(() => allowedFoods(found.results, excluded).slice(0, 8), [found.results, excluded])
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
    setQuery('')
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
        <section className="add-panel" aria-label="Add another food">
          <input
            className="search"
            aria-label="Search foods"
            placeholder="Search: poha, upma, paneer, biscuits…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {!index && !indexError && <p className="muted">Loading foods…</p>}
          {indexError && <p className="error">Couldn’t load the food list. Check your connection, or enter it yourself.</p>}
          {index && query.trim() && !found.pending && results.length === 0 && <p className="muted">No match for “{query}”.</p>}
          <ul className="results">
            {results.map((f) => {
              const e = extraFromFood(f)
              return (
                <li key={f.id}>
                  <button type="button" onClick={() => addExtra(e)}>
                    <span className="result-name">{e.name}</span>
                    <span className="muted">
                      {e.portion}, {e.kcal} kcal
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button type="button" className="link" onClick={() => setAdding('custom')}>
            Can’t find it? Enter it yourself
          </button>
          <button type="button" className="link" onClick={() => setAdding(null)}>
            Cancel
          </button>
        </section>
      )}

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

      <p className="info" role="status" aria-label="Typical day">
        {describeDiet(diet, weightKg)}
      </p>
    </>
  )
}
