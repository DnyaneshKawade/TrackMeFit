// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Photos } from './Photos'
import { memoryPhotoStore, type PhotoStore } from './photoStore'
import { shiftDate } from '../log/types'

afterEach(cleanup)

const TODAY = '2026-10-15'
const pick = (label: string, file: File) => fireEvent.change(screen.getByLabelText(label), { target: { files: [file] } })
const jpeg = () => new File(['x'], 'me.jpg', { type: 'image/jpeg' })

describe('progress photos (T-022b)', () => {
  it('1, 2. saves a smaller photo for today under the chosen pose and shows it under today’s date', async () => {
    const shrunk: Blob[] = []
    const store = memoryPhotoStore()
    const added: string[] = []
    const watching: PhotoStore = { ...store, addPhoto: async (d, p, img) => (added.push(`${d} ${p}`), store.addPhoto(d, p, img)) }
    render(<Photos store={watching} today={TODAY} shrink={async (f) => (shrunk.push(f), new Blob(['small']))} />)
    expect(await screen.findByText(/Only you and your coach, if you have one, can see these/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Side' }))
    pick('Add today’s side photo', jpeg())
    expect(await screen.findByRole('img', { name: 'Side, 15 Oct' })).toBeTruthy()
    expect(shrunk).toHaveLength(1)
    expect(added).toEqual([`${TODAY} side`])
  })

  it('3. refuses a second photo of the same pose today', async () => {
    const store = memoryPhotoStore([{ id: 'a', date: TODAY, pose: 'front' }])
    render(<Photos store={store} today={TODAY} shrink={async (f) => f} />)
    await screen.findByRole('img', { name: 'Front, 15 Oct' })
    pick('Add today’s front photo', jpeg())
    expect((await screen.findByRole('alert')).textContent).toBe('You already have a front photo for today. Remove it first.')
    expect((await store.photos()).photos).toHaveLength(1)
  })

  it('4. refuses a file that is not a picture', async () => {
    const store = memoryPhotoStore()
    render(<Photos store={store} today={TODAY} shrink={async (f) => f} />)
    await screen.findByText(/Take a photo every two to four weeks/)
    pick('Add today’s front photo', new File(['x'], 'notes.pdf', { type: 'application/pdf' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Pick a photo. That file is not a picture.')
    expect((await store.photos()).photos).toHaveLength(0)
  })

  it('5. removes a photo', async () => {
    const store = memoryPhotoStore([{ id: 'a', date: TODAY, pose: 'back' }])
    render(<Photos store={store} today={TODAY} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Remove back photo from 15 Oct' }))
    expect(await screen.findByText(/Take a photo every two to four weeks/)).toBeTruthy()
    expect((await store.photos()).photos).toHaveLength(0)
  })

  it('6. shows the 30 newest first, with "Show older" for the rest', async () => {
    const start = Array.from({ length: 12 }, (_, i) => shiftDate(TODAY, -14 * i)).flatMap((date, i) =>
      (['front', 'side', 'back'] as const).map((pose) => ({ id: `${i}-${pose}`, date, pose })),
    )
    render(<Photos store={memoryPhotoStore(start)} today={TODAY} />)
    const section = await screen.findByRole('region', { name: 'Progress photos' })
    await within(section).findByRole('img', { name: 'Front, 15 Oct' })
    expect(within(section).getAllByRole('img')).toHaveLength(30)
    fireEvent.click(screen.getByRole('button', { name: 'Show older' }))
    const oldest = new Date(shiftDate(TODAY, -14 * 11) + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    await within(section).findByRole('img', { name: `Front, ${oldest}` })
    expect(within(section).getAllByRole('img')).toHaveLength(36)
    expect(screen.queryByRole('button', { name: 'Show older' })).toBeNull()
  })
})
