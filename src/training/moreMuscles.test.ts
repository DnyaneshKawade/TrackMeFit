import { describe, expect, it } from 'vitest'
import { LANDMARKS, startingSets } from '../engine/training'
import { exerciseById, MUSCLE_NAMES, searchExercises } from './exercises'
import { suggestPlan } from './starterPlan'
import { weeklySets } from './progression'
import type { Plan } from './types'

// Four more muscles (spec T-082a).

const NEW = ['frontDelts', 'forearms', 'adductors', 'neck'] as const

const planOf = (...exercises: [string, number][]): Plan => ({
  name: 'Test',
  days: [{ dayIndex: 0, name: 'A', exercises: exercises.map(([exerciseId, sets]) => ({ exerciseId, sets, repMin: 8, repMax: 12 })) }],
})

describe('more muscles (T-082a)', () => {
  it('1. front raises count for front delts, not side delts', () => {
    expect(weeklySets(planOf(['db-front-raise', 3]))).toEqual({ frontDelts: 3 })
    expect(exerciseById.get('lateral-raise')?.primary).toBe('sideDelts')
  })

  it('2. shoulder presses count as half sets for front delts', () => {
    expect(weeklySets(planOf(['overhead-press', 4]))).toEqual({ sideDelts: 4, triceps: 2, frontDelts: 2 })
  })

  it('3. forearms, inner thighs and neck have their own exercises and names', () => {
    for (const m of NEW) expect(MUSCLE_NAMES[m]).toBeTruthy()
    expect(searchExercises('wrist curl').some((e) => e.primary === 'forearms')).toBe(true)
    expect(searchExercises('adductor').some((e) => e.primary === 'adductors')).toBe(true)
    expect(searchExercises('inner thigh').some((e) => e.primary === 'adductors')).toBe(true)
    expect(searchExercises('neck').some((e) => e.primary === 'neck')).toBe(true)
  })

  it('4. no plan adds sets for the new muscles on its own; neck work is only for people who pick it', () => {
    for (const m of NEW) {
      expect(LANDMARKS[m].mev, m).toBe(0)
      for (const level of ['beginner', 'intermediate', 'advanced'] as const) expect(startingSets(m, level), m).toBe(0)
    }
    for (const where of ['gym', 'home', 'none'] as const)
      for (const days of [2, 3, 4, 5, 6]) {
        const { plan } = suggestPlan({ days, experience: 'intermediate', where })
        const muscles = plan.days.flatMap((d) => d.exercises.map((e) => exerciseById.get(e.exerciseId)?.primary))
        expect(muscles.filter((m) => m === 'neck'), `${where} ${days}`).toEqual([])
      }
  })
})
