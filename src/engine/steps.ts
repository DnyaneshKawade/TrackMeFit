// Calorie steps (spec T-067a). Week 1 starts at the app's own burn number,
// then calories go down about 250 kcal a week until the goal level. Pure
// functions, no I/O. Evidence: "Track Me Fit: Diet Engine Plan".

import { KCAL_PER_KG, calorieFloor, trendWeights, type Sex, type WeighIn } from './diet'

/** How much calories go down each week. Coaching practice, not trial-tested. */
export const STEP_KCAL = 250
/** Days on each step before the next one is offered. */
export const STEP_DAYS = 7
/** The goal level is at most this share below the burn without a coach (ADA, NICE). */
export const MAX_CUT_SHARE = 0.25
/** The biggest daily cut, in kcal. */
export const MAX_CUT_KCAL = 750

const round10 = (n: number) => Math.round(n / 10) * 10

export interface StepInput {
  /** The app's own burn number (Mifflin-St Jeor × activity), kcal a day. */
  burn: number
  weightKg: number
  /** Fraction of body weight per week; negative to lose. */
  rate: number
  sex: Sex
  /** The usual day from setup, in kcal; null if skipped. Only a cross-check. */
  usualKcal?: number | null
  hasCoach?: boolean
}

export interface StepPlan {
  /** The burn the steps start from, and the weekly pace they aim for. */
  burn: number
  rate: number
  /** Calories for each week, from week 1 to the goal level. */
  steps: number[]
  goalKcal: number
  /** The planned daily cut was made smaller to stay safe. */
  capped: boolean
  /** The goal level is the lowest we go without a coach. */
  atFloor: boolean
  /** The usual day was already at or below the goal level. */
  startsAtGoal: boolean
  reasons: string[]
}

/** The planned daily cut for a weekly loss pace: weight × 2.75 kcal for
 * Gentle (0.25 %), × 5.5 for Steady, × 8.25 for Faster. */
export function plannedCut(rate: number, weightKg: number): number {
  return (Math.abs(Math.min(0, rate)) * weightKg * KCAL_PER_KG) / 7
}

const fmt = (n: number) => n.toLocaleString('en-IN')

/** Weekly calorie steps for losing weight. A pace of 0 or more gives one
 * step at the burn level. */
export function calorieSteps(i: StepInput): StepPlan {
  const burn = round10(i.burn)
  const wanted = plannedCut(i.rate, i.weightKg)
  const cut = i.hasCoach ? wanted : Math.min(wanted, MAX_CUT_SHARE * burn, MAX_CUT_KCAL)
  const capped = cut < wanted - 5
  const floor = i.hasCoach ? 0 : calorieFloor(i.sex)
  // Never above the burn, even when the burn is under the floor.
  const goalKcal = Math.min(burn, round10(Math.max(burn - cut, floor)))
  const atFloor = !i.hasCoach && burn - cut < floor
  if (goalKcal >= burn) return { burn, rate: i.rate, steps: [burn], goalKcal: burn, capped: false, atFloor: false, startsAtGoal: false, reasons: [] }

  const startsAtGoal = !!i.usualKcal && i.usualKcal <= goalKcal
  const steps: number[] = []
  if (!startsAtGoal) for (let k = burn; k > goalKcal; k -= STEP_KCAL) steps.push(k)
  steps.push(goalKcal)

  const reasons: string[] = []
  if (startsAtGoal) reasons.push(`Your usual day is already low. So you start at your goal of ${fmt(goalKcal)} kcal.`)
  else {
    reasons.push(`Week 1 is ${fmt(burn)} kcal a day. That is about what you burn.`)
    reasons.push(`Then it goes down ${STEP_KCAL} kcal each week, to ${fmt(goalKcal)} kcal.`)
    reasons.push('Small steps are easier to follow. You tap OK before each new step.')
  }
  if (capped && !atFloor) reasons.push('We kept the cut small enough to be safe.')
  if (atFloor) reasons.push('Calories don’t go below a safe level without a coach.')
  return { burn, rate: i.rate, steps, goalKcal, capped, atFloor, startsAtGoal, reasons }
}

/** The next step after the current target, or null when there is none yet:
 * too soon, or already at the goal level. */
export function nextStepKcal(currentKcal: number, goalKcal: number, daysOnStep: number): number | null {
  if (daysOnStep < STEP_DAYS || currentKcal <= goalKcal) return null
  return Math.max(goalKcal, currentKcal - STEP_KCAL)
}

/** Days of weight and food it takes to learn the real burn (T-067d). */
export const LEARN_DAYS = 21
/** Days with food logged, out of LEARN_DAYS, to trust the food log. */
export const LEARN_LOGGED_DAYS = 14
/** How far the pace check looks back. */
export const PACE_DAYS = 14
/** The learned burn moves halfway from the old number, and at most this far. */
const LEARN_BLEND = 0.5
const MAX_LEARN_KCAL = 500

const DAY_MS = 86_400_000
const dayNo = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / DAY_MS)

export interface CheckInput extends StepInput {
  currentKcal: number
  /** The goal level the steps were planned to. */
  goalKcal: number
  daysOnStep: number
  today: string
  weighIns: WeighIn[]
  /** Calories logged on each day that has food logged. */
  dayKcal: Map<string, number>
}

export interface StepCheck {
  /** Step down, or stay at this level for now. */
  kind: 'step' | 'hold'
  kcal: number
  goalKcal: number
  /** The burn learned from weight and food, when there was enough. */
  learnedBurn: number | null
  reason: string
}

/** Average weight change between two days, from the trend weight. Null
 * without a weigh-in near both ends. */
export function trendChange(weighIns: WeighIn[], today: string, days: number): { kg: number; days: number } | null {
  const trend = trendWeights(weighIns).filter((w) => w.date <= today)
  const end = trend[trend.length - 1]
  if (!end || dayNo(today) - dayNo(end.date) > 3) return null
  const start = [...trend].reverse().find((w) => dayNo(end.date) - dayNo(w.date) >= days - 3)
  if (!start) return null
  return { kg: end.kg - start.kg, days: dayNo(end.date) - dayNo(start.date) }
}

const kgText = (kg: number) => `${Math.abs(Math.round(kg * 10) / 10).toLocaleString('en-IN')} kg`

/** The weekly check before each step (spec T-067d). Null when no check is
 * due. It holds when weight already falls at the chosen pace. After 21
 * days of weight and food, it learns the real burn and moves the goal. */
export function weeklyCheck(i: CheckInput): StepCheck | null {
  if (i.daysOnStep < STEP_DAYS) return null
  let goalKcal = i.goalKcal
  let learnedBurn: number | null = null
  const long = trendChange(i.weighIns, i.today, LEARN_DAYS)
  if (long) {
    const from = dayNo(i.today) - long.days
    const logged = [...i.dayKcal].filter(([d]) => dayNo(d) > from && d <= i.today).map(([, k]) => k)
    if (logged.length >= LEARN_LOGGED_DAYS) {
      const eaten = logged.reduce((a, b) => a + b, 0) / logged.length
      const seen = eaten - (long.kg * KCAL_PER_KG) / long.days
      const moved = Math.max(-MAX_LEARN_KCAL, Math.min(MAX_LEARN_KCAL, LEARN_BLEND * (seen - i.burn)))
      learnedBurn = round10(i.burn + moved)
      goalKcal = calorieSteps({ ...i, burn: learnedBurn, usualKcal: null }).goalKcal
    }
  }
  const learnt = learnedBurn !== null ? `Your weight and food logs show you burn about ${fmt(learnedBurn)} kcal. ` : ''

  const pace = trendChange(i.weighIns, i.today, PACE_DAYS)
  const planned = i.rate * i.weightKg
  if (pace && planned < 0) {
    const perWeek = (pace.kg / pace.days) * 7
    if (perWeek <= planned)
      return { kind: 'hold', kcal: i.currentKcal, goalKcal, learnedBurn, reason: `You are losing about ${kgText(perWeek)} a week. That is your pace, so stay at ${fmt(i.currentKcal)} kcal for now.` }
  }
  if (i.currentKcal <= goalKcal) return null
  const kcal = Math.max(goalKcal, i.currentKcal - STEP_KCAL)
  const atGoal = kcal === goalKcal ? ' This is your goal level.' : ''
  return { kind: 'step', kcal, goalKcal, learnedBurn, reason: `${learnt}Ready for your next step? Eat about ${fmt(kcal)} kcal a day from today.${atGoal}` }
}
