import { useCallback, useEffect, useState } from 'react'
import type { SearchIndex } from '../food/search'
import { AddFood } from './AddFood'
import { localDate, MEAL_NAMES, MEALS, shiftDate, totals, type LogEntry, type LogStore, type Meal, type NewLogEntry } from './types'
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
  today = localDate(),
}: {
  store: LogStore
  loadIndex: () => Promise<SearchIndex>
  today?: string
}) {
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<LogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState<Meal | null>(null)
  const [index, setIndex] = useState<SearchIndex | null>(null)

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
  }

  const add = async (entry: NewLogEntry) => {
    const saved = await store.add(entry)
    setEntries((list) => [...(list ?? []), saved])
    setAdding(null)
  }

  const remove = async (id: string) => {
    try {
      await store.remove(id)
      setEntries((list) => (list ?? []).filter((e) => e.id !== id))
    } catch {
      setError('Couldn’t remove that. Try again.')
    }
  }

  if (adding) {
    return (
      <main className="log">
        <AddFood meal={adding} date={date} index={index} onAdd={add} onClose={() => setAdding(null)} />
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
                        {e.grams} g · {e.kcal} kcal · P {e.proteinG} · C {e.carbG} · F {e.fatG}
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
