// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { AppShell } from './App'
import type { Account, AuthService } from './auth/types'
import { memoryProfileStore } from './profile/stores'
import { ageOn, type ProfileInfo } from './profile/types'
import { memoryTargetStore } from './targets/stores'
import { memoryProgressStore } from './progress/stores'
import { memoryFamilyStore } from './family/family'
import { localDate } from './log/types'

afterEach(cleanup)

const user: Account = { id: 'u1', email: 'asha@gmail.com', name: 'Asha', role: 'user' }
const auth = (account: Account): AuthService => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
  chooseRole: vi.fn().mockResolvedValue(undefined),
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
  onboardedAt: '2026-10-12T10:00:00Z',
}
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
/** The age question everyone answers once (T-086). */
const answerAge = async (date = '1995-06-15') => {
  fireEvent.change(await screen.findByLabelText('Date of birth'), { target: { value: date } })
  click('Continue')
}
const pick = (group: string, option: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: group })).getByRole('button', { name: option }))

describe('first run', () => {
  it('asks a new user the onboarding questions once, then opens the app with a first weigh-in and accepted targets', async () => {
    const profiles = memoryProfileStore()
    const progress = memoryProgressStore()
    const targets = memoryTargetStore('u1')
    render(<AppShell auth={auth(user)} profileStoreFor={() => profiles} progressStoreFor={() => progress} targetStoreFor={() => targets} />)

    // No separate age step: the birth date is asked in About you (T-105).
    expect(await screen.findByRole('heading', { name: 'About you' })).toBeTruthy()
    expect(screen.queryByRole('form', { name: 'Your age' })).toBeNull()
    expect((screen.getByLabelText('Your name') as HTMLInputElement).value).toBe('Asha')
    pick('Sex', 'Female')
    type('Date of birth', '1995-06-15')
    type('Height (cm)', '160')
    type('Weight today (kg)', '64.5')
    type('Waist at the belly button (cm, optional)', '82')
    click('Next')
    await screen.findByRole('group', { name: 'Health conditions' })
    pick('Health conditions', 'None of these')
    click('Next')
    pick('On a normal day you are', 'Mostly sitting')
    pick('Workouts a week', '3')
    pick('Lifting experience', 'New, or under a year')
    pick('Where you train', 'A gym')
    click('Next')
    pick('Your main goal', 'Lose fat')
    click('Next')
    pick('What you eat', 'Vegetarian')
    click('Next')
    click('Skip this step')
    click('Use these targets')

    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
    expect((await profiles.get()).goal).toBe('lose')
    expect((await progress.weighIns()).map((w) => w.kg)).toEqual([64.5])
    expect((await progress.measurements())[0].waistCm).toBe(82)
    const t = await targets.forDate('2999-01-01')
    expect(t).toMatchObject({ source: 'suggested', proteinG: 90 }) // 1.4 g per kg of the weight at BMI 25

    fireEvent.click(screen.getByRole('tab', { name: 'Progress' }))
    expect(await screen.findByText('64.5 kg')).toBeTruthy()
  })

  it('remembers a skip so onboarding doesn’t come back', async () => {
    const profiles = memoryProfileStore()
    const { unmount } = render(<AppShell auth={auth(user)} profileStoreFor={() => profiles} />)
    fireEvent.change(await screen.findByLabelText('Date of birth'), { target: { value: '1995-06-15' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Skip setup and start logging' }))
    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
    unmount()
    render(<AppShell auth={auth(user)} profileStoreFor={() => profiles} />)
    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
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
    click('Open Me')
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
    // This phone only (T-090).
    expect(a.signOut).toHaveBeenCalledWith()
  })

  it('opens the app anyway if the profile can’t be loaded', async () => {
    const broken = { get: vi.fn().mockRejectedValue(new Error('offline')), save: vi.fn(), saveBirthDate: vi.fn() }
    render(<AppShell auth={auth(user)} profileStoreFor={() => broken} />)
    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
  })
})

describe('your details (T-070)', () => {
  const start = () => {
    const profiles = memoryProfileStore({ ...done, equipment: 'gym' })
    const progress = memoryProgressStore([{ date: '2026-10-12', kg: 70 }])
    const targets = memoryTargetStore('u1')
    render(<AppShell auth={auth(user)} profileStoreFor={() => profiles} progressStoreFor={() => progress} targetStoreFor={() => targets} />)
    return { profiles, progress, targets }
  }

  it('1. opens the sign-up answers filled in, and saves a change without new targets or a new weigh-in', async () => {
    const { profiles, progress, targets } = start()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Me' }))
    fireEvent.click(await screen.findByRole('button', { name: 'See and change your details' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Change About you' }))
    expect(await screen.findByRole('heading', { name: 'About you' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Skip setup and start logging' })).toBeNull()
    expect((screen.getByLabelText('Weight today (kg)') as HTMLInputElement).value).toBe('70')
    expect((screen.getByLabelText('Height (cm)') as HTMLInputElement).value).toBe('160')
    type('Height (cm)', '165')
    click('Next')
    // Earlier health answers count, so the step goes straight on.
    click('Next')
    click('Save and close')

    // Back on the details page, with the new answer.
    const about = await screen.findByRole('region', { name: 'About you' })
    expect(about.textContent).toContain('Height165 cm')
    click('Back')
    expect(await screen.findByRole('heading', { name: 'Me' })).toBeTruthy()
    const p = await profiles.get()
    expect(p.heightCm).toBe(165)
    expect(p.onboardedAt).toBe('2026-10-12T10:00:00Z')
    expect((await progress.weighIns()).map((w) => w.kg)).toEqual([70])
    expect(await targets.forDate('2999-01-01')).toBeNull()
  })

  it('2. a new goal offers new targets that only count when accepted, and a new weight is a weigh-in', async () => {
    const { profiles, progress, targets } = start()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Me' }))
    fireEvent.click(await screen.findByRole('button', { name: 'See and change your details' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Change About you' }))
    await screen.findByRole('heading', { name: 'About you' })
    type('Weight today (kg)', '68')
    for (let i = 0; i < 3; i++) click('Next')
    pick('Your main goal', 'Stay as I am')
    click('Next')
    click('Next')
    click('Skip this step')
    expect(screen.getByRole('button', { name: 'Keep my current targets' })).toBeTruthy()
    click('Use these targets')

    expect((await screen.findByRole('region', { name: 'Your goal' })).textContent).toContain('GoalStay as I am')
    expect(screen.getByRole('region', { name: 'About you' }).textContent).toContain('Weight68 kg')
    expect((await profiles.get()).goal).toBe('maintain')
    expect((await progress.weighIns()).map((w) => w.kg)).toEqual([70, 68])
    expect(await targets.forDate('2999-01-01')).toMatchObject({ source: 'suggested' })
  })

  it('4. the details page shows each part with a Change button, and new suggestions open the plan step (T-084)', async () => {
    start()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Me' }))
    fireEvent.click(await screen.findByRole('button', { name: 'See and change your details' }))
    expect(await screen.findByRole('heading', { name: 'Your details' })).toBeTruthy()
    for (const part of ['About you', 'Health check', 'Training', 'Your goal', 'Food habits', 'Your usual day'])
      expect(screen.getByRole('button', { name: `Change ${part}` })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Food habits' }).textContent).toContain('DietVegetarian')
    click('Suggest targets and meals')
    expect(await screen.findByText(/Step 7 of 7/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Keep my current targets' })).toBeTruthy()
  })

  it('3. cancel changes nothing', async () => {
    const { profiles } = start()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Me' }))
    fireEvent.click(await screen.findByRole('button', { name: 'See and change your details' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Change About you' }))
    await screen.findByRole('heading', { name: 'About you' })
    type('Height (cm)', '180')
    click('Cancel')
    expect((await screen.findByRole('region', { name: 'About you' })).textContent).toContain('Height160 cm')
    expect((await profiles.get()).heightCm).toBe(160)
  })
})

describe('one age rule (T-086)', () => {
  it('1. everyone answers the age once, coaches too; under 13 can’t go on', async () => {
    const profiles = memoryProfileStore()
    render(<AppShell auth={auth({ ...user, role: 'coach' })} profileStoreFor={() => profiles} />)
    await screen.findByRole('form', { name: 'Your age' })
    // Under 13 can't go on.
    await answerAge('2020-01-01')
    expect((await screen.findByRole('alert')).textContent).toBe('Track Me Fit is for people 13 and older.')
    await answerAge('1990-03-01')
    await screen.findByRole('tab', { name: 'Clients' })
    expect((await profiles.get()).birthDate).toBe('1990-03-01')
  })

  it('2. a teen waits for a parent, shows a code, and goes in once the parent says yes', async () => {
    const family = memoryFamilyStore()
    const profiles = memoryProfileStore({ ...done, birthDate: '2011-01-01' })
    render(<AppShell auth={auth(user)} profileStoreFor={() => profiles} familyFor={() => family} />)
    expect(await screen.findByRole('heading', { name: 'Ask a parent to say yes' })).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Breakfast' })).toBeNull()
    click('Show my code')
    expect(await screen.findByText('ABCD-1234')).toBeTruthy()
    click('My parent said yes')
    expect((await screen.findByRole('status')).textContent).toBe('Your parent hasn’t said yes yet.')
    await family.sayYes('abcd-1234')
    click('My parent said yes')
    expect(await screen.findByRole('region', { name: 'Breakfast' })).toBeTruthy()
  })

  // Like the database: before a parent says yes, a teen can save only the birth date.
  const teenRule = () => {
    const store = memoryProfileStore()
    return {
      ...store,
      save: async (p: ProfileInfo) => {
        if (p.birthDate && ageOn(p.birthDate, localDate()) < 18) throw new Error('new row violates row-level security policy')
        return store.save(p)
      },
    }
  }

  it('5. a teen who gives their birth date in About you waits for a parent (T-105)', async () => {
    const profiles = teenRule()
    render(<AppShell auth={auth(user)} profileStoreFor={() => profiles} familyFor={() => memoryFamilyStore()} />)
    await screen.findByRole('heading', { name: 'About you' })
    type('Your name', 'Riya')
    pick('Sex', 'Female')
    type('Date of birth', '2011-01-01')
    type('Height (cm)', '155')
    type('Weight today (kg)', '45')
    click('Next')
    expect(await screen.findByRole('heading', { name: 'Ask a parent to say yes' })).toBeTruthy()
    expect((await profiles.get()).birthDate).toBe('2011-01-01')
    expect(screen.queryByText(/Couldn’t save/)).toBeNull()
  })

  it('5. a teen who skips setup also waits for a parent, with no save error (T-105b)', async () => {
    const profiles = teenRule()
    render(<AppShell auth={auth(user)} profileStoreFor={() => profiles} familyFor={() => memoryFamilyStore()} />)
    await screen.findByRole('heading', { name: 'About you' })
    type('Date of birth', '2010-10-20')
    click('Skip setup and start logging')
    expect(await screen.findByRole('heading', { name: 'Ask a parent to say yes' })).toBeTruthy()
    expect((await profiles.get()).birthDate).toBe('2010-10-20')
    expect(screen.queryByText(/Couldn’t save/)).toBeNull()
  })

  it('3. a Google teen is not offered the coach role', async () => {
    render(<AppShell auth={auth({ ...user, roleChosen: false })} profileStoreFor={() => memoryProfileStore({ birthDate: '2010-05-05' })} familyFor={() => memoryFamilyStore()} />)
    await screen.findByText('Coaches must be 18 or older.')
    expect(screen.queryByText('A coach')).toBeNull()
  })
})
