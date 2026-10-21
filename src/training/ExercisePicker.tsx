import { useState } from 'react'
import { LANDMARKS, type Muscle } from '../engine/training'
import { BROWSE_ORDER, EQUIPMENT_NAMES, MUSCLE_NAMES, checkNewExercise, countByMuscle, customExercises, searchExercises, type Equipment, type Exercise, type ExerciseSetting, type NewExercise } from './exercises'

/** Favourites and the person's own exercises (T-043b). */
export interface ExerciseLibrary {
  favourites: Set<string>
  setFavourite: (id: string, on: boolean) => Promise<void>
  addCustom: (e: NewExercise) => Promise<Exercise>
  /** Edit or remove an own exercise (T-043c). */
  updateCustom: (id: string, e: NewExercise) => Promise<Exercise>
  setHidden: (id: string, hidden: boolean) => Promise<void>
  /** Own weight step, rest time and notes for an exercise (T-112). */
  saveSetting?: (s: ExerciseSetting) => Promise<void>
}

const MUSCLES = Object.keys(LANDMARKS) as Muscle[]
const EQUIPMENT = Object.keys(EQUIPMENT_NAMES) as Equipment[]

function ExerciseRow({
  e,
  library,
  onPick,
  onEdit,
  onError,
}: {
  e: Exercise
  library?: ExerciseLibrary
  onPick: (e: Exercise) => void
  onEdit: (e: Exercise) => void
  onError: (m: string | null) => void
}) {
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
      {library && e.id.startsWith('custom:') && (
        <button className="link edit" aria-label={`Edit ${e.name}`} onClick={() => onEdit(e)}>
          Edit
        </button>
      )}
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

function ExerciseForm({
  initialName,
  editing,
  library,
  onSaved,
  onRemoved,
  onBack,
}: {
  initialName: string
  /** The own exercise being changed; none when adding a new one. */
  editing?: Exercise
  library: ExerciseLibrary
  onSaved: (e: Exercise) => void
  onRemoved: (e: Exercise) => void
  onBack: () => void
}) {
  const [form, setForm] = useState<NewExercise>(
    editing
      ? { name: editing.name, primary: editing.primary, equipment: editing.equipment, isolation: editing.isolation }
      : { name: initialName, primary: 'chest', equipment: 'machine', isolation: false },
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const save = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const problem = checkNewExercise(form.name, undefined, editing?.id)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      const e = { ...form, name: form.name.trim() }
      onSaved(editing ? await library.updateCustom(editing.id, e) : await library.addCustom(e))
    } catch {
      setError('Couldn’t save the exercise. Check your connection and try again.')
      setBusy(false)
    }
  }
  const remove = async () => {
    if (!editing) return
    setBusy(true)
    try {
      await library.setHidden(editing.id, true)
      onRemoved(editing)
    } catch {
      setError('Couldn’t remove the exercise. Check your connection and try again.')
      setBusy(false)
    }
  }
  return (
    <form className="form" aria-label={editing ? 'Edit exercise' : 'New exercise'} onSubmit={save}>
      <button type="button" className="link" onClick={onBack}>← Back to the list</button>
      <h3>{editing ? 'Edit exercise' : 'New exercise'}</h3>
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
      <button className="primary" disabled={busy}>{editing ? 'Save changes' : 'Save exercise'}</button>
      {editing && (
        <>
          <button type="button" className="link danger" disabled={busy} onClick={() => void remove()}>
            Remove from my list
          </button>
          <p className="muted">Past sets, records and plans keep this exercise.</p>
        </>
      )}
    </form>
  )
}

export function ExercisePicker({ onPick, onClose, library }: { onPick: (e: Exercise) => void; onClose: () => void; library?: ExerciseLibrary }) {
  const [q, setQ] = useState('')
  // 'new' adds an exercise; an Exercise is one of the person's own being edited.
  const [form, setForm] = useState<'new' | Exercise | null>(null)
  const [removed, setRemoved] = useState<Exercise | null>(null)
  // Bumped when a hidden exercise comes back, to redraw the lists (T-124).
  const [, setBack] = useState(0)
  const hidden = library ? customExercises().filter((e) => e.hidden) : []
  const bringBack = (e: Exercise) => {
    setError(null)
    library!.setHidden(e.id, false).then(
      () => {
        if (removed?.id === e.id) setRemoved(null)
        setBack((n) => n + 1)
      },
      () => setError('Couldn’t bring the exercise back. Check your connection.'),
    )
  }
  const [error, setError] = useState<string | null>(null)
  // Browse by main muscle, as in FitNotes; works with the search too (T-115).
  const [muscle, setMuscle] = useState<Muscle | null>(null)
  const found = searchExercises(q)
  const counts = countByMuscle(found)
  const list = muscle ? found.filter((e) => e.primary === muscle) : found
  const favs = library ? list.filter((e) => library.favourites.has(e.id)) : []
  const rest = favs.length ? list.filter((e) => !library!.favourites.has(e.id)) : list

  return (
    <section className="sheet" aria-label="Choose an exercise">
      <header className="sheet-head">
        <h2>Choose an exercise</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      {form && library ? (
        <ExerciseForm
          initialName={q.trim()}
          editing={form === 'new' ? undefined : form}
          library={library}
          onSaved={(e) => (form === 'new' ? onPick(e) : setForm(null))}
          onRemoved={(e) => {
            setRemoved(e)
            setForm(null)
          }}
          onBack={() => setForm(null)}
        />
      ) : (
        <>
          <input className="search" aria-label="Search exercises" placeholder="Search: bench, squat, biceps…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          <div className="set-extras muscle-chips" role="group" aria-label="Show by muscle">
            <button className="chip" aria-pressed={muscle === null} onClick={() => setMuscle(null)}>All</button>
            {BROWSE_ORDER.filter((m) => counts.has(m) || m === muscle).map((m) => (
              <button key={m} className="chip" aria-pressed={muscle === m} onClick={() => setMuscle(muscle === m ? null : m)}>
                {MUSCLE_NAMES[m]} <span className="muted">{counts.get(m) ?? 0}</span>
              </button>
            ))}
          </div>
          {library && (
            <div className="shortcuts">
              <button className="chip" onClick={() => setForm('new')}>+ New exercise</button>
            </div>
          )}
          {error && <p className="error" role="alert">{error}</p>}
          {removed && library && (
            <p role="status">
              Removed {removed.name} from your list. Past sets stay.{' '}
              <button
                className="link"
                onClick={() => {
                  setError(null)
                  bringBack(removed)
                }}
              >
                Undo
              </button>
            </p>
          )}
          {list.length === 0 && (
            <div className="not-found">
              <p className="muted">{muscle ? `No ${MUSCLE_NAMES[muscle].toLowerCase()} exercise matches “${q}”.` : `No exercise matches “${q}”.`}</p>
              {library && (
                <button className="link" onClick={() => setForm('new')}>
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
                  <ExerciseRow key={e.id} e={e} library={library} onPick={onPick} onEdit={setForm} onError={setError} />
                ))}
              </ul>
            </section>
          )}
          {favs.length > 0 && rest.length > 0 && <h3>All exercises</h3>}
          <ul className="results">
            {rest.map((e) => (
              <ExerciseRow key={e.id} e={e} library={library} onPick={onPick} onEdit={setForm} onError={setError} />
            ))}
          </ul>
          {hidden.length > 0 && !(removed && hidden.length === 1 && hidden[0].id === removed.id) && (
            <details className="hidden-exercises">
              <summary>Removed exercises ({hidden.length})</summary>
              <ul className="results">
                {hidden.map((e) => (
                  <li key={e.id} className="exercise-row">
                    <span className="result-name">{e.name}</span>
                    <button className="link" aria-label={`Bring back ${e.name}`} onClick={() => bringBack(e)}>Bring back</button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  )
}
