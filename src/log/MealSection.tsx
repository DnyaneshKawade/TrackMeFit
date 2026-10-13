// One meal on the Food tab and the food logged in it. Shared by the plain
// day and the day with a meal plan (T-063), which adds planned items.

import type { ReactNode } from 'react'
import { amountLabel, MEAL_NAMES, totals, type LogEntry, type Meal } from './types'

export function MealSection({ meal, entries, tick, onAdd, children }: { meal: Meal; entries: LogEntry[]; tick?: ReactNode; onAdd: () => void; children: ReactNode }) {
  return (
    <section className="meal" aria-label={MEAL_NAMES[meal]}>
      <header>
        <h3 className="tick">
          {tick}
          {MEAL_NAMES[meal]}
        </h3>
        <span className="muted">{totals(entries).kcal} kcal</span>
      </header>
      <ul>{children}</ul>
      <button className="add" onClick={onAdd}>+ Add food</button>
    </section>
  )
}

/** What a logged entry shows: amount, calories and macros. */
export function EntryInfo({ entry: e, pending }: { entry: LogEntry; pending: boolean }) {
  return (
    <div>
      <span>{e.foodName}</span>
      <span className="muted">
        {amountLabel(e)} · {e.kcal} kcal · P {e.proteinG} · C {e.carbG} · F {e.fatG}
      </span>
      {pending && <span className="muted">Waiting for internet</span>}
    </div>
  )
}

export function EntryRow({ entry, pending, onRemove }: { entry: LogEntry; pending: boolean; onRemove: () => void }) {
  return (
    <li>
      <EntryInfo entry={entry} pending={pending} />
      <button className="link" aria-label={`Remove ${entry.foodName}`} onClick={onRemove}>✕</button>
    </li>
  )
}
