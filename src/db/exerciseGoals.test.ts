import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Exercise goals (spec T-119): kept with exercise settings, in range.

let t: TestDb
let asha: string

beforeAll(async () => {
  t = await createTestDb()
  asha = await t.signUp('asha@example.com')
}, 30_000)

describe('exercise goals (T-119)', () => {
  it('6. keeps a goal of 1 to 600 kg for 1 to 30 reps, alone or with other settings', async () => {
    await t.as(asha, async (db) => {
      await db.query(`insert into exercise_settings (exercise_id, goal_kg, goal_reps) values ('back-squat', 100, 1)`)
      await db.query(`insert into exercise_settings (exercise_id, note, goal_kg, goal_reps) values ('bench-press', 'Bench 2', 80, 5)`)
      const r = await db.query<{ exercise_id: string; goal_kg: string; goal_reps: number }>('select exercise_id, goal_kg, goal_reps from exercise_settings order by exercise_id')
      expect(r.rows.map((x) => [x.exercise_id, Number(x.goal_kg), x.goal_reps])).toEqual([['back-squat', 100, 1], ['bench-press', 80, 5]])
      await expect(db.query(`insert into exercise_settings (exercise_id, goal_kg, goal_reps) values ('a', 601, 1)`)).rejects.toThrow(/check/)
      await expect(db.query(`insert into exercise_settings (exercise_id, goal_kg, goal_reps) values ('b', 50, 31)`)).rejects.toThrow(/check/)
      await expect(db.query(`insert into exercise_settings (exercise_id, goal_kg) values ('c', 50)`)).rejects.toThrow(/check/)
      await expect(db.query(`insert into exercise_settings (exercise_id) values ('d')`)).rejects.toThrow(/check/)
      const out = await db.query<{ d: { exercise_settings: { goal_kg: number }[] } }>('select export_my_data() as d')
      expect(out.rows[0].d.exercise_settings.map((x) => Number(x.goal_kg))).toEqual(expect.arrayContaining([100, 80]))
    })
  })
})
