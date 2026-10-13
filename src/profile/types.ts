// A person's profile from onboarding: what the engines need to know about
// them, plus the health check.

export type Sex = 'male' | 'female'
export type Activity = 'desk' | 'on_feet' | 'physical'
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type GoalChoice = 'lose' | 'maintain' | 'gain' | 'recomp'
export type DietPref = 'veg' | 'eggetarian' | 'nonveg' | 'vegan' | 'jain'

export interface ProfileInfo {
  fullName: string
  sex: Sex | null
  birthDate: string | null
  heightCm: number | null
  activity: Activity | null
  trainingDays: number | null
  experience: Experience | null
  goal: GoalChoice | null
  dietPref: DietPref | null
  /** Health check answers, e.g. { diabetes: true, kidney: false }. */
  medical: Record<string, boolean>
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
  goal: null,
  dietPref: null,
  medical: {},
}

/** Onboarding is finished once every answer the engines use is filled in. */
export function isComplete(p: ProfileInfo): boolean {
  return (
    p.sex !== null &&
    p.birthDate !== null &&
    p.heightCm !== null &&
    p.activity !== null &&
    p.trainingDays !== null &&
    p.experience !== null &&
    p.goal !== null &&
    p.dietPref !== null
  )
}

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
}

/** Checks the first onboarding step. Returns a plain-language message per
 * field that needs fixing; empty when everything is fine. */
export function checkAboutYou(a: AboutYou, today: string): Partial<Record<keyof AboutYou, string>> {
  const errors: Partial<Record<keyof AboutYou, string>> = {}
  if (!a.fullName.trim()) errors.fullName = 'Tell us what to call you.'
  if (!a.sex) errors.sex = 'Pick one. It changes the calorie estimate.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.birthDate)) errors.birthDate = 'Enter your date of birth.'
  else {
    const age = ageOn(a.birthDate, today)
    if (age < MIN_AGE) errors.birthDate = `Track Me Fit is for people ${MIN_AGE} and older.`
    else if (age > MAX_AGE) errors.birthDate = 'Check the year of birth.'
  }
  const h = Number(a.heightCm)
  if (!a.heightCm.trim() || !Number.isFinite(h) || h < 90 || h > 250) errors.heightCm = 'Height should be between 90 and 250 cm.'
  const w = Number(a.weightKg)
  if (!a.weightKg.trim() || !Number.isFinite(w) || w < 20 || w > 350) errors.weightKg = 'Weight should be between 20 and 350 kg.'
  return errors
}

export interface HealthQuestion {
  key: string
  label: string
  /** What we tell the person when they answer yes. */
  note: string
  onlyFor?: Sex
}

export const HEALTH_QUESTIONS: HealthQuestion[] = [
  {
    key: 'diabetes',
    label: 'Diabetes or pre-diabetes',
    note: 'Talk to your doctor before changing your calories or carbs, especially if you take insulin or tablets that lower blood sugar.',
  },
  {
    key: 'heart',
    label: 'High blood pressure or a heart condition',
    note: 'Ask your doctor which kinds of training are safe for you before lifting hard.',
  },
  {
    key: 'kidney',
    label: 'Kidney disease',
    note: 'Protein suggestions are kept to 0.8 g per kg of body weight. Ask your doctor for your own limit.',
  },
  {
    key: 'thyroid',
    label: 'A thyroid condition',
    note: 'Your weight can shift when your medicine dose changes. Keep your doctor informed.',
  },
  {
    key: 'pregnant',
    label: 'Pregnant or breastfeeding',
    note: 'Don’t diet to lose weight right now. Follow your doctor’s advice on food and exercise.',
    onlyFor: 'female',
  },
  {
    key: 'eatingDisorder',
    label: 'An eating disorder, now or in the past',
    note: 'Counting food can make this harder. Please talk to a doctor or counsellor before you start tracking.',
  },
  {
    key: 'injury',
    label: 'An injury or joint pain',
    note: 'Skip any exercise that hurts and see a doctor or physiotherapist.',
  },
]

export const questionsFor = (sex: Sex | null) => HEALTH_QUESTIONS.filter((q) => !q.onlyFor || q.onlyFor === sex)

/** The notes for every "yes" answer, in question order. */
export function healthNotes(medical: Record<string, boolean>, sex: Sex | null): string[] {
  return questionsFor(sex)
    .filter((q) => medical[q.key])
    .map((q) => q.note)
}
