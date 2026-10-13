import { useEffect, useState } from 'react'
import { targetRir } from '../engine/training'
import { exerciseById, type Exercise } from './exercises'
import { ExercisePicker } from './ExercisePicker'
import { SyncNote } from '../sync/SyncNote'
import { useSync } from '../sync/useSync'
import { FeedbackSheet } from './FeedbackSheet'
import { deloadAdvice, isDeloadWeek, weekLabel } from './progression'
import { formatRest, REST_STEP, restLeft, restSeconds } from './restTimer'
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
  onClose,
}: {
  store: WorkoutStore
  session: Session
  planned: PlanExercise[]
  /** The plan's training block, when the session follows a plan day. */
  block?: { week: number; hardWeeks: number }
  onClose: () => void
}) {
  const [session, setSession] = useState(initial)
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
      {ids.map((id) => {
        const exercise = exerciseById.get(id)
        if (!exercise) return null
        return (
          <ExerciseLog
            key={id}
            store={store}
            session={session}
            exercise={exercise}
            plan={planned.find((p) => p.exerciseId === id)}
            block={block}
            onChange={setSession}
            onLogged={() => setRestEnds(Date.now() + restSeconds(exercise) * 1000)}
          />
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
  onChange,
  onLogged,
}: {
  store: WorkoutStore
  session: Session
  exercise: Exercise
  plan?: PlanExercise
  block?: { week: number; hardWeeks: number }
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

  const range: [number, number] = plan ? [plan.repMin, plan.repMax] : exercise.isolation ? [10, 15] : [6, 10]
  // No weight increases in a deload week.
  const suggestion = history && !deload ? suggestNext(history, exercise, range) : null

  useEffect(() => {
    let live = true
    store.history(exercise.id, session.performedOn).then(
      (h) => {
        if (!live) return
        setHistory(h)
        const s = deload ? null : suggestNext(h, exercise, range)
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
    } catch {
      setError('Couldn’t remove that set. Try again.')
    }
  }

  return (
    <section className="exercise" aria-label={exercise.name}>
      <header>
        <h3>{exercise.name}</h3>
        {plan && <span className="muted">{plan.sets} × {plan.repMin}–{plan.repMax}</span>}
      </header>
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
