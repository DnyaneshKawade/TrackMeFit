import { describe, expect, it } from 'vitest'
import { checkAnswers, describeWeekWeight, scoreLine, weekStart, weekWeight, type Answers } from './checkIns'

const answers: Answers = { energy: 4, sleep: 3, mood: 4, diet: 2, training: 5, note: '', ask: '' }

describe('check-in helpers (T-026e)', () => {
  it('finds the Monday of any day in the week', () => {
    expect(weekStart('2026-10-12')).toBe('2026-10-12') // Monday
    expect(weekStart('2026-10-15')).toBe('2026-10-12') // Thursday
    expect(weekStart('2026-10-18')).toBe('2026-10-12') // Sunday
    expect(weekStart('2026-11-02')).toBe('2026-11-02')
  })

  it('asks for every score and short notes', () => {
    expect(checkAnswers(answers)).toEqual([])
    expect(checkAnswers({ ...answers, sleep: undefined, training: undefined } as unknown as Answers)).toEqual(['Pick a number for sleep, training.'])
    expect(checkAnswers({ ...answers, note: 'x'.repeat(501) })).toEqual(['Keep each note to 500 letters.'])
    expect(scoreLine(answers)).toBe('Energy 4 · Sleep 3 · Mood 4 · Sticking to your food plan 2 · Training 5')
  })

  it('gives the week’s average weight and the change from the week before', () => {
    const w = [
      { date: '2026-10-05', kg: 71 },
      { date: '2026-10-07', kg: 70.6 },
      { date: '2026-10-12', kg: 70.4 },
      { date: '2026-10-14', kg: 70.2 },
    ]
    expect(describeWeekWeight(weekWeight(w, '2026-10-12'))).toBe('Average 70.3 kg, down 0.5 kg from the week before.')
    expect(describeWeekWeight(weekWeight(w, '2026-10-05'))).toBe('Average 70.8 kg. No weigh-ins the week before.')
    expect(describeWeekWeight(weekWeight(w, '2026-10-19'))).toBe('No weigh-ins that week.')
  })
})
