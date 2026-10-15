import { describe, expect, it } from 'vitest'
import { datesBetween, dietStats, type StatsEntry, type StatsTarget } from './dietStats'

const TODAY = '2026-10-13'
const FROM = '2026-10-07' // 7 days with today
const TARGET: StatsTarget = { startsOn: '2026-10-01', kcal: 2000, proteinG: 100, carbG: 250, fatG: 60 }

const entry = (loggedOn: string, kcal: number, proteinG: number, foodId = 'tmf:dish:dal', foodName = 'Dal'): StatsEntry => ({
  loggedOn,
  foodId,
  foodName,
  kcal,
  proteinG,
  carbG: 0,
  fatG: 0,
})

describe('food stats (T-062)', () => {
  it('lists every date in the range', () => {
    expect(datesBetween('2026-09-29', '2026-10-02')).toEqual(['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'])
  })

  it('1. averages finished, logged days and leaves out today and empty days', () => {
    const s = dietStats(
      [entry('2026-10-10', 1000, 50), entry('2026-10-10', 1000, 50), entry('2026-10-11', 1500, 80), entry(TODAY, 300, 10), entry('2026-10-01', 9000, 9)],
      [TARGET],
      FROM,
      TODAY,
    )
    expect(s.days).toHaveLength(7)
    expect(s.loggedDays).toBe(2)
    expect(s.average).toEqual({ kcal: 1750, proteinG: 90, carbG: 0, fatG: 0 })
    expect(s.target).toMatchObject({ kcal: 2000, proteinG: 100 })
    expect(s.days.find((d) => d.date === '2026-10-08')!.eaten).toBeNull()
    expect(s.notes).toContain('Days with nothing logged are left out of the averages. Today is left out until it is over.')
  })

  it('3. counts days on target: calories within 10% of that day’s target', () => {
    const later: StatsTarget = { ...TARGET, startsOn: '2026-10-11', kcal: 1500 }
    const s = dietStats([entry('2026-10-09', 2150, 100), entry('2026-10-10', 2300, 100), entry('2026-10-11', 1600, 100)], [later, TARGET], FROM, TODAY)
    expect(s.days.map((d) => d.onTarget)).toEqual([null, null, true, false, true, null, null])
    expect(s.daysOnTarget).toBe(2)
    expect(s.target!.kcal).toBe(1500)
    expect(s.notes[0]).toBe('On target means calories within 10% of your target.')
  })

  it('4. counts the protein streak back from today; today counts once met', () => {
    const days = [entry('2026-10-09', 2000, 95), entry('2026-10-10', 2000, 50), entry('2026-10-11', 2000, 90), entry('2026-10-12', 2000, 120)]
    expect(dietStats(days, [TARGET], FROM, TODAY).proteinStreak).toBe(2)
    expect(dietStats([...days, entry(TODAY, 900, 100)], [TARGET], FROM, TODAY).proteinStreak).toBe(3)
    expect(dietStats(days.slice(0, 3), [TARGET], FROM, TODAY).proteinStreak).toBe(0)
  })

  it('5. lists the five foods logged most often, without quick adds', () => {
    const many = [
      ...['a', 'a', 'a', 'b', 'b', 'c', 'd', 'e', 'f'].map((id) => entry('2026-10-10', 100, 1, id, id.toUpperCase())),
      entry('2026-10-11', 500, 0, 'quick', 'Quick add'),
      entry('2026-10-11', 500, 0, 'quick', 'Quick add'),
    ]
    expect(dietStats(many, [], FROM, TODAY).topFoods).toEqual([
      { name: 'A', times: 3 },
      { name: 'B', times: 2 },
      { name: 'C', times: 1 },
      { name: 'D', times: 1 },
      { name: 'E', times: 1 },
    ])
  })

  it('6. says what to do with no food or no targets', () => {
    const empty = dietStats([], [TARGET], FROM, TODAY)
    expect(empty.average).toBeNull()
    expect(empty.notes).toEqual(['Log food for a few days to see your stats.'])
    const noTargets = dietStats([entry('2026-10-10', 1000, 50)], [], FROM, TODAY)
    expect(noTargets.daysOnTarget).toBeNull()
    expect(noTargets.proteinStreak).toBeNull()
    expect(noTargets.notes[0]).toBe('Set your daily targets to see days on target.')
  })
})

describe('fasting days in food stats (T-041c)', () => {
  const days = [entry('2026-10-10', 2000, 100), entry('2026-10-11', 400, 10), entry('2026-10-12', 2000, 100)]
  const fasts = new Set(['2026-10-11'])

  it('4. a fasting day is left out of the averages and days on target', () => {
    const s = dietStats(days, [TARGET], FROM, TODAY, 5, fasts)
    expect(s.loggedDays).toBe(2)
    expect(s.fastingDays).toBe(1)
    expect(s.average).toMatchObject({ kcal: 2000, proteinG: 100 })
    expect(s.daysOnTarget).toBe(2)
    const fast = s.days.find((d) => d.date === '2026-10-11')!
    expect(fast).toMatchObject({ fasting: true, onTarget: null })
    expect(s.notes).toContain('Fasting days are left out of the averages, days on target and the protein streak.')
    // Without the mark, the same day pulls the average down.
    expect(dietStats(days, [TARGET], FROM, TODAY).average!.kcal).toBe(1467)
  })

  it('4. a fasting day doesn’t break the protein streak', () => {
    expect(dietStats(days, [TARGET], FROM, TODAY).proteinStreak).toBe(1)
    expect(dietStats(days, [TARGET], FROM, TODAY, 5, fasts).proteinStreak).toBe(2)
  })
})
