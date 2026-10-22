// Planned exercises taken out of one workout (spec T-130). A per-device
// convenience, like the workout clock: storage may be off, and nothing breaks.

const KEY = 'tmf:hidden-exercises'
/** Workouts whose removed exercises are kept; older ones are dropped. */
export const KEEP_WORKOUTS = 10

type Saved = [string, string[]][]

function readAll(): Saved {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown
    return Array.isArray(v) ? (v as Saved) : []
  } catch {
    return []
  }
}

/** Exercise ids removed from this workout on this device. */
export function readHidden(sessionId: string): string[] {
  return readAll().find(([id]) => id === sessionId)?.[1] ?? []
}

/** Keeps this workout's removed exercises, newest last. */
export function saveHidden(sessionId: string, ids: string[]): void {
  const rest = readAll().filter(([id]) => id !== sessionId)
  const next = ids.length ? [...rest, [sessionId, ids] as [string, string[]]] : rest
  try {
    localStorage.setItem(KEY, JSON.stringify(next.slice(-KEEP_WORKOUTS)))
  } catch {
    // Not kept; the exercise stays out until the page reloads.
  }
}
