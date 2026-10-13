import { useEffect, useMemo, useState } from 'react'
import { searchFoods, type SearchIndex } from '../food/search'
import { DIET_ITEMS, MAX_COUNT, checkCustom, describeDiet, estimateDiet, extraFromFood, type DietExtra } from './currentDiet'

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
  counts,
  extras,
  weightKg,
  loadIndex,
  onChange,
}: {
  counts: Record<string, number>
  extras: DietExtra[]
  weightKg: number
  loadIndex?: () => Promise<SearchIndex>
  onChange: (counts: Record<string, number>, extras: DietExtra[]) => void
}) {
  const [adding, setAdding] = useState<'search' | 'custom' | null>(null)
  const [index, setIndex] = useState<SearchIndex | null>(null)
  const [indexError, setIndexError] = useState(false)
  const [query, setQuery] = useState('')
  const [custom, setCustom] = useState({ name: '', kcal: '', protein: '' })
  const [customError, setCustomError] = useState<string | null>(null)

  useEffect(() => {
    if (adding !== 'search' || index || !loadIndex) return
    let live = true
    loadIndex().then(
      (i) => live && setIndex(i),
      () => live && setIndexError(true),
    )
    return () => {
      live = false
    }
  }, [adding, index, loadIndex])

  const results = useMemo(() => (index && query.trim() ? searchFoods(index, query, 8) : []), [index, query])
  const diet = estimateDiet(counts, extras)

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
      <p className="muted">Roughly what you eat on a usual day, all meals together. A guess is fine.</p>
      <ul className="counters">
        {DIET_ITEMS.map((item) => (
          <li key={item.id}>
            <span>
              {item.label}
              <small className="muted">{item.portion}</small>
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
          {loadIndex && (
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
          {index && query.trim() && results.length === 0 && <p className="muted">No match for “{query}”.</p>}
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
