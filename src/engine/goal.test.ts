// Exercise goals (spec T-119).
import { describe, expect, it } from 'vitest'
import { goalLine, goalProgress } from './goal'
import type { StrengthSession } from './strength'

const day = (performedOn: string, ...sets: [number, number, ('warmup' | 'drop')?][]): StrengthSession => ({
  performedOn,
  sets: sets.map(([weightKg, reps, tag]) => ({ weightKg, reps, ...(tag ? { tag } : {}) })),
})

describe('exercise goals (T-119)', () => {
  it('1. shows the best set with enough reps and how far it is towards the goal', () => {
    const p = goalProgress([day('2026-10-01', [80, 5], [95, 2]), day('2026-10-08', [90, 5], [120, 5, 'drop'])], { kg: 100, reps: 5 })
    expect(p.best).toEqual({ weightKg: 90, reps: 5, performedOn: '2026-10-08' })
    expect(p.reached).toBeNull()
    expect(p.percent).toBe(90)
    expect(p.text).toBe('Goal: 100 kg × 5. Your best is 90 kg × 5, 90% of the way.')
  })

  it('2. marks the first set that met the goal', () => {
    const p = goalProgress([day('2026-10-08', [100, 1]), day('2026-10-01', [100, 2]), day('2026-09-20', [60, 10, 'warmup'])], { kg: 100, reps: 1 })
    expect(p.reached).toEqual({ weightKg: 100, reps: 2, performedOn: '2026-10-01' })
    expect(p.percent).toBe(100)
    expect(p.text).toBe('Goal reached: 100 kg × 1. Time to set a new one.')
  })

  it('3. with no set of enough reps it says what to do, and lb users see lb', () => {
    expect(goalProgress([day('2026-10-01', [90, 3])], { kg: 100, reps: 5 }).text).toBe('Goal: 100 kg × 5. Do a set of 5 or more reps to see your progress.')
    expect(goalProgress([], { kg: 100, reps: 1 }, 'lb').text).toMatch(/^Goal: 220(\.\d)? lb × 1\./)
  })

  it('4. the goal line sits on the weight and one-rep max graphs only', () => {
    expect(goalLine({ kg: 100, reps: 1 }, 'heaviest')).toBe(100)
    expect(goalLine({ kg: 100, reps: 1 }, 'e1rm')).toBe(100)
    expect(goalLine({ kg: 90, reps: 5 }, 'e1rm')).toBe(105)
    expect(goalLine({ kg: 90, reps: 5 }, 'volume')).toBeNull()
  })
})
