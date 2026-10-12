import { describe, expect, it } from 'vitest'
import {
  activityFactor,
  calorieTarget,
  indianBmiBand,
  bmi,
  initialExpenditure,
  macroTargets,
  mifflinBmr,
  proteinTarget,
  trendWeights,
  updateExpenditure,
} from './diet'

describe('mifflinBmr', () => {
  it('matches the published formula', () => {
    expect(mifflinBmr('male', 70, 175, 30)).toBeCloseTo(1648.75)
    expect(mifflinBmr('female', 60, 160, 30)).toBeCloseTo(1289)
  })
})

describe('initialExpenditure', () => {
  it('uses conservative activity factors', () => {
    expect(activityFactor('desk', 0)).toBe(1.3)
    expect(activityFactor('desk', 4)).toBeCloseTo(1.4)
    const tdee = initialExpenditure({ sex: 'female', weightKg: 60, heightCm: 160, ageYears: 30, dayType: 'desk', trainingDaysPerWeek: 4 })
    expect(tdee).toBe(Math.round(1289 * 1.4))
  })
})

describe('trendWeights', () => {
  it('smooths day-to-day swings', () => {
    const t = trendWeights([
      { date: '2026-10-01', kg: 65 },
      { date: '2026-10-02', kg: 66 },
      { date: '2026-10-03', kg: 64 },
    ])
    expect(t[0].kg).toBe(65)
    expect(t[1].kg).toBeCloseTo(65.1)
    expect(t[2].kg).toBeGreaterThan(64.8)
    expect(t[2].kg).toBeLessThan(65.1)
  })

  it('gives a weigh-in after a long gap more pull', () => {
    const daily = trendWeights([{ date: '2026-10-01', kg: 65 }, { date: '2026-10-02', kg: 63 }])
    const gap = trendWeights([{ date: '2026-10-01', kg: 65 }, { date: '2026-10-11', kg: 63 }])
    expect(gap[1].kg).toBeLessThan(daily[1].kg)
  })
})

describe('updateExpenditure', () => {
  it('derives burn from intake and trend change', () => {
    // Ate 2000/day, lost 0.5 kg in 7 days -> stored -550/day -> observed 2550.
    const r = updateExpenditure(2300, { intakeKcal: Array(7).fill(2000), trendStartKg: 70, trendEndKg: 69.5 })
    expect(r.updated).toBe(true)
    expect(r.tdee).toBe(2425)
  })

  it('ignores days that were not logged', () => {
    const r = updateExpenditure(2000, { intakeKcal: [1800, null, 1800, 1800, null, 1800, null], trendStartKg: 60, trendEndKg: 60 })
    expect(r.tdee).toBe(1900)
  })

  it('does not update with too few logged days or a flagged week', () => {
    expect(updateExpenditure(2000, { intakeKcal: [1500, 1500, 1500, null, null, null, null], trendStartKg: 60, trendEndKg: 59 }).updated).toBe(false)
    expect(updateExpenditure(2000, { intakeKcal: Array(7).fill(1500), trendStartKg: 60, trendEndKg: 59, flagged: true }).updated).toBe(false)
  })
})

describe('calorieTarget', () => {
  it('sets a deficit from the weekly loss rate', () => {
    // 0.5% of 70 kg = 0.35 kg/week -> 385 kcal/day deficit.
    expect(calorieTarget({ tdee: 2400, weightKg: 70, rate: -0.005, sex: 'male' })).toBe(2020)
  })

  it('never exceeds 1% loss per week', () => {
    const fast = calorieTarget({ tdee: 3000, weightKg: 100, rate: -0.03, sex: 'male' })
    const capped = calorieTarget({ tdee: 3000, weightKg: 100, rate: -0.01, sex: 'male' })
    expect(fast).toBe(capped)
  })

  it('moves at most 150 kcal from last week', () => {
    expect(calorieTarget({ tdee: 2400, weightKg: 70, rate: -0.005, sex: 'male', previousTarget: 2400 })).toBe(2250)
  })

  it('respects the calorie floor unless coached', () => {
    expect(calorieTarget({ tdee: 1350, weightKg: 50, rate: -0.01, sex: 'female' })).toBe(1200)
    expect(calorieTarget({ tdee: 1350, weightKg: 50, rate: -0.01, sex: 'female', hasCoach: true })).toBe(800)
  })
})

describe('Indian BMI bands', () => {
  it('treats 23 and over as raised', () => {
    expect(indianBmiBand(22.9)).toBe('normal')
    expect(indianBmiBand(23)).toBe('overweight')
    expect(indianBmiBand(25)).toBe('obese')
    expect(bmi(64, 160)).toBeCloseTo(25)
  })
})

describe('proteinTarget', () => {
  it('defaults to 1.6 g/kg', () => {
    expect(proteinTarget({ weightKg: 60, heightCm: 165, trained: false, losingFat: true })).toEqual({ grams: 96, perKg: 1.6, referToDoctor: false })
  })
  it('goes to 2.2 g/kg only for trained lifters losing fat', () => {
    expect(proteinTarget({ weightKg: 80, heightCm: 180, trained: true, losingFat: true }).perKg).toBe(2.2)
    expect(proteinTarget({ weightKg: 80, heightCm: 180, trained: true, losingFat: false }).perKg).toBe(1.6)
  })
  it('doses on BMI-25 weight when BMI is 27.5 or more', () => {
    // 100 kg at 170 cm: BMI 34.6 -> dose weight 25 * 1.7^2 = 72.25 kg.
    expect(proteinTarget({ weightKg: 100, heightCm: 170, trained: false, losingFat: true }).grams).toBe(116)
  })
  it('caps protein and refers to a doctor for kidney disease', () => {
    const p = proteinTarget({ weightKg: 70, heightCm: 170, trained: true, losingFat: true, kidneyDisease: true })
    expect(p.perKg).toBe(0.8)
    expect(p.referToDoctor).toBe(true)
  })
})

describe('macroTargets', () => {
  it('fills carbs after protein and fat', () => {
    const m = macroTargets(2000, 110, 65)
    expect(m.fatG).toBe(56)
    expect(m.proteinG * 4 + m.fatG * 9 + m.carbG * 4).toBeGreaterThan(1990)
    expect(m.proteinG * 4 + m.fatG * 9 + m.carbG * 4).toBeLessThan(2010)
  })
  it('never sets fat below 0.6 g/kg', () => {
    expect(macroTargets(1200, 100, 90, 'lowerFat').fatG).toBe(54)
  })
})
