// Calorie steps (spec T-067a). Week 1 starts at the app's own burn number,
// then calories go down about 250 kcal a week until the goal level. Pure
// functions, no I/O. Evidence: "Track Me Fit: Diet Engine Plan".

import { KCAL_PER_KG, calorieFloor, type Sex } from './diet'

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
  if (goalKcal >= burn) return { steps: [burn], goalKcal: burn, capped: false, atFloor: false, startsAtGoal: false, reasons: [] }

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
  return { steps, goalKcal, capped, atFloor, startsAtGoal, reasons }
}

/** The next step after the current target, or null when there is none yet:
 * too soon, or already at the goal level. */
export function nextStepKcal(currentKcal: number, goalKcal: number, daysOnStep: number): number | null {
  if (daysOnStep < STEP_DAYS || currentKcal <= goalKcal) return null
  return Math.max(goalKcal, currentKcal - STEP_KCAL)
}
