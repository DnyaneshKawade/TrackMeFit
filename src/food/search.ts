// Food search tuned for Indian names: matches names, aliases (Hinglish,
// regional, English) and brands, ignoring case, accents and punctuation.

import type { Food, FoodSource } from './types'

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

interface Entry {
  food: Food
  name: string
  aliases: string[]
  words: string[]
}

export interface SearchIndex {
  entries: Entry[]
  /** Constant-time lookup by id; the first entry with an id wins. */
  byId: Map<string, Food>
}

const indexOf = (entries: Entry[]): SearchIndex => {
  const byId = new Map<string, Food>()
  for (const e of entries) if (!byId.has(e.food.id)) byId.set(e.food.id, e.food)
  return { entries, byId }
}

export function createSearchIndex(foods: Food[]): SearchIndex {
  return indexOf(
    foods.map((food) => {
      const name = normalize(food.name)
      const aliases = (food.aliases ?? []).map(normalize).filter(Boolean)
      const words = [name, ...aliases, normalize(food.brand ?? '')].join(' ').split(' ').filter(Boolean)
      return { food, name, aliases, words }
    }),
  )
}

// Home-cooked dishes first, then raw ingredients, then packaged products.
const SOURCE_RANK: Partial<Record<FoodSource, number>> = { user: 0, trackMeFit: 1, usda: 2, openFoodFacts: 3 }

const startsWithWord = (s: string, q: string) => s === q || s.startsWith(q + ' ')
const hasWord = (s: string, q: string) => (' ' + s + ' ').includes(' ' + q + ' ')

// Whole-word matches beat partial ones, so "dal" ranks "Dal makhani" and
// "Moong dal" above "Dalgona coffee". A regional name counts the same as the
// name, so "dahi" finds our curd before packaged products called "Dahi".
function score(e: Entry, q: string, tokens: string[]): number {
  if (e.name === q || e.aliases.includes(q)) return 100
  if (startsWithWord(e.name, q) || e.aliases.some((a) => startsWithWord(a, q))) return 80
  if (hasWord(e.name, q) || e.aliases.some((a) => hasWord(a, q))) return 65
  if (tokens.every((t) => e.words.includes(t))) return 60
  if (e.name.startsWith(q) || e.aliases.some((a) => a.startsWith(q))) return 50
  if (tokens.every((t) => e.words.some((w) => w.startsWith(t)))) return 40
  return 0
}

/** Best matches first. Ties go to our own dishes, then shorter names, then id
 * (the same order as search_foods in the database, T-038). */
export function searchFoods(index: SearchIndex, query: string, limit = 30): Food[] {
  const q = normalize(query)
  if (!q) return []
  const tokens = q.split(' ')
  const hits: { e: Entry; s: number }[] = []
  for (const e of index.entries) {
    const s = score(e, q, tokens)
    if (s) hits.push({ e, s })
  }
  hits.sort(
    (a, b) =>
      b.s - a.s ||
      (SOURCE_RANK[a.e.food.source] ?? 9) - (SOURCE_RANK[b.e.food.source] ?? 9) ||
      a.e.name.length - b.e.name.length ||
      (a.e.food.id < b.e.food.id ? -1 : a.e.food.id > b.e.food.id ? 1 : 0),
  )
  return hits.slice(0, limit).map((h) => h.e.food)
}

/** The index with extra foods (the person's own) added in front. */
export function withFoods(index: SearchIndex, foods: Food[]): SearchIndex {
  if (!foods.length) return index
  const ids = new Set(foods.map((f) => f.id))
  return indexOf([...createSearchIndex(foods).entries, ...index.entries.filter((e) => !ids.has(e.food.id))])
}

/** A food by id, for re-opening recent foods. */
export const findFood = (index: SearchIndex, id: string): Food | undefined => index.byId.get(id)
