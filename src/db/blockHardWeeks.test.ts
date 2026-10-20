import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Block controls (spec T-109): a block has 3 to 7 hard weeks.

let t: TestDb
let me: string

beforeAll(async () => {
  t = await createTestDb()
  me = await t.signUp('asha@example.com')
}, 30_000)

describe('hard weeks (T-109)', () => {
  it('5. keeps 3 to 7 hard weeks, 4 by default', async () => {
    await t.as(me, async (db) => {
      const p = await db.query<{ id: string; hard_weeks: number }>(`insert into workout_plans (user_id, name) values ($1, 'Upper') returning id, hard_weeks`, [me])
      expect(p.rows[0].hard_weeks).toBe(4)
      const id = p.rows[0].id
      for (const n of [3, 7]) await db.query('update workout_plans set hard_weeks = $1 where id = $2', [n, id])
      for (const n of [2, 8]) await expect(db.query('update workout_plans set hard_weeks = $1 where id = $2', [n, id])).rejects.toThrow(/check/)
    })
  })
})
