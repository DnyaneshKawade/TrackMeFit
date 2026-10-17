import { describe, expect, it } from 'vitest'
import { calorieSteps, nextStepKcal, plannedCut } from './steps'

const man85 = { burn: 2430, weightKg: 85, sex: 'male' as const }

describe('calorie steps (T-067a)', () => {
  it('1. week 1 is at the burn, then each week is 250 kcal less until the goal level', () => {
    const faster = calorieSteps({ ...man85, rate: -0.0075 })
    expect(faster.steps).toEqual([2430, 2180, 1930, 1820])
    expect(faster.reasons).toEqual([
      'Week 1 is 2,430 kcal a day. That is about what you burn.',
      'Then it goes down 250 kcal each week, to 1,820 kcal.',
      'Small steps are easier to follow. You tap OK before each new step.',
      'We kept the cut small enough to be safe.',
    ])
    expect(calorieSteps({ ...man85, rate: -0.005 }).steps).toEqual([2430, 2180, 1960])
    expect(calorieSteps({ ...man85, rate: -0.0025 }).steps).toEqual([2430, 2200])
  })

  it('2. the cut is weight × 2.75, 5.5 or 8.25 kcal, at most 25 % of the burn and 750 kcal, and not below the floor', () => {
    expect([plannedCut(-0.0025, 85), plannedCut(-0.005, 85), plannedCut(-0.0075, 85)]).toEqual([233.75, 467.5, 701.25])
    // 25 % of the burn: 607 kcal, not 701.
    const capped = calorieSteps({ ...man85, rate: -0.0075 })
    expect([capped.goalKcal, capped.capped]).toEqual([1820, true])
    // 750 kcal at most: 150 kg × 8.25 = 1,238, and 25 % = 900.
    expect(calorieSteps({ burn: 3600, weightKg: 150, sex: 'male', rate: -0.0075 }).goalKcal).toBe(2850)
    // Floors: 1,200 kcal for women and 1,500 for men without a coach.
    const woman = calorieSteps({ burn: 1500, weightKg: 60, sex: 'female', rate: -0.005 })
    expect([woman.goalKcal, woman.atFloor]).toEqual([1200, true])
    expect(woman.reasons).toContain('Calories don’t go below a safe level without a coach.')
    expect(calorieSteps({ burn: 1600, weightKg: 70, sex: 'male', rate: -0.005 }).goalKcal).toBe(1500)
    // Never above the burn, even when the burn is under the floor.
    expect(calorieSteps({ burn: 1150, weightKg: 45, sex: 'female', rate: -0.005 }).steps).toEqual([1150])
    // A coach can set a bigger cut.
    expect(calorieSteps({ ...man85, rate: -0.0075, hasCoach: true }).goalKcal).toBe(1730)
  })

  it('3. when the usual day is at or below the goal level, it starts at the goal level', () => {
    const low = calorieSteps({ ...man85, rate: -0.005, usualKcal: 1800 })
    expect(low.steps).toEqual([1960])
    expect(low.reasons[0]).toBe('Your usual day is already low. So you start at your goal of 1,960 kcal.')
    // A higher usual day is only a cross-check: steps still start at the burn.
    expect(calorieSteps({ ...man85, rate: -0.005, usualKcal: 2100 }).steps[0]).toBe(2430)
  })

  it('4. no steps without a loss pace', () => {
    expect(calorieSteps({ ...man85, rate: 0 }).steps).toEqual([2430])
    expect(calorieSteps({ ...man85, rate: 0.005 }).steps).toEqual([2430])
  })

  it('6, 7. the next step comes after 7 days, and stops at the goal level', () => {
    expect(nextStepKcal(2430, 1820, 6)).toBeNull()
    expect(nextStepKcal(2430, 1820, 7)).toBe(2180)
    expect(nextStepKcal(1930, 1820, 9)).toBe(1820)
    expect(nextStepKcal(1820, 1820, 30)).toBeNull()
  })
})
