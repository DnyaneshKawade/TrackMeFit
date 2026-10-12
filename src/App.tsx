import { useEffect, useMemo, useState } from 'react'
import { SignIn } from './auth/SignIn'
import { createSupabaseAuth, supabaseFromEnv } from './auth/supabaseAuth'
import type { Account, AuthService } from './auth/types'

export function AppShell({ auth }: { auth: AuthService | null }) {
  const [account, setAccount] = useState<Account | null | undefined>(undefined)

  useEffect(() => {
    if (!auth) return
    let live = true
    void auth.current().then((a) => live && setAccount(a))
    const off = auth.onChange((a) => setAccount(a))
    return () => {
      live = false
      off()
    }
  }, [auth])

  if (!auth) {
    return (
      <main className="auth">
        <h1 className="auth-brand">Track Me Fit</h1>
        <p>The app isn’t connected to its database yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.</p>
      </main>
    )
  }
  if (account === undefined) return <main className="auth">Loading…</main>
  if (!account) return <SignIn auth={auth} />

  return (
    <main className="auth">
      <h1 className="auth-brand">Track Me Fit</h1>
      <p>
        Signed in as <strong>{account.name || account.email}</strong> ({account.role === 'coach' ? 'coach' : 'member'}).
      </p>
      <button className="auth-link" onClick={() => void auth.signOut()}>Sign out</button>
    </main>
  )
}

export default function App() {
  const auth = useMemo(() => {
    const sb = supabaseFromEnv()
    return sb ? createSupabaseAuth(sb) : null
  }, [])
  return <AppShell auth={auth} />
}
