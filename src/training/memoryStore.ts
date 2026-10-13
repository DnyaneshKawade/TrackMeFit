import type { Feedback } from './progression'
import { MAX_RECORD_SESSIONS, MAX_SUMMARIES, type NewSet, type Plan, type PlanDay, type Session, type SessionSummary, type SetLog, type WorkoutStore } from './types'

export function memoryWorkoutStore(
  init: { plans?: Plan[]; sessions?: Session[]; feedback?: (Feedback & { sessionId: string })[] } = {},
): WorkoutStore {
  let n = 100
  const id = () => String(n++)
  let plans: Plan[] = structuredClone(init.plans ?? [])
  const sessions: Session[] = structuredClone(init.sessions ?? [])
  const feedback: (Feedback & { sessionId: string; order: number })[] = (init.feedback ?? []).map((f, order) => ({ ...f, order }))
  const store: WorkoutStore = {
    async plans() {
      return structuredClone(plans)
    },
    async savePlan(plan) {
      const saved: Plan = { hardWeeks: 4, ...structuredClone(plan), id: plan.id ?? id() }
      saved.days = saved.days.map((d) => ({ ...d, id: d.id ?? id() }))
      plans = [...plans.filter((p) => p.id !== saved.id), saved]
      return structuredClone(saved)
    },
    async deletePlan(planId) {
      plans = plans.filter((p) => p.id !== planId)
    },
    async sessionsOn(date) {
      return structuredClone(sessions.filter((s) => s.performedOn === date))
    },
    async startSession(date, day: PlanDay | null, given?: string) {
      const old = given && sessions.find((s) => s.id === given)
      if (old) return structuredClone(old)
      const s: Session = { id: given ?? id(), performedOn: date, planDayId: day?.id ?? null, name: day?.name ?? 'Workout', sets: [] }
      sessions.push(s)
      return structuredClone(s)
    },
    async addSet(sessionId, set: NewSet, given?: string) {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session) throw Object.assign(new Error('no such session'), { code: '23503' })
      const old = given && session.sets.find((x) => x.id === given)
      if (old) return { ...old }
      const row: SetLog = { ...set, id: given ?? id() }
      session.sets.push(row)
      return row
    },
    async removeSet(setId) {
      for (const s of sessions) s.sets = s.sets.filter((x) => x.id !== setId)
    },
    async history(exerciseId, beforeDate, limit = 3) {
      return sessions
        .filter((s) => s.performedOn < beforeDate)
        .map((s) => ({ performedOn: s.performedOn, sets: s.sets.filter((x) => x.exerciseId === exerciseId) }))
        .filter((s) => s.sets.length)
        .sort((a, b) => b.performedOn.localeCompare(a.performedOn))
        .slice(0, limit)
    },
    async exerciseHistory(exerciseId, limit = MAX_RECORD_SESSIONS) {
      return store.history(exerciseId, '9999-12-31', limit)
    },
    async summaries(from, to) {
      return sessions
        .filter((s) => s.performedOn >= from && s.performedOn <= to)
        .sort((a, b) => b.performedOn.localeCompare(a.performedOn))
        .slice(0, MAX_SUMMARIES)
        .map((s): SessionSummary => ({ id: s.id, performedOn: s.performedOn, name: s.name, exerciseIds: [...new Set(s.sets.map((x) => x.exerciseId))] }))
    },
    async saveNote(sessionId, note) {
      const s = sessions.find((x) => x.id === sessionId)
      if (!s) throw Object.assign(new Error('no such session'), { code: '23503' })
      if (note.trim()) s.note = note.trim()
      else delete s.note
    },
    async saveFeedback(sessionId, list) {
      for (const f of list) {
        const i = feedback.findIndex((x) => x.sessionId === sessionId && x.muscle === f.muscle)
        if (i >= 0) feedback.splice(i, 1)
        feedback.push({ ...f, sessionId, order: feedback.length + 1000 })
      }
    },
    async feedbackSince(date) {
      const latest = new Map<string, Feedback>()
      const dated = feedback
        .map((f) => ({ f, on: sessions.find((s) => s.id === f.sessionId)?.performedOn ?? '' }))
        .filter((x) => x.on >= date)
        .sort((a, b) => a.on.localeCompare(b.on) || a.f.order - b.f.order)
      for (const { f } of dated) latest.set(f.muscle, { muscle: f.muscle, recovery: f.recovery, effort: f.effort, pain: f.pain })
      return [...latest.values()]
    },
    async startBlock(planId, date) {
      plans = plans.map((p) => (p.id === planId ? { ...p, blockStartedOn: date } : p))
    },
  }
  return store
}
