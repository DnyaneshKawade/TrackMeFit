import { describe, expect, it } from 'vitest'
import { carbsFromRest, checkTarget, macroMismatch, remaining, targetOn } from './types'
import { fromRow, memoryTargetStore } from './stores'

describe('checking targets', () => {
  it('accepts sensible whole numbers', () => {
    expect(checkTarget({ kcal: 2200, proteinG: 140, carbG: 250, fatG: 70 })).toEqual({})
  })
  it('explains missing, fractional and out-of-range values', () => {
    expect(checkTarget({ kcal: 500, proteinG: 140.5, fatG: 301 })).toEqual({
      kcal: 'Calories must be between 800 and 6000.',
      proteinG: 'Use a whole number.',
      carbG: 'Enter carbs.',
      fatG: 'Fat must be between 0 and 300.',
    })
  })
  it('notes when macros don’t add up to the calories, within 5% is fine', () => {
    // 140*4 + 250*4 + 70*9 = 2190
    expect(macroMismatch({ kcal: 2200, proteinG: 140, carbG: 250, fatG: 70 })).toBeNull()
    expect(macroMismatch({ kcal: 1800, proteinG: 140, carbG: 250, fatG: 70 })).toBe(
      'Your protein, carbs and fat add up to 2190 calories. That is 390 more than your calories.',
    )
  })
  it('fills carbs from the calories left, never below zero', () => {
    expect(carbsFromRest(2200, 140, 70)).toBe(253)
    expect(carbsFromRest(1000, 200, 80)).toBe(0)
  })
})

describe('which target applies', () => {
  const list = [
    { id: 'a', startsOn: '2026-10-01' },
    { id: 'b', startsOn: '2026-10-10' },
    { id: 'c', startsOn: '2026-10-10' },
  ]
  it('uses the newest target that has started; the later of two same-day targets wins', () => {
    expect(targetOn(list, '2026-09-30')).toBeNull()
    expect(targetOn(list, '2026-10-05')?.id).toBe('a')
    expect(targetOn(list, '2026-10-12')?.id).toBe('c')
  })
  it('works out what is left, negative when over', () => {
    expect(remaining({ kcal: 2000, proteinG: 120, carbG: 220, fatG: 60 }, { kcal: 2150, proteinG: 80.25, carbG: 200, fatG: 61 })).toEqual({
      kcal: -150,
      proteinG: 39.8,
      carbG: 20,
      fatG: -1,
    })
  })
})

describe('stores', () => {
  it('memory store keeps history and returns the target for each day', async () => {
    const s = memoryTargetStore('me')
    await s.save({ kcal: 2000, proteinG: 120, carbG: 220, fatG: 60 }, '2026-10-01')
    await s.save({ kcal: 1800, proteinG: 130, carbG: 180, fatG: 55 }, '2026-10-12')
    expect((await s.forDate('2026-10-05'))?.kcal).toBe(2000)
    expect(await s.forDate('2026-10-12')).toMatchObject({ kcal: 1800, setBy: 'me', source: 'manual' })
  })
  it('maps database rows', () => {
    expect(
      fromRow({ id: 'x', starts_on: '2026-10-12', kcal: 1800, protein_g: 130, carb_g: 180, fat_g: 55, source: 'manual', set_by: 'coach' }),
    ).toEqual({ id: 'x', startsOn: '2026-10-12', kcal: 1800, proteinG: 130, carbG: 180, fatG: 55, source: 'manual', setBy: 'coach' })
  })
})
