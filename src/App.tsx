import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { SignIn } from './auth/SignIn'
import { createSupabaseAuth, supabaseFromEnv } from './auth/supabaseAuth'
import type { Account, AuthService } from './auth/types'
import { FoodLog } from './log/FoodLog'
import { memoryLogStore } from './log/memoryStore'
import { supabaseLogStore } from './log/supabaseStore'
import { offlineLogStore } from './log/offlineStore'
import { browserStorage } from './sync/outbox'
import type { LogStore } from './log/types'
import { memoryTargetStore, supabaseTargetStore } from './targets/stores'
import type { TargetStore } from './targets/types'
import { Workouts } from './training/Workouts'
import { memoryWorkoutStore } from './training/memoryStore'
import { supabaseWorkoutStore } from './training/supabaseStore'
import { offlineWorkoutStore } from './training/offlineStore'
import type { WorkoutStore } from './training/types'
import { localFinder, serverFinder, type FoodFinder } from './food/finder'
import { memoryCustomFoodStore, supabaseCustomFoodStore, type CustomFoodStore } from './food/custom'
import { localDate } from './log/types'
import { memoryProfileStore, supabaseProfileStore } from './profile/stores'
import { memoryMealPlanStore, supabaseMealPlanStore, type MealPlanStore } from './profile/mealPlanStore'
import { isOnboarded, type ProfileInfo, type ProfileStore } from './profile/types'
import { Progress } from './progress/Progress'

// First-run questions are seen once, so they load only when needed.
const Onboarding = lazy(() => import('./profile/Onboarding').then((m) => ({ default: m.Onboarding })))
import { memoryProgressStore, supabaseProgressStore } from './progress/stores'
import type { ProgressStore } from './progress/types'

// The bundled food list, downloaded only when the database can't answer.
const loadBundledFoods = (): Promise<FoodFinder> => import('./food/catalogueData').then((m) => localFinder(m.searchIndex))

export function AppShell({
  auth,
  logStoreFor = () => memoryLogStore(),
  targetStoreFor = (a) => memoryTargetStore(a.id),
  workoutStoreFor = () => memoryWorkoutStore(),
  profileStoreFor = () => memoryProfileStore(),
  progressStoreFor = () => memoryProgressStore(),
  foodStoreFor = () => memoryCustomFoodStore(),
  mealPlanStoreFor = () => memoryMealPlanStore(),
  loadFoods = loadBundledFoods,
}: {
  auth: AuthService | null
  logStoreFor?: (account: Account) => LogStore
  targetStoreFor?: (account: Account) => TargetStore
  workoutStoreFor?: (account: Account) => WorkoutStore
  profileStoreFor?: (account: Account) => ProfileStore
  progressStoreFor?: (account: Account) => ProgressStore
  foodStoreFor?: (account: Account) => CustomFoodStore
  mealPlanStoreFor?: (account: Account) => MealPlanStore
  /** Food search; the bundled list unless the database is set up. */
  loadFoods?: () => Promise<FoodFinder>
}) {
  const [account, setAccount] = useState<Account | null | undefined>(undefined)
  const store = useMemo(() => (account ? logStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const workouts = useMemo(() => (account ? workoutStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  // Food entries and workouts saved offline go out when the app opens, when
  // the phone is back online and when the app returns to the front (T-027).
  useEffect(() => {
    const syncs = [store?.sync, workouts?.sync].filter((x) => x !== undefined)
    if (!syncs.length) return
    const run = () => syncs.forEach((x) => void x.run())
    const onVisible = () => document.visibilityState === 'visible' && run()
    run()
    window.addEventListener('online', run)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('online', run)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [store, workouts])
  const [tab, setTab] = useState<'food' | 'training' | 'progress'>('food')
  const targets = useMemo(() => (account ? targetStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const profiles = useMemo(() => (account ? profileStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const progress = useMemo(() => (account ? progressStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const foods = useMemo(() => (account ? foodStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const mealPlans = useMemo(() => (account ? mealPlanStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
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
      <button
        onClick={() => {
          store?.sync?.clearCache()
          workouts?.sync?.clearCache()
          void auth.signOut()
        }}
      >
        Sign out
      </button>
    </header>
  )

  // Coaches go straight to the app; everyone else sees the first-run questions
  // until they finish or skip them once.
  if (profile && account.role === 'user' && !isOnboarded(profile)) {
    return (
      <>
        {topbar}
        <Suspense fallback={<main className="auth">Loading…</main>}>
          <Onboarding
            initial={{ ...profile, fullName: profile.fullName || account.name }}
            onFinish={async ({ profile: p, weightKg, waistCm, targets: suggested, mealPlan }) => {
              const today = localDate()
              await profiles!.save(p)
              await progress!.saveWeighIn(today, weightKg)
              if (waistCm !== null) await progress!.saveMeasurement({ date: today, waistCm })
              if (suggested && targets) await targets.save(suggested, today, 'suggested')
              // The plan is optional: if it can't be saved, setup still finishes.
              if (mealPlan && mealPlans) await mealPlans.save(mealPlan.plan, mealPlan.picks).catch(() => null)
              setProfile(p)
            }}
            loadFoods={loadFoods}
            onSkip={async () => {
              const p = { ...profile, fullName: profile.fullName || account.name, onboardedAt: new Date().toISOString() }
              await profiles!.save(p)
              setProfile(p)
            }}
          />
        </Suspense>
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
      {tab === 'food' && (
        <FoodLog
          store={store!}
          loadFoods={loadFoods}
          foods={foods}
          targets={targets}
          userId={account.id}
          diet={profile ?? undefined}
          mealPlans={mealPlans}
        />
      )}
      {tab === 'training' && <Workouts store={workouts!} />}
      {tab === 'progress' && (
        <Progress
          store={progress!}
          goal={profile?.goal ?? null}
          profile={profile}
          targets={targets}
          onSwitchPace={async (rate, target) => {
            const p = { ...profile!, goalRate: rate }
            await profiles!.save(p)
            if (target && targets) await targets.save(target, localDate(), 'suggested')
            setProfile(p)
          }}
        />
      )}
    </>
  )
}

export default function App() {
  const sb = useMemo(() => supabaseFromEnv(), [])
  const auth = useMemo(() => (sb ? createSupabaseAuth(sb) : null), [sb])
  // One finder for the session, so the "are foods loaded" check runs once.
  const loadFoods = useMemo(() => {
    const finder = sb ? serverFinder(sb, loadBundledFoods) : null
    return finder ? () => Promise.resolve(finder) : loadBundledFoods
  }, [sb])
  return (
    <AppShell
      auth={auth}
      logStoreFor={(a) => offlineLogStore(supabaseLogStore(sb!, a.id), { storage: browserStorage, accountId: a.id })}
      targetStoreFor={(a) => supabaseTargetStore(sb!, a.id)}
      workoutStoreFor={(a) => offlineWorkoutStore(supabaseWorkoutStore(sb!, a.id), { storage: browserStorage, accountId: a.id })}
      profileStoreFor={(a) => supabaseProfileStore(sb!, a.id)}
      progressStoreFor={(a) => supabaseProgressStore(sb!, a.id)}
      foodStoreFor={(a) => supabaseCustomFoodStore(sb!, a.id)}
      mealPlanStoreFor={(a) => supabaseMealPlanStore(sb!, a.id)}
      loadFoods={loadFoods}
    />
  )
}
