// Cardio helpers (spec T-114).
import { describe, expect, it } from 'vitest'
import { cardioRecords, cardioText, checkCardio, durationText, parseDuration, speedKmh } from './cardio'

describe('cardio helpers (T-114)', () => {
  it('1. reads minutes, minutes and seconds, and hours', () => {
    expect(parseDuration('25')).toBe(1500)
    expect(parseDuration('25:30')).toBe(1530)
    expect(parseDuration(' 1:05:00 ')).toBe(3900)
    for (const bad of ['', '0', '0:00', '25:75', '1:2:3:4', 'ten', '25.5', '-5']) expect(parseDuration(bad)).toBeNull()
    expect(durationText(1530)).toBe('25:30')
    expect(durationText(3900)).toBe('1:05:00')
    expect(durationText(59)).toBe('0:59')
  })

  it('2. checks the time and distance in plain words', () => {
    expect(checkCardio(3, 1500)).toBeNull()
    expect(checkCardio(null, 1200)).toBeNull()
    expect(checkCardio(3, null)).toMatch(/Enter the time/)
    expect(checkCardio(null, 6 * 3600 + 1)).toMatch(/6 hours/)
    expect(checkCardio(0, 600)).toMatch(/Distance/)
    expect(checkCardio(101, 600)).toMatch(/Distance/)
    expect(checkCardio(NaN, 600)).toMatch(/Distance/)
  })

  it('3. writes an entry with its speed', () => {
    expect(speedKmh(3, 1500)).toBe(7.2)
    expect(cardioText({ distanceKm: 3, seconds: 1500 })).toBe('3 km in 25:00 · 7.2 km/h')
    expect(cardioText({ seconds: 1200 })).toBe('20:00')
  })

  it('4. finds the farthest, longest and fastest entries', () => {
    const a = { performedOn: '2026-10-01', distanceKm: 5, seconds: 1800 }
    const b = { performedOn: '2026-10-02', seconds: 3600 }
    const c = { performedOn: '2026-10-03', distanceKm: 0.5, seconds: 60 }
    const d = { performedOn: '2026-10-04', distanceKm: 3, seconds: 900 }
    const r = cardioRecords([a, b, c, d])
    expect(r.farthest).toBe(a)
    expect(r.longest).toBe(b)
    // Under 1 km is too short to count as fastest.
    expect(r.fastest).toBe(d)
    expect(cardioRecords([])).toEqual({})
  })
})
