// Workout logging that keeps working without a connection, for gyms with no
// signal (spec T-027b). Sessions and sets get their id on the phone and wait
// in an outbox like food entries. The last plans, viewed days, exercise
// history and feedback are kept so a session can be run offline. Editing
// plans and starting a block still need a connection.

import { createOutbox, isRefusal, readJson, type KeyValue, type Outbox, type Sync } from '../sync/outbox'
import type { Feedback } from './progression'
import type { PastSession, Plan, PlanDay, Session, SetLog, WorkoutStore } from './types'

type Op =
  | { kind: 'start'; session: Session; day: PlanDay | null }
  | { kind: 'set'; sessionId: string; set: SetLog }
  | { kind: 'unset'; id: string }
  | { kind: 'feedback'; sessionId: string; feedback: Feedback[] }

/** How many viewed days and exercise histories the phone keeps. */
export const CACHED_DAYS = 14
export const CACHED_HISTORIES = 60

export function offlineWorkoutStore(
  remote: WorkoutStore,
  opts: { storage: KeyValue; accountId: string; newId?: () => string },
): WorkoutStore & { sync: Sync } {
  const { storage, accountId } = opts
  const newId = opts.newId ?? (() => crypto.randomUUID())
  const key = (name: string) => `tmf:workouts:${name}:${accountId}`
  const plansKey = key('plans')
  const daysKey = key('days')
  const historyKey = key('history')
  const feedbackKey = key('feedback')

  // Newest last; pruned from the front.
  let days = readJson<[string, Session[]][]>(storage, daysKey, [])
  let histories = readJson<[string, PastSession[]][]>(storage, historyKey, [])
  const cachedDay = (date: string) => days.find(([d]) => d === date)?.[1]
  const cacheDay = (date: string, list: Session[]) => {
    days = [...days.filter(([d]) => d !== date), [date, list] as [string, Session[]]].slice(-CACHED_DAYS)
    storage.set(daysKey, JSON.stringify(days))
  }
  /** Applies an edit to every cached session (there are at most a few a day). */
  const editCachedSessions = (edit: (s: Session) => Session) => {
    for (const [date, list] of days) cacheDay(date, list.map(edit))
  }
  const dropSetFromCache = (id: string) => editCachedSessions((s) => (s.sets.some((x) => x.id === id) ? { ...s, sets: s.sets.filter((x) => x.id !== id) } : s))
  const dropSessionFromCache = (id: string) => {
    for (const [date, list] of days) if (list.some((s) => s.id === id)) cacheDay(date, list.filter((s) => s.id !== id))
  }

  const outbox: Outbox<Op> = createOutbox<Op>({
    storage,
    key: key('outbox'),
    async send(op) {
      if (op.kind === 'start') await remote.startSession(op.session.performedOn, op.day, op.session.id)
      else if (op.kind === 'set') {
        const { id, ...set } = op.set
        await remote.addSet(op.sessionId, set, id)
      } else if (op.kind === 'unset') await remote.removeSet(op.id)
      else await remote.saveFeedback(op.sessionId, op.feedback)
    },
    createdId: (op) => (op.kind === 'start' ? op.session.id : op.kind === 'set' ? op.set.id : undefined),
    // Only sets are removed in the app; a session is never undone.
    undo: (op) => ({ kind: 'unset', id: op.kind === 'set' ? op.set.id : '' }),
    onRefused(op) {
      if (op.kind === 'set') dropSetFromCache(op.set.id)
      if (op.kind === 'start') {
        // Its sets and answers can't be saved without it.
        const id = op.session.id
        outbox.drop((o) => (o.kind === 'set' || o.kind === 'feedback') && o.sessionId === id)
        dropSessionFromCache(id)
      }
    },
  })

  /** Server or cached sessions of a day with the waiting work applied on top. */
  const withOutbox = (date: string, sessions: Session[]): Session[] => {
    const pending = outbox.pendingIds()
    const ops = outbox.ops()
    const removed = new Set(ops.flatMap((o) => (o.kind === 'unset' ? [o.id] : [])))
    const known = new Set(sessions.map((s) => s.id))
    const started = ops.flatMap((o) => (o.kind === 'start' && o.session.performedOn === date && pending.has(o.session.id) && !known.has(o.session.id) ? [o.session] : []))
    return [...sessions, ...started].map((s) => {
      const have = new Set(s.sets.map((x) => x.id))
      const added = ops.flatMap((o) => (o.kind === 'set' && o.sessionId === s.id && pending.has(o.set.id) && !have.has(o.set.id) ? [o.set] : []))
      return { ...s, sets: [...s.sets, ...added].filter((x) => !removed.has(x.id)) }
    })
  }

  /** Reads from the server and keeps a copy; offline, answers from the copy. */
  async function cached<T>(load: () => Promise<T>, keep: (v: T) => void, fallback: () => T | undefined): Promise<T> {
    try {
      const v = await load()
      keep(v)
      return v
    } catch (e) {
      const v = isRefusal(e) ? undefined : fallback()
      if (v === undefined) throw e
      return v
    }
  }

  /** Sends at once when nothing is waiting; otherwise (or offline) queues. */
  async function sendOrQueue<T>(direct: () => Promise<T>, op: Op): Promise<T | undefined> {
    if (outbox.isEmpty()) {
      try {
        return await direct()
      } catch (e) {
        if (isRefusal(e)) throw e
      }
    }
    outbox.push(op)
    void outbox.run()
    return undefined
  }

  const sync: Sync = {
    pendingIds: outbox.pendingIds,
    refused: outbox.refused,
    clearRefused: outbox.clearRefused,
    run: outbox.run,
    subscribe: outbox.subscribe,
    clearCache() {
      days = []
      histories = []
      for (const k of [plansKey, daysKey, historyKey, feedbackKey]) storage.remove(k)
    },
  }

  return {
    sync,
    plans: () =>
      cached(
        () => remote.plans(),
        (p) => storage.set(plansKey, JSON.stringify(p)),
        () => readJson<Plan[] | undefined>(storage, plansKey, undefined),
      ),
    savePlan: (plan) => remote.savePlan(plan),
    deletePlan: (id) => remote.deletePlan(id),
    startBlock: (planId, date) => remote.startBlock(planId, date),
    async sessionsOn(date) {
      const list = await cached(
        () => remote.sessionsOn(date),
        (s) => cacheDay(date, s),
        // A day never viewed still shows workouts started on it offline.
        () => cachedDay(date) ?? (outbox.ops().some((o) => o.kind === 'start' && o.session.performedOn === date) ? [] : undefined),
      )
      return withOutbox(date, list)
    },
    async startSession(date, day) {
      const session: Session = { id: newId(), performedOn: date, planDayId: day?.id ?? null, name: day?.name ?? 'Workout', sets: [] }
      const saved = (await sendOrQueue(() => remote.startSession(date, day, session.id), { kind: 'start', session, day })) ?? session
      const list = cachedDay(date)
      if (list && !list.some((s) => s.id === saved.id)) cacheDay(date, [...list, saved])
      return saved
    },
    async addSet(sessionId, set) {
      const full: SetLog = { ...set, id: newId() }
      const saved = (await sendOrQueue(() => remote.addSet(sessionId, set, full.id), { kind: 'set', sessionId, set: full })) ?? full
      editCachedSessions((s) => (s.id === sessionId && !s.sets.some((x) => x.id === saved.id) ? { ...s, sets: [...s.sets, saved] } : s))
      return saved
    },
    async removeSet(id) {
      // Made on the phone and not sent yet (or being sent): cancel it.
      if (outbox.cancel(id) === 'none') await sendOrQueue(() => remote.removeSet(id), { kind: 'unset', id })
      dropSetFromCache(id)
    },
    async history(exerciseId, beforeDate, limit = 3) {
      const k = `${exerciseId}|${beforeDate}|${limit}`
      return cached(
        () => remote.history(exerciseId, beforeDate, limit),
        (h) => {
          histories = [...histories.filter(([x]) => x !== k), [k, h] as [string, PastSession[]]].slice(-CACHED_HISTORIES)
          storage.set(historyKey, JSON.stringify(histories))
        },
        () => histories.find(([x]) => x === k)?.[1],
      )
    },
    async saveFeedback(sessionId, feedback) {
      if (!feedback.length) return
      await sendOrQueue(() => remote.saveFeedback(sessionId, feedback), { kind: 'feedback', sessionId, feedback })
    },
    feedbackSince: (date) =>
      cached(
        () => remote.feedbackSince(date),
        (f) => storage.set(feedbackKey, JSON.stringify([date, f])),
        () => {
          const [d, f] = readJson<[string, Feedback[]] | []>(storage, feedbackKey, [])
          return d === date ? f : undefined
        },
      ),
  }
}
