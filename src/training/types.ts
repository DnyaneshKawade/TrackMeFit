// Workout plans (days of exercises with sets and rep ranges) and logged
// sessions, FitNotes style: every set is saved the moment it is logged.

import { nextLoad, type LoadDecision } from '../engine/training'
import type { Exercise } from './exercises'

export interface PlanExercise {
  exerciseId: string
  sets: number
  repMin: number
  repMax: number
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
}

export interface SetLog {
  id: string
  exerciseId: string
  setIndex: number
  weightKg: number
  reps: number
  /** Reps in reserve, if the person noted it. */
  rir: number | null
}

export type NewSet = Omit<SetLog, 'id'>

export interface Session {
  id: string
  performedOn: string
  planDayId: string | null
  name: string
  sets: SetLog[]
}

export interface PastSession {
  performedOn: string
  sets: SetLog[]
}

export interface WorkoutStore {
  plans(): Promise<Plan[]>
  savePlan(plan: Plan): Promise<Plan>
  deletePlan(id: string): Promise<void>
  sessionsOn(date: string): Promise<Session[]>
  startSession(date: string, day: PlanDay | null): Promise<Session>
  addSet(sessionId: string, set: NewSet): Promise<SetLog>
  removeSet(id: string): Promise<void>
  /** Earlier sessions with this exercise, newest first. */
  history(exerciseId: string, beforeDate: string, limit?: number): Promise<PastSession[]>
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
  if (rir !== null && (!Number.isInteger(rir) || rir < 0 || rir > 10)) return 'Reps in reserve must be 0 to 10.'
  return null
}

/** "60 kg × 10, 10, 9" for the sets done at the top weight last time. */
export function describeSets(sets: SetLog[]): string {
  if (!sets.length) return ''
  const groups: { w: number; reps: number[] }[] = []
  for (const s of [...sets].sort((a, b) => a.setIndex - b.setIndex)) {
    const g = groups[groups.length - 1]
    if (g && g.w === s.weightKg) g.reps.push(s.reps)
    else groups.push({ w: s.weightKg, reps: [s.reps] })
  }
  return groups.map((g) => `${g.w} kg × ${g.reps.join(', ')}`).join(' · ')
}

/** Weight and reps for next time from the last sessions (double progression).
 * Null when there is no history or no rep range to aim for. */
export function suggestNext(history: PastSession[], exercise: Exercise, repRange: [number, number]): LoadDecision | null {
  const last = history[0]
  if (!last || last.sets.length === 0) return null
  const top = Math.max(...last.sets.map((s) => s.weightKg))
  const repsDone = last.sets.filter((s) => s.weightKg === top).map((s) => s.reps)
  let missStreak = 0
  for (const h of history) {
    if (h.sets.some((s) => s.reps < repRange[0])) missStreak++
    else break
  }
  return nextLoad({ weight: top, repsDone, repRange, increment: exercise.increment, missStreak })
}
