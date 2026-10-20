// The person's own exercises and favourite exercises (spec T-043b). Saved
// online only; logging sets still works offline. Returns plain rows, so the
// main bundle doesn't carry the exercise library.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Muscle } from '../engine/training'
import type { Equipment, ExerciseSetting, NewExercise } from './exercises'

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
  /** Own weight step, rest time and notes per exercise (T-112). */
  settings(): Promise<ExerciseSetting[]>
  /** Saves one exercise's settings; with every field empty it removes them. */
  saveSetting(s: ExerciseSetting): Promise<void>
}

const isEmpty = (s: ExerciseSetting) => !s.stepKg && !s.restSec && !s.note?.trim()

export function memoryExerciseStore(init: { custom?: SavedExercise[]; favourites?: string[]; settings?: ExerciseSetting[] } = {}): ExerciseStore {
  const own = [...(init.custom ?? [])]
  const favs = new Set(init.favourites ?? [])
  const settings = new Map((init.settings ?? []).map((s) => [s.exerciseId, s]))
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
    async settings() {
      return [...settings.values()]
    },
    async saveSetting(s) {
      if (isEmpty(s)) settings.delete(s.exerciseId)
      else settings.set(s.exerciseId, { ...s })
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
    async settings() {
      const rows = check(await sb.from('exercise_settings').select('exercise_id, step_kg, rest_seconds, note').eq('user_id', userId).limit(1000))
      return (rows as { exercise_id: string; step_kg: number | string | null; rest_seconds: number | null; note: string | null }[]).map((r) => ({
        exerciseId: r.exercise_id,
        ...(r.step_kg !== null ? { stepKg: Number(r.step_kg) } : {}),
        ...(r.rest_seconds !== null ? { restSec: r.rest_seconds } : {}),
        ...(r.note ? { note: r.note } : {}),
      }))
    },
    async saveSetting(s) {
      if (isEmpty(s)) check(await sb.from('exercise_settings').delete().eq('user_id', userId).eq('exercise_id', s.exerciseId))
      else
        check(
          await sb
            .from('exercise_settings')
            .upsert({ user_id: userId, exercise_id: s.exerciseId, step_kg: s.stepKg ?? null, rest_seconds: s.restSec ?? null, note: s.note?.trim() || null, updated_at: new Date().toISOString() }),
        )
    },
  }
}
