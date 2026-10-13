import { useState } from 'react'
import type { Macros } from '../engine/diet'
import { localDate } from '../log/types'
import type { SearchIndex } from '../food/search'
import { estimateDiet, type DietExtra } from './currentDiet'
import { TypicalDay } from './TypicalDay'
import { bmiResult, buildPlan, checkTargetWeight, goalTimeline, paceOptions, waistNote } from './goal'
import {
  ALLERGIES,
  FASTING,
  MAX_OTHER_HEALTH,
  bodySize,
  checkAboutYou,
  healthNotes,
  noDeficit,
  questionsFor,
  type AboutYou,
  type Activity,
  type DietPref,
  type Equipment,
  type Experience,
  type GoalChoice,
  type ProfileInfo,
} from './types'
import '../log/log.css'
import '../training/training.css'
import './profile.css'

export interface OnboardingResult {
  profile: ProfileInfo
  weightKg: number
  waistCm: number | null
  /** Suggested targets the person accepted; null if they'll set their own. */
  targets: Macros | null
}

const ACTIVITY: [Activity, string][] = [
  ['desk', 'Mostly sitting'],
  ['on_feet', 'On my feet a lot'],
  ['physical', 'Physical work'],
]
const EXPERIENCE: [Experience, string][] = [
  ['beginner', 'New, or under a year'],
  ['intermediate', '1 to 3 years'],
  ['advanced', 'More than 3 years'],
]
const EQUIPMENT: [Equipment, string][] = [
  ['gym', 'A gym'],
  ['home', 'Home, with dumbbells'],
  ['none', 'No equipment'],
]
const GOALS: [GoalChoice, string][] = [
  ['lose', 'Lose fat'],
  ['recomp', 'Lose fat and build muscle'],
  ['gain', 'Build muscle and gain weight'],
  ['maintain', 'Stay as I am'],
]
const DIETS: [DietPref, string][] = [
  ['veg', 'Vegetarian'],
  ['eggetarian', 'Eggetarian'],
  ['nonveg', 'Non-veg'],
  ['vegan', 'Vegan'],
  ['jain', 'Jain'],
]
const STEPS = ['About you', 'Health check', 'Training', 'Your goal', 'Food habits', 'A typical day', 'Your plan']

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

/** Several picks plus "None"; `value` empty with `none` true means "none". */
function Multi({
  label,
  options,
  value,
  none,
  onChange,
}: {
  label: string
  options: [string, string][]
  value: string[]
  none: boolean
  onChange: (v: string[], none: boolean) => void
}) {
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k], false)
  return (
    <div className="choice" role="group" aria-label={label}>
      <span>{label}</span>
      {options.map(([k, text]) => (
        <button key={k} type="button" aria-pressed={value.includes(k)} onClick={() => toggle(k)}>
          {text}
        </button>
      ))}
      <button type="button" aria-pressed={none && !value.length} onClick={() => onChange([], true)}>
        None
      </button>
    </div>
  )
}

const fmt = (n: number) => n.toLocaleString('en-IN')

/** First-run questions in short steps, ending with a plan the person can
 * accept or ignore. Everything after the first step has a sensible default
 * or a skip. */
export function Onboarding({
  initial,
  onFinish,
  onSkip,
  loadIndex,
  today = localDate(),
}: {
  initial: ProfileInfo
  onFinish: (r: OnboardingResult) => Promise<void>
  onSkip: () => Promise<void>
  /** Loads the food database for "Add another food". */
  loadIndex?: () => Promise<SearchIndex>
  today?: string
}) {
  const [step, setStep] = useState(0)
  const [about, setAbout] = useState<AboutYou>({
    fullName: initial.fullName,
    sex: initial.sex,
    birthDate: initial.birthDate ?? '',
    heightCm: initial.heightCm === null ? '' : String(initial.heightCm),
    weightKg: '',
    waistCm: '',
  })
  const [p, setP] = useState<ProfileInfo>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof AboutYou, string>>>({})
  const [healthDone, setHealthDone] = useState(false)
  const [allergyNone, setAllergyNone] = useState(false)
  const [fastNone, setFastNone] = useState(false)
  const [targetText, setTargetText] = useState(initial.targetWeightKg === null ? '' : String(initial.targetWeightKg))
  const [counts, setCounts] = useState<Record<string, number>>(initial.currentDiet?.counts ?? {})
  const [extras, setExtras] = useState<DietExtra[]>(initial.currentDiet?.extras ?? [])
  const [missing, setMissing] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const patch = (x: Partial<ProfileInfo>) => setP((old) => ({ ...old, ...x }))
  const size = bodySize(about)
  const weightKg = Number(about.weightKg)
  const questions = questionsFor(about.sex)
  const ticked = questions.filter((q) => p.medical[q.key])
  const paces = p.goal && p.experience ? paceOptions(p.goal, p.experience, p.medical) : []
  const targetError = size ? checkTargetWeight(targetText, weightKg, p.goal) : null

  const chooseGoal = (goal: GoalChoice) => {
    const options = p.experience ? paceOptions(goal, p.experience, p.medical) : []
    patch({ goal, goalRate: options[0]?.rate ?? 0 })
  }

  /** The profile as it would be saved, with the first step's answers. */
  const merged = (): ProfileInfo => ({
    ...p,
    fullName: about.fullName.trim(),
    sex: about.sex,
    birthDate: about.birthDate,
    heightCm: Number(about.heightCm),
    // Answers to questions that don't apply (e.g. pregnancy for men) are dropped.
    medical: Object.fromEntries(questions.map((q) => [q.key, !!p.medical[q.key]])),
    targetWeightKg: (p.goal === 'lose' || p.goal === 'gain') && targetText.trim() && !targetError ? Number(targetText) : null,
    currentDiet: estimateDiet(counts, extras).kcal ? estimateDiet(counts, extras) : null,
  })

  const next = () => {
    setMissing(null)
    if (step === 0) {
      const found = checkAboutYou(about, today)
      setErrors(found)
      if (Object.keys(found).length) return
    }
    if (step === 1 && !healthDone) return setMissing('Tick anything that applies, or choose “None of these”.')
    if (step === 2 && (!p.activity || p.trainingDays === null || !p.experience || !p.equipment))
      return setMissing('Answer all four to continue.')
    if (step === 3) {
      if (!p.goal) return setMissing('Pick a goal to continue.')
      if (targetError) return setMissing(targetError)
    }
    if (step === 4 && !p.dietPref) return setMissing('Pick what you eat to continue.')
    setStep(step + 1)
  }

  const finish = async (targets: Macros | null) => {
    setBusy(true)
    setSaveError(null)
    try {
      await onFinish({
        profile: { ...merged(), onboardedAt: new Date().toISOString() },
        weightKg,
        waistCm: about.waistCm.trim() ? Number(about.waistCm) : null,
        targets,
      })
    } catch {
      setSaveError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  const skip = async () => {
    setBusy(true)
    try {
      await onSkip()
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
  const text = (key: keyof Omit<AboutYou, 'sex'>, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = { inputMode: 'decimal' }) =>
    field(key, label, <input aria-label={label} value={about[key]} onChange={(e) => setAbout({ ...about, [key]: e.target.value })} {...extra} />)

  const diet = estimateDiet(counts, extras)
  const plan = step === STEPS.length - 1 ? buildPlan(merged(), weightKg, today) : null

  return (
    <main className="log onboarding">
      <div className="progress-bar" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <p className="muted step-count">
        Step {step + 1} of {STEPS.length}
      </p>
      <h1>{STEPS[step]}</h1>

      {step === 0 && (
        <>
          <p className="muted">
            This sets your starting point. You can change it later.{' '}
            <button type="button" className="link inline" onClick={() => void skip()} disabled={busy}>
              Skip setup and start logging
            </button>
          </p>
          {text('fullName', 'Your name', {})}
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
          {text('birthDate', 'Date of birth', { type: 'date', max: today })}
          <div className="two">
            {text('heightCm', 'Height (cm)')}
            {text('weightKg', 'Weight today (kg)')}
          </div>
          {size && (
            <p className="info" role="status" aria-label="BMI">
              {bmiResult(size.weightKg, size.heightCm).message}
            </p>
          )}
          {text('waistCm', 'Waist at the belly button (cm, optional)')}
          {about.sex && Number(about.waistCm) >= 30 && Number(about.waistCm) <= 250 && <p className="muted">{waistNote(Number(about.waistCm), about.sex)}</p>}
        </>
      )}

      {step === 1 && (
        <>
          <p className="muted">Tick anything that applies. Only you, and a coach you accept, can see this.</p>
          <div className="choice checklist" role="group" aria-label="Health conditions">
            {questions.map((q) => (
              <button
                key={q.key}
                type="button"
                aria-pressed={!!p.medical[q.key]}
                onClick={() => {
                  setHealthDone(true)
                  patch({ medical: { ...p.medical, [q.key]: !p.medical[q.key] } })
                }}
              >
                {q.label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={healthDone && !ticked.length}
              onClick={() => {
                setHealthDone(true)
                patch({ medical: {} })
              }}
            >
              None of these
            </button>
          </div>
          <label className="field">
            <span>Anything else, like other conditions or medicines (optional)</span>
            <textarea
              aria-label="Other conditions or medicines"
              maxLength={MAX_OTHER_HEALTH}
              rows={2}
              value={p.otherHealth}
              onChange={(e) => patch({ otherHealth: e.target.value })}
            />
          </label>
          {ticked.length > 0 && (
            <aside className="doctor-note" role="note" aria-label="Please talk to your doctor">
              <strong>Please talk to your doctor first</strong>
              <ul>
                {healthNotes(p.medical, about.sex).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p>Track Me Fit gives general guidance and doesn’t replace medical advice.</p>
            </aside>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <Choice label="On a normal day you are" options={ACTIVITY} value={p.activity} onChange={(activity) => patch({ activity })} />
          <Choice
            label="Workouts a week"
            options={[0, 1, 2, 3, 4, 5, 6, 7].map((n) => [n, String(n)] as [number, string])}
            value={p.trainingDays}
            onChange={(trainingDays) => patch({ trainingDays })}
          />
          <Choice label="Lifting experience" options={EXPERIENCE} value={p.experience} onChange={(experience) => patch({ experience, goal: null, goalRate: null })} />
          <Choice label="Where you train" options={EQUIPMENT} value={p.equipment} onChange={(equipment) => patch({ equipment })} />
        </>
      )}

      {step === 3 && (
        <>
          <Choice label="Your main goal" options={GOALS} value={p.goal} onChange={chooseGoal} />
          {p.goal === 'lose' && noDeficit(p.medical) && (
            <p className="info">We won’t set a weight-loss pace during pregnancy or breastfeeding. You can still track food and training.</p>
          )}
          {paces.length > 0 && (
            <>
              <div className="choice" role="group" aria-label="Pace">
                <span>Pace</span>
                {paces.map((pace, i) => (
                  <button key={pace.rate} type="button" aria-pressed={p.goalRate === pace.rate} onClick={() => patch({ goalRate: pace.rate })}>
                    {pace.label}
                    {i === 0 && paces.length > 1 ? ' (recommended)' : ''}
                  </button>
                ))}
              </div>
              <p className="muted">{paces.find((x) => x.rate === p.goalRate)?.note}</p>
              <label className="field">
                <span>Target weight (kg, optional)</span>
                <input aria-label="Target weight (kg, optional)" inputMode="decimal" value={targetText} onChange={(e) => setTargetText(e.target.value)} />
                {targetError && <small className="error">{targetError}</small>}
              </label>
              {!targetError && targetText.trim() && p.goalRate ? (
                <p className="info" role="status" aria-label="Goal date">
                  {goalTimeline(weightKg, Number(targetText), p.goalRate, today)?.message}
                </p>
              ) : null}
            </>
          )}
        </>
      )}

      {step === 4 && (
        <>
          <Choice label="What you eat" options={DIETS} value={p.dietPref} onChange={(dietPref) => patch({ dietPref })} />
          <Multi
            label="Food rules"
            options={[['no_onion_garlic', 'No onion or garlic']]}
            value={p.foodRules}
            none={true}
            onChange={(foodRules) => patch({ foodRules })}
          />
          <Multi
            label="Do you fast?"
            options={FASTING}
            value={p.fasting}
            none={fastNone}
            onChange={(fasting, none) => {
              setFastNone(none)
              patch({ fasting })
            }}
          />
          <Multi
            label="Food allergies"
            options={ALLERGIES}
            value={p.allergies}
            none={allergyNone}
            onChange={(allergies, none) => {
              setAllergyNone(none)
              patch({ allergies })
            }}
          />
        </>
      )}

      {step === 5 && (
        <TypicalDay
          counts={counts}
          extras={extras}
          weightKg={weightKg}
          loadIndex={loadIndex}
          onChange={(c, e) => {
            setCounts(c)
            setExtras(e)
          }}
        />
      )}

      {step === 6 && plan && (
        <>
          <section className="plan" aria-label="Your numbers">
            <p>{bmiResult(weightKg, Number(about.heightCm)).message}</p>
            <p>{plan.maintenance.message}</p>
            {plan.intakeNote && <p>{plan.intakeNote}</p>}
            {plan.timeline && <p>{plan.timeline.message}</p>}
          </section>
          {plan.suggested ? (
            <section className="plan-targets" aria-label="Suggested daily targets">
              <h2>Suggested daily targets</h2>
              <dl className="macros">
                <div>
                  <dt>Calories</dt>
                  <dd>{fmt(plan.suggested.kcal)}</dd>
                </div>
                <div>
                  <dt>Protein</dt>
                  <dd>{plan.suggested.proteinG} g</dd>
                </div>
                <div>
                  <dt>Carbs</dt>
                  <dd>{plan.suggested.carbG} g</dd>
                </div>
                <div>
                  <dt>Fat</dt>
                  <dd>{plan.suggested.fatG} g</dd>
                </div>
              </dl>
              <ul className="reasons">
                {plan.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p className="muted">Have a coach or your own numbers? Choose “I’ll set my own” and enter them on the Food tab.</p>
            </section>
          ) : (
            <p className="info">{plan.reasons[0]}</p>
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
            {step === 5 && !diet.kcal ? 'Skip this step' : 'Next'}
          </button>
        ) : plan?.suggested ? (
          <span className="finish">
            <button type="button" className="primary" onClick={() => void finish(plan.suggested)} disabled={busy}>
              Use these targets
            </button>
            <button type="button" className="link" onClick={() => void finish(null)} disabled={busy}>
              I’ll set my own
            </button>
          </span>
        ) : (
          <button type="button" className="primary" onClick={() => void finish(null)} disabled={busy}>
            Start tracking
          </button>
        )}
      </div>
    </main>
  )
}
