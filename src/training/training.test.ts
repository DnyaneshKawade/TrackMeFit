import { describe, expect, it } from 'vitest'
import { LANDMARKS } from '../engine/training'
import { EXERCISES, allExercises, checkNewExercise, customExercise, exerciseById, searchExercises, setCustomExercises } from './exercises'
import { customFromRow, memoryExerciseStore } from './exerciseStore'
import { memoryWorkoutStore } from './memoryStore'
import { planFromRow, summaryFromRow } from './supabaseStore'
import { checkPlan, checkSet, describeSets, nextDayIndex, suggestNext, workingSets, type Plan, type SetLog } from './types'

const set = (setIndex: number, weightKg: number, reps: number): SetLog => ({ id: String(setIndex), exerciseId: 'bench-press', setIndex, weightKg, reps, rir: null })
const bench = exerciseById.get('bench-press')!

describe('exercise library', () => {
  it('has 60+ exercises with unique ids and known muscles', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(60)
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length)
    for (const e of EXERCISES) {
      expect(LANDMARKS[e.primary], e.id).toBeDefined()
      for (const m of e.secondary) expect(LANDMARKS[m], `${e.id} ${m}`).toBeDefined()
      expect(e.secondary).not.toContain(e.primary)
      expect(e.increment).toBeGreaterThan(0)
    }
  })
  it('trains every muscle the engine plans for', () => {
    for (const m of Object.keys(LANDMARKS)) expect(EXERCISES.some((e) => e.primary === m), m).toBe(true)
  })
  it('finds exercises by name, gym slang and muscle', () => {
    expect(searchExercises('rdl').map((e) => e.id)).toContain('romanian-deadlift')
    expect(searchExercises('ohp')[0].id).toBe('overhead-press')
    expect(searchExercises('bice').every((e) => e.primary === 'biceps')).toBe(true)
    expect(searchExercises('zzz')).toEqual([])
  })
})

describe('plans', () => {
  const ok: Plan = { name: 'PPL', days: [{ dayIndex: 0, name: 'Push', exercises: [{ exerciseId: 'bench-press', sets: 3, repMin: 6, repMax: 10 }] }] }
  it('accepts a complete plan', () => {
    expect(checkPlan(ok)).toEqual([])
  })
  it('explains what is missing or out of range', () => {
    expect(
      checkPlan({
        name: ' ',
        days: [
          { dayIndex: 0, name: '', exercises: [] },
          { dayIndex: 1, name: 'Legs', exercises: [{ exerciseId: 'back-squat', sets: 12, repMin: 10, repMax: 6 }] },
        ],
      }),
    ).toEqual([
      'Give the plan a name.',
      'Name day 1.',
      'Day 1: add at least one exercise.',
      'Legs: sets must be 1 to 10.',
      'Legs: the lowest reps can\'t be above the highest.',
    ])
    expect(checkPlan({ name: 'x', days: [] })).toEqual(['Add at least one day.'])
  })
  it('reuses the lowest free day position', () => {
    expect(nextDayIndex([])).toBe(0)
    expect(nextDayIndex([{ dayIndex: 0, name: 'a', exercises: [] }, { dayIndex: 2, name: 'b', exercises: [] }])).toBe(1)
  })
  it('reads plans from database rows in order', () => {
    const p = planFromRow({
      id: 'p',
      name: 'Upper Lower',
      hard_weeks: 4,
      block_started_on: '2026-10-01',
      updated_by: 'coach-1',
      updated_at: '2026-10-15T10:00:00+05:30',
      plan_days: [
        { id: 'd2', day_index: 1, name: 'Lower', plan_exercises: [] },
        {
          id: 'd1',
          day_index: 0,
          name: 'Upper',
          plan_exercises: [
            { position: 1, exercise_id: 'db-row', sets: 3, rep_min: 8, rep_max: 12 },
            { position: 0, exercise_id: 'bench-press', sets: 3, rep_min: 6, rep_max: 10 },
          ],
        },
      ],
    })
    expect(p.days.map((d) => d.name)).toEqual(['Upper', 'Lower'])
    expect(p.days[0].exercises.map((e) => e.exerciseId)).toEqual(['bench-press', 'db-row'])
    expect([p.changedBy, p.changedOn]).toEqual(['coach-1', '2026-10-15'])
  })
})

describe('sets and progression', () => {
  it('checks set values', () => {
    expect(checkSet(60, 10, null)).toBeNull()
    expect(checkSet(60, 10, 2)).toBeNull()
    expect(checkSet(-1, 10, null)).toMatch(/Weight/)
    expect(checkSet(60, 8.5, null)).toMatch(/whole number/)
    expect(checkSet(60, 8, 11)).toMatch(/Reps left/)
  })
  it('describes sets grouped by weight', () => {
    expect(describeSets([set(2, 60, 9), set(0, 60, 10), set(1, 60, 10), set(3, 50, 12)])).toBe('60 kg × 10, 10, 9 · 50 kg × 12')
  })
  it('adds weight after hitting the top of the range on every set, with the reason', () => {
    const s = suggestNext([{ performedOn: '2026-10-10', sets: [set(0, 60, 10), set(1, 60, 10), set(2, 60, 10)] }], bench, [6, 10])
    expect(s).toEqual({ weight: 62.5, targetReps: 6, why: 'Hit 10 reps on every set, so the weight goes up.' })
  })
  it('asks for one more rep otherwise, and drops the weight after two misses', () => {
    expect(suggestNext([{ performedOn: 'a', sets: [set(0, 60, 8), set(1, 60, 7)] }], bench, [6, 10])).toMatchObject({ weight: 60, targetReps: 9 })
    const twoMisses = [
      { performedOn: 'b', sets: [set(0, 60, 5)] },
      { performedOn: 'a', sets: [set(0, 60, 4)] },
    ]
    expect(suggestNext(twoMisses, bench, [6, 10])).toMatchObject({ weight: 55, targetReps: 6 })
    expect(suggestNext([], bench, [6, 10])).toBeNull()
  })
})

describe('memory store', () => {
  it('returns earlier sessions with the exercise, newest first', async () => {
    const store = memoryWorkoutStore()
    for (const [date, w] of [['2026-10-01', 50], ['2026-10-05', 55], ['2026-10-12', 60]] as const) {
      const s = await store.startSession(date, null)
      await store.addSet(s.id, { exerciseId: 'bench-press', setIndex: 0, weightKg: w, reps: 8, rir: null })
    }
    const other = await store.startSession('2026-10-08', null)
    await store.addSet(other.id, { exerciseId: 'back-squat', setIndex: 0, weightKg: 80, reps: 5, rir: null })
    const h = await store.history('bench-press', '2026-10-12')
    expect(h.map((x) => x.performedOn)).toEqual(['2026-10-05', '2026-10-01'])
  })
})

describe('set tags (T-043a)', () => {
  const bench = exerciseById.get('bench-press')!
  it('5. warm-ups and drop sets are left out of the suggestion and the missed-reps count', () => {
    const warm: SetLog = { ...set(0, 100, 3), tag: 'warmup' }
    const drop: SetLog = { ...set(4, 40, 4), tag: 'drop' }
    const hard: SetLog = { ...set(3, 60, 10), tag: 'failure' }
    const last = { performedOn: '2026-10-10', sets: [warm, set(1, 60, 10), set(2, 60, 10), hard, drop] }
    // Without the tags the 100 kg warm-up would be the "top" weight and the drop set a missed rep.
    expect(suggestNext([last], bench, [6, 10])).toMatchObject({ weight: 62.5, targetReps: 6 })
    expect(workingSets(last.sets).map((s) => s.setIndex)).toEqual([1, 2, 3])
    // A session of only warm-ups gives no suggestion.
    expect(suggestNext([{ performedOn: 'a', sets: [warm] }], bench, [6, 10])).toBeNull()
  })
})

describe('own exercises and supersets (T-043b)', () => {
  it('12. an own exercise gets the usual jump, is searched and found by id, and can be replaced', () => {
    const own = customExercise('custom:1', { name: 'Viking press', primary: 'sideDelts', equipment: 'barbell', isolation: false })
    expect(own).toMatchObject({ increment: 2.5, aliases: [], secondary: [] })
    expect(customExercise('custom:2', { name: 'Neck', primary: 'traps', equipment: 'machine', isolation: true }).increment).toBe(5)
    setCustomExercises([own])
    expect(searchExercises('viking').map((e) => e.id)).toEqual(['custom:1'])
    expect(exerciseById.get('custom:1')?.name).toBe('Viking press')
    setCustomExercises([])
    expect(exerciseById.has('custom:1')).toBe(false)
    expect(searchExercises('viking')).toEqual([])
  })

  it('13. a new exercise needs a new name of up to 80 letters', () => {
    expect(checkNewExercise('  ')).toBe('Give the exercise a name.')
    expect(checkNewExercise('x'.repeat(81))).toBe('Use up to 80 letters.')
    expect(checkNewExercise('bench PRESS (barbell)')).toBe('Bench press (barbell) is already in the list.')
    expect(checkNewExercise('Viking press')).toBeNull()
  })

  it('12. reads own exercises from database rows', () => {
    expect(customFromRow({ id: 'u1', name: 'Tyre flip', primary_muscle: 'traps', equipment: 'machine', isolation: true })).toEqual({
      id: 'custom:u1',
      name: 'Tyre flip',
      primary: 'traps',
      equipment: 'machine',
      isolation: true,
    })
  })

  it('9. reads the superset link from plan rows', () => {
    const p = planFromRow({
      id: 'p',
      name: 'Upper',
      hard_weeks: 4,
      block_started_on: '2026-10-01',
      plan_days: [
        {
          id: 'd1',
          day_index: 0,
          name: 'Upper',
          plan_exercises: [
            { position: 0, exercise_id: 'bench-press', sets: 3, rep_min: 6, rep_max: 10, superset_next: true },
            { position: 1, exercise_id: 'db-row', sets: 3, rep_min: 8, rep_max: 12, superset_next: false },
          ],
        },
      ],
    })
    expect(p.days[0].exercises.map((e) => e.supersetNext)).toEqual([true, undefined])
  })
})

describe('records data (T-044)', () => {
  it('the memory store lists workouts in a range, newest first, and an exercise’s whole history', async () => {
    const store = memoryWorkoutStore()
    for (const [date, ex] of [['2026-09-30', 'bench-press'], ['2026-10-02', 'bench-press'], ['2026-10-09', 'back-squat']] as const) {
      const s = await store.startSession(date, null)
      await store.addSet(s.id, { exerciseId: ex, setIndex: 0, weightKg: 60, reps: 8, rir: null })
      await store.addSet(s.id, { exerciseId: ex, setIndex: 1, weightKg: 60, reps: 8, rir: null })
    }
    const list = await store.summaries('2026-10-01', '2026-10-31')
    expect(list.map((x) => [x.performedOn, x.exerciseIds])).toEqual([
      ['2026-10-09', ['back-squat']],
      ['2026-10-02', ['bench-press']],
    ])
    expect((await store.exerciseHistory('bench-press')).map((x) => x.performedOn)).toEqual(['2026-10-02', '2026-09-30'])
  })

  it('maps a workout row to a summary without repeated exercises', () => {
    expect(
      summaryFromRow({ id: 's', performed_on: '2026-10-10', plan_days: null, set_logs: [{ exercise_id: 'a' }, { exercise_id: 'b' }, { exercise_id: 'a' }] }),
    ).toEqual({ id: 's', performedOn: '2026-10-10', name: 'Workout', planDayId: null, exerciseIds: ['a', 'b'] })
  })
})

describe('own exercises (T-043c)', () => {
  it('15. an edited exercise may keep its own name but not take another one', () => {
    const mine = customExercise('custom:1', { name: 'Tyre flip', primary: 'traps', equipment: 'machine', isolation: true })
    const list = [mine, ...EXERCISES]
    expect(checkNewExercise('tyre flip', list, 'custom:1')).toBeNull()
    expect(checkNewExercise('Tyre flip', list)).toBe('Tyre flip is already in the list.')
    expect(checkNewExercise('Leg press', list, 'custom:1')).toBe('Leg press is already in the list.')
  })

  it('16. a hidden exercise leaves the list and search but is still found by id', () => {
    const hidden = customExercise('custom:2', { name: 'Tyre flip', primary: 'traps', equipment: 'machine', isolation: true, hidden: true })
    setCustomExercises([hidden])
    try {
      expect(allExercises().some((e) => e.id === 'custom:2')).toBe(false)
      expect(searchExercises('tyre flip')).toEqual([])
      expect(exerciseById.get('custom:2')?.name).toBe('Tyre flip')
      // A hidden name can be used again for a new exercise.
      expect(checkNewExercise('Tyre flip')).toBeNull()
    } finally {
      setCustomExercises([])
    }
  })

  it('maps the hidden flag from a row, and the memory store edits and hides', async () => {
    expect(customFromRow({ id: 'u', name: 'X', primary_muscle: 'abs', equipment: 'cable', isolation: true, hidden: true })).toMatchObject({ id: 'custom:u', hidden: true })
    expect(customFromRow({ id: 'u', name: 'X', primary_muscle: 'abs', equipment: 'cable', isolation: true, hidden: false })).not.toHaveProperty('hidden')
    const store = memoryExerciseStore()
    const x = await store.addCustom({ name: 'Tyre flip', primary: 'traps', equipment: 'machine', isolation: true })
    expect(await store.updateCustom(x.id, { name: ' Tyre push ', primary: 'traps', equipment: 'cable', isolation: true })).toMatchObject({ id: x.id, name: 'Tyre push', equipment: 'cable' })
    await store.setHidden(x.id, true)
    expect((await store.custom())[0].hidden).toBe(true)
    await store.setHidden(x.id, false)
    expect((await store.custom())[0]).not.toHaveProperty('hidden')
  })
})
