import { describe, expect, it } from 'vitest'
import { EXERCISES, MUSCLE_NAMES, searchExercises } from './exercises'

// The bigger exercise list (spec T-081).

/** The 71 ids from before T-081. Past sets and plans use them. */
const OLD_IDS = ['bench-press','incline-bench-press','db-bench-press','incline-db-press','machine-chest-press','smith-incline-press','dips','push-up','pec-deck','cable-fly','db-fly','pull-up','lat-pulldown','close-grip-pulldown','barbell-row','db-row','seated-cable-row','t-bar-row','chest-supported-row','straight-arm-pulldown','deadlift','back-squat','front-squat','hack-squat','leg-press','smith-squat','goblet-squat','bulgarian-split-squat','walking-lunge','leg-extension','romanian-deadlift','db-rdl','lying-leg-curl','seated-leg-curl','hip-thrust','cable-kickback','hip-abduction','overhead-press','db-shoulder-press','machine-shoulder-press','lateral-raise','cable-lateral-raise','machine-lateral-raise','rear-delt-fly','face-pull','db-rear-delt-raise','shrug','barbell-curl','db-curl','hammer-curl','preacher-curl','cable-curl','incline-db-curl','triceps-pushdown','overhead-triceps-extension','skull-crusher','close-grip-bench','standing-calf-raise','seated-calf-raise','cable-crunch','hanging-leg-raise','ab-wheel','plank','bodyweight-squat','reverse-lunge','inverted-row','glute-bridge','pike-push-up','db-overhead-extension','bench-dip','single-leg-calf-raise']

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

describe('exercise library (T-081)', () => {
  it('1. it has 400 to 500 exercises; every id and name is used once, and old ids stay the same', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(400)
    expect(EXERCISES.length).toBeLessThanOrEqual(500)
    const twice = (list: string[]) => list.filter((x, i) => list.indexOf(x) !== i)
    expect(twice(EXERCISES.map((e) => e.id))).toEqual([])
    expect(twice(EXERCISES.map((e) => norm(e.name)))).toEqual([])
    const ids = new Set(EXERCISES.map((e) => e.id))
    expect(OLD_IDS.filter((id) => !ids.has(id))).toEqual([])
    for (const e of EXERCISES) expect(e.id, e.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('2. every muscle has at least 10 exercises, from more than one kind of equipment', () => {
    for (const m of Object.keys(MUSCLE_NAMES) as (keyof typeof MUSCLE_NAMES)[]) {
      const list = EXERCISES.filter((e) => e.primary === m)
      expect(list.length, m).toBeGreaterThanOrEqual(10)
      expect(new Set(list.map((e) => e.equipment)).size, m).toBeGreaterThan(1)
    }
  })

  it('3. search finds common gym words', () => {
    const finds = (q: string, id: string) => expect(searchExercises(q, EXERCISES).map((e) => e.id), q).toContain(id)
    finds('stiff leg', 'stiff-leg-deadlift')
    finds('ez bar stiff', 'ez-bar-stiff-leg-deadlift')
    for (const q of ['smith', 'pec fly', 'preacher', 'hip thrust', 'ez bar']) expect(searchExercises(q, EXERCISES).length, q).toBeGreaterThan(0)
  })

  it('4. muscles follow simple rules: presses help triceps, rows help biceps, one-joint moves have one helper at most', () => {
    const broken: string[] = []
    for (const e of EXERCISES) {
      if (e.secondary.includes(e.primary)) broken.push(`${e.id}: main muscle is also a helper`)
      if (e.isolation && e.secondary.length > 1) broken.push(`${e.id}: one-joint with ${e.secondary.length} helpers`)
      const n = norm(e.name)
      if (!e.isolation && (e.primary === 'chest' || e.primary === 'sideDelts') && /\bpress\b/.test(n) && !e.secondary.includes('triceps'))
        broken.push(`${e.id}: press without triceps`)
      if (!e.isolation && e.primary === 'back' && /\b(row|pulldown|pull up|chin up)\b/.test(n) && !e.secondary.includes('biceps'))
        broken.push(`${e.id}: row or pulldown without biceps`)
    }
    expect(broken).toEqual([])
  })
})
