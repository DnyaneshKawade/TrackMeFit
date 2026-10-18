// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { CoachHome } from './CoachStatus'
import { YourCoach } from './YourCoach'
import { memoryApprovalStore } from './approval'
import { memoryChatStore } from './chat'
import { memoryCoachStore } from './store'

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
