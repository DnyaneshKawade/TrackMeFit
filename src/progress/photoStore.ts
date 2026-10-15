// Progress photos (spec T-022b): a front, side or back photo per day, kept in
// a private storage bucket. Photos are made smaller on the phone first.

import type { SupabaseClient } from '@supabase/supabase-js'

export type Pose = 'front' | 'side' | 'back'
export const POSES: { pose: Pose; label: string }[] = [
  { pose: 'front', label: 'Front' },
  { pose: 'side', label: 'Side' },
  { pose: 'back', label: 'Back' },
]

export interface Photo {
  id: string
  date: string
  pose: Pose
  /** A link to show the picture; from the server it lasts an hour. */
  url: string
}

export interface PhotoStore {
  /** Photos newest first, up to `limit`, taken before `before` when given.
   * A page holds whole days; `more` says older photos are left. */
  photos(opts?: { before?: string; limit?: number }): Promise<PhotoPage>
  addPhoto(date: string, pose: Pose, image: Blob): Promise<void>
  removePhoto(id: string): Promise<void>
}

export interface PhotoPage {
  photos: Photo[]
  more: boolean
}

export const PHOTO_PAGE = 30
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024
export const PHOTO_SIDE = 1280
export const BUCKET = 'progress-photos'

/** Why a picked file can't be used, or null when it can. */
export function checkPhotoFile(file: { type: string; size: number }): string | null {
  if (!file.type.startsWith('image/')) return 'Pick a photo. That file is not a picture.'
  if (file.size > MAX_PHOTO_BYTES) return 'That photo is over 15 MB. Pick a smaller one.'
  return null
}

/** Width and height that fit inside `max` on the longest side, never larger than now. */
export function fitWithin(width: number, height: number, max = PHOTO_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/** Redraws the photo smaller as a JPEG. Drawing it again also drops hidden
 * details such as location. Phone photos keep the right way up. */
export async function shrinkImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const { width, height } = fitWithin(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not make the photo smaller'))), 'image/jpeg', 0.8),
  )
}

/** A page from up to `limit + 1` photos, newest first. The extra one shows
 * more are left. A day cut in two moves to the next page. */
export function wholeDays(photos: Photo[], limit: number): PhotoPage {
  if (photos.length <= limit) return { photos, more: false }
  const page = photos.slice(0, limit)
  const next = photos[limit].date
  const kept = page.filter((p) => p.date !== next)
  return { photos: kept.length ? kept : page, more: true }
}

const newestFirst = (a: Photo, b: Photo) => b.date.localeCompare(a.date) || POSES.findIndex((p) => p.pose === a.pose) - POSES.findIndex((p) => p.pose === b.pose)

export function memoryPhotoStore(start: Omit<Photo, 'url'>[] = []): PhotoStore {
  const all = new Map(start.map((p) => [p.id, { ...p, url: `memory:${p.id}` }]))
  let n = 0
  return {
    async photos({ before, limit = PHOTO_PAGE } = {}) {
      return wholeDays([...all.values()].filter((p) => !before || p.date < before).sort(newestFirst).slice(0, limit + 1), limit)
    },
    async addPhoto(date, pose) {
      if ([...all.values()].some((p) => p.date === date && p.pose === pose)) throw new Error('duplicate key')
      const id = `photo-${++n}`
      all.set(id, { id, date, pose, url: `memory:${id}` })
    },
    async removePhoto(id) {
      all.delete(id)
    },
  }
}

interface PhotoRow {
  id: string
  taken_on: string
  pose: Pose
  path: string
}

/** Records in `progress_photos`, files in the private bucket. Row-level
 * security lets the person write and their active coach read. */
export function supabasePhotoStore(sb: SupabaseClient, userId: string, newId: () => string = () => crypto.randomUUID()): PhotoStore {
  const files = () => sb.storage.from(BUCKET)
  return {
    async photos({ before, limit = PHOTO_PAGE } = {}) {
      let q = sb.from('progress_photos').select('id, taken_on, pose, path').eq('user_id', userId)
      if (before) q = q.lt('taken_on', before)
      const { data, error } = await q.order('taken_on', { ascending: false }).limit(limit + 1)
      if (error) throw error
      const rows = data as PhotoRow[]
      if (!rows.length) return { photos: [], more: false }
      // One request signs every link on the page.
      const signed = await files().createSignedUrls(rows.map((r) => r.path), 3600)
      if (signed.error) throw signed.error
      const urls = new Map(signed.data.map((s) => [s.path, s.signedUrl]))
      const photos = rows.map((r) => ({ id: r.id, date: r.taken_on, pose: r.pose, url: urls.get(r.path) ?? '' })).sort(newestFirst)
      return wholeDays(photos, limit)
    },
    async addPhoto(date, pose, image) {
      const path = `${userId}/${newId()}.jpg`
      const up = await files().upload(path, image, { contentType: 'image/jpeg', upsert: false })
      if (up.error) throw up.error
      const { error } = await sb.from('progress_photos').insert({ user_id: userId, taken_on: date, pose, path })
      if (error) {
        // Leave nothing half-saved.
        await files().remove([path])
        throw error
      }
    },
    async removePhoto(id) {
      // The record goes first: without it, no one else can read the file.
      const { data, error } = await sb.from('progress_photos').delete().eq('id', id).eq('user_id', userId).select('path')
      if (error) throw error
      const paths = (data as { path: string }[]).map((r) => r.path)
      if (paths.length) {
        const removed = await files().remove(paths)
        if (removed.error) throw removed.error
      }
    },
  }
}
