// "Suggest a plan" (spec T-041a): a plan made from the onboarding answers,
// shown with its reasons. "Use this plan" opens it in the plan editor, so
// nothing is saved until the person saves it there.

import { useMemo, useState } from 'react'
import type { Experience } from '../engine/training'
import { exerciseById } from './exercises'
import { suggestPlan, type StarterChoices, type Where } from './starterPlan'
import type { Plan } from './types'

/** The onboarding answers this uses; any of them may be missing. */
export interface TrainingAnswers {
  trainingDays: number | null
  experience: Experience | null
  equipment: Where | null
}

const DAYS: [number, string][] = [2, 3, 4, 5, 6].map((n) => [n, String(n)])
const EXPERIENCE: [Experience, string][] = [
  ['beginner', 'New, or under a year'],
  ['intermediate', '1 to 3 years'],
  ['advanced', 'More than 3 years'],
]
const WHERE: [Where, string][] = [
  ['gym', 'A gym'],
  ['home', 'Home, with dumbbells'],
  ['none', 'No equipment'],
]

function Choice<T extends string | number>({ label, options, value, onChange }: { label: string; options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="choice" role="group" aria-label={label}>
      <span>{label}</span>
      {options.map(([v, text]) => (
        <button key={String(v)} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  )
}

export function SuggestPlan({ answers, onUse, onClose }: { answers?: TrainingAnswers; onUse: (plan: Plan) => void; onClose: () => void }) {
  const asked = answers?.trainingDays ?? 3
  // An answer of 0, 1 or 7 shows as the nearest choice; the plan says why.
  const start = Math.min(6, Math.max(2, asked))
  const [choices, setChoices] = useState<StarterChoices>({
    days: start,
    experience: answers?.experience ?? 'beginner',
    where: answers?.equipment ?? 'gym',
  })
  const { plan, reasons } = useMemo(() => suggestPlan({ ...choices, days: choices.days === start ? asked : choices.days }), [choices, start, asked])

  return (
    <section className="sheet suggest-plan" aria-label="Suggested plan">
      <header className="sheet-head">
        <h2>Suggested plan</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      <p className="muted">Made from your answers. Change them to see a different plan.</p>
      <Choice label="Workouts a week" options={DAYS} value={choices.days} onChange={(days) => setChoices({ ...choices, days })} />
      <Choice label="Lifting experience" options={EXPERIENCE} value={choices.experience} onChange={(experience) => setChoices({ ...choices, experience })} />
      <Choice label="Where you train" options={WHERE} value={choices.where} onChange={(where) => setChoices({ ...choices, where })} />

      <h3>{plan.name}</h3>
      <ul className="reasons">
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {plan.days.map((d) => (
        <section key={d.dayIndex} aria-label={d.name} className="suggest-day">
          <h4>{d.name}</h4>
          <ul className="session-list">
            {d.exercises.map((e) => (
              <li key={e.exerciseId}>
                {exerciseById.get(e.exerciseId)?.name} <span className="muted">· {e.sets} × {e.repMin}–{e.repMax}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <button className="primary" onClick={() => onUse(plan)}>Use this plan</button>
      <p className="muted">It opens in the plan editor. Nothing is saved until you save it there.</p>
    </section>
  )
}
