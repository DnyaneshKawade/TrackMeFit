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
