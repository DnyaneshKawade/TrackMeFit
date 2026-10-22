// @vitest-environment jsdom
// Small motion and a short buzz for wins, with an off switch (spec T-157).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { applyMotion, buzzForWin, motionOn, readMotion, saveMotion, WIN_BUZZ } from './motion'
import { Account } from '../account/Account'
import { memoryDataStore } from '../account/data'
import { Workouts } from '../training/Workouts'
import { memoryWorkoutStore } from '../training/memoryStore'

afterEach(() => {
  cleanup()
  localStorage.clear()
  delete document.documentElement.dataset.motion
  vi.restoreAllMocks()
})

/** A window whose phone asks, or not, to reduce motion. */
const phone = (reduce: boolean) => {
  const vibrate = vi.fn()
  const win = { matchMedia: (q: string) => ({ matches: reduce && q.includes('reduce') }), navigator: { vibrate } } as unknown as Window
  return { win, vibrate }
}

describe('motion for wins (T-157)', () => {
  it('1. is on at first; the choice is kept and marks the page', () => {
    expect(readMotion()).toBe('on')
    saveMotion('off')
    expect(readMotion()).toBe('off')
    applyMotion('off')
    expect(document.documentElement.dataset.motion).toBe('off')
    saveMotion('on')
    applyMotion('on')
    expect(readMotion()).toBe('on')
    expect(document.documentElement.dataset.motion).toBeUndefined()
  })

  it('2. the phone’s "reduce motion" always wins, and the buzz is under half a second', () => {
    expect(motionOn(phone(false).win)).toBe(true)
    expect(motionOn(phone(true).win)).toBe(false)
    const quiet = phone(true)
    buzzForWin(quiet.win)
    expect(quiet.vibrate).not.toHaveBeenCalled()
    const on = phone(false)
    buzzForWin(on.win)
    expect(on.vibrate).toHaveBeenCalledWith(WIN_BUZZ)
    expect(WIN_BUZZ.reduce((a, b) => a + b, 0)).toBeLessThan(500)
    saveMotion('off')
    const off = phone(false)
    buzzForWin(off.win)
    expect(off.vibrate).not.toHaveBeenCalled()
  })

  it('3. the Me tab has an On and Off switch', () => {
    render(<Account store={memoryDataStore()} onBack={() => {}} onDeleted={() => {}} />)
    const group = within(screen.getByRole('group', { name: 'Moves and buzz for wins' }))
    expect(group.getByRole('button', { name: 'On' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(group.getByRole('button', { name: 'Off' }))
    expect(readMotion()).toBe('off')
    expect(document.documentElement.dataset.motion).toBe('off')
  })

  it('4. a new record buzzes the phone', async () => {
    const vibrate = vi.fn()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
    const past = { id: 's1', performedOn: '2026-10-05', planDayId: null, name: 'Push', sets: [{ id: 'x1', exerciseId: 'bench-press', setIndex: 0, weightKg: 70, reps: 5, rir: null }] }
    render(<Workouts store={memoryWorkoutStore({ sessions: [past] })} today="2026-10-12" />)
    fireEvent.click(screen.getByRole('button', { name: 'Start a workout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Empty workout' }))
    fireEvent.click(await screen.findByRole('button', { name: '+ Add exercise' }))
    fireEvent.change(screen.getByLabelText('Search exercises'), { target: { value: 'bench press' } })
    fireEvent.click(screen.getByRole('button', { name: /^Bench press \(barbell\)/ }))
    await screen.findByText(/Last time/)
    fireEvent.change(screen.getByLabelText('Bench press (barbell) weight (kg)'), { target: { value: '72.5' } })
    fireEvent.change(screen.getByLabelText('Bench press (barbell) reps'), { target: { value: '5' } })
    fireEvent.click(within(screen.getByRole('region', { name: 'Bench press (barbell)' })).getByRole('button', { name: 'Log set' }))
    await screen.findByText(/New record/)
    await waitFor(() => expect(vibrate).toHaveBeenCalledWith(WIN_BUZZ))
  })
})
