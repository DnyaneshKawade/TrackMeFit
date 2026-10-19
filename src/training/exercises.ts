// Built-in exercise library. Each exercise names the muscle it mainly trains
// and the ones it also works (counted as half a set by the training engine).
// `increment` is the usual smallest weight jump in an Indian commercial gym.

import type { Muscle } from '../engine/training'
import { MORE_EXERCISES } from './exerciseLibrary'

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'smith' | 'kettlebell'

export interface Exercise {
  id: string
  name: string
  aliases: string[]
  primary: Muscle
  secondary: Muscle[]
  equipment: Equipment
  /** Single-joint movement; trained a little closer to failure. */
  isolation: boolean
  /** Smallest usual weight jump, kg. */
  increment: number
  /** An own exercise removed from the list; past sets still find it (T-043c). */
  hidden?: boolean
}

const INC: Record<Equipment, number> = { barbell: 2.5, smith: 2.5, dumbbell: 2.5, machine: 5, cable: 2.5, bodyweight: 2.5, kettlebell: 4 }

const ex = (
  id: string,
  name: string,
  primary: Muscle,
  secondary: Muscle[],
  equipment: Equipment,
  isolation: boolean,
  aliases: string[] = [],
): Exercise => ({ id, name, aliases, primary, secondary, equipment, isolation, increment: INC[equipment] })

export const EXERCISES: Exercise[] = [
  // Chest
  ex('bench-press', 'Bench press (barbell)', 'chest', ['triceps'], 'barbell', false, ['flat bench', 'bench']),
  ex('incline-bench-press', 'Incline bench press (barbell)', 'chest', ['triceps'], 'barbell', false, ['incline bench']),
  ex('db-bench-press', 'Dumbbell bench press', 'chest', ['triceps'], 'dumbbell', false, ['db press', 'flat db press']),
  ex('incline-db-press', 'Incline dumbbell press', 'chest', ['triceps'], 'dumbbell', false, ['incline db']),
  ex('machine-chest-press', 'Machine chest press', 'chest', ['triceps'], 'machine', false, ['chest press']),
  ex('smith-incline-press', 'Smith machine incline press', 'chest', ['triceps'], 'smith', false),
  ex('dips', 'Dips', 'chest', ['triceps'], 'bodyweight', false, ['chest dips', 'parallel bar dips']),
  ex('push-up', 'Push-up', 'chest', ['triceps'], 'bodyweight', false, ['pushup', 'dand']),
  ex('pec-deck', 'Pec deck', 'chest', [], 'machine', true, ['butterfly', 'machine fly']),
  ex('cable-fly', 'Cable fly', 'chest', [], 'cable', true, ['cable crossover', 'crossover']),
  ex('db-fly', 'Dumbbell fly', 'chest', [], 'dumbbell', true, ['flyes']),
  // Back
  ex('pull-up', 'Pull-up', 'back', ['biceps'], 'bodyweight', false, ['pullup', 'chin up', 'chin-up']),
  ex('lat-pulldown', 'Lat pulldown', 'back', ['biceps'], 'cable', false, ['pulldown', 'lat pull down']),
  ex('close-grip-pulldown', 'Close-grip pulldown', 'back', ['biceps'], 'cable', false, ['v bar pulldown']),
  ex('barbell-row', 'Barbell row', 'back', ['biceps', 'rearDelts'], 'barbell', false, ['bent over row', 'bb row']),
  ex('db-row', 'One-arm dumbbell row', 'back', ['biceps', 'rearDelts'], 'dumbbell', false, ['db row', 'single arm row']),
  ex('seated-cable-row', 'Seated cable row', 'back', ['biceps', 'rearDelts'], 'cable', false, ['cable row', 'seated row']),
  ex('t-bar-row', 'T-bar row', 'back', ['biceps', 'rearDelts'], 'machine', false, ['tbar row']),
  ex('chest-supported-row', 'Chest-supported row (machine)', 'back', ['biceps', 'rearDelts'], 'machine', false, ['machine row']),
  ex('straight-arm-pulldown', 'Straight-arm pulldown', 'back', [], 'cable', true, ['lat pullover', 'pullover']),
  ex('deadlift', 'Deadlift', 'back', ['glutes', 'hamstrings', 'traps'], 'barbell', false, ['conventional deadlift']),
  // Quads
  ex('back-squat', 'Back squat', 'quads', ['glutes'], 'barbell', false, ['squat', 'barbell squat']),
  ex('front-squat', 'Front squat', 'quads', ['glutes'], 'barbell', false),
  ex('hack-squat', 'Hack squat', 'quads', ['glutes'], 'machine', false),
  ex('leg-press', 'Leg press', 'quads', ['glutes'], 'machine', false),
  ex('smith-squat', 'Smith machine squat', 'quads', ['glutes'], 'smith', false),
  ex('goblet-squat', 'Goblet squat', 'quads', ['glutes'], 'dumbbell', false),
  ex('bulgarian-split-squat', 'Bulgarian split squat', 'quads', ['glutes'], 'dumbbell', false, ['split squat', 'bss']),
  ex('walking-lunge', 'Walking lunge', 'quads', ['glutes'], 'dumbbell', false, ['lunges']),
  ex('leg-extension', 'Leg extension', 'quads', [], 'machine', true, ['quad extension']),
  // Hamstrings and glutes
  ex('romanian-deadlift', 'Romanian deadlift', 'hamstrings', ['glutes', 'back'], 'barbell', false, ['rdl']),
  ex('db-rdl', 'Dumbbell Romanian deadlift', 'hamstrings', ['glutes'], 'dumbbell', false, ['db rdl']),
  ex('lying-leg-curl', 'Lying leg curl', 'hamstrings', [], 'machine', true, ['leg curl', 'hamstring curl']),
  ex('seated-leg-curl', 'Seated leg curl', 'hamstrings', [], 'machine', true),
  ex('hip-thrust', 'Hip thrust', 'glutes', ['hamstrings'], 'barbell', false, ['glute bridge']),
  ex('cable-kickback', 'Cable glute kickback', 'glutes', [], 'cable', true, ['kickback']),
  ex('hip-abduction', 'Hip abduction machine', 'glutes', [], 'machine', true, ['abductor']),
  // Shoulders
  ex('overhead-press', 'Overhead press (barbell)', 'sideDelts', ['triceps'], 'barbell', false, ['ohp', 'military press', 'shoulder press']),
  ex('db-shoulder-press', 'Seated dumbbell shoulder press', 'sideDelts', ['triceps'], 'dumbbell', false, ['db shoulder press']),
  ex('machine-shoulder-press', 'Machine shoulder press', 'sideDelts', ['triceps'], 'machine', false),
  ex('lateral-raise', 'Dumbbell lateral raise', 'sideDelts', [], 'dumbbell', true, ['side raise', 'lateral']),
  ex('cable-lateral-raise', 'Cable lateral raise', 'sideDelts', [], 'cable', true),
  ex('machine-lateral-raise', 'Machine lateral raise', 'sideDelts', [], 'machine', true),
  ex('rear-delt-fly', 'Rear delt fly (machine)', 'rearDelts', [], 'machine', true, ['reverse pec deck', 'reverse fly']),
  ex('face-pull', 'Face pull', 'rearDelts', ['traps'], 'cable', true),
  ex('db-rear-delt-raise', 'Bent-over dumbbell rear delt raise', 'rearDelts', [], 'dumbbell', true),
  ex('shrug', 'Dumbbell shrug', 'traps', [], 'dumbbell', true, ['shrugs']),
  // Arms
  ex('barbell-curl', 'Barbell curl', 'biceps', [], 'barbell', true, ['bb curl', 'ez bar curl']),
  ex('db-curl', 'Dumbbell curl', 'biceps', [], 'dumbbell', true, ['bicep curl', 'db curl']),
  ex('hammer-curl', 'Hammer curl', 'biceps', [], 'dumbbell', true),
  ex('preacher-curl', 'Preacher curl', 'biceps', [], 'machine', true, ['scott curl']),
  ex('cable-curl', 'Cable curl', 'biceps', [], 'cable', true),
  ex('incline-db-curl', 'Incline dumbbell curl', 'biceps', [], 'dumbbell', true),
  ex('triceps-pushdown', 'Triceps pushdown', 'triceps', [], 'cable', true, ['pushdown', 'rope pushdown', 'tricep pushdown']),
  ex('overhead-triceps-extension', 'Overhead cable triceps extension', 'triceps', [], 'cable', true, ['overhead extension']),
  ex('skull-crusher', 'Skull crusher', 'triceps', [], 'barbell', true, ['lying triceps extension', 'ez bar extension']),
  ex('close-grip-bench', 'Close-grip bench press', 'triceps', ['chest'], 'barbell', false, ['cgbp']),
  // Calves and abs
  ex('standing-calf-raise', 'Standing calf raise', 'calves', [], 'machine', true, ['calf raise']),
  ex('seated-calf-raise', 'Seated calf raise', 'calves', [], 'machine', true),
  ex('cable-crunch', 'Cable crunch', 'abs', [], 'cable', true, ['kneeling crunch']),
  ex('hanging-leg-raise', 'Hanging leg raise', 'abs', [], 'bodyweight', true, ['leg raise']),
  ex('ab-wheel', 'Ab wheel rollout', 'abs', [], 'bodyweight', true, ['ab roller']),
  ex('plank', 'Plank (seconds as reps)', 'abs', [], 'bodyweight', true),
  // For home and no-equipment plans (T-041a)
  ex('bodyweight-squat', 'Body-weight squat', 'quads', ['glutes'], 'bodyweight', false, ['air squat', 'baithak']),
  ex('reverse-lunge', 'Reverse lunge', 'quads', ['glutes'], 'bodyweight', false),
  ex('inverted-row', 'Inverted row', 'back', ['biceps', 'rearDelts'], 'bodyweight', false, ['table row', 'australian pull-up']),
  ex('glute-bridge', 'Glute bridge', 'glutes', ['hamstrings'], 'bodyweight', false, ['single-leg glute bridge']),
  ex('pike-push-up', 'Pike push-up', 'sideDelts', ['triceps'], 'bodyweight', false),
  ex('db-overhead-extension', 'Dumbbell overhead triceps extension', 'triceps', [], 'dumbbell', true, ['db overhead extension']),
  ex('bench-dip', 'Bench dip', 'triceps', [], 'bodyweight', true, ['chair dip']),
  ex('single-leg-calf-raise', 'Single-leg calf raise', 'calves', [], 'bodyweight', true),
  // More gym exercises (T-081)
  ...MORE_EXERCISES.map(([id, name, p, s, eq, iso, al]) => ex(id, name, p, s, eq, iso, al)),
]

/** Built-in and the person's own exercises by id (T-043b). */
export const exerciseById = new Map(EXERCISES.map((e) => [e.id, e]))

let custom: Exercise[] = []

/** Makes the person's own exercises known everywhere (search, plans, logs). */
export function setCustomExercises(list: Exercise[]) {
  for (const e of custom) exerciseById.delete(e.id)
  custom = list
  for (const e of list) exerciseById.set(e.id, e)
}

/** The person's own exercises first, then the built-in library. Hidden ones are left out. */
export const allExercises = () => (custom.length ? [...custom.filter((e) => !e.hidden), ...EXERCISES] : EXERCISES)

/** The person's own exercises, hidden ones included. */
export const customExercises = () => custom

export const EQUIPMENT_NAMES: Record<Equipment, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  cable: 'Cable',
  bodyweight: 'Body weight',
  smith: 'Smith machine',
  kettlebell: 'Kettlebell',
}

export interface NewExercise {
  name: string
  primary: Muscle
  equipment: Equipment
  isolation: boolean
  hidden?: boolean
}

export const MAX_EXERCISE_NAME = 80

/** An own exercise with the usual weight jump for its equipment. */
export const customExercise = (id: string, e: NewExercise): Exercise => ({
  id,
  name: e.name,
  aliases: [],
  primary: e.primary,
  secondary: [],
  equipment: e.equipment,
  isolation: e.isolation,
  increment: INC[e.equipment],
  ...(e.hidden ? { hidden: true } : {}),
})

/** Why a new or edited exercise can't be saved, or null when it can.
 * `ownId` is the exercise being edited, which may keep its own name. */
export function checkNewExercise(name: string, list: Exercise[] = allExercises(), ownId?: string): string | null {
  const n = name.trim()
  if (!n) return 'Give the exercise a name.'
  if (n.length > MAX_EXERCISE_NAME) return `Use up to ${MAX_EXERCISE_NAME} letters.`
  const same = list.find((e) => e.id !== ownId && norm(e.name) === norm(n))
  return same ? `${same.name} is already in the list.` : null
}

export const MUSCLE_NAMES: Record<Muscle, string> = {
  chest: 'Chest', back: 'Back', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes', sideDelts: 'Side delts',
  rearDelts: 'Rear delts', biceps: 'Biceps', triceps: 'Triceps', calves: 'Calves', abs: 'Abs', traps: 'Traps',
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** Name, alias or muscle search; every word must match the start of a word. */
export function searchExercises(query: string, list = allExercises()): Exercise[] {
  const tokens = norm(query).split(' ').filter(Boolean)
  if (!tokens.length) return list
  return list.filter((e) => {
    const words = norm([e.name, ...e.aliases, MUSCLE_NAMES[e.primary]].join(' ')).split(' ')
    return tokens.every((t) => words.some((w) => w.startsWith(t)))
  })
}
