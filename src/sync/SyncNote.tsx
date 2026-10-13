// The note about work waiting on the phone to sync (spec T-027).

import type { Sync } from './outbox'
import { useSync } from './useSync'

export function SyncNote({ sync, noun }: { sync: Sync | undefined; noun: [one: string, many: string] }) {
  const { pending, refused } = useSync(sync)
  const count = (n: number) => `${n} ${n === 1 ? noun[0] : noun[1]}`
  return (
    <>
      {pending.size > 0 && (
        <p className="info" role="status" aria-label="Waiting for internet">
          {count(pending.size)} saved on this phone. They will go online when you have internet.
        </p>
      )}
      {refused > 0 && (
        <p className="error" role="alert">
          {count(refused)} couldn’t be saved.{' '}
          <button className="link" onClick={() => sync?.clearRefused()}>OK</button>
        </p>
      )}
    </>
  )
}
