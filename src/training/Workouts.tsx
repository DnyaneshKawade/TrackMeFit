import { useCallback, useEffect, useMemo, useState } from 'react'
import { localDate } from '../log/types'
import type { ExerciseLibrary } from './ExercisePicker'
import type { ExerciseStore } from './exerciseStore'
import { customExercise, customExercises, allSettings, setCustomExercises, setExerciseSettings, type Exercise } from './exercises'
import { PlanEditor } from './PlanEditor'
import { BlockView } from './BlockView'
import { blockWeek, blockWeekByWorkouts, nextPlanDay, skipNote, weekLabel, weeklySets, workoutsInBlock } from './progression'
import { RecordsView } from './RecordsView'
import { ReviewView } from './ReviewView'
import { SessionView } from './SessionView'
import { SkipView } from './SkipView'
import { SuggestPlan, type TrainingAnswers } from './SuggestPlan'
import { SyncNote } from '../sync/SyncNote'
import type { Plan, PlanDay, Session, SessionSummary, WorkoutStore } from './types'
import { shiftDate } from '../log/types'
import '../log/log.css'
import './training.css'

type View =
  | { kind: 'home' }
  | { kind: 'plan'; plan: Plan }
  | { kind: 'review'; plan: Plan }
  | { kind: 'block'; plan: Plan }
  /** `fromRecords`: opened from the calendar, so closing goes back there (T-128). */
  | { kind: 'session'; session: Session; fromRecords?: boolean }
  | { kind: 'start' }
  | { kind: 'skip'; plan: Plan; day: PlanDay }
  | { kind: 'records' }
  | { kind: 'suggest' }

/** How far back a past workout can be logged (T-126). */
const PAST_DAYS = 365

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/** Swaps one own exercise in the list known to search, plans and logs. */
function replaceCustom(id: string, change: (e: Exercise) => Exercise) {
  setCustomExercises(customExercises().map((x) => (x.id === id ? change(x) : x)))
}

export function Workouts({
  store,
  exercises,
  today = localDate(),
  answers,
  userId,
}: {
  store: WorkoutStore
  exercises?: ExerciseStore
  today?: string
  /** Onboarding answers for "Suggest a plan" (T-041a). */
  answers?: TrainingAnswers
  /** The signed-in person, to tell their own plan changes from their coach's (T-026d). */
  userId?: string
}) {
  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const [sessions, setSessions] = useState<Session[]>([])
  // Workouts since the oldest block began; null when they couldn't load (T-107).
  const [blockWorkouts, setBlockWorkouts] = useState<SessionSummary[] | null>(null)
  const [view, setView] = useState<View>({ kind: 'home' })
  // The day a new workout is logged on; an earlier day for a past workout (T-126).
  const [on, setOn] = useState(today)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      // Own exercises and favourites are extras: without them the log still works.
      const [p, s, own, favs, settings] = await Promise.all([
        store.plans(),
        store.sessionsOn(today),
        exercises ? exercises.custom().catch(() => null) : null,
        exercises ? exercises.favourites().catch(() => null) : null,
        exercises ? exercises.settings().catch(() => null) : null,
      ])
      if (own) setCustomExercises(own.map((x) => customExercise(x.id, x)))
      if (settings) setExerciseSettings(settings)
      if (favs) setFavourites(new Set(favs))
      setPlans(p)
      setSessions(s)
      setError(null)
      // One read for every plan's block. Without it, weeks fall back to dates.
      const from = p.map((x) => x.blockStartedOn ?? today).sort()[0]
      setBlockWorkouts(from && from <= today ? await store.summaries(from, today).catch(() => null) : [])
    } catch {
      setPlans([])
      setError('Couldn’t load your workouts. Check your connection.')
    }
  }, [store, exercises, today])

  const library = useMemo<ExerciseLibrary | undefined>(
    () =>
      exercises && {
        favourites,
        async setFavourite(id, on) {
          const next = new Set(favourites)
          if (on) next.add(id)
          else next.delete(id)
          setFavourites(next)
          try {
            await exercises.setFavourite(id, on)
          } catch (err) {
            setFavourites(favourites)
            throw err
          }
        },
        async addCustom(e) {
          const row = await exercises.addCustom(e)
          const saved = customExercise(row.id, row)
          setCustomExercises([saved, ...customExercises()])
          return saved
        },
        async updateCustom(id, e) {
          const row = await exercises.updateCustom(id, e)
          const saved = customExercise(row.id, row)
          replaceCustom(id, () => saved)
          return saved
        },
        async saveSetting(s) {
          await exercises.saveSetting(s)
          const others = allSettings().filter((x) => x.exerciseId !== s.exerciseId)
          setExerciseSettings(s.stepKg || s.restSec || s.note || s.goalKg ? [...others, s] : others)
        },
        async setHidden(id, hidden) {
          await exercises.setHidden(id, hidden)
          replaceCustom(id, (x) => {
            const copy = { ...x }
            if (hidden) copy.hidden = true
            else delete copy.hidden
            return copy
          })
        },
      },
    [exercises, favourites],
  )

  useEffect(() => {
    void load()
  }, [load])

  const dayOf = (id: string | null): PlanDay | undefined => plans?.flatMap((p) => p.days).find((d) => d.id === id)
  const planOf = (dayId: string | null) => plans?.find((p) => p.days.some((d) => d.id === dayId))
  const weekOf = (p: Plan) => {
    const startedOn = p.blockStartedOn ?? today
    if (!blockWorkouts) return blockWeek(startedOn, today) + (p.blockStartWeek ?? 1) - 1
    return blockWeekByWorkouts({ startedOn, today, done: workoutsInBlock(p, blockWorkouts, today), daysPerWeek: p.days.length, startWeek: p.blockStartWeek })
  }
  const nextOf = (p: Plan) => nextPlanDay(p, blockWorkouts ?? [])
  // This plan's skips in the last 7 days, for the week review (T-110).
  const skipsOf = (p: Plan) => {
    const days = new Set(p.days.map((d) => d.id))
    return (blockWorkouts ?? []).filter((w) => w.skipped && w.planDayId && days.has(w.planDayId) && w.performedOn >= shiftDate(today, -6))
  }
  const blockOf = (p?: Plan) => (p ? { week: weekOf(p), hardWeeks: p.hardWeeks ?? 4, beginner: answers?.experience === 'beginner' } : undefined)
  const weeklyOf = (p?: Plan) => (p ? weeklySets(p) : undefined)

  const start = async (day: PlanDay | null) => {
    try {
      const session = await store.startSession(on <= today && on >= earliest ? on : today, day)
      setOn(today)
      setView({ kind: 'session', session })
    } catch {
      setError('Couldn’t start the workout. Check your connection.')
      setView({ kind: 'home' })
    }
  }

  const earliest = shiftDate(today, -PAST_DAYS)

  const back = () => {
    setView({ kind: 'home' })
    void load()
  }

  // Takes back a skip, so the plan's next day comes back (T-123).
  const unskip = async (s: Session) => {
    try {
      await store.deleteSession(s.id)
      void load()
    } catch {
      setError('Couldn’t undo the skip. Check your connection.')
    }
  }

  if (view.kind === 'plan') {
    return (
      <main className="log">
        <PlanEditor
          library={library}
          initial={view.plan}
          onClose={() => setView({ kind: 'home' })}
          onSave={async (p) => {
            await store.savePlan(p)
            back()
          }}
          onDelete={
            view.plan.id
              ? async () => {
                  await store.deletePlan(view.plan.id!)
                  back()
                }
              : undefined
          }
        />
      </main>
    )
  }

  if (view.kind === 'review') {
    return (
      <main className="log">
        <ReviewView store={store} plan={view.plan} today={today} week={weekOf(view.plan)} skips={skipNote(skipsOf(view.plan))} onDone={back} />
      </main>
    )
  }

  if (view.kind === 'block') {
    return (
      <main className="log">
        <BlockView store={store} plan={view.plan} today={today} week={weekOf(view.plan)} onDone={back} />
      </main>
    )
  }

  if (view.kind === 'skip') {
    const after = nextPlanDay(view.plan, [{ planDayId: view.day.id }])
    return (
      <main className="log">
        <SkipView
          day={view.day}
          next={after && after.id !== view.day.id ? after : undefined}
          onClose={() => setView({ kind: 'start' })}
          onSkip={async (reason) => {
            await store.skipDay(today, view.day, reason)
            back()
          }}
        />
      </main>
    )
  }

  if (view.kind === 'suggest') {
    return (
      <main className="log">
        <SuggestPlan answers={answers} onUse={(plan) => setView({ kind: 'plan', plan })} onClose={() => setView({ kind: 'home' })} />
      </main>
    )
  }

  if (view.kind === 'records') {
    return (
      <main className="log">
        <RecordsView store={store} today={today} onClose={() => setView({ kind: 'home' })} onOpen={(session) => setView({ kind: 'session', session, fromRecords: true })} />
      </main>
    )
  }

  if (view.kind === 'session') {
    return (
      <main className="log">
        <SessionView
          store={store}
          session={view.session}
          planned={dayOf(view.session.planDayId)?.exercises ?? []}
          block={blockOf(planOf(view.session.planDayId))}
          weekly={weeklyOf(planOf(view.session.planDayId))}
          library={library}
          past={view.session.performedOn < today}
          onClose={view.fromRecords ? () => setView({ kind: 'records' }) : back}
        />
      </main>
    )
  }

  if (view.kind === 'start') {
    return (
      <main className="log">
        <section className="sheet" aria-label="Start a workout">
          <header className="sheet-head">
            <h2>Start a workout</h2>
            <button className="link" onClick={() => setView({ kind: 'home' })}>Close</button>
          </header>
          <label className="field workout-date">
            Workout date
            <input type="date" min={earliest} max={today} value={on} onChange={(e) => setOn(e.target.value || today)} />
          </label>
          <p className="muted">{on < today ? `This workout is logged on ${shortDate(on)}.` : 'Did it on an earlier day? Pick that date first.'}</p>
          {plans?.map((p) => {
            const next = nextOf(p)
            return (
              <div key={p.id} className="start-plan">
                <h3>{p.name}</h3>
                {p.days.map((d) => (
                  <button key={d.id} className="day-button" onClick={() => void start(d)}>
                    <strong>{d.name}</strong>
                    <span className="muted">
                      {d.exercises.length} exercises{d.id === next?.id ? ' · next up' : ''}
                    </span>
                  </button>
                ))}
                {next && (
                  <button className="link" onClick={() => setView({ kind: 'skip', plan: p, day: next })}>
                    Skip {next.name}
                  </button>
                )}
              </div>
            )
          })}
          <button className="add" onClick={() => void start(null)}>Empty workout</button>
        </section>
      </main>
    )
  }

  return (
    <main className="log">
      <h2>Today’s training</h2>
      {error && <p className="error" role="alert">{error}</p>}
      <SyncNote sync={store.sync} noun={['workout entry', 'workout entries']} />
      {sessions.length === 0 && <p className="muted">No workout logged today.</p>}
      <ul className="session-list">
        {sessions.map((s) => (
          <li key={s.id}>
            {s.skipped ? (
              <div className="day-button skipped-day">
                <strong>{s.name}</strong>
                <span className="muted">Skipped{s.skipped.reason ? `: ${s.skipped.reason}` : ''}</span>
                <button className="link" aria-label={`Undo skip of ${s.name}`} onClick={() => void unskip(s)}>Undo skip</button>
              </div>
            ) : (
              <button className="day-button" onClick={() => setView({ kind: 'session', session: s })}>
                <strong>{s.name}</strong>
                <span className="muted">{s.sets.length} sets logged</span>
              </button>
            )}
          </li>
        ))}
      </ul>
      <button className="primary" onClick={() => setView({ kind: 'start' })}>Start a workout</button>
      <button className="secondary records" onClick={() => setView({ kind: 'records' })}>Records and progress</button>

      <h2 className="plans-head">My plans</h2>
      {plans === null && <p className="muted">Loading…</p>}
      {plans?.length === 0 && (
        <p className="muted">No plan yet. A plan is a few training days. Each day has exercises, sets and reps. Not sure where to start? Get a suggested plan.</p>
      )}
      <ul className="session-list">
        {plans?.map((p) => {
          const b = blockOf(p)!
          return (
            <li key={p.id} className="plan-card">
              <button className="day-button" onClick={() => setView({ kind: 'plan', plan: p })}>
                <strong>{p.name}</strong>
                <span className="muted">{p.days.map((d) => d.name).join(' · ')}</span>
                <span className="muted">{weekLabel(b.week, b.hardWeeks)}</span>
                {nextOf(p) && <span className="muted">Next: {nextOf(p)!.name}</span>}
                {userId && p.changedBy && p.changedBy !== userId && (
                  <span className="muted">Changed by your coach{p.changedOn ? ` on ${shortDate(p.changedOn)}` : ''}.</span>
                )}
              </button>
              <button className="link" aria-label={`Review week for ${p.name}`} onClick={() => setView({ kind: 'review', plan: p })}>
                Review week
              </button>
              <button className="link" aria-label={`Block for ${p.name}`} onClick={() => setView({ kind: 'block', plan: p })}>
                Block
              </button>
            </li>
          )
        })}
      </ul>
      <button className="add" onClick={() => setView({ kind: 'plan', plan: { name: '', days: [{ dayIndex: 0, name: '', exercises: [] }] } })}>
        + New plan
      </button>
      <button className="add" onClick={() => setView({ kind: 'suggest' })}>Suggest a plan</button>
    </main>
  )
}
