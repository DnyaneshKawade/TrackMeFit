// Weekly review of a plan: how each muscle is doing, the training engine's
// set change for next week, and whether it is time to deload. Pure functions;
// every decision carries the engine's plain-language reason. Nothing changes
// in the plan until the person accepts the review.

import {
  deloadSets,
  estimatedOneRepMax,
  fractionalVolume,
  LANDMARKS,
  MAX_SETS_PER_SESSION,
  nextWeekSets,
  shouldDeload,
  type Effort,
  type Muscle,
  type Performance,
  type Recovery,
  type SetDecision,
} from '../engine/training'
import { exerciseById } from './exercises'
import type { PastSession, Plan, SetLog } from './types'

export interface Feedback {
  muscle: Muscle
  recovery: Recovery
  effort: Effort
  pain: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000
const toDay = (d: string) => {
  const [y, m, day] = d.split('-').map(Number)
  return Date.UTC(y, m - 1, day) / DAY_MS
}

/** Week of the training block, starting at 1. Zero or less means the block
 * hasn't started yet: the person is in the deload week before it. */
export function blockWeek(blockStartedOn: string, today: string): number {
  return Math.floor((toDay(today) - toDay(blockStartedOn)) / 7) + 1
}

export const isDeloadWeek = (week: number, hardWeeks: number) => week < 1 || week > hardWeeks

/** "Week 2 of 4" or "Deload week". */
export const weekLabel = (week: number, hardWeeks: number) => (isDeloadWeek(week, hardWeeks) ? 'Light week' : `Week ${week} of ${hardWeeks}`)

/** Best estimated one-rep max in a session's sets. */
const bestE1rm = (sets: SetLog[]) => Math.max(0, ...sets.map((s) => estimatedOneRepMax(s.weightKg, s.reps, s.rir ?? 0)))

/** Up, same or down comparing each session with the one before (newest first),
 * by best estimated one-rep max; changes under 1% count as the same. */
export function performanceTrend(history: PastSession[]): Performance[] {
  const out: Performance[] = []
  for (let i = 0; i + 1 < history.length; i++) {
    const now = bestE1rm(history[i].sets)
    const before = bestE1rm(history[i + 1].sets)
    if (before <= 0) break
    const ratio = now / before
    out.push(ratio > 1.01 ? 'up' : ratio < 0.99 ? 'down' : 'same')
  }
  return out
}

/** A muscle's performance from its main exercises: down if any is down, up if
 * any is up and none down. Also how many sessions in a row it went down. */
export function musclePerformance(trends: Performance[][]): { performance: Performance; downStreak: number } {
  const latest = trends.map((t) => t[0]).filter(Boolean)
  const performance: Performance = latest.includes('down') ? 'down' : latest.includes('up') ? 'up' : 'same'
  const downStreak = Math.max(0, ...trends.map((t) => {
    let n = 0
    while (t[n] === 'down') n++
    return n
  }))
  return { performance, downStreak }
}

/** Weekly sets per muscle in a plan; secondary movers count half. */
export function weeklySets(plan: Plan): Partial<Record<Muscle, number>> {
  return fractionalVolume(
    plan.days.flatMap((d) =>
      d.exercises.flatMap((e) => {
        const ex = exerciseById.get(e.exerciseId)
        return ex ? [{ primary: [ex.primary], secondary: ex.secondary, sets: e.sets }] : []
      }),
    ),
  )
}

/** Adds or removes whole sets on a muscle's main exercises, one at a time:
 * adds go to the exercise with the fewest sets, removals come from the one
 * with the most. Keeps 1-10 sets per exercise and the per-session cap. */
export function applySetChange(plan: Plan, muscle: Muscle, change: number): Plan {
  const next: Plan = { ...plan, days: plan.days.map((d) => ({ ...d, exercises: d.exercises.map((e) => ({ ...e })) })) }
  const slots = next.days.flatMap((d) =>
    d.exercises.filter((e) => exerciseById.get(e.exerciseId)?.primary === muscle).map((e) => ({ day: d, e })),
  )
  const dayLoad = (day: Plan['days'][number]) =>
    day.exercises.filter((e) => exerciseById.get(e.exerciseId)?.primary === muscle).reduce((n, e) => n + e.sets, 0)
  for (let i = 0; i < Math.abs(change); i++) {
    const options = slots
      .filter(({ day, e }) => (change > 0 ? e.sets < 10 && dayLoad(day) < MAX_SETS_PER_SESSION : e.sets > 1))
      .sort((a, b) => (change > 0 ? a.e.sets - b.e.sets : b.e.sets - a.e.sets))
    if (!options.length) break
    options[0].e.sets += change > 0 ? 1 : -1
  }
  return next
}

export interface MuscleReview {
  muscle: Muscle
  sets: number
  nextSets: number
  decision: SetDecision | null
  why: string
}

export interface WeekReview {
  week: number
  deload: boolean
  why: string
  muscles: MuscleReview[]
  /** The plan with the suggested set changes applied (unchanged when deloading). */
  proposed: Plan
}

/** The review for a plan. `histories` holds each exercise's recent sessions,
 * newest first; `feedback` the latest answers per muscle this week. */
export function reviewWeek(input: {
  plan: Plan
  week: number
  hardWeeks: number
  histories: Record<string, PastSession[]>
  feedback: Feedback[]
  runDown: boolean
}): WeekReview {
  const volume = weeklySets(input.plan)
  const mainMuscles = [...new Set(input.plan.days.flatMap((d) => d.exercises.map((e) => exerciseById.get(e.exerciseId)?.primary)))].filter(
    (m): m is Muscle => !!m,
  )
  let proposed = input.plan
  let down = 0
  const muscles = mainMuscles.map((muscle): MuscleReview => {
    const sets = volume[muscle] ?? 0
    const exIds = input.plan.days.flatMap((d) => d.exercises).filter((e) => exerciseById.get(e.exerciseId)?.primary === muscle).map((e) => e.exerciseId)
    const perf = musclePerformance([...new Set(exIds)].map((id) => performanceTrend(input.histories[id] ?? [])))
    if (perf.performance === 'down') down++
    const fb = input.feedback.find((f) => f.muscle === muscle)
    if (!fb) return { muscle, sets, nextSets: sets, decision: null, why: 'No feedback after training yet, so sets stay the same.' }
    const decision = nextWeekSets(sets, { ...perf, recovery: fb.recovery, effort: fb.effort, pain: fb.pain }, LANDMARKS[muscle])
    const whole = Math.round(decision.change)
    if (whole) proposed = applySetChange(proposed, muscle, whole)
    return { muscle, sets, nextSets: sets + whole, decision, why: decision.why }
  })

  const deload = shouldDeload({ week: input.week, plannedHardWeeks: input.hardWeeks, musclesDown: down, musclesTrained: mainMuscles.length, userRunDown: input.runDown })
  if (deload) {
    const why =
      input.week > input.hardWeeks
        ? `You've finished ${input.hardWeeks} hard weeks, so this is a light week.`
        : input.runDown
          ? 'You feel tired, so take a light week now.'
          : 'Half your muscles got weaker at once. Take a light week now.'
    return { week: input.week, deload, why, muscles, proposed: input.plan }
  }
  return { week: input.week, deload, why: `Week ${input.week} of ${input.hardWeeks}.`, muscles, proposed }
}

/** What to do on a planned exercise in a deload week. */
export const deloadAdvice = (sets: number) =>
  `Light week: ${deloadSets(sets)} sets at your week-1 weights. Stop while you could still do 4 more reps.`
