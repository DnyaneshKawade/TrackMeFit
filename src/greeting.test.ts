import { describe, expect, it } from 'vitest'
import { dayLine, greeting, initial } from './greeting'

describe('greeting (T-101d)', () => {
  it('1. greets by the time of day with the first name', () => {
    expect(greeting(new Date(2026, 9, 19, 8), 'Priya Shah')).toBe('Good morning, Priya')
    expect(greeting(new Date(2026, 9, 19, 13), 'Priya')).toBe('Good afternoon, Priya')
    expect(greeting(new Date(2026, 9, 19, 20), '')).toBe('Good evening')
  })

  it('2. shows the day and date, and a letter for the round picture', () => {
    expect(dayLine(new Date(2026, 9, 19, 8))).toBe('Monday, 19 October')
    expect(initial('priya@x.in')).toBe('P')
    expect(initial(' ')).toBe('?')
  })
})
