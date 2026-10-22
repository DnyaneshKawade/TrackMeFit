// Saved meal plans: memory for tests and offline, Supabase for real use.
// Row-level security lets only the person or their active coach read or
// write a plan.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { MealPlan } from '../engine/mealPlan'

export interface SavedMealPlan {
  id: string
  plan: MealPlan
  picks: string[]
  createdAt: string
  /** Who saved it: the person or their coach (T-078). Empty if that account is gone. */
  createdBy: string | null
}

export interface MealPlanStore {
  latest(): Promise<SavedMealPlan | null>
  save(plan: MealPlan, picks: string[]): Promise<SavedMealPlan>
  /** Deletes the person's meal plan with its older versions (T-129). Coaches can't. */
  remove?(): Promise<void>
}

/** `by` is who saves; `rows` are plans saved before. */
export function memoryMealPlanStore(by: string | null = null, rows: SavedMealPlan[] = []): MealPlanStore {
  return {
    async latest() {
      return rows[rows.length - 1] ?? null
    },
    async save(plan, picks) {
      const row = { id: String(rows.length + 1), plan, picks, createdAt: new Date(rows.length).toISOString(), createdBy: by }
      rows.push(row)
      return row
    },
    async remove() {
      rows.length = 0
    },
  }
}

interface Row {
  id: string
  plan: MealPlan
  picks: string[]
  created_at: string
  created_by: string | null
}
const fromRow = (r: Row): SavedMealPlan => ({ id: r.id, plan: r.plan, picks: r.picks, createdAt: r.created_at, createdBy: r.created_by })

export function supabaseMealPlanStore(sb: SupabaseClient, userId: string): MealPlanStore {
  return {
    async latest() {
      const { data, error } = await sb
        .from('meal_plans')
        .select('id, plan, picks, created_at, created_by')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) throw error
      return data.length ? fromRow(data[0] as Row) : null
    },
    async save(plan, picks) {
      const { data, error } = await sb
        .from('meal_plans')
        .insert({ user_id: userId, plan, picks })
        .select('id, plan, picks, created_at, created_by')
        .single()
      if (error) throw error
      return fromRow(data as Row)
    },
    async remove() {
      const { error } = await sb.from('meal_plans').delete().eq('user_id', userId)
      if (error) throw error
    },
  }
}
