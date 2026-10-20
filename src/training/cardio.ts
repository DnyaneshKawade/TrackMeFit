// Cardio machines and outdoor moves (spec T-114). They are kept apart from
// the strength list, so they never count as sets for a muscle.

export interface CardioExercise {
  id: string
  name: string
  /** Covers ground, so a distance can be logged with the time. */
  distance: boolean
}

export const CARDIO: CardioExercise[] = [
  { id: 'cardio-treadmill', name: 'Treadmill', distance: true },
  { id: 'cardio-walk', name: 'Walk', distance: true },
  { id: 'cardio-run', name: 'Run', distance: true },
  { id: 'cardio-cycle', name: 'Exercise bike', distance: true },
  { id: 'cardio-cycle-road', name: 'Cycling outdoors', distance: true },
  { id: 'cardio-rower', name: 'Rowing machine', distance: true },
  { id: 'cardio-elliptical', name: 'Cross trainer', distance: true },
  { id: 'cardio-swim', name: 'Swimming', distance: true },
  { id: 'cardio-stairs', name: 'Stair climber', distance: false },
  { id: 'cardio-skipping', name: 'Skipping rope', distance: false },
]

export const cardioById: ReadonlyMap<string, CardioExercise> = new Map(CARDIO.map((c) => [c.id, c]))
