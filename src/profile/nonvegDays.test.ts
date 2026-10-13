import { describe, expect, it } from 'vitest'
import { SEASON_DATES, dayExcluded, nonvegOffReason } from './nonvegDays'
import { excludedTags } from './dietRules'

describe('non-veg-free days (T-058c)', () => {
  it('1. names the weekday when it is one of the person’s non-veg-free days', () => {
    const rules = ['nonveg_off:tue', 'nonveg_off:sat']
    expect(nonvegOffReason('2026-10-13', rules)).toBe('Tuesday')
    expect(nonvegOffReason('2026-10-17', rules)).toBe('Saturday')
    expect(nonvegOffReason('2026-10-14', rules)).toBeNull()
    expect(nonvegOffReason('2026-10-13', [])).toBeNull()
  })

  it('2. names the season inside its dates for the year, and not outside them or in a year without dates', () => {
    const rules = ['nonveg_off:shravan', 'nonveg_off:navratri']
    expect(nonvegOffReason('2026-08-13', rules)).toBe('Shravan')
    expect(nonvegOffReason('2026-09-11', rules)).toBe('Shravan')
    expect(nonvegOffReason('2026-09-12', rules)).toBeNull()
    expect(nonvegOffReason('2026-10-15', rules)).toBe('Navratri')
    expect(nonvegOffReason('2027-04-07', rules)).toBe('Navratri')
    expect(nonvegOffReason('2028-08-20', rules)).toBeNull()
    expect(nonvegOffReason('2026-03-01', ['nonveg_off:ramadan'])).toBe('Ramadan fasting days')
    expect(nonvegOffReason('2026-03-01', ['nonveg_off:lent'])).toBe('Lent')
    expect(nonvegOffReason('2026-08-01', ['nonveg_off:chaturmas'])).toBe('Chaturmas')
  })

  it('2. has well-formed date ranges for every season', () => {
    for (const [season, years] of Object.entries(SEASON_DATES))
      for (const [year, ranges] of Object.entries(years))
        for (const [from, to] of ranges) {
          expect(from <= to, `${season} ${from}`).toBe(true)
          expect(from.startsWith(year) && to.startsWith(year), `${season} ${year}`).toBe(true)
        }
  })

  it('3. leaves out meat, fish and eggs on a non-veg-free day, on top of the diet', () => {
    const base = excludedTags('nonveg', ['no_onion_garlic'])
    expect([...dayExcluded(base, true)].sort()).toEqual(['egg', 'fish', 'meat', 'onion_garlic'])
    expect(dayExcluded(base, false)).toBe(base)
  })
})
