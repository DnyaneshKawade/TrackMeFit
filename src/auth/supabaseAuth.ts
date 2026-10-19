// Supabase implementation of AuthService. The URL and anon key are public by
// design (row-level security protects the data) and come from .env.local:
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { Account, AuthService, Role } from './types'

export function supabaseFromEnv(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  return url && key ? createClient(url, key) : null
}

export function createSupabaseAuth(sb: SupabaseClient): AuthService {
  // A "Forgot password" link lands with type=recovery in the address. The
  // client may handle it before the app listens, so remember it now (T-085).
  let recovery = typeof window !== 'undefined' && /type=recovery/.test(window.location.hash)
  const toAccount = async (user: User | null): Promise<Account | null> => {
    if (!user) return null
    const { data } = await sb.from('profiles').select('role, full_name, role_chosen').eq('id', user.id).maybeSingle()
    return {
      id: user.id,
      email: user.email ?? '',
      name: data?.full_name || (user.user_metadata?.full_name as string | undefined) || '',
      role: (data?.role as Role | undefined) ?? 'user',
      ...(data?.role_chosen === false ? { roleChosen: false } : {}),
    }
  }

  return {
    async signUp({ email, password, name, role }) {
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim(), role }, emailRedirectTo: window.location.origin },
      })
      if (error) throw error
      return { needsEmailConfirm: !data.session }
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
    },
    async signInWithGoogle() {
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
      if (error) throw error
    },
    async chooseRole(role) {
      const { error } = await sb.rpc('choose_role', { picked: role })
      if (error) throw error
    },
    async resetPassword(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin })
      if (error) throw error
    },
    async updatePassword(password) {
      const { error } = await sb.auth.updateUser({ password })
      if (error) throw error
    },
    onRecovery(cb) {
      if (recovery) {
        recovery = false
        queueMicrotask(cb)
      }
      const { data } = sb.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') cb()
      })
      return () => data.subscription.unsubscribe()
    },
    async signOut() {
      const { error } = await sb.auth.signOut()
      if (error) throw error
    },
    async current() {
      const { data } = await sb.auth.getUser()
      return toAccount(data.user)
    },
    onChange(cb) {
      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        void toAccount(session?.user ?? null).then(cb)
      })
      return () => data.subscription.unsubscribe()
    },
  }
}
