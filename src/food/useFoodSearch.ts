import { useEffect, useState } from 'react'
import type { FoodFinder } from './finder'
import type { Food } from './types'

export interface FoodSearchState {
  results: Food[]
  /** True until the answer for the current query has arrived. */
  pending: boolean
}

/** Search results for what the person typed. Waits briefly while they type,
 * and ignores answers to earlier queries that arrive late. */
export function useFoodSearch(finder: FoodFinder | null, query: string, limit = 30, delayMs = 150): FoodSearchState {
  const [state, setState] = useState<{ query: string; results: Food[] }>({ query: '', results: [] })
  const q = query.trim()
  useEffect(() => {
    if (!finder || !q) return
    let live = true
    const timer = setTimeout(() => {
      finder.search(q, limit).then(
        (results) => live && setState({ query: q, results }),
        () => live && setState({ query: q, results: [] }),
      )
    }, delayMs)
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [finder, q, limit, delayMs])
  if (!finder || !q) return { results: [], pending: false }
  return state.query === q ? { results: state.results, pending: false } : { results: state.results, pending: true }
}
