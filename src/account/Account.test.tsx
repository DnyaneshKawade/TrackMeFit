// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Account } from './Account'
import { memoryDataStore } from './data'
import { memoryCoachStore } from '../coach/store'

afterEach(cleanup)

const setup = (store = memoryDataStore()) => {
  const saved: { name: string; text: string }[] = []
  let deleted = 0
  render(<Account store={store} onBack={() => {}} onDeleted={() => deleted++} save={(name, text) => saved.push({ name, text })} />)
  return { store, saved, deleted: () => deleted }
}

describe('Account page (T-042a5)', () => {
  it('2 (T-077). links to the privacy policy', () => {
    setup()
    expect(screen.getByRole('link', { name: 'Read our privacy policy' }).getAttribute('href')).toBe('/privacy.html')
  })

  it('1. "Download my data" saves one file with all of it', async () => {
    const { saved } = setup(memoryDataStore({ data: { food_logs: [{ food_name: 'Dal' }], progress_photos: [{ path: 'a/p1.jpg', link: 'https://x/p1' }] } }))
    fireEvent.click(screen.getByRole('button', { name: 'Download my data' }))
    await waitFor(() => expect(saved).toHaveLength(1))
    expect(saved[0].name).toMatch(/^track-me-fit-data-\d{4}-\d{2}-\d{2}\.json$/)
    expect(JSON.parse(saved[0].text)).toEqual({ food_logs: [{ food_name: 'Dal' }], progress_photos: [{ path: 'a/p1.jpg', link: 'https://x/p1' }] })
  })

  it('5. asks for a change with a note and shows the answer', async () => {
    setup(
      memoryDataStore({
        requests: [{ id: 'r0', note: 'Lunch on 2 Oct is wrong', status: 'closed', answer: 'Removed it', createdAt: '2026-10-02T10:00:00Z', closedAt: '2026-10-04T10:00:00Z', kind: 'change' }],
      }),
    )
    const list = await screen.findByRole('list', { name: 'My requests' })
    expect(list.textContent).toContain('Our answer: Removed it')
    const send = screen.getByRole('button', { name: 'Send' })
    expect(send).toHaveProperty('disabled', true)
    fireEvent.change(screen.getByLabelText('What is wrong?'), { target: { value: 'My weight from 3 Oct is wrong' } })
    fireEvent.click(send)
    await screen.findByRole('status')
    const items = within(screen.getByRole('list', { name: 'My requests' })).getAllByRole('listitem')
    expect(items[0].textContent).toContain('My weight from 3 Oct is wrong')
    expect(items[0].textContent).toContain('Waiting for an answer.')
  })

  it('2. "Delete my account" runs only after typing DELETE, then signs out', async () => {
    const { store, deleted } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }))
    const yes = screen.getByRole('button', { name: 'Delete forever' })
    fireEvent.change(screen.getByLabelText('Type DELETE to say yes'), { target: { value: 'delete' } })
    expect(yes).toHaveProperty('disabled', true)
    fireEvent.change(screen.getByLabelText('Type DELETE to say yes'), { target: { value: 'DELETE' } })
    fireEvent.click(yes)
    await waitFor(() => expect(deleted()).toBe(1))
    expect(store.deleted).toBe(true)
  })

  it('3. an admin is told to be removed as admin first', async () => {
    const { deleted } = setup(memoryDataStore({ refuseDelete: 'remove them as admin first' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }))
    fireEvent.change(screen.getByLabelText('Type DELETE to say yes'), { target: { value: 'DELETE' } })
    fireEvent.click(screen.getByRole('button', { name: 'Delete forever' }))
    expect((await screen.findByRole('alert')).textContent).toBe('You are an admin. Ask another owner to remove you as admin first.')
    expect(deleted()).toBe(0)
  })
})

describe('sign out on all devices (T-090)', () => {
  it('1. signs out everywhere only after a confirm; Cancel does nothing', async () => {
    let calls = 0
    render(<Account store={memoryDataStore()} onBack={() => {}} onDeleted={() => {}} onSignOutAll={async () => void calls++} />)
    const part = screen.getByRole('region', { name: 'Sign out on all devices' })
    fireEvent.click(within(part).getByRole('button', { name: 'Sign out on all devices' }))
    fireEvent.click(within(part).getByRole('button', { name: 'Cancel' }))
    expect(calls).toBe(0)
    fireEvent.click(within(part).getByRole('button', { name: 'Sign out on all devices' }))
    expect(within(part).getByText('Sign out everywhere?')).toBeTruthy()
    fireEvent.click(within(part).getByRole('button', { name: 'Yes, sign out' }))
    await waitFor(() => expect(calls).toBe(1))
  })

  it('2. says so when it fails', async () => {
    render(<Account store={memoryDataStore()} onBack={() => {}} onDeleted={() => {}} onSignOutAll={() => Promise.reject(new Error('offline'))} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign out on all devices' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, sign out' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Couldn’t sign out. Check your connection.')
  })
})

describe('one tidy Account page (T-092)', () => {
  it('1. parts come in order and each shows what it is set to now', async () => {
    const opened: string[] = []
    const coach = memoryCoachStore({ coach: { id: 'l1', personId: 'k1', name: 'Kiran Rao', since: '2026-10-12T05:00:00Z' } })
    render(
      <Account
        store={memoryDataStore()}
        onBack={() => {}}
        onDeleted={() => {}}
        onSignOutAll={async () => {}}
        security={{ email: 'asha@example.com', signInWith: 'email' }}
        onDetails={() => opened.push('details')}
        coach={coach}
        onCoach={() => opened.push('coach')}
      />,
    )
    const parts = screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))
    const order = ['Your details', 'Sign-in and security', 'Your coach', 'Your data and privacy', 'Delete my account']
    expect(parts.filter((p) => order.includes(p!))).toEqual(order)
    expect((await screen.findByText(/You share your data with/)).textContent).toBe('You share your data with Kiran Rao since 12 Oct 2026.')
    fireEvent.click(screen.getByRole('button', { name: 'See and change your details' }))
    fireEvent.click(screen.getByRole('button', { name: 'See what they see, or stop sharing' }))
    expect(opened).toEqual(['details', 'coach'])
  })

  it('2. with no coach it says nobody else sees the data', async () => {
    render(<Account store={memoryDataStore()} onBack={() => {}} onDeleted={() => {}} coach={memoryCoachStore()} onCoach={() => {}} />)
    expect(await screen.findByText('You have no coach. Nobody else sees your data.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Join a coach' })).toBeTruthy()
  })
})

describe('"I want to coach" (T-103)', () => {
  it('1. an adult asks once from the Account page, then sees the request is waiting', async () => {
    const store = memoryDataStore()
    render(<Account store={store} onBack={() => {}} onDeleted={() => {}} canCoach />)
    fireEvent.click(await screen.findByRole('button', { name: 'I want to coach' }))
    expect(screen.getByText('You keep this account. Your own log stays yours.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Tell us about your coaching (if you like)'), { target: { value: 'I train friends at my gym' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send my request' }))
    expect((await screen.findByRole('region', { name: 'Coach other people' })).textContent).toMatch(/We have your request from .+\. We will answer here\./)
    expect((await store.requests()).map((r) => [r.kind, r.note])).toEqual([['coach', 'I train friends at my gym']])
    expect(screen.queryByRole('button', { name: 'I want to coach' })).toBeNull()
  })

  it('1. coaches and teens don’t see it', () => {
    setup()
    expect(screen.queryByRole('region', { name: 'Coach other people' })).toBeNull()
  })
})

describe('kg or lb for gym weights (T-101)', () => {
  it('3. the Account page saves kg or lb', async () => {
    let unit: 'kg' | 'lb' = 'kg'
    const onChange = async (u: 'kg' | 'lb') => {
      unit = u
    }
    render(<Account store={memoryDataStore()} onBack={() => {}} onDeleted={() => {}} units={{ unit, onChange }} />)
    const part = screen.getByRole('region', { name: 'Units' })
    expect(within(part).getByRole('button', { name: 'kg' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(within(part).getByRole('button', { name: 'lb' }))
    await waitFor(() => expect(unit).toBe('lb'))
  })
})
