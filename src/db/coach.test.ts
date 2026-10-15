import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// Coach invite codes (T-026a).

let t: TestDb
let asha: string
let ravi: string
let coach: string
let coach2: string

const newCode = (db: PGlite) => db.query<{ code: string }>('insert into coach_invites default values returning code').then((r) => r.rows[0].code)
const join = (db: PGlite, code: string) => db.query<{ join_coach: string }>('select join_coach($1)', [code]).then((r) => r.rows[0].join_coach)
const weighIns = (db: PGlite) => db.query<{ n: number }>('select count(*)::int as n from weigh_ins').then((r) => r.rows[0].n)
const links = (db: PGlite) => db.query<{ coach_id: string; status: string }>('select coach_id, status from coach_clients order by created_at').then((r) => r.rows)

beforeAll(async () => {
  t = await createTestDb()
  asha = await t.signUp('asha@example.com')
  ravi = await t.signUp('ravi@example.com')
  coach = await t.signUp('coach@example.com', { role: 'coach', full_name: 'Coach K' })
  coach2 = await t.signUp('coach2@example.com', { role: 'coach', full_name: 'Coach M' })
  await t.as(asha, (db) => db.query(`insert into weigh_ins (weight_kg) values (64)`))
})

describe('coach invite codes (T-026a)', () => {
  it('7. only coaches make codes, a code works once, nobody links someone else, and access lasts only while the link is active', async () => {
    await expect(t.as(asha, newCode)).rejects.toThrow(/row-level security/)
    // A coach can't make a code for another coach.
    await expect(t.as(coach, (db) => db.query('insert into coach_invites (coach_id) values ($1)', [coach2]))).rejects.toThrow(/row-level security/)

    const code = await t.as(coach, newCode)
    expect(code).toMatch(/^[0-9A-F]{10}$/)
    // Other people can't see the code.
    expect(await t.as(coach2, (db) => db.query('select * from coach_invites').then((r) => r.rows.length))).toBe(0)
    expect(await t.as(asha, (db) => db.query('select * from coach_invites').then((r) => r.rows.length))).toBe(0)

    // Coaches can't use codes, including their own.
    await expect(t.as(coach, (db) => join(db, code))).rejects.toThrow(/invite not valid/)
    await expect(t.as(coach2, (db) => join(db, code))).rejects.toThrow(/invite not valid/)
    // Not signed in.
    await expect(t.as(null, (db) => join(db, code))).rejects.toThrow()

    expect(await t.as(coach, weighIns)).toBe(0)
    // Typed with a space, a dash and small letters.
    const typed = `${code.slice(0, 5).toLowerCase()} -${code.slice(5)}`
    expect(await t.as(asha, (db) => join(db, typed))).toBe('Coach K')
    expect(await t.as(coach, weighIns)).toBe(1)

    // Used once.
    await expect(t.as(ravi, (db) => join(db, code))).rejects.toThrow(/invite not valid/)
    expect(await t.as(coach, (db) => db.query('select * from coach_invites').then((r) => r.rows.length))).toBe(0)

    // Old codes don't work.
    const old = await t.as(coach, newCode)
    await t.db.query(`update coach_invites set expires_at = now() - interval '1 minute' where code = $1`, [old])
    await expect(t.as(ravi, (db) => join(db, old))).rejects.toThrow(/invite not valid/)

    // Nobody can make an active link directly.
    await expect(
      t.as(coach, (db) => db.query(`insert into coach_clients (coach_id, client_id, status) values ($1, $2, 'active')`, [coach, ravi])),
    ).rejects.toThrow(/row-level security/)

    // The client ends it; the coach sees nothing more.
    await t.as(asha, (db) => db.query(`update coach_clients set status = 'ended' where coach_id = $1`, [coach]))
    expect(await t.as(coach, weighIns)).toBe(0)
  })

  it('4. joining a new coach ends the old link; rejoining makes the old one active again', async () => {
    const first = await t.as(coach, newCode)
    expect(await t.as(ravi, (db) => join(db, first))).toBe('Coach K')
    const second = await t.as(coach2, newCode)
    expect(await t.as(ravi, (db) => join(db, second))).toBe('Coach M')
    expect(await t.as(ravi, links)).toEqual([
      { coach_id: coach, status: 'ended' },
      { coach_id: coach2, status: 'active' },
    ])
    const again = await t.as(coach, newCode)
    await t.as(ravi, (db) => join(db, again))
    expect(await t.as(ravi, links)).toEqual([
      { coach_id: coach, status: 'active' },
      { coach_id: coach2, status: 'ended' },
    ])
  })
})

describe('client summaries (T-026b)', () => {
  it('6. sums last week per active client for the coach only, from one request', async () => {
    const t2 = await createTestDb()
    const meena = await t2.signUp('meena@example.com', { full_name: 'Meena' })
    const other = await t2.signUp('other@example.com', { full_name: 'Other' })
    const k = await t2.signUp('k@example.com', { role: 'coach', full_name: 'Coach K' })
    const code = await t2.as(k, newCode)
    await t2.as(meena, (db) => join(db, code))
    await t2.as(meena, async (db) => {
      await db.query(`update profiles set goal = 'lose', training_days = 3 where id = $1`, [meena])
      for (const [day, kcal] of [['2026-10-13', 1500], ['2026-10-13', 500], ['2026-10-14', 1600], ['2026-10-15', 900], ['2026-10-01', 3000]] as const)
        await db.query(
          `insert into food_logs (logged_on, meal, food_id, food_name, grams, kcal, protein_g, carb_g, fat_g) values ($1, 'lunch', 'x', 'x', 100, $2, 50, 0, 0)`,
          [day, kcal],
        )
      await db.query(`insert into diet_targets (user_id, starts_on, kcal, protein_g, carb_g, fat_g) values ($1, '2026-10-01', 1800, 120, 200, 60)`, [meena])
      await db.query(`insert into workout_sessions (performed_on) values ('2026-10-12'), ('2026-10-02')`)
    })
    await t2.as(other, (db) => db.query(`insert into food_logs (meal, food_id, food_name, grams, kcal, protein_g, carb_g, fat_g) values ('lunch', 'x', 'x', 100, 100, 1, 0, 0)`))

    const rows = await t2.as(k, (db) => db.query<Record<string, unknown>>(`select * from client_summaries('2026-10-15')`).then((r) => r.rows))
    expect(rows).toHaveLength(1)
    const r = rows[0]
    expect([r.full_name, r.goal, r.training_days, r.last_food_on instanceof Date ? (r.last_food_on as Date).toISOString().slice(0, 10) : r.last_food_on]).toEqual([
      'Meena', 'lose', 3, '2026-10-15',
    ])
    // Today is left out: 2000 on the 13th and 1600 on the 14th.
    expect([r.food_days, Number(r.avg_kcal), Number(r.avg_protein_g), r.target_kcal, r.target_protein_g, r.workouts]).toEqual([2, 1800, 75, 1800, 120, 1])

    // Others see nothing; an ended link drops out.
    expect(await t2.as(other, (db) => db.query(`select * from client_summaries('2026-10-15')`).then((x) => x.rows.length))).toBe(0)
    await t2.as(meena, (db) => db.query(`update coach_clients set status = 'ended'`))
    expect(await t2.as(k, (db) => db.query(`select * from client_summaries('2026-10-15')`).then((x) => x.rows.length))).toBe(0)
  })
})
