import { describe, expect, it } from 'vitest'
import { EXERCISES, STRETCH_IDS, exerciseById, similarExercise } from './exercises'
import { suggestPlan } from './starterPlan'

// Moves that train the muscle when stretched (spec T-082i).

const ids = (days: number, where: 'gym' | 'home' = 'gym') =>
  suggestPlan({ days, experience: 'intermediate', where }).plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId))

describe('stretch tag (T-082i)', () => {
  it('1. every tagged id is a real exercise, and the tag shows on it', () => {
    for (const id of STRETCH_IDS) expect(exerciseById.get(id)?.stretch, id).toBe(true)
    expect(exerciseById.get('lying-leg-curl')?.stretch).toBeUndefined()
    expect(EXERCISES.filter((e) => e.stretch).length).toBe(STRETCH_IDS.size)
  })

  it('2. tagged moves cover the muscles the studies looked at', () => {
    const muscles = new Set(EXERCISES.filter((e) => e.stretch).map((e) => e.primary))
    for (const m of ['hamstrings', 'triceps', 'biceps', 'calves', 'quads', 'chest', 'sideDelts'] as const) expect(muscles, m).toContain(m)
  })

  it('3. the starter plan picks seated over lying leg curls, an overhead triceps move and incline curls', () => {
    // With one leg-curl slot a week it is the seated one; the "B" day keeps variety.
    expect(ids(2)).toContain('seated-leg-curl')
    expect(ids(2)).not.toContain('lying-leg-curl')
    expect(ids(4)).toContain('overhead-triceps-extension')
    expect(ids(6)).toContain('incline-db-curl')
    expect(suggestPlan({ days: 4, experience: 'intermediate', where: 'gym' }).reasons).toContain(
      'Some moves work the muscle when it is stretched. That may help it grow a bit more.',
    )
  })

  it('4. swaps pick a stretch move first, with the same kit when there is one', () => {
    const lying = exerciseById.get('lying-leg-curl')!
    expect(similarExercise(lying, new Set())?.id).toBe('seated-leg-curl')
    const pushdown = exerciseById.get('triceps-pushdown')!
    const swap = similarExercise(pushdown, new Set())!
    expect(swap.stretch).toBe(true)
    expect(swap.equipment).toBe('cable')
  })
})
