// Light or dark (spec T-101b). Kept on this phone only: each phone can look
// different, and the choice works before sign-in.

export type ThemeChoice = 'system' | 'light' | 'dark'

const KEY = 'tmf-theme'
/** The top bar colour on Android, for each look. */
const BAR = { light: '#f5f6f8', dark: '#0d131b' }

export function readTheme(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): ThemeChoice {
  try {
    const v = storage?.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function saveTheme(choice: ThemeChoice, storage: Pick<Storage, 'setItem' | 'removeItem'> | undefined = globalThis.localStorage) {
  try {
    if (choice === 'system') storage?.removeItem(KEY)
    else storage?.setItem(KEY, choice)
  } catch {
    // Private mode: the choice lasts until the app closes.
  }
}

/** Sets the look on the page. "system" follows the phone setting. */
export function applyTheme(choice: ThemeChoice, doc: Document = document) {
  const root = doc.documentElement
  if (choice === 'system') delete root.dataset.theme
  else root.dataset.theme = choice
  const dark = choice === 'dark' || (choice === 'system' && !!doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches)
  doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? BAR.dark : BAR.light)
}
