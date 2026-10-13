// WorkoutStore on the workout tables. Row-level security limits reads to the
// person and their active coach; only the person logs sessions and sets.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Feedback } from './progression'
import type { PastSession, Plan, Session, SetLog, WorkoutStore } from './types'

interface SetRow { id: string; exercise_id: string; set_index: number; weight_kg: number | string; reps: number; rir: number | null }

export const setFromRow = (r: SetRow): SetLog => ({
  id: r.id,
  exerciseId: r.exercise_id,
  setIndex: r.set_index,
  weightKg: Number(r.weight_kg),
  reps: r.reps,
  rir: r.rir,
})

interface PlanRow {
  id: string
  name: string
  hard_weeks: number
  block_started_on: string
  plan_days: { id: string; day_index: number; name: string; plan_exercises: { position: number; exercise_id: string; sets: number; rep_min: number; rep_max: number }[] }[]
}

export const planFromRow = (r: PlanRow): Plan => ({
  id: r.id,
  name: r.name,
  hardWeeks: r.hard_weeks,
  blockStartedOn: r.block_started_on,
  days: [...r.plan_days]
    .sort((a, b) => a.day_index - b.day_index)
    .map((d) => ({
      id: d.id,
      dayIndex: d.day_index,
      name: d.name,
      exercises: [...d.plan_exercises]
        .sort((a, b) => a.position - b.position)
        .map((e) => ({ exerciseId: e.exercise_id, sets: e.sets, repMin: e.rep_min, repMax: e.rep_max })),
    })),
})

const SET_COLUMNS = 'id, exercise_id, set_index, weight_kg, reps, rir'

export function supabaseWorkoutStore(sb: SupabaseClient, userId: string): WorkoutStore {
  const check = <T>({ data, error }: { data: T; error: unknown }): T => {
    if (error) throw error
    return data
  }
  return {
    async plans() {
      const rows = check(
        await sb
          .from('workout_plans')
          .select('id, name, hard_weeks, block_started_on, plan_days(id, day_index, name, plan_exercises(position, exercise_id, sets, rep_min, rep_max))')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at'),
      )
      return (rows as PlanRow[]).map(planFromRow)
    },
    async savePlan(plan) {
      let planId = plan.id
      if (planId) check(await sb.from('workout_plans').update({ name: plan.name.trim() }).eq('id', planId))
      else planId = (check(await sb.from('workout_plans').insert({ user_id: userId, name: plan.name.trim() }).select('id').single()) as { id: string }).id

      const keep = plan.days.filter((d) => d.id).map((d) => d.id!)
      let del = sb.from('plan_days').delete().eq('plan_id', planId)
      if (keep.length) del = del.not('id', 'in', `(${keep.join(',')})`)
      check(await del)

      for (const d of plan.days) {
        let dayId = d.id
        if (dayId) check(await sb.from('plan_days').update({ name: d.name.trim(), day_index: d.dayIndex }).eq('id', dayId))
        else dayId = (check(await sb.from('plan_days').insert({ plan_id: planId, day_index: d.dayIndex, name: d.name.trim() }).select('id').single()) as { id: string }).id
        check(await sb.from('plan_exercises').delete().eq('day_id', dayId))
        check(
          await sb.from('plan_exercises').insert(
            d.exercises.map((e, position) => ({ day_id: dayId, position, exercise_id: e.exerciseId, sets: e.sets, rep_min: e.repMin, rep_max: e.repMax })),
          ),
        )
      }
      return (await this.plans()).find((p) => p.id === planId)!
    },
    async deletePlan(id) {
      // Keep the rows so past sessions still point at their day; just hide the plan.
      check(await sb.from('workout_plans').update({ is_active: false }).eq('id', id))
    },
    async sessionsOn(date) {
      const rows = check(
        await sb
          .from('workout_sessions')
          .select(`id, performed_on, plan_day_id, plan_days(name), set_logs(${SET_COLUMNS})`)
          .eq('user_id', userId)
          .eq('performed_on', date)
          .order('id'),
      ) as unknown as { id: string; performed_on: string; plan_day_id: string | null; plan_days: { name: string } | null; set_logs: SetRow[] }[]
      return rows.map(
        (r): Session => ({
          id: r.id,
          performedOn: r.performed_on,
          planDayId: r.plan_day_id,
          name: r.plan_days?.name ?? 'Workout',
          sets: r.set_logs.map(setFromRow),
        }),
      )
    },
    async startSession(date, day) {
      const r = check(
        await sb.from('workout_sessions').insert({ performed_on: date, plan_day_id: day?.id ?? null }).select('id').single(),
      ) as { id: string }
      return { id: r.id, performedOn: date, planDayId: day?.id ?? null, name: day?.name ?? 'Workout', sets: [] }
    },
    async addSet(sessionId, s) {
      const r = check(
        await sb
          .from('set_logs')
          .insert({ session_id: sessionId, exercise_id: s.exerciseId, set_index: s.setIndex, weight_kg: s.weightKg, reps: s.reps, rir: s.rir })
          .select(SET_COLUMNS)
          .single(),
      )
      return setFromRow(r as SetRow)
    },
    async removeSet(id) {
      check(await sb.from('set_logs').delete().eq('id', id))
    },
    async history(exerciseId, beforeDate, limit = 3) {
      const rows = check(
        await sb
          .from('workout_sessions')
          .select(`performed_on, set_logs!inner(${SET_COLUMNS})`)
          .eq('user_id', userId)
          .eq('set_logs.exercise_id', exerciseId)
          .lt('performed_on', beforeDate)
          .order('performed_on', { ascending: false })
          .limit(limit),
      ) as unknown as { performed_on: string; set_logs: SetRow[] }[]
      return rows.map((r): PastSession => ({ performedOn: r.performed_on, sets: r.set_logs.map(setFromRow) }))
    },
  
    async saveFeedback(sessionId, list) {
      if (!list.length) return
      check(
        await sb.from('muscle_feedback').upsert(
          list.map((f) => ({ session_id: sessionId, muscle: f.muscle, recovery: f.recovery, effort: f.effort, pain: f.pain })),
          { onConflict: 'session_id,muscle' },
        ),
      )
    },
    async feedbackSince(date) {
      const rows = check(
        await sb
          .from('muscle_feedback')
          .select('muscle, recovery, effort, pain, created_at, workout_sessions!inner(performed_on, user_id)')
          .eq('workout_sessions.user_id', userId)
          .gte('workout_sessions.performed_on', date)
          .order('created_at'),
      ) as unknown as (Feedback & { workout_sessions: { performed_on: string } })[]
      const latest = new Map<string, Feedback>()
      for (const r of [...rows].sort((a, b) => a.workout_sessions.performed_on.localeCompare(b.workout_sessions.performed_on)))
        latest.set(r.muscle, { muscle: r.muscle, recovery: r.recovery, effort: r.effort, pain: r.pain })
      return [...latest.values()]
    },
    async startBlock(planId, date) {
      check(await sb.from('workout_plans').update({ block_started_on: date }).eq('id', planId))
    },
  }
}
