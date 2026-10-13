import type { Feedback } from './progression'
import type { NewSet, Plan, PlanDay, Session, SetLog, WorkoutStore } from './types'

export function memoryWorkoutStore(
  init: { plans?: Plan[]; sessions?: Session[]; feedback?: (Feedback & { sessionId: string })[] } = {},
): WorkoutStore {
  let n = 100
  const id = () => String(n++)
  let plans: Plan[] = structuredClone(init.plans ?? [])
  const sessions: Session[] = structuredClone(init.sessions ?? [])
  const feedback: (Feedback & { sessionId: string; order: number })[] = (init.feedback ?? []).map((f, order) => ({ ...f, order }))
  return {
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
    async startSession(date, day: PlanDay | null) {
      const s: Session = { id: id(), performedOn: date, planDayId: day?.id ?? null, name: day?.name ?? 'Workout', sets: [] }
      sessions.push(s)
      return structuredClone(s)
    },
    async addSet(sessionId, set: NewSet) {
      const row: SetLog = { ...set, id: id() }
      sessions.find((s) => s.id === sessionId)!.sets.push(row)
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
}
