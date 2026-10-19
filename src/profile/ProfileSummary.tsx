// The signup answers on one page (spec T-084). The person sees each part and
// can change it; a coach sees the same parts without the buttons.

import { STEPS } from './labels'
import { summaryRows } from './summary'
import type { ProfileInfo } from './types'

export function ProfileSummary({
  profile,
  weightKg,
  today,
  onChange,
}: {
  profile: ProfileInfo
  weightKg: number | null
  today: string
  /** Opens the signup step to change it; absent for a coach. */
  onChange?: (step: number) => void
}) {
  return (
    <>
      {summaryRows(profile, weightKg, today).map((rows, step) => (
        <section key={step} className="profile-part" aria-label={STEPS[step]}>
          <h3>{STEPS[step]}</h3>
          <dl>
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value ?? <span className="muted">Not given</span>}</dd>
              </div>
            ))}
          </dl>
          {onChange && (
            <button className="link" aria-label={`Change ${STEPS[step]}`} onClick={() => onChange(step)}>
              Change
            </button>
          )}
        </section>
      ))}
    </>
  )
}
