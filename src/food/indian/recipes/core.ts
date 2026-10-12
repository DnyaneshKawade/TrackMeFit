// Core everyday dishes (version 1). Typical home-style amounts, written by us.

import { CUP, KATORI, PLATE, ing, piece, r, type IndianRecipe } from '../define'

export const RECIPES_CORE: IndianRecipe[] = [
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
    [ing('rice', 60), ing('moong-dal', 40), ing('ghee', 10), ing('water', 400)], 450, [KATORI, PLATE]),
  r('chicken-curry', 'Chicken curry (home style)', ['chicken masala', 'murgh curry'],
    [ing('chicken', 500), ing('onion', 150), ing('tomato', 150), ing('oil', 30), ing('curd', 50), ing('water', 200)], 850, [KATORI]),

  // Rice
  r('steamed-rice', 'Steamed rice', ['chawal', 'plain rice', 'white rice'],
    [ing('rice', 100), ing('water', 250)], 300, [KATORI, PLATE]),
  r('jeera-rice', 'Jeera rice', ['cumin rice'],
    [ing('rice', 100), ing('water', 220), ing('ghee', 8)], 300, [KATORI, PLATE]),

  // Breads
  r('roti', 'Roti / phulka (no ghee)', ['chapati', 'phulka', 'fulka'],
    [ing('atta', 30), ing('water', 18)], 40, [piece('1 roti', 40)]),
  r('ghee-roti', 'Roti with ghee', ['ghee chapati', 'tawa roti with ghee'],
    [ing('atta', 30), ing('water', 18), ing('ghee', 3)], 43, [piece('1 roti', 43)]),
  r('plain-paratha', 'Plain paratha', ['parantha', 'tawa paratha'],
    [ing('atta', 50), ing('water', 28), ing('ghee', 8)], 75, [piece('1 paratha', 75)]),
  r('aloo-paratha', 'Aloo paratha', ['potato paratha', 'aloo parantha'],
    [ing('atta', 50), ing('water', 28), ing('potato', 60), ing('oil', 8)], 130, [piece('1 paratha', 130)]),

  // Breakfast
  r('poha', 'Poha', ['kanda poha', 'aloo poha'],
    [ing('poha', 50), ing('oil', 7), ing('onion', 30), ing('potato', 30), ing('peanuts', 10), ing('water', 60)], 170, [piece('1 plate', 170)]),
  r('upma', 'Upma', ['rava upma', 'sooji upma'],
    [ing('sooji', 50), ing('oil', 8), ing('onion', 30), ing('water', 150)], 230, [piece('1 plate', 230)]),
  r('besan-chilla', 'Besan chilla', ['besan cheela', 'gram flour pancake'],
    [ing('besan', 40), ing('water', 50), ing('onion', 20), ing('tomato', 20), ing('oil', 5)], 120, [piece('1 chilla', 60)]),
  r('idli', 'Idli', ['idly'],
    [ing('rice', 60), ing('urad-dal', 20), ing('water', 90)], 170, [piece('1 idli', 42)]),
  r('plain-dosa', 'Plain dosa', ['sada dosa', 'dosai'],
    [ing('rice', 60), ing('urad-dal', 20), ing('water', 100), ing('oil', 8)], 170, [piece('1 dosa', 85)]),

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
    [ing('egg', 100), ing('onion', 30), ing('tomato', 30), ing('oil', 5)], 140, [piece('2-egg serving', 140)]),

  // Drinks
  r('chai', 'Chai with milk and sugar', ['tea', 'masala chai', 'doodh chai'],
    [ing('water', 100), ing('milk', 100), ing('sugar', 10)], 180, [CUP]),
]
