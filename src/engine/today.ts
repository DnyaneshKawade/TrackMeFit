// The Today checklist, "Day done" and the evening peek at tomorrow (spec
// T-156). Pure functions, no I/O; every line is plain words for the person.

/** A workout today: done, a planned rest day, still to do, or no plan. */
export type WorkoutToday = 'done' | 'rest' | 'todo' | null

/** Calories within this share of the target count as near it. */
export const NEAR_TARGET = 0.1
/** The peek at tomorrow shows from this hour (7 pm). */
export const PEEK_HOUR = 19
const MAIN_MEALS = 3

/** A workout logged today is done. With none, the day is a rest day once
 * this week's workouts reach the plan's days, so rest is never a miss. */
export function workoutToday({ hasPlan, today, thisWeek, daysPerWeek }: { hasPlan: boolean; today: number; thisWeek: number; daysPerWeek: number }): WorkoutToday {
  if (!hasPlan) return null
  if (today > 0) return 'done'
  return thisWeek >= daysPerWeek ? 'rest' : 'todo'
}

export interface CheckItem {
  key: 'meals' | 'calories' | 'workout' | 'weigh'
  label: string
  done: boolean
}

export interface TodayChecks {
  items: CheckItem[]
  /** "Today: 2 of 4 done" */
  text: string
  /** Main meals logged and calories near the target. */
  dayDone: boolean
  /** A kind line when calories are over the target; null otherwise. */
  overNote: string | null
}

export function todayChecks({
  mealsLogged,
  kcal,
  targetKcal,
  workout,
  weighedIn,
}: {
  /** Breakfast, lunch and dinner with food in them, 0 to 3. */
  mealsLogged: number
  kcal: number
  targetKcal: number | null
  workout: WorkoutToday
  weighedIn: boolean
}): TodayChecks {
  const near = targetKcal !== null && targetKcal > 0 && Math.abs(kcal - targetKcal) <= targetKcal * NEAR_TARGET
  const items: CheckItem[] = [
    { key: 'meals', label: `Meals: ${Math.min(mealsLogged, MAIN_MEALS)} of ${MAIN_MEALS}`, done: mealsLogged >= MAIN_MEALS },
    ...(targetKcal ? [{ key: 'calories' as const, label: 'Calories near your target', done: near }] : []),
    ...(workout ? [{ key: 'workout' as const, label: workout === 'rest' ? 'Rest day' : 'Workout', done: workout !== 'todo' }] : []),
    { key: 'weigh', label: 'Weigh-in', done: weighedIn },
  ]
  const done = items.filter((i) => i.done).length
  return {
    items,
    text: `Today: ${done} of ${items.length} done`,
    dayDone: mealsLogged >= MAIN_MEALS && near,
    overNote: targetKcal && kcal > targetKcal * (1 + NEAR_TARGET) ? 'That’s OK. Tomorrow is a new day.' : null,
  }
}

/** "Tomorrow: Upper B. Breakfast: Poha." after 7 pm; null before, or with nothing to show. */
export function tomorrowPeek({ hour, workout, breakfast }: { hour: number; workout: string | null; breakfast: string | null }): string | null {
  if (hour < PEEK_HOUR || (!workout && !breakfast)) return null
  if (!workout) return `Tomorrow’s breakfast: ${breakfast}.`
  return breakfast ? `Tomorrow: ${workout}. Breakfast: ${breakfast}.` : `Tomorrow: ${workout}.`
}
