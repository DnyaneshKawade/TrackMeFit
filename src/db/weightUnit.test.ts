import { describe, expect, it } from 'vitest'
import { createTestDb } from './testDb'

describe('kg or lb for gym weights (T-101)', () => {
  it('5. the unit is kg at first, the person changes it to lb, and nothing else is taken', async () => {
    const t = await createTestDb()
    const me = await t.signUp('me@x.in')
    const unit = () => t.db.query<{ weight_unit: string }>('select weight_unit from profiles where id = $1', [me]).then((r) => r.rows[0].weight_unit)
    expect(await unit()).toBe('kg')
    await t.as(me, (db) => db.query(`update profiles set weight_unit = 'lb' where id = $1`, [me]))
    expect(await unit()).toBe('lb')
    await expect(t.as(me, (db) => db.query(`update profiles set weight_unit = 'stone' where id = $1`, [me]))).rejects.toThrow()
  })
})
