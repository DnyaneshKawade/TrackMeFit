// Month calendar for workouts (spec T-044). Pure helpers.

import type { Muscle } from '../engine/training'

/** "2026-10" for a date. */
export const monthOf = (date: string) => date.slice(0, 7)

/** The month before or after, as "YYYY-MM". */
export function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + by, 1))
  return d.toISOString().slice(0, 7)
}

/** First and last date of a month. */
export function monthRange(month: string): [string, string] {
  const [y, m] = month.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return [`${month}-01`, `${month}-${String(last).padStart(2, '0')}`]
}

/** Weeks of the month, Monday first; null pads the days outside the month. */
export function monthGrid(month: string): (string | null)[][] {
  const [from, to] = monthRange(month)
  const [y, m] = month.split('-').map(Number)
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
  const days = Number(to.slice(8))
  const cells: (string | null)[] = Array(lead).fill(null)
  for (let d = 1; d <= days; d++) cells.push(`${from.slice(0, 8)}${String(d).padStart(2, '0')}`)
  while (cells.length % 7) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/** Muscle groups for the calendar dots (spec T-120), in the order dots show. */
export type DotGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio'
export const DOT_GROUPS: [DotGroup, string][] = [
  ['chest', 'Chest'],
  ['back', 'Back'],
  ['shoulders', 'Shoulders'],
  ['arms', 'Arms'],
  ['legs', 'Legs'],
  ['core', 'Core'],
  ['cardio', 'Cardio'],
]
const GROUP_OF: Record<Muscle, DotGroup> = {
  chest: 'chest', back: 'back', traps: 'back', neck: 'shoulders',
  frontDelts: 'shoulders', sideDelts: 'shoulders', rearDelts: 'shoulders',
  biceps: 'arms', triceps: 'arms', forearms: 'arms',
  quads: 'legs', hamstrings: 'legs', glutes: 'legs', adductors: 'legs', calves: 'legs',
  abs: 'core',
}
export const groupOf = (m: Muscle): DotGroup => GROUP_OF[m]

/** The groups trained each day, in DOT_GROUPS order. An exercise counts for
 * its main muscle only. `kind` gives the main muscle, 'cardio', or null for
 * an exercise no longer in the list. */
export function dayGroups(sessions: { performedOn: string; exerciseIds: string[] }[], kind: (id: string) => Muscle | 'cardio' | null): Map<string, DotGroup[]> {
  const seen = new Map<string, Set<DotGroup>>()
  for (const s of sessions) {
    const set = seen.get(s.performedOn) ?? new Set<DotGroup>()
    for (const id of s.exerciseIds) {
      const k = kind(id)
      if (k) set.add(k === 'cardio' ? 'cardio' : GROUP_OF[k])
    }
    seen.set(s.performedOn, set)
  }
  const out = new Map<string, DotGroup[]>()
  for (const [day, set] of seen) out.set(day, DOT_GROUPS.map(([g]) => g).filter((g) => set.has(g)))
  return out
}
