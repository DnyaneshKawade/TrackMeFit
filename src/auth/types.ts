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
  /** How they sign in: a password, or Google only (T-091). */
  signInWith?: 'email' | 'google'
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
  /** Checks the old password, then saves the new one (T-091). */
  changePassword?(oldPassword: string, newPassword: string): Promise<void>
  /** Sends a link to the old and the new email; the change counts once both are opened (T-091). */
  changeEmail?(email: string): Promise<void>
  /** Emails a code to a Google user before they add a password (T-091b). */
  sendPasswordCode?(): Promise<void>
  /** Adds a password with the emailed code (T-091b). */
  addPassword?(code: string, password: string): Promise<void>
  /** Signs out this device only, or every device with 'all' (T-090). */
  signOut(where?: 'all'): Promise<void>
  current(): Promise<Account | null>
  onChange(cb: (account: Account | null) => void): Unsubscribe
}

/** Turns errors from the sign-in service into plain words. */
export function friendlyAuthError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (/old password wrong/i.test(msg)) return 'Your old password is wrong.'
  if (/nonce|reauthentication/i.test(msg)) return 'This code is wrong or too old. Ask for a new one.'
  if (/invalid login credentials/i.test(msg)) return 'Email or password is wrong.'
  if (/same.*password|different from the old/i.test(msg)) return 'Pick a password you have not used here before.'
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
