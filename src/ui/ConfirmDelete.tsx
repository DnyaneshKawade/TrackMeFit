// A delete that asks first (spec T-124): the first tap asks, the second deletes.

import { useState } from 'react'

export function ConfirmDelete({
  label,
  question,
  onConfirm,
  ariaLabel,
  yes = 'Yes, delete',
  danger = false,
}: {
  /** The button that starts it, like "Remove". */
  label: string
  /** What goes, like "Delete this photo? You can’t undo this." */
  question: string
  onConfirm: () => Promise<void>
  ariaLabel?: string
  yes?: string
  /** Red start button, for big deletes like a whole plan. */
  danger?: boolean
}) {
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const go = async () => {
    setBusy(true)
    setError(false)
    try {
      await onConfirm()
      setAsking(false)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  if (!asking)
    return (
      <button type="button" className={danger ? 'link danger' : 'link'} aria-label={ariaLabel} onClick={() => setAsking(true)}>
        {label}
      </button>
    )
  return (
    <span className="confirm-delete" role="group" aria-label={question}>
      <span>{question}</span>
      <button type="button" className="link danger" disabled={busy} onClick={() => void go()}>{yes}</button>
      <button type="button" className="link" onClick={() => setAsking(false)}>Keep</button>
      {error && <span className="error" role="alert">Couldn’t delete it. Check your connection and try again.</span>}
    </span>
  )
}
