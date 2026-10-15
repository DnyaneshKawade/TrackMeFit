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

describe('coach edits a plan (T-026d)', () => {
  it('6. only the person and their active coach change a plan, and the plan records who changed it last', async () => {
    const t3 = await createTestDb()
    const neha = await t3.signUp('neha@example.com', { full_name: 'Neha' })
    const k = await t3.signUp('k@example.com', { role: 'coach', full_name: 'Coach K' })
    const other = await t3.signUp('other@example.com', { role: 'coach', full_name: 'Coach M' })
    const stamp = () =>
      t3.as(neha, (db) => db.query<{ created_by: string; updated_by: string }>('select created_by, updated_by from workout_plans').then((r) => r.rows[0]))

    // Nobody can record someone else as the maker.
    const id = await t3.as(neha, (db) =>
      db.query<{ id: string }>(`insert into workout_plans (user_id, name, created_by, updated_by) values ($1, 'PPL', $2, $2) returning id`, [neha, k]),
    ).then((r) => r.rows[0].id)
    expect(await stamp()).toEqual({ created_by: neha, updated_by: neha })

    // Before the link, the coach can't change it.
    await t3.as(k, (db) => db.query(`update workout_plans set name = 'Upper Lower' where id = $1`, [id]))
    expect(await t3.as(neha, (db) => db.query<{ name: string }>('select name from workout_plans').then((r) => r.rows[0].name))).toBe('PPL')

    const code = await t3.as(k, newCode)
    await t3.as(neha, (db) => join(db, code))

    // The coach saves it; the record shows the coach, and the maker stays.
    await t3.as(k, (db) => db.query(`update workout_plans set name = 'Upper Lower', created_by = $2 where id = $1`, [id, k]))
    expect(await stamp()).toEqual({ created_by: neha, updated_by: k })

    // Starting a new block is not a change to the plan.
    await t3.as(neha, (db) => db.query(`update workout_plans set block_started_on = current_date where id = $1`, [id]))
    expect(await stamp()).toEqual({ created_by: neha, updated_by: k })

    // A coach makes a new plan for the client.
    await t3.as(k, (db) => db.query(`insert into workout_plans (user_id, name) values ($1, 'Full body')`, [neha]))
    const made = await t3.as(neha, (db) => db.query<{ created_by: string; updated_by: string }>(`select created_by, updated_by from workout_plans where name = 'Full body'`).then((r) => r.rows[0]))
    expect(made).toEqual({ created_by: k, updated_by: k })

    // Another coach can't touch it.
    await t3.as(other, (db) => db.query(`update workout_plans set name = 'Mine' where id = $1`, [id]))
    await expect(t3.as(other, (db) => db.query(`insert into workout_plans (user_id, name) values ($1, 'Mine')`, [neha]))).rejects.toThrow(/row-level security/)
    expect(await t3.as(neha, (db) => db.query<{ n: number }>(`select count(*)::int as n from workout_plans where name = 'Mine'`).then((r) => r.rows[0].n))).toBe(0)
  })
})

describe('weekly check-ins (T-026e)', () => {
  it('8. the person writes answers once a week, only their active coach replies, and nobody else reads them', async () => {
    const t4 = await createTestDb()
    const neha = await t4.signUp('neha@example.com', { full_name: 'Neha' })
    const k = await t4.signUp('k@example.com', { role: 'coach', full_name: 'Coach K' })
    const other = await t4.signUp('other@example.com', { role: 'coach', full_name: 'Coach M' })
    const code = await t4.as(k, newCode)
    await t4.as(neha, (db) => join(db, code))
    const add = (week: string) =>
      t4.as(neha, (db) =>
        db.query<{ id: string }>(`insert into check_ins (week_start, energy, sleep, mood, diet, training, note) values ($1, 4, 3, 4, 2, 5, 'Busy week') returning id`, [week]),
      ).then((r) => r.rows[0].id)
    const id = await add('2026-10-12')
    // One per week, and only for a Monday.
    await expect(add('2026-10-12')).rejects.toThrow(/duplicate|unique/)
    await expect(add('2026-10-13')).rejects.toThrow(/check/)
    // Nobody writes a check-in for someone else.
    await expect(t4.as(k, (db) => db.query(`insert into check_ins (user_id, week_start, energy, sleep, mood, diet, training) values ($1, '2026-10-05', 1, 1, 1, 1, 1)`, [neha]))).rejects.toThrow()
    // The person can't write the reply themselves.
    await expect(t4.as(neha, (db) => db.query(`update check_ins set coach_reply = 'Great job' where id = $1`, [id]))).rejects.toThrow(/permission denied/)

    const reply = (as: string, text: string) => t4.as(as, (db) => db.query('select reply_check_in($1, $2)', [id, text]))
    await expect(reply(other, 'Hi')).rejects.toThrow(/not your client/)
    await expect(reply(neha, 'Hi')).rejects.toThrow(/not your client/)
    await expect(reply(k, '  ')).rejects.toThrow(/reply is empty/)
    await reply(k, ' Eat more protein at breakfast. ')
    const row = await t4.as(neha, (db) => db.query<{ coach_reply: string; replied_by: string }>('select coach_reply, replied_by from check_ins').then((r) => r.rows[0]))
    expect(row).toEqual({ coach_reply: 'Eat more protein at breakfast.', replied_by: k })

    // After the reply, the answers stay as they were.
    await t4.as(neha, (db) => db.query(`update check_ins set note = 'Changed' where id = $1`, [id]))
    expect(await t4.as(neha, (db) => db.query<{ note: string }>('select note from check_ins').then((r) => r.rows[0].note))).toBe('Busy week')
    // Another coach sees nothing.
    expect(await t4.as(other, (db) => db.query('select * from check_ins').then((r) => r.rows.length))).toBe(0)
  })
})

describe('chat (T-026f)', () => {
  it('1. only the two sides of an active link read and send, nobody changes a message, and the chat closes when the link ends', async () => {
    const t5 = await createTestDb()
    const neha = await t5.signUp('neha@example.com', { full_name: 'Neha' })
    const k = await t5.signUp('k@example.com', { role: 'coach', full_name: 'Coach K' })
    const other = await t5.signUp('other@example.com', { role: 'coach', full_name: 'Coach M' })
    const code = await t5.as(k, newCode)
    await t5.as(neha, (db) => join(db, code))
    const link = await t5.as(neha, (db) => db.query<{ id: string }>('select id from coach_clients').then((r) => r.rows[0].id))
    const send = (as: string, body: string, sender?: string) =>
      t5.as(as, (db) =>
        sender
          ? db.query('insert into chat_messages (link_id, sender_id, body) values ($1, $2, $3)', [link, sender, body])
          : db.query('insert into chat_messages (link_id, body) values ($1, $2)', [link, body]),
      )
    const read = (as: string) => t5.as(as, (db) => db.query<{ body: string; read_at: string | null }>('select body, read_at from chat_messages order by created_at').then((r) => r.rows))

    await send(neha, 'Can I swap rice for roti?')
    await send(k, 'Yes, two roti.')
    await expect(send(neha, '   ')).rejects.toThrow(/check/)
    // Nobody sends as someone else, and other coaches can't write or read.
    await expect(send(neha, 'Fake', k)).rejects.toThrow(/permission denied/)
    await expect(send(other, 'Hello')).rejects.toThrow(/row-level security/)
    expect(await read(other)).toEqual([])
    expect((await read(neha)).map((m) => m.body)).toEqual(['Can I swap rice for roti?', 'Yes, two roti.'])

    // Nobody changes or deletes a message, or marks it read directly.
    await expect(t5.as(neha, (db) => db.query(`update chat_messages set body = 'Changed'`))).rejects.toThrow(/permission denied/)
    await expect(t5.as(k, (db) => db.query(`delete from chat_messages`))).rejects.toThrow(/permission denied/)

    // Opening the chat marks only the other side's messages as read.
    await t5.as(k, (db) => db.query('select mark_chat_read($1)', [link]))
    const rows = await read(neha)
    expect(rows[0].read_at).not.toBeNull()
    expect(rows[1].read_at).toBeNull()
    await expect(t5.as(other, (db) => db.query('select mark_chat_read($1)', [link]))).rejects.toThrow(/not your chat/)

    // After the link ends, neither side reads or sends.
    await t5.as(neha, (db) => db.query(`update coach_clients set status = 'ended'`))
    expect(await read(neha)).toEqual([])
    expect(await read(k)).toEqual([])
    await expect(send(k, 'Still there?')).rejects.toThrow(/row-level security/)
  })
})

describe('program templates (T-026g)', () => {
  it('1. only coaches keep templates, and the coach copies one into a client’s plans', async () => {
    const t6 = await createTestDb()
    const neha = await t6.signUp('neha@example.com', { full_name: 'Neha' })
    const k = await t6.signUp('k@example.com', { role: 'coach', full_name: 'Coach K' })
    const code = await t6.as(k, newCode)
    await t6.as(neha, (db) => join(db, code))

    await expect(t6.as(neha, (db) => db.query(`insert into workout_plans (user_id, name, is_template) values ($1, 'Mine', true)`, [neha]))).rejects.toThrow(/only coaches keep templates/)
    // A coach can't turn a client's plan into a template either.
    await expect(t6.as(k, (db) => db.query(`insert into workout_plans (user_id, name, is_template) values ($1, 'PPL', true)`, [neha]))).rejects.toThrow(/only coaches keep templates/)
    await t6.as(k, (db) => db.query(`insert into workout_plans (user_id, name, is_template) values ($1, 'PPL', true)`, [k]))
    // The copy is an ordinary plan of the client, started two weeks back.
    await t6.as(k, (db) => db.query(`insert into workout_plans (user_id, name, block_started_on) values ($1, 'PPL', '2026-10-01')`, [neha]))

    const kinds = (as: string) =>
      t6.as(as, (db) => db.query<{ user_id: string; is_template: boolean }>('select user_id, is_template from workout_plans order by is_template').then((r) => r.rows))
    expect(await kinds(neha)).toEqual([{ user_id: neha, is_template: false }])
    expect(await kinds(k)).toEqual([
      { user_id: neha, is_template: false },
      { user_id: k, is_template: true },
    ])
  })
})
