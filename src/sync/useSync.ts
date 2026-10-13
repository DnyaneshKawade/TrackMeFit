import { useEffect, useState } from 'react'
import type { Sync } from './outbox'

/** Ids waiting to sync and the refused count, kept current. */
export function useSync(sync: Sync | undefined): { pending: Set<string>; refused: number } {
  const [, setTick] = useState(0)
  useEffect(() => sync?.subscribe(() => setTick((n) => n + 1)), [sync])
  return { pending: sync?.pendingIds() ?? new Set<string>(), refused: sync?.refused() ?? 0 }
}
