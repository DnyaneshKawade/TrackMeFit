import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// Data requests (spec T-042a5): export everything, delete everything, and
// ask for a correction that an owner answers.

let t: TestDb
let owner: string
let asha: string
let coach: string
let ravi: string

/** Tables with no person's data in them. */
const NOT_PERSONAL = new Set(['admin_log', 'app_settings', 'food_search', 'foods', 'off_products', 'view_sessions'])

const exportOf = (id: string) => t.as(id, (db) => db.query<{ export_my_data: Record<string, unknown> }>('select export_my_data()')).then((r) => r.rows[0].export_my_data)

/** Rows anywhere in the public tables that still name this id. The admin
 * log keeps who an admin acted on, as a record of admin work. */
async function rowsNaming(id: string) {
  const cols = await t.db.query<{ table_name: string; column_name: string }>(
    `select table_name, column_name from information_schema.columns c join information_schema.tables t using (table_schema, table_name)
     where table_schema = 'public' and data_type = 'uuid' and t.table_type = 'BASE TABLE' and table_name <> 'admin_log'`,
  )
  const found: string[] = []
  for (const c of cols.rows) {
    const n = await t.db.query<{ n: number }>(`select count(*)::int as n from public.${c.table_name} where ${c.column_name} = $1`, [id])
    if (n.rows[0].n) found.push(`${c.table_name}.${c.column_name}`)
  }
  return found
}

/** Gives the person a row in most tables. */
async function fill(db: PGlite, me: string) {
  await db.query(`insert into food_logs (meal, food_id, food_name, grams, kcal, protein_g, carb_g, fat_g) values ('lunch', 'x', 'Dal', 100, 120, 7, 18, 2)`)
  await db.query(`insert into weigh_ins (weight_kg) values (64)`)
  await db.query(`insert into measurements (measured_on, waist_cm) values (current_date, 80)`)
  await db.query(`insert into diet_targets (user_id, kcal, protein_g, carb_g, fat_g) values ($1, 1800, 100, 200, 50)`, [me])
  const plan = await db.query<{ id: string }>(`insert into workout_plans (user_id, name) values ($1, 'Full body') returning id`, [me])
  const day = await db.query<{ id: string }>(`insert into plan_days (plan_id, day_index, name) values ($1, 0, 'A') returning id`, [plan.rows[0].id])
  await db.query(`insert into plan_exercises (day_id, position, exercise_id, sets, rep_min, rep_max) values ($1, 0, 'squat', 3, 6, 10)`, [day.rows[0].id])
  const s = await db.query<{ id: string }>('insert into workout_sessions default values returning id')
  await db.query(`insert into set_logs (session_id, exercise_id, set_index, weight_kg, reps) values ($1, 'squat', 0, 40, 8)`, [s.rows[0].id])
  await db.query(`insert into storage.objects (bucket_id, name) values ('progress-photos', $1)`, [`${me}/p1.jpg`])
  await db.query(`insert into progress_photos (taken_on, pose, path) values (current_date, 'front', $1)`, [`${me}/p1.jpg`])
  await db.query(`insert into data_requests (note) values ('My weight from 3 Oct is wrong')`)
}

beforeAll(async () => {
  t = await createTestDb()
  owner = await t.signUp('dk@example.com')
  asha = await t.signUp('asha@example.com', { full_name: 'Asha' })
  ravi = await t.signUp('ravi@example.com', { full_name: 'Ravi' })
  coach = await t.signUp('coach@example.com', { role: 'coach', full_name: 'Coach K' })
  await t.db.query(`insert into user_roles (user_id, level) values ($1, 'owner')`, [owner])
  await t.as(asha, (db) => fill(db, asha))
  // Asha's coach sets a target and replies to a check-in.
  const code = await t.as(coach, (db) => db.query<{ code: string }>('insert into coach_invites default values returning code').then((r) => r.rows[0].code))
  await t.as(asha, (db) => db.query('select join_coach($1)', [code]))
  await t.as(asha, (db) => db.query(`insert into check_ins (week_start, energy, sleep, mood, diet, training) values (date_trunc('week', current_date)::date, 3, 3, 3, 3, 3)`))
  await t.as(coach, async (db) => {
    await db.query(`insert into diet_targets (user_id, kcal, protein_g, carb_g, fat_g, starts_on) values ($1, 1700, 100, 180, 50, current_date + 1)`, [asha])
    const ci = await db.query<{ id: string }>('select id from check_ins limit 1')
    await db.query(`select reply_check_in($1, 'Good week')`, [ci.rows[0].id])
    await db.query(`insert into meal_plans (user_id, plan, created_by) values ($1, '{}', $2)`, [asha, coach])
    await db.query(`insert into workout_plans (user_id, name) values ($1, 'Coach plan')`, [asha])
  })
}, 30_000)

describe('data requests (T-042a5)', () => {
  it('1. the export holds every table with a person’s data, and their rows', async () => {
    const data = await exportOf(asha)
    const tables = await t.db.query<{ table_name: string }>(`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'`)
    const missing = tables.rows.map((r) => r.table_name).filter((n) => !NOT_PERSONAL.has(n) && !(n in data))
    expect(missing).toEqual([])
    expect((data.account as { email: string }).email).toBe('asha@example.com')
    for (const key of ['food_logs', 'weigh_ins', 'measurements', 'workout_plans', 'plan_days', 'plan_exercises', 'workout_sessions', 'set_logs', 'progress_photos', 'check_ins', 'coach_clients', 'data_requests'])
      expect((data[key] as unknown[]).length, key).toBeGreaterThan(0)
    expect((data.diet_targets as unknown[]).length).toBe(2)
    // Nobody else's rows.
    expect((await exportOf(ravi)).food_logs).toEqual([])
    await expect(t.as(null, (db) => db.query('select export_my_data()'))).rejects.toThrow()
  })

  it('5. a person asks for a correction and sees the answer; 7. nobody reads or answers another’s', async () => {
    const mine = (id: string) => t.as(id, (db) => db.query<{ note: string; status: string; answer: string }>('select note, status, answer from data_requests').then((r) => r.rows))
    expect(await mine(ravi)).toEqual([])
    await expect(t.as(asha, (db) => db.query(`update data_requests set status = 'closed', answer = 'done'`))).rejects.toThrow(/permission denied/)
    await expect(t.as(ravi, (db) => db.query(`insert into data_requests (person_id, note) values ($1, 'x')`, [asha]))).rejects.toThrow(/permission denied|row-level security/)
    await expect(t.as(asha, (db) => db.query(`insert into data_requests (note) values ('  ')`))).rejects.toThrow(/check/)

    const open = await t.as(owner, (db) => db.query<{ id: string; days_left: number; email: string }>(`select * from admin_requests('open')`), true)
    expect(open.rows.map((r) => [r.email, r.days_left])).toEqual([['asha@example.com', 90]])
    await expect(t.as(asha, (db) => db.query(`select * from admin_requests('open')`), true)).rejects.toThrow(/not allowed/)
    await expect(t.as(owner, (db) => db.query(`select admin_close_request($1, '')`, [open.rows[0].id]), true)).rejects.toThrow(/reason is needed/)
    await t.as(owner, (db) => db.query(`select admin_close_request($1, 'Fixed it to 64 kg')`, [open.rows[0].id]), true)
    expect(await mine(asha)).toEqual([{ note: 'My weight from 3 Oct is wrong', status: 'closed', answer: 'Fixed it to 64 kg' }])
    await expect(t.as(owner, (db) => db.query(`select admin_close_request($1, 'again')`, [open.rows[0].id]), true)).rejects.toThrow(/request not open/)
    const log = await t.db.query('select action, target_id, reason from admin_log order by id desc limit 1')
    expect(log.rows).toEqual([{ action: 'close request', target_id: asha, reason: 'Fixed it to 64 kg' }])
  })

  it('3. an admin must be removed as admin before deleting their own account', async () => {
    await expect(t.as(owner, (db) => db.query('select prepare_delete_me()'))).rejects.toThrow(/remove them as admin first/)
    await t.as(asha, (db) => db.query('select prepare_delete_me()'))
  })

  it('4. deleting a coach who set targets, plans and replies works; the client keeps those rows', async () => {
    await t.db.query('delete from auth.users where id = $1', [coach])
    expect(await rowsNaming(coach)).toEqual([])
    const data = await exportOf(asha)
    expect((data.diet_targets as { set_by: string | null }[]).map((r) => r.set_by).sort()).toEqual([asha, null])
    expect((data.check_ins as { coach_reply: string; replied_by: string | null }[])[0]).toMatchObject({ coach_reply: 'Good week', replied_by: null })
    expect((data.meal_plans as { created_by: string | null }[]).map((r) => r.created_by)).toEqual([null])
    expect((data.workout_plans as { name: string; created_by: string | null }[]).find((r) => r.name === 'Coach plan')).toMatchObject({ created_by: null })
  })

  it('2. deleting an account removes every row that names them', async () => {
    expect((await rowsNaming(asha)).length).toBeGreaterThan(5)
    await t.db.query('delete from auth.users where id = $1', [asha])
    expect(await rowsNaming(asha)).toEqual([])
  })
})
