import { describe, expect, it } from 'vitest'
import { trendWeights } from '../engine/diet'
import { shiftDate } from '../log/types'
import { measurementFromRow, measurementToRow, memoryProgressStore } from './stores'
import { checkMeasurement, checkWeight, goalNote, measurementChanges, weightChart, weightSummary, type WeighIn } from './types'

/** `n` daily weigh-ins from `start`, changing by `step` kg a day. */
const days = (start: string, n: number, kg: number, step: number): WeighIn[] =>
  Array.from({ length: n }, (_, i) => ({ date: shiftDate(start, i), kg: Math.round((kg + step * i) * 10) / 10 }))

describe('weight summary', () => {
  it('has nothing to say without weigh-ins', () => {
    expect(weightSummary([])).toBeNull()
  })

  it('asks for a week of weigh-ins before giving a weekly change', () => {
    const s = weightSummary(days('2026-10-01', 5, 70, -0.1))!
    expect(s.weekChangeKg).toBeNull()
    expect(s.latestKg).toBe(69.6)
    expect(s.message).toMatch(/for a week/)
  })

  it('reports the trend and its change over the last 7 days', () => {
    const w = days('2026-10-01', 14, 80, -0.1)
    const s = weightSummary(w)!
    const trend = trendWeights(w)
    const expected = Math.round((trend[13].kg - trend[6].kg) * 10) / 10
    expect(s.weekChangeKg).toBe(expected)
    expect(s.weekChangeKg!).toBeLessThan(0)
    expect(s.trendKg).toBe(Math.round(trend[13].kg * 10) / 10)
    expect(s.message).toBe(`Your average weight is ${s.trendKg} kg. It went down ${Math.abs(expected)} kg this week.`)
  })

  it('uses the latest trend point at least a week old when days are missing', () => {
    const w = [
      { date: '2026-10-01', kg: 70 },
      { date: '2026-10-05', kg: 70 },
      { date: '2026-10-13', kg: 70 },
    ]
    const s = weightSummary(w)!
    expect(s.weekChangeKg).toBe(0)
    expect(s.message).toMatch(/steady/)
  })
})

describe('goal notes', () => {
  it('flags fat loss faster than 1 % a week', () => {
    expect(goalNote('lose', -0.015)).toMatch(/faster than the 1 % safe limit/)
    expect(goalNote('lose', -0.006)).toMatch(/good pace/)
    expect(goalNote('lose', 0.001)).toMatch(/isn’t dropping/)
  })
  it('keeps muscle gain slow', () => {
    expect(goalNote('gain', 0.008)).toMatch(/Slower/)
    expect(goalNote('gain', 0.003)).toMatch(/good pace/)
    expect(goalNote('gain', 0)).toMatch(/isn’t going up/)
  })
  it('expects maintenance and recomp to hold steady', () => {
    expect(goalNote('maintain', 0.001)).toMatch(/holding steady/)
    expect(goalNote('recomp', -0.008)).toMatch(/Small changes are normal/)
  })
  it('says nothing without a rate or a goal', () => {
    expect(goalNote('lose', null)).toBeNull()
    expect(goalNote(null, -0.01)).toBeNull()
  })
})

describe('weight chart', () => {
  it('places the first weigh-in on the left, the last on the right, heavier higher', () => {
    const c = weightChart(days('2026-10-01', 11, 70, -0.3), 300, 100)!
    expect(c.scale[0]).toMatchObject({ date: '2026-10-01', x: 0 })
    expect(c.scale[10]).toMatchObject({ date: '2026-10-11', x: 300 })
    expect(c.scale[0].y).toBeLessThan(c.scale[10].y)
    expect(c.minKg).toBe(67)
    expect(c.maxKg).toBe(70)
    for (const p of [...c.scale, ...c.trend]) {
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(100)
    }
  })

  it('keeps at least a 2 kg window so small wiggles stay small', () => {
    const c = weightChart(
      [
        { date: '2026-10-01', kg: 70 },
        { date: '2026-10-02', kg: 70.2 },
      ],
      300,
      100,
    )!
    expect(c.maxKg - c.minKg).toBe(2)
  })

  it('shows only the last 90 days but keeps the trend from earlier weigh-ins', () => {
    const w = days('2026-06-01', 140, 90, -0.1)
    const c = weightChart(w, 300, 100)!
    expect(c.scale).toHaveLength(90)
    expect(c.firstDate).toBe(shiftDate('2026-06-01', 50))
    // The trend lags behind a steady loss, so it starts above that day's weight.
    expect(c.trend[0].date).toBe(c.firstDate)
    expect(c.trend[0].y).toBeLessThan(c.scale[0].y)
  })
})

describe('measurements', () => {
  it('shows the latest value and the change since the first', () => {
    const changes = measurementChanges([
      { date: '2026-10-13', waistCm: 82, armCm: 31 },
      { date: '2026-09-01', waistCm: 85.5 },
    ])
    expect(changes).toEqual([
      { key: 'waistCm', label: 'Waist', latest: 82, latestDate: '2026-10-13', change: -3.5, firstDate: '2026-09-01' },
      { key: 'armCm', label: 'Arm', latest: 31, latestDate: '2026-10-13', change: null, firstDate: '2026-10-13' },
    ])
  })

  it('needs at least one value, each in range', () => {
    expect(checkMeasurement({ waistCm: ' ' }).form).toMatch(/at least one/)
    expect(checkMeasurement({ waistCm: '8' }).waistCm).toMatch(/30 and 250/)
    expect(checkMeasurement({ waistCm: '82', thighCm: '' })).toEqual({})
  })

  it('checks weights', () => {
    expect(checkWeight('')).toMatch(/20 and 350/)
    expect(checkWeight('abc')).toMatch(/20 and 350/)
    expect(checkWeight('64.5')).toBeNull()
  })

  it('maps measurement rows both ways', () => {
    const row = measurementToRow({ date: '2026-10-13', waistCm: 82 })
    expect(row).toEqual({ measured_on: '2026-10-13', waist_cm: 82, hip_cm: null, chest_cm: null, arm_cm: null, thigh_cm: null })
    expect(measurementFromRow({ ...row, waist_cm: '82.0' })).toEqual({ date: '2026-10-13', waistCm: 82 })
  })
})

describe('memory progress store', () => {
  it('keeps one weigh-in per day, oldest first', async () => {
    const s = memoryProgressStore()
    await s.saveWeighIn('2026-10-13', 70)
    await s.saveWeighIn('2026-10-12', 71)
    await s.saveWeighIn('2026-10-13', 69.8)
    expect(await s.weighIns()).toEqual([
      { date: '2026-10-12', kg: 71 },
      { date: '2026-10-13', kg: 69.8 },
    ])
    await s.removeWeighIn('2026-10-12')
    expect(await s.weighIns()).toHaveLength(1)
  })
})
