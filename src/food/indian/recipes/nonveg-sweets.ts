// Non-vegetarian dishes and Indian sweets/desserts from every region.
// Written by a recipe worker; see docs/indian-food-database.md.
//
// Conventions used here:
// - Meat and fish weights are edible raw weight (no bones). Bone-in dishes
//   give portions as the edible part.
// - Deep-fried items list only the oil absorbed; syrup-soaked sweets list
//   only the syrup absorbed (sugar and water).
// - Chhena (fresh Bengali cheese) is modelled as paneer, which is the same
//   curd, pressed a little more.
// - Heavily reduced milk (rabri, basundi, kulfi) starts from evaporated milk,
//   which is whole milk already reduced to about half.

import { CUP, KATORI, PLATE, ing, piece, r, usdaIng, type IndianRecipe } from '../define'

// --- Ingredient shorthands (USDA SR Legacy fdc_ids, checked against the table) ---
const n = (key: string) => (g: number) => ing(key, g)
const u = (id: number) => (g: number) => usdaIng(id, g)

// catalogue
const chicken = n('chicken') // meat only, curry cut without bones
const egg = n('egg')
const curd = n('curd')
const milk = n('milk')
const ghee = n('ghee')
const oil = n('oil')
const onion = n('onion')
const tomato = n('tomato')
const potato = n('potato')
const carrot = n('carrot')
const spinach = n('spinach')
const sugar = n('sugar')
const jaggery = n('jaggery')
const khoya = n('khoya')
const water = n('water')
const rice = n('rice')
const atta = n('atta')
const sooji = n('sooji')
const besan = n('besan')
const paneer = n('paneer') // also stands for chhena
const peanuts = n('peanuts')
const vermicelli = n('vermicelli')
const makhana = n('makhana')
const ragi = n('ragi-flour')
const moongDal = n('moong-dal')
const uradDal = n('urad-dal')
const chanaDal = n('chana') // chickpeas: same seed as chana dal, near-identical macros
const roseSyrup = n('rose-syrup')
const gond = n('nonveg-sweets-gond')
const schezwan = n('schezwan-sauce')

// meat
const breast = u(171077) // Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw
const legMeat = u(173619) // Chicken, broilers or fryers, leg, meat only, raw
const wingSkin = u(172390) // Chicken, broilers or fryers, wing, meat and skin, raw
const chickenMince = u(171116) // Chicken, ground, raw
const chickenLiver = u(171060) // Chicken, liver, all classes, raw
const goat = u(175303) // Game meat, goat, raw (Indian "mutton")
const lambMince = u(174370) // Lamb, ground, raw (fatty keema for kebabs)
const lambShoulder = u(172553) // Lamb, shoulder, whole, lean and fat, 1/8" fat, raw
const lambLiver = u(172531) // Lamb, variety meats, liver, raw
const lambBrain = u(172525) // Lamb, variety meats, brain, raw
const porkShoulder = u(167843) // Pork, fresh, shoulder, whole, lean and fat, raw
const porkBelly = u(167812) // Pork, fresh, belly, raw
const beef = u(171206) // Beef, chuck for stew, lean and fat, all grades, raw
const duck = u(172410) // Duck, domesticated, meat only, raw

// fish and seafood (closest USDA species)
const rohu = u(171952) // Fish, carp, raw (rohu and katla are carps)
const hilsa = u(173696) // Fish, shad, american, raw (hilsa is a shad)
const pomfret = u(173682) // Fish, pompano, florida, raw
const surmai = u(175122) // Fish, mackerel, king, raw (seer fish / kingfish)
const bangda = u(173673) // Fish, mackerel, spanish, raw (Indian mackerel)
const sardine = u(175116) // Fish, herring, Atlantic, raw (oil sardine, same family)
const basa = u(174186) // Fish, catfish, channel, wild, raw (basa is a catfish)
const tilapia = u(175176) // Fish, tilapia, raw
const salmon = u(175167) // Fish, salmon, Atlantic, farmed, raw
const anchovy = u(174182) // Fish, anchovy, european, raw (natholi / kozhuva)
const prawn = u(175179) // Crustaceans, shrimp, raw
const crab = u(174204) // Crustaceans, crab, blue, raw
const squid = u(174223) // Mollusks, squid, mixed species, raw
const clam = u(174214) // Mollusks, clam, mixed species, raw

// dairy
const cream = u(170859) // Cream, fluid, heavy whipping
const freshCream = u(170858) // Cream, fluid, light whipping (Indian "fresh cream" ~25-30%)
const butter = u(173410) // Butter, salted
const evapMilk = u(171276) // Milk, canned, evaporated (whole milk reduced to ~half)
const condMilk = u(171275) // Milk, canned, condensed, sweetened
const milkPowder = u(170876) // Milk, dry, whole
const greekCurd = u(171304) // Yogurt, Greek, plain, whole milk (hung curd / chakka)
const cheese = u(171290) // Cheese, pasteurized process, American (processed cheese)
const iceCreamVanilla = u(167575)
const iceCreamChoc = u(168809)
const iceCreamStrawberry = u(168810)
const eggWhite = u(172183)

// nuts, seeds, fruit
const cashew = u(170162)
const almond = u(170567)
const pista = u(170184)
const walnut = u(170187)
const raisin = u(168165)
const coconut = u(170169) // fresh grated coconut
const dryCoconut = u(170170) // desiccated
const coconutMilk = u(170172) // raw, expressed from grated meat
const sesame = u(170150)
const poppy = u(171330)
const chia = u(170554) // stands for sabja (basil seeds) in falooda
const dates = u(171726)
const figs = u(174665)
const apricot = u(173941)
const mango = u(169910)
const banana = u(173944)
const jackfruit = u(174687)
const puffedRice = u(173912) // murmura
const cocoa = u(169593)

// flours, starches, sweeteners
const maida = u(169761) // Wheat flour, white, all-purpose, unenriched
const riceFlour = u(169714)
const cornstarch = u(169698)
const sago = u(169717) // Tapioca, pearl, dry (sabudana)
const bulgur = u(170688) // daliya / broken wheat
const noodles = u(168927) // Pasta, dry (hakka noodles)
const bread = u(174924) // white bread
const powderedSugar = u(169656)
const cornSyrup = u(168837) // liquid glucose
const coneWafer = u(175000)

// vegetables and sauces
const peas = u(170016)
const capsicum = u(170427)
const cabbage = u(169975)
const garlic = u(169230)
const ginger = u(169231)
const greenChilli = u(170497)
const lettuce = u(169247)
const cucumber = u(168409)
const beans = u(169961)
const broccoli = u(170379)
const corn = u(169998)
const mushroom = u(169251)
const lemon = u(167747)
const lauki = u(169232) // bottle gourd
const ashGourd = u(170069) // waxgourd (petha)
const bambooShoot = u(169210)
const soy = u(174277)
const ketchup = u(168556)
const chilliSauce = u(171186)
const vinegar = u(172237)
const mayo = u(171009)
const mustardSeed = u(170929)
const coconutOil = u(171412)
const mustardOil = u(172337)

/** Ginger-garlic paste. */
const gg = (g: number) => [garlic(g / 2), ginger(g / 2)]

const BIRYANI_PLATE = piece('1 restaurant plate (400 g)', 400)
const ROLL = (g: number) => piece(`1 roll (${g} g)`, g)

// ------------------------------------------------------------------ CHICKEN
const CHICKEN: IndianRecipe[] = [
  r('butter-chicken-restaurant', 'Butter chicken (restaurant style)', ['murgh makhani', 'butter chicken', 'chicken makhanwala', 'makhani chicken'],
    [chicken(500), curd(100), oil(35), butter(130), cream(180), tomato(600), cashew(50), sugar(12), ...gg(20)], 1180, [KATORI]),
  r('butter-chicken-home', 'Butter chicken (home style, less butter and cream)', ['ghar ka butter chicken', 'murgh makhani home'],
    [chicken(500), curd(100), oil(15), butter(30), cream(50), tomato(600), cashew(20), sugar(8), ...gg(20)], 1050, [KATORI]),
  r('chicken-tikka', 'Chicken tikka (boneless)', ['murgh tikka', 'tandoori chicken tikka', 'chicken tikka kebab'],
    [chicken(500), curd(100), oil(15), lemon(15), ...gg(20)], 470, [piece('6 pieces (180 g)', 180), piece('1 piece (30 g)', 30)]),
  r('chicken-tikka-masala', 'Chicken tikka masala', ['murgh tikka masala', 'tikka masala'],
    [chicken(500), curd(80), oil(35), onion(150), tomato(300), freshCream(60), butter(30), ...gg(20), water(100)], 950, [KATORI]),
  r('tandoori-chicken', 'Tandoori chicken (bone-in, skinless)', ['tandoori murgh', 'tandoori chicken half', 'tandoori leg'],
    [legMeat(600), curd(120), oil(15), butter(15), lemon(15), ...gg(20)], 560,
    [piece('Half tandoori chicken, edible part (220 g)', 220), piece('1 leg piece, edible part (100 g)', 100)]),
  r('tangdi-kebab', 'Tangdi kebab (chicken drumstick)', ['murgh tangdi', 'chicken leg kebab', 'malai tangdi'],
    [legMeat(500), curd(80), freshCream(50), cashew(20), butter(20), ...gg(20)], 520, [piece('1 drumstick, edible part (70 g)', 70)]),
  r('chicken-malai-tikka', 'Chicken malai tikka', ['murgh malai tikka', 'malai kebab', 'cream chicken tikka'],
    [breast(500), curd(50), freshCream(80), cheese(30), cashew(30), butter(20), ...gg(20)], 540, [piece('6 pieces (180 g)', 180)]),
  r('chicken-reshmi-kebab', 'Reshmi kebab (chicken)', ['reshmi tikka', 'murgh reshmi kebab'],
    [breast(500), curd(60), freshCream(60), egg(50), cashew(30), butter(20), ...gg(20)], 550, [piece('6 pieces (180 g)', 180)]),
  r('chicken-afghani', 'Afghani chicken', ['murgh afghani', 'afghani tikka', 'chicken afghani gravy'],
    [chicken(500), curd(100), freshCream(100), cashew(40), butter(30), oil(10), ...gg(20)], 620, [KATORI]),
  r('chicken-hariyali-tikka', 'Hariyali chicken tikka', ['green chicken tikka', 'murgh hariyali'],
    [chicken(500), curd(100), spinach(50), oil(20), ...gg(20)], 520, [piece('6 pieces (180 g)', 180)]),
  r('chicken-seekh-kebab', 'Chicken seekh kebab', ['murgh seekh', 'chicken sheek kabab'],
    [chickenMince(500), onion(60), butter(15), oil(10), ...gg(20)], 470, [piece('1 seekh (50 g)', 50)]),
  r('chicken-curry-restaurant', 'Chicken curry (restaurant / dhaba style)', ['dhaba chicken', 'chicken masala restaurant', 'murgh masala', 'chicken gravy'],
    [chicken(500), onion(200), tomato(200), oil(90), butter(25), freshCream(30), ...gg(30), water(200)], 950, [KATORI]),
  r('chicken-kadai', 'Kadai chicken', ['kadhai murgh', 'karahi chicken', 'chicken kadhai'],
    [chicken(500), onion(150), tomato(250), capsicum(150), oil(45), ...gg(20), water(100)], 920, [KATORI]),
  r('chicken-handi', 'Chicken handi', ['handi chicken', 'murgh handi'],
    [chicken(500), onion(150), tomato(200), curd(100), oil(50), freshCream(40), ...gg(20), water(150)], 940, [KATORI]),
  r('chicken-do-pyaza', 'Chicken do pyaza', ['murgh do pyaza', 'chicken dopiaza'],
    [chicken(500), onion(350), tomato(150), oil(50), curd(50), ...gg(20), water(100)], 920, [KATORI]),
  r('chicken-korma', 'Chicken korma (Mughlai)', ['murgh korma', 'shahi chicken korma', 'chicken qorma'],
    [chicken(500), onion(200), curd(150), cashew(40), freshCream(50), ghee(50), ...gg(20), water(150)], 900, [KATORI]),
  r('palak-chicken', 'Palak chicken', ['saag chicken', 'chicken saagwala', 'spinach chicken'],
    [chicken(500), spinach(400), onion(100), tomato(100), oil(35), freshCream(20), ...gg(20)], 950, [KATORI]),
  r('chicken-chettinad', 'Chicken Chettinad', ['chettinad chicken curry', 'kozhi chettinad'],
    [chicken(500), onion(200), tomato(100), coconut(50), oil(45), ...gg(20), water(250)], 900, [KATORI]),
  r('kerala-chicken-roast', 'Kerala chicken roast', ['nadan chicken roast', 'kozhi roast', 'chicken ularthiyathu'],
    [chicken(500), onion(300), tomato(100), coconutOil(50), ...gg(30), water(50)], 720, [KATORI]),
  r('kerala-chicken-stew', 'Kerala chicken stew (coconut milk)', ['chicken ishtu', 'kozhi stew'],
    [chicken(500), coconutMilk(300), potato(150), onion(100), coconutOil(20), ...gg(20), water(200)], 1150, [KATORI]),
  r('andhra-chicken-curry', 'Andhra chilli chicken curry', ['andhra chicken', 'kodi kura', 'guntur chicken', 'andhra chilli chicken'],
    [chicken(500), onion(150), greenChilli(30), tomato(80), oil(55), ...gg(20), water(100)], 720, [KATORI]),
  r('chicken-ghee-roast', 'Mangalorean chicken ghee roast', ['ghee roast chicken', 'kori ghee roast'],
    [chicken(500), ghee(80), curd(50), lemon(15), ...gg(20)], 520, [KATORI]),
  r('chicken-sukka', 'Chicken sukka', ['kori sukka', 'chicken sukha', 'kongu chicken fry'],
    [chicken(500), coconut(100), onion(120), ghee(20), oil(15), ...gg(20)], 620, [KATORI]),
  r('chicken-xacuti', 'Chicken xacuti (Goan)', ['xacuti', 'shagoti chicken'],
    [chicken(500), coconut(100), onion(120), oil(35), ...gg(20), water(300)], 900, [KATORI]),
  r('chicken-cafreal', 'Chicken cafreal (Goan)', ['cafreal', 'galinha cafreal'],
    [chicken(500), onion(50), oil(40), vinegar(20), lemon(15), ...gg(20)], 500, [KATORI]),
  r('chicken-vindaloo', 'Chicken vindaloo', ['vindaloo chicken', 'chicken vindalho'],
    [chicken(500), onion(150), tomato(50), vinegar(40), oil(45), ...gg(30), water(150)], 780, [KATORI]),
  r('chicken-kosha', 'Kosha murgi (Bengali chicken)', ['murgir kosha', 'chicken kosha', 'bengali chicken curry'],
    [chicken(500), onion(200), potato(150), curd(50), mustardOil(50), ...gg(20), water(100)], 840, [KATORI]),
  r('chicken-keema', 'Chicken keema', ['keema murgh', 'chicken mince curry', 'chicken kheema'],
    [chickenMince(500), onion(150), tomato(150), peas(100), oil(30), ...gg(20)], 780, [KATORI]),
  r('chicken-liver-fry', 'Chicken liver fry', ['kaleji chicken', 'chicken kaleji masala'],
    [chickenLiver(500), onion(150), tomato(80), oil(35), ...gg(20)], 560, [KATORI]),
  r('chicken-65', 'Chicken 65', ['chicken sixty five', 'chicken 65 dry'],
    [chicken(500), curd(30), egg(50), cornstarch(30), riceFlour(20), oil(60), ...gg(20)], 540, [piece('1 plate (200 g)', 200)]),
  r('chicken-pakora', 'Chicken pakora', ['chicken pakoda', 'fried chicken pakode'],
    [chicken(400), besan(100), riceFlour(20), water(80), oil(70), ...gg(20)], 560, [piece('1 plate (150 g)', 150)]),
  r('chicken-lollipop', 'Chicken lollipop', ['lollipop chicken', 'drums of heaven'],
    [wingSkin(500), cornstarch(40), maida(20), egg(30), oil(70), ...gg(20), soy(10)], 560, [piece('1 lollipop, edible part (40 g)', 40)]),
  r('chilli-chicken-dry', 'Chilli chicken (dry)', ['chilli chicken', 'chicken chilli dry', 'dragon chicken'],
    [chicken(500), cornstarch(40), maida(20), egg(50), oil(75), onion(100), capsicum(100), soy(20), chilliSauce(20), ketchup(20), ...gg(20)], 780, [piece('1 plate (200 g)', 200)]),
  r('chilli-chicken-gravy', 'Chilli chicken (gravy)', ['chicken chilli gravy', 'gravy chilli chicken'],
    [chicken(500), cornstarch(55), maida(20), egg(50), oil(75), onion(100), capsicum(100), soy(25), chilliSauce(25), ketchup(25), ...gg(20), water(350)], 1120, [KATORI]),
  r('chicken-manchurian', 'Chicken manchurian (gravy)', ['manchurian chicken'],
    [chicken(400), cornstarch(60), maida(30), egg(50), oil(70), onion(80), capsicum(60), soy(25), ketchup(20), chilliSauce(15), ...gg(20), water(350)], 1050, [KATORI]),
  r('chicken-fried-rice', 'Chicken fried rice', ['chicken fried rice indo chinese', 'chicken rice chinese'],
    [rice(200), water(420), chicken(150), egg(50), oil(40), onion(50), cabbage(50), capsicum(40), carrot(40), soy(15)], 1000, [PLATE]),
  r('chicken-schezwan-fried-rice', 'Chicken schezwan fried rice', ['schezwan chicken rice', 'szechuan chicken fried rice'],
    [rice(200), water(420), chicken(150), egg(50), oil(45), onion(50), cabbage(50), capsicum(40), carrot(40), soy(10), schezwan(40)], 1040, [PLATE]),
  r('egg-fried-rice', 'Egg fried rice', ['anda fried rice', 'egg rice chinese'],
    [rice(200), water(420), egg(150), oil(40), onion(50), cabbage(50), capsicum(40), carrot(40), soy(15)], 1000, [PLATE]),
  r('chicken-hakka-noodles', 'Chicken hakka noodles', ['chicken chowmein', 'chicken noodles', 'chicken chow mein'],
    [noodles(200), water(280), chicken(150), oil(40), onion(60), cabbage(80), capsicum(40), carrot(40), soy(20), chilliSauce(10)], 880, [PLATE]),
  r('egg-hakka-noodles', 'Egg hakka noodles', ['egg chowmein', 'egg noodles', 'anda noodles'],
    [noodles(200), water(280), egg(150), oil(40), onion(60), cabbage(80), capsicum(40), carrot(40), soy(20), chilliSauce(10)], 880, [PLATE]),
  r('chicken-schezwan-noodles', 'Chicken schezwan noodles', ['schezwan chicken noodles', 'szechuan noodles chicken'],
    [noodles(200), water(280), chicken(150), oil(50), onion(60), cabbage(80), capsicum(40), carrot(40), soy(10), schezwan(50)], 920, [PLATE]),
  r('chicken-sweet-corn-soup', 'Chicken sweet corn soup', ['chicken corn soup'],
    [chicken(100), corn(150), cornstarch(20), egg(30), oil(5), water(700)], 900, [CUP, KATORI]),
  r('chicken-manchow-soup', 'Chicken manchow soup', ['manchow soup chicken', 'chicken hot and sour soup'],
    [chicken(100), cabbage(60), carrot(40), capsicum(30), cornstarch(20), soy(20), oil(25), water(700), noodles(30)], 880, [CUP, KATORI]),
  r('chicken-momos-steamed', 'Chicken momos (steamed)', ['chicken momo', 'chicken dumplings', 'steam momos chicken'],
    [maida(150), water(80), chickenMince(200), onion(60), cabbage(50), oil(10), ...gg(10)], 540, [piece('1 momo (25 g)', 25), piece('1 plate, 6 momos (150 g)', 150)]),
  r('chicken-momos-fried', 'Chicken momos (fried)', ['fried chicken momo', 'chicken fry momos'],
    [maida(150), water(80), chickenMince(200), onion(60), cabbage(50), oil(65), ...gg(10)], 540, [piece('1 momo (25 g)', 25), piece('1 plate, 6 momos (150 g)', 150)]),
  r('chicken-momos-tandoori', 'Tandoori chicken momos', ['tandoori momos chicken', 'afghani momos'],
    [maida(150), water(80), chickenMince(200), onion(60), cabbage(50), oil(25), curd(60), freshCream(20), ...gg(10)], 600, [piece('1 plate, 6 momos (170 g)', 170)]),
  r('chicken-kathi-roll', 'Chicken kathi roll', ['chicken roll', 'chicken frankie', 'chicken tikka roll', 'kolkata chicken roll'],
    [maida(70), water(35), oil(15), chicken(100), curd(15), oil(5), onion(30), ketchup(10)], 240, [ROLL(240)]),
  r('chicken-egg-roll', 'Chicken egg roll (Kolkata)', ['egg chicken roll', 'double egg chicken roll'],
    [maida(70), water(35), oil(18), egg(50), chicken(100), curd(15), oil(5), onion(30), ketchup(10)], 285, [ROLL(285)]),
  r('egg-roll', 'Egg roll (Kolkata street style)', ['anda roll', 'egg kathi roll', 'egg frankie'],
    [maida(70), water(35), oil(18), egg(50), onion(30), ketchup(10), lemon(5)], 185, [ROLL(185)]),
  r('chicken-shawarma', 'Chicken shawarma (Indian style)', ['chicken shawarma roll', 'shawarma'],
    [maida(60), water(30), oil(5), chicken(100), curd(20), oil(8), mayo(20), garlic(5), cabbage(30), cucumber(20), tomato(20)], 270, [ROLL(270)]),
  r('chicken-biryani-home', 'Chicken biryani (home style)', ['chicken biryani', 'murgh biryani', 'biryani'],
    [rice(500), water(850), chicken(600), curd(200), onion(300), oil(80), ghee(30), tomato(100), ...gg(30)], 2300, [PLATE, BIRYANI_PLATE]),
  r('chicken-biryani-hyderabadi', 'Hyderabadi chicken dum biryani (restaurant)', ['hyderabadi biryani', 'kacchi biryani chicken', 'chicken dum biryani'],
    [rice(500), water(850), chicken(600), curd(200), onion(300), oil(80), ghee(70), milk(50), ...gg(30)], 2250, [PLATE, BIRYANI_PLATE]),
  r('chicken-biryani-lucknowi', 'Lucknowi (Awadhi) chicken biryani', ['awadhi biryani', 'lucknowi biryani', 'pakki biryani chicken'],
    [rice(500), water(850), chicken(600), curd(150), onion(200), ghee(100), milk(80), freshCream(30), ...gg(30)], 2250, [PLATE, BIRYANI_PLATE]),
  r('chicken-biryani-kolkata', 'Kolkata chicken biryani (with aloo and egg)', ['kolkata biryani', 'calcutta biryani'],
    [rice(500), water(850), chicken(500), potato(250), egg(100), curd(150), onion(200), ghee(60), oil(50), ...gg(30)], 2400, [PLATE, BIRYANI_PLATE]),
  r('chicken-biryani-malabar', 'Malabar / Thalassery chicken biryani', ['thalassery biryani', 'malabar biryani', 'kozhikode biryani'],
    [rice(500), water(800), chicken(600), onion(350), tomato(100), curd(80), ghee(100), cashew(30), raisin(20), ...gg(40)], 2300, [PLATE, BIRYANI_PLATE]),
  r('chicken-biryani-ambur', 'Ambur chicken biryani', ['ambur biryani', 'arcot biryani'],
    [rice(500), water(900), chicken(600), onion(200), tomato(150), curd(100), oil(90), ...gg(40)], 2350, [PLATE, BIRYANI_PLATE]),
  r('chicken-biryani-dindigul', 'Dindigul / Donne chicken biryani', ['dindigul biryani', 'donne biryani', 'bangalore military biryani'],
    [rice(500), water(900), chicken(600), onion(200), tomato(100), curd(100), spinach(50), ghee(40), oil(60), ...gg(40)], 2350, [PLATE, BIRYANI_PLATE]),
  r('chicken-pulao', 'Chicken pulao (yakhni pulao)', ['murgh pulao', 'chicken yakhni pulao'],
    [rice(400), water(700), chicken(400), onion(150), curd(80), ghee(40), oil(20), ...gg(20)], 1650, [PLATE]),
  r('chicken-tehri', 'Chicken tehri', ['murgh tahari', 'chicken tahri'],
    [rice(400), water(800), chicken(350), potato(200), peas(80), onion(150), oil(50), tomato(100)], 1950, [PLATE]),
]

// ------------------------------------------------------------------ MUTTON, GOAT, OTHER MEAT
const MUTTON: IndianRecipe[] = [
  r('mutton-curry', 'Mutton curry (home style)', ['mutton masala', 'gosht curry', 'bakre ka meat', 'goat curry'],
    [goat(500), onion(200), tomato(150), curd(50), oil(50), ...gg(30), water(350)], 850, [KATORI]),
  r('mutton-curry-restaurant', 'Mutton curry (restaurant / dhaba style)', ['dhaba mutton', 'mutton masala restaurant', 'gosht masala'],
    [goat(500), onion(250), tomato(150), curd(80), oil(80), ghee(30), freshCream(20), ...gg(30), water(350)], 950, [KATORI]),
  r('rogan-josh', 'Mutton rogan josh', ['roghan josh', 'kashmiri rogan josh', 'lamb rogan josh'],
    [goat(500), curd(150), oil(40), ghee(30), onion(60), ...gg(10), water(350)], 820, [KATORI]),
  r('mutton-keema', 'Mutton keema', ['keema', 'kheema', 'qeema', 'mutton mince curry'],
    [goat(500), onion(150), tomato(150), oil(45), ...gg(20), water(80)], 720, [KATORI]),
  r('keema-matar', 'Keema matar', ['kheema mutter', 'mutton keema peas'],
    [goat(400), peas(200), onion(150), tomato(150), oil(45), ...gg(20), water(100)], 820, [KATORI]),
  r('nihari', 'Mutton nihari', ['nalli nihari', 'nihari gosht'],
    [goat(600), ghee(120), atta(30), onion(100), ...gg(30), water(800)], 1300, [KATORI]),
  r('laal-maas', 'Laal maas (Rajasthani)', ['lal maas', 'rajasthani mutton'],
    [goat(500), curd(150), ghee(80), onion(150), garlic(20), water(300)], 820, [KATORI]),
  r('safed-maas', 'Safed maas (Rajasthani white mutton)', ['safed mas', 'white mutton curry'],
    [goat(500), curd(150), cashew(40), almond(20), freshCream(60), ghee(60), water(250)], 820, [KATORI]),
  r('kosha-mangsho', 'Kosha mangsho (Bengali mutton)', ['kosha mangsho', 'mutton kosha', 'bengali mutton curry'],
    [goat(500), onion(250), curd(100), potato(150), mustardOil(70), sugar(5), ...gg(30), water(150)], 880, [KATORI]),
  r('mutton-korma', 'Mutton korma', ['gosht korma', 'shahi mutton korma', 'mutton qorma'],
    [goat(500), onion(250), curd(150), cashew(30), ghee(70), ...gg(30), water(300)], 900, [KATORI]),
  r('mutton-bhuna', 'Bhuna gosht', ['mutton bhuna', 'bhuna mutton'],
    [goat(500), onion(250), tomato(150), oil(55), ...gg(30), water(150)], 750, [KATORI]),
  r('mutton-chukka', 'Mutton chukka / sukka', ['mutton sukka', 'mutton chukka varuval', 'mutton fry'],
    [goat(500), onion(200), coconut(40), oil(50), ...gg(30), water(200)], 650, [KATORI]),
  r('mutton-pepper-fry', 'Kerala mutton pepper fry', ['mutton kurumulaku', 'mutton roast kerala'],
    [goat(500), onion(250), coconutOil(50), coconut(30), ...gg(30), water(200)], 680, [KATORI]),
  r('mutton-stew', 'Kerala mutton stew', ['mutton ishtu', 'mutton stew coconut milk'],
    [goat(500), coconutMilk(300), potato(150), onion(100), coconutOil(20), carrot(60), water(400)], 1200, [KATORI]),
  r('kashmiri-yakhni', 'Kashmiri mutton yakhni', ['yakhni', 'mutton yakhni curd gravy'],
    [goat(500), curd(300), ghee(40), onion(60), water(300)], 950, [KATORI]),
  r('gushtaba', 'Gushtaba (Kashmiri meatballs in curd)', ['goshtaba', 'gushtaba kashmiri'],
    [lambShoulder(500), curd(400), ghee(40), water(300)], 1050, [piece('2 balls with gravy (250 g)', 250)]),
  r('haleem', 'Mutton haleem', ['haleem', 'hyderabadi haleem', 'harees'],
    [goat(500), bulgur(150), chanaDal(30), moongDal(20), ghee(150), onion(150), oil(30), ...gg(30), water(1000)], 1600, [KATORI]),
  r('mutton-pulao', 'Mutton yakhni pulao', ['gosht pulao', 'mutton pulav'],
    [rice(400), water(700), goat(400), onion(150), curd(80), ghee(50), ...gg(20)], 1650, [PLATE]),
  r('mutton-biryani-home', 'Mutton biryani (home style)', ['mutton biryani', 'gosht biryani', 'goat biryani'],
    [rice(500), water(850), goat(600), curd(200), onion(300), oil(80), ghee(30), tomato(100), ...gg(30)], 2300, [PLATE, BIRYANI_PLATE]),
  r('mutton-biryani-hyderabadi', 'Hyderabadi mutton dum biryani (restaurant)', ['kacchi gosht biryani', 'hyderabadi mutton biryani'],
    [rice(500), water(850), goat(600), curd(200), onion(300), oil(80), ghee(80), milk(50), ...gg(30)], 2250, [PLATE, BIRYANI_PLATE]),
  r('mutton-biryani-lucknowi', 'Lucknowi (Awadhi) mutton biryani', ['awadhi mutton biryani', 'lucknowi gosht biryani'],
    [rice(500), water(850), goat(600), curd(150), onion(200), ghee(110), milk(80), ...gg(30)], 2250, [PLATE, BIRYANI_PLATE]),
  r('mutton-biryani-kolkata', 'Kolkata mutton biryani (with aloo and egg)', ['kolkata mutton biryani', 'calcutta mutton biryani'],
    [rice(500), water(850), goat(500), potato(250), egg(100), curd(150), onion(200), ghee(70), oil(50), ...gg(30)], 2400, [PLATE, BIRYANI_PLATE]),
  r('mutton-seekh-kebab', 'Mutton seekh kebab', ['seekh kebab', 'sheek kabab', 'mutton sheekh'],
    [goat(300), lambMince(200), onion(60), butter(10), ...gg(20)], 440, [piece('1 seekh (50 g)', 50)]),
  r('galouti-kebab', 'Galouti kebab', ['galawati kebab', 'galouti', 'kakori kebab'],
    [goat(250), lambMince(250), ghee(40), besan(20), onion(40), ...gg(20)], 500, [piece('1 kebab (40 g)', 40)]),
  r('shami-kebab', 'Shami kebab (mutton)', ['shaami kabab', 'mutton shami'],
    [goat(500), chanaDal(100), egg(50), onion(60), oil(50), ...gg(20), water(150)], 700, [piece('1 kebab (50 g)', 50)]),
  r('boti-kebab', 'Mutton boti kebab', ['boti kabab', 'mutton tikka'],
    [goat(500), curd(80), oil(25), lemon(15), ...gg(20)], 440, [piece('6 pieces (150 g)', 150)]),
  r('chapli-kebab', 'Chapli kebab', ['chappal kebab', 'peshawari chapli kabab'],
    [lambMince(500), onion(80), tomato(60), egg(50), besan(20), oil(40)], 600, [piece('1 kebab (90 g)', 90)]),
  r('mutton-kaleji', 'Mutton kaleji fry (liver)', ['kaleji', 'liver fry', 'kaleji masala'],
    [lambLiver(500), onion(150), tomato(80), oil(40), ...gg(20)], 560, [KATORI]),
  r('bheja-fry', 'Bheja fry (goat brain)', ['bheja masala', 'brain fry'],
    [lambBrain(300), onion(100), tomato(100), oil(30), ...gg(10)], 420, [KATORI]),
  r('pork-vindaloo', 'Goan pork vindaloo', ['pork vindaloo', 'vindalho', 'goan vindaloo'],
    [porkShoulder(500), onion(150), vinegar(50), oil(30), ...gg(30), water(150)], 750, [KATORI]),
  r('pork-sorpotel', 'Pork sorpotel (Goan)', ['sorpotel', 'sarapatel'],
    [porkShoulder(400), lambLiver(100), onion(150), vinegar(50), oil(30), ...gg(30), water(150)], 720, [KATORI]),
  r('pandi-curry', 'Coorg pandi curry (pork)', ['coorgi pork curry', 'pandi curry'],
    [porkBelly(150), porkShoulder(350), onion(150), ...gg(30), water(200)], 680, [KATORI]),
  r('pork-bamboo-shoot', 'Pork with bamboo shoot (Northeast)', ['naga pork', 'pork bamboo shoot curry', 'smoked pork northeast'],
    [porkShoulder(500), bambooShoot(200), onion(80), oil(10), ...gg(30), water(300)], 1000, [KATORI]),
  r('kerala-beef-fry', 'Kerala beef fry (ularthiyathu)', ['beef ularthiyathu', 'beef fry', 'beef roast kerala'],
    [beef(500), onion(200), coconut(50), coconutOil(50), ...gg(30), water(200)], 680, [KATORI]),
  r('beef-curry', 'Beef curry (Kerala / Goan)', ['beef masala', 'nadan beef curry'],
    [beef(500), onion(200), tomato(100), coconutOil(40), coconut(40), ...gg(30), water(400)], 1000, [KATORI]),
  r('kerala-duck-roast', 'Kerala duck roast', ['tharavu roast', 'duck curry'],
    [duck(500), onion(250), tomato(80), coconutOil(40), coconutMilk(150), ...gg(30), water(100)], 850, [KATORI]),
]

// ------------------------------------------------------------------ FISH AND SEAFOOD
const FISH: IndianRecipe[] = [
  r('macher-jhol', 'Macher jhol (Bengali fish curry)', ['maacher jhol', 'rohu fish curry', 'fish jhol', 'bengali fish curry'],
    [rohu(500), potato(150), tomato(60), mustardOil(45), water(450)], 1000, [KATORI]),
  r('macher-kalia', 'Macher kalia (rohu/katla)', ['fish kalia', 'rui macher kalia', 'katla kalia'],
    [rohu(500), onion(150), tomato(60), curd(50), mustardOil(60), ...gg(20), water(200)], 830, [KATORI]),
  r('doi-maach', 'Doi maach (fish in curd)', ['doi mach', 'dahi fish'],
    [rohu(500), curd(150), onion(80), mustardOil(45), water(100)], 760, [KATORI]),
  r('shorshe-ilish', 'Shorshe ilish (hilsa in mustard)', ['sorshe ilish', 'hilsa mustard curry', 'ilish bhapa'],
    [hilsa(500), mustardSeed(30), mustardOil(30), greenChilli(10), water(150)], 640, [piece('1 piece with gravy (120 g)', 120)]),
  r('fish-curry-north', 'Fish curry (North Indian home style)', ['machli curry', 'fish masala curry', 'machhli ka salan'],
    [rohu(500), onion(150), tomato(150), curd(50), oil(40), ...gg(20), water(300)], 950, [KATORI]),
  r('goan-fish-curry', 'Goan fish curry (coconut)', ['goan fish curry', 'xitt kodi', 'kingfish curry goan'],
    [surmai(500), coconut(150), onion(60), oil(20), ...gg(10), water(400)], 1050, [KATORI]),
  r('kerala-meen-curry', 'Kerala meen curry (red fish curry)', ['meen curry', 'kudampuli fish curry', 'nadan meen curry'],
    [sardine(500), onion(100), tomato(50), coconutOil(40), ...gg(20), water(300)], 900, [KATORI]),
  r('fish-molee', 'Kerala fish molee', ['meen molee', 'fish moilee', 'fish moly'],
    [surmai(500), coconutMilk(350), onion(100), tomato(50), coconutOil(25), ...gg(20), water(150)], 1100, [KATORI]),
  r('meen-kuzhambu', 'Meen kuzhambu (Tamil fish curry)', ['fish kuzhambu', 'chettinad fish curry', 'meen kulambu'],
    [bangda(500), onion(100), tomato(100), oil(40), coconut(40), water(400)], 1050, [KATORI]),
  r('chepala-pulusu', 'Chepala pulusu (Andhra fish curry)', ['andhra fish curry', 'fish pulusu'],
    [rohu(500), onion(120), tomato(80), oil(50), water(350)], 960, [KATORI]),
  r('malvani-fish-curry', 'Malvani fish curry', ['bangda curry', 'malvani bangda', 'konkani fish curry'],
    [bangda(500), coconut(120), onion(80), oil(30), water(400)], 1050, [KATORI]),
  r('fish-fry-tawa', 'Fish fry (tawa masala)', ['tawa fish fry', 'masala fish fry', 'machli fry'],
    [rohu(500), riceFlour(20), oil(40), lemon(10), ...gg(10)], 460, [piece('1 piece (80 g)', 80)]),
  r('rava-fish-fry', 'Rava fish fry (surmai)', ['surmai rava fry', 'rava fried fish', 'kingfish rava fry'],
    [surmai(500), sooji(60), oil(50), lemon(10), ...gg(10)], 520, [piece('1 piece (80 g)', 80)]),
  r('pomfret-fry', 'Pomfret fry', ['paplet fry', 'pomfret tawa fry', 'avoli fry'],
    [pomfret(500), riceFlour(20), oil(40), lemon(10)], 460, [piece('1 small pomfret, edible part (100 g)', 100)]),
  r('bangda-fry', 'Bangda fry (mackerel)', ['mackerel fry', 'ayala fry', 'bangude fry'],
    [bangda(500), riceFlour(20), oil(40)], 450, [piece('1 fish, edible part (80 g)', 80)]),
  r('mathi-fry', 'Mathi fry (sardine fry)', ['sardine fry', 'chaala fry', 'mathi varuthathu'],
    [sardine(500), riceFlour(20), coconutOil(40)], 450, [piece('2 sardines, edible part (70 g)', 70)]),
  r('natholi-fry', 'Anchovy fry (natholi / kozhuva)', ['natholi fry', 'nethili fry', 'kozhuva fry'],
    [anchovy(400), riceFlour(30), coconutOil(50)], 380, [KATORI]),
  r('amritsari-fish', 'Amritsari fish (batter fried)', ['amritsari machli', 'fish pakora', 'fish fingers indian'],
    [basa(500), besan(100), water(80), oil(70), lemon(10)], 650, [piece('1 plate (150 g)', 150)]),
  r('fish-tikka', 'Fish tikka', ['machli tikka', 'tandoori fish tikka'],
    [basa(500), curd(100), oil(20), besan(15), ...gg(10)], 480, [piece('6 pieces (150 g)', 150)]),
  r('tandoori-fish', 'Tandoori fish (pomfret)', ['tandoori pomfret', 'tandoori machli'],
    [pomfret(500), curd(80), oil(10), butter(15), lemon(10)], 470, [piece('1 pomfret, edible part (150 g)', 150)]),
  r('fish-cutlet', 'Fish cutlet / fish chop', ['macher chop', 'fish chop', 'kerala fish cutlet'],
    [tilapia(300), potato(200), onion(60), egg(50), sooji(50), oil(60)], 620, [piece('1 cutlet (60 g)', 60)]),
  r('fish-biryani', 'Fish biryani', ['meen biryani', 'machli biryani'],
    [rice(500), water(850), surmai(500), onion(250), tomato(100), curd(80), oil(80), ghee(30)], 2150, [PLATE]),
  r('grilled-fish', 'Grilled fish (basa, low oil)', ['grilled basa', 'fish grilled diet'],
    [basa(200), oil(5), lemon(10)], 160, [piece('1 fillet (150 g)', 150)]),
  r('grilled-salmon', 'Grilled salmon', ['salmon grilled'],
    [salmon(200), oil(5)], 160, [piece('1 fillet (150 g)', 150)]),
  r('prawn-masala', 'Prawn masala (chingri / jhinga)', ['prawn curry', 'jhinga masala', 'chemmeen curry', 'prawns gravy'],
    [prawn(500), onion(200), tomato(150), oil(45), ...gg(20), water(150)], 820, [KATORI]),
  r('chingri-malai-curry', 'Chingri malai curry (prawns in coconut milk)', ['chingri malaikari', 'prawn malai curry'],
    [prawn(500), coconutMilk(300), onion(100), mustardOil(30), ghee(10), sugar(5), water(50)], 880, [KATORI]),
  r('goan-prawn-curry', 'Goan prawn curry', ['prawn caldine', 'goan prawn curry rice', 'sungtache hooman'],
    [prawn(400), coconut(150), onion(60), oil(20), water(400)], 950, [KATORI]),
  r('prawn-fry', 'Prawn fry / chemmeen roast', ['chemmeen roast', 'prawn roast', 'jhinga fry', 'prawns sukka'],
    [prawn(500), onion(150), coconutOil(45), ...gg(20)], 520, [KATORI]),
  r('prawns-koliwada', 'Prawns koliwada (batter fried)', ['koliwada prawns', 'fried prawns'],
    [prawn(400), besan(60), riceFlour(20), water(50), oil(60), ...gg(10)], 480, [piece('1 plate (150 g)', 150)]),
  r('chilli-prawns', 'Chilli prawns (Indo-Chinese)', ['prawn chilli', 'chilli garlic prawns'],
    [prawn(400), cornstarch(40), oil(50), onion(80), capsicum(80), soy(20), chilliSauce(20), ...gg(20)], 620, [piece('1 plate (200 g)', 200)]),
  r('prawn-biryani', 'Prawn biryani', ['jhinga biryani', 'chemmeen biryani'],
    [rice(500), water(850), prawn(400), onion(250), tomato(100), curd(80), oil(80), ghee(30)], 2050, [PLATE]),
  r('crab-masala', 'Crab masala / crab curry', ['kekda masala', 'nandu masala', 'chettinad crab', 'crab curry'],
    [crab(400), onion(200), tomato(150), coconut(60), oil(45), ...gg(20), water(200)], 900, [KATORI]),
  r('crab-roast', 'Kerala crab roast', ['njandu roast', 'crab fry'],
    [crab(400), onion(200), coconutOil(45), ...gg(20), water(50)], 560, [KATORI]),
  r('squid-roast', 'Squid roast (koonthal)', ['koonthal roast', 'kanava roast', 'calamari fry'],
    [squid(400), onion(200), coconutOil(40), ...gg(20)], 480, [KATORI]),
  r('clams-sukka', 'Clams sukka (tisrya / kakka)', ['tisrya sukke', 'kakka irachi', 'clams masala'],
    [clam(400), coconut(100), onion(100), oil(25)], 520, [KATORI]),
]

// ------------------------------------------------------------------ EGGS
const EGGS: IndianRecipe[] = [
  r('boiled-egg', 'Boiled egg', ['anda', 'ubla anda', 'hard boiled egg', 'egg boiled'],
    [egg(50)], 50, [piece('1 egg (50 g)', 50)]),
  r('boiled-egg-white', 'Boiled egg white', ['egg white boiled', 'anda safedi'],
    [eggWhite(33)], 33, [piece('1 egg white (33 g)', 33)]),
  r('egg-curry', 'Egg curry (anda curry)', ['anda curry', 'egg masala', 'anda masala'],
    [egg(300), onion(150), tomato(150), oil(30), ...gg(20), water(250)], 720, [KATORI, piece('2 eggs with gravy (220 g)', 220)]),
  r('egg-curry-dhaba', 'Egg curry (dhaba style)', ['dhaba anda curry', 'egg masala restaurant'],
    [egg(300), onion(200), tomato(150), oil(55), butter(15), ...gg(20), water(200)], 760, [KATORI, piece('2 eggs with gravy (220 g)', 220)]),
  r('kerala-egg-roast', 'Kerala egg roast', ['mutta roast', 'egg roast'],
    [egg(300), onion(300), tomato(100), coconutOil(40), ...gg(20)], 620, [piece('2 eggs with masala (200 g)', 200)]),
  r('dimer-dalna', 'Dimer dalna (Bengali egg curry with potato)', ['dim curry', 'dimer kosha', 'egg aloo curry'],
    [egg(300), potato(200), onion(100), tomato(100), mustardOil(40), water(250)], 880, [KATORI]),
  r('masala-omelette', 'Masala omelette (2 eggs)', ['omelette', 'anda omelette', 'masala amlet', 'omlet'],
    [egg(100), onion(20), tomato(15), greenChilli(5), oil(8)], 135, [piece('1 omelette (2 eggs)', 135)]),
  r('plain-omelette', 'Plain omelette (2 eggs)', ['plain omlet', 'simple omelette'],
    [egg(100), butter(5)], 100, [piece('1 omelette (2 eggs)', 100)]),
  r('cheese-omelette', 'Cheese omelette (2 eggs)', ['cheese omlet'],
    [egg(100), cheese(20), butter(5), onion(15)], 135, [piece('1 omelette (2 eggs)', 135)]),
  r('egg-white-omelette', 'Egg white omelette (4 whites)', ['egg white omlet', 'anda safedi omelette'],
    [eggWhite(132), onion(20), tomato(15), oil(3)], 160, [piece('1 omelette (4 whites)', 160)]),
  r('bread-omelette', 'Bread omelette (street style)', ['bread omlet', 'omelette sandwich'],
    [bread(60), egg(100), onion(20), butter(10), oil(5), ketchup(10)], 195, [piece('1 bread omelette (2 eggs, 2 slices)', 195)]),
  r('half-fry', 'Fried egg (half fry / sunny side up)', ['half fry', 'bullseye', 'egg fry', 'single fry'],
    [egg(50), oil(5)], 52, [piece('1 egg', 52)]),
  r('egg-bhurji-street', 'Egg bhurji (street style, butter)', ['anda bhurji street', 'egg bhurji pav style'],
    [egg(150), onion(40), tomato(30), butter(15), oil(5)], 205, [piece('3-egg serving', 205)]),
  r('akuri', 'Akuri (Parsi scrambled eggs)', ['parsi akuri', 'akoori'],
    [egg(150), butter(15), onion(40), tomato(30), freshCream(10)], 215, [piece('3-egg serving', 215)]),
  r('anda-paratha', 'Anda paratha (egg paratha)', ['egg paratha', 'egg parantha'],
    [atta(60), water(33), egg(50), onion(15), oil(10)], 150, [piece('1 paratha', 150)]),
  r('mughlai-paratha', 'Mughlai paratha (Kolkata)', ['moglai porota', 'egg mughlai paratha'],
    [maida(80), water(40), egg(100), onion(30), oil(35)], 260, [piece('1 paratha (260 g)', 260)]),
  r('egg-biryani', 'Egg biryani', ['anda biryani', 'mutta biryani'],
    [rice(500), water(850), egg(300), onion(250), tomato(100), curd(100), oil(70), ghee(20), ...gg(20)], 2050, [PLATE, BIRYANI_PLATE]),
]

// ------------------------------------------------------------------ GYM-STYLE MEALS
const GYM: IndianRecipe[] = [
  r('grilled-chicken-breast', 'Grilled chicken breast', ['grilled chicken', 'chicken breast grilled', 'tandoori chicken breast diet'],
    [breast(200), oil(5), lemon(10)], 155, [piece('1 breast (150 g cooked)', 150)]),
  r('boiled-chicken-breast', 'Boiled chicken breast', ['boiled chicken', 'ubla chicken'],
    [breast(200)], 150, [piece('1 breast (150 g cooked)', 150)]),
  r('chicken-salad', 'Chicken salad (grilled chicken, veg)', ['grilled chicken salad', 'protein salad'],
    [breast(150), lettuce(80), cucumber(60), tomato(60), onion(30), oil(10), lemon(10)], 360, [PLATE]),
  r('boiled-chicken-rice', 'Boiled chicken with rice (meal box)', ['chicken rice meal', 'gym meal chicken rice', 'chicken and rice'],
    [breast(150), rice(75), water(200), oil(3)], 345, [piece('1 meal box (345 g)', 345)]),
  r('chicken-breast-curry-lowoil', 'Chicken breast curry (low oil, gym style)', ['diet chicken curry', 'low oil chicken curry'],
    [breast(500), onion(100), tomato(150), curd(50), oil(10), ...gg(20), water(150)], 750, [KATORI]),
  r('chicken-clear-soup', 'Chicken clear soup', ['chicken soup', 'chicken shorba', 'yakhni soup'],
    [chicken(150), onion(50), carrot(50), cabbage(50), oil(5), water(800)], 900, [CUP, KATORI]),
  r('chicken-rice-bowl', 'Chicken veg rice bowl (gym)', ['chicken bowl', 'chicken brown rice bowl'],
    [breast(150), rice(60), water(160), beans(50), carrot(40), broccoli(40), oil(5)], 380, [piece('1 bowl (380 g)', 380)]),
  r('egg-white-bhurji', 'Egg white bhurji', ['egg white scramble', 'safedi bhurji'],
    [eggWhite(200), onion(30), tomato(30), oil(5)], 230, [piece('6-white serving', 230)]),
  r('tuna-salad', 'Tuna salad (Indian style)', ['tuna chaat', 'tuna salad'],
    [u(171988)(100), onion(40), cucumber(60), tomato(60), lemon(10), oil(5)], 270, [PLATE]),
  r('chicken-sandwich', 'Grilled chicken sandwich', ['chicken sandwich'],
    [bread(60), chicken(70), mayo(10), butter(5), lettuce(20), tomato(20)], 175, [piece('1 sandwich', 175)]),
  r('mushroom-chicken-stirfry', 'Chicken and mushroom stir fry', ['chicken mushroom', 'chicken stir fry'],
    [breast(300), mushroom(200), capsicum(100), onion(80), soy(15), oil(15), ...gg(10)], 580, [KATORI]),
]

// ------------------------------------------------------------------ MITHAI
const MITHAI: IndianRecipe[] = [
  r('gulab-jamun', 'Gulab jamun', ['gulab jamun', 'gulaab jamun', 'jamun sweet'],
    [khoya(250), maida(30), milk(30), ghee(40), sugar(260), water(150)], 720, [piece('1 gulab jamun (45 g)', 45)]),
  r('gulab-jamun-milk-powder', 'Gulab jamun (milk powder / instant mix)', ['instant gulab jamun', 'mtr gulab jamun', 'milk powder jamun'],
    [milkPowder(200), maida(40), ghee(20), milk(80), oil(35), sugar(240), water(170)], 750, [piece('1 gulab jamun (40 g)', 40)]),
  r('kala-jamun', 'Kala jamun', ['kala jam', 'kalojam'],
    [khoya(250), paneer(50), maida(30), ghee(40), sugar(230), water(130)], 690, [piece('1 kala jamun (45 g)', 45)]),
  r('rasgulla', 'Rasgulla', ['rasgulla', 'rosogolla', 'roshogolla', 'rasagola', 'sponge rasgulla'],
    [paneer(250), maida(10), sugar(250), water(300)], 780, [piece('1 rasgulla with a little syrup (50 g)', 50)]),
  r('rasmalai', 'Rasmalai', ['ras malai', 'roshmalai', 'rasmalai sweet'],
    [paneer(250), maida(10), sugar(170), water(80), evapMilk(450), milk(100), pista(15)], 950, [piece('1 rasmalai with milk (70 g)', 70)]),
  r('cham-cham', 'Cham cham', ['chum chum', 'chomchom'],
    [paneer(250), maida(15), sugar(150), water(100), khoya(50), dryCoconut(15)], 540, [piece('1 cham cham (45 g)', 45)]),
  r('sandesh', 'Sandesh', ['sondesh', 'kacha golla', 'sandesh sweet'],
    [paneer(300), sugar(80)], 360, [piece('1 sandesh (30 g)', 30)]),
  r('nolen-gur-sandesh', 'Nolen gur sandesh', ['notun gur sondesh', 'jaggery sandesh'],
    [paneer(300), jaggery(90)], 370, [piece('1 sandesh (30 g)', 30)]),
  r('pantua', 'Pantua / ledikeni', ['ledikeni', 'langcha', 'pantua sweet'],
    [paneer(200), khoya(50), maida(30), ghee(30), sugar(200), water(100)], 580, [piece('1 pantua (45 g)', 45)]),
  r('chhena-poda', 'Chhena poda (Odisha)', ['chenna poda', 'chhena pora'],
    [paneer(300), sugar(100), sooji(25), ghee(10), cashew(15), raisin(10)], 400, [piece('1 slice (60 g)', 60)]),
  r('mishti-doi', 'Mishti doi', ['mishti dahi', 'sweet curd bengali', 'lal doi'],
    [evapMilk(600), sugar(100), curd(30)], 700, [piece('1 small matka (100 g)', 100)]),
  r('jalebi', 'Jalebi', ['jilebi', 'jalibi', 'jilapi'],
    [maida(200), curd(30), water(150), oil(70), sugar(300), water(100)], 680, [piece('1 jalebi (30 g)', 30), piece('1 plate (100 g)', 100)]),
  r('imarti', 'Imarti', ['amriti', 'jangiri', 'jaangiri'],
    [uradDal(150), water(180), oil(60), sugar(300), water(100)], 650, [piece('1 imarti (40 g)', 40)]),
  r('malpua', 'Malpua', ['malpoa', 'pua', 'malpura'],
    [maida(150), milk(250), sugar(30), ghee(60), sugar(150), water(80)], 650, [piece('1 malpua (50 g)', 50)]),
  r('ghevar', 'Ghevar (plain)', ['ghewar', 'teej ghevar'],
    [maida(200), ghee(50), milk(80), water(250), ghee(100), sugar(250), water(60)], 620, [piece('1 ghevar (100 g)', 100)]),
  r('malai-ghevar', 'Malai ghevar (with rabri topping)', ['rabri ghevar', 'kesar malai ghevar'],
    [maida(200), ghee(150), milk(80), water(250), sugar(250), water(60), evapMilk(300), sugar(30), pista(15)], 1020, [piece('1 ghevar (130 g)', 130)]),
  r('balushahi', 'Balushahi', ['badusha', 'balushai', 'makkhan bada'],
    [maida(250), ghee(60), curd(50), water(30), ghee(45), sugar(220), water(60)], 680, [piece('1 balushahi (45 g)', 45)]),
  r('mysore-pak-ghee', 'Mysore pak (soft, ghee)', ['mysore pak', 'ghee mysore pak', 'mysorepak'],
    [besan(125), sugar(300), ghee(280), water(120)], 720, [piece('1 piece (30 g)', 30)]),
  r('mysore-pak-hard', 'Mysore pak (traditional, porous)', ['hard mysore pak', 'old style mysore pak'],
    [besan(150), sugar(350), ghee(180), water(150)], 690, [piece('1 piece (30 g)', 30)]),
  r('soan-papdi', 'Soan papdi', ['son papdi', 'patisa', 'sohan papdi', 'soan cake'],
    [besan(100), maida(100), ghee(150), sugar(300), cornSyrup(30), water(100), pista(10)], 680, [piece('1 piece (25 g)', 25)]),
  r('kaju-katli', 'Kaju katli', ['kaju barfi', 'kaju katri', 'cashew barfi'],
    [cashew(250), sugar(125), water(60), ghee(5)], 400, [piece('1 piece (15 g)', 15)]),
  r('badam-katli', 'Badam katli', ['badam barfi', 'almond barfi'],
    [almond(250), sugar(150), water(60), ghee(10)], 430, [piece('1 piece (15 g)', 15)]),
  r('milk-barfi', 'Milk barfi (khoya barfi)', ['mawa barfi', 'khoya barfi', 'doodh barfi', 'kesar barfi'],
    [khoya(500), sugar(125), pista(10)], 620, [piece('1 piece (30 g)', 30)]),
  r('kalakand', 'Kalakand', ['milk cake soft', 'kalakand sweet'],
    [paneer(250), khoya(150), sugar(100), milk(150), pista(10)], 580, [piece('1 piece (40 g)', 40)]),
  r('milk-cake', 'Milk cake (Alwar)', ['alwar milk cake', 'ajmeri kalakand'],
    [khoya(500), sugar(150), ghee(20), paneer(50)], 680, [piece('1 piece (40 g)', 40)]),
  r('coconut-barfi', 'Coconut barfi', ['nariyal barfi', 'kopra pak', 'thengai burfi'],
    [dryCoconut(200), sugar(150), milk(150), ghee(10)], 470, [piece('1 piece (25 g)', 25)]),
  r('besan-barfi', 'Besan barfi', ['besan ki barfi', 'chickpea flour fudge'],
    [besan(200), ghee(150), sugar(180), water(60), pista(10)], 560, [piece('1 piece (30 g)', 30)]),
  r('chocolate-barfi', 'Chocolate barfi', ['choco barfi', 'chocolate burfi'],
    [khoya(400), sugar(110), cocoa(20), ghee(10)], 530, [piece('1 piece (30 g)', 30)]),
  r('dodha-barfi', 'Dodha barfi', ['doda barfi', 'dodha'],
    [khoya(250), milk(200), sooji(50), ghee(60), sugar(120), walnut(30), almond(20)], 620, [piece('1 piece (40 g)', 40)]),
  r('anjeer-barfi', 'Anjeer barfi (sugar-free dry fruit)', ['anjeer roll', 'fig barfi', 'dry fruit barfi'],
    [figs(200), dates(100), almond(40), cashew(40), pista(20), ghee(10)], 400, [piece('1 piece (25 g)', 25)]),
  r('peda', 'Peda', ['pedha', 'mathura peda', 'kesar peda', 'doodh peda'],
    [khoya(500), powderedSugar(130)], 610, [piece('1 peda (25 g)', 25)]),
  r('dharwad-peda', 'Dharwad peda', ['dharwad pedha', 'brown peda'],
    [khoya(500), sugar(150), milk(100), ghee(10)], 680, [piece('1 peda (25 g)', 25)]),
  r('bal-mithai', 'Bal mithai (Almora)', ['baal mithai', 'almora bal mithai'],
    [khoya(500), sugar(150), sugar(60), poppy(10)], 680, [piece('1 piece (30 g)', 30)]),
  r('petha', 'Agra petha', ['petha', 'angoori petha', 'ash gourd sweet'],
    [ashGourd(600), sugar(500)], 700, [piece('1 piece (40 g)', 40)]),
  r('gujiya', 'Gujiya / karanji', ['gujia', 'karanji', 'kajjikayalu', 'pedakiya', 'ghughra'],
    [maida(250), ghee(50), water(90), khoya(200), sugar(100), dryCoconut(30), almond(15), cashew(15), raisin(10), ghee(80)], 780, [piece('1 gujiya (40 g)', 40)]),
  r('shakarpara', 'Shakarpara', ['shankarpali', 'shakkar para', 'shakarpare'],
    [maida(250), ghee(50), water(80), oil(50), sugar(120), water(40)], 520, [piece('1 handful (30 g)', 30)]),
  r('khaja', 'Khaja (Odisha / Bihar)', ['puri khaja', 'silao khaja', 'madatha kaja'],
    [maida(200), ghee(40), water(80), oil(60), sugar(150), water(40)], 490, [piece('1 piece (25 g)', 25)]),
  r('thekua', 'Thekua (Bihar)', ['khajur thekua', 'thokwa'],
    [atta(250), jaggery(120), water(80), ghee(25), oil(40), dryCoconut(20)], 480, [piece('1 thekua (30 g)', 30)]),
  r('chikki-peanut', 'Peanut chikki', ['chikki', 'moongfali chikki', 'gud patti', 'kadalai mittai'],
    [peanuts(250), jaggery(200), ghee(5)], 430, [piece('1 piece (25 g)', 25)]),
  r('chikki-til', 'Til chikki (sesame)', ['til patti', 'ellu mittai', 'sesame chikki'],
    [sesame(200), jaggery(180), ghee(5)], 370, [piece('1 piece (20 g)', 20)]),
  r('chikki-dry-fruit', 'Dry fruit chikki', ['kaju chikki', 'mixed nut chikki'],
    [cashew(70), almond(70), pista(40), peanuts(40), sugar(180), ghee(5)], 390, [piece('1 piece (25 g)', 25)]),
  r('gajak', 'Gajak', ['gazak', 'til gajak', 'morena gajak'],
    [sesame(250), jaggery(250), ghee(20)], 500, [piece('1 piece (25 g)', 25)]),
  r('rewri', 'Rewri', ['revdi', 'rewdi', 'til revadi'],
    [sesame(150), sugar(250), water(30)], 390, [piece('5 rewri (20 g)', 20)]),
]

// ------------------------------------------------------------------ LADOOS
const LADOOS: IndianRecipe[] = [
  r('boondi-ladoo', 'Boondi ladoo', ['bundi laddu', 'boondi laddoo', 'boondi ke laddu'],
    [besan(250), water(250), ghee(75), sugar(300), water(150), cashew(15), raisin(10)], 720, [piece('1 ladoo (40 g)', 40)]),
  r('motichoor-ladoo', 'Motichoor ladoo', ['motichur laddu', 'motichoor laddoo', 'kesar motichoor'],
    [besan(250), water(250), ghee(90), sugar(300), water(150), pista(10)], 720, [piece('1 ladoo (40 g)', 40)]),
  r('tirupati-laddu', 'Tirupati laddu', ['srivari laddu', 'tirupati prasadam laddu'],
    [besan(250), water(250), ghee(150), sugar(450), water(150), cashew(50), raisin(30)], 950, [piece('1 laddu (175 g)', 175)]),
  r('besan-ladoo', 'Besan ladoo', ['besan laddu', 'besan ke laddoo'],
    [besan(250), ghee(150), powderedSugar(200), almond(15), cashew(10)], 610, [piece('1 ladoo (35 g)', 35)]),
  r('rava-ladoo', 'Rava ladoo', ['sooji ladoo', 'rava laddu', 'semolina ladoo'],
    [sooji(250), ghee(100), sugar(200), dryCoconut(50), milk(40), cashew(20), raisin(10)], 650, [piece('1 ladoo (35 g)', 35)]),
  r('coconut-ladoo', 'Coconut ladoo (condensed milk)', ['nariyal ladoo', 'coconut laddu'],
    [dryCoconut(200), condMilk(200), ghee(5)], 395, [piece('1 ladoo (25 g)', 25)]),
  r('narkel-naru', 'Narkel naru (coconut jaggery ladoo)', ['nariyal gud ladoo', 'narikel laru', 'thengai laddu'],
    [coconut(300), jaggery(150)], 360, [piece('1 naru (20 g)', 20)]),
  r('til-ladoo', 'Til ladoo', ['til ke laddu', 'tilgul', 'ellu urundai', 'sesame ladoo'],
    [sesame(200), jaggery(180), ghee(10), peanuts(30)], 410, [piece('1 ladoo (20 g)', 20)]),
  r('dry-fruit-ladoo', 'Dry fruit ladoo (no sugar)', ['dates ladoo', 'khajur ladoo', 'sugar free ladoo'],
    [dates(300), almond(70), cashew(70), pista(30), walnut(30), ghee(10)], 505, [piece('1 ladoo (25 g)', 25)]),
  r('gond-ladoo', 'Gond ladoo', ['dink ladoo', 'gond ke laddu', 'gondh laddu'],
    [atta(250), ghee(200), gond(50), powderedSugar(200), almond(40), cashew(40), dryCoconut(50)], 820, [piece('1 ladoo (40 g)', 40)]),
  r('atta-ladoo', 'Atta ladoo', ['wheat ladoo', 'aate ke laddu', 'gehu ladoo'],
    [atta(250), ghee(150), powderedSugar(200), almond(20), cashew(20)], 630, [piece('1 ladoo (35 g)', 35)]),
  r('churma-ladoo', 'Churma ladoo (Rajasthani)', ['churma laddu', 'churma'],
    [atta(250), ghee(30), water(80), ghee(100), jaggery(150), poppy(10), almond(20)], 590, [piece('1 ladoo (40 g)', 40)]),
  r('pinni', 'Atte ki pinni (Punjabi)', ['pinni', 'punjabi pinni', 'aate di pinni'],
    [atta(250), ghee(200), sugar(200), almond(30), khoya(100), gond(15)], 780, [piece('1 pinni (40 g)', 40)]),
  r('panjiri', 'Panjiri', ['dhaniya panjiri', 'atta panjiri'],
    [atta(250), ghee(180), powderedSugar(180), almond(40), cashew(30), makhana(30), gond(20)], 720, [KATORI, piece('1 tbsp heaped (20 g)', 20)]),
  r('ragi-ladoo', 'Ragi ladoo', ['nachni ladoo', 'ragi laddu'],
    [ragi(200), jaggery(150), ghee(60), peanuts(50)], 450, [piece('1 ladoo (30 g)', 30)]),
  r('peanut-ladoo', 'Peanut ladoo', ['shengdana ladoo', 'moongfali ladoo', 'groundnut laddu'],
    [peanuts(250), jaggery(200), ghee(10)], 455, [piece('1 ladoo (25 g)', 25)]),
  r('sunnundalu', 'Sunnundalu (urad dal ladoo)', ['minapa sunnundalu', 'urad dal laddu'],
    [uradDal(250), sugar(200), ghee(100)], 540, [piece('1 ladoo (35 g)', 35)]),
  r('malai-ladoo', 'Malai ladoo', ['paneer ladoo', 'malai laddu'],
    [paneer(200), condMilk(200), pista(10)], 400, [piece('1 ladoo (30 g)', 30)]),
  r('murmura-ladoo', 'Murmura ladoo (puffed rice)', ['mamra ladoo', 'muri ladoo', 'pori urundai', 'laiya ladoo'],
    [puffedRice(100), jaggery(150), ghee(10), water(20)], 270, [piece('1 ladoo (20 g)', 20)]),
]

// ------------------------------------------------------------------ HALWAS
const HALWAS: IndianRecipe[] = [
  r('sooji-halwa', 'Sooji halwa', ['suji ka halwa', 'rava sheera', 'sheera', 'semolina halwa'],
    [sooji(100), ghee(80), sugar(100), water(400), cashew(10), raisin(10)], 560, [KATORI]),
  r('satyanarayan-sheera', 'Sheera with milk and banana (prasad)', ['satyanarayan prasad', 'prasad sheera', 'banana sheera'],
    [sooji(100), ghee(80), sugar(100), milk(350), banana(80), cashew(10), raisin(10)], 640, [KATORI]),
  r('rava-kesari', 'Rava kesari / kesari bath', ['kesari bath', 'kesari', 'rava kesari'],
    [sooji(100), sugar(150), ghee(60), water(300), cashew(15), raisin(10)], 520, [KATORI]),
  r('gajar-halwa', 'Gajar halwa (home style)', ['gajar ka halwa', 'carrot halwa', 'gajrela'],
    [carrot(1000), evapMilk(250), sugar(150), ghee(50), cashew(15), almond(15)], 900, [KATORI]),
  r('gajar-halwa-khoya', 'Gajar halwa with khoya (sweet shop)', ['halwai gajar halwa', 'mawa gajar halwa'],
    [carrot(1000), evapMilk(250), sugar(180), ghee(80), khoya(150), cashew(20), almond(20)], 1050, [KATORI]),
  r('moong-dal-halwa', 'Moong dal halwa', ['moong ki dal ka halwa', 'moong halwa'],
    [moongDal(200), water(150), ghee(200), sugar(200), milk(250), khoya(50), almond(30)], 800, [KATORI, piece('1 small serving (100 g)', 100)]),
  r('kada-prasad', 'Atta halwa (kada prasad)', ['aate ka halwa', 'kada prasad', 'karah prasad', 'atta sheera'],
    [atta(100), ghee(100), sugar(100), water(300)], 500, [KATORI, piece('1 prasad serving (60 g)', 60)]),
  r('badam-halwa', 'Badam halwa', ['almond halwa', 'badam ka halwa'],
    [almond(200), ghee(100), sugar(160), milk(150)], 520, [piece('1 serving (80 g)', 80)]),
  r('lauki-halwa', 'Lauki halwa', ['doodhi halwa', 'bottle gourd halwa', 'ghiya halwa'],
    [lauki(800), evapMilk(250), sugar(150), ghee(40), khoya(80)], 800, [KATORI]),
  r('bombay-halwa', 'Bombay / Karachi halwa', ['karachi halwa', 'cornflour halwa', 'kerala halwa', 'kozhikode halwa'],
    [cornstarch(150), sugar(400), ghee(100), water(450), cashew(30)], 750, [piece('1 piece (40 g)', 40)]),
  r('chana-dal-halwa', 'Chana dal halwa', ['chane ki dal ka halwa'],
    [chanaDal(200), water(200), ghee(150), sugar(200), milk(300), khoya(50), almond(20)], 850, [KATORI]),
  r('beetroot-halwa', 'Beetroot halwa', ['chukandar halwa'],
    [u(169145)(700), evapMilk(200), sugar(120), ghee(40), cashew(15)], 650, [KATORI]),
  r('lapsi', 'Lapsi (broken wheat sweet)', ['fada lapsi', 'daliya halwa', 'meetha daliya'],
    [bulgur(150), ghee(60), jaggery(120), water(450), almond(10)], 650, [KATORI]),
  r('mohanthal', 'Mohanthal (Gujarati besan fudge)', ['mohan thal', 'mohanthaal'],
    [besan(250), ghee(175), milk(50), sugar(200), khoya(100), water(80), almond(15)], 790, [piece('1 piece (40 g)', 40)]),
  r('sukhdi', 'Sukhdi / gol papdi', ['gol papdi', 'gur papdi', 'sukhadi'],
    [atta(250), ghee(150), jaggery(150)], 545, [piece('1 piece (30 g)', 30)]),
  r('double-ka-meetha', 'Double ka meetha / shahi tukda', ['shahi tukda', 'shahi tukra', 'bread pudding indian'],
    [bread(300), ghee(80), sugar(150), water(100), evapMilk(300), sugar(30), almond(15), cashew(15)], 860, [piece('1 serving (100 g)', 100)]),
  r('qubani-ka-meetha', 'Qubani ka meetha', ['khubani ka meetha', 'apricot dessert hyderabadi'],
    [apricot(250), sugar(100), water(300)], 500, [piece('1 serving (80 g)', 80)]),
]

// ------------------------------------------------------------------ KHEER, PAYASAM, MILK SWEETS
const MILK_SWEETS: IndianRecipe[] = [
  r('rice-kheer', 'Rice kheer', ['chawal ki kheer', 'kheer', 'paal payasam', 'doodh pak'],
    [milk(1000), rice(60), sugar(80), almond(10), cashew(10)], 720, [KATORI]),
  r('nolen-gurer-payesh', 'Nolen gurer payesh (jaggery rice kheer)', ['payesh', 'gur payesh', 'gobindobhog payesh'],
    [milk(1000), rice(50), jaggery(100), raisin(10), cashew(10)], 720, [KATORI]),
  r('sabudana-kheer', 'Sabudana kheer', ['sago kheer', 'javvarisi payasam'],
    [milk(700), sago(60), water(150), sugar(70), cashew(10)], 720, [KATORI]),
  r('seviyan-kheer', 'Seviyan kheer', ['semiyan kheer', 'vermicelli kheer', 'sewai kheer'],
    [milk(800), vermicelli(50), ghee(10), sugar(70), almond(10), raisin(10)], 680, [KATORI]),
  r('semiya-payasam', 'Semiya payasam', ['semiya paayasam', 'vermicelli payasam'],
    [milk(750), vermicelli(50), sugar(80), ghee(15), cashew(15), raisin(10)], 680, [KATORI]),
  r('sheer-khurma', 'Sheer khurma', ['sheer korma', 'eid sheer khurma'],
    [milk(1000), vermicelli(60), ghee(20), sugar(80), dates(50), almond(20), pista(15), cashew(10)], 850, [KATORI]),
  r('meethi-seviyan', 'Meethi seviyan (dry)', ['zarda seviyan', 'sweet vermicelli dry', 'sewaiyan'],
    [vermicelli(200), ghee(50), sugar(120), water(300), almond(15), cashew(15)], 600, [KATORI]),
  r('makhana-kheer', 'Makhana kheer', ['phool makhana kheer', 'lotus seed kheer'],
    [milk(1000), makhana(40), sugar(70), ghee(5), almond(15)], 720, [KATORI]),
  r('gajar-kheer', 'Gajar kheer', ['carrot kheer', 'carrot payasam'],
    [milk(800), carrot(200), sugar(70), ghee(5), cashew(10)], 760, [KATORI]),
  r('phirni', 'Phirni', ['firni', 'matka phirni', 'kesar phirni'],
    [milk(1000), riceFlour(70), sugar(90), pista(15), almond(10)], 750, [KATORI, piece('1 matka (100 g)', 100)]),
  r('palada-pradhaman', 'Palada pradhaman', ['palada payasam', 'ada payasam milk'],
    [milk(1000), riceFlour(80), sugar(150), ghee(15)], 840, [KATORI]),
  r('ada-pradhaman', 'Ada pradhaman (jaggery, coconut milk)', ['ada payasam', 'ada pradaman'],
    [riceFlour(100), jaggery(250), coconutMilk(500), ghee(30), coconut(20), cashew(20), water(300)], 1000, [KATORI]),
  r('parippu-pradhaman', 'Parippu pradhaman (moong dal payasam)', ['parippu payasam', 'moong dal payasam', 'pasi paruppu payasam'],
    [moongDal(100), water(400), jaggery(200), coconutMilk(400), ghee(30), coconut(20), cashew(20)], 950, [KATORI]),
  r('chakka-pradhaman', 'Chakka pradhaman (jackfruit)', ['chakka payasam', 'jackfruit payasam'],
    [jackfruit(300), jaggery(200), coconutMilk(400), ghee(40), water(200), cashew(20)], 950, [KATORI]),
  r('basundi', 'Basundi', ['basundi', 'sitaphal basundi'],
    [evapMilk(1000), sugar(120), almond(10), pista(10)], 1000, [KATORI, CUP]),
  r('rabri', 'Rabri', ['rabdi', 'lachha rabri', 'rabdi malai'],
    [evapMilk(800), sugar(80), pista(10), almond(10)], 600, [piece('1 serving (100 g)', 100)]),
  r('malai-kulfi', 'Malai kulfi', ['kulfi', 'kesar pista kulfi', 'matka kulfi'],
    [evapMilk(600), sugar(80), milkPowder(20), pista(15), almond(15)], 700, [piece('1 kulfi (60 g)', 60), piece('1 matka kulfi (100 g)', 100)]),
  r('mango-kulfi', 'Mango kulfi', ['aam kulfi', 'mango malai kulfi'],
    [evapMilk(400), mango(250), sugar(60), milkPowder(20), pista(10)], 720, [piece('1 kulfi (60 g)', 60)]),
  r('kulfi-falooda', 'Kulfi falooda', ['falooda kulfi', 'kulfi faluda'],
    [evapMilk(100), sugar(15), pista(5), cornstarch(15), water(60), roseSyrup(30), chia(3)], 225, [piece('1 serving (225 g)', 225)]),
  r('falooda', 'Royal falooda', ['faluda', 'rose falooda', 'falooda glass'],
    [milk(200), roseSyrup(30), iceCreamVanilla(70), vermicelli(15), water(40), chia(5), sugar(10), almond(5), pista(5)], 375, [piece('1 glass (375 g)', 375)]),
  r('shrikhand', 'Shrikhand', ['kesar shrikhand', 'elaichi shrikhand', 'chakka'],
    [greekCurd(400), powderedSugar(220), pista(10), almond(10)], 640, [KATORI, piece('1 serving (100 g)', 100)]),
  r('amrakhand', 'Amrakhand (mango shrikhand)', ['mango shrikhand', 'aamrakhand'],
    [greekCurd(400), mango(150), powderedSugar(180)], 730, [piece('1 serving (100 g)', 100)]),
  r('modak-steamed', 'Ukadiche modak (steamed)', ['modak', 'kozhukattai', 'ukadiche modak', 'kudumu'],
    [riceFlour(150), water(180), ghee(15), coconut(200), jaggery(150)], 660, [piece('1 modak (40 g)', 40)]),
  r('modak-fried', 'Fried modak', ['talniche modak', 'fried modak'],
    [maida(150), ghee(20), water(60), coconut(150), jaggery(100), oil(45)], 500, [piece('1 modak (35 g)', 35)]),
  r('puran-poli', 'Puran poli', ['holige', 'obbattu', 'bobbatlu', 'vedmi', 'puranpoli'],
    [chanaDal(200), water(300), jaggery(200), atta(200), water(110), oil(20), ghee(40)], 950, [piece('1 puran poli (80 g)', 80)]),
  r('unniyappam', 'Unniyappam', ['unni appam', 'neyyappam', 'kuzhiyappam sweet'],
    [riceFlour(200), banana(150), jaggery(150), water(120), coconut(30), ghee(20), oil(40)], 650, [piece('1 unniyappam (25 g)', 25)]),
  r('adhirasam', 'Adhirasam / ariselu', ['ariselu', 'athirasam', 'kajjaya'],
    [riceFlour(250), jaggery(200), water(60), oil(80), sesame(10)], 560, [piece('1 piece (40 g)', 40)]),
  r('patishapta', 'Patishapta (Bengali crepe with coconut)', ['patishapta pitha', 'pati shapta'],
    [riceFlour(100), maida(50), milk(200), coconut(150), jaggery(120), oil(15)], 580, [piece('1 patishapta (50 g)', 50)]),
]

// ------------------------------------------------------------------ ICE CREAM
const ICE_CREAM: IndianRecipe[] = [
  r('ice-cream-vanilla', 'Vanilla ice cream', ['vanilla ice cream', 'ice cream cup vanilla'],
    [iceCreamVanilla(100)], 100, [piece('1 scoop (60 g)', 60), piece('1 cup (100 ml, 55 g)', 55)]),
  r('ice-cream-chocolate', 'Chocolate ice cream', ['chocolate ice cream', 'choco ice cream'],
    [iceCreamChoc(100)], 100, [piece('1 scoop (60 g)', 60), piece('1 cup (100 ml, 55 g)', 55)]),
  r('ice-cream-strawberry', 'Strawberry ice cream', ['strawberry ice cream'],
    [iceCreamStrawberry(100)], 100, [piece('1 scoop (60 g)', 60), piece('1 cup (100 ml, 55 g)', 55)]),
  r('ice-cream-butterscotch', 'Butterscotch ice cream', ['butterscotch', 'butter scotch ice cream'],
    [iceCreamVanilla(88), u(168833)(6), cashew(6)], 100, [piece('1 scoop (60 g)', 60), piece('1 cup (100 ml, 55 g)', 55)]),
  r('ice-cream-mango', 'Mango ice cream', ['aam ice cream', 'alphonso ice cream'],
    [iceCreamVanilla(80), mango(20)], 100, [piece('1 scoop (60 g)', 60)]),
  r('ice-cream-cone', 'Ice cream cone', ['cornetto', 'cone ice cream'],
    [iceCreamVanilla(65), coneWafer(15), u(170271)(8), peanuts(4)], 92, [piece('1 cone (92 g)', 92)]),
  r('gulab-jamun-ice-cream', 'Gulab jamun with ice cream', ['hot gulab jamun with ice cream'],
    [khoya(30), maida(4), ghee(4), sugar(28), water(18), iceCreamVanilla(60)], 140, [piece('2 jamun + 1 scoop (140 g)', 140)]),
  r('kesar-pista-ice-cream', 'Kesar pista ice cream', ['kesar pista', 'pista ice cream'],
    [iceCreamVanilla(92), pista(8)], 100, [piece('1 scoop (60 g)', 60)]),
]

export const RECIPES_NONVEG_SWEETS: IndianRecipe[] = [
  ...CHICKEN,
  ...MUTTON,
  ...FISH,
  ...EGGS,
  ...GYM,
  ...MITHAI,
  ...LADOOS,
  ...HALWAS,
  ...MILK_SWEETS,
  ...ICE_CREAM,
]
