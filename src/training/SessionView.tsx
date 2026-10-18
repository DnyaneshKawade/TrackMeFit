import { useEffect, useState } from 'react'
import { describePlates, platesFor } from '../engine/plates'
import { newRecord, type StrengthSession } from '../engine/strength'
import { targetRir } from '../engine/training'
import { exerciseById, type Exercise } from './exercises'
import { ExercisePicker, type ExerciseLibrary } from './ExercisePicker'
import { SyncNote } from '../sync/SyncNote'
import { useSync } from '../sync/useSync'
import { FeedbackSheet } from './FeedbackSheet'
import { deloadAdvice, isDeloadWeek, weekLabel } from './progression'
import { formatRest, REST_STEP, restAfterSet, restLeft, supersetGroups } from './restTimer'
import {
  checkSet,
  describeSets,
  MAX_SET_NOTE,
  MAX_WORKOUT_NOTE,
  SET_TAGS,
  suggestNext,
  workingSets,
  type PastSession,
  type PlanExercise,
  type Session,
  type SetTag,
  type WorkoutStore,
} from './types'

/** Counts down the rest after a set; the end time comes from the clock. */
function RestTimer({ endsAt, onChange }: { endsAt: number; onChange: (endsAt: number | null) => void }) {
  const [now, setNow] = useState(() => Date.now())
  const left = restLeft(endsAt, now)
  useEffect(() => {
    if (left === 0) {
      try {
        navigator.vibrate?.([200, 100, 200])
      } catch {
        // No vibration on this phone.
      }
      return
    }
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [left === 0]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="rest-timer" role="timer" aria-label="Rest">
      <strong>{left === 0 ? 'Rest over' : `Rest ${formatRest(left)}`}</strong>
      {left > 0 && (
        <>
          <button className="step" aria-label="15 seconds less rest" onClick={() => onChange(endsAt - REST_STEP * 1000)}>−15 s</button>
          <button className="step" aria-label="15 seconds more rest" onClick={() => onChange(endsAt + REST_STEP * 1000)}>+15 s</button>
        </>
      )}
      <button className="link" onClick={() => onChange(null)}>{left === 0 ? 'OK' : 'Skip'}</button>
    </div>
  )
}

function WorkoutNote({ store, session }: { store: WorkoutStore; session: Session }) {
  const [note, setNote] = useState(session.note ?? '')
  const [saved, setSaved] = useState(session.note ?? '')
  const [error, setError] = useState<string | null>(null)
  const save = async () => {
    if (note.trim() === saved.trim()) return
    try {
      await store.saveNote(session.id, note)
      setSaved(note)
      setError(null)
    } catch {
      setError('Couldn’t save the notes. Try again.')
    }
  }
  return (
    <label className="workout-note">
      <span>Workout notes</span>
      <textarea aria-label="Workout notes" maxLength={MAX_WORKOUT_NOTE} rows={2} value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => void save()} />
      {error && <small className="error" role="alert">{error}</small>}
    </label>
  )
}

export function SessionView({
  store,
  session: initial,
  planned,
  block,
  library,
  onClose,
}: {
  store: WorkoutStore
  session: Session
  planned: PlanExercise[]
  /** The plan's training block, when the session follows a plan day. */
  block?: { week: number; hardWeeks: number }
  library?: ExerciseLibrary
  onClose: () => void
}) {
  const [session, setSession] = useState(initial)
  // Exercises done as a superset with the next one; starts from the plan.
  const [linked, setLinked] = useState(() => new Set(planned.filter((p) => p.supersetNext).map((p) => p.exerciseId)))
  // In a superset, the exercise to do next after a set is logged.
  const [now, setNow] = useState<string | null>(null)
  const [extra, setExtra] = useState<string[]>([])
  const [picking, setPicking] = useState(false)
  const [askFeedback, setAskFeedback] = useState(false)
  const [restEnds, setRestEnds] = useState<number | null>(null)

  const trained = [...new Set(session.sets.map((s) => exerciseById.get(s.exerciseId)?.primary).filter((m) => m !== undefined))]

  if (askFeedback) {
    return (
      <FeedbackSheet
        muscles={trained}
        onSkip={onClose}
        onSave={async (f) => {
          await store.saveFeedback(session.id, f)
          onClose()
        }}
      />
    )
  }

  const ids = [...new Set([...planned.map((p) => p.exerciseId), ...session.sets.map((s) => s.exerciseId), ...extra])]

  if (picking) {
    return (
      <ExercisePicker
        library={library}
        onClose={() => setPicking(false)}
        onPick={(e) => {
          setExtra((x) => [...x, e.id])
          setPicking(false)
        }}
      />
    )
  }

  return (
    <section className="session" aria-label={session.name}>
      <header className="sheet-head">
        <h2>{session.name}</h2>
        <button className="link" onClick={() => (trained.length ? setAskFeedback(true) : onClose())}>Done</button>
      </header>
      {block && <p className="muted">{weekLabel(block.week, block.hardWeeks)}</p>}
      {restEnds !== null && <RestTimer key={restEnds} endsAt={restEnds} onChange={setRestEnds} />}
      <SyncNote sync={store.sync} noun={['workout entry', 'workout entries']} />
      {supersetGroups(ids, linked).map((group) => {
        const exercises = group.flatMap((id) => exerciseById.get(id) ?? [])
        const cards = exercises.map((exercise, i) => {
          const next = ids[ids.indexOf(exercise.id) + 1]
          return (
            <ExerciseLog
              key={exercise.id}
              store={store}
              session={session}
              exercise={exercise}
              plan={planned.find((p) => p.exerciseId === exercise.id)}
              block={block}
              current={now === exercise.id}
              superset={
                next
                  ? {
                      on: linked.has(exercise.id),
                      toggle: () =>
                        setLinked((l) => {
                          const copy = new Set(l)
                          if (copy.has(exercise.id)) copy.delete(exercise.id)
                          else copy.add(exercise.id)
                          return copy
                        }),
                    }
                  : undefined
              }
              onChange={setSession}
              onLogged={() => {
                const rest = restAfterSet(exercises, exercise.id)
                // In a superset, go straight to the next exercise; rest after the last.
                setNow(rest === null ? exercises[i + 1].id : exercises.length > 1 ? exercises[0].id : null)
                setRestEnds(rest === null ? null : Date.now() + rest * 1000)
              }}
            />
          )
        })
        if (exercises.length < 2) return cards
        return (
          <section key={group.join('+')} className="superset" aria-label={`Superset: ${exercises.map((e) => e.name).join(' and ')}`}>
            <p className="superset-head">Superset: do one set of each, then rest.</p>
            {now && group.includes(now) && <p className="superset-now" role="status">Now do {exerciseById.get(now)?.name}</p>}
            {cards}
          </section>
        )
      })}
      <button className="add" onClick={() => setPicking(true)}>+ Add exercise</button>
      <WorkoutNote store={store} session={session} />
    </section>
  )
}

function ExerciseLog({
  store,
  session,
  exercise,
  plan,
  block,
  current,
  superset,
  onChange,
  onLogged,
}: {
  store: WorkoutStore
  session: Session
  exercise: Exercise
  plan?: PlanExercise
  block?: { week: number; hardWeeks: number }
  /** The exercise to do now in a superset. */
  current?: boolean
  /** Link with the next exercise; absent for the last one. */
  superset?: { on: boolean; toggle: () => void }
  onChange: (s: Session) => void
  /** Starts the rest timer. */
  onLogged: () => void
}) {
  const deload = !!block && isDeloadWeek(block.week, block.hardWeeks)
  const [history, setHistory] = useState<PastSession[] | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rir, setRir] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [tag, setTag] = useState<SetTag | null>(null)
  const [note, setNote] = useState<string | null>(null)
  /** Earlier days with this exercise, for "New record" (T-044b); null until loaded or offline. */
  const [past, setPast] = useState<StrengthSession[] | null>(null)
  const [record, setRecord] = useState<{ setId: string; text: string } | null>(null)

  const range: [number, number] = plan ? [plan.repMin, plan.repMax] : exercise.isolation ? [10, 15] : [6, 10]
  // Reps left to aim for; 2 when the session follows no plan (T-082b).
  const aim = block ? targetRir(block.week, block.hardWeeks, exercise.isolation) : 2
  // No weight increases in a deload week.
  const suggestion = history && !deload ? suggestNext(history, exercise, range, aim) : null

  useEffect(() => {
    let live = true
    store.history(exercise.id, session.performedOn).then(
      (h) => {
        if (!live) return
        setHistory(h)
        const s = deload ? null : suggestNext(h, exercise, range, aim)
        // Otherwise start from last time's first working set.
        const last = deload ? undefined : workingSets(h[0]?.sets ?? [])[0]
        const fill = s ? { weight: s.weight, reps: s.targetReps } : last ? { weight: last.weightKg, reps: last.reps } : null
        if (fill) {
          setWeight((w) => w || String(fill.weight))
          setReps((r) => r || String(fill.reps))
        }
      },
      () => live && setHistory([]),
    )
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, exercise.id, session.performedOn])

  useEffect(() => {
    let live = true
    // Offline there is no record note; the set still saves.
    store.exerciseHistory(exercise.id).then(
      (h) => live && setPast(h.filter((p) => p.performedOn < session.performedOn)),
      () => {},
    )
    return () => {
      live = false
    }
  }, [store, exercise.id, session.performedOn])

  const { pending } = useSync(store.sync)
  const done = session.sets.filter((s) => s.exerciseId === exercise.id).sort((a, b) => a.setIndex - b.setIndex)

  const log = async () => {
    const w = Number(weight.replace(',', '.'))
    const r = Number(reps)
    const x = rir.trim() === '' ? null : Number(rir)
    const problem = weight.trim() === '' || reps.trim() === '' ? 'Enter weight and reps.' : checkSet(w, r, x)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      const nextIndex = done.reduce((m, s) => Math.max(m, s.setIndex + 1), 0)
      const extra = { ...(tag ? { tag } : {}), ...(note?.trim() ? { note: note.trim() } : {}) }
      const saved = await store.addSet(session.id, { exerciseId: exercise.id, setIndex: nextIndex, weightKg: w, reps: r, rir: x, ...extra })
      onChange({ ...session, sets: [...session.sets, saved] })
      const beat = past && newRecord(past, done, saved)
      setRecord(beat ? { setId: saved.id, text: beat.text } : null)
      // Weight and reps stay for the next set; the tag and note were for this one.
      setTag(null)
      setNote(null)
      onLogged()
    } catch {
      setError('Couldn’t save the set. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  /** − and + : weight by the exercise's usual jump, reps by one; never below 0. */
  const step = (value: string, by: number, set: (v: string) => void) => {
    const n = Number(value.replace(',', '.')) || 0
    set(String(Math.max(0, Math.round((n + by) * 100) / 100)))
  }

  const remove = async (id: string) => {
    try {
      await store.removeSet(id)
      onChange({ ...session, sets: session.sets.filter((s) => s.id !== id) })
      if (record?.setId === id) setRecord(null)
    } catch {
      setError('Couldn’t remove that set. Try again.')
    }
  }

  return (
    <section className={current ? 'exercise current' : 'exercise'} aria-label={exercise.name}>
      <header>
        <h3>{exercise.name}</h3>
        {plan && <span className="muted">{plan.sets} × {plan.repMin}–{plan.repMax}</span>}
      </header>
      {superset && (
        <button className="chip superset-link" aria-label={`Superset ${exercise.name} with the next exercise`} aria-pressed={superset.on} onClick={superset.toggle}>
          {superset.on ? 'End superset' : 'Superset with next'}
        </button>
      )}
      {history && history[0] && workingSets(history[0].sets).length > 0 && <p className="muted">Last time: {describeSets(workingSets(history[0].sets))}</p>}
      {deload && plan && <p className="suggest">{deloadAdvice(plan.sets)}</p>}
      {block && !deload && (
        <p className="muted">
          {(() => {
            const rir = targetRir(block.week, block.hardWeeks, exercise.isolation)
            return rir === 0 ? 'Last hard week: take the final set close to failure.' : `Stop each set about ${rir} rep${rir > 1 ? 's' : ''} short of failure.`
          })()}
        </p>
      )}
      {suggestion && (
        <p className="suggest">
          Try {suggestion.weight} kg × {suggestion.targetReps}. <span className="muted">{suggestion.why}</span>
        </p>
      )}
      <ol className="sets">
        {done.map((s, i) => (
          <li key={s.id}>
            <span>
              Set {i + 1}: {s.weightKg} kg × {s.reps}{s.rir !== null ? ` · ${s.rir} reps left` : ''}
              {s.tag ? ` · ${SET_TAGS.find((t) => t.tag === s.tag)!.shown}` : ''}
              {pending.has(s.id) && <span className="muted"> · Waiting for internet</span>}
              {s.note && <small className="muted set-note">{s.note}</small>}
            </span>
            <button className="link" aria-label={`Remove set ${i + 1} of ${exercise.name}`} onClick={() => void remove(s.id)}>✕</button>
          </li>
        ))}
      </ol>
      <div className="set-row">
        <span className="stepper">
          <button className="step" aria-label={`Less weight for ${exercise.name}`} onClick={() => step(weight, -exercise.increment, setWeight)}>−</button>
          <input aria-label={`${exercise.name} weight (kg)`} placeholder="kg" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <button className="step" aria-label={`More weight for ${exercise.name}`} onClick={() => step(weight, exercise.increment, setWeight)}>+</button>
        </span>
        <span className="stepper">
          <button className="step" aria-label={`Fewer reps for ${exercise.name}`} onClick={() => step(reps, -1, setReps)}>−</button>
          <input aria-label={`${exercise.name} reps`} placeholder="reps" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} />
          <button className="step" aria-label={`More reps for ${exercise.name}`} onClick={() => step(reps, 1, setReps)}>+</button>
        </span>
        <input aria-label={`${exercise.name} reps left`} placeholder="Left" inputMode="numeric" value={rir} onChange={(e) => setRir(e.target.value)} />
        <button className="primary" disabled={busy} onClick={log}>Log set</button>
      </div>
      {record && (
        <p className="record" role="status">
          🏆 {record.text}
        </p>
      )}
      {exercise.equipment === 'barbell' && <PlateHint weight={weight} />}
      <div className="set-extras">
        {SET_TAGS.map((t) => (
          <button key={t.tag} className="chip" aria-pressed={tag === t.tag} onClick={() => setTag(tag === t.tag ? null : t.tag)}>
            {t.label}
          </button>
        ))}
        {note === null ? (
          <button className="link" onClick={() => setNote('')}>+ Note</button>
        ) : (
          <input aria-label={`${exercise.name} set note`} placeholder="Note for this set" maxLength={MAX_SET_NOTE} value={note} onChange={(e) => setNote(e.target.value)} />
        )}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

/** Plates for each side of a 20 kg bar, under a barbell exercise (T-044). */
function PlateHint({ weight }: { weight: string }) {
  const w = Number(weight.replace(',', '.'))
  if (!weight.trim() || !(w > 0)) return null
  const load = platesFor(w)
  return (
    <p className="muted plate-hint">
      {load.perSide.length > 0 ? `Each side of a 20 kg bar: ${describePlates(load.perSide)}.` : ''} {load.reason}
    </p>
  )
}
