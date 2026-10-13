import { useState } from 'react'
import { MUSCLE_NAMES, searchExercises, type Exercise } from './exercises'

export function ExercisePicker({ onPick, onClose }: { onPick: (e: Exercise) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const list = searchExercises(q)
  return (
    <section className="sheet" aria-label="Choose an exercise">
      <header className="sheet-head">
        <h2>Choose an exercise</h2>
        <button className="link" onClick={onClose}>Close</button>
      </header>
      <input className="search" aria-label="Search exercises" placeholder="Search: bench, squat, biceps…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      {list.length === 0 && <p className="muted">No exercise matches “{q}”.</p>}
      <ul className="results">
        {list.map((e) => (
          <li key={e.id}>
            <button onClick={() => onPick(e)}>
              <span className="result-name">{e.name}</span>
              <span className="muted">{MUSCLE_NAMES[e.primary]}{e.secondary.length ? ` · also ${e.secondary.map((m) => MUSCLE_NAMES[m].toLowerCase()).join(', ')}` : ''}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
