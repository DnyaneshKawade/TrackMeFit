import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// Choose what your coach sees (spec T-096): photos and health answers stay
// private until the client turns them on.

let t: TestDb
let asha: string
let coach: string
let link: string

const photos = (db: PGlite) => db.query(`select id from progress_photos`).then((r) => r.rows.length)
const files = (db: PGlite) => db.query(`select name from storage.objects where bucket_id = 'progress-photos'`).then((r) => r.rows.length)
const health = (db: PGlite) => db.query(`select other_health from health_answers`).then((r) => r.rows.length)
const share = (who: string, p: boolean, h: boolean) => t.as(who, (db) => db.query(`select set_coach_shares($1, $2, $3)`, [link, p, h]))

beforeAll(async () => {
  t = await createTestDb()
  asha = await t.signUp('asha@example.com', { full_name: 'Asha' })
  coach = await t.signUp('coach@example.com', { role: 'coach' })
  await t.db.query(`update profiles set birth_date = '1990-01-01' where id = any($1)`, [[asha, coach]])
  await t.db.query(`update profiles set coach_status = 'approved' where id = $1`, [coach])
  link = (await t.db.query<{ id: string }>(`insert into coach_clients (coach_id, client_id, status) values ($1, $2, 'active') returning id`, [coach, asha])).rows[0].id
  await t.as(asha, async (db) => {
    await db.query(`insert into health_answers (user_id, medical, other_health) values ($1, '{"diabetes": true}', 'asthma')`, [asha])
    await db.query(`insert into progress_photos (taken_on, pose, path) values ('2026-10-19', 'front', $1)`, [`${asha}/a.jpg`])
    await db.query(`insert into storage.objects (bucket_id, name) values ('progress-photos', $1)`, [`${asha}/a.jpg`])
  })
}, 30_000)

describe('choose what your coach sees (T-096)', () => {
  it('1. the coach sees no photos or health answers until the client turns each on', async () => {
    expect(await t.as(asha, (db) => Promise.all([photos(db), files(db), health(db)]))).toEqual([1, 1, 1])
    expect(await t.as(coach, (db) => Promise.all([photos(db), files(db), health(db)]))).toEqual([0, 0, 0])
    await share(asha, true, false)
    expect(await t.as(coach, (db) => Promise.all([photos(db), files(db), health(db)]))).toEqual([1, 1, 0])
    await share(asha, false, true)
    expect(await t.as(coach, (db) => Promise.all([photos(db), files(db), health(db)]))).toEqual([0, 0, 1])
  })

  it('2. only the client changes the switches', async () => {
    await expect(share(coach, true, true)).rejects.toThrow(/not your coach/)
    await expect(t.as(coach, (db) => db.query(`update coach_clients set share_photos = true where id = $1`, [link]))).rejects.toThrow(/only the client/)
    await expect(t.as(asha, (db) => db.query(`update coach_clients set share_photos = true where id = $1`, [link]))).rejects.toThrow(/only the client/)
  })

  it('3. an ended link turns both off, so joining again shares nothing extra', async () => {
    await share(asha, true, true)
    await t.as(asha, (db) => db.query(`update coach_clients set status = 'ended' where id = $1`, [link]))
    const row = await t.db.query<{ share_photos: boolean; share_health: boolean }>(`select share_photos, share_health from coach_clients where id = $1`, [link])
    expect(row.rows[0]).toEqual({ share_photos: false, share_health: false })
    await expect(share(asha, true, true)).rejects.toThrow(/not your coach/)
  })
})
