import { describe, expect, it } from 'vitest'
import { handleStartView, type ViewDeps } from '../../supabase/functions/admin-view/handler'

// The admin-view Edge Function (spec T-042a4): the database checks and logs
// first; the one-time sign-in is made only after that.

const ID = '00000000-0000-4000-8000-000000000042'

function fakeDeps(opts: { refuse?: string; fail?: boolean } = {}) {
  const calls: string[] = []
  const deps: ViewDeps = {
    async checkAndLog(_person, reason) {
      calls.push(`log ${reason}`)
      if (opts.refuse) throw new Error(opts.refuse)
      return { viewId: 'v1', email: 'asha@example.com' }
    },
    async signInToken(email) {
      if (opts.fail) throw new Error('auth down')
      calls.push(`token ${email}`)
      return 'hash-1'
    },
  }
  return { deps, calls }
}

describe('admin-view function (T-042a4)', () => {
  it('3. returns a one-time sign-in only after the database allows and logs the view', async () => {
    const ok = fakeDeps()
    expect(await handleStartView({ person: ID, reason: 'Targets vanished' }, ok.deps)).toEqual({ status: 200, body: { viewId: 'v1', tokenHash: 'hash-1' } })
    expect(ok.calls).toEqual(['log Targets vanished', 'token asha@example.com'])

    const refused = fakeDeps({ refuse: 'admins cannot be viewed' })
    expect(await handleStartView({ person: ID, reason: 'x' }, refused.deps)).toEqual({ status: 403, body: { error: 'admins cannot be viewed' } })
    expect(refused.calls).toEqual(['log x'])

    const bad = fakeDeps()
    for (const input of [null, { person: 'nope', reason: 'x' }, { person: ID }])
      expect((await handleStartView(input, bad.deps)).status).toBe(400)
    expect(bad.calls).toEqual([])

    const failed = fakeDeps({ fail: true })
    expect(await handleStartView({ person: ID, reason: 'x' }, failed.deps)).toEqual({ status: 500, body: { error: 'action failed' } })
  })
})
