// Supabase Edge Function: delete-account (spec T-042a5). Deploy with
//   supabase functions deploy delete-account
// The service role key is set by Supabase inside the function; it never
// reaches the browser.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleDeleteMe } from './handler.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const BUCKETS = ['progress-photos', 'coach-certificates']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: CORS })
  const url = Deno.env.get('SUPABASE_URL')!
  // The caller's own session: only they can delete themselves.
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  })
  const service = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

  const reply = await handleDeleteMe(await req.json().catch(() => null), {
    async caller() {
      const { data, error } = await caller.auth.getUser()
      return error ? null : (data.user?.id ?? null)
    },
    async check() {
      const { error } = await caller.rpc('prepare_delete_me')
      if (error) throw new Error(error.message)
    },
    async removeFiles(person) {
      // 100 files at a time until each folder is empty.
      for (const bucket of BUCKETS)
        for (;;) {
          const { data, error } = await service.storage.from(bucket).list(person, { limit: 100 })
          if (error) throw error
          if (!data.length) break
          const { error: rmError } = await service.storage.from(bucket).remove(data.map((f) => `${person}/${f.name}`))
          if (rmError) throw rmError
        }
    },
    async deleteAccount(person) {
      const { error } = await service.auth.admin.deleteUser(person)
      if (error) throw error
    },
  })
  return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { ...CORS, 'Content-Type': 'application/json' } })
})
