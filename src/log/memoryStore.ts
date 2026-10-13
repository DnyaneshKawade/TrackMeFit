// In-memory LogStore for tests and for trying the app without a database.

import type { LogEntry, LogStore, NewLogEntry } from './types'

export function memoryLogStore(initial: LogEntry[] = []): LogStore {
  const rows = [...initial]
  let next = rows.length + 1
  return {
    async listDay(date) {
      return rows.filter((r) => r.loggedOn === date)
    },
    async add(entry: NewLogEntry) {
      const row = { ...entry, id: String(next++) }
      rows.push(row)
      return row
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
