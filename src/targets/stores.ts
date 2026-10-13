import type { SupabaseClient } from '@supabase/supabase-js'
import { targetOn, type DietTarget, type TargetStore } from './types'

export function memoryTargetStore(userId = 'me', initial: DietTarget[] = []): TargetStore {
  const rows = [...initial]
  return {
    async forDate(date) {
      return targetOn(rows, date)
    },
    async save(v, startsOn, source = 'manual') {
      const row: DietTarget = { ...v, id: String(rows.length + 1), startsOn, source, setBy: userId }
      rows.push(row)
      return row
    },
  }
}

export interface DietTargetRow {
  id: string
  starts_on: string
  kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  source: 'manual' | 'suggested'
  set_by: string
}

export const fromRow = (r: DietTargetRow): DietTarget => ({
  id: r.id,
  startsOn: r.starts_on,
  kcal: r.kcal,
  proteinG: r.protein_g,
  carbG: r.carb_g,
  fatG: r.fat_g,
  source: r.source,
  setBy: r.set_by,
})

const COLUMNS = 'id, starts_on, kcal, protein_g, carb_g, fat_g, source, set_by'

/** Targets for one person. A coach passes the client's id; row-level security
 * only lets the person or their active coach read or write. */
export function supabaseTargetStore(sb: SupabaseClient, userId: string): TargetStore {
  return {
    async forDate(date) {
      const { data, error } = await sb
        .from('diet_targets')
        .select(COLUMNS)
        .eq('user_id', userId)
        .lte('starts_on', date)
        .order('starts_on', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) throw error
      return data.length ? fromRow(data[0] as DietTargetRow) : null
    },
    async save(v, startsOn, source = 'manual') {
      const { data, error } = await sb
        .from('diet_targets')
        .insert({ user_id: userId, starts_on: startsOn, kcal: v.kcal, protein_g: v.proteinG, carb_g: v.carbG, fat_g: v.fatG, source })
        .select(COLUMNS)
        .single()
      if (error) throw error
      return fromRow(data as DietTargetRow)
    },
  }
}
