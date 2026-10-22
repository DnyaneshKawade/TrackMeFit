// Today's workout state and tomorrow's plan day, for the Today checklist
// and the evening peek on the Food tab (spec T-156). Two reads in all.

import { workoutToday, type WorkoutToday } from '../engine/today'
import { shiftDate } from '../log/types'
import { weekStart } from '../log/week'
import { nextPlanDay } from './progression'
import type { WorkoutStore } from './types'

/** The plan's next day is found from the last month of workouts. */
const LOOK_BACK_DAYS = 30

export async function trainingToday(store: WorkoutStore, today: string): Promise<{ workout: WorkoutToday; tomorrow: string | null }> {
  const [plans, recent] = await Promise.all([store.plans(), store.summaries(shiftDate(today, -LOOK_BACK_DAYS), today)])
  // The plan the latest workout followed, or the first plan.
  const withDays = plans.filter((p) => p.days.length)
  const latest = recent.find((w) => w.planDayId)
  const plan = withDays.find((p) => p.days.some((d) => d.id === latest?.planDayId)) ?? withDays[0]
  if (!plan) return { workout: null, tomorrow: null }
  const from = weekStart(today)
  const thisWeek = recent.filter((w) => w.performedOn >= from).length
  const workout = workoutToday({ hasPlan: true, today: recent.filter((w) => w.performedOn === today).length, thisWeek, daysPerWeek: plan.days.length })
  const next = nextPlanDay(plan, recent)
  // Still to do today, so tomorrow is the day after it.
  const tomorrowDay = workout === 'todo' && next ? nextPlanDay(plan, [{ planDayId: next.id }]) : next
  // The week's workouts are done, so tomorrow rests unless a new week starts.
  const weekFull = thisWeek + (workout === 'todo' ? 1 : 0) >= plan.days.length
  const rests = weekFull && weekStart(shiftDate(today, 1)) === from
  return { workout, tomorrow: rests ? 'Rest day' : (tomorrowDay?.name ?? null) }
}
