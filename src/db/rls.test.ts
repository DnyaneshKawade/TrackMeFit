import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// Privacy rules: people see only their own data; an active coach can read a
// client's data and set targets and plans, but never edit the client's logs.

let t: TestDb
let asha: string // regular user
let ravi: string // another regular user
let coach: string // Asha's coach once she accepts
let otherCoach: string // a coach with no link to anyone

const logFood = (db: PGlite, userId: string, name = 'Dal tadka') =>
  db.query(
    `insert into food_logs (user_id, meal, food_id, food_name, grams, kcal, protein_g, carb_g, fat_g)
     values ($1, 'lunch', 'tmf:dish:dal-tadka', $2, 150, 111, 5.6, 16.7, 2.8)`,
    [userId, name],
  )
const count = async (db: PGlite, table: string) =>
  ((await db.query<{ n: number }>(`select count(*)::int as n from ${table}`)).rows[0].n)

beforeAll(async () => {
  t = await createTestDb()
  asha = await t.signUp('asha@example.com', { full_name: 'Asha' })
  ravi = await t.signUp('ravi@example.com')
  coach = await t.signUp('coach@example.com', { role: 'coach', full_name: 'Coach K' })
  otherCoach = await t.signUp('other@example.com', { role: 'coach' })
  await t.as(asha, async (db) => {
    await logFood(db, asha)
    await db.query(`insert into weigh_ins (weight_kg) values (72.4)`)
  })
  await t.as(ravi, (db) => logFood(db, ravi, 'Rajma'))
}, 30_000)

describe('sign-up', () => {
  it('creates a profile with the chosen role', async () => {
    const rows = (await t.db.query<{ id: string; role: string; full_name: string }>('select id, role, full_name from profiles order by id')).rows
    expect(rows.find((r) => r.id === asha)).toMatchObject({ role: 'user', full_name: 'Asha' })
    expect(rows.find((r) => r.id === coach)).toMatchObject({ role: 'coach' })
  })

  it('does not let anyone change their own role', async () => {
    await expect(t.as(asha, (db) => db.query(`update profiles set role = 'coach' where id = $1`, [asha]))).rejects.toThrow(/role cannot be changed/)
  })
})

describe('own data only', () => {
  it('shows each person only their own food logs', async () => {
    const names = await t.as(asha, async (db) => (await db.query<{ food_name: string }>('select food_name from food_logs')).rows)
    expect(names).toEqual([{ food_name: 'Dal tadka' }])
  })

  it('blocks writing rows for someone else', async () => {
    await expect(t.as(ravi, (db) => logFood(db, asha))).rejects.toThrow(/row-level security/)
  })

  it('hides everything from signed-out visitors', async () => {
    await expect(t.as(null, (db) => count(db, 'food_logs'))).rejects.toThrow(/permission denied/)
  })

  it('hides other profiles', async () => {
    expect(await t.as(ravi, (db) => count(db, 'profiles'))).toBe(1)
  })
})

describe('coaches', () => {
  it('only lets coaches send invites', async () => {
    await expect(
      t.as(ravi, (db) => db.query(`insert into coach_clients (coach_id, client_id) values ($1, $2)`, [ravi, asha])),
    ).rejects.toThrow(/row-level security/)
  })

  it('gives an invited coach no access until the client accepts', async () => {
    await t.as(coach, (db) => db.query(`insert into coach_clients (coach_id, client_id) values ($1, $2)`, [coach, asha]))
    expect(await t.as(coach, (db) => count(db, 'food_logs'))).toBe(0)
    expect(await t.as(coach, (db) => count(db, 'weigh_ins'))).toBe(0)
  })

  it('stops a coach from accepting on the client’s behalf', async () => {
    const updated = await t.as(coach, (db) => db.query(`update coach_clients set status = 'active' where client_id = $1`, [asha]))
      .catch((e: Error) => e)
    expect(updated instanceof Error || (updated as { affectedRows?: number }).affectedRows === 0).toBe(true)
  })

  it('lets the client accept, after which the coach can read her data', async () => {
    await t.as(asha, (db) => db.query(`update coach_clients set status = 'active' where coach_id = $1`, [coach]))
    expect(await t.as(coach, (db) => count(db, 'food_logs'))).toBe(1)
    expect(await t.as(coach, (db) => count(db, 'weigh_ins'))).toBe(1)
  })

  it('lets the client see her coach’s profile', async () => {
    const ids = await t.as(asha, async (db) => (await db.query<{ id: string }>('select id from profiles')).rows.map((r) => r.id))
    expect(ids.sort()).toEqual([asha, coach].sort())
  })

  it('never lets an unlinked coach see a client', async () => {
    expect(await t.as(otherCoach, (db) => count(db, 'food_logs'))).toBe(0)
    expect(await t.as(otherCoach, (db) => count(db, 'profiles'))).toBe(1)
  })

  it('lets the coach set diet targets, recorded as set by the coach', async () => {
    await t.as(coach, (db) =>
      db.query(`insert into diet_targets (user_id, kcal, protein_g, carb_g, fat_g) values ($1, 1800, 120, 200, 55)`, [asha]),
    )
    const rows = await t.as(asha, async (db) => (await db.query<{ set_by: string }>('select set_by from diet_targets')).rows)
    expect(rows).toEqual([{ set_by: coach }])
  })

  it('lets the coach build a workout plan for the client', async () => {
    await t.as(coach, async (db) => {
      const plan = await db.query<{ id: string }>(`insert into workout_plans (user_id, name) values ($1, 'Upper/Lower') returning id`, [asha])
      const day = await db.query<{ id: string }>(`insert into plan_days (plan_id, day_index, name) values ($1, 0, 'Upper') returning id`, [plan.rows[0].id])
      await db.query(`insert into plan_exercises (day_id, position, exercise_id, sets, rep_min, rep_max) values ($1, 0, 'bench-press', 3, 6, 10)`, [day.rows[0].id])
    })
    expect(await t.as(asha, (db) => count(db, 'plan_exercises'))).toBe(1)
  })

  it('does not let the coach edit the client’s food log', async () => {
    const res = await t.as(coach, (db) => db.query(`update food_logs set grams = 999 where user_id = $1`, [asha]))
    expect(res.affectedRows).toBe(0)
    const grams = await t.as(asha, async (db) => (await db.query<{ grams: string }>('select grams from food_logs')).rows[0].grams)
    expect(Number(grams)).toBe(150)
  })

  it('does not let a client move a link to another coach', async () => {
    await expect(
      t.as(asha, (db) => db.query(`update coach_clients set coach_id = $1 where client_id = $2`, [otherCoach, asha])),
    ).rejects.toThrow(/cannot be changed/)
  })

  it('removes access when the client ends the coaching', async () => {
    await t.as(asha, (db) => db.query(`update coach_clients set status = 'ended' where coach_id = $1`, [coach]))
    expect(await t.as(coach, (db) => count(db, 'food_logs'))).toBe(0)
    expect(await t.as(coach, (db) => count(db, 'diet_targets'))).toBe(0)
  })
})

describe('muscle feedback', () => {
  it('only the person writes feedback on their own sessions; their coach can read it', async () => {
    const t = await createTestDb()
    const me = await t.signUp('fb-me@x.in')
    const coach = await t.signUp('fb-coach@x.in', { role: 'coach' })
    const stranger = await t.signUp('fb-other@x.in')
    const session = await t.as(me, async (db) => {
      const { rows } = await db.query<{ id: string }>('insert into public.workout_sessions default values returning id')
      await db.query(`insert into public.muscle_feedback (session_id, muscle, recovery, effort) values ($1, 'chest', 'fresh', 'right')`, [rows[0].id])
      return rows[0].id
    })
    await expect(
      t.as(stranger, (db) => db.query(`insert into public.muscle_feedback (session_id, muscle, recovery, effort) values ($1, 'back', 'fresh', 'right')`, [session])),
    ).rejects.toThrow(/row-level security/)
    await t.as(coach, (db) => db.query(`insert into public.coach_clients (coach_id, client_id) values ($1, $2)`, [coach, me]))
    await t.as(me, (db) => db.query(`update public.coach_clients set status = 'active' where client_id = $1`, [me]))
    const seen = await t.as(coach, (db) => db.query('select muscle from public.muscle_feedback'))
    expect(seen.rows).toEqual([{ muscle: 'chest' }])
    expect((await t.as(stranger, (db) => db.query('select muscle from public.muscle_feedback'))).rows).toEqual([])
  })

  it('new plans start their block today', async () => {
    const t = await createTestDb()
    const me = await t.signUp('blk@x.in')
    const { rows } = await t.as(me, (db) =>
      db.query<{ ok: boolean }>(`insert into public.workout_plans (user_id, name) values ($1, 'PPL') returning block_started_on = current_date as ok`, [me]),
    )
    expect(rows[0].ok).toBe(true)
  })
})

describe('onboarding and progress', () => {
  it('saves every onboarding answer on the person’s own profile only', async () => {
    const t = await createTestDb()
    const me = await t.signUp('me@x.in')
    const other = await t.signUp('other@x.in')
    const answers = [
      'Asha', 'female', '1995-06-15', 160, 'on_feet', 3, 'beginner', 'home', 'lose', -0.005, 58, 'jain',
      ['no_onion_garlic'], ['ekadashi'], ['peanuts'], { counts: { 'tmf:dish:roti': 4 }, kcal: 410, proteinG: 16 },
      { diabetes: true, pregnant: false }, 'asthma', '2026-10-13T03:00:00Z',
    ]
    const update = `update profiles set full_name = $1, sex = $2, birth_date = $3, height_cm = $4, activity = $5, training_days = $6,
                    experience = $7, equipment = $8, goal = $9, goal_rate = $10, target_weight_kg = $11, diet_pref = $12,
                    food_rules = $13, fasting = $14, allergies = $15, current_diet = $16, medical = $17, other_health = $18,
                    onboarded_at = $19 where id = $20`
    const mine = await t.as(me, (db) => db.query(update, [...answers, me]))
    expect(mine.affectedRows).toBe(1)
    const theirs = await t.as(me, (db) => db.query(update, [...answers, other]))
    expect(theirs.affectedRows).toBe(0)
    const row = (await t.db.query<{ goal: string; fasting: string[]; current_diet: object }>('select goal, fasting, current_diet from profiles where id = $1', [me])).rows[0]
    expect(row).toEqual({ goal: 'lose', fasting: ['ekadashi'], current_diet: { counts: { 'tmf:dish:roti': 4 }, kcal: 410, proteinG: 16 } })
    await expect(t.as(me, (db) => db.query(`update profiles set goal_rate = -0.05 where id = $1`, [me]))).rejects.toThrow()
    await expect(t.as(me, (db) => db.query(`update profiles set equipment = 'castle' where id = $1`, [me]))).rejects.toThrow()
  })

  it('keeps one weigh-in and one set of measurements per day, written only by the person', async () => {
    const t = await createTestDb()
    const me = await t.signUp('me@x.in')
    const coach = await t.signUp('c@x.in', { role: 'coach' })
    await t.as(coach, (db) => db.query(`insert into coach_clients (coach_id, client_id) values ($1, $2)`, [coach, me]))
    await t.as(me, (db) => db.query(`update coach_clients set status = 'active' where client_id = $1`, [me]))
    const weigh = (kg: number) =>
      `insert into weigh_ins (user_id, measured_on, weight_kg) values ('${me}', '2026-10-13', ${kg})
       on conflict (user_id, measured_on) do update set weight_kg = excluded.weight_kg`
    await t.as(me, async (db) => {
      await db.query(weigh(70))
      await db.query(weigh(69.6))
      await db.query(`insert into measurements (measured_on, waist_cm) values ('2026-10-13', 82)
                      on conflict (user_id, measured_on) do update set waist_cm = excluded.waist_cm`)
    })
    const seen = await t.as(coach, (db) => db.query<{ weight_kg: string }>('select weight_kg from weigh_ins'))
    expect(seen.rows.map((r) => Number(r.weight_kg))).toEqual([69.6])
    await expect(t.as(coach, (db) => db.query(weigh(50)))).rejects.toThrow()
    expect(await t.as(coach, (db) => count(db, 'measurements'))).toBe(1)
  })
})

describe('your own foods and quick add', () => {
  it('keeps custom foods and recipes private to the person and their coach', async () => {
    const t = await createTestDb()
    const me = await t.signUp('me@x.in')
    const other = await t.signUp('other@x.in')
    const coach = await t.signUp('c@x.in', { role: 'coach' })
    await t.as(coach, (db) => db.query(`insert into coach_clients (coach_id, client_id) values ($1, $2)`, [coach, me]))
    await t.as(me, (db) => db.query(`update coach_clients set status = 'active' where client_id = $1`, [me]))
    const add = `insert into custom_foods (name, state, kcal, protein_g, carb_g, fat_g, portions, recipe)
                 values ('Mom''s dal', 'cooked', 103, 5.9, 16.8, 1.7, '[{"label":"1 serving","grams":150}]',
                         '{"ingredients":[{"foodId":"usda:1","name":"Toor dal","grams":200}],"cookedWeightG":750,"servings":5}')`
    await t.as(me, (db) => db.query(add))
    expect(await t.as(coach, (db) => count(db, 'custom_foods'))).toBe(1)
    expect(await t.as(other, (db) => count(db, 'custom_foods'))).toBe(0)
    expect((await t.as(other, (db) => db.query(`delete from custom_foods`))).affectedRows).toBe(0)
    expect((await t.as(coach, (db) => db.query(`delete from custom_foods`))).affectedRows).toBe(0)
    expect((await t.as(me, (db) => db.query(`delete from custom_foods`))).affectedRows).toBe(1)
  })

  it('allows a log entry without a weight only for quick add', async () => {
    const t = await createTestDb()
    const me = await t.signUp('me@x.in')
    const insert = (foodId: string) =>
      `insert into food_logs (meal, food_id, food_name, grams, kcal, protein_g, carb_g, fat_g)
       values ('dinner', '${foodId}', 'Biryani', null, 700, 0, 0, 0)`
    await t.as(me, (db) => db.query(insert('quick')))
    await expect(t.as(me, (db) => db.query(insert('tmf:dish:biryani')))).rejects.toThrow(/food_logs_quick_add_check/)
    await expect(
      t.as(me, (db) => db.query(`insert into food_logs (meal, food_id, food_name, grams, kcal, protein_g, carb_g, fat_g) values ('lunch', 'x', 'X', 0, 1, 0, 0, 0)`)),
    ).rejects.toThrow(/food_logs_grams_check/)
  })
})

describe('meal plans (T-058b)', () => {
  it('keeps a saved plan to the person and their active coach, recorded as saved by whoever saved it', async () => {
    const t = await createTestDb()
    const me = await t.signUp('me@x.in')
    const other = await t.signUp('other@x.in')
    const coach = await t.signUp('c@x.in', { role: 'coach' })
    const save = (userId: string) =>
      `insert into meal_plans (user_id, plan, picks) values ('${userId}', '{"meals":[]}', '{tmf:ing:paneer}')`
    await t.as(me, (db) => db.query(save(me)))
    expect(await t.as(other, (db) => count(db, 'meal_plans'))).toBe(0)
    await expect(t.as(other, (db) => db.query(save(me)))).rejects.toThrow(/row-level security/)
    await expect(t.as(coach, (db) => db.query(save(me)))).rejects.toThrow(/row-level security/)
    await t.as(coach, (db) => db.query(`insert into coach_clients (coach_id, client_id) values ($1, $2)`, [coach, me]))
    await t.as(me, (db) => db.query(`update coach_clients set status = 'active' where client_id = $1`, [me]))
    await t.as(coach, (db) => db.query(save(me)))
    const rows = await t.as(me, async (db) => (await db.query<{ created_by: string }>('select created_by from meal_plans order by created_at')).rows)
    expect(rows.map((r) => r.created_by).sort()).toEqual([me, coach].sort())
    await expect(
      t.as(coach, (db) => db.query(`insert into meal_plans (user_id, plan, created_by) values ($1, '{}', $1)`, [me])),
    ).rejects.toThrow(/row-level security/)
  })
})
