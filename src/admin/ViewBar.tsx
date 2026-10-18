// The bar on top during a view (spec T-042a4). It ends the view on Exit or
// after 30 minutes with no tap or key press.

import { useEffect, useRef } from 'react'
import { isIdle, type Viewing, type ViewMarker } from './viewing'
import './viewBar.css'

/** How often the bar checks for 30 idle minutes, and saves activity. */
const TICK_MS = 30_000

export function ViewBar({
  viewing,
  marker,
  onEnd,
  now = Date.now,
}: {
  viewing: Viewing
  marker: ViewMarker
  /** Called once the view has ended; `idle` when it ran out. */
  onEnd: (idle: boolean) => void
  now?: () => number
}) {
  const last = useRef(marker.lastActive)
  const saved = useRef(marker.lastActive)
  const ending = useRef(false)
  const exitRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    const end = (idle: boolean) => {
      if (ending.current) return
      ending.current = true
      void viewing.exit(idle ? last.current : undefined).finally(() => onEnd(idle))
    }
    const check = () => {
      if (isIdle({ ...marker, lastActive: last.current }, now())) end(true)
    }
    const active = () => {
      last.current = now()
      // Saved at most every 30 seconds, so a reload knows too.
      if (last.current - saved.current >= TICK_MS) {
        saved.current = last.current
        viewing.touch(last.current)
      }
    }
    check()
    const timer = setInterval(check, TICK_MS)
    window.addEventListener('pointerdown', active)
    window.addEventListener('keydown', active)
    exitRef.current = () => end(false)
    return () => {
      clearInterval(timer)
      window.removeEventListener('pointerdown', active)
      window.removeEventListener('keydown', active)
    }
  }, [viewing, marker, onEnd, now])

  return (
    <div className="view-bar" role="status" aria-label="Viewing as">
      <span>
        Viewing as <strong>{marker.name}</strong>. Changes are saved as them.
      </span>
      <button onClick={() => exitRef.current()}>Exit</button>
    </div>
  )
}
