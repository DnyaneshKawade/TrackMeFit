// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Requests } from './Requests'
import { memoryAdmin, type RequestRow } from './service'

afterEach(cleanup)

const request = (id: string, over: Partial<RequestRow> = {}): RequestRow => ({
  id,
  personId: `p-${id}`,
  email: `${id}@example.com`,
  name: '',
  note: 'My weight from 3 Oct is wrong',
  status: 'open',
  answer: '',
  createdAt: '2026-10-15T10:00:00Z',
  closedAt: null,
  daysLeft: 87,
  ...over,
})

describe('Requests page (T-042a5)', () => {
  it('6. lists open requests oldest first with days left; closing needs an answer and is logged', async () => {
    const service = memoryAdmin({
      me: 'dk',
      level: 'owner',
      step: 'on',
      requests: [
        request('new', { name: 'Asha', createdAt: '2026-10-17T10:00:00Z', daysLeft: 89 }),
        request('old', { name: 'Ravi', note: 'Delete my 2 Oct lunch', createdAt: '2026-07-10T10:00:00Z', daysLeft: -10 }),
        request('done', { name: 'Meera', status: 'closed', answer: 'Fixed', closedAt: '2026-10-10T10:00:00Z' }),
      ],
    })
    render(<Requests service={service} />)
    const items = await screen.findAllByRole('listitem')
    expect(items.map((li) => li.getAttribute('aria-label'))).toEqual(['Request from Ravi', 'Request from Asha'])
    expect(items[0].textContent).toContain('10 days late')
    expect(items[1].textContent).toContain('89 days left')

    const asha = items[1]
    fireEvent.click(within(asha).getByRole('button', { name: 'Answer Asha' }))
    expect(within(asha).getByRole('button', { name: 'Close' })).toHaveProperty('disabled', true)
    fireEvent.change(within(asha).getByLabelText('Answer for them'), { target: { value: 'Fixed it to 64 kg' } })
    fireEvent.click(within(asha).getByRole('button', { name: 'Close' }))
    await screen.findByRole('status')
    expect(service.log).toEqual(['close request p-new Fixed it to 64 kg'])
    expect(screen.getAllByRole('listitem').map((li) => li.getAttribute('aria-label'))).toEqual(['Request from Ravi'])

    fireEvent.click(screen.getByRole('tab', { name: 'Closed' }))
    await screen.findByText('Your answer: Fixed it to 64 kg')
    expect(screen.getAllByRole('listitem').map((li) => li.getAttribute('aria-label'))).toEqual(['Request from Asha', 'Request from Meera'])
  })

  it('6. only owners with the second step see requests', async () => {
    render(<Requests service={memoryAdmin({ me: 'x', level: 'content', step: 'on', requests: [request('a')] })} />)
    expect((await screen.findByRole('alert')).textContent).toBe('Only owners who used the second step can do this.')
  })
})
