import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Skip a workout day (spec T-110): a skipped day is a workout row with an optional reason.

let t: TestDb
let me: string

beforeAll(async () => {
  t = await createTestDb()
  me = await t.signUp('asha@example.com')
}, 30_000)

describe('skipped days (T-110)', () => {
  it('6. keeps a skip and its reason; a reason needs a skip and is at most 100 letters', async () => {
    await t.as(me, async (db) => {
      const r = await db.query<{ skipped: boolean; skip_reason: string | null }>(
        `insert into workout_sessions (skipped, skip_reason) values (true, 'Busy') returning skipped, skip_reason`,
      )
      expect(r.rows[0]).toEqual({ skipped: true, skip_reason: 'Busy' })
      const plain = await db.query<{ skipped: boolean }>('insert into workout_sessions default values returning skipped')
      expect(plain.rows[0].skipped).toBe(false)
      await expect(db.query(`insert into workout_sessions (skip_reason) values ('Busy')`)).rejects.toThrow(/check/)
      await expect(db.query(`insert into workout_sessions (skipped, skip_reason) values (true, $1)`, ['x'.repeat(101)])).rejects.toThrow(/check/)
    })
  })
})
