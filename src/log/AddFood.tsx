import { useMemo, useState } from 'react'
import { amountFor, type Food } from '../food/types'
import { searchFoods, type SearchIndex } from '../food/search'
import { OFF_ATTRIBUTION } from '../food/off'
import { entryFor, MAX_GRAMS, MEAL_NAMES, type Meal, type NewLogEntry } from './types'

const STATE_HINT = { raw: 'Weigh it raw', cooked: 'Cooked weight', asSold: 'As sold' } as const
const SOURCE_NAME = { trackMeFit: 'Indian dish', usda: 'USDA', openFoodFacts: 'Open Food Facts', user: 'My food' } as Record<string, string>

export function AddFood({
  meal,
  date,
  index,
  onAdd,
  onClose,
}: {
  meal: Meal
  date: string
  index: SearchIndex | null
  onAdd: (entry: NewLogEntry) => Promise<void>
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Food | null>(null)
  const results = useMemo(() => (index ? searchFoods(index, query) : []), [index, query])

  return (
    <section className="sheet" aria-label={`Add food to ${MEAL_NAMES[meal]}`}>
      <header className="sheet-head">
        <h2>Add to {MEAL_NAMES[meal]}</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      {picked ? (
        <Amount food={picked} meal={meal} date={date} onAdd={onAdd} onBack={() => setPicked(null)} />
      ) : (
        <>
          <input
            className="search"
            aria-label="Search foods"
            placeholder="Search: dal, roti, paneer, Amul…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {!index && <p className="muted">Loading foods…</p>}
          {index && query.trim() && results.length === 0 && <p className="muted">No match for “{query}”.</p>}
          <ul className="results">
            {results.map((f) => (
              <li key={f.id}>
                <button onClick={() => setPicked(f)}>
                  <span className="result-name">{f.name}{f.brand ? `, ${f.brand}` : ''}</span>
                  <span className="muted">
                    {f.per100g.kcal} kcal per 100 g · {SOURCE_NAME[f.source] ?? f.source}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function Amount({
  food,
  meal,
  date,
  onAdd,
  onBack,
}: {
  food: Food
  meal: Meal
  date: string
  onAdd: (entry: NewLogEntry) => Promise<void>
  onBack: () => void
}) {
  // Portion index, or -1 for grams. Dishes open on their first portion.
  const [unit, setUnit] = useState(food.portions.length ? 0 : -1)
  const [qty, setQty] = useState(food.portions.length ? '1' : '100')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const n = Number(qty)
  const grams = unit < 0 ? n : food.portions[unit].grams * n
  const valid = qty.trim() !== '' && grams > 0 && grams <= MAX_GRAMS
  const a = valid ? amountFor(food, grams) : null

  const changeUnit = (u: number) => {
    setUnit(u)
    setQty(u < 0 ? String(Math.round(grams > 0 ? grams : 100)) : '1')
  }

  const add = async () => {
    if (!valid) return
    setBusy(true)
    setError(null)
    try {
      await onAdd(entryFor(food, grams, meal, date))
    } catch {
      setError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <div className="amount">
      <button className="link" onClick={onBack}>← Back to search</button>
      <h3>{food.name}{food.brand ? `, ${food.brand}` : ''}</h3>
      <div className="amount-row">
        <input
          aria-label="Amount"
          inputMode="decimal"
          value={qty}
          onChange={(e) => setQty(e.target.value.replace(',', '.'))}
        />
        <select aria-label="Unit" value={unit} onChange={(e) => changeUnit(Number(e.target.value))}>
          {food.portions.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
          <option value={-1}>grams</option>
        </select>
      </div>
      <p className="muted">
        {STATE_HINT[food.state]}
        {unit >= 0 && valid ? ` · ${Math.round(grams)} g` : ''}
      </p>
      {!valid && <p className="error">Enter an amount between 1 and {MAX_GRAMS} g.</p>}
      {a && (
        <dl className="macros" aria-label="This amount">
          <div><dt>Calories</dt><dd>{a.kcal}</dd></div>
          <div><dt>Protein</dt><dd>{a.proteinG} g</dd></div>
          <div><dt>Carbs</dt><dd>{a.carbG} g</dd></div>
          <div><dt>Fat</dt><dd>{a.fatG} g</dd></div>
        </dl>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={!valid || busy} onClick={add}>
        Add to {MEAL_NAMES[meal]}
      </button>
      {food.source === 'openFoodFacts' && <p className="credit">{OFF_ATTRIBUTION}</p>}
      {food.state === 'cooked' && food.source === 'trackMeFit' && (
        <p className="credit">Calculated from a standard home recipe; your cooking may differ.</p>
      )}
    </div>
  )
}
