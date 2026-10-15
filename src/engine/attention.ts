// Which clients need a coach's attention (spec T-026b). Each flag carries a
// plain reason; clients with more serious flags come first. Pure, no I/O.

import { trendWeights, type WeighIn } from './diet'

export type Goal = 'lose' | 'maintain' | 'gain' | 'recomp'

export interface ClientSummary {
  clientId: string
  name: string
  goal: Goal | null
  /** Workouts a week the client planned at signup. */
  trainingDays: number | null
  lastFoodOn: string | null
  /** Days with food logged in the 7 days before today. */
  foodDays: number
  /** Averages over those days. */
  avgKcal: number | null
  avgProteinG: number | null
  targetKcal: number | null
  targetProteinG: number | null
  /** Weigh-ins from the last 3 weeks, any order. */
  weighIns: WeighIn[]
  /** Workouts in the 7 days up to today. */
  workouts: number
  lastWorkoutOn: string | null
}

export interface Flag {
  reason: string
  /** Higher means more urgent. */
  weight: number
}

export interface ClientAttention<C extends ClientSummary = ClientSummary> {
  client: C
  flags: Flag[]
  score: number
}

const DAY = 86_400_000
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / DAY)
const round = (n: number, step = 1) => Math.round(n / step) * step

/** Weekly change of the average weight, as a share of body weight. Null
 * without a week of weigh-ins. */
export function weeklyRate(weighIns: WeighIn[]): number | null {
  if (weighIns.length < 2) return null
  const trend = trendWeights(weighIns)
  const last = trend[trend.length - 1]
  const before = [...trend].reverse().find((t) => daysBetween(t.date, last.date) >= 7)
  if (!before) return null
  return ((last.kg - before.kg) / before.kg) * (7 / daysBetween(before.date, last.date))
}

/** Everything that needs the coach's attention for one client, most urgent first. */
export function clientFlags(c: ClientSummary, today: string): Flag[] {
  const flags: Flag[] = []

  const noFood = c.lastFoodOn ? daysBetween(c.lastFoodOn, today) : null
  if (noFood === null) flags.push({ reason: 'No food logged yet.', weight: 3 })
  else if (noFood >= 3) flags.push({ reason: `No food logged for ${noFood} days.`, weight: 3 })

  if (c.foodDays >= 3 && c.avgKcal !== null && c.targetKcal) {
    const off = (c.avgKcal - c.targetKcal) / c.targetKcal
    if (Math.abs(off) > 0.15)
      flags.push({
        reason: `Ate about ${round(c.avgKcal, 10)} kcal a day last week, ${Math.round(Math.abs(off) * 100)}% ${off > 0 ? 'over' : 'under'} the ${c.targetKcal} kcal target.`,
        weight: 2,
      })
  }
  if (c.foodDays >= 3 && c.avgProteinG !== null && c.targetProteinG && c.avgProteinG < c.targetProteinG * 0.8)
    flags.push({ reason: `Protein was about ${round(c.avgProteinG)} g a day, below the ${c.targetProteinG} g target.`, weight: 1 })

  const lastWeigh = c.weighIns.reduce<string | null>((m, w) => (m === null || w.date > m ? w.date : m), null)
  if (lastWeigh === null) flags.push({ reason: 'No weigh-in yet.', weight: 1 })
  else if (daysBetween(lastWeigh, today) >= 7) flags.push({ reason: `No weigh-in for ${daysBetween(lastWeigh, today)} days.`, weight: 1 })

  const rate = weeklyRate(c.weighIns)
  if (rate !== null) {
    const pct = `${Math.abs(round(rate * 100, 0.1)).toFixed(1)}%`
    if (c.goal === 'lose' && rate > 0.0025) flags.push({ reason: `Weight is going up ${pct} a week, but the goal is to lose.`, weight: 2 })
    else if (c.goal === 'lose' && rate < -0.01) flags.push({ reason: `Losing ${pct} a week, faster than the 1% safe limit.`, weight: 2 })
    else if (c.goal === 'gain' && rate < -0.0025) flags.push({ reason: `Weight is going down ${pct} a week, but the goal is to gain.`, weight: 2 })
    else if (c.goal === 'gain' && rate > 0.005) flags.push({ reason: `Gaining ${pct} a week, faster than 0.5%. More of it may be fat.`, weight: 1 })
  }

  if (c.trainingDays && c.trainingDays > 0) {
    if (c.lastWorkoutOn === null) flags.push({ reason: 'No workouts logged yet.', weight: 2 })
    else if (c.workouts < c.trainingDays - 1)
      flags.push({ reason: `${c.workouts} of ${c.trainingDays} planned workouts done in the last 7 days.`, weight: 2 })
  }

  return flags.sort((a, b) => b.weight - a.weight)
}

/** Clients sorted by who needs attention most, then by name. */
export function sortByAttention<C extends ClientSummary>(clients: C[], today: string): ClientAttention<C>[] {
  return clients
    .map((client) => {
      const flags = clientFlags(client, today)
      return { client, flags, score: flags.reduce((s, f) => s + f.weight, 0) }
    })
    .sort((a, b) => b.score - a.score || a.client.name.localeCompare(b.client.name))
}
