import { describe, expect, it } from 'vitest'
import { summaryRows } from './summary'
import { EMPTY_PROFILE, type ProfileInfo } from './types'

// The signup answers as rows (spec T-084).

const asha: ProfileInfo = {
  ...EMPTY_PROFILE,
  fullName: 'Asha',
  sex: 'female',
  birthDate: '1988-06-15',
  heightCm: 167,
  activity: 'desk',
  trainingDays: 3,
  experience: 'beginner',
  equipment: 'gym',
  goal: 'lose',
  goalRate: -0.005,
  targetWeightKg: 60,
  dietPref: 'nonveg',
  foodRules: ['no_onion_garlic', 'nonveg_off:tue'],
  fasting: ['ekadashi'],
  allergies: ['peanuts'],
  medical: { thyroid: true, kidney: false },
  otherHealth: 'Vitamin D tablets',
  currentDiet: { counts: {}, kcal: 1850, proteinG: 48 },
  onboardedAt: '2026-10-12T10:00:00Z',
}

describe('profile summary (T-084)', () => {
  it('1. every signup step shows its answers in plain words', () => {
    const rows = summaryRows(asha, 65, '2026-10-19')
    expect(rows).toHaveLength(6)
    expect(rows[0]).toEqual([['Name', 'Asha'], ['Sex', 'Female'], ['Age', '38 years'], ['Height', '167 cm'], ['Weight', '65 kg']])
    expect(rows[1]).toEqual([['Health', 'A thyroid condition'], ['Other', 'Vitamin D tablets']])
    expect(rows[2]).toEqual([['Normal day', 'Mostly sitting'], ['Workouts a week', '3'], ['Lifting experience', 'New, or under a year'], ['Where you train', 'A gym']])
    expect(rows[3]).toEqual([['Goal', 'Lose fat'], ['Pace', '0.5% of your weight a week'], ['Target weight', '60 kg']])
    expect(rows[4]).toEqual([
      ['Diet', 'I eat everything (veg and non-veg)'],
      ['Food rule', 'No onion or garlic'],
      ['Veg days', 'Tue'],
      ['Fasting', 'Ekadashi'],
      ['Allergies', 'Peanuts'],
    ])
    expect(rows[5]).toEqual([['Usual day', 'About 1,850 kcal and 48 g protein']])
  })

  it('2. skipped answers read as not given, and empty lists as none', () => {
    const rows = summaryRows({ ...EMPTY_PROFILE, onboardedAt: '2026-10-12T10:00:00Z' }, null, '2026-10-19')
    expect(rows[0].every(([, v]) => v === null)).toBe(true)
    expect(rows[1]).toEqual([['Health', 'Nothing ticked']])
    expect(rows[4]).toContainEqual(['Fasting', 'None'])
    expect(rows[5]).toEqual([['Usual day', null]])
  })
})
