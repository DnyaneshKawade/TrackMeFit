// Spec T-106: FitNotes-style graph choices and history with record marks.
import { describe, expect, it } from 'vitest'
import { graphPoints, historyWithRecords, rangeStart } from './strength'

const day = (performedOn: string, ...sets: [number, number, ('warmup' | 'drop')?][]) => ({
  performedOn,
  sets: sets.map(([weightKg, reps, tag]) => ({ weightKg, reps, ...(tag ? { tag } : {}) })),
})
const log = [
  day('2026-09-22', [20, 10, 'warmup'], [135, 10], [135, 10]),
  day('2026-10-02', [138, 10], [138, 10]),
  day('2026-10-19', [140, 12], [143, 10], [143, 9]),
]

describe('T-106 graph choices', () => {
  it('1. each graph gives one value per workout, warm-ups left out', () => {
    expect(graphPoints(log, 'heaviest', 'all', '2026-10-19').map((p) => p.value)).toEqual([135, 138, 143])
    expect(graphPoints(log, 'reps', 'all', '2026-10-19').map((p) => p.value)).toEqual([10, 10, 12])
    expect(graphPoints(log, 'volume', 'all', '2026-10-19').map((p) => p.value)).toEqual([2700, 2760, 4397])
    expect(graphPoints(log, 'totalReps', 'all', '2026-10-19').map((p) => p.value)).toEqual([20, 20, 31])
    expect(graphPoints(log, 'bestSet', 'all', '2026-10-19').map((p) => p.value)).toEqual([1350, 1380, 1680])
    expect(graphPoints(log, 'e1rm', 'all', '2026-10-19').map((p) => p.value)).toEqual([180, 184, 196])
  })

  it('2. the time range keeps only recent workouts', () => {
    expect(rangeStart('1m', '2026-10-19')).toBe('2026-09-19')
    expect(rangeStart('all', '2026-10-19')).toBeNull()
    expect(graphPoints(log, 'heaviest', '1m', '2026-10-25').map((p) => p.date)).toEqual(['2026-10-02', '2026-10-19'])
  })
})

describe('T-106 history', () => {
  it('3. lists workouts newest first and marks the sets that set a record', () => {
    const h = historyWithRecords(log)
    expect(h.map((s) => s.performedOn)).toEqual(['2026-10-19', '2026-10-02', '2026-09-22'])
    expect(h[2].sets.some((s) => s.record)).toBe(false)
    expect(h[1].sets.map((s) => s.record)).toEqual([true, false])
    expect(h[0].sets.map((s) => s.record)).toEqual([true, true, false])
  })
})
