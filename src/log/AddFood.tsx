import { useEffect, useMemo, useState } from 'react'
import { amountFor, type Food } from '../food/types'
import type { FoodFinder } from '../food/finder'
import { useFoodSearch } from '../food/useFoodSearch'
import { OFF_ATTRIBUTION } from '../food/off'
import type { CustomFood, NewCustomFood } from '../food/custom'
import { CreateFood, CreateRecipe } from './CreateFood'
import {
  amountLabel,
  EMPTY_QUICK_FORM,
  entryFor,
  MAX_GRAMS,
  MEAL_NAMES,
  quickEntry,
  recentFoods,
  repeatEntry,
  type LogEntry,
  type Meal,
  type NewLogEntry,
  type QuickForm,
  type RecentFood,
} from './types'

const STATE_HINT = { raw: 'Weigh it raw', cooked: 'Cooked weight', asSold: 'As sold' } as const
const SOURCE_NAME = { trackMeFit: 'Indian dish', usda: 'USDA', openFoodFacts: 'Open Food Facts', user: 'My food' } as Record<string, string>

type View = 'search' | 'quick' | 'create' | 'recipe' | 'mine'

export function AddFood({
  meal,
  date,
  index,
  recent,
  myFoods,
  onAdd,
  onCreate,
  onRemoveFood,
  onClose,
  nonvegOff = null,
}: {
  meal: Meal
  date: string
  /** Every food, the person's own first; null while loading. */
  index: FoodFinder | null
  /** Recent log entries, newest first; null while loading. */
  recent: LogEntry[] | null
  myFoods: CustomFood[]
  onAdd: (entry: NewLogEntry) => Promise<void>
  onCreate: (food: NewCustomFood) => Promise<Food>
  onRemoveFood: (id: string) => Promise<void>
  onClose: () => void
  /** On a non-veg-free day: a gentle note for meat, fish and egg foods. */
  nonvegOff?: string | null
}) {
  const [view, setView] = useState<View>('search')
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Food | null>(null)
  const [repeatError, setRepeatError] = useState<string | null>(null)
  const { results, pending } = useFoodSearch(index, query)
  const offered = useMemo(() => recentFoods(recent ?? []), [recent])
  // Recent foods open with their portions, looked up by id once.
  const [recentFoodsById, setRecentFoodsById] = useState<Map<string, Food>>(new Map())
  useEffect(() => {
    const ids = [...new Set([...offered.often, ...offered.recent].map((r) => r.entry.foodId))]
    if (!index || !ids.length) return
    let live = true
    index.byIds(ids).then(
      (m) => live && setRecentFoodsById(m),
      () => undefined,
    )
    return () => {
      live = false
    }
  }, [index, offered])

  const repeat = async (e: LogEntry) => {
    setRepeatError(null)
    try {
      await onAdd(repeatEntry(e, meal, date))
    } catch {
      setRepeatError('Couldn’t save. Check your connection and try again.')
    }
  }

  const created = (food: Food) => {
    setPicked(food)
    setView('search')
  }

  let body
  if (picked) {
    body = (
      <Amount
        food={picked}
        meal={meal}
        date={date}
        onAdd={onAdd}
        onBack={() => setPicked(null)}
        note={nonvegOff && picked.tags?.some((t) => t === 'meat' || t === 'fish' || t === 'egg') ? nonvegOff : null}
      />
    )
  } else if (view === 'quick') {
    body = <QuickAdd meal={meal} date={date} onAdd={onAdd} onBack={() => setView('search')} />
  } else if (view === 'create') {
    body = <CreateFood initialName={query} onCreate={onCreate} onCreated={created} onBack={() => setView('search')} />
  } else if (view === 'recipe') {
    body = <CreateRecipe index={index} onCreate={onCreate} onCreated={created} onBack={() => setView('search')} />
  } else if (view === 'mine') {
    body = <MyFoods foods={myFoods} onPick={setPicked} onRemove={onRemoveFood} onBack={() => setView('search')} />
  } else {
    const searching = query.trim() !== ''
    body = (
      <>
        <input
          className="search"
          aria-label="Search foods"
          placeholder="Search: dal, roti, paneer, Amul…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="shortcuts">
          <button className="chip" onClick={() => setView('quick')}>Quick add</button>
          <button className="chip" onClick={() => setView('create')}>New food</button>
          <button className="chip" onClick={() => setView('recipe')}>New recipe</button>
          {myFoods.length > 0 && <button className="chip" onClick={() => setView('mine')}>My foods</button>}
        </div>
        {searching ? (
          <>
            {!index && <p className="muted">Loading foods…</p>}
            {index && !pending && results.length === 0 && (
              <div className="not-found">
                <p className="muted">No match for “{query}”.</p>
                <button className="link" onClick={() => setView('create')}>Add “{query.trim()}” as a new food</button>
              </div>
            )}
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
        ) : (
          <>
            {repeatError && <p className="error" role="alert">{repeatError}</p>}
            <RecentList title="Often" items={offered.often} foods={recentFoodsById} onPick={setPicked} onRepeat={repeat} />
            <RecentList title="Recent" items={offered.recent} foods={recentFoodsById} onPick={setPicked} onRepeat={repeat} />
          </>
        )}
      </>
    )
  }

  return (
    <section className="sheet" aria-label={`Add food to ${MEAL_NAMES[meal]}`}>
      <header className="sheet-head">
        <h2>Add to {MEAL_NAMES[meal]}</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      {body}
    </section>
  )
}

/** Foods logged before, each with a one-tap "+" that logs the same amount
 * again. Tapping the name opens the amount screen when we know the food. */
function RecentList({
  title,
  items,
  foods,
  onPick,
  onRepeat,
}: {
  title: string
  items: RecentFood[]
  foods: Map<string, Food>
  onPick: (f: Food) => void
  onRepeat: (e: LogEntry) => Promise<void>
}) {
  if (!items.length) return null
  return (
    <section className="recent" aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {items.map(({ entry: e, times }) => {
          const food = foods.get(e.foodId)
          const detail = `${amountLabel(e)} · ${e.kcal} kcal${times > 1 ? ` · ${times} times` : ''}`
          return (
            <li key={e.id}>
              {food ? (
                <button className="recent-name" onClick={() => onPick(food)}>
                  <span className="result-name">{e.foodName}</span>
                  <span className="muted">{detail}</span>
                </button>
              ) : (
                <div className="recent-name">
                  <span className="result-name">{e.foodName}</span>
                  <span className="muted">{detail}</span>
                </div>
              )}
              <button className="again" aria-label={`Add ${e.foodName} again`} onClick={() => void onRepeat(e)}>
                +
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function QuickAdd({
  meal,
  date,
  onAdd,
  onBack,
}: {
  meal: Meal
  date: string
  onAdd: (entry: NewLogEntry) => Promise<void>
  onBack: () => void
}) {
  const [form, setForm] = useState<QuickForm>(EMPTY_QUICK_FORM)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const field = (key: keyof QuickForm, label: string, mode: 'text' | 'decimal' = 'decimal') => (
    <label className="field">
      <span>{label}</span>
      <input aria-label={label} inputMode={mode} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </label>
  )

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    const entry = quickEntry(form, meal, date)
    if (typeof entry === 'string') return setError(entry)
    setError(null)
    setBusy(true)
    try {
      await onAdd(entry)
    } catch {
      setError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={add} aria-label="Quick add">
      <button type="button" className="link" onClick={onBack}>← Back to search</button>
      <h3>Quick add</h3>
      <p className="muted">For when you know the calories but not the food, like a restaurant meal.</p>
      {field('name', 'What was it? (optional)', 'text')}
      {field('kcal', 'Calories')}
      <div className="three">
        {field('protein', 'Protein (g)')}
        {field('carbs', 'Carbs (g)')}
        {field('fat', 'Fat (g)')}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy}>Add to {MEAL_NAMES[meal]}</button>
    </form>
  )
}

function MyFoods({
  foods,
  onPick,
  onRemove,
  onBack,
}: {
  foods: CustomFood[]
  onPick: (f: Food) => void
  onRemove: (id: string) => Promise<void>
  onBack: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const remove = async (id: string) => {
    setError(null)
    try {
      await onRemove(id)
      setConfirming(null)
    } catch {
      setError('Couldn’t delete that. Try again.')
    }
  }
  return (
    <div>
      <button className="link" onClick={onBack}>← Back to search</button>
      <h3>My foods</h3>
      {error && <p className="error" role="alert">{error}</p>}
      {!foods.length && <p className="muted">Foods and recipes you create show up here.</p>}
      {confirming && <p className="muted">Deleting removes it from search. Days you already logged keep it.</p>}
      <ul className="recent">
        {foods.map((f) => (
          <li key={f.id}>
            <button className="recent-name" onClick={() => onPick(f)}>
              <span className="result-name">{f.name}{f.brand ? `, ${f.brand}` : ''}</span>
              <span className="muted">
                {f.per100g.kcal} kcal per 100 g{f.recipe ? ' · recipe' : ''}
              </span>
            </button>
            {confirming === f.id ? (
              <span className="confirm">
                <button className="link danger" onClick={() => void remove(f.id)}>Delete</button>
                <button className="link" onClick={() => setConfirming(null)}>Keep</button>
              </span>
            ) : (
              <button className="link" aria-label={`Delete ${f.name}`} onClick={() => setConfirming(f.id)}>✕</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Amount({
  food,
  meal,
  date,
  onAdd,
  onBack,
  note = null,
}: {
  food: Food
  meal: Meal
  date: string
  onAdd: (entry: NewLogEntry) => Promise<void>
  onBack: () => void
  note?: string | null
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
      {note && <p className="info" role="note" aria-label="Non-veg-free day">{note}</p>}
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
      {food.source === 'user' && <p className="credit">Your own food. Values are what you entered.</p>}
    </div>
  )
}
