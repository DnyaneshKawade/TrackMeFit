import { describe, expect, it } from 'vitest'
import { handleDeleteMe, type DeleteDeps } from '../../supabase/functions/delete-account/handler'

// The delete-account Edge Function (spec T-042a5): the caller deletes only
// themselves, after the database checks they are not an admin.

const ID = '00000000-0000-4000-8000-000000000042'

function fakeDeps(opts: { me?: string | null; refuse?: string; fail?: boolean } = {}) {
  const calls: string[] = []
  const deps: DeleteDeps = {
    async caller() {
      return opts.me === undefined ? ID : opts.me
    },
    async check() {
      calls.push('check')
      if (opts.refuse) throw new Error(opts.refuse)
    },
    async removeFiles(person) {
      calls.push(`remove files ${person}`)
    },
    async deleteAccount(person) {
      if (opts.fail) throw new Error('auth down')
      calls.push(`delete ${person}`)
    },
  }
  return { deps, calls }
}

describe('delete-account function (T-042a5)', () => {
  it('2. deletes my account: checks, removes files, then the sign-in', async () => {
    const { deps, calls } = fakeDeps()
    expect(await handleDeleteMe({ confirm: 'DELETE' }, deps)).toEqual({ status: 200, body: { ok: true } })
    expect(calls).toEqual(['check', `remove files ${ID}`, `delete ${ID}`])
  })

  it('2. does nothing without DELETE or a valid sign-in', async () => {
    for (const body of [null, {}, { confirm: 'delete' }]) {
      const { deps, calls } = fakeDeps()
      expect((await handleDeleteMe(body, deps)).status).toBe(400)
      expect(calls).toEqual([])
    }
    const { deps, calls } = fakeDeps({ me: null })
    expect(await handleDeleteMe({ confirm: 'DELETE' }, deps)).toEqual({ status: 401, body: { error: 'not signed in' } })
    expect(calls).toEqual([])
  })

  it('3. stops when the database refuses, such as for an admin', async () => {
    const { deps, calls } = fakeDeps({ refuse: 'remove them as admin first' })
    expect(await handleDeleteMe({ confirm: 'DELETE' }, deps)).toEqual({ status: 403, body: { error: 'remove them as admin first' } })
    expect(calls).toEqual(['check'])
  })

  it('2. says when the delete failed, so the person can try again', async () => {
    const { deps } = fakeDeps({ fail: true })
    expect(await handleDeleteMe({ confirm: 'DELETE' }, deps)).toEqual({ status: 500, body: { error: 'delete failed' } })
  })
})
