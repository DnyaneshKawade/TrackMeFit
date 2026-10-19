import { describe, expect, it } from 'vitest'
import { warmupSets, type WarmupInput } from './warmup'

// Warm-up sets (spec T-082c).

const squat: WarmupInput = { workingKg: 100, workingReps: 5, equipment: 'barbell', isolation: false, warm: false, increment: 2.5 }

describe('warm-up sets (T-082c)', () => {
  it('1. a heavy barbell lift starts with the bar, then 50, 70 and 85%, rounded to plates', () => {
    expect(warmupSets(squat)).toEqual({
      sets: [{ weight: 20, reps: 10 }, { weight: 50, reps: 8 }, { weight: 70, reps: 4 }, { weight: 85, reps: 2 }],
      why: 'Build up in steps, so the heavy sets feel smooth and safe.',
    })
    // 0.7 × 62.5 = 43.75 can't be loaded: it rounds down to 42.5.
    expect(warmupSets({ ...squat, workingKg: 62.5, workingReps: 10 }).sets).toEqual([{ weight: 20, reps: 10 }, { weight: 30, reps: 8 }, { weight: 42.5, reps: 4 }])
  })

  it('2. 9 or more working reps skip the 85% step', () => {
    expect(warmupSets({ ...squat, workingReps: 10 }).sets.map((s) => s.weight)).toEqual([20, 50, 70])
  })

  it('3. a muscle already warm gets one set for a big lift and none for a small one', () => {
    expect(warmupSets({ ...squat, warm: true })).toMatchObject({ sets: [{ weight: 70, reps: 4 }] })
    const curl: WarmupInput = { workingKg: 14, workingReps: 12, equipment: 'dumbbell', isolation: true, warm: false, increment: 2 }
    expect(warmupSets(curl)).toEqual({ sets: [{ weight: 6, reps: 10 }], why: 'One light set gets the muscle ready.' })
    expect(warmupSets({ ...curl, warm: true })).toEqual({ sets: [], why: 'This muscle is already warm, so go straight to your working sets.' })
  })

  it('4. machines round down to their weight steps', () => {
    expect(warmupSets({ workingKg: 60, workingReps: 10, equipment: 'machine', isolation: false, warm: false, increment: 5 }).sets).toEqual([
      { weight: 30, reps: 8 },
      { weight: 40, reps: 4 },
    ])
  })

  it('5. a light bar gets the bar once; very light weights and body weight need none', () => {
    expect(warmupSets({ ...squat, workingKg: 22.5 }).sets).toEqual([{ weight: 20, reps: 8 }])
    expect(warmupSets({ ...squat, equipment: 'dumbbell', workingKg: 2, increment: 2 })).toEqual({
      sets: [],
      why: 'The working weight is light, so no warm-up sets are needed.',
    })
    expect(warmupSets({ ...squat, equipment: 'bodyweight' })).toEqual({ sets: [], why: '' })
    expect(warmupSets({ ...squat, workingKg: 0 }).sets).toEqual([])
  })
})
