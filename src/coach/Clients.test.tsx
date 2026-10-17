// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Clients } from './Clients'
import { emptyClient, inviteMessage, memoryCoachStore } from './store'

afterEach(cleanup)

const TODAY = '2026-10-15'

describe('clients tab (T-026a)', () => {
  it('1. makes a one-time code with WhatsApp sharing', async () => {
    render(<Clients store={memoryCoachStore()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Invite a client' }))
    expect((await screen.findByText(/^ABCDE-/)).textContent).toBe('ABCDE-00001')
    expect(screen.getByText(/It works once, until/)).toBeTruthy()
    const share = screen.getByRole('link', { name: 'Share on WhatsApp' }) as HTMLAnchorElement
    expect(share.href).toBe(`https://wa.me/?text=${encodeURIComponent(inviteMessage('ABCDE00001'))}`)
    expect(inviteMessage('ABCDE00001')).toMatch(/Enter this code under Your coach: ABCDE-00001$/)
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy()
  })

  it('6. ends a link after a confirm', async () => {
    const store = memoryCoachStore({ clients: [emptyClient('l2', 'Ravi'), emptyClient('l1', 'Asha')] })
    render(<Clients store={store} today={TODAY} />)
    const list = await screen.findByRole('region', { name: 'Your clients' })
    expect(await within(list).findByText('Your clients (2 of 30)')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'End link with Ravi' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes, end' }))
    await within(list).findByText('Your clients (1 of 30)')
    expect((await store.clients(TODAY)).map((c) => c.name)).toEqual(['Asha'])
  })

  it('6 (T-026b). lists the clients who need attention first, each with its reasons', async () => {
    const onTrack = {
      ...emptyClient('l1', 'Asha'),
      lastFoodOn: TODAY,
      weighIns: [{ date: TODAY, kg: 60 }],
    }
    const behind = { ...emptyClient('l2', 'Ravi'), trainingDays: 3 }
    render(<Clients store={memoryCoachStore({ clients: [onTrack, behind] })} today={TODAY} />)
    const items = await screen.findAllByRole('listitem', { name: /Asha|Ravi/ })
    expect(items.map((li) => li.getAttribute('aria-label'))).toEqual(['Ravi', 'Asha'])
    expect(within(items[0]).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'No food logged yet.',
      'No workouts logged yet.',
      'No weigh-in yet.',
    ])
    expect(within(items[1]).getByText('On track this week.')).toBeTruthy()
  })

  it('1 (T-026i). shows the client count against the limit and explains when it is reached', async () => {
    render(<Clients store={memoryCoachStore({ clients: [emptyClient('l1', 'Asha'), emptyClient('l2', 'Ravi')], limit: 2 })} today={TODAY} />)
    const list = await screen.findByRole('region', { name: 'Your clients' })
    expect(await within(list).findByText('Your clients (2 of 2)')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Invite a client' }))
    expect((await screen.findByRole('alert')).textContent).toBe('You have 2 clients, the most allowed now. End a link to invite someone new.')
    expect(screen.queryByText(/^ABCDE-/)).toBeNull()
  })
})
