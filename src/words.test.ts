// Simple words across the app (spec T-064, rules in docs/words.md). Reads the
// text in every screen and engine and flags hard words and long sentences,
// so new text stays easy for people with little English.

import { describe, expect, it } from 'vitest'

const sources = import.meta.glob(['./**/*.{ts,tsx}', '!./**/*.test.{ts,tsx}', '!./food/indian/**', '!./food/catalogueData.ts', '!./db/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Words to avoid in what people read, with the simple word to use. */
const HARD_WORDS: [RegExp, string][] = [
  [/\btrend\b/i, 'average'],
  [/\bdeload/i, 'light week'],
  [/\bin reserve\b|\bRIR\b/, 'reps left'],
  [/\bsurplus\b/i, 'extra calories'],
  [/\bdeficit\b/i, 'eat less than you burn'],
  [/\bmaintenance\b|\bTDEE\b/i, 'calories you burn'],
  [/\bsync(ed|s|ing)?\b/i, 'go online'],
  [/\bsensible\b/i, 'fair'],
  [/\bmacros\b/i, 'protein, carbs and fat'],
  [/\broughly\b|\bapproximately\b/i, 'about'],
  [/\bregain\b/i, 'gain back'],
  [/\bmoderate\b/i, 'slow'],
  [/\bintake\b/i, 'what you eat'],
  [/\bestimate\b/i, 'how much'],
  [/\bensure\b/i, 'make sure'],
  [/\bsubsequent|\bprior to\b/i, 'next, before'],
  [/\boptimal\b/i, 'best'],
  [/\badequate\b|\bsufficient\b/i, 'enough'],
  [/\bconsume\b/i, 'eat'],
  // Idioms that don't translate.
  [/done its job|stick to|keep up\b|one-off|run down|sessions running/i, 'say it plainly'],
]

/** The longest sentence allowed, in words. */
const MAX_WORDS = 20

/** Phrases allowed where the hard word is explained once. */
const EXPLAINED = ['in gyms it is called a deload']

const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1')

/** Text people read: string literals and JSX text with at least two words. */
function textsIn(code: string): string[] {
  const out: string[] = []
  const pat = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`|>([^<>{}=;()]*[A-Za-z][^<>{}=;()]*)</g
  for (const m of stripComments(code).matchAll(pat)) {
    const text = (m[1] ?? m[2] ?? m[3] ?? m[4]).replace(/\$\{[^}]*\}/g, 'X').trim()
    if (text.split(/\s+/).length < 2 || /^[\w./@:-]+ [\w./@:-]+$/.test(text) && !/[A-Z][a-z]/.test(text)) continue
    if (/import |=>|\bconst\b|className|function\b/.test(text)) continue
    out.push(text)
  }
  return out
}

function hardWords(text: string): string[] {
  const clean = EXPLAINED.reduce((t, e) => t.replace(e, ''), text)
  return HARD_WORDS.flatMap(([re, use]) => (re.test(clean) ? [`"${clean.match(re)![0]}" (use: ${use})`] : []))
}

function longSentences(text: string, max = MAX_WORDS): string[] {
  return text.split(/(?<=[.?!])\s+/).filter((s) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length > max)
}

describe('simple words (T-064)', () => {
  it('finds hard words and long sentences', () => {
    expect(textsIn(`const a = 'Your trend weight' // a comment with trend\n<p>Go by the trend.</p>`)).toEqual(['Your trend weight', 'Go by the trend.'])
    expect(hardWords('Your trend weight')).toEqual(['"trend" (use: average)'])
    expect(hardWords('This is your light week (in gyms it is called a deload).')).toEqual([])
    expect(longSentences(`${'word '.repeat(26)}end. Short one.`)).toHaveLength(1)
  })

  it('1. no screen or reason uses a hard word', () => {
    const found = Object.entries(sources).flatMap(([file, code]) => textsIn(code).flatMap((t) => hardWords(t).map((w) => `${file}: ${w} in "${t}"`)))
    expect(found).toEqual([])
  })

  it(`2. no sentence is longer than ${MAX_WORDS} words`, () => {
    const found = Object.entries(sources).flatMap(([file, code]) => textsIn(code).flatMap((t) => longSentences(t).map((s) => `${file}: ${s}`)))
    expect(found).toEqual([])
  })
})
