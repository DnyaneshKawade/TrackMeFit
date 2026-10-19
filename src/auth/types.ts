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
  /** Sets a new password for the signed-in person (T-085). */
  updatePassword?(password: string): Promise<void>
  /** Calls back once when the person opened a "Forgot password" email link (T-085). */
  onRecovery?(cb: () => void): Unsubscribe
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
  if (/email rate limit|over_email_send_rate_limit/i.test(msg)) return 'We’ve sent too many emails this hour. Please try again later, or use Google.'
  if (/rate limit|too many/i.test(msg)) return 'Too many tries. Please wait a minute and try again.'
  if (/sending confirmation|sending .*email|email address .*not authorized/i.test(msg)) return 'We couldn’t send the email to this address. Please try Google, or try again later.'
  if (/database error saving new user/i.test(msg)) return 'We couldn’t set up your account on our side. Please try again later.'
  if (/signups? not allowed|signups? .*disabled/i.test(msg)) return 'Sign-up with email is off right now. Please use Google.'
  if (/password should|weak password/i.test(msg)) return 'Please pick a stronger password.'
  if (/invalid format|unable to validate email/i.test(msg)) return 'Check your email address.'
  if (/network|fetch/i.test(msg)) return 'No internet connection. Check it and try again.'
  // Show the service's code so the cause can be found from a screenshot.
  const code = (e as { code?: unknown } | null)?.code
  return typeof code === 'string' && /^[a-z_]+$/.test(code) ? `Something went wrong (${code}). Please try again.` : 'Something went wrong. Please try again.'
}
