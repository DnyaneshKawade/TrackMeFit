import { useEffect, useState } from 'react'
import type { Flag } from '../engine/attention'
import { shiftDate, type LogStore } from '../log/types'
import { DietStats } from '../progress/DietStats'
import { Photos } from '../progress/Photos'
import { WeightChartView } from '../progress/Progress'
import type { PhotoStore } from '../progress/photoStore'
import { weightSummary, type ProgressStore, type WeighIn } from '../progress/types'
import { TargetsForm } from '../targets/TargetsForm'
import { describeTarget, type DietTarget, type TargetStore, type TargetValues } from '../targets/types'
import type { ExerciseStore } from '../training/exerciseStore'
import { customExercise, customExercises, setCustomExercises } from '../training/exercises'
import { PlanEditor } from '../training/PlanEditor'
import type { Plan, SessionSummary, WorkoutStore } from '../training/types'
import type { FoodFinder } from '../food/finder'
import type { MealPlanStore } from '../profile/mealPlanStore'
import type { ProfileStore } from '../profile/types'
import { AboutClient } from './AboutClient'
import { Chat } from './Chat'
import { ClientMealPlan } from './ClientMealPlan'
import type { ChatStore } from './chat'
import { ClientCheckIns } from './CheckIn'
import type { CheckInStore } from './checkIns'
import type { ClientRow, Shares } from './store'
import { copyTemplate, joinText, startForWeek } from './templates'

/** A client's data as their coach sees it; row-level security allows the reads and target changes. */
export interface ClientStores {
  log: LogStore
  targets: TargetStore
  progress: ProgressStore
  photos: PhotoStore
  workouts: WorkoutStore
  /** The client's own exercises, read only (T-026d). */
  exercises: ExerciseStore
  /** Weekly check-ins; the coach replies (T-026e). */
  checkIns: CheckInStore
  /** The meal plan the coach can change, and the profile for food rules (T-078). */
  mealPlans?: MealPlanStore
  profile?: ProfileStore
  /** What the client shares beyond the basics (T-096). Without it, everything shows. */
  shares?: () => Promise<Shares>
}

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/** One client's week for their coach (T-026c): what needs attention, targets
 * the coach can change, the meal plan (T-078), weight, food stats, workouts,
 * plans the coach can change (T-026d) and photos. */
export function ClientView({
  client,
  flags,
  stores,
  coachId,
  today,
  chat,
  programs = [],
  loadFoods,
  onBack,
}: {
  client: ClientRow
  flags: Flag[]
  stores: ClientStores
  coachId: string
  today: string
  /** Messages with the client (T-026f). */
  chat?: ChatStore
  /** The coach's program templates, to add to this client (T-026g). */
  programs?: Plan[]
  /** Food search, to add foods to the meal plan (T-078). */
  loadFoods?: () => Promise<FoodFinder>
  onBack: () => void
}) {
  const [target, setTarget] = useState<DietTarget | null | undefined>(undefined)
  const [editing, setEditing] = useState(false)
  const [weighIns, setWeighIns] = useState<WeighIn[] | null>(null)
  const [workouts, setWorkouts] = useState<SessionSummary[] | null>(null)
  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [programId, setProgramId] = useState('')
  const [week, setWeek] = useState(1)
  const [added, setAdded] = useState<string | null>(null)
  // The client's own exercise ids; the coach's own can't be copied to them.
  const [clientOwn, setClientOwn] = useState<Set<string>>(new Set())
  const [shares, setShares] = useState<Shares | null>(null)

  useEffect(() => {
    const failed = () => setError('Couldn’t load all of this client’s data. Check your connection.')
    stores.targets.forDate(today).then(setTarget, () => (setTarget(null), failed()))
    stores.progress.weighIns().then(setWeighIns, () => (setWeighIns([]), failed()))
    stores.workouts.summaries(shiftDate(today, -27), today).then(setWorkouts, () => (setWorkouts([]), failed()))
    stores.workouts.plans().then(setPlans, () => (setPlans([]), failed()))
    // If this fails, nothing private shows; the database hides it anyway.
    if (stores.shares) stores.shares().then(setShares, () => setShares({ photos: false, health: false }))
    else setShares({ photos: true, health: true })
  }, [stores, today])

  // The client's own exercises are known while this page is open, so plans
  // show their names and the coach can pick them. The coach's own come back after.
  useEffect(() => {
    const own = customExercises()
    let live = true
    stores.exercises.custom().then(
      (list) => {
        if (!live) return
        setCustomExercises(list.map((x) => customExercise(x.id, x)))
        setClientOwn(new Set(list.map((x) => x.id)))
      },
      () => undefined,
    )
    return () => {
      live = false
      setCustomExercises(own)
    }
  }, [stores])

  const savePlan = async (p: Plan) => {
    await stores.workouts.savePlan(p)
    setPlans(await stores.workouts.plans())
    setPlan(null)
  }

  const program = programs.find((p) => p.id === programId) ?? programs[0]

  const addProgram = async () => {
    if (!program) return
    const { plan: copy, dropped } = copyTemplate(program, (id) => clientOwn.has(id))
    if (!copy.days.length) return setError('This template only has your own exercises. Add exercises from the library first.')
    try {
      const saved = await stores.workouts.savePlan(copy)
      await stores.workouts.startBlock(saved.id!, startForWeek(today, week))
      setPlans(await stores.workouts.plans())
      setStarting(false)
      setWeek(1)
      setError(null)
      setAdded(
        `Added ${copy.name}. ${joinText(first, week, copy.hardWeeks ?? 4)}` +
          (dropped ? ` ${dropped === 1 ? '1 of your own exercises was' : `${dropped} of your own exercises were`} left out, because ${first} can’t see them.` : ''),
      )
    } catch {
      setError('Couldn’t add the program. Check your connection.')
    }
  }

  const saveTargets = async (v: TargetValues) => {
    setTarget(await stores.targets.save(v, today, 'manual'))
    setEditing(false)
  }

  const summary = weighIns ? weightSummary(weighIns) : null
  const first = client.name.split(' ')[0]

  if (plan) {
    return (
      <main className="log client-view">
        <PlanEditor initial={plan} onSave={savePlan} onClose={() => setPlan(null)} />
      </main>
    )
  }

  return (
    <main className="log progress clients client-view">
      <button className="link back" onClick={onBack}>← All clients</button>
      <h2>{client.name}</h2>
      {error && <p className="error" role="alert">{error}</p>}
      {flags.length ? (
        <ul className="flags" aria-label="Needs attention">
          {flags.map((f) => (
            <li key={f.reason}>{f.reason}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">On track this week.</p>
      )}

      {chat && <Chat store={chat} linkId={client.linkId} name={first} />}

      {stores.profile && shares && (
        <AboutClient
          profile={stores.profile}
          weightKg={weighIns?.length ? weighIns.reduce((a, b) => (b.date > a.date ? b : a)).kg : null}
          first={first}
          today={today}
          healthShared={shares.health}
        />
      )}

      <ClientCheckIns store={stores.checkIns} weighIns={weighIns} first={first} />

      <section aria-label="Targets">
        {editing ? (
          <TargetsForm initial={target ?? null} onSave={saveTargets} onCancel={() => setEditing(false)} />
        ) : (
          <>
            <header className="sheet-head">
              <h3>Daily targets</h3>
              <button className="link" onClick={() => setEditing(true)}>{target ? 'Change targets' : 'Set targets'}</button>
            </header>
            {target === undefined ? (
              <p className="muted">Loading…</p>
            ) : target ? (
              <p>
                {describeTarget(target)}
                <br />
                <span className="muted">
                  {target.setBy === coachId ? 'Set by you' : `Set by ${first}`} from {shortDate(target.startsOn)}.
                </span>
              </p>
            ) : (
              <p className="muted">No targets set yet.</p>
            )}
            <p className="muted">New targets start today. {first} sees them in the food log.</p>
          </>
        )}
      </section>

      {stores.mealPlans && stores.profile && target !== undefined && (
        <ClientMealPlan
          mealPlans={stores.mealPlans}
          profile={stores.profile}
          progress={stores.progress}
          target={target}
          coachId={coachId}
          first={first}
          loadFoods={loadFoods}
        />
      )}

      <section aria-label="Weight">
        <h3>Weight</h3>
        {weighIns === null ? (
          <p className="muted">Loading…</p>
        ) : summary ? (
          <>
            <p>{summary.message}</p>
            <WeightChartView weighIns={weighIns} />
          </>
        ) : (
          <p className="muted">No weigh-ins yet.</p>
        )}
      </section>

      <DietStats log={stores.log} targets={stores.targets} today={today} />

      <section aria-label="Workouts">
        <h3>Workouts in the last 4 weeks</h3>
        {workouts === null ? (
          <p className="muted">Loading…</p>
        ) : workouts.length ? (
          <ul className="weigh-list">
            {workouts.map((w) => (
              <li key={w.id}>
                <span>{shortDate(w.performedOn)}</span>
                <strong>{w.name}</strong>
                <span className="muted">{w.exerciseIds.length === 1 ? '1 exercise' : `${w.exerciseIds.length} exercises`}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No workouts logged in the last 4 weeks.</p>
        )}
      </section>

      <section aria-label="Workout plans">
        <h3>Workout plans</h3>
        {plans === null ? (
          <p className="muted">Loading…</p>
        ) : plans.length ? (
          <ul className="session-list">
            {plans.map((p) => (
              <li key={p.id} className="plan-card">
                <div>
                  <strong>{p.name}</strong>
                  <br />
                  <span className="muted">{p.days.map((d) => d.name).join(' · ')}</span>
                  {p.changedBy && (
                    <>
                      <br />
                      <span className="muted">
                        {p.changedBy === coachId ? 'Changed by you' : `Changed by ${first}`}
                        {p.changedOn ? ` on ${shortDate(p.changedOn)}` : ''}.
                      </span>
                    </>
                  )}
                </div>
                <button className="link" aria-label={`Edit ${p.name}`} onClick={() => setPlan(p)}>Edit</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No plan yet.</p>
        )}
        <button className="add" onClick={() => setPlan({ name: '', days: [{ dayIndex: 0, name: '', exercises: [] }] })}>+ New plan</button>
        {programs.length > 0 &&
          (starting && program ? (
            <div className="start-program">
              <label className="field">
                <span>Program</span>
                <select value={program.id} onChange={(e) => (setProgramId(e.target.value), setWeek(1))}>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Start at week</span>
                <select value={week} onChange={(e) => setWeek(Number(e.target.value))}>
                  {Array.from({ length: program.hardWeeks ?? 4 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </label>
              <p className="muted">{joinText(first, week, program.hardWeeks ?? 4)}</p>
              <div className="actions">
                <button className="primary" onClick={() => void addProgram()}>Add to {first}’s plans</button>
                <button className="link" onClick={() => setStarting(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="add" onClick={() => (setStarting(true), setAdded(null))}>+ Start a program</button>
          ))}
        {added && <p className="muted" role="status">{added}</p>}
      </section>

      {shares?.photos ? (
        <Photos store={stores.photos} today={today} readOnly />
      ) : (
        shares && (
          <section aria-label="Progress photos" className="photos">
            <h3>Progress photos</h3>
            <p className="muted">Not shared. {first} can share photos from their Progress page.</p>
          </section>
        )
      )}
    </main>
  )
}
