// Food stats on the Progress tab (spec T-062): the last 7 or 30 days of food
// against the targets, with a calorie chart and the most-logged foods.

import { useEffect, useMemo, useState } from 'react'
import { dietStats, type DietStats as Stats, type StatsDay } from '../engine/dietStats'
import { shiftDate, type LogEntry, type LogStore } from '../log/types'
import type { DietTarget, TargetStore } from '../targets/types'

const RANGES = [7, 30] as const
type Range = (typeof RANGES)[number]

const CHART_W = 320
const CHART_H = 120

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN')

function CalorieChart({ days, today }: { days: StatsDay[]; today: string }) {
  const top = Math.max(1, ...days.map((d) => Math.max(d.eaten?.kcal ?? 0, d.target?.kcal ?? 0))) * 1.1
  const slot = CHART_W / days.length
  const y = (kcal: number) => CHART_H - (kcal / top) * CHART_H
  const targetPoints = days.flatMap((d, i) => (d.target ? [`${i * slot},${y(d.target.kcal)}`, `${(i + 1) * slot},${y(d.target.kcal)}`] : []))
  return (
    <figure className="weight-chart kcal-chart">
      <svg viewBox={`-2 -2 ${CHART_W + 4} ${CHART_H + 4}`} role="img" aria-label={`Calories each day from ${shortDate(days[0].date)} to ${shortDate(days[days.length - 1].date)}`}>
        <line x1="0" y1={CHART_H} x2={CHART_W} y2={CHART_H} className="axis" />
        {days.map((d, i) =>
          d.eaten ? (
            <rect
              key={d.date}
              x={i * slot + slot * 0.15}
              width={slot * 0.7}
              y={y(d.eaten.kcal)}
              height={CHART_H - y(d.eaten.kcal)}
              className={d.date === today ? 'bar today' : d.onTarget ? 'bar on' : 'bar'}
            />
          ) : null,
        )}
        {targetPoints.length > 0 && <polyline points={targetPoints.join(' ')} className="target-line" />}
      </svg>
      <figcaption className="muted">
        {shortDate(days[0].date)} to {shortDate(days[days.length - 1].date)}. Bars are calories eaten, and dark green bars are on target. The line is your calorie
        target. The light bar is today.
      </figcaption>
    </figure>
  )
}

function Average({ label, value, target, unit }: { label: string; value: number; target: number | undefined; unit: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {fmt(value)}
        {unit}
        {target !== undefined && (
          <span className="muted">
            {' '}
            of {fmt(target)}
            {unit}
          </span>
        )}
      </dd>
    </div>
  )
}

function StatsView({ stats, range, today }: { stats: Stats; range: Range; today: string }) {
  const { average: a, target: t } = stats
  return (
    <>
      {a && (
        <dl className="macros" aria-label="Average per day">
          <Average label="Calories" value={a.kcal} target={t?.kcal} unit="" />
          <Average label="Protein" value={a.proteinG} target={t?.proteinG} unit=" g" />
          <Average label="Carbs" value={a.carbG} target={t?.carbG} unit=" g" />
          <Average label="Fat" value={a.fatG} target={t?.fatG} unit=" g" />
        </dl>
      )}
      {a && (
        <p className="muted">
          Average per day over {stats.loggedDays} logged {stats.loggedDays === 1 ? 'day' : 'days'} in the last {range} days.
        </p>
      )}
      {stats.daysOnTarget !== null && a && (
        <p aria-label="Days on target">
          <strong>
            {stats.daysOnTarget} of {stats.loggedDays}
          </strong>{' '}
          logged {stats.loggedDays === 1 ? 'day' : 'days'} on target.
        </p>
      )}
      {stats.proteinStreak !== null && stats.average !== null && (
        <p aria-label="Protein streak">
          Protein streak:{' '}
          <strong>
            {stats.proteinStreak} {stats.proteinStreak === 1 ? 'day' : 'days'}
          </strong>
        </p>
      )}
      {stats.loggedDays + (stats.days.some((d) => d.date === today && d.eaten) ? 1 : 0) > 0 && <CalorieChart days={stats.days} today={today} />}
      {stats.topFoods.length > 0 && (
        <section aria-label="Most logged foods">
          <h4>Most logged foods</h4>
          <ol className="weigh-list top-foods">
            {stats.topFoods.map((f) => (
              <li key={f.name}>
                <span>{f.name}</span>
                <span className="muted">
                  {f.times} {f.times === 1 ? 'time' : 'times'}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {stats.notes.map((n) => (
        <p key={n} className="muted">
          {n}
        </p>
      ))}
    </>
  )
}

export function DietStats({ log, targets, today }: { log: LogStore; targets?: TargetStore; today: string }) {
  const [range, setRange] = useState<Range>(7)
  // The longest range is read once; the shorter one is a slice of it.
  const [data, setData] = useState<{ entries: LogEntry[]; targets: DietTarget[] } | null>(null)
  const [error, setError] = useState(false)
  const from30 = shiftDate(today, -29)

  useEffect(() => {
    if (!log.listRange) return
    let live = true
    Promise.all([log.listRange(from30, today), targets ? targets.history() : Promise.resolve([])]).then(
      ([entries, history]) => live && setData({ entries, targets: history }),
      () => live && setError(true),
    )
    return () => {
      live = false
    }
  }, [log, targets, from30, today])

  const stats = useMemo(() => (data ? dietStats(data.entries, data.targets, shiftDate(today, 1 - range), today) : null), [data, range, today])

  if (!log.listRange) return null
  return (
    <section aria-label="Food stats" className="diet-stats">
      <header className="sheet-head">
        <h3>Food stats</h3>
        <div className="range" role="group" aria-label="Days to show">
          {RANGES.map((r) => (
            <button key={r} className={r === range ? 'chip on' : 'chip'} aria-pressed={r === range} onClick={() => setRange(r)}>
              {r} days
            </button>
          ))}
        </div>
      </header>
      {error && <p className="error">Couldn’t load your food stats.</p>}
      {!error && !stats && <p className="muted">Loading…</p>}
      {stats && <StatsView stats={stats} range={range} today={today} />}
    </section>
  )
}
