// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Admin } from './Admin'
import { memoryAdmin, readyAccess, type AdminMember } from './service'
import { AppShell } from '../App'
import type { Account, AuthService } from '../auth/types'
import { memoryProfileStore } from '../profile/stores'

afterEach(cleanup)

const DK: AdminMember = { userId: 'dk', email: 'dk@example.com', name: 'DK', level: 'owner', addedAt: '2026-10-18', lastActionAt: null }
const type = (label: string, value: string, within_: HTMLElement = document.body) =>
  fireEvent.change(within(within_).getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('admin tab (T-042a1)', () => {
  it('8. shows the Admin tab only to admins', async () => {
    const account: Account = { id: 'dk', email: 'dk@example.com', name: 'DK', role: 'user' }
    const auth: AuthService = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      chooseRole: vi.fn(),
      resetPassword: vi.fn(),
      signOut: vi.fn(),
      current: vi.fn().mockResolvedValue(account),
      onChange: vi.fn().mockReturnValue(() => {}),
    }
    const profiles = memoryProfileStore({ onboardedAt: '2026-10-12T10:00:00Z' })
    const { unmount } = render(<AppShell auth={auth} profileStoreFor={() => profiles} adminFor={() => readyAccess(memoryAdmin({ me: 'dk', level: null }))} />)
    await screen.findByRole('tab', { name: 'Food' })
    expect(screen.queryByRole('tab', { name: 'Admin' })).toBeNull()
    unmount()
    render(<AppShell auth={auth} profileStoreFor={() => profiles} adminFor={() => readyAccess(memoryAdmin({ me: 'dk', level: 'owner' }))} />)
    fireEvent.click(await screen.findByRole('tab', { name: 'Admin' }))
    expect(await screen.findByRole('heading', { name: 'Turn on the second step' })).toBeTruthy()
  })

  it('9. an admin sets up the second step with a code app before any admin page', async () => {
    const service = memoryAdmin({ me: 'dk', level: 'owner', team: [DK] })
    render(<Admin service={service} me="dk" level="owner" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Set it up' }))
    expect(await screen.findByRole('img', { name: 'Picture to scan with your code app' })).toBeTruthy()
    expect(screen.getByText('ABCD EFGH')).toBeTruthy()
    type('6-digit code', '111111')
    click('Turn on')
    expect((await screen.findByRole('alert')).textContent).toBe('That code is wrong or too old. Try the new one.')
    type('6-digit code', '123 456')
    click('Turn on')
    expect(await screen.findByRole('region', { name: 'People' })).toBeTruthy()
  })

  it('10. an admin with the step set up enters a code each sign-in', async () => {
    const service = memoryAdmin({ me: 'dk', level: 'content', step: 'needs code' })
    render(<Admin service={service} me="dk" level="content" />)
    type('6-digit code', '123456', await screen.findByRole('region', { name: 'Second step' }))
    click('Continue')
    expect(await screen.findByText('You are a content admin. Food and exercise pages come next.')).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Admin team' })).toBeNull()
  })

  it('11. an owner adds, changes and removes admins, each with a reason', async () => {
    const service = memoryAdmin({ me: 'dk', level: 'owner', step: 'on', team: [DK], accounts: { 'meera@example.com': 'meera' } })
    render(<Admin service={service} me="dk" level="owner" />)
    fireEvent.click(await screen.findByRole('tab', { name: 'Admin team' }))
    const form = await screen.findByRole('form', { name: 'Add an admin' })
    type('Email', 'nobody@example.com', form)
    type('Reason', 'Helps with foods', form)
    click('Add admin')
    expect((await screen.findByRole('alert')).textContent).toBe('No account uses this email.')
    type('Email', 'Meera@example.com', form)
    click('Add admin')
    const meera = await screen.findByRole('listitem', { name: 'meera@example.com' })
    expect(within(meera).getByText(/Content admin/)).toBeTruthy()

    fireEvent.click(within(meera).getByRole('button', { name: 'Make owner' }))
    expect(within(meera).getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true)
    type('Reason', 'Runs support now', meera)
    fireEvent.click(within(meera).getByRole('button', { name: 'Save' }))
    expect(await within(await screen.findByRole('listitem', { name: 'meera@example.com' })).findByText(/Owner admin/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Remove meera@example.com' }))
    const row = screen.getByRole('listitem', { name: 'meera@example.com' })
    type('Reason', 'No longer helping', row)
    fireEvent.click(within(row).getByRole('button', { name: 'Remove' }))
    await vi.waitFor(() => expect(screen.queryByRole('listitem', { name: 'meera@example.com' })).toBeNull())
    expect(service.log).toEqual(['add admin meera Helps with foods', 'change admin level meera Runs support now', 'remove admin meera No longer helping'])
  })

  it('12. says when the last owner would be removed', async () => {
    const service = memoryAdmin({ me: 'dk', level: 'owner', step: 'on', team: [DK] })
    render(<Admin service={service} me="dk" level="owner" />)
    fireEvent.click(await screen.findByRole('tab', { name: 'Admin team' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Remove DK' }))
    const row = screen.getByRole('listitem', { name: 'DK' })
    type('Reason', 'Leaving', row)
    fireEvent.click(within(row).getByRole('button', { name: 'Remove' }))
    expect((await screen.findByRole('alert')).textContent).toBe('There must always be one owner.')
    expect(service.log).toEqual([])
  })
})
