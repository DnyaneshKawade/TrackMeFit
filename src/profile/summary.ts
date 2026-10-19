// The signup answers as rows, one list per signup step (spec T-084).

import { NONVEG_OFF_DAYS, NO_ONION_GARLIC } from './dietRules'
import { ACTIVITY, DIETS, EQUIPMENT, EXPERIENCE, GOALS } from './labels'
import { ALLERGIES, FASTING, ageOn, questionsFor, type ProfileInfo } from './types'

const fmt = (n: number) => n.toLocaleString('en-IN')
const nameOf = <T,>(list: [T, string][], v: T | null) => list.find(([k]) => k === v)?.[1] ?? null
const namesOf = (list: [string, string][], vs: string[]) => vs.flatMap((v) => list.find(([k]) => k === v)?.[1] ?? [])

export type Row = [label: string, value: string | null]

/** The rows for each signup step, in step order. A missing answer reads "Not given".
 * `healthShared` is false when a coach looks and the client keeps health answers private (T-096). */
export function summaryRows(p: ProfileInfo, weightKg: number | null, today: string, healthShared = true): Row[][] {
  const health = questionsFor(p.sex).filter((q) => p.medical[q.key]).map((q) => q.label)
  const days = NONVEG_OFF_DAYS.filter(([k]) => p.foodRules.includes(k)).map(([, v]) => v)
  const pace = p.goalRate ? `${fmt(Math.abs(Math.round(p.goalRate * 1000) / 10))}% of your weight a week` : null
  return [
    [
      ['Name', p.fullName || null],
      ['Sex', p.sex === 'male' ? 'Male' : p.sex === 'female' ? 'Female' : null],
      ['Age', p.birthDate ? `${ageOn(p.birthDate, today)} years` : null],
      ['Height', p.heightCm ? `${fmt(p.heightCm)} cm` : null],
      ['Weight', weightKg ? `${fmt(weightKg)} kg` : null],
    ],
    healthShared
      ? [['Health', health.length ? health.join(', ') : 'Nothing ticked'], ...(p.otherHealth.trim() ? [['Other', p.otherHealth.trim()] as Row] : [])]
      : [['Health', 'Not shared']],
    [
      ['Normal day', nameOf(ACTIVITY, p.activity)],
      ['Workouts a week', p.trainingDays === null ? null : String(p.trainingDays)],
      ['Lifting experience', nameOf(EXPERIENCE, p.experience)],
      ['Where you train', nameOf(EQUIPMENT, p.equipment)],
    ],
    [
      ['Goal', nameOf(GOALS, p.goal)],
      ['Pace', pace],
      ['Target weight', p.targetWeightKg ? `${fmt(p.targetWeightKg)} kg` : null],
      ...(p.eventDate ? [['Date to be ready', p.eventDate] as Row] : []),
    ],
    [
      ['Diet', nameOf(DIETS, p.dietPref)],
      ...(p.foodRules.includes(NO_ONION_GARLIC) ? [['Food rule', 'No onion or garlic'] as Row] : []),
      ...(days.length ? [['Veg days', days.join(', ')] as Row] : []),
      ['Fasting', namesOf(FASTING, p.fasting).join(', ') || 'None'],
      ['Allergies', namesOf(ALLERGIES, p.allergies).join(', ') || 'None'],
    ],
    [['Usual day', p.currentDiet ? `About ${fmt(p.currentDiet.kcal)} kcal and ${fmt(p.currentDiet.proteinG)} g protein` : null]],
  ]
}

