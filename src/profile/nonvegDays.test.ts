import { describe, expect, it } from 'vitest'
import { dayExcluded, nonvegWeekday, vegDayReason } from './nonvegDays'
import { excludedTags } from './dietRules'

describe('veg days (T-058c)', () => {
  const rules = ['nonveg_off:tue', 'nonveg_off:sat']

  it('1. names the weekday when it is one of the person’s non-veg-free days', () => {
    expect(nonvegWeekday('2026-10-13', rules)).toBe('Tuesday')
    expect(nonvegWeekday('2026-10-17', rules)).toBe('Saturday')
    expect(nonvegWeekday('2026-10-14', rules)).toBeNull()
    expect(nonvegWeekday('2026-10-13', [])).toBeNull()
  })

  it('2. lets the person make any day a veg day, or eat non-veg on a usual veg day', () => {
    expect(vegDayReason('2026-10-14', rules, 'veg')).toBe('your choice')
    expect(vegDayReason('2026-10-14', [], 'veg')).toBe('your choice')
    expect(vegDayReason('2026-10-13', rules, 'nonveg')).toBeNull()
    expect(vegDayReason('2026-10-13', rules, null)).toBe('Tuesday')
    expect(vegDayReason('2026-10-14', rules, null)).toBeNull()
  })

  it('3. leaves out meat, fish and eggs on a veg day, on top of the diet', () => {
    const base = excludedTags('nonveg', ['no_onion_garlic'])
    expect([...dayExcluded(base, true)].sort()).toEqual(['egg', 'fish', 'meat', 'onion_garlic'])
    expect(dayExcluded(base, false)).toBe(base)
  })
})
