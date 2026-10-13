import { describe, expect, it } from 'vitest'
import type { Food } from '../food/types'
import { memoryLogStore } from './memoryStore'
import { fromRow, toRow } from './supabaseStore'
import { entryFor, localDate, shiftDate, totals } from './types'

const dal: Food = {
  id: 'tmf:dish:dal-tadka',
  name: 'Dal tadka',
  state: 'cooked',
  per100g: { kcal: 120, proteinG: 6, carbG: 15, fatG: 4 },
  portions: [{ label: '1 katori (150 g)', grams: 150 }],
  source: 'trackMeFit',
}

describe('log entries', () => {
  it('snapshots name and macros for the amount eaten', () => {
    expect(entryFor(dal, 150, 'lunch', '2026-10-12')).toEqual({
      loggedOn: '2026-10-12',
      meal: 'lunch',
      foodId: 'tmf:dish:dal-tadka',
      foodName: 'Dal tadka',
      grams: 150,
      kcal: 180,
      proteinG: 9,
      carbG: 22.5,
      fatG: 6,
    })
  })
  it('names packaged products with their brand', () => {
    expect(entryFor({ ...dal, brand: 'MTR' }, 50, 'snacks', '2026-10-12').foodName).toBe('Dal tadka (MTR)')
  })
  it('rejects empty or huge amounts', () => {
    expect(() => entryFor(dal, 0, 'lunch', '2026-10-12')).toThrow()
    expect(() => entryFor(dal, 5001, 'lunch', '2026-10-12')).toThrow()
    expect(() => entryFor(dal, NaN, 'lunch', '2026-10-12')).toThrow()
  })
  it('adds up a day', () => {
    const a = entryFor(dal, 150, 'lunch', 'd')
    const b = entryFor(dal, 100, 'dinner', 'd')
    expect(totals([a, b])).toEqual({ kcal: 300, proteinG: 15, carbG: 37.5, fatG: 10 })
    expect(totals([])).toEqual({ kcal: 0, proteinG: 0, carbG: 0, fatG: 0 })
  })
})

describe('dates', () => {
  it('uses the local calendar day and crosses month and year ends', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
    expect(shiftDate('2026-03-01', -1)).toBe('2026-02-28')
    expect(shiftDate('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('stores', () => {
  it('memory store lists by day, adds and removes', async () => {
    const store = memoryLogStore()
    const saved = await store.add(entryFor(dal, 150, 'lunch', '2026-10-12'))
    await store.add(entryFor(dal, 150, 'lunch', '2026-10-11'))
    expect((await store.listDay('2026-10-12')).map((e) => e.id)).toEqual([saved.id])
    await store.remove(saved.id)
    expect(await store.listDay('2026-10-12')).toEqual([])
  })
  it('maps database rows both ways, turning numeric strings into numbers', () => {
    const e = entryFor(dal, 150, 'lunch', '2026-10-12')
    const row = { id: 'x', ...toRow(e), grams: '150', kcal: '180', protein_g: '9', carb_g: '22.5', fat_g: '6' }
    expect(fromRow(row)).toEqual({ id: 'x', ...e })
  })
})
