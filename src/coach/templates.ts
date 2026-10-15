// Program templates (T-026g): a coach keeps plans as templates and copies one
// into a client's plans, starting at week 1 or partway through.

import { shiftDate } from '../log/types'
import type { Plan } from '../training/types'

/** A template copied for a client. The coach's own exercises are left out,
 * because the client can't see them; `dropped` counts them. */
export function copyTemplate(template: Plan, known: (exerciseId: string) => boolean): { plan: Plan; dropped: number } {
  let dropped = 0
  const days = template.days
    .map((d) => {
      const exercises = d.exercises.filter((e) => {
        const keep = !e.exerciseId.startsWith('custom:') || known(e.exerciseId)
        if (!keep) dropped++
        return keep
      })
      return { dayIndex: d.dayIndex, name: d.name, exercises: exercises.map((e) => ({ ...e })) }
    })
    .filter((d) => d.exercises.length)
  return { plan: { name: template.name, hardWeeks: template.hardWeeks ?? 4, days }, dropped }
}

/** The start date that puts the client in this week of the program today. */
export const startForWeek = (today: string, week: number) => shiftDate(today, -7 * (Math.max(1, week) - 1))

/** "Kavita joins in week 3, with the rest of the group." */
export function joinText(first: string, week: number, hardWeeks: number): string {
  if (week <= 1) return `${first} starts at week 1 today.`
  return `${first} joins in week ${week} of ${hardWeeks}. The light week comes after week ${hardWeeks}, as for others on it.`
}
