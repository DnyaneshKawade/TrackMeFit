import { useState } from 'react'
import { ConfirmDelete } from '../ui/ConfirmDelete'
import { weeklyVolume } from '../engine/volume'
import { exerciseById, MUSCLE_NAMES } from './exercises'
import { weeklySets } from './progression'
import { withPriority } from './priority'
import type { Muscle, Priority } from '../engine/training'
import { ExercisePicker, type ExerciseLibrary } from './ExercisePicker'
import { checkPlan, MAX_DAYS, nextDayIndex, type Plan, type PlanExercise } from './types'

const num = (s: string) => (s.trim() === '' ? NaN : Number(s))

export function PlanEditor({
  initial,
  onSave,
  onDelete,
  onClose,
  library,
}: {
  initial: Plan
  onSave: (p: Plan) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
  library?: ExerciseLibrary
}) {
  const [plan, setPlan] = useState<Plan>(initial)
  const [picking, setPicking] = useState<number | null>(null)
  const [problems, setProblems] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const setDay = (i: number, f: (d: Plan['days'][number]) => Plan['days'][number]) =>
    setPlan((p) => ({ ...p, days: p.days.map((d, j) => (j === i ? f(d) : d)) }))
  const setEx = (i: number, k: number, patch: Partial<PlanExercise>) =>
    setDay(i, (d) => ({ ...d, exercises: d.exercises.map((e, j) => (j === k ? { ...e, ...patch } : e)) }))

  if (picking !== null) {
    return (
      <ExercisePicker
        library={library}
        onClose={() => setPicking(null)}
        onPick={(e) => {
          setDay(picking, (d) => ({ ...d, exercises: [...d.exercises, { exerciseId: e.id, sets: 3, repMin: e.isolation ? 10 : 6, repMax: e.isolation ? 15 : 10 }] }))
          setPicking(null)
        }}
      />
    )
  }

  const save = async () => {
    const found = checkPlan(plan)
    setProblems(found)
    if (found.length) return
    setBusy(true)
    try {
      await onSave(plan)
    } catch {
      setProblems(['Couldn’t save. Check your connection and try again.'])
      setBusy(false)
    }
  }

  return (
    <section className="plan-editor" aria-label="Edit plan">
      <header className="sheet-head">
        <h2>{initial.id ? 'Edit plan' : 'New plan'}</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      <label className="field">
        <span>Plan name</span>
        <input value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })} placeholder="e.g. Push Pull Legs" />
      </label>

      {plan.days.map((d, i) => (
        <fieldset key={d.id ?? `new-${d.dayIndex}`} className="plan-day">
          <legend className="sr-only">Day {i + 1}</legend>
          <div className="row">
            <input aria-label={`Day ${i + 1} name`} value={d.name} onChange={(e) => setDay(i, (x) => ({ ...x, name: e.target.value }))} placeholder={`Day ${i + 1}, e.g. Push`} />
            <button className="link" onClick={() => setPlan({ ...plan, days: plan.days.filter((_, j) => j !== i) })}>Remove day</button>
          </div>
          {d.exercises.map((e, k) => {
            const name = exerciseById.get(e.exerciseId)?.name ?? e.exerciseId
            return (
              <div key={k} className="plan-ex">
                <span className="plan-ex-name">{name}</span>
                <label>
                  <span className="muted">Sets</span>
                  <input aria-label={`${name} sets`} inputMode="numeric" value={Number.isNaN(e.sets) ? '' : e.sets} onChange={(ev) => setEx(i, k, { sets: num(ev.target.value) })} />
                </label>
                <label>
                  <span className="muted">Reps</span>
                  <span className="reps">
                    <input aria-label={`${name} lowest reps`} inputMode="numeric" value={Number.isNaN(e.repMin) ? '' : e.repMin} onChange={(ev) => setEx(i, k, { repMin: num(ev.target.value) })} />
                    –
                    <input aria-label={`${name} highest reps`} inputMode="numeric" value={Number.isNaN(e.repMax) ? '' : e.repMax} onChange={(ev) => setEx(i, k, { repMax: num(ev.target.value) })} />
                  </span>
                </label>
                <button className="link" aria-label={`Remove ${name}`} onClick={() => setDay(i, (x) => ({ ...x, exercises: x.exercises.filter((_, j) => j !== k) }))}>✕</button>
                {k < d.exercises.length - 1 && (
                  <button className="chip superset-link" aria-label={`Superset ${name} with the next exercise`} aria-pressed={!!e.supersetNext} onClick={() => setEx(i, k, { supersetNext: !e.supersetNext })}>
                    {e.supersetNext ? `Superset with ${exerciseById.get(d.exercises[k + 1].exerciseId)?.name ?? 'next'}` : 'Superset with next'}
                  </button>
                )}
              </div>
            )
          })}
          <button className="add" onClick={() => setPicking(i)}>+ Add exercise</button>
        </fieldset>
      ))}

      {plan.days.length < MAX_DAYS && (
        <button className="add" onClick={() => setPlan({ ...plan, days: [...plan.days, { dayIndex: nextDayIndex(plan.days), name: '', exercises: [] }] })}>
          + Add day
        </button>
      )}

      <WeeklySets plan={plan} />
      <MuscleFocus plan={plan} onChange={(m, p) => setPlan((x) => withPriority(x, m, p))} />

      {problems.length > 0 && (
        <ul className="error" role="alert">
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      <button className="primary" disabled={busy} onClick={save}>Save plan</button>
      {onDelete && <ConfirmDelete danger label="Delete plan" question="Delete this plan? Past workouts stay." onConfirm={onDelete} />}
    </section>
  )
}

/** Each muscle's sets a week in this plan, against its limits (T-082d). */
function WeeklySets({ plan }: { plan: Plan }) {
  const rows = weeklyVolume(weeklySets(plan))
  if (!rows.length) return null
  return (
    <section className="week-sets" aria-label="Sets each week">
      <h3>Sets each week</h3>
      <p className="muted">Helper muscles count as half a set.</p>
      <ul>
        {rows.map((r) => (
          <li key={r.muscle} className={`band-${r.band}`}>
            <span>{MUSCLE_NAMES[r.muscle]}</span>
            <strong>{r.sets} sets</strong>
            <small>{r.why}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}

const PRIORITIES: [Priority, string][] = [
  ['more', 'Grow more'],
  ['grow', 'Grow'],
  ['keep', 'Keep'],
]

/** Grow more, Grow or Keep for each muscle the plan trains (T-082h). */
function MuscleFocus({ plan, onChange }: { plan: Plan; onChange: (m: Muscle, p: Priority) => void }) {
  const muscles = [...new Set(plan.days.flatMap((d) => d.exercises.map((e) => exerciseById.get(e.exerciseId)?.primary)))].filter((m): m is Muscle => !!m)
  if (!muscles.length) return null
  return (
    <section className="week-sets muscle-focus" aria-label="Muscle focus">
      <h3>Muscle focus</h3>
      <p className="muted">Grow more lets sets climb higher. Keep holds a muscle with fewer sets.</p>
      {muscles.map((m) => {
        const now = plan.priorities?.[m] ?? 'grow'
        return (
          <div key={m} className="choice" role="group" aria-label={`${MUSCLE_NAMES[m]} focus`}>
            <span>{MUSCLE_NAMES[m]}</span>
            {PRIORITIES.map(([p, label]) => (
              <button key={p} className="chip" aria-pressed={now === p} onClick={() => onChange(m, p)}>
                {label}
              </button>
            ))}
          </div>
        )
      })}
    </section>
  )
}
