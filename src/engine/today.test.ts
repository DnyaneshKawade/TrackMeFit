// The Today checklist and the evening peek (spec T-156).
import { describe, expect, it } from 'vitest'
import { todayChecks, tomorrowPeek, workoutToday } from './today'

describe('today checklist (T-156)', () => {
  it('1. counts meals, calories, workout and weigh-in', () => {
    const c = todayChecks({ mealsLogged: 2, kcal: 1400, targetKcal: 2000, workout: 'done', weighedIn: true })
    expect(c.items.map((i) => [i.label, i.done])).toEqual([
      ['Meals: 2 of 3', false],
      ['Calories near your target', false],
      ['Workout', true],
      ['Weigh-in', true],
    ])
    expect(c.text).toBe('Today: 2 of 4 done')
    expect(c.dayDone).toBe(false)
  })

  it('2. the day is done with 3 meals and calories within 10% of the target', () => {
    expect(todayChecks({ mealsLogged: 3, kcal: 1850, targetKcal: 2000, workout: null, weighedIn: false })).toMatchObject({ dayDone: true, text: 'Today: 2 of 3 done', overNote: null })
    expect(todayChecks({ mealsLogged: 3, kcal: 1700, targetKcal: 2000, workout: null, weighedIn: false }).dayDone).toBe(false)
  })

  it('3. over the target gets a kind line, never a scolding', () => {
    const c = todayChecks({ mealsLogged: 3, kcal: 2400, targetKcal: 2000, workout: null, weighedIn: false })
    expect(c).toMatchObject({ dayDone: false, overNote: 'That’s OK. Tomorrow is a new day.' })
  })

  it('4. no target means no calories item; no plan means no workout item', () => {
    expect(todayChecks({ mealsLogged: 0, kcal: 0, targetKcal: null, workout: null, weighedIn: false }).items.map((i) => i.key)).toEqual(['meals', 'weigh'])
  })

  it('5. a rest day counts as done once the week’s workouts are in', () => {
    expect(workoutToday({ hasPlan: true, today: 0, thisWeek: 3, daysPerWeek: 3 })).toBe('rest')
    expect(workoutToday({ hasPlan: true, today: 0, thisWeek: 1, daysPerWeek: 3 })).toBe('todo')
    expect(workoutToday({ hasPlan: true, today: 1, thisWeek: 1, daysPerWeek: 3 })).toBe('done')
    expect(workoutToday({ hasPlan: false, today: 1, thisWeek: 1, daysPerWeek: 3 })).toBeNull()
    expect(todayChecks({ mealsLogged: 0, kcal: 0, targetKcal: null, workout: 'rest', weighedIn: false }).items[1]).toEqual({ key: 'workout', label: 'Rest day', done: true })
  })

  it('6. the peek at tomorrow shows from 7 pm only', () => {
    expect(tomorrowPeek({ hour: 18, workout: 'Upper B', breakfast: 'Poha' })).toBeNull()
    expect(tomorrowPeek({ hour: 19, workout: 'Upper B', breakfast: 'Poha' })).toBe('Tomorrow: Upper B. Breakfast: Poha.')
    expect(tomorrowPeek({ hour: 21, workout: null, breakfast: 'Poha' })).toBe('Tomorrow’s breakfast: Poha.')
    expect(tomorrowPeek({ hour: 21, workout: 'Rest day', breakfast: null })).toBe('Tomorrow: Rest day.')
    expect(tomorrowPeek({ hour: 21, workout: null, breakfast: null })).toBeNull()
  })
})
