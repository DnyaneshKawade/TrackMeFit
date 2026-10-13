// Gives the service worker's cache a name tied to this build, so a new deploy
// starts a fresh cache and the old one (with old built files) is deleted.
import { createHash } from 'node:crypto'

const CACHE_LINE = /const CACHE = '[^']*'/

/** Short id that changes whenever any built file name (and so its content) changes. */
export function buildId(fileNames: string[]): string {
  return createHash('sha256').update([...fileNames].sort().join('\n')).digest('hex').slice(0, 10)
}

export function stampServiceWorker(source: string, id: string): string {
  if (!CACHE_LINE.test(source)) throw new Error('sw.js has no `const CACHE = …` line to stamp')
  return source.replace(CACHE_LINE, `const CACHE = 'tmf-${id}'`)
}
