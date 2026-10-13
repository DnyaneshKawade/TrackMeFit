import { describe, expect, it } from 'vitest'
import { memoryLogStore } from './memoryStore'
import { CACHED_DAYS, offlineLogStore, type KeyValue } from './offlineStore'
import type { LogEntry, LogStore, NewLogEntry } from './types'

const DAY = '2026-10-13'
const entry = (name: string, loggedOn = DAY): NewLogEntry => ({
  loggedOn, meal: 'lunch', foodId: `tmf:dish:${name}`, foodName: name, grams: 100, kcal: 100, proteinG: 5, carbG: 10, fatG: 3,
})

function mapStorage(): KeyValue & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return { data, get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v), remove: (k) => void data.delete(k) }
}

/** A server that can go offline, refuse, or save but lose its answer. */
function flakyServer() {
  const inner = memoryLogStore()
  const state = { online: true, refuse: false, loseAnswer: false, adds: 0 }
  const offline = () => Promise.reject(new TypeError('Failed to fetch'))
  const server: LogStore = {
    listDay: (d) => (state.online ? inner.listDay(d) : offline()),
    recent: () => (state.online ? inner.recent() : offline()),
    listRange: (from, to) => (state.online ? inner.listRange!(from, to) : offline()),
    remove: (id) => (state.online ? inner.remove(id) : offline()),
    async add(e, id) {
      if (!state.online) return offline()
      if (state.refuse) throw Object.assign(new Error('check'), { code: '23514' })
      state.adds++
      const saved = await inner.add(e, id)
      if (state.loseAnswer) {
        state.loseAnswer = false
        throw new TypeError('Network connection was lost')
      }
      return saved
    },
  }
  return { server, inner, state }
}

let n = 0
const setup = (storage = mapStorage(), accountId = 'me') => {
  const f = flakyServer()
  const store = offlineLogStore(f.server, { storage, accountId, newId: () => `id-${++n}` })
  return { ...f, store, storage }
}
const names = (list: LogEntry[]) => list.map((e) => e.foodName)

describe('offline food logging (T-027)', () => {
  it('1. adds offline show at once, marked as waiting', async () => {
    const { store, state } = setup()
    await store.listDay(DAY)
    state.online = false
    const saved = await store.add(entry('dal'))
    expect(store.sync.pendingIds()).toEqual(new Set([saved.id]))
    expect(names(await store.listDay(DAY))).toEqual(['dal'])
  })

  it('2. waiting entries are sent in order when the connection returns, and the marks go away', async () => {
    const { store, state, inner } = setup()
    state.online = false
    await store.add(entry('poha'))
    await store.add(entry('chai'))
    let changes = 0
    store.sync.subscribe(() => changes++)
    state.online = true
    await store.sync.run()
    expect(names(await inner.listDay(DAY))).toEqual(['poha', 'chai'])
    expect(store.sync.pendingIds().size).toBe(0)
    expect(changes).toBeGreaterThan(0)
  })

  it('2. waiting work survives closing the app', async () => {
    const storage = mapStorage()
    const first = setup(storage)
    first.state.online = false
    await first.store.add(entry('idli'))
    const again = offlineLogStore(first.server, { storage, accountId: 'me' })
    expect(again.sync.pendingIds().size).toBe(1)
    first.state.online = true
    await again.sync.run()
    expect(names(await first.inner.listDay(DAY))).toEqual(['idli'])
  })

  it('3. an entry whose answer was lost is saved once when sent again', async () => {
    const { store, state, inner } = setup()
    state.loseAnswer = true
    await store.add(entry('rajma'))
    expect(store.sync.pendingIds().size).toBe(1)
    await store.sync.run()
    expect(names(await inner.listDay(DAY))).toEqual(['rajma'])
    expect(state.adds).toBe(2)
  })

  it('4. removing a waiting entry drops it; removing a synced one waits and is sent later', async () => {
    const { store, state, inner } = setup()
    const synced = await store.add(entry('roti'))
    await store.listDay(DAY)
    state.online = false
    const waiting = await store.add(entry('sabzi'))
    await store.remove(waiting.id)
    await store.remove(synced.id)
    expect(store.sync.pendingIds().size).toBe(0)
    expect(names(await store.listDay(DAY))).toEqual([])
    expect(names(await inner.listDay(DAY))).toEqual(['roti'])
    state.online = true
    await store.sync.run()
    expect(names(await inner.listDay(DAY))).toEqual([])
  })

  it('4. an entry removed while it is being sent is removed on the server too', async () => {
    const { store, state, inner, server } = setup()
    state.online = false
    const ladoo = await store.add(entry('ladoo'))
    state.online = true
    let release!: () => void
    const gate = new Promise<void>((r) => (release = r))
    const add = server.add.bind(server)
    server.add = async (e, id) => {
      await gate
      return add(e, id)
    }
    const sending = store.sync.run()
    await store.remove(ladoo.id)
    expect(store.sync.pendingIds().size).toBe(0)
    release()
    await sending
    expect(names(await inner.listDay(DAY))).toEqual([])
  })

  it('5. a day viewed before shows offline with waiting entries; a day never viewed cannot be loaded', async () => {
    const { store, state } = setup()
    await store.add(entry('dal'))
    await store.listDay(DAY)
    state.online = false
    await store.add(entry('curd'))
    expect(names(await store.listDay(DAY))).toEqual(['dal', 'curd'])
    await expect(store.listDay('2026-10-01')).rejects.toThrow()
  })

  it('5. keeps only the last 14 viewed days on the phone', async () => {
    const { store, storage } = setup()
    for (let d = 1; d <= CACHED_DAYS + 3; d++) await store.listDay(`2026-09-${String(d).padStart(2, '0')}`)
    expect(JSON.parse(storage.data.get('tmf:days:me')!)).toHaveLength(CACHED_DAYS)
  })

  it('6. recent foods still work offline', async () => {
    const { store, state } = setup()
    await store.add(entry('upma'))
    await store.recent()
    state.online = false
    await store.add(entry('dosa'))
    expect(names(await store.recent())).toEqual(['dosa', 'upma'])
  })

  it('7. an entry the server refuses is dropped and counted, so the queue never gets stuck', async () => {
    const { store, state, inner } = setup()
    state.online = false
    await store.add(entry('bad'))
    await store.add(entry('good'))
    state.online = true
    state.refuse = true
    await store.sync.run()
    expect(store.sync.refused()).toBe(2)
    expect(store.sync.pendingIds().size).toBe(0)
    state.refuse = false
    await expect(store.add(entry('ok'))).resolves.toMatchObject({ foodName: 'ok' })
    expect(names(await inner.listDay(DAY))).toEqual(['ok'])
    store.sync.clearRefused()
    expect(store.sync.refused()).toBe(0)
  })

  it('7. online, a refused entry still fails at once as before', async () => {
    const { store, state } = setup()
    state.refuse = true
    await expect(store.add(entry('bad'))).rejects.toThrow('check')
    expect(store.sync.pendingIds().size).toBe(0)
  })

  it('8. each account keeps its own waiting entries and days; sign-out clears the days', async () => {
    const storage = mapStorage()
    const asha = setup(storage, 'asha')
    await asha.store.listDay(DAY)
    asha.state.online = false
    await asha.store.add(entry('dal'))
    const ravi = setup(storage, 'ravi')
    ravi.state.online = false
    expect(ravi.store.sync.pendingIds().size).toBe(0)
    await expect(ravi.store.listDay(DAY)).rejects.toThrow()
    asha.store.sync.clearCache()
    expect(storage.data.has('tmf:days:asha')).toBe(false)
    expect(storage.data.has('tmf:outbox:asha')).toBe(true)
  })

  it('8 (T-060). a tick made offline is shown at once with its plan item, waits, and syncs', async () => {
    const { store, state, inner } = setup()
    await store.listDay(DAY)
    state.online = false
    const ticked = await store.add({ ...entry('dal'), planItem: 'p:Lunch:0:dal' })
    expect(store.sync.pendingIds()).toEqual(new Set([ticked.id]))
    expect((await store.listDay(DAY))[0].planItem).toBe('p:Lunch:0:dal')
    state.online = true
    await store.sync.run()
    expect((await inner.listDay(DAY))[0].planItem).toBe('p:Lunch:0:dal')
  })

  it('T-062. food stats use the days kept on the phone when offline', async () => {
    const { store, state } = setup()
    await store.add(entry('dal'))
    expect(names(await store.listRange!(DAY, DAY))).toEqual(['dal'])
    await store.listDay(DAY)
    state.online = false
    await store.add(entry('chai'))
    expect(names(await store.listRange!(DAY, DAY))).toEqual(['dal', 'chai'])
    await expect(store.listRange!('2020-01-01', '2020-01-02')).rejects.toThrow()
  })
})
