// The family part of the Account page (spec T-086). A teen sees which parent
// said yes. An adult enters their child's code, says yes, or takes it back.

import { useEffect, useState } from 'react'
import { familyError, type Child, type FamilyStore } from './family'

const day = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function TeenPart({ store }: { store: FamilyStore }) {
  const [parent, setParent] = useState<{ name: string; since: string } | null | undefined>(undefined)
  useEffect(() => {
    store.myParent().then(setParent, () => setParent(null))
  }, [store])
  if (!parent) return null
  return (
    <section aria-label="Your parent">
      <h3>Your parent</h3>
      <p>
        <strong>{parent.name}</strong> said yes on {day(parent.since)}. They can take it back at any time.
      </p>
    </section>
  )
}

function ParentPart({ store }: { store: FamilyStore }) {
  const [children, setChildren] = useState<Child[] | null>(null)
  const [code, setCode] = useState('')
  const [asking, setAsking] = useState<string | null>(null)
  const [ending, setEnding] = useState<Child | null>(null)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const load = () => store.children().then(setChildren, () => setChildren([]))
  useEffect(() => {
    void load()
  }, [store]) // eslint-disable-line react-hooks/exhaustive-deps
  const run = async (fn: () => Promise<void>) => {
    setError('')
    setNote('')
    try {
      await fn()
    } catch (e) {
      setError(familyError(e))
    }
  }

  return (
    <section aria-label="Your child">
      <h3>Your child</h3>
      {children?.map((c) =>
        ending?.id === c.id ? (
          <div key={c.id} className="confirm">
            <p>Take back your yes? {c.name} can’t use the app until a parent says yes again.</p>
            <span className="actions">
              <button
                className="primary danger"
                onClick={() =>
                  void run(async () => {
                    await store.takeBack(c.id)
                    setEnding(null)
                    setNote(`You took back your yes for ${c.name}.`)
                    await load()
                  })
                }
              >
                Yes, take it back
              </button>
              <button className="link" onClick={() => setEnding(null)}>Cancel</button>
            </span>
          </div>
        ) : (
          <p key={c.id}>
            You said yes for <strong>{c.name}</strong> on {day(c.since)}.{' '}
            <button className="link" onClick={() => setEnding(c)}>Take back my yes for {c.name}</button>
          </p>
        ),
      )}
      {asking ? (
        <div className="confirm">
          <p>This code is from {asking}. If you say yes, {asking} can use Track Me Fit.</p>
          <ul>
            <li>We keep their food, weight, workouts and photos, like yours.</li>
            <li>Only {asking} sees them. They can’t link to a coach until 18.</li>
            <li>The app won’t ask them to eat less.</li>
            <li>You can take back your yes here at any time.</li>
          </ul>
          <span className="actions">
            <button
              className="primary"
              onClick={() =>
                void run(async () => {
                  const name = await store.sayYes(code)
                  setAsking(null)
                  setCode('')
                  setNote(`You said yes for ${name}.`)
                  await load()
                })
              }
            >
              Say yes for {asking}
            </button>
            <button className="link" onClick={() => setAsking(null)}>Cancel</button>
          </span>
        </div>
      ) : (
        <form
          aria-label="Say yes for your child"
          onSubmit={(e) => {
            e.preventDefault()
            void run(async () => setAsking(await store.lookup(code)))
          }}
        >
          <p className="muted">Is your child under 18? Type the code they see in their app.</p>
          <label>
            Your child’s code
            <input value={code} autoComplete="off" onChange={(e) => setCode(e.target.value)} />
          </label>
          <button className="primary" disabled={!code.trim()}>Next</button>
        </form>
      )}
      {note && <p role="status">{note}</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
  )
}

/** Teens see their parent; adults can say yes for a child. */
export function FamilyPart({ store, teen }: { store: FamilyStore; teen: boolean }) {
  return teen ? <TeenPart store={store} /> : <ParentPart store={store} />
}
