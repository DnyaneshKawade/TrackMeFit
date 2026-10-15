import { useEffect, useState } from 'react'
import type { WeighIn } from '../progress/types'
import { checkAnswers, describeWeekWeight, MAX_NOTE, MAX_REPLY, QUESTIONS, scoreLine, weekLabel, weekStart, weekWeight, type Answers, type CheckIn, type CheckInStore, type Score } from './checkIns'

/** Five 1-to-5 scores and two notes; used by the person (T-026e). */
function CheckInForm({ initial, onSave, onCancel }: { initial: Partial<Answers>; onSave: (a: Answers) => Promise<void>; onCancel?: () => void }) {
  const [a, setA] = useState<Partial<Answers>>({ note: '', ask: '', ...initial })
  const [problems, setProblems] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const save = async () => {
    const found = checkAnswers(a)
    setProblems(found)
    if (found.length) return
    setBusy(true)
    try {
      await onSave(a as Answers)
    } catch {
      setProblems(['Couldn’t send your check-in. Check your connection and try again.'])
      setBusy(false)
    }
  }

  return (
    <div className="check-in-form">
      <p className="muted">1 is poor, 5 is great.</p>
      {QUESTIONS.map((q) => (
        <div key={q.key} className="range" role="group" aria-label={q.label}>
          <span className="check-in-q">{q.label}</span>
          {([1, 2, 3, 4, 5] as Score[]).map((n) => (
            <button key={n} type="button" className={`chip${a[q.key] === n ? ' on' : ''}`} aria-pressed={a[q.key] === n} onClick={() => setA({ ...a, [q.key]: n })}>
              {n}
            </button>
          ))}
        </div>
      ))}
      <label className="field">
        <span>How did the week go?</span>
        <textarea value={a.note} maxLength={MAX_NOTE} onChange={(e) => setA({ ...a, note: e.target.value })} />
      </label>
      <label className="field">
        <span>Anything you need from your coach?</span>
        <textarea value={a.ask} maxLength={MAX_NOTE} onChange={(e) => setA({ ...a, ask: e.target.value })} />
      </label>
      {problems.length > 0 && (
        <ul className="error" role="alert">
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      <button className="primary" disabled={busy} onClick={() => void save()}>Send check-in</button>
      {onCancel && <button className="link" onClick={onCancel}>Cancel</button>}
    </div>
  )
}

/** One check-in with its notes and the coach's reply. */
export function CheckInView({ c, replyLabel }: { c: CheckIn; replyLabel: string }) {
  return (
    <>
      <p>{scoreLine(c)}</p>
      {c.note && <p>“{c.note}”</p>}
      {c.ask && <p><strong>Asked:</strong> {c.ask}</p>}
      {c.reply && (
        <p className="check-in-reply">
          <strong>{replyLabel}</strong> {c.reply}
        </p>
      )}
    </>
  )
}

/** The person's weekly check-in, under "Your coach" on Progress (T-026e). */
export function CheckInCard({ store, today }: { store: CheckInStore; today: string }) {
  const [list, setList] = useState<CheckIn[] | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const monday = weekStart(today)

  useEffect(() => {
    store.list(5).then(setList, () => {
      setList([])
      setError('Couldn’t load your check-ins. Check your connection.')
    })
  }, [store])

  if (list === null) return null
  const now = list.find((c) => c.weekStart === monday)
  const earlier = list.filter((c) => c.weekStart !== monday).slice(0, 4)

  const save = async (a: Answers) => {
    const saved = await store.save(monday, a)
    setList([saved, ...list.filter((c) => c.weekStart !== monday)])
    setEditing(false)
  }

  return (
    <section aria-label="Weekly check-in" className="check-in">
      <h3>Weekly check-in</h3>
      {error && <p className="error" role="alert">{error}</p>}
      {!now || editing ? (
        <>
          <p className="muted">Tell your coach how this week went. It takes a minute.</p>
          <CheckInForm initial={now ?? {}} onSave={save} onCancel={editing ? () => setEditing(false) : undefined} />
        </>
      ) : (
        <>
          <p className="muted">Sent for this week.</p>
          <CheckInView c={now} replyLabel="Your coach:" />
          {!now.reply && (
            <button className="link" onClick={() => setEditing(true)}>
              Change answers
            </button>
          )}
        </>
      )}
      {earlier.length > 0 && (
        <details>
          <summary>Earlier check-ins</summary>
          {earlier.map((c) => (
            <article key={c.id} aria-label={weekLabel(c.weekStart)}>
              <h4>{weekLabel(c.weekStart)}</h4>
              <CheckInView c={c} replyLabel="Your coach:" />
            </article>
          ))}
        </details>
      )}
    </section>
  )
}

/** A client's check-ins for their coach, with the week's weight and a reply box (T-026e). */
export function ClientCheckIns({ store, weighIns, first }: { store: CheckInStore; weighIns: WeighIn[] | null; first: string }) {
  const [list, setList] = useState<CheckIn[] | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    store.list(8).then(setList, () => {
      setList([])
      setError('Couldn’t load check-ins. Check your connection.')
    })
  }, [store])

  const send = async (c: CheckIn) => {
    const text = (drafts[c.id] ?? '').trim()
    if (!text) return setError('Write a reply first.')
    setError(null)
    try {
      const saved = await store.reply(c.id, text)
      setList((l) => l?.map((x) => (x.id === c.id ? saved : x)) ?? null)
    } catch {
      setError('Couldn’t send the reply. Check your connection.')
    }
  }

  return (
    <section aria-label="Check-ins">
      <h3>Weekly check-ins</h3>
      {error && <p className="error" role="alert">{error}</p>}
      {list === null ? (
        <p className="muted">Loading…</p>
      ) : !list.length ? (
        <p className="muted">No check-ins yet. {first} sends one from the Progress tab each week.</p>
      ) : (
        list.map((c) => (
          <article key={c.id} aria-label={weekLabel(c.weekStart)} className="check-in">
            <h4>{weekLabel(c.weekStart)}</h4>
            {weighIns && <p className="muted">{describeWeekWeight(weekWeight(weighIns, c.weekStart))}</p>}
            <CheckInView c={c} replyLabel="You replied:" />
            {!c.reply && (
              <div className="check-in-answer">
                <label className="field">
                  <span>Reply to {first}</span>
                  <textarea value={drafts[c.id] ?? ''} maxLength={MAX_REPLY} onChange={(e) => setDrafts({ ...drafts, [c.id]: e.target.value })} />
                </label>
                <button className="primary" onClick={() => void send(c)}>Send reply</button>
              </div>
            )}
          </article>
        ))
      )}
    </section>
  )
}
