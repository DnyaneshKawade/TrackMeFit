// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { YourCoach } from './YourCoach'
import { memoryCoachStore } from './store'

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
