// Block controls (spec T-109): how many hard weeks a block has, ending a
// block early, and starting the next block with optional exercise swaps.

import { useState } from 'react'
import { shiftDate } from '../log/types'
import { exerciseById } from './exercises'
import { applySwaps, HARD_WEEK_CHOICES, isDeloadWeek, nextBlockSwaps, weekLabel } from './progression'
import type { Plan, WorkoutStore } from './types'

export function BlockView({ store, plan, today, week, onDone }: { store: WorkoutStore; plan: Plan; today: string; week: number; onDone: () => void }) {
  const [hardWeeks, setHardWeeks] = useState(plan.hardWeeks ?? 4)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // Every plan exercise with a similar one to swap to, offered once each.
  const options = nextBlockSwaps(plan, [...new Set(plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId)))])

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      onDone()
    } catch {
      setError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }
  const toggle = (id: string, on: boolean) =>
    setPicked((p) => {
      const next = new Set(p)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  return (
    <section className="sheet block" aria-label="Training block">
      <header className="sheet-head">
        <h2>{plan.name}: block</h2>
        <button className="link" onClick={onDone}>Close</button>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      <p>Now: {weekLabel(week, plan.hardWeeks ?? 4)}.</p>

      <h3>Hard weeks</h3>
      <p className="muted">A light week comes after these. Most people do 4 to 6.</p>
      <div className="choice" role="group" aria-label="Hard weeks before the light week">
        {HARD_WEEK_CHOICES.map((n) => (
          <button key={n} aria-pressed={hardWeeks === n} onClick={() => setHardWeeks(n)}>{n}</button>
        ))}
      </div>
      {hardWeeks !== (plan.hardWeeks ?? 4) && (
        <button className="secondary" disabled={busy} onClick={() => act(() => store.savePlan({ ...plan, hardWeeks }))}>
          Save {hardWeeks} hard weeks
        </button>
      )}

      {!isDeloadWeek(week, plan.hardWeeks ?? 4) && (
        <>
          <h3>End this block early</h3>
          <p className="muted">Tired or sore for days? Take the light week now. The next block starts a week later.</p>
          <button className="secondary" disabled={busy} onClick={() => act(() => store.startBlock(plan.id!, shiftDate(today, 7)))}>
            Light week now
          </button>
        </>
      )}

      <h3>Start the next block</h3>
      <p className="muted">Starts again at week 1 today, with the same plan. You can swap some exercises for similar ones.</p>
      {options.length > 0 && (
        <ul className="review-list">
          {options.map((s) => (
            <li key={s.from}>
              <label className="pain">
                <input type="checkbox" checked={picked.has(s.from)} onChange={(e) => toggle(s.from, e.target.checked)} /> Swap{' '}
                {exerciseById.get(s.from)?.name} for {exerciseById.get(s.to!)?.name}
              </label>
            </li>
          ))}
        </ul>
      )}
      <button
        className="primary"
        disabled={busy}
        onClick={() =>
          act(async () => {
            const swaps = options.filter((s) => picked.has(s.from))
            if (swaps.length) await store.savePlan(applySwaps(plan, swaps))
            await store.startBlock(plan.id!, today)
          })
        }
      >
        Start next block
      </button>
    </section>
  )
}
