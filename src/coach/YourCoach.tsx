import { useEffect, useState } from 'react'
import type { CoachLink, CoachStore } from './store'

export const SHARED_TEXT = 'Your coach can see your food, workouts, weight, measurements and photos. They can also set your targets and plans.'

/** On the Progress tab: join a coach with their code, or stop sharing (T-026a). */
export function YourCoach({ store }: { store: CoachStore }) {
  const [coach, setCoach] = useState<CoachLink | null | undefined>(undefined)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    store.myCoach().then(setCoach, () => {
      setCoach(null)
      setError('Couldn’t load your coach. Check your connection.')
    })
  }, [store])

  const join = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return setError('Enter the code your coach sent you.')
    setBusy(true)
    setError(null)
    try {
      await store.join(code)
      setCoach(await store.myCoach())
      setCode('')
    } catch (err) {
      setError(/invite not valid/i.test(String((err as Error)?.message)) ? 'That code didn’t work. Ask your coach for a new one.' : 'Couldn’t connect. Check your connection.')
    }
    setBusy(false)
  }

  const stop = async () => {
    if (!coach) return
    setBusy(true)
    try {
      await store.end(coach.id)
      setCoach(null)
      setConfirming(false)
      setError(null)
    } catch {
      setError('Couldn’t stop sharing. Check your connection.')
    }
    setBusy(false)
  }

  if (coach === undefined) return null
  return (
    <section aria-label="Your coach" className="your-coach">
      <h3>Your coach</h3>
      {coach ? (
        <>
          <p>
            You’re working with <strong>{coach.name}</strong>.
          </p>
          <p className="muted">{SHARED_TEXT}</p>
          {confirming ? (
            <div className="actions">
              <span>Stop sharing with {coach.name}?</span>
              <button className="link" disabled={busy} onClick={() => void stop()}>Yes, stop</button>
              <button className="link" disabled={busy} onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          ) : (
            <button className="link" onClick={() => setConfirming(true)}>Stop sharing with your coach</button>
          )}
        </>
      ) : (
        <form onSubmit={join} noValidate>
          <p className="muted">Have a coach? Enter the code they sent you. {SHARED_TEXT}</p>
          <span className="weigh-row">
            <input aria-label="Coach code" autoCapitalize="characters" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="primary" disabled={busy}>Join</button>
          </span>
        </form>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}
