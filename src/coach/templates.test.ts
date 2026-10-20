import { describe, expect, it } from 'vitest'
import { copyTemplate, joinText } from './templates'
import type { Plan } from '../training/types'

describe('program templates (T-026g)', () => {
  it('4. a copy has no ids, keeps library and client exercises, leaves out the coach’s own, and drops days left empty', () => {
    const t: Plan = {
      id: 't1',
      name: 'Upper Lower',
      hardWeeks: 5,
      changedBy: 'coach',
      days: [
        { id: 'd1', dayIndex: 0, name: 'Upper', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }, { exerciseId: 'custom:client', sets: 2, repMin: 10, repMax: 15 }] },
        { id: 'd2', dayIndex: 1, name: 'Extra', exercises: [{ exerciseId: 'custom:coach', sets: 3, repMin: 8, repMax: 12 }] },
        { id: 'd3', dayIndex: 2, name: 'Lower', exercises: [{ exerciseId: 'back-squat', sets: 3, repMin: 5, repMax: 8 }] },
      ],
    }
    const { plan, dropped } = copyTemplate(t, (id) => id === 'custom:client')
    expect(dropped).toBe(1)
    expect(plan).toEqual({
      name: 'Upper Lower',
      hardWeeks: 5,
      days: [
        { dayIndex: 0, name: 'Upper', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }, { exerciseId: 'custom:client', sets: 2, repMin: 10, repMax: 15 }] },
        { dayIndex: 2, name: 'Lower', exercises: [{ exerciseId: 'back-squat', sets: 3, repMin: 5, repMax: 8 }] },
      ],
    })
  })

  it('5. the join text names the starting week', () => {
    expect(joinText('Asha', 1, 4)).toBe('Asha starts at week 1 today.')
  })
})
