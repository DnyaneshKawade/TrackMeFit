// A suggested workout plan from the onboarding answers (spec T-041a): a
// split from workouts a week, exercises the person's equipment allows, and
// low starting sets that the weekly review raises. Pure function, no I/O.
// Nothing is saved: the person edits and saves it like any plan.

import { distributeSets, startingSets, type Experience, type Muscle } from '../engine/training'
import { exerciseById, type Equipment as Kit } from './exercises'
import type { Plan, PlanDay } from './types'

export type Where = 'gym' | 'home' | 'none'

export interface StarterChoices {
  days: number
  experience: Experience
  where: Where
}

export interface StarterPlan {
  plan: Plan
  reasons: string[]
}

const KIT: Record<Where, Set<Kit> | null> = {
  gym: null,
  home: new Set<Kit>(['dumbbell', 'bodyweight', 'kettlebell']),
  none: new Set<Kit>(['bodyweight']),
}

/** Exercises for each slot, best first; the person's equipment filters them. */
const SLOTS = {
  chest: ['bench-press', 'incline-db-press', 'db-bench-press', 'machine-chest-press', 'push-up', 'dips'],
  chestFly: ['cable-fly', 'pec-deck', 'db-fly'],
  pulldown: ['lat-pulldown', 'pull-up', 'close-grip-pulldown'],
  row: ['seated-cable-row', 'db-row', 'chest-supported-row', 'barbell-row', 'inverted-row'],
  squat: ['back-squat', 'leg-press', 'hack-squat', 'goblet-squat', 'bulgarian-split-squat', 'bodyweight-squat', 'reverse-lunge'],
  quadIso: ['leg-extension', 'walking-lunge', 'reverse-lunge'],
  hinge: ['romanian-deadlift', 'db-rdl', 'glute-bridge'],
  legCurl: ['lying-leg-curl', 'seated-leg-curl'],
  press: ['overhead-press', 'db-shoulder-press', 'machine-shoulder-press', 'pike-push-up'],
  lateral: ['lateral-raise', 'cable-lateral-raise', 'machine-lateral-raise'],
  rearDelt: ['face-pull', 'rear-delt-fly', 'db-rear-delt-raise'],
  biceps: ['db-curl', 'cable-curl', 'hammer-curl', 'barbell-curl'],
  triceps: ['triceps-pushdown', 'overhead-triceps-extension', 'db-overhead-extension', 'bench-dip'],
  calves: ['standing-calf-raise', 'seated-calf-raise', 'single-leg-calf-raise'],
  abs: ['cable-crunch', 'hanging-leg-raise', 'ab-wheel'],
} satisfies Record<string, string[]>

type Slot = keyof typeof SLOTS
/** A slot and which choice to use: 0 for the "A" day, 1 for the "B" day. */
type Pick = [Slot, 0 | 1]

const DAY: Record<string, Pick[]> = {
  'Full body A': [['squat', 0], ['chest', 0], ['row', 0], ['hinge', 0], ['lateral', 0], ['biceps', 0]],
  'Full body B': [['squat', 1], ['chest', 1], ['pulldown', 0], ['legCurl', 0], ['press', 0], ['triceps', 0]],
  'Upper A': [['chest', 0], ['row', 0], ['press', 0], ['pulldown', 0], ['biceps', 0], ['triceps', 0]],
  'Upper B': [['chest', 1], ['pulldown', 1], ['row', 1], ['lateral', 0], ['rearDelt', 0], ['biceps', 1]],
  'Lower A': [['squat', 0], ['hinge', 0], ['quadIso', 0], ['legCurl', 0], ['calves', 0], ['abs', 0]],
  'Lower B': [['squat', 1], ['hinge', 1], ['quadIso', 1], ['legCurl', 1], ['calves', 1], ['abs', 1]],
  'Push A': [['chest', 0], ['press', 0], ['chest', 1], ['lateral', 0], ['triceps', 0], ['chestFly', 0]],
  'Push B': [['chest', 1], ['press', 1], ['chestFly', 1], ['lateral', 1], ['triceps', 1]],
  'Pull A': [['pulldown', 0], ['row', 0], ['row', 1], ['rearDelt', 0], ['biceps', 0], ['biceps', 1]],
  'Pull B': [['pulldown', 1], ['row', 1], ['rearDelt', 1], ['biceps', 1], ['abs', 0]],
}

/** Each day: the template to use and the name the person sees. */
const SPLITS: Record<number, { name: string; days: [string, string][]; why: string }> = {
  2: { name: 'Full body, 2 days a week', days: [['Full body A', 'Full body A'], ['Full body B', 'Full body B']], why: 'With 2 workouts a week, each one trains the whole body.' },
  3: {
    name: 'Full body, 3 days a week',
    days: [['Full body A', 'Full body A'], ['Full body B', 'Full body B'], ['Full body A', 'Full body A again']],
    why: 'With 3 workouts a week, each one trains the whole body.',
  },
  4: {
    name: 'Upper and lower, 4 days a week',
    days: [['Upper A', 'Upper A'], ['Lower A', 'Lower A'], ['Upper B', 'Upper B'], ['Lower B', 'Lower B']],
    why: 'With 4 workouts a week, upper body and lower body take turns.',
  },
  5: {
    name: 'Upper, lower, push, pull, legs',
    days: [['Upper A', 'Upper'], ['Lower A', 'Lower'], ['Push A', 'Push'], ['Pull A', 'Pull'], ['Lower B', 'Legs']],
    why: 'The 5 days are upper, lower, push, pull and legs.',
  },
  6: {
    name: 'Push, pull, legs, 6 days a week',
    days: [['Push A', 'Push A'], ['Pull A', 'Pull A'], ['Lower A', 'Legs A'], ['Push B', 'Push B'], ['Pull B', 'Pull B'], ['Lower B', 'Legs B']],
    why: 'With 6 workouts a week, you do push, pull and legs twice.',
  },
}

/** Each exercise gets 2 to 4 sets: fewer is too little, more goes in another exercise. */
const MIN_SETS = 2

const NEED_BAR = new Set(['pull-up', 'dips', 'hanging-leg-raise'])
const MAX_SETS = 4

export function suggestPlan(c: StarterChoices): StarterPlan {
  const reasons: string[] = []
  let days = c.days
  if (days < 2) {
    days = 2
    reasons.push('This plan has 2 workouts a week. That is the fewest that build muscle.')
  } else if (days > 6) {
    days = 6
    reasons.push('This plan has 6 workouts a week. One rest day helps you recover.')
  }
  const split = SPLITS[days]
  reasons.push(split.why, 'Each muscle gets trained about twice a week.')

  const kit = KIT[c.where]
  const allowed = (id: string) => {
    const e = exerciseById.get(id)
    return !!e && (!kit || kit.has(e.equipment))
  }

  // Pick exercises: the A or B choice, skipping ones already in the day.
  const picked = split.days.map(([d]) => {
    const used = new Set<string>()
    for (const [slot, variant] of DAY[d]) {
      const options = SLOTS[slot].filter(allowed)
      const id = [options[variant], ...options].find((x) => x && !used.has(x))
      if (id) used.add(id)
    }
    return [...used]
  })

  // Weekly sets per muscle, spread over the exercises that train it. A muscle
  // with one exercise a week gets half, as if it were trained twice.
  const slotsOf = new Map<Muscle, number>()
  for (const ids of picked)
    for (const id of ids) {
      const m = exerciseById.get(id)!.primary
      slotsOf.set(m, (slotsOf.get(m) ?? 0) + 1)
    }
  const setsLeft = new Map<Muscle, number[]>()
  for (const [m, n] of slotsOf) setsLeft.set(m, distributeSets(startingSets(m, c.experience), Math.max(n, 2)))

  const beginner = c.experience === 'beginner'
  const planDays: PlanDay[] = picked.map((ids, i) => ({
    dayIndex: i,
    name: split.days[i][1],
    exercises: ids.map((id) => {
      const e = exerciseById.get(id)!
      const sets = Math.min(MAX_SETS, Math.max(MIN_SETS, setsLeft.get(e.primary)!.shift() ?? MIN_SETS))
      const [repMin, repMax] = e.isolation ? [10, 15] : beginner ? [8, 12] : [6, 10]
      return { exerciseId: id, sets, repMin, repMax }
    }),
  }))

  reasons.push(
    beginner ? 'You are new to lifting, so sets start low. The weekly review adds sets when you recover well.' : 'Sets start low. The weekly review adds sets when you recover well.',
  )
  if (c.where === 'home') reasons.push('It uses dumbbells and body weight, for training at home.')
  if (c.where === 'none') reasons.push('It uses body weight only.')
  if (c.where !== 'gym' && picked.some((ids) => ids.some((id) => NEED_BAR.has(id)))) reasons.push('Some exercises need a bar, like pull-ups. Swap them if you have none.')
  reasons.push('Change any exercise, set or day before you save.')

  return { plan: { name: split.name, days: planDays, hardWeeks: 4 }, reasons }
}
