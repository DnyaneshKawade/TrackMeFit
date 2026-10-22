// Share a workout as text (spec T-121).
import { describe, expect, it } from 'vitest'
import { workoutText, type ShareExercise, type ShareSet } from './shareText'

const names: Record<string, ShareExercise> = {
  bench: { name: 'Bench press' },
  pullup: { name: 'Assisted pull-up', assisted: true },
  run: { name: 'Run', cardio: true },
}
const info = (id: string) => names[id] ?? null
const set = (exerciseId: string, setIndex: number, weightKg: number, reps: number, more: Partial<ShareSet> = {}): ShareSet => ({ exerciseId, setIndex, weightKg, reps, rir: null, ...more })

describe('workout text (T-121)', () => {
  it('1. lists the name, date, each exercise and its sets in order', () => {
    const text = workoutText(
      { name: 'Push day', performedOn: '2026-10-21', sets: [set('bench', 1, 60, 8), set('bench', 0, 60, 10), set('run', 0, 0, 0, { distanceKm: 3, seconds: 1200 })] },
      info,
    )
    expect(text).toBe(['Push day · 21 Oct 2026', '', 'Bench press', '1. 60 kg × 10', '2. 60 kg × 8', '', 'Run', '1. 3 km in 20:00 · 9 km/h', '', '2 working sets.', 'Logged with Track Me Fit'].join('\n'))
  })

  it('2. shows warm-ups, drop sets, failure, myo-reps, reps left and help', () => {
    const text = workoutText(
      {
        name: 'Upper',
        performedOn: '2026-10-21',
        sets: [
          set('bench', 0, 40, 10, { tag: 'warmup' }),
          set('bench', 1, 60, 8, { rir: 2 }),
          set('bench', 2, 60, 6, { tag: 'failure' }),
          set('bench', 3, 40, 12, { tag: 'drop' }),
          set('bench', 4, 50, 25, { tag: 'myo', miniReps: [5, 4, 4] }),
          set('pullup', 0, 20, 8),
        ],
      },
      info,
    )
    expect(text).toContain('1. 40 kg × 10 · warm-up')
    expect(text).toContain('2. 60 kg × 8 · 2 reps left')
    expect(text).toContain('3. 60 kg × 6 · to failure')
    expect(text).toContain('4. 40 kg × 12 · drop set')
    expect(text).toContain('5. 50 kg × 25 · myo-reps (12 + 5 + 4 + 4)')
    expect(text).toContain('1. 20 kg help × 8')
    expect(text).toContain('5 working sets.')
  })

  it('3. uses the chosen weight unit', () => {
    expect(workoutText({ name: 'Push', performedOn: '2026-10-21', sets: [set('bench', 0, 60, 10)] }, info, 'lb')).toContain('1. 132.5 lb × 10')
  })

  it('4. leaves out notes and says when nothing was logged', () => {
    const text = workoutText({ name: 'Legs', performedOn: '2026-10-21', sets: [set('bench', 0, 60, 10, { note: 'knee hurt' } as Partial<ShareSet>)] }, info)
    expect(text).not.toContain('knee')
    expect(workoutText({ name: 'Legs', performedOn: '2026-10-21', sets: [] }, info)).toBe('Legs · 21 Oct 2026\n\nNo sets logged.\nLogged with Track Me Fit')
  })
})
