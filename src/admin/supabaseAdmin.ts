// Supabase calls for the Admin tab (T-042a1, T-042a2). Loaded only when an
// admin opens the tab.

import type { SupabaseClient } from '@supabase/supabase-js'
import { PEOPLE_PAGE, type AdminLevel, type AdminService } from './service'

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
    async people(search, after) {
      const { data, error } = await sb.rpc('admin_people', { search, before: after?.joinedAt ?? null, before_id: after?.userId ?? null, lim: PEOPLE_PAGE })
      if (error) throw error
      return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
        userId: r.user_id as string,
        email: r.email as string,
        phone: r.phone as string,
        name: r.name as string,
        role: r.role as 'user' | 'coach',
        joinedAt: r.joined_at as string,
        lastActiveAt: (r.last_active_at as string | null) ?? null,
        blocked: !!r.blocked,
        confirmed: !!r.confirmed,
        onboarded: !!r.onboarded,
        coachName: (r.coach_name as string | null) ?? null,
        adminLevel: (r.admin_level as AdminLevel | null) ?? null,
      }))
    },
    async accountAction(userId, action, reason) {
      // Runs on the server, which holds the key for the Auth admin API.
      const { error } = await sb.functions.invoke('admin-account', { body: { person: userId, action, reason } })
      if (error) {
        const body = await (error as { context?: Response }).context?.json?.().catch(() => null)
        throw new Error((body as { error?: string } | null)?.error ?? error.message)
      }
    },
    endCoachLink: (userId, reason) => run('admin_end_coach_link', { person: userId, why: reason }),
    setRole: (userId, role, reason) => run('admin_set_role', { person: userId, new_role: role, why: reason }),
  }
}
