// In-memory LogStore for tests and for trying the app without a database.

import type { LogEntry, LogStore, NewLogEntry } from './types'

export function memoryLogStore(initial: LogEntry[] = []): LogStore {
  const rows = [...initial]
  let next = rows.length + 1
  return {
    async listDay(date) {
      return rows.filter((r) => r.loggedOn === date)
    },
    async add(entry: NewLogEntry, id?: string) {
      const same = id ? rows.find((r) => r.id === id) : undefined
      if (same) return same
      const row = { ...entry, id: id ?? String(next++) }
      rows.push(row)
      return row
    },
    async listRange(from, to) {
      return rows.filter((r) => r.loggedOn >= from && r.loggedOn <= to)
    },
    async recent() {
      return [...rows].reverse().slice(0, 200)
    },
    async remove(id) {
      const i = rows.findIndex((r) => r.id === id)
      if (i >= 0) rows.splice(i, 1)
    },
  }
}
