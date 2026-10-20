// Progress: weigh-ins, the trend weight, and body measurements. Pure helpers;
// every judgement comes with the reason in plain words.

import { trendWeights, type WeighIn } from '../engine/diet'
import { shiftDate } from '../log/types'
import type { GoalChoice } from '../profile/types'

export type { WeighIn }

export const MEASURE_FIELDS = [
  { key: 'waistCm', label: 'Waist', min: 30, max: 250 },
  { key: 'hipCm', label: 'Hips', min: 30, max: 250 },
  { key: 'chestCm', label: 'Chest', min: 30, max: 250 },
  { key: 'armCm', label: 'Arm', min: 10, max: 80 },
  { key: 'thighCm', label: 'Thigh', min: 20, max: 120 },
] as const

export type MeasureKey = (typeof MEASURE_FIELDS)[number]['key']

export type Measurement = { date: string } & Partial<Record<MeasureKey, number>>

export interface ProgressStore {
  /** All weigh-ins, oldest first. */
  weighIns(): Promise<WeighIn[]>
  /** One weigh-in per day: saving again replaces that day's weight. */
  saveWeighIn(date: string, kg: number): Promise<void>
  removeWeighIn(date: string): Promise<void>
  /** All measurements, oldest first. */
  measurements(): Promise<Measurement[]>
  /** One set of measurements per day: saving again replaces that day's. */
  saveMeasurement(m: Measurement): Promise<void>
}

export function checkWeight(text: string): string | null {
  const kg = Number(text)
  if (!text.trim() || !Number.isFinite(kg) || kg < 20 || kg > 350) return 'Weight should be between 20 and 350 kg.'
  return null
}

/** A missed day can be added up to a year back, never in the future (T-104). */
export function checkDay(day: string, today: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day > today) return 'Pick today or an earlier day.'
  const back = new Date(`${today}T00:00:00Z`)
  back.setUTCFullYear(back.getUTCFullYear() - 1)
  if (day < back.toISOString().slice(0, 10)) return 'Pick a day in the last year.'
  return null
}

/** Checks a measurement form. At least one field is needed; every filled one
 * must be in range. */
export function checkMeasurement(text: Partial<Record<MeasureKey, string>>): Partial<Record<MeasureKey | 'form', string>> {
  const errors: Partial<Record<MeasureKey | 'form', string>> = {}
  let any = false
  for (const f of MEASURE_FIELDS) {
    const t = text[f.key]?.trim()
    if (!t) continue
    any = true
    const v = Number(t)
    if (!Number.isFinite(v) || v < f.min || v > f.max) errors[f.key] = `${f.label} should be between ${f.min} and ${f.max} cm.`
  }
  if (!any) errors.form = 'Fill in at least one measurement.'
  return errors
}

export interface WeightSummary {
  latestKg: number
  latestDate: string
  trendKg: number
  /** Trend change over the last 7 days; null until there are 7 days of data. */
  weekChangeKg: number | null
  /** The same change as a share of body weight, e.g. -0.005 for -0.5 %. */
  weekRate: number | null
  /** One sentence describing the trend. */
  message: string
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Where the trend is and how it moved over the last week. */
export function weightSummary(weighIns: WeighIn[]): WeightSummary | null {
  if (!weighIns.length) return null
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date))
  const trend = trendWeights(sorted)
  const last = sorted[sorted.length - 1]
  const now = trend[trend.length - 1].kg
  const weekAgo = shiftDate(last.date, -7)
  const before = [...trend].reverse().find((t) => t.date <= weekAgo)
  if (!before) {
    return {
      latestKg: last.kg,
      latestDate: last.date,
      trendKg: round1(now),
      weekChangeKg: null,
      weekRate: null,
      message: 'Weigh in most mornings for a week. Then you’ll see where your weight is going.',
    }
  }
  const change = round1(now - before.kg)
  const rate = (now - before.kg) / before.kg
  const message =
    change === 0
      ? `Your average weight is ${round1(now)} kg, steady over the last week.`
      : `Your average weight is ${round1(now)} kg. It went ${change < 0 ? 'down' : 'up'} ${Math.abs(change)} kg this week.`
  return { latestKg: last.kg, latestDate: last.date, trendKg: round1(now), weekChangeKg: change, weekRate: rate, message }
}

/** How the weekly rate compares with the goal, as plain advice. Null when
 * there is no weekly rate yet. */
export function goalNote(goal: GoalChoice | null, weekRate: number | null): string | null {
  if (weekRate === null || goal === null) return null
  const pct = (r: number) => `${Math.abs(Math.round(r * 1000) / 10)} %`
  if (goal === 'lose') {
    if (weekRate < -0.01) return `You’re losing ${pct(weekRate)} of your weight a week. That is faster than the 1 % safe limit. Eat a little more to keep your muscle.`
    if (weekRate <= -0.0025) return `You’re losing ${pct(weekRate)} of your weight a week. That’s a good pace for fat loss.`
    return 'Your weight isn’t dropping yet. Give it two weeks of steady logging before cutting food further.'
  }
  if (goal === 'gain') {
    if (weekRate > 0.005) return `You’re gaining ${pct(weekRate)} a week. Slower, around 0.25 to 0.5 %, keeps the gain mostly muscle.`
    if (weekRate >= 0.001) return `You’re gaining ${pct(weekRate)} a week. That’s a good pace to build muscle.`
    return 'Your weight isn’t going up yet. Add a little food if this holds for two weeks.'
  }
  if (Math.abs(weekRate) <= 0.0025) return 'Your weight is holding steady, which is what your goal needs.'
  return `Your weight moved ${pct(weekRate)} this week. Small changes are normal. Look at the average over a few weeks.`
}

export interface ChartPoint {
  date: string
  x: number
  y: number
}

export interface WeightChart {
  scale: ChartPoint[]
  trend: ChartPoint[]
  minKg: number
  maxKg: number
  firstDate: string
  lastDate: string
}

const DAY_MS = 86_400_000
const dayNum = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / DAY_MS)

/** Points for the weight chart: the last `days` days ending on the newest
 * weigh-in, scaled into a `width` x `height` box. The trend uses all
 * weigh-ins so the line starts where it really was. */
export function weightChart(weighIns: WeighIn[], width: number, height: number, days = 90): WeightChart | null {
  if (!weighIns.length) return null
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date))
  const lastDate = sorted[sorted.length - 1].date
  const from = shiftDate(lastDate, -(days - 1))
  const trendAll = trendWeights(sorted)
  const scale = sorted.filter((w) => w.date >= from)
  const trend = trendAll.filter((w) => w.date >= from)
  const values = [...scale, ...trend].map((w) => w.kg)
  // Keep at least a 2 kg window so small changes don't look dramatic.
  let minKg = Math.floor(Math.min(...values) * 2) / 2
  let maxKg = Math.ceil(Math.max(...values) * 2) / 2
  if (maxKg - minKg < 2) {
    const mid = (maxKg + minKg) / 2
    minKg = mid - 1
    maxKg = mid + 1
  }
  const firstDate = scale[0].date
  const span = Math.max(1, dayNum(lastDate) - dayNum(firstDate))
  const place = (w: WeighIn): ChartPoint => ({
    date: w.date,
    x: Math.round(((dayNum(w.date) - dayNum(firstDate)) / span) * width * 10) / 10,
    y: Math.round((1 - (w.kg - minKg) / (maxKg - minKg)) * height * 10) / 10,
  })
  return { scale: scale.map(place), trend: trend.map(place), minKg, maxKg, firstDate, lastDate }
}

export interface MeasureChange {
  key: MeasureKey
  label: string
  latest: number
  latestDate: string
  /** Change since the first time this was measured; null if measured once. */
  change: number | null
  firstDate: string
}

/** Latest value of each measurement and how it changed since the first. */
export function measurementChanges(list: Measurement[]): MeasureChange[] {
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date))
  const out: MeasureChange[] = []
  for (const f of MEASURE_FIELDS) {
    const rows = sorted.filter((m) => m[f.key] !== undefined)
    if (!rows.length) continue
    const first = rows[0]
    const last = rows[rows.length - 1]
    out.push({
      key: f.key,
      label: f.label,
      latest: last[f.key]!,
      latestDate: last.date,
      change: rows.length > 1 ? round1(last[f.key]! - first[f.key]!) : null,
      firstDate: first.date,
    })
  }
  return out
}
