import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Muscle priority (spec T-082h): a plan keeps "Grow more" and "Keep" muscles.

let t: TestDb
let me: string

beforeAll(async () => {
  t = await createTestDb()
  me = await t.signUp('asha@example.com')
}, 30_000)

describe('muscle priority (T-082h)', () => {
  it('6. saves Grow more and Keep per muscle, empty by default, and rejects other values', async () => {
    await t.as(me, async (db) => {
      const p = await db.query<{ id: string; muscle_priority: object }>(`insert into workout_plans (user_id, name) values ($1, 'Upper') returning id, muscle_priority`, [me])
      expect(p.rows[0].muscle_priority).toEqual({})
      const id = p.rows[0].id
      await db.query('update workout_plans set muscle_priority = $1 where id = $2', [{ biceps: 'more', calves: 'keep' }, id])
      const back = await db.query<{ muscle_priority: object }>('select muscle_priority from workout_plans where id = $1', [id])
      expect(back.rows[0].muscle_priority).toEqual({ biceps: 'more', calves: 'keep' })
      for (const bad of [{ biceps: 'huge' }, { biceps: 3 }, ['more']])
        await expect(db.query('update workout_plans set muscle_priority = $1 where id = $2', [JSON.stringify(bad), id])).rejects.toThrow(/check/)
    })
  })
})
