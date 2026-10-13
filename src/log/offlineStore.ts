// Food logging that keeps working without a connection (spec T-027).
// Entries get their id on the phone, wait in an outbox kept in browser
// storage per account, and are sent in order when the connection returns.
// The last viewed days and recent foods are kept too, so the Food tab still
// shows them offline.

import type { LogEntry, LogStore, LogSync, NewLogEntry } from './types'

/** Small key-value storage; browser storage in the app, a map in tests. */
export interface KeyValue {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

/** Browser storage that never throws (private windows can block it). */
export const browserStorage: KeyValue = {
  get: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      // Storage full or blocked: the outbox still works until reload.
    }
  },
  remove: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      // Nothing to clear.
    }
  },
}

type Op = { kind: 'add'; entry: LogEntry } | { kind: 'remove'; id: string }

/** Only data the server refuses outright is dropped: Postgres data and
 * constraint errors (classes 22, 23) and permission or syntax errors (42).
 * Anything else, a failed fetch above all, is retried later. */
export function isRefusal(e: unknown): boolean {
  const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code ?? '') : ''
  return /^(22|23|42)/.test(code)
}

/** How many viewed days the phone keeps. */
export const CACHED_DAYS = 14

export function offlineLogStore(
  remote: LogStore,
  opts: { storage: KeyValue; accountId: string; newId?: () => string },
): LogStore & { sync: LogSync } {
  const { storage, accountId } = opts
  const newId = opts.newId ?? (() => crypto.randomUUID())
  const outboxKey = `tmf:outbox:${accountId}`
  const daysKey = `tmf:days:${accountId}`
  const recentKey = `tmf:recent:${accountId}`

  const read = <T>(key: string, fallback: T): T => {
    try {
      const v = storage.get(key)
      return v ? (JSON.parse(v) as T) : fallback
    } catch {
      return fallback
    }
  }

  let outbox: Op[] = read<Op[]>(outboxKey, [])
  // Viewed days, most recently saved last; pruned to CACHED_DAYS.
  let days: [string, LogEntry[]][] = read<[string, LogEntry[]][]>(daysKey, [])
  let refused = 0
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((l) => l())

  const saveOutbox = () => {
    storage.set(outboxKey, JSON.stringify(outbox))
    notify()
  }
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

  const pendingAdds = () => outbox.flatMap((o) => (o.kind === 'add' && !cancelled.has(o.entry.id) ? [o.entry] : []))
  const pendingRemoves = () => new Set(outbox.flatMap((o) => (o.kind === 'remove' ? [o.id] : [])))
  /** Server or cached entries with the waiting work applied on top. */
  const withOutbox = (entries: LogEntry[], keep: (e: LogEntry) => boolean) => {
    const removed = pendingRemoves()
    const ids = new Set(entries.map((e) => e.id))
    return [...entries.filter((e) => !removed.has(e.id)), ...pendingAdds().filter((e) => keep(e) && !ids.has(e.id))]
  }

  const send = (op: Op) => (op.kind === 'add' ? remote.add(op.entry, op.entry.id).then(() => undefined) : remote.remove(op.id))

  let running: Promise<void> | null = null
  let inFlight: Op | null = null
  // Waiting entries removed while being sent: settled when the send ends.
  const cancelled = new Set<string>()
  const loop = async () => {
    while (outbox.length) {
      const op = (inFlight = outbox[0])
      const cancel = op.kind === 'add' && cancelled.has(op.entry.id)
      try {
        await send(op)
        if (op.kind === 'add' && cancelled.delete(op.entry.id)) {
          // Saved after the person removed it: remove it on the server too.
          outbox = outbox.map((o): Op => (o === op ? { kind: 'remove', id: op.entry.id } : o))
          saveOutbox()
          continue
        }
      } catch (e) {
        if (!isRefusal(e)) {
          // The connection: try again later. A removed entry may still have
          // reached the server, so send a removal for it instead.
          if (cancel && op.kind === 'add') {
            cancelled.delete(op.entry.id)
            outbox = outbox.map((o): Op => (o === op ? { kind: 'remove', id: op.entry.id } : o))
            saveOutbox()
          }
          return
        }
        if (op.kind === 'add') {
          if (!cancelled.delete(op.entry.id)) refused++
          dropFromCache(op.entry.id)
        }
      } finally {
        inFlight = null
      }
      outbox = outbox.filter((o) => o !== op)
      saveOutbox()
    }
  }
  // One send loop at a time. A call while it runs (say, the phone just came
  // back online) makes it go round once more when it ends.
  let again = false
  const run = (): Promise<void> => {
    if (running) {
      again = true
      return running
    }
    running = (async () => {
      do {
        again = false
        await loop()
      } while (again)
    })().finally(() => (running = null))
    return running
  }

  const enqueue = (op: Op) => {
    outbox = [...outbox, op]
    saveOutbox()
  }

  const sync: LogSync = {
    pendingIds: () => new Set(pendingAdds().map((e) => e.id)),
    refused: () => refused,
    clearRefused: () => {
      refused = 0
      notify()
    },
    run,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    clearCache() {
      days = []
      storage.remove(daysKey)
      storage.remove(recentKey)
    },
  }

  return {
    sync,
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
      if (!outbox.length) {
        try {
          const saved = await remote.add(entry, full.id)
          editCachedDay(saved.loggedOn, (list) => [...list, saved])
          return saved
        } catch (e) {
          if (isRefusal(e)) throw e
        }
      }
      // Offline, or older work still waiting: keep the order.
      enqueue({ kind: 'add', entry: full })
      editCachedDay(full.loggedOn, (list) => [...list, full])
      void run()
      return full
    },
    async remove(id) {
      if (inFlight?.kind === 'add' && inFlight.entry.id === id) {
        // Being sent right now: settle it when the send ends.
        cancelled.add(id)
        dropFromCache(id)
        notify()
        return
      }
      if (outbox.some((o) => o.kind === 'add' && o.entry.id === id)) {
        // Never sent: just forget it.
        outbox = outbox.filter((o) => !(o.kind === 'add' && o.entry.id === id))
        saveOutbox()
        dropFromCache(id)
        return
      }
      if (!outbox.length) {
        try {
          await remote.remove(id)
          dropFromCache(id)
          return
        } catch (e) {
          if (isRefusal(e)) throw e
        }
      }
      enqueue({ kind: 'remove', id })
      dropFromCache(id)
      void run()
    },
    async recent() {
      try {
        const entries = await remote.recent()
        storage.set(recentKey, JSON.stringify(entries))
        return withOutbox(entries, () => false)
      } catch (e) {
        const cached = read<LogEntry[] | null>(recentKey, null)
        if (isRefusal(e) || !cached) throw e
        const removed = pendingRemoves()
        return [...pendingAdds().reverse(), ...cached.filter((x) => !removed.has(x.id))]
      }
    },
  }
}
