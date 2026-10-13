import { useState } from 'react'
import { LANDMARKS, type Muscle } from '../engine/training'
import { EQUIPMENT_NAMES, MUSCLE_NAMES, checkNewExercise, searchExercises, type Equipment, type Exercise, type NewExercise } from './exercises'

/** Favourites and the person's own exercises (T-043b). */
export interface ExerciseLibrary {
  favourites: Set<string>
  setFavourite: (id: string, on: boolean) => Promise<void>
  addCustom: (e: NewExercise) => Promise<Exercise>
}

const MUSCLES = Object.keys(LANDMARKS) as Muscle[]
const EQUIPMENT = Object.keys(EQUIPMENT_NAMES) as Equipment[]

function ExerciseRow({ e, library, onPick, onError }: { e: Exercise; library?: ExerciseLibrary; onPick: (e: Exercise) => void; onError: (m: string | null) => void }) {
  const fav = library?.favourites.has(e.id) ?? false
  return (
    <li className="exercise-row">
      <button onClick={() => onPick(e)}>
        <span className="result-name">{e.name}</span>
        <span className="muted">
          {MUSCLE_NAMES[e.primary]}
          {e.secondary.length ? ` · also ${e.secondary.map((m) => MUSCLE_NAMES[m].toLowerCase()).join(', ')}` : ''}
          {e.id.startsWith('custom:') ? ' · your exercise' : ''}
        </span>
      </button>
      {library && (
        <button className={fav ? 'star on' : 'star'} aria-label={`Favourite ${e.name}`} aria-pressed={fav} onClick={() => {
            onError(null)
            library.setFavourite(e.id, !fav).catch(() => onError('Couldn’t save your favourite. Check your connection.'))
          }}>
          {fav ? '★' : '☆'}
        </button>
      )}
    </li>
  )
}

function NewExerciseForm({ initialName, library, onAdded, onBack }: { initialName: string; library: ExerciseLibrary; onAdded: (e: Exercise) => void; onBack: () => void }) {
  const [form, setForm] = useState<NewExercise>({ name: initialName, primary: 'chest', equipment: 'machine', isolation: false })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const save = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const problem = checkNewExercise(form.name)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      onAdded(await library.addCustom({ ...form, name: form.name.trim() }))
    } catch {
      setError('Couldn’t save the exercise. Check your connection and try again.')
      setBusy(false)
    }
  }
  return (
    <form className="form" aria-label="New exercise" onSubmit={save}>
      <button type="button" className="link" onClick={onBack}>← Back to the list</button>
      <h3>New exercise</h3>
      <label className="field">
        <span>Name</span>
        <input aria-label="Exercise name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
      </label>
      <label className="field">
        <span>Main muscle</span>
        <select aria-label="Main muscle" value={form.primary} onChange={(e) => setForm({ ...form, primary: e.target.value as Muscle })}>
          {MUSCLES.map((m) => (
            <option key={m} value={m}>{MUSCLE_NAMES[m]}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Equipment</span>
        <select aria-label="Equipment" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value as Equipment })}>
          {EQUIPMENT.map((q) => (
            <option key={q} value={q}>{EQUIPMENT_NAMES[q]}</option>
          ))}
        </select>
      </label>
      <label className="check">
        <input type="checkbox" checked={form.isolation} onChange={(e) => setForm({ ...form, isolation: e.target.checked })} />
        <span>Works one joint, like a curl or a leg extension</span>
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy}>Save exercise</button>
    </form>
  )
}

export function ExercisePicker({ onPick, onClose, library }: { onPick: (e: Exercise) => void; onClose: () => void; library?: ExerciseLibrary }) {
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const list = searchExercises(q)
  const favs = library ? list.filter((e) => library.favourites.has(e.id)) : []
  const rest = favs.length ? list.filter((e) => !library!.favourites.has(e.id)) : list

  return (
    <section className="sheet" aria-label="Choose an exercise">
      <header className="sheet-head">
        <h2>Choose an exercise</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      {creating && library ? (
        <NewExerciseForm initialName={q.trim()} library={library} onAdded={onPick} onBack={() => setCreating(false)} />
      ) : (
        <>
          <input className="search" aria-label="Search exercises" placeholder="Search: bench, squat, biceps…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          {library && (
            <div className="shortcuts">
              <button className="chip" onClick={() => setCreating(true)}>+ New exercise</button>
            </div>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          {list.length === 0 && (
            <div className="not-found">
              <p className="muted">No exercise matches “{q}”.</p>
              {library && (
                <button className="link" onClick={() => setCreating(true)}>
                  Add “{q.trim()}” as a new exercise
                </button>
              )}
            </div>
          )}
          {favs.length > 0 && (
            <section aria-label="Favourites">
              <h3>Favourites</h3>
              <ul className="results">
                {favs.map((e) => (
                  <ExerciseRow key={e.id} e={e} library={library} onPick={onPick} onError={setError} />
                ))}
              </ul>
            </section>
          )}
          {favs.length > 0 && rest.length > 0 && <h3>All exercises</h3>}
          <ul className="results">
            {rest.map((e) => (
              <ExerciseRow key={e.id} e={e} library={library} onPick={onPick} onError={setError} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
