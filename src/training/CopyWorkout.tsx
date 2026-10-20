// Copy a past workout (spec T-113): pick a workout from the last 90 days,
// tick the exercises to bring over, and their sets fill today's boxes. Nothing
// is logged until the person taps "Log set", so they can change each one.

import { useEffect, useState } from 'react'
import { shiftDate } from '../log/types'
import { useWeightUnit } from '../settings/units'
import { cardioById } from './cardio'
import { exerciseById } from './exercises'
import { describeSets, workingSets, type SessionSummary, type SetLog, type WorkoutStore } from './types'

export const COPY_DAYS = 90
export const COPY_LIST = 20

export interface Copied {
  from: string
  sets: SetLog[]
}

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export function CopyWorkout({ store, today, onCopy, onClose }: { store: WorkoutStore; today: string; onCopy: (c: Map<string, Copied>) => void; onClose: () => void }) {
  const unit = useWeightUnit()
  const [list, setList] = useState<SessionSummary[] | null>(null)
  const [picked, setPicked] = useState<{ on: string; sets: Map<string, SetLog[]> } | null>(null)
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    store.summaries(shiftDate(today, -COPY_DAYS), shiftDate(today, -1)).then(
      (l) => live && setList(l.filter((s) => !s.skipped && s.exerciseIds.some((id) => !cardioById.has(id))).slice(0, COPY_LIST)),
      () => live && setError('Couldn’t load your workouts. Check your connection.'),
    )
    return () => {
      live = false
    }
  }, [store, today])

  const pick = async (s: SessionSummary) => {
    try {
      const found = (await store.sessionsOn(s.performedOn)).find((x) => x.id === s.id)
      // Grouped in one pass, in the order the exercises were done.
      const byExercise = new Map<string, SetLog[]>()
      // Cardio is not copied; its boxes take a time, not weight and reps (T-114).
      for (const set of [...(found?.sets ?? [])].sort((a, b) => a.setIndex - b.setIndex))
        if (!cardioById.has(set.exerciseId)) byExercise.set(set.exerciseId, [...(byExercise.get(set.exerciseId) ?? []), set])
      setPicked({ on: s.performedOn, sets: byExercise })
      setTicked(new Set(byExercise.keys()))
      setError(null)
    } catch {
      setError('Couldn’t load that workout. Check your connection.')
    }
  }

  const toggle = (id: string, on: boolean) =>
    setTicked((t) => {
      const next = new Set(t)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  return (
    <section className="copy-workout" aria-label="Copy a past workout">
      <header className="sheet-head">
        <h3>{picked ? `Workout on ${shortDate(picked.on)}` : 'Copy a past workout'}</h3>
        <button className="link" onClick={picked ? () => setPicked(null) : onClose}>{picked ? 'Back' : 'Close'}</button>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      {!picked && !list && !error && <p className="muted">Loading…</p>}
      {!picked && list?.length === 0 && <p className="muted">No workouts in the last {COPY_DAYS} days.</p>}
      {!picked && (
        <ul className="session-list">
          {list?.map((s) => (
            <li key={s.id}>
              <button className="day-button" onClick={() => void pick(s)}>
                <strong>{s.name}</strong>
                <span className="muted">
                  {shortDate(s.performedOn)} · {s.exerciseIds.length === 1 ? '1 exercise' : `${s.exerciseIds.length} exercises`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {picked && (
        <>
          <p className="muted">The sets fill today’s boxes. Change any of them before you log.</p>
          <ul className="review-list">
            {[...picked.sets].map(([id, sets]) => (
              <li key={id}>
                <label className="pain">
                  <input type="checkbox" checked={ticked.has(id)} onChange={(e) => toggle(id, e.target.checked)} /> {exerciseById.get(id)?.name ?? 'Exercise no longer in your list'}
                </label>
                <span className="muted">{describeSets(workingSets(sets), unit) || `${sets.length} warm-up sets`}</span>
              </li>
            ))}
          </ul>
          <button
            className="primary"
            disabled={!ticked.size}
            onClick={() => onCopy(new Map([...picked.sets].filter(([id]) => ticked.has(id) && exerciseById.has(id)).map(([id, sets]) => [id, { from: picked.on, sets: workingSets(sets).length ? workingSets(sets) : sets }])))}
          >
            Copy {ticked.size === 1 ? '1 exercise' : `${ticked.size} exercises`}
          </button>
        </>
      )}
    </section>
  )
}
