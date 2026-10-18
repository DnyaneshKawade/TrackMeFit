// Asks for the reason every admin change needs before it runs (T-042a1).

import { useState } from 'react'

export function ReasonForm({ question, button, onSave, onCancel }: { question: string; button: string; onSave: (reason: string) => void; onCancel: () => void }) {
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
      <label>
        Reason
        <input value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <span className="actions">
        <button className="primary" disabled={!reason.trim()}>{button}</button>
        <button type="button" className="link" onClick={onCancel}>Cancel</button>
      </span>
    </form>
  )
}
