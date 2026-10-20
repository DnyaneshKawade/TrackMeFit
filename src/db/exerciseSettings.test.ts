import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Exercise settings (spec T-112): own rows only, in range, in "Download my data".

let t: TestDb
let asha: string
let ravi: string

beforeAll(async () => {
  t = await createTestDb()
  asha = await t.signUp('asha@example.com')
  ravi = await t.signUp('ravi@example.com')
}, 30_000)

describe('exercise settings (T-112)', () => {
  it('5. keeps own settings in range, hides them from others, and exports them', async () => {
    await t.as(asha, async (db) => {
      await db.query(`insert into exercise_settings (exercise_id, step_kg, rest_seconds, note) values ('lat-pulldown', 1, 60, 'Seat 4')`)
      await expect(db.query(`insert into exercise_settings (exercise_id, step_kg) values ('a', 25)`)).rejects.toThrow(/check/)
      await expect(db.query(`insert into exercise_settings (exercise_id, rest_seconds) values ('b', 5)`)).rejects.toThrow(/check/)
      await expect(db.query(`insert into exercise_settings (exercise_id) values ('c')`)).rejects.toThrow(/check/)
      const out = await db.query<{ d: { exercise_settings: { exercise_id: string; step_kg: number }[] } }>('select export_my_data() as d')
      expect(out.rows[0].d.exercise_settings).toMatchObject([{ exercise_id: 'lat-pulldown', step_kg: 1, rest_seconds: 60, note: 'Seat 4' }])
    })
    await t.as(ravi, async (db) => {
      expect((await db.query('select * from exercise_settings')).rows).toEqual([])
      await expect(db.query(`insert into exercise_settings (user_id, exercise_id, note) values ($1, 'x', 'hi')`, [asha])).rejects.toThrow()
    })
  })
})
