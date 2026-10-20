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
import { exerciseById, similarExercise } from './exercises'
import type { PastSession, Plan, PlanDay, SetLog } from './types'

export interface Feedback {
  muscle: Muscle
  recovery: Recovery
  effort: Effort
  pain: boolean
  /** The exercises that hurt (T-108). Older answers only have `pain`. */
  hurt?: string[]
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

/** Week of the block from workouts done, not days passed (T-107, as in RP):
 * a missed day waits instead of moving the person on. Each full set of plan
 * days done is one week. A start date still ahead is the light week before
 * the block (week 0). */
export function blockWeekByWorkouts(b: { startedOn: string; today: string; done: number; daysPerWeek: number; startWeek?: number }): number {
  if (b.today < b.startedOn) return blockWeek(b.startedOn, b.today)
  return (b.startWeek ?? 1) + Math.floor(b.done / Math.max(1, b.daysPerWeek))
}

/** Plan workouts done in the current block, from the person's workouts. */
export function workoutsInBlock(plan: Plan, workouts: { performedOn: string; planDayId?: string | null }[], today: string): number {
  const start = plan.blockStartedOn ?? today
  const days = new Set(plan.days.map((d) => d.id))
  return workouts.filter((w) => w.planDayId && days.has(w.planDayId) && w.performedOn >= start && w.performedOn <= today).length
}

/** The plan day to do next: the one after the last plan day done or skipped
 * (T-110). Days run in order and start again after the last one. */
export function nextPlanDay(plan: Plan, workouts: { planDayId?: string | null }[]): PlanDay | undefined {
  const days = [...plan.days].sort((a, b) => a.dayIndex - b.dayIndex)
  // Workouts come newest first, so the first match is the latest.
  const last = workouts.find((w) => w.planDayId && days.some((d) => d.id === w.planDayId))
  const i = last ? days.findIndex((d) => d.id === last.planDayId) : -1
  return days[(i + 1) % days.length]
}

/** "You skipped 2 workouts this week: busy, ill." for the week review (T-110). */
export function skipNote(skips: { skipped?: { reason?: string } }[]): string | null {
  if (!skips.length) return null
  const reasons = skips.map((s) => s.skipped?.reason).filter((r): r is string => !!r)
  const count = skips.length === 1 ? '1 workout' : `${skips.length} workouts`
  return `You skipped ${count} this week${reasons.length ? `: ${reasons.join(', ')}` : ''}.`
}

export const isDeloadWeek = (week: number, hardWeeks: number) => week < 1 || week > hardWeeks

/** Hard weeks a block can have before its light week (T-109). */
export const HARD_WEEK_CHOICES = [3, 4, 5, 6, 7] as const

/** Swaps the person picked when starting the next block (T-109): each to a
 * similar exercise not already in the plan. Sets and reps stay the same. */
export function nextBlockSwaps(plan: Plan, ids: string[]): Swap[] {
  const taken = new Set(plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId)))
  return ids.flatMap((id): Swap[] => {
    const ex = exerciseById.get(id)
    const to = ex && taken.has(id) ? similarExercise(ex, taken) : undefined
    if (!ex || !to) return []
    taken.add(to.id)
    return [{ from: id, to: to.id, why: `Swap ${ex.name} for ${to.name}.` }]
  })
}

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
  /** Exercises that hurt and what to do instead (T-108). `to` is set only for a
   * plan exercise with a similar one to move to. */
  swaps: Swap[]
}

export interface Swap {
  from: string
  to?: string
  why: string
}

/** Swap each exercise that hurt for a similar one not already in the plan (T-108). */
export function painSwaps(plan: Plan, hurt: string[]): Swap[] {
  const inPlan = new Set(plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId)))
  const taken = new Set(inPlan)
  return hurt.map((id): Swap => {
    const ex = exerciseById.get(id)
    const name = ex?.name ?? 'This exercise'
    if (!ex || !inPlan.has(id)) return { from: id, why: `${name} hurt. Try a different exercise next time.` }
    const to = similarExercise(ex, taken)
    if (!to) return { from: id, why: `${name} hurt. Pick a different exercise for it in your plan.` }
    taken.add(to.id)
    return { from: id, to: to.id, why: `${name} hurt, so we swap it for ${to.name}.` }
  })
}

export const applySwaps = (plan: Plan, swaps: Swap[]): Plan => {
  const to = new Map(swaps.flatMap((s) => (s.to ? [[s.from, s.to] as const] : [])))
  if (!to.size) return plan
  return { ...plan, days: plan.days.map((d) => ({ ...d, exercises: d.exercises.map((e) => ({ ...e, exerciseId: to.get(e.exerciseId) ?? e.exerciseId })) })) }
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
  const pendingSwaps: Swap[] = []
  let down = 0
  const muscles = mainMuscles.map((muscle): MuscleReview => {
    const sets = volume[muscle] ?? 0
    const exIds = input.plan.days.flatMap((d) => d.exercises).filter((e) => exerciseById.get(e.exerciseId)?.primary === muscle).map((e) => e.exerciseId)
    const perf = musclePerformance([...new Set(exIds)].map((id) => performanceTrend(input.histories[id] ?? [])))
    if (perf.performance === 'down') down++
    const fb = input.feedback.find((f) => f.muscle === muscle)
    if (!fb) return { muscle, sets, nextSets: sets, decision: null, why: 'No feedback after training yet, so sets stay the same.', swaps: [] }
    const decision = nextWeekSets(sets, { ...perf, recovery: fb.recovery, effort: fb.effort, pain: fb.pain }, LANDMARKS[muscle])
    const whole = Math.round(decision.change)
    if (whole) proposed = applySetChange(proposed, muscle, whole)
    const swaps = painSwaps(input.plan, fb.hurt ?? [])
    pendingSwaps.push(...swaps)
    return { muscle, sets, nextSets: sets + whole, decision, why: decision.why, swaps }
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
  // Swaps go on last, so set changes still find each muscle's exercises.
  return { week: input.week, deload, why: `Week ${input.week} of ${input.hardWeeks}.`, muscles, proposed: applySwaps(proposed, pendingSwaps) }
}

/** What to do on a planned exercise in a deload week. */
export const deloadAdvice = (sets: number, muscle?: Muscle) =>
  muscle && LIGHT_WEEK_SKIP.has(muscle)
    ? 'Light week: you can skip this one. Rows, pulls and carries work it too.'
    : `Light week: ${deloadSets(sets)} sets at your week-1 weights. Stop while you could still do 4 more reps.`

/** Small muscles a light week can leave out (T-109, as in RP). */
export const LIGHT_WEEK_SKIP: ReadonlySet<Muscle> = new Set(['traps', 'forearms'])
