// Assisted machines (spec T-117): the weight is help, so less is progress.
import { describe, expect, it } from 'vitest'
import { assistedGraph, assistedHistory, assistedNewRecord, assistedNext, assistedRecords } from './assisted'
import type { StrengthSession } from './strength'

const day = (performedOn: string, ...sets: [number, number, ('warmup' | 'drop')?][]): StrengthSession => ({
  performedOn,
  sets: sets.map(([weightKg, reps, tag]) => ({ weightKg, reps, ...(tag ? { tag } : {}) })),
})
const H = [day('2026-09-01', [40, 8], [40, 7]), day('2026-09-08', [35, 8], [60, 3, 'warmup']), day('2026-09-15', [35, 10], [30, 5])]

describe('assisted machines (T-117)', () => {
  it('1. records: least help wins, more reps break a tie, warm-ups left out', () => {
    const r = assistedRecords(H)
    expect(r.leastHelp).toEqual({ weightKg: 30, reps: 5, performedOn: '2026-09-15' })
    expect(r.mostReps).toEqual({ weightKg: 35, reps: 10, performedOn: '2026-09-15' })
    expect(r.notes[0]).toMatch(/Less help/)
    expect(assistedRecords([]).leastHelp).toBeNull()
  })

  it('2. a new record is less help, or more reps with the same help', () => {
    expect(assistedNewRecord(H, [], { weightKg: 25, reps: 4 })).toBe('New record: least help. Your best before was 30 kg.')
    expect(assistedNewRecord(H, [], { weightKg: 30, reps: 6 })).toBe('New record: 6 reps with 30 kg of help.')
    expect(assistedNewRecord(H, [], { weightKg: 30, reps: 5 })).toBeNull()
    expect(assistedNewRecord(H, [], { weightKg: 50, reps: 12 })).toBeNull()
    expect(assistedNewRecord(H, [], { weightKg: 10, reps: 5, tag: 'warmup' })).toBeNull()
    // Sets already done today count.
    expect(assistedNewRecord(H, [{ weightKg: 25, reps: 4 }], { weightKg: 25, reps: 3 })).toBeNull()
    // The first workout only sets the start.
    expect(assistedNewRecord([], [], { weightKg: 40, reps: 8 })).toBeNull()
  })

  it('3. the graph shows the least help or most reps per workout', () => {
    expect(assistedGraph(H, 'help', 'all', '2026-09-20')).toEqual([
      { date: '2026-09-01', value: 40 },
      { date: '2026-09-08', value: 35 },
      { date: '2026-09-15', value: 30 },
    ])
    expect(assistedGraph(H, 'reps', 'all', '2026-09-20').map((p) => p.value)).toEqual([8, 8, 10])
    expect(assistedGraph(H, 'help', '1m', '2026-10-10').map((p) => p.date)).toEqual(['2026-09-15'])
  })

  it('4. history marks sets that beat the best so far, not on the first day', () => {
    const days = assistedHistory(H)
    expect(days.map((d) => d.performedOn)).toEqual(['2026-09-15', '2026-09-08', '2026-09-01'])
    expect(days[2].sets.every((s) => !s.record)).toBe(true)
    expect(days[1].sets.map((s) => s.record)).toEqual([true, false])
    expect(days[0].sets.map((s) => s.record)).toEqual([true, true])
  })

  it('5. suggestions take help away at the top of the range, and add it after misses or a break', () => {
    const base = { help: 30, repsDone: [10, 10], repRange: [6, 10] as [number, number], increment: 5, missStreak: 0 }
    expect(assistedNext(base)).toMatchObject({ weight: 25, targetReps: 6, why: 'Hit 10 reps on every set, so the help goes down.' })
    expect(assistedNext({ ...base, help: 0 })).toMatchObject({ weight: 0, why: expect.stringMatching(/no help/) })
    expect(assistedNext({ ...base, help: 3 })).toMatchObject({ weight: 0 })
    expect(assistedNext({ ...base, repsDone: [5, 4], missStreak: 2 })).toMatchObject({ weight: 35, why: expect.stringMatching(/more help/) })
    expect(assistedNext({ ...base, repsDone: [8, 7] })).toMatchObject({ weight: 30, targetReps: 9 })
    expect(assistedNext({ ...base, daysOff: 25 })).toMatchObject({ weight: 40, why: 'You had 25 days off. So use a little more help today.' })
  })
})
