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
import { Workouts } from './training/Workouts'
import { memoryWorkoutStore } from './training/memoryStore'
import { supabaseWorkoutStore } from './training/supabaseStore'
import type { WorkoutStore } from './training/types'
import type { SearchIndex } from './food/search'
import { localDate } from './log/types'
import { Onboarding } from './profile/Onboarding'
import { memoryProfileStore, supabaseProfileStore } from './profile/stores'
import { isOnboarded, type ProfileInfo, type ProfileStore } from './profile/types'
import { Progress } from './progress/Progress'
import { memoryProgressStore, supabaseProgressStore } from './progress/stores'
import type { ProgressStore } from './progress/types'

const loadIndex = (): Promise<SearchIndex> => import('./food/catalogueData').then((m) => m.searchIndex)

export function AppShell({
  auth,
  logStoreFor = () => memoryLogStore(),
  targetStoreFor = (a) => memoryTargetStore(a.id),
  workoutStoreFor = () => memoryWorkoutStore(),
  profileStoreFor = () => memoryProfileStore(),
  progressStoreFor = () => memoryProgressStore(),
}: {
  auth: AuthService | null
  logStoreFor?: (account: Account) => LogStore
  targetStoreFor?: (account: Account) => TargetStore
  workoutStoreFor?: (account: Account) => WorkoutStore
  profileStoreFor?: (account: Account) => ProfileStore
  progressStoreFor?: (account: Account) => ProgressStore
}) {
  const [account, setAccount] = useState<Account | null | undefined>(undefined)
  const store = useMemo(() => (account ? logStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const workouts = useMemo(() => (account ? workoutStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const [tab, setTab] = useState<'food' | 'training' | 'progress'>('food')
  const targets = useMemo(() => (account ? targetStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const profiles = useMemo(() => (account ? profileStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const progress = useMemo(() => (account ? progressStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  // undefined while loading; null when it couldn't be loaded (the app still works).
  const [profile, setProfile] = useState<ProfileInfo | null | undefined>(undefined)

  useEffect(() => {
    setProfile(undefined)
    if (!profiles) return
    let live = true
    profiles.get().then(
      (p) => live && setProfile(p),
      () => live && setProfile(null),
    )
    return () => {
      live = false
    }
  }, [profiles])

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
  if (profile === undefined) return <main className="auth">Loading…</main>

  const topbar = (
    <header className="topbar">
      <strong className="topbar-brand">Track Me Fit</strong>
      <span>
        {account.name || account.email}
        {account.role === 'coach' ? ' (coach)' : ''}
      </span>
      <button onClick={() => void auth.signOut()}>Sign out</button>
    </header>
  )

  // Coaches go straight to the app; everyone else sees the first-run questions
  // until they finish or skip them once.
  if (profile && account.role === 'user' && !isOnboarded(profile)) {
    return (
      <>
        {topbar}
        <Onboarding
          initial={{ ...profile, fullName: profile.fullName || account.name }}
          onFinish={async ({ profile: p, weightKg, waistCm, targets: suggested }) => {
            const today = localDate()
            await profiles!.save(p)
            await progress!.saveWeighIn(today, weightKg)
            if (waistCm !== null) await progress!.saveMeasurement({ date: today, waistCm })
            if (suggested && targets) await targets.save(suggested, today, 'suggested')
            setProfile(p)
          }}
          loadIndex={loadIndex}
          onSkip={async () => {
            const p = { ...profile, fullName: profile.fullName || account.name, onboardedAt: new Date().toISOString() }
            await profiles!.save(p)
            setProfile(p)
          }}
        />
      </>
    )
  }

  return (
    <>
      {topbar}
      <nav className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'food'} onClick={() => setTab('food')}>Food</button>
        <button role="tab" aria-selected={tab === 'training'} onClick={() => setTab('training')}>Training</button>
        <button role="tab" aria-selected={tab === 'progress'} onClick={() => setTab('progress')}>Progress</button>
      </nav>
      {tab === 'food' && <FoodLog store={store!} loadIndex={loadIndex} targets={targets} userId={account.id} />}
      {tab === 'training' && <Workouts store={workouts!} />}
      {tab === 'progress' && <Progress store={progress!} goal={profile?.goal ?? null} />}
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
      workoutStoreFor={(a) => supabaseWorkoutStore(sb!, a.id)}
      profileStoreFor={(a) => supabaseProfileStore(sb!, a.id)}
      progressStoreFor={(a) => supabaseProgressStore(sb!, a.id)}
    />
  )
}
