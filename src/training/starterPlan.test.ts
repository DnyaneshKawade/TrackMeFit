import { describe, expect, it } from 'vitest'
import { checkPlan } from './types'
import { exerciseById } from './exercises'
import { suggestPlan, type StarterChoices } from './starterPlan'

const plan = (c: Partial<StarterChoices> = {}) => suggestPlan({ days: 3, experience: 'intermediate', where: 'gym', ...c })
const ids = (r: ReturnType<typeof suggestPlan>) => r.plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId))
const totalSets = (r: ReturnType<typeof suggestPlan>) => r.plan.days.reduce((s, d) => s + d.exercises.reduce((t, e) => t + e.sets, 0), 0)

describe('suggested workout plan (T-041a)', () => {
  it('2. the split follows workouts a week', () => {
    expect(plan({ days: 2 }).plan.days.map((d) => d.name)).toEqual(['Full body A', 'Full body B'])
    expect(plan({ days: 3 }).plan.days.map((d) => d.name)).toEqual(['Full body A', 'Full body B', 'Full body A again'])
    expect(plan({ days: 4 }).plan.days.map((d) => d.name)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B'])
    expect(plan({ days: 5 }).plan.days.map((d) => d.name)).toEqual(['Upper', 'Lower', 'Push', 'Pull', 'Legs'])
    expect(plan({ days: 6 }).plan.days.map((d) => d.name)).toEqual(['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'])
    expect(plan({ days: 4 }).reasons).toContain('With 4 workouts a week, upper body and lower body take turns.')
  })

  it('2. fewer than 2 or more than 6 workouts are brought in range, with a reason', () => {
    const low = plan({ days: 0 })
    expect(low.plan.days).toHaveLength(2)
    expect(low.reasons[0]).toBe('This plan has 2 workouts a week. That is the fewest that build muscle.')
    const high = plan({ days: 7 })
    expect(high.plan.days).toHaveLength(6)
    expect(high.reasons[0]).toBe('This plan has 6 workouts a week. One rest day helps you recover.')
  })

  it('3. equipment decides which exercises are used', () => {
    for (const days of [2, 3, 4, 5, 6]) {
      const home = new Set(ids(plan({ days, where: 'home' })).map((id) => exerciseById.get(id)!.equipment))
      expect([...home].every((e) => ['dumbbell', 'bodyweight', 'kettlebell'].includes(e))).toBe(true)
      const none = new Set(ids(plan({ days, where: 'none' })).map((id) => exerciseById.get(id)!.equipment))
      expect([...none]).toEqual(['bodyweight'])
    }
    expect(ids(plan({ where: 'gym' }))).toContain('back-squat')
    expect(plan({ where: 'none' }).reasons).toContain('Some exercises need a bar, like pull-ups. Swap them if you have none.')
    expect(plan({ where: 'gym' }).reasons.join(' ')).not.toMatch(/need a bar/)
  })

  it('4. beginners start with fewer sets; 2 to 4 sets each; no repeats in a day', () => {
    for (const days of [2, 3, 4, 5, 6])
      expect(totalSets(plan({ days, experience: 'beginner' }))).toBeLessThan(totalSets(plan({ days, experience: 'advanced' })))
    for (const days of [2, 3, 4, 5, 6])
      for (const where of ['gym', 'home', 'none'] as const)
        for (const experience of ['beginner', 'intermediate', 'advanced'] as const) {
          const r = plan({ days, where, experience })
          // Every suggestion passes the same checks as a plan made by hand.
          expect(checkPlan({ ...r.plan })).toEqual([])
          for (const d of r.plan.days) {
            expect(new Set(d.exercises.map((e) => e.exerciseId)).size).toBe(d.exercises.length)
            for (const e of d.exercises) expect([2, 3, 4]).toContain(e.sets)
          }
        }
  })

  it('4. big lifts use fewer reps than one-joint exercises; beginners a little more', () => {
    const day = plan({ experience: 'beginner' }).plan.days[0].exercises
    expect(day.find((e) => e.exerciseId === 'back-squat')).toMatchObject({ repMin: 8, repMax: 12 })
    expect(day.find((e) => e.exerciseId === 'lateral-raise')).toMatchObject({ repMin: 10, repMax: 15 })
    expect(plan().plan.days[0].exercises[0]).toMatchObject({ exerciseId: 'back-squat', repMin: 6, repMax: 10 })
  })

  it('5. reasons say why, in plain words', () => {
    expect(plan({ experience: 'beginner' }).reasons).toEqual([
      'With 3 workouts a week, each one trains the whole body.',
      'Each muscle gets trained about twice a week.',
      'You are new to lifting, so sets start low. The weekly review adds sets when you recover well.',
      'Change any exercise, set or day before you save.',
    ])
  })
})
