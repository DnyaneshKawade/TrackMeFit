// A workout as plain text to share, such as on WhatsApp (spec T-121).
// Pure: names come from the caller. Notes stay out, since they can be private.

import { cardioText } from './cardio'
import { myoText } from './myo'
import { weightText, type WeightUnit } from './units'

export interface ShareSet {
  exerciseId: string
  setIndex: number
  weightKg: number
  reps: number
  rir: number | null
  tag?: string
  miniReps?: number[]
  seconds?: number
  distanceKm?: number
}

export interface ShareExercise {
  name: string
  cardio?: boolean
  /** Assisted machines: the weight is help, not load. */
  assisted?: boolean
}

const TAG_TEXT: Record<string, string> = { warmup: 'warm-up', drop: 'drop set', failure: 'to failure' }

function setLine(s: ShareSet, e: ShareExercise, unit: WeightUnit): string {
  if (e.cardio) return cardioText(s)
  const myo = myoText(s)
  const parts = [`${weightText(s.weightKg, unit)}${e.assisted ? ' help' : ''} × ${s.reps}`]
  if (myo) parts.push(`myo-reps (${myo})`)
  else if (s.tag && TAG_TEXT[s.tag]) parts.push(TAG_TEXT[s.tag])
  if (s.rir !== null) parts.push(`${s.rir} reps left`)
  return parts.join(' · ')
}

/** "Push day · 21 Oct 2026", then each exercise with its sets in order.
 * Exercises keep the order they were first logged in. Unknown ones are left out. */
export function workoutText(
  w: { name: string; performedOn: string; sets: ShareSet[] },
  info: (id: string) => ShareExercise | null,
  unit: WeightUnit = 'kg',
): string {
  const byExercise = new Map<string, ShareSet[]>()
  for (const s of w.sets) {
    const list = byExercise.get(s.exerciseId)
    if (list) list.push(s)
    else byExercise.set(s.exerciseId, [s])
  }
  const date = new Date(w.performedOn + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const lines = [`${w.name} · ${date}`]
  let sets = 0
  for (const [id, list] of byExercise) {
    const e = info(id)
    if (!e) continue
    lines.push('', e.name)
    ;[...list].sort((a, b) => a.setIndex - b.setIndex).forEach((s, i) => lines.push(`${i + 1}. ${setLine(s, e, unit)}`))
    if (!e.cardio) sets += list.filter((s) => s.tag !== 'warmup').length
  }
  if (lines.length === 1) lines.push('', 'No sets logged.')
  else if (sets) lines.push('', `${sets} working ${sets === 1 ? 'set' : 'sets'}.`)
  lines.push('Logged with Track Me Fit')
  return lines.join('\n')
}
