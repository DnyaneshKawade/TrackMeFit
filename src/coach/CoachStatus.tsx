// The coach's status on the Clients tab (spec T-042a3). An Approved coach sees
// their clients; anyone else sees where they stand and what to send.

import { ConfirmDelete } from '../ui/ConfirmDelete'
import { useEffect, useState, type ReactNode } from 'react'
import { checkPhotoFile, shrinkImage } from '../progress/photoStore'
import { applyAgainOn, type Certificate, type CoachApprovalStore, type CoachDetails, type CoachStanding } from './approval'
import { CoachSteps } from './CoachSteps'
import '../log/log.css'

const day = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/** Name, phone, city and one certificate: what we need to check a coach (T-099). */
const filledIn = (d: CoachDetails, certs: Certificate[]) => [d.name, d.phone, d.city].every((x) => x.trim()) && certs.length > 0

function DetailsForm({
  store,
  shrink,
  onFilled,
}: {
  store: CoachApprovalStore
  shrink: (f: Blob) => Promise<Blob>
  /** Told whether the saved details are filled in. */
  onFilled?: (filled: boolean) => void
}) {
  const [d, setD] = useState<CoachDetails | null>(null)
  const [saved, setSaved] = useState<CoachDetails | null>(null)
  const [years, setYears] = useState('')
  const [certs, setCerts] = useState<Certificate[]>([])
  const [certName, setCertName] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    store.details().then(
      (x) => {
        setD(x)
        setSaved(x)
        setYears(x.years === null ? '' : String(x.years))
      },
      () => setError('Couldn’t load your details. Check your connection.'),
    )
    store.certificates().then(setCerts, () => undefined)
  }, [store])

  useEffect(() => {
    if (saved) onFilled?.(filledIn(saved, certs))
  }, [saved, certs, onFilled])

  if (!d) return error ? <p className="error" role="alert">{error}</p> : <p className="muted">Loading…</p>
  const set = (k: keyof CoachDetails) => (e: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value })

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setError('')
    const y = years.trim() === '' ? null : Number(years)
    if (y !== null && (!Number.isInteger(y) || y < 0 || y > 60)) return setError('Years coaching must be a number from 0 to 60.')
    try {
      await store.saveDetails({ name: d.name, phone: d.phone, city: d.city, years: y, link: d.link })
      setSaved({ ...d, years: y })
      setMsg('Your details are saved.')
    } catch {
      setError('Couldn’t save. Check your connection.')
    }
  }

  const add = async (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    setMsg('')
    setError('')
    if (!certName.trim()) return setError('Write the certificate name first.')
    const problem = checkPhotoFile(file)
    if (problem) return setError(problem)
    setBusy(true)
    try {
      await store.addCertificate(certName, await shrink(file))
      setCerts(await store.certificates())
      setCertName('')
    } catch {
      setError('Couldn’t add the photo. Check your connection.')
    }
    setBusy(false)
  }

  const remove = async (id: string) => {
    try {
      await store.removeCertificate(id)
      setCerts((list) => list.filter((c) => c.id !== id))
    } catch {
      setError('Couldn’t remove it. Check your connection.')
    }
  }

  return (
    <>
      <form aria-label="Your coach details" onSubmit={(e) => void save(e)}>
        <h3>Your details</h3>
        <label>
          Name your clients see
          <input value={d.name} maxLength={60} onChange={set('name')} />
        </label>
        <label>
          Phone
          <input type="tel" value={d.phone} onChange={set('phone')} />
        </label>
        <label>
          City
          <input value={d.city} onChange={set('city')} />
        </label>
        <label>
          Years coaching
          <input inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} />
        </label>
        <label>
          Instagram or website (if you have one)
          <input value={d.link} onChange={set('link')} />
        </label>
        <button className="primary">Save details</button>
      </form>
      <section aria-label="Certificates">
        <h3>Certificates</h3>
        <p className="muted">Add a photo of each one, like ACE or NASM.</p>
        {certs.length > 0 && (
          <ul className="session-list">
            {certs.map((c) => (
              <li key={c.id}>
                <img src={c.url} alt={c.name} width={80} height={80} />
                <strong>{c.name}</strong>
                <ConfirmDelete label="Remove" ariaLabel={`Remove ${c.name}`} question="Delete this certificate?" onConfirm={() => remove(c.id)} />
              </li>
            ))}
          </ul>
        )}
        <label>
          Certificate name
          <input value={certName} onChange={(e) => setCertName(e.target.value)} />
        </label>
        <label>
          Certificate photo
          <input type="file" accept="image/*" disabled={busy} onChange={(e) => void add(e.currentTarget)} />
        </label>
      </section>
      {msg && <p role="status">{msg}</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </>
  )
}

/** Shows the clients only to an Approved coach. */
export function CoachHome({
  store,
  children,
  shrink = shrinkImage,
  now = new Date(),
}: {
  store: CoachApprovalStore
  children: ReactNode
  shrink?: (f: Blob) => Promise<Blob>
  now?: Date
}) {
  const [s, setS] = useState<CoachStanding | null>(null)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    store.standing().then(setS, () => setError('Couldn’t load your coach account. Check your connection.'))
  }, [store])

  // A decision shown here counts as seen.
  useEffect(() => {
    if (s && !s.seen && s.status !== 'approved') void store.sawStatus().catch(() => undefined)
  }, [s, store])

  if (!s) return <main className="log">{error ? <p className="error" role="alert">{error}</p> : <p className="muted">Loading…</p>}</main>

  const send = async (text: string) => {
    setError('')
    try {
      await store.send(text)
      setAnswer('')
      setS(await store.standing())
    } catch (e) {
      setError(/too soon/.test(String((e as Error)?.message)) ? 'It is too soon to apply again.' : 'Couldn’t send. Check your connection.')
    }
  }

  if (s.status === 'approved')
    return (
      <>
        {!s.seen && (
          <div className="notice" role="status">
            <p>Your coach account is approved. You can invite clients now.</p>
            <button
              className="link"
              onClick={() => {
                setS({ ...s, seen: true })
                void store.sawStatus().catch(() => undefined)
              }}
            >
              OK
            </button>
          </div>
        )}
        {children}
        {/* Approved coaches can still change their details; the status stays (T-093). */}
        <details className="coach-own log">
          <summary>Your coach details</summary>
          <DetailsForm store={store} shrink={shrink} />
        </details>
      </>
    )

  const note = s.note && (
    <p className="note">
      <strong>Note from Track Me Fit:</strong> {s.note}
    </p>
  )
  const againOn = applyAgainOn(s.at)

  return (
    <main className="log coach-status">
      <h2>Clients</h2>
      {(s.status === 'waiting' || s.status === 'needs more') && <CoachSteps states={[filled ? 'done' : 'now', filled ? 'now' : 'later', 'later']} />}
      {s.status === 'waiting' && (
        <section aria-label="Coach status">
          <h3>We’re checking your details</h3>
          <p>We check every new coach before they can take clients.</p>
          <p>Fill in your details below. We will tell you here.</p>
        </section>
      )}
      {s.status === 'needs more' && (
        <section aria-label="Coach status">
          <h3>We need a bit more from you</h3>
          {note}
          <p>Add what is missing below. Then answer and send it.</p>
          <label>
            Your answer
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </label>
          <button className="primary" disabled={!answer.trim()} onClick={() => void send(answer)}>Send for checking</button>
        </section>
      )}
      {s.status === 'not approved' && (
        <section aria-label="Coach status">
          <h3>Your coach account was not approved</h3>
          {note}
          {againOn <= now ? (
            <>
              <p>You can apply again now.</p>
              <button className="primary" onClick={() => void send('')}>Apply again</button>
            </>
          ) : (
            <p>You can apply again on {day(againOn)}.</p>
          )}
        </section>
      )}
      {s.status === 'paused' && (
        <section aria-label="Coach status">
          <h3>Your coach account is paused</h3>
          {note}
          <p>You can’t see clients or make codes for now.</p>
          <p>Your clients keep all their own data.</p>
        </section>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {s.status !== 'paused' && <DetailsForm store={store} shrink={shrink} onFilled={setFilled} />}
    </main>
  )
}
