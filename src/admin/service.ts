// Admin access (spec T-042a1): the admin's level, the second step at sign-in
// (a code from an app like Google Authenticator) and the admin team. The
// database checks every rule; this only calls it.

import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminLevel = 'content' | 'owner'

/** Where this sign-in stands with the second step. */
export type SecondStep = 'on' | 'needs code' | 'not set up'

export interface AdminMember {
  userId: string
  email: string
  name: string
  level: AdminLevel
  addedAt: string
  lastActionAt: string | null
}

/** One account on the People page (T-042a2). Account facts only, no health data. */
export interface PersonRow {
  userId: string
  email: string
  phone: string
  name: string
  role: 'user' | 'coach'
  joinedAt: string
  lastActiveAt: string | null
  blocked: boolean
  confirmed: boolean
  onboarded: boolean
  coachName: string | null
  adminLevel: AdminLevel | null
}

export type AccountAction = 'block' | 'unblock' | 'delete' | 'sign out' | 'resend confirm'

/** People shown per page. */
export const PEOPLE_PAGE = 50

export interface NewFactor {
  factorId: string
  /** A picture to scan, as an image link. */
  qr: string
  /** The same key, to type in by hand. */
  secret: string
}

export interface AdminService {
  /** This person's admin level, or null if they are not an admin. */
  myLevel(): Promise<AdminLevel | null>
  secondStep(): Promise<SecondStep>
  /** Starts setting up the code app. */
  setUp(): Promise<NewFactor>
  /** Checks a 6-digit code. With no factor id it uses the one already set up. */
  verify(code: string, factorId?: string): Promise<void>
  team(): Promise<AdminMember[]>
  add(email: string, level: AdminLevel, reason: string): Promise<void>
  setLevel(userId: string, level: AdminLevel, reason: string): Promise<void>
  remove(userId: string, reason: string): Promise<void>
  /** Accounts newest first, PEOPLE_PAGE at a time; `after` is the last row shown. */
  people(search: string, after?: PersonRow): Promise<PersonRow[]>
  /** Block, unblock, delete, sign out everywhere, or resend the confirm email. */
  accountAction(userId: string, action: AccountAction, reason: string): Promise<void>
  endCoachLink(userId: string, reason: string): Promise<void>
  setRole(userId: string, role: 'user' | 'coach', reason: string): Promise<void>
}

/** Database errors in plain words. */
export function adminError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e)
  if (/no account with this email/.test(msg)) return 'No account uses this email.'
  if (/already an admin/.test(msg)) return 'This person is already an admin.'
  if (/at least one owner/.test(msg)) return 'There must always be one owner.'
  if (/reason is needed|violates check constraint/.test(msg)) return 'Please write a reason.'
  if (/not on yourself/.test(msg)) return "You can't do this to your own account."
  if (/remove them as admin first/.test(msg)) return 'Remove them as admin first.'
  if (/already confirmed/.test(msg)) return 'Their email is already confirmed.'
  if (/no coach link/.test(msg)) return 'They have no coach now.'
  if (/coach has clients/.test(msg)) return 'End their client links first.'
  if (/already this role/.test(msg)) return 'They already have this role.'
  if (/action failed/.test(msg)) return "It didn't work. Please try again."
  if (/not allowed/.test(msg)) return 'Only owners who used the second step can do this.'
  if (/invalid totp|invalid code|expired/i.test(msg)) return 'That code is wrong or too old. Try the new one.'
  return 'Something went wrong. Please try again.'
}

/** What the app shell needs: the level now, the rest only when the tab opens. */
export interface AdminAccess {
  level(): Promise<AdminLevel | null>
  load(): Promise<AdminService>
}

export const supabaseAdminAccess = (sb: SupabaseClient): AdminAccess => ({
  async level() {
    const { data } = await sb.from('user_roles').select('level').maybeSingle()
    return (data?.level as AdminLevel | undefined) ?? null
  },
  load: () => import('./supabaseAdmin').then((m) => m.supabaseAdmin(sb)),
})

/** Wraps a ready service, for tests. */
export const readyAccess = (service: AdminService): AdminAccess => ({ level: () => service.myLevel(), load: async () => service })

/** An in-memory stand-in with the same rules, for screen tests. */
export function memoryAdmin(opts: { me: string; level: AdminLevel | null; step?: SecondStep; team?: AdminMember[]; accounts?: Record<string, string>; people?: PersonRow[] }): AdminService & { log: string[] } {
  let step: SecondStep = opts.step ?? 'not set up'
  const team = new Map((opts.team ?? []).map((m) => [m.userId, { ...m }]))
  const log: string[] = []
  const need = (reason: string) => {
    if (opts.level !== 'owner' || step !== 'on') throw new Error('not allowed')
    if (!reason.trim()) throw new Error('a reason is needed')
  }
  const owners = () => [...team.values()].filter((m) => m.level === 'owner').length
  const people = new Map((opts.people ?? []).map((p) => [p.userId, { ...p }]))
  const person = (id: string) => {
    const p = people.get(id)
    if (!p) throw new Error('no such account')
    return p
  }
  return {
    log,
    async people(search, after) {
      need('x')
      const q = search.trim().toLowerCase()
      const all = [...people.values()]
        .filter((p) => !q || [p.email, p.name, p.phone].some((v) => v.toLowerCase().includes(q)))
        .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt) || b.userId.localeCompare(a.userId))
      const start = after ? all.findIndex((p) => p.userId === after.userId) + 1 : 0
      return all.slice(start, start + PEOPLE_PAGE).map((p) => ({ ...p }))
    },
    async accountAction(userId, action, reason) {
      need(reason)
      const p = person(userId)
      if ((action === 'block' || action === 'delete') && userId === opts.me) throw new Error('not on yourself')
      if ((action === 'block' || action === 'delete') && p.adminLevel) throw new Error('remove them as admin first')
      if (action === 'resend confirm' && p.confirmed) throw new Error('already confirmed')
      log.push(`${action} ${userId} ${reason}`)
      if (action === 'block') p.blocked = true
      if (action === 'unblock') p.blocked = false
      if (action === 'delete') people.delete(userId)
    },
    async endCoachLink(userId, reason) {
      need(reason)
      const p = person(userId)
      if (!p.coachName) throw new Error('no coach link')
      p.coachName = null
      log.push(`end coach link ${userId} ${reason}`)
    },
    async setRole(userId, role, reason) {
      need(reason)
      const p = person(userId)
      if (p.role === role) throw new Error('already this role')
      p.role = role
      log.push(`change role ${userId} ${reason}`)
    },
    myLevel: async () => opts.level,
    secondStep: async () => step,
    setUp: async () => ({ factorId: 'f1', qr: 'data:image/svg+xml;utf8,<svg/>', secret: 'ABCD EFGH' }),
    async verify(code) {
      if (code.replace(/\D/g, '') !== '123456') throw new Error('Invalid TOTP code entered')
      step = 'on'
    },
    async team() {
      need('x')
      return [...team.values()]
    },
    async add(email, level, reason) {
      need(reason)
      const userId = opts.accounts?.[email.trim().toLowerCase()]
      if (!userId) throw new Error('no account with this email')
      if (team.has(userId)) throw new Error('already an admin')
      team.set(userId, { userId, email: email.trim().toLowerCase(), name: '', level, addedAt: '2026-10-18', lastActionAt: null })
      log.push(`add admin ${userId} ${reason}`)
    },
    async setLevel(userId, level, reason) {
      need(reason)
      const m = team.get(userId)
      if (!m) throw new Error('not an admin')
      if (m.level === 'owner' && level !== 'owner' && owners() === 1) throw new Error('there must be at least one owner')
      m.level = level
      log.push(`change admin level ${userId} ${reason}`)
    },
    async remove(userId, reason) {
      need(reason)
      const m = team.get(userId)
      if (!m) throw new Error('not an admin')
      if (m.level === 'owner' && owners() === 1) throw new Error('there must be at least one owner')
      team.delete(userId)
      log.push(`remove admin ${userId} ${reason}`)
    },
  }
}
