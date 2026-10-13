// Work made without a connection waits here, in browser storage per account,
// and is sent in order when the connection returns (spec T-027). Shared by the
// food log and workouts.

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

/** Reads JSON from storage, or the fallback when missing or unreadable. */
export function readJson<T>(storage: KeyValue, key: string, fallback: T): T {
  try {
    const v = storage.get(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

/** Only data the server refuses outright is dropped: Postgres data and
 * constraint errors (classes 22, 23) and permission or syntax errors (42).
 * Anything else, a failed fetch above all, is retried later. */
export function isRefusal(e: unknown): boolean {
  const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code ?? '') : ''
  return /^(22|23|42)/.test(code)
}

/** What screens see of the waiting work. */
export interface Sync {
  /** Ids of records made on the phone and not yet on the server. */
  pendingIds(): Set<string>
  /** Records the server refused since the person last saw the note. */
  refused(): number
  clearRefused(): void
  /** Sends waiting work in order; stops at the first connection problem. */
  run(): Promise<void>
  /** Called whenever waiting work changes. Returns an unsubscribe. */
  subscribe(listener: () => void): () => void
  /** Forgets the copy of viewed data (on sign-out); waiting work stays. */
  clearCache(): void
}

export interface Outbox<Op> {
  ops(): Op[]
  isEmpty(): boolean
  push(op: Op): void
  /** Forgets a waiting record by the id it was made with. "sending" means it
   * is on its way and is undone when the send ends. */
  cancel(id: string): 'dropped' | 'sending' | 'none'
  /** Drops waiting work that can no longer be sent (say, sets of a refused
   * workout); records among it count as refused. */
  drop(match: (op: Op) => boolean): void
  pendingIds(): Set<string>
  run(): Promise<void>
  refused(): number
  clearRefused(): void
  subscribe(listener: () => void): () => void
}

export function createOutbox<Op>(o: {
  storage: KeyValue
  key: string
  send(op: Op): Promise<void>
  /** The id of the record an op makes, if it makes one. */
  createdId(op: Op): string | undefined
  /** The op that removes a record an op made. */
  undo(op: Op): Op
  /** Called when the server refuses a record. */
  onRefused?(op: Op): void
}): Outbox<Op> {
  let ops: Op[] = readJson<Op[]>(o.storage, o.key, [])
  let refused = 0
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((l) => l())
  const save = () => {
    o.storage.set(o.key, JSON.stringify(ops))
    notify()
  }

  let inFlight: Op | null = null
  // Records removed while being sent: settled when the send ends.
  const cancelled = new Set<string>()
  const replace = (op: Op, next: Op) => {
    ops = ops.map((x) => (x === op ? next : x))
    save()
  }

  const loop = async () => {
    while (ops.length) {
      const op = (inFlight = ops[0])
      const id = o.createdId(op)
      try {
        await o.send(op)
        if (id !== undefined && cancelled.delete(id)) {
          // Saved after the person removed it: remove it on the server too.
          replace(op, o.undo(op))
          continue
        }
      } catch (e) {
        if (!isRefusal(e)) {
          // The connection: try again later. A removed record may still have
          // reached the server, so send a removal for it instead.
          if (id !== undefined && cancelled.delete(id)) replace(op, o.undo(op))
          return
        }
        if (id !== undefined) {
          if (!cancelled.delete(id)) refused++
          o.onRefused?.(op)
        }
      } finally {
        inFlight = null
      }
      ops = ops.filter((x) => x !== op)
      save()
    }
  }

  // One send loop at a time. A call while it runs (say, the phone just came
  // back online) makes it go round once more when it ends.
  let running: Promise<void> | null = null
  let again = false
  const run = (): Promise<void> => {
    if (running) {
      again = true
      return running
    }
    // Cleared in the same step the loop ends, so a call never gets a run
    // that has already finished. (loop always awaits, so this runs after
    // the assignment below.)
    running = (async () => {
      try {
        do {
          again = false
          await loop()
        } while (again)
      } finally {
        running = null
      }
    })()
    return running
  }

  return {
    ops: () => ops,
    isEmpty: () => ops.length === 0,
    push(op) {
      ops = [...ops, op]
      save()
    },
    cancel(id) {
      if (inFlight && o.createdId(inFlight) === id) {
        cancelled.add(id)
        notify()
        return 'sending'
      }
      const before = ops.length
      ops = ops.filter((op) => o.createdId(op) !== id)
      if (ops.length === before) return 'none'
      save()
      return 'dropped'
    },
    drop(match) {
      const gone = ops.filter((op) => op !== inFlight && match(op))
      if (!gone.length) return
      refused += gone.filter((op) => o.createdId(op) !== undefined).length
      ops = ops.filter((op) => !gone.includes(op))
      save()
    },
    pendingIds: () => new Set(ops.flatMap((op) => {
      const id = o.createdId(op)
      return id !== undefined && !cancelled.has(id) ? [id] : []
    })),
    run,
    refused: () => refused,
    clearRefused() {
      refused = 0
      notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
