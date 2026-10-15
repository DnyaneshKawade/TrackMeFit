// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Chat } from './Chat'
import { Clients } from './Clients'
import { YourCoach } from './YourCoach'
import { memoryChatStore, nudgeText, PAGE } from './chat'
import { emptyClient, memoryCoachStore } from './store'

afterEach(cleanup)

const URL = 'https://track-me-fit.example'
// A clock that moves one minute per message, so the order is clear.
const clock = (start = Date.UTC(2026, 9, 15, 4, 0)) => {
  let t = start
  return () => new Date((t += 60_000)).toISOString()
}

const send = async (text: string) => {
  fireEvent.change(await screen.findByLabelText(/^Message to/), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
}

describe('chat with the coach (T-026f)', () => {
  it('2. the person sends a message, the coach sees it as new on the client list, and opening it shows it as seen', async () => {
    const rows: Parameters<typeof memoryChatStore>[1] = []
    const now = clock()
    const person = memoryChatStore('neha', rows, now)
    const coach = memoryChatStore('coach', rows, now)

    render(<YourCoach store={memoryCoachStore({ coach: { id: 'l1', personId: 'coach', name: 'Kavita Rao' } })} chat={person} />)
    expect(await screen.findByText('No messages yet. Ask Kavita anything here.')).toBeTruthy()
    await send('Can I swap rice for roti?')
    expect(await screen.findByText('Can I swap rice for roti?')).toBeTruthy()
    cleanup()

    render(<Clients store={memoryCoachStore({ clients: [emptyClient('l1', 'Neha Shah')] })} chat={coach} />)
    expect(await screen.findByText('1 new message')).toBeTruthy()
    cleanup()

    render(<Chat store={coach} linkId="l1" name="Neha" appUrl={URL} />)
    expect(await screen.findByText('Can I swap rice for roti?')).toBeTruthy()
    await waitFor(async () => expect((await coach.unread()).size).toBe(0))
    cleanup()

    render(<Chat store={person} linkId="l1" name="Kavita" appUrl={URL} />)
    expect((await screen.findByText(/^You · /)).textContent).toMatch(/· Seen$/)
  })

  it('3. after sending, offers a WhatsApp nudge with the message, and an empty message is not sent', async () => {
    const store = memoryChatStore('coach', [], clock())
    render(<Chat store={store} linkId="l1" name="Neha" appUrl={URL} />)
    await send('   ')
    expect((await screen.findByRole('alert')).textContent).toBe('Write a message first.')
    expect(await store.list('l1')).toEqual([])

    await send('Two roti is fine.')
    const link = (await screen.findByRole('link', { name: 'Tell Neha on WhatsApp' })) as HTMLAnchorElement
    expect(link.href).toBe(`https://wa.me/?text=${encodeURIComponent(nudgeText('Two roti is fine.', URL))}`)
    expect(nudgeText('Two roti is fine.', URL)).toBe(`I sent you a message on Track Me Fit: "Two roti is fine." Open the app to reply: ${URL}`)
    expect(nudgeText('a'.repeat(150), URL)).toContain(`"${'a'.repeat(97)}…"`)
  })

  it('4. shows the latest messages first and loads earlier ones on request', async () => {
    const store = memoryChatStore('neha', [], clock())
    for (let i = 1; i <= PAGE + 5; i++) await store.send('l1', `Message ${i}`)
    render(<Chat store={store} linkId="l1" name="Kavita" appUrl={URL} />)
    expect(await screen.findByText(`Message ${PAGE + 5}`)).toBeTruthy()
    expect(screen.queryByText('Message 5')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Show earlier messages' }))
    expect(await screen.findByText('Message 1')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Show earlier messages' })).toBeNull()
    // Oldest at the top.
    const items = screen.getAllByRole('listitem').map((li) => li.querySelector('p')?.textContent)
    expect(items[0]).toBe('Message 1')
    expect(items[items.length - 1]).toBe(`Message ${PAGE + 5}`)
  })
})

describe('live chat (T-026h)', () => {
  it('2. a message from the other side shows at once in an open chat, and the sender sees "Seen" at once', async () => {
    const rows: Parameters<typeof memoryChatStore>[1] = []
    const listeners: Parameters<typeof memoryChatStore>[3] = new Set()
    const now = clock()
    const person = memoryChatStore('neha', rows, now, listeners)
    const coach = memoryChatStore('coach', rows, now, listeners)

    render(<Chat store={person} linkId="l1" name="Kavita" appUrl={URL} />)
    await screen.findByText('No messages yet. Ask Kavita anything here.')
    await send('Is curd okay at night?')
    expect((await screen.findByText(/^You · /)).textContent).not.toMatch(/Seen/)

    // The coach answers from another device while the person's chat is open.
    await coach.markRead('l1')
    await coach.send('l1', 'Yes, a small bowl is fine.')
    expect(await screen.findByText('Yes, a small bowl is fine.')).toBeTruthy()
    expect((await screen.findByText(/^You · .*Seen$/)).textContent).toMatch(/Seen$/)
    // The person has it open, so the coach's message is read straight away.
    await waitFor(async () => expect((await person.unread()).size).toBe(0))
    // Each message shows once.
    expect(screen.getAllByText('Is curd okay at night?')).toHaveLength(1)
  })

  it('3. stops listening when the chat closes', async () => {
    const listeners: Parameters<typeof memoryChatStore>[3] = new Set()
    const store = memoryChatStore('neha', [], clock(), listeners)
    const { unmount } = render(<Chat store={store} linkId="l1" name="Kavita" appUrl={URL} />)
    await screen.findByText(/No messages yet/)
    expect(listeners.size).toBe(1)
    unmount()
    expect(listeners.size).toBe(0)
  })
})
