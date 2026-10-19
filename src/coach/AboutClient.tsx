// A client's sign-up answers for their coach, read only (spec T-084).
// Row-level security already lets a coach read their clients' profiles.
// Health answers show only when the client shares them (T-096).

import { useEffect, useState } from 'react'
import { ProfileSummary } from '../profile/ProfileSummary'
import type { ProfileInfo, ProfileStore } from '../profile/types'
import '../profile/profile.css'

export function AboutClient({
  profile,
  weightKg,
  first,
  today,
  healthShared = true,
}: {
  profile: ProfileStore
  weightKg: number | null
  first: string
  today: string
  healthShared?: boolean
}) {
  const [info, setInfo] = useState<ProfileInfo | null | undefined>(undefined)
  useEffect(() => {
    let live = true
    profile.get().then(
      (p) => live && setInfo(p),
      () => live && setInfo(null),
    )
    return () => {
      live = false
    }
  }, [profile])
  return (
    <details className="about-client">
      <summary>About {first}</summary>
      {info === undefined ? (
        <p className="muted">Loading…</p>
      ) : info === null ? (
        <p className="error">Couldn’t load {first}’s answers. Check your connection.</p>
      ) : info.onboardedAt === null ? (
        <p className="muted">{first} has not answered the sign-up questions yet.</p>
      ) : (
        <>
          <p className="muted">{first}’s sign-up answers. Only {first} can change them.</p>
          <ProfileSummary profile={info} weightKg={weightKg} today={today} healthShared={healthShared} />
        </>
      )}
    </details>
  )
}
