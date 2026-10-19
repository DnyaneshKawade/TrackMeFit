// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Security } from './Security'

afterEach(cleanup)

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('sign-in and security (T-091)', () => {
  it('1. shows the email and how you sign in; a Google user sees no password or email rows', () => {
    render(<Security email="asha@example.com" signInWith="google" changePassword={vi.fn()} changeEmail={vi.fn()} />)
    const part = screen.getByRole('region', { name: 'Sign-in and security' })
    expect(within(part).getByText('asha@example.com')).toBeTruthy()
    expect(within(part).getByText('Google')).toBeTruthy()
    expect(within(part).queryByRole('button', { name: 'Change password' })).toBeNull()
    expect(within(part).queryByRole('button', { name: 'Change email' })).toBeNull()
  })

  it('2. changing the password needs the old one; a wrong old password shows an error', async () => {
    const changePassword = vi.fn().mockRejectedValueOnce(new Error('old password wrong')).mockResolvedValue(undefined)
    render(<Security email="asha@example.com" signInWith="email" changePassword={changePassword} />)
    expect(screen.getByText('Email and password')).toBeTruthy()
    click('Change password')
    type('New password', 'newpass123')
    type('Type it again', 'newpass123')
    click('Save new password')
    expect((await screen.findByRole('alert')).textContent).toBe('Type your old password.')
    expect(changePassword).not.toHaveBeenCalled()
    type('Old password', 'oldpass1')
    type('Type it again', 'newpass124')
    click('Save new password')
    expect((await screen.findByRole('alert')).textContent).toBe('The two passwords are not the same.')
    type('Type it again', 'newpass123')
    click('Save new password')
    expect((await screen.findByRole('alert')).textContent).toBe('Your old password is wrong.')
    click('Save new password')
    expect((await screen.findByRole('status')).textContent).toBe('Your new password is saved.')
    expect(changePassword).toHaveBeenLastCalledWith('oldpass1', 'newpass123')
  })

  it('3. changing the email says to check both inboxes', async () => {
    const changeEmail = vi.fn().mockResolvedValue(undefined)
    render(<Security email="asha@example.com" signInWith="email" changeEmail={changeEmail} />)
    click('Change email')
    type('New email', 'asha@example.com')
    click('Send links')
    expect((await screen.findByRole('alert')).textContent).toBe('This is already your email.')
    type('New email', 'asha.new@example.com')
    click('Send links')
    expect((await screen.findByRole('status')).textContent).toBe(
      'We sent a link to asha@example.com and to asha.new@example.com. Open both links to finish.',
    )
    expect(changeEmail).toHaveBeenCalledWith('asha.new@example.com')
  })
})
