// Simple words across the app (specs T-064 and T-075, rules in docs/words.md).
// Reads the text in every screen and engine and flags hard words, long
// sentences and hard reading, so new text stays easy for a 10-year-old.

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
  [/\bestimat(e|es|ed|ing)\b/i, 'how much, guess'],
  [/\bmetabolism\b|\bmetabolic\b/i, 'how fast you burn food'],
  [/\btypical(ly)?\b/i, 'usual'],
  [/\bprobably\b/i, 'may, likely'],
  [/\bguidance\b/i, 'help'],
  [/\bnutrition(al)?\b|\bnutrients?\b/i, 'food'],
  [/\bminimum\b|\bmaximum\b/i, 'lowest, highest'],
  [/\bconsult\b/i, 'talk to'],
  [/\brecommend(ed|s)?\b/i, 'suggest'],
  [/\bachieve\b/i, 'reach'],
  [/\butili[sz]e\b/i, 'use'],
  [/\bportion\b/i, 'amount'],
  [/\bensure\b/i, 'make sure'],
  [/\bsubsequent|\bprior to\b/i, 'next, before'],
  [/\boptimal\b/i, 'best'],
  [/\badequate\b|\bsufficient\b/i, 'enough'],
  [/\bconsume\b/i, 'eat'],
  [/\bkcal\b/, 'calories'],
  // Idioms that don't translate.
  [/done its job|stick to|keep up\b|one-off|run down|sessions running/i, 'say it plainly'],
]

/** The longest sentence allowed, in words. */
const MAX_WORDS = 12

/** The hardest reading level allowed for a file's sentences (school grade). */
const MAX_GRADE = 5

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
    // Database column lists, not text people read.
    if (/\b[a-z]+_[a-z_]+\b/.test(text) && !/[A-Z][a-z]/.test(text)) continue
    out.push(text)
  }
  return out
}

function hardWords(text: string): string[] {
  const clean = EXPLAINED.reduce((t, e) => t.replace(e, ''), text)
  return HARD_WORDS.flatMap(([re, use]) => (re.test(clean) ? [`"${clean.match(re)![0]}" (use: ${use})`] : []))
}

function longSentences(text: string, max = MAX_WORDS): string[] {
  return sentencesIn(text).filter((s) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length > max)
}

const sentencesIn = (text: string) => text.split(/(?<=[.?!])\s+/)

/** Syllables in an English word, counted from its vowel groups. Close enough
 * for a reading-level check, which only needs a fair average. */
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length <= 3) return 1
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups?.length ?? 1)
}

/** Flesch-Kincaid school grade for full sentences (five words or more). */
function readingGrade(texts: string[]): { grade: number; words: number } {
  let words = 0
  let sentences = 0
  let syl = 0
  for (const s of texts.flatMap(sentencesIn)) {
    const ws = s.split(/\s+/).filter((w) => /[A-Za-z]/.test(w))
    if (ws.length < 5) continue
    sentences++
    words += ws.length
    syl += ws.reduce((n, w) => n + syllables(w), 0)
  }
  return { grade: sentences ? 0.39 * (words / sentences) + 11.8 * (syl / words) - 15.59 : 0, words }
}

describe('simple words (T-064, T-075)', () => {
  it('finds hard words and long sentences', () => {
    expect(textsIn(`const a = 'Your trend weight' // a comment with trend\n<p>Go by the trend.</p>`)).toEqual(['Your trend weight', 'Go by the trend.'])
    expect(hardWords('Your trend weight')).toEqual(['"trend" (use: average)'])
    expect(hardWords('This is your light week (in gyms it is called a deload).')).toEqual([])
    expect(longSentences(`${'word '.repeat(12)}end. Short one.`)).toHaveLength(1)
    expect(textsIn(`const q = 'id, full_name, goal_rate'`)).toEqual([])
    expect(syllables('cat')).toBe(1)
    expect(syllables('protein')).toBe(2)
    expect(syllables('vegetables')).toBe(4)
    expect(readingGrade(['The cat sat on the mat today.']).grade).toBeLessThan(MAX_GRADE)
    expect(readingGrade(['Consumption of carbohydrate-dense provisions necessitates considerable deliberation.']).grade).toBeGreaterThan(MAX_GRADE)
  })

  it('1. no screen or reason uses a hard word', () => {
    const found = Object.entries(sources).flatMap(([file, code]) => textsIn(code).flatMap((t) => hardWords(t).map((w) => `${file}: ${w} in "${t}"`)))
    expect(found).toEqual([])
  })

  it(`2. no sentence is longer than ${MAX_WORDS} words`, () => {
    const found = Object.entries(sources).flatMap(([file, code]) => textsIn(code).flatMap((t) => longSentences(t).map((s) => `${file}: ${s}`)))
    expect(found).toEqual([])
  })

  it(`3. every file reads at grade ${MAX_GRADE} or lower`, () => {
    const found = Object.entries(sources).flatMap(([file, code]) => {
      const { grade, words } = readingGrade(textsIn(code))
      // Too few words for a fair grade.
      return words >= 30 && grade > MAX_GRADE ? [`${file}: grade ${grade.toFixed(1)}`] : []
    })
    expect(found).toEqual([])
  })
})
