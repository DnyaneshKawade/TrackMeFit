// Myo-reps (spec T-111): a start set, then short mini-sets, saved as one set
// with the total reps. Kept apart from the records engine so the logger can
// use it without loading that. Pure functions.

export interface MyoSet {
  reps: number
  tag?: string
  /** The mini-sets after the start set; `reps` is the total. */
  miniReps?: number[]
}

/** A myo-reps set as its start set, so totals don't inflate records and
 * progress (T-111). Other sets are unchanged. */
export function startOf<T extends MyoSet>(s: T): T {
  if (s.tag !== 'myo' || !s.miniReps?.length) return s
  return { ...s, reps: Math.max(0, s.reps - s.miniReps.reduce((a, b) => a + b, 0)) }
}

/** "15 + 5 + 4" for a myo-reps set, or null for other sets (T-111). */
export function myoText(s: MyoSet): string | null {
  return s.tag === 'myo' && s.miniReps?.length ? [startOf(s).reps, ...s.miniReps].join(' + ') : null
}

