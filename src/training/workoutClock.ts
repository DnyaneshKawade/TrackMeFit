// Keep the screen on and time the workout (spec T-116). Both are per-device
// conveniences; storage and Wake Lock may be missing, and nothing breaks.

import { useEffect, useState } from 'react'

const START = 'tmf:workout-start:'
const AWAKE = 'tmf:keep-awake'
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

/** The person's choice to keep the screen on; on unless they turned it off. */
export function readKeepAwake(): boolean {
  try {
    return localStorage.getItem(AWAKE) !== '0'
  } catch {
    return true
  }
}

export function writeKeepAwake(on: boolean) {
  try {
    if (on) localStorage.removeItem(AWAKE)
    else localStorage.setItem(AWAKE, '0')
  } catch {
    // Not kept; it applies until the page reloads.
  }
}

interface Sentinel {
  release(): Promise<void>
}
type WakeLockApi = { request(type: 'screen'): Promise<Sentinel> }

/** Holds a screen Wake Lock while `on`. The phone drops it when the app is
 * hidden, so it is asked for again when the app shows. False when the phone
 * can't keep the screen on. */
export function useWakeLock(on: boolean): boolean {
  const api = (typeof navigator !== 'undefined' ? (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock : undefined) ?? null
  useEffect(() => {
    if (!on || !api) return
    let lock: Sentinel | null = null
    let live = true
    const take = () => {
      if (document.visibilityState !== 'visible') return
      api.request('screen').then(
        (l) => {
          if (live) lock = l
          else void l.release()
        },
        () => {},
      )
    }
    take()
    document.addEventListener('visibilitychange', take)
    return () => {
      live = false
      document.removeEventListener('visibilitychange', take)
      void lock?.release().catch(() => {})
    }
  }, [on, api])
  return !!api
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
