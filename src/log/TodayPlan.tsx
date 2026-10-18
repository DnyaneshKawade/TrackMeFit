// The day on the Food tab with the saved meal plan (T-058c) inside each meal
// (T-063): planned items show faded under their meal with a tick box, and a
// tick logs them as normal entries (T-060). On a veg day the meat, fish and
// egg items are swapped for veg protein foods, with the reason.
// Loaded only when the person has a saved plan.

import { useEffect, useMemo, useRef, useState } from 'react'
import { vegDayPlan } from '../engine/mealPlan'
import type { DietTag } from '../food/types'
import type { SavedMealPlan } from '../profile/mealPlanStore'
import { PLAN_FOODS, planFoodsFor } from '../profile/planFoods'
import { EntryInfo, EntryRow, MealSection } from './MealSection'
import { PLAN_MEAL, planEntry, planRows, resized, tickedEntries, tickState, type PlanRow, type TickState } from './planTicks'
import { MAX_GRAMS, MEALS, type LogEntry, type Meal, type NewLogEntry } from './types'

function TickBox({ label, state, disabled, onChange }: { label: string; state: TickState; disabled: boolean; onChange: (on: boolean) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'some'
  }, [state])
  return <input ref={ref} type="checkbox" aria-label={label} checked={state === 'all'} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
}

export default function TodayPlan({
  saved,
  excluded,
  vegWhy,
  date,
  entries,
  pending,
  onTick,
  onRemove,
  onAdd,
  onChangePlan,
  byCoach = false,
}: {
  saved: SavedMealPlan
  excluded: Set<DietTag>
  vegWhy: string | null
  date: string
  /** The day's log, loaded. */
  entries: LogEntry[]
  /** Entries still waiting for internet. */
  pending: Set<string>
  /** Logs the added entries and removes the entries with these ids. */
  onTick: (add: NewLogEntry[], remove: string[]) => Promise<void>
  onRemove: (id: string) => void
  onAdd: (meal: Meal) => void
  /** Opens the plan editor (T-061). */
  onChangePlan?: () => void
  /** The person's coach saved this plan (T-078). */
  byCoach?: boolean
}) {
  const plan = useMemo(() => {
    if (!vegWhy) return saved.plan
    const allowed = new Set(planFoodsFor(excluded).map((f) => f.id))
    // Foods added from search stay unless their tags are left out today.
    for (const m of saved.plan.meals) for (const i of m.items) if (i.weighed === 'as eaten' && !i.tags?.some((t) => excluded.has(t))) allowed.add(i.foodId)
    return vegDayPlan(saved.plan, PLAN_FOODS, allowed, saved.picks, vegWhy)
  }, [saved, excluded, vegWhy])
  const rows = useMemo(() => planRows(saved.id, plan.meals), [saved.id, plan])
  const ticked = useMemo(() => tickedEntries(entries), [entries])
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<{ key: string; grams: string; problem?: string } | null>(null)

  const run = async (add: NewLogEntry[], remove: string[]) => {
    if (!add.length && !remove.length) return
    setBusy(true)
    try {
      await onTick(add, remove)
    } finally {
      setBusy(false)
    }
  }
  /** Ticks or unticks a set of rows, touching only the ones that change. */
  const set = (list: PlanRow[], on: boolean) =>
    run(
      on ? list.filter((r) => !ticked.has(r.key)).map((r) => planEntry(r.item, r.key, r.meal, date)) : [],
      on ? [] : list.flatMap((r) => (ticked.has(r.key) ? [ticked.get(r.key)!.id] : [])),
    )
  const saveAmount = async () => {
    if (!editing) return
    const old = ticked.get(editing.key)
    const grams = Number(editing.grams.replace(',', '.'))
    if (!(grams > 0 && grams <= MAX_GRAMS)) return setEditing({ ...editing, problem: `Enter 1 to ${MAX_GRAMS} g.` })
    setEditing(null)
    if (old && grams !== old.grams) await run([resized(old, grams)], [old.id])
  }

  const state = (list: PlanRow[]) => tickState(list.map((r) => r.key), ticked)
  const planKeys = new Set(rows.map((r) => r.key))
  const done = rows.filter((r) => ticked.has(r.key)).length

  const plannedRow = (r: PlanRow) => {
    const i = r.item
    const logged = ticked.get(r.key)
    const box = <TickBox label={`Ate ${i.name}`} state={logged ? 'all' : 'none'} disabled={busy} onChange={(on) => void set([r], on)} />
    return (
      <li key={r.key} className={logged ? 'planned ticked' : 'planned'}>
        {box}
        {logged ? (
          <EntryInfo entry={logged} pending={pending.has(logged.id)} />
        ) : (
          <div>
            <span>{i.name}</span>
            <span className="muted">
              {i.grams} g {i.weighed}
              {i.hint && `, ${i.hint}`} · {Math.round(i.macros.kcal)} kcal
            </span>
          </div>
        )}
        {vegWhy && i.reason.startsWith(vegWhy) && <small className="muted reason">{i.reason}</small>}
        {logged && editing?.key !== r.key && (
          <button className="link" aria-label={`Change amount of ${i.name}`} onClick={() => setEditing({ key: r.key, grams: String(logged.grams ?? '') })}>
            Change amount
          </button>
        )}
        {editing?.key === r.key && (
          <span className="set-row">
            <input aria-label={`${i.name} amount eaten (g)`} inputMode="decimal" value={editing.grams} onChange={(e) => setEditing({ key: r.key, grams: e.target.value })} />
            <button className="primary" disabled={busy} onClick={() => void saveAmount()}>Save</button>
            {editing.problem && <span className="error" role="alert">{editing.problem}</span>}
          </span>
        )}
      </li>
    )
  }

  return (
    <>
      <section className="today-plan" aria-label="Your meal plan">
        <label className="tick">
          <TickBox label="Ate the whole plan" state={state(rows)} disabled={busy} onChange={(on) => void set(rows, on)} />
          <span>
            <strong>Your meal plan{vegWhy ? ', veg today' : ''}</strong>{' '}
            <span className="muted">
              about {plan.totals.kcal.toLocaleString('en-IN')} kcal, {Math.round(plan.totals.proteinG)} g protein, {done} of {rows.length} eaten
              {byCoach && '. Changed by your coach'}
            </span>
          </span>
        </label>
        {onChangePlan && (
          <button className="link change-plan" onClick={onChangePlan}>
            Change plan
          </button>
        )}
        {plan.notes
          .filter((n) => (vegWhy && n.startsWith(vegWhy)) || n.startsWith('Cereals are'))
          .map((n) => (
            <p key={n} className="muted">
              {n}
            </p>
          ))}
      </section>
      {MEALS.map((meal) => {
        const mealRows = rows.filter((r) => PLAN_MEAL[r.meal] === meal)
        const byHand = entries.filter((e) => e.meal === meal && !(e.planItem && planKeys.has(e.planItem)))
        return (
          <MealSection
            key={meal}
            meal={meal}
            entries={entries.filter((e) => e.meal === meal)}
            tick={mealRows.length > 0 && <TickBox label={`Ate all of ${mealRows[0].meal}`} state={state(mealRows)} disabled={busy} onChange={(on) => void set(mealRows, on)} />}
            onAdd={() => onAdd(meal)}
          >
            {mealRows.map(plannedRow)}
            {byHand.map((e) => (
              <EntryRow key={e.id} entry={e} pending={pending.has(e.id)} onRemove={() => onRemove(e.id)} />
            ))}
          </MealSection>
        )
      })}
    </>
  )
}
