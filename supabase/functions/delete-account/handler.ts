// The person deletes their own account (spec T-042a5). Kept free of Deno and
// Supabase imports so the rules can be tested; index.ts wires them up.
//
// Order matters: find the caller from their own session, let the database
// refuse admins, then remove files, then the sign-in. Every row goes with it.

export interface DeleteDeps {
  /** The signed-in caller's id, or null when the session is not valid. */
  caller(): Promise<string | null>
  /** prepare_delete_me, run as the caller. Throws with the database's message. */
  check(): Promise<void>
  /** Removes the person's progress and certificate photos. */
  removeFiles(person: string): Promise<void>
  deleteAccount(person: string): Promise<void>
}

export interface Reply {
  status: number
  body: { ok: true } | { error: string }
}

export async function handleDeleteMe(input: unknown, deps: DeleteDeps): Promise<Reply> {
  // The person types DELETE; the app sends it so a stray call does nothing.
  if ((input as { confirm?: unknown } | null)?.confirm !== 'DELETE') return { status: 400, body: { error: 'bad request' } }
  const me = await deps.caller().catch(() => null)
  if (!me) return { status: 401, body: { error: 'not signed in' } }
  try {
    await deps.check()
  } catch (e) {
    return { status: 403, body: { error: e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e) } }
  }
  try {
    await deps.removeFiles(me)
    await deps.deleteAccount(me)
  } catch {
    // Safe to try again: files already gone stay gone.
    return { status: 500, body: { error: 'delete failed' } }
  }
  return { status: 200, body: { ok: true } }
}
