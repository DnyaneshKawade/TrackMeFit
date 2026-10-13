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
