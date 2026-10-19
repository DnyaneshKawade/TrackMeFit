// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { AppShell } from '../App'
import { createSupabaseAuth } from './supabaseAuth'
import type { Account, AuthService } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

// "Forgot password" sets a new password (spec T-085).

afterEach(cleanup)

const user: Account = { id: 'u1', email: 'asha@gmail.com', name: 'Asha', role: 'coach' }
const fakeAuth = (updatePassword = vi.fn().mockResolvedValue(undefined)): AuthService => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
  chooseRole: vi.fn(),
  resetPassword: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  current: vi.fn().mockResolvedValue(user),
  onChange: vi.fn().mockReturnValue(() => {}),
  updatePassword,
  onRecovery: (cb) => {
    queueMicrotask(cb)
    return () => {}
  },
})
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('choose a new password (T-085)', () => {
  it('1. after a reset link the app asks for a new password; 2. a weak or different one is refused', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    render(<AppShell auth={fakeAuth(update)} />)
    expect(await screen.findByRole('heading', { name: 'Choose a new password' })).toBeTruthy()
    type('New password', 'short1')
    type('Type it again', 'short1')
    click('Save new password')
    expect(screen.getByRole('alert').textContent).toBe('Use at least 8 characters.')
    type('New password', 'longer123')
    type('Type it again', 'longer124')
    click('Save new password')
    expect(screen.getByRole('alert').textContent).toBe('The two passwords are not the same.')
    expect(update).not.toHaveBeenCalled()
  })

  it('3. saving sets the password, says so, then opens the app', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    render(<AppShell auth={fakeAuth(update)} />)
    await screen.findByRole('heading', { name: 'Choose a new password' })
    type('New password', 'longer123')
    type('Type it again', 'longer123')
    click('Save new password')
    expect((await screen.findByRole('status')).textContent).toBe('Your new password is saved. Use it next time you sign in.')
    expect(update).toHaveBeenCalledWith('longer123')
    click('Open the app')
    expect(screen.queryByRole('heading', { name: 'Choose a new password' })).toBeNull()
  })

  it('4. the Supabase service reports a recovery from the link or its sign-in event, and saves with updateUser', async () => {
    let listener: (event: string) => void = () => {}
    const updateUser = vi.fn().mockResolvedValue({ error: null })
    const sb = {
      auth: {
        onAuthStateChange: (cb: (event: string) => void) => {
          listener = cb
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
        updateUser,
      },
    } as unknown as SupabaseClient

    window.location.hash = '#access_token=x&type=recovery'
    const fromLink = vi.fn()
    createSupabaseAuth(sb).onRecovery!(fromLink)
    await Promise.resolve()
    expect(fromLink).toHaveBeenCalledTimes(1)

    window.location.hash = ''
    const fromEvent = vi.fn()
    const auth = createSupabaseAuth(sb)
    auth.onRecovery!(fromEvent)
    await Promise.resolve()
    expect(fromEvent).not.toHaveBeenCalled()
    listener('SIGNED_IN')
    listener('PASSWORD_RECOVERY')
    expect(fromEvent).toHaveBeenCalledTimes(1)

    await auth.updatePassword!('longer123')
    expect(updateUser).toHaveBeenCalledWith({ password: 'longer123' })
  })
})
