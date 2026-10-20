// The workout clock (spec T-116).

import { useEffect, useState } from 'react'
import { durationText } from '../engine/cardio'
import { markStart, readStart, useElapsed } from './workoutClock'

/** `setCount` is the sets logged so far; `startedEmpty` is true when this
 * view opened before any set, so the first set here starts the clock. */
export function WorkoutClock({ sessionId, setCount, startedEmpty }: { sessionId: string; setCount: number; startedEmpty: boolean }) {
  const [start, setStart] = useState(() => readStart(sessionId))
  useEffect(() => {
    if (start === null && startedEmpty && setCount > 0) setStart(markStart(sessionId, Date.now()))
  }, [start, startedEmpty, setCount, sessionId])
  const elapsed = useElapsed(start)
  if (elapsed === null) return null
  return (
    <p className="muted workout-clock" role="timer" aria-label="Workout time">
      ⏱ {durationText(elapsed)}
    </p>
  )
}
