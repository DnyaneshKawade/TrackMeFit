// The person's own exercises and favourite exercises (spec T-043b). Saved
// online only; logging sets still works offline. Returns plain rows, so the
// main bundle doesn't carry the exercise library.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Muscle } from '../engine/training'
import type { Equipment, NewExercise } from './exercises'

/** An own exercise as saved; its id is `custom:<uuid>`. */
export interface SavedExercise extends NewExercise {
  id: string
}

export interface ExerciseStore {
  /** The person's own exercises, newest first. */
  custom(): Promise<SavedExercise[]>
  addCustom(e: NewExercise): Promise<SavedExercise>
  /** Changes name, muscle, equipment or one-joint flag (T-043c). */
  updateCustom(id: string, e: NewExercise): Promise<SavedExercise>
  /** Removes from the list, or brings back; past sets keep it (T-043c). */
  setHidden(id: string, hidden: boolean): Promise<void>
  favourites(): Promise<string[]>
  setFavourite(exerciseId: string, on: boolean): Promise<void>
}

export function memoryExerciseStore(init: { custom?: SavedExercise[]; favourites?: string[] } = {}): ExerciseStore {
  const own = [...(init.custom ?? [])]
  const favs = new Set(init.favourites ?? [])
  let n = 1
  return {
    async custom() {
      return [...own]
    },
    async addCustom(e) {
      const x: SavedExercise = { ...e, name: e.name.trim(), id: `custom:${n++}` }
      own.unshift(x)
      return x
    },
    async updateCustom(id, e) {
      const i = own.findIndex((x) => x.id === id)
      if (i < 0) throw new Error('no such exercise')
      own[i] = { ...own[i], ...e, name: e.name.trim(), id }
      return { ...own[i] }
    },
    async setHidden(id, hidden) {
      const i = own.findIndex((x) => x.id === id)
      if (i < 0) throw new Error('no such exercise')
      const x = { ...own[i] }
      if (hidden) x.hidden = true
      else delete x.hidden
      own[i] = x
    },
    async favourites() {
      return [...favs]
    },
    async setFavourite(id, on) {
      if (on) favs.add(id)
      else favs.delete(id)
    },
  }
}

export interface CustomExerciseRow {
  id: string
  name: string
  primary_muscle: Muscle
  equipment: Equipment
  isolation: boolean
  hidden?: boolean
}

export const customFromRow = (r: CustomExerciseRow): SavedExercise => ({
  id: `custom:${r.id}`,
  name: r.name,
  primary: r.primary_muscle,
  equipment: r.equipment,
  isolation: r.isolation,
  ...(r.hidden ? { hidden: true } : {}),
})

const COLUMNS = 'id, name, primary_muscle, equipment, isolation, hidden'
/** The row id from an app id like `custom:<uuid>`. */
const rowId = (id: string) => id.replace(/^custom:/, '')

export function supabaseExerciseStore(sb: SupabaseClient, userId: string): ExerciseStore {
  const check = <T>({ data, error }: { data: T; error: unknown }): T => {
    if (error) throw error
    return data
  }
  return {
    async custom() {
      const rows = check(await sb.from('custom_exercises').select(COLUMNS).eq('owner_id', userId).order('created_at', { ascending: false }).limit(500))
      return (rows as CustomExerciseRow[]).map(customFromRow)
    },
    async addCustom(e) {
      const row = check(
        await sb
          .from('custom_exercises')
          .insert({ name: e.name.trim(), primary_muscle: e.primary, equipment: e.equipment, isolation: e.isolation })
          .select(COLUMNS)
          .single(),
      )
      return customFromRow(row as CustomExerciseRow)
    },
    async updateCustom(id, e) {
      const row = check(
        await sb
          .from('custom_exercises')
          .update({ name: e.name.trim(), primary_muscle: e.primary, equipment: e.equipment, isolation: e.isolation })
          .eq('id', rowId(id))
          .eq('owner_id', userId)
          .select(COLUMNS)
          .single(),
      )
      return customFromRow(row as CustomExerciseRow)
    },
    async setHidden(id, hidden) {
      check(await sb.from('custom_exercises').update({ hidden }).eq('id', rowId(id)).eq('owner_id', userId))
    },
    async favourites() {
      const rows = check(await sb.from('favourite_exercises').select('exercise_id').eq('user_id', userId).limit(500))
      return (rows as { exercise_id: string }[]).map((r) => r.exercise_id)
    },
    async setFavourite(exerciseId, on) {
      if (on) check(await sb.from('favourite_exercises').upsert({ user_id: userId, exercise_id: exerciseId }, { ignoreDuplicates: true }))
      else check(await sb.from('favourite_exercises').delete().eq('user_id', userId).eq('exercise_id', exerciseId))
    },
  }
}
