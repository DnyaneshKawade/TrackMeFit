// Diet engine: starting calorie estimate, trend weight, adaptive expenditure,
// weekly calorie target and macros. Pure functions, no I/O.
// Rules and their evidence: see the "Training and Diet Engine" doc.

export type Sex = 'male' | 'female'
export type DayType = 'desk' | 'onFeet' | 'physical'
export type Goal = 'loseFat' | 'buildMuscle' | 'maintain' | 'gainWeight' | 'getFitter'
export type Experience = 'beginner' | 'intermediate' | 'advanced'

/** Energy stored per kg of body-weight change. An approximation; the weekly
 * re-estimate corrects for metabolic adaptation, so it is never used to
 * project weight loss far into the future. */
export const KCAL_PER_KG = 7700

/** Mifflin-St Jeor basal metabolic rate, kcal/day. */
export function mifflinBmr(sex: Sex, weightKg: number, heightCm: number, ageYears: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears
  return sex === 'male' ? base + 5 : base - 161
}

// Deliberately conservative: guideline activity values overestimate Indians'
// energy needs (measured PAL ~1.35 vs 1.53 assumed in young urban adults).
const DAY_TYPE_FACTOR: Record<DayType, number> = { desk: 1.3, onFeet: 1.45, physical: 1.6 }
const PER_TRAINING_DAY = 0.025

export function activityFactor(dayType: DayType, trainingDaysPerWeek: number): number {
  const days = Math.max(0, Math.min(7, trainingDaysPerWeek))
  return DAY_TYPE_FACTOR[dayType] + PER_TRAINING_DAY * days
}

export interface Profile {
  sex: Sex
  weightKg: number
  heightCm: number
  ageYears: number
  dayType: DayType
  trainingDaysPerWeek: number
}

/** Starting estimate of total daily energy expenditure. Rough by design:
 * the first 2-3 weeks of logging calibrate it. */
export function initialExpenditure(p: Profile): number {
  return Math.round(mifflinBmr(p.sex, p.weightKg, p.heightCm, p.ageYears) * activityFactor(p.dayType, p.trainingDaysPerWeek))
}

export interface WeighIn {
  /** ISO date, yyyy-mm-dd */
  date: string
  kg: number
}

const DAY_MS = 86_400_000
const dayIndex = (iso: string) => Math.round(Date.parse(iso + 'T00:00:00Z') / DAY_MS)

/** Exponentially weighted trend weight, one value per weigh-in. Gaps between
 * weigh-ins are decayed as if the trend held steady on the missing days, so a
 * long gap gives the new weigh-in more pull. */
export function trendWeights(weighIns: WeighIn[], alpha = 0.1): WeighIn[] {
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date))
  const out: WeighIn[] = []
  let trend: number | null = null
  let lastDay = 0
  for (const w of sorted) {
    const day = dayIndex(w.date)
    if (trend === null) {
      trend = w.kg
    } else {
      const gap = Math.max(1, day - lastDay)
      const weight = 1 - Math.pow(1 - alpha, gap)
      trend = trend + weight * (w.kg - trend)
    }
    lastDay = day
    out.push({ date: w.date, kg: Math.round(trend * 100) / 100 })
  }
  return out
}

export interface WeekLog {
  /** Calories logged for each day of the week; null when the day was not logged. */
  intakeKcal: (number | null)[]
  /** Trend weight at the start and end of the week. */
  trendStartKg: number
  trendEndKg: number
  /** User marked the week as unusual (illness, travel, festival). */
  flagged?: boolean
}

export interface ExpenditureUpdate {
  tdee: number
  updated: boolean
  reason: string
}

const MIN_LOGGED_DAYS = 4
const BLEND = 0.5

/** Re-estimates expenditure from what was actually eaten and how trend weight
 * moved. Adherence-neutral: it never asks whether the user hit targets. */
export function updateExpenditure(previousTdee: number, week: WeekLog): ExpenditureUpdate {
  if (week.flagged) return { tdee: previousTdee, updated: false, reason: 'Week marked as unusual, so no change.' }
  const logged = week.intakeKcal.filter((k): k is number => k !== null)
  if (logged.length < MIN_LOGGED_DAYS) {
    return { tdee: previousTdee, updated: false, reason: `Only ${logged.length} days logged; need ${MIN_LOGGED_DAYS} to update.` }
  }
  const days = week.intakeKcal.length
  const avgIntake = logged.reduce((a, b) => a + b, 0) / logged.length
  const storedPerDay = ((week.trendEndKg - week.trendStartKg) * KCAL_PER_KG) / days
  const observed = avgIntake - storedPerDay
  const tdee = Math.round(previousTdee + BLEND * (observed - previousTdee))
  return { tdee, updated: true, reason: `Ate ${Math.round(avgIntake)} kcal/day on average and trend weight moved ${(week.trendEndKg - week.trendStartKg).toFixed(2)} kg.` }
}

/** Weekly rate of change as a fraction of body weight. */
export function defaultRate(goal: Goal, experience: Experience, slowerLoss = false): number {
  switch (goal) {
    case 'loseFat':
      return slowerLoss ? -0.0035 : -0.005
    case 'buildMuscle':
    case 'gainWeight':
      return { beginner: 0.005, intermediate: 0.0025, advanced: 0.00125 }[experience]
    default:
      return 0
  }
}

export const MAX_LOSS_RATE = -0.01
/** Fastest gain we set targets for (spec T-059). */
export const MAX_GAIN_RATE = 0.01
/** Catch up (underweight only) never asks for more than this a week. */
export const MAX_GAIN_KG_PER_WEEK = 0.5

/** Gain paces as weekly fractions of body weight: Lean, Steady, Faster.
 * 0.25 to 0.5 % a week suits novice and intermediate lifters; advanced
 * lifters gain muscle more slowly, so their ladder is halved (Iraki 2019). */
export function gainLadder(experience: Experience): [number, number, number] {
  return experience === 'advanced' ? [0.00125, 0.0025, 0.005] : [0.0025, 0.005, 0.0075]
}

/** Extra calories a day for a weekly gain rate, rounded to 10 kcal. */
export function surplusKcal(rate: number, weightKg: number): number {
  return Math.round((rate * weightKg * KCAL_PER_KG) / 7 / 10) * 10
}
export const MAX_WEEKLY_CHANGE_KCAL = 150

export interface TargetInput {
  tdee: number
  weightKg: number
  /** Fraction of body weight per week; negative to lose. Clamped to -1 % and +1 %. */
  rate: number
  sex: Sex
  /** Last week's calorie target, to limit how fast targets move. */
  previousTarget?: number
  hasCoach?: boolean
}

export function calorieFloor(sex: Sex): number {
  return sex === 'male' ? 1500 : 1200
}

export function calorieTarget(i: TargetInput): number {
  const rate = Math.min(MAX_GAIN_RATE, Math.max(MAX_LOSS_RATE, i.rate))
  const dailyChange = (rate * i.weightKg * KCAL_PER_KG) / 7
  let target = i.tdee + dailyChange
  if (i.previousTarget !== undefined) {
    const lo = i.previousTarget - MAX_WEEKLY_CHANGE_KCAL
    const hi = i.previousTarget + MAX_WEEKLY_CHANGE_KCAL
    target = Math.min(hi, Math.max(lo, target))
  }
  if (!i.hasCoach) target = Math.max(calorieFloor(i.sex), target)
  return Math.round(target / 10) * 10
}

/** Indian BMI bands (2025 Indian consensus): 23 and over is raised. */
export type BmiBand = 'under' | 'normal' | 'overweight' | 'obese'
export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  return weightKg / (m * m)
}
export function indianBmiBand(value: number): BmiBand {
  if (value < 18.5) return 'under'
  if (value < 23) return 'normal'
  if (value < 25) return 'overweight'
  return 'obese'
}

export interface ProteinInput {
  weightKg: number
  heightCm: number
  trained: boolean
  losingFat: boolean
  kidneyDisease?: boolean
}

export interface ProteinTarget {
  grams: number
  perKg: number
  referToDoctor: boolean
}

/** 1.6 g/kg default (where gains plateau; matches ICMR-NIN 2024). Up to
 * 2.2 g/kg only for trained lifters losing fat. People with BMI 27.5+ are
 * dosed on the weight they'd have at BMI 25. Kidney disease: capped and
 * referred to a doctor. */
export function proteinTarget(p: ProteinInput): ProteinTarget {
  const b = bmi(p.weightKg, p.heightCm)
  const doseWeight = b >= 27.5 ? 25 * (p.heightCm / 100) ** 2 : p.weightKg
  if (p.kidneyDisease) return { grams: Math.round(0.8 * doseWeight), perKg: 0.8, referToDoctor: true }
  const perKg = p.trained && p.losingFat ? 2.2 : 1.6
  return { grams: Math.round(perKg * doseWeight), perKg, referToDoctor: false }
}

export type CarbPreference = 'balanced' | 'lowerCarb' | 'lowerFat'

export interface Macros {
  kcal: number
  proteinG: number
  fatG: number
  carbG: number
}

const FAT_SHARE: Record<CarbPreference, number> = { balanced: 0.25, lowerCarb: 0.3, lowerFat: 0.2 }
const MIN_FAT_PER_KG = 0.6

/** Protein first, then fat (20-30% of calories, never below 0.6 g/kg), carbs fill the rest. */
export function macroTargets(kcal: number, proteinG: number, weightKg: number, pref: CarbPreference = 'balanced'): Macros {
  const minFat = MIN_FAT_PER_KG * weightKg
  let fatG = Math.max(minFat, (kcal * FAT_SHARE[pref]) / 9)
  let carbG = (kcal - proteinG * 4 - fatG * 9) / 4
  if (carbG < 0) {
    fatG = minFat
    carbG = Math.max(0, (kcal - proteinG * 4 - fatG * 9) / 4)
  }
  return { kcal, proteinG: Math.round(proteinG), fatG: Math.round(fatG), carbG: Math.round(carbG) }
}
