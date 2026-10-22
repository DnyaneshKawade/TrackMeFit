// Short cards on why the plan looks the way it does (spec T-076).

import { useState } from 'react'
import { STEP_KCAL, type StepPlan } from '../engine/steps'

interface Card {
  title: string
  lines: string[]
}

const fmt = (n: number) => n.toLocaleString('en-IN')

const CLEAN: Card = {
  title: 'Why no fried food or sweets?',
  lines: [
    'Your plan uses home-style foods.',
    'Fried snacks, sweets and cold drinks stay out.',
    'They add lots of calories but little protein.',
    'You can still log them on the days you eat them.',
  ],
}

/** The cards for this plan: all three while losing in steps, else clean food only. */
function planCards(steps: StepPlan | null): Card[] {
  if (!steps || steps.steps.length < 2) return [CLEAN]
  return [
    {
      title: 'Why week 1 is not a cut',
      lines: [
        `Week 1 is ${fmt(steps.steps[0])} calories, about what you burn.`,
        `Then it goes down ${STEP_KCAL} calories each week, to ${fmt(steps.goalKcal)} calories.`,
        'Small steps are easier to keep. You tap OK before each one.',
      ],
    },
    CLEAN,
    {
      title: 'Why the scale moves fast at first',
      lines: [
        'Weight can drop fast in the first one or two weeks.',
        'Much of that is water, not fat.',
        'Then it slows down to the pace you picked. That is normal.',
      ],
    },
  ]
}

export function HowPlanWorks({ steps }: { steps: StepPlan | null }) {
  const cards = planCards(steps)
  const [at, setAt] = useState(0)
  const card = cards[Math.min(at, cards.length - 1)]
  return (
    <section className="how-plan" aria-label="How your plan works">
      <h2>How your plan works</h2>
      <h3>{card.title}</h3>
      {card.lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
      {cards.length > 1 && (
        <div className="choice">
          <button type="button" className="link" aria-label="Previous card" onClick={() => setAt(at - 1)} disabled={at === 0}>
            Back
          </button>
          <span className="muted">
            {at + 1} of {cards.length}
          </span>
          <button type="button" className="link" aria-label="Next card" onClick={() => setAt(at + 1)} disabled={at === cards.length - 1}>
            Next
          </button>
        </div>
      )}
    </section>
  )
}
