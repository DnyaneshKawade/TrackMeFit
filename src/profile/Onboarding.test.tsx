// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Onboarding } from './Onboarding'
import { EMPTY_PROFILE, HEALTH_QUESTIONS } from './types'

afterEach(cleanup)

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const pick = (group: string, option: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: group })).getByRole('button', { name: option }))

function fillAboutYou(sex: 'Male' | 'Female' = 'Female') {
  type('Your name', 'Asha')
  pick('Sex', sex)
  type('Date of birth', '1995-06-15')
  type('Height (cm)', '160')
  type('Weight today (kg)', '64.5')
  click('Next')
}

function fillDayAndGoal() {
  pick('On a normal day you are', 'Mostly sitting')
  pick('Workouts a week', '3')
  pick('Lifting experience', 'New to lifting')
  click('Next')
  pick('Your main goal', 'Lose fat')
  pick('What you eat', 'Vegetarian')
  click('Next')
}

describe('onboarding', () => {
  it('checks the first step before moving on', () => {
    render(<Onboarding initial={EMPTY_PROFILE} onFinish={vi.fn()} today="2026-10-13" />)
    click('Next')
    expect(screen.getByText('Tell us what to call you.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'About you' })).toBeTruthy()
    fillAboutYou()
    expect(screen.getByRole('heading', { name: 'Your day' })).toBeTruthy()
  })

  it('needs every answer on the day and goal steps, and can go back', () => {
    render(<Onboarding initial={EMPTY_PROFILE} onFinish={vi.fn()} today="2026-10-13" />)
    fillAboutYou()
    click('Next')
    expect(screen.getByText('Answer all three to continue.')).toBeTruthy()
    click('Back')
    expect((screen.getByLabelText('Your name') as HTMLInputElement).value).toBe('Asha')
  })

  it('shows a doctor note for a yes and saves everything at the end', async () => {
    const onFinish = vi.fn().mockResolvedValue(undefined)
    render(<Onboarding initial={EMPTY_PROFILE} onFinish={onFinish} today="2026-10-13" />)
    fillAboutYou()
    fillDayAndGoal()
    expect(screen.getByRole('heading', { name: 'Health check' })).toBeTruthy()
    click('Start tracking')
    expect(screen.getByText('Answer each question with yes or no.')).toBeTruthy()

    for (const q of HEALTH_QUESTIONS) pick(q.label, q.key === 'diabetes' ? 'Yes' : 'No')
    const note = screen.getByRole('note', { name: 'Please talk to your doctor' })
    expect(note.textContent).toMatch(/blood sugar/)

    click('Start tracking')
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1))
    const [profile, kg] = onFinish.mock.calls[0]
    expect(kg).toBe(64.5)
    expect(profile).toMatchObject({
      fullName: 'Asha',
      sex: 'female',
      birthDate: '1995-06-15',
      heightCm: 160,
      activity: 'desk',
      trainingDays: 3,
      experience: 'beginner',
      goal: 'lose',
      dietPref: 'veg',
    })
    expect(profile.medical).toMatchObject({ diabetes: true, kidney: false, pregnant: false })
  })

  it('skips the pregnancy question for men and drops its answer', async () => {
    const onFinish = vi.fn().mockResolvedValue(undefined)
    render(<Onboarding initial={{ ...EMPTY_PROFILE, medical: { pregnant: true } }} onFinish={onFinish} today="2026-10-13" />)
    fillAboutYou('Male')
    fillDayAndGoal()
    expect(screen.queryByRole('group', { name: 'Pregnant or breastfeeding' })).toBeNull()
    for (const q of HEALTH_QUESTIONS.filter((q) => !q.onlyFor)) pick(q.label, 'No')
    expect(screen.queryByRole('note')).toBeNull()
    click('Start tracking')
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
    expect(onFinish.mock.calls[0][0].medical).not.toHaveProperty('pregnant')
  })

  it('says so when saving fails', async () => {
    render(<Onboarding initial={EMPTY_PROFILE} onFinish={vi.fn().mockRejectedValue(new Error('offline'))} today="2026-10-13" />)
    fillAboutYou()
    fillDayAndGoal()
    for (const q of HEALTH_QUESTIONS) pick(q.label, 'No')
    click('Start tracking')
    expect(await screen.findByText(/Couldn’t save/)).toBeTruthy()
  })
})
