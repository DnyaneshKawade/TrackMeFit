import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// "Something hurt" per exercise (spec T-108): feedback keeps the exercises that hurt.

const BENCH = 'bench-press'

describe('database (T-108)', () => {
  let t: TestDb
  let me: string
  beforeAll(async () => {
    t = await createTestDb()
    me = await t.signUp('asha@example.com')
  }, 30_000)

  it('5. keeps the exercises that hurt, empty by default, at most 20', async () => {
    await t.as(me, async (db) => {
      const s = await db.query<{ id: string }>('insert into workout_sessions default values returning id')
      const id = s.rows[0].id
      await db.query(`insert into muscle_feedback (session_id, muscle, recovery, effort) values ($1, 'back', 'fresh', 'right')`, [id])
      await db.query(`insert into muscle_feedback (session_id, muscle, recovery, effort, pain, hurt_exercises) values ($1, 'chest', 'fresh', 'right', true, $2)`, [id, [BENCH]])
      const r = await db.query<{ muscle: string; hurt_exercises: string[] }>('select muscle, hurt_exercises from muscle_feedback order by muscle')
      expect(r.rows).toEqual([{ muscle: 'back', hurt_exercises: [] }, { muscle: 'chest', hurt_exercises: [BENCH] }])
      await expect(
        db.query(`update muscle_feedback set hurt_exercises = $1 where muscle = 'chest'`, [Array.from({ length: 21 }, (_, i) => `x${i}`)]),
      ).rejects.toThrow(/check/)
    })
  })
})
