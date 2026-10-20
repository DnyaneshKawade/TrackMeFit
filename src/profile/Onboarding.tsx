import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import type { Macros } from '../engine/diet'
import { localDate } from '../log/types'
import type { FoodFinder } from '../food/finder'
import { allowedExtras, dietItemsFor, estimateDiet, type DietExtra } from './currentDiet'
import { NONVEG_OFF_DAYS, NO_ONION_GARLIC, cleanRules, excludedTags, hasNonvegOff, isNonvegOff } from './dietRules'
import { TypicalDay } from './TypicalDay'
import type { AcceptedMealPlan } from './MealPlanStep'
import { bmiResult, buildPlan, checkEventDate, checkTargetWeight, eventNote, goalTimeline, noLossReason, paceOptions, recommendedPace, waistNote, type PaceBody } from './goal'
import {
  ALLERGIES,
  FASTING,
  MAX_OTHER_HEALTH,
  bodySize,
  checkAboutYou,
  healthNotes,
  noAutoMealPlan,
  noDeficit,
  SUGGESTION_NOTE,
  ageOn,
  questionsFor,
  type AboutYou,
  type GoalChoice,
  type ProfileInfo,
} from './types'
import '../log/log.css'
import '../training/training.css'
import './profile.css'
import { HowPlanWorks } from './HowPlanWorks'
import { ACTIVITY, DIETS, EQUIPMENT, EXPERIENCE, GOALS, STEPS } from './labels'

export interface OnboardingResult {
  profile: ProfileInfo
  weightKg: number
  waistCm: number | null
  /** Suggested targets the person accepted; null if they'll set their own. */
  targets: Macros | null
  /** A suggested meal plan the person chose to use, saved with the targets. */
  mealPlan: AcceptedMealPlan | null
}

export { SUGGESTION_NOTE }

// The meal plan screen and engine download only when the plan step shows.
const MealPlanStep = lazy(() => import('./MealPlanStep'))


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
 * or a skip. With `edit`, the same steps change the answers later (T-070). */
export function Onboarding({
  initial,
  onFinish,
  onSkip,
  onBirthDate,
  loadFoods,
  today = localDate(),
  edit,
}: {
  initial: ProfileInfo
  onFinish: (r: OnboardingResult) => Promise<void>
  /** Skips setup; in edit mode, closes without saving. Gets the birth date when it was first given here. */
  onSkip: (birthDate?: string) => Promise<void>
  /** Saves a first birth date as soon as "About you" is done, so the age rule applies at once (T-105). */
  onBirthDate?: (birthDate: string) => Promise<void>
  /** Loads the food database for "Add another food". */
  loadFoods?: () => Promise<FoodFinder>
  today?: string
  /** Changing earlier answers: the latest weight fills the weight box. */
  edit?: { weightKg: number | null; step?: number }
}) {
  const [step, setStep] = useState(edit?.step ?? 0)
  const [about, setAbout] = useState<AboutYou>({
    fullName: initial.fullName,
    sex: initial.sex,
    birthDate: initial.birthDate ?? '',
    heightCm: initial.heightCm === null ? '' : String(initial.heightCm),
    weightKg: edit?.weightKg ? String(edit.weightKg) : '',
    waistCm: '',
  })
  const [p, setP] = useState<ProfileInfo>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof AboutYou, string>>>({})
  // Earlier answers count as given, including "None of these".
  const [healthDone, setHealthDone] = useState(!!edit)
  const [allergyNone, setAllergyNone] = useState(!!edit && !initial.allergies.length)
  const [fastNone, setFastNone] = useState(!!edit && !initial.fasting.length)
  const [targetText, setTargetText] = useState(initial.targetWeightKg === null ? '' : String(initial.targetWeightKg))
  const [eventText, setEventText] = useState(initial.eventDate ?? '')
  const [counts, setCounts] = useState<Record<string, number>>(initial.currentDiet?.counts ?? {})
  const [extras, setExtras] = useState<DietExtra[]>(initial.currentDiet?.extras ?? [])
  const [missing, setMissing] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [mealPlan, setMealPlan] = useState<AcceptedMealPlan | null>(null)

  const patch = (x: Partial<ProfileInfo>) => setP((old) => ({ ...old, ...x }))
  // The typical day only shows and counts foods the diet allows.
  const excluded = useMemo(() => excludedTags(p.dietPref, p.foodRules, p.allergies), [p.dietPref, p.foodRules, p.allergies])
  const dietItems = useMemo(() => dietItemsFor(excluded), [excluded])
  const keptExtras = allowedExtras(extras, excluded)
  const estimate = () => estimateDiet(counts, keptExtras, dietItems)
  const size = bodySize(about)
  const weightKg = Number(about.weightKg)
  const questions = questionsFor(about.sex)
  const ticked = questions.filter((q) => p.medical[q.key])
  const paceBody: PaceBody | undefined =
    size && /^\d{4}-\d{2}-\d{2}$/.test(about.birthDate) ? { ...size, ageYears: ageOn(about.birthDate, today) } : undefined
  const paces = p.goal && p.experience ? paceOptions(p.goal, p.experience, p.medical, paceBody) : []
  // A pace no longer offered (weight or health answers changed) gives way to
  // the recommended one (spec T-059, criterion 11).
  const paceKey = paces.map((x) => `${x.rate}${x.recommended ? '*' : ''}`).join(',')
  useEffect(() => {
    if (paces.length && !paces.some((x) => x.rate === p.goalRate)) patch({ goalRate: recommendedPace(paces).rate })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paceKey])
  const targetError = size ? checkTargetWeight(targetText, weightKg, p.goal) : null
  const eventError = checkEventDate(eventText, today)

  const chooseGoal = (goal: GoalChoice) => {
    const options = p.experience ? paceOptions(goal, p.experience, p.medical, paceBody) : []
    patch({ goal, goalRate: options.length ? recommendedPace(options).rate : 0 })
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
    eventDate: (p.goal === 'lose' || p.goal === 'gain') && eventText.trim() && !eventError ? eventText : null,
    currentDiet: estimate().kcal ? estimate() : null,
  })

  /** True when this step's answers are complete; shows what is missing if not. */
  const stepDone = () => {
    setMissing(null)
    if (step === 0) {
      const found = checkAboutYou(about, today)
      setErrors(found)
      if (Object.keys(found).length) return false
    }
    const problem =
      step === 1 && !healthDone
        ? 'Tick anything that applies, or choose “None of these”.'
        : step === 2 && (!p.activity || p.trainingDays === null || !p.experience || !p.equipment)
          ? 'Answer all four to continue.'
          : step === 3 && !p.goal
            ? 'Pick a goal to continue.'
            : step === 3 && targetError
              ? targetError
              : step === 3 && (p.goal === 'lose' || p.goal === 'gain') && eventError
                ? eventError
                : step === 4 && !p.dietPref
                  ? 'Pick what you eat to continue.'
                  : null
    if (problem) setMissing(problem)
    return !problem
  }

  /** True when the birth date is new here and must be saved first (T-105). */
  const newBirthDate = !initial.birthDate && !edit

  const next = async () => {
    if (!stepDone()) return
    if (step === 0 && newBirthDate && onBirthDate) {
      setBusy(true)
      try {
        await onBirthDate(about.birthDate)
      } catch {
        setSaveError('Couldn’t save. Check your connection and try again.')
        return setBusy(false)
      }
      setBusy(false)
    }
    setStep(step + 1)
  }

  /** Edit mode: saves the answers so far and keeps the current targets. */
  const saveNow = () => {
    if (!stepDone()) return
    // The first step needs a weight and the basics, wherever the person is.
    const found = checkAboutYou(about, today)
    if (Object.keys(found).length) {
      setErrors(found)
      return setStep(0)
    }
    void finish(null)
  }

  const finish = async (targets: Macros | null) => {
    setBusy(true)
    setSaveError(null)
    try {
      await onFinish({
        profile: { ...merged(), onboardedAt: edit ? initial.onboardedAt ?? new Date().toISOString() : new Date().toISOString() },
        weightKg,
        waistCm: about.waistCm.trim() ? Number(about.waistCm) : null,
        targets,
        // A plan is built on the suggested targets, so it is kept only with them.
        mealPlan: targets ? mealPlan : null,
      })
    } catch {
      setSaveError('Couldn’t save. Check your connection and try again.')
      setBusy(false)
    }
  }

  const skip = async () => {
    // Skipping still needs a birth date, for the age rule (T-105).
    if (newBirthDate) {
      const problem = checkAboutYou(about, today).birthDate
      setErrors(problem ? { birthDate: problem } : {})
      if (problem) return
    }
    setBusy(true)
    try {
      await onSkip(newBirthDate ? about.birthDate : undefined)
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

  const diet = estimate()
  const plan = step === STEPS.length - 1 ? buildPlan(merged(), weightKg, today) : null

  return (
    <main className="log onboarding">
      <div className="progress-bar" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <p className="muted step-count">
        {edit ? 'Your details · ' : ''}Step {step + 1} of {STEPS.length}
      </p>
      <h1>{STEPS[step]}</h1>

      {step === 0 && (
        <>
          {edit ? (
            <p className="muted">Change any answer. Your food, workouts and weigh-ins stay as they are.</p>
          ) : (
            <p className="muted">
              This sets your starting point. You can change it later.{' '}
              <button type="button" className="link inline" onClick={() => void skip()} disabled={busy}>
                Skip setup and start logging
              </button>
            </p>
          )}
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
              <p>Track Me Fit gives general help. It is not medical advice.</p>
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
          {(p.goal === 'lose' || p.goal === 'recomp') && !noDeficit(p.medical) && noLossReason(paceBody) && (
            <p className="info" role="note">{noLossReason(paceBody)}</p>
          )}
          {p.goal === 'lose' && noDeficit(p.medical) && (
            <p className="info">We won’t set a weight-loss pace during pregnancy or breastfeeding. You can still track food and training.</p>
          )}
          {p.goal === 'gain' && noDeficit(p.medical) && (
            <p className="info">We won’t set a weight-gain pace during pregnancy or breastfeeding. Plan any weight gain with your doctor; you can still track food and training.</p>
          )}
          {paces.length > 0 && (
            <>
              <div className="choice" role="group" aria-label="Pace">
                <span>Pace</span>
                {paces.map((pace) => (
                  <button key={pace.rate} type="button" aria-pressed={p.goalRate === pace.rate} onClick={() => patch({ goalRate: pace.rate })}>
                    {pace.label}
                    {pace.recommended && paces.length > 1 ? ' (recommended)' : ''}
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
              <label className="field">
                <span>Event date (optional), like a wedding or trip</span>
                <input aria-label="Event date (optional)" type="date" min={today} value={eventText} onChange={(e) => setEventText(e.target.value)} />
                {eventError && <small className="error">{eventError}</small>}
              </label>
              {!eventError && eventText.trim() && p.goalRate ? (
                <p className="info" role="status" aria-label="At your event">
                  {eventNote(weightKg, targetText.trim() && !targetError ? Number(targetText) : null, p.goalRate, today, eventText)}
                </p>
              ) : null}
            </>
          )}
        </>
      )}

      {step === 4 && (
        <>
          <Choice
            label="What you eat"
            options={DIETS}
            value={p.dietPref}
            onChange={(dietPref) => patch({ dietPref, foodRules: cleanRules(dietPref, p.foodRules) })}
          />
          <Multi
            label="Food rules"
            options={[[NO_ONION_GARLIC, 'No onion or garlic']]}
            value={p.foodRules.filter((r) => !isNonvegOff(r))}
            none={true}
            onChange={(rules) => patch({ foodRules: [...rules, ...p.foodRules.filter(isNonvegOff)] })}
          />
          {hasNonvegOff(p.dietPref) && (
            <Multi
              label="Days you skip non-veg"
              options={NONVEG_OFF_DAYS}
              value={p.foodRules.filter((r) => NONVEG_OFF_DAYS.some(([k]) => k === r))}
              none={true}
              onChange={(days) => patch({ foodRules: [...p.foodRules.filter((r) => !NONVEG_OFF_DAYS.some(([k]) => k === r)), ...days] })}
            />
          )}
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
          items={dietItems}
          counts={counts}
          extras={keptExtras}
          weightKg={weightKg}
          loadFoods={loadFoods}
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
            {plan.eventNote && <p>{plan.eventNote}</p>}
          </section>
          {plan.suggested ? (
            <section className="plan-targets" aria-label="Suggested daily targets">
              <h2>{plan.steps && plan.steps.steps.length > 1 ? 'Suggested daily targets for week 1' : 'Suggested daily targets'}</h2>
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
              {plan.steps && plan.steps.steps.length > 1 && (
                <ol className="steps" aria-label="Weekly steps">
                  {plan.steps.steps.map((k, i) => (
                    <li key={i}>
                      Week {i + 1}: {fmt(k)} kcal{i === plan.steps!.steps.length - 1 ? ' (your goal level)' : ''}
                    </li>
                  ))}
                </ol>
              )}
              <ul className="reasons">
                {plan.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p className="muted">
                {edit
                  ? 'Happy with your targets now? Choose “Keep my current targets”.'
                  : 'Have a coach or your own numbers? Choose “I’ll set my own” and enter them on the Food tab.'}
              </p>
              <p className="muted disclaimer">{SUGGESTION_NOTE}</p>
            </section>
          ) : null}
          {plan.suggested && <HowPlanWorks steps={plan.steps} />}
          {plan.suggested ? (
            <Suspense fallback={<p className="muted">Loading…</p>}>
              <MealPlanStep
                targets={plan.suggested}
                weightKg={weightKg}
                counts={diet.counts}
                excluded={excluded}
                blocked={noAutoMealPlan(p.medical)}
                accepted={mealPlan}
                onAccept={setMealPlan}
              />
            </Suspense>
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
        {edit && (
          <button type="button" className="link" onClick={() => void skip()} disabled={busy}>
            Cancel
          </button>
        )}
        {edit && step < STEPS.length - 1 && (
          <button type="button" className="link" onClick={saveNow} disabled={busy}>
            Save and close
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="primary" onClick={() => void next()} disabled={busy}>
            {step === 5 && !diet.kcal ? 'Skip this step' : 'Next'}
          </button>
        ) : plan?.suggested ? (
          <span className="finish">
            <button type="button" className="primary" onClick={() => void finish(plan.suggested)} disabled={busy}>
              Use these targets
            </button>
            <button type="button" className="link" onClick={() => void finish(null)} disabled={busy}>
              {edit ? 'Keep my current targets' : 'I’ll set my own'}
            </button>
          </span>
        ) : (
          <button type="button" className="primary" onClick={() => void finish(null)} disabled={busy}>
            {edit ? 'Save' : 'Start tracking'}
          </button>
        )}
      </div>
    </main>
  )
}
