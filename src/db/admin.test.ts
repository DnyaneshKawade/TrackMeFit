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

describe('people page (T-042a2)', () => {
  let p2: TestDb
  let dk: string
  let asha: string
  let ravi: string
  let kiran: string // a coach
  const rows = async () => (await p2.db.query<{ n: number }>('select count(*)::int as n from admin_log')).rows[0].n
  const people = (search = '', before: Date | null = null, beforeId: string | null = null, lim = 50) =>
    p2.as(dk, async (db) => (await db.query<Record<string, unknown>>('select * from admin_people($1, $2, $3, $4)', [search, before, beforeId, lim])).rows, true)

  beforeAll(async () => {
    p2 = await createTestDb()
    dk = await p2.signUp('dk@example.com', { full_name: 'DK' })
    asha = await p2.signUp('asha@example.com', { full_name: 'Asha Rao' })
    ravi = await p2.signUp('ravi_k@example.com', { full_name: 'Ravi' })
    kiran = await p2.signUp('kiran@example.com', { role: 'coach', full_name: 'Coach Kiran' })
    await p2.db.query(`insert into user_roles (user_id, level) values ($1, 'owner')`, [dk])
    // Asha and Ravi join in the same instant, so paging must not skip one.
    await p2.db.query(`update auth.users set created_at = '2026-10-01' where id = $1`, [dk])
    await p2.db.query(`update auth.users set created_at = '2026-10-02' where id = any($1)`, [[asha, ravi]])
    await p2.db.query(`update auth.users set created_at = '2026-10-03' where id = $1`, [kiran])
    await p2.db.query(`update auth.users set phone = '919800011122', email_confirmed_at = now() where id = $1`, [asha])
    await p2.db.query(`insert into coach_clients (coach_id, client_id, status) values ($1, $2, 'active')`, [kiran, asha])
    await p2.db.query(`insert into auth.sessions (user_id) values ($1), ($1), ($2)`, [asha, ravi])
    // Health data the page must never show.
    await p2.as(asha, (db) => db.query(`insert into weigh_ins (weight_kg) values (72.4)`))
  }, 30_000)

  it('1. owners search by name, email or phone, newest first, without health data', async () => {
    const order = (await people()).map((r) => r.email)
    expect(order[0]).toBe('kiran@example.com')
    expect(order.slice(1, 3).sort()).toEqual(['asha@example.com', 'ravi_k@example.com'])
    expect(order[3]).toBe('dk@example.com')
    expect((await people('rao')).map((r) => r.email)).toEqual(['asha@example.com'])
    expect((await people('9800011')).map((r) => r.email)).toEqual(['asha@example.com'])
    // _ is a letter, not a wildcard.
    expect((await people('i_k')).map((r) => r.email)).toEqual(['ravi_k@example.com'])
    const [a] = await people('asha')
    expect(a).toMatchObject({ name: 'Asha Rao', role: 'user', confirmed: true, blocked: false, onboarded: false, coach_name: 'Coach Kiran', admin_level: null })
    expect(Object.keys(a).sort()).toEqual(['admin_level', 'blocked', 'coach_name', 'confirmed', 'email', 'joined_at', 'last_active_at', 'name', 'onboarded', 'phone', 'role', 'user_id'].sort())
    expect((await people()).find((r) => r.email === 'dk@example.com')!.admin_level).toBe('owner')
  })

  it('2. pages 50 at a time from the last row, even when two people joined at once', async () => {
    const all = await people()
    const first = await people('', null, null, 2)
    expect(first).toEqual(all.slice(0, 2))
    const last = first[1]
    const next = await people('', last.joined_at as Date, last.user_id as string, 2)
    expect(next).toEqual(all.slice(2, 4))
  })

  it('3. every action needs an owner with the second step', async () => {
    for (const [id, aal2] of [[asha, true], [kiran, true], [dk, false]] as const) {
      await refused(p2.as(id, (db) => db.query(`select * from admin_people('')`), aal2))
      await refused(p2.as(id, (db) => db.query(`select admin_account_action($1, 'sign out', 'Asked by phone')`, [ravi]), aal2))
      await refused(p2.as(id, (db) => db.query(`select admin_end_coach_link($1, 'Asked')`, [asha]), aal2))
      await refused(p2.as(id, (db) => db.query(`select admin_set_role($1, 'coach', 'Asked')`, [ravi]), aal2))
    }
    expect(await rows()).toBe(0)
  })

  it('4. each action writes one log row; sign out, block and delete end every session', async () => {
    const act = (person: string, a: string, why = 'Asked by email') =>
      p2.as(dk, async (db) => (await db.query<{ email: string }>('select admin_account_action($1, $2, $3) as email', [person, a, why])).rows[0].email, true)
    expect(await act(asha, 'sign out')).toBe('asha@example.com')
    expect((await p2.db.query('select * from auth.sessions where user_id = $1', [asha])).rows).toEqual([])
    expect((await p2.db.query('select * from auth.sessions where user_id = $1', [ravi])).rows).toHaveLength(1)
    await act(ravi, 'block', 'Spam messages')
    expect((await p2.db.query('select * from auth.sessions where user_id = $1', [ravi])).rows).toEqual([])
    await act(ravi, 'unblock', 'Said sorry')
    await act(ravi, 'resend confirm', 'Lost the email')
    await p2.as(dk, (db) => db.query(`select admin_end_coach_link($1, 'Asked to stop')`, [asha]), true)
    await p2.as(dk, (db) => db.query(`select admin_set_role($1, 'coach', 'Signed up as a coach by mistake')`, [ravi]), true)
    const log = (await p2.db.query<{ action: string; target_id: string; admin_id: string }>('select action, target_id, admin_id from admin_log order by id')).rows
    expect(log.map((r) => r.action)).toEqual(['sign out', 'block', 'unblock', 'resend confirm', 'end coach link', 'change role'])
    expect(log.every((r) => r.admin_id === dk)).toBe(true)
    expect((await p2.db.query(`select status from coach_clients where client_id = $1`, [asha])).rows).toEqual([{ status: 'ended' }])
    expect((await p2.db.query(`select role from profiles where id = $1`, [ravi])).rows).toEqual([{ role: 'coach' }])
  })

  it('5. refuses unsafe actions and writes no row for them', async () => {
    const before = await rows()
    const act = (person: string, a: string, why = 'Asked') => p2.as(dk, (db) => db.query('select admin_account_action($1, $2, $3)', [person, a, why]), true)
    await refused(act(dk, 'delete'))
    await refused(act(dk, 'block'))
    await refused(act(asha, 'resend confirm')) // already confirmed
    await refused(act(asha, 'sign out', ' '))
    await refused(act(asha, 'drop table'))
    await refused(p2.as(dk, (db) => db.query(`select admin_end_coach_link($1, 'Again')`, [asha]), true))
    await p2.db.query(`update coach_clients set status = 'active' where coach_id = $1 and client_id = $2`, [kiran, asha])
    await refused(p2.as(dk, (db) => db.query(`select admin_set_role($1, 'user', 'Not a coach')`, [kiran]), true))
    expect(await rows()).toBe(before)
  })
})
