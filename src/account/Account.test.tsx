// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Account } from './Account'
import { memoryDataStore } from './data'

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
        requests: [{ id: 'r0', note: 'Lunch on 2 Oct is wrong', status: 'closed', answer: 'Removed it', createdAt: '2026-10-02T10:00:00Z', closedAt: '2026-10-04T10:00:00Z' }],
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
