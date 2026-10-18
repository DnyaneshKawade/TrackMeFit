// Account actions for the People page (spec T-042a2). Kept free of Deno and
// Supabase imports so the rules can be tested; index.ts wires them up.
//
// Order matters: the database first checks the caller is an owner who used
// the second step, writes the admin log row and ends sessions. Only then
// does the Auth admin API block, unblock, delete or resend.

export const ACTIONS = ['block', 'unblock', 'delete', 'sign out', 'resend confirm'] as const
export type AccountAction = (typeof ACTIONS)[number]

export interface AccountDeps {
  /** admin_account_action, run as the caller with their own session. Returns the person's email. */
  checkAndLog(person: string, action: AccountAction, reason: string): Promise<string>
  /** Blocks (true) or unblocks (false) sign-in. */
  setBlocked(person: string, blocked: boolean): Promise<void>
  /** Removes the person's photo files, then the account and all its rows. */
  removePhotos(person: string): Promise<void>
  deleteAccount(person: string): Promise<void>
  resendConfirm(email: string): Promise<void>
}

export interface Reply {
  status: number
  body: { ok: true } | { error: string }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function handleAccountAction(input: unknown, deps: AccountDeps): Promise<Reply> {
  const { person, action, reason } = (input ?? {}) as Record<string, unknown>
  if (typeof person !== 'string' || !UUID.test(person) || !ACTIONS.includes(action as AccountAction) || typeof reason !== 'string')
    return { status: 400, body: { error: 'bad request' } }
  let email: string
  try {
    email = await deps.checkAndLog(person, action as AccountAction, reason)
  } catch (e) {
    // The database's own message, such as "not allowed" or "a reason is needed".
    return { status: 403, body: { error: e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e) } }
  }
  try {
    if (action === 'block') await deps.setBlocked(person, true)
    if (action === 'unblock') await deps.setBlocked(person, false)
    if (action === 'resend confirm') await deps.resendConfirm(email)
    if (action === 'delete') {
      await deps.removePhotos(person)
      await deps.deleteAccount(person)
    }
  } catch {
    // The log row already says it was tried.
    return { status: 500, body: { error: 'action failed' } }
  }
  return { status: 200, body: { ok: true } }
}
