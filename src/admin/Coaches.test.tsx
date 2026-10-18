// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Coaches } from './Coaches'
import { memoryAdmin, type CoachFile } from './service'

afterEach(cleanup)

const coach = (userId: string, over: Partial<CoachFile> = {}): CoachFile => ({
  userId,
  email: `${userId}@example.com`,
  name: '',
  status: 'waiting',
  statusAt: '2026-10-15T10:00:00Z',
  clients: 0,
  clientLimit: 30,
  hasDetails: true,
  note: '',
  phone: '',
  city: '',
  years: null,
  link: '',
  answer: '',
  certificates: [],
  ...over,
})
const RIYA = coach('riya', {
  name: 'Riya',
  statusAt: '2026-10-16T10:00:00Z',
  phone: '98200 00000',
  city: 'Pune',
  years: 4,
  certificates: [{ id: 'c1', name: 'ACE', url: 'https://example.com/ace.jpg' }],
})
const OLD = coach('old', { name: 'Old Waiter', statusAt: '2026-10-01T10:00:00Z', hasDetails: false })
const KIRAN = coach('kiran', { name: 'Kiran', status: 'approved', clients: 12 })

const setup = () => {
  const service = memoryAdmin({ me: 'dk', level: 'owner', step: 'on', coaches: [RIYA, OLD, KIRAN] })
  render(<Coaches service={service} />)
  return service
}
const decide = async (button: string, reason: string, save = button) => {
  const view = await screen.findByRole('region', { name: /^Coach / })
  fireEvent.click(within(view).getByRole('button', { name: button }))
  fireEvent.change(within(view).getByLabelText(/Reason|Note for the coach/), { target: { value: reason } })
  fireEvent.click(within(view).getByRole('button', { name: save }))
  await screen.findByRole('status')
}

describe('coaches page (T-042a3)', () => {
  it('10. lists coaches by status with client counts, Waiting oldest first, and opens details with photos', async () => {
    setup()
    const list = await screen.findAllByRole('listitem')
    expect(list.map((li) => li.getAttribute('aria-label'))).toEqual(['Old Waiter', 'Riya'])
    expect(within(list[0]).getByText(/No details yet/)).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'Approved' }))
    const kiran = await screen.findByRole('listitem', { name: 'Kiran' })
    expect(within(kiran).getByText(/Clients: 12 of 30/)).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Waiting' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Open Riya' }))
    const view = await screen.findByRole('region', { name: 'Coach Riya' })
    expect(within(view).getByText('Pune')).toBeTruthy()
    expect(within(view).getByRole('img', { name: 'ACE' }).getAttribute('src')).toBe('https://example.com/ace.jpg')
  })

  it('11. an owner asks for more, approves, pauses and ends a pause, and sets a limit, each with a reason', async () => {
    const service = setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Riya' }))
    await decide('Ask for more', 'Please add a certificate photo.')
    expect(await screen.findByText('Last note to the coach: Please add a certificate photo.')).toBeTruthy()
    await decide('Approve', 'Certificates look right')
    await screen.findByRole('button', { name: 'Pause' })
    await decide('Pause', 'A complaint came in')
    await decide('End pause', 'Complaint checked')

    const view = screen.getByRole('region', { name: 'Coach Riya' })
    fireEvent.click(within(view).getByRole('button', { name: 'Change client limit' }))
    fireEvent.change(within(view).getByLabelText('Client limit'), { target: { value: '0' } })
    fireEvent.change(within(view).getByLabelText('Reason'), { target: { value: 'Big gym' } })
    fireEvent.click(within(view).getByRole('button', { name: 'Save' }))
    expect((await screen.findByRole('alert')).textContent).toBe('The limit must be from 1 to 500.')
    fireEvent.change(within(view).getByLabelText('Client limit'), { target: { value: '50' } })
    fireEvent.click(within(view).getByRole('button', { name: 'Save' }))
    expect(await screen.findByText(/Clients: 0 of 50/)).toBeTruthy()

    expect(service.log).toEqual([
      'coach ask more riya Please add a certificate photo.',
      'coach approve riya Certificates look right',
      'coach pause riya A complaint came in',
      'coach approve riya Complaint checked',
      'set client limit riya Big gym',
    ])
  })

  it('12. an owner turns the Coach approval switch on with a reason', async () => {
    const service = setup()
    const sw = await screen.findByRole('region', { name: 'Coach approval switch' })
    expect(await within(sw).findByText('Coach approval is off.')).toBeTruthy()
    fireEvent.click(within(sw).getByRole('button', { name: 'Turn on' }))
    fireEvent.change(within(sw).getByLabelText('Reason'), { target: { value: 'Checking coaches now' } })
    fireEvent.click(within(sw).getByRole('button', { name: 'Turn on' }))
    expect(await within(sw).findByText('Coach approval is on.')).toBeTruthy()
    expect(service.log).toEqual(['set switch on Checking coaches now'])
  })
})
