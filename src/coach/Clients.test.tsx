// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Clients } from './Clients'
import { inviteMessage, memoryCoachStore } from './store'

afterEach(cleanup)

describe('clients tab (T-026a)', () => {
  it('1. makes a one-time code with WhatsApp sharing', async () => {
    render(<Clients store={memoryCoachStore()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Invite a client' }))
    expect((await screen.findByText(/^ABCDE-/)).textContent).toBe('ABCDE-00001')
    expect(screen.getByText(/It works once, until/)).toBeTruthy()
    const share = screen.getByRole('link', { name: 'Share on WhatsApp' }) as HTMLAnchorElement
    expect(share.href).toBe(`https://wa.me/?text=${encodeURIComponent(inviteMessage('ABCDE00001'))}`)
    expect(inviteMessage('ABCDE00001')).toMatch(/enter this code under Your coach: ABCDE-00001$/)
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy()
  })

  it('6. lists clients by name and ends a link after a confirm', async () => {
    const store = memoryCoachStore({
      clients: [
        { id: 'l2', personId: 'p2', name: 'Ravi' },
        { id: 'l1', personId: 'p1', name: 'Asha' },
      ],
    })
    render(<Clients store={store} />)
    const list = await screen.findByRole('region', { name: 'Your clients' })
    expect(await within(list).findByText('Your clients (2)')).toBeTruthy()
    expect(within(list).getAllByRole('listitem').map((li) => li.firstChild?.textContent)).toEqual(['Asha', 'Ravi'])
    fireEvent.click(screen.getByRole('button', { name: 'End link with Ravi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, end' }))
    await within(list).findByText('Your clients (1)')
    expect((await store.clients()).map((c) => c.name)).toEqual(['Asha'])
  })
})
