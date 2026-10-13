// Records and progress (spec T-044): a workout calendar, the exercises done
// in the last year, each exercise's records and strength graph, and a plate
// calculator with Indian gym plates.

import { useEffect, useMemo, useState } from 'react'
import { BARS, describePlates, platesFor } from '../engine/plates'
import { exerciseRecords, type ExerciseRecords, type Lift } from '../engine/strength'
import { shiftDate } from '../log/types'
import { monthGrid, monthOf, monthRange, shiftMonth } from './calendar'
import { exerciseById } from './exercises'
import type { SessionSummary, WorkoutStore } from './types'

const CHART_W = 320
const CHART_H = 120

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const longDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
const monthName = (month: string) => new Date(month + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
const nameOf = (id: string) => exerciseById.get(id)?.name ?? 'Exercise no longer in your list'
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

function Calendar({ store, today }: { store: WorkoutStore; today: string }) {
  const [month, setMonth] = useState(monthOf(today))
  const [list, setList] = useState<SessionSummary[] | null>(null)
  const [error, setError] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    setList(null)
    setError(false)
    setPicked(null)
    const [from, to] = monthRange(month)
    store.summaries(from, to).then(
      (l) => live && setList(l),
      () => live && setError(true),
    )
    return () => {
      live = false
    }
  }, [store, month])

  // One pass to group the month's workouts by day.
  const byDay = useMemo(() => {
    const m = new Map<string, SessionSummary[]>()
    for (const s of list ?? []) m.set(s.performedOn, [...(m.get(s.performedOn) ?? []), s])
    return m
  }, [list])

  return (
    <section aria-label="Workout calendar" className="calendar">
      <header className="sheet-head">
        <button className="link" aria-label="Month before" onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
        <h3>{monthName(month)}</h3>
        <button className="link" aria-label="Month after" disabled={month >= monthOf(today)} onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
      </header>
      {error && <p className="error">Couldn’t load your workouts. Check your connection.</p>}
      {list && <p className="muted">{plural(list.length, 'workout', 'workouts')} in {monthName(month)}.</p>}
      <table className="month">
        <thead>
          <tr>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <th key={i} scope="col">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(month).map((week, i) => (
            <tr key={i}>
              {week.map((date, j) => {
                if (!date) return <td key={j} />
                const done = byDay.get(date)
                const day = Number(date.slice(8))
                return (
                  <td key={j}>
                    {done ? (
                      <button
                        className={date === picked ? 'day trained on' : 'day trained'}
                        aria-label={`${longDate(date)}: ${plural(done.length, 'workout', 'workouts')}`}
                        aria-pressed={date === picked}
                        onClick={() => setPicked(date === picked ? null : date)}
                      >
                        {day}
                      </button>
                    ) : (
                      <span className={date === today ? 'day today' : 'day'}>{day}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {picked && (
        <ul className="session-list" aria-label={`Workouts on ${longDate(picked)}`}>
          {(byDay.get(picked) ?? []).map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong> <span className="muted">· {plural(s.exerciseIds.length, 'exercise', 'exercises')}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function StrengthChart({ points, measure }: Pick<ExerciseRecords, 'points' | 'measure'>) {
  if (points.length < 2) return <p className="muted">Do this exercise in two workouts to see a graph.</p>
  const values = points.map((p) => p.value)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = Math.max(1, (hi - lo) * 0.15)
  const x = (i: number) => (i / (points.length - 1)) * CHART_W
  const y = (v: number) => CHART_H - ((v - (lo - pad)) / (hi - lo + 2 * pad)) * CHART_H
  const unit = measure === 'e1rm' ? ' kg' : ' reps'
  const what = measure === 'e1rm' ? 'Best estimated one-rep max' : 'Most reps in a set'
  return (
    <figure className="strength-chart">
      <svg
        viewBox={`-4 -4 ${CHART_W + 8} ${CHART_H + 8}`}
        role="img"
        aria-label={`${what} in each workout, from ${values[0]}${unit} on ${shortDate(points[0].date)} to ${values[values.length - 1]}${unit} on ${shortDate(points[points.length - 1].date)}`}
      >
        <line x1="0" y1={CHART_H} x2={CHART_W} y2={CHART_H} className="axis" />
        <polyline points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')} className="trend-line" />
        {points.map((p, i) => (
          <circle key={p.date + i} cx={x(i)} cy={y(p.value)} r="3" className="dot" />
        ))}
      </svg>
      <figcaption className="muted">
        {what} in each workout. Lowest {lo}
        {unit}, highest {hi}
        {unit}.
      </figcaption>
    </figure>
  )
}

const lift = (l: Lift) => `${l.weightKg} kg × ${l.reps}`

function ExerciseDetail({ store, exerciseId, onBack }: { store: WorkoutStore; exerciseId: string; onBack: () => void }) {
  const [records, setRecords] = useState<ExerciseRecords | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let live = true
    store.exerciseHistory(exerciseId).then(
      (h) => live && setRecords(exerciseRecords(h)),
      () => live && setError(true),
    )
    return () => {
      live = false
    }
  }, [store, exerciseId])

  return (
    <section aria-label={`Records for ${nameOf(exerciseId)}`} className="exercise-records">
      <button className="link" onClick={onBack}>← All exercises</button>
      <h3>{nameOf(exerciseId)}</h3>
      {error && <p className="error">Couldn’t load your records. Check your connection.</p>}
      {!error && !records && <p className="muted">Loading…</p>}
      {records && (
        <>
          <dl className="records">
            {records.heaviest && (
              <div>
                <dt>Heaviest</dt>
                <dd>
                  {lift(records.heaviest)} <span className="muted">· {shortDate(records.heaviest.performedOn)}</span>
                </dd>
              </div>
            )}
            {records.bestE1rm && (
              <div>
                <dt>Best estimated one-rep max</dt>
                <dd>
                  {records.bestE1rm.e1rm} kg <span className="muted">· from {lift(records.bestE1rm)} · {shortDate(records.bestE1rm.performedOn)}</span>
                </dd>
              </div>
            )}
            {records.mostReps && (
              <div>
                <dt>Most reps in a set</dt>
                <dd>
                  {records.mostReps.reps}
                  {records.mostReps.weightKg > 0 ? ` at ${records.mostReps.weightKg} kg` : ''} <span className="muted">· {shortDate(records.mostReps.performedOn)}</span>
                </dd>
              </div>
            )}
          </dl>
          {records.repMaxes.length > 0 && (
            <table className="rep-maxes" aria-label="Heaviest for each number of reps">
              <thead>
                <tr>
                  <th scope="col">Reps</th>
                  <th scope="col">Heaviest</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.repMaxes.map((r) => (
                  <tr key={r.target}>
                    <th scope="row">{r.target}</th>
                    <td>{r.weightKg} kg</td>
                    <td className="muted">{shortDate(r.performedOn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <StrengthChart points={records.points} measure={records.measure} />
          {records.notes.map((n) => (
            <p key={n} className="muted">{n}</p>
          ))}
        </>
      )}
    </section>
  )
}

function ExerciseList({ store, today, onPick }: { store: WorkoutStore; today: string; onPick: (id: string) => void }) {
  const [list, setList] = useState<{ id: string; lastOn: string; times: number }[] | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let live = true
    store.summaries(shiftDate(today, -365), today).then(
      (sessions) => {
        // Newest first, so the first time an exercise is seen is its latest.
        const seen = new Map<string, { id: string; lastOn: string; times: number }>()
        for (const s of sessions)
          for (const id of s.exerciseIds) {
            const e = seen.get(id)
            if (e) e.times++
            else seen.set(id, { id, lastOn: s.performedOn, times: 1 })
          }
        if (live) setList([...seen.values()])
      },
      () => live && setError(true),
    )
    return () => {
      live = false
    }
  }, [store, today])

  return (
    <section aria-label="Your exercises">
      <h3>Your exercises</h3>
      {error && <p className="error">Couldn’t load your exercises. Check your connection.</p>}
      {!error && !list && <p className="muted">Loading…</p>}
      {list?.length === 0 && <p className="muted">Log a workout to see your records.</p>}
      <ul className="session-list">
        {list?.map((e) => (
          <li key={e.id}>
            <button className="day-button" onClick={() => onPick(e.id)}>
              <strong>{nameOf(e.id)}</strong>
              <span className="muted">
                Last done {shortDate(e.lastOn)} · {plural(e.times, 'workout', 'workouts')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PlateCalculator({ initial = '' }: { initial?: string }) {
  const [weight, setWeight] = useState(initial)
  const [bar, setBar] = useState(BARS[0])
  const w = Number(weight.replace(',', '.'))
  const load = weight.trim() ? platesFor(w, bar) : null
  return (
    <section aria-label="Plate calculator" className="plates">
      <h3>Plate calculator</h3>
      <div className="plate-row">
        <input aria-label="Weight to lift (kg)" placeholder="kg" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <span className="range" role="group" aria-label="Bar weight">
          {BARS.map((b) => (
            <button key={b} className="chip" aria-pressed={b === bar} onClick={() => setBar(b)}>
              {b} kg bar
            </button>
          ))}
        </span>
      </div>
      {load && (
        <p role="status">
          {load.perSide.length > 0 && (
            <>
              Each side: <strong>{describePlates(load.perSide)}</strong>.{' '}
            </>
          )}
          {load.reason && <span className="muted">{load.reason}</span>}
        </p>
      )}
      <p className="muted">Uses 25, 20, 15, 10, 5, 2.5 and 1.25 kg plates.</p>
    </section>
  )
}

export function RecordsView({ store, today, onClose }: { store: WorkoutStore; today: string; onClose: () => void }) {
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  return (
    <section className="sheet records-view" aria-label="Records and progress">
      <header className="sheet-head">
        <h2>Records and progress</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      {exerciseId ? (
        <ExerciseDetail store={store} exerciseId={exerciseId} onBack={() => setExerciseId(null)} />
      ) : (
        <>
          <Calendar store={store} today={today} />
          <ExerciseList store={store} today={today} onPick={setExerciseId} />
          <PlateCalculator />
        </>
      )}
    </section>
  )
}
