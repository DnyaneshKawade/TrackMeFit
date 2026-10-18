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
}

/** Database errors in plain words. */
export function adminError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e)
  if (/no account with this email/.test(msg)) return 'No account uses this email.'
  if (/already an admin/.test(msg)) return 'This person is already an admin.'
  if (/at least one owner/.test(msg)) return 'There must always be one owner.'
  if (/reason is needed|violates check constraint/.test(msg)) return 'Please write a reason.'
  if (/not allowed/.test(msg)) return 'Only owners who used the second step can do this.'
  if (/invalid totp|invalid code|expired/i.test(msg)) return 'That code is wrong or too old. Try the new one.'
  return 'Something went wrong. Please try again.'
}

export function supabaseAdmin(sb: SupabaseClient): AdminService {
  const run = async (fn: string, args: Record<string, unknown>) => {
    const { error } = await sb.rpc(fn, args)
    if (error) throw error
  }
  return {
    async myLevel() {
      const { data } = await sb.from('user_roles').select('level').maybeSingle()
      return (data?.level as AdminLevel | undefined) ?? null
    },
    async secondStep() {
      const { data } = await sb.auth.mfa.getAuthenticatorAssuranceLevel()
      if (data?.currentLevel === 'aal2') return 'on'
      return data?.nextLevel === 'aal2' ? 'needs code' : 'not set up'
    },
    async setUp() {
      // A half-done set-up from before blocks a new one, so it goes first.
      const { data: list } = await sb.auth.mfa.listFactors()
      for (const f of list?.all ?? []) if (f.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: f.id })
      const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Track Me Fit admin' })
      if (error) throw error
      return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret }
    },
    async verify(code, factorId) {
      let id = factorId
      if (!id) {
        const { data } = await sb.auth.mfa.listFactors()
        id = data?.totp.find((f) => f.status === 'verified')?.id
      }
      if (!id) throw new Error('no factor')
      const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: id, code: code.replace(/\D/g, '') })
      if (error) throw error
    },
    async team() {
      const { data, error } = await sb.rpc('admin_team')
      if (error) throw error
      return ((data ?? []) as { user_id: string; email: string; name: string; level: AdminLevel; added_at: string; last_action_at: string | null }[]).map((r) => ({
        userId: r.user_id,
        email: r.email,
        name: r.name,
        level: r.level,
        addedAt: r.added_at,
        lastActionAt: r.last_action_at,
      }))
    },
    add: (email, level, reason) => run('add_admin', { person_email: email, new_level: level, why: reason }),
    setLevel: (userId, level, reason) => run('set_admin_level', { person: userId, new_level: level, why: reason }),
    remove: (userId, reason) => run('remove_admin', { person: userId, why: reason }),
  }
}

/** An in-memory stand-in with the same rules, for screen tests. */
export function memoryAdmin(opts: { me: string; level: AdminLevel | null; step?: SecondStep; team?: AdminMember[]; accounts?: Record<string, string> }): AdminService & { log: string[] } {
  let step: SecondStep = opts.step ?? 'not set up'
  const team = new Map((opts.team ?? []).map((m) => [m.userId, { ...m }]))
  const log: string[] = []
  const need = (reason: string) => {
    if (opts.level !== 'owner' || step !== 'on') throw new Error('not allowed')
    if (!reason.trim()) throw new Error('a reason is needed')
  }
  const owners = () => [...team.values()].filter((m) => m.level === 'owner').length
  return {
    log,
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
