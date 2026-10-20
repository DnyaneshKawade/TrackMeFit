// Time the workout from its first set (spec T-116). A per-device
// convenience; storage may be off, and nothing breaks.

import { useEffect, useState } from 'react'

const START = 'tmf:workout-start:'
/** Start times older than this are cleared when a new workout starts. */
export const KEEP_START_MS = 2 * 86400000

/** When the first set of this workout was logged on this device, if known. */
export function readStart(sessionId: string): number | null {
  try {
    const v = Number(localStorage.getItem(START + sessionId))
    return v > 0 ? v : null
  } catch {
    return null
  }
}

/** Keeps the start time once, and clears old ones. */
export function markStart(sessionId: string, now: number): number {
  const had = readStart(sessionId)
  if (had) return had
  try {
    const old: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(START) && now - Number(localStorage.getItem(k)) > KEEP_START_MS) old.push(k)
    }
    for (const k of old) localStorage.removeItem(k)
    localStorage.setItem(START + sessionId, String(now))
  } catch {
    // Not kept; the clock still runs until the page reloads.
  }
  return now
}

/** Seconds since `start`, ticking each second; null with no start. */
export function useElapsed(start: number | null): number | null {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (start === null) return
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [start])
  return start === null ? null : Math.max(0, Math.floor((now - start) / 1000))
}
