import { describe, expect, it } from 'vitest'
import { e1rm, exerciseRecords, REP_CAP } from './strength'

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
    expect(r.notes).toContain('Heaviest for 5 reps means the most weight lifted for 5 reps or more.')
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
    expect(r.notes).toContain('Do a set of 12 reps or fewer to see your one-rep max.')
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
    expect(r.notes[0]).toBe('You did this with no weight, so the graph shows your most reps.')
  })

  it('says what to do when there is nothing logged', () => {
    expect(exerciseRecords([]).notes[0]).toBe('Log this exercise to see your records.')
  })
})
