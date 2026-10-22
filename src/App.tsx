import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { TabIcon } from './TabIcon'
import { dayLine, greeting, initial } from './greeting'
import { memoryChatStore, supabaseChatStore, type ChatStore } from './coach/chat'
import { memoryCheckInStore, supabaseCheckInStore, type CheckInStore } from './coach/checkIns'
import { createSupabaseAuth, supabaseFromEnv } from './auth/supabaseAuth'
import type { Account, AuthService } from './auth/types'
import { memoryLogStore } from './log/memoryStore'
import { supabaseLogStore } from './log/supabaseStore'
import { offlineLogStore } from './log/offlineStore'
import { browserStorage } from './sync/outbox'
import type { LogStore } from './log/types'
import { memoryTargetStore, supabaseTargetStore } from './targets/stores'
import type { DietTarget, TargetStore } from './targets/types'
import { memoryWorkoutStore } from './training/memoryStore'
import { supabaseWorkoutStore } from './training/supabaseStore'
import { offlineWorkoutStore } from './training/offlineStore'
import type { WorkoutStore } from './training/types'
import { memoryExerciseStore, supabaseExerciseStore, type ExerciseStore } from './training/exerciseStore'
import { localFinder, serverFinder, type FoodFinder } from './food/finder'
import { memoryCustomFoodStore, supabaseCustomFoodStore, type CustomFoodStore } from './food/custom'
import { localDate, shiftDate } from './log/types'
import { memoryProfileStore, supabaseProfileStore } from './profile/stores'
import { memoryMealPlanStore, supabaseMealPlanStore, type MealPlanStore } from './profile/mealPlanStore'
import { ageOn, isOnboarded, type ProfileInfo, type ProfileStore } from './profile/types'

// First-run questions are seen once, so they load only when needed.
// Training and Progress load when their tab is first opened, to keep the first load small.
// The Food tab opens first, so its code starts loading with the app (T-135),
// but in its own file to keep the first download small.
const foodLog = import('./log/FoodLog')
const FoodLog = lazy(() => foodLog.then((m) => ({ default: m.FoodLog })))
const Workouts = lazy(() => import('./training/Workouts').then((m) => ({ default: m.Workouts })))
const Progress = lazy(() => import('./progress/Progress').then((m) => ({ default: m.Progress })))
const Clients = lazy(() => import('./coach/Clients').then((m) => ({ default: m.Clients })))
const CoachHome = lazy(() => import('./coach/CoachStatus').then((m) => ({ default: m.CoachHome })))
const Onboarding = lazy(() => import('./profile/Onboarding').then((m) => ({ default: m.Onboarding })))
// Only a new Google account sees this, once (T-066).
// Signed-in visits never need the sign-in screen, so it loads only when shown.
const SignIn = lazy(() => import('./auth/SignIn').then((m) => ({ default: m.SignIn })))
const RoleStep = lazy(() => import('./auth/RoleStep').then((m) => ({ default: m.RoleStep })))
// Asked once of everyone, and shown to teens until a parent says yes (T-086).
const AgeStep = lazy(() => import('./family/AgeStep').then((m) => ({ default: m.AgeStep })))
const ParentStep = lazy(() => import('./family/ParentStep').then((m) => ({ default: m.ParentStep })))
const NewPassword = lazy(() => import('./auth/NewPassword').then((m) => ({ default: m.NewPassword })))
const ProfilePage = lazy(() => import('./profile/ProfilePage').then((m) => ({ default: m.ProfilePage })))
// Only admins open the Admin tab (T-042a1).
const AdminTab = lazy(() => import('./admin/Admin').then((m) => ({ default: m.AdminTab })))
// Download, change requests and delete (T-042a5), opened from the top bar.
const AccountPage = lazy(() => import('./account/Account').then((m) => ({ default: m.AccountTab })))
// Only shown while an owner views as a person (T-042a4).
const ViewBar = lazy(() => import('./admin/ViewBar').then((m) => ({ default: m.ViewBar })))
import { supabaseViewing, type Viewing, type ViewMarker } from './admin/viewing'
import { supabaseAdminAccess, type AdminAccess, type AdminLevel } from './admin/service'
import { memoryProgressStore, supabaseProgressStore } from './progress/stores'
import type { ProgressStore } from './progress/types'
import { memoryCoachStore, supabaseCoachStore, supabaseShares, type CoachStore } from './coach/store'
import { memoryApprovalStore, supabaseApprovalStore, type CoachApprovalStore } from './coach/approval'
import { UnitContext } from './settings/units'
import type { ClientStores } from './coach/ClientView'
import { memoryPhotoStore, supabasePhotoStore, type PhotoStore } from './progress/photoStore'
import type { DataStore } from './account/data'
import { memoryFamilyStore, supabaseFamilyStore, type FamilyStore } from './family/family'

// The bundled food list, downloaded only when the database can't answer.
const loadBundledFoods = (): Promise<FoodFinder> => import('./food/catalogueData').then((m) => localFinder(m.searchIndex))

export function AppShell({
  auth,
  logStoreFor = () => memoryLogStore(),
  targetStoreFor = (a) => memoryTargetStore(a.id),
  workoutStoreFor = () => memoryWorkoutStore(),
  exerciseStoreFor = () => memoryExerciseStore(),
  // Stand-ins answer the age question as an adult, so other screens can be tried (T-086).
  profileStoreFor = () => memoryProfileStore({ birthDate: '1995-06-15' }),
  progressStoreFor = () => memoryProgressStore(),
  photoStoreFor = () => memoryPhotoStore(),
  coachStoreFor = () => memoryCoachStore(),
  checkInStoreFor = () => memoryCheckInStore(),
  chatStoreFor = (a) => memoryChatStore(a.id),
  templateStoreFor = () => memoryWorkoutStore(),
  clientStoresFor = () => ({
    log: memoryLogStore(),
    targets: memoryTargetStore(),
    progress: memoryProgressStore(),
    photos: memoryPhotoStore(),
    workouts: memoryWorkoutStore(),
    exercises: memoryExerciseStore(),
    checkIns: memoryCheckInStore(),
  }),
  foodStoreFor = () => memoryCustomFoodStore(),
  mealPlanStoreFor = () => memoryMealPlanStore(),
  loadFoods = loadBundledFoods,
  adminFor = () => null,
  approvalFor = () => memoryApprovalStore(),
  viewing = null,
  dataFor = () => () => import('./account/data').then((m) => m.memoryDataStore()),
  familyFor = () => memoryFamilyStore({ parent: 'Meena' }),
}: {
  auth: AuthService | null
  logStoreFor?: (account: Account) => LogStore
  targetStoreFor?: (account: Account) => TargetStore
  workoutStoreFor?: (account: Account) => WorkoutStore
  /** The person's own and favourite exercises (T-043b). */
  exerciseStoreFor?: (account: Account) => ExerciseStore
  profileStoreFor?: (account: Account) => ProfileStore
  progressStoreFor?: (account: Account) => ProgressStore
  /** Progress photos (T-022b). */
  photoStoreFor?: (account: Account) => PhotoStore
  /** Coach links (T-026a). */
  coachStoreFor?: (account: Account) => CoachStore
  /** A client's data for their coach (T-026c). */
  clientStoresFor?: (clientId: string) => ClientStores
  /** Weekly check-ins of the signed-in person (T-026e). */
  checkInStoreFor?: (account: Account) => CheckInStore
  /** Messages between a person and their coach (T-026f). */
  chatStoreFor?: (account: Account) => ChatStore
  /** A coach's program templates (T-026g). */
  templateStoreFor?: (account: Account) => WorkoutStore
  foodStoreFor?: (account: Account) => CustomFoodStore
  mealPlanStoreFor?: (account: Account) => MealPlanStore
  /** Food search; the bundled list unless the database is set up. */
  loadFoods?: () => Promise<FoodFinder>
  /** Admin access (T-042a1); null where there is no database. */
  adminFor?: (account: Account) => AdminAccess | null
  /** A coach's status and details for review (T-042a3). */
  approvalFor?: (account: Account) => CoachApprovalStore
  /** An owner viewing as a person (T-042a4); null where there is no database. */
  viewing?: Viewing | null
  /** The person's own data: download, requests and delete (T-042a5). Loaded when the page opens. */
  dataFor?: (account: Account) => () => Promise<DataStore>
  /** A teen's parent, or an adult's children (T-086). */
  familyFor?: (account: Account) => FamilyStore
}) {
  const [account, setAccount] = useState<Account | null | undefined>(undefined)
  const store = useMemo(() => (account ? logStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const workouts = useMemo(() => (account ? workoutStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const exerciseStore = useMemo(() => (account ? exerciseStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
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
  const [view, setView] = useState<ViewMarker | null>(() => viewing?.current() ?? null)
  const [viewNote, setViewNote] = useState('')
  // A view starts or ends with a change of sign-in.
  useEffect(() => setView(viewing?.current() ?? null), [account?.id, viewing])
  // A view left with no sign-in at all gives the owner theirs back.
  useEffect(() => {
    if (account === null && view) void viewing?.exit().finally(() => setView(null))
  }, [account, view, viewing])
  const [tab, setTab] = useState<'food' | 'training' | 'progress' | 'clients' | 'admin' | 'account'>('food')
  const admin = useMemo(() => (account ? adminFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const [adminLevel, setAdminLevel] = useState<AdminLevel | null>(null)
  useEffect(() => {
    setAdminLevel(null)
    void admin?.level().then(setAdminLevel, () => setAdminLevel(null))
  }, [admin])
  const targets = useMemo(() => (account ? targetStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const profiles = useMemo(() => (account ? profileStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const progress = useMemo(() => (account ? progressStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const coaching = useMemo(() => (account ? coachStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const photos = useMemo(() => (account ? photoStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const checkIns = useMemo(() => (account ? checkInStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const chat = useMemo(() => (account ? chatStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const family = useMemo(() => (account ? familyFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const myData = useMemo(() => (account ? dataFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const approval = useMemo(() => (account?.role === 'coach' ? approvalFor(account) : undefined), [account?.id, account?.role]) // eslint-disable-line react-hooks/exhaustive-deps
  const templates = useMemo(() => (account?.role === 'coach' ? templateStoreFor(account) : undefined), [account?.id, account?.role]) // eslint-disable-line react-hooks/exhaustive-deps
  // The latest weight, for a new meal plan from the Food tab (T-061).
  const latestWeight = useMemo(
    () => async () => {
      const list = (await progress?.weighIns()) ?? []
      return list.length ? list[list.length - 1].kg : null
    },
    [progress],
  )
  const foods = useMemo(() => (account ? foodStoreFor(account) : undefined), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const mealPlans = useMemo(() => (account ? mealPlanStoreFor(account) : null), [account?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  // undefined while loading; null when it couldn't be loaded (the app still works).
  const [profile, setProfile] = useState<ProfileInfo | null | undefined>(undefined)
  // Under 18, a parent says yes first (T-086). undefined while checking.
  const teen = !!profile?.birthDate && ageOn(profile.birthDate, localDate()) < 18
  const [parentOk, setParentOk] = useState<boolean | undefined>(undefined)
  useEffect(() => {
    setParentOk(undefined)
    if (!teen || !family) return
    let live = true
    family.myParent().then(
      (p) => live && setParentOk(!!p),
      () => live && setParentOk(false),
    )
    return () => {
      live = false
    }
  }, [teen, family])
  // The next weekly calorie step, offered on the Food tab (T-067a).
  const nextStep = useMemo(
    () =>
      profile && isOnboarded(profile) && account
        ? async (target: DietTarget) => {
            const weighIns = (await progress?.weighIns()) ?? []
            const weightKg = weighIns.length ? weighIns[weighIns.length - 1].kg : null
            if (weightKg === null || !profile.sex || !profile.heightCm || !profile.birthDate || !profile.activity || profile.trainingDays === null) return null
            // The weekly check looks at the last 3 weeks of food: one range query (T-067d).
            const today = localDate()
            const { nextStep: next, LEARN_DAYS } = await import('./profile/goal')
            const entries = (await store?.listRange?.(shiftDate(today, -LEARN_DAYS), today).catch(() => [])) ?? []
            const dayKcal = new Map<string, number>()
            for (const e of entries) dayKcal.set(e.loggedOn, (dayKcal.get(e.loggedOn) ?? 0) + e.kcal)
            return next(profile, weightKg, target, today, account.id, { weighIns, dayKcal })
          }
        : undefined,
    [profile, progress, store, account],
  )
  // Set while the person changes their sign-up answers (T-070), from the
  // "Your details" page (T-084), which stays open while `details` is set.
  const [editing, setEditing] = useState<{ weightKg: number | null; step?: number } | null>(null)
  const [details, setDetails] = useState<{ weightKg: number | null } | null>(null)
  // Set after a "Forgot password" link, until a new password is saved (T-085).
  const [recovering, setRecovering] = useState(false)

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
    const offRecovery = auth.onRecovery?.(() => live && setRecovering(true))
    return () => {
      live = false
      off()
      offRecovery?.()
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
  if (!account)
    return (
      <Suspense fallback={<main className="auth">Loading…</main>}>
        <SignIn auth={auth} />
      </Suspense>
    )
  if (recovering) {
    return (
      <Suspense fallback={<main className="auth">Loading…</main>}>
        <NewPassword
          auth={auth}
          onDone={() => {
            setRecovering(false)
            // Drop the link's tokens from the address bar.
            if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }}
        />
      </Suspense>
    )
  }
  if (profile === undefined) return <main className="auth">Loading…</main>
  if (account.roleChosen === false) {
    return (
      <Suspense fallback={<main className="auth">Loading…</main>}>
        <RoleStep
          name={account.name}
          canCoach={!teen}
          onChoose={async (role) => {
            await auth.chooseRole(role)
            setAccount({ ...account, role, roleChosen: true })
          }}
        />
      </Suspense>
    )
  }
  // Everyone gives a birth date once; support viewing as someone isn't held up.
  // People in setup give it in "About you" instead (T-105); coaches and
  // people who finished setup without one still see this step.
  if (profile && !profile.birthDate && !view && (account.role !== 'user' || isOnboarded(profile))) {
    return (
      <Suspense fallback={<main className="auth">Loading…</main>}>
        <AgeStep
          today={localDate()}
          onSave={async (birthDate) => {
            const p = { ...profile, birthDate }
            await profiles!.save(p)
            setProfile(p)
          }}
          onSignOut={() => void auth.signOut()}
        />
      </Suspense>
    )
  }
  if (teen && parentOk !== true && !view) {
    if (parentOk === undefined) return <main className="auth">Loading…</main>
    return (
      <Suspense fallback={<main className="auth">Loading…</main>}>
        <ParentStep store={family!} onDone={() => setParentOk(true)} onSignOut={() => void auth.signOut()} />
      </Suspense>
    )
  }

  const viewBar = view && (
    <Suspense fallback={null}>
      <ViewBar
        viewing={viewing!}
        marker={view}
        onEnd={(idle) => {
          // Nothing of the person's stays on this device.
          store?.sync?.clearCache()
          workouts?.sync?.clearCache()
          setView(null)
          setTab('food')
          setViewNote(idle ? 'The view ended after 30 minutes with no activity.' : '')
        }}
      />
    </Suspense>
  )
  const canEditDetails = !!profile && account.role === 'user' && isOnboarded(profile)
  const now = new Date()
  /** A tab closes Your details too. */
  const go = (t: typeof tab) => {
    setDetails(null)
    setTab(t)
  }
  const tabs = (
    <nav className="bottom-tabs" role="tablist" aria-label="Main">
      <button role="tab" aria-selected={tab === 'food'} onClick={() => go('food')}><TabIcon name="food" />Today</button>
      <button role="tab" aria-selected={tab === 'training'} onClick={() => go('training')}><TabIcon name="training" />Workouts</button>
      <button role="tab" aria-selected={tab === 'progress'} onClick={() => go('progress')}><TabIcon name="progress" />Progress</button>
      {account.role === 'coach' && (
        <button role="tab" aria-selected={tab === 'clients'} onClick={() => go('clients')}><TabIcon name="clients" />Clients</button>
      )}
      {adminLevel && (
        <button role="tab" aria-selected={tab === 'admin'} onClick={() => go('admin')}><TabIcon name="admin" />Admin</button>
      )}
      {myData && !view && (
        <button role="tab" aria-selected={tab === 'account'} onClick={() => go('account')}><TabIcon name="me" />Me</button>
      )}
    </nav>
  )
  const topbar = (
    <>
      {viewBar}
      {viewNote && (
        <p className="view-note" role="status">
          {viewNote}
        </p>
      )}
      <header className="topbar">
        <div className="topbar-hello">
          <span>
            {dayLine(now)}
            {account.role === 'coach' ? ' · Coach' : ''}
          </span>
          <strong>{greeting(now, account.name)}</strong>
        </div>
        {myData && !view && (
          <button
            className="avatar"
            aria-label="Open Me"
            onClick={() => {
              setDetails(null)
              setEditing(null)
              setTab('account')
            }}
          >
            {initial(account.name || account.email)}
          </button>
        )}
      </header>
    </>
  )

  if (profile && details && !editing) {
    return (
      <>
        {topbar}
        {tabs}
        <Suspense fallback={<main className="auth">Loading…</main>}>
          <ProfilePage
            profile={profile}
            weightKg={details.weightKg}
            today={localDate()}
            onChange={(step) => setEditing({ weightKg: details.weightKg, step })}
            onBack={() => setDetails(null)}
          />
        </Suspense>
      </>
    )
  }

  if (tab === 'account' && myData && !view && !editing) {
    return (
      <>
        {topbar}
        {tabs}
        <Suspense fallback={<main className="log">Loading…</main>}>
          <AccountPage
            load={myData}
            onDeleted={() => {
              store?.sync?.clearCache()
              workouts?.sync?.clearCache()
              setTab('food')
              void auth.signOut().catch(() => null)
            }}
            security={{
              email: account.email,
              signInWith: account.signInWith ?? 'email',
              changePassword: auth.changePassword?.bind(auth),
              changeEmail: auth.changeEmail?.bind(auth),
              sendPasswordCode: auth.sendPasswordCode?.bind(auth),
              addPassword: auth.addPassword?.bind(auth),
            }}
            onDetails={
              canEditDetails
                ? () => {
                    void latestWeight().then((weightKg) => setDetails({ weightKg }), () => setDetails({ weightKg: null }))
                  }
                : undefined
            }
            coach={account.role === 'user' ? coaching : undefined}
            family={family && { store: family, teen }}
            canCoach={account.role === 'user' && !teen}
            units={
              profile && profiles
                ? {
                    unit: profile.weightUnit,
                    onChange: async (weightUnit) => {
                      const p = { ...profile, weightUnit }
                      await profiles.save(p)
                      setProfile(p)
                    },
                  }
                : undefined
            }
            onCoach={() => setTab('progress')}
            who={`${account.name || account.email}${account.role === 'coach' ? ' (coach)' : ''}`}
            onSignOut={() => {
              store?.sync?.clearCache()
              workouts?.sync?.clearCache()
              void auth.signOut()
            }}
            onSignOutAll={async () => {
              await auth.signOut('all')
              store?.sync?.clearCache()
              workouts?.sync?.clearCache()
              setTab('food')
            }}
          />
        </Suspense>
      </>
    )
  }

  // Coaches go straight to the app; everyone else sees the first-run questions
  // until they finish or skip them once. The same steps change them later.
  if (profile && account.role === 'user' && (!isOnboarded(profile) || editing)) {
    return (
      <>
        {topbar}
        <Suspense fallback={<main className="auth">Loading…</main>}>
          <Onboarding
            key={editing ? 'edit' : 'setup'}
            initial={{ ...profile, fullName: profile.fullName || account.name }}
            edit={editing ?? undefined}
            onFinish={async ({ profile: p, weightKg, waistCm, targets: suggested, mealPlan }) => {
              const today = localDate()
              await profiles!.save(p)
              // An unchanged weight adds no weigh-in.
              if (weightKg !== editing?.weightKg) await progress!.saveWeighIn(today, weightKg)
              if (waistCm !== null) await progress!.saveMeasurement({ date: today, waistCm })
              if (suggested && targets) await targets.save(suggested, today, 'suggested')
              // The plan is optional: if it can't be saved, setup still finishes.
              if (mealPlan && mealPlans) await mealPlans.save(mealPlan.plan, mealPlan.picks).catch(() => null)
              setProfile(p)
              setEditing(null)
              if (details) setDetails({ weightKg })
            }}
            loadFoods={loadFoods}
            onBirthDate={async (birthDate) => {
              // Only the birth date: a teen's other answers wait for a parent (T-105b).
              await profiles!.saveBirthDate(birthDate)
              setProfile({ ...profile, birthDate })
            }}
            onSkip={async (birthDate) => {
              if (editing) return setEditing(null)
              if (birthDate && ageOn(birthDate, localDate()) < 18) {
                await profiles!.saveBirthDate(birthDate)
                return setProfile({ ...profile, birthDate })
              }
              const p = { ...profile, birthDate: birthDate ?? profile.birthDate, fullName: profile.fullName || account.name, onboardedAt: new Date().toISOString() }
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
      {tabs}
      {tab === 'food' && (
        <Suspense fallback={<main className="log">Loading…</main>}>
          <FoodLog
            store={store!}
            loadFoods={loadFoods}
            foods={foods}
            targets={targets}
            userId={account.id}
            diet={profile ?? undefined}
            mealPlans={mealPlans}
            latestWeight={latestWeight}
            nextStep={nextStep}
          />
        </Suspense>
      )}
      <Suspense fallback={<main className="log">Loading…</main>}>
        {tab === 'training' && (
          <UnitContext.Provider value={profile?.weightUnit ?? 'kg'}>
            <Workouts store={workouts!} exercises={exerciseStore} answers={profile ?? undefined} userId={account.id} />
          </UnitContext.Provider>
        )}
        {tab === 'admin' && admin && adminLevel && <AdminTab access={admin} me={account.id} level={adminLevel} />}
        {tab === 'clients' && coaching && approval && (
          <CoachHome store={approval}>
            <Clients store={coaching} storesFor={clientStoresFor} coachId={account.id} chat={chat} templates={templates} loadFoods={loadFoods} />
          </CoachHome>
        )}
        {tab === 'progress' && (
          <Progress
            store={progress!}
            goal={profile?.goal ?? null}
            profile={profile}
            targets={targets}
            log={store!}
            photos={photos}
            coach={account.role === 'user' ? coaching : undefined}
            checkIns={account.role === 'user' ? checkIns : undefined}
            chat={account.role === 'user' ? chat : undefined}
            onSwitchPace={async (rate, target) => {
              const p = { ...profile!, goalRate: rate }
              await profiles!.save(p)
              if (target && targets) await targets.save(target, localDate(), 'suggested')
              setProfile(p)
            }}
          />
        )}
      </Suspense>
    </>
  )
}

export default function App() {
  const sb = useMemo(() => supabaseFromEnv(), [])
  const auth = useMemo(() => (sb ? createSupabaseAuth(sb) : null), [sb])
  const viewing = useMemo(() => (sb ? supabaseViewing(sb, localStorage) : null), [sb])
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
      exerciseStoreFor={(a) => supabaseExerciseStore(sb!, a.id)}
      profileStoreFor={(a) => supabaseProfileStore(sb!, a.id)}
      progressStoreFor={(a) => supabaseProgressStore(sb!, a.id)}
      photoStoreFor={(a) => supabasePhotoStore(sb!, a.id)}
      coachStoreFor={(a) => supabaseCoachStore(sb!, a.id)}
      clientStoresFor={(id) => ({
        log: supabaseLogStore(sb!, id),
        targets: supabaseTargetStore(sb!, id),
        progress: supabaseProgressStore(sb!, id),
        photos: supabasePhotoStore(sb!, id),
        workouts: supabaseWorkoutStore(sb!, id),
        exercises: supabaseExerciseStore(sb!, id),
        checkIns: supabaseCheckInStore(sb!, id),
        mealPlans: supabaseMealPlanStore(sb!, id),
        profile: supabaseProfileStore(sb!, id),
        shares: () => supabaseShares(sb!, id),
      })}
      checkInStoreFor={(a) => supabaseCheckInStore(sb!, a.id)}
      chatStoreFor={(a) => supabaseChatStore(sb!, a.id)}
      templateStoreFor={(a) => supabaseWorkoutStore(sb!, a.id, { templates: true })}
      foodStoreFor={(a) => supabaseCustomFoodStore(sb!, a.id)}
      mealPlanStoreFor={(a) => supabaseMealPlanStore(sb!, a.id)}
      loadFoods={loadFoods}
      adminFor={() => supabaseAdminAccess(sb!)}
      approvalFor={(a) => supabaseApprovalStore(sb!, a.id)}
      viewing={viewing}
      dataFor={(a) => () => import('./account/data').then((m) => m.supabaseDataStore(sb!, a.id))}
      familyFor={() => supabaseFamilyStore(sb!)}
    />
  )
}
