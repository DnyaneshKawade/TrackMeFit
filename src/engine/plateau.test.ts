import { describe, expect, it } from 'vitest'
import { plateauCheck, sessionBest, type PlateauInput, type PlateauSession } from './plateau'
import { similarExercise, exerciseById } from '../training/exercises'

// Plateau check for one exercise (spec T-082e).

const day = (d: number) => `2026-10-${String(d).padStart(2, '0')}`
/** Sessions a week apart, newest first, each 3 sets at the weight and reps given. */
const weekly = (...s: [number, number][]): PlateauSession[] =>
  s.map(([w, r], i) => ({ performedOn: day(29 - i * 7), sets: [0, 1, 2].map(() => ({ weightKg: w, reps: r, rir: 2 })) }))

const base = (history: PlateauSession[]): PlateauInput => ({ history, repRange: [6, 10], increment: 2.5, weeklySets: 12, mavLow: 10, swapName: 'Dumbbell bench press' })

describe('plateau check (T-082e)', () => {
  it('1. a new best in any of the last 3 sessions is no plateau', () => {
    expect(plateauCheck(base(weekly([60, 9], [60, 8], [60, 8], [60, 8])))).toBeNull()
    // Too few sessions to tell.
    expect(plateauCheck(base(weekly([60, 8], [60, 8], [60, 8])))).toBeNull()
    // The best counts reps left: 60 × (1 + (8 + 2) / 30).
    expect(sessionBest([{ weightKg: 60, reps: 8, rir: 2 }])).toBe(80)
  })

  it('2. 3 sessions with no new best and a missed target gives a lighter session, 10% off', () => {
    expect(plateauCheck(base(weekly([60, 5], [60, 8], [60, 8], [60, 8])))).toEqual({
      action: 'lighter',
      weight: 52.5,
      why: 'No new best in 3 sessions. You also missed the target. So do one lighter session to recover.',
    })
  })

  it('3. 3 sessions with no new best and few sets for the muscle says add a set', () => {
    expect(plateauCheck({ ...base(weekly([60, 8], [60, 8], [60, 8], [60, 8])), weeklySets: 6 })).toEqual({
      action: 'addSet',
      why: 'No new best in 3 sessions. This muscle gets 6 sets a week. So add one set here.',
    })
  })

  it('4. 3 sessions with no new best and enough sets says swap at the next block, naming a similar exercise', () => {
    expect(plateauCheck(base(weekly([60, 8], [60, 8], [60, 8], [62.5, 8])))).toEqual({
      action: 'swap',
      why: 'No new best in 3 sessions. At your next block, try Dumbbell bench press instead.',
    })
    const bench = exerciseById.get('bench-press')!
    const swap = similarExercise(bench, new Set(['bench-press']))!
    expect(swap.primary).toBe('chest')
    expect(swap.isolation).toBe(false)
    expect(swap.equipment).toBe('barbell')
    expect(similarExercise(bench, new Set([swap.id]))?.id).not.toBe(swap.id)
  })

  it('5. gaps over 10 days, a break before today, or body-weight sets give no plateau', () => {
    const gappy = weekly([60, 8], [60, 8], [60, 8], [60, 8])
    gappy[1] = { ...gappy[1], performedOn: day(10) }
    expect(plateauCheck(base(gappy))).toBeNull()
    expect(plateauCheck({ ...base(weekly([60, 8], [60, 8], [60, 8], [60, 8])), today: '2026-11-20' })).toBeNull()
    expect(plateauCheck(base(weekly([0, 12], [0, 12], [0, 12], [0, 12])))).toBeNull()
  })
})
