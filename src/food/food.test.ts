import { describe, expect, it } from 'vitest'
import { amountFor, energyMismatch, gramsForPortions, portionsForGrams, type Food } from './types'
import { fromFdc } from './usda'

const dal: Food = {
  id: 'ifct:toor-dal',
  name: 'Toor dal',
  state: 'raw',
  per100g: { kcal: 343, proteinG: 22, carbG: 57, fatG: 1.5 },
  portions: [{ label: '1 katori cooked', grams: 30 }],
  source: 'ifct',
}

describe('amountFor', () => {
  it('scales per-100 g values to the logged weight', () => {
    expect(amountFor(dal, 30)).toEqual({ grams: 30, kcal: 103, proteinG: 6.6, carbG: 17.1, fatG: 0.5 })
  })
})

describe('portions', () => {
  it('converts both ways', () => {
    expect(gramsForPortions(dal.portions[0], 1.5)).toBe(45)
    expect(portionsForGrams(dal.portions[0], 45)).toBe(1.5)
  })
})

describe('energyMismatch', () => {
  it('is small for consistent values and large for typos', () => {
    expect(energyMismatch(dal.per100g)).toBeLessThan(0.05)
    expect(energyMismatch({ kcal: 34, proteinG: 22, carbG: 57, fatG: 1.5 })).toBeGreaterThan(5)
  })
})

describe('fromFdc', () => {
  it('maps a search result (SR Legacy)', () => {
    const food = fromFdc({
      fdcId: 168880,
      description: 'Rice, white, long-grain, regular, raw, unenriched',
      dataType: 'SR Legacy',
      foodNutrients: [
        { nutrientId: 1003, nutrientNumber: '203', unitName: 'G', value: 7.13 },
        { nutrientId: 1004, nutrientNumber: '204', unitName: 'G', value: 0.66 },
        { nutrientId: 1005, nutrientNumber: '205', unitName: 'G', value: 79.95 },
        { nutrientId: 1008, nutrientNumber: '208', unitName: 'KCAL', value: 365 },
      ],
    })
    expect(food).toMatchObject({
      id: 'usda:168880',
      state: 'raw',
      source: 'usda',
      per100g: { kcal: 365, proteinG: 7.13, carbG: 79.95, fatG: 0.66 },
    })
  })

  it('maps a detail record with portions and Atwater energy only', () => {
    const food = fromFdc({
      fdcId: 2346393,
      description: 'Chicken, breast, boneless, skinless, cooked, roasted',
      dataType: 'Foundation',
      foodNutrients: [
        { nutrient: { id: 1003, number: '203', unitName: 'g' }, amount: 31 },
        { nutrient: { id: 1004, number: '204', unitName: 'g' }, amount: 3.6 },
        { nutrient: { id: 2047, number: '957', unitName: 'kcal' }, amount: 165.4 },
      ],
      foodPortions: [{ gramWeight: 140, amount: 1, measureUnit: { name: 'undetermined' }, modifier: 'breast' }],
    })
    expect(food?.state).toBe('cooked')
    expect(food?.per100g.kcal).toBe(165)
    expect(food?.per100g.carbG).toBe(0)
    expect(food?.portions).toEqual([{ label: '1 breast', grams: 140 }])
  })

  it('maps a branded product with barcode and serving', () => {
    const food = fromFdc({
      fdcId: 1,
      description: 'Peanut butter, crunchy',
      dataType: 'Branded',
      brandName: 'Example',
      gtinUpc: '0123456789012',
      servingSize: 32,
      servingSizeUnit: 'g',
      householdServingFullText: '2 tbsp',
      foodNutrients: [
        { nutrientId: 1008, unitName: 'KCAL', value: 594 },
        { nutrientId: 1003, unitName: 'G', value: 25 },
        { nutrientId: 1004, unitName: 'G', value: 50 },
        { nutrientId: 1005, unitName: 'G', value: 21.9 },
      ],
    })
    expect(food).toMatchObject({ brand: 'Example', state: 'asSold', barcode: '0123456789012', portions: [{ label: '2 tbsp', grams: 32 }] })
  })

  it('converts kJ when kcal is missing', () => {
    const food = fromFdc({ fdcId: 2, description: 'Test food', foodNutrients: [{ nutrientId: 1008, unitName: 'kJ', value: 418.4 }] })
    expect(food?.per100g.kcal).toBe(100)
  })

  it('skips records without calories', () => {
    expect(fromFdc({ fdcId: 3, description: 'No energy', foodNutrients: [{ nutrientId: 1003, unitName: 'G', value: 5 }] })).toBeNull()
  })
})
