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
import type { SessionSummary, WorkoutStore } from '../training/types'
import type { ClientRow } from './store'

/** A client's data as their coach sees it; row-level security allows the reads and target changes. */
export interface ClientStores {
  log: LogStore
  targets: TargetStore
  progress: ProgressStore
  photos: PhotoStore
  workouts: WorkoutStore
}

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/** One client's week for their coach (T-026c): what needs attention, targets
 * the coach can change, weight, food stats, workouts and photos. */
export function ClientView({
  client,
  flags,
  stores,
  coachId,
  today,
  onBack,
}: {
  client: ClientRow
  flags: Flag[]
  stores: ClientStores
  coachId: string
  today: string
  onBack: () => void
}) {
  const [target, setTarget] = useState<DietTarget | null | undefined>(undefined)
  const [editing, setEditing] = useState(false)
  const [weighIns, setWeighIns] = useState<WeighIn[] | null>(null)
  const [workouts, setWorkouts] = useState<SessionSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const failed = () => setError('Couldn’t load all of this client’s data. Check your connection.')
    stores.targets.forDate(today).then(setTarget, () => (setTarget(null), failed()))
    stores.progress.weighIns().then(setWeighIns, () => (setWeighIns([]), failed()))
    stores.workouts.summaries(shiftDate(today, -27), today).then(setWorkouts, () => (setWorkouts([]), failed()))
  }, [stores, today])

  const saveTargets = async (v: TargetValues) => {
    setTarget(await stores.targets.save(v, today, 'manual'))
    setEditing(false)
  }

  const summary = weighIns ? weightSummary(weighIns) : null
  const first = client.name.split(' ')[0]

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

      <Photos store={stores.photos} today={today} readOnly />
    </main>
  )
}
