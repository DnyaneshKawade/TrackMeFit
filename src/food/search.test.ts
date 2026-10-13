import { describe, expect, it } from 'vitest'
import usdaCsv from '../../data/usda/sr_legacy_macros.csv?raw'
import offCsv from '../../data/off/india_products.csv?raw'
import { buildCatalogue } from './catalogue'
import { createSearchIndex, findFood, normalize, searchFoods, withFoods } from './search'
import type { Food } from './types'

const food = (id: string, name: string, extra: Partial<Food> = {}): Food => ({
  id,
  name,
  state: 'cooked',
  per100g: { kcal: 100, proteinG: 1, carbG: 1, fatG: 1 },
  portions: [],
  source: 'trackMeFit',
  ...extra,
})

describe('food search', () => {
  const index = createSearchIndex([
    food('a', 'Dal tadka', { aliases: ['tadka dal', 'yellow dal'] }),
    food('b', 'Dal makhani', { aliases: ['maa ki dal'] }),
    food('c', 'Toor dal, raw', { state: 'raw', source: 'usda', aliases: ['arhar', 'tuvar'] }),
    food('d', 'Paneer tikka'),
    food('e', 'Dal tadka mix', { source: 'openFoodFacts', brand: 'MTR', state: 'asSold' }),
    food('f', 'Crème brûlée'),
    food('g', 'Dalgona coffee'),
    food('h', 'Moong dal'),
  ])
  const names = (q: string) => searchFoods(index, q).map((f) => f.id)

  it('ignores case, accents and punctuation', () => {
    expect(normalize('  Crème-Brûlée! ')).toBe('creme brulee')
    expect(names('creme brulee')).toEqual(['f'])
  })
  it('puts exact and prefix name matches first, home dishes before products', () => {
    expect(names('dal tadka')).toEqual(['a', 'e'])
    expect(names('dal')[0]).toBe('a')
  })
  it('ranks whole-word matches above partial ones', () => {
    expect(names('dal')).toEqual(['a', 'b', 'e', 'h', 'c', 'g'])
  })
  it('finds foods by alias and by brand', () => {
    expect(names('arhar')).toEqual(['c'])
    expect(names('maa ki')).toEqual(['b'])
    expect(names('mtr')).toEqual(['e'])
  })
  it('matches word starts in any order', () => {
    expect(names('tikka pan')).toEqual(['d'])
    expect(names('xyz')).toEqual([])
    expect(names('   ')).toEqual([])
  })
})

describe('the bundled catalogue', () => {
  const catalogue = buildCatalogue(usdaCsv, offCsv)
  const index = createSearchIndex(catalogue)

  it('holds dishes, raw foods and packaged products with unique ids', () => {
    const by = (s: string) => catalogue.filter((f) => f.source === s).length
    expect(by('trackMeFit')).toBeGreaterThan(2000)
    expect(by('usda')).toBeGreaterThan(1400)
    expect(by('openFoodFacts')).toBeGreaterThan(3000)
    expect(new Set(catalogue.map((f) => f.id)).size).toBe(catalogue.length)
  })
  it('finds everyday Indian foods by their common names', () => {
    for (const q of ['roti', 'dal', 'atta', 'chawal', 'poha', 'chai']) {
      expect(searchFoods(index, q).length, q).toBeGreaterThan(0)
    }
    expect(searchFoods(index, 'atta')[0].state).toBe('raw')
  })
})

describe('your own foods in search', () => {
  it('come first, replace a food with the same id, and can be found by id', () => {
    const base = createSearchIndex([food('tmf:dish:poha', 'Poha', { source: 'trackMeFit' }), food('usda:1', 'Rice', { source: 'usda' })])
    const mine = food('custom:1', 'Poha', { source: 'user', brand: 'Mom' })
    const index = withFoods(base, [mine])
    expect(searchFoods(index, 'poha').map((f) => f.id)).toEqual(['custom:1', 'tmf:dish:poha'])
    expect(findFood(index, 'usda:1')?.name).toBe('Rice')
    expect(withFoods(index, [{ ...mine, name: 'Poha v2' }]).entries.filter((e) => e.food.id === 'custom:1')).toHaveLength(1)
    expect(withFoods(base, [])).toBe(base)
  })
})
