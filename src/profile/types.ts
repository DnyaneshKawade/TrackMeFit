// A person's profile from onboarding: what the engines need to know about
// them, their food habits, and the health check.

import type { CurrentDiet } from './currentDiet'

export type Sex = 'male' | 'female'
export type Activity = 'desk' | 'on_feet' | 'physical'
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type GoalChoice = 'lose' | 'maintain' | 'gain' | 'recomp'
export type DietPref = 'veg' | 'eggetarian' | 'nonveg' | 'vegan' | 'jain'
export type Equipment = 'gym' | 'home' | 'none'

export interface ProfileInfo {
  fullName: string
  sex: Sex | null
  birthDate: string | null
  heightCm: number | null
  activity: Activity | null
  trainingDays: number | null
  experience: Experience | null
  equipment: Equipment | null
  goal: GoalChoice | null
  /** Fraction of body weight per week; negative to lose. */
  goalRate: number | null
  targetWeightKg: number | null
  dietPref: DietPref | null
  /** e.g. ['no_onion_garlic'] */
  foodRules: string[]
  /** e.g. ['ekadashi', 'navratri'] */
  fasting: string[]
  allergies: string[]
  /** Rough estimate of what they eat now; null if skipped. */
  currentDiet: CurrentDiet | null
  /** Health check answers, e.g. { diabetes: true, kidney: false }. */
  medical: Record<string, boolean>
  /** Other conditions or medicines, in their own words. */
  otherHealth: string
  /** When onboarding was finished or skipped; null until then. */
  onboardedAt: string | null
}

export interface ProfileStore {
  get(): Promise<ProfileInfo>
  save(p: ProfileInfo): Promise<void>
}

export const EMPTY_PROFILE: ProfileInfo = {
  fullName: '',
  sex: null,
  birthDate: null,
  heightCm: null,
  activity: null,
  trainingDays: null,
  experience: null,
  equipment: null,
  goal: null,
  goalRate: null,
  targetWeightKg: null,
  dietPref: null,
  foodRules: [],
  fasting: [],
  allergies: [],
  currentDiet: null,
  medical: {},
  otherHealth: '',
  onboardedAt: null,
}

/** Onboarding shows until the person finishes or skips it once. */
export const isOnboarded = (p: ProfileInfo) => p.onboardedAt !== null

/** Whole years between a yyyy-mm-dd birth date and `today`. */
export function ageOn(birthDate: string, today: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0)
}

export const MIN_AGE = 13
export const MAX_AGE = 100

export interface AboutYou {
  fullName: string
  sex: Sex | null
  birthDate: string
  heightCm: string
  weightKg: string
  /** Optional. */
  waistCm: string
}

const num = (s: string) => (s.trim() ? Number(s) : NaN)

/** Height and weight when both are valid, for the live BMI. */
export function bodySize(a: AboutYou): { heightCm: number; weightKg: number } | null {
  const h = num(a.heightCm)
  const w = num(a.weightKg)
  return h >= 90 && h <= 250 && w >= 20 && w <= 350 ? { heightCm: h, weightKg: w } : null
}

/** Checks the first onboarding step. Returns a plain-language message per
 * field that needs fixing; empty when everything is fine. */
export function checkAboutYou(a: AboutYou, today: string): Partial<Record<keyof AboutYou, string>> {
  const errors: Partial<Record<keyof AboutYou, string>> = {}
  if (!a.fullName.trim()) errors.fullName = 'Tell us what to call you.'
  if (!a.sex) errors.sex = 'Pick one. It changes how many calories you need.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.birthDate)) errors.birthDate = 'Enter your date of birth.'
  else {
    const age = ageOn(a.birthDate, today)
    if (age < MIN_AGE) errors.birthDate = `Track Me Fit is for people ${MIN_AGE} and older.`
    else if (age > MAX_AGE) errors.birthDate = 'Check the year of birth.'
  }
  const h = num(a.heightCm)
  if (!(h >= 90 && h <= 250)) errors.heightCm = 'Height should be between 90 and 250 cm.'
  const w = num(a.weightKg)
  if (!(w >= 20 && w <= 350)) errors.weightKg = 'Weight should be between 20 and 350 kg.'
  if (a.waistCm.trim()) {
    const waist = num(a.waistCm)
    if (!(waist >= 30 && waist <= 250)) errors.waistCm = 'Waist should be between 30 and 250 cm, or leave it empty.'
  }
  return errors
}

export interface HealthQuestion {
  key: string
  label: string
  /** What we tell the person when they tick it. */
  note: string
  onlyFor?: Sex
}

export const HEALTH_QUESTIONS: HealthQuestion[] = [
  {
    key: 'diabetes',
    label: 'Diabetes or pre-diabetes',
    note: 'Talk to your doctor before changing your calories or carbs. This matters most if you take insulin or sugar tablets.',
  },
  {
    key: 'heart',
    label: 'High blood pressure or a heart condition',
    note: 'Ask your doctor which kinds of training are safe for you before lifting hard.',
  },
  {
    key: 'thyroid',
    label: 'A thyroid condition',
    note: 'Your weight can shift when your medicine dose changes. Keep your doctor informed.',
  },
  {
    key: 'pcos',
    label: 'PCOS',
    note: 'Slow, steady fat loss and strength training both help with PCOS. Check your plan with your doctor.',
    onlyFor: 'female',
  },
  {
    key: 'kidney',
    label: 'Kidney disease',
    note: 'Protein suggestions are kept to 0.8 g per kg of body weight. Ask your doctor for your own limit.',
  },
  {
    key: 'pregnant',
    label: 'Pregnant or breastfeeding',
    note: 'Don’t diet to lose weight right now. We won’t ask you to eat less. Follow your doctor’s advice on food and exercise.',
    onlyFor: 'female',
  },
  {
    key: 'glp1',
    label: 'Weight-loss medicine (like Ozempic or Mounjaro)',
    note: 'Eat enough protein and keep lifting weights to protect muscle on this medicine. Tell your doctor about big diet changes.',
  },
  {
    key: 'eatingDisorder',
    label: 'An eating disorder, now or in the past',
    note: 'Counting food can make this harder. Please talk to a doctor or counsellor before you start tracking. We’ll keep any weight change gentle.',
  },
  {
    key: 'injury',
    label: 'An injury or joint pain',
    note: 'Skip any exercise that hurts and see a doctor or physiotherapist.',
  },
]

export const questionsFor = (sex: Sex | null) => HEALTH_QUESTIONS.filter((q) => !q.onlyFor || q.onlyFor === sex)

/** The notes for every ticked condition, in question order. */
export function healthNotes(medical: Record<string, boolean>, sex: Sex | null): string[] {
  return questionsFor(sex)
    .filter((q) => medical[q.key])
    .map((q) => q.note)
}

/** Conditions where we never suggest losing weight. */
export const noDeficit = (medical: Record<string, boolean>) => !!medical.pregnant
/** Conditions where we don't build an automatic meal plan: a doctor or coach
 * should plan meals (spec T-058, criterion 13). */
export const noAutoMealPlan = (medical: Record<string, boolean>) =>
  !!(medical.kidney || medical.pregnant || medical.diabetes || medical.eatingDisorder || medical.glp1)
/** Conditions where only the gentlest pace is offered. */
export const gentleOnly = (medical: Record<string, boolean>) => !!(medical.eatingDisorder || medical.diabetes || medical.kidney)

export const ALLERGIES: [string, string][] = [
  ['milk', 'Milk or lactose'],
  ['peanuts', 'Peanuts'],
  ['treeNuts', 'Other nuts'],
  ['gluten', 'Wheat or gluten'],
  ['egg', 'Egg'],
  ['seafood', 'Fish or shellfish'],
  ['soy', 'Soy'],
]

export const FASTING: [string, string][] = [
  ['weekly', 'A weekly fast'],
  ['ekadashi', 'Ekadashi'],
  ['navratri', 'Navratri'],
  ['ramadan', 'Ramadan'],
  ['other', 'Other fasts'],
]

export const MAX_OTHER_HEALTH = 500

/** Shown with every suggested number. */
export const SUGGESTION_NOTE =
  'Please note: these numbers are only suggestions, based on nutrition research. They are not medical advice. You decide whether to follow them. If you have a health problem, are pregnant, or take regular medicine, talk to your doctor first.'
