import { describe, expect, it } from 'vitest'
import { parseUsdaMacros, resolveIngredients, splitCsvLine } from './resolve'
import type { Ingredient } from './ingredients'

// Made-up test numbers, not real USDA values.
const CSV = [
  'fdc_id,ndb_number,category,description,kcal,protein_g,carb_g,fat_g',
  '1,16101,Legumes,"Pigeon peas (red gram), mature seeds, raw",300,20.0,60.0,1.5',
  '2,1003,Dairy,"Butter oil, anhydrous",900,0.3,0,99.5',
].join('\n')

const ingredients: Ingredient[] = [
  { id: 'tmf:ing:toor-dal', name: 'Toor dal', aliases: [], values: { kind: 'usda', description: 'Pigeon peas (red gram), mature seeds, raw' } },
  { id: 'tmf:ing:ghee', name: 'Ghee', aliases: [], values: { kind: 'usda', description: 'Butter oil, anhydrous' } },
  { id: 'tmf:ing:okra', name: 'Okra', aliases: [], values: { kind: 'usda', description: 'Okra, raw' } },
  { id: 'tmf:ing:paneer', name: 'Paneer', aliases: [], values: { kind: 'label', note: 'Needs a label' } },
  { id: 'tmf:ing:water', name: 'Water', aliases: [], values: { kind: 'fixed', per100g: { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 } } },
]

describe('splitCsvLine', () => {
  it('keeps commas and escaped quotes inside quoted fields', () => {
    expect(splitCsvLine('1,"a, b","say ""hi""",')).toEqual(['1', 'a, b', 'say "hi"', ''])
  })
})

describe('parseUsdaMacros', () => {
  it('reads rows by column name', () => {
    const rows = parseUsdaMacros(CSV)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({
      fdcId: '1',
      description: 'Pigeon peas (red gram), mature seeds, raw',
      per100g: { kcal: 300, proteinG: 20, carbG: 60, fatG: 1.5 },
    })
  })

  it('fails loudly on a wrong file', () => {
    expect(() => parseUsdaMacros('a,b\n1,2')).toThrow(/missing column/)
  })
})

describe('resolveIngredients', () => {
  it('matches USDA by exact description and keeps the USDA id', () => {
    const { foods } = resolveIngredients(ingredients, parseUsdaMacros(CSV))
    expect(foods.get('tmf:ing:toor-dal')).toMatchObject({ source: 'usda', sourceId: '1', state: 'raw' })
    expect(foods.get('tmf:ing:water')?.per100g.kcal).toBe(0)
  })

  it('reports ingredients still missing a value', () => {
    const { unresolved } = resolveIngredients(ingredients, parseUsdaMacros(CSV))
    expect(unresolved.map((u) => u.id)).toEqual(['tmf:ing:okra', 'tmf:ing:paneer'])
  })

  it('uses label values when given', () => {
    const labels = { 'tmf:ing:paneer': { kcal: 280, proteinG: 18, carbG: 3, fatG: 22 } }
    const { foods, unresolved } = resolveIngredients(ingredients, parseUsdaMacros(CSV), labels)
    expect(foods.get('tmf:ing:paneer')).toMatchObject({ source: 'trackMeFit', sourceId: 'label' })
    expect(unresolved.map((u) => u.id)).toEqual(['tmf:ing:okra'])
  })

  it('uses values copied from a packet label into the ingredient', () => {
    const per100g = { kcal: 170, proteinG: 25, carbG: 4, fatG: 6 }
    const labelled: Ingredient[] = [{ id: 'tmf:ing:low-fat-paneer', name: 'Paneer, low fat', aliases: [], values: { kind: 'label', note: 'Brand label', per100g } }]
    const { foods, unresolved } = resolveIngredients(labelled, parseUsdaMacros(CSV))
    expect(foods.get('tmf:ing:low-fat-paneer')).toMatchObject({ per100g, source: 'trackMeFit', sourceId: 'label' })
    expect(unresolved).toEqual([])
  })
})
