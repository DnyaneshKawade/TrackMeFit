import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createTestDb, type TestDb } from './testDb'
import { buildCatalogue } from '../food/catalogue'
import { fromRow, splitBySource, toRow, type FoodRow } from '../food/foodRows'
import { createSearchIndex, searchFoods } from '../food/search'

// The real food list, loaded into Postgres (PGlite) and searched with the
// migration's search_foods, compared against the app's own search.
const catalogue = buildCatalogue(readFileSync('data/usda/sr_legacy_macros.csv', 'utf8'), readFileSync('data/off/india_products.csv', 'utf8'))
const index = createSearchIndex(catalogue)
let t: TestDb

const load = (table: string, rows: FoodRow[]) =>
  t.db.query(`insert into ${table} select * from jsonb_populate_recordset(null::${table}, $1::jsonb)`, [JSON.stringify(rows)])
const search = (q: string, lim = 10) =>
  t.as(null, async (db) => (await db.query<FoodRow>('select * from search_foods($1, $2)', [q, lim])).rows)

beforeAll(async () => {
  t = await createTestDb()
  const { foods, off } = splitBySource(catalogue)
  await load('foods', foods.map(toRow))
  await load('off_products', off.map(toRow))
}, 60_000)

describe('food search in the database (T-038)', () => {
  it('2. ranks like the app’s own search, Indian dishes and regional names first', async () => {
    for (const q of ['dal', 'rajma', 'dahi', 'poha', 'paneer', 'roti', 'chicken', 'milk', 'amul', 'egg', 'aloo gobi', 'chai', 'arhar']) {
      const app = searchFoods(index, q, 10).map((f) => f.id)
      expect(app.length, q).toBeGreaterThan(0)
      // Close spellings may follow the real matches; the real ones come first, in order.
      expect((await search(q)).map((r) => r.id).slice(0, app.length), q).toEqual(app)
    }
    // A regional name counts like the name, so our curd beats packaged "Dahi".
    expect((await search('dahi'))[0]).toMatchObject({ source: 'usda', name: expect.stringMatching(/curd/i) })
    expect((await search('rajma'))[0].source).toBe('trackMeFit')
  })

  it('3. finds the closest foods for a small typo, after any real matches', async () => {
    expect((await search('panner')).some((r) => /paneer/i.test(r.name))).toBe(true)
    expect((await search('chiken')).some((r) => /chicken/i.test(r.name))).toBe(true)
    expect(await search('x')).toEqual([])
  })

  it('6, 7. returns foods by id with portions, and Open Food Facts products from their own table', async () => {
    const dal = catalogue.find((f) => f.id === 'tmf:dish:dal-tadka')!
    const product = catalogue.find((f) => f.source === 'openFoodFacts')!
    const rows = await t.as(null, async (db) => (await db.query<FoodRow>('select * from foods_by_id($1)', [[dal.id, product.id, 'nope']])).rows)
    expect(rows.map(fromRow).sort((a, b) => a.id.localeCompare(b.id))).toEqual([dal, product].sort((a, b) => a.id.localeCompare(b.id)))
    const inOff = await t.db.query<{ n: number }>(`select count(*)::int as n from off_products where id = $1`, [product.id])
    const inFoods = await t.db.query<{ n: number }>(`select count(*)::int as n from foods where source = 'openFoodFacts'`)
    expect([inOff.rows[0].n, inFoods.rows[0].n]).toEqual([1, 0])
  })

  it('8. lets anyone read foods and no app user write them', async () => {
    const me = await t.signUp('me@x.in')
    expect((await search('dal', 1)).length).toBe(1)
    await expect(t.as(me, (db) => db.query(`insert into foods (id, name, source, state, kcal, protein_g, carb_g, fat_g, search_name, search_terms) values ('x', 'X', 'trackMeFit', 'raw', 1, 0, 0, 0, 'x', 'x')`))).rejects.toThrow(/permission denied|row-level security/)
    await expect(t.as(me, (db) => db.query(`update foods set kcal = 0`))).rejects.toThrow(/permission denied/)
    await expect(t.as(null, (db) => db.query(`delete from off_products`))).rejects.toThrow(/permission denied/)
  })
})
