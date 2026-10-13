// Food logging that keeps working without a connection (spec T-027).
// Entries get their id on the phone, wait in an outbox kept in browser
// storage per account, and are sent in order when the connection returns.
// The last viewed days and recent foods are kept too, so the Food tab still
// shows them offline.

import { createOutbox, isRefusal, readJson, type KeyValue } from '../sync/outbox'
import type { LogEntry, LogStore, LogSync, NewLogEntry } from './types'

export { browserStorage, isRefusal, type KeyValue } from '../sync/outbox'

type Op = { kind: 'add'; entry: LogEntry } | { kind: 'remove'; id: string }

/** How many viewed days the phone keeps. */
export const CACHED_DAYS = 14

export function offlineLogStore(
  remote: LogStore,
  opts: { storage: KeyValue; accountId: string; newId?: () => string },
): LogStore & { sync: LogSync } {
  const { storage, accountId } = opts
  const newId = opts.newId ?? (() => crypto.randomUUID())
  const daysKey = `tmf:days:${accountId}`
  const recentKey = `tmf:recent:${accountId}`

  // Viewed days, most recently saved last; pruned to CACHED_DAYS.
  let days: [string, LogEntry[]][] = readJson<[string, LogEntry[]][]>(storage, daysKey, [])
  const cachedDay = (date: string) => days.find(([d]) => d === date)?.[1]
  const cacheDay = (date: string, entries: LogEntry[]) => {
    days = [...days.filter(([d]) => d !== date), [date, entries] as [string, LogEntry[]]].slice(-CACHED_DAYS)
    storage.set(daysKey, JSON.stringify(days))
  }
  const editCachedDay = (date: string, edit: (list: LogEntry[]) => LogEntry[]) => {
    const list = cachedDay(date)
    if (list) cacheDay(date, edit(list))
  }
  const dropFromCache = (id: string) => {
    for (const [date, list] of days) if (list.some((e) => e.id === id)) cacheDay(date, list.filter((e) => e.id !== id))
  }

  const outbox = createOutbox<Op>({
    storage,
    key: `tmf:outbox:${accountId}`,
    send: (op) => (op.kind === 'add' ? remote.add(op.entry, op.entry.id).then(() => undefined) : remote.remove(op.id)),
    createdId: (op) => (op.kind === 'add' ? op.entry.id : undefined),
    undo: (op) => ({ kind: 'remove', id: op.kind === 'add' ? op.entry.id : op.id }),
    onRefused: (op) => op.kind === 'add' && dropFromCache(op.entry.id),
  })

  const pendingAdds = () => {
    const ids = outbox.pendingIds()
    return outbox.ops().flatMap((o) => (o.kind === 'add' && ids.has(o.entry.id) ? [o.entry] : []))
  }
  const pendingRemoves = () => new Set(outbox.ops().flatMap((o) => (o.kind === 'remove' ? [o.id] : [])))
  /** Server or cached entries with the waiting work applied on top. */
  const withOutbox = (entries: LogEntry[], keep: (e: LogEntry) => boolean) => {
    const removed = pendingRemoves()
    const ids = new Set(entries.map((e) => e.id))
    return [...entries.filter((e) => !removed.has(e.id)), ...pendingAdds().filter((e) => keep(e) && !ids.has(e.id))]
  }

  const sync: LogSync = {
    pendingIds: outbox.pendingIds,
    refused: outbox.refused,
    clearRefused: outbox.clearRefused,
    run: outbox.run,
    subscribe: outbox.subscribe,
    clearCache() {
      days = []
      storage.remove(daysKey)
      storage.remove(recentKey)
    },
  }

  const between = (from: string, to: string) => (e: { loggedOn: string }) => e.loggedOn >= from && e.loggedOn <= to
  const listRange = remote.listRange?.bind(remote)

  return {
    sync,
    ...(listRange && {
      /** From the server, or the days kept on the phone when offline. */
      async listRange(from: string, to: string) {
        const keep = between(from, to)
        try {
          return withOutbox(await listRange(from, to), keep)
        } catch (e) {
          if (isRefusal(e)) throw e
          const kept = days.filter(([d]) => keep({ loggedOn: d }))
          if (!kept.length) throw e
          return withOutbox(kept.flatMap(([, list]) => list), keep)
        }
      },
    }),
    async listDay(date) {
      try {
        const entries = await remote.listDay(date)
        cacheDay(date, entries)
        return withOutbox(entries, (e) => e.loggedOn === date)
      } catch (e) {
        const cached = cachedDay(date)
        if (isRefusal(e) || !cached) throw e
        return withOutbox(cached, (x) => x.loggedOn === date)
      }
    },
    async add(entry: NewLogEntry) {
      const full: LogEntry = { ...entry, id: newId() }
      if (outbox.isEmpty()) {
        try {
          const saved = await remote.add(entry, full.id)
          editCachedDay(saved.loggedOn, (list) => [...list, saved])
          return saved
        } catch (e) {
          if (isRefusal(e)) throw e
        }
      }
      // Offline, or older work still waiting: keep the order.
      outbox.push({ kind: 'add', entry: full })
      editCachedDay(full.loggedOn, (list) => [...list, full])
      void outbox.run()
      return full
    },
    async remove(id) {
      // Made on the phone and not sent yet (or being sent): cancel it.
      if (outbox.cancel(id) !== 'none') {
        dropFromCache(id)
        return
      }
      if (outbox.isEmpty()) {
        try {
          await remote.remove(id)
          dropFromCache(id)
          return
        } catch (e) {
          if (isRefusal(e)) throw e
        }
      }
      outbox.push({ kind: 'remove', id })
      dropFromCache(id)
      void outbox.run()
    },
    async recent() {
      try {
        const entries = await remote.recent()
        storage.set(recentKey, JSON.stringify(entries))
        return withOutbox(entries, () => false)
      } catch (e) {
        const cached = readJson<LogEntry[] | null>(storage, recentKey, null)
        if (isRefusal(e) || !cached) throw e
        const removed = pendingRemoves()
        return [...pendingAdds().reverse(), ...cached.filter((x) => !removed.has(x.id))]
      }
    },
  }
}
