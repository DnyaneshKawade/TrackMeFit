// One exercise's records, history and graph (specs T-044 and T-106). The
// History and Graph tabs follow FitNotes: every past set by day, and a graph
// with a choice of what to show and how far back.

import { useEffect, useMemo, useState } from 'react'
import { shownWeight, weightText, type WeightUnit } from '../engine/units'
import { useWeightUnit } from '../settings/units'
import {
  exerciseRecords,
  graphPoints,
  GRAPH_KINDS,
  GRAPH_RANGES,
  historyWithRecords,
  WEIGHT_KINDS,
  type ExerciseRecords,
  type GraphKind,
  type GraphRange,
  type Lift,
  type StrengthSession,
} from '../engine/strength'
import { ASSISTED_GRAPH_KINDS, assistedGraph, assistedHistory, assistedRecords, type AssistedGraphKind, type AssistedRecords } from '../engine/assisted'
import { goalLine, goalProgress, type Goal } from '../engine/goal'
import { exerciseById, techniqueSearchUrl } from './exercises'
import type { WorkoutStore } from './types'

const CHART_W = 320
const CHART_H = 120

type Tab = 'records' | 'history' | 'graph'
const TABS: [Tab, string][] = [
  ['records', 'Records'],
  ['history', 'History'],
  ['graph', 'Graph'],
]

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const longDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const nameOf = (id: string) => exerciseById.get(id)?.name ?? 'Exercise no longer in your list'
const lift = (l: Lift, unit: WeightUnit) => `${weightText(l.weightKg, unit)} × ${l.reps}`
const setText = (s: { weightKg: number; reps: number }, unit: WeightUnit, help = false) =>
  help ? `${weightText(s.weightKg, unit)} help × ${s.reps}` : s.weightKg > 0 ? `${weightText(s.weightKg, unit)} × ${s.reps}` : `${s.reps} reps`
const TAG_WORDS = { warmup: 'warm-up', drop: 'drop set', failure: 'to failure', myo: 'myo-reps' }

function Records({ records, unit }: { records: ExerciseRecords; unit: WeightUnit }) {
  return (
    <>
      <dl className="records">
        {records.heaviest && (
          <div>
            <dt>Heaviest</dt>
            <dd>
              {lift(records.heaviest, unit)} <span className="muted">· {shortDate(records.heaviest.performedOn)}</span>
            </dd>
          </div>
        )}
        {records.bestE1rm && (
          <div>
            <dt>Best one-rep max guess</dt>
            <dd>
              {weightText(records.bestE1rm.e1rm, unit)} <span className="muted">· from {lift(records.bestE1rm, unit)} · {shortDate(records.bestE1rm.performedOn)}</span>
            </dd>
          </div>
        )}
        {records.mostReps && (
          <div>
            <dt>Most reps in a set</dt>
            <dd>
              {records.mostReps.reps}
              {records.mostReps.weightKg > 0 ? ` at ${weightText(records.mostReps.weightKg, unit)}` : ''} <span className="muted">· {shortDate(records.mostReps.performedOn)}</span>
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
                <td>{weightText(r.weightKg, unit)}</td>
                <td className="muted">{shortDate(r.performedOn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {records.notes.map((n) => (
        <p key={n} className="muted">{n}</p>
      ))}
    </>
  )
}

/** Records for an assisted machine, where less help is better (T-117). */
function AssistedRecordsView({ records, unit }: { records: AssistedRecords; unit: WeightUnit }) {
  return (
    <>
      <dl className="records">
        {records.leastHelp && (
          <div>
            <dt>Least help</dt>
            <dd>
              {setText(records.leastHelp, unit, true)} <span className="muted">· {shortDate(records.leastHelp.performedOn)}</span>
            </dd>
          </div>
        )}
        {records.mostReps && (
          <div>
            <dt>Most reps in a set</dt>
            <dd>
              {setText(records.mostReps, unit, true)} <span className="muted">· {shortDate(records.mostReps.performedOn)}</span>
            </dd>
          </div>
        )}
      </dl>
      {records.notes.map((n) => (
        <p key={n} className="muted">{n}</p>
      ))}
    </>
  )
}

function History({ sessions, unit, assisted }: { sessions: StrengthSession[]; unit: WeightUnit; assisted: boolean }) {
  const days = useMemo(() => (assisted ? assistedHistory(sessions) : historyWithRecords(sessions)), [sessions, assisted])
  if (!days.length) return <p className="muted">Log this exercise to see your history.</p>
  return (
    <>
      <p className="muted">🏆 marks a new record on that day.</p>
      {days.map((d, i) => (
        <section key={d.performedOn + i} className="history-day" aria-label={longDate(d.performedOn)}>
          <h4>{longDate(d.performedOn)}</h4>
          <ol>
            {d.sets.map((s, j) => (
              <li key={j}>
                {setText(s, unit, assisted)}
                {s.tag && <span className="muted"> · {TAG_WORDS[s.tag]}</span>}
                {s.record && <span aria-label="New record"> 🏆</span>}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  )
}

function Graph({ sessions, today, unit, noWeight, assisted, goal }: { sessions: StrengthSession[]; today: string; unit: WeightUnit; noWeight: boolean; assisted: boolean; goal?: Goal }) {
  const [kind, setKind] = useState<GraphKind | AssistedGraphKind>(assisted ? 'help' : noWeight ? 'reps' : 'e1rm')
  const [range, setRange] = useState<GraphRange>('3m')
  const [picked, setPicked] = useState<number | null>(null)
  const points = useMemo(
    () => (assisted ? assistedGraph(sessions, kind as AssistedGraphKind, range, today) : graphPoints(sessions, kind as GraphKind, range, today)),
    [sessions, kind, range, today, assisted],
  )
  // Sets per day, to show when a point is tapped.
  const byDay = useMemo(() => {
    const m = new Map<string, StrengthSession['sets']>()
    for (const s of sessions) m.set(s.performedOn, [...(m.get(s.performedOn) ?? []), ...s.sets])
    return m
  }, [sessions])
  const isWeight = kind === 'help' || WEIGHT_KINDS.has(kind as GraphKind)
  // Every choice shows, even before anything is logged (T-122).
  const kinds: [string, string][] = assisted ? ASSISTED_GRAPH_KINDS : GRAPH_KINDS
  const values = points.map((p) => (isWeight ? shownWeight(p.value, unit) : p.value))
  const label = kinds.find(([k]) => k === kind)?.[1] ?? ''
  const count = kind === 'sets' ? 'set' : 'rep'
  const show = (v: number) => {
    const n = Math.round(v * 10) / 10
    return isWeight ? `${n} ${unit}` : `${n} ${count}${n === 1 ? '' : 's'}`
  }
  const pick = (i: number | null) => setPicked(i === picked ? null : i)
  // The goal as a dashed line on the weight graphs (T-119).
  const goalKg = goal ? goalLine(goal, kind) : null
  const goalShown = goalKg === null ? null : shownWeight(goalKg, unit)

  // Weight choices stay in the list with no weight logged, so say why it is empty.
  let chart = <p className="muted">{isWeight && noWeight && !assisted ? 'Nothing to show yet. Log a set with weight to see this.' : 'Pick a longer time, or log two workouts, to see a graph.'}</p>
  if (points.length >= 2) {
    const lo = Math.min(...values, ...(goalShown === null ? [] : [goalShown]))
    const hi = Math.max(...values, ...(goalShown === null ? [] : [goalShown]))
    const pad = Math.max(1, (hi - lo) * 0.15)
    const x = (i: number) => (i / (points.length - 1)) * CHART_W
    const y = (v: number) => CHART_H - ((v - (lo - pad)) / (hi - lo + 2 * pad)) * CHART_H
    chart = (
      <figure className="strength-chart">
        <svg
          viewBox={`-6 -6 ${CHART_W + 12} ${CHART_H + 12}`}
          role="img"
          aria-label={`${label} in each workout, from ${show(values[0])} on ${shortDate(points[0].date)} to ${show(values[values.length - 1])} on ${shortDate(points[points.length - 1].date)}`}
        >
          <line x1="0" y1={CHART_H} x2={CHART_W} y2={CHART_H} className="axis" />
          {goalShown !== null && <line x1="0" y1={y(goalShown)} x2={CHART_W} y2={y(goalShown)} className="goal-line" aria-hidden="true" />}
          <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} className="trend-line" />
          {points.map((p, i) => (
            <circle key={p.date + i} cx={x(i)} cy={y(values[i])} r={i === picked ? 6 : 4} className={i === picked ? 'dot on' : 'dot'} onClick={() => pick(i)} />
          ))}
        </svg>
        <figcaption className="muted">
          {goalShown !== null && <>The dashed line is your goal, {show(goalShown)}. </>}
          Lowest {show(Math.min(...values))}, highest {show(Math.max(...values))}. Tap a day below for its sets.
        </figcaption>
      </figure>
    )
  }

  return (
    <>
      <label className="graph-kind">
        Graph shows
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value as GraphKind | AssistedGraphKind)
            setPicked(null)
          }}
        >
          {kinds.map(([k, text]) => (
            <option key={k} value={k}>{text}</option>
          ))}
        </select>
      </label>
      <div className="range" role="group" aria-label="How far back">
        {GRAPH_RANGES.map(([r, text]) => (
          <button
            key={r}
            className="chip"
            aria-pressed={r === range}
            onClick={() => {
              setRange(r)
              setPicked(null)
            }}
          >
            {text}
          </button>
        ))}
      </div>
      {chart}
      {points.length > 0 && (
        <ul className="graph-days" aria-label="Each workout">
          {points.map((p, i) => (
            <li key={p.date + i}>
              <button className="day-button" aria-pressed={i === picked} onClick={() => pick(i)}>
                <span>{shortDate(p.date)}</span>
                <strong>{show(values[i])}</strong>
              </button>
              {i === picked && (
                <p className="muted" role="status">
                  {(byDay.get(p.date) ?? []).map((s) => setText(s, unit, assisted) + (s.tag ? ` (${TAG_WORDS[s.tag]})` : '')).join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

/** Records, History and Graph tabs for one exercise. */
export function ExerciseDetail({
  store,
  exerciseId,
  today,
  onBack,
  backLabel = '← All exercises',
}: {
  store: WorkoutStore
  exerciseId: string
  today: string
  onBack: () => void
  backLabel?: string
}) {
  const [sessions, setSessions] = useState<StrengthSession[] | null>(null)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<Tab>('records')
  const unit = useWeightUnit()
  useEffect(() => {
    let live = true
    store.exerciseHistory(exerciseId).then(
      (h) => live && setSessions(h),
      () => live && setError(true),
    )
    return () => {
      live = false
    }
  }, [store, exerciseId])
  const assisted = !!exerciseById.get(exerciseId)?.assisted
  const records = useMemo(() => (sessions ? exerciseRecords(sessions) : null), [sessions])
  const helped = useMemo(() => (sessions && assisted ? assistedRecords(sessions) : null), [sessions, assisted])
  const goal = assisted ? undefined : exerciseById.get(exerciseId)?.goal
  const progress = useMemo(() => (sessions && goal ? goalProgress(sessions, goal, unit) : null), [sessions, goal, unit])

  return (
    <section aria-label={`Records for ${nameOf(exerciseId)}`} className="exercise-records">
      <button className="link" onClick={onBack}>{backLabel}</button>
      <h3>{nameOf(exerciseId)}</h3>
      {exerciseById.has(exerciseId) && (
        <a className="link watch-how" href={techniqueSearchUrl(nameOf(exerciseId))} target="_blank" rel="noopener noreferrer" aria-label={`Watch how to do ${nameOf(exerciseId)} on YouTube`}>
          Watch how ↗
        </a>
      )}
      <div className="range detail-tabs" role="group" aria-label="Records, history or graph">
        {TABS.map(([t, text]) => (
          <button key={t} className="chip" aria-pressed={t === tab} onClick={() => setTab(t)}>
            {text}
          </button>
        ))}
      </div>
      {error && <p className="error">Couldn’t load your records. Check your connection.</p>}
      {!error && !sessions && <p className="muted">Loading…</p>}
      {progress && tab !== 'history' && (
        <p className={progress.reached ? 'record' : 'muted'} role="status">
          {progress.reached ? '🎯 ' : ''}
          {progress.text}
        </p>
      )}
      {sessions && records && tab === 'records' && (helped ? <AssistedRecordsView records={helped} unit={unit} /> : <Records records={records} unit={unit} />)}
      {sessions && tab === 'history' && <History sessions={sessions} unit={unit} assisted={assisted} />}
      {sessions && records && tab === 'graph' && <Graph sessions={sessions} today={today} unit={unit} noWeight={!records.heaviest} assisted={assisted} goal={goal} />}
    </section>
  )
}
