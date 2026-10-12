// Street food, chaat, Indian-style fast food, Indo-Chinese, namkeen, salads,
// drinks and gym-style meals (all vegetarian, egg-free). Typical street and
// home amounts, written by us; see docs/indian-food-database.md.
// Deep-fried items list only the oil the food absorbs, not the oil in the kadhai.

import type { RecipeIngredient } from '../../recipe'
import { CUP, GLASS, KATORI, PLATE, ing, piece, r, usdaIng, type IndianRecipe } from '../define'

// USDA SR Legacy fdc_ids used below (descriptions checked in data/usda/sr_legacy_macros.csv).
const U = {
  maida: 169761, // Wheat flour, white, all-purpose, unenriched
  bread: 174924, // Bread, white, commercially prepared
  brownBread: 172688, // Bread, whole-wheat, commercially prepared
  multigrainBread: 168013, // Bread, multi-grain
  pav: 172793, // Rolls, dinner, plain, commercially prepared
  bun: 172796, // Rolls, hamburger or hotdog, plain
  rusk: 174981, // Crackers, rusk toast
  puffPastry: 172738, // Puff pastry, frozen, ready-to-bake, baked
  butter: 173410, // Butter, salted
  cheeseSlice: 171290, // Cheese, pasteurized process, American
  cheddar: 173414, // Cheese, cheddar
  mozzarella: 170846, // Cheese, mozzarella, whole milk, low moisture
  creamCheese: 173418, // Cheese, cream
  mayo: 171009, // Salad dressing, mayonnaise, regular
  ketchup: 168556, // Catsup
  chilliSauce: 174527, // Sauce, ready-to-serve, pepper or hot
  soySauce: 174277, // Soy sauce made from soy and wheat (shoyu)
  sweetSour: 174066, // Sauce, sweet and sour, ready-to-serve
  pastaSauce: 171192, // Sauce, pasta, spaghetti/marinara, ready-to-serve
  vinegar: 172237, // Vinegar, distilled
  cornflour: 169698, // Cornstarch
  riceFlour: 169714, // Rice flour, white, unenriched
  breadCrumbs: 174928, // Bread, crumbs, dry, grated, plain
  pasta: 169736, // Pasta, dry, enriched (also used for hakka noodles)
  instantNoodles: 171177, // Soup, ramen noodle, any flavor, dry
  oats: 173904, // Cereals, oats, regular and quick, not fortified, dry
  cornflakes: 174648, // Cereals ready-to-eat, RALSTON Corn Flakes
  murmura: 173912, // Cereals ready-to-eat, rice, puffed, fortified
  quinoa: 168874, // Quinoa, uncooked
  driedPeas: 172428, // Peas, green, split, mature seeds, raw (ragda / safed matar)
  mothBeans: 172425, // Mothbeans, mature seeds, raw
  tofu: 172475, // Tofu, raw, firm, prepared with calcium sulfate
  // vegetables
  peas: 170419, // Peas, green, raw
  cabbage: 169975, // Cabbage, raw
  capsicum: 170427, // Peppers, sweet, green, raw
  redCapsicum: 170108, // Peppers, sweet, red, raw
  greenChilli: 170497, // Peppers, hot chili, green, raw
  beans: 169961, // Beans, snap, green, raw
  cucumber: 168409, // Cucumber, with peel, raw
  beetroot: 169145, // Beets, raw
  sweetCorn: 169998, // Corn, sweet, yellow, raw
  mushroom: 169251, // Mushrooms, white, raw
  lettuce: 169248, // Lettuce, iceberg, raw
  springOnion: 170005, // Onions, spring or scallions, raw
  garlic: 169230, // Garlic, raw
  ginger: 169231, // Ginger root, raw
  broccoli: 170379, // Broccoli, raw
  sweetPotato: 168482, // Sweet potato, raw, unprepared
  lauki: 169232, // Gourd, white-flowered (calabash), raw
  karela: 168393, // Balsam-pear (bitter gourd), pods, raw
  // fruit
  lemonJuice: 167747, // Lemon juice, raw
  mango: 169910, // Mangos, raw
  banana: 173944, // Bananas, raw
  apple: 171688, // Apples, raw, with skin
  orange: 169097, // Oranges, raw, all commercial varieties
  orangeJuice: 169098, // Orange juice, raw
  watermelon: 167765, // Watermelon, raw
  pineapple: 169124, // Pineapple, raw, all varieties
  pomegranate: 169134, // Pomegranates, raw
  pomegranateJuice: 167787, // Pomegranate juice, bottled
  papaya: 169926, // Papayas, raw
  grapes: 174683, // Grapes, red or green, raw
  chikoo: 167759, // Sapodilla, raw
  muskmelon: 169092, // Melons, cantaloupe, raw
  guava: 173044, // Guavas, common, raw
  strawberry: 167762, // Strawberries, raw
  kiwi: 168153, // Kiwifruit, green, raw
  pear: 169118, // Pears, raw
  dates: 171726, // Dates, deglet noor
  raisins: 168165, // Raisins, dark, seedless
  tamarind: 167763, // Tamarinds, raw
  carrotJuice: 170491, // Carrot juice, canned
  appleJuice: 167771, // Apple juice, canned or bottled, unsweetened
  coconutWater: 170174, // Nuts, coconut water
  coconut: 170169, // Nuts, coconut meat, raw
  desiccatedCoconut: 170170, // Nuts, coconut meat, dried (desiccated), not sweetened
  // nuts and seeds
  almonds: 170567, // Nuts, almonds
  cashews: 170162, // Nuts, cashew nuts, raw
  pistachios: 170184, // Nuts, pistachio nuts, raw
  walnuts: 170187, // Nuts, walnuts, english
  roastedPeanuts: 173806, // Peanuts, all types, dry-roasted, without salt
  peanutButter: 172470, // Peanut butter, smooth style, without salt
  flax: 169414, // Seeds, flaxseed
  chia: 170554, // Seeds, chia seeds, dried
  // dairy and sweeteners
  tonedMilk: 171267, // Milk, reduced fat, fluid, 2% milkfat
  skimMilk: 171269, // Milk, nonfat, fluid (skim)
  lowFatCurd: 170886, // Yogurt, plain, low fat
  greekYogurt: 170894, // Yogurt, Greek, plain, nonfat
  cream: 170859, // Cream, fluid, heavy whipping
  iceCream: 167575, // Ice creams, vanilla
  honey: 169640, // Honey
  jam: 169641, // Jams and preserves
  chocSyrup: 168835, // Syrups, chocolate, fudge-type
  cocoa: 169593, // Cocoa, dry powder, unsweetened
  // drinks
  coffee: 171890, // Beverages, coffee, brewed, prepared with tap water
  instantCoffee: 171893, // Beverages, coffee, instant, regular, powder
  blackTea: 173227, // Beverages, tea, black, brewed
  greenTea: 171917, // Beverages, tea, green, brewed, regular
  soda: 174842, // Beverages, carbonated, club soda
  // ready snacks
  potatoChips: 169677, // Snacks, potato chips, plain, salted
  bananaChips: 168849, // Snacks, banana chips
  popcornOil: 170247, // Snacks, popcorn, oil-popped, white popcorn, salt added
  popcornAir: 167959, // Snacks, popcorn, air-popped
} as const

type Ing = RecipeIngredient
const u = (k: keyof typeof U, grams: number) => usdaIng(U[k], grams)
const round1 = (n: number) => Math.round(n * 10) / 10
/** Scales a batch component to the amount used in one dish. */
const scale = (list: Ing[], f: number): Ing[] => list.map((i) => ({ ...i, grams: round1(i.grams * f) }))

// ---- Components (weights are raw; the cooked weight is noted) ----

/** Fried besan sev, g = finished weight. */
const sev = (g: number): Ing[] => [ing('besan', round1(g * 0.7)), ing('oil', round1(g * 0.3))]
/** Khara boondi, g = finished weight. */
const boondi = (g: number): Ing[] => [ing('besan', round1(g * 0.72)), ing('oil', round1(g * 0.28))]
/** Fried papdi, g = finished weight. */
const papdi = (g: number): Ing[] => [u('maida', round1(g * 0.74)), ing('oil', round1(g * 0.26))]
/** Fried pani puri / golgappa shells, g = finished weight. */
const puriShell = (g: number): Ing[] => [ing('sooji', round1(g * 0.45)), u('maida', round1(g * 0.35)), ing('oil', round1(g * 0.2))]
/** Sweet tamarind-date chutney, g = finished weight. */
const imli = (g: number): Ing[] => [u('tamarind', round1(g * 0.15)), u('dates', round1(g * 0.12)), ing('sugar', round1(g * 0.2)), ing('water', round1(g * 0.53))]
/** Boiled kabuli or kala chana, g = boiled weight. */
const boiledChana = (g: number): Ing[] => [ing('chana', round1(g * 0.42)), ing('water', round1(g * 0.58))]
/** Indian moong sprouts (short-tailed, home sprouted), g = sprouted weight; whole moong roughly doubles in weight.
 * USDA's 'mung bean sprouts' are long Chinese bean sprouts and far lighter, so they are not used. */
const sprouts = (g: number): Ing[] => [ing('moong-dal', round1(g * 0.38)), ing('water', round1(g * 0.62))]
/** Boiled dried white peas (safed vatana), g = boiled weight. */
const boiledPeas = (g: number): Ing[] => [u('driedPeas', round1(g * 0.42)), ing('water', round1(g * 0.58))]
/** Pav bhaji bhaji, street style with butter: raw 1200 g -> 1000 g cooked. */
const BHAJI_STREET: Ing[] = [
  ing('potato', 300), ing('cauliflower', 100), u('peas', 80), u('capsicum', 80), ing('tomato', 250),
  ing('onion', 120), u('butter', 60), ing('oil', 10), ing('water', 200),
]
/** Home-style bhaji with less butter: raw 1175 g -> 1000 g cooked. */
const BHAJI_HOME: Ing[] = [
  ing('potato', 300), ing('cauliflower', 100), u('peas', 80), u('capsicum', 80), ing('tomato', 250),
  ing('onion', 120), u('butter', 20), ing('oil', 15), ing('water', 210),
]
/** Street chole: raw 1165 g -> 1000 g cooked. */
const CHOLE_STREET: Ing[] = [ing('chana', 200), ing('water', 700), ing('oil', 45), ing('onion', 100), ing('tomato', 120)]
/** Ragda (white peas curry): raw 1040 g -> 950 g cooked. */
const RAGDA: Ing[] = [u('driedPeas', 200), ing('water', 700), ing('oil', 20), ing('onion', 60), ing('tomato', 60)]
/** Aloo sabzi for kachori/puri: raw 880 g -> 800 g cooked. */
const ALOO_SABZI: Ing[] = [ing('potato', 500), ing('tomato', 150), ing('oil', 30), ing('water', 200)]
/** One batata vada: raw 102 g -> about 85 g fried. */
const BATATA_VADA: Ing[] = [ing('potato', 65), ing('besan', 15), ing('water', 12), ing('oil', 10)]
/** One aloo tikki, shallow fried: raw 76 g -> about 65 g. */
const TIKKI: Ing[] = [ing('potato', 60), u('peas', 5), u('cornflour', 5), ing('oil', 6)]
/** Manchurian balls (cabbage, carrot, maida, cornflour, deep fried): raw 405 g -> 330 g. */
const MANCHURIAN_BALLS: Ing[] = [u('cabbage', 200), ing('carrot', 60), u('capsicum', 30), u('maida', 40), u('cornflour', 25), ing('oil', 50)]
/** Veg hakka noodles: raw 625 g -> 560 g. */
const HAKKA: Ing[] = [
  u('pasta', 150), ing('water', 220), u('cabbage', 80), ing('carrot', 40), u('capsicum', 40), ing('onion', 40),
  ing('oil', 25), u('soySauce', 10), u('vinegar', 10), u('chilliSauce', 10),
]
/** Veg fried rice: raw 670 g -> 600 g. */
const FRIED_RICE: Ing[] = [
  ing('rice', 150), ing('water', 300), u('cabbage', 50), ing('carrot', 40), u('beans', 30), u('capsicum', 30),
  u('springOnion', 20), ing('oil', 25), u('soySauce', 10), u('vinegar', 5),
]

export const RECIPES_SNACKS: IndianRecipe[] = [
  // ================= Samosa, kachori, pakora =================
  r('samosa', 'Samosa (aloo)', ['aloo samosa', 'punjabi samosa', 'samosa', 'singara', 'samosa street'],
    [u('maida', 60), ing('water', 20), ing('oil', 34), ing('potato', 120), u('peas', 15)], 220, [piece('1 samosa', 110)]),
  r('cocktail-samosa', 'Cocktail samosa / patti samosa', ['mini samosa', 'onion samosa', 'patti samosa', 'irani samosa'],
    [u('maida', 50), ing('water', 18), ing('onion', 60), ing('poha', 10), ing('oil', 30)], 140, [piece('1 small samosa', 20), piece('5 samosas', 100)]),
  r('samosa-pav', 'Samosa pav', ['samosa pao', 'samosa bun'],
    [u('maida', 30), ing('water', 10), ing('oil', 17), ing('potato', 60), u('peas', 8), u('pav', 40)], 150, [piece('1 samosa pav', 150)]),
  r('samosa-chaat', 'Samosa chaat', ['samosa chole chaat', 'samosa chat'],
    [u('maida', 30), ing('water', 10), ing('oil', 17), ing('potato', 60), u('peas', 8), ...scale(CHOLE_STREET, 0.12), ing('curd', 40), ...imli(20), ...sev(8)],
    300, [piece('1 plate', 300)]),
  r('khasta-kachori', 'Khasta kachori (moong dal)', ['kachori', 'dal kachori', 'moong dal kachori', 'khasta kachodi'],
    [u('maida', 40), ing('water', 14), ing('moong-dal', 15), ing('oil', 14)], 72, [piece('1 kachori', 60)]),
  r('matar-kachori', 'Matar kachori', ['peas kachori', 'hare matar ki kachori'],
    [u('maida', 40), ing('water', 14), u('peas', 30), ing('oil', 16)], 85, [piece('1 kachori', 55)]),
  r('pyaaz-kachori', 'Pyaaz kachori', ['onion kachori', 'pyaz ki kachori', 'jodhpuri kachori'],
    [u('maida', 45), ing('water', 15), ing('onion', 40), ing('besan', 8), ing('oil', 22)], 110, [piece('1 kachori', 90)]),
  r('kachori-sabzi', 'Kachori with aloo sabzi', ['kachori aloo', 'kachori sabji'],
    [u('maida', 80), ing('water', 28), ing('moong-dal', 30), ing('oil', 28), ...scale(ALOO_SABZI, 0.19)], 285, [piece('1 plate (2 kachori)', 285)]),
  r('raj-kachori', 'Raj kachori', ['raj kachori chaat', 'raaj kachori'],
    [u('maida', 35), ing('sooji', 10), ing('oil', 15), ...boiledChana(30), ing('potato', 30), ...boondi(10), ing('curd', 60), ...imli(20), ...sev(8), u('pomegranate', 10)],
    220, [piece('1 raj kachori', 220)]),
  r('onion-pakora', 'Onion pakora', ['pyaz pakoda', 'kanda bhaji', 'onion bhaji', 'kanda bhajji', 'pyaaz ke pakode'],
    [ing('onion', 120), ing('besan', 50), ing('water', 30), ing('oil', 30)], 180, [piece('1 pakora', 20), piece('1 plate (6 pakoras)', 120)]),
  r('aloo-pakora', 'Aloo pakora', ['potato pakoda', 'aloo bhajji', 'batata bhaji', 'aloo ke pakode'],
    [ing('potato', 120), ing('besan', 50), ing('water', 45), ing('oil', 28)], 200, [piece('1 pakora', 25), piece('1 plate (6 pakoras)', 150)]),
  r('palak-pakora', 'Palak pakora', ['spinach pakoda', 'palak bhajiya', 'palak ke pakode'],
    [ing('spinach', 60), ing('besan', 60), ing('water', 45), ing('oil', 30)], 150, [piece('1 pakora', 15), piece('1 plate (8 pakoras)', 120)]),
  r('gobi-pakora', 'Gobi pakora', ['cauliflower pakoda', 'gobhi pakode', 'cauliflower fritters'],
    [ing('cauliflower', 150), ing('besan', 50), ing('water', 45), ing('oil', 28)], 220, [piece('1 pakora', 25), piece('1 plate (6 pakoras)', 150)]),
  r('paneer-pakora', 'Paneer pakora', ['paneer pakoda', 'paneer bhajiya', 'paneer fritters'],
    [ing('paneer', 100), ing('besan', 40), ing('water', 40), ing('oil', 22)], 180, [piece('1 pakora', 30), piece('1 plate (5 pakoras)', 150)]),
  r('mirchi-vada', 'Mirchi vada (potato stuffed, Jodhpuri)', ['mirchi vada', 'jodhpuri mirchi vada', 'mirchi pakoda', 'stuffed mirchi bhajji'],
    [u('greenChilli', 100), ing('potato', 60), ing('besan', 60), ing('water', 50), ing('oil', 35)], 260, [piece('1 mirchi vada', 65)]),
  r('bread-pakora', 'Bread pakora (aloo stuffed)', ['bread pakoda', 'bread bhaji', 'aloo bread pakora'],
    [u('bread', 50), ing('potato', 50), ing('besan', 25), ing('water', 25), ing('oil', 18)], 145, [piece('1 bread pakora', 145)]),
  r('mix-veg-pakora', 'Mixed vegetable pakora', ['mix pakoda', 'bhajiya', 'pakode', 'pakora', 'veg fritters'],
    [ing('onion', 50), ing('potato', 50), ing('spinach', 20), ing('cauliflower', 40), ing('besan', 60), ing('water', 50), ing('oil', 32)], 250,
    [piece('1 pakora', 20), piece('1 plate (6 pakoras)', 120)]),
  r('moong-dal-pakoda', 'Moong dal pakoda', ['moong dal bhajiya', 'dal pakoda', 'mangode', 'moong vada'],
    [ing('moong-dal', 100), ing('water', 90), ing('onion', 20), ing('oil', 40)], 220, [piece('1 pakoda', 15), piece('1 plate (8 pakodas)', 120)]),
  r('batata-vada', 'Batata vada', ['aloo vada', 'potato vada', 'batata wada'],
    BATATA_VADA, 85, [piece('1 vada', 85)]),
  r('veg-cutlet', 'Veg cutlet', ['vegetable cutlet', 'aloo cutlet', 'mix veg cutlet'],
    [ing('potato', 120), u('peas', 25), ing('carrot', 30), u('beans', 20), u('breadCrumbs', 25), u('maida', 10), ing('water', 20), ing('oil', 25)], 240,
    [piece('1 cutlet', 60), piece('1 plate (2 cutlets)', 120)]),
  r('bread-roll', 'Bread roll (aloo stuffed, fried)', ['aloo bread roll', 'potato bread roll'],
    [u('bread', 60), ing('potato', 80), u('peas', 10), ing('oil', 20)], 150, [piece('1 bread roll', 75)]),

  // ================= Vada pav, pav bhaji, dabeli =================
  r('vada-pav', 'Vada pav', ['wada pav', 'vadapav', 'bombay burger', 'vada pao'],
    [u('pav', 40), ...BATATA_VADA, u('roastedPeanuts', 2), u('desiccatedCoconut', 2)], 128, [piece('1 vada pav', 128)]),
  r('butter-vada-pav', 'Butter vada pav (tawa)', ['butter wada pav', 'cheese vada pav'],
    [u('pav', 40), ...BATATA_VADA, u('butter', 8), u('roastedPeanuts', 2), u('desiccatedCoconut', 2)], 136, [piece('1 vada pav', 136)]),
  r('pav', 'Pav (plain)', ['pao', 'ladi pav', 'dinner roll', 'bun pav'],
    [u('pav', 40)], 40, [piece('1 pav', 40)]),
  r('butter-pav', 'Butter pav (tawa toasted)', ['butter pao', 'buttered pav', 'maska pav'],
    [u('pav', 40), u('butter', 7)], 46, [piece('1 pav', 46)]),
  r('masala-pav', 'Masala pav', ['masala pao', 'bhaji pav masala'],
    [u('pav', 80), u('butter', 15), ing('onion', 30), ing('tomato', 40), u('capsicum', 15)], 170, [piece('1 plate (2 pav)', 170)]),
  r('pav-bhaji', 'Pav bhaji (street, with butter)', ['pav bhaji', 'pao bhaji', 'butter pav bhaji', 'bombay pav bhaji'],
    [...scale(BHAJI_STREET, 0.22), u('pav', 80), u('butter', 10)], 304, [piece('1 plate (bhaji + 2 pav)', 304)]),
  r('pav-bhaji-home', 'Pav bhaji (home style, less butter)', ['home pav bhaji', 'ghar ka pav bhaji'],
    [...scale(BHAJI_HOME, 0.22), u('pav', 80), u('butter', 4)], 300, [piece('1 plate (bhaji + 2 pav)', 300)]),
  r('cheese-pav-bhaji', 'Cheese pav bhaji', ['cheese pao bhaji'],
    [...scale(BHAJI_STREET, 0.22), u('pav', 80), u('butter', 10), u('cheeseSlice', 25)], 328, [piece('1 plate', 328)]),
  r('bhaji', 'Bhaji (pav bhaji sabzi only)', ['pav bhaji bhaji', 'bhaji only'],
    BHAJI_STREET, 1000, [KATORI]),
  r('dabeli', 'Dabeli', ['kutchi dabeli', 'kachchhi dabeli', 'double roti'],
    [u('pav', 40), ing('potato', 60), ing('oil', 4), u('butter', 5), ...imli(12), u('roastedPeanuts', 8), u('pomegranate', 8), ...sev(5)], 135,
    [piece('1 dabeli', 135)]),

  // ================= Chaat =================
  r('pani-puri', 'Pani puri (6 puris)', ['golgappa', 'gol gappe', 'puchka', 'phuchka', 'gupchup', 'pani poori'],
    [...puriShell(27), ing('potato', 30), ...boiledChana(20), ...imli(15), ing('water', 120), ing('sugar', 3)], 210, [piece('1 plate (6 puris)', 210)]),
  r('sukha-puri', 'Sukha puri / dry pani puri', ['sukha puri', 'dry golgappa', 'masala puri dry'],
    [...puriShell(30), ing('potato', 40), ...sev(5), ...imli(10)], 82, [piece('1 plate (6 puris)', 82)]),
  r('bhel-puri', 'Bhel puri', ['bhel', 'bhelpuri', 'mumbai bhel', 'chowpatty bhel'],
    [u('murmura', 30), ...sev(12), ...papdi(10), ing('potato', 30), ing('onion', 25), ing('tomato', 20), ...imli(25), ing('peanuts', 8)], 157,
    [piece('1 plate', 157)]),
  r('sukha-bhel', 'Sukha bhel (dry)', ['dry bhel', 'sukhi bhel'],
    [u('murmura', 35), ...sev(15), ...papdi(10), ing('onion', 20), ing('peanuts', 10)], 88, [piece('1 plate', 88)]),
  r('sev-puri', 'Sev puri', ['sev batata puri', 'sev poori', 'sbp'],
    [...papdi(36), ing('potato', 50), ing('onion', 20), ...imli(25), ...sev(15)], 145, [piece('1 plate (6 puris)', 145)]),
  r('dahi-puri', 'Dahi puri', ['dahi batata puri', 'dbp', 'dahi poori'],
    [...puriShell(30), ing('potato', 40), ing('curd', 80), ing('sugar', 5), ...imli(20), ...sev(10)], 185, [piece('1 plate (6 puris)', 185)]),
  r('papdi-chaat', 'Papdi chaat', ['papri chaat', 'papdi chat', 'delhi papdi chaat'],
    [...papdi(40), ing('potato', 40), ...boiledChana(30), ing('curd', 80), ing('sugar', 5), ...imli(25), ...sev(5)], 225, [piece('1 plate', 225)]),
  r('dahi-bhalla-chaat', 'Dahi bhalla chaat', ['dahi bhalle', 'dahi vada chaat', 'dahi bhalla'],
    [ing('urad-dal', 30), ing('water', 40), ing('oil', 12), ing('curd', 120), ing('sugar', 8), ...imli(20)], 220, [piece('1 plate (2 bhalle)', 220)]),
  r('aloo-tikki', 'Aloo tikki (2 pieces)', ['aloo tikki', 'potato patties', 'tikki'],
    [...TIKKI, ...TIKKI], 130, [piece('1 tikki', 65), piece('2 tikki', 130)]),
  r('aloo-tikki-chaat', 'Aloo tikki chaat', ['tikki chaat', 'aloo tikki chole', 'tikki chole'],
    [...TIKKI, ...TIKKI, ...scale(CHOLE_STREET, 0.1), ing('curd', 50), ing('sugar', 3), ...imli(20), ing('onion', 15)], 320, [piece('1 plate', 320)]),
  r('ragda-pattice', 'Ragda pattice', ['ragda patties', 'ragda pattis', 'ragda patis'],
    [...TIKKI, ...TIKKI, ...scale(RAGDA, 0.16), ...imli(20), ing('onion', 15), ...sev(8)], 340, [piece('1 plate', 340)]),
  r('ragda', 'Ragda (white peas curry)', ['ragda', 'safed vatana', 'white peas curry', 'matar chaat gravy'],
    RAGDA, 950, [KATORI]),
  r('matar-chaat', 'Matar chaat (Delhi style)', ['matra chaat', 'white matar chaat', 'safed matar chaat'],
    [...boiledPeas(150), ing('onion', 20), ing('tomato', 20), ...imli(15), u('lemonJuice', 5)], 200, [piece('1 plate', 200)]),
  r('aloo-chaat', 'Aloo chaat (fried potato)', ['aloo chat', 'delhi aloo chaat', 'fried aloo chaat'],
    [ing('potato', 200), ing('oil', 20), ...imli(20), u('lemonJuice', 5)], 190, [piece('1 plate', 190)]),
  r('chole-kulche', 'Chole kulche (street)', ['chole kulcha', 'matar kulcha', 'kulche chole', 'delhi chole kulche'],
    [...scale(CHOLE_STREET, 0.2), u('maida', 80), ing('curd', 10), ing('water', 30), u('butter', 8), ing('onion', 20)], 360,
    [piece('1 plate (2 kulche + chole)', 360)]),
  r('chole-bhature-street', 'Chole bhature (street plate)', ['chole bhature', 'chole bhatura', 'chola bhatura', 'bhature chole'],
    [u('maida', 120), ing('curd', 20), ing('water', 44), ing('oil', 26), ...scale(CHOLE_STREET, 0.2), ing('onion', 20)], 380,
    [piece('1 plate (2 bhature + chole)', 380)]),
  r('chana-chaat', 'Kala chana chaat', ['chana chaat', 'black chana chaat', 'chana chat'],
    [...boiledChana(150), ing('onion', 25), ing('tomato', 25), u('cucumber', 20), u('lemonJuice', 5)], 225, [KATORI]),
  r('moong-sprouts-chaat', 'Moong sprouts chaat', ['sprouts chaat', 'sprouted moong chaat', 'moong salad'],
    [...sprouts(150), ing('onion', 25), ing('tomato', 25), u('cucumber', 20), u('lemonJuice', 5)], 225, [KATORI]),
  r('corn-chaat', 'Masala sweet corn cup', ['corn chaat', 'sweet corn cup', 'butter corn', 'bhutta chaat'],
    [u('sweetCorn', 140), u('butter', 20), u('lemonJuice', 5)], 157, [piece('1 cup', 157)]),
  r('shakarkandi-chaat', 'Shakarkandi chaat', ['sweet potato chaat', 'shakarkand chaat', 'roasted sweet potato'],
    [u('sweetPotato', 200), u('lemonJuice', 5)], 180, [piece('1 plate', 180)]),
  r('peanut-chaat', 'Peanut chaat', ['moongphali chaat', 'boiled peanut chaat', 'shengdana chaat'],
    [ing('peanuts', 60), ing('water', 30), ing('onion', 25), ing('tomato', 25), u('lemonJuice', 5)], 140, [piece('1 bowl (100 g)', 100)]),
  r('tawa-pulao', 'Tawa pulao (Mumbai street)', ['tava pulao', 'pav bhaji pulao'],
    [ing('rice', 100), ing('water', 220), u('butter', 15), ing('oil', 10), u('capsicum', 30), ing('tomato', 50), ing('onion', 40), u('peas', 20)], 450,
    [PLATE]),

  // ================= Rolls, momos =================
  r('veg-frankie', 'Veg frankie / kathi roll (aloo)', ['frankie', 'veg roll', 'kathi roll', 'aloo roll', 'veg wrap'],
    [u('maida', 50), ing('water', 20), ing('oil', 10), ing('potato', 80), ing('onion', 25), u('cabbage', 15), u('mayo', 8), u('ketchup', 8)], 195,
    [piece('1 roll', 195)]),
  r('veg-cheese-frankie', 'Veg cheese frankie', ['cheese frankie', 'cheese roll', 'veg cheese roll'],
    [u('maida', 50), ing('water', 20), ing('oil', 10), ing('potato', 80), ing('onion', 25), u('cabbage', 15), u('mayo', 8), u('ketchup', 8), u('cheddar', 20)], 215,
    [piece('1 roll', 215)]),
  r('paneer-kathi-roll', 'Paneer kathi roll', ['paneer roll', 'paneer frankie', 'paneer tikka roll', 'paneer wrap'],
    [u('maida', 50), ing('water', 20), ing('oil', 12), ing('paneer', 70), ing('onion', 25), u('capsicum', 20), ing('curd', 10), u('mayo', 8)], 195,
    [piece('1 roll', 195)]),
  r('veg-momos', 'Veg momos, steamed', ['momos', 'veg momo', 'steamed momos', 'dimsums'],
    [u('maida', 80), ing('water', 40), u('cabbage', 100), ing('carrot', 30), ing('onion', 30), ing('oil', 6)], 250, [piece('1 momo', 25), piece('1 plate (6 momos)', 150)]),
  r('fried-momos', 'Veg momos, fried', ['fried momos', 'fry momo', 'kurkure momos'],
    [u('maida', 80), ing('water', 40), u('cabbage', 100), ing('carrot', 30), ing('onion', 30), ing('oil', 30)], 260, [piece('1 momo', 26), piece('1 plate (6 momos)', 156)]),
  r('paneer-momos', 'Paneer momos, steamed', ['paneer momo', 'paneer dimsum'],
    [u('maida', 80), ing('water', 40), ing('paneer', 80), u('cabbage', 40), ing('onion', 30), ing('oil', 5)], 250, [piece('1 momo', 25), piece('1 plate (6 momos)', 150)]),
  r('tandoori-momos', 'Tandoori momos (veg)', ['tandoori momo', 'afghani momos'],
    [u('maida', 80), ing('water', 40), u('cabbage', 100), ing('carrot', 30), ing('onion', 30), ing('oil', 12), ing('curd', 40), u('mayo', 10)], 300,
    [piece('1 plate (6 momos)', 180)]),

  // ================= Sandwiches, burgers, toast =================
  r('veg-sandwich', 'Veg sandwich (no butter)', ['vegetable sandwich', 'green chutney sandwich', 'cucumber sandwich', 'plain veg sandwich'],
    [u('bread', 50), u('cucumber', 30), ing('tomato', 30), ing('onion', 10)], 120, [piece('1 sandwich (2 slices)', 120)]),
  r('veg-butter-sandwich', 'Veg sandwich with butter', ['butter sandwich', 'veg butter sandwich', 'chutney butter sandwich'],
    [u('bread', 50), u('butter', 8), u('cucumber', 30), ing('tomato', 30), ing('onion', 10)], 128, [piece('1 sandwich (2 slices)', 128)]),
  r('bombay-sandwich', 'Bombay sandwich (grilled)', ['bombay masala sandwich', 'mumbai sandwich', 'veg grilled sandwich', 'toast sandwich'],
    [u('bread', 75), u('butter', 12), ing('potato', 50), u('cucumber', 25), ing('tomato', 25), ing('onion', 15), u('beetroot', 15), u('capsicum', 10)], 220,
    [piece('1 sandwich (3 slices)', 220)]),
  r('cheese-bombay-sandwich', 'Veg cheese grilled sandwich', ['cheese grill sandwich', 'veg cheese sandwich', 'cheese bombay sandwich'],
    [u('bread', 75), u('butter', 12), ing('potato', 40), u('cucumber', 25), ing('tomato', 25), ing('onion', 15), u('capsicum', 10), u('cheddar', 25)], 225,
    [piece('1 sandwich', 225)]),
  r('grilled-cheese-sandwich', 'Grilled cheese sandwich', ['cheese toast sandwich', 'cheese grilled sandwich', 'cheese slice sandwich'],
    [u('bread', 50), u('butter', 8), u('cheeseSlice', 40)], 96, [piece('1 sandwich', 96)]),
  r('cheese-chutney-sandwich', 'Cheese chutney sandwich', ['chutney cheese sandwich', 'cheese chutney toast'],
    [u('bread', 50), u('butter', 5), u('cheddar', 25)], 80, [piece('1 sandwich', 80)]),
  r('aloo-masala-toast', 'Aloo masala toast sandwich', ['masala toast', 'aloo sandwich', 'potato toast sandwich'],
    [u('bread', 50), u('butter', 10), ing('potato', 70), ing('oil', 3), ing('onion', 15)], 145, [piece('1 sandwich', 145)]),
  r('paneer-sandwich', 'Paneer sandwich (grilled)', ['paneer grilled sandwich', 'paneer tikka sandwich'],
    [u('bread', 50), u('butter', 8), ing('paneer', 50), ing('onion', 15), u('capsicum', 15), ing('tomato', 15)], 150, [piece('1 sandwich', 150)]),
  r('corn-mayo-sandwich', 'Corn mayo sandwich', ['corn sandwich', 'sweet corn mayo sandwich'],
    [u('bread', 50), u('sweetCorn', 40), u('mayo', 20), u('capsicum', 10), u('butter', 5)], 122, [piece('1 sandwich', 122)]),
  r('veg-mayo-sandwich', 'Veg mayo sandwich', ['mayonnaise sandwich', 'coleslaw sandwich'],
    [u('bread', 50), u('cabbage', 30), ing('carrot', 20), u('mayo', 20)], 118, [piece('1 sandwich', 118)]),
  r('brown-bread-veg-sandwich', 'Brown bread veg sandwich', ['brown bread sandwich', 'wheat bread sandwich', 'atta bread sandwich'],
    [u('brownBread', 56), u('cucumber', 30), ing('tomato', 30), ing('onion', 10), u('butter', 4)], 128, [piece('1 sandwich', 128)]),
  r('bread-butter', 'Bread butter (2 slices)', ['bread and butter', 'butter toast', 'maska bread'],
    [u('bread', 50), u('butter', 10)], 60, [piece('2 slices', 60)]),
  r('bread-butter-jam', 'Bread butter jam (2 slices)', ['bread jam', 'jam toast', 'bread jam butter'],
    [u('bread', 50), u('butter', 8), u('jam', 20)], 78, [piece('2 slices', 78)]),
  r('peanut-butter-toast', 'Peanut butter toast (brown bread)', ['pb toast', 'peanut butter bread'],
    [u('brownBread', 56), u('peanutButter', 30)], 86, [piece('2 slices', 86)]),
  r('peanut-butter-banana-toast', 'Peanut butter banana toast', ['pb banana toast', 'banana peanut butter sandwich'],
    [u('brownBread', 56), u('peanutButter', 25), u('banana', 60)], 141, [piece('2 slices', 141)]),
  r('cheese-garlic-bread', 'Cheese garlic bread', ['garlic bread', 'cheesy garlic bread'],
    [u('bread', 60), u('butter', 15), u('mozzarella', 30), u('garlic', 5)], 105, [piece('2 pieces', 105)]),
  r('veg-burger', 'Veg burger (aloo tikki burger)', ['aloo tikki burger', 'veg burger', 'tikki burger', 'mcaloo tikki'],
    [u('bun', 60), ...TIKKI, u('mayo', 15), u('ketchup', 10), ing('tomato', 15), ing('onion', 10), u('lettuce', 10)], 180, [piece('1 burger', 180)]),
  r('veg-cheese-burger', 'Veg cheese burger', ['cheese burger veg', 'aloo tikki cheese burger'],
    [u('bun', 60), ...TIKKI, u('mayo', 15), u('ketchup', 10), u('cheeseSlice', 20), ing('tomato', 15), ing('onion', 10), u('lettuce', 10)], 200,
    [piece('1 burger', 200)]),
  r('paneer-burger', 'Paneer burger', ['paneer patty burger', 'paneer tikka burger'],
    [u('bun', 60), ing('paneer', 60), u('breadCrumbs', 10), ing('oil', 8), u('mayo', 15), ing('tomato', 15), ing('onion', 10), u('lettuce', 10)], 180,
    [piece('1 burger', 180)]),
  r('french-fries', 'French fries', ['finger chips', 'fries', 'potato fries', 'salted fries'],
    [ing('potato', 170), ing('oil', 18)], 115, [piece('1 medium portion', 110)]),
  r('veg-puff', 'Veg puff (bakery)', ['vegetable puff', 'aloo puff', 'veg patties', 'veg patty'],
    [u('puffPastry', 50), ing('potato', 40), u('peas', 8), ing('carrot', 8), ing('oil', 3)], 100, [piece('1 puff', 100)]),
  r('paneer-puff', 'Paneer puff (bakery)', ['paneer patties', 'paneer patty'],
    [u('puffPastry', 50), ing('paneer', 30), ing('onion', 10), u('capsicum', 8), ing('oil', 3)], 95, [piece('1 puff', 95)]),
  r('khari-biscuit', 'Khari biscuit', ['khari', 'puff biscuit', 'butter khari'],
    [u('puffPastry', 30)], 30, [piece('3 khari', 30)]),

  // ================= Noodles and pasta (Indian style) =================
  r('maggi', 'Maggi (instant noodles, 1 packet)', ['maggi', 'maggi noodles', 'instant noodles', '2 minute noodles', 'yippee', 'masala noodles packet'],
    [u('instantNoodles', 70), ing('water', 160)], 200, [piece('1 packet (70 g dry)', 200)]),
  r('veg-maggi', 'Veg Maggi', ['vegetable maggi', 'masala maggi', 'tadka maggi'],
    [u('instantNoodles', 70), ing('water', 170), ing('onion', 20), ing('tomato', 20), u('peas', 15), ing('carrot', 15), ing('oil', 5)], 270,
    [piece('1 packet', 270)]),
  r('cheese-maggi', 'Cheese butter Maggi', ['cheese maggi', 'butter maggi'],
    [u('instantNoodles', 70), ing('water', 160), u('butter', 10), u('cheeseSlice', 20)], 230, [piece('1 packet', 230)]),
  r('maggi-double', 'Maggi (2 packets)', ['double maggi', 'two packets maggi'],
    [u('instantNoodles', 140), ing('water', 320)], 400, [piece('2 packets', 400)]),
  r('masala-pasta', 'Masala pasta (Indian style)', ['indian pasta', 'desi pasta', 'masala macaroni', 'tikhi pasta'],
    [u('pasta', 100), ing('water', 150), ing('oil', 15), ing('onion', 50), ing('tomato', 100), u('capsicum', 30), u('ketchup', 15)], 420, [PLATE]),
  r('red-sauce-pasta', 'Red sauce pasta', ['arrabiata pasta', 'tomato pasta', 'penne red sauce'],
    [u('pasta', 100), ing('water', 150), ing('oil', 15), u('pastaSauce', 120), ing('onion', 30), u('capsicum', 30), u('cheddar', 10)], 420, [PLATE]),
  r('white-sauce-pasta', 'White sauce pasta', ['alfredo pasta', 'white pasta', 'cheese pasta'],
    [u('pasta', 100), ing('water', 150), u('butter', 20), u('maida', 15), ing('milk', 200), u('mozzarella', 25), u('sweetCorn', 30), u('capsicum', 30)], 480,
    [PLATE]),

  // ================= Indo-Chinese =================
  r('veg-hakka-noodles', 'Veg hakka noodles', ['hakka noodles', 'veg noodles', 'chinese noodles'],
    HAKKA, 560, [PLATE]),
  r('veg-chowmein', 'Veg chowmein (street)', ['chowmein', 'chow mein', 'street noodles', 'thela chowmein'],
    [...HAKKA, ing('oil', 15), u('ketchup', 10)], 590, [PLATE]),
  r('schezwan-noodles', 'Schezwan noodles (veg)', ['szechuan noodles', 'schezwan hakka noodles'],
    [...HAKKA, ing('schezwan-sauce', 30)], 590, [PLATE]),
  r('chilli-garlic-noodles', 'Chilli garlic noodles (veg)', ['chili garlic noodles', 'garlic noodles'],
    [...HAKKA, u('garlic', 15), ing('oil', 5)], 575, [PLATE]),
  r('veg-fried-rice', 'Veg fried rice', ['fried rice', 'chinese fried rice', 'vegetable fried rice'],
    FRIED_RICE, 600, [KATORI, PLATE]),
  r('schezwan-fried-rice', 'Schezwan fried rice (veg)', ['szechuan fried rice', 'schezwan rice'],
    [...FRIED_RICE, ing('schezwan-sauce', 30)], 630, [KATORI, PLATE]),
  r('paneer-fried-rice', 'Paneer fried rice', ['paneer rice chinese'],
    [...FRIED_RICE, ing('paneer', 100), ing('oil', 5)], 700, [KATORI, PLATE]),
  r('veg-manchurian-dry', 'Veg manchurian (dry)', ['manchurian dry', 'veg manchurian', 'manchurian'],
    [...MANCHURIAN_BALLS, u('soySauce', 10), u('chilliSauce', 10), u('ketchup', 15), ing('oil', 10), ing('onion', 30), u('springOnion', 20)], 410,
    [KATORI, piece('1 plate (8 balls)', 200)]),
  r('veg-manchurian-gravy', 'Veg manchurian (gravy)', ['manchurian gravy', 'gravy manchurian'],
    [...MANCHURIAN_BALLS, u('soySauce', 15), u('chilliSauce', 10), u('ketchup', 15), u('cornflour', 12), ing('oil', 10), ing('onion', 30), ing('water', 300)], 700,
    [KATORI]),
  r('gobi-manchurian', 'Gobi manchurian (dry)', ['gobi manchurian', 'cauliflower manchurian', 'gobhi manchurian'],
    [ing('cauliflower', 300), u('maida', 40), u('cornflour', 30), ing('water', 60), ing('oil', 50), u('soySauce', 10), u('ketchup', 15), u('chilliSauce', 10), ing('onion', 30)],
    430, [KATORI, piece('1 plate', 200)]),
  r('gobi-manchurian-gravy', 'Gobi manchurian (gravy)', ['gobi manchurian gravy'],
    [ing('cauliflower', 300), u('maida', 40), u('cornflour', 42), ing('water', 360), ing('oil', 55), u('soySauce', 15), u('ketchup', 15), u('chilliSauce', 10), ing('onion', 30)],
    720, [KATORI]),
  r('chilli-paneer-dry', 'Chilli paneer (dry)', ['chilli paneer', 'chili paneer', 'paneer chilli dry'],
    [ing('paneer', 200), u('cornflour', 25), u('maida', 10), ing('water', 30), ing('oil', 30), u('capsicum', 80), ing('onion', 80), u('soySauce', 10), u('chilliSauce', 10), u('ketchup', 15)],
    420, [KATORI, piece('1 plate', 200)]),
  r('chilli-paneer-gravy', 'Chilli paneer (gravy)', ['chilli paneer gravy', 'paneer chilli gravy'],
    [ing('paneer', 200), u('cornflour', 35), u('maida', 10), ing('water', 280), ing('oil', 30), u('capsicum', 80), ing('onion', 80), u('soySauce', 15), u('chilliSauce', 10), u('ketchup', 15)],
    680, [KATORI]),
  r('chilli-mushroom', 'Chilli mushroom (dry)', ['chili mushroom', 'mushroom chilli'],
    [u('mushroom', 250), u('cornflour', 25), u('maida', 10), ing('water', 30), ing('oil', 30), u('capsicum', 60), ing('onion', 60), u('soySauce', 10), u('ketchup', 15)],
    400, [KATORI]),
  r('chilli-soya', 'Chilli soya chunks', ['soya chilli', 'chilli soya chunks', 'soya manchurian'],
    [ing('soya-chunks', 60), ing('water', 120), u('cornflour', 15), ing('oil', 20), u('capsicum', 60), ing('onion', 60), u('soySauce', 10), u('chilliSauce', 10), u('ketchup', 15)],
    320, [KATORI]),
  r('chilli-potato', 'Chilli potato', ['chili potato', 'chilli aloo'],
    [ing('potato', 300), u('cornflour', 25), ing('oil', 40), u('capsicum', 40), ing('onion', 40), u('soySauce', 10), u('chilliSauce', 10), u('ketchup', 15)],
    380, [KATORI, piece('1 plate', 200)]),
  r('honey-chilli-potato', 'Honey chilli potato', ['honey chili potato', 'hcp'],
    [ing('potato', 300), u('cornflour', 25), ing('oil', 40), u('honey', 25), u('soySauce', 10), u('chilliSauce', 10), ing('onion', 30)], 360,
    [KATORI, piece('1 plate', 200)]),
  r('crispy-corn', 'Crispy corn (salt and pepper)', ['crispy corn', 'salt pepper corn', 'crispy american corn'],
    [u('sweetCorn', 200), u('cornflour', 30), u('riceFlour', 10), ing('oil', 30), ing('onion', 30), u('capsicum', 30)], 300, [KATORI]),
  r('veg-spring-roll', 'Veg spring roll (fried)', ['spring roll', 'spring rolls', 'chinese roll'],
    [u('maida', 60), ing('water', 40), u('cabbage', 80), ing('carrot', 40), u('capsicum', 20), ing('onion', 20), ing('oil', 35), u('soySauce', 5)], 250,
    [piece('1 roll', 60), piece('1 plate (4 rolls)', 240)]),
  r('chinese-bhel', 'Chinese bhel', ['chinese bhel', 'crispy noodle bhel'],
    [u('pasta', 50), ing('oil', 18), u('cabbage', 40), ing('carrot', 20), u('capsicum', 20), ing('onion', 20), u('ketchup', 15), u('soySauce', 5), u('chilliSauce', 5)], 175,
    [piece('1 plate', 175)]),
  r('american-chopsuey', 'American chopsuey (veg)', ['chopsuey', 'american chop suey'],
    [u('pasta', 70), ing('oil', 30), u('cabbage', 60), ing('carrot', 30), u('capsicum', 30), ing('onion', 30), u('ketchup', 40), u('sweetSour', 30), u('cornflour', 10), ing('water', 120)],
    400, [PLATE]),
  r('veg-manchow-soup', 'Veg manchow soup', ['manchow soup', 'manchow'],
    [u('cabbage', 50), ing('carrot', 30), u('beans', 20), u('capsicum', 20), ing('oil', 10), u('cornflour', 15), u('soySauce', 10), ing('water', 500), u('pasta', 15), ing('oil', 5)],
    580, [piece('1 bowl', 250)]),
  r('sweet-corn-soup', 'Sweet corn veg soup', ['sweet corn soup', 'corn soup', 'veg sweet corn soup'],
    [u('sweetCorn', 100), ing('carrot', 20), u('beans', 20), u('cornflour', 15), ing('oil', 5), ing('sugar', 5), ing('water', 500)], 560,
    [piece('1 bowl', 250)]),
  r('hot-and-sour-soup', 'Hot and sour veg soup', ['hot n sour soup', 'hot and sour soup'],
    [u('cabbage', 40), ing('carrot', 30), u('mushroom', 30), u('capsicum', 20), u('cornflour', 15), u('soySauce', 15), u('vinegar', 15), u('chilliSauce', 10), ing('oil', 8), ing('water', 500)],
    600, [piece('1 bowl', 250)]),

  // ================= Namkeen and tea-time =================
  r('mathri', 'Mathri', ['mathi', 'mathiya', 'namak mathri', 'methi mathri'],
    [u('maida', 100), ing('ghee', 20), ing('water', 30), ing('oil', 18)], 135, [piece('1 mathri', 15), piece('3 mathri', 45)]),
  r('namak-para', 'Namak para', ['namakpare', 'nimki', 'namak pare'],
    [u('maida', 100), ing('ghee', 10), ing('water', 35), ing('oil', 22)], 135, [piece('1 small katori (30 g)', 30)]),
  r('chakli', 'Chakli', ['chakri', 'chakkuli', 'bhajni chakli'],
    [u('riceFlour', 70), ing('besan', 30), u('butter', 8), ing('water', 60), ing('oil', 28)], 140, [piece('1 chakli', 15), piece('3 chakli', 45)]),
  r('sev', 'Sev (plain besan)', ['nylon sev', 'besan sev', 'ratlami sev', 'bhujia sev'],
    sev(100), 100, [piece('1 small katori (30 g)', 30)]),
  r('aloo-bhujia', 'Aloo bhujia', ['aloo bhujiya', 'aloo sev', 'potato bhujia'],
    [ing('besan', 45), ing('potato', 60), u('mothBeans', 10), ing('oil', 33)], 100, [piece('1 small katori (30 g)', 30)]),
  r('bikaneri-bhujia', 'Bikaneri bhujia', ['bhujia', 'bikaneri bhujiya', 'moth bhujia'],
    [u('mothBeans', 40), ing('besan', 30), ing('water', 20), ing('oil', 33)], 100, [piece('1 small katori (30 g)', 30)]),
  r('khara-boondi', 'Khara boondi', ['boondi namkeen', 'salted boondi', 'masala boondi'],
    boondi(100), 100, [piece('1 small katori (30 g)', 30)]),
  r('poha-chivda', 'Poha chivda', ['chivda', 'chiwda', 'patla poha chivda', 'diet chivda'],
    [ing('poha', 70), ing('peanuts', 15), ing('oil', 12), u('raisins', 5), ing('sugar', 3)], 100, [piece('1 small katori (30 g)', 30)]),
  r('cornflakes-chivda', 'Cornflakes chivda', ['makai chivda', 'corn flakes namkeen', 'makka poha chivda'],
    [u('cornflakes', 65), ing('peanuts', 15), ing('oil', 18), ing('sugar', 3), u('raisins', 3)], 100, [piece('1 small katori (30 g)', 30)]),
  r('namkeen-mixture', 'Namkeen mixture', ['mixture', 'khatta meetha', 'navratan mix', 'mix namkeen'],
    [...sev(35), ...boondi(15), ing('peanuts', 15), ing('chana', 10), ing('poha', 10), ing('oil', 10), ing('sugar', 5)], 100,
    [piece('1 small katori (30 g)', 30)]),
  r('masala-peanuts', 'Masala peanuts (besan coated)', ['masala moongfali', 'coated peanuts', 'masala singdana'],
    [ing('peanuts', 60), ing('besan', 25), u('riceFlour', 5), ing('water', 15), ing('oil', 15)], 100, [piece('1 small katori (30 g)', 30)]),
  r('chana-dal-namkeen', 'Chana dal namkeen (fried)', ['fried chana dal', 'chana dal fry namkeen'],
    [ing('chana', 80), ing('oil', 22)], 100, [piece('1 small katori (30 g)', 30)]),
  r('moong-dal-namkeen', 'Moong dal namkeen (fried)', ['fried moong dal', 'moong dal haldiram style'],
    [ing('moong-dal', 80), ing('oil', 22)], 100, [piece('1 small katori (30 g)', 30)]),
  r('roasted-peanuts', 'Roasted peanuts', ['bhuni moongfali', 'roasted groundnuts', 'shengdana'],
    [u('roastedPeanuts', 100)], 100, [piece('1 handful (30 g)', 30)]),
  r('roasted-chana', 'Roasted chana (bhuna chana)', ['bhuna chana', 'roasted gram', 'phutana', 'dalia chana', 'futana'],
    [ing('chana', 100)], 95, [piece('1 handful (30 g)', 30)]),
  r('roasted-chana-peanuts', 'Roasted chana and peanuts mix', ['chana moongfali', 'chana singdana'],
    [ing('chana', 50), u('roastedPeanuts', 50)], 97, [piece('1 handful (30 g)', 30)]),
  r('roasted-makhana', 'Roasted makhana (with ghee)', ['masala makhana', 'phool makhana roasted', 'fox nuts roasted'],
    [ing('makhana', 100), ing('ghee', 10)], 108, [piece('1 bowl (25 g)', 25)]),
  r('roasted-makhana-dry', 'Dry roasted makhana (no oil)', ['plain makhana', 'makhana no oil'],
    [ing('makhana', 100)], 98, [piece('1 bowl (25 g)', 25)]),
  r('masala-murmura', 'Masala murmura (roasted)', ['masala mamra', 'murmura namkeen', 'kurmura chivda', 'puffed rice snack'],
    [u('murmura', 80), ing('peanuts', 12), ing('oil', 8)], 100, [piece('1 bowl (30 g)', 30)]),
  r('murmura', 'Murmura (plain puffed rice)', ['murmura', 'mamra', 'kurmura', 'muri', 'puffed rice'],
    [u('murmura', 100)], 100, [piece('1 bowl (20 g)', 20)]),
  r('potato-chips', 'Potato chips (wafers)', ['wafers', 'chips', 'aloo chips', 'lays'],
    [u('potatoChips', 100)], 100, [piece('1 small packet (30 g)', 30)]),
  r('popcorn', 'Popcorn (salted)', ['popcorn', 'salted popcorn', 'cinema popcorn'],
    [u('popcornOil', 100)], 100, [piece('1 small tub (30 g)', 30)]),
  r('butter-popcorn', 'Butter popcorn', ['butter popcorn', 'movie popcorn'],
    [u('popcornOil', 85), u('butter', 15)], 98, [piece('1 small tub (35 g)', 35)]),
  r('air-popped-popcorn', 'Popcorn (air popped, no oil)', ['air popcorn', 'diet popcorn'],
    [u('popcornAir', 100)], 100, [piece('1 bowl (15 g)', 15)]),
  r('rusk', 'Rusk (toast)', ['toast rusk', 'suji rusk', 'cake rusk', 'chai toast'],
    [u('rusk', 100)], 100, [piece('2 rusk', 25)]),
  r('dry-fruit-mix', 'Dry fruit mix (almonds, cashews, raisins)', ['dry fruits', 'trail mix', 'mewa', 'mixed nuts'],
    [u('almonds', 35), u('cashews', 25), u('walnuts', 15), u('raisins', 25)], 100, [piece('1 handful (30 g)', 30)]),
  r('soaked-almonds', 'Soaked almonds', ['bhige badam', 'soaked badam', 'almonds'],
    [u('almonds', 100), ing('water', 30)], 125, [piece('10 almonds (15 g)', 15)]),

  // ================= Salads and sprouts =================
  r('sprouts-salad', 'Sprouts salad (moong and moth)', ['mixed sprouts', 'sprout salad', 'ankurit salad'],
    [...sprouts(100), u('mothBeans', 20), ing('water', 30), ing('onion', 25), ing('tomato', 25), u('cucumber', 25), u('lemonJuice', 5)], 225, [KATORI]),
  r('steamed-sprouts', 'Steamed moong sprouts', ['boiled sprouts', 'ubli hui sprouts', 'moong sprouts', 'ankurit moong'],
    sprouts(150), 145, [KATORI]),
  r('kabuli-chana-salad', 'Kabuli chana salad', ['chickpea salad', 'chole salad', 'boiled chana salad'],
    [...boiledChana(150), u('cucumber', 30), ing('tomato', 30), ing('onion', 20), u('lemonJuice', 5), ing('oil', 3)], 235, [KATORI]),
  r('rajma-salad', 'Rajma salad', ['kidney bean salad'],
    [ing('rajma', 60), ing('water', 90), u('cucumber', 30), ing('tomato', 30), ing('onion', 20), u('lemonJuice', 5)], 225, [KATORI]),
  r('boiled-kala-chana', 'Boiled kala chana', ['ubla chana', 'boiled black chana', 'boiled chickpeas'],
    boiledChana(100), 100, [KATORI]),
  r('beetroot-salad', 'Beetroot carrot salad', ['beetroot salad', 'beet carrot salad', 'chukandar salad'],
    [u('beetroot', 100), ing('carrot', 80), u('lemonJuice', 5), ing('peanuts', 10)], 190, [KATORI]),
  r('cabbage-carrot-salad', 'Cabbage carrot salad', ['coleslaw indian', 'patta gobi salad', 'cabbage salad'],
    [u('cabbage', 100), ing('carrot', 60), u('lemonJuice', 5), ing('oil', 3), ing('peanuts', 10)], 170, [KATORI]),
  r('paneer-salad', 'Paneer salad', ['paneer veggie salad', 'protein paneer salad', 'cottage cheese salad'],
    [ing('paneer', 100), u('cucumber', 60), ing('tomato', 50), ing('onion', 30), u('capsicum', 30), u('lemonJuice', 5), ing('oil', 3)], 270, [KATORI, PLATE]),
  r('tofu-salad', 'Tofu salad', ['tofu veggie salad'],
    [u('tofu', 100), u('cucumber', 60), ing('tomato', 50), ing('onion', 30), u('capsicum', 30), u('lemonJuice', 5), ing('oil', 3)], 270, [KATORI, PLATE]),
  r('quinoa-salad', 'Quinoa salad', ['quinoa bowl'],
    [u('quinoa', 60), ing('water', 120), u('cucumber', 40), ing('tomato', 40), u('capsicum', 20), ing('onion', 20), u('lemonJuice', 8), ing('oil', 5)], 290, [KATORI]),
  r('quinoa-pulao', 'Quinoa veg pulao', ['quinoa khichdi', 'quinoa upma', 'veg quinoa'],
    [u('quinoa', 100), ing('water', 220), u('peas', 30), ing('carrot', 30), u('beans', 30), ing('onion', 30), ing('oil', 8)], 400, [KATORI, PLATE]),

  // ================= Oats, muesli, cereal, sattu =================
  r('masala-oats', 'Masala oats (vegetable)', ['oats upma', 'savoury oats', 'veg oats', 'oats khichdi'],
    [u('oats', 50), ing('water', 200), ing('onion', 25), ing('tomato', 25), ing('carrot', 20), u('peas', 15), ing('oil', 5)], 280, [KATORI]),
  r('oats-milk-sugar', 'Oats porridge with milk and sugar', ['oats with milk', 'oats daliya', 'oatmeal', 'porridge'],
    [u('oats', 40), ing('milk', 200), ing('water', 50), ing('sugar', 10)], 270, [KATORI]),
  r('oats-milk-no-sugar', 'Oats with milk (no sugar)', ['oats milk no sugar', 'plain oats milk'],
    [u('oats', 40), ing('milk', 200), ing('water', 50)], 260, [KATORI]),
  r('oats-water', 'Oats cooked in water', ['oats in water', 'plain oats'],
    [u('oats', 40), ing('water', 220)], 230, [KATORI]),
  r('overnight-oats', 'Overnight oats (milk, banana, chia)', ['overnight oats', 'soaked oats'],
    [u('oats', 40), ing('milk', 150), u('banana', 60), u('chia', 8), u('honey', 8)], 266, [KATORI]),
  r('oats-chilla', 'Oats chilla', ['oats cheela', 'oats pancake', 'oats besan chilla'],
    [u('oats', 40), ing('besan', 15), ing('water', 70), ing('onion', 20), ing('tomato', 20), ing('oil', 6)], 150, [piece('1 chilla', 75)]),
  r('muesli-milk', 'Muesli with milk', ['muesli milk', 'museli doodh'],
    [ing('snacks-muesli', 45), ing('milk', 200)], 245, [piece('1 bowl', 245)]),
  r('muesli-curd', 'Muesli with curd', ['muesli dahi', 'muesli yogurt'],
    [ing('snacks-muesli', 40), ing('curd', 150)], 190, [piece('1 bowl', 190)]),
  r('cornflakes-milk-sugar', 'Cornflakes with milk and sugar', ['cornflakes', 'corn flakes milk', 'flakes'],
    [u('cornflakes', 30), ing('milk', 200), ing('sugar', 10)], 240, [piece('1 bowl', 240)]),
  r('cornflakes-milk', 'Cornflakes with milk (no sugar)', ['cornflakes no sugar'],
    [u('cornflakes', 30), ing('milk', 200)], 230, [piece('1 bowl', 230)]),
  r('sattu-drink-salted', 'Sattu sharbat (salted)', ['sattu drink', 'sattu namkeen', 'sattu ghol', 'sattu pani'],
    [ing('sattu', 35), ing('water', 250), u('lemonJuice', 8), ing('onion', 10)], 300, [GLASS]),
  r('sattu-drink-sweet', 'Sattu sharbat (sweet)', ['meetha sattu', 'sattu with sugar', 'sweet sattu drink'],
    [ing('sattu', 35), ing('water', 250), ing('sugar', 15)], 300, [GLASS]),
  r('sattu-milk-shake', 'Sattu milk shake', ['sattu shake', 'sattu with milk'],
    [ing('sattu', 35), ing('milk', 220), ing('sugar', 8)], 263, [GLASS]),

  // ================= Lassi and chaas =================
  r('sweet-lassi', 'Sweet lassi', ['meethi lassi', 'lassi', 'punjabi lassi', 'sugar lassi'],
    [ing('curd', 220), ing('water', 30), ing('sugar', 30)], 280, [GLASS, piece('1 tall glass (300 ml)', 300)]),
  r('salted-lassi', 'Salted lassi', ['namkeen lassi', 'salt lassi', 'masala lassi'],
    [ing('curd', 200), ing('water', 80)], 280, [GLASS]),
  r('malai-lassi', 'Malai lassi (with cream)', ['malaidar lassi', 'amritsari lassi', 'lassi with malai'],
    [ing('curd', 200), ing('water', 40), ing('sugar', 30), u('cream', 30)], 300, [GLASS, piece('1 kulhad (300 ml)', 300)]),
  r('mango-lassi', 'Mango lassi', ['aam lassi', 'mango yogurt drink'],
    [ing('curd', 150), u('mango', 100), ing('water', 20), ing('sugar', 25)], 295, [GLASS]),
  r('chaas', 'Chaas (plain buttermilk)', ['buttermilk', 'chhachh', 'taak', 'majjiga', 'mor'],
    [ing('curd', 80), ing('water', 170)], 250, [GLASS]),
  r('masala-chaas', 'Masala chaas', ['masala buttermilk', 'jeera chaas', 'spiced buttermilk'],
    [ing('curd', 80), ing('water', 170), ing('onion', 5)], 255, [GLASS]),
  r('sweet-chaas', 'Sweet chaas', ['meetha chaas', 'sweet buttermilk'],
    [ing('curd', 80), ing('water', 170), ing('sugar', 15)], 265, [GLASS]),

  // ================= Tea and coffee =================
  r('chai-no-sugar', 'Chai with milk, no sugar', ['tea without sugar', 'sugar free chai', 'chai bina cheeni'],
    [ing('water', 100), ing('milk', 100)], 170, [CUP]),
  r('chai-less-sugar', 'Chai with milk, less sugar', ['kam cheeni chai', 'less sugar tea'],
    [ing('water', 100), ing('milk', 100), ing('sugar', 5)], 175, [CUP]),
  r('cutting-chai', 'Cutting chai (street, extra sweet)', ['cutting', 'tapri chai', 'kadak chai', 'irani chai'],
    [ing('water', 70), ing('milk', 120), ing('sugar', 15)], 180, [piece('1 cutting (60 ml)', 60), CUP]),
  r('gur-chai', 'Gur chai (jaggery tea)', ['jaggery tea', 'gud wali chai'],
    [ing('water', 100), ing('milk', 100), ing('jaggery', 12)], 180, [CUP]),
  r('lemon-tea', 'Lemon tea (with sugar)', ['nimbu chai', 'lemon black tea'],
    [u('blackTea', 150), ing('sugar', 8), u('lemonJuice', 5)], 160, [CUP]),
  r('green-tea-honey', 'Green tea with honey', ['green tea', 'honey green tea', 'green tea lemon honey'],
    [u('greenTea', 150), u('honey', 5)], 155, [CUP]),
  r('iced-tea', 'Lemon iced tea', ['iced tea', 'lemon ice tea', 'cold tea'],
    [u('blackTea', 200), ing('sugar', 18), u('lemonJuice', 10)], 228, [GLASS]),
  r('filter-coffee', 'Filter coffee (milk and sugar)', ['south indian filter coffee', 'kaapi', 'degree coffee', 'madras coffee'],
    [u('coffee', 40), ing('milk', 110), ing('sugar', 10)], 150, [piece('1 tumbler (150 ml)', 150)]),
  r('filter-coffee-no-sugar', 'Filter coffee, no sugar', ['kaapi no sugar', 'filter coffee without sugar'],
    [u('coffee', 40), ing('milk', 110)], 145, [piece('1 tumbler (150 ml)', 145)]),
  r('milk-coffee', 'Coffee with milk and sugar', ['coffee', 'nescafe with milk', 'instant coffee', 'doodh coffee', 'milk coffee'],
    [u('instantCoffee', 2), ing('milk', 120), ing('water', 40), ing('sugar', 10)], 165, [CUP]),
  r('milk-coffee-no-sugar', 'Coffee with milk, no sugar', ['coffee without sugar', 'sugar free coffee'],
    [u('instantCoffee', 2), ing('milk', 120), ing('water', 40)], 155, [CUP]),
  r('black-coffee', 'Black coffee (no sugar)', ['black coffee', 'americano', 'black nescafe'],
    [u('instantCoffee', 2), ing('water', 150)], 152, [CUP]),
  r('black-coffee-sugar', 'Black coffee with sugar', ['black coffee sugar'],
    [u('coffee', 150), ing('sugar', 8)], 158, [CUP]),
  r('cold-coffee', 'Cold coffee', ['iced coffee', 'cold coffee shake', 'frappe'],
    [ing('milk', 220), u('instantCoffee', 3), ing('sugar', 20)], 243, [GLASS]),
  r('cold-coffee-ice-cream', 'Cold coffee with ice cream', ['cold coffee with ice cream', 'thick cold coffee', 'cafe frappe'],
    [ing('milk', 200), u('instantCoffee', 3), ing('sugar', 15), u('iceCream', 60), u('chocSyrup', 10)], 288, [piece('1 tall glass (300 ml)', 288)]),

  // ================= Milk drinks =================
  r('glass-of-milk', 'Glass of milk (full cream)', ['doodh', 'milk', 'garam doodh', 'warm milk'],
    [ing('milk', 200)], 200, [GLASS]),
  r('milk-with-sugar', 'Milk with sugar', ['meetha doodh', 'doodh cheeni'],
    [ing('milk', 200), ing('sugar', 10)], 210, [GLASS]),
  r('toned-milk', 'Toned milk (glass)', ['toned milk', 'low fat milk', 'double toned milk'],
    [u('tonedMilk', 200)], 200, [GLASS]),
  r('skim-milk', 'Skimmed milk (glass)', ['skim milk', 'fat free milk'],
    [u('skimMilk', 200)], 200, [GLASS]),
  r('haldi-doodh', 'Haldi doodh (with sugar)', ['turmeric milk', 'golden milk', 'haldi wala doodh'],
    [ing('milk', 200), ing('sugar', 8)], 205, [GLASS]),
  r('haldi-doodh-no-sugar', 'Haldi doodh (no sugar)', ['turmeric milk no sugar', 'haldi milk plain'],
    [ing('milk', 200)], 198, [GLASS]),
  r('badam-milk', 'Badam milk', ['badam doodh', 'almond milk indian', 'kesar badam milk', 'badam drink'],
    [ing('milk', 220), u('almonds', 12), ing('sugar', 15)], 240, [GLASS]),
  r('malt-milk', 'Bournvita / Horlicks milk', ['bournvita milk', 'horlicks', 'boost milk', 'complan milk', 'health drink milk'],
    [ing('milk', 200), ing('snacks-malt-drink-powder', 20)], 220, [GLASS]),
  r('chocolate-milk', 'Chocolate milk (cocoa and sugar)', ['cocoa milk', 'choco milk', 'hot chocolate'],
    [ing('milk', 200), u('cocoa', 8), ing('sugar', 15)], 223, [GLASS]),
  r('rose-milk', 'Rose milk', ['rooh afza milk', 'gulab doodh', 'rose milk shake'],
    [ing('milk', 200), ing('rose-syrup', 25)], 225, [GLASS]),
  r('thandai', 'Thandai', ['thandai milk', 'holi thandai', 'sardai'],
    [ing('milk', 200), u('almonds', 10), u('cashews', 5), u('pistachios', 3), ing('sugar', 20)], 238, [GLASS]),
  r('masala-milk', 'Masala doodh', ['masala milk', 'kesar pista milk'],
    [ing('milk', 220), u('almonds', 6), u('pistachios', 4), ing('sugar', 15)], 245, [GLASS]),

  // ================= Shakes =================
  r('banana-shake', 'Banana shake (with sugar)', ['banana milkshake', 'kela shake', 'banana shake'],
    [ing('milk', 200), u('banana', 100), ing('sugar', 15)], 315, [GLASS, piece('1 tall glass (300 ml)', 315)]),
  r('banana-shake-no-sugar', 'Banana shake (no sugar)', ['banana shake no sugar', 'kela shake bina cheeni'],
    [ing('milk', 200), u('banana', 100)], 300, [GLASS]),
  r('mango-shake', 'Mango shake', ['aam shake', 'mango milkshake'],
    [ing('milk', 180), u('mango', 120), ing('sugar', 15)], 315, [GLASS, piece('1 tall glass (300 ml)', 315)]),
  r('chikoo-shake', 'Chikoo shake', ['sapota shake', 'chiku milkshake'],
    [ing('milk', 180), u('chikoo', 100), ing('sugar', 15)], 295, [GLASS]),
  r('strawberry-shake', 'Strawberry shake', ['strawberry milkshake'],
    [ing('milk', 200), u('strawberry', 80), ing('sugar', 20)], 300, [GLASS]),
  r('apple-shake', 'Apple shake', ['apple milkshake', 'seb shake'],
    [ing('milk', 180), u('apple', 100), ing('sugar', 15)], 295, [GLASS]),
  r('papaya-shake', 'Papaya shake', ['papita shake', 'papaya milkshake'],
    [ing('milk', 180), u('papaya', 100), ing('sugar', 15)], 295, [GLASS]),
  r('muskmelon-shake', 'Muskmelon shake', ['kharbuja shake', 'musk melon milkshake'],
    [ing('milk', 160), u('muskmelon', 120), ing('sugar', 15)], 295, [GLASS]),
  r('dates-shake', 'Dates shake (khajur, no sugar)', ['khajur shake', 'date shake'],
    [ing('milk', 220), u('dates', 30)], 250, [GLASS]),
  r('dry-fruit-shake', 'Dry fruit milkshake', ['dry fruit shake', 'mewa shake'],
    [ing('milk', 220), u('almonds', 10), u('cashews', 8), u('dates', 15), ing('sugar', 10)], 263, [GLASS]),
  r('chocolate-shake', 'Chocolate shake (with ice cream)', ['chocolate milkshake', 'oreo shake', 'choco shake'],
    [ing('milk', 180), u('iceCream', 60), u('chocSyrup', 25), ing('sugar', 5)], 270, [GLASS]),
  r('whey-water', 'Whey protein shake (water)', ['protein shake', 'whey with water', 'protein in water'],
    [ing('snacks-whey-protein', 32), ing('water', 250)], 282, [piece('1 scoop shake', 282)]),
  r('whey-milk', 'Whey protein shake (milk)', ['whey with milk', 'protein shake milk'],
    [ing('snacks-whey-protein', 32), ing('milk', 250)], 282, [piece('1 scoop shake', 282)]),
  r('whey-toned-milk', 'Whey protein shake (toned milk)', ['whey toned milk', 'protein shake low fat milk'],
    [ing('snacks-whey-protein', 32), u('tonedMilk', 250)], 282, [piece('1 scoop shake', 282)]),
  r('whey-banana-shake', 'Whey banana milkshake', ['protein banana shake', 'gainer shake homemade'],
    [ing('snacks-whey-protein', 32), ing('milk', 250), u('banana', 100)], 382, [piece('1 shake', 382)]),
  r('peanut-butter-banana-shake', 'Peanut butter banana shake', ['pb banana shake', 'peanut butter shake'],
    [ing('milk', 250), u('banana', 100), u('peanutButter', 20)], 370, [piece('1 shake', 370)]),
  r('oats-banana-shake', 'Oats banana smoothie', ['oats smoothie', 'oats shake', 'banana oats shake'],
    [ing('milk', 220), u('banana', 100), u('oats', 30), u('honey', 10)], 360, [piece('1 shake', 360)]),
  r('mass-gainer-shake', 'Homemade mass gainer shake', ['weight gain shake', 'bulking shake'],
    [ing('milk', 300), u('banana', 120), u('oats', 40), u('peanutButter', 25), u('dates', 25), u('almonds', 10)], 520, [piece('1 shake', 520)]),
  r('greek-yogurt-smoothie', 'Curd protein smoothie (Greek yogurt, fruit)', ['greek yogurt smoothie', 'curd smoothie', 'protein smoothie'],
    [u('greekYogurt', 150), u('skimMilk', 100), u('banana', 80), u('honey', 8)], 338, [piece('1 smoothie', 338)]),

  // ================= Juices and coolers =================
  r('orange-juice', 'Orange juice (fresh)', ['santra juice', 'orange juice', 'narangi juice'],
    [u('orangeJuice', 200)], 200, [GLASS]),
  r('mosambi-juice', 'Mosambi juice (fresh)', ['sweet lime juice', 'mosambi', 'musambi juice', 'sathukudi juice'],
    [u('orangeJuice', 200)], 200, [GLASS]),
  r('mosambi-juice-sugar', 'Mosambi juice with sugar (street)', ['mosambi juice sugar', 'juice centre mosambi'],
    [u('orangeJuice', 200), ing('sugar', 15)], 215, [GLASS]),
  r('watermelon-juice', 'Watermelon juice (with sugar)', ['tarbooz juice', 'tarbuj juice', 'kalingad juice'],
    [u('watermelon', 220), ing('sugar', 15)], 215, [GLASS]),
  r('pineapple-juice', 'Pineapple juice (fresh, with sugar)', ['ananas juice', 'pineapple juice'],
    [u('pineapple', 200), ing('sugar', 10), ing('water', 20)], 210, [GLASS]),
  r('anar-juice', 'Pomegranate juice (anar)', ['anar juice', 'pomegranate juice', 'anar ras'],
    [u('pomegranateJuice', 200)], 200, [GLASS]),
  r('apple-juice', 'Apple juice', ['seb juice', 'apple juice'],
    [u('appleJuice', 200)], 200, [GLASS]),
  r('grape-juice', 'Grape juice (fresh, with sugar)', ['angoor juice', 'grapes juice'],
    [u('grapes', 220), ing('sugar', 10)], 205, [GLASS]),
  r('carrot-juice', 'Carrot juice', ['gajar juice', 'gajar ka ras'],
    [u('carrotJuice', 200)], 200, [GLASS]),
  r('abc-juice', 'ABC juice (apple, beetroot, carrot)', ['abc juice', 'apple beetroot carrot juice'],
    [u('apple', 100), u('beetroot', 80), ing('carrot', 100), ing('water', 50)], 250, [GLASS]),
  r('beetroot-juice', 'Beetroot juice', ['chukandar juice', 'beet juice'],
    [u('beetroot', 150), ing('water', 80), u('lemonJuice', 5)], 210, [GLASS]),
  r('mixed-fruit-juice', 'Mixed fruit juice (street)', ['mix fruit juice', 'fruit punch fresh'],
    [u('orangeJuice', 80), u('pineapple', 60), u('apple', 50), u('pomegranate', 30), ing('sugar', 10)], 220, [GLASS]),
  r('sugarcane-juice', 'Sugarcane juice', ['ganne ka juice', 'ganne ka ras', 'oos ras', 'sugar cane juice'],
    [ing('snacks-sugarcane-juice', 230), u('lemonJuice', 5)], 235, [GLASS, piece('1 large glass (300 ml)', 300)]),
  r('coconut-water', 'Coconut water', ['nariyal pani', 'tender coconut', 'elaneer', 'daab'],
    [u('coconutWater', 250)], 250, [piece('1 coconut (250 ml)', 250)]),
  r('tender-coconut-malai', 'Tender coconut water with malai', ['nariyal malai', 'coconut with malai'],
    [u('coconutWater', 250), u('coconut', 40)], 290, [piece('1 coconut', 290)]),
  r('nimbu-pani', 'Nimbu pani (with sugar)', ['shikanji', 'lemonade', 'lemon water', 'nimbu sharbat', 'limbu pani'],
    [ing('water', 220), u('lemonJuice', 20), ing('sugar', 20)], 260, [GLASS]),
  r('nimbu-soda', 'Nimbu soda (sweet)', ['lemon soda', 'fresh lime soda', 'banta', 'goli soda'],
    [u('soda', 200), u('lemonJuice', 20), ing('sugar', 20)], 240, [GLASS]),
  r('lemon-honey-water', 'Warm lemon honey water', ['honey lemon water', 'nimbu shahad pani'],
    [ing('water', 220), u('lemonJuice', 15), u('honey', 10)], 245, [GLASS]),
  r('jaljeera', 'Jaljeera', ['jal jeera', 'jaljira'],
    [ing('water', 230), u('lemonJuice', 10), u('tamarind', 5), ing('sugar', 10)], 255, [GLASS]),
  r('aam-panna', 'Aam panna', ['kairi panha', 'raw mango drink', 'aam ka panna', 'kairi panna'],
    [u('mango', 60), ing('water', 200), ing('sugar', 25)], 285, [GLASS]),
  r('rooh-afza-sharbat', 'Rooh Afza sharbat (water)', ['rooh afza', 'rose sharbat', 'sharbat'],
    [ing('water', 220), ing('rose-syrup', 30)], 250, [GLASS]),

  // ================= Gym-style Indian meals =================
  r('soya-chunks-dry', 'Soya chunks dry masala', ['soya fry', 'soya chunks bhuna', 'soya sukka'],
    [ing('soya-chunks', 100), ing('water', 200), ing('onion', 60), u('capsicum', 40), ing('tomato', 40), ing('oil', 12)], 400, [KATORI]),
  r('boiled-soya-chunks', 'Boiled soya chunks (plain)', ['boiled soya', 'soya chunks boiled'],
    [ing('soya-chunks', 50), ing('water', 120)], 150, [KATORI]),
  r('soya-salad', 'Soya chunks salad', ['soya chaat', 'soya salad'],
    [ing('soya-chunks', 50), ing('water', 100), ing('onion', 30), ing('tomato', 30), u('cucumber', 30), u('lemonJuice', 5)], 230, [KATORI]),
  r('soya-bhurji', 'Soya bhurji (soya granules)', ['soya keema', 'soya granules bhurji'],
    [ing('soya-chunks', 60), ing('water', 130), ing('onion', 50), ing('tomato', 50), u('peas', 20), ing('oil', 10)], 290, [KATORI]),
  r('grilled-paneer', 'Grilled paneer (low oil)', ['paneer grill', 'tawa paneer', 'air fryer paneer', 'paneer steak'],
    [ing('paneer', 150), ing('curd', 30), ing('oil', 4), u('capsicum', 30), ing('onion', 30)], 220, [KATORI]),
  r('tofu-bhurji', 'Tofu bhurji', ['scrambled tofu', 'tofu bhurji'],
    [u('tofu', 200), ing('onion', 50), ing('tomato', 50), u('capsicum', 30), ing('oil', 8)], 300, [KATORI]),
  r('sprouts-bowl', 'Sprouts bowl (moong, chana, paneer)', ['protein sprouts bowl', 'sprouts paneer bowl', 'gym sprouts'],
    [...sprouts(100), ...boiledChana(60), ing('paneer', 50), ing('onion', 25), ing('tomato', 25), u('cucumber', 25), u('lemonJuice', 5)], 285,
    [piece('1 bowl', 285)]),
  r('rajma-chana-bowl', 'Rajma chana protein bowl', ['bean bowl', 'protein bean bowl'],
    [ing('rajma', 40), ing('chana', 40), ing('water', 120), ing('onion', 30), ing('tomato', 30), u('sweetCorn', 30), u('lemonJuice', 5), ing('oil', 4)], 285,
    [piece('1 bowl', 285)]),
  r('curd-banana', 'Curd with banana', ['dahi kela', 'banana curd', 'curd fruit bowl'],
    [ing('curd', 150), u('banana', 80)], 230, [piece('1 bowl', 230)]),
  r('curd-fruit-bowl', 'Curd with mixed fruit', ['dahi fruit', 'yogurt fruit bowl', 'curd and fruits'],
    [ing('curd', 150), u('apple', 50), u('banana', 40), u('pomegranate', 30)], 270, [piece('1 bowl', 270)]),
  r('curd-honey', 'Curd with honey', ['dahi shahad', 'yogurt with honey'],
    [ing('curd', 150), u('honey', 10)], 160, [piece('1 bowl', 160)]),
  r('dahi-sugar', 'Dahi with sugar', ['meetha dahi', 'dahi cheeni', 'curd with sugar'],
    [ing('curd', 150), ing('sugar', 10)], 160, [piece('1 bowl', 160)]),
  r('low-fat-curd-oats', 'Curd oats bowl', ['dahi oats', 'curd oats', 'yogurt oats'],
    [u('lowFatCurd', 150), u('oats', 30), u('banana', 50)], 230, [piece('1 bowl', 230)]),
  r('greek-yogurt-fruit', 'Greek yogurt with fruit', ['hung curd fruit', 'greek yogurt bowl'],
    [u('greekYogurt', 150), u('banana', 50), u('strawberry', 40), u('honey', 8)], 248, [piece('1 bowl', 248)]),
  r('banana-peanut-butter', 'Banana with peanut butter', ['banana pb', 'pre workout banana'],
    [u('banana', 120), u('peanutButter', 16)], 136, [piece('1 banana + 1 tbsp', 136)]),
  r('boiled-sweet-potato', 'Boiled sweet potato', ['ubli shakarkandi', 'boiled shakarkand', 'sweet potato'],
    [u('sweetPotato', 200), ing('water', 10)], 200, [piece('1 medium', 150)]),
  r('paneer-wrap', 'Paneer wrap (whole wheat)', ['paneer roti wrap', 'atta paneer roll', 'gym paneer wrap'],
    [ing('atta', 50), ing('water', 28), ing('paneer', 80), ing('onion', 25), u('capsicum', 20), ing('curd', 20), ing('oil', 4)], 215, [piece('1 wrap', 215)]),
  r('soya-wrap', 'Soya chunks wrap (whole wheat)', ['soya roll', 'soya frankie'],
    [ing('atta', 50), ing('water', 28), ing('soya-chunks', 30), ing('water', 60), ing('onion', 25), u('capsicum', 20), ing('curd', 20), ing('oil', 6)], 225,
    [piece('1 wrap', 225)]),
  r('paneer-rice-bowl', 'Paneer rice bowl (gym)', ['paneer bowl', 'paneer rice bowl'],
    [ing('rice', 60), ing('water', 150), ing('paneer', 100), ing('onion', 30), u('capsicum', 30), ing('tomato', 30), ing('oil', 6)], 380, [piece('1 bowl', 380)]),
  r('moong-sprouts-cheela', 'Moong sprouts chilla', ['sprouts chilla', 'sprouts dosa', 'pesarattu style chilla'],
    [...sprouts(100), ing('besan', 20), ing('water', 40), ing('onion', 20), ing('oil', 6)], 160, [piece('1 chilla', 80)]),
  r('besan-paneer-chilla', 'Paneer stuffed besan chilla', ['paneer chilla', 'paneer cheela'],
    [ing('besan', 40), ing('water', 50), ing('paneer', 40), ing('onion', 20), ing('tomato', 20), ing('oil', 6)], 155, [piece('1 chilla', 155)]),
  r('poha-sprouts', 'Sprouts poha', ['moong sprouts poha', 'protein poha'],
    [ing('poha', 50), ...sprouts(50), ing('oil', 6), ing('onion', 30), ing('peanuts', 8), ing('water', 60)], 190, [piece('1 plate', 190)]),
]
