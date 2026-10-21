// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
    expect(within(page).getByText('Worked out from sets of 12 reps or fewer. Higher reps give a poor guess.')).toBeTruthy()
    fireEvent.click(within(page).getByRole('button', { name: 'Graph' }))
    expect(within(page).getByRole('img', { name: /One-rep max guess in each workout, from 80 kg on 28 Sept to 81.5 kg on 5 Oct/ })).toBeTruthy()
    click('← All exercises')
    expect(await screen.findByRole('region', { name: 'Your exercises' })).toBeTruthy()
  })

  it('5. an exercise done with no weight shows the most reps', async () => {
    await open()
    fireEvent.click(await screen.findByRole('button', { name: /^Dips/ }))
    const page = await screen.findByRole('region', { name: 'Records for Dips' })
    fireEvent.click(await within(page).findByRole('button', { name: 'Graph' }))
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

describe('"New record" during a workout (T-044b)', () => {
  const start = async (store: WorkoutStore, name: RegExp, label: string) => {
    render(<Workouts store={store} today={TODAY} />)
    click('Start a workout')
    click('Empty workout')
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    type('Search exercises', label)
    click(name)
  }
  const logSet = async (name: string, weight: string, reps: string) => {
    type(`${name} weight (kg)`, weight)
    type(`${name} reps`, reps)
    const before = screen.queryAllByText(/^Set \d+:/).length
    fireEvent.click(within(screen.getByRole('region', { name })).getByRole('button', { name: 'Log set' }))
    await waitFor(() => expect(screen.queryAllByText(/^Set \d+:/).length).toBe(before + 1))
  }
  const note = () => screen.queryByText(/New record/)?.textContent ?? null

  it('1, 2, 4, 6. heavier sets and a better one-rep max show a note; ties and removed sets do not', async () => {
    await start(memoryWorkoutStore({ sessions: SESSIONS }), /^Bench press \(barbell\)/, 'bench press')
    const name = 'Bench press (barbell)'
    await screen.findByText(/Last time/)
    await logSet(name, '72.5', '5')
    expect(note()).toBe('🏆 New record: heaviest weight. Your best before was 70 kg.')
    // Today's sets count: the same set again is no record.
    await logSet(name, '72.5', '5')
    expect(note()).toBeNull()
    await logSet(name, '70', '8')
    expect(note()).toBe('🏆 New record: best one-rep max guess, 88.5 kg. Your best before was 84.5 kg.')
    click(`Remove set 3 of ${name}`)
    await waitFor(() => expect(note()).toBeNull())
  })

  it('3, 5. more reps with no weight is a record; a warm-up is not', async () => {
    await start(memoryWorkoutStore({ sessions: SESSIONS }), /^Dips/, 'dips')
    await screen.findByText(/Last time/)
    click('Warm-up')
    await logSet('Dips', '0', '20')
    expect(note()).toBeNull()
    await logSet('Dips', '0', '16')
    expect(note()).toBe('🏆 New record: most reps in a set. Your best before was 15.')
  })

  it('5. the first workout with an exercise shows no record', async () => {
    await start(memoryWorkoutStore(), /^Bench press \(barbell\)/, 'bench press')
    await logSet('Bench press (barbell)', '100', '5')
    expect(note()).toBeNull()
  })

  it('offline, the set saves and no record note shows', async () => {
    const store = memoryWorkoutStore({ sessions: SESSIONS })
    await start({ ...store, exerciseHistory: () => Promise.reject(new TypeError('Failed to fetch')) }, /^Bench press \(barbell\)/, 'bench press')
    await screen.findByText(/Last time/)
    await logSet('Bench press (barbell)', '150', '1')
    expect(note()).toBeNull()
  })
})

describe('history and graph for each exercise (T-106)', () => {
  // An older bench workout, outside the last month.
  const withOld = () => memoryWorkoutStore({ sessions: [...SESSIONS, session('s0', '2026-08-01', 'Push', sets('bench-press', [50, 10]))] })
  const openBench = async (store = withOld()) => {
    await open(store)
    fireEvent.click(await screen.findByRole('button', { name: /^Bench press \(barbell\)/ }))
    const page = await screen.findByRole('region', { name: 'Records for Bench press (barbell)' })
    await within(page).findByRole('table')
    return page
  }

  it('1. History lists every workout, newest first, with each set and record marks', async () => {
    const page = await openBench()
    fireEvent.click(within(page).getByRole('button', { name: 'History' }))
    const days = within(page).getAllByRole('heading', { level: 4 }).map((h) => h.textContent)
    expect(days).toEqual(['Monday, 5 October 2026', 'Monday, 28 September 2026', 'Saturday, 1 August 2026'])
    const sets = (day: string) => within(within(page).getByRole('region', { name: day })).getAllByRole('listitem').map((li) => li.textContent)
    // The warm-up is shown but never a record. The first workout only sets the start.
    expect(sets('Monday, 5 October 2026')).toEqual(['40 kg × 10 · warm-up', '70 kg × 5 🏆'])
    expect(sets('Monday, 28 September 2026')).toEqual(['60 kg × 10 🏆', '60 kg × 8'])
    expect(sets('Saturday, 1 August 2026')).toEqual(['50 kg × 10'])
  })

  it('2. the graph can show other measures and time ranges', async () => {
    const page = await openBench()
    fireEvent.click(within(page).getByRole('button', { name: 'Graph' }))
    // Three months back by default, so 1 August is in.
    expect(within(page).getByRole('img', { name: /^One-rep max guess in each workout, from 66.5 kg on 1 Aug to 81.5 kg on 5 Oct/ })).toBeTruthy()
    fireEvent.click(within(page).getByRole('button', { name: '1 month' }))
    expect(within(page).getByRole('img', { name: /from 80 kg on 28 Sept to 81.5 kg/ })).toBeTruthy()
    fireEvent.change(within(page).getByLabelText('Graph shows'), { target: { value: 'volume' } })
    // 60 × 10 + 60 × 8 = 1080; the warm-up is left out on 5 Oct.
    expect(within(page).getByRole('img', { name: /^Total volume \(all sets\) in each workout, from 1080 kg on 28 Sept to 350 kg on 5 Oct/ })).toBeTruthy()
    fireEvent.change(within(page).getByLabelText('Graph shows'), { target: { value: 'totalReps' } })
    expect(within(page).getByRole('img', { name: /^Total reps in each workout, from 18 reps .* to 5 reps/ })).toBeTruthy()
    // Warm-ups are not counted as sets (T-122).
    fireEvent.change(within(page).getByLabelText('Graph shows'), { target: { value: 'sets' } })
    expect(within(page).getByRole('img', { name: /^Total sets in each workout, from 2 sets on 28 Sept to 1 set on 5 Oct/ })).toBeTruthy()
  })

  it('3. tapping a workout shows its sets', async () => {
    const page = await openBench()
    fireEvent.click(within(page).getByRole('button', { name: 'Graph' }))
    const list = within(page).getByRole('list', { name: 'Each workout' })
    fireEvent.click(within(list).getByRole('button', { name: /5 Oct/ }))
    expect(within(list).getByRole('status').textContent).toBe('40 kg × 10 (warm-up), 70 kg × 5')
  })

  it('4. with no weight, every choice still shows and the empty one says why (T-122)', async () => {
    await open()
    fireEvent.click(await screen.findByRole('button', { name: /^Dips/ }))
    const page = await screen.findByRole('region', { name: 'Records for Dips' })
    fireEvent.click(await within(page).findByRole('button', { name: 'Graph' }))
    const options = within(within(page).getByLabelText('Graph shows')).getAllByRole('option').map((o) => o.textContent)
    expect(options).toEqual(['One-rep max guess', 'Heaviest weight', 'Most reps in a set', 'Best set volume (weight × reps)', 'Total volume (all sets)', 'Total reps', 'Total sets'])
    expect((within(page).getByLabelText('Graph shows') as HTMLSelectElement).value).toBe('reps')
    fireEvent.change(within(page).getByLabelText('Graph shows'), { target: { value: 'volume' } })
    expect(within(page).getByText('Nothing to show yet. Log a set with weight to see this.')).toBeTruthy()
  })

  it('5. a workout opens an exercise’s history and goes back with typed weights kept', async () => {
    render(<Workouts store={withOld()} today={TODAY} />)
    click('Start a workout')
    click('Empty workout')
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    type('Search exercises', 'bench press')
    click(/^Bench press \(barbell\)/)
    type('Bench press (barbell) weight (kg)', '72.5')
    click('History and graph for Bench press (barbell)')
    const page = await screen.findByRole('region', { name: 'Records for Bench press (barbell)' })
    fireEvent.click(await within(page).findByRole('button', { name: 'History' }))
    expect(within(page).getAllByRole('heading', { level: 4 })).toHaveLength(3)
    click('← Back to workout')
    expect(screen.queryByRole('region', { name: 'Records for Bench press (barbell)' })).toBeNull()
    expect((screen.getByLabelText('Bench press (barbell) weight (kg)') as HTMLInputElement).value).toBe('72.5')
  })
})
