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
  goal: ProfileInfo['goal']
  diet_pref: ProfileInfo['dietPref']
  medical: Record<string, boolean> | null
}

const COLUMNS = 'full_name, sex, birth_date, height_cm, activity, training_days, experience, goal, diet_pref, medical'

export const fromRow = (r: ProfileRow): ProfileInfo => ({
  fullName: r.full_name ?? '',
  sex: r.sex,
  birthDate: r.birth_date,
  heightCm: r.height_cm === null ? null : Number(r.height_cm),
  activity: r.activity,
  trainingDays: r.training_days,
  experience: r.experience,
  goal: r.goal,
  dietPref: r.diet_pref,
  medical: r.medical ?? {},
})

export const toRow = (p: ProfileInfo): ProfileRow => ({
  full_name: p.fullName.trim(),
  sex: p.sex,
  birth_date: p.birthDate,
  height_cm: p.heightCm,
  activity: p.activity,
  training_days: p.trainingDays,
  experience: p.experience,
  goal: p.goal,
  diet_pref: p.dietPref,
  medical: p.medical,
})

/** The signed-in person's own profile. Every sign-up already has a row,
 * created by the database, so saving is an update. */
export function supabaseProfileStore(sb: SupabaseClient, userId: string): ProfileStore {
  return {
    async get() {
      const { data, error } = await sb.from('profiles').select(COLUMNS).eq('id', userId).single()
      if (error) throw error
      return fromRow(data as ProfileRow)
    },
    async save(p) {
      const { error } = await sb.from('profiles').update(toRow(p)).eq('id', userId)
      if (error) throw error
    },
  }
}
