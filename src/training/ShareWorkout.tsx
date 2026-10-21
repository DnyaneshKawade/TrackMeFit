// Share a workout as text, such as on WhatsApp (spec T-121). Uses the phone's
// share sheet when there is one, or copies the text instead.

import { useState } from 'react'
import { workoutText, type ShareExercise } from '../engine/shareText'
import type { WeightUnit } from '../engine/units'
import { useWeightUnit } from '../settings/units'
import { cardioById } from './cardio'
import { exerciseById } from './exercises'
import type { Session } from './types'

const info = (id: string): ShareExercise | null => {
  const c = cardioById.get(id)
  if (c) return { name: c.name, cardio: true }
  const e = exerciseById.get(id)
  return e ? { name: e.name, assisted: e.assisted } : null
}

/** One button. `load` gives the workout when tapped, so lists read nothing early. */
export function ShareWorkout({ load, label = 'Share workout', ariaLabel }: { load: () => Promise<Session | undefined>; label?: string; ariaLabel?: string }) {
  const unit: WeightUnit = useWeightUnit()
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const share = async () => {
    setBusy(true)
    setNote(null)
    try {
      const session = await load()
      if (!session) throw new Error('missing')
      const text = workoutText(session, info, unit)
      if (navigator.share) {
        try {
          await navigator.share({ text })
          return
        } catch (err) {
          // Closing the share sheet is not a problem.
          if (err instanceof DOMException && err.name === 'AbortError') return
        }
      }
      await navigator.clipboard.writeText(text)
      setNote('Copied. Paste it in WhatsApp or any chat.')
    } catch {
      setNote('Couldn’t share it. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="share-workout">
      <button className="link" disabled={busy} aria-label={ariaLabel} onClick={() => void share()}>{label}</button>
      {note && <small className="muted" role="status">{note}</small>}
    </span>
  )
}
