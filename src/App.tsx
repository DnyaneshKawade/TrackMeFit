import { useEffect, useMemo, useState } from 'react'
import { SignIn } from './auth/SignIn'
import { createSupabaseAuth, supabaseFromEnv } from './auth/supabaseAuth'
import type { Account, AuthService } from './auth/types'
import { FoodLog } from './log/FoodLog'
import { memoryLogStore } from './log/memoryStore'
import { supabaseLogStore } from './log/supabaseStore'
import type { LogStore } from './log/types'
import { memoryTargetStore, supabaseTargetStore } from './targets/stores'
import type { TargetStore } from './targets/types'
import type { SearchIndex } from './food/search'

const loadIndex = (): Promise<SearchIndex> => import('./food/catalogueData').then((m) => m.searchIndex)

export function AppShell({
  auth,
  logStoreFor = () => memoryLogStore(),
  targetStoreFor = (a) => memoryTargetStore(a.id),
}: {
  auth: AuthService | null
  logStoreFor?: (account: Account) => LogStore
  targetStoreFor?: (account: Account) => TargetStore
}) {
  const [account, setAccount] = useState<Account | null | undefined>(undefined)
  const store = useMemo(() => (account ? logStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const targets = useMemo(() => (account ? targetStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <>
      <header className="topbar">
        <strong className="topbar-brand">Track Me Fit</strong>
        <span>
          {account.name || account.email}
          {account.role === 'coach' ? ' (coach)' : ''}
        </span>
        <button onClick={() => void auth.signOut()}>Sign out</button>
      </header>
      <FoodLog store={store!} loadIndex={loadIndex} targets={targets} userId={account.id} />
    </>
  )
}

export default function App() {
  const sb = useMemo(() => supabaseFromEnv(), [])
  const auth = useMemo(() => (sb ? createSupabaseAuth(sb) : null), [sb])
  return (
    <AppShell
      auth={auth}
      logStoreFor={(a) => supabaseLogStore(sb!, a.id)}
      targetStoreFor={(a) => supabaseTargetStore(sb!, a.id)}
    />
  )
}
