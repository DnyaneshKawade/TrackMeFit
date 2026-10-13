import { describe, expect, it } from 'vitest'
import { catalogue } from '../food/catalogueData'
import { amountFor } from '../food/types'
import { DIET_ITEMS, PORTION_GRAMS, checkCustom, describeDiet, estimateDiet, extraFromFood } from './currentDiet'
import { bmiResult, buildPlan, checkTargetWeight, goalTimeline, paceOptions, waistNote } from './goal'
import { fromRow, memoryProfileStore, toRow } from './stores'
import { EMPTY_PROFILE, ageOn, bodySize, checkAboutYou, healthNotes, isOnboarded, questionsFor, type ProfileInfo } from './types'

const TODAY = '2026-10-13'
const asha: ProfileInfo = {
  ...EMPTY_PROFILE,
  fullName: 'Asha',
  sex: 'female',
  birthDate: '1995-06-15',
  heightCm: 160,
  activity: 'desk',
  trainingDays: 3,
  experience: 'beginner',
  equipment: 'gym',
  goal: 'lose',
  goalRate: -0.005,
  targetWeightKg: 60,
  dietPref: 'veg',
  medical: { diabetes: false },
}
const about = { fullName: 'Asha', sex: 'female' as const, birthDate: '1995-06-15', heightCm: '160.5', weightKg: '64.2', waistCm: '' }

describe('profile basics', () => {
  it('counts onboarding as done once finished or skipped', () => {
    expect(isOnboarded(EMPTY_PROFILE)).toBe(false)
    expect(isOnboarded({ ...EMPTY_PROFILE, onboardedAt: '2026-10-13T03:00:00Z' })).toBe(true)
  })

  it('counts age in whole years, birthday or not', () => {
    expect(ageOn('1995-06-15', '2026-06-14')).toBe(30)
    expect(ageOn('1995-06-15', '2026-06-15')).toBe(31)
    expect(ageOn('1995-12-31', '2026-01-01')).toBe(30)
  })

  it('explains each problem on the first step; waist is optional', () => {
    const errors = checkAboutYou({ fullName: ' ', sex: null, birthDate: '2016-01-01', heightCm: '17', weightKg: '', waistCm: '9' }, TODAY)
    expect(errors.fullName).toMatch(/call you/)
    expect(errors.sex).toMatch(/calorie/)
    expect(errors.birthDate).toMatch(/13 and older/)
    expect(errors.heightCm).toMatch(/90 and 250/)
    expect(errors.weightKg).toMatch(/20 and 350/)
    expect(errors.waistCm).toMatch(/leave it empty/)
    expect(checkAboutYou(about, TODAY)).toEqual({})
    expect(bodySize(about)).toEqual({ heightCm: 160.5, weightKg: 64.2 })
    expect(bodySize({ ...about, weightKg: '6' })).toBeNull()
  })

  it('asks pregnancy and PCOS questions only of women', () => {
    expect(questionsFor('female').map((q) => q.key)).toEqual(expect.arrayContaining(['pregnant', 'pcos']))
    expect(questionsFor('male').map((q) => q.key)).not.toContain('pregnant')
    expect(questionsFor('male').map((q) => q.key)).not.toContain('pcos')
  })

  it('gives a doctor note for every ticked condition that applies', () => {
    expect(healthNotes({ diabetes: false }, 'male')).toEqual([])
    const notes = healthNotes({ diabetes: true, kidney: true, pregnant: true }, 'male')
    expect(notes).toHaveLength(2)
    expect(notes[1]).toMatch(/0\.8 g per kg/)
  })

  it('maps database rows both ways', () => {
    const row = toRow({ ...asha, fullName: ' Asha ', otherHealth: ' asthma ' })
    expect(row).toMatchObject({ full_name: 'Asha', goal_rate: -0.005, target_weight_kg: 60, equipment: 'gym', other_health: 'asthma' })
    expect(
      fromRow({ ...row, height_cm: '160.0', goal_rate: '-0.005', medical: null, allergies: null, fasting: null, food_rules: null, other_health: null }),
    ).toEqual({ ...asha, medical: {} })
  })

  it('keeps the saved profile in the memory store', async () => {
    const store = memoryProfileStore({ fullName: 'Asha' })
    expect((await store.get()).fullName).toBe('Asha')
    await store.save(asha)
    expect(await store.get()).toEqual(asha)
  })
})

describe('BMI and goal', () => {
  it('uses Indian cut-offs and shows the healthy range for the height', () => {
    const r = bmiResult(64, 160)
    expect(r).toMatchObject({ value: 25, band: 'obese', healthyMinKg: 48, healthyMaxKg: 58 })
    expect(r.message).toMatch(/^BMI 25: in the obese range for Indian adults\. At your height that’s 48 to 58 kg\./)
    expect(bmiResult(55, 160).band).toBe('normal')
    expect(bmiResult(60, 160).band).toBe('overweight')
  })

  it('flags waist size at the Indian limits', () => {
    expect(waistNote(92, 'male')).toMatch(/90 cm or more/)
    expect(waistNote(85, 'male')).toMatch(/under 90/)
    expect(waistNote(82, 'female')).toMatch(/80 cm or more/)
  })

  it('recommends a steady loss, offers gentle only when health calls for it, and none in pregnancy', () => {
    expect(paceOptions('lose', 'beginner', {}).map((p) => p.rate)).toEqual([-0.005, -0.0025, -0.0075])
    expect(paceOptions('lose', 'beginner', { eatingDisorder: true }).map((p) => p.rate)).toEqual([-0.0025])
    expect(paceOptions('lose', 'beginner', { pregnant: true })).toEqual([])
    expect(paceOptions('gain', 'advanced', {}).map((p) => p.rate)).toEqual([0.00125, 0.005])
    expect(paceOptions('gain', 'beginner', {}).map((p) => p.rate)).toEqual([0.005])
    expect(paceOptions('maintain', 'beginner', {})).toEqual([])
  })

  it('checks the target weight against the goal', () => {
    expect(checkTargetWeight('', 70, 'lose')).toBeNull()
    expect(checkTargetWeight('72', 70, 'lose')).toMatch(/below/)
    expect(checkTargetWeight('68', 70, 'gain')).toMatch(/above/)
    expect(checkTargetWeight('400', 70, 'gain')).toMatch(/20 and 350/)
    expect(checkTargetWeight('65', 70, 'lose')).toBeNull()
  })

  it('works out a goal date from the pace', () => {
    const t = goalTimeline(70, 65, -0.005, TODAY)!
    expect(t.weeks).toBe(15) // 0.35 kg a week for 5 kg
    expect(t.byDate).toBe('2027-01-26')
    expect(t.message).toMatch(/0\.35 kg a week .* 65 kg in around 15 weeks, by January 2027/)
    expect(goalTimeline(70, 70, -0.005, TODAY)).toBeNull()
  })
})

describe('current diet', () => {
  it('matches the foods in our database portion for portion', () => {
    for (const item of DIET_ITEMS) {
      const food = catalogue.find((f) => f.id === item.id)
      expect(food, item.id).toBeTruthy()
      const a = amountFor(food!, PORTION_GRAMS[item.id] ?? food!.portions[0].grams)
      expect([a.kcal, a.proteinG], item.id).toEqual([item.kcal, item.proteinG])
    }
  })

  it('adds up a typical day and judges protein per kg', () => {
    const d = estimateDiet({ 'tmf:dish:roti': 4, 'tmf:dish:dal-tadka': 2, 'tmf:dish:steamed-rice': 1, 'tmf:dish:chai': 2, 'tmf:dish:roti-x': 9, 'tmf:dish:boiled-egg': -1 })
    expect(d.counts).toEqual({ 'tmf:dish:roti': 4, 'tmf:dish:steamed-rice': 1, 'tmf:dish:dal-tadka': 2, 'tmf:dish:chai': 2 })
    expect(d.kcal).toBe(950) // 408 + 183 + 222 + 132 = 945, to the nearest 10
    expect(d.proteinG).toBe(35)
    expect(describeDiet(d, 64)).toMatch(/about 950 kcal and 35 g protein a day\. Protein is low at 0\.5 g per kg/)
    expect(describeDiet(estimateDiet({}), 64)).toMatch(/Add what you eat/)
  })
})

describe('foods beyond the list', () => {
  it('turns any database food into a row of one usual portion', () => {
    const poha = catalogue.find((f) => f.id === 'tmf:dish:idli')!
    const e = extraFromFood(poha)
    const a = amountFor(poha, poha.portions[0].grams)
    expect(e).toEqual({ id: 'tmf:dish:idli', name: poha.name, portion: poha.portions[0].label, kcal: a.kcal, proteinG: a.proteinG, count: 1 })
    const noPortion = { ...poha, portions: [] }
    expect(extraFromFood(noPortion)).toMatchObject({ portion: '100 g', kcal: poha.per100g.kcal })
  })

  it('checks a typed-in food', () => {
    expect(checkCustom('', '200', '')).toMatch(/what the food is/)
    expect(checkCustom('Protein bar', '0', '')).toMatch(/between 1 and 5000/)
    expect(checkCustom('Protein bar', '200', '60')).toMatch(/more calories/)
    expect(checkCustom('Protein bar', '200', '20')).toBeNull()
    expect(checkCustom('Protein bar', '200', '')).toBeNull()
  })

  it('adds extras to the estimate and drops ones set to zero', () => {
    const bar = { id: 'custom:1:Protein bar', name: 'Protein bar', portion: 'your amount', kcal: 200, proteinG: 20, count: 1 }
    const gone = { ...bar, id: 'custom:2:x', count: 0 }
    const d = estimateDiet({ 'tmf:dish:roti': 2 }, [bar, gone])
    expect(d.extras).toEqual([bar])
    expect(d.kcal).toBe(400) // 204 + 200
    expect(d.proteinG).toBe(28)
    expect(estimateDiet({ 'tmf:dish:roti': 2 })).not.toHaveProperty('extras')
  })
})

describe('plan', () => {
  it('suggests targets for the goal with the reasons, and a goal date', () => {
    const plan = buildPlan({ ...asha, currentDiet: estimateDiet({ 'tmf:dish:roti': 6, 'tmf:dish:steamed-rice': 2, 'tmf:dish:samosa': 2 }) }, 64, TODAY)
    expect(plan.maintenance.low).toBeLessThan(plan.maintenance.high)
    expect(plan.maintenance.message).toMatch(/2 to 3 weeks of logging/)
    expect(plan.suggested!.kcal).toBeLessThan(plan.maintenance.low)
    expect(plan.suggested!.proteinG).toBe(102) // 1.6 g per kg for a beginner
    expect(plan.reasons[0]).toMatch(/lose 0\.5 % of your weight a week/)
    expect(plan.timeline!.message).toMatch(/60 kg/)
    expect(plan.intakeNote).toMatch(/typical day/)
  })

  it('caps protein for kidney disease and holds weight for maintenance', () => {
    const plan = buildPlan({ ...asha, goal: 'maintain', goalRate: 0, medical: { kidney: true } }, 64, TODAY)
    expect(plan.suggested!.proteinG).toBe(51)
    expect(plan.reasons.join(' ')).toMatch(/keep your weight .* kidney disease/)
  })

  it('suggests no targets for weight loss in pregnancy', () => {
    const plan = buildPlan({ ...asha, medical: { pregnant: true } }, 64, TODAY)
    expect(plan.suggested).toBeNull()
    expect(plan.reasons[0]).toMatch(/pregnancy/)
  })
})
