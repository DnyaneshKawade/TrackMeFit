import { describe, expect, it } from 'vitest'
import { shownWeight, stepIn, toKg, weightText } from './units'
import { describePlates, gymFor, platesFor } from './plates'

describe('kg or lb for gym weights (T-101)', () => {
  it('1. kg shows as saved; lb shows to the nearest 0.5 and goes back to the same kg', () => {
    expect(weightText(52.5, 'kg')).toBe('52.5 kg')
    expect(weightText(60, 'lb')).toBe('132.5 lb')
    expect(weightText(toKg(135, 'lb'), 'lb')).toBe('135 lb')
    expect(toKg(80, 'kg')).toBe(80)
    expect(shownWeight(toKg(102.5, 'lb'), 'lb')).toBe(102.5)
    expect(stepIn(2.5, 'lb')).toBe(5)
    expect(stepIn(2.5, 'kg')).toBe(2.5)
  })

  it('2. plates in lb use a 45 lb bar and lb plates', () => {
    const gym = gymFor('lb')
    const load = platesFor(225, gym.bars[0], gym.plates, 'lb')
    expect(load.perSide).toEqual([45, 45])
    expect(describePlates(load.perSide, 'lb')).toBe('45 + 45 lb')
    expect(platesFor(137, 45, gym.plates, 'lb').reason).toBe('137 lb can’t be loaded exactly. The closest lower weight is 135 lb.')
    expect(platesFor(30, 45, gym.plates, 'lb').reason).toBe('The bar alone weighs 45 lb.')
  })
})
