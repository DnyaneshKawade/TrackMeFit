import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// Withdraw a request (spec T-124): only your own, and only while it is open.

let t: TestDb
let asha: string
let ravi: string

beforeAll(async () => {
  t = await createTestDb()
  asha = await t.signUp('asha@example.com')
  ravi = await t.signUp('ravi@example.com')
}, 30_000)

describe('withdraw a request (T-124)', () => {
  it('deletes your own open request, never an answered one or someone else’s', async () => {
    const ids = await t.as(asha, async (db) => {
      const open = await db.query<{ id: string }>(`insert into data_requests (note) values ('Fix my weight') returning id`)
      const done = await db.query<{ id: string }>(`insert into data_requests (note) values ('Old one') returning id`)
      return { open: open.rows[0].id, done: done.rows[0].id }
    })
    await t.db.query(`update data_requests set status = 'closed', answer = 'Done' where id = $1`, [ids.done])
    await t.as(ravi, async (db) => {
      await db.query('delete from data_requests where id = $1', [ids.open])
    })
    await t.as(asha, async (db) => {
      await db.query('delete from data_requests where id = $1', [ids.done])
      expect((await db.query('select id from data_requests')).rows).toHaveLength(2)
      await db.query('delete from data_requests where id = $1', [ids.open])
      expect((await db.query<{ id: string }>('select id from data_requests')).rows.map((r) => r.id)).toEqual([ids.done])
    })
  })
})
