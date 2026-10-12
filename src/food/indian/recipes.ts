// Track Me Fit standard Indian recipes, version 1. Typical home-style amounts,
// written by us. Cooked weights are first estimates (yieldVerified: false)
// until someone cooks the dish and weighs the pot; small amounts of spices,
// salt and herbs are left out because they add almost no calories.

import type { Portion } from '../types'
import type { Recipe, RecipeIngredient } from '../recipe'

const KATORI: Portion = { label: '1 katori (150 g)', grams: 150 }

const ing = (key: string, grams: number): RecipeIngredient => ({ foodId: `tmf:ing:${key}`, grams })

export interface IndianRecipe extends Recipe {
  aliases: string[]
}

const r = (
  key: string,
  name: string,
  aliases: string[],
  ingredients: RecipeIngredient[],
  cookedWeightG: number,
  portions: Portion[],
): IndianRecipe => ({
  id: `tmf:dish:${key}`,
  name,
  aliases,
  ingredients,
  cookedWeightG,
  portions,
  yieldVerified: false,
})

export const RECIPES: IndianRecipe[] = [
  // Dals and curries
  r('dal-tadka', 'Dal tadka (toor dal)', ['arhar dal', 'yellow dal', 'dal fry'],
    [ing('toor-dal', 100), ing('water', 500), ing('ghee', 10), ing('onion', 40), ing('tomato', 60)], 620, [KATORI]),
  r('moong-dal', 'Moong dal', ['yellow moong dal', 'dal'],
    [ing('moong-dal', 100), ing('water', 450), ing('ghee', 10), ing('onion', 30), ing('tomato', 40)], 560, [KATORI]),
  r('masoor-dal', 'Masoor dal', ['red lentil dal', 'lal dal'],
    [ing('masoor-dal', 100), ing('water', 450), ing('oil', 10), ing('onion', 40), ing('tomato', 50)], 580, [KATORI]),
  r('rajma', 'Rajma', ['rajma masala', 'kidney bean curry'],
    [ing('rajma', 100), ing('water', 500), ing('oil', 15), ing('onion', 80), ing('tomato', 120)], 700, [KATORI]),
  r('chole', 'Chole', ['chana masala', 'chickpea curry'],
    [ing('chana', 100), ing('water', 450), ing('oil', 15), ing('onion', 80), ing('tomato', 120)], 680, [KATORI]),
  r('sambar', 'Sambar', ['sambhar'],
    [ing('toor-dal', 50), ing('water', 600), ing('oil', 10), ing('onion', 50), ing('tomato', 60), ing('carrot', 50)], 750, [KATORI]),
  r('khichdi', 'Moong dal khichdi', ['khichri', 'dal khichdi'],
    [ing('rice', 60), ing('moong-dal', 40), ing('ghee', 10), ing('water', 400)], 450, [KATORI, { label: '1 plate (250 g)', grams: 250 }]),
  r('chicken-curry', 'Chicken curry (home style)', ['chicken masala', 'murgh curry'],
    [ing('chicken', 500), ing('onion', 150), ing('tomato', 150), ing('oil', 30), ing('curd', 50), ing('water', 200)], 850, [KATORI]),

  // Rice
  r('steamed-rice', 'Steamed rice', ['chawal', 'plain rice', 'white rice'],
    [ing('rice', 100), ing('water', 250)], 300, [KATORI, { label: '1 plate (250 g)', grams: 250 }]),
  r('jeera-rice', 'Jeera rice', ['cumin rice'],
    [ing('rice', 100), ing('water', 220), ing('ghee', 8)], 300, [KATORI, { label: '1 plate (250 g)', grams: 250 }]),

  // Breads
  r('roti', 'Roti / phulka (no ghee)', ['chapati', 'phulka', 'fulka'],
    [ing('atta', 30), ing('water', 18)], 40, [{ label: '1 roti', grams: 40 }]),
  r('ghee-roti', 'Roti with ghee', ['ghee chapati', 'tawa roti with ghee'],
    [ing('atta', 30), ing('water', 18), ing('ghee', 3)], 43, [{ label: '1 roti', grams: 43 }]),
  r('plain-paratha', 'Plain paratha', ['parantha', 'tawa paratha'],
    [ing('atta', 50), ing('water', 28), ing('ghee', 8)], 75, [{ label: '1 paratha', grams: 75 }]),
  r('aloo-paratha', 'Aloo paratha', ['potato paratha', 'aloo parantha'],
    [ing('atta', 50), ing('water', 28), ing('potato', 60), ing('oil', 8)], 130, [{ label: '1 paratha', grams: 130 }]),

  // Breakfast
  r('poha', 'Poha', ['kanda poha', 'aloo poha'],
    [ing('poha', 50), ing('oil', 7), ing('onion', 30), ing('potato', 30), ing('peanuts', 10), ing('water', 60)], 170, [{ label: '1 plate', grams: 170 }]),
  r('upma', 'Upma', ['rava upma', 'sooji upma'],
    [ing('sooji', 50), ing('oil', 8), ing('onion', 30), ing('water', 150)], 230, [{ label: '1 plate', grams: 230 }]),
  r('besan-chilla', 'Besan chilla', ['besan cheela', 'gram flour pancake'],
    [ing('besan', 40), ing('water', 50), ing('onion', 20), ing('tomato', 20), ing('oil', 5)], 120, [{ label: '1 chilla', grams: 60 }]),
  r('idli', 'Idli', ['idly'],
    [ing('rice', 60), ing('urad-dal', 20), ing('water', 90)], 170, [{ label: '1 idli', grams: 42 }]),
  r('plain-dosa', 'Plain dosa', ['sada dosa', 'dosai'],
    [ing('rice', 60), ing('urad-dal', 20), ing('water', 100), ing('oil', 8)], 170, [{ label: '1 dosa', grams: 85 }]),

  // Sabzi and protein dishes
  r('paneer-bhurji', 'Paneer bhurji', ['scrambled paneer'],
    [ing('paneer', 100), ing('oil', 8), ing('onion', 50), ing('tomato', 60)], 190, [KATORI]),
  r('palak-paneer', 'Palak paneer', ['saag paneer'],
    [ing('spinach', 250), ing('paneer', 100), ing('onion', 50), ing('tomato', 50), ing('oil', 10)], 380, [KATORI]),
  r('aloo-gobi', 'Aloo gobi', ['aloo gobhi', 'potato cauliflower sabzi'],
    [ing('potato', 150), ing('cauliflower', 200), ing('onion', 50), ing('tomato', 50), ing('oil', 15)], 380, [KATORI]),
  r('bhindi-masala', 'Bhindi masala', ['bhindi sabzi', 'okra fry'],
    [ing('okra', 250), ing('onion', 50), ing('oil', 15)], 230, [KATORI]),
  r('egg-bhurji', 'Egg bhurji', ['anda bhurji', 'masala scrambled eggs'],
    [ing('egg', 100), ing('onion', 30), ing('tomato', 30), ing('oil', 5)], 140, [{ label: '2-egg serving', grams: 140 }]),

  // Drinks
  r('chai', 'Chai with milk and sugar', ['tea', 'masala chai', 'doodh chai'],
    [ing('water', 100), ing('milk', 100), ing('sugar', 10)], 180, [{ label: '1 cup (120 ml)', grams: 120 }]),
]
