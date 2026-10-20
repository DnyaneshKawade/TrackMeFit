import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Cardio sets (spec T-114): a time, and maybe a distance, with no weight or reps.

let t: TestDb
let me: string

beforeAll(async () => {
  t = await createTestDb()
  me = await t.signUp('asha@example.com')
}, 30_000)

describe('cardio sets (T-114)', () => {
  it('5. keeps a time of 1 s to 6 h and a distance up to 100 km, with no weight or reps', async () => {
    await t.as(me, async (db) => {
      const s = (await db.query<{ id: string }>('insert into workout_sessions default values returning id')).rows[0].id
      let i = 0
      const add = (sec: number | null, km: number | null, weight = 0, reps = 0) =>
        db.query(`insert into set_logs (session_id, exercise_id, set_index, weight_kg, reps, duration_sec, distance_km) values ($1, 'cardio-treadmill', $2, $3, $4, $5, $6)`, [s, i++, weight, reps, sec, km])
      await add(1500, 3.25)
      await add(1200, null)
      const r = await db.query<{ duration_sec: number; distance_km: string }>('select duration_sec, distance_km from set_logs order by set_index')
      expect(r.rows.map((x) => [x.duration_sec, x.distance_km === null ? null : Number(x.distance_km)])).toEqual([[1500, 3.25], [1200, null]])
      await expect(add(null, 3)).rejects.toThrow(/check/)
      await expect(add(0, 3)).rejects.toThrow(/check/)
      await expect(add(21601, null)).rejects.toThrow(/check/)
      await expect(add(600, 101)).rejects.toThrow(/check/)
      await expect(add(600, 0)).rejects.toThrow(/check/)
      await expect(add(600, 2, 20, 0)).rejects.toThrow(/check/)
      await expect(add(600, 2, 0, 10)).rejects.toThrow(/check/)
    })
  })
})
