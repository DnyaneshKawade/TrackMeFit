import { describe, expect, it } from 'vitest'
import { handleAccountAction, type AccountDeps } from '../../supabase/functions/admin-account/handler'

// The admin-account Edge Function (spec T-042a2): the database checks and
// logs first; the Auth admin API acts only after that.

const ID = '00000000-0000-4000-8000-000000000042'

function fakeDeps(opts: { refuse?: string; fail?: boolean } = {}) {
  const calls: string[] = []
  const deps: AccountDeps = {
    async checkAndLog(_person, action, reason) {
      calls.push(`log ${action} ${reason}`)
      if (opts.refuse) throw new Error(opts.refuse)
      return 'asha@example.com'
    },
    async setBlocked(_person, blocked) {
      if (opts.fail) throw new Error('auth down')
      calls.push(blocked ? 'ban' : 'unban')
    },
    async removePhotos() {
      calls.push('remove photos')
    },
    async deleteAccount() {
      calls.push('delete account')
    },
    async resendConfirm(email) {
      calls.push(`resend ${email}`)
    },
  }
  return { deps, calls }
}

describe('admin-account function (T-042a2)', () => {
  it('6. logs first, then blocks, unblocks, deletes or resends', async () => {
    for (const [action, then] of [
      ['block', ['ban']],
      ['unblock', ['unban']],
      ['delete', ['remove photos', 'delete account']],
      ['resend confirm', ['resend asha@example.com']],
      ['sign out', []],
    ] as const) {
      const { deps, calls } = fakeDeps()
      expect(await handleAccountAction({ person: ID, action, reason: 'Asked by email' }, deps)).toEqual({ status: 200, body: { ok: true } })
      expect(calls).toEqual([`log ${action} Asked by email`, ...then])
    }
  })

  it('7. does nothing when the database refuses the caller', async () => {
    const { deps, calls } = fakeDeps({ refuse: 'not allowed' })
    expect(await handleAccountAction({ person: ID, action: 'delete', reason: 'x' }, deps)).toEqual({ status: 403, body: { error: 'not allowed' } })
    expect(calls).toEqual(['log delete x'])
  })

  it('8. turns away bad requests before anything runs', async () => {
    for (const body of [null, {}, { person: 'abc', action: 'block', reason: 'x' }, { person: ID, action: 'drop', reason: 'x' }, { person: ID, action: 'block' }]) {
      const { deps, calls } = fakeDeps()
      expect((await handleAccountAction(body, deps)).status).toBe(400)
      expect(calls).toEqual([])
    }
  })

  it('9. says when the action failed after the log row', async () => {
    const { deps } = fakeDeps({ fail: true })
    expect(await handleAccountAction({ person: ID, action: 'block', reason: 'Spam' }, deps)).toEqual({ status: 500, body: { error: 'action failed' } })
  })
})
