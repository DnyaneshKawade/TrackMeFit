// "Your details": the signup answers with a Change button for each part, and
// new suggestions on request (spec T-084).

import { ProfileSummary } from './ProfileSummary'
import type { ProfileInfo } from './types'
import './profile.css'

export function ProfilePage({
  profile,
  weightKg,
  today,
  onChange,
  onBack,
}: {
  profile: ProfileInfo
  weightKg: number | null
  today: string
  onChange: (step: number) => void
  onBack: () => void
}) {
  return (
    <main className="log profile-page">
      <button className="link back" onClick={onBack}>Back</button>
      <h2>Your details</h2>
      <p className="muted">These are your sign-up answers. Change any part at any time.</p>
      <ProfileSummary profile={profile} weightKg={weightKg} today={today} onChange={onChange} />
      <section className="profile-part" aria-label="Suggestions">
        <h3>Suggestions</h3>
        <p className="muted">Get new suggested targets and a day of meals from your answers. Nothing changes until you choose to use them.</p>
        <button className="primary" onClick={() => onChange(6)}>Suggest targets and meals</button>
      </section>
    </main>
  )
}
