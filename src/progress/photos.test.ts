import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { checkPhotoFile, fitWithin, supabasePhotoStore, wholeDays, type Photo } from './photos'

const photo = (id: string, date: string, pose: Photo['pose'] = 'front'): Photo => ({ id, date, pose, url: id })

describe('progress photos (T-022b)', () => {
  it('2. makes a photo smaller: longest side 1280 px, never bigger than it was', () => {
    expect(fitWithin(3000, 4000)).toEqual({ width: 960, height: 1280 })
    expect(fitWithin(4032, 3024)).toEqual({ width: 1280, height: 960 })
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 })
  })

  it('4. refuses files that are not pictures or are over 15 MB', () => {
    expect(checkPhotoFile({ type: 'application/pdf', size: 1000 })).toBe('Pick a photo. That file is not a picture.')
    expect(checkPhotoFile({ type: 'image/jpeg', size: 16 * 1024 * 1024 })).toBe('That photo is over 15 MB. Pick a smaller one.')
    expect(checkPhotoFile({ type: 'image/heic', size: 3 * 1024 * 1024 })).toBeNull()
  })

  it('6. a full page holds whole days; a day cut in two moves to the next page', () => {
    const list = [photo('a', '2026-10-15'), photo('b', '2026-10-01'), photo('c', '2026-09-15', 'front')]
    expect(wholeDays(list, 3)).toEqual({ photos: list, more: false })
    expect(wholeDays(list, 2)).toEqual({ photos: list.slice(0, 2), more: true })
    const sameDay = [photo('a', '2026-10-15'), photo('b', '2026-10-01'), photo('c', '2026-10-01', 'side')]
    expect(wholeDays(sameDay, 2)).toEqual({ photos: sameDay.slice(0, 1), more: true })
  })

  it('signs every link on a page in one request, and removes the file when the record fails', async () => {
    const calls: string[] = []
    const rows = [
      { id: '1', taken_on: '2026-10-01', pose: 'side', path: 'u/1.jpg' },
      { id: '2', taken_on: '2026-10-15', pose: 'front', path: 'u/2.jpg' },
    ]
    let insertError: Error | null = null
    const query = {
      select: () => query,
      eq: () => query,
      lt: () => query,
      order: () => query,
      limit: async () => ({ data: rows, error: null }),
      insert: async () => ({ error: insertError }),
    }
    const sb = {
      from: () => query,
      storage: {
        from: () => ({
          createSignedUrls: async (paths: string[]) => {
            calls.push(`sign ${paths.length}`)
            return { data: paths.map((p) => ({ path: p, signedUrl: `https://x/${p}` })), error: null }
          },
          upload: async (path: string) => (calls.push(`upload ${path}`), { error: null }),
          remove: async (paths: string[]) => (calls.push(`remove ${paths.join()}`), { error: null }),
        }),
      },
    } as unknown as SupabaseClient
    const store = supabasePhotoStore(sb, 'u', () => 'new')

    const page = await store.photos()
    expect(page.photos.map((p) => [p.date, p.pose, p.url])).toEqual([
      ['2026-10-15', 'front', 'https://x/u/2.jpg'],
      ['2026-10-01', 'side', 'https://x/u/1.jpg'],
    ])
    expect(calls).toEqual(['sign 2'])

    insertError = new Error('duplicate key')
    await expect(store.addPhoto('2026-10-15', 'front', new Blob())).rejects.toThrow('duplicate key')
    expect(calls.slice(1)).toEqual(['upload u/new.jpg', 'remove u/new.jpg'])
  })
})
