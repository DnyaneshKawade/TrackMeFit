// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { AppShell } from './App'
import type { Account, AuthService } from './auth/types'
import { memoryProfileStore } from './profile/stores'
import { HEALTH_QUESTIONS, type ProfileInfo } from './profile/types'
import { memoryProgressStore } from './progress/stores'

afterEach(cleanup)

const user: Account = { id: 'u1', email: 'asha@gmail.com', name: 'Asha', role: 'user' }
const auth = (account: Account): AuthService => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
  resetPassword: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  current: vi.fn().mockResolvedValue(account),
  onChange: vi.fn().mockReturnValue(() => {}),
})
const done: Partial<ProfileInfo> = {
  fullName: 'Asha',
  sex: 'female',
  birthDate: '1995-06-15',
  heightCm: 160,
  activity: 'desk',
  trainingDays: 3,
  experience: 'beginner',
  goal: 'lose',
  dietPref: 'veg',
}
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const pick = (group: string, option: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: group })).getByRole('button', { name: option }))

describe('first run', () => {
  it('asks a new user the onboarding questions once, then opens the app with a first weigh-in', async () => {
    const profiles = memoryProfileStore()
    const progress = memoryProgressStore()
    render(<AppShell auth={auth(user)} profileStoreFor={() => profiles} progressStoreFor={() => progress} />)

    expect(await screen.findByRole('heading', { name: 'About you' })).toBeTruthy()
    expect((screen.getByLabelText('Your name') as HTMLInputElement).value).toBe('Asha')
    pick('Sex', 'Female')
    type('Date of birth', '1995-06-15')
    type('Height (cm)', '160')
    type('Weight today (kg)', '64.5')
    click('Next')
    pick('On a normal day you are', 'Mostly sitting')
    pick('Workouts a week', '3')
    pick('Lifting experience', 'New to lifting')
    click('Next')
    pick('Your main goal', 'Lose fat')
    pick('What you eat', 'Vegetarian')
    click('Next')
    for (const q of HEALTH_QUESTIONS) pick(q.label, 'No')
    click('Start tracking')

    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
    expect((await profiles.get()).goal).toBe('lose')
    expect((await progress.weighIns()).map((w) => w.kg)).toEqual([64.5])

    fireEvent.click(screen.getByRole('tab', { name: 'Progress' }))
    expect(await screen.findByText('64.5 kg')).toBeTruthy()
  })

  it('skips onboarding for people who finished it', async () => {
    render(<AppShell auth={auth(user)} profileStoreFor={() => memoryProfileStore(done)} />)
    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'About you' })).toBeNull()
  })

  it('lets someone sign out from onboarding', async () => {
    const a = auth(user)
    render(<AppShell auth={a} />)
    await screen.findByRole('heading', { name: 'About you' })
    click('Sign out')
    expect(a.signOut).toHaveBeenCalled()
  })

  it('opens the app anyway if the profile can’t be loaded', async () => {
    const broken = { get: vi.fn().mockRejectedValue(new Error('offline')), save: vi.fn() }
    render(<AppShell auth={auth(user)} profileStoreFor={() => broken} />)
    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
  })
})
