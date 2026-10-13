import type { NewSet, Plan, PlanDay, Session, SetLog, WorkoutStore } from './types'

export function memoryWorkoutStore(init: { plans?: Plan[]; sessions?: Session[] } = {}): WorkoutStore {
  let n = 100
  const id = () => String(n++)
  let plans: Plan[] = structuredClone(init.plans ?? [])
  const sessions: Session[] = structuredClone(init.sessions ?? [])
  return {
    async plans() {
      return structuredClone(plans)
    },
    async savePlan(plan) {
      const saved: Plan = { ...structuredClone(plan), id: plan.id ?? id() }
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
  }
}
