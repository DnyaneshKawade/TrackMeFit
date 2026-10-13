// Size budget for what a phone downloads. Run after `vite build`; fails CI when
// a file grows past its budget so slow-network users are not surprised.
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

export interface Budget {
  /** Start of the built file name, before the content hash. */
  prefix: string
  ext: string
  maxGzipKb: number
}

export const BUDGETS: Budget[] = [
  { prefix: 'index-', ext: '.js', maxGzipKb: 140 },
  { prefix: 'index-', ext: '.css', maxGzipKb: 8 },
  // The bundled food list; T-038 moves it to the database and removes it.
  { prefix: 'catalogueData-', ext: '.js', maxGzipKb: 600 },
]

export function overBudget(files: { name: string; gzipKb: number }[], budgets = BUDGETS): string[] {
  const problems: string[] = []
  for (const f of files) {
    const b = budgets.find((x) => f.name.startsWith(x.prefix) && f.name.endsWith(x.ext))
    if (!b) {
      if (f.gzipKb > 50) problems.push(`${f.name} is ${f.gzipKb.toFixed(1)} KB gzip and has no budget; add one in build/checkSize.ts`)
    } else if (f.gzipKb > b.maxGzipKb) {
      problems.push(`${f.name} is ${f.gzipKb.toFixed(1)} KB gzip, over its ${b.maxGzipKb} KB budget`)
    }
  }
  return problems
}

export function measure(dir: string) {
  return readdirSync(dir)
    .filter((n) => n.endsWith('.js') || n.endsWith('.css'))
    .map((name) => ({ name, gzipKb: gzipSync(readFileSync(join(dir, name))).length / 1024 }))
}
