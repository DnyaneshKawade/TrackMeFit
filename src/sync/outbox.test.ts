import { describe, expect, it } from 'vitest'
import { createOutbox, type KeyValue } from './outbox'

const mapStorage = (): KeyValue => {
  const data = new Map<string, string>()
  return { get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v), remove: (k) => void data.delete(k) }
}

describe('outbox (T-027)', () => {
  it('a sync asked for just as an earlier one gives up still sends the waiting work', async () => {
    // Whatever the moment the second call lands, the op must go out.
    for (let ticks = 0; ticks < 8; ticks++) {
      let online = false
      const sent: string[] = []
      const ob = createOutbox<string>({
        storage: mapStorage(),
        key: 'k',
        send: async (op) => {
          if (!online) throw new TypeError('Failed to fetch')
          sent.push(op)
        },
        createdId: (op) => op,
        undo: (op) => op,
      })
      ob.push('a')
      void ob.run()
      for (let i = 0; i < ticks; i++) await Promise.resolve()
      online = true
      await ob.run()
      expect(sent, `after ${ticks} ticks`).toEqual(['a'])
      expect(ob.isEmpty()).toBe(true)
    }
  })
})
