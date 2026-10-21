// @vitest-environment jsdom
// Training volume on the records page (spec T-122).
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { memoryWorkoutStore } from './memoryStore'
import { RecordsView } from './RecordsView'
import type { Session, SetLog } from './types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const TODAY = '2026-10-21'
let n = 0
const set = (exerciseId: string, weightKg: number, reps: number, tag?: SetLog['tag']): SetLog => ({ id: `x${n++}`, exerciseId, setIndex: n, weightKg, reps, rir: null, ...(tag ? { tag } : {}) })
const day = (id: string, performedOn: string, sets: SetLog[]): Session => ({ id, performedOn, planDayId: null, name: 'Workout', sets })
const SESSIONS = [
  day('a', '2026-10-06', [set('bench-press', 40, 10, 'warmup'), set('bench-press', 60, 10), set('bench-press', 60, 8)]),
  day('b', '2026-10-08', [set('bench-press', 60, 10), set('cardio-run', 0, 0)]),
  day('c', '2026-10-13', [set('bench-press', 65, 8), set('bench-press', 65, 8), set('bench-press', 65, 6)]),
]

const open = async (sessions = SESSIONS) => {
  const store = memoryWorkoutStore({ sessions })
  const spy = vi.spyOn(store, 'sessionsBetween')
  render(<RecordsView store={store} today={TODAY} onClose={() => {}} />)
  const box = await screen.findByRole('region', { name: 'Training volume' })
  await within(box).findByRole('img')
  return { box, spy }
}

describe('training volume (T-122)', () => {
  it('1. shows workout volume for all exercises, without warm-ups or cardio, in one read', async () => {
    const { box, spy } = await open()
    // 600 + 480; 600; 520 + 520 + 390.
    expect(within(box).getByRole('img', { name: 'Workout volume (all exercises), from 1080 kg on 6 Oct to 1430 kg on 13 Oct' })).toBeTruthy()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('2. weekly sets for a muscle count working sets by week', async () => {
    const { box } = await open()
    fireEvent.change(within(box).getByLabelText('Graph shows'), { target: { value: 'chest' } })
    expect(within(box).getByRole('img', { name: 'Weekly sets: Chest, from 3 sets on 5 Oct to 3 sets on 12 Oct' })).toBeTruthy()
    expect(within(within(box).getByRole('list', { name: 'Each week' })).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Week of 5 Oct3 sets', 'Week of 12 Oct3 sets'])
  })

  it('3. every choice shows even with nothing logged', async () => {
    const store = memoryWorkoutStore({ sessions: [] })
    render(<RecordsView store={store} today={TODAY} onClose={() => {}} />)
    const box = await screen.findByRole('region', { name: 'Training volume' })
    await within(box).findByText('Pick a longer time, or log two workouts, to see a graph.')
    const options = within(within(box).getByLabelText('Graph shows')).getAllByRole('option')
    expect(options[0].textContent).toBe('Workout volume (all exercises)')
    expect(options.map((o) => o.textContent)).toContain('Weekly sets: Chest')
    expect(options).toHaveLength(17)
  })
})
