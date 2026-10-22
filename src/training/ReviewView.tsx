import { useEffect, useState } from 'react'
import { shiftDate } from '../log/types'
import { MUSCLE_NAMES } from './exercises'
import { reviewWeek, type Feedback, type WeekReview } from './progression'
import type { PastSession, Plan, WorkoutStore } from './types'

/** Suggested changes for next week. Nothing changes until the person taps Apply. */
export function ReviewView({
  store,
  plan,
  today,
  week,
  skips,
  beginner,
  onDone,
}: {
  store: WorkoutStore
  plan: Plan
  today: string
  week: number
  /** Workouts skipped this week, as a sentence (T-110). */
  skips?: string | null
  /** Beginners add one set at most (T-082g). */
  beginner?: boolean
  onDone: () => void
}) {
  const hardWeeks = plan.hardWeeks ?? 4
  const started = plan.blockStartedOn ?? today
  const [data, setData] = useState<{ histories: Record<string, PastSession[]>; feedback: Feedback[] } | null>(null)
  const [runDown, setRunDown] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    const ids = [...new Set(plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId)))]
    // Answers from the last 7 days, so a review on any day covers a full week.
    Promise.all([Promise.all(ids.map((id) => store.history(id, shiftDate(today, 1), 3))), store.feedbackSince(shiftDate(today, -6))]).then(
      ([hs, feedback]) => live && setData({ histories: Object.fromEntries(ids.map((id, i) => [id, hs[i]])), feedback }),
      () => live && setError('Couldn’t load your training. Check your connection.'),
    )
    return () => {
      live = false
    }
  }, [store, plan, today])

  const review: WeekReview | null = data ? reviewWeek({ plan, week, hardWeeks, histories: data.histories, feedback: data.feedback, runDown, beginner }) : null
  const changes = review ? review.muscles.filter((m) => m.nextSets !== m.sets || m.swaps.some((s) => s.to)) : []

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn()
      onDone()
    } catch {
      setError('Couldn’t save. Check your connection and try again.')
    }
  }

  return (
    <section className="sheet review" aria-label="Week review">
      <header className="sheet-head">
        <h2>{plan.name}: week review</h2>
        <button className="link" onClick={onDone}>Close</button>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      {week < 1 && (
        <p>This is your light week (in gyms it is called a deload). The new block starts on {started}. Check your week again after a week of training.</p>
      )}
      {week >= 1 && !review && !error && <p className="muted">Loading…</p>}
      {week >= 1 && review && (
        <>
          <p>{review.why}</p>
          {skips && <p className="muted">{skips}</p>}
          <label className="pain">
            <input type="checkbox" checked={runDown} onChange={(e) => setRunDown(e.target.checked)} /> I feel tired overall (poor sleep, low energy, joint pain)
          </label>
          {review.deload ? (
            <>
              <p>
                For one week, do half your sets at your week-1 weights. Stop while you could still do 4 more reps. Then start a new block.
              </p>
              <button className="primary" onClick={() => act(() => store.startBlock(plan.id!, shiftDate(today, 7)))}>
                Light week now, new block next week
              </button>
            </>
          ) : (
            <>
              <ul className="review-list">
                {review.muscles.map((m) => (
                  <li key={m.muscle}>
                    <strong>
                      {MUSCLE_NAMES[m.muscle]}: {m.sets === m.nextSets ? `${m.sets} sets` : `${m.sets} → ${m.nextSets} sets`}
                    </strong>
                    <span className="muted">{m.why}</span>
                    {m.swaps.map((s) => (
                      <span key={s.from} className="muted">{s.why}</span>
                    ))}
                    {m.decision?.swapExercise && !m.swaps.length && <span className="muted">Try a different exercise for this muscle.</span>}
                  </li>
                ))}
              </ul>
              {changes.length > 0 ? (
                <button className="primary" onClick={() => act(() => store.savePlan(review.proposed))}>
                  Apply these changes
                </button>
              ) : (
                <p className="muted">No changes to make this week.</p>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}
