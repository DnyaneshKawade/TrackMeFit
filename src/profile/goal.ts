// BMI, goal pace and the end-of-onboarding plan. Pure; every result carries
// the sentence the screen shows, so the reason is always visible.

import {
  bmi,
  calorieFloor,
  calorieTarget,
  gainLadder,
  indianBmiBand,
  initialExpenditure,
  macroTargets,
  MAX_GAIN_KG_PER_WEEK,
  MAX_GAIN_RATE,
  proteinTarget,
  surplusKcal,
  type BmiBand,
  type DayType,
  type Macros,
} from '../engine/diet'
import { shiftDate } from '../log/types'
import { NORMAL_BMI } from './steady'
import { ageOn, gentleOnly, noDeficit, type Activity, type Experience, type GoalChoice, type ProfileInfo } from './types'

/** Indian adult cut-offs: normal is 18.5 to 22.9 (kept in ./steady). */
export { NORMAL_BMI }

const BAND_WORDS: Record<BmiBand, string> = {
  under: 'underweight',
  normal: 'in the healthy range',
  overweight: 'overweight',
  obese: 'in the obese range',
}

export interface BmiResult {
  value: number
  band: BmiBand
  /** Weights with a normal BMI at this height, in whole kg. */
  healthyMinKg: number
  healthyMaxKg: number
  message: string
}

export function bmiResult(weightKg: number, heightCm: number): BmiResult {
  const value = Math.round(bmi(weightKg, heightCm) * 10) / 10
  const band = indianBmiBand(value)
  const m2 = (heightCm / 100) ** 2
  const healthyMinKg = Math.ceil(NORMAL_BMI.min * m2)
  const healthyMaxKg = Math.floor(NORMAL_BMI.max * m2)
  const message =
    `BMI ${value}: ${BAND_WORDS[band]} for Indian adults. ` +
    `At your height that’s ${healthyMinKg} to ${healthyMaxKg} kg. ` +
    'BMI can’t tell muscle from fat. Use it only as a rough guide.'
  return { value, band, healthyMinKg, healthyMaxKg, message }
}

/** Waist sizes where health risk rises for Indian adults. */
export const WAIST_LIMIT_CM = { male: 90, female: 80 } as const

export function waistNote(waistCm: number, sex: 'male' | 'female'): string {
  const limit = WAIST_LIMIT_CM[sex]
  return waistCm >= limit
    ? `For Indian ${sex === 'male' ? 'men' : 'women'}, a waist of ${limit} cm or more is risky. Bringing it down matters more than the scale.`
    : `Your waist is under ${limit} cm. Health risk starts to rise above that.`
}

export interface Pace {
  rate: number
  label: string
  note: string
  /** The pace we suggest for this person. */
  recommended?: boolean
}

/** What we know about the person when choosing paces. */
export interface PaceBody {
  weightKg: number
  heightCm: number
  ageYears: number
}

const pctText = (r: number) => `${Number(Math.abs(r * 100).toFixed(3))} %`

/** Below this BMI we suggest no calorie targets at all: eating less, or
 * suddenly more, needs a doctor (NICE CG32; WHO thinness grades). */
export const DOCTOR_FIRST_BMI = 17
/** "Faster" loss is only offered from this BMI: bigger cuts suit more body
 * fat (ISSN 2017; Indian obese cut-off). */
export const FASTER_LOSS_BMI = 25

/** The most weight a person should lose a week, as a share of their weight:
 * leaner people lose more muscle when going fast (Helms 2014; Garthe 2011). */
export function maxLossRate(bmiValue: number): number {
  if (bmiValue >= 25) return 0.01
  if (bmiValue >= 23) return 0.0075
  return 0.005
}

/** BMI to one decimal, as the screen shows it, so the rules match what people read. */
const shownBmi = (weightKg: number, heightCm: number) => Math.round(bmi(weightKg, heightCm) * 10) / 10

/** Why losing weight isn't offered for this body, or null when it is (T-071). */
export function noLossReason(body: PaceBody | undefined): string | null {
  if (!body) return null
  const value = shownBmi(body.weightKg, body.heightCm)
  if (value < DOCTOR_FIRST_BMI) return 'Your weight is very low for your height. Please see a doctor before you change what you eat.'
  if (value < 18.5) return 'You are already underweight, so losing weight isn’t safe. Try “Build muscle and gain weight” or “Stay as I am”.'
  return null
}

/** Pace choices for a goal, with the recommended one marked. */
export function paceOptions(goal: GoalChoice, experience: Experience, medical: Record<string, boolean>, body?: PaceBody): Pace[] {
  const pct = (r: number) => `${pctText(r)} of your weight a week`
  if (goal === 'lose') {
    if (noDeficit(medical) || noLossReason(body)) return []
    const gentle = { rate: -0.0025, label: 'Gentle', note: `${pct(-0.0025)}. The easiest to follow.` }
    if (gentleOnly(medical)) return [{ ...gentle, recommended: true }]
    const options: Pace[] = [
      { rate: -0.005, label: 'Steady', note: `${pct(-0.005)}. Keeps muscle and is easy to follow.`, recommended: true },
      gentle,
    ]
    // Without a known weight, the safer choices only.
    if (body && shownBmi(body.weightKg, body.heightCm) >= FASTER_LOSS_BMI)
      options.push({ rate: -0.0075, label: 'Faster', note: `${pct(-0.0075)}. Harder; hunger and tiredness are more likely.` })
    return options
  }
  if (goal === 'gain') return gainPaces(experience, medical, body)
  return []
}

/** Build-muscle paces (spec T-059). Faster gain mostly adds fat, not more
 * muscle (Garthe 2013, Helms 2023), so the notes say so plainly. */
function gainPaces(experience: Experience, medical: Record<string, boolean>, body?: PaceBody): Pace[] {
  if (noDeficit(medical)) return []
  const [lean, steady, faster] = gainLadder(experience)
  const band = body ? indianBmiBand(bmi(body.weightKg, body.heightCm)) : 'normal'
  const adult = !body || body.ageYears >= 18
  const pct = (r: number) => `${pctText(r)} of your weight a week`
  const amounts = (rate: number) => {
    if (!body) return `${pct(rate)}.`
    const kg = Math.round(rate * body.weightKg * 100) / 100
    return `${pctText(rate)} of your weight a week. That is about ${kg} kg a week. You eat ${surplusKcal(rate, body.weightKg)} extra kcal a day.`
  }
  const pace = (rate: number, label: string, text: string): Pace => ({ rate, label, note: `${amounts(rate)} ${text}` })
  const leanPace = pace(lean, 'Lean', 'Slow and clean: most of what you gain is muscle.')

  if (gentleOnly(medical)) {
    const care = medical.eatingDisorder ? ' If doctors are helping you gain back weight, follow their plan.' : ''
    return [{ ...leanPace, note: `${leanPace.note} Because of your health answers, we keep the pace gentle.${care}`, recommended: true }]
  }
  if (band === 'obese') {
    return [{ ...leanPace, note: `${leanPace.note} “Lose fat and build muscle” may suit your weight better.`, recommended: true }]
  }
  const options: Pace[] = [leanPace, pace(steady, 'Steady', 'A good mix of muscle and size for most people.')]
  if (band !== 'overweight' && adult) options.push(pace(faster, 'Faster', 'The scale moves sooner; more of the gain will be fat.'))
  if (band === 'under' && adult && body) {
    const catchUp = Math.min(MAX_GAIN_RATE, MAX_GAIN_KG_PER_WEEK / body.weightKg)
    const healthyMin = bmiResult(body.weightKg, body.heightCm).healthyMinKg
    if (catchUp > faster + 1e-9) {
      const kg = Math.round(catchUp * body.weightKg * 100) / 100
      options.push({
        rate: catchUp,
        label: 'Catch up',
        note: `About ${kg} kg a week and ${surplusKcal(catchUp, body.weightKg)} extra kcal a day. Reach a healthy weight sooner. More of the gain is fat. That is fine while you are underweight. Switch to Steady once you reach ${healthyMin} kg.`,
      })
    }
  }
  const pick = band === 'under' ? (adult ? faster : steady) : band === 'normal' && experience === 'beginner' ? steady : lean
  return options.map((o) => (o.rate === pick ? { ...o, recommended: true } : o))
}

/** The pace to select: the recommended one, or the first. */
export const recommendedPace = (paces: Pace[]) => paces.find((x) => x.recommended) ?? paces[0]

/** Checks an optional target weight against the goal. Null when fine. */
export function checkTargetWeight(text: string, currentKg: number, goal: GoalChoice | null): string | null {
  if (!text.trim()) return null
  const t = Number(text)
  if (!Number.isFinite(t) || t < 20 || t > 350) return 'Target weight should be between 20 and 350 kg.'
  if (goal === 'lose' && t >= currentKg) return 'To lose fat, the target should be below your weight today.'
  if (goal === 'gain' && t <= currentKg) return 'To gain, the target should be above your weight today.'
  return null
}

export interface Timeline {
  weeks: number
  /** yyyy-mm-dd of the expected arrival. */
  byDate: string
  message: string
}

const monthOf = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

const dayMonth = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

/** How long reaching the target takes at a weekly rate. Long goals start with
 * a nearer first milestone (2 kg) and are said in months (spec T-059). */
export function goalTimeline(currentKg: number, targetKg: number, rate: number, today: string): Timeline | null {
  if (!rate || targetKg === currentKg) return null
  const perWeek = Math.abs(rate) * currentKg
  const gap = Math.abs(targetKg - currentKg)
  const weeks = Math.max(1, Math.ceil(gap / perWeek))
  const byDate = shiftDate(today, weeks * 7)
  const pace = Math.round(perWeek * 100) / 100
  const span = weeks > 12 ? `about ${Math.round(weeks / 4.35)} months` : `around ${weeks} weeks`
  let message = `At about ${pace} kg a week, you’d reach ${targetKg} kg by ${monthOf(byDate)}. That is ${span}.`
  if (weeks > 8) {
    const firstKg = Math.min(2, gap)
    const first = shiftDate(today, Math.max(1, Math.ceil(firstKg / perWeek)) * 7)
    message = `First ${Math.round(firstKg * 10) / 10} kg by ${dayMonth(first)}. ${message}`
  }
  return { weeks, byDate, message }
}

const fullDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86_400_000)

/** The latest event date allowed, in days from today. */
export const MAX_EVENT_DAYS = 730

/** Checks an optional event date (spec T-041b). Empty is fine. */
export function checkEventDate(text: string, today: string): string | null {
  if (!text.trim()) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) return 'Enter a date.'
  if (text <= today) return 'Pick a date after today.'
  if (daysBetween(today, text) > MAX_EVENT_DAYS) return 'Pick a date within 2 years.'
  return null
}

/** What the pace means for an event like a wedding or trip (spec T-041b).
 * Only says what happens at the chosen pace; it never changes the pace. */
export function eventNote(currentKg: number, targetKg: number | null, rate: number, today: string, eventDate: string | null): string | null {
  if (!rate || !eventDate || checkEventDate(eventDate, today)) return null
  const weeks = daysBetween(today, eventDate) / 7
  const when = fullDate(eventDate)
  const perWeek = Math.abs(rate) * currentKg
  const expected = Math.round((currentKg + Math.sign(rate) * perWeek * weeks) * 10) / 10
  if (targetKg === null) return `At this pace, you’d be about ${expected} kg on ${when}.`
  const t = goalTimeline(currentKg, targetKg, rate, today)
  if (t && t.byDate <= eventDate) return `You’d reach ${targetKg} kg before your event on ${when}.`
  const needed = Math.round((Math.abs(targetKg - currentKg) / weeks) * 100) / 100
  return (
    `On ${when}, you’d be about ${expected} kg, not ${targetKg} kg. ` +
    `Reaching ${targetKg} kg by then needs about ${needed} kg a week. ` +
    'That is faster than your pace. Pick a closer target. Or keep your pace and get there later.'
  )
}

const DAY_TYPE: Record<Activity, DayType> = { desk: 'desk', on_feet: 'onFeet', physical: 'physical' }

export interface Plan {
  maintenance: { low: number; high: number; message: string }
  /** How today's eating compares with maintenance; null without a typical day. */
  intakeNote: string | null
  timeline: Timeline | null
  /** What the pace means for the event date; null without one. */
  eventNote: string | null
  /** Suggested targets; null when we don't suggest any. */
  suggested: Macros | null
  /** Why these targets, or why none. */
  reasons: string[]
}

const round50 = (n: number) => Math.round(n / 50) * 50

/** The end-of-onboarding summary. Suggestions are only offered; the person
 * accepts them or sets their own. */
export function buildPlan(p: ProfileInfo, weightKg: number, today: string): Plan {
  const tdee = initialExpenditure({
    sex: p.sex!,
    weightKg,
    heightCm: p.heightCm!,
    ageYears: ageOn(p.birthDate!, today),
    dayType: DAY_TYPE[p.activity!],
    trainingDaysPerWeek: p.trainingDays!,
  })
  const low = round50(tdee * 0.9)
  const high = round50(tdee * 1.1)
  const maintenance = {
    low,
    high,
    message: `You likely burn about ${low.toLocaleString('en-IN')} to ${high.toLocaleString('en-IN')} kcal a day. This is a first guess. It gets better after 2 to 3 weeks of logging.`,
  }

  let intakeNote: string | null = null
  if (p.currentDiet?.kcal) {
    const k = p.currentDiet.kcal
    intakeNote =
      k < low
        ? `Your usual day is about ${k.toLocaleString('en-IN')} kcal. That is less, or some foods were missed. Logging for a week will tell.`
        : k > high
          ? `Your usual day is about ${k.toLocaleString('en-IN')} kcal. That is more, so your weight may be going up.`
          : `Your usual day is about ${k.toLocaleString('en-IN')} kcal. That is close, so your weight may be steady.`
  }

  const timeline =
    p.targetWeightKg !== null && p.goalRate ? goalTimeline(weightKg, p.targetWeightKg, p.goalRate, today) : null
  const event = p.goalRate ? eventNote(weightKg, p.targetWeightKg, p.goalRate, today, p.eventDate) : null

  const reasons: string[] = []
  if ((p.goal === 'lose' || p.goal === 'gain') && noDeficit(p.medical)) {
    reasons.push('We don’t suggest calorie targets during pregnancy or breastfeeding. Set them with your doctor, or track without targets.')
    return { maintenance, intakeNote, timeline, eventNote: event, suggested: null, reasons }
  }
  // Very low weight: no targets of any kind, only a doctor (T-071).
  const bmiValue = shownBmi(weightKg, p.heightCm!)
  if (bmiValue < DOCTOR_FIRST_BMI) {
    reasons.push('Your weight is very low for your height. So we don’t suggest targets. Please see a doctor first. You can still track food and training.')
    return { maintenance, intakeNote, timeline, eventNote: event, suggested: null, reasons }
  }
  const asked = p.goal === 'lose' || p.goal === 'gain' ? (p.goalRate ?? 0) : p.goal === 'recomp' ? -0.0025 : 0
  // A saved pace is kept within today's safe limits: no loss when
  // underweight, and no faster loss than the body allows (T-071).
  const rate = asked < 0 ? (bmiValue < 18.5 ? 0 : Math.max(asked, -maxLossRate(bmiValue))) : asked
  if (asked < 0 && rate === 0) reasons.push('You are underweight, so we don’t suggest eating less. Calories are set to keep your weight steady.')
  const kcal = calorieTarget({ tdee, weightKg, rate, sex: p.sex! })
  const protein = proteinTarget({
    weightKg,
    heightCm: p.heightCm!,
    trained: p.experience !== 'beginner',
    losingFat: rate < 0,
    kidneyDisease: !!p.medical.kidney,
  })
  const suggested = macroTargets(kcal, protein.grams, weightKg)
  if (rate < 0) reasons.push(`Calories are set to lose ${Math.abs(rate * 100)} % of your weight a week.`)
  else if (rate > 0) {
    const r = Math.min(MAX_GAIN_RATE, rate)
    reasons.push(`Calories are set to gain ${pctText(r)} of your weight a week. You eat ${surplusKcal(r, weightKg)} kcal a day more than you burn.`)
  }
  else reasons.push('Calories are set to keep your weight where it is.')
  if (p.goal === 'recomp') reasons.push('This goal is to lose fat and build muscle. Eat a little less than you burn. Eat plenty of protein.')
  if (rate < 0 && kcal <= calorieFloor(p.sex!)) reasons.push('Calories don’t go below a safe level without a coach.')
  reasons.push(
    protein.referToDoctor
      ? `Protein is kept to ${protein.perKg} g per kg because of kidney disease. Ask your doctor for your own limit.`
      : `Protein is ${protein.perKg} g per kg of body weight. That is enough to build muscle.`,
  )
  reasons.push('Fat is about a quarter of calories; carbs fill the rest.')
  return { maintenance, intakeNote, timeline, eventNote: event, suggested, reasons }
}

