// The workout finish screen numbers (spec T-155).
import { describe, expect, it } from 'vitest'
import { byExercise, workoutSummary, type SummarySet } from './workoutSummary'

const TODAY = '2026-10-22'
const NAMES: Record<string, string> = { bench: 'Bench press', squat: 'Squat', row: 'Row' }
const nameOf = (id: string) => NAMES[id]
const set = (exerciseId: string, weightKg: number, reps: number, extra: Partial<SummarySet> = {}): SummarySet => ({ exerciseId, weightKg, reps, ...extra })

describe('workout summary (T-155)', () => {
  it('1. counts time, working sets and weight lifted, leaving out warm-ups, drop sets and cardio', () => {
    const s = workoutSummary({
      today: TODAY,
      sets: [set('bench', 40, 10, { tag: 'warmup' }), set('bench', 80, 8), set('bench', 80, 7), set('bench', 60, 10, { tag: 'drop' }), set('walk', 0, 0, { seconds: 600 })],
      past: null,
      seconds: 47 * 60 + 20,
      nameOf,
    })
    expect(s).toEqual({ minutes: 47, sets: 2, liftedKg: 1200, records: [], trend: null })
  })

  it('2. names a new heaviest weight or one-rep max guess, once per exercise', () => {
    const past = byExercise([
      { performedOn: '2026-10-15', sets: [set('bench', 80, 8), set('squat', 100, 5), set('row', 60, 10)] },
    ])
    const s = workoutSummary({ today: TODAY, sets: [set('bench', 82.5, 6), set('bench', 85, 3), set('squat', 100, 7), set('row', 60, 9)], past, seconds: null, nameOf })
    expect(s.records).toEqual(['Bench press: heaviest weight, 85 kg.', 'Squat: best one-rep max guess, 123.5 kg.'])
  })

  it('3. the first time with an exercise is not a record, and a lost history gives none', () => {
    expect(workoutSummary({ today: TODAY, sets: [set('bench', 80, 8)], past: new Map(), seconds: null, nameOf }).records).toEqual([])
    expect(workoutSummary({ today: TODAY, sets: [set('bench', 80, 8)], past: null, seconds: null, nameOf }).records).toEqual([])
  })

  it('4. one trend line for the exercise that grew most over the last 8 weeks', () => {
    const past = byExercise([
      { performedOn: '2026-08-01', sets: [set('bench', 50, 5)] }, // over 8 weeks back: left out
      { performedOn: '2026-09-10', sets: [set('bench', 75, 5), set('squat', 100, 5)] },
      { performedOn: '2026-10-15', sets: [set('bench', 78, 5), set('squat', 101, 5)] },
    ])
    const s = workoutSummary({ today: TODAY, sets: [set('bench', 80, 5), set('squat', 102.5, 5)], past, seconds: null, nameOf, unit: 'kg' })
    expect(s.trend).toBe('Bench press: one-rep max guess up 6 kg in 6 weeks.')
  })

  it('5. steady strength says so; a drop or under 2 weeks of history gives no line; a forgotten clock gives no time', () => {
    const steady = byExercise([{ performedOn: '2026-09-24', sets: [set('bench', 80, 5)] }])
    expect(workoutSummary({ today: TODAY, sets: [set('bench', 80, 5)], past: steady, seconds: null, nameOf }).trend).toBe('Bench press: strength held steady over 4 weeks.')
    expect(workoutSummary({ today: TODAY, sets: [set('bench', 70, 5)], past: steady, seconds: null, nameOf }).trend).toBeNull()
    const recent = byExercise([{ performedOn: '2026-10-15', sets: [set('bench', 75, 5)] }])
    expect(workoutSummary({ today: TODAY, sets: [set('bench', 80, 5)], past: recent, seconds: null, nameOf }).trend).toBeNull()
    expect(workoutSummary({ today: TODAY, sets: [set('bench', 80, 5)], past: null, seconds: 6 * 3600, nameOf }).minutes).toBeNull()
  })
})
