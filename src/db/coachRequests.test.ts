import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// "I want to coach" (spec T-103): a person asks, an owner makes them a coach.

let t: TestDb
let owner: string
let asha: string
let teen: string
let coach: string
let ravi: string

const ask = (who: string, note = 'I train friends at my gym') =>
  t.as(who, (db) => db.query(`insert into data_requests (note, kind) values ($1, 'coach')`, [note]))
const asOwner = <T>(sql: string, params: unknown[] = []) => t.as(owner, (db) => db.query<T>(sql, params), true)

beforeAll(async () => {
  t = await createTestDb()
  owner = await t.signUp('dk@example.com')
  asha = await t.signUp('asha@example.com', { full_name: 'Asha' })
  ravi = await t.signUp('ravi@example.com', { full_name: 'Ravi' })
  teen = await t.signUp('teen@example.com')
  coach = await t.signUp('coach@example.com', { role: 'coach' })
  await t.db.query(`insert into user_roles (user_id, level) values ($1, 'owner')`, [owner])
  await t.db.query(`update profiles set birth_date = '1990-01-01' where id = any($1)`, [[asha, ravi, coach]])
  await t.db.query(`update profiles set birth_date = current_date - interval '16 years' where id = $1`, [teen])
}, 30_000)

describe('"I want to coach" (T-103)', () => {
  it('1. an adult who isn’t a coach asks once; teens and coaches can’t ask', async () => {
    await ask(asha)
    await expect(ask(asha)).rejects.toThrow(/duplicate key|unique/)
    await expect(ask(teen)).rejects.toThrow(/row-level security/)
    await expect(ask(coach)).rejects.toThrow(/row-level security/)
    // A change request still works for everyone.
    await t.as(teen, (db) => db.query(`insert into data_requests (note) values ('Fix my name')`))
  })

  it('2. the owner sees it as a coach request and makes them a coach; the answer is saved and logged', async () => {
    const open = await asOwner<{ id: string; kind: string; email: string }>(`select * from admin_requests('open')`)
    const mine = open.rows.find((r) => r.email === 'asha@example.com')!
    expect(mine.kind).toBe('coach')
    await expect(t.as(asha, (db) => db.query('select admin_make_coach($1, $2)', [mine.id, 'ok']), true)).rejects.toThrow(/not allowed/)
    await asOwner('select admin_make_coach($1, $2)', [mine.id, 'Welcome. Fill in your coach details.'])
    const p = await t.db.query<{ role: string }>('select role from profiles where id = $1', [asha])
    expect(p.rows[0].role).toBe('coach')
    const r = await t.as(asha, (db) => db.query<{ status: string; answer: string }>(`select status, answer from data_requests where kind = 'coach'`))
    expect(r.rows).toEqual([{ status: 'closed', answer: 'Welcome. Fill in your coach details.' }])
    const log = await t.db.query<{ action: string }>('select action from admin_log where target_id = $1 order by id', [asha])
    expect(log.rows.map((x) => x.action)).toEqual(['change role', 'close request'])
    // A change request can't be turned into a coach.
    const change = open.rows.find((r) => r.kind === 'change')!
    await expect(asOwner('select admin_make_coach($1, $2)', [change.id, 'x'])).rejects.toThrow(/request not open/)
  })

  it('3. someone with a coach ends that link before becoming one', async () => {
    await t.db.query(`insert into coach_clients (coach_id, client_id, status) values ($1, $2, 'active')`, [coach, ravi])
    await ask(ravi)
    const open = await asOwner<{ id: string; email: string }>(`select * from admin_requests('open')`)
    const id = open.rows.find((r) => r.email === 'ravi@example.com')!.id
    await expect(asOwner('select admin_make_coach($1, $2)', [id, 'ok'])).rejects.toThrow(/they have a coach/)
  })
})
