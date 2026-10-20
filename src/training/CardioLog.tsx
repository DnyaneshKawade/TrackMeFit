// Cardio in a workout (spec T-114): pick a machine or walk, then log the
// time and distance. Records show the farthest, longest and fastest.

import { useEffect, useMemo, useState } from 'react'
import { cardioRecords, cardioText, checkCardio, durationText, parseDuration, speedKmh, type CardioEntry } from '../engine/cardio'
import { useSync } from '../sync/useSync'
import { CARDIO, cardioById, type CardioExercise } from './cardio'
import type { PastSession, Session, WorkoutStore } from './types'

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export function CardioPicker({ onPick, onClose }: { onPick: (c: CardioExercise) => void; onClose: () => void }) {
  return (
    <section className="cardio-picker" aria-label="Add cardio">
      <p className="muted">Pick the cardio you did.</p>
      <div className="set-extras">
        {CARDIO.map((c) => (
          <button key={c.id} className="chip" onClick={() => onPick(c)}>
            {c.name}
          </button>
        ))}
      </div>
      <button className="link" onClick={onClose}>Cancel</button>
    </section>
  )
}

export function CardioLog({
  store,
  session,
  cardio,
  onChange,
  onDetail,
}: {
  store: WorkoutStore
  session: Session
  cardio: CardioExercise
  onChange: (s: Session) => void
  onDetail: () => void
}) {
  const [time, setTime] = useState('')
  const [distance, setDistance] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { pending } = useSync(store.sync)
  const done = session.sets.filter((s) => s.exerciseId === cardio.id).sort((a, b) => a.setIndex - b.setIndex)

  const log = async () => {
    const seconds = parseDuration(time)
    const km = cardio.distance && distance.trim() ? Number(distance.replace(',', '.')) : null
    const problem = checkCardio(km, seconds)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      const setIndex = done.reduce((m, s) => Math.max(m, s.setIndex + 1), 0)
      const saved = await store.addSet(session.id, {
        exerciseId: cardio.id,
        setIndex,
        weightKg: 0,
        reps: 0,
        rir: null,
        seconds: seconds!,
        ...(km !== null ? { distanceKm: Math.round(km * 100) / 100 } : {}),
      })
      onChange({ ...session, sets: [...session.sets, saved] })
      setTime('')
      setDistance('')
    } catch {
      setError('Couldn’t save it. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    try {
      await store.removeSet(id)
      onChange({ ...session, sets: session.sets.filter((s) => s.id !== id) })
    } catch {
      setError('Couldn’t remove it. Try again.')
    }
  }

  return (
    <section className="exercise" aria-label={cardio.name}>
      <header>
        <h3>{cardio.name}</h3>
        <button className="link history-link" aria-label={`History for ${cardio.name}`} onClick={onDetail}>
          History
        </button>
      </header>
      <ol className="sets">
        {done.map((s, i) => (
          <li key={s.id}>
            <span>
              {cardioText(s)}
              {pending.has(s.id) && <span className="muted"> · Waiting for internet</span>}
            </span>
            <button className="link" aria-label={`Remove entry ${i + 1} of ${cardio.name}`} onClick={() => void remove(s.id)}>✕</button>
          </li>
        ))}
      </ol>
      <div className="set-row">
        <input aria-label={`${cardio.name} time`} placeholder="Time, like 25:30" inputMode="numeric" value={time} onChange={(e) => setTime(e.target.value)} />
        {cardio.distance && (
          <input aria-label={`${cardio.name} distance (km)`} placeholder="km" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} />
        )}
        <button className="primary" disabled={busy} onClick={log}>Log</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

/** One cardio move's records and past entries, newest first. */
export function CardioDetail({ store, exerciseId, backLabel = '← All exercises', onBack }: { store: WorkoutStore; exerciseId: string; backLabel?: string; onBack: () => void }) {
  const cardio = cardioById.get(exerciseId)
  const [history, setHistory] = useState<PastSession[] | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let live = true
    store.exerciseHistory(exerciseId).then(
      (h) => live && setHistory(h),
      () => live && setError(true),
    )
    return () => {
      live = false
    }
  }, [store, exerciseId])
  const entries = useMemo(
    () => (history ?? []).flatMap((h) => h.sets.filter((s) => s.seconds).map((s): CardioEntry & { id: string } => ({ id: s.id, performedOn: h.performedOn, seconds: s.seconds, distanceKm: s.distanceKm }))),
    [history],
  )
  const records = cardioRecords(entries)
  return (
    <section aria-label={cardio?.name ?? 'Cardio'}>
      <button className="link" onClick={onBack}>{backLabel}</button>
      <h3>{cardio?.name ?? 'Cardio'}</h3>
      {error && <p className="error">Couldn’t load the history. Check your connection.</p>}
      {!error && !history && <p className="muted">Loading…</p>}
      {history && !entries.length && <p className="muted">Nothing logged yet.</p>}
      <dl className="records">
        {records.farthest && (
          <div>
            <dt>Farthest</dt>
            <dd>{cardioText(records.farthest)} <span className="muted">· {shortDate(records.farthest.performedOn)}</span></dd>
          </div>
        )}
        {records.longest && (
          <div>
            <dt>Longest</dt>
            <dd>{durationText(records.longest.seconds!)} <span className="muted">· {shortDate(records.longest.performedOn)}</span></dd>
          </div>
        )}
        {records.fastest && (
          <div>
            <dt>Fastest</dt>
            <dd>{speedKmh(records.fastest.distanceKm!, records.fastest.seconds!)} km/h <span className="muted">· {shortDate(records.fastest.performedOn)}</span></dd>
          </div>
        )}
      </dl>
      <ul className="session-list" aria-label="Past entries">
        {entries.map((e) => (
          <li key={e.id}>
            <strong>{shortDate(e.performedOn)}</strong> <span className="muted">· {cardioText(e)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
