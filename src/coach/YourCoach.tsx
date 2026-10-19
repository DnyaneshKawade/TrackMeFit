import { useEffect, useState } from 'react'
import { localDate } from '../log/types'
import { Chat } from './Chat'
import type { ChatStore } from './chat'
import { CheckInCard } from './CheckIn'
import type { CheckInStore } from './checkIns'
import type { CoachLink, CoachStore } from './store'

export const SHARED_TEXT =
  'Your coach can see your food, workouts, weight, measurements and photos. They see your signup answers, health answers too. They can also set your targets and plans.'

/** Everything a coach sees, shown before the person says yes (T-087). */
const SHARE_LIST = [
  'Your food log and daily targets',
  'Your workouts and workout plans',
  'Your weight, measurements and photos',
  'Your signup answers, health answers too',
  'Your weekly check-ins and messages',
]

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const joinError = (err: unknown) => {
  const message = String((err as Error)?.message)
  return /invite not valid/i.test(message)
    ? 'That code didn’t work. Ask your coach for a new one.'
    : /coach is full/i.test(message)
      ? 'This coach has no space for new clients right now. Ask them about it.'
      : /coach not approved/i.test(message)
        ? 'This coach can’t take clients right now.'
        : 'Couldn’t connect. Check your connection.'
}

/** On the Progress tab: join a coach with their code, or stop sharing (T-026a).
 * The code first shows the coach's name and what they will see; nothing is
 * shared until the person taps "Share with ..." (T-087). */
export function YourCoach({ store, checkIns, chat, today }: { store: CoachStore; checkIns?: CheckInStore; chat?: ChatStore; today?: string }) {
  const [coach, setCoach] = useState<CoachLink | null | undefined>(undefined)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  // The coach's name for the typed code, while the person decides.
  const [asking, setAsking] = useState<string | null>(null)

  useEffect(() => {
    store.myCoach().then(setCoach, () => {
      setCoach(null)
      setError('Couldn’t load your coach. Check your connection.')
    })
  }, [store])

  const look = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return setError('Enter the code your coach sent you.')
    setBusy(true)
    setError(null)
    try {
      setAsking(await store.lookup(code))
    } catch (err) {
      setError(joinError(err))
    }
    setBusy(false)
  }

  const share = async () => {
    setBusy(true)
    setError(null)
    try {
      await store.join(code)
      setCoach(await store.myCoach())
      setCode('')
      setAsking(null)
    } catch (err) {
      setAsking(null)
      setError(joinError(err))
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
            {coach.since && <span className="muted"> Sharing since {shortDate(coach.since)}.</span>}
          </p>
          {coach.paused ? (
            <p className="note">Your coach is paused for now. They can’t see your data or chat. All your data stays yours.</p>
          ) : (
            <p className="muted">{SHARED_TEXT}</p>
          )}
          {confirming ? (
            <div className="actions">
              <span>Stop sharing with {coach.name}?</span>
              <button className="link" disabled={busy} onClick={() => void stop()}>Yes, stop</button>
              <button className="link" disabled={busy} onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          ) : (
            <button className="link" onClick={() => setConfirming(true)}>Stop sharing with your coach</button>
          )}
          {chat && !coach.paused && <Chat store={chat} linkId={coach.id} name={coach.name.split(' ')[0]} />}
          {checkIns && <CheckInCard store={checkIns} today={today ?? localDate()} />}
        </>
      ) : asking !== null ? (
        <div className="share-ask">
          <p>
            This code is from <strong>{asking}</strong>. If you say yes, they will see:
          </p>
          <ul>
            {SHARE_LIST.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="muted">They can also change your targets, meal plan and workout plans. You can stop sharing at any time.</p>
          <div className="actions">
            <button className="primary" disabled={busy} onClick={() => void share()}>Share with {asking}</button>
            <button className="link" disabled={busy} onClick={() => setAsking(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <form onSubmit={look} noValidate>
          <p className="muted">Have a coach? Enter the code they sent you. You see what they will see before you share.</p>
          <span className="weigh-row">
            <input aria-label="Coach code" autoCapitalize="characters" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="primary" disabled={busy}>Next</button>
          </span>
        </form>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}
