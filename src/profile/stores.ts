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
  event_date: string | null
  diet_pref: ProfileInfo['dietPref']
  food_rules: string[] | null
  fasting: string[] | null
  allergies: string[] | null
  current_diet: ProfileInfo['currentDiet']
  onboarded_at: string | null
}

const COLUMNS =
  'full_name, sex, birth_date, height_cm, activity, training_days, experience, equipment, goal, goal_rate, target_weight_kg, event_date, ' +
  'diet_pref, food_rules, fasting, allergies, current_diet, onboarded_at'

const numOrNull = (v: number | string | null | undefined) => (v === null || v === undefined ? null : Number(v))

/** Health answers have their own table, so a coach sees them only when shared (T-096). */
export interface HealthRow {
  medical: Record<string, boolean> | null
  other_health: string | null
}

export const fromRow = (r: ProfileRow, h: HealthRow | null = null): ProfileInfo => ({
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
  eventDate: r.event_date ?? null,
  dietPref: r.diet_pref,
  foodRules: r.food_rules ?? [],
  fasting: r.fasting ?? [],
  allergies: r.allergies ?? [],
  currentDiet: r.current_diet ?? null,
  medical: h?.medical ?? {},
  otherHealth: h?.other_health ?? '',
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
  event_date: p.eventDate,
  diet_pref: p.dietPref,
  food_rules: p.foodRules,
  fasting: p.fasting,
  allergies: p.allergies,
  current_diet: p.currentDiet,
  onboarded_at: p.onboardedAt,
})

export const toHealthRow = (p: ProfileInfo): HealthRow => ({ medical: p.medical, other_health: p.otherHealth.trim() })

/** The signed-in person's own profile. Every sign-up already has a row,
 * created by the database, so saving is an update. */
export function supabaseProfileStore(sb: SupabaseClient, userId: string): ProfileStore {
  return {
    async get() {
      // A coach gets no health row unless the client shares it.
      const [profile, health] = await Promise.all([
        sb.from('profiles').select(COLUMNS).eq('id', userId).single(),
        sb.from('health_answers').select('medical, other_health').eq('user_id', userId).maybeSingle(),
      ])
      if (profile.error) throw profile.error
      if (health.error) throw health.error
      return fromRow(profile.data as unknown as ProfileRow, health.data as HealthRow | null)
    },
    async save(p) {
      const { error } = await sb.from('profiles').update(toRow(p)).eq('id', userId)
      if (error) throw error
      const h = await sb.from('health_answers').upsert({ user_id: userId, ...toHealthRow(p), updated_at: new Date().toISOString() })
      if (h.error) throw h.error
    },
  }
}
