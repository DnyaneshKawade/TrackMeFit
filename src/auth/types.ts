// What the screens need from sign-in, kept separate from Supabase so screens
// can be tested with a fake.

export type Role = 'user' | 'coach'

export interface Account {
  id: string
  email: string
  name: string
  role: Role
  /** False only for a new Google account that hasn't picked "For myself" or "I'm a coach" yet (T-066). */
  roleChosen?: boolean
}

export type Unsubscribe = () => void

export interface AuthService {
  signUp(input: { email: string; password: string; name: string; role: Role }): Promise<{ needsEmailConfirm: boolean }>
  signIn(email: string, password: string): Promise<void>
  /** A new Google account then picks its role once with chooseRole (T-066). */
  signInWithGoogle(): Promise<void>
  /** Picks the role of a new Google account; works once. */
  chooseRole(role: Role): Promise<void>
  resetPassword(email: string): Promise<void>
  signOut(): Promise<void>
  current(): Promise<Account | null>
  onChange(cb: (account: Account | null) => void): Unsubscribe
}

/** Turns errors from the sign-in service into plain words. */
export function friendlyAuthError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (/invalid login credentials/i.test(msg)) return 'Email or password is wrong.'
  if (/already registered|already been registered|user already exists/i.test(msg)) return 'This email already has an account. Sign in instead.'
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first. Check your inbox for our link.'
  if (/rate limit|too many/i.test(msg)) return 'Too many tries. Please wait a minute and try again.'
  if (/network|fetch/i.test(msg)) return 'No internet connection. Check it and try again.'
  return 'Something went wrong. Please try again.'
}
