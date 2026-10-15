import { useCallback, useEffect, useState } from 'react'
import { localDate, shiftDate, type LogStore } from '../log/types'
import { DietStats } from './DietStats'
import { Photos } from './Photos'
import type { PhotoStore } from './photoStore'
import { steadySwitch, type PaceSwitch } from '../profile/steady'
import type { GoalChoice, ProfileInfo } from '../profile/types'
import type { DietTarget, TargetStore, TargetValues } from '../targets/types'
import {
  MEASURE_FIELDS,
  checkMeasurement,
  checkWeight,
  goalNote,
  measurementChanges,
  weightChart,
  weightSummary,
  type MeasureKey,
  type Measurement,
  type ProgressStore,
  type WeighIn,
} from './types'
import '../log/log.css'
import '../training/training.css'
import './progress.css'

const CHART_W = 320
const CHART_H = 140

const shortDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

function WeightChartView({ weighIns }: { weighIns: WeighIn[] }) {
  const chart = weightChart(weighIns, CHART_W, CHART_H)
  if (!chart || chart.scale.length < 2) return null
  return (
    <figure className="weight-chart">
      <svg viewBox={`-4 -4 ${CHART_W + 8} ${CHART_H + 8}`} role="img" aria-label={`Weight from ${shortDate(chart.firstDate)} to ${shortDate(chart.lastDate)}`}>
        <line x1="0" y1={CHART_H} x2={CHART_W} y2={CHART_H} className="axis" />
        {chart.scale.map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r="2.5" className="scale-dot" />
        ))}
        <polyline points={chart.trend.map((p) => `${p.x},${p.y}`).join(' ')} className="trend-line" />
      </svg>
      <figcaption className="muted">
        {shortDate(chart.firstDate)} to {shortDate(chart.lastDate)}, {chart.minKg} to {chart.maxKg} kg. Dots are daily weights; the line is your trend.
      </figcaption>
    </figure>
  )
}

function MeasurementForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Measurement | undefined
  onSave: (text: Partial<Record<MeasureKey, string>>) => Promise<void>
  onCancel: () => void
}) {
  const [text, setText] = useState<Partial<Record<MeasureKey, string>>>(() =>
    Object.fromEntries(MEASURE_FIELDS.map((f) => [f.key, initial?.[f.key] === undefined ? '' : String(initial[f.key])])),
  )
  const [errors, setErrors] = useState<Partial<Record<MeasureKey | 'form', string>>>({})
  const [busy, setBusy] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = checkMeasurement(text)
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      await onSave(text)
    } catch {
      setErrors({ form: 'Couldn’t save. Check your connection and try again.' })
      setBusy(false)
    }
  }

  return (
    <form className="measure-form" onSubmit={save} noValidate aria-label="Measurements">
      <p className="muted">Measure in the morning with a soft tape. Leave out any you don’t track.</p>
      {MEASURE_FIELDS.map((f) => (
        <label key={f.key} className="target-field">
          <span>{f.label}</span>
          <span className="target-input">
            <input aria-label={`${f.label} (cm)`} inputMode="decimal" value={text[f.key]} onChange={(e) => setText({ ...text, [f.key]: e.target.value })} />
            <span className="muted">cm</span>
          </span>
          {errors[f.key] && <small className="error">{errors[f.key]}</small>}
        </label>
      ))}
      {errors.form && <p className="error">{errors.form}</p>}
      <button className="primary" disabled={busy}>
        Save measurements
      </button>
      <button type="button" className="link" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}

/** Weigh-ins, the trend and body measurements. */
/** "Not now" on the Steady suggestion hides it on this phone for two weeks. */
const LATER_KEY = 'tmf:steady-later'
const readLater = () => {
  try {
    return localStorage.getItem(LATER_KEY)
  } catch {
    return null
  }
}

function SteadyCard({ suggestion, onSwitch, onLater }: { suggestion: PaceSwitch; onSwitch: () => Promise<void>; onLater: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const yes = async () => {
    setBusy(true)
    try {
      await onSwitch()
    } catch {
      setError('Couldn’t switch. Check your connection and try again.')
      setBusy(false)
    }
  }
  return (
    <section className="suggest-card" aria-label="Switch to Steady">
      <h3>Time to switch to Steady?</h3>
      <p>{suggestion.message}</p>
      <p className="muted">Nothing changes unless you switch. You can change your pace or targets again any time.</p>
      <div className="actions">
        <button className="primary" disabled={busy} onClick={() => void yes()}>Switch to Steady</button>
        <button className="link" disabled={busy} onClick={onLater}>Not now</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

export function Progress({
  store,
  goal,
  profile,
  targets,
  onSwitchPace,
  log,
  photos,
  today = localDate(),
}: {
  store: ProgressStore
  goal: GoalChoice | null
  /** For the Catch up to Steady suggestion (T-059c). */
  profile?: ProfileInfo | null
  targets?: TargetStore
  /** Saves the new pace, and the lower calorie target when there is one. */
  onSwitchPace?: (rate: number, target: TargetValues | null) => Promise<void>
  /** The food log, for food stats (T-062). */
  log?: LogStore
  /** Progress photos (T-022b). */
  photos?: PhotoStore
  today?: string
}) {
  const [target, setTarget] = useState<DietTarget | null>(null)
  const [later, setLater] = useState(() => readLater())
  useEffect(() => {
    if (!targets) return
    targets.forDate(today).then(setTarget, () => setTarget(null))
  }, [targets, today])
  const [weighIns, setWeighIns] = useState<WeighIn[] | null>(null)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [weight, setWeight] = useState('')
  const [weightError, setWeightError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [measuring, setMeasuring] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [w, m] = await Promise.all([store.weighIns(), store.measurements()])
      setWeighIns(w)
      setMeasurements(m)
      setLoadError(null)
      const todays = w.find((x) => x.date === today)
      setWeight(todays ? String(todays.kg) : '')
    } catch {
      setWeighIns([])
      setLoadError('Couldn’t load your progress. Check your connection.')
    }
  }, [store, today])

  useEffect(() => {
    void load()
  }, [load])

  const saveWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = checkWeight(weight)
    setWeightError(problem)
    if (problem) return
    setBusy(true)
    try {
      await store.saveWeighIn(today, Number(weight))
      await load()
    } catch {
      setWeightError('Couldn’t save. Check your connection and try again.')
    }
    setBusy(false)
  }

  const remove = async (date: string) => {
    try {
      await store.removeWeighIn(date)
      await load()
    } catch {
      setLoadError('Couldn’t remove that weigh-in. Check your connection.')
    }
  }

  const saveMeasurement = async (text: Partial<Record<MeasureKey, string>>) => {
    const m: Measurement = { date: today }
    for (const f of MEASURE_FIELDS) if (text[f.key]?.trim()) m[f.key] = Number(text[f.key])
    await store.saveMeasurement(m)
    setMeasuring(false)
    await load()
  }

  if (weighIns === null) return <main className="log">Loading…</main>

  const summary = weightSummary(weighIns)
  const note = summary ? goalNote(goal, summary.weekRate) : null
  const hasToday = weighIns.some((w) => w.date === today)
  const changes = measurementChanges(measurements)
  const recent = [...weighIns].reverse().slice(0, 7)
  const hidden = later !== null && later > shiftDate(today, -14)
  const steady = profile && onSwitchPace && !hidden ? steadySwitch(profile, summary?.trendKg ?? null, target) : null

  return (
    <main className="log progress">
      <h2>Progress</h2>
      {loadError && <p className="error">{loadError}</p>}

      <form className="weigh-in" onSubmit={saveWeight} noValidate>
        <label className="field">
          <span>Today’s weight</span>
          <span className="weigh-row">
            <input aria-label="Today’s weight (kg)" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <span className="muted">kg</span>
            <button className="primary" disabled={busy}>
              {hasToday ? 'Update' : 'Save'}
            </button>
          </span>
          {weightError && <small className="error">{weightError}</small>}
        </label>
        <p className="muted">Weigh yourself after waking up and using the toilet, before eating.</p>
      </form>

      {summary && (
        <section aria-label="Average weight" className="trend">
          <p className="trend-message">{summary.message}</p>
          {note && <p>{note}</p>}
          <p className="muted">Your weight goes up and down each day with water and salt. The average shows the real change, so go by the average.</p>
        </section>
      )}

      {steady && (
        <SteadyCard
          suggestion={steady}
          onSwitch={() => onSwitchPace!(steady.rate, steady.target)}
          onLater={() => {
            try {
              localStorage.setItem(LATER_KEY, today)
            } catch {
              // Hidden for this visit only.
            }
            setLater(today)
          }}
        />
      )}

      <WeightChartView weighIns={weighIns} />

      {recent.length > 0 && (
        <section aria-label="Recent weigh-ins">
          <h3>Recent weigh-ins</h3>
          <ul className="weigh-list">
            {recent.map((w) => (
              <li key={w.date}>
                <span>{shortDate(w.date)}</span>
                <strong>{w.kg} kg</strong>
                <button className="link" aria-label={`Remove ${shortDate(w.date)}`} onClick={() => void remove(w.date)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {log && <DietStats log={log} targets={targets} today={today} />}

      <section aria-label="Measurements" className="measurements">
        <header className="sheet-head">
          <h3>Measurements</h3>
          {!measuring && (
            <button className="link" onClick={() => setMeasuring(true)}>
              {measurements.some((m) => m.date === today) ? 'Edit today’s' : 'Add'}
            </button>
          )}
        </header>
        {measuring ? (
          <MeasurementForm initial={measurements.find((m) => m.date === today)} onSave={saveMeasurement} onCancel={() => setMeasuring(false)} />
        ) : changes.length ? (
          <ul className="weigh-list measure-list">
            {changes.map((c) => (
              <li key={c.key}>
                <span>{c.label}</span>
                <strong>{c.latest} cm</strong>
                <span className="muted">
                  {c.change === null
                    ? shortDate(c.latestDate)
                    : c.change === 0
                      ? `same since ${shortDate(c.firstDate)}`
                      : `${c.change < 0 ? 'down' : 'up'} ${Math.abs(c.change)} cm since ${shortDate(c.firstDate)}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Waist size shows fat loss even when the scale is slow. Measure every two weeks.</p>
        )}
      </section>

      {photos && <Photos store={photos} today={today} />}
    </main>
  )
}
