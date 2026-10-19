import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// Progress photos (T-022b): records and files are private to the person and
// their active coach, when shared with them (T-096).

let t: TestDb
let asha: string
let ravi: string
let coach: string

const addPhoto = async (db: PGlite, path: string, pose = 'front') => {
  await db.query(`insert into storage.objects (bucket_id, name) values ('progress-photos', $1)`, [path])
  await db.query(`insert into progress_photos (taken_on, pose, path) values ('2026-10-15', $1, $2)`, [pose, path])
}
const count = async (db: PGlite, table: string) => (await db.query<{ n: number }>(`select count(*)::int as n from ${table}`)).rows[0].n

beforeAll(async () => {
  t = await createTestDb()
  asha = await t.signUp('asha@example.com')
  ravi = await t.signUp('ravi@example.com')
  coach = await t.signUp('coach@example.com', { role: 'coach' })
  await t.as(coach, (db) => db.query(`insert into coach_clients (coach_id, client_id) values ($1, $2)`, [coach, asha]))
  await t.as(asha, (db) => db.query(`update coach_clients set status = 'active' where coach_id = $1`, [coach]))
  // Asha shares her photos with this coach (T-096).
  await t.as(asha, (db) => db.query(`select set_coach_shares(id, true, false) from coach_clients where coach_id = $1`, [coach]))
  await t.as(asha, (db) => addPhoto(db, `${asha}/one.jpg`))
})

describe('progress photos (T-022b)', () => {
  it('7. only the person can add or remove their photos, only they and their active coach see them, and others read no file without its record', async () => {
    // The bucket is private.
    expect((await t.db.query<{ public: boolean }>(`select public from storage.buckets where id = 'progress-photos'`)).rows[0].public).toBe(false)

    // Asha and her coach see the record and the file; Ravi sees neither.
    for (const who of [asha, coach]) {
      expect(await t.as(who, (db) => count(db, 'progress_photos'))).toBe(1)
      expect(await t.as(who, (db) => count(db, 'storage.objects'))).toBe(1)
    }
    expect(await t.as(ravi, (db) => count(db, 'progress_photos'))).toBe(0)
    expect(await t.as(ravi, (db) => count(db, 'storage.objects'))).toBe(0)

    // Nobody puts files or records in another person's folder, the coach included.
    for (const who of [ravi, coach]) {
      await expect(t.as(who, (db) => db.query(`insert into storage.objects (bucket_id, name) values ('progress-photos', $1)`, [`${asha}/x.jpg`]))).rejects.toThrow(/row-level security/)
      await expect(t.as(who, (db) => db.query(`insert into progress_photos (user_id, taken_on, pose, path) values ($1, '2026-10-15', 'side', $2)`, [asha, `${asha}/x.jpg`]))).rejects.toThrow(/row-level security/)
    }
    // A record can't point at someone else's file.
    await expect(t.as(ravi, (db) => db.query(`insert into progress_photos (taken_on, pose, path) values ('2026-10-15', 'side', $1)`, [`${asha}/one.jpg`]))).rejects.toThrow()

    // One photo per pose per day.
    await expect(
      t.as(asha, (db) => db.query(`insert into progress_photos (taken_on, pose, path) values ('2026-10-15', 'front', $1)`, [`${asha}/two.jpg`])),
    ).rejects.toThrow(/duplicate key/)

    // The coach can't remove anything.
    await t.as(coach, (db) => db.query(`delete from progress_photos`))
    await t.as(coach, (db) => db.query(`delete from storage.objects`))
    expect(await t.as(asha, (db) => count(db, 'progress_photos'))).toBe(1)

    // Once the record is gone, the coach can't read the file; Asha can still delete it.
    await t.as(asha, (db) => db.query(`delete from progress_photos`))
    expect(await t.as(coach, (db) => count(db, 'storage.objects'))).toBe(0)
    await t.as(asha, (db) => db.query(`delete from storage.objects where name = $1`, [`${asha}/one.jpg`]))
    expect(await count(t.db, 'storage.objects')).toBe(0)
  })
})
