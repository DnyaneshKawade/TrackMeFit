// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { YourCoach } from './YourCoach'
import { memoryCoachStore } from './store'
import { memoryCheckInStore } from './checkIns'

afterEach(cleanup)

const type = async (value: string) => fireEvent.change(await screen.findByLabelText('Coach code'), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('your coach (T-026a)', () => {
  it('2. joins a coach with their code and shows the coach’s name', async () => {
    const store = memoryCoachStore({ codes: { ABCDE12345: 'Coach K' } })
    render(<YourCoach store={store} />)
    await type('abcde-12345')
    click('Join')
    expect((await screen.findByText(/You’re working with/)).textContent).toBe('You’re working with Coach K.')
    expect(screen.getByText(/Your coach can see your food, workouts, weight, measurements and photos/)).toBeTruthy()
    expect((await store.myCoach())?.name).toBe('Coach K')
  })

  it('2 (T-026i). a code from a full coach says so and changes nothing', async () => {
    const store = memoryCoachStore({ codes: { ABCDE12345: 'Coach K' }, fullCodes: ['ABCDE12345'] })
    render(<YourCoach store={store} />)
    await type('ABCDE-12345')
    click('Join')
    expect((await screen.findByRole('alert')).textContent).toBe('This coach has no space for new clients right now. Ask them about it.')
    expect(await store.myCoach()).toBeNull()
  })

  it('3. a wrong code changes nothing and says to ask for a new one', async () => {
    const store = memoryCoachStore({ codes: { ABCDE12345: 'Coach K' } })
    render(<YourCoach store={store} />)
    await type('ZZZZZ99999')
    click('Join')
    expect((await screen.findByRole('alert')).textContent).toBe('That code didn’t work. Ask your coach for a new one.')
    expect(await store.myCoach()).toBeNull()
  })

  it('5. stops sharing after a confirm', async () => {
    const store = memoryCoachStore({ coach: { id: 'l1', personId: 'c1', name: 'Coach K' } })
    render(<YourCoach store={store} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Stop sharing with your coach' }))
    expect(screen.getByText('Stop sharing with Coach K?')).toBeTruthy()
    click('Yes, stop')
    expect(await screen.findByLabelText('Coach code')).toBeTruthy()
    expect(await store.myCoach()).toBeNull()
  })
})

describe('weekly check-in (T-026e)', () => {
  const TODAY = '2026-10-15'
  const linked = () => memoryCoachStore({ coach: { id: 'l1', personId: 'k1', name: 'Coach K' } })
  const score = (q: string, n: number) => fireEvent.click(within(screen.getByRole('group', { name: q })).getByRole('button', { name: String(n) }))

  it('1. the person answers five scores and two notes, and sends it for this week', async () => {
    const checkIns = memoryCheckInStore([], TODAY)
    render(<YourCoach store={linked()} checkIns={checkIns} today={TODAY} />)
    await screen.findByRole('region', { name: 'Weekly check-in' })
    click('Send check-in')
    expect((await screen.findByRole('alert')).textContent).toMatch(/Pick a number for energy, sleep, mood/)
    for (const q of ['Energy', 'Sleep', 'Mood', 'Sticking to your food plan', 'Training']) score(q, 4)
    fireEvent.change(screen.getByLabelText('How did the week go?'), { target: { value: 'Two late nights' } })
    fireEvent.change(screen.getByLabelText('Anything you need from your coach?'), { target: { value: 'Swap for rice?' } })
    click('Send check-in')
    expect(await screen.findByText('Sent for this week.')).toBeTruthy()
    const [saved] = await checkIns.list()
    expect([saved.weekStart, saved.energy, saved.note, saved.ask]).toEqual(['2026-10-12', 4, 'Two late nights', 'Swap for rice?'])
  })

  it('2. answers can change until the coach replies; then the reply shows', async () => {
    const sent = { id: 'c1', weekStart: '2026-10-12', energy: 3, sleep: 3, mood: 3, diet: 3, training: 3, note: '', ask: '', reply: null, repliedOn: null } as const
    const checkIns = memoryCheckInStore([{ ...sent }], TODAY)
    render(<YourCoach store={linked()} checkIns={checkIns} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Change answers' }))
    score('Sleep', 5)
    click('Send check-in')
    expect(await screen.findByText(/Sleep 5/)).toBeTruthy()

    await checkIns.reply('c1', 'Good week. Keep going.')
    cleanup()
    render(<YourCoach store={linked()} checkIns={checkIns} today={TODAY} />)
    expect(await screen.findByText('Good week. Keep going.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Change answers' })).toBeNull()
  })

  it('3. no check-in without a coach', async () => {
    render(<YourCoach store={memoryCoachStore()} checkIns={memoryCheckInStore()} today={TODAY} />)
    await screen.findByLabelText('Coach code')
    expect(screen.queryByRole('region', { name: 'Weekly check-in' })).toBeNull()
  })
})
