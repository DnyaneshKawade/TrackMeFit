// Workout plans (days of exercises with sets and rep ranges) and logged
// sessions, FitNotes style: every set is saved the moment it is logged.

import { weightText, type WeightUnit } from '../engine/units'
import { breakLoad, nextLoad, type LoadDecision } from '../engine/training'
import type { Exercise } from './exercises'
import type { Feedback } from './progression'
import type { Sync } from '../sync/outbox'

export interface PlanExercise {
  exerciseId: string
  sets: number
  repMin: number
  repMax: number
  /** Done as a superset with the next exercise of the day (T-043b). */
  supersetNext?: boolean
}

export interface PlanDay {
  id?: string
  /** Position in the plan, 0-13. Kept when other days are removed. */
  dayIndex: number
  name: string
  exercises: PlanExercise[]
}

export interface Plan {
  id?: string
  name: string
  days: PlanDay[]
  /** Hard weeks before a deload (default 4). */
  hardWeeks?: number
  /** Local date the current training block started. */
  blockStartedOn?: string
  /** The week the block started at, when a coach starts it later than week 1 (T-107). */
  blockStartWeek?: number
  /** Who last saved the plan and the local date, the person or their coach (T-026d). */
  changedBy?: string
  changedOn?: string
}

export interface SetLog {
  id: string
  exerciseId: string
  setIndex: number
  weightKg: number
  reps: number
  /** Reps in reserve, if the person noted it. */
  rir: number | null
  /** Warm-up, drop set or taken to failure (T-043). */
  tag?: SetTag
  note?: string
}

export type SetTag = 'warmup' | 'drop' | 'failure'
export const SET_TAGS: { tag: SetTag; label: string; shown: string }[] = [
  { tag: 'warmup', label: 'Warm-up', shown: 'warm-up' },
  { tag: 'drop', label: 'Drop set', shown: 'drop set' },
  { tag: 'failure', label: 'Failure', shown: 'to failure' },
]
export const MAX_SET_NOTE = 200
export const MAX_WORKOUT_NOTE = 500

/** Sets that count for progress: warm-ups and drop sets are left out. */
export const workingSets = (sets: SetLog[]) => sets.filter((s) => s.tag !== 'warmup' && s.tag !== 'drop')

export type NewSet = Omit<SetLog, 'id'>

export interface Session {
  id: string
  performedOn: string
  planDayId: string | null
  name: string
  sets: SetLog[]
  /** Workout notes (T-043). */
  note?: string
  /** A plan day skipped on purpose, with an optional reason (T-110). */
  skipped?: { reason?: string }
}

export const MAX_SKIP_REASON = 100

export interface PastSession {
  performedOn: string
  sets: SetLog[]
}

/** A workout in a date range, for the calendar and exercise list (T-044). */
export interface SessionSummary {
  id: string
  performedOn: string
  name: string
  /** Exercises done, without repeats. */
  exerciseIds: string[]
  /** The plan day it followed, if any; counts towards the block week (T-107). */
  planDayId?: string | null
  /** Skipped on purpose: counts for the block week, not as training (T-110). */
  skipped?: { reason?: string }
}

/** Workouts read for records: a year of summaries, 200 workouts of history. */
export const MAX_SUMMARIES = 500
export const MAX_RECORD_SESSIONS = 200

export interface WorkoutStore {
  plans(): Promise<Plan[]>
  savePlan(plan: Plan): Promise<Plan>
  deletePlan(id: string): Promise<void>
  sessionsOn(date: string): Promise<Session[]>
  /** An id made on the phone makes a repeat send save once (T-027). */
  startSession(date: string, day: PlanDay | null, id?: string): Promise<Session>
  /** Skips a plan day on a date, so the plan moves on to the next day (T-110). */
  skipDay(date: string, day: PlanDay, reason?: string): Promise<void>
  addSet(sessionId: string, set: NewSet, id?: string): Promise<SetLog>
  removeSet(id: string): Promise<void>
  /** Earlier sessions with this exercise, newest first. */
  history(exerciseId: string, beforeDate: string, limit?: number): Promise<PastSession[]>
  /** Every earlier workout with this exercise, newest first, up to a limit. Needs a connection. */
  exerciseHistory(exerciseId: string, limit?: number): Promise<PastSession[]>
  /** Workouts from one date to another, both included, newest first. */
  summaries(from: string, to: string): Promise<SessionSummary[]>
  saveFeedback(sessionId: string, feedback: Feedback[]): Promise<void>
  /** Saves the workout notes; empty clears them. */
  saveNote(sessionId: string, note: string): Promise<void>
  /** The latest answers per muscle from sessions on or after a date. */
  feedbackSince(date: string): Promise<Feedback[]>
  /** Starts a new training block (after a deload) from a date. */
  /** Week is the block week on that date; 1 unless a coach starts later (T-107). */
  startBlock(planId: string, date: string, week?: number): Promise<void>
  /** Present when sessions and sets can wait on the phone to sync (T-027). */
  sync?: Sync
}

export const MAX_DAYS = 14

/** Problems that stop a plan being saved, in plain words. */
export function checkPlan(plan: Plan): string[] {
  const problems: string[] = []
  if (!plan.name.trim()) problems.push('Give the plan a name.')
  if (plan.days.length === 0) problems.push('Add at least one day.')
  if (plan.days.length > MAX_DAYS) problems.push(`A plan can have up to ${MAX_DAYS} days.`)
  plan.days.forEach((d, i) => {
    const label = d.name.trim() || `Day ${i + 1}`
    if (!d.name.trim()) problems.push(`Name day ${i + 1}.`)
    if (d.exercises.length === 0) problems.push(`${label}: add at least one exercise.`)
    for (const e of d.exercises) {
      if (!Number.isInteger(e.sets) || e.sets < 1 || e.sets > 10) problems.push(`${label}: sets must be 1 to 10.`)
      if (!Number.isInteger(e.repMin) || !Number.isInteger(e.repMax) || e.repMin < 1 || e.repMax > 50)
        problems.push(`${label}: reps must be 1 to 50.`)
      else if (e.repMin > e.repMax) problems.push(`${label}: the lowest reps can't be above the highest.`)
    }
  })
  return [...new Set(problems)]
}

/** Lowest free day position (0-13) for a new day. */
export function nextDayIndex(days: PlanDay[]): number {
  const used = new Set(days.map((d) => d.dayIndex))
  let i = 0
  while (used.has(i)) i++
  return i
}

export function checkSet(weightKg: number, reps: number, rir: number | null): string | null {
  if (!(weightKg >= 0 && weightKg <= 600)) return 'Weight must be 0 to 600 kg.'
  if (!Number.isInteger(reps) || reps < 0 || reps > 100) return 'Reps must be a whole number from 0 to 100.'
  if (rir !== null && (!Number.isInteger(rir) || rir < 0 || rir > 10)) return 'Reps left must be 0 to 10.'
  return null
}

/** "60 kg × 10, 10, 9" for the sets done at the top weight last time. */
export function describeSets(sets: SetLog[], unit: WeightUnit = 'kg'): string {
  if (!sets.length) return ''
  const groups: { w: number; reps: number[] }[] = []
  for (const s of [...sets].sort((a, b) => a.setIndex - b.setIndex)) {
    const g = groups[groups.length - 1]
    if (g && g.w === s.weightKg) g.reps.push(s.reps)
    else groups.push({ w: s.weightKg, reps: [s.reps] })
  }
  return groups.map((g) => `${weightText(g.w, unit)} × ${g.reps.join(', ')}`).join(' · ')
}

/** Whole days from one YYYY-MM-DD date to a later one. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000)
}

/** Weight and reps for next time from the last sessions (double progression).
 * Logged reps left are compared with `targetRir`, the aim for this week.
 * After 10 or more days off before `today`, the start is lighter (T-082f).
 * Null when there is no history or no rep range to aim for. */
export function suggestNext(all: PastSession[], exercise: Exercise, repRange: [number, number], targetRir?: number, today?: string): LoadDecision | null {
  const history = all.map((h) => ({ ...h, sets: workingSets(h.sets) })).filter((h) => h.sets.length)
  const last = history[0]
  if (!last || last.sets.length === 0) return null
  const top = Math.max(...last.sets.map((s) => s.weightKg))
  const topSets = last.sets.filter((s) => s.weightKg === top)
  const repsDone = topSets.map((s) => s.reps)
  // After 10 or more days off, start lighter instead (T-082f).
  const back = today ? breakLoad(top, Math.max(...repsDone), repRange, exercise.increment, daysBetween(last.performedOn, today)) : null
  if (back) return back
  let missStreak = 0
  for (const h of history) {
    if (h.sets.some((s) => s.reps < repRange[0])) missStreak++
    else break
  }
  return nextLoad({ weight: top, repsDone, repRange, increment: exercise.increment, missStreak, rirDone: topSets.map((s) => s.rir), targetRir })
}
