import { describe, expect, it } from 'vitest'
import { describePlates, platesFor } from './plates'

describe('plate calculator (T-044)', () => {
  it('6. loads each side with the largest Indian gym plates first', () => {
    expect(platesFor(100)).toMatchObject({ perSide: [25, 15], loaded: 100, exact: true, reason: '' })
    expect(platesFor(62.5)).toMatchObject({ perSide: [20, 1.25], loaded: 62.5, exact: true })
    expect(describePlates(platesFor(72.5).perSide)).toBe('25 + 1.25 kg')
  })

  it('6. works with a 15 kg or 10 kg bar', () => {
    expect(platesFor(35, 15).perSide).toEqual([10])
    expect(platesFor(30, 10).perSide).toEqual([10])
  })

  it('6. rounds a weight that can’t be loaded down to the closest lower weight', () => {
    const p = platesFor(61)
    expect(p).toMatchObject({ perSide: [20], loaded: 60, exact: false })
    expect(p.reason).toBe('61 kg can’t be loaded exactly. The closest lower weight is 60 kg.')
  })

  it('6. a weight below the bar or the bar alone', () => {
    expect(platesFor(15).reason).toBe('The bar alone weighs 20 kg.')
    expect(platesFor(20)).toMatchObject({ perSide: [], exact: true })
    expect(describePlates([])).toBe('No plates')
  })
})
