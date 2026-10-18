import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// View as a person (spec T-042a4): only an owner with the second step starts
// a view, and each view is logged first.

let t: TestDb
let owner: string
let helper: string
let asha: string
let coach: string
let unconfirmed: string

const start = (db: PGlite, person: string, why = 'Asha says her targets vanished') =>
  db.query<{ view_id: string; email: string }>('select * from admin_start_view($1, $2)', [person, why]).then((r) => r.rows[0])
const views = () => t.db.query<{ person_id: string; reason: string; ended_at: string | null }>('select person_id, reason, ended_at from view_sessions order by started_at').then((r) => r.rows)

beforeAll(async () => {
  t = await createTestDb()
  owner = await t.signUp('dk@example.com')
  helper = await t.signUp('meera@example.com')
  asha = await t.signUp('asha@example.com')
  coach = await t.signUp('coach@example.com', { role: 'coach' })
  unconfirmed = await t.signUp('new@example.com')
  await t.db.query(`update auth.users set email_confirmed_at = now() where id <> $1`, [unconfirmed])
  await t.db.query(`insert into user_roles (user_id, level) values ($1, 'owner'), ($2, 'content')`, [owner, helper])
}, 30_000)

describe('view as a person (T-042a4)', () => {
  it('1. an owner with the second step and a reason starts a view, logged first', async () => {
    const v = await t.as(owner, (db) => start(db, asha), true)
    expect(v.email).toBe('asha@example.com')
    const log = await t.db.query('select action, target_id, reason from admin_log order by id desc limit 1')
    expect(log.rows).toEqual([{ action: 'view as', target_id: asha, reason: 'Asha says her targets vanished' }])
    expect(await views()).toEqual([{ person_id: asha, reason: 'Asha says her targets vanished', ended_at: null }])
    // Owners read the views; the person can't.
    expect(await t.as(owner, (db) => db.query('select * from view_sessions').then((r) => r.rows.length), true)).toBe(1)
    expect(await t.as(asha, (db) => db.query('select * from view_sessions').then((r) => r.rows.length))).toBe(0)
  })

  it('2. everyone else is refused, and nobody views themselves, an admin or an unconfirmed account', async () => {
    const before = (await views()).length
    for (const [who, aal2] of [[asha, true], [coach, true], [helper, true], [owner, false]] as const)
      await expect(t.as(who, (db) => start(db, asha), aal2)).rejects.toThrow(/not allowed/)
    await expect(t.as(owner, (db) => start(db, owner), true)).rejects.toThrow(/not on yourself/)
    await expect(t.as(owner, (db) => start(db, helper), true)).rejects.toThrow(/admins cannot be viewed/)
    await expect(t.as(owner, (db) => start(db, unconfirmed), true)).rejects.toThrow(/email not confirmed/)
    await expect(t.as(owner, (db) => start(db, coach, ' '), true)).rejects.toThrow(/reason is needed/)
    expect((await views()).length).toBe(before)
    // Nobody writes views directly.
    await expect(t.as(owner, (db) => db.query(`insert into view_sessions (admin_id, person_id, reason) values ($1, $2, 'x')`, [owner, asha]), true)).rejects.toThrow(/permission denied/)
  })

  it('6. ending a view saves the end time; a new view ends the old one', async () => {
    const first = (await views()).length
    const v = await t.as(owner, (db) => start(db, coach, 'Coach can’t see a client'), true)
    const open = await t.db.query('select count(*)::int as n from view_sessions where ended_at is null')
    expect(open.rows).toEqual([{ n: 1 }])
    const idleSince = new Date(Date.now() - 31 * 60_000).toISOString()
    await t.as(owner, (db) => db.query('select admin_end_view($1, $2)', [v.view_id, idleSince]), true)
    const row = await t.db.query<{ ended_at: Date }>('select ended_at from view_sessions where id = $1', [v.view_id])
    expect(Math.abs(row.rows[0].ended_at.getTime() - new Date(idleSince).getTime())).toBeLessThan(1000)
    expect((await views()).length).toBe(first + 1)
    expect((await views()).every((r) => r.ended_at !== null)).toBe(true)
  })
})
