// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { ViewBar } from './ViewBar'
import { memoryViewing, VIEW_IDLE_MS, type ViewMarker } from './viewing'
import { AppShell } from '../App'
import type { Account, AuthService } from '../auth/types'
import { memoryProfileStore } from '../profile/stores'
import { People } from './People'
import { memoryAdmin, type PersonRow } from './service'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const START = Date.parse('2026-10-18T10:00:00Z')
const MIN = 60_000
const marker = (lastActive = START): ViewMarker => ({ viewId: 'v1', name: 'Asha', adminAccess: 'a', adminRefresh: 'r', lastActive })

/** A bar with a clock the test moves. */
function bar(m = marker()) {
  vi.useFakeTimers()
  let clock = START
  const exits: (number | undefined)[] = []
  const ends: boolean[] = []
  const viewing = memoryViewing(m, (last) => exits.push(last))
  render(<ViewBar viewing={viewing} marker={m} onEnd={(idle) => ends.push(idle)} now={() => clock} />)
  const at = async (minutes: number) => {
    clock = START + minutes * MIN
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })
  }
  return { viewing, exits, ends, at, tap: () => fireEvent.pointerDown(window) }
}

describe('view bar (T-042a4)', () => {
  it('4. the app runs as the person with a bar on top and Exit', async () => {
    const account: Account = { id: 'asha', email: 'asha@example.com', name: 'Asha', role: 'user' }
    const auth: AuthService = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      chooseRole: vi.fn(),
      resetPassword: vi.fn(),
      signOut: vi.fn(),
      current: vi.fn().mockResolvedValue(account),
      onChange: vi.fn().mockReturnValue(() => {}),
    }
    const profiles = memoryProfileStore({ onboardedAt: '2026-10-12T10:00:00Z' })
    render(<AppShell auth={auth} profileStoreFor={() => profiles} viewing={memoryViewing(marker(Date.now()))} />)
    expect((await screen.findByRole('status', { name: 'Viewing as' })).textContent).toContain('Viewing as Asha')
    expect(screen.getByRole('button', { name: 'Exit' })).toBeTruthy()
    // Sign out would end the person's sign-in, so only Exit shows.
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull()
  })

  it('5. after 30 minutes with no tap or key press the view ends; activity resets the 30 minutes', async () => {
    const b = bar()
    await b.at(20)
    b.tap()
    // Activity is saved on the device too, so a reload knows.
    expect(b.viewing.marker()?.lastActive).toBe(START + 20 * MIN)
    await b.at(45)
    expect(b.exits).toEqual([])
    fireEvent.keyDown(window, { key: 'a' })
    await b.at(74)
    expect(b.exits).toEqual([])
    await b.at(75)
    expect(b.exits).toEqual([START + 45 * MIN])
    expect(b.ends).toEqual([true])
    expect(b.viewing.marker()).toBeNull()
  })

  it('6. Exit ends the view and signs the owner back in', async () => {
    const b = bar()
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(b.exits).toEqual([undefined])
    expect(b.ends).toEqual([false])
  })

  it('7. an old view left over ends at once when the app opens', async () => {
    const b = bar(marker(START - VIEW_IDLE_MS - MIN))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(b.exits).toEqual([START - VIEW_IDLE_MS - MIN])
    expect(b.ends).toEqual([true])
  })

  it('1. the People page starts a view with a reason', async () => {
    const asha: PersonRow = {
      userId: 'asha',
      email: 'asha@example.com',
      phone: '',
      name: 'Asha',
      role: 'user',
      joinedAt: '2026-10-12T10:00:00Z',
      lastActiveAt: null,
      blocked: false,
      confirmed: true,
      onboarded: true,
      coachName: null,
      adminLevel: null,
    }
    const dk: PersonRow = { ...asha, userId: 'dk', email: 'dk@example.com', name: 'DK', adminLevel: 'owner' }
    const service = memoryAdmin({ me: 'dk', level: 'owner', step: 'on', people: [asha, dk] })
    render(<People service={service} me="dk" />)
    const row = await screen.findByRole('listitem', { name: 'Asha' })
    expect(screen.getByRole('listitem', { name: 'DK' }).textContent).not.toContain('View as them')
    fireEvent.click(within(row).getByRole('button', { name: 'View as them' }))
    fireEvent.change(within(row).getByLabelText('Reason'), { target: { value: 'Her targets vanished' } })
    fireEvent.click(within(row).getByRole('button', { name: 'View as them' }))
    await vi.waitFor(() => expect(service.log).toEqual(['view as asha Her targets vanished']))
  })
})
