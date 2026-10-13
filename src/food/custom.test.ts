import { describe, expect, it } from 'vitest'
import { customFromRow, customToRow, EMPTY_FOOD_FORM, foodFromForm, memoryCustomFoodStore, recipeFood, type FoodForm } from './custom'
import type { Food } from './types'

const form = (patch: Partial<FoodForm>): FoodForm => ({ ...EMPTY_FOOD_FORM, name: 'Protein bar', ...patch })

describe('a food from a label', () => {
  it('keeps per-100 g values as typed, with macros optional', () => {
    const r = foodFromForm(form({ kcal: '400', protein: '30' }))
    expect(r).toEqual({
      food: { name: 'Protein bar', state: 'asSold', per100g: { kcal: 400, proteinG: 30, carbG: 0, fatG: 0 }, portions: [] },
      warning: expect.any(String),
    })
  })

  it('turns per-serving values into per 100 g and keeps the serving as a portion', () => {
    const r = foodFromForm(form({ brand: ' RiteBite ', basis: 'serving', servingG: '50', servingName: '1 bar', kcal: '200', protein: '20', carbs: '15', fat: '7' }))
    expect(r).toEqual({
      food: {
        name: 'Protein bar',
        brand: 'RiteBite',
        state: 'asSold',
        per100g: { kcal: 400, proteinG: 40, carbG: 30, fatG: 14 },
        portions: [{ label: '1 bar', grams: 50 }],
      },
      warning: null,
    })
  })

  it('says what to fix', () => {
    expect(foodFromForm(form({ name: ' ', kcal: '' }))).toEqual({ errors: { name: 'Give the food a name.', kcal: 'Enter the calories.' } })
    expect(foodFromForm(form({ basis: 'serving', servingG: '0', kcal: '100' }))).toMatchObject({ errors: { servingG: expect.stringMatching(/Serving size/) } })
    expect(foodFromForm(form({ kcal: '100', fat: 'lots' }))).toMatchObject({ errors: { fat: expect.any(String) } })
  })

  it('catches impossible numbers, like a per-serving label typed as per 100 g', () => {
    expect(foodFromForm(form({ basis: 'serving', servingG: '10', kcal: '200' }))).toMatchObject({ errors: { kcal: expect.stringMatching(/more than any food/) } })
    expect(foodFromForm(form({ kcal: '400', protein: '60', carbs: '50' }))).toMatchObject({ errors: { form: expect.stringMatching(/more than the food weighs/) } })
  })

  it('warns when calories and macros disagree', () => {
    const r = foodFromForm(form({ kcal: '100', protein: '20', carbs: '20', fat: '10' }))
    expect('food' in r && r.warning).toMatch(/don’t match/)
  })
})

const food = (id: string, kcal: number, proteinG: number, carbG: number, fatG: number): Food => ({
  id, name: id, state: 'raw', per100g: { kcal, proteinG, carbG, fatG }, portions: [], source: 'usda',
})
const dal = food('Toor dal', 343, 22, 63, 1.5)
const ghee = food('Ghee', 900, 0, 0, 100)
const water = food('Water', 0, 0, 0, 0)

describe('a home recipe', () => {
  it('works out per 100 g of the cooked dish and a serving size', () => {
    const r = recipeFood('Mom’s dal', [{ food: dal, grams: 200 }, { food: ghee, grams: 10 }, { food: water, grams: 600 }], 750, 5)
    // 686 + 90 = 776 kcal in 750 g
    expect(r).toEqual({
      food: {
        name: 'Mom’s dal',
        state: 'cooked',
        per100g: { kcal: 103, proteinG: 5.9, carbG: 16.8, fatG: 1.7 },
        portions: [{ label: '1 serving', grams: 150 }],
        recipe: {
          ingredients: [
            { foodId: 'Toor dal', name: 'Toor dal', grams: 200 },
            { foodId: 'Ghee', name: 'Ghee', grams: 10 },
            { foodId: 'Water', name: 'Water', grams: 600 },
          ],
          cookedWeightG: 750,
          servings: 5,
        },
      },
    })
  })

  it('uses the raw total when the cooked weight is unknown', () => {
    const r = recipeFood('Dal', [{ food: dal, grams: 100 }, { food: water, grams: 100 }], null, null)
    expect('food' in r && r.food.per100g.kcal).toBe(172)
    expect('food' in r && r.food.portions).toEqual([])
  })

  it('says what is missing or wrong', () => {
    expect(recipeFood('', [{ food: dal, grams: 100 }], null, null)).toEqual({ error: 'Give the recipe a name.' })
    expect(recipeFood('Dal', [], null, null)).toEqual({ error: 'Add at least one ingredient.' })
    expect(recipeFood('Dal', [{ food: dal, grams: 0 }], null, null)).toMatchObject({ error: expect.stringMatching(/weight between/) })
    expect(recipeFood('Dal', [{ food: dal, grams: 100 }], null, 2.5)).toMatchObject({ error: expect.stringMatching(/whole number/) })
    expect(recipeFood('Ghee rice', [{ food: ghee, grams: 100 }], 50, null)).toMatchObject({ error: expect.stringMatching(/cooked weight looks too low/) })
  })
})

describe('storing your own foods', () => {
  it('lists newest first with source user, and removes', async () => {
    const store = memoryCustomFoodStore()
    const a = await store.add({ name: 'Poha mix', state: 'asSold', per100g: { kcal: 350, proteinG: 7, carbG: 75, fatG: 2 }, portions: [] })
    const b = await store.add({ name: 'Chikki', state: 'asSold', per100g: { kcal: 480, proteinG: 12, carbG: 60, fatG: 22 }, portions: [] })
    expect(a).toMatchObject({ id: 'custom:1', source: 'user', sourceId: '1' })
    expect((await store.list()).map((f) => f.name)).toEqual(['Chikki', 'Poha mix'])
    await store.remove(b.id)
    expect((await store.list()).map((f) => f.name)).toEqual(['Poha mix'])
  })

  it('maps database rows both ways, numbers arriving as strings', () => {
    const row = { id: 'abc', name: 'Chikki', brand: null, state: 'asSold' as const, kcal: '480', protein_g: '12', carb_g: '60', fat_g: '22', portions: [{ label: '1 piece', grams: 25 }], recipe: null }
    const f = customFromRow(row)
    expect(f).toEqual({
      id: 'custom:abc', name: 'Chikki', state: 'asSold', per100g: { kcal: 480, proteinG: 12, carbG: 60, fatG: 22 },
      portions: [{ label: '1 piece', grams: 25 }], source: 'user', sourceId: 'abc',
    })
    expect(customToRow(f)).toEqual({ name: 'Chikki', brand: null, state: 'asSold', kcal: 480, protein_g: 12, carb_g: 60, fat_g: 22, portions: [{ label: '1 piece', grams: 25 }], recipe: null })
  })
})
