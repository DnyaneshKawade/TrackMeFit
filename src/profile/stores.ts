import type { SupabaseClient } from '@supabase/supabase-js'
import { EMPTY_PROFILE, type ProfileInfo, type ProfileStore } from './types'

export function memoryProfileStore(initial: Partial<ProfileInfo> = {}): ProfileStore {
  let profile: ProfileInfo = { ...EMPTY_PROFILE, ...initial }
  return {
    async get() {
      return profile
    },
    async save(p) {
      profile = { ...p }
    },
  }
}

export interface ProfileRow {
  full_name: string
  sex: ProfileInfo['sex']
  birth_date: string | null
  height_cm: number | string | null
  activity: ProfileInfo['activity']
  training_days: number | null
  experience: ProfileInfo['experience']
  equipment: ProfileInfo['equipment']
  goal: ProfileInfo['goal']
  goal_rate: number | string | null
  target_weight_kg: number | string | null
  diet_pref: ProfileInfo['dietPref']
  food_rules: string[] | null
  fasting: string[] | null
  allergies: string[] | null
  current_diet: ProfileInfo['currentDiet']
  medical: Record<string, boolean> | null
  other_health: string | null
  onboarded_at: string | null
}

const COLUMNS =
  'full_name, sex, birth_date, height_cm, activity, training_days, experience, equipment, goal, goal_rate, target_weight_kg, ' +
  'diet_pref, food_rules, fasting, allergies, current_diet, medical, other_health, onboarded_at'

const numOrNull = (v: number | string | null | undefined) => (v === null || v === undefined ? null : Number(v))

export const fromRow = (r: ProfileRow): ProfileInfo => ({
  fullName: r.full_name ?? '',
  sex: r.sex,
  birthDate: r.birth_date,
  heightCm: numOrNull(r.height_cm),
  activity: r.activity,
  trainingDays: r.training_days,
  experience: r.experience,
  equipment: r.equipment,
  goal: r.goal,
  goalRate: numOrNull(r.goal_rate),
  targetWeightKg: numOrNull(r.target_weight_kg),
  dietPref: r.diet_pref,
  foodRules: r.food_rules ?? [],
  fasting: r.fasting ?? [],
  allergies: r.allergies ?? [],
  currentDiet: r.current_diet ?? null,
  medical: r.medical ?? {},
  otherHealth: r.other_health ?? '',
  onboardedAt: r.onboarded_at,
})

export const toRow = (p: ProfileInfo): ProfileRow => ({
  full_name: p.fullName.trim(),
  sex: p.sex,
  birth_date: p.birthDate,
  height_cm: p.heightCm,
  activity: p.activity,
  training_days: p.trainingDays,
  experience: p.experience,
  equipment: p.equipment,
  goal: p.goal,
  goal_rate: p.goalRate,
  target_weight_kg: p.targetWeightKg,
  diet_pref: p.dietPref,
  food_rules: p.foodRules,
  fasting: p.fasting,
  allergies: p.allergies,
  current_diet: p.currentDiet,
  medical: p.medical,
  other_health: p.otherHealth.trim(),
  onboarded_at: p.onboardedAt,
})

/** The signed-in person's own profile. Every sign-up already has a row,
 * created by the database, so saving is an update. */
export function supabaseProfileStore(sb: SupabaseClient, userId: string): ProfileStore {
  return {
    async get() {
      const { data, error } = await sb.from('profiles').select(COLUMNS).eq('id', userId).single()
      if (error) throw error
      return fromRow(data as unknown as ProfileRow)
    },
    async save(p) {
      const { error } = await sb.from('profiles').update(toRow(p)).eq('id', userId)
      if (error) throw error
    },
  }
}
