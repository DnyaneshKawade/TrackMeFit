import { describe, expect, it } from 'vitest'
import { memoryWorkoutStore } from './memoryStore'
import { offlineWorkoutStore } from './offlineStore'
import type { KeyValue } from '../sync/outbox'
import type { Feedback } from './progression'
import type { NewSet, Plan, Session, WorkoutStore } from './types'

const DAY = '2026-10-13'
const plan: Plan = { id: 'p1', name: 'PPL', days: [{ id: 'd1', dayIndex: 0, name: 'Push', exercises: [{ exerciseId: 'bench', sets: 3, repMin: 6, repMax: 10 }] }] }
const chest: Feedback = { muscle: 'chest', recovery: 'fresh', effort: 'right', pain: false }
const set = (setIndex: number, weightKg = 60): NewSet => ({ exerciseId: 'bench', setIndex, weightKg, reps: 8, rir: 2 })

function mapStorage(): KeyValue & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return { data, get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v), remove: (k) => void data.delete(k) }
}

/** A server that can go offline, refuse, or save but lose its answer. */
function flakyServer(init: Parameters<typeof memoryWorkoutStore>[0] = { plans: [plan] }) {
  const inner = memoryWorkoutStore(init)
  const state = { online: true, refuse: '' as '' | 'start' | 'set', loseAnswer: false, starts: 0, sets: 0 }
  const offline = () => Promise.reject(new TypeError('Failed to fetch'))
  const refusal = () => Promise.reject(Object.assign(new Error('check'), { code: '23514' }))
  const gate = <A extends unknown[], R>(f: (...a: A) => Promise<R>) => (...a: A) => (state.online ? f(...a) : offline())
  const lose = <R>(r: R) => {
    if (!state.loseAnswer) return r
    state.loseAnswer = false
    throw new TypeError('Network connection was lost')
  }
  const server: WorkoutStore = {
    ...inner,
    plans: gate(inner.plans),
    sessionsOn: gate(inner.sessionsOn),
    history: gate(inner.history),
    removeSet: gate(inner.removeSet),
    saveFeedback: gate(inner.saveFeedback),
    saveNote: gate(inner.saveNote),
    feedbackSince: gate(inner.feedbackSince),
    summaries: gate(inner.summaries),
    exerciseHistory: gate(inner.exerciseHistory),
    async startSession(date, day, id) {
      if (!state.online) return offline()
      if (state.refuse === 'start') return refusal()
      const known = (await inner.sessionsOn(date)).some((s) => s.id === id)
      if (!known) state.starts++
      return lose(await inner.startSession(date, day, id))
    },
    async addSet(sessionId, s, id) {
      if (!state.online) return offline()
      if (state.refuse === 'set') return refusal()
      const known = (await inner.sessionsOn(DAY)).some((x) => x.sets.some((y) => y.id === id))
      if (!known) state.sets++
      return lose(await inner.addSet(sessionId, s, id))
    },
  }
  return { server, inner, state }
}

let n = 0
const setup = (storage = mapStorage(), accountId = 'me', init?: Parameters<typeof memoryWorkoutStore>[0]) => {
  const f = flakyServer(init)
  const store = offlineWorkoutStore(f.server, { storage, accountId, newId: () => `w-${++n}` })
  return { ...f, store, storage }
}
const reps = (s: Session) => s.sets.map((x) => x.weightKg)

describe('offline workouts (T-027b)', () => {
  it('9. a workout started offline and its sets show at once, marked as waiting', async () => {
    const { store, state } = setup()
    await store.sessionsOn(DAY)
    state.online = false
    const session = await store.startSession(DAY, plan.days[0])
    const a = await store.addSet(session.id, set(0))
    expect(store.sync.pendingIds()).toEqual(new Set([session.id, a.id]))
    const [shown] = await store.sessionsOn(DAY)
    expect(shown.name).toBe('Push')
    expect(reps(shown)).toEqual([60])
  })

  it('10. the workout goes before its sets, in order, when the connection returns', async () => {
    const { store, state, inner } = setup()
    state.online = false
    const session = await store.startSession(DAY, plan.days[0])
    await store.addSet(session.id, set(0, 60))
    await store.addSet(session.id, set(1, 62.5))
    state.online = true
    await store.sync.run()
    const [saved] = await inner.sessionsOn(DAY)
    expect(saved.id).toBe(session.id)
    expect(saved.planDayId).toBe('d1')
    expect(reps(saved)).toEqual([60, 62.5])
    expect(store.sync.pendingIds().size).toBe(0)
  })

  it('10. sets logged online while older work waits are queued behind it', async () => {
    const { store, state, inner } = setup()
    state.online = false
    const session = await store.startSession(DAY, null)
    state.online = true
    // The session is still queued, so this set must wait for it.
    await store.addSet(session.id, set(0))
    await store.sync.run()
    expect(reps((await inner.sessionsOn(DAY))[0])).toEqual([60])
  })

  it('11. a workout or set whose answer was lost is saved once', async () => {
    const { store, state, inner } = setup()
    state.loseAnswer = true
    const session = await store.startSession(DAY, null)
    expect(store.sync.pendingIds()).toEqual(new Set([session.id]))
    await store.sync.run()
    state.loseAnswer = true
    await store.addSet(session.id, set(0))
    await store.sync.run()
    expect(state.starts).toBe(1)
    expect(state.sets).toBe(1)
    expect(reps((await inner.sessionsOn(DAY))[0])).toEqual([60])
  })

  it('12. removing a waiting set drops it; removing a synced set waits and is sent later', async () => {
    const { store, state, inner } = setup()
    await store.sessionsOn(DAY)
    const session = await store.startSession(DAY, null)
    const synced = await store.addSet(session.id, set(0, 50))
    state.online = false
    const waiting = await store.addSet(session.id, set(1, 55))
    await store.removeSet(waiting.id)
    await store.removeSet(synced.id)
    expect(reps((await store.sessionsOn(DAY))[0])).toEqual([])
    state.online = true
    await store.sync.run()
    expect(reps((await inner.sessionsOn(DAY))[0])).toEqual([])
    expect(state.sets).toBe(1)
  })

  it('13. plans, viewed days and exercise history load from the phone at the gym', async () => {
    const past: Session = { id: 's0', performedOn: '2026-10-10', planDayId: 'd1', name: 'Push', sets: [{ id: 'x', ...set(0, 57.5) }] }
    const { store, state } = setup(mapStorage(), 'me', { plans: [plan], sessions: [past] })
    await store.plans()
    await store.sessionsOn(DAY)
    await store.history('bench', DAY)
    await store.feedbackSince('2026-10-07')
    state.online = false
    expect((await store.plans()).map((p) => p.name)).toEqual(['PPL'])
    expect(await store.sessionsOn(DAY)).toEqual([])
    expect((await store.history('bench', DAY))[0].sets[0].weightKg).toBe(57.5)
    expect(await store.feedbackSince('2026-10-07')).toEqual([])
    // Never loaded before: fails as today.
    await expect(store.history('squat', DAY)).rejects.toThrow()
    await expect(store.sessionsOn('2026-10-01')).rejects.toThrow()
  })

  it('14. a set the server refuses is dropped and counted, so the queue never sticks', async () => {
    const { store, state, inner } = setup()
    const session = await store.startSession(DAY, null)
    state.online = false
    await store.addSet(session.id, set(0, 50))
    await store.addSet(session.id, set(1, 55))
    state.online = true
    state.refuse = 'set'
    await store.sync.run()
    expect(store.sync.refused()).toBe(2)
    expect(store.sync.pendingIds().size).toBe(0)
    state.refuse = ''
    await store.addSet(session.id, set(2, 60))
    expect(reps((await inner.sessionsOn(DAY))[0])).toEqual([60])
    expect(reps((await store.sessionsOn(DAY))[0])).toEqual([60])
  })

  it('14. a refused workout takes its waiting sets with it', async () => {
    const { store, state, inner } = setup()
    await store.sessionsOn(DAY)
    state.online = false
    const session = await store.startSession(DAY, null)
    await store.addSet(session.id, set(0))
    await store.saveFeedback(session.id, [chest])
    state.online = true
    state.refuse = 'start'
    await store.sync.run()
    expect(store.sync.refused()).toBe(2)
    expect(store.sync.pendingIds().size).toBe(0)
    expect(await inner.sessionsOn(DAY)).toEqual([])
    expect(await store.sessionsOn(DAY)).toEqual([])
  })

  it('15. waiting work and copies are kept per account; sign-out clears the copies', async () => {
    const storage = mapStorage()
    const me = setup(storage, 'me')
    await me.store.plans()
    me.state.online = false
    await me.store.startSession(DAY, null)
    const other = setup(storage, 'other')
    other.state.online = false
    expect(other.store.sync.pendingIds().size).toBe(0)
    await expect(other.store.plans()).rejects.toThrow()
    me.store.sync.clearCache()
    await expect(me.store.plans()).rejects.toThrow()
    // The waiting workout is still there after a reload.
    const again = offlineWorkoutStore(me.server, { storage, accountId: 'me' })
    expect(again.sync.pendingIds().size).toBe(1)
  })

  it('16. how-did-it-feel answers wait and are sent after the workout', async () => {
    const { store, state, inner } = setup()
    state.online = false
    const session = await store.startSession(DAY, null)
    const fb = [chest]
    await store.saveFeedback(session.id, fb)
    state.online = true
    await store.sync.run()
    expect(await inner.feedbackSince(DAY)).toEqual(fb)
  })

  it('8 (T-043a). tagged sets with notes and workout notes wait and sync', async () => {
    const { store, state, inner } = setup()
    await store.sessionsOn(DAY)
    state.online = false
    const session = await store.startSession(DAY, null)
    await store.addSet(session.id, { ...set(0, 40), tag: 'warmup', note: 'easy' })
    await store.saveNote(session.id, '  Short on time  ')
    const [shown] = await store.sessionsOn(DAY)
    expect(shown.note).toBe('Short on time')
    expect(shown.sets[0]).toMatchObject({ tag: 'warmup', note: 'easy' })
    state.online = true
    await store.sync.run()
    const [saved] = await inner.sessionsOn(DAY)
    expect(saved.note).toBe('Short on time')
    expect(saved.sets[0]).toMatchObject({ tag: 'warmup', note: 'easy' })
    // Clearing the note offline clears it on the server too.
    state.online = false
    await store.saveNote(session.id, '')
    expect((await store.sessionsOn(DAY))[0].note).toBeUndefined()
    state.online = true
    await store.sync.run()
    expect((await inner.sessionsOn(DAY))[0].note).toBeUndefined()
  })

  it('the calendar uses the days kept on the phone offline; records need a connection (T-044)', async () => {
    const past: Session = { id: 's0', performedOn: '2026-10-10', planDayId: 'd1', name: 'Push', sets: [{ id: 'x', ...set(0, 57.5) }] }
    const { store, state } = setup(mapStorage(), 'me', { plans: [plan], sessions: [past] })
    expect((await store.summaries('2026-10-01', '2026-10-31')).map((x) => x.name)).toEqual(['Push'])
    await store.sessionsOn('2026-10-10')
    state.online = false
    expect(await store.summaries('2026-10-01', '2026-10-31')).toEqual([{ id: 's0', performedOn: '2026-10-10', name: 'Push', planDayId: 'd1', exerciseIds: ['bench'] }])
    await expect(store.summaries('2026-09-01', '2026-09-30')).rejects.toThrow()
    await expect(store.exerciseHistory('bench')).rejects.toThrow()
  })
})
