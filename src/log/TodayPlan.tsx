// The saved meal plan on the Food tab (T-058c). On a veg day the
// meat, fish and egg items are swapped for veg protein foods, with the reason.
// Each item, meal and the whole plan can be ticked off to log it (T-060).
// Loaded only when the person has a saved plan.

import { useEffect, useMemo, useRef, useState } from 'react'
import { vegDayPlan } from '../engine/mealPlan'
import type { DietTag } from '../food/types'
import type { SavedMealPlan } from '../profile/mealPlanStore'
import { PLAN_FOODS, planFoodsFor } from '../profile/planFoods'
import { planEntry, planRows, resized, tickedEntries, tickState, type PlanRow, type TickState } from './planTicks'
import { MAX_GRAMS, type LogEntry, type NewLogEntry } from './types'

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
  onTick,
}: {
  saved: SavedMealPlan
  excluded: Set<DietTag>
  vegWhy: string | null
  date: string
  /** The day's log; null while it loads. */
  entries: LogEntry[] | null
  /** Logs the added entries and removes the entries with these ids. */
  onTick: (add: NewLogEntry[], remove: string[]) => Promise<void>
}) {
  const plan = useMemo(() => {
    if (!vegWhy) return saved.plan
    const allowed = new Set(planFoodsFor(excluded).map((f) => f.id))
    return vegDayPlan(saved.plan, PLAN_FOODS, allowed, saved.picks, vegWhy)
  }, [saved, excluded, vegWhy])
  const rows = useMemo(() => planRows(saved.id, plan.meals), [saved.id, plan])
  const ticked = useMemo(() => tickedEntries(entries ?? []), [entries])
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
  const done = rows.filter((r) => ticked.has(r.key)).length
  const disabled = busy || entries === null

  return (
    <details className="today-plan" aria-label="Your meal plan">
      <summary>
        Your meal plan{vegWhy ? ', veg today' : ''}{' '}
        <span className="muted">
          about {plan.totals.kcal.toLocaleString('en-IN')} kcal, {Math.round(plan.totals.proteinG)} g protein
          {done > 0 && `, ${done} of ${rows.length} eaten`}
        </span>
      </summary>
      <label className="tick">
        <TickBox label="Ate the whole plan" state={state(rows)} disabled={disabled} onChange={(on) => void set(rows, on)} />
        Ate the whole plan
      </label>
      {plan.meals.map((m) => {
        const mealRows = rows.filter((r) => r.meal === m.name)
        return (
          <section key={m.name} aria-label={`Plan ${m.name}`}>
            <h4 className="tick">
              <TickBox label={`Ate all of ${m.name}`} state={state(mealRows)} disabled={disabled} onChange={(on) => void set(mealRows, on)} />
              {m.name}
            </h4>
            <ul>
              {mealRows.map((r) => {
                const i = r.item
                const logged = ticked.get(r.key)
                return (
                  <li key={r.key}>
                    <TickBox label={`Ate ${i.name}`} state={logged ? 'all' : 'none'} disabled={disabled} onChange={(on) => void set([r], on)} />{' '}
                    <strong>{i.name}</strong> {logged?.grams ?? i.grams} g {i.weighed}
                    {i.hint && !logged && <span className="muted">, {i.hint}</span>}
                    {logged && editing?.key !== r.key && (
                      <button className="link" aria-label={`Change amount of ${i.name}`} onClick={() => setEditing({ key: r.key, grams: String(logged.grams ?? '') })}>
                        Change amount
                      </button>
                    )}
                    {editing?.key === r.key && (
                      <span className="set-row">
                        <input
                          aria-label={`${i.name} amount eaten (g)`}
                          inputMode="decimal"
                          value={editing.grams}
                          onChange={(e) => setEditing({ key: r.key, grams: e.target.value })}
                        />
                        <button className="primary" disabled={disabled} onClick={() => void saveAmount()}>Save</button>
                        {editing.problem && <span className="error" role="alert">{editing.problem}</span>}
                      </span>
                    )}
                    {vegWhy && i.reason.startsWith(vegWhy) && <small className="muted reason">{i.reason}</small>}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      {plan.notes
        .filter((n) => (vegWhy && n.startsWith(vegWhy)) || n.startsWith('Cereals are'))
        .map((n) => (
          <p key={n} className="muted">
            {n}
          </p>
        ))}
    </details>
  )
}
