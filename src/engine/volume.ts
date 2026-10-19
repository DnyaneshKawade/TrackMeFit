// Weekly sets per muscle against its limits (spec T-082d). Pure function, no
// I/O. Helper muscles count half a set (Pelland 2024).

import { LANDMARKS, type Landmarks, type Muscle } from './training'

export type VolumeBand = 'low' | 'good' | 'high' | 'max'

export interface MuscleVolume {
  muscle: Muscle
  sets: number
  band: VolumeBand
  why: string
}

const fmt = (n: number) => String(Math.round(n * 10) / 10)

/** Where a muscle's weekly sets sit between its lowest useful and highest
 * safe amount, with a plain reason. */
export function volumeBand(sets: number, l: Landmarks): { band: VolumeBand; why: string } {
  if (sets < l.mev) return { band: 'low', why: `Low. Aim for ${l.mev} to ${l.mavHigh} sets.` }
  if (sets >= l.mrv) return { band: 'max', why: `Too many. Keep it under ${l.mrv} sets, or you may not recover.` }
  if (sets > l.mavHigh) return { band: 'high', why: `High. More than ${l.mavHigh} sets is hard to recover from.` }
  return { band: 'good', why: 'Good amount.' }
}

/** Every trained muscle in a week, most sets first. */
export function weeklyVolume(volume: Partial<Record<Muscle, number>>, landmarks: Record<Muscle, Landmarks> = LANDMARKS): MuscleVolume[] {
  return (Object.entries(volume) as [Muscle, number][])
    .filter(([, sets]) => Number.isFinite(sets) && sets > 0)
    .map(([muscle, sets]) => ({ muscle, sets: Number(fmt(sets)), ...volumeBand(sets, landmarks[muscle]) }))
    .sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle))
}
