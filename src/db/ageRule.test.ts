import { beforeAll, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from './testDb'

// One age rule (spec T-086): under 13 can't sign up, 13 to 17 need a
// parent's yes from an adult account, coaches are 18 or older, and people
// under 18 can't have a coach.

let t: TestDb
let teen: string
let mum: string
let kid: string
let coach: string

const yearsAgo = (y: number, days = 0) => `(current_date - interval '${y} years' + interval '${days} days')::date`
const setBirth = (who: string, sql: string) => t.as(who, (db) => db.query(`update profiles set birth_date = ${sql} where id = $1`, [who]))
const addFood = (who: string) =>
  t.as(who, (db) => db.query(`insert into food_logs (meal, food_id, food_name, grams, kcal, protein_g, carb_g, fat_g) values ('lunch', 'x', 'Dal', 100, 120, 7, 18, 2)`))
const codeFor = (who: string) => t.as(who, (db) => db.query<{ code: string }>('select * from parent_code()')).then((r) => r.rows[0].code)

beforeAll(async () => {
  t = await createTestDb()
  teen = await t.signUp('teen@example.com', { full_name: 'Riya' })
  mum = await t.signUp('mum@example.com', { full_name: 'Meena' })
  kid = await t.signUp('kid@example.com')
  coach = await t.signUp('coach@example.com', { role: 'coach', full_name: 'Coach K' })
  await setBirth(mum, yearsAgo(40))
}, 30_000)

describe('one age rule (T-086)', () => {
  it('1. under 13 is refused; 13 is allowed', async () => {
    await expect(setBirth(kid, yearsAgo(13, 1))).rejects.toThrow(/under 13/)
    await setBirth(kid, yearsAgo(13))
  })

  it('2. a teen adds nothing until a parent says yes with their own adult account', async () => {
    await setBirth(teen, yearsAgo(17))
    await expect(addFood(teen)).rejects.toThrow(/row-level security/)
    // The teen can't say yes for themselves.
    await expect(t.as(teen, (db) => db.query('update profiles set parent_ok_at = now(), parent_id = $1 where id = $2', [mum, teen]))).rejects.toThrow(/only a parent/)

    const code = await codeFor(teen)
    expect(code).toMatch(/^[A-F0-9]{8}$/)
    // Another teen can't be the parent.
    await expect(t.as(kid, (db) => db.query('select parent_say_yes($1)', [code]))).rejects.toThrow(/18 or older/)
    await expect(t.as(mum, (db) => db.query('select parent_say_yes($1)', ['WRONG123']))).rejects.toThrow(/code not found/)
    const look = await t.as(mum, (db) => db.query<{ name: string }>('select * from child_for_code($1)', [code.toLowerCase().slice(0, 4) + '-' + code.slice(4)]))
    expect(look.rows[0].name).toBe('Riya')
    const yes = await t.as(mum, (db) => db.query<{ parent_say_yes: string }>('select parent_say_yes($1)', [code]))
    expect(yes.rows[0].parent_say_yes).toBe('Riya')

    await addFood(teen)
    const kids = await t.as(mum, (db) => db.query<{ name: string }>('select * from my_children()'))
    expect(kids.rows.map((r) => r.name)).toEqual(['Riya'])
    const parent = await t.as(teen, (db) => db.query<{ name: string }>('select * from my_parent()'))
    expect(parent.rows.map((r) => r.name)).toEqual(['Meena'])
    // The code is used up.
    await expect(t.as(mum, (db) => db.query('select parent_say_yes($1)', [code]))).rejects.toThrow(/code not found/)
    await expect(codeFor(teen)).rejects.toThrow(/no parent needed/)
  })

  it('3. a parent takes back their yes, and the teen waits for a parent again', async () => {
    await expect(t.as(kid, (db) => db.query('select parent_take_back($1)', [teen]))).rejects.toThrow(/not your child/)
    await t.as(mum, (db) => db.query('select parent_take_back($1)', [teen]))
    await expect(addFood(teen)).rejects.toThrow(/row-level security/)
    expect((await t.as(teen, (db) => db.query('select * from my_parent()'))).rows).toEqual([])
    // Adults are not held back.
    await addFood(mum)
  })

  it('4. coaches are 18 or older, and people under 18 can’t have a coach', async () => {
    await expect(setBirth(coach, yearsAgo(17))).rejects.toThrow(/coaches must be 18/)
    await setBirth(coach, yearsAgo(30))
    await expect(t.db.query(`insert into coach_clients (coach_id, client_id, status) values ($1, $2, 'active')`, [coach, teen])).rejects.toThrow(/under 18 cannot have a coach/)
    await t.db.query(`insert into coach_clients (coach_id, client_id, status) values ($1, $2, 'active')`, [coach, mum])
  })
})
