import { useEffect, useState } from 'react'
import { describePlates, gymFor, platesFor } from '../engine/plates'
import { shownWeight, stepIn, toKg, weightText, type WeightUnit } from '../engine/units'
import { useWeightUnit } from '../settings/units'
import { myoText, newRecord, type StrengthSession } from '../engine/strength'
import { PLATEAU_SESSIONS, plateauCheck } from '../engine/plateau'
import { LANDMARKS, targetRir, type Muscle } from '../engine/training'
import { warmupSets } from '../engine/warmup'
import { exerciseById, similarExercise, type Exercise, type ExerciseSetting } from './exercises'
import { ExercisePicker, type ExerciseLibrary } from './ExercisePicker'
import { ExerciseDetail } from './ExerciseDetail'
import { SyncNote } from '../sync/SyncNote'
import { useSync } from '../sync/useSync'
import { CopyWorkout, type Copied } from './CopyWorkout'
import { cardioById } from './cardio'
import { CardioDetail, CardioLog, CardioPicker } from './CardioLog'
import { ExerciseSettings } from './ExerciseSettings'
import { FeedbackSheet } from './FeedbackSheet'
import { deloadAdvice, isDeloadWeek, weekLabel } from './progression'
import { formatRest, REST_STEP, restAfterSet, restLeft, supersetGroups } from './restTimer'
import {
  checkSet,
  describeSets,
  MAX_SET_NOTE,
  parseMiniReps,
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
  weekly,
  library,
  onClose,
}: {
  store: WorkoutStore
  session: Session
  planned: PlanExercise[]
  /** Each muscle's sets a week in the plan (T-082e). */
  weekly?: Partial<Record<Muscle, number>>
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
  // An exercise's history and graph, opened from its card (T-106).
  const [detail, setDetail] = useState<string | null>(null)
  // Sets from a past workout that fill today's boxes (T-113).
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState<Map<string, Copied>>(new Map())
  // Cardio is picked from its own short list (T-114).
  const [addingCardio, setAddingCardio] = useState(false)
  // Bumped when an exercise's settings change, so cards read them again (T-112).
  const [, setSettingsSaved] = useState(0)
  const saveSetting =
    library?.saveSetting &&
    (async (s: ExerciseSetting) => {
      await library.saveSetting!(s)
      setSettingsSaved((n) => n + 1)
    })

  const trained = [...new Set(session.sets.map((s) => exerciseById.get(s.exerciseId)?.primary).filter((m) => m !== undefined))]

  if (askFeedback) {
    return (
      <FeedbackSheet
        muscles={trained}
        exercises={[...new Set(session.sets.map((s) => s.exerciseId))]}
        onSkip={onClose}
        onSave={async (f) => {
          await store.saveFeedback(session.id, f)
          onClose()
        }}
      />
    )
  }

  const all = [...new Set([...planned.map((p) => p.exerciseId), ...session.sets.map((s) => s.exerciseId), ...extra])]
  // Cardio has its own cards after the strength exercises and is never in a superset.
  const ids = all.filter((id) => !cardioById.has(id))
  const cardioIds = all.filter((id) => cardioById.has(id))

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
    <>
      {detail && (
        <section className="sheet records-view">
          {cardioById.has(detail) ? (
            <CardioDetail store={store} exerciseId={detail} backLabel="← Back to workout" onBack={() => setDetail(null)} />
          ) : (
            <ExerciseDetail store={store} exerciseId={detail} today={session.performedOn} backLabel="← Back to workout" onBack={() => setDetail(null)} />
          )}
        </section>
      )}
      {/* Hidden, not closed, so typed weights and the rest timer stay. */}
      <section className="session" aria-label={session.name} hidden={!!detail}>
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
                warm={ids.slice(0, ids.indexOf(exercise.id)).some((id) => exerciseById.get(id)?.primary === exercise.primary)}
                weekly={weekly?.[exercise.primary]}
                others={ids}
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
                onDetail={() => setDetail(exercise.id)}
                saveSetting={saveSetting}
                copied={copied.get(exercise.id)}
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
        {cardioIds.map((id) => (
          <CardioLog key={id} store={store} session={session} cardio={cardioById.get(id)!} onChange={setSession} onDetail={() => setDetail(id)} />
        ))}
        <button className="add" onClick={() => setPicking(true)}>+ Add exercise</button>
        {addingCardio ? (
          <CardioPicker
            onClose={() => setAddingCardio(false)}
            onPick={(c) => {
              if (!all.includes(c.id)) setExtra((x) => [...x, c.id])
              setAddingCardio(false)
            }}
          />
        ) : (
          <button className="add" onClick={() => setAddingCardio(true)}>+ Add cardio</button>
        )}
        {copying ? (
          <CopyWorkout
            store={store}
            today={session.performedOn}
            onClose={() => setCopying(false)}
            onCopy={(c) => {
              setCopied(c)
              setExtra((x) => [...x, ...[...c.keys()].filter((id) => !ids.includes(id))])
              setCopying(false)
            }}
          />
        ) : (
          <button className="add" onClick={() => setCopying(true)}>Copy a past workout</button>
        )}
        <WorkoutNote store={store} session={session} />
      </section>
    </>
  )
}

/** Past sessions read per exercise: enough for the plateau check (T-082e). */
const HISTORY_SESSIONS = PLATEAU_SESSIONS + 3

function ExerciseLog({
  store,
  session,
  exercise,
  plan,
  block,
  warm,
  weekly,
  others,
  current,
  superset,
  onChange,
  onDetail,
  saveSetting,
  copied,
  onLogged,
}: {
  store: WorkoutStore
  session: Session
  exercise: Exercise
  plan?: PlanExercise
  block?: { week: number; hardWeeks: number }
  /** An earlier exercise today trains the same muscle (T-082c). */
  warm?: boolean
  /** Sets a week for this exercise's muscle, and today's exercises (T-082e). */
  weekly?: number
  others: string[]
  /** The exercise to do now in a superset. */
  current?: boolean
  /** Link with the next exercise; absent for the last one. */
  superset?: { on: boolean; toggle: () => void }
  onChange: (s: Session) => void
  /** Opens this exercise's history and graph. */
  onDetail: () => void
  /** Saves own step, rest and notes; absent when they can't be saved (T-112). */
  saveSetting?: (s: ExerciseSetting) => Promise<void>
  /** Sets copied from a past workout, to fill the boxes set by set (T-113). */
  copied?: Copied
  /** Starts the rest timer. */
  onLogged: () => void
}) {
  const deload = !!block && isDeloadWeek(block.week, block.hardWeeks)
  // Weights are saved in kg and shown in the person's unit (T-101).
  const unit = useWeightUnit()
  const show = (kg: number) => String(shownWeight(kg, unit))
  const [history, setHistory] = useState<PastSession[] | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rir, setRir] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [tag, setTag] = useState<SetTag | null>(null)
  const [note, setNote] = useState<string | null>(null)
  // Myo-reps mini-sets, typed as "5 4 4" (T-111).
  const [mini, setMini] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  /** Earlier days with this exercise, for "New record" (T-044b); null until loaded or offline. */
  const [past, setPast] = useState<StrengthSession[] | null>(null)
  const [record, setRecord] = useState<{ setId: string; text: string } | null>(null)

  const range: [number, number] = plan ? [plan.repMin, plan.repMax] : exercise.isolation ? [10, 15] : [6, 10]
  // Reps left to aim for; 2 when the session follows no plan (T-082b).
  const aim = block ? targetRir(block.week, block.hardWeeks, exercise.isolation) : 2
  // No plateau advice or weight increases in a deload week.
  const advise = (h: PastSession[]) => {
    if (deload) return { next: null, plateau: null }
    const plateau = plateauCheck({
      history: h.map((x) => ({ performedOn: x.performedOn, sets: workingSets(x.sets) })).filter((x) => x.sets.length),
      repRange: range,
      increment: exercise.increment,
      weeklySets: weekly === undefined ? undefined : Math.round(weekly * 10) / 10,
      mavLow: LANDMARKS[exercise.primary].mavLow,
      swapName: similarExercise(exercise, new Set(others))?.name,
      today: session.performedOn,
    })
    // A plateau with a missed target swaps the step for a lighter session (T-082e).
    const next = plateau?.action === 'lighter' ? { weight: plateau.weight, targetReps: range[0], why: plateau.why } : suggestNext(h, exercise, range, aim, session.performedOn)
    return { next, plateau }
  }
  const advice = history ? advise(history) : null
  const suggestion = advice?.next ?? null
  const plateauNote = advice?.plateau && advice.plateau.action !== 'lighter' ? advice.plateau.why : null

  // A copied workout replaces whatever was in the boxes (T-113).
  useEffect(() => {
    const first = copied?.sets[0]
    if (!first) return
    setWeight(show(first.weightKg))
    setReps(String(first.reps))
  }, [copied]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let live = true
    store.history(exercise.id, session.performedOn, HISTORY_SESSIONS).then(
      (h) => {
        if (!live) return
        setHistory(h)
        const s = advise(h).next
        // Otherwise start from last time's first working set.
        const last = deload ? undefined : workingSets(h[0]?.sets ?? [])[0]
        const fill = s ? { weight: s.weight, reps: s.targetReps } : last ? { weight: last.weightKg, reps: last.reps } : null
        if (fill) {
          setWeight((w) => w || show(fill.weight))
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
  // Warm-ups build to the suggested weight, or last time's first working set (T-082c).
  const lastSet = history ? workingSets(history[0]?.sets ?? [])[0] : undefined
  const working = suggestion ? { weight: suggestion.weight, reps: suggestion.targetReps } : lastSet ? { weight: lastSet.weightKg, reps: lastSet.reps } : null
  const warmup =
    working && workingSets(done).length === 0
      ? warmupSets({ workingKg: working.weight, workingReps: working.reps, equipment: exercise.equipment, isolation: exercise.isolation, warm: !!warm, increment: exercise.increment })
      : null

  const log = async () => {
    const w = toKg(Number(weight.replace(',', '.')), unit)
    const r = Number(reps)
    const x = rir.trim() === '' ? null : Number(rir)
    const miniReps = tag === 'myo' ? parseMiniReps(mini) : null
    const total = r + (miniReps ?? []).reduce((a, b) => a + b, 0)
    const problem =
      weight.trim() === '' || reps.trim() === ''
        ? 'Enter weight and reps.'
        : tag === 'myo' && !miniReps
          ? 'Enter the mini-set reps, like 5 4 4. Each is 1 to 30 reps.'
          : checkSet(w, total, x)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      const nextIndex = done.reduce((m, s) => Math.max(m, s.setIndex + 1), 0)
      const extra = { ...(tag ? { tag } : {}), ...(miniReps ? { miniReps } : {}), ...(note?.trim() ? { note: note.trim() } : {}) }
      const saved = await store.addSet(session.id, { exerciseId: exercise.id, setIndex: nextIndex, weightKg: w, reps: total, rir: x, ...extra })
      onChange({ ...session, sets: [...session.sets, saved] })
      const beat = past && newRecord(past, done, saved, unit)
      setRecord(beat ? { setId: saved.id, text: beat.text } : null)
      // Weight and reps stay for the next set; the tag and note were for this one.
      // After a warm-up, the working weight comes back.
      if (tag === 'warmup' && working) {
        setWeight(show(working.weight))
        setReps(String(working.reps))
      }
      // A copied workout fills the next set's boxes (T-113).
      const nextCopy = copied?.sets[done.length + 1]
      if (nextCopy && tag !== 'warmup') {
        setWeight(show(nextCopy.weightKg))
        setReps(String(nextCopy.reps))
      }
      setTag(null)
      setNote(null)
      setMini('')
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
        <button className="link history-link" aria-label={`History and graph for ${exercise.name}`} onClick={onDetail}>
          History
        </button>
        {saveSetting && (
          <button className="link" aria-label={`Settings for ${exercise.name}`} aria-expanded={settingsOpen} onClick={() => setSettingsOpen(!settingsOpen)}>
            Settings
          </button>
        )}
      </header>
      {settingsOpen && saveSetting && <ExerciseSettings exerciseId={exercise.id} onSave={saveSetting} onClose={() => setSettingsOpen(false)} />}
      {exercise.setupNote && <p className="muted setup-note">Setup: {exercise.setupNote}</p>}
      {copied && <p className="muted">Copied from {new Date(copied.from + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: {describeSets(copied.sets, unit)}</p>}
      {superset && (
        <button className="chip superset-link" aria-label={`Superset ${exercise.name} with the next exercise`} aria-pressed={superset.on} onClick={superset.toggle}>
          {superset.on ? 'End superset' : 'Superset with next'}
        </button>
      )}
      {history && history[0] && workingSets(history[0].sets).length > 0 && <p className="muted">Last time: {describeSets(workingSets(history[0].sets), unit)}</p>}
      {deload && plan && <p className="suggest">{deloadAdvice(plan.sets, exercise.primary)}</p>}
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
          Try {weightText(suggestion.weight, unit)} × {suggestion.targetReps}. <span className="muted">{suggestion.why}</span>
        </p>
      )}
      {plateauNote && <p className="muted plateau">{plateauNote}</p>}
      {warmup && warmup.sets.length > 0 && (
        <div className="warmups">
          <p className="muted">Warm-up first. {warmup.why}</p>
          {warmup.sets.map((w, i) => (
            <button
              key={i}
              className="chip"
              aria-label={`Warm-up ${i + 1} for ${exercise.name}: ${weightText(w.weight, unit)} × ${w.reps}`}
              onClick={() => {
                setWeight(show(w.weight))
                setReps(String(w.reps))
                setTag('warmup')
              }}
            >
              {weightText(w.weight, unit)} × {w.reps}
            </button>
          ))}
        </div>
      )}
      <ol className="sets">
        {done.map((s, i) => (
          <li key={s.id}>
            <span>
              Set {i + 1}: {weightText(s.weightKg, unit)} × {s.reps}{s.rir !== null ? ` · ${s.rir} reps left` : ''}
              {s.tag ? ` · ${SET_TAGS.find((t) => t.tag === s.tag)!.shown}` : ''}
              {myoText(s) ? ` (${myoText(s)})` : ''}
              {pending.has(s.id) && <span className="muted"> · Waiting for internet</span>}
              {s.note && <small className="muted set-note">{s.note}</small>}
            </span>
            <button className="link" aria-label={`Remove set ${i + 1} of ${exercise.name}`} onClick={() => void remove(s.id)}>✕</button>
          </li>
        ))}
      </ol>
      <div className="set-row">
        <span className="stepper">
          <button className="step" aria-label={`Less weight for ${exercise.name}`} onClick={() => step(weight, -stepIn(exercise.increment, unit), setWeight)}>−</button>
          <input aria-label={`${exercise.name} weight (${unit})`} placeholder={unit} inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <button className="step" aria-label={`More weight for ${exercise.name}`} onClick={() => step(weight, stepIn(exercise.increment, unit), setWeight)}>+</button>
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
      {exercise.equipment === 'barbell' && <PlateHint weight={weight} unit={unit} />}
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
      {tag === 'myo' && (
        <div className="myo">
          <p className="muted">Myo-reps: one hard start set, then mini-sets of 3 to 5 reps. Rest about 5 deep breaths between them. Put the start set in reps above.</p>
          <input aria-label={`${exercise.name} mini-set reps`} placeholder="Mini-sets, like 5 4 4" value={mini} onChange={(e) => setMini(e.target.value)} />
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

/** Plates for each side of a 20 kg (or 45 lb) bar, under a barbell exercise (T-044). */
function PlateHint({ weight, unit }: { weight: string; unit: WeightUnit }) {
  const w = Number(weight.replace(',', '.'))
  if (!weight.trim() || !(w > 0)) return null
  const gym = gymFor(unit)
  const load = platesFor(w, gym.bars[0], gym.plates, unit)
  return (
    <p className="muted plate-hint">
      {load.perSide.length > 0 ? `Each side of a ${gym.bars[0]} ${unit} bar: ${describePlates(load.perSide, unit)}.` : ''} {load.reason}
    </p>
  )
}
