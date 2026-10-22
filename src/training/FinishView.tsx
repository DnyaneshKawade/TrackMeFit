// The finish screen after a workout, before the feedback questions (T-155).

import { useEffect, useState } from 'react'
import { byExercise, workoutSummary } from '../engine/workoutSummary'
import { useWeightUnit } from '../settings/units'
import { shownWeight } from '../engine/units'
import type { StrengthSession } from '../engine/strength'
import { exerciseById } from './exercises'
import { readStart } from './workoutClock'
import type { Session, WorkoutStore } from './types'

/** Records and the trend look back a year, in one read. */
const LOOK_BACK_DAYS = 365

const shift = (iso: string, days: number) => new Date(Date.parse(iso + 'T00:00:00Z') + days * 86_400_000).toISOString().slice(0, 10)

export function FinishView({ store, session, next, onNext }: { store: WorkoutStore; session: Session; next?: string; onNext: () => void }) {
  const unit = useWeightUnit()
  // Earlier workouts; null until loaded, or when offline (no records then).
  const [past, setPast] = useState<Map<string, StrengthSession[]> | null>(null)
  const [now] = useState(() => Date.now())
  useEffect(() => {
    let live = true
    store.sessionsBetween(shift(session.performedOn, -LOOK_BACK_DAYS), shift(session.performedOn, -1)).then(
      (list) => live && setPast(byExercise(list)),
      () => {},
    )
    return () => {
      live = false
    }
  }, [store, session.performedOn])
  const start = readStart(session.id)
  const s = workoutSummary({
    today: session.performedOn,
    sets: session.sets,
    past,
    seconds: start === null ? null : Math.max(0, Math.floor((now - start) / 1000)),
    nameOf: (id) => exerciseById.get(id)?.name ?? 'Exercise',
    unit,
  })
  const stats: [string, string][] = [
    ...(s.minutes !== null ? [['Time', `${Math.max(1, s.minutes)} min`] as [string, string]] : []),
    ['Sets', String(s.sets)],
    ['Weight lifted', `${shownWeight(s.liftedKg, unit).toLocaleString('en-IN')} ${unit}`],
  ]
  return (
    <section className="sheet finish" aria-label="Workout done">
      <h2>Workout done. Nice work!</h2>
      <dl className="macros finish-stats">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {s.records.length > 0 && (
        <ul className="finish-records" aria-label="New records">
          {s.records.map((r) => (
            <li key={r}>
              <span aria-hidden="true">🏆 </span>
              {r}
            </li>
          ))}
        </ul>
      )}
      {s.trend && <p className="finish-trend">{s.trend}</p>}
      {next && <p className="muted">Next workout: {next}</p>}
      <button className="primary" onClick={onNext}>
        Next
      </button>
    </section>
  )
}
