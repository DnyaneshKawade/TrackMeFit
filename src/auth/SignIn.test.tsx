// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SignIn } from './SignIn'
import { AppShell } from '../App'
import type { Account, AuthService } from './types'
import { checkEmail, checkName, checkPassword } from './validate'
import { friendlyAuthError } from './types'

afterEach(cleanup)

function fakeAuth(overrides: Partial<AuthService> = {}): AuthService {
  return {
    signUp: vi.fn().mockResolvedValue({ needsEmailConfirm: true }),
    signIn: vi.fn().mockResolvedValue(undefined),
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    chooseRole: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    current: vi.fn().mockResolvedValue(null),
    onChange: vi.fn().mockReturnValue(() => {}),
    ...overrides,
  }
}

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('form checks', () => {
  it('checks emails', () => {
    expect(checkEmail('')).toMatch(/enter/i)
    expect(checkEmail('dk@gmail')).toMatch(/doesn’t look right/)
    expect(checkEmail(' dk@gmail.com ')).toBeNull()
  })
  it('asks for 8+ characters with letters and a number', () => {
    expect(checkPassword('abc1')).toMatch(/8 characters/)
    expect(checkPassword('abcdefgh')).toMatch(/number/)
    expect(checkPassword('roti4life')).toBeNull()
  })
  it('requires a name', () => {
    expect(checkName('  ')).toMatch(/name/)
    expect(checkName('Asha')).toBeNull()
  })
  it('turns service errors into plain words', () => {
    expect(friendlyAuthError(new Error('Invalid login credentials'))).toBe('Email or password is wrong.')
    expect(friendlyAuthError(new Error('User already registered'))).toMatch(/already has an account/)
    expect(friendlyAuthError(new Error('weird'))).toMatch(/try again/)
  })
  it('says why sign-up failed when email sending or account set-up fails', () => {
    expect(friendlyAuthError(new Error('Error sending confirmation email'))).toMatch(/couldn’t send the email/)
    expect(friendlyAuthError(new Error('Email address "a@b.in" not authorized'))).toMatch(/couldn’t send the email/)
    expect(friendlyAuthError(new Error('Database error saving new user'))).toMatch(/couldn’t set up your account/)
    expect(friendlyAuthError(new Error('Signups not allowed for this instance'))).toMatch(/use Google/)
    expect(friendlyAuthError(new Error('Password should be at least 6 characters.'))).toMatch(/stronger password/)
  })
  it('says the email limit is reached instead of asking to wait a minute', () => {
    expect(friendlyAuthError(new Error('email rate limit exceeded'))).toBe('We’ve sent too many emails this hour. Please try again later, or use Google.')
    expect(friendlyAuthError(new Error('Request rate limit reached'))).toMatch(/wait a minute/)
  })
  it('shows the service code when the error is unknown', () => {
    expect(friendlyAuthError(Object.assign(new Error('odd'), { code: 'unexpected_failure' }))).toBe('Something went wrong (unexpected_failure). Please try again.')
    expect(friendlyAuthError(Object.assign(new Error('odd'), { code: '<b>' }))).toBe('Something went wrong. Please try again.')
  })
})

describe('sign-in screen', () => {
  it('signs in with email and password', async () => {
    const auth = fakeAuth()
    render(<SignIn auth={auth} />)
    type('Email', 'dk@gmail.com')
    type('Password', 'roti4life')
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in', hidden: false }).closest('form')!)
    await waitFor(() => expect(auth.signIn).toHaveBeenCalledWith('dk@gmail.com', 'roti4life'))
  })

  it('shows field errors and does not call the service', async () => {
    const auth = fakeAuth()
    render(<SignIn auth={auth} />)
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!)
    expect(await screen.findByText('Enter your email.')).toBeTruthy()
    expect(screen.getByText('Enter your password.')).toBeTruthy()
    expect(auth.signIn).not.toHaveBeenCalled()
  })

  it('shows a plain message when sign-in fails', async () => {
    const auth = fakeAuth({ signIn: vi.fn().mockRejectedValue(new Error('Invalid login credentials')) })
    render(<SignIn auth={auth} />)
    type('Email', 'dk@gmail.com')
    type('Password', 'wrongpass1')
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!)
    expect((await screen.findByRole('alert')).textContent).toBe('Email or password is wrong.')
  })

  it('creates a coach account with the coach role', async () => {
    const auth = fakeAuth()
    render(<SignIn auth={auth} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Create account' }))
    fireEvent.click(screen.getByLabelText(/A coach/))
    type('Your name', 'Coach K')
    type('Email', 'k@coach.in')
    type('Password', 'squat4ever')
    click('Create account')
    await waitFor(() =>
      expect(auth.signUp).toHaveBeenCalledWith({ email: 'k@coach.in', password: 'squat4ever', name: 'Coach K', role: 'coach' }),
    )
    expect((await screen.findByRole('status')).textContent).toMatch(/confirm your account/)
  })

  it('1. offers Google to coaches too, saying the role is picked next (T-066)', () => {
    render(<SignIn auth={fakeAuth()} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Create account' }))
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy()
    fireEvent.click(screen.getByLabelText(/A coach/))
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy()
    expect(screen.getByText('With Google, you pick coach or not on the next screen.')).toBeTruthy()
  })

  it('asks for a stronger password when creating an account', async () => {
    const auth = fakeAuth()
    render(<SignIn auth={auth} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Create account' }))
    type('Your name', 'Asha')
    type('Email', 'asha@gmail.com')
    type('Password', 'short')
    click('Create account')
    expect(await screen.findByText('Use at least 8 characters.')).toBeTruthy()
    expect(auth.signUp).not.toHaveBeenCalled()
  })

  it('sends a password reset link', async () => {
    const auth = fakeAuth()
    render(<SignIn auth={auth} />)
    click('Forgot password?')
    type('Email', 'dk@gmail.com')
    click('Send reset link')
    await waitFor(() => expect(auth.resetPassword).toHaveBeenCalledWith('dk@gmail.com'))
    expect((await screen.findByRole('status')).textContent).toMatch(/reset link/)
  })
})

describe('Google sign-up picks a role (T-066)', () => {
  const google: Account = { id: 'g1', email: 'meera@gmail.com', name: 'Meera Shah', role: 'user', roleChosen: false }

  it('2. a new Google account picks "A coach" once and gets the Clients tab', async () => {
    const auth = fakeAuth({ current: vi.fn().mockResolvedValue(google) })
    render(<AppShell auth={auth} />)
    expect(await screen.findByText('Welcome, Meera. One question first.')).toBeTruthy()
    fireEvent.click(screen.getByLabelText(/A coach/))
    click('Continue')
    await waitFor(() => expect(auth.chooseRole).toHaveBeenCalledWith('coach'))
    expect(await screen.findByRole('tab', { name: 'Clients' })).toBeTruthy()
    click('Open Me')
    expect(await screen.findByText('Meera Shah (coach)')).toBeTruthy()
  })

  it('3. "Tracking my own fitness" goes on to the first-run questions; a failed save says so', async () => {
    const auth = fakeAuth({
      current: vi.fn().mockResolvedValue(google),
      chooseRole: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined),
    })
    render(<AppShell auth={auth} />)
    await screen.findByText(/One question first/)
    click('Continue')
    expect((await screen.findByRole('alert')).textContent).toMatch(/Couldn’t save/)
    click('Continue')
    await waitFor(() => expect(auth.chooseRole).toHaveBeenLastCalledWith('user'))
    await waitFor(() => expect(screen.queryByText(/One question first/)).toBeNull())
    expect(screen.queryByRole('tab', { name: 'Clients' })).toBeNull()
  })

  it('4. accounts that already have a role never see the question', async () => {
    render(<AppShell auth={fakeAuth({ current: vi.fn().mockResolvedValue({ ...google, roleChosen: undefined }) })} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Open Me' }))
    expect(await screen.findByText(/Meera Shah/)).toBeTruthy()
    expect(screen.queryByText(/One question first/)).toBeNull()
  })
})

describe('app shell', () => {
  it('explains when the database is not connected', () => {
    render(<AppShell auth={null} />)
    expect(screen.getByText(/isn’t connected/)).toBeTruthy()
  })

  it('shows the sign-in screen when signed out and the account when signed in', async () => {
    const coach: Account = { id: '1', email: 'k@coach.in', name: 'Coach K', role: 'coach' }
    const { unmount } = render(<AppShell auth={fakeAuth()} />)
    expect(await screen.findByRole('tab', { name: 'Sign in' })).toBeTruthy()
    unmount()
    render(<AppShell auth={fakeAuth({ current: vi.fn().mockResolvedValue(coach) })} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Open Me' }))
    expect((await screen.findByText(/Coach K/)).textContent).toBe('Coach K (coach)')
    fireEvent.click(screen.getByRole('tab', { name: 'Today' }))
    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
  })

  it('6. gives coaches a Clients tab (T-026a)', async () => {
    const coach: Account = { id: '1', email: 'k@coach.in', name: 'Coach K', role: 'coach' }
    render(<AppShell auth={fakeAuth({ current: vi.fn().mockResolvedValue(coach) })} />)
    fireEvent.click(await screen.findByRole('tab', { name: 'Clients' }))
    expect(await screen.findByRole('button', { name: 'Invite a client' })).toBeTruthy()
    expect(await screen.findByText('No clients yet. Send a code to someone you coach.')).toBeTruthy()
  })
})

describe('privacy policy link (T-077)', () => {
  it('2. sign-in and sign-up both link to the privacy policy', () => {
    render(<SignIn auth={fakeAuth()} />)
    const link = () => screen.getByRole('link', { name: 'Privacy policy' }) as HTMLAnchorElement
    expect(link().getAttribute('href')).toBe('/privacy.html')
    fireEvent.click(screen.getByRole('tab', { name: 'Create account' }))
    expect(link().getAttribute('href')).toBe('/privacy.html')
    expect(screen.getByText(/See what we keep and why/)).toBeTruthy()
  })
})
