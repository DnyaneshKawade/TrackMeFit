// Where food search answers come from (T-038): the database when the foods
// are loaded there, otherwise the bundled list, so logging always works. The
// person's own foods are searched on the device and shown first; they are
// never sent to the shared food tables.

import type { SupabaseClient } from '@supabase/supabase-js'
import { fromRow, type FoodRow } from './foodRows'
import { createSearchIndex, searchFoods, type SearchIndex } from './search'
import type { Food } from './types'

export interface FoodFinder {
  /** Best matches first. */
  search(query: string, limit?: number): Promise<Food[]>
  /** Foods by id, for re-opening recent foods. Missing ids are left out. */
  byIds(ids: string[]): Promise<Map<string, Food>>
}

export function localFinder(index: SearchIndex): FoodFinder {
  return {
    search: async (query, limit = 30) => searchFoods(index, query, limit),
    byIds: async (ids) => {
      const out = new Map<string, Food>()
      for (const id of ids) {
        const f = index.byId.get(id)
        if (f) out.set(id, f)
      }
      return out
    },
  }
}

/** Search in the database, falling back to the bundled list when the
 * database can't be reached or has no foods loaded yet. */
export function serverFinder(sb: SupabaseClient, fallback: () => Promise<FoodFinder>): FoodFinder {
  let local: Promise<FoodFinder> | null = null
  let ready: Promise<boolean> | null = null
  const bundledFinder = () => (local ??= fallback())
  // Checked once: are the foods loaded?
  const serverReady = () =>
    (ready ??= Promise.resolve(sb.from('foods').select('id', { count: 'exact', head: true })).then(
      ({ count, error }) => !error && (count ?? 0) > 0,
      () => false,
    ))
  const rows = async (fn: 'search_foods' | 'foods_by_id', args: Record<string, unknown>) => {
    const { data, error } = await sb.rpc(fn, args)
    if (error) throw error
    return (data as FoodRow[]).map(fromRow)
  }
  return {
    async search(query, limit = 30) {
      if (await serverReady()) {
        try {
          return await rows('search_foods', { q: query, lim: limit })
        } catch {
          // Offline or a server problem: the bundled list still works.
        }
      }
      return (await bundledFinder()).search(query, limit)
    },
    async byIds(ids) {
      if (!ids.length) return new Map()
      if (await serverReady()) {
        try {
          return new Map((await rows('foods_by_id', { ids })).map((f) => [f.id, f]))
        } catch {
          // Fall through to the bundled list.
        }
      }
      return (await bundledFinder()).byIds(ids)
    },
  }
}

/** The person's own foods first, then everything else without repeats. */
export function withMine(finder: FoodFinder, mine: Food[]): FoodFinder {
  if (!mine.length) return finder
  const index = createSearchIndex(mine)
  const own = localFinder(index)
  return {
    async search(query, limit = 30) {
      const [a, b] = await Promise.all([own.search(query, limit), finder.search(query, limit)])
      const seen = new Set(a.map((f) => f.id))
      return [...a, ...b.filter((f) => !seen.has(f.id))].slice(0, limit)
    },
    async byIds(ids) {
      const [a, b] = await Promise.all([own.byIds(ids), finder.byIds(ids.filter((id) => !index.byId.has(id)))])
      return new Map([...b, ...a])
    },
  }
}
