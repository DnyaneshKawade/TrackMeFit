// Records and progress (spec T-044): a workout calendar, the exercises done
// in the last year, each exercise's records, history and graph (T-106), and
// a plate calculator with Indian gym plates.

import { useEffect, useMemo, useState } from 'react'
import { describePlates, gymFor, platesFor } from '../engine/plates'
import { useWeightUnit } from '../settings/units'
import { shiftDate } from '../log/types'
import { monthGrid, monthOf, monthRange, shiftMonth } from './calendar'
import { cardioById } from './cardio'
import { CardioDetail } from './CardioLog'
import { exerciseById } from './exercises'
import { ExerciseDetail } from './ExerciseDetail'
import { TrainingVolume } from './TrainingVolume'
import type { SessionSummary, WorkoutStore } from './types'

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const longDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
const monthName = (month: string) => new Date(month + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
const nameOf = (id: string) => exerciseById.get(id)?.name ?? cardioById.get(id)?.name ?? 'Exercise no longer in your list'
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
      (l) => live && setList(l.filter((s) => !s.skipped)),
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
  const unit = useWeightUnit()
  const gym = gymFor(unit)
  const [weight, setWeight] = useState(initial)
  const [picked, setBar] = useState<number | null>(null)
  const bar = picked !== null && gym.bars.includes(picked) ? picked : gym.bars[0]
  const w = Number(weight.replace(',', '.'))
  const load = weight.trim() ? platesFor(w, bar, gym.plates, unit) : null
  return (
    <section aria-label="Plate calculator" className="plates">
      <h3>Plate calculator</h3>
      <div className="plate-row">
 <input aria-label={`Weight to lift (${unit})`} placeholder={unit} inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <span className="range" role="group" aria-label="Bar weight">
          {gym.bars.map((b) => (
            <button key={b} className="chip" aria-pressed={b === bar} onClick={() => setBar(b)}>
              {b} {unit} bar
            </button>
          ))}
        </span>
      </div>
      {load && (
        <p role="status">
          {load.perSide.length > 0 && (
            <>
              Each side: <strong>{describePlates(load.perSide, unit)}</strong>.{' '}
            </>
          )}
          {load.reason && <span className="muted">{load.reason}</span>}
        </p>
      )}
      <p className="muted">
        Uses {gym.plates.slice(0, -1).join(', ')} and {gym.plates[gym.plates.length - 1]} {unit} plates.
      </p>
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
        cardioById.has(exerciseId) ? (
          <CardioDetail store={store} exerciseId={exerciseId} onBack={() => setExerciseId(null)} />
        ) : (
          <ExerciseDetail store={store} exerciseId={exerciseId} today={today} onBack={() => setExerciseId(null)} />
        )
      ) : (
        <>
          <Calendar store={store} today={today} />
          <TrainingVolume store={store} today={today} />
          <ExerciseList store={store} today={today} onPick={setExerciseId} />
          <PlateCalculator />
        </>
      )}
    </section>
  )
}
