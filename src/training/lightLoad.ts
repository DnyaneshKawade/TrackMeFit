// The person's light-week choice (spec T-082n): week-1 weights, or the same
// weight with 3 reps left. A per-device setting; storage may be off.

import type { LightLoad } from '../engine/training'

const KEY = 'tmf:light-load'

export function readLightLoad(): LightLoad {
  try {
    return localStorage.getItem(KEY) === 'same' ? 'same' : 'week1'
  } catch {
    return 'week1'
  }
}

export function saveLightLoad(load: LightLoad): void {
  try {
    localStorage.setItem(KEY, load)
  } catch {
    // Kept for this workout only.
  }
}
