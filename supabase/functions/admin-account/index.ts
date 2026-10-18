// Supabase Edge Function: admin-account (spec T-042a2). Deploy with
//   supabase functions deploy admin-account
// The service role key is set by Supabase inside the function; it never
// reaches the browser.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleAccountAction } from './handler.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
// Blocked until someone unblocks them (about 100 years).
const FOREVER = '876000h'
const PHOTOS = 'progress-photos'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: CORS })
  const url = Deno.env.get('SUPABASE_URL')!
  // The caller's own session: the database checks they are an owner with the second step.
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  })
  const service = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

  const reply = await handleAccountAction(await req.json().catch(() => null), {
    async checkAndLog(person, action, reason) {
      const { data, error } = await caller.rpc('admin_account_action', { person, act: action, why: reason })
      if (error) throw new Error(error.message)
      return data as string
    },
    async setBlocked(person, blocked) {
      const { error } = await service.auth.admin.updateUserById(person, { ban_duration: blocked ? FOREVER : 'none' })
      if (error) throw error
    },
    async removePhotos(person) {
      // 100 files at a time until the folder is empty.
      for (;;) {
        const { data, error } = await service.storage.from(PHOTOS).list(person, { limit: 100 })
        if (error) throw error
        if (!data.length) return
        const { error: rmError } = await service.storage.from(PHOTOS).remove(data.map((f) => `${person}/${f.name}`))
        if (rmError) throw rmError
      }
    },
    async deleteAccount(person) {
      const { error } = await service.auth.admin.deleteUser(person)
      if (error) throw error
    },
    async resendConfirm(email) {
      const { error } = await service.auth.resend({ type: 'signup', email })
      if (error) throw error
    },
  })
  return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { ...CORS, 'Content-Type': 'application/json' } })
})
