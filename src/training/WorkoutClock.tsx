// The workout clock and the keep-the-screen-on switch (spec T-116).

import { useEffect, useState } from 'react'
import { durationText } from '../engine/cardio'
import { markStart, readKeepAwake, readStart, useElapsed, useWakeLock, writeKeepAwake } from './workoutClock'

/** `setCount` is the sets logged so far; `startedEmpty` is true when this
 * view opened before any set, so the first set here starts the clock. */
export function WorkoutClock({ sessionId, setCount, startedEmpty }: { sessionId: string; setCount: number; startedEmpty: boolean }) {
  const [start, setStart] = useState(() => readStart(sessionId))
  const [awake, setAwake] = useState(readKeepAwake)
  const canKeepOn = useWakeLock(awake)
  useEffect(() => {
    if (start === null && startedEmpty && setCount > 0) setStart(markStart(sessionId, Date.now()))
  }, [start, startedEmpty, setCount, sessionId])
  const elapsed = useElapsed(start)
  if (elapsed === null && !canKeepOn) return null
  return (
    <p className="muted workout-clock">
      {elapsed !== null && (
        <span role="timer" aria-label="Workout time">
          ⏱ {durationText(elapsed)}
        </span>
      )}
      {canKeepOn && (
        <button
          className="link"
          aria-pressed={awake}
          onClick={() => {
            writeKeepAwake(!awake)
            setAwake(!awake)
          }}
        >
          {awake ? 'Screen stays on' : 'Keep the screen on'}
        </button>
      )}
    </p>
  )
}
