import { describe, expect, it } from 'vitest'
import { e1rm, exerciseRecords, newRecord, REP_CAP } from './strength'

const day = (performedOn: string, ...sets: [number, number, ('warmup' | 'drop' | 'failure')?][]) => ({
  performedOn,
  sets: sets.map(([weightKg, reps, tag]) => ({ weightKg, reps, ...(tag ? { tag } : {}) })),
})

describe('records (T-044)', () => {
  it('4. finds the heaviest weight, best estimated one-rep max and most reps, with dates', () => {
    const r = exerciseRecords([day('2026-10-01', [60, 10], [70, 5]), day('2026-10-08', [80, 2], [50, 15])])
    expect(r.heaviest).toEqual({ weightKg: 80, reps: 2, performedOn: '2026-10-08' })
    // 70 × 5 → 81.7; 80 × 2 → 85.3; 60 × 10 → 80; 50 × 15 is above the cap.
    expect(r.bestE1rm).toMatchObject({ weightKg: 80, reps: 2, e1rm: 85.5, performedOn: '2026-10-08' })
    expect(r.mostReps).toEqual({ weightKg: 50, reps: 15, performedOn: '2026-10-08' })
  })

  it('4. heaviest for N reps counts sets of N reps or more', () => {
    const r = exerciseRecords([day('2026-10-01', [60, 8]), day('2026-10-03', [70, 3])])
    const byTarget = Object.fromEntries(r.repMaxes.map((x) => [x.target, x.weightKg]))
    expect(byTarget).toEqual({ 1: 70, 2: 70, 3: 70, 5: 60, 8: 60 })
    expect(r.notes).toContain('Heaviest for 5 reps: the most you lifted 5 or more times.')
  })

  it('leaves out warm-ups and drop sets, and keeps the first date on a tie', () => {
    const r = exerciseRecords([day('2026-10-01', [100, 5, 'warmup'], [60, 5]), day('2026-10-05', [60, 5], [90, 8, 'drop'])])
    expect(r.heaviest).toEqual({ weightKg: 60, reps: 5, performedOn: '2026-10-01' })
    expect(r.notes).toContain('Warm-ups and drop sets are left out.')
  })

  it(`4. estimates the one-rep max only from sets of ${REP_CAP} reps or fewer`, () => {
    expect(e1rm(100, 1)).toBe(100)
    expect(e1rm(60, 10)).toBe(80)
    expect(e1rm(60, 13)).toBeNull()
    const r = exerciseRecords([day('2026-10-01', [40, 20])])
    expect(r.bestE1rm).toBeNull()
    expect(r.notes).toContain('Do 12 reps or fewer in a set for your one-rep max.')
  })

  it('5. the graph has the best estimated one-rep max of each workout, oldest first', () => {
    const r = exerciseRecords([day('2026-10-08', [62.5, 10]), day('2026-10-01', [60, 10], [60, 8])])
    expect(r.measure).toBe('e1rm')
    expect(r.points).toEqual([
      { date: '2026-10-01', value: 80 },
      { date: '2026-10-08', value: 83.5 },
    ])
  })

  it('5. for an exercise done with no weight, the graph shows the most reps', () => {
    const r = exerciseRecords([day('2026-10-01', [0, 12], [0, 15]), day('2026-10-04', [0, 18])])
    expect(r.heaviest).toBeNull()
    expect(r.repMaxes).toEqual([])
    expect(r.measure).toBe('reps')
    expect(r.points).toEqual([
      { date: '2026-10-01', value: 15 },
      { date: '2026-10-04', value: 18 },
    ])
    expect(r.notes[0]).toBe('You did this with no weight. So the graph shows your most reps.')
  })

  it('says what to do when there is nothing logged', () => {
    expect(exerciseRecords([]).notes[0]).toBe('Log this exercise to see your records.')
  })
})

describe('new record during a workout (T-044b)', () => {
  const past = [
    { performedOn: '2026-10-01', sets: [{ weightKg: 80, reps: 5 }, { weightKg: 70, reps: 8 }] },
    { performedOn: '2026-10-05', sets: [{ weightKg: 100, reps: 3, tag: 'warmup' as const }] },
  ]

  it('1. a heavier working set is a new record, with the old best', () => {
    expect(newRecord(past, [], { weightKg: 82.5, reps: 2 })).toEqual({ kind: 'heaviest', text: 'New record: heaviest weight. Your best before was 80 kg.' })
  })

  it('2. a set that is not heavier can beat the best estimated one-rep max', () => {
    // 80 × 5 = 93.5 before; 77.5 × 8 = 98 now.
    expect(newRecord(past, [], { weightKg: 77.5, reps: 8 })?.text).toBe('New record: best one-rep max guess, 98 kg. Your best before was 93.5 kg.')
    expect(newRecord(past, [], { weightKg: 75, reps: 5 })).toBeNull()
  })

  it('3. with no weight, more reps than before is a new record', () => {
    const dips = [{ performedOn: '2026-10-01', sets: [{ weightKg: 0, reps: 12 }] }]
    expect(newRecord(dips, [], { weightKg: 0, reps: 13 })).toEqual({ kind: 'reps', text: 'New record: most reps in a set. Your best before was 12.' })
    expect(newRecord(dips, [], { weightKg: 0, reps: 12 })).toBeNull()
  })

  it('4. sets done today count, so matching today’s record shows nothing', () => {
    const today = [{ weightKg: 85, reps: 3 }]
    expect(newRecord(past, today, { weightKg: 85, reps: 3 })).toBeNull()
    expect(newRecord(past, today, { weightKg: 87.5, reps: 1 })?.text).toBe('New record: heaviest weight. Your best before was 85 kg.')
  })

  it('5. warm-ups, drop sets and a first workout show no record', () => {
    expect(newRecord(past, [], { weightKg: 120, reps: 3, tag: 'warmup' })).toBeNull()
    expect(newRecord(past, [], { weightKg: 120, reps: 3, tag: 'drop' })).toBeNull()
    expect(newRecord([], [], { weightKg: 120, reps: 3 })).toBeNull()
    // A past day with only warm-ups is still a first workout.
    expect(newRecord([past[1]], [], { weightKg: 120, reps: 3 })).toBeNull()
  })
})
