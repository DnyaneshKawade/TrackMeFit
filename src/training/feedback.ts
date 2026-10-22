// Saved answers about each muscle, joined into the latest per muscle (T-082g).
// Kept apart from the review so the stores load without the exercise list.

import { toRecovery, type Effort, type Muscle, type Pump, type Recovery } from '../engine/training'

/** Answers for one muscle. After a workout: effort, pain and pump. At the
 * muscle's first set next time: how it healed (T-082g). */
export interface Feedback {
  muscle: Muscle
  recovery?: Recovery
  effort?: Effort
  pain: boolean
  pump?: Pump
  /** The exercises that hurt (T-108). Older answers only have `pain`. */
  hurt?: string[]
  /** Times "still sore" was answered in the period read. */
  stillSoreTimes?: number
}

/** A saved answer row, oldest first; recovery may hold an old value. */
export interface FeedbackRow {
  muscle: Muscle
  recovery?: string | null
  effort?: Effort | null
  pain: boolean
  pump?: Pump | null
  hurt?: string[]
}

/** The latest answers per muscle from saved rows, oldest first: the latest
 * after-workout answers, and the latest "how it healed" answer. */
export function latestFeedback(rows: FeedbackRow[]): Feedback[] {
  const out = new Map<Muscle, Feedback>()
  for (const r of rows) {
    const f: Feedback = out.get(r.muscle) ?? { muscle: r.muscle, pain: false }
    const recovery = toRecovery(r.recovery)
    if (recovery) {
      f.recovery = recovery
      if (recovery === 'stillSore') f.stillSoreTimes = (f.stillSoreTimes ?? 0) + 1
    }
    if (r.effort) {
      f.effort = r.effort
      f.pain = r.pain
      if (r.pump) f.pump = r.pump
      else delete f.pump
      if (r.hurt?.length) f.hurt = r.hurt
      else delete f.hurt
    }
    out.set(r.muscle, f)
  }
  return [...out.values()]
}
