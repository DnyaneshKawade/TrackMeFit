// LogStore backed by the food_logs table. Row-level security limits every
// query to the signed-in person's own rows (or a coach's active clients).

import type { SupabaseClient } from '@supabase/supabase-js'
import type { LogEntry, LogStore, Meal, NewLogEntry } from './types'

export interface FoodLogRow {
  id: string
  logged_on: string
  meal: Meal
  food_id: string
  food_name: string
  grams: number | string
  kcal: number | string
  protein_g: number | string
  carb_g: number | string
  fat_g: number | string
}

// Postgres numeric columns arrive as strings.
export const fromRow = (r: FoodLogRow): LogEntry => ({
  id: r.id,
  loggedOn: r.logged_on,
  meal: r.meal,
  foodId: r.food_id,
  foodName: r.food_name,
  grams: Number(r.grams),
  kcal: Number(r.kcal),
  proteinG: Number(r.protein_g),
  carbG: Number(r.carb_g),
  fatG: Number(r.fat_g),
})

export const toRow = (e: NewLogEntry): Omit<FoodLogRow, 'id'> => ({
  logged_on: e.loggedOn,
  meal: e.meal,
  food_id: e.foodId,
  food_name: e.foodName,
  grams: e.grams,
  kcal: e.kcal,
  protein_g: e.proteinG,
  carb_g: e.carbG,
  fat_g: e.fatG,
})

const COLUMNS = 'id, logged_on, meal, food_id, food_name, grams, kcal, protein_g, carb_g, fat_g'

export function supabaseLogStore(sb: SupabaseClient, userId: string): LogStore {
  return {
    async listDay(date) {
      const { data, error } = await sb
        .from('food_logs')
        .select(COLUMNS)
        .eq('user_id', userId)
        .eq('logged_on', date)
        .order('created_at')
      if (error) throw error
      return (data as FoodLogRow[]).map(fromRow)
    },
    async add(entry) {
      const { data, error } = await sb.from('food_logs').insert(toRow(entry)).select(COLUMNS).single()
      if (error) throw error
      return fromRow(data as FoodLogRow)
    },
    async remove(id) {
      const { error } = await sb.from('food_logs').delete().eq('id', id)
      if (error) throw error
    },
  }
}
