import { useState } from 'react'
import { localDate } from '../log/types'
import {
  checkAboutYou,
  healthNotes,
  questionsFor,
  type AboutYou,
  type Activity,
  type DietPref,
  type Experience,
  type GoalChoice,
  type ProfileInfo,
} from './types'
import '../log/log.css'
import '../training/training.css'
import './profile.css'

const ACTIVITY: [Activity, string][] = [
  ['desk', 'Mostly sitting'],
  ['on_feet', 'On my feet a lot'],
  ['physical', 'Physical work'],
]
const EXPERIENCE: [Experience, string][] = [
  ['beginner', 'New to lifting'],
  ['intermediate', '1 to 3 years'],
  ['advanced', 'More than 3 years'],
]
const GOALS: [GoalChoice, string][] = [
  ['lose', 'Lose fat'],
  ['maintain', 'Stay as I am'],
  ['gain', 'Build muscle and gain weight'],
  ['recomp', 'Lose fat and build muscle'],
]
const DIETS: [DietPref, string][] = [
  ['veg', 'Vegetarian'],
  ['eggetarian', 'Eggetarian'],
  ['nonveg', 'Non-veg'],
  ['vegan', 'Vegan'],
  ['jain', 'Jain'],
]
const STEPS = ['About you', 'Your day', 'Your goal', 'Health check']

function Choice<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: [T, string][]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="choice" role="group" aria-label={label}>
      <span>{label}</span>
      {options.map(([v, text]) => (
        <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  )
}

/** First-run questions: four short steps, then the app. */
export function Onboarding({
  initial,
  onFinish,
  today = localDate(),
}: {
  initial: ProfileInfo
  onFinish: (profile: ProfileInfo, weightKg: number) => Promise<void>
  today?: string
}) {
  const [step, setStep] = useState(0)
  const [about, setAbout] = useState<AboutYou>({
    fullName: initial.fullName,
    sex: initial.sex,
    birthDate: initial.birthDate ?? '',
    heightCm: initial.heightCm === null ? '' : String(initial.heightCm),
    weightKg: '',
  })
  const [p, setP] = useState<ProfileInfo>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof AboutYou, string>>>({})
  const [missing, setMissing] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const patch = (x: Partial<ProfileInfo>) => setP((old) => ({ ...old, ...x }))

  const next = () => {
    setMissing(null)
    if (step === 0) {
      const found = checkAboutYou(about, today)
      setErrors(found)
      if (Object.keys(found).length) return
    }
    if (step === 1 && (!p.activity || p.trainingDays === null || !p.experience)) return setMissing('Answer all three to continue.')
    if (step === 2 && (!p.goal || !p.dietPref)) return setMissing('Answer both to continue.')
    setStep(step + 1)
  }

  const questions = questionsFor(about.sex)
  const notes = healthNotes(p.medical, about.sex)
  const answeredAll = questions.every((q) => p.medical[q.key] !== undefined)

  const finish = async () => {
    if (!answeredAll) return setMissing('Answer each question with yes or no.')
    // Answers for questions that don't apply (e.g. pregnancy for men) are dropped.
    const medical = Object.fromEntries(questions.map((q) => [q.key, p.medical[q.key]]))
    const profile: ProfileInfo = {
      ...p,
      fullName: about.fullName.trim(),
      sex: about.sex,
      birthDate: about.birthDate,
      heightCm: Number(about.heightCm),
      medical,
    }
    setBusy(true)
    setSaveError(null)
    try {
      await onFinish(profile, Number(about.weightKg))
    } catch {
      setSaveError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  const field = (key: keyof AboutYou, label: string, input: React.ReactNode) => (
    <label className="field">
      <span>{label}</span>
      {input}
      {errors[key] && <small className="error">{errors[key]}</small>}
    </label>
  )

  return (
    <main className="log onboarding">
      <p className="muted step-count">
        Step {step + 1} of {STEPS.length}
      </p>
      <h1>{STEPS[step]}</h1>

      {step === 0 && (
        <>
          <p className="muted">This sets your starting point. You can change it later.</p>
          {field(
            'fullName',
            'Your name',
            <input aria-label="Your name" value={about.fullName} onChange={(e) => setAbout({ ...about, fullName: e.target.value })} />,
          )}
          <Choice
            label="Sex"
            options={[
              ['male', 'Male'],
              ['female', 'Female'],
            ]}
            value={about.sex}
            onChange={(sex) => setAbout({ ...about, sex })}
          />
          {errors.sex && <small className="error">{errors.sex}</small>}
          {field(
            'birthDate',
            'Date of birth',
            <input aria-label="Date of birth" type="date" max={today} value={about.birthDate} onChange={(e) => setAbout({ ...about, birthDate: e.target.value })} />,
          )}
          <div className="two">
            {field(
              'heightCm',
              'Height (cm)',
              <input aria-label="Height (cm)" inputMode="decimal" value={about.heightCm} onChange={(e) => setAbout({ ...about, heightCm: e.target.value })} />,
            )}
            {field(
              'weightKg',
              'Weight today (kg)',
              <input aria-label="Weight today (kg)" inputMode="decimal" value={about.weightKg} onChange={(e) => setAbout({ ...about, weightKg: e.target.value })} />,
            )}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <Choice label="On a normal day you are" options={ACTIVITY} value={p.activity} onChange={(activity) => patch({ activity })} />
          <Choice
            label="Workouts a week"
            options={[0, 1, 2, 3, 4, 5, 6, 7].map((n) => [n, String(n)] as [number, string])}
            value={p.trainingDays}
            onChange={(trainingDays) => patch({ trainingDays })}
          />
          <Choice label="Lifting experience" options={EXPERIENCE} value={p.experience} onChange={(experience) => patch({ experience })} />
        </>
      )}

      {step === 2 && (
        <>
          <Choice label="Your main goal" options={GOALS} value={p.goal} onChange={(goal) => patch({ goal })} />
          <Choice label="What you eat" options={DIETS} value={p.dietPref} onChange={(dietPref) => patch({ dietPref })} />
        </>
      )}

      {step === 3 && (
        <>
          <p className="muted">Do you have any of these? Your answers are private; only you and a coach you accept can see them.</p>
          {questions.map((q) => (
            <Choice
              key={q.key}
              label={q.label}
              options={[
                ['yes', 'Yes'],
                ['no', 'No'],
              ]}
              value={p.medical[q.key] === undefined ? null : p.medical[q.key] ? 'yes' : 'no'}
              onChange={(v) => patch({ medical: { ...p.medical, [q.key]: v === 'yes' } })}
            />
          ))}
          {notes.length > 0 && (
            <aside className="doctor-note" role="note" aria-label="Please talk to your doctor">
              <strong>Please talk to your doctor first</strong>
              <ul>
                {notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p>Track Me Fit gives general guidance and doesn’t replace medical advice.</p>
            </aside>
          )}
        </>
      )}

      {missing && <p className="error">{missing}</p>}
      {saveError && <p className="error">{saveError}</p>}

      <div className="step-buttons">
        {step > 0 && (
          <button type="button" className="link" onClick={() => setStep(step - 1)} disabled={busy}>
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="primary" onClick={next}>
            Next
          </button>
        ) : (
          <button type="button" className="primary" onClick={() => void finish()} disabled={busy}>
            {busy ? 'Saving…' : 'Start tracking'}
          </button>
        )}
      </div>
    </main>
  )
}
