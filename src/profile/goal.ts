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
    'BMI can’t tell muscle from fat, so take it as a rough guide.'
  return { value, band, healthyMinKg, healthyMaxKg, message }
}

/** Waist sizes where health risk rises for Indian adults. */
export const WAIST_LIMIT_CM = { male: 90, female: 80 } as const

export function waistNote(waistCm: number, sex: 'male' | 'female'): string {
  const limit = WAIST_LIMIT_CM[sex]
  return waistCm >= limit
    ? `A waist of ${limit} cm or more raises health risk for Indian ${sex === 'male' ? 'men' : 'women'}. Bringing it down matters more than the scale.`
    : `Your waist is under ${limit} cm, the level where health risk starts to rise.`
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

/** Pace choices for a goal, with the recommended one marked. */
export function paceOptions(goal: GoalChoice, experience: Experience, medical: Record<string, boolean>, body?: PaceBody): Pace[] {
  const pct = (r: number) => `${pctText(r)} of your weight a week`
  if (goal === 'lose') {
    if (noDeficit(medical)) return []
    const gentle = { rate: -0.0025, label: 'Gentle', note: `${pct(-0.0025)}. The easiest to follow.` }
    if (gentleOnly(medical)) return [{ ...gentle, recommended: true }]
    return [
      { rate: -0.005, label: 'Steady', note: `${pct(-0.005)}. Keeps muscle and is easy to follow.`, recommended: true },
      gentle,
      { rate: -0.0075, label: 'Faster', note: `${pct(-0.0075)}. Harder; hunger and tiredness are more likely.` },
    ]
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
    return `${pctText(rate)} of your weight a week: about ${kg} kg a week and ${surplusKcal(rate, body.weightKg)} extra kcal a day.`
  }
  const pace = (rate: number, label: string, text: string): Pace => ({ rate, label, note: `${amounts(rate)} ${text}` })
  const leanPace = pace(lean, 'Lean', 'Slow and clean: most of what you gain is muscle.')

  if (gentleOnly(medical)) {
    const care = medical.eatingDisorder ? ' If doctors are helping you gain back weight, follow their plan.' : ''
    return [{ ...leanPace, note: `${leanPace.note} Because of your health answers, we keep the pace gentle.${care}`, recommended: true }]
  }
  if (band === 'obese') {
    return [{ ...leanPace, note: `${leanPace.note} At your weight, “Lose fat and build muscle” may suit you better.`, recommended: true }]
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
        note: `About ${kg} kg a week and ${surplusKcal(catchUp, body.weightKg)} extra kcal a day. Reach a healthy weight sooner. More of the gain is fat, which is fine while you are underweight. Switch to Steady once you reach ${healthyMin} kg.`,
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
  let message = `At about ${pace} kg a week you’d reach ${targetKg} kg in ${span}, by ${monthOf(byDate)}.`
  if (weeks > 8) {
    const firstKg = Math.min(2, gap)
    const first = shiftDate(today, Math.max(1, Math.ceil(firstKg / perWeek)) * 7)
    message = `First ${Math.round(firstKg * 10) / 10} kg by ${dayMonth(first)}. ${message}`
  }
  return { weeks, byDate, message }
}

const DAY_TYPE: Record<Activity, DayType> = { desk: 'desk', on_feet: 'onFeet', physical: 'physical' }

export interface Plan {
  maintenance: { low: number; high: number; message: string }
  /** How today's eating compares with maintenance; null without a typical day. */
  intakeNote: string | null
  timeline: Timeline | null
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
    message: `You likely burn about ${low.toLocaleString('en-IN')} to ${high.toLocaleString('en-IN')} kcal a day. This is a first guess. It gets better after 2 to 3 weeks of logging food and weight.`,
  }

  let intakeNote: string | null = null
  if (p.currentDiet?.kcal) {
    const k = p.currentDiet.kcal
    intakeNote =
      k < low
        ? `Your typical day (about ${k.toLocaleString('en-IN')} kcal) is below that, or some foods were missed. Logging for a week will tell.`
        : k > high
          ? `Your typical day (about ${k.toLocaleString('en-IN')} kcal) is above that, so your weight is probably going up.`
          : `Your typical day (about ${k.toLocaleString('en-IN')} kcal) is close to that, so your weight is probably steady.`
  }

  const timeline =
    p.targetWeightKg !== null && p.goalRate ? goalTimeline(weightKg, p.targetWeightKg, p.goalRate, today) : null

  const reasons: string[] = []
  if ((p.goal === 'lose' || p.goal === 'gain') && noDeficit(p.medical)) {
    reasons.push('We don’t suggest calorie targets during pregnancy or breastfeeding. Set them with your doctor, or track without targets.')
    return { maintenance, intakeNote, timeline, suggested: null, reasons }
  }
  const rate = p.goal === 'lose' || p.goal === 'gain' ? (p.goalRate ?? 0) : p.goal === 'recomp' ? -0.0025 : 0
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
    reasons.push(`Calories are set to gain ${pctText(r)} of your weight a week, about ${surplusKcal(r, weightKg)} kcal a day above what you burn.`)
  }
  else reasons.push('Calories are set to keep your weight where it is.')
  if (p.goal === 'recomp') reasons.push('For losing fat while building muscle, you eat a little less than you burn, with high protein.')
  if (rate < 0 && kcal <= calorieFloor(p.sex!)) reasons.push('Calories don’t go below the safe minimum without a coach.')
  reasons.push(
    protein.referToDoctor
      ? `Protein is kept to ${protein.perKg} g per kg because of kidney disease; ask your doctor for your own limit.`
      : `Protein is ${protein.perKg} g per kg of body weight, enough to keep and build muscle.`,
  )
  reasons.push('Fat is about a quarter of calories; carbs fill the rest.')
  return { maintenance, intakeNote, timeline, suggested, reasons }
}

