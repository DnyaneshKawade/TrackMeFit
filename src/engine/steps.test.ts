import { describe, expect, it } from 'vitest'
import { calorieSteps, nextStepKcal, plannedCut, weeklyCheck } from './steps'

const man85 = { burn: 2430, weightKg: 85, sex: 'male' as const }

describe('calorie steps (T-067a)', () => {
  it('1. week 1 is at the burn, then each week is 250 calories less until the goal level', () => {
    const faster = calorieSteps({ ...man85, rate: -0.0075 })
    expect(faster.steps).toEqual([2430, 2180, 1930, 1820])
    expect(faster.reasons).toEqual([
      'Week 1 is 2,430 calories a day. That is about what you burn.',
      'Then it goes down 250 calories each week, to 1,820 calories.',
      'Small steps are easier to follow. You tap OK before each new step.',
      'We kept the cut small enough to be safe.',
    ])
    expect(calorieSteps({ ...man85, rate: -0.005 }).steps).toEqual([2430, 2180, 1960])
    expect(calorieSteps({ ...man85, rate: -0.0025 }).steps).toEqual([2430, 2200])
  })

  it('2. the cut is weight × 2.75, 5.5 or 8.25 calories, at most 25 % of the burn and 750 calories, and not below the floor', () => {
    expect([plannedCut(-0.0025, 85), plannedCut(-0.005, 85), plannedCut(-0.0075, 85)]).toEqual([233.75, 467.5, 701.25])
    // 25 % of the burn: 607 calories, not 701.
    const capped = calorieSteps({ ...man85, rate: -0.0075 })
    expect([capped.goalKcal, capped.capped]).toEqual([1820, true])
    // 750 calories at most: 150 kg × 8.25 = 1,238, and 25 % = 900.
    expect(calorieSteps({ burn: 3600, weightKg: 150, sex: 'male', rate: -0.0075 }).goalKcal).toBe(2850)
    // Floors: 1,200 calories for women and 1,500 for men without a coach.
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
    expect(low.reasons[0]).toBe('Your usual day is already low. So you start at your goal of 1,960 calories.')
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

describe('weekly check (T-067d)', () => {
  const TODAY = '2026-10-29'
  const day = (back: number) => new Date(Date.parse(TODAY + 'T00:00:00Z') - back * 86_400_000).toISOString().slice(0, 10)
  // Daily weigh-ins over 28 days, changing by `perWeek` kg a week.
  const weighIns = (perWeek: number, days = 28) => Array.from({ length: days + 1 }, (_, k) => ({ date: day(days - k), kg: 85 + (perWeek * k) / 7 }))
  const logs = (kcal: number, days: number) => new Map(Array.from({ length: days }, (_, k) => [day(k), kcal] as [string, number]))
  const base = { ...man85, rate: -0.005, currentKcal: 2180, goalKcal: 1960, daysOnStep: 7, today: TODAY, weighIns: [], dayKcal: new Map<string, number>() }

  it('1. no check is due before 7 days on a step', () => {
    expect(weeklyCheck({ ...base, daysOnStep: 6 })).toBeNull()
  })

  it('2. without weigh-ins it steps down 250 calories, to the goal level at most', () => {
    expect(weeklyCheck(base)).toMatchObject({ kind: 'step', kcal: 1960, learnedBurn: null, reason: 'Ready for your next step? Eat about 1,960 calories a day from today. This is your goal level.' })
    expect(weeklyCheck({ ...base, currentKcal: 2430 })).toMatchObject({ kind: 'step', kcal: 2180 })
    expect(weeklyCheck({ ...base, currentKcal: 1960 })).toBeNull()
  })

  it('3. holds when weight already falls at the chosen pace or faster', () => {
    const fast = weeklyCheck({ ...base, weighIns: weighIns(-0.6) })!
    expect(fast.kind).toBe('hold')
    expect(fast.kcal).toBe(2180)
    expect(fast.reason).toMatch(/^You are losing about 0\.\d kg a week\. That is your pace, so stay at 2,180 calories for now\.$/)
    expect(weeklyCheck({ ...base, weighIns: weighIns(-0.1) })!.kind).toBe('step')
    // Old weigh-ins only: no pace, so it steps as planned.
    expect(weeklyCheck({ ...base, weighIns: weighIns(-0.6).slice(0, 10) })!.kind).toBe('step')
  })

  it('4. after 21 days of weight and 14 days of food, it learns the real burn and moves the goal', () => {
    // Ate 2,200 a day and weight stayed the same: the real burn is lower than 2,430.
    const c = weeklyCheck({ ...base, weighIns: weighIns(0), dayKcal: logs(2200, 21) })!
    expect(c.learnedBurn).toBe(2320) // halfway from 2,430 to 2,200, to 10 calories
    expect(c.goalKcal).toBeLessThan(1960)
    expect(c.kind).toBe('step')
    expect(c.reason).toMatch(/^Your weight and food logs show you burn about 2,320 calories\. Ready for your next step\?/)
    // A big gap moves the burn 500 calories at most, and floors still hold.
    const big = weeklyCheck({ ...base, weighIns: weighIns(0), dayKcal: logs(900, 21) })!
    expect(big.learnedBurn).toBe(1930)
    expect(big.goalKcal).toBeGreaterThanOrEqual(1500)
  })

  it('5. fewer than 14 days of food logged: the goal level stays as planned', () => {
    const c = weeklyCheck({ ...base, weighIns: weighIns(0), dayKcal: logs(2200, 13) })!
    expect(c.learnedBurn).toBeNull()
    expect(c.goalKcal).toBe(1960)
  })
})
