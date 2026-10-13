// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import type { Session, SetLog, WorkoutStore } from './types'

afterEach(cleanup)

const TODAY = '2026-10-12'
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

let n = 0
const sets = (exerciseId: string, ...list: [number, number, SetLog['tag']?][]): SetLog[] =>
  list.map(([weightKg, reps, tag], setIndex) => ({ id: `x${++n}`, exerciseId, setIndex, weightKg, reps, rir: null, ...(tag ? { tag } : {}) }))
const session = (id: string, performedOn: string, name: string, ...s: SetLog[][]): Session => ({ id, performedOn, planDayId: null, name, sets: s.flat() })

const SESSIONS = [
  session('s1', '2026-09-28', 'Push', sets('bench-press', [60, 10], [60, 8])),
  session('s2', '2026-10-05', 'Push', sets('bench-press', [40, 10, 'warmup'], [70, 5]), sets('dips', [0, 12])),
  session('s3', '2026-10-09', 'Legs', sets('back-squat', [100, 5])),
  session('s4', '2026-10-09', 'Arms', sets('dips', [0, 15])),
]

const open = async (store: WorkoutStore = memoryWorkoutStore({ sessions: SESSIONS })) => {
  render(<Workouts store={store} today={TODAY} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Records and progress' }))
  return store
}

describe('records and strength graphs (T-044)', () => {
  it('1. the calendar marks the days trained this month and moves between months', async () => {
    await open()
    const cal = screen.getByRole('region', { name: 'Workout calendar' })
    expect(within(cal).getByRole('heading', { name: 'October 2026' })).toBeTruthy()
    expect(await within(cal).findByText('3 workouts in October 2026.')).toBeTruthy()
    expect(within(cal).getByRole('button', { name: /Friday, 9 October: 2 workouts/ })).toBeTruthy()
    expect(within(cal).getByRole('button', { name: /Monday, 5 October: 1 workout$/ })).toBeTruthy()
    // Months to come can't be opened.
    expect((within(cal).getByRole('button', { name: 'Month after' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(within(cal).getByRole('button', { name: 'Month before' }))
    expect(await within(cal).findByText('1 workout in September 2026.')).toBeTruthy()
    expect(within(cal).getByRole('button', { name: /28 September: 1 workout/ })).toBeTruthy()
  })

  it('2. tapping a marked day shows its workouts', async () => {
    await open()
    fireEvent.click(await screen.findByRole('button', { name: /Friday, 9 October/ }))
    const list = screen.getByRole('list', { name: /Workouts on Friday, 9 October/ })
    expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Legs · 1 exercise', 'Arms · 1 exercise'])
  })

  it('3. lists the exercises done in the last year, the latest first', async () => {
    await open()
    const section = screen.getByRole('region', { name: 'Your exercises' })
    const buttons = await within(section).findAllByRole('button')
    expect(buttons.map((b) => b.textContent)).toEqual([
      'Back squatLast done 9 Oct · 1 workout',
      'DipsLast done 9 Oct · 2 workouts',
      'Bench press (barbell)Last done 5 Oct · 2 workouts',
    ])
  })

  it('4, 5. an exercise shows its records, heaviest for each number of reps and a graph', async () => {
    await open()
    fireEvent.click(await screen.findByRole('button', { name: /^Bench press \(barbell\)/ }))
    const page = await screen.findByRole('region', { name: 'Records for Bench press (barbell)' })
    await within(page).findByRole('table', { name: 'Heaviest for each number of reps' })
    const records = within(page).getAllByRole('definition').map((d) => d.textContent)
    // The 40 kg warm-up is left out. 60 × 10 → 80 kg; 70 × 5 → 81.5 kg.
    expect(records).toEqual(['70 kg × 5 · 5 Oct', '81.5 kg · from 70 kg × 5 · 5 Oct', '10 at 60 kg · 28 Sept'])
    const table = within(page).getByRole('table', { name: 'Heaviest for each number of reps' })
    expect(within(table).getAllByRole('row').slice(1).map((r) => r.textContent)).toEqual([
      '170 kg5 Oct',
      '270 kg5 Oct',
      '370 kg5 Oct',
      '570 kg5 Oct',
      '860 kg28 Sept',
      '1060 kg28 Sept',
    ])
    expect(within(page).getByRole('img', { name: /Best estimated one-rep max in each workout, from 80 kg on 28 Sept to 81.5 kg on 5 Oct/ })).toBeTruthy()
    expect(within(page).getByText('Estimated from sets of 12 reps or fewer. Higher reps give a poor guess.')).toBeTruthy()
    click('← All exercises')
    expect(await screen.findByRole('region', { name: 'Your exercises' })).toBeTruthy()
  })

  it('5. an exercise done with no weight shows the most reps', async () => {
    await open()
    fireEvent.click(await screen.findByRole('button', { name: /^Dips/ }))
    const page = await screen.findByRole('region', { name: 'Records for Dips' })
    expect(await within(page).findByRole('img', { name: /Most reps in a set in each workout, from 12 reps .* to 15 reps/ })).toBeTruthy()
    expect(within(page).queryByRole('table')).toBeNull()
  })

  it('6. the plate calculator shows the plates for each side and the closest lower weight', async () => {
    await open()
    type('Weight to lift (kg)', '102.5')
    const calc = screen.getByRole('region', { name: 'Plate calculator' })
    expect(within(calc).getByRole('status').textContent).toBe('Each side: 25 + 15 + 1.25 kg. ')
    fireEvent.click(within(calc).getByRole('button', { name: '15 kg bar' }))
    type('Weight to lift (kg)', '36')
    expect(within(calc).getByRole('status').textContent).toBe('Each side: 10 kg. 36 kg can’t be loaded exactly. The closest lower weight is 35 kg.')
  })

  it('7. a barbell exercise in a workout shows the plates for the weight entered', async () => {
    const store = memoryWorkoutStore()
    render(<Workouts store={store} today={TODAY} />)
    click('Start a workout')
    click('Empty workout')
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    type('Search exercises', 'bench press')
    click(/^Bench press \(barbell\)/)
    type('Bench press (barbell) weight (kg)', '80')
    expect(screen.getByText('Each side of a 20 kg bar: 25 + 5 kg.')).toBeTruthy()
    // Not for dumbbells.
    click('+ Add exercise')
    type('Search exercises', 'dumbbell bench')
    click(/^Dumbbell bench press/)
    type('Dumbbell bench press weight (kg)', '30')
    expect(screen.queryByText(/Each side of a 20 kg bar: 5 kg/)).toBeNull()
  })

  it('records need a connection and say so', async () => {
    const store = memoryWorkoutStore({ sessions: SESSIONS })
    await open({ ...store, exerciseHistory: () => Promise.reject(new TypeError('Failed to fetch')) })
    fireEvent.click(await screen.findByRole('button', { name: /^Back squat/ }))
    expect(await screen.findByText('Couldn’t load your records. Check your connection.')).toBeTruthy()
  })

  it('says what to do with no workouts yet', async () => {
    await open(memoryWorkoutStore())
    expect(await screen.findByText('Log a workout to see your records.')).toBeTruthy()
    expect(await screen.findByText('0 workouts in October 2026.')).toBeTruthy()
  })
})
