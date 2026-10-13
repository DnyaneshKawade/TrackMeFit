import { describe, expect, it } from 'vitest'
import { catalogue } from '../food/catalogueData'
import { tagsFromText } from '../food/dietTags'
import type { DietTag } from '../food/types'
import { ALL_DIET_ITEMS, allowedExtras, dietItemsFor, estimateDiet, extraFromFood } from './currentDiet'
import { allowedFoods, cleanRules, excludedTags, hasNonvegOff } from './dietRules'

const byId = new Map(catalogue.map((f) => [f.id, f]))
const tags = (id: string) => byId.get(id)!.tags
const labels = (diet: Parameters<typeof excludedTags>[0], rules: string[] = []) => dietItemsFor(excludedTags(diet, rules)).map((i) => i.label)
const text = (s: string) => [...tagsFromText(s)].sort()

describe('food tags', () => {
  it('tags dishes from their recipe ingredients, not their name', () => {
    expect(tags('tmf:dish:chicken-curry')).toEqual(expect.arrayContaining(['meat', 'dairy', 'onion_garlic']))
    expect(tags('tmf:dish:boiled-egg')).toContain('egg')
    expect(tags('tmf:dish:aloo-gobi')).toEqual(expect.arrayContaining(['root', 'onion_garlic']))
    expect(tags('tmf:dish:jain-mix-veg')).toEqual([])
    expect(tags('tmf:dish:roti')).toEqual([])
    expect(byId.get('tmf:dish:roti')!.tagsGuessed).toBeUndefined()
  })

  it('guesses tags from the name for foods without a recipe, and says so', () => {
    const guessed = catalogue.filter((f) => f.tagsGuessed)
    expect(guessed.length).toBeGreaterThan(1000)
    expect(guessed.every((f) => Array.isArray(f.tags))).toBe(true)
  })

  it('reads names the way people write them', () => {
    expect(text('Chicken tikka')).toEqual(['meat'])
    expect(text('Prawn curry with onion')).toEqual(['fish', 'onion_garlic'])
    expect(text('Anda bhurji')).toEqual(['egg'])
    expect(text('Paneer butter masala')).toEqual(['dairy'])
    expect(text('Aloo paratha')).toEqual(['root'])
    expect(text('Honey')).toEqual(['honey'])
  })

  it('does not mistake plant foods for animal ones', () => {
    expect(text('Coconut milk')).toEqual([])
    expect(text('Peanut butter, smooth')).toEqual([])
    expect(text('Eggless cake')).toEqual([])
    expect(text('Eggplant, raw')).toEqual([])
    expect(text('Soy milk')).toEqual([])
    expect(text('Goat milk')).toEqual(['dairy'])
    expect(text('Brinjal (baingan)')).toEqual([])
  })
})

describe('what each diet leaves out', () => {
  const set = (...t: DietTag[]) => new Set(t)

  it('everything: nothing', () => expect(excludedTags('nonveg')).toEqual(set()))
  it('eggetarian: meat and fish', () => expect(excludedTags('eggetarian')).toEqual(set('meat', 'fish')))
  it('vegetarian: meat, fish and egg', () => expect(excludedTags('veg')).toEqual(set('meat', 'fish', 'egg')))
  it('vegan: animal foods, dairy and honey', () => expect(excludedTags('vegan')).toEqual(set('meat', 'fish', 'egg', 'dairy', 'honey')))
  it('Jain: animal foods, honey, roots, onion and garlic', () =>
    expect(excludedTags('jain')).toEqual(set('meat', 'fish', 'egg', 'honey', 'root', 'onion_garlic')))
  it('adds onion and garlic for that rule, and allergies', () =>
    expect(excludedTags('nonveg', ['no_onion_garlic'], ['milk', 'egg', 'peanuts'])).toEqual(set('onion_garlic', 'dairy', 'egg')))
})

describe('typical day by diet', () => {
  it('4. vegetarian and Jain: no egg or meat items', () => {
    for (const diet of ['veg', 'jain'] as const) {
      expect(labels(diet)).not.toContain('Eggs')
      expect(labels(diet)).not.toContain('Chicken, fish or mutton')
    }
  })

  it('5. eggetarian: eggs but no meat or fish', () => {
    expect(labels('eggetarian')).toContain('Eggs')
    expect(labels('eggetarian')).not.toContain('Chicken, fish or mutton')
  })

  it('6. vegan: no milk, curd, chai or milk sweets, but dal and roti stay', () => {
    const l = labels('vegan')
    for (const gone of ['Milk', 'Curd (dahi)', 'Tea or coffee with milk and sugar', 'Sweets', 'Eggs']) expect(l).not.toContain(gone)
    expect(l).toEqual(expect.arrayContaining(['Dal', 'Roti or chapati', 'Sabzi']))
  })

  it('7. Jain and no onion or garlic: Jain dal and sabzi instead', () => {
    expect(labels('jain')).toEqual(expect.arrayContaining(['Dal (no onion or garlic)', 'Sabzi (no roots, onion or garlic)']))
    expect(labels('jain')).not.toContain('Sabzi')
    expect(labels('veg', ['no_onion_garlic'])).toEqual(expect.arrayContaining(['Dal (no onion or garlic)', 'Sabzi (no roots, onion or garlic)']))
    expect(labels('nonveg')).toEqual(expect.arrayContaining(['Dal', 'Sabzi', 'Eggs', 'Chicken, fish or mutton']))
  })

  it('7. the Jain alternatives really have no roots, onion or garlic in their recipes', () => {
    const jain = excludedTags('jain')
    for (const item of ALL_DIET_ITEMS.filter((i) => i.alt)) expect(byId.get(item.alt!.id)!.tags!.filter((t) => jain.has(t))).toEqual([])
    // "Fried snacks" is a general row (samosa, pakoras, kachori); its numbers
    // come from a potato samosa, which is the only Jain-shown row with a root.
    expect(dietItemsFor(jain).filter((i) => byId.get(i.id)!.tags!.some((t) => jain.has(t))).map((i) => i.label)).toEqual(['Fried snacks'])
  })

  it('8. search results follow the diet', () => {
    const veg = excludedTags('veg')
    const found = allowedFoods(catalogue.filter((f) => /bhurji/i.test(f.name)), veg)
    expect(found.length).toBeGreaterThan(0)
    expect(found.some((f) => /egg|anda/i.test(f.name))).toBe(false)
  })

  it('9. counts for hidden items and extras are dropped', () => {
    const veg = excludedTags('veg')
    const egg = extraFromFood(byId.get('tmf:dish:boiled-egg')!)
    const kept = allowedExtras([egg, { id: 'custom:1:Bar', name: 'Bar', portion: 'your amount', kcal: 200, proteinG: 20, count: 1 }], veg)
    expect(kept.map((e) => e.name)).toEqual(['Bar'])
    const d = estimateDiet({ 'tmf:dish:roti': 2, 'tmf:dish:boiled-egg': 3 }, kept, dietItemsFor(veg))
    expect(d.counts).toEqual({ 'tmf:dish:roti': 2 })
  })
})

describe('non-veg-free days', () => {
  it('2, 3. apply only to people who eat non-veg or eggs, and are cleared otherwise', () => {
    expect([hasNonvegOff('nonveg'), hasNonvegOff('eggetarian'), hasNonvegOff('veg'), hasNonvegOff(null)]).toEqual([true, true, false, false])
    const rules = ['no_onion_garlic', 'nonveg_off:tue', 'nonveg_off:shravan']
    expect(cleanRules('nonveg', rules)).toEqual(rules)
    expect(cleanRules('jain', rules)).toEqual(['no_onion_garlic'])
  })
})
