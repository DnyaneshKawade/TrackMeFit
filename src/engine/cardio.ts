// Cardio sets (spec T-114): time, and distance for moves that cover ground.
// Pure helpers to read typed times, check values and write them as text.

/** Up to 100 km and 6 hours in one entry. */
export const MAX_DISTANCE_KM = 100
export const MAX_CARDIO_SEC = 6 * 3600

/** "25" is minutes, "25:30" is minutes and seconds, "1:05:00" adds hours.
 * Null when it isn't a time. */
export function parseDuration(text: string): number | null {
  const t = text.trim()
  if (!/^\d+(:\d{1,2}){0,2}$/.test(t)) return null
  const parts = t.split(':').map(Number)
  if (parts.length > 1 && parts.slice(1).some((p) => p > 59)) return null
  const sec = parts.length === 1 ? parts[0] * 60 : parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2]
  return sec > 0 ? sec : null
}

const two = (n: number) => String(n).padStart(2, '0')

/** 1530 → "25:30"; 3900 → "1:05:00". */
export function durationText(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`
}

/** A problem with a cardio entry in plain words, or null when it can be saved. */
export function checkCardio(distanceKm: number | null, seconds: number | null): string | null {
  if (seconds === null) return 'Enter the time, like 25 or 25:30.'
  if (seconds > MAX_CARDIO_SEC) return 'Time must be 6 hours or less.'
  if (distanceKm !== null && !(distanceKm > 0 && distanceKm <= MAX_DISTANCE_KM)) return 'Distance must be more than 0 and up to 100 km.'
  return null
}

/** Speed in km an hour, to one decimal place. */
export const speedKmh = (distanceKm: number, seconds: number) => Math.round((distanceKm / seconds) * 36000) / 10

const km = (d: number) => `${Math.round(d * 100) / 100} km`

/** "3 km in 25:00 · 7.2 km/h", or "20:00" when there is no distance. */
export function cardioText(c: { distanceKm?: number; seconds?: number }): string {
  if (!c.seconds) return c.distanceKm ? km(c.distanceKm) : ''
  if (!c.distanceKm) return durationText(c.seconds)
  return `${km(c.distanceKm)} in ${durationText(c.seconds)} · ${speedKmh(c.distanceKm, c.seconds)} km/h`
}

export interface CardioEntry {
  performedOn: string
  distanceKm?: number
  seconds?: number
}

export interface CardioRecords {
  farthest?: CardioEntry
  longest?: CardioEntry
  /** Highest speed, from entries of at least 1 km. */
  fastest?: CardioEntry
}

/** Farthest, longest and fastest entries; the first one wins a tie. */
export function cardioRecords(entries: CardioEntry[]): CardioRecords {
  const out: CardioRecords = {}
  for (const e of entries) {
    if (e.distanceKm && (!out.farthest || e.distanceKm > out.farthest.distanceKm!)) out.farthest = e
    if (e.seconds && (!out.longest || e.seconds > out.longest.seconds!)) out.longest = e
    if (e.distanceKm && e.distanceKm >= 1 && e.seconds && (!out.fastest || speedKmh(e.distanceKm, e.seconds) > speedKmh(out.fastest.distanceKm!, out.fastest.seconds!)))
      out.fastest = e
  }
  return out
}
