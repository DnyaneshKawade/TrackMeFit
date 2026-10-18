// Supabase Edge Function: admin-view (spec T-042a4). Deploy with
//   supabase functions deploy admin-view
// The service role key is set by Supabase inside the function; it never
// reaches the browser.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleStartView } from './handler.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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

  const reply = await handleStartView(await req.json().catch(() => null), {
    async checkAndLog(person, reason) {
      const { data, error } = await caller.rpc('admin_start_view', { person, why: reason })
      if (error) throw new Error(error.message)
      const row = (data as { view_id: string; email: string }[])[0]
      return { viewId: row.view_id, email: row.email }
    },
    async signInToken(email) {
      // Makes the token without sending any email.
      const { data, error } = await service.auth.admin.generateLink({ type: 'magiclink', email })
      if (error) throw error
      return data.properties.hashed_token
    },
  })
  return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { ...CORS, 'Content-Type': 'application/json' } })
})
