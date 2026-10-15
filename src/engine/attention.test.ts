import { describe, expect, it } from 'vitest'
import { clientFlags, sortByAttention, weeklyRate, type ClientSummary } from './attention'
import { shiftDate } from '../log/types'

const TODAY = '2026-10-15'
const ok: ClientSummary = {
  clientId: 'a',
  name: 'Asha',
  goal: 'lose',
  trainingDays: 3,
  lastFoodOn: TODAY,
  foodDays: 7,
  avgKcal: 1800,
  avgProteinG: 100,
  targetKcal: 1800,
  targetProteinG: 100,
  weighIns: Array.from({ length: 14 }, (_, i) => ({ date: shiftDate(TODAY, -i), kg: 70 + i * 0.05 })),
  workouts: 3,
  lastWorkoutOn: TODAY,
}
const reasons = (c: Partial<ClientSummary>) => clientFlags({ ...ok, ...c }, TODAY).map((f) => f.reason)

describe('client attention (T-026b)', () => {
  it('1. a client who is on track has no flags', () => {
    expect(reasons({})).toEqual([])
  })

  it('2. flags missing food, weigh-ins and workouts with the number of days', () => {
    expect(reasons({ lastFoodOn: shiftDate(TODAY, -4) })).toEqual(['No food logged for 4 days.'])
    expect(reasons({ lastFoodOn: null, foodDays: 0 })).toEqual(['No food logged yet.'])
    expect(reasons({ weighIns: [{ date: shiftDate(TODAY, -9), kg: 70 }] })).toEqual(['No weigh-in for 9 days.'])
    expect(reasons({ weighIns: [] })).toEqual(['No weigh-in yet.'])
    expect(reasons({ workouts: 1 })).toEqual(['1 of 3 planned workouts done in the last 7 days.'])
    expect(reasons({ workouts: 0, lastWorkoutOn: null })).toEqual(['No workouts logged yet.'])
    // One missed workout is fine; no plan means no workout flag.
    expect(reasons({ workouts: 2 })).toEqual([])
    expect(reasons({ trainingDays: 0, workouts: 0, lastWorkoutOn: null })).toEqual([])
  })

  it('3. flags calories more than 15% off target and protein under 80%, after 3 logged days', () => {
    expect(reasons({ avgKcal: 2200 })).toEqual(['Ate about 2200 kcal a day last week, 22% over the 1800 kcal target.'])
    expect(reasons({ avgKcal: 1400 })).toEqual(['Ate about 1400 kcal a day last week, 22% under the 1800 kcal target.'])
    expect(reasons({ avgKcal: 2000 })).toEqual([])
    expect(reasons({ avgProteinG: 70 })).toEqual(['Protein was about 70 g a day, below the 100 g target.'])
    expect(reasons({ avgKcal: 2500, foodDays: 2 })).toEqual([])
    expect(reasons({ targetKcal: null, targetProteinG: null, avgKcal: 3000 })).toEqual([])
  })

  it('4. flags weight moving the wrong way for the goal, or too fast', () => {
    const rising = Array.from({ length: 14 }, (_, i) => ({ date: shiftDate(TODAY, -i), kg: 70 - i * 0.1 }))
    expect(weeklyRate(rising)! > 0).toBe(true)
    expect(reasons({ weighIns: rising })[0]).toMatch(/^Weight is going up \d\.\d% a week, but the goal is to lose\.$/)
    expect(reasons({ goal: 'gain', weighIns: ok.weighIns })[0]).toMatch(/^Weight is going down \d\.\d% a week, but the goal is to gain\.$/)
    const fast = Array.from({ length: 14 }, (_, i) => ({ date: shiftDate(TODAY, -i), kg: 70 + i * 0.2 }))
    expect(reasons({ weighIns: fast })[0]).toMatch(/^Losing \d\.\d% a week, faster than the 1% safe limit\.$/)
    expect(reasons({ goal: 'maintain', weighIns: fast })).toEqual([])
    expect(weeklyRate(ok.weighIns.slice(0, 3))).toBeNull()
  })

  it('5. sorts the clients who need attention most first, then by name', () => {
    const list = sortByAttention(
      [
        { ...ok, clientId: 'c', name: 'Chetan' },
        { ...ok, clientId: 'b', name: 'Bina', weighIns: [] },
        { ...ok, clientId: 'r', name: 'Ravi', lastFoodOn: null, workouts: 0, lastWorkoutOn: null },
        { ...ok, clientId: 'a', name: 'Asha' },
      ],
      TODAY,
    )
    expect(list.map((x) => [x.client.name, x.score])).toEqual([
      ['Ravi', 5],
      ['Bina', 1],
      ['Asha', 0],
      ['Chetan', 0],
    ])
    expect(list[0].flags.map((f) => f.reason)).toEqual(['No food logged yet.', 'No workouts logged yet.'])
  })
})
