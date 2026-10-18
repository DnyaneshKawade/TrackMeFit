import { beforeAll, describe, expect, it } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'
import { createTestDb, type TestDb } from './testDb'

// Coach approval (spec T-042a3): only an Approved coach works with clients,
// and one switch decides how new coaches start.

let t: TestDb
let owner: string
let working: string // a coach from before the switch
let asha: string

const status = async (id: string) =>
  (await t.db.query<{ coach_status: string }>('select coach_status from profiles where id = $1', [id])).rows[0].coach_status
const logRows = async () => (await t.db.query<{ n: number }>('select count(*)::int as n from admin_log')).rows[0].n
const newCode = (db: PGlite) => db.query<{ code: string }>('insert into coach_invites default values returning code').then((r) => r.rows[0].code)
const join = (db: PGlite, code: string) => db.query('select join_coach($1)', [code])
const asOwner = <T>(fn: (db: PGlite) => Promise<T>) => t.as(owner, fn, true)
const decide = (coach: string, decision: string, why: string) =>
  asOwner((db) => db.query('select admin_coach_decision($1, $2, $3)', [coach, decision, why]))
const setSwitch = (on: boolean) => asOwner((db) => db.query(`select admin_set_switch('coach approval', $1, 'Checking coaches now')`, [on]))
/** Signs a coach up with the switch on, so they start Waiting. */
const waitingCoach = async (email: string) => {
  await setSwitch(true)
  const id = await t.signUp(email, { role: 'coach', full_name: email.split('@')[0] })
  await setSwitch(false)
  return id
}

beforeAll(async () => {
  t = await createTestDb()
  owner = await t.signUp('dk@example.com', { full_name: 'DK' })
  await t.db.query(`insert into user_roles (user_id, level) values ($1, 'owner')`, [owner])
  working = await t.signUp('working@example.com', { role: 'coach', full_name: 'Coach K' })
  asha = await t.signUp('asha@example.com', { full_name: 'Asha' })
  await t.as(asha, (db) => db.query('insert into weigh_ins (weight_kg) values (64)'))
}, 30_000)

describe('coach approval (T-042a3)', () => {
  it('1. with the switch off a new coach is Approved; with it on a new coach is Waiting, by email, Google or an owner', async () => {
    expect(await status(working)).toBe('approved')
    await t.as(working, (db) => newCode(db))

    await setSwitch(true)
    const byEmail = await t.signUp('new@example.com', { role: 'coach' })
    expect(await status(byEmail)).toBe('waiting')
    const byGoogle = await t.signUp('google@example.com', {}, 'google')
    await t.as(byGoogle, (db) => db.query(`select choose_role('coach')`))
    expect(await status(byGoogle)).toBe('waiting')
    const moved = await t.signUp('moved@example.com')
    await asOwner((db) => db.query(`select admin_set_role($1, 'coach', 'Asked to coach')`, [moved]))
    expect(await status(moved)).toBe('waiting')
    await setSwitch(false)
  })

  it('2. coaches already working stay Approved when the switch turns on', async () => {
    await setSwitch(true)
    expect(await status(working)).toBe('approved')
    expect((await t.db.query(`select value from app_settings where key = 'coach approval'`)).rows).toEqual([{ value: true }])
    await setSwitch(false)
  })

  it('3. a coach who is not Approved can’t make codes, join with an old code, read or change client data, or chat; 9. their client sees the pause', async () => {
    const coach = await t.signUp('k2@example.com', { role: 'coach', full_name: 'Coach R' })
    const oldCode = await t.as(coach, newCode)
    const code = await t.as(coach, newCode)
    await t.as(asha, (db) => join(db, code))
    const link = (await t.db.query<{ id: string }>('select id from coach_clients where coach_id = $1', [coach])).rows[0].id
    await t.as(coach, (db) => db.query(`insert into chat_messages (link_id, body) values ($1, 'Hi')`, [link]))
    const seen = (db: PGlite) => db.query('select * from weigh_ins').then((r) => r.rows.length)
    expect(await t.as(coach, seen)).toBe(1)

    await decide(coach, 'pause', 'A complaint came in')
    expect(await status(coach)).toBe('paused')
    await expect(t.as(coach, newCode)).rejects.toThrow(/row-level security/)
    const ravi = await t.signUp('ravi@example.com')
    await expect(t.as(ravi, (db) => join(db, oldCode))).rejects.toThrow(/coach not approved/)
    expect(await t.as(coach, seen)).toBe(0)
    expect(await t.as(coach, (db) => db.query('select * from client_summaries(current_date)').then((r) => r.rows.length))).toBe(0)
    await expect(
      t.as(coach, (db) => db.query(`insert into diet_targets (user_id, kcal, protein_g, carb_g, fat_g, set_by) values ($1, 1800, 100, 200, 50, $2)`, [asha, coach])),
    ).rejects.toThrow(/row-level security/)
    await expect(t.as(coach, (db) => db.query(`insert into chat_messages (link_id, body) values ($1, 'Hi')`, [link]))).rejects.toThrow(/row-level security/)
    expect(await t.as(asha, (db) => db.query('select * from chat_messages').then((r) => r.rows.length))).toBe(0)
    // The client sees the coach is paused, and keeps their own data and the link.
    const coachRow = await t.as(asha, (db) => db.query('select coach_status from profiles where id = $1', [coach]))
    expect(coachRow.rows).toEqual([{ coach_status: 'paused' }])
    expect(await t.as(asha, seen)).toBe(1)
    expect((await t.db.query('select status from coach_clients where id = $1', [link])).rows).toEqual([{ status: 'active' }])

    // Ending the pause gives everything back.
    await decide(coach, 'approve', 'Complaint checked')
    expect(await t.as(coach, seen)).toBe(1)
  })

  it('4. nobody changes their own status, note or limit, and only the coach sees their details', async () => {
    const coach = await waitingCoach('w4@example.com')
    for (const sql of [
      `update profiles set coach_status = 'approved' where id = auth.uid()`,
      `update profiles set coach_status_note = 'ok' where id = auth.uid()`,
      `update profiles set coach_status_seen = false where id = auth.uid()`,
      `update profiles set client_limit = 400 where id = auth.uid()`,
    ])
      await expect(t.as(coach, (db) => db.query(sql))).rejects.toThrow(/cannot be changed/)
    expect(await status(coach)).toBe('waiting')

    await t.as(coach, (db) => db.query(`insert into coach_details (phone, city, years) values ('98200 00000', 'Pune', 4)`))
    // The answer only comes through coach_send_details.
    await expect(t.as(coach, (db) => db.query(`update coach_details set answer = 'x'`))).rejects.toThrow(/permission denied/)
    expect(await t.as(asha, (db) => db.query('select * from coach_details').then((r) => r.rows.length))).toBe(0)
    expect(await t.as(working, (db) => db.query('select * from coach_details').then((r) => r.rows.length))).toBe(0)
    // Only coaches keep details.
    await expect(t.as(asha, (db) => db.query(`insert into coach_details (city) values ('Pune')`))).rejects.toThrow(/row-level security/)
  })

  it('5. certificate photos: only the coach and owners read them; only the coach adds or removes', async () => {
    const coach = await waitingCoach('w5@example.com')
    const path = `${coach}/c1.jpg`
    await t.as(coach, async (db) => {
      await db.query(`insert into storage.objects (bucket_id, name) values ('coach-certificates', $1)`, [path])
      await db.query(`insert into coach_certificates (name, path) values ('ACE', $1)`, [path])
    })
    await expect(t.as(asha, (db) => db.query(`insert into storage.objects (bucket_id, name) values ('coach-certificates', $1)`, [`${coach}/x.jpg`]))).rejects.toThrow(/row-level security/)
    const files = (db: PGlite) => db.query(`select name from storage.objects where bucket_id = 'coach-certificates'`).then((r) => r.rows.length)
    expect(await t.as(asha, files)).toBe(0)
    expect(await t.as(owner, files)).toBe(0) // no second step
    expect(await t.as(owner, files, true)).toBe(1)
    await t.as(owner, (db) => db.query(`delete from storage.objects where name = $1`, [path]), true)
    expect(await t.as(coach, files)).toBe(1)
    await t.as(coach, (db) => db.query(`delete from storage.objects where name = $1`, [path]))
    expect(await t.as(coach, files)).toBe(0)
  })

  it('7. Needs more: the coach answers and goes back to Waiting; 8. Not approved waits 30 days', async () => {
    const coach = await waitingCoach('w7@example.com')
    await decide(coach, 'ask more', 'Please add a certificate photo')
    const row = (await t.db.query('select coach_status, coach_status_note, coach_status_seen from profiles where id = $1', [coach])).rows[0]
    expect(row).toEqual({ coach_status: 'needs more', coach_status_note: 'Please add a certificate photo', coach_status_seen: false })
    await t.as(coach, (db) => db.query('select coach_saw_status()'))
    await expect(t.as(coach, (db) => db.query(`select coach_send_details('')`))).rejects.toThrow(/answer is empty/)
    await t.as(coach, (db) => db.query(`select coach_send_details('Added my ACE photo')`))
    expect(await status(coach)).toBe('waiting')
    expect((await asOwner((db) => db.query<{ answer: string }>('select answer from admin_coach($1)', [coach]))).rows[0].answer).toBe('Added my ACE photo')

    await decide(coach, 'decline', 'No certificate yet')
    await expect(t.as(coach, (db) => db.query(`select coach_send_details('')`))).rejects.toThrow(/too soon/)
    await t.db.query(`update profiles set coach_status_at = now() - interval '31 days' where id = $1`, [coach])
    await t.as(coach, (db) => db.query(`select coach_send_details('')`))
    expect(await status(coach)).toBe('waiting')
  })

  it('11. owners decide with a reason and one log row each; wrong moves are refused', async () => {
    const coach = await waitingCoach('w11@example.com')
    const before = await logRows()
    await expect(decide(coach, 'approve', ' ')).rejects.toThrow(/reason is needed/)
    await expect(decide(coach, 'pause', 'x')).rejects.toThrow(/decision not valid/)
    await expect(t.as(owner, (db) => db.query(`select admin_coach_decision($1, 'approve', 'ok')`, [coach]))).rejects.toThrow(/not allowed/)
    await expect(t.as(working, (db) => db.query(`select admin_coach_decision($1, 'approve', 'ok')`, [coach]), true)).rejects.toThrow(/not allowed/)
    expect(await logRows()).toBe(before)

    await decide(coach, 'approve', 'Certificates look right')
    expect(await status(coach)).toBe('approved')
    await asOwner((db) => db.query(`select admin_set_client_limit($1, 50, 'Big gym')`, [coach]))
    await expect(asOwner((db) => db.query(`select admin_set_client_limit($1, 0, 'x')`, [coach]))).rejects.toThrow(/limit not valid/)
    expect((await t.db.query('select client_limit from profiles where id = $1', [coach])).rows).toEqual([{ client_limit: 50 }])
    const log = await t.db.query('select action, target_id, reason from admin_log order by id desc limit 2')
    expect(log.rows).toEqual([
      { action: 'set client limit', target_id: coach, reason: 'Big gym' },
      { action: 'coach approve', target_id: coach, reason: 'Certificates look right' },
    ])
  })

  it('10. owners list coaches by status, Waiting oldest first, with client counts, in pages', async () => {
    const a = await waitingCoach('qa@example.com')
    const b = await waitingCoach('qb@example.com')
    await t.db.query(`update profiles set coach_status_at = now() - interval '2 days' where id = $1`, [b])
    const page = (after: { status_at: string; user_id: string } | null, lim: number) =>
      asOwner((db) =>
        db.query<{ user_id: string; status_at: string; clients: number; has_details: boolean }>(
          `select * from admin_coaches('waiting', $1, $2, $3)`,
          [after?.status_at ?? null, after?.user_id ?? null, lim],
        ),
      ).then((r) => r.rows)
    const all = await page(null, 100)
    expect(all.findIndex((r) => r.user_id === b)).toBeLessThan(all.findIndex((r) => r.user_id === a))
    const first = await page(null, 1)
    const second = await page(first[0], 100)
    expect([...first, ...second].map((r) => r.user_id)).toEqual(all.map((r) => r.user_id))
    const approved = await asOwner((db) => db.query<{ user_id: string; clients: number }>(`select * from admin_coaches('approved')`)).then((r) => r.rows)
    expect(approved.find((r) => r.user_id === working)?.clients).toBe(0)
    await expect(t.as(asha, (db) => db.query(`select * from admin_coaches('waiting')`), true)).rejects.toThrow(/not allowed/)
  })

  it('12. the switch needs an owner and a reason, and is logged', async () => {
    await expect(t.as(working, (db) => db.query(`select admin_set_switch('coach approval', true, 'x')`), true)).rejects.toThrow(/not allowed/)
    await expect(asOwner((db) => db.query(`select admin_set_switch('coach approval', true, '')`))).rejects.toThrow(/reason is needed/)
    await expect(t.as(working, (db) => db.query(`update app_settings set value = 'true'`))).rejects.toThrow(/permission denied/)
    await setSwitch(true)
    const row = (await t.db.query(`select action, details from admin_log order by id desc limit 1`)).rows[0]
    expect(row).toEqual({ action: 'set switch', details: { switch: 'coach approval', on: true } })
    await setSwitch(false)
  })
})
