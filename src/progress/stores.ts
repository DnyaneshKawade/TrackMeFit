import type { SupabaseClient } from '@supabase/supabase-js'
import { MEASURE_FIELDS, type MeasureKey, type Measurement, type ProgressStore, type WeighIn } from './types'

const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date)

export function memoryProgressStore(weighIns: WeighIn[] = [], measurements: Measurement[] = []): ProgressStore {
  const w = new Map(weighIns.map((x) => [x.date, x]))
  const m = new Map(measurements.map((x) => [x.date, x]))
  return {
    async weighIns() {
      return [...w.values()].sort(byDate)
    },
    async saveWeighIn(date, kg) {
      w.set(date, { date, kg })
    },
    async removeWeighIn(date) {
      w.delete(date)
    },
    async measurements() {
      return [...m.values()].sort(byDate)
    },
    async saveMeasurement(x) {
      m.set(x.date, { ...x })
    },
    async removeMeasurement(date) {
      m.delete(date)
    },
  }
}

const COLUMN: Record<MeasureKey, string> = {
  waistCm: 'waist_cm',
  hipCm: 'hip_cm',
  chestCm: 'chest_cm',
  armCm: 'arm_cm',
  thighCm: 'thigh_cm',
}

export type MeasurementRow = { measured_on: string } & Record<string, number | string | null>

export function measurementFromRow(r: MeasurementRow): Measurement {
  const m: Measurement = { date: r.measured_on }
  for (const f of MEASURE_FIELDS) {
    const v = r[COLUMN[f.key]]
    if (v !== null && v !== undefined) m[f.key] = Number(v)
  }
  return m
}

export function measurementToRow(m: Measurement): MeasurementRow {
  const row: MeasurementRow = { measured_on: m.date }
  for (const f of MEASURE_FIELDS) row[COLUMN[f.key]] = m[f.key] ?? null
  return row
}

/** Weigh-ins and measurements for one person. Row-level security lets the
 * person write and their active coach read. */
export function supabaseProgressStore(sb: SupabaseClient, userId: string): ProgressStore {
  return {
    async weighIns() {
      const { data, error } = await sb.from('weigh_ins').select('measured_on, weight_kg').eq('user_id', userId).order('measured_on')
      if (error) throw error
      return (data as { measured_on: string; weight_kg: number | string }[]).map((r) => ({ date: r.measured_on, kg: Number(r.weight_kg) }))
    },
    async saveWeighIn(date, kg) {
      const { error } = await sb
        .from('weigh_ins')
        .upsert({ user_id: userId, measured_on: date, weight_kg: kg }, { onConflict: 'user_id,measured_on' })
      if (error) throw error
    },
    async removeWeighIn(date) {
      const { error } = await sb.from('weigh_ins').delete().eq('user_id', userId).eq('measured_on', date)
      if (error) throw error
    },
    async measurements() {
      const columns = ['measured_on', ...Object.values(COLUMN)].join(', ')
      const { data, error } = await sb.from('measurements').select(columns).eq('user_id', userId).order('measured_on')
      if (error) throw error
      return (data as unknown as MeasurementRow[]).map(measurementFromRow)
    },
    async saveMeasurement(m) {
      const { error } = await sb
        .from('measurements')
        .upsert({ user_id: userId, ...measurementToRow(m) }, { onConflict: 'user_id,measured_on' })
      if (error) throw error
    },
    async removeMeasurement(date) {
      const { error } = await sb.from('measurements').delete().eq('user_id', userId).eq('measured_on', date)
      if (error) throw error
    },
  }
}
