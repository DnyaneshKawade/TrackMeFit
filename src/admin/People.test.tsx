// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { People } from './People'
import { memoryAdmin, PEOPLE_PAGE, type PersonRow } from './service'

afterEach(cleanup)

const person = (userId: string, over: Partial<PersonRow> = {}): PersonRow => ({
  userId,
  email: `${userId}@example.com`,
  phone: '',
  name: '',
  role: 'user',
  joinedAt: '2026-10-10T10:00:00Z',
  lastActiveAt: null,
  blocked: false,
  confirmed: true,
  onboarded: true,
  coachName: null,
  adminLevel: null,
  ...over,
})
const ASHA = person('asha', { name: 'Asha Rao', phone: '919800011122', coachName: 'Coach Kiran', joinedAt: '2026-10-12T10:00:00Z', lastActiveAt: '2026-10-17T08:00:00Z' })
const RAVI = person('ravi', { name: 'Ravi', confirmed: false, joinedAt: '2026-10-11T10:00:00Z' })
const DK = person('dk', { name: 'DK', adminLevel: 'owner', joinedAt: '2026-10-01T10:00:00Z' })
const setup = (people = [ASHA, RAVI, DK]) => {
  const service = memoryAdmin({ me: 'dk', level: 'owner', step: 'on', people })
  render(<People service={service} me="dk" />)
  return service
}
const row = (name: string) => screen.findByRole('listitem', { name })
const doIt = async (name: string, button: string, reason: string, save: string) => {
  const r = await row(name)
  fireEvent.click(within(r).getByRole('button', { name: button }))
  fireEvent.change(within(r).getByLabelText('Reason'), { target: { value: reason } })
  fireEvent.click(within(r).getByRole('button', { name: save }))
  await screen.findByRole('status')
}

describe('people page (T-042a2)', () => {
  it('10. finds people by name, email or phone, newest first, with account facts only', async () => {
    setup()
    const list = await screen.findAllByRole('listitem')
    expect(list.map((l) => l.getAttribute('aria-label'))).toEqual(['Asha Rao', 'Ravi', 'DK'])
    const asha = await row('Asha Rao')
    expect(asha.textContent).toContain('asha@example.com · 919800011122')
    expect(asha.textContent).toContain('Coach: Coach Kiran.')
    expect(asha.textContent).toContain('Last seen 17 Oct 2026.')
    expect((await row('Ravi')).textContent).toContain('Email not confirmed')
    expect(asha.textContent).not.toMatch(/kg|kcal|calorie|weight/i)
    fireEvent.change(screen.getByLabelText('Search by name, email or phone'), { target: { value: '98000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(screen.getAllByRole('listitem').map((l) => l.getAttribute('aria-label'))).toEqual(['Asha Rao']))
  })

  it('11. shows 50 at a time with Show more', async () => {
    setup(Array.from({ length: PEOPLE_PAGE + 3 }, (_, i) => person(`p${String(i).padStart(3, '0')}`, { joinedAt: `2026-10-01T10:${String(i % 60).padStart(2, '0')}:00Z` })))
    await row('p052@example.com')
    expect(screen.getAllByRole('listitem')).toHaveLength(PEOPLE_PAGE)
    fireEvent.click(screen.getByRole('button', { name: 'Show more' }))
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(PEOPLE_PAGE + 3))
    expect(screen.queryByRole('button', { name: 'Show more' })).toBeNull()
  })

  it('12. each action asks for a reason and is saved in the admin log', async () => {
    const service = setup()
    await doIt('Ravi', 'Block', 'Spam messages', 'Block')
    expect((await row('Ravi')).textContent).toContain('Blocked')
    await doIt('Ravi', 'Unblock', 'Said sorry', 'Unblock')
    await doIt('Ravi', 'Sign out everywhere', 'Lost phone', 'Sign out')
    await doIt('Ravi', 'Resend confirm email', 'Lost the email', 'Send')
    await doIt('Asha Rao', 'End coach link', 'Asked to stop', 'End link')
    await doIt('Ravi', 'Make coach', 'Signed up wrong', 'Save')
    await doIt('Ravi', 'Delete Ravi', 'Asked to delete', 'Yes, delete')
    expect(screen.getByRole('status').textContent).toBe('Ravi was deleted.')
    expect(screen.queryByRole('listitem', { name: 'Ravi' })).toBeNull()
    expect(service.log).toEqual([
      'block ravi Spam messages',
      'unblock ravi Said sorry',
      'sign out ravi Lost phone',
      'resend confirm ravi Lost the email',
      'end coach link asha Asked to stop',
      'change role ravi Signed up wrong',
      'delete ravi Asked to delete',
    ])
  })

  it('13. refuses to block or delete an admin, and says why', async () => {
    const service = setup()
    const r = await row('DK')
    fireEvent.click(within(r).getByRole('button', { name: 'Delete DK' }))
    expect(within(r).getByRole('button', { name: 'Yes, delete' }).hasAttribute('disabled')).toBe(true)
    fireEvent.change(within(r).getByLabelText('Reason'), { target: { value: 'Test' } })
    fireEvent.click(within(r).getByRole('button', { name: 'Yes, delete' }))
    expect((await screen.findByRole('alert')).textContent).toBe("You can't do this to your own account.")
    expect(service.log).toEqual([])
  })
})

