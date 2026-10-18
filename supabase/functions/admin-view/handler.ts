// View as a person (spec T-042a4). Kept free of Deno and Supabase imports so
// the rules can be tested; index.ts wires them up.
//
// Order matters: the database first checks the caller is an owner who used
// the second step, refuses unsafe targets and writes the log row. Only then
// is a one-time sign-in made for the person.

export interface ViewDeps {
  /** admin_start_view, run as the caller with their own session. */
  checkAndLog(person: string, reason: string): Promise<{ viewId: string; email: string }>
  /** A one-time sign-in token for this email, made with the service key. */
  signInToken(email: string): Promise<string>
}

export interface ViewReply {
  status: number
  body: { viewId: string; tokenHash: string } | { error: string }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function handleStartView(input: unknown, deps: ViewDeps): Promise<ViewReply> {
  const { person, reason } = (input ?? {}) as Record<string, unknown>
  if (typeof person !== 'string' || !UUID.test(person) || typeof reason !== 'string') return { status: 400, body: { error: 'bad request' } }
  let view: { viewId: string; email: string }
  try {
    view = await deps.checkAndLog(person, reason)
  } catch (e) {
    // The database's own message, such as "not allowed" or "admins cannot be viewed".
    return { status: 403, body: { error: e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e) } }
  }
  try {
    return { status: 200, body: { viewId: view.viewId, tokenHash: await deps.signInToken(view.email) } }
  } catch {
    // The log row already says it was tried.
    return { status: 500, body: { error: 'action failed' } }
  }
}
