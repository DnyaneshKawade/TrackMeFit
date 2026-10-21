// @vitest-environment jsdom
// Share a workout as text (spec T-121).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Workouts } from './Workouts'
import { memoryWorkoutStore } from './memoryStore'
import type { Session } from './types'

const TODAY = '2026-10-12'
const PAST: Session = {
  id: 's1',
  performedOn: '2026-10-09',
  planDayId: null,
  name: 'Legs',
  sets: [{ id: 'a', exerciseId: 'back-squat', setIndex: 0, weightKg: 100, reps: 5, rir: null, note: 'knee felt odd' }],
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, 'share')
  Reflect.deleteProperty(navigator, 'clipboard')
})

const today = (): Session => ({ ...PAST, id: 's2', performedOn: TODAY, name: 'Push', sets: [{ id: 'b', exerciseId: 'bench-press', setIndex: 0, weightKg: 60, reps: 10, rir: 2 }] })

describe('share a workout (T-121)', () => {
  it('5. Share workout opens the phone share sheet with the workout text', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    render(<Workouts store={memoryWorkoutStore({ sessions: [today()] })} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Push/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Share workout' }))
    await vi.waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    const text = share.mock.calls[0][0].text as string
    expect(text.split('\n')[0]).toBe('Push · 12 Oct 2026')
    expect(text).toContain('1. 60 kg × 10 · 2 reps left')
  })

  it('6. without a share sheet, the text is copied and the app says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<Workouts store={memoryWorkoutStore({ sessions: [today()] })} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Push/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Share workout' }))
    expect(await screen.findByText('Copied. Paste it in WhatsApp or any chat.')).toBeTruthy()
    expect(writeText.mock.calls[0][0]).toContain('Bench press')
  })

  it('7. a past workout can be shared from its day in the calendar, without its notes', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<Workouts store={memoryWorkoutStore({ sessions: [PAST] })} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Records and progress' }))
    fireEvent.click(await screen.findByRole('button', { name: /Friday, 9 October/ }))
    const list = screen.getByRole('list', { name: /Workouts on Friday, 9 October/ })
    fireEvent.click(within(list).getByRole('button', { name: 'Share Legs on Friday, 9 October' }))
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    expect(writeText.mock.calls[0][0]).toContain('Legs · 9 Oct 2026')
    expect(writeText.mock.calls[0][0]).toContain('1. 100 kg × 5')
    expect(writeText.mock.calls[0][0]).not.toContain('knee')
  })

  it('8. a failed copy says so in plain words', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('no')) }, configurable: true })
    render(<Workouts store={memoryWorkoutStore({ sessions: [today()] })} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Push/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Share workout' }))
    expect(await screen.findByText('Couldn’t share it. Check your connection and try again.')).toBeTruthy()
  })
})
