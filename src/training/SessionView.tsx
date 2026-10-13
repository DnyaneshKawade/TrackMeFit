import { useEffect, useState } from 'react'
import { targetRir } from '../engine/training'
import { exerciseById, type Exercise } from './exercises'
import { ExercisePicker } from './ExercisePicker'
import { SyncNote } from '../sync/SyncNote'
import { useSync } from '../sync/useSync'
import { FeedbackSheet } from './FeedbackSheet'
import { deloadAdvice, isDeloadWeek, weekLabel } from './progression'
import { checkSet, describeSets, suggestNext, type PastSession, type PlanExercise, type Session, type WorkoutStore } from './types'

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
          />
        )
      })}
      <button className="add" onClick={() => setPicking(true)}>+ Add exercise</button>
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
}: {
  store: WorkoutStore
  session: Session
  exercise: Exercise
  plan?: PlanExercise
  block?: { week: number; hardWeeks: number }
  onChange: (s: Session) => void
}) {
  const deload = !!block && isDeloadWeek(block.week, block.hardWeeks)
  const [history, setHistory] = useState<PastSession[] | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rir, setRir] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
        if (s) {
          setWeight((w) => w || String(s.weight))
          setReps((r) => r || String(s.targetReps))
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
      const saved = await store.addSet(session.id, { exerciseId: exercise.id, setIndex: nextIndex, weightKg: w, reps: r, rir: x })
      onChange({ ...session, sets: [...session.sets, saved] })
    } catch {
      setError('Couldn’t save the set. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
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
      {history && history[0] && <p className="muted">Last time: {describeSets(history[0].sets)}</p>}
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
              Set {i + 1}: {s.weightKg} kg × {s.reps}{s.rir !== null ? ` · ${s.rir} in reserve` : ''}
              {pending.has(s.id) && <span className="muted"> · Not synced yet</span>}
            </span>
            <button className="link" aria-label={`Remove set ${i + 1} of ${exercise.name}`} onClick={() => void remove(s.id)}>✕</button>
          </li>
        ))}
      </ol>
      <div className="set-row">
        <input aria-label={`${exercise.name} weight (kg)`} placeholder="kg" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <input aria-label={`${exercise.name} reps`} placeholder="reps" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} />
        <input aria-label={`${exercise.name} reps in reserve`} placeholder="RIR" inputMode="numeric" value={rir} onChange={(e) => setRir(e.target.value)} />
        <button className="primary" disabled={busy} onClick={log}>Log set</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}
