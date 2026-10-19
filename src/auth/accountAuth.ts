// Password and email changes (spec T-091), loaded only when the Account page
// uses them, to keep the first download small.

import type { SupabaseClient } from '@supabase/supabase-js'

export async function changePassword(sb: SupabaseClient, oldPassword: string, newPassword: string): Promise<void> {
  const { data } = await sb.auth.getUser()
  const email = data.user?.email
  if (!email) throw new Error('not signed in')
  // Supabase doesn't ask for the old password, so check it first.
  const check = await sb.auth.signInWithPassword({ email, password: oldPassword })
  if (check.error) throw /invalid login credentials/i.test(check.error.message) ? new Error('old password wrong') : check.error
  const { error } = await sb.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function changeEmail(sb: SupabaseClient, email: string): Promise<void> {
  const { error } = await sb.auth.updateUser({ email: email.trim() }, { emailRedirectTo: window.location.origin })
  if (error) throw error
}
