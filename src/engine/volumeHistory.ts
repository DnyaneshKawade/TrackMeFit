// Training volume across exercises (spec T-122): volume per workout and
// weekly sets per muscle. Pure functions, no I/O.

import { startOf } from './myo'
import type { Muscle } from './training'

export interface VolumeSet {
  exerciseId: string
  weightKg: number
  reps: number
  tag?: 'warmup' | 'drop' | 'failure' | 'myo'
  miniReps?: number[]
}

export interface VolumeSession {
  performedOn: string
  sets: VolumeSet[]
}

/** How an exercise counts: its muscles, and whether its weight is load.
 * Null for exercises that don't count, like cardio. */
export type ExerciseInfo = (id: string) => { primary: Muscle; secondary: Muscle[]; load: boolean } | null

const counts = (s: VolumeSet) => s.tag !== 'warmup' && s.reps > 0

/** Weight × reps over every set of each day, oldest first. Drop sets count;
 * warm-ups, cardio and assisted machines (whose weight is help) don't. */
export function workoutVolume(sessions: VolumeSession[], info: ExerciseInfo): { date: string; value: number }[] {
  const byDay = new Map<string, number>()
  for (const s of sessions)
    for (const x of s.sets) {
      if (!counts(x) || !info(x.exerciseId)?.load) continue
      byDay.set(s.performedOn, (byDay.get(s.performedOn) ?? 0) + x.weightKg * x.reps)
    }
  return [...byDay]
    .filter(([, v]) => v > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: Math.round(value) }))
}

/** Monday of the week a date falls in. */
export function weekOf(date: string): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

/** Hard sets a week for one muscle, oldest week first: a set for the main
 * muscle counts 1, for a muscle it also works 0.5 (as the training engine
 * counts). Warm-ups and drop sets don't count. Weeks with none are left out. */
export function weeklyMuscleSets(sessions: VolumeSession[], muscle: Muscle, info: ExerciseInfo): { date: string; value: number }[] {
  const byWeek = new Map<string, number>()
  for (const s of sessions) {
    const week = weekOf(s.performedOn)
    for (const raw of s.sets) {
      const x = startOf(raw)
      if (!counts(x) || x.tag === 'drop') continue
      const e = info(x.exerciseId)
      const n = e?.primary === muscle ? 1 : e?.secondary.includes(muscle) ? 0.5 : 0
      if (n) byWeek.set(week, (byWeek.get(week) ?? 0) + n)
    }
  }
  return [...byWeek].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }))
}
