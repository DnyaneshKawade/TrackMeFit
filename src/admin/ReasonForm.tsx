// Asks for the reason every admin change needs before it runs (T-042a1).

import { useState, type ReactNode } from 'react'

export function ReasonForm({
  question,
  button,
  onSave,
  onCancel,
  label = 'Reason',
  children,
}: {
  question: string
  button: string
  onSave: (reason: string) => void
  onCancel: () => void
  /** "Note for the coach" when the person sees the reason (T-042a3). */
  label?: string
  /** More fields, shown before the reason. */
  children?: ReactNode
}) {
  const [reason, setReason] = useState('')
  return (
    <form
      className="reason"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(reason)
      }}
    >
      <p>{question}</p>
      {children}
      <label>
        {label}
        <input value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <span className="actions">
        <button className="primary" disabled={!reason.trim()}>{button}</button>
        <button type="button" className="link" onClick={onCancel}>Cancel</button>
      </span>
    </form>
  )
}
