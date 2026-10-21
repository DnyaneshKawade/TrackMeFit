import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// Coaches add and change a client's plans and targets, but can't delete them (spec T-125).

let t: TestDb
let asha: string
let coach: string

const count = (db: PGlite, table: string) => db.query<{ n: number }>(`select count(*)::int as n from ${table}`).then((r) => r.rows[0].n)
const counts = (db: PGlite) => Promise.all(['workout_plans', 'diet_targets', 'meal_plans'].map((x) => count(db, x)))

beforeAll(async () => {
  t = await createTestDb()
  asha = await t.signUp('asha@example.com', { full_name: 'Asha' })
  coach = await t.signUp('coach@example.com', { role: 'coach' })
  await t.db.query(`update profiles set birth_date = '1990-01-01' where id = any($1)`, [[asha, coach]])
  await t.db.query(`update profiles set coach_status = 'approved' where id = $1`, [coach])
  await t.db.query(`insert into coach_clients (coach_id, client_id, status) values ($1, $2, 'active')`, [coach, asha])
}, 30_000)

describe('coach delete rules (T-125)', () => {
  it('1-3. a coach adds and changes, never deletes; the person can delete', async () => {
    await t.as(coach, async (db) => {
      const plan = await db.query<{ id: string }>(`insert into workout_plans (user_id, name) values ($1, 'Push Pull') returning id`, [asha])
      await db.query(`insert into plan_days (plan_id, day_index, name) values ($1, 0, 'Push')`, [plan.rows[0].id])
      await db.query(`insert into diet_targets (user_id, kcal, protein_g, carb_g, fat_g) values ($1, 2000, 100, 250, 60)`, [asha])
      await db.query(`insert into meal_plans (user_id, plan) values ($1, '{}')`, [asha])
      await db.query(`update workout_plans set name = 'PPL' where user_id = $1`, [asha])
      // Editing a plan still deletes and re-adds its days.
      await db.query(`delete from plan_days where plan_id = $1`, [plan.rows[0].id])
      expect(await count(db, 'plan_days')).toBe(0)
      for (const table of ['workout_plans', 'diet_targets', 'meal_plans']) await db.query(`delete from ${table} where user_id = $1`, [asha])
      expect(await counts(db)).toEqual([1, 1, 1])
    })
    await t.as(asha, async (db) => {
      expect((await db.query<{ name: string }>('select name from workout_plans')).rows[0].name).toBe('PPL')
      for (const table of ['workout_plans', 'diet_targets', 'meal_plans']) await db.query(`delete from ${table} where user_id = $1`, [asha])
      expect(await counts(db)).toEqual([0, 0, 0])
    })
  })
})
