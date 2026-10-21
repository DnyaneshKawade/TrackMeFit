// A person's own data (spec T-042a5): download it all, ask for a change, or
// delete the account. The database and the delete-account function check
// every rule; this only calls them.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface DataRequest {
  id: string
  note: string
  status: 'open' | 'closed'
  answer: string
  createdAt: string
  closedAt: string | null
  /** "coach" asks to become a coach (T-103); "change" fixes data. */
  kind: 'change' | 'coach'
}

export interface DataStore {
  /** Every table's rows for this person, with photo links that last 7 days. */
  exportAll(): Promise<Record<string, unknown>>
  /** This person's requests, newest first. */
  requests(): Promise<DataRequest[]>
  ask(note: string): Promise<void>
  /** Asks the owner to make this account a coach (T-103). */
  askToCoach(note: string): Promise<void>
  /** Takes back a request nobody has answered yet (T-124). */
  withdraw(id: string): Promise<void>
  /** Deletes the account and all its data, then ends the sign-in here. */
  deleteMe(): Promise<void>
}

/** Photo links in the download last this long. */
export const LINK_SECONDS = 7 * 24 * 3600

/** The download's file name, such as track-me-fit-data-2026-10-18.json. */
export const fileName = (today: string) => `track-me-fit-data-${today}.json`

/** Saves text as a file on this device. */
export function saveFile(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** The database's errors in plain words. */
export function dataError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e)
  if (/remove them as admin first/.test(msg)) return 'You are an admin. Ask another owner to remove you as admin first.'
  if (/not signed in/.test(msg)) return 'Please sign in again.'
  if (/duplicate key/.test(msg)) return 'We already have your request.'
  if (/violates check constraint/.test(msg)) return 'Please write what is wrong, in 1,000 letters or less.'
  if (/network|fetch/i.test(msg)) return 'No internet connection. Check it and try again.'
  return 'Something went wrong. Please try again.'
}

/** An in-memory stand-in, for screen tests. */
export function memoryDataStore(opts: { data?: Record<string, unknown>; requests?: DataRequest[]; refuseDelete?: string } = {}): DataStore & { deleted: boolean } {
  const requests = [...(opts.requests ?? [])]
  const store = {
    deleted: false,
    exportAll: async () => ({ ...(opts.data ?? {}) }),
    requests: async () => [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    async ask(note: string) {
      if (!note.trim() || note.length > 1000) throw new Error('violates check constraint')
      requests.push({ id: `r${requests.length + 1}`, note: note.trim(), status: 'open', answer: '', createdAt: new Date().toISOString(), closedAt: null, kind: 'change' })
    },
    async withdraw(id: string) {
      const i = requests.findIndex((r) => r.id === id && r.status === 'open')
      if (i >= 0) requests.splice(i, 1)
    },
    async askToCoach(note: string) {
      if (requests.some((r) => r.kind === 'coach' && r.status === 'open')) throw new Error('duplicate key')
      requests.push({ id: `r${requests.length + 1}`, note: note.trim(), status: 'open', answer: '', createdAt: new Date().toISOString(), closedAt: null, kind: 'coach' })
    },
    async deleteMe() {
      if (opts.refuseDelete) throw new Error(opts.refuseDelete)
      store.deleted = true
    },
  }
  return store
}

/** Adds a 7-day link to each row that names a file in this bucket. */
async function withLinks(sb: SupabaseClient, bucket: string, rows: unknown) {
  const list = (Array.isArray(rows) ? rows : []) as { path?: string }[]
  const paths = list.map((r) => r.path).filter((p): p is string => !!p)
  if (!paths.length) return list
  // One request signs every link.
  const { data, error } = await sb.storage.from(bucket).createSignedUrls(paths, LINK_SECONDS)
  if (error) throw error
  const urls = new Map((data ?? []).map((s) => [s.path, s.signedUrl]))
  return list.map((r) => ({ ...r, link: (r.path && urls.get(r.path)) || null }))
}

export function supabaseDataStore(sb: SupabaseClient, userId: string): DataStore {
  return {
    async exportAll() {
      const { data, error } = await sb.rpc('export_my_data')
      if (error) throw error
      const all = data as Record<string, unknown>
      const [photos, certificates] = await Promise.all([
        withLinks(sb, 'progress-photos', all.progress_photos),
        withLinks(sb, 'coach-certificates', all.coach_certificates),
      ])
      return { ...all, progress_photos: photos, coach_certificates: certificates }
    },
    async requests() {
      const { data, error } = await sb
        .from('data_requests')
        .select('id, note, status, answer, created_at, closed_at, kind')
        .eq('person_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []).map((r) => ({ id: r.id, note: r.note, status: r.status, answer: r.answer, createdAt: r.created_at, closedAt: r.closed_at, kind: r.kind }))
    },
    async ask(note) {
      const { error } = await sb.from('data_requests').insert({ note: note.trim() })
      if (error) throw error
    },
    async askToCoach(note) {
      const { error } = await sb.from('data_requests').insert({ note: note.trim(), kind: 'coach' })
      if (error) throw error
    },
    async withdraw(id) {
      const { error } = await sb.from('data_requests').delete().eq('id', id).eq('status', 'open')
      if (error) throw error
    },
    async deleteMe() {
      // Runs on the server, which holds the key that removes a sign-in.
      const { error } = await sb.functions.invoke('delete-account', { body: { confirm: 'DELETE' } })
      if (error) {
        const body = await (error as { context?: Response }).context?.json?.().catch(() => null)
        throw new Error((body as { error?: string } | null)?.error ?? error.message)
      }
      // The account is gone, so only this device's sign-in is left to end.
      await sb.auth.signOut({ scope: 'local' })
    },
  }
}
