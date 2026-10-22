// Muscle priority in a plan: Grow more, Grow or Keep (T-082h).

import type { Muscle, Priority } from '../engine/training'

/** Only "Grow more" and "Keep" are saved; "Grow" is the default. */
export function plainPriorities(p: Partial<Record<Muscle, Priority>> | undefined): Partial<Record<Muscle, Priority>> {
  const out: Partial<Record<Muscle, Priority>> = {}
  for (const [m, v] of Object.entries(p ?? {}) as [Muscle, Priority][]) if (v === 'more' || v === 'keep') out[m] = v
  return out
}

/** The plan with one muscle's priority changed. */
export function withPriority<T extends { priorities?: Partial<Record<Muscle, Priority>> }>(plan: T, muscle: Muscle, priority: Priority): T {
  const priorities = plainPriorities({ ...plan.priorities, [muscle]: priority })
  const { priorities: _old, ...rest } = plan
  void _old
  return (Object.keys(priorities).length ? { ...rest, priorities } : rest) as T
}
