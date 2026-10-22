// One meal on the Food tab and the food logged in it. Shared by the plain
// day and the day with a meal plan (T-063), which adds planned items.

import { Children, useState, type ReactNode } from 'react'
import { amountLabel, MAX_GRAMS, MEAL_NAMES, MEALS, totals, type LogEntry, type Meal } from './types'

/** The day before's food for a meal, to add again in one tap (T-160). */
export interface SameOffer {
  label: string
  foods: LogEntry[]
  onCopy: () => Promise<void>
}

export function MealSection({ meal, entries, tick, onAdd, same, children }: { meal: Meal; entries: LogEntry[]; tick?: ReactNode; onAdd: () => void; same?: SameOffer; children: ReactNode }) {
  return (
    <section className="meal" aria-label={MEAL_NAMES[meal]}>
      <header>
        <h3 className="tick">
          {tick}
          {MEAL_NAMES[meal]}
        </h3>
        <span className="meal-kcal">{totals(entries).kcal} calories</span>
        <button className="meal-add" aria-label={`Add food to ${MEAL_NAMES[meal]}`} onClick={onAdd}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </header>
      {entries.length === 0 && !hasRows(children) ? <p className="muted">Not added yet</p> : <ul>{children}</ul>}
      {same && entries.length === 0 && <SameAgain meal={meal} offer={same} />}
    </section>
  )
}

function SameAgain({ meal, offer }: { meal: Meal; offer: SameOffer }) {
  const [busy, setBusy] = useState(false)
  const names = offer.foods.map((e) => e.foodName).join(', ')
  const copy = async () => {
    setBusy(true)
    try {
      await offer.onCopy()
    } finally {
      setBusy(false)
    }
  }
  return (
    <p className="same-again">
      <button className="secondary" disabled={busy} aria-label={`${offer.label} for ${MEAL_NAMES[meal]}`} onClick={() => void copy()}>
        {offer.label}
      </button>
      <span className="muted">
        {names} · {totals(offer.foods).kcal} calories
      </span>
    </p>
  )
}

/** Planned rows count as content even before anything is logged. */
const hasRows = (children: ReactNode) => Children.toArray(children).length > 0

/** What a logged entry shows: amount, calories and macros. */
export function EntryInfo({ entry: e, pending }: { entry: LogEntry; pending: boolean }) {
  return (
    <div>
      <span>{e.foodName}</span>
      <span className="muted">
        {amountLabel(e)} · {e.kcal} calories · P {e.proteinG} · C {e.carbG} · F {e.fatG}
      </span>
      {pending && <span className="muted">Waiting for internet</span>}
    </div>
  )
}

/** Changes to a logged food (T-134): a new amount, or a copy in another meal. */
export interface EntryActions {
  onAmount: (grams: number) => Promise<void>
  onCopy: (meal: Meal) => Promise<void>
}

export function EntryRow({ entry, pending, onRemove, actions }: { entry: LogEntry; pending: boolean; onRemove: () => void; actions?: EntryActions }) {
  const [open, setOpen] = useState(false)
  return (
    <li className={open ? 'entry open' : 'entry'}>
      <EntryInfo entry={entry} pending={pending} />
      <span className="entry-buttons">
        {actions && (
          <button className="link" aria-label={`Change ${entry.foodName}`} aria-expanded={open} onClick={() => setOpen(!open)}>
            Edit
          </button>
        )}
        <button className="link" aria-label={`Remove ${entry.foodName}`} onClick={onRemove}>✕</button>
      </span>
      {open && actions && <EntryEdit entry={entry} actions={actions} onDone={() => setOpen(false)} />}
    </li>
  )
}

function EntryEdit({ entry, actions, onDone }: { entry: LogEntry; actions: EntryActions; onDone: () => void }) {
  const [typed, setTyped] = useState(entry.grams === null ? '' : String(entry.grams))
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const g = Number(typed.replace(',', '.'))
  const ok = g > 0 && g <= MAX_GRAMS && Math.round(g) !== entry.grams
  const run = async (work: () => Promise<void>, done: string | null) => {
    setBusy(true)
    try {
      await work()
      if (done) setNote(done)
      else onDone()
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="entry-edit" role="group" aria-label={`Change ${entry.foodName}`}>
      {entry.grams !== null && (
        <form
          className="set-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (ok) void run(() => actions.onAmount(Math.round(g)), null)
          }}
        >
          <label>
            Amount (g) <input className="grams" inputMode="decimal" value={typed} onChange={(e) => setTyped(e.target.value)} />
          </label>
          <button className="primary" disabled={!ok || busy}>
            Save
          </button>
        </form>
      )}
      <div className="copy-to">
        <span className="muted">Copy to</span>
        {MEALS.filter((m) => m !== entry.meal).map((m) => (
          <button key={m} className="secondary" disabled={busy} aria-label={`Copy to ${MEAL_NAMES[m]}`} onClick={() => void run(() => actions.onCopy(m), `Copied to ${MEAL_NAMES[m]}.`)}>
            {MEAL_NAMES[m]}
          </button>
        ))}
      </div>
      {note && <p className="muted" role="status">{note}</p>}
    </div>
  )
}
