import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Myo-reps (spec T-111): mini-sets are kept with a myo-reps set only.

let t: TestDb
let me: string

beforeAll(async () => {
  t = await createTestDb()
  me = await t.signUp('asha@example.com')
}, 30_000)

describe('myo-reps (T-111)', () => {
  it('4. keeps 1 to 10 mini-sets of 1 to 30 reps, only on a myo-reps set', async () => {
    await t.as(me, async (db) => {
      const s = (await db.query<{ id: string }>('insert into workout_sessions default values returning id')).rows[0].id
      const add = (tag: string | null, mini: number[] | null, i: number) =>
        db.query(`insert into set_logs (session_id, exercise_id, set_index, weight_kg, reps, tag, mini_reps) values ($1, 'lat-pulldown', $2, 40, 28, $3, $4)`, [s, i, tag, mini])
      await add('myo', [5, 4, 4], 0)
      const r = await db.query<{ mini_reps: number[] }>('select mini_reps from set_logs')
      expect(r.rows[0].mini_reps).toEqual([5, 4, 4])
      await expect(add(null, [5], 1)).rejects.toThrow(/check/)
      await expect(add('myo', [31], 2)).rejects.toThrow(/check/)
      await expect(add('myo', [], 3)).rejects.toThrow(/check/)
      await expect(add('myo', Array(11).fill(3), 4)).rejects.toThrow(/check/)
    })
  })
})
