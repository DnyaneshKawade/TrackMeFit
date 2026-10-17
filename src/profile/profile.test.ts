import { describe, expect, it } from 'vitest'
import { catalogue } from '../food/catalogueData'
import { amountFor } from '../food/types'
import { ALL_DIET_ITEMS, PORTION_GRAMS, checkCustom, describeDiet, estimateDiet, extraFromFood } from './currentDiet'
import { bmiResult, buildPlan, checkEventDate, checkTargetWeight, eventNote, goalTimeline, maxLossRate, nextStep, noLossReason, paceOptions, recommendedPace, waistNote, type PaceBody } from './goal'
import { steadySwitch } from './steady'
import { fromRow, memoryProfileStore, toRow } from './stores'
import { EMPTY_PROFILE, ageOn, bodySize, checkAboutYou, healthNotes, isOnboarded, questionsFor, type ProfileInfo } from './types'
import type { DietTarget } from '../targets/types'

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
    // Without a known weight, "Faster" isn't offered (T-071).
    expect(paceOptions('lose', 'beginner', {}).map((p) => p.rate)).toEqual([-0.005, -0.0025])
    expect(paceOptions('lose', 'beginner', { eatingDisorder: true }).map((p) => p.rate)).toEqual([-0.0025])
    expect(paceOptions('lose', 'beginner', { pregnant: true })).toEqual([])
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
    const t = goalTimeline(70, 68, -0.005, TODAY)!
    expect(t.weeks).toBe(6) // 0.35 kg a week for 2 kg
    expect(t.byDate).toBe('2026-11-24')
    expect(t.message).toBe('At about 0.35 kg a week, you’d reach 68 kg by November 2026. That is around 6 weeks.')
    expect(goalTimeline(70, 70, -0.005, TODAY)).toBeNull()
  })
})

describe('current diet', () => {
  it('matches the foods in our database portion for portion', () => {
    for (const item of ALL_DIET_ITEMS) {
      const food = catalogue.find((f) => f.id === item.id)
      expect(food, item.id).toBeTruthy()
      const grams = PORTION_GRAMS[item.id] ?? food!.portions[0].grams
      const a = amountFor(food!, grams)
      expect([a.kcal, a.proteinG, grams], item.id).toEqual([item.kcal, item.proteinG, item.grams])
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
    // Week 1 is at the burn; the goal level is below it (T-067a).
    expect(plan.suggested!.kcal).toBe(plan.steps!.steps[0])
    expect(plan.steps!.goalKcal).toBeLessThan(plan.maintenance.low)
    expect(plan.suggested!.proteinG).toBe(102) // 1.6 g per kg for a beginner
    expect(plan.reasons[0]).toMatch(/^Week 1 is .* kcal a day\. That is about what you burn\.$/)
    expect(plan.timeline!.message).toMatch(/60 kg/)
    expect(plan.intakeNote).toMatch(/usual day/)
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

describe('gain paces (T-059)', () => {
  // 170 cm: BMI 18.5 at 53.5 kg, 23 at 66.5 kg, 25 at 72.3 kg.
  const body = (weightKg: number, ageYears = 25): PaceBody => ({ weightKg, heightCm: 170, ageYears })
  const gain = (exp: 'beginner' | 'intermediate' | 'advanced', b?: PaceBody, medical: Record<string, boolean> = {}) =>
    paceOptions('gain', exp, medical, b)
  const labels = (ps: ReturnType<typeof gain>) => ps.map((p) => p.label)
  const rec = (ps: ReturnType<typeof gain>) => recommendedPace(ps)?.label

  it('1. a healthy-weight beginner gets Lean, Steady and Faster, with Steady recommended', () => {
    const ps = gain('beginner', body(60))
    expect(labels(ps)).toEqual(['Lean', 'Steady', 'Faster'])
    expect(ps.map((p) => p.rate)).toEqual([0.0025, 0.005, 0.0075])
    expect(rec(ps)).toBe('Steady')
  })

  it('2. intermediate lifters are steered to Lean; advanced lifters get a slower ladder', () => {
    expect(rec(gain('intermediate', body(60)))).toBe('Lean')
    const adv = gain('advanced', body(60))
    expect(adv.map((p) => p.rate)).toEqual([0.00125, 0.0025, 0.005])
    expect(rec(adv)).toBe('Lean')
  })

  it('3, 4. an underweight adult also gets Catch up, never above 0.5 kg a week, and Faster is recommended', () => {
    const ps = gain('beginner', body(50))
    expect(labels(ps)).toEqual(['Lean', 'Steady', 'Faster', 'Catch up'])
    expect(rec(ps)).toBe('Faster')
    const catchUp = ps[3]
    expect(catchUp.rate * 50).toBeLessThanOrEqual(0.5)
    expect(catchUp.rate).toBeCloseTo(0.01)
    expect(catchUp.note).toMatch(/Switch to Steady once you reach 54 kg/)
    // A heavier underweight person: capped at 0.5 kg a week, below 1 %.
    const tall = paceOptions('gain', 'beginner', {}, { weightKg: 62, heightCm: 185, ageYears: 25 })
    expect(tall[3].rate * 62).toBeCloseTo(0.5)
  })

  it('5. overweight gets Lean and Steady; obese only Lean with a hint', () => {
    const over = gain('beginner', body(68))
    expect(labels(over)).toEqual(['Lean', 'Steady'])
    expect(rec(over)).toBe('Lean')
    const obese = gain('beginner', body(80))
    expect(labels(obese)).toEqual(['Lean'])
    expect(obese[0].note).toMatch(/Lose fat and build muscle/)
  })

  it('6. health conditions keep it to Lean, with a care-team note for an eating disorder', () => {
    for (const m of ['eatingDisorder', 'diabetes', 'kidney']) expect(labels(gain('beginner', body(50), { [m]: true }))).toEqual(['Lean'])
    expect(gain('beginner', body(50), { eatingDisorder: true })[0].note).toMatch(/doctors are helping you/)
    expect(gain('beginner', body(50), { diabetes: true })[0].note).not.toMatch(/care team/)
  })

  it('7. no gain pace during pregnancy, and no calorie targets', () => {
    expect(gain('beginner', body(50), { pregnant: true })).toEqual([])
    const plan = buildPlan({ ...asha, goal: 'gain', goalRate: 0.005, medical: { pregnant: true } }, 50, TODAY)
    expect(plan.suggested).toBeNull()
  })

  it('8. under 18: no Faster or Catch up', () => {
    const ps = gain('beginner', body(50, 17))
    expect(labels(ps)).toEqual(['Lean', 'Steady'])
    expect(rec(ps)).toBe('Steady')
  })

  it('9. each note gives the kg a week and the extra calories a day', () => {
    const steady = gain('beginner', body(60))[1]
    expect(steady.note).toBe('0.5 % of your weight a week. That is about 0.3 kg a week. You eat 330 extra kcal a day. A good mix of muscle and size for most people.')
  })

  it('10. a long goal starts with a first milestone and is said in months', () => {
    const t = goalTimeline(50, 60, 0.005, TODAY)!
    expect(t.weeks).toBe(40)
    expect(t.message).toBe('First 2 kg by 8 December. At about 0.25 kg a week, you’d reach 60 kg by July 2027. That is about 9 months.')
    const faster = goalTimeline(50, 60, 0.0075, TODAY)!
    expect(faster.weeks).toBe(27)
  })

  it('12. gain is capped at 1 % a week, and the plan says how many extra calories it adds', () => {
    const plan = buildPlan({ ...asha, goal: 'gain', goalRate: 0.005, experience: 'beginner' }, 50, TODAY)
    expect(plan.reasons[0]).toBe('Calories are set to gain 0.5 % of your weight a week. You eat 280 kcal a day more than you burn.')
  })
})

describe('Catch up to Steady (T-059c)', () => {
  const onCatchUp: ProfileInfo = { ...EMPTY_PROFILE, goal: 'gain', experience: 'beginner', heightCm: 170, goalRate: 0.01 }
  const target = { kcal: 2600, proteinG: 120, carbG: 330, fatG: 70 }

  it('1. suggests Steady once the trend reaches a healthy weight, with the lower calories', () => {
    // 170 cm: healthy from 54 kg.
    const s = steadySwitch(onCatchUp, 54.5, target)!
    expect(s.rate).toBe(0.005)
    expect(s.healthyMinKg).toBe(54)
    expect(s.kcalLess).toBe(300)
    expect(s.target).toEqual({ kcal: 2300, proteinG: 120, fatG: 70, carbG: 298 })
    expect(s.message).toMatch(/average weight is 54.5 kg.*from 54 kg.*don’t need Catch up now.*about 300 kcal a day less: 2,600 to 2,300 kcal/)
  })

  it('2. says nothing while still underweight', () => {
    expect(steadySwitch(onCatchUp, 53.9, target)).toBeNull()
  })

  it('3. says nothing on other paces or goals, or without a trend', () => {
    expect(steadySwitch({ ...onCatchUp, goalRate: 0.0075 }, 60, target)).toBeNull()
    expect(steadySwitch({ ...onCatchUp, goalRate: 0.005 }, 60, target)).toBeNull()
    expect(steadySwitch({ ...onCatchUp, goal: 'lose', goalRate: -0.005 }, 60, target)).toBeNull()
    expect(steadySwitch(onCatchUp, null, target)).toBeNull()
  })

  it('4. without a calorie target, only the pace changes', () => {
    const s = steadySwitch(onCatchUp, 55, null)!
    expect(s.target).toBeNull()
    expect(s.message).toMatch(/about 310 kcal a day less\.$/)
  })
})

describe('event date for the goal (T-041b)', () => {
  const T = '2026-10-13'
  it('1. checks the date: empty is fine, past and far dates are not', () => {
    expect(checkEventDate('', T)).toBeNull()
    expect(checkEventDate('2026-12-01', T)).toBeNull()
    expect(checkEventDate('2026-10-13', T)).toBe('Pick a date after today.')
    expect(checkEventDate('2028-12-01', T)).toBe('Pick a date within 2 years.')
    expect(checkEventDate('soon', T)).toBe('Enter a date.')
  })

  it('2. a target reached in time says so', () => {
    expect(eventNote(64, 58, -0.005, T, '2027-03-01')).toBe('You’d reach 58 kg before your event on 1 March 2027.')
  })

  it('3. a target not reached in time gives the weight then and the pace it needs, without changing the pace', () => {
    expect(eventNote(64, 58, -0.005, T, '2027-01-26')).toBe(
      'On 26 January 2027, you’d be about 59.2 kg, not 58 kg. Reaching 58 kg by then needs about 0.4 kg a week. ' +
        'That is faster than your pace. Pick a closer target. Or keep your pace and get there later.',
    )
  })

  it('4. with no target, says the weight on the day; gaining goes up', () => {
    expect(eventNote(64, null, -0.005, T, '2026-12-08')).toBe('At this pace, you’d be about 61.4 kg on 8 December 2026.')
    expect(eventNote(60, null, 0.0025, T, '2026-12-08')).toBe('At this pace, you’d be about 61.2 kg on 8 December 2026.')
    expect(eventNote(64, null, 0, T, '2026-12-08')).toBeNull()
    expect(eventNote(64, null, -0.005, T, null)).toBeNull()
  })

  it('5. the plan summary carries the note, and the date is saved', () => {
    const plan = buildPlan({ ...asha, eventDate: '2027-03-01' }, 64, T)
    expect(plan.eventNote).toBe('You’d reach 60 kg before your event on 1 March 2027.')
    expect(buildPlan(asha, 64, T).eventNote).toBeNull()
    expect(toRow({ ...asha, eventDate: '2027-03-01' }).event_date).toBe('2027-03-01')
    expect(fromRow({ ...toRow(asha), event_date: '2027-03-01' }).eventDate).toBe('2027-03-01')
  })
})

describe('safe paces (T-071)', () => {
  const body = (weightKg: number): PaceBody => ({ weightKg, heightCm: 160, ageYears: 31 })

  it('1. offers no weight loss when underweight, and no targets at all below BMI 17', () => {
    expect(paceOptions('lose', 'beginner', {}, body(44))).toEqual([])
    expect(noLossReason(body(44))).toMatch(/already underweight/)
    expect(noLossReason(body(40))).toMatch(/see a doctor/)
    expect(noLossReason(body(50))).toBeNull()
    const none = buildPlan({ ...asha, goal: 'gain', goalRate: 0.0025 }, 40, TODAY)
    expect(none.suggested).toBeNull()
    expect(none.reasons[0]).toMatch(/see a doctor first/)
    const kept = buildPlan(asha, 44, TODAY)
    expect(kept.reasons[0]).toMatch(/underweight, so we don’t suggest eating less/)
    expect(kept.suggested!.kcal).toBeGreaterThan(buildPlan(asha, 50, TODAY).suggested!.kcal - 300)
  })

  it('2. offers “Faster” loss only from BMI 25', () => {
    expect(paceOptions('lose', 'beginner', {}, body(64)).map((p) => p.label)).toEqual(['Steady', 'Gentle', 'Faster'])
    expect(paceOptions('lose', 'beginner', {}, body(58)).map((p) => p.label)).toEqual(['Steady', 'Gentle'])
  })

  it('3. keeps a saved pace within the safe weekly limit for the body', () => {
    expect([maxLossRate(26), maxLossRate(24), maxLossRate(21)]).toEqual([0.01, 0.0075, 0.005])
    const plan = buildPlan({ ...asha, goalRate: -0.0075 }, 52, TODAY)
    // Faster is cut back to Steady: 52 kg × 5.5 kcal less than the burn.
    const burn = plan.steps!.steps[0]
    expect(plan.steps!.goalKcal).toBe(Math.round((burn - 52 * 5.5) / 10) * 10)
    expect(plan.reasons).toContain('At your goal level, you’d lose about 0.25 kg a week.')
  })
})


describe('next calorie step (T-067a)', () => {
  const target = (over: Partial<DietTarget> = {}): DietTarget => ({
    id: 't1', startsOn: '2026-10-06', kcal: 1820, proteinG: 102, carbG: 196, fatG: 51, source: 'suggested', setBy: 'me', ...over,
  })

  it('6. offers the next step after 7 days on suggested targets, but never for hand-set or coach targets', () => {
    const step = nextStep(asha, 64, target(), TODAY, 'me')!
    expect(step.values.kcal).toBe(1570)
    expect(step.values.proteinG).toBe(102)
    expect(step.message).toBe('Ready for your next step? Eat about 1,570 kcal a day from today.')
    expect(nextStep(asha, 64, target({ startsOn: '2026-10-08' }), TODAY, 'me')).toBeNull()
    expect(nextStep(asha, 64, target({ source: 'manual' }), TODAY, 'me')).toBeNull()
    expect(nextStep(asha, 64, target({ setBy: 'coach' }), TODAY, 'me')).toBeNull()
    expect(nextStep({ ...asha, goal: 'maintain', goalRate: 0 }, 64, target(), TODAY, 'me')).toBeNull()
  })

  it('7. the last step says it is the goal level, and then steps stop', () => {
    expect(nextStep(asha, 64, target({ kcal: 1570 }), TODAY, 'me')!.message).toBe(
      'Ready for your next step? Eat about 1,470 kcal a day from today. This is your goal level.',
    )
    expect(nextStep(asha, 64, target({ kcal: 1470 }), TODAY, 'me')).toBeNull()
  })
})
