import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'
import { LANDMARKS } from '../engine/training'

// Four more muscles (spec T-082a): the database takes every muscle the app has.

let t: TestDb
let me: string

beforeAll(async () => {
  t = await createTestDb()
  me = await t.signUp('asha@example.com')
}, 30_000)

/** The muscles a check constraint allows, read from its definition. */
async function allowed(name: string) {
  const r = await t.db.query<{ def: string }>('select pg_get_constraintdef(oid) as def from pg_constraint where conname = $1', [name])
  return [...r.rows[0].def.matchAll(/'(\w+)'/g)].map((m) => m[1]).sort()
}

describe('more muscles (T-082a)', () => {
  it('5. feedback and own exercises take every muscle the app has, and no others', async () => {
    const app = Object.keys(LANDMARKS).sort()
    expect(await allowed('muscle_feedback_muscle_check')).toEqual(app)
    expect(await allowed('custom_exercises_muscle')).toEqual(app)
    await t.as(me, async (db) => {
      const s = await db.query<{ id: string }>('insert into workout_sessions default values returning id')
      for (const m of ['frontDelts', 'forearms', 'adductors', 'neck']) {
        await db.query(`insert into muscle_feedback (session_id, muscle, recovery, effort) values ($1, $2, 'fresh', 'right')`, [s.rows[0].id, m])
        await db.query(`insert into custom_exercises (name, primary_muscle) values ($1, $2)`, [`My ${m}`, m])
      }
    })
    await expect(t.as(me, (db) => db.query(`insert into custom_exercises (name, primary_muscle) values ('Wing', 'wings')`))).rejects.toThrow(/check/)
  })
})
