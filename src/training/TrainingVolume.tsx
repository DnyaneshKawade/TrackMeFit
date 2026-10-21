// Training volume over time (spec T-122): volume for whole workouts, or hard
// sets a week for one muscle. One read per time range, never one per day.

import { useEffect, useMemo, useState } from 'react'
import { GRAPH_RANGES, rangeStart, type GraphRange } from '../engine/strength'
import { weeklyMuscleSets, workoutVolume, type ExerciseInfo } from '../engine/volumeHistory'
import type { Muscle } from '../engine/training'
import { shownWeight, type WeightUnit } from '../engine/units'
import { useWeightUnit } from '../settings/units'
import { BROWSE_ORDER, exerciseById, MUSCLE_NAMES } from './exercises'
import type { PastSession, WorkoutStore } from './types'

const CHART_W = 320
const CHART_H = 120
const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

// Cardio is not in the strength list, so it gets null and never counts.
const info: ExerciseInfo = (id) => {
  const e = exerciseById.get(id)
  return e ? { primary: e.primary, secondary: e.secondary, load: !e.assisted } : null
}

type Kind = 'workout' | Muscle
const KINDS: [Kind, string][] = [['workout', 'Workout volume (all exercises)'], ...BROWSE_ORDER.map((m): [Kind, string] => [m, `Weekly sets: ${MUSCLE_NAMES[m]}`])]

function points(sessions: PastSession[], kind: Kind) {
  return kind === 'workout' ? workoutVolume(sessions, info) : weeklyMuscleSets(sessions, kind, info)
}

export function TrainingVolume({ store, today }: { store: WorkoutStore; today: string }) {
  const unit: WeightUnit = useWeightUnit()
  const [kind, setKind] = useState<Kind>('workout')
  const [range, setRange] = useState<GraphRange>('3m')
  const [sessions, setSessions] = useState<PastSession[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let live = true
    setSessions(null)
    setError(false)
    store.sessionsBetween(rangeStart(range, today) ?? '2000-01-01', today).then(
      (s) => live && setSessions(s),
      () => live && setError(true),
    )
    return () => {
      live = false
    }
  }, [store, range, today])

  const data = useMemo(() => points(sessions ?? [], kind), [sessions, kind])
  const weekly = kind !== 'workout'
  const values = data.map((p) => (weekly ? p.value : shownWeight(p.value, unit)))
  const label = KINDS.find(([k]) => k === kind)![1]
  const show = (v: number) => {
    const n = Math.round(v * 10) / 10
    return weekly ? `${n} ${n === 1 ? 'set' : 'sets'}` : `${n} ${unit}`
  }
  const when = (date: string) => (weekly ? `Week of ${shortDate(date)}` : shortDate(date))

  let chart = <p className="muted">{weekly ? 'Pick a longer time. A graph needs two weeks that train this muscle.' : 'Pick a longer time, or log two workouts, to see a graph.'}</p>
  if (data.length >= 2) {
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const pad = Math.max(1, (hi - lo) * 0.15)
    const x = (i: number) => (i / (data.length - 1)) * CHART_W
    const y = (v: number) => CHART_H - ((v - (lo - pad)) / (hi - lo + 2 * pad)) * CHART_H
    chart = (
      <figure className="strength-chart">
        <svg
          viewBox={`-6 -6 ${CHART_W + 12} ${CHART_H + 12}`}
          role="img"
          aria-label={`${label}, from ${show(values[0])} on ${shortDate(data[0].date)} to ${show(values[values.length - 1])} on ${shortDate(data[data.length - 1].date)}`}
        >
          <line x1="0" y1={CHART_H} x2={CHART_W} y2={CHART_H} className="axis" />
          <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} className="trend-line" />
          {values.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={4} className="dot" />
          ))}
        </svg>
        <figcaption className="muted">
          Lowest {show(Math.min(...values))}, highest {show(Math.max(...values))}.
        </figcaption>
      </figure>
    )
  }

  return (
    <section aria-label="Training volume" className="exercise-records training-volume">
      <h3>Training volume</h3>
      <label className="graph-kind">
        Graph shows
        <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
          {KINDS.map(([k, text]) => (
            <option key={k} value={k}>{text}</option>
          ))}
        </select>
      </label>
      <div className="range" role="group" aria-label="How far back">
        {GRAPH_RANGES.map(([r, text]) => (
          <button key={r} className="chip" aria-pressed={r === range} onClick={() => setRange(r)}>
            {text}
          </button>
        ))}
      </div>
      {error && <p className="error">Couldn’t load your workouts. Check your connection.</p>}
      {!error && !sessions && <p className="muted">Loading…</p>}
      {sessions && chart}
      <p className="muted">
        {weekly
          ? 'A set for the main muscle counts 1. A set that also works it counts half. Warm-ups and drop sets are left out.'
          : 'Weight × reps for every set, added up. Warm-ups, cardio and assisted machines are left out.'}
      </p>
      {sessions && data.length > 0 && (
        <ul className="graph-days" aria-label={weekly ? 'Each week' : 'Each workout'}>
          {data.map((p, i) => (
            <li key={p.date} className="day-button">
              <span>{when(p.date)}</span>
              <strong>{show(values[i])}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
