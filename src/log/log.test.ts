import { describe, expect, it } from 'vitest'
import type { Food } from '../food/types'
import { memoryLogStore } from './memoryStore'
import { fromRow, toRow } from './supabaseStore'
import { EMPTY_QUICK_FORM, entryFor, localDate, quickEntry, recentFoods, repeatEntry, shiftDate, totals, type LogEntry } from './types'

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

describe('quick add', () => {
  it('logs calories with optional macros and no weight', () => {
    expect(quickEntry({ ...EMPTY_QUICK_FORM, name: ' Wedding buffet ', kcal: '900', protein: '30' }, 'dinner', '2026-10-13')).toEqual({
      loggedOn: '2026-10-13', meal: 'dinner', foodId: 'quick', foodName: 'Wedding buffet', grams: null,
      kcal: 900, proteinG: 30, carbG: 0, fatG: 0,
    })
    expect(quickEntry({ ...EMPTY_QUICK_FORM, kcal: '250' }, 'snacks', '2026-10-13')).toMatchObject({ foodName: 'Quick add' })
  })

  it('needs calories, and macros that fit inside them', () => {
    expect(quickEntry(EMPTY_QUICK_FORM, 'lunch', '2026-10-13')).toMatch(/Calories should be between/)
    expect(quickEntry({ ...EMPTY_QUICK_FORM, kcal: '9000' }, 'lunch', '2026-10-13')).toMatch(/Calories should be between/)
    expect(quickEntry({ ...EMPTY_QUICK_FORM, kcal: '200', protein: 'x' }, 'lunch', '2026-10-13')).toMatch(/numbers/)
    expect(quickEntry({ ...EMPTY_QUICK_FORM, kcal: '200', protein: '50', fat: '20' }, 'lunch', '2026-10-13')).toMatch(/more calories/)
  })
})

describe('recent and frequent foods', () => {
  const e = (id: string, foodId: string, grams: number | null = 100, foodName = foodId, kcal = 100): LogEntry => ({
    id, loggedOn: '2026-10-12', meal: 'lunch', foodId, foodName, grams, kcal, proteinG: 1, carbG: 1, fatG: 1,
  })

  it('offers each food once with its latest amount, often-eaten ones first', () => {
    // Newest first, as the store returns them.
    const list = [e('6', 'roti', 80), e('5', 'dal'), e('4', 'roti', 40), e('3', 'chai'), e('2', 'roti', 40), e('1', 'quick', null, 'Biryani', 700)]
    const { often, recent } = recentFoods(list)
    expect(often.map((r) => [r.entry.id, r.times])).toEqual([['6', 3]])
    expect(recent.map((r) => r.entry.foodName)).toEqual(['dal', 'chai', 'Biryani'])
  })

  it('keeps different quick adds apart', () => {
    const { recent } = recentFoods([e('2', 'quick', null, 'Biryani', 700), e('1', 'quick', null, 'Biryani', 500)])
    expect(recent).toHaveLength(2)
  })

  it('logs the same amount again on another day and meal', () => {
    expect(repeatEntry(e('9', 'roti', 80), 'dinner', '2026-10-13')).toEqual({
      loggedOn: '2026-10-13', meal: 'dinner', foodId: 'roti', foodName: 'roti', grams: 80, kcal: 100, proteinG: 1, carbG: 1, fatG: 1,
    })
  })

  it('the memory store returns recent entries newest first', async () => {
    const store = memoryLogStore([e('1', 'a'), e('2', 'b')])
    await store.add({ ...repeatEntry(e('x', 'c'), 'lunch', '2026-10-13') })
    expect((await store.recent()).map((r) => r.foodId)).toEqual(['c', 'b', 'a'])
  })

  it('reads a quick add row back with no weight', () => {
    const row = { id: 'q', logged_on: '2026-10-13', meal: 'dinner' as const, food_id: 'quick', food_name: 'Biryani', grams: null, kcal: '700', protein_g: '0', carb_g: '0', fat_g: '0' }
    expect(fromRow(row).grams).toBeNull()
  })
})

describe('entries from the meal plan (T-060)', () => {
  const key = 'plan1:Lunch:0:tmf:dish:dal-tadka'
  it('3. an entry keeps the plan item it came from, to and from the database', () => {
    const e = { ...entryFor(dal, 150, 'lunch', '2026-10-13'), planItem: key }
    expect(toRow(e).plan_item).toBe(key)
    expect(fromRow({ ...toRow(e), id: 'a' }).planItem).toBe(key)
    // Entries logged by hand carry none.
    expect('plan_item' in toRow(entryFor(dal, 150, 'lunch', '2026-10-13'))).toBe(false)
    expect('planItem' in fromRow({ ...toRow(entryFor(dal, 150, 'lunch', '2026-10-13')), id: 'b', plan_item: null })).toBe(false)
  })

  it('3. adding a ticked food again by hand does not copy its tick', () => {
    const e: LogEntry = { ...entryFor(dal, 150, 'lunch', '2026-10-13'), id: 'a', planItem: key }
    expect(repeatEntry(e, 'dinner', '2026-10-14').planItem).toBeUndefined()
  })
})
