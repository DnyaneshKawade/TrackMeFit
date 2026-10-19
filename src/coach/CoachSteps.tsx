// First steps for a new coach (spec T-099): fill in your details, we check
// you, then invite a client. Each step says what it means for clients.

export type StepState = 'done' | 'now' | 'later'

const STEPS = [
  {
    title: 'Fill in your details',
    text: 'Add your name, phone, city and a certificate photo. Clients see only your name.',
  },
  {
    title: 'We check you',
    text: 'We look at your details and certificates. This keeps clients safe.',
  },
  {
    title: 'Invite a client',
    text: 'Send them a code. They see what you will see, then say yes. Then you see their food, workouts, weight and check-ins.',
  },
]

const MARK: Record<StepState, string> = { done: 'Done', now: 'Now', later: 'Next' }

/** Three steps, each marked Done, Now or Next. */
export function CoachSteps({ states }: { states: [StepState, StepState, StepState] }) {
  return (
    <section aria-label="First steps" className="coach-steps">
      <h3>First steps</h3>
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.title} className={states[i]} aria-current={states[i] === 'now' ? 'step' : undefined}>
            <strong>{s.title}</strong> <span className="mark">{MARK[states[i]]}</span>
            <br />
            <span className="muted">{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
