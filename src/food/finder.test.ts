import { describe, expect, it, vi } from 'vitest'
import { localFinder, serverFinder, withMine } from './finder'
import { toRow } from './foodRows'
import { createSearchIndex } from './search'
import type { Food } from './types'

const food = (id: string, name: string, source: Food['source'] = 'trackMeFit'): Food => ({
  id,
  name,
  state: 'cooked',
  per100g: { kcal: 100, proteinG: 5, carbG: 10, fatG: 3 },
  portions: [{ label: '1 bowl', grams: 150 }],
  source,
})

const dal = food('tmf:dish:dal', 'Dal')
const roti = food('tmf:dish:roti', 'Roti')
const bundled = () => Promise.resolve(localFinder(createSearchIndex([dal, roti])))

// A small stand-in for the Supabase client: a foods count and two RPCs.
function fakeSb(opts: { count?: number; countError?: boolean; rpc?: (fn: string, args: Record<string, unknown>) => unknown }) {
  const rpc = vi.fn(async (fn: string, args: Record<string, unknown>) => {
    try {
      return { data: opts.rpc?.(fn, args) ?? [], error: null }
    } catch (e) {
      return { data: null, error: e }
    }
  })
  const sb = {
    from: () => ({
      select: () => Promise.resolve(opts.countError ? { count: null, error: new Error('offline') } : { count: opts.count ?? 0, error: null }),
    }),
    rpc,
  }
  return { sb: sb as never, rpc }
}

describe('server food search (T-038)', () => {
  it('1. searches in the database when its foods are loaded, without the bundled list', async () => {
    const fallback = vi.fn(bundled)
    const { sb, rpc } = fakeSb({ count: 4000, rpc: (fn) => (fn === 'search_foods' ? [toRow(dal)] : []) })
    const found = await serverFinder(sb, fallback).search('dal', 10)
    expect(found).toEqual([dal])
    expect(rpc).toHaveBeenCalledWith('search_foods', { q: 'dal', lim: 10 })
    expect(fallback).not.toHaveBeenCalled()
  })

  it('5. falls back to the bundled list when the foods are not loaded yet', async () => {
    const { sb, rpc } = fakeSb({ count: 0 })
    expect((await serverFinder(sb, bundled).search('roti')).map((f) => f.id)).toEqual(['tmf:dish:roti'])
    expect(rpc).not.toHaveBeenCalled()
  })

  it('5. falls back when the database cannot be reached or the search fails', async () => {
    const offline = fakeSb({ countError: true })
    expect((await serverFinder(offline.sb, bundled).search('dal')).map((f) => f.id)).toEqual(['tmf:dish:dal'])
    const failing = fakeSb({ count: 10, rpc: () => { throw new Error('500') } })
    expect((await serverFinder(failing.sb, bundled).search('dal')).map((f) => f.id)).toEqual(['tmf:dish:dal'])
  })

  it('6. looks up recent foods by id, with their portions', async () => {
    const { sb, rpc } = fakeSb({ count: 10, rpc: (fn, args) => (fn === 'foods_by_id' ? (args.ids as string[]).filter((id) => id === roti.id).map(() => toRow(roti)) : []) })
    const got = await serverFinder(sb, bundled).byIds(['tmf:dish:roti', 'gone'])
    expect([...got.keys()]).toEqual(['tmf:dish:roti'])
    expect(got.get('tmf:dish:roti')!.portions).toEqual(roti.portions)
    expect(rpc).toHaveBeenCalledWith('foods_by_id', { ids: ['tmf:dish:roti', 'gone'] })
    expect((await localFinder(createSearchIndex([dal])).byIds(['tmf:dish:dal', 'gone'])).size).toBe(1)
  })

  it('4. shows the person’s own foods first and never asks the server for them', async () => {
    const mine = food('custom:1:Dal', 'My dal', 'user')
    const { sb, rpc } = fakeSb({ count: 10, rpc: (fn) => (fn === 'search_foods' ? [toRow(dal)] : [toRow(dal)]) })
    const finder = withMine(serverFinder(sb, bundled), [mine])
    expect((await finder.search('dal')).map((f) => f.id)).toEqual(['custom:1:Dal', 'tmf:dish:dal'])
    const got = await finder.byIds(['custom:1:Dal', 'tmf:dish:dal'])
    expect([...got.keys()].sort()).toEqual(['custom:1:Dal', 'tmf:dish:dal'])
    expect(rpc).toHaveBeenLastCalledWith('foods_by_id', { ids: ['tmf:dish:dal'] })
  })
})
