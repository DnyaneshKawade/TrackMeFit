import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Soreness timing and pump (spec T-082g): a row can hold "how it healed"
// alone, or effort and pump alone; old answers still save.

describe('database (T-082g)', () => {
  let t: TestDb
  let me: string
  beforeAll(async () => {
    t = await createTestDb()
    me = await t.signUp('asha@example.com')
  }, 30_000)

  it('9. saves healing alone, then effort and pump on the same row; checks the values', async () => {
    await t.as(me, async (db) => {
      const s = await db.query<{ id: string }>('insert into workout_sessions default values returning id')
      const id = s.rows[0].id
      await db.query(`insert into muscle_feedback (session_id, muscle, recovery) values ($1, 'chest', 'onTime')`, [id])
      await db.query(
        `insert into muscle_feedback (session_id, muscle, effort, pump) values ($1, 'chest', 'right', 'low')
         on conflict (session_id, muscle) do update set effort = excluded.effort, pump = excluded.pump`,
        [id],
      )
      await db.query(`insert into muscle_feedback (session_id, muscle, recovery, effort) values ($1, 'back', 'fresh', 'right')`, [id])
      const r = await db.query('select muscle, recovery, effort, pump from muscle_feedback order by muscle')
      expect(r.rows).toEqual([
        { muscle: 'back', recovery: 'fresh', effort: 'right', pump: null },
        { muscle: 'chest', recovery: 'onTime', effort: 'right', pump: 'low' },
      ])
      await expect(db.query(`insert into muscle_feedback (session_id, muscle) values ($1, 'biceps')`, [id])).rejects.toThrow(/check/)
      await expect(db.query(`insert into muscle_feedback (session_id, muscle, recovery) values ($1, 'biceps', 'sore')`, [id])).rejects.toThrow(/check/)
      await expect(db.query(`insert into muscle_feedback (session_id, muscle, effort, pump) values ($1, 'biceps', 'right', 'huge')`, [id])).rejects.toThrow(/check/)
    })
  })
})
