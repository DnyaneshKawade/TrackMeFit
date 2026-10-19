// A parent's yes for a teen (spec T-086). The teen shows a code; a parent
// with their own adult account enters it and says yes. The database checks
// every rule; this only calls it.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface ParentCode {
  code: string
  until: string
}

export interface Child {
  id: string
  name: string
  since: string
}

export interface FamilyStore {
  /** The teen's parent who said yes, or null. */
  myParent(): Promise<{ name: string; since: string } | null>
  /** A new code for a parent, for 7 days. The old one stops working. */
  newCode(): Promise<ParentCode>
  /** The child's name for a code, without using it up. */
  lookup(code: string): Promise<string>
  /** Says yes for the child; returns their name. */
  sayYes(code: string): Promise<string>
  /** The children this parent said yes for. */
  children(): Promise<Child[]>
  /** Takes back the yes; the teen waits for a parent again. */
  takeBack(childId: string): Promise<void>
}

/** Shows a code in two groups of four, like ABCD-1234. */
export const showParentCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`

/** The database's errors in plain words. */
export function familyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e)
  if (/code not found/.test(msg)) return 'This code doesn’t work. Ask for a new one.'
  if (/18 or older/.test(msg)) return 'Only a parent aged 18 or older can say yes.'
  if (/network|fetch/i.test(msg)) return 'No internet connection. Check it and try again.'
  return 'Something went wrong. Please try again.'
}

const clean = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '')

/** An in-memory stand-in, for screen tests. One teen and one parent share it. */
export function memoryFamilyStore(start: { child?: string; parent?: string; adult?: boolean; children?: Child[] } = {}): FamilyStore & { parentOk: boolean } {
  let code: string | null = null
  let children = [...(start.children ?? [])]
  let parent: { name: string; since: string } | null = start.parent ? { name: start.parent, since: '2026-10-19T10:00:00Z' } : null
  const store = {
    get parentOk() {
      return parent !== null
    },
    myParent: async () => parent,
    async newCode() {
      code = 'ABCD1234'
      return { code, until: '2026-10-26T10:00:00Z' }
    },
    async lookup(given: string) {
      if (start.adult === false) throw new Error('parent must be 18 or older')
      if (!code || clean(given) !== code) throw new Error('code not found')
      return start.child ?? 'Riya'
    },
    async sayYes(given: string) {
      const name = await store.lookup(given)
      code = null
      parent = { name: 'Meena', since: '2026-10-19T10:00:00Z' }
      children.push({ id: 'child1', name, since: '2026-10-19T10:00:00Z' })
      return name
    },
    children: async () => [...children],
    async takeBack(id: string) {
      children = children.filter((c) => c.id !== id)
      parent = null
    },
  }
  return store
}

export function supabaseFamilyStore(sb: SupabaseClient): FamilyStore {
  const call = async <T>(fn: string, args?: Record<string, unknown>) => {
    const { data, error } = await sb.rpc(fn, args)
    if (error) throw error
    return data as T
  }
  return {
    async myParent() {
      const rows = await call<{ name: string; since: string }[]>('my_parent')
      return rows[0] ?? null
    },
    async newCode() {
      const rows = await call<{ code: string; until: string }[]>('parent_code')
      return rows[0]
    },
    async lookup(code) {
      const rows = await call<{ name: string }[]>('child_for_code', { given: code })
      return rows[0].name
    },
    sayYes: (code) => call<string>('parent_say_yes', { given: code }),
    async children() {
      const rows = await call<{ child_id: string; name: string; since: string }[]>('my_children')
      return rows.map((r) => ({ id: r.child_id, name: r.name, since: r.since }))
    },
    async takeBack(childId) {
      await call('parent_take_back', { child: childId })
    },
  }
}
