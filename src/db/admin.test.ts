import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// Admin access (spec T-042a1): admins live in their own table, every admin
// rule needs the second factor, and every admin action writes one log row
// that nobody can change.

let t: TestDb
let owner: string // DK, added in the SQL editor
let helper: string // a content admin
let person: string // a regular user
let coach: string

const logRows = async () => (await t.db.query<{ n: number }>('select count(*)::int as n from admin_log')).rows[0].n
const refused = (p: Promise<unknown>) => expect(p).rejects.toThrow()

beforeAll(async () => {
  t = await createTestDb()
  owner = await t.signUp('dk@example.com', { full_name: 'DK' })
  helper = await t.signUp('helper@example.com', { full_name: 'Meera' })
  person = await t.signUp('asha@example.com', { full_name: 'Asha' })
  coach = await t.signUp('coach@example.com', { role: 'coach' })
  // The first owner is added by hand in the SQL editor.
  await t.db.query(`insert into user_roles (user_id, level) values ($1, 'owner')`, [owner])
}, 30_000)

const addHelper = (db: PGlite) => db.query(`select add_admin('Helper@Example.com', 'content', 'Helps with foods')`)

describe('admin access (T-042a1)', () => {
  it('1. sign-up never makes an admin, and nobody can write their own admin row', async () => {
    const sneaky = await t.signUp('sneaky@example.com', { role: 'admin', level: 'owner' })
    expect((await t.db.query('select * from user_roles where user_id = $1', [sneaky])).rows).toEqual([])
    await refused(t.as(sneaky, (db) => db.query(`insert into user_roles (user_id, level) values ($1, 'owner')`, [sneaky]), true))
    await refused(t.as(owner, (db) => db.query(`update user_roles set level = 'content' where user_id = $1`, [owner]), true))
  })

  it('2. a person, a coach and an admin without the second factor are all refused', async () => {
    for (const [id, aal2] of [[person, true], [coach, true], [owner, false]] as const) {
      await refused(t.as(id, (db) => db.query('select * from admin_team()'), aal2))
      await refused(t.as(id, addHelper, aal2))
      expect(await t.as(id, async (db) => (await db.query<{ ok: boolean }>(`select is_admin('content') as ok`)).rows[0].ok, aal2)).toBe(false)
      expect(await t.as(id, async (db) => (await db.query('select * from admin_log')).rows.length, aal2)).toBe(0)
    }
    // Without the second factor an admin still sees their own row, so the app can ask for it.
    expect(await t.as(owner, async (db) => (await db.query('select level from user_roles')).rows, false)).toEqual([{ level: 'owner' }])
    expect(await logRows()).toBe(0)
  })

  it('3. an owner with the second factor adds, changes and removes admins, one log row each', async () => {
    await t.as(owner, addHelper, true)
    expect(await logRows()).toBe(1)
    const team = await t.as(owner, async (db) => (await db.query<{ email: string; level: string; name: string }>('select email, level, name from admin_team()')).rows, true)
    expect(team).toEqual([
      { email: 'dk@example.com', level: 'owner', name: 'DK' },
      { email: 'helper@example.com', level: 'content', name: 'Meera' },
    ])
    await t.as(owner, (db) => db.query(`select set_admin_level($1, 'owner', 'Runs support now')`, [helper]), true)
    await t.as(owner, (db) => db.query(`select set_admin_level($1, 'content', 'Back to foods')`, [helper]), true)
    expect(await logRows()).toBe(3)
    const log = await t.as(owner, async (db) => (await db.query<{ action: string; admin_id: string; target_id: string; reason: string }>('select action, admin_id, target_id, reason from admin_log order by id')).rows, true)
    expect(log.map((r) => r.action)).toEqual(['add admin', 'change admin level', 'change admin level'])
    expect(log.every((r) => r.admin_id === owner && r.target_id === helper && r.reason.length > 0)).toBe(true)
  })

  it('4. a content admin passes the content check but can’t manage the team or read the log', async () => {
    expect(await t.as(helper, async (db) => (await db.query<{ ok: boolean }>(`select is_admin('content') as ok`)).rows[0].ok, true)).toBe(true)
    expect(await t.as(helper, async (db) => (await db.query<{ ok: boolean }>(`select is_admin('owner') as ok`)).rows[0].ok, true)).toBe(false)
    await refused(t.as(helper, (db) => db.query('select * from admin_team()'), true))
    expect(await t.as(helper, async (db) => (await db.query('select * from admin_log')).rows.length, true)).toBe(0)
  })

  it('5. every change needs a reason; a failed action writes no log row', async () => {
    const before = await logRows()
    await refused(t.as(owner, (db) => db.query(`select set_admin_level($1, 'owner', '  ')`, [helper]), true))
    await refused(t.as(owner, (db) => db.query(`select add_admin('nobody@example.com', 'content', 'New helper')`), true))
    await refused(t.as(owner, (db) => db.query(`select add_admin('helper@example.com', 'content', 'Again')`), true))
    expect(await logRows()).toBe(before)
    expect((await t.db.query<{ level: string }>('select level from user_roles where user_id = $1', [helper])).rows[0].level).toBe('content')
  })

  it('6. nobody can change or delete the log, the database owner included', async () => {
    await refused(t.as(owner, (db) => db.query(`update admin_log set reason = 'x'`), true))
    await refused(t.as(owner, (db) => db.query('delete from admin_log'), true))
    await refused(t.as(owner, (db) => db.query(`insert into admin_log (admin_id, action, reason) values ($1, 'fake', 'x')`, [owner]), true))
    await refused(t.db.query(`update admin_log set reason = 'x'`))
    await refused(t.db.query('delete from admin_log'))
    await refused(t.db.query('truncate admin_log'))
  })

  it('7. the last owner can’t be removed or made a content admin', async () => {
    await refused(t.as(owner, (db) => db.query(`select remove_admin($1, 'Leaving')`, [owner]), true))
    await refused(t.as(owner, (db) => db.query(`select set_admin_level($1, 'content', 'Oops')`, [owner]), true))
    const before = await logRows()
    await t.as(owner, (db) => db.query(`select remove_admin($1, 'No longer helping')`, [helper]), true)
    expect(await logRows()).toBe(before + 1)
    expect((await t.db.query('select * from user_roles where user_id = $1', [helper])).rows).toEqual([])
  })
})
