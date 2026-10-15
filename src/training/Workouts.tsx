import { useCallback, useEffect, useMemo, useState } from 'react'
import { localDate } from '../log/types'
import type { ExerciseLibrary } from './ExercisePicker'
import type { ExerciseStore } from './exerciseStore'
import { customExercise, customExercises, setCustomExercises, type Exercise } from './exercises'
import { PlanEditor } from './PlanEditor'
import { blockWeek, weekLabel } from './progression'
import { RecordsView } from './RecordsView'
import { ReviewView } from './ReviewView'
import { SessionView } from './SessionView'
import { SyncNote } from '../sync/SyncNote'
import type { Plan, PlanDay, Session, WorkoutStore } from './types'
import '../log/log.css'
import './training.css'

type View =
  | { kind: 'home' }
  | { kind: 'plan'; plan: Plan }
  | { kind: 'review'; plan: Plan }
  | { kind: 'session'; session: Session }
  | { kind: 'start' }
  | { kind: 'records' }

/** Swaps one own exercise in the list known to search, plans and logs. */
function replaceCustom(id: string, change: (e: Exercise) => Exercise) {
  setCustomExercises(customExercises().map((x) => (x.id === id ? change(x) : x)))
}

export function Workouts({ store, exercises, today = localDate() }: { store: WorkoutStore; exercises?: ExerciseStore; today?: string }) {
  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const [sessions, setSessions] = useState<Session[]>([])
  const [view, setView] = useState<View>({ kind: 'home' })
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      // Own exercises and favourites are extras: without them the log still works.
      const [p, s, own, favs] = await Promise.all([
        store.plans(),
        store.sessionsOn(today),
        exercises ? exercises.custom().catch(() => null) : null,
        exercises ? exercises.favourites().catch(() => null) : null,
      ])
      if (own) setCustomExercises(own.map((x) => customExercise(x.id, x)))
      if (favs) setFavourites(new Set(favs))
      setPlans(p)
      setSessions(s)
      setError(null)
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
  const blockOf = (p?: Plan) => (p ? { week: blockWeek(p.blockStartedOn ?? today, today), hardWeeks: p.hardWeeks ?? 4 } : undefined)

  const start = async (day: PlanDay | null) => {
    try {
      const session = await store.startSession(today, day)
      setView({ kind: 'session', session })
    } catch {
      setError('Couldn’t start the workout. Check your connection.')
      setView({ kind: 'home' })
    }
  }

  const back = () => {
    setView({ kind: 'home' })
    void load()
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
        <ReviewView store={store} plan={view.plan} today={today} onDone={back} />
      </main>
    )
  }

  if (view.kind === 'records') {
    return (
      <main className="log">
        <RecordsView store={store} today={today} onClose={() => setView({ kind: 'home' })} />
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
          library={library}
          onClose={back}
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
          {plans?.map((p) => (
            <div key={p.id} className="start-plan">
              <h3>{p.name}</h3>
              {p.days.map((d) => (
                <button key={d.id} className="day-button" onClick={() => void start(d)}>
                  <strong>{d.name}</strong>
                  <span className="muted">{d.exercises.length} exercises</span>
                </button>
              ))}
            </div>
          ))}
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
            <button className="day-button" onClick={() => setView({ kind: 'session', session: s })}>
              <strong>{s.name}</strong>
              <span className="muted">{s.sets.length} sets logged</span>
            </button>
          </li>
        ))}
      </ul>
      <button className="primary" onClick={() => setView({ kind: 'start' })}>Start a workout</button>
      <button className="add" onClick={() => setView({ kind: 'records' })}>Records and progress</button>

      <h2 className="plans-head">My plans</h2>
      {plans === null && <p className="muted">Loading…</p>}
      {plans?.length === 0 && <p className="muted">No plan yet. A plan is a few training days, each with its exercises, sets and rep ranges.</p>}
      <ul className="session-list">
        {plans?.map((p) => {
          const b = blockOf(p)!
          return (
            <li key={p.id} className="plan-card">
              <button className="day-button" onClick={() => setView({ kind: 'plan', plan: p })}>
                <strong>{p.name}</strong>
                <span className="muted">{p.days.map((d) => d.name).join(' · ')}</span>
                <span className="muted">{weekLabel(b.week, b.hardWeeks)}</span>
              </button>
              <button className="link" aria-label={`Review week for ${p.name}`} onClick={() => setView({ kind: 'review', plan: p })}>
                Review week
              </button>
            </li>
          )
        })}
      </ul>
      <button className="add" onClick={() => setView({ kind: 'plan', plan: { name: '', days: [{ dayIndex: 0, name: '', exercises: [] }] } })}>
        + New plan
      </button>
    </main>
  )
}
