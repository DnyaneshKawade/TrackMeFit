// Training volume (spec T-122).
import { describe, expect, it } from 'vitest'
import { graphPoints } from './strength'
import { weekOf, weeklyMuscleSets, workoutVolume, type ExerciseInfo, type VolumeSession } from './volumeHistory'

const info: ExerciseInfo = (id) =>
  id === 'bench'
    ? { primary: 'chest', secondary: ['triceps'], load: true }
    : id === 'pushdown'
      ? { primary: 'triceps', secondary: [], load: true }
      : id === 'assisted-dip'
        ? { primary: 'chest', secondary: ['triceps'], load: false }
        : null
const s = (exerciseId: string, weightKg: number, reps: number, tag?: 'warmup' | 'drop') => ({ exerciseId, weightKg, reps, ...(tag ? { tag } : {}) })
const SESSIONS: VolumeSession[] = [
  { performedOn: '2026-10-07', sets: [s('bench', 40, 10, 'warmup'), s('bench', 60, 10), s('bench', 60, 8), s('pushdown', 20, 12, 'drop')] },
  { performedOn: '2026-10-09', sets: [s('bench', 60, 10), s('assisted-dip', 30, 8), s('cardio-run', 0, 0)] },
  { performedOn: '2026-10-13', sets: [s('pushdown', 25, 12), s('pushdown', 25, 10)] },
  { performedOn: '2026-10-07', sets: [s('pushdown', 20, 10)] },
]

describe('training volume (T-122)', () => {
  it('1. workout volume adds weight × reps for each day, without warm-ups, cardio or assisted help', () => {
    expect(workoutVolume(SESSIONS, info)).toEqual([
      { date: '2026-10-07', value: 600 + 480 + 240 + 200 },
      { date: '2026-10-09', value: 600 },
      { date: '2026-10-13', value: 550 },
    ])
  })

  it('2. weekly sets count 1 for the main muscle and 0.5 for a muscle it also works', () => {
    expect(weekOf('2026-10-07')).toBe('2026-10-05')
    expect(weekOf('2026-10-11')).toBe('2026-10-05')
    expect(weekOf('2026-10-12')).toBe('2026-10-12')
    expect(weeklyMuscleSets(SESSIONS, 'chest', info)).toEqual([{ date: '2026-10-05', value: 4 }])
    // 3 bench sets and 1 assisted dip as half sets, plus 1 pushdown (the drop set is left out).
    expect(weeklyMuscleSets(SESSIONS, 'triceps', info)).toEqual([
      { date: '2026-10-05', value: 3 },
      { date: '2026-10-12', value: 2 },
    ])
    expect(weeklyMuscleSets(SESSIONS, 'calves', info)).toEqual([])
  })

  it('3. the exercise graph counts working sets, without warm-ups or drop sets', () => {
    const sets = [{ weightKg: 40, reps: 10, tag: 'warmup' as const }, { weightKg: 60, reps: 10 }, { weightKg: 60, reps: 8 }, { weightKg: 40, reps: 12, tag: 'drop' as const }]
    expect(graphPoints([{ performedOn: '2026-10-07', sets }], 'sets', 'all', '2026-10-21')).toEqual([{ date: '2026-10-07', value: 2 }])
  })
})
