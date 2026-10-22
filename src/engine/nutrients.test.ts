import { describe, expect, it } from 'vitest'
import { dailyTargets, proteinWeight } from './nutrients'

const kcalOf = (v: { proteinG: number; carbG: number; fatG: number }) => v.proteinG * 4 + v.carbG * 4 + v.fatG * 9

describe('protein, carbs, fat and fibre (T-068c)', () => {
  it('1. protein is 1.4 g per kg of body weight under BMI 25, underweight too', () => {
    const t = dailyTargets({ kcal: 1800, weightKg: 60, heightCm: 165 })
    expect([t.values.proteinG, t.perKg]).toEqual([84, 1.4])
    expect(t.reasons[0]).toBe('Protein is 1.4 g per kg of body weight. That is enough to build muscle.')
    expect(dailyTargets({ kcal: 2000, weightKg: 45, heightCm: 165 }).values.proteinG).toBe(63)
  })

  it('2. from BMI 25, protein is worked out on the weight at BMI 25', () => {
    // 100 kg at 170 cm: BMI 34.6, so 25 × 1.7² = 72.25 kg.
    expect(proteinWeight(100, 170)).toBeCloseTo(72.25)
    const t = dailyTargets({ kcal: 2000, weightKg: 100, heightCm: 170 })
    expect(t.values.proteinG).toBe(101)
    expect(t.reasons[0]).toBe('Protein is 1.4 g per kg of a healthy weight (72 kg).')
  })

  it('3. kidney disease keeps protein to 0.8 g per kg, with a doctor note', () => {
    const t = dailyTargets({ kcal: 1800, weightKg: 70, heightCm: 170, kidneyDisease: true })
    expect([t.values.proteinG, t.perKg]).toEqual([56, 0.8])
    expect(t.reasons[0]).toMatch(/kidney disease\. Ask your doctor/)
  })

  it('4. fat is about a quarter, carbs fill the rest, and carbs stay at 130 g and 40 % or more', () => {
    const easy = dailyTargets({ kcal: 2000, weightKg: 65, heightCm: 170 })
    expect(easy.values).toEqual({ kcal: 2000, proteinG: 91, fatG: 56, carbG: 284 })
    expect(easy.proteinLowered).toBe(false)
    // 85 kg at 1,500 kcal: 119 g protein would leave 141 g carbs, under 150 g (40 %).
    const tight = dailyTargets({ kcal: 1500, weightKg: 85, heightCm: 190 })
    expect(tight.values).toEqual({ kcal: 1500, proteinG: 110, fatG: 51, carbG: 150 })
    expect([tight.perKg, tight.proteinLowered]).toEqual([1.3, true])
    expect(tight.reasons).toContain('Protein is a little lower for now. Carbs stay at 150 g or more.')
    // Protein never goes below 1.2 g per kg, even if carbs can't reach their level.
    const floor = dailyTargets({ kcal: 1200, weightKg: 80, heightCm: 175 })
    expect(floor.perKg).toBe(1.2)
    expect(floor.values.fatG).toBe(48) // 0.6 g per kg
    for (const t of [easy, tight, floor]) expect(Math.abs(kcalOf(t.values) - t.values.kcal)).toBeLessThan(15)
  })

  it('5. fibre is 14 g per 1,000 calories, at least 25 g', () => {
    expect(dailyTargets({ kcal: 1500, weightKg: 60, heightCm: 160 }).fibreG).toBe(25)
    const t = dailyTargets({ kcal: 2400, weightKg: 70, heightCm: 175 })
    expect(t.fibreG).toBe(34)
    expect(t.reasons).toContain('Eat about 34 g of fibre a day. Dal, vegetables and fruit help.')
  })
})
