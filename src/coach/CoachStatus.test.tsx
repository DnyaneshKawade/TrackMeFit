// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { CoachHome } from './CoachStatus'
import { Clients } from './Clients'
import { YourCoach } from './YourCoach'
import { memoryApprovalStore } from './approval'
import { memoryChatStore } from './chat'
import { emptyClient, memoryCoachStore } from './store'

afterEach(cleanup)

const NOW = new Date('2026-10-18T12:00:00Z')
const home = (store = memoryApprovalStore()) =>
  render(
    <CoachHome store={store} shrink={async (f) => f} now={NOW}>
      <p>Client list</p>
    </CoachHome>,
  )
const type = (label: string, value: string, scope: HTMLElement = document.body) => fireEvent.change(within(scope).getByLabelText(label), { target: { value } })

describe('coach status screens (T-042a3)', () => {
  it('6. a Waiting coach is told we are checking, and saves details and a certificate photo', async () => {
    const store = memoryApprovalStore({ status: 'waiting' })
    home(store)
    expect(await screen.findByRole('heading', { name: 'We’re checking your details' })).toBeTruthy()
    expect(screen.queryByText('Client list')).toBeNull()

    const form = await screen.findByRole('form', { name: 'Your coach details' })
    type('Phone', '98200 00000', form)
    type('City', 'Pune', form)
    type('Years coaching', 'many', form)
    fireEvent.click(within(form).getByRole('button', { name: 'Save details' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Years coaching must be a number from 0 to 60.')
    type('Years coaching', '4', form)
    fireEvent.click(within(form).getByRole('button', { name: 'Save details' }))
    expect((await screen.findByRole('status')).textContent).toBe('Your details are saved.')
    expect(await store.details()).toMatchObject({ phone: '98200 00000', city: 'Pune', years: 4 })

    const photo = new File(['x'], 'ace.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByLabelText('Certificate photo'), { target: { files: [photo] } })
    expect((await screen.findByRole('alert')).textContent).toBe('Write the certificate name first.')
    type('Certificate name', 'ACE')
    fireEvent.change(screen.getByLabelText('Certificate photo'), { target: { files: [photo] } })
    expect(await screen.findByRole('img', { name: 'ACE' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Remove ACE' }))
    await screen.findByLabelText('Certificate name')
    expect(await store.certificates()).toEqual([])
  })

  it('7. Needs more shows the note, and the answer sends the coach back to Waiting', async () => {
    const store = memoryApprovalStore({ status: 'needs more', note: 'Please add a certificate photo.', seen: false })
    home(store)
    expect(await screen.findByText('Please add a certificate photo.')).toBeTruthy()
    expect((await store.standing()).seen).toBe(true)
    const send = screen.getByRole('button', { name: 'Send for checking' })
    expect(send.hasAttribute('disabled')).toBe(true)
    type('Your answer', 'Added my ACE photo.')
    fireEvent.click(send)
    expect(await screen.findByRole('heading', { name: 'We’re checking your details' })).toBeTruthy()
    expect((await store.details()).answer).toBe('Added my ACE photo.')
  })

  it('8. Not approved shows the reason and the day to apply again; after 30 days they can', async () => {
    home(memoryApprovalStore({ status: 'not approved', note: 'No certificate.', at: '2026-10-10T10:00:00Z' }))
    expect(await screen.findByText('No certificate.')).toBeTruthy()
    expect(screen.getByText(/You can apply again on 9 Nov 2026/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Apply again' })).toBeNull()
    cleanup()

    home(memoryApprovalStore({ status: 'not approved', note: 'No certificate.', at: '2026-09-01T10:00:00Z' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Apply again' }))
    expect(await screen.findByRole('heading', { name: 'We’re checking your details' })).toBeTruthy()
  })

  it('9. a Paused coach is told so; their client sees the coach is paused and keeps their data', async () => {
    home(memoryApprovalStore({ status: 'paused', note: 'A complaint came in.' }))
    expect(await screen.findByRole('heading', { name: 'Your coach account is paused' })).toBeTruthy()
    expect(screen.getByText('Your clients keep all their own data.')).toBeTruthy()
    expect(screen.queryByText('Client list')).toBeNull()
    cleanup()

    const coach = memoryCoachStore({ coach: { id: 'link-1', personId: 'k', name: 'Coach Kiran', paused: true } })
    render(<YourCoach store={coach} chat={memoryChatStore('me')} />)
    expect(await screen.findByText(/Your coach is paused for now/)).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Messages' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Stop sharing with your coach' })).toBeTruthy()
  })

  it('13. a coach approved after review is told once, then sees their clients', async () => {
    const store = memoryApprovalStore({ status: 'approved', seen: false, note: 'Welcome' })
    home(store)
    expect(await screen.findByText('Your coach account is approved. You can invite clients now.')).toBeTruthy()
    expect(screen.getByText('Client list')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.queryByText(/Your coach account is approved/)).toBeNull()
    expect((await store.standing()).seen).toBe(true)
    cleanup()

    home(store)
    await screen.findByText('Client list')
    expect(screen.queryByText(/Your coach account is approved/)).toBeNull()
  })
})

describe('coaches change their own details (T-093)', () => {
  it('1. an Approved coach opens their details, changes them and saves; the status stays', async () => {
    const store = memoryApprovalStore({ status: 'approved', details: { name: 'Kiran', phone: '98200 00000', city: 'Pune', years: 4 } })
    home(store)
    expect(await screen.findByText('Client list')).toBeTruthy()
    fireEvent.click(screen.getByText('Your coach details'))
    const form = await screen.findByRole('form', { name: 'Your coach details' })
    expect((within(form).getByLabelText('Name your clients see') as HTMLInputElement).value).toBe('Kiran')
    type('Name your clients see', 'Kiran Rao', form)
    type('City', 'Mumbai', form)
    fireEvent.click(within(form).getByRole('button', { name: 'Save details' }))
    expect((await screen.findByRole('status')).textContent).toBe('Your details are saved.')
    expect(await store.details()).toMatchObject({ name: 'Kiran Rao', city: 'Mumbai', years: 4 })
    expect((await store.standing()).status).toBe('approved')
  })
})

describe('first steps for a new coach (T-099)', () => {
  const steps = () =>
    within(screen.getByRole('region', { name: 'First steps' }))
      .getAllByRole('listitem')
      .map((li) => li.querySelector('.mark')!.textContent)

  it('1. a new coach sees three steps; filling in details moves them to the check', async () => {
    const store = memoryApprovalStore({ status: 'waiting', details: { name: 'Kiran' } })
    home(store)
    await screen.findByRole('form', { name: 'Your coach details' })
    expect(steps()).toEqual(['Now', 'Next', 'Next'])
    const items = within(screen.getByRole('region', { name: 'First steps' })).getAllByRole('listitem')
    expect(items[2].textContent).toContain('Then you see their food, workouts, weight and check-ins.')
    expect(items[0].textContent).toContain('Clients see only your name.')

    type('Phone', '98200 00000')
    type('City', 'Pune')
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }))
    await screen.findByText('Your details are saved.')
    // A certificate photo is still missing.
    expect(steps()).toEqual(['Now', 'Next', 'Next'])
    type('Certificate name', 'ACE')
    fireEvent.change(screen.getByLabelText('Certificate photo'), { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } })
    await screen.findByRole('img', { name: 'ACE' })
    expect(steps()).toEqual(['Done', 'Now', 'Next'])
  })

  it('2. an approved coach with no clients is on the invite step; steps leave once they have one', async () => {
    render(<Clients store={memoryCoachStore()} />)
    await screen.findByText('No clients yet. Send a code to someone you coach.')
    expect(steps()).toEqual(['Done', 'Done', 'Now'])
    cleanup()
    render(<Clients store={memoryCoachStore({ clients: [emptyClient('l1', 'Asha')] })} />)
    await screen.findByText('Asha')
    expect(screen.queryByRole('region', { name: 'First steps' })).toBeNull()
  })

  it('3. Not approved and Paused coaches see no steps', async () => {
    home(memoryApprovalStore({ status: 'paused' }))
    await screen.findByRole('heading', { name: 'Your coach account is paused' })
    expect(screen.queryByRole('region', { name: 'First steps' })).toBeNull()
    cleanup()
    home(memoryApprovalStore({ status: 'not approved', at: '2026-09-01T00:00:00Z' }))
    await screen.findByRole('heading', { name: 'Your coach account was not approved' })
    expect(screen.queryByRole('region', { name: 'First steps' })).toBeNull()
  })
})
