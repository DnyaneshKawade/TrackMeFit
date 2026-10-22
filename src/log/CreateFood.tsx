import { useMemo, useState } from 'react'
import { EMPTY_FOOD_FORM, foodFromForm, recipeFood, type FoodForm, type FoodFormErrors, type NewCustomFood } from '../food/custom'
import type { FoodFinder } from '../food/finder'
import { useFoodSearch } from '../food/useFoodSearch'
import type { Food } from '../food/types'

const SAVE_FAILED = 'Couldn’t save. Check your connection and try again.'

/** A food from a label or the person's own numbers. Saved to their foods,
 * then opened so they can log it straight away. */
export function CreateFood({
  initialName,
  onCreate,
  onCreated,
  onBack,
}: {
  initialName: string
  onCreate: (food: NewCustomFood) => Promise<Food>
  onCreated: (food: Food) => void
  onBack: () => void
}) {
  const [form, setForm] = useState<FoodForm>({ ...EMPTY_FOOD_FORM, name: initialName.trim() })
  const [errors, setErrors] = useState<FoodFormErrors>({})
  const [warning, setWarning] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<FoodForm>) => setForm({ ...form, ...patch })
  const per = form.basis === 'serving' ? 'per serving' : 'per 100 g'

  const field = (key: keyof FoodForm, label: string, mode: 'text' | 'decimal' = 'decimal') => (
    <label className="field">
      <span>{label}</span>
      <input aria-label={label} inputMode={mode} value={form[key]} onChange={(e) => set({ [key]: e.target.value })} />
      {errors[key] && <span className="error">{errors[key]}</span>}
    </label>
  )

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = foodFromForm(form)
    if ('errors' in result) return setErrors(result.errors)
    setErrors({})
    // Show a mismatch once; saving again means they checked.
    if (result.warning && warning !== result.warning) return setWarning(result.warning)
    setBusy(true)
    try {
      onCreated(await onCreate(result.food))
    } catch {
      setErrors({ form: SAVE_FAILED })
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={save} aria-label="New food">
      <button type="button" className="link" onClick={onBack}>← Back to search</button>
      <h3>New food</h3>
      <p className="muted">Copy the numbers from the label, or from anywhere you trust. Only you and your coach see it.</p>
      {field('name', 'Name', 'text')}
      {field('brand', 'Brand (optional)', 'text')}
      <fieldset className="choice">
        <legend>The numbers are for</legend>
        <label><input type="radio" name="basis" checked={form.basis === '100g'} onChange={() => set({ basis: '100g' })} /> 100 g</label>
        <label><input type="radio" name="basis" checked={form.basis === 'serving'} onChange={() => set({ basis: 'serving' })} /> One serving</label>
      </fieldset>
      {form.basis === 'serving' && (
        <div className="two">
          {field('servingG', 'Serving size (g)')}
          {field('servingName', 'Serving name (optional)', 'text')}
        </div>
      )}
      {field('kcal', `Calories ${per}`)}
      <div className="three">
        {field('protein', 'Protein (g)')}
        {field('carbs', 'Carbs (g)')}
        {field('fat', 'Fat (g)')}
      </div>
      <label className="field">
        <span>Weighed</span>
        <select aria-label="Weighed" value={form.state} onChange={(e) => set({ state: e.target.value as FoodForm['state'] })}>
          <option value="asSold">As sold (packaged)</option>
          <option value="raw">Raw</option>
          <option value="cooked">Cooked</option>
        </select>
      </label>
      {errors.form && <p className="error" role="alert">{errors.form}</p>}
      {warning && <p className="warning" role="status">{warning} Tap Save again to keep it.</p>}
      <button className="primary" disabled={busy}>Save and log it</button>
    </form>
  )
}

interface Part {
  food: Food
  grams: string
}

/** A home recipe: ingredients by raw weight, then the cooked pot weight,
 * which gives calories per 100 g of the dish. */
export function CreateRecipe({
  index,
  onCreate,
  onCreated,
  onBack,
}: {
  index: FoodFinder | null
  onCreate: (food: NewCustomFood) => Promise<Food>
  onCreated: (food: Food) => void
  onBack: () => void
}) {
  const [name, setName] = useState('')
  const [parts, setParts] = useState<Part[]>([])
  const [query, setQuery] = useState('')
  const [cooked, setCooked] = useState('')
  const [servings, setServings] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { results } = useFoodSearch(index, query, 6)

  const optional = (s: string) => (s.trim() ? Number(s) : null)
  const preview = useMemo(() => {
    if (!parts.length) return null
    const r = recipeFood(name || 'Recipe', parts.map((p) => ({ food: p.food, grams: Number(p.grams) })), optional(cooked), optional(servings))
    return 'food' in r ? r.food : null
  }, [name, parts, cooked, servings])

  const addPart = (food: Food) => {
    setParts([...parts, { food, grams: '' }])
    setQuery('')
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = recipeFood(name, parts.map((p) => ({ food: p.food, grams: Number(p.grams) })), optional(cooked), optional(servings))
    if ('error' in r) return setError(r.error)
    setError(null)
    setBusy(true)
    try {
      onCreated(await onCreate(r.food))
    } catch {
      setError(SAVE_FAILED)
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={save} aria-label="New recipe">
      <button type="button" className="link" onClick={onBack}>← Back to search</button>
      <h3>New recipe</h3>
      <p className="muted">Add what goes into the pot by raw weight. Weigh the finished dish for the best numbers.</p>
      <label className="field">
        <span>Recipe name</span>
        <input aria-label="Recipe name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <ul className="parts" aria-label="Ingredients">
        {parts.map((p, i) => (
          <li key={i}>
            <span>{p.food.name}</span>
            <input
              aria-label={`${p.food.name} grams`}
              inputMode="decimal"
              placeholder="g"
              value={p.grams}
              onChange={(e) => setParts(parts.map((x, j) => (j === i ? { ...x, grams: e.target.value } : x)))}
            />
            <button type="button" className="link" aria-label={`Remove ${p.food.name}`} onClick={() => setParts(parts.filter((_, j) => j !== i))}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <input
        className="search"
        aria-label="Add an ingredient"
        placeholder="Add an ingredient: oil, onion, toor dal…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim() && !index && <p className="muted">Loading foods…</p>}
      <ul className="results">
        {results.map((f) => (
          <li key={f.id}>
            <button type="button" onClick={() => addPart(f)}>
              <span className="result-name">{f.name}{f.brand ? `, ${f.brand}` : ''}</span>
              <span className="muted">{f.per100g.kcal} calories per 100 g</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="two">
        <label className="field">
          <span>Cooked weight (g, optional)</span>
          <input aria-label="Cooked weight (g, optional)" inputMode="decimal" value={cooked} onChange={(e) => setCooked(e.target.value)} />
        </label>
        <label className="field">
          <span>Servings (optional)</span>
          <input aria-label="Servings (optional)" inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} />
        </label>
      </div>
      {preview && (
        <p className="info" role="status" aria-label="Recipe values">
          {preview.per100g.kcal} calories and {preview.per100g.proteinG} g protein per 100 g
          {preview.portions[0] ? `; one serving is ${preview.portions[0].grams} g` : ''}.
          {!cooked.trim() && ' Without a cooked weight we assume no water was added or lost.'}
        </p>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy}>Save and log it</button>
    </form>
  )
}
