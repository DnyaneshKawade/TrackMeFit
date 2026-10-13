import { describe, expect, it } from 'vitest'
import { fromRow, memoryProfileStore, toRow } from './stores'
import { EMPTY_PROFILE, ageOn, checkAboutYou, healthNotes, isComplete, questionsFor, type ProfileInfo } from './types'

const done: ProfileInfo = {
  fullName: 'Asha',
  sex: 'female',
  birthDate: '1995-06-15',
  heightCm: 160,
  activity: 'desk',
  trainingDays: 3,
  experience: 'beginner',
  goal: 'lose',
  dietPref: 'veg',
  medical: { diabetes: false },
}

describe('profile', () => {
  it('is complete only when every engine answer is filled in', () => {
    expect(isComplete(EMPTY_PROFILE)).toBe(false)
    expect(isComplete(done)).toBe(true)
    expect(isComplete({ ...done, trainingDays: 0 })).toBe(true)
    expect(isComplete({ ...done, dietPref: null })).toBe(false)
  })

  it('counts age in whole years, birthday or not', () => {
    expect(ageOn('1995-06-15', '2026-06-14')).toBe(30)
    expect(ageOn('1995-06-15', '2026-06-15')).toBe(31)
    expect(ageOn('1995-12-31', '2026-01-01')).toBe(30)
  })

  it('explains each problem on the first step', () => {
    const errors = checkAboutYou({ fullName: ' ', sex: null, birthDate: '2016-01-01', heightCm: '17', weightKg: '' }, '2026-10-13')
    expect(errors.fullName).toMatch(/call you/)
    expect(errors.sex).toMatch(/calorie/)
    expect(errors.birthDate).toMatch(/13 and older/)
    expect(errors.heightCm).toMatch(/90 and 250/)
    expect(errors.weightKg).toMatch(/20 and 350/)
    expect(checkAboutYou({ fullName: 'Asha', sex: 'female', birthDate: '1995-06-15', heightCm: '160.5', weightKg: '64.2' }, '2026-10-13')).toEqual({})
  })

  it('asks the pregnancy question only of women', () => {
    expect(questionsFor('female').map((q) => q.key)).toContain('pregnant')
    expect(questionsFor('male').map((q) => q.key)).not.toContain('pregnant')
  })

  it('gives a doctor note for every yes', () => {
    expect(healthNotes({ diabetes: false, kidney: false }, 'male')).toEqual([])
    const notes = healthNotes({ diabetes: true, kidney: true, pregnant: true }, 'male')
    expect(notes).toHaveLength(2)
    expect(notes[0]).toMatch(/doctor/)
    expect(notes[1]).toMatch(/0\.8 g per kg/)
  })

  it('maps database rows both ways', () => {
    const row = toRow({ ...done, fullName: ' Asha ' })
    expect(row).toMatchObject({ full_name: 'Asha', birth_date: '1995-06-15', training_days: 3, diet_pref: 'veg' })
    expect(fromRow({ ...row, height_cm: '160.0', medical: null })).toEqual({ ...done, medical: {} })
  })

  it('keeps the saved profile in the memory store', async () => {
    const store = memoryProfileStore({ fullName: 'Asha' })
    expect((await store.get()).fullName).toBe('Asha')
    await store.save(done)
    expect(await store.get()).toEqual(done)
  })
})
