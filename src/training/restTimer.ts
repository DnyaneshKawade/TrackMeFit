// Rest between sets (spec T-043): longer for big lifts so later sets stay
// strong, shorter for isolation work. Pure; the screen ticks the clock.

import type { Exercise } from './exercises'

export const REST_COMPOUND = 150
export const REST_ISOLATION = 90
export const REST_STEP = 15

export const restSeconds = (exercise: Pick<Exercise, 'isolation'>) => (exercise.isolation ? REST_ISOLATION : REST_COMPOUND)

/** Whole seconds left, counted from the clock so a sleeping phone stays right. */
export const restLeft = (endsAt: number, now: number) => Math.max(0, Math.ceil((endsAt - now) / 1000))

/** "2:30". */
export const formatRest = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Exercise ids in order, grouped into supersets: an id in `linked` is done
 * as a superset with the next one (T-043b). The last id can't link on. */
export function supersetGroups(ids: string[], linked: Set<string>): string[][] {
  const groups: string[][] = []
  ids.forEach((id, i) => {
    const prev = ids[i - 1]
    if (i > 0 && linked.has(prev)) groups[groups.length - 1].push(id)
    else groups.push([id])
  })
  return groups
}

/** Rest after a set in a group: none until its last exercise, then the
 * longest rest of the group, so a big lift still gets its full rest. */
export function restAfterSet(group: Pick<Exercise, 'id' | 'isolation'>[], exerciseId: string): number | null {
  if (group.length > 1 && group[group.length - 1].id !== exerciseId) return null
  return Math.max(...group.map(restSeconds))
}
