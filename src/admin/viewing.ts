// View as a person (spec T-042a4): an owner signs in as a person, and is
// signed back in as themselves on Exit or after 30 minutes with no activity.
// The owner's own sign-in waits on the device until then.

import type { SupabaseClient } from '@supabase/supabase-js'

/** A view in progress, kept on the device so it survives a reload. */
export interface ViewMarker {
  viewId: string
  /** Who is being viewed, for the bar. */
  name: string
  /** The owner's own sign-in, put back when the view ends. */
  adminAccess: string
  adminRefresh: string
  /** Last tap or key press, in milliseconds. */
  lastActive: number
}

export const VIEW_KEY = 'tmf-view'
/** A view ends after this long with no activity. */
export const VIEW_IDLE_MS = 30 * 60_000

export const isIdle = (m: ViewMarker, now: number) => now - m.lastActive >= VIEW_IDLE_MS

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function readMarker(storage: Store): ViewMarker | null {
  try {
    const m = JSON.parse(storage.getItem(VIEW_KEY) ?? 'null') as ViewMarker | null
    return m && typeof m.viewId === 'string' && typeof m.lastActive === 'number' ? m : null
  } catch {
    return null
  }
}

export interface Viewing {
  current(): ViewMarker | null
  /** Notes activity now. */
  touch(now: number): void
  /** Ends the view and signs the owner back in. `lastActive` is when the view went idle. */
  exit(lastActive?: number): Promise<void>
}

export function supabaseViewing(sb: SupabaseClient, storage: Store): Viewing {
  return {
    current: () => readMarker(storage),
    touch(now) {
      const m = readMarker(storage)
      if (m) storage.setItem(VIEW_KEY, JSON.stringify({ ...m, lastActive: now }))
    },
    async exit(lastActive) {
      const m = readMarker(storage)
      if (!m) return
      storage.removeItem(VIEW_KEY)
      // Ends only the sign-in made for the view; the person's own phones stay signed in.
      await sb.auth.signOut({ scope: 'local' }).catch(() => undefined)
      const { error } = await sb.auth.setSession({ access_token: m.adminAccess, refresh_token: m.adminRefresh })
      if (error) return
      await sb.rpc('admin_end_view', { view: m.viewId, last_active: lastActive ? new Date(lastActive).toISOString() : null })
    },
  }
}

/** For tests: a view kept in memory. */
export function memoryViewing(start: ViewMarker | null, onExit: (lastActive?: number) => void = () => undefined): Viewing & { marker: () => ViewMarker | null } {
  let m = start
  return {
    marker: () => m,
    current: () => m,
    touch(now) {
      if (m) m = { ...m, lastActive: now }
    },
    async exit(lastActive) {
      m = null
      onExit(lastActive)
    },
  }
}
