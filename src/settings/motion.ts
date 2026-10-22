// Small motion and a short buzz for wins (spec T-157). Kept on this phone
// only, like the look. "Reduce motion" on the phone always wins.

export type MotionChoice = 'on' | 'off'

const KEY = 'tmf-motion'

export function readMotion(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): MotionChoice {
  try {
    return storage?.getItem(KEY) === 'off' ? 'off' : 'on'
  } catch {
    return 'on'
  }
}

export function saveMotion(choice: MotionChoice, storage: Pick<Storage, 'setItem' | 'removeItem'> | undefined = globalThis.localStorage) {
  try {
    if (choice === 'on') storage?.removeItem(KEY)
    else storage?.setItem(KEY, choice)
  } catch {
    // Private mode: the choice lasts until the app closes.
  }
}

/** Marks the page so the CSS leaves out the win animations. */
export function applyMotion(choice: MotionChoice, doc: Document = document) {
  if (choice === 'off') doc.documentElement.dataset.motion = 'off'
  else delete doc.documentElement.dataset.motion
}

/** True when wins may move and buzz: the switch is on and the phone doesn't ask to reduce motion. */
export function motionOn(win: Window = window, storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): boolean {
  if (readMotion(storage) === 'off') return false
  return !win.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** A short buzz for a win, such as a new record. Under half a second. */
export const WIN_BUZZ = [40, 60, 40]

export function buzzForWin(win: Window = window) {
  if (!motionOn(win)) return
  try {
    win.navigator.vibrate?.(WIN_BUZZ)
  } catch {
    // No vibration on this phone.
  }
}
