// South Indian vegetarian dishes (Tamil Nadu, Kerala, Karnataka, Andhra
// Pradesh, Telangana). Typical home-style batch amounts, written by us; see
// docs/indian-food-database.md. Deep-fried items list only the oil absorbed.

import type { RecipeIngredient } from '../../recipe'
import { CUP, GLASS, KATORI, PLATE, ing, piece, r, usdaIng, type IndianRecipe } from '../define'

// USDA SR Legacy foods used below (fdc_id, description).
type I = (g: number) => RecipeIngredient
const u = (id: number): I => (g) => usdaIng(id, g)
const coconut = u(170169) // Nuts, coconut meat, raw
const coconutMilk = u(170172) // Nuts, coconut milk, raw
const desiccated = u(170170) // Nuts, coconut meat, dried (desiccated), not sweetened
const coconutOil = u(171412) // Oil, coconut
const sesameOil = u(171016) // Oil, sesame, salad or cooking
const sesame = u(170150) // Seeds, sesame seeds, whole, dried
const cashews = u(170162) // Nuts, cashew nuts, raw
const butter = u(173410) // Butter, salted
const riceFlour = u(169714) // Rice flour, white, unenriched
const parboiled = u(169758) // Rice, white, long-grain, parboiled, unenriched, dry
const riceNoodles = u(169742) // Rice noodles, dry
const puffedRice = u(173912) // Cereals ready-to-eat, rice, puffed, fortified
const maida = u(169761) // Wheat flour, white, all-purpose, unenriched
const bulgur = u(170688) // Bulgur, dry
const sorghumFlour = u(168943) // Sorghum flour, whole-grain
const sago = u(169717) // Tapioca, pearl, dry
const bread = u(174924) // Bread, white, commercially prepared
const cowpeas = u(173758) // Cowpeas, common, mature seeds, raw
const fieldBeansDry = u(175210) // Hyacinth beans, mature seeds, raw
const fieldBeans = u(169234) // Hyacinth-beans, immature seeds, raw
const tamarind = u(167763) // Tamarinds, raw
const lemon = u(167747) // Lemon juice, raw
const eggplant = u(169228) // Eggplant, raw
const drumstick = u(170483) // Drumstick pods, raw
const drumstickLeaves = u(168416) // Drumstick leaves, raw
const ashGourd = u(170069) // Waxgourd, raw
const pumpkin = u(168448) // Pumpkin, raw
const rawBanana = u(168215) // Plantains, green, raw
const ripePlantain = u(169130) // Plantains, yellow, raw
const banana = u(173944) // Bananas, raw
const yam = u(170071) // Yam, raw
const taro = u(169308) // Taro, raw
const chayote = u(170402) // Chayote, fruit, raw
const bitterGourd = u(168393) // Balsam-pear (bitter gourd), pods, raw
const ridgeGourd = u(168414) // Gourd, dishcloth (towelgourd), raw
const bottleGourd = u(169232) // Gourd, white-flowered (calabash), raw
const cabbage = u(169975) // Cabbage, raw
const beans = u(169961) // Beans, snap, green, raw
const beetroot = u(169145) // Beets, raw
const amaranth = u(168385) // Amaranth leaves, raw
const cucumber = u(168409) // Cucumber, with peel, raw
const shallots = u(170499) // Shallots, raw
const garlic = u(169230) // Garlic, raw
const ginger = u(169231) // Ginger root, raw
const pineapple = u(168193) // Pineapple, raw, traditional varieties
const mango = u(169910) // Mangos, raw
const cassava = u(169985) // Cassava, raw
const sweetCorn = u(169998) // Corn, sweet, yellow, raw
const peas = u(170419) // Peas, green, raw
const capsicum = u(170427) // Peppers, sweet, green, raw
const greenChilli = u(170497) // Peppers, hot chili, green, raw
const chilliPowder = u(171319) // Spices, chili powder
const mustardPowder = u(170929) // Spices, mustard seed, ground
const radish = u(169276) // Radishes, raw
const coriander = u(169997) // Coriander (cilantro) leaves, raw
const mint = u(173475) // Spearmint, fresh
const mushroom = u(169251) // Mushrooms, white, raw
const papad = u(168106) // Papad
const cassavaChips = u(173152) // Snacks, yucca (cassava) chips, salted

// Catalogue ingredients
const rice = (g: number) => ing('rice', g)
const urad = (g: number) => ing('urad-dal', g)
const toor = (g: number) => ing('toor-dal', g)
const moong = (g: number) => ing('moong-dal', g)
const chana = (g: number) => ing('chana', g) // chickpeas / bengal gram: chana dal, kala chana
const besan = (g: number) => ing('besan', g)
const sooji = (g: number) => ing('sooji', g)
const atta = (g: number) => ing('atta', g)
const water = (g: number) => ing('water', g)
const oil = (g: number) => ing('oil', g)
const ghee = (g: number) => ing('ghee', g)
const curd = (g: number) => ing('curd', g)
const milk = (g: number) => ing('milk', g)
const onion = (g: number) => ing('onion', g)
const tomato = (g: number) => ing('tomato', g)
const potato = (g: number) => ing('potato', g)
const carrot = (g: number) => ing('carrot', g)
const spinach = (g: number) => ing('spinach', g)
const okra = (g: number) => ing('okra', g)
const cauliflower = (g: number) => ing('cauliflower', g)
const peanuts = (g: number) => ing('peanuts', g)
const sugar = (g: number) => ing('sugar', g)
const jaggery = (g: number) => ing('jaggery', g)
const ragi = (g: number) => ing('ragi-flour', g)
const vermicelli = (g: number) => ing('vermicelli', g)
// Label ingredients from extra-ingredients/south.ts
const roastedGram = (g: number) => ing('south-roasted-gram', g)
const horseGram = (g: number) => ing('horse-gram', g)
const gongura = (g: number) => ing('south-gongura', g)
const foxtail = (g: number) => ing('south-foxtail-millet', g)
const littleMillet = (g: number) => ing('south-little-millet', g)
const pearlMillet = (g: number) => ing('south-pearl-millet', g)
const mattaRice = (g: number) => ing('south-matta-rice', g)

// Common portions
const TBSP2 = piece('2 tbsp (30 g)', 30)
const TBSP = piece('1 tbsp (8 g)', 8)
const SMALL_KATORI = piece('1 small katori (100 g)', 100)

// Shared parts
const potatoMasala = (potatoG: number): RecipeIngredient[] => [potato(potatoG), onion(Math.round(potatoG * 0.3)), oil(5), water(20), chana(3)]
const sambarBase = (): RecipeIngredient[] => [toor(50), water(600), oil(10), onion(40), tomato(50), tamarind(10)]
const kootu = (veg: RecipeIngredient, dal: RecipeIngredient = moong(40)): RecipeIngredient[] => [veg, dal, coconut(30), water(200), oil(5)]
const poriyal = (veg: RecipeIngredient): RecipeIngredient[] => [veg, oil(10), coconut(20), urad(3)]
const thoran = (veg: RecipeIngredient): RecipeIngredient[] => [veg, coconut(50), coconutOil(10), shallots(15)]
const fritter = (veg: RecipeIngredient): RecipeIngredient[] => [veg, besan(80), riceFlour(15), water(90), oil(35)]
const meduVada = (): RecipeIngredient[] => [urad(100), water(110), oil(35), onion(15)]

export const RECIPES_SOUTH: IndianRecipe[] = [
  // ---------- Dosa varieties ----------
  r('masala-dosa', 'Masala dosa', ['masala dosai', 'masale dose', 'potato dosa', 'udupi masala dosa', 'masala dosey'],
    [rice(40), urad(13), water(70), oil(7), ...potatoMasala(100)], 250, [piece('1 masala dosa', 250)]),
  r('mysore-masala-dosa', 'Mysore masala dosa', ['mysore masala dosai', 'mysore masale dose', 'red chutney masala dosa'],
    [rice(40), urad(13), water(70), oil(10), ...potatoMasala(100), shallots(15), garlic(5), butter(5)], 270, [piece('1 dosa', 270)]),
  r('ghee-roast-dosa', 'Ghee roast dosa', ['nei roast', 'ghee roast', 'ghee dosa', 'nei dosai', 'tuppa dose', 'neyyi dosa'],
    [rice(40), urad(13), water(65), ghee(12)], 112, [piece('1 ghee roast', 112)]),
  r('paper-roast-dosa', 'Paper roast dosa', ['paper dosa', 'paper roast', 'kal paper dosai'],
    [rice(50), urad(15), water(80), oil(10)], 125, [piece('1 paper dosa', 125)]),
  r('onion-dosa', 'Onion dosa', ['vengaya dosai', 'ullipaya dosa', 'eerulli dose', 'onion dosai'],
    [rice(60), urad(20), water(100), onion(50), oil(10)], 210, [piece('1 dosa', 105)]),
  r('podi-dosa', 'Podi dosa (gunpowder dosa)', ['milagai podi dosai', 'gunpowder dosa', 'karam dosa', 'ghee podi dosa'],
    [rice(60), urad(26), water(100), ghee(10), chana(6), sesame(3)], 185, [piece('1 dosa', 92)]),
  r('benne-dosa', 'Benne dosa (Davangere butter dosa)', ['benne dose', 'davangere benne dosa', 'butter dosa'],
    [rice(50), urad(12), water(75), butter(15)], 130, [piece('1 benne dosa', 65)]),
  r('benne-masala-dosa', 'Benne masala dosa', ['benne masale dose', 'butter masala dosa'],
    [rice(40), urad(10), water(60), butter(15), potato(80), onion(20), oil(3)], 200, [piece('1 dosa', 200)]),
  r('set-dosa', 'Set dosa', ['set dose', 'sponge dosa', 'kal dosai', 'kal dosa'],
    [rice(70), urad(15), water(100), oil(6)], 180, [piece('1 set dosa', 60), piece('1 set (3 dosas)', 180)]),
  r('neer-dosa', 'Neer dosa', ['neer dose', 'neeru dosa', 'water dosa'],
    [rice(60), coconut(15), water(180), oil(5)], 170, [piece('1 neer dosa', 42)]),
  r('rava-dosa', 'Rava dosa', ['rava dosai', 'sooji dosa', 'semolina dosa'],
    [sooji(30), riceFlour(30), maida(10), water(150), onion(10), oil(10)], 150, [piece('1 rava dosa', 75)]),
  r('onion-rava-dosa', 'Onion rava dosa', ['onion rava dosai', 'vengaya rava dosai', 'onion rava'],
    [sooji(30), riceFlour(30), maida(10), water(150), onion(60), oil(14)], 190, [piece('1 dosa', 95)]),
  r('rava-masala-dosa', 'Rava masala dosa', ['rava masala dosai', 'sooji masala dosa'],
    [sooji(15), riceFlour(15), maida(5), water(75), oil(7), ...potatoMasala(100)], 210, [piece('1 dosa', 210)]),
  r('pesarattu', 'Pesarattu', ['pesarattu dosa', 'green moong dosa', 'moong dal dosa', 'pesaha'],
    [moong(60), rice(10), water(90), onion(20), oil(8)], 160, [piece('1 pesarattu', 80)]),
  r('mla-pesarattu', 'MLA pesarattu (pesarattu upma)', ['upma pesarattu', 'pesarattu with upma'],
    [moong(60), rice(10), water(170), onion(30), oil(12), sooji(30)], 280, [piece('1 pesarattu with upma', 140)]),
  r('wheat-dosa', 'Wheat dosa', ['godhuma dosai', 'godhi dose', 'atta dosa', 'instant wheat dosa'],
    [atta(50), riceFlour(15), water(130), onion(20), oil(8)], 150, [piece('1 dosa', 75)]),
  r('rice-flour-dosa', 'Instant rice flour dosa', ['arisi maavu dosai', 'rice flour dosa', 'instant dosa'],
    [riceFlour(60), water(120), onion(20), oil(8)], 140, [piece('1 dosa', 70)]),
  r('ragi-dosa', 'Ragi dosa', ['ragi dose', 'kezhvaragu dosai', 'finger millet dosa', 'nachni dosa'],
    [ragi(50), riceFlour(20), water(140), onion(20), oil(8)], 160, [piece('1 dosa', 80)]),
  r('tomato-dosa', 'Tomato dosa', ['thakkali dosai', 'tomato dose'],
    [rice(60), tomato(60), onion(15), water(50), oil(10)], 170, [piece('1 dosa', 85)]),
  r('coconut-dosa', 'Coconut dosa', ['kayi dose', 'thengai dosai', 'coconut dose'],
    [rice(60), coconut(30), water(90), oil(6)], 165, [piece('1 dosa', 82)]),
  r('thinai-dosa', 'Foxtail millet dosa', ['thinai dosai', 'korralu dosa', 'navane dose', 'millet dosa'],
    [foxtail(50), urad(15), water(90), oil(8)], 145, [piece('1 dosa', 72)]),
  r('kambu-dosa', 'Pearl millet dosa', ['kambu dosai', 'sajje dose', 'bajra dosa'],
    [pearlMillet(50), urad(15), water(90), oil(8)], 145, [piece('1 dosa', 72)]),
  r('adai', 'Adai', ['adai dosai', 'lentil dosa', 'mixed dal dosa', 'adai dosa'],
    [rice(40), toor(15), chana(15), urad(10), water(100), onion(30), coconut(10), oil(12)], 200, [piece('1 adai', 100)]),
  r('dibba-rotti', 'Dibba rotti', ['minapa rotti', 'dibba roti', 'urad dal rotti'],
    [parboiled(100), urad(50), water(150), oil(20)], 290, [piece('1 wedge', 100)]),

  // ---------- Uttapam ----------
  r('plain-uttapam', 'Uttapam (plain)', ['uthappam', 'oothappam', 'uttappa', 'plain uttapam'],
    [rice(50), urad(15), water(75), oil(8)], 140, [piece('1 uttapam', 140)]),
  r('onion-uttapam', 'Onion uttapam', ['onion uthappam', 'vengaya oothappam', 'onion uttappa'],
    [rice(50), urad(15), water(75), oil(10), onion(50)], 180, [piece('1 uttapam', 180)]),
  r('tomato-onion-uttapam', 'Tomato onion uttapam', ['tomato onion uthappam', 'tomato uttapam'],
    [rice(50), urad(15), water(75), oil(10), onion(30), tomato(30)], 185, [piece('1 uttapam', 185)]),
  r('vegetable-uttapam', 'Vegetable uttapam', ['veg uthappam', 'mixed veg uttapam'],
    [rice(50), urad(15), water(75), oil(10), onion(25), tomato(20), carrot(20), capsicum(15)], 200, [piece('1 uttapam', 200)]),
  r('rava-uttapam', 'Rava uttapam', ['sooji uttapam', 'instant rava uthappam'],
    [sooji(50), curd(40), water(60), onion(30), oil(8)], 170, [piece('1 uttapam', 170)]),

  // ---------- Idli varieties ----------
  r('rava-idli', 'Rava idli', ['rava idly', 'sooji idli', 'MTR rava idli', 'semolina idli'],
    [sooji(50), curd(50), water(30), ghee(5), cashews(5), carrot(15)], 150, [piece('1 rava idli', 55)]),
  r('kanchipuram-idli', 'Kanchipuram idli', ['kancheepuram idli', 'kovil idli', 'kudalai idli'],
    [rice(50), urad(20), water(80), ghee(8), cashews(5)], 160, [piece('1 idli', 55)]),
  r('thatte-idli', 'Thatte idli', ['plate idli', 'thatte idly', 'bidadi thatte idli'],
    [rice(60), urad(15), sago(10), water(100)], 185, [piece('1 thatte idli', 95)]),
  r('ragi-idli', 'Ragi idli', ['ragi idly', 'kezhvaragu idli', 'finger millet idli'],
    [ragi(40), rice(30), urad(20), water(110)], 195, [piece('1 idli', 45)]),
  r('podi-idli', 'Ghee podi idli', ['podi idli', 'mini ghee podi idli', 'gunpowder idli'],
    [rice(60), urad(26), water(90), ghee(10), chana(6), sesame(3)], 190, [piece('1 idli', 48), piece('1 plate (14 mini idlis)', 180)]),
  r('sambar-idli', 'Sambar idli', ['idli sambar', 'mini sambar idli', 'sambar idly', 'idli in sambar'],
    [rice(60), urad(20), water(310), toor(20), onion(20), tomato(25), carrot(15), oil(4)], 440, [piece('2 idlis in sambar', 220)]),
  r('fried-idli', 'Fried idli', ['idli fry', 'masala fried idli'],
    [rice(60), urad(20), water(90), oil(15)], 170, [KATORI]),
  r('idli-upma', 'Idli upma', ['idli uppuma', 'leftover idli upma'],
    [rice(60), urad(20), water(90), oil(8), onion(30)], 195, [KATORI]),
  r('thinai-idli', 'Foxtail millet idli', ['thinai idli', 'millet idli', 'korralu idli'],
    [foxtail(60), urad(20), water(90)], 170, [piece('1 idli', 42)]),

  // ---------- Kerala and other breakfasts ----------
  r('appam', 'Appam', ['palappam', 'vellayappam', 'hoppers', 'aappam', 'kallappam'],
    [rice(100), coconut(30), sugar(5), water(140), oil(2)], 240, [piece('1 appam', 60)]),
  r('puttu', 'Puttu (rice)', ['arisi puttu', 'kerala puttu', 'puttu podi', 'steamed rice cake'],
    [riceFlour(100), water(80), coconut(40)], 215, [piece('1 puttu (cylinder)', 100)]),
  r('wheat-puttu', 'Wheat puttu', ['gothambu puttu', 'atta puttu'],
    [atta(100), water(80), coconut(40)], 215, [piece('1 puttu (cylinder)', 100)]),
  r('ragi-puttu', 'Ragi puttu', ['ragi puttu', 'kezhvaragu puttu', 'finger millet puttu'],
    [ragi(100), water(80), coconut(40)], 215, [piece('1 puttu (cylinder)', 100)]),
  r('idiyappam', 'Idiyappam', ['string hoppers', 'nool puttu', 'noolappam', 'idiappam', 'sevai'],
    [riceFlour(100), water(150), oil(2)], 230, [piece('1 idiyappam', 40)]),
  r('lemon-sevai', 'Lemon sevai', ['lemon semiya', 'elumichai sevai', 'akki shavige chitranna', 'lemon rice noodles'],
    [riceNoodles(100), water(220), oil(10), peanuts(10), lemon(15), onion(20), chana(3)], 335, [KATORI, PLATE]),
  r('coconut-sevai', 'Coconut sevai', ['thengai sevai', 'coconut semiya'],
    [riceNoodles(100), water(220), coconut(40), oil(8), urad(3), chana(3)], 330, [KATORI, PLATE]),
  r('tomato-sevai', 'Tomato sevai', ['thakkali sevai', 'tomato rice noodles'],
    [riceNoodles(100), water(220), tomato(100), onion(40), oil(12)], 400, [KATORI, PLATE]),
  r('vegetable-sevai', 'Vegetable sevai', ['veg sevai', 'kaikari sevai'],
    [riceNoodles(100), water(220), carrot(40), beans(30), peas(20), onion(30), oil(12)], 400, [KATORI, PLATE]),
  r('pathiri', 'Pathiri', ['ari pathiri', 'malabar pathiri', 'rice roti kerala'],
    [riceFlour(100), water(120)], 200, [piece('1 pathiri', 35)]),
  r('uppu-kozhukattai', 'Uppu kozhukattai (ammini kozhukattai)', ['ammini kozhukattai', 'uppu kozhukattai', 'savoury kozhukattai', 'mini kozhukattai'],
    [riceFlour(100), water(150), coconut(15), oil(6), urad(3)], 250, [KATORI]),
  r('pidi-kozhukattai', 'Pidi kozhukattai', ['kara pidi kozhukattai', 'arisi pidi kozhukattai'],
    [riceFlour(80), chana(15), coconut(20), oil(8), water(180)], 280, [piece('1 kozhukattai', 40)]),
  r('ulundu-kozhukattai', 'Ulundu kozhukattai', ['ulundu poorana kozhukattai', 'urad dal kozhukattai'],
    [riceFlour(100), water(180), oil(10), urad(50), coconut(10)], 320, [piece('1 kozhukattai', 40)]),
  r('kuzhi-paniyaram', 'Kuzhi paniyaram (savoury)', ['kara paniyaram', 'paddu', 'guntha ponganalu', 'appe', 'gunta ponganalu'],
    [rice(60), urad(20), water(90), onion(30), oil(12)], 190, [piece('1 paniyaram', 18), piece('1 plate (6)', 110)]),
  r('punugulu', 'Punugulu', ['punukulu', 'idli batter fritters'],
    [rice(60), urad(20), water(70), onion(20), oil(30)], 170, [piece('5 punugulu', 75)]),

  // ---------- Pongal and upma ----------
  r('ven-pongal', 'Ven pongal', ['khara pongal', 'ghee pongal', 'kara pongal', 'pongali', 'huggi'],
    [rice(80), moong(30), water(400), ghee(20), cashews(8)], 500, [KATORI]),
  r('rava-pongal', 'Rava pongal', ['sooji pongal', 'rava khara pongal'],
    [sooji(70), moong(30), water(300), ghee(15), cashews(8)], 400, [KATORI]),
  r('thinai-pongal', 'Foxtail millet pongal', ['thinai pongal', 'millet pongal', 'korralu pongal'],
    [foxtail(70), moong(30), water(350), ghee(15), cashews(5)], 440, [KATORI]),
  r('samai-pongal', 'Little millet pongal', ['samai pongal', 'saame pongal'],
    [littleMillet(70), moong(30), water(350), ghee(15), cashews(5)], 440, [KATORI]),
  r('vegetable-upma', 'Vegetable rava upma', ['veg upma', 'vegetable uppittu', 'kaikari upma'],
    [sooji(50), oil(8), onion(30), carrot(20), peas(15), beans(15), water(170)], 290, [KATORI, PLATE]),
  r('semiya-upma', 'Semiya upma', ['vermicelli upma', 'shavige uppittu', 'semiya uppuma'],
    [vermicelli(60), oil(8), onion(30), carrot(15), peas(10), water(150)], 250, [KATORI, PLATE]),
  r('godhuma-rava-upma', 'Broken wheat upma', ['godhuma rava upma', 'godhi nuchina uppittu', 'dalia upma', 'samba rava upma'],
    [bulgur(60), oil(8), onion(30), carrot(20), water(200)], 290, [KATORI, PLATE]),
  r('arisi-upma', 'Arisi upma', ['rice upma', 'arisi uppuma', 'akki tari uppittu'],
    [rice(70), toor(10), coconut(15), oil(8), water(240)], 310, [KATORI, PLATE]),
  r('bread-upma', 'Bread upma', ['bread uppuma', 'bread uppittu'],
    [bread(100), oil(10), onion(40), tomato(40)], 170, [KATORI]),
  r('kharabath', 'Khara bath', ['kharabath', 'masala upma', 'karnataka khara bath'],
    [sooji(60), ghee(10), oil(5), onion(30), tomato(30), carrot(15), peas(15), beans(15), cashews(5), water(200)], 360, [KATORI, PLATE]),
  r('uggani', 'Uggani', ['borugula upma', 'puffed rice upma', 'mandakki oggarane', 'kurmura upma'],
    [puffedRice(60), water(60), oil(10), onion(50), peanuts(15), chana(5), tomato(20)], 200, [KATORI, PLATE]),
  r('thinai-upma', 'Foxtail millet upma', ['thinai upma', 'millet upma', 'navane uppittu'],
    [foxtail(60), oil(8), onion(30), carrot(20), beans(15), water(200)], 300, [KATORI, PLATE]),

  // ---------- Rotti, parotta, mudde ----------
  r('akki-rotti', 'Akki rotti', ['akki roti', 'rice roti', 'akki rotti karnataka'],
    [riceFlour(100), water(100), onion(30), coconut(15), oil(10)], 200, [piece('1 akki rotti', 65)]),
  r('ragi-rotti', 'Ragi rotti', ['ragi roti', 'ragi adai', 'nachni roti'],
    [ragi(100), water(90), onion(30), oil(10)], 190, [piece('1 ragi rotti', 65)]),
  r('jolada-rotti', 'Jolada rotti', ['jowar roti', 'jonna rotte', 'jowar bhakri', 'cholam roti'],
    [sorghumFlour(100), water(70)], 140, [piece('1 rotti', 46)]),
  r('kerala-parotta', 'Kerala parotta', ['porotta', 'malabar parotta', 'barotta', 'parotta', 'layered parotta'],
    [maida(100), water(50), oil(15), sugar(2)], 150, [piece('1 parotta', 75)]),
  r('veg-kothu-parotta', 'Veg kothu parotta', ['kothu parotta', 'kottu parotta', 'veechu parotta kothu'],
    [maida(100), water(110), oil(25), sugar(2), onion(60), tomato(60), carrot(30), cabbage(30)], 360, [PLATE]),
  r('veg-salna', 'Veg salna', ['parotta salna', 'empty salna', 'vegetable salna'],
    [onion(80), tomato(60), coconut(40), potato(50), carrot(30), peas(20), oil(15), water(300)], 520, [KATORI]),
  r('ragi-mudde', 'Ragi mudde', ['ragi ball', 'ragi kali', 'keppai kali', 'ragi sangati', 'mudde'],
    [ragi(100), water(250)], 300, [piece('1 mudde ball', 150)]),
  r('jonna-sangati', 'Pearl millet sangati', ['kambu kali', 'sajja sangati', 'bajra kali'],
    [pearlMillet(80), rice(20), water(300)], 340, [piece('1 ball', 170)]),

  // ---------- Rice dishes ----------
  r('lemon-rice', 'Lemon rice', ['chitranna', 'elumichai sadam', 'nimmakaya pulihora', 'lemon sadam', 'nimbe chitranna'],
    [rice(100), water(250), oil(10), peanuts(15), chana(5), urad(3), lemon(15)], 340, [KATORI, PLATE]),
  r('curd-rice', 'Curd rice', ['thayir sadam', 'daddojanam', 'mosaranna', 'perugu annam', 'dahi chawal'],
    [rice(100), water(300), curd(200), milk(50), oil(5)], 600, [KATORI, PLATE]),
  r('puliyodarai', 'Puliyodarai (tamarind rice)', ['puliogare', 'pulihora', 'tamarind rice', 'puli sadam', 'kovil puliyodharai'],
    [rice(100), water(250), tamarind(20), sesameOil(20), peanuts(15), chana(5), urad(5), jaggery(5), sesame(5)], 360, [KATORI, PLATE]),
  r('coconut-rice', 'Coconut rice', ['thengai sadam', 'kobbari annam', 'kayi anna', 'thenga choru'],
    [rice(100), water(250), coconut(60), oil(10), cashews(8), chana(5), urad(5)], 380, [KATORI, PLATE]),
  r('tomato-rice', 'Tomato rice', ['thakkali sadam', 'tomato bath', 'tomato annam', 'tomato pulihora'],
    [rice(100), water(250), tomato(150), onion(50), oil(15)], 470, [KATORI, PLATE]),
  r('bisi-bele-bath', 'Bisi bele bath', ['bisibelebath', 'bisi bele huliyanna', 'sambar sadam karnataka'],
    [rice(70), toor(50), water(450), carrot(40), beans(30), peas(20), potato(40), onion(40), tamarind(10), ghee(20), oil(5), coconut(15), cashews(8)], 760, [KATORI, PLATE]),
  r('vangi-bath', 'Vangi bath', ['brinjal rice', 'vangibath', 'kathirikai sadam', 'vankaya annam'],
    [rice(100), water(250), eggplant(150), onion(30), oil(15), peanuts(10), coconut(10)], 480, [KATORI, PLATE]),
  r('mango-rice', 'Raw mango rice', ['mavinakayi chitranna', 'mamidikaya pulihora', 'mangai sadam', 'mango pulihora'],
    [rice(100), water(250), mango(70), oil(12), peanuts(15), coconut(10), chana(5)], 400, [KATORI, PLATE]),
  r('sambar-rice', 'Sambar rice', ['sambar sadam', 'sambar annam', 'sambhar rice'],
    [rice(80), toor(40), water(550), carrot(30), drumstick(40), eggplant(40), onion(40), tomato(40), tamarind(8), ghee(10), oil(5)], 800, [KATORI, PLATE]),
  r('rasam-rice', 'Rasam rice', ['rasam sadam', 'charu annam', 'saaru anna'],
    [rice(100), water(500), toor(15), tomato(60), tamarind(5), ghee(8)], 600, [KATORI, PLATE]),
  r('ghee-rice', 'Ghee rice', ['neychoru', 'nei choru', 'nei sadam', 'kerala ghee rice'],
    [rice(100), water(200), ghee(20), onion(30), cashews(8)], 320, [KATORI, PLATE]),
  r('pudina-rice', 'Mint rice', ['pudina sadam', 'pudina rice', 'pudina pulao south'],
    [rice(100), water(250), mint(30), onion(40), oil(12), peas(20)], 390, [KATORI, PLATE]),
  r('coriander-rice', 'Coriander rice', ['kothamalli sadam', 'kothimbir rice', 'kottambari soppu anna'],
    [rice(100), water(250), coriander(40), onion(30), oil(12), peanuts(10)], 380, [KATORI, PLATE]),
  r('curry-leaf-rice', 'Curry leaf rice', ['karuveppilai sadam', 'karivepaku annam'],
    [rice(100), water(250), oil(12), urad(10), chana(10), sesame(5)], 330, [KATORI, PLATE]),
  r('ellu-sadam', 'Sesame rice', ['ellu sadam', 'nuvvula annam', 'ellu anna', 'til rice'],
    [rice(100), water(250), sesame(25), sesameOil(8), urad(5)], 330, [KATORI, PLATE]),
  r('peanut-rice', 'Peanut rice', ['verkadalai sadam', 'palli annam', 'kadalekai chitranna'],
    [rice(100), water(250), peanuts(40), oil(8), urad(5)], 340, [KATORI, PLATE]),
  r('capsicum-rice', 'Capsicum rice', ['capsicum bath', 'donne menasinakai bath', 'kudamilagai sadam'],
    [rice(100), water(250), capsicum(120), onion(30), oil(12), peanuts(10)], 440, [KATORI, PLATE]),
  r('carrot-rice', 'Carrot rice', ['carrot sadam', 'carrot bath', 'gajar rice south'],
    [rice(100), water(250), carrot(120), onion(30), oil(12), cashews(8)], 440, [KATORI, PLATE]),
  r('paruppu-sadam', 'Paruppu sadam (dal rice)', ['paruppu sadam', 'pappu annam', 'bele anna', 'dal rice'],
    [rice(80), toor(40), water(450), ghee(10)], 520, [KATORI, PLATE]),
  r('keerai-sadam', 'Keerai sadam', ['spinach rice', 'palak rice south', 'soppu anna'],
    [rice(80), toor(30), amaranth(100), water(450), ghee(8)], 580, [KATORI, PLATE]),
  r('bagara-rice', 'Bagara rice', ['bagara khana', 'bagara annam', 'hyderabadi bagara rice'],
    [rice(100), water(200), oil(8), ghee(7), onion(40)], 320, [KATORI, PLATE]),
  r('rice-kanji', 'Rice kanji (rice porridge)', ['kanji', 'arisi kanji', 'ganji', 'paej', 'rice gruel'],
    [rice(50), water(450)], 450, [KATORI, GLASS]),
  r('matta-rice', 'Kerala matta rice, cooked', ['matta rice', 'kerala red rice', 'choru', 'rosematta rice', 'chemba ari choru'],
    [mattaRice(100), water(300)], 270, [KATORI, PLATE]),
  r('matta-kanji', 'Matta rice kanji', ['kanji vellam', 'kerala kanji', 'red rice kanji', 'pazhankanji'],
    [mattaRice(50), water(450)], 450, [KATORI, GLASS]),
  r('samai-curd-rice', 'Little millet curd rice', ['samai thayir sadam', 'millet curd rice', 'saame mosaranna'],
    [littleMillet(70), water(250), curd(200)], 480, [KATORI, PLATE]),

  // ---------- Rasam and charu ----------
  r('tomato-rasam', 'Tomato rasam', ['thakkali rasam', 'tomato charu', 'tomato saaru'],
    [tomato(150), tamarind(10), water(500), ghee(5)], 600, [KATORI, CUP]),
  r('paruppu-rasam', 'Paruppu rasam (dal rasam)', ['dal rasam', 'paruppu rasam', 'pappu rasam'],
    [toor(30), tomato(80), tamarind(10), water(550), ghee(5)], 610, [KATORI, CUP]),
  r('lemon-rasam', 'Lemon rasam', ['elumichai rasam', 'nimmakaya charu', 'nimbe saaru'],
    [toor(25), tomato(40), lemon(20), water(500), ghee(5)], 540, [KATORI, CUP]),
  r('pepper-rasam', 'Pepper rasam', ['milagu rasam', 'miriyala charu', 'menasu saaru'],
    [toor(10), tomato(40), tamarind(15), water(500), ghee(5)], 520, [KATORI, CUP]),
  r('jeera-rasam', 'Jeera rasam', ['jeeraga rasam', 'cumin rasam', 'jeelakarra charu'],
    [toor(10), tomato(60), tamarind(12), water(500), ghee(5)], 530, [KATORI, CUP]),
  r('garlic-rasam', 'Garlic rasam', ['poondu rasam', 'vellulli charu', 'bellulli saaru'],
    [garlic(20), tamarind(15), tomato(50), water(500), ghee(6)], 540, [KATORI, CUP]),
  r('mysore-rasam', 'Mysore rasam', ['mysore saaru', 'mysore rasam with coconut'],
    [toor(30), tomato(80), coconut(15), tamarind(10), water(500), ghee(8)], 590, [KATORI, CUP]),
  r('pineapple-rasam', 'Pineapple rasam', ['annasi rasam', 'ananas saaru'],
    [pineapple(80), toor(25), tomato(50), water(500), ghee(5)], 600, [KATORI, CUP]),
  r('ginger-rasam', 'Ginger rasam', ['inji rasam', 'allam charu'],
    [ginger(15), toor(20), tomato(50), lemon(15), water(500), ghee(5)], 550, [KATORI, CUP]),
  r('kollu-rasam', 'Horse gram rasam', ['kollu rasam', 'hurali saaru', 'ulava rasam'],
    [horseGram(40), water(600), tomato(50), tamarind(10), oil(5)], 640, [KATORI, CUP]),
  r('murungai-keerai-rasam', 'Drumstick leaves rasam', ['murungai keerai rasam', 'moringa rasam', 'munagaku charu'],
    [drumstickLeaves(40), toor(20), tomato(50), tamarind(8), water(500), ghee(5)], 570, [KATORI, CUP]),
  r('udupi-saaru', 'Udupi tomato saaru', ['udupi rasam', 'tomato saaru', 'udupi saaru'],
    [toor(30), tomato(100), coconut(10), jaggery(5), water(500), ghee(5)], 590, [KATORI, CUP]),
  r('veppampoo-rasam', 'Neem flower rasam', ['veppampoo rasam', 'bevu hoovina saaru', 'vepa puvvu charu'],
    [tamarind(12), tomato(40), water(500), ghee(8)], 510, [KATORI, CUP]),
  r('andhra-charu', 'Charu (Andhra tamarind rasam)', ['chaaru', 'pulusu charu', 'tomato charu andhra'],
    [tamarind(20), tomato(60), onion(20), water(500), oil(5), jaggery(3)], 550, [KATORI, CUP]),
  r('pappu-charu', 'Pappu charu', ['pappu chaaru', 'andhra dal rasam', 'kandi pappu charu'],
    [toor(40), tamarind(15), onion(40), tomato(40), drumstick(40), water(600), oil(8), jaggery(5)], 720, [KATORI]),
  r('ulava-charu', 'Ulava charu', ['ulavacharu', 'horse gram soup', 'kollu charu'],
    [horseGram(60), water(600), tamarind(10), oil(8), onion(30)], 560, [KATORI, CUP]),
  r('pachi-pulusu', 'Pachi pulusu', ['raw tamarind rasam', 'pachi pulusu andhra'],
    [tamarind(30), water(400), onion(50), jaggery(10)], 480, [KATORI, CUP]),
  r('bele-saaru', 'Bele saaru', ['bele saru', 'dal saaru', 'tovve saaru'],
    [toor(50), water(600), tomato(60), ghee(5), jaggery(5)], 660, [KATORI, CUP]),

  // ---------- Sambar varieties ----------
  r('drumstick-sambar', 'Drumstick sambar', ['murungakkai sambar', 'munagakaya sambar', 'nugge kayi huli'],
    [...sambarBase(), drumstick(120)], 800, [KATORI]),
  r('vengaya-sambar', 'Shallot sambar', ['vengaya sambar', 'chinna vengaya sambar', 'small onion sambar'],
    [toor(50), water(600), oil(10), shallots(120), tomato(50), tamarind(10)], 760, [KATORI]),
  r('brinjal-sambar', 'Brinjal sambar', ['kathirikai sambar', 'vankaya sambar', 'badanekayi huli'],
    [...sambarBase(), eggplant(150)], 820, [KATORI]),
  r('okra-sambar', 'Okra sambar', ['vendakkai sambar', 'bendakaya sambar', 'bhindi sambar'],
    [...sambarBase(), okra(120)], 800, [KATORI]),
  r('radish-sambar', 'Radish sambar', ['mullangi sambar', 'mullangi huli', 'mooli sambar'],
    [...sambarBase(), radish(150)], 820, [KATORI]),
  r('pumpkin-sambar', 'Pumpkin sambar', ['parangikai sambar', 'gummadikaya sambar', 'kumbalakai huli'],
    [...sambarBase(), pumpkin(150), jaggery(5)], 820, [KATORI]),
  r('arachuvitta-sambar', 'Arachuvitta sambar', ['arachu vitta sambar', 'coconut sambar', 'roasted coconut sambar'],
    [...sambarBase(), coconut(40), drumstick(60), eggplant(60)], 830, [KATORI]),
  r('tiffin-sambar', 'Tiffin sambar (hotel sambar for idli)', ['idli sambar', 'hotel sambar', 'tiffin sambar'],
    [toor(30), moong(15), water(650), onion(60), tomato(80), oil(8)], 760, [KATORI]),
  r('udupi-sambar', 'Udupi sambar', ['udupi huli', 'kodel', 'karnataka sambar', 'huli'],
    [toor(50), coconut(30), jaggery(10), ashGourd(150), water(600), ghee(8), tomato(40)], 800, [KATORI]),
  r('kerala-sambar', 'Kerala sambar', ['kerala sambar', 'varutharacha sambar', 'sadhya sambar'],
    [toor(50), coconut(30), coconutOil(10), drumstick(60), ashGourd(60), pumpkin(50), eggplant(50), okra(40), tamarind(10), water(600), tomato(40), onion(30)], 930, [KATORI]),
  r('mixed-veg-sambar', 'Mixed vegetable sambar', ['kaikari sambar', 'veg sambar', 'mixed sambar'],
    [...sambarBase(), carrot(40), beans(40), potato(50), drumstick(40), eggplant(40)], 880, [KATORI]),
  r('keerai-sambar', 'Keerai sambar', ['spinach sambar', 'thotakura sambar', 'soppu huli'],
    [...sambarBase(), amaranth(150)], 820, [KATORI]),
  r('chow-chow-sambar', 'Chow chow sambar', ['chayote sambar', 'seeme badanekayi huli', 'bangalore kathirikai sambar'],
    [...sambarBase(), chayote(150)], 820, [KATORI]),
  r('ash-gourd-sambar', 'Ash gourd sambar', ['poosanikai sambar', 'boodugumbala huli', 'kumbalanga sambar'],
    [...sambarBase(), ashGourd(150)], 820, [KATORI]),

  // ---------- Kuzhambu, pulusu, Kerala curries ----------
  r('vatha-kuzhambu', 'Vatha kuzhambu', ['vathal kuzhambu', 'vatral kuzhambu', 'sundakkai vathal kuzhambu'],
    [tamarind(30), sesameOil(25), water(400), shallots(50), jaggery(5)], 400, [SMALL_KATORI]),
  r('puli-kuzhambu', 'Puli kuzhambu', ['kathirikai puli kuzhambu', 'tamarind curry', 'pulusu'],
    [tamarind(30), sesameOil(20), eggplant(150), shallots(50), water(400), jaggery(5)], 540, [KATORI]),
  r('kara-kuzhambu', 'Chettinad kara kuzhambu', ['kara kuzhambu', 'chettinad kuzhambu', 'poondu kuzhambu', 'garlic kuzhambu'],
    [shallots(100), garlic(30), tamarind(25), sesameOil(25), tomato(60), water(350), coconut(20)], 500, [KATORI]),
  r('mor-kuzhambu', 'Mor kuzhambu', ['more kuzhambu', 'majjige huli', 'buttermilk curry', 'mor kulambu'],
    [curd(250), water(150), coconut(40), ashGourd(100), oil(8), toor(10)], 520, [KATORI]),
  r('poricha-kuzhambu', 'Poricha kuzhambu', ['poricha kulambu', 'pepper dal kuzhambu'],
    [moong(40), coconut(30), beans(100), chayote(100), water(400), oil(5)], 600, [KATORI]),
  r('milagu-kuzhambu', 'Milagu kuzhambu', ['pepper kuzhambu', 'milagu kulambu'],
    [tamarind(30), sesameOil(20), water(350), urad(10)], 330, [SMALL_KATORI]),
  r('paruppu-urundai-kuzhambu', 'Paruppu urundai kuzhambu', ['lentil ball curry', 'paruppu urundai kulambu'],
    [chana(60), toor(40), water(500), tamarind(25), sesameOil(20), shallots(50), tomato(50), coconut(20)], 650, [KATORI]),
  r('ennai-kathirikai', 'Ennai kathirikai kuzhambu', ['ennai kathirikai', 'ennegai', 'stuffed brinjal kuzhambu', 'yennegai'],
    [eggplant(250), sesameOil(35), peanuts(15), sesame(10), coconut(20), tamarind(20), shallots(50), water(250), jaggery(5)], 520, [KATORI]),
  r('kadalai-kuzhambu', 'Kadalai kuzhambu', ['karuppu kadalai kuzhambu', 'kala chana kuzhambu', 'black chickpea kuzhambu'],
    [chana(100), water(450), coconut(40), onion(60), tomato(60), oil(15), tamarind(10)], 650, [KATORI]),
  r('mochai-kuzhambu', 'Mochai kottai kuzhambu', ['mochai kuzhambu', 'field beans kuzhambu', 'avarekalu saaru'],
    [fieldBeansDry(80), water(450), tamarind(20), shallots(50), tomato(50), sesameOil(15)], 580, [KATORI]),
  r('vendakkai-mandi', 'Chettinad vendakkai mandi', ['vendakkai mandi', 'okra mandi', 'chettinad mandi'],
    [okra(150), shallots(60), garlic(15), tamarind(15), sesameOil(15), water(300)], 480, [KATORI]),
  r('ulli-theeyal', 'Ulli theeyal', ['theeyal', 'shallot theeyal', 'kerala theeyal'],
    [shallots(150), coconut(80), coconutOil(15), tamarind(15), water(300)], 470, [KATORI]),
  r('pavakka-theeyal', 'Pavakka theeyal', ['bitter gourd theeyal', 'pavakkai theeyal'],
    [bitterGourd(150), coconut(80), coconutOil(15), tamarind(15), shallots(40), water(300)], 500, [KATORI]),
  r('majjiga-pulusu', 'Majjiga pulusu', ['majjiga charu', 'buttermilk pulusu', 'sorakaya majjiga pulusu'],
    [curd(250), water(200), bottleGourd(100), coconut(20), chana(10), oil(8)], 550, [KATORI]),
  r('pulissery', 'Pulissery (moru curry)', ['moru curry', 'kerala moru curry', 'vellarikka pulissery', 'kumbalanga moru curry'],
    [curd(300), water(100), coconut(50), coconutOil(8), cucumber(80)], 500, [KATORI]),
  r('mambazha-pulissery', 'Mambazha pulissery', ['mango pulissery', 'ripe mango moru curry', 'mampazha kalan'],
    [curd(250), water(100), coconut(50), mango(150), jaggery(5), coconutOil(8)], 520, [KATORI]),
  r('moru-kachiyathu', 'Moru kachiyathu', ['seasoned buttermilk curry', 'moru kachiyathu kerala'],
    [curd(250), water(200), coconutOil(8), shallots(20)], 450, [KATORI]),
  r('kalan', 'Kalan', ['kurukku kalan', 'kerala kalan', 'chena kaya kalan'],
    [curd(300), yam(100), rawBanana(100), coconut(60), coconutOil(8), water(100)], 560, [KATORI]),
  r('bendakaya-pulusu', 'Bendakaya pulusu', ['okra pulusu', 'vendakkai puli kuzhambu', 'bhindi pulusu'],
    [okra(200), onion(50), tamarind(20), jaggery(10), oil(10), water(350)], 560, [KATORI]),
  r('gummadikaya-pulusu', 'Gummadikaya pulusu', ['pumpkin pulusu', 'parangikai puli kuzhambu'],
    [pumpkin(250), onion(40), tamarind(20), jaggery(15), oil(10), water(300)], 560, [KATORI]),

  // ---------- Andhra pappu and other dals ----------
  r('mudda-pappu', 'Mudda pappu (plain toor dal)', ['mudda pappu', 'paruppu', 'plain dal', 'bele', 'pappu'],
    [toor(100), water(400)], 450, [KATORI]),
  r('tomato-pappu', 'Tomato pappu', ['tomato dal andhra', 'tomato paruppu', 'tomato bele'],
    [toor(100), tomato(150), onion(40), oil(10), water(450)], 680, [KATORI]),
  r('palakura-pappu', 'Palakura pappu', ['spinach dal', 'palak pappu', 'keerai paruppu', 'palak dal andhra'],
    [toor(100), spinach(150), onion(30), oil(10), water(400)], 620, [KATORI]),
  r('gongura-pappu', 'Gongura pappu', ['gongura dal', 'pulicha keerai paruppu'],
    [toor(100), gongura(100), onion(30), oil(12), water(400)], 580, [KATORI]),
  r('dosakaya-pappu', 'Dosakaya pappu', ['yellow cucumber dal', 'dosakaya dal'],
    [toor(100), cucumber(150), tomato(40), oil(10), water(400)], 630, [KATORI]),
  r('mamidikaya-pappu', 'Mamidikaya pappu', ['raw mango dal', 'mangai paruppu', 'mavinakayi bele'],
    [toor(100), mango(100), onion(30), oil(10), water(400)], 580, [KATORI]),
  r('thotakura-pappu', 'Thotakura pappu', ['amaranth dal', 'keerai kootu dal', 'harive soppu bele'],
    [toor(100), amaranth(150), onion(30), oil(10), water(400)], 620, [KATORI]),
  r('beerakaya-pappu', 'Beerakaya pappu', ['ridge gourd dal', 'peerkangai paruppu', 'heerekai bele'],
    [toor(100), ridgeGourd(150), onion(30), oil(10), water(400)], 620, [KATORI]),
  r('sorakaya-pappu', 'Sorakaya pappu', ['bottle gourd dal', 'lauki dal andhra', 'suraikkai paruppu'],
    [toor(100), bottleGourd(150), onion(30), oil(10), water(400)], 620, [KATORI]),
  r('kerala-parippu-curry', 'Kerala parippu curry', ['parippu curry', 'moong dal with coconut', 'cherupayar parippu'],
    [moong(100), coconut(50), water(400), ghee(10)], 500, [KATORI]),
  r('sadhya-parippu', 'Sadhya parippu (with ghee)', ['parippu', 'nei parippu', 'kerala dal with ghee'],
    [moong(100), water(350), ghee(15)], 420, [KATORI]),
  r('cherupayar-curry', 'Cherupayar curry', ['green gram curry', 'whole moong curry kerala', 'payaru kuzhambu', 'kanji payar'],
    [moong(100), coconut(40), water(400), oil(10), onion(40)], 530, [KATORI]),
  r('kadala-curry', 'Kadala curry', ['kerala kadala curry', 'black chana curry kerala', 'puttu kadala'],
    [chana(100), water(400), coconut(50), onion(60), tomato(40), coconutOil(15)], 600, [KATORI]),
  r('karamani-kuzhambu', 'Karamani kuzhambu', ['black eyed beans curry', 'alasandalu kura', 'lobia south', 'thattapayaru curry'],
    [cowpeas(100), water(450), onion(60), tomato(60), coconut(30), oil(12), tamarind(8)], 640, [KATORI]),

  // ---------- Kerala sadhya and coconut curries ----------
  r('avial', 'Avial', ['aviyal', 'avail', 'mixed vegetable avial'],
    [rawBanana(80), yam(80), carrot(50), beans(50), drumstick(50), ashGourd(80), coconut(80), curd(60), coconutOil(15), water(50)], 530, [KATORI]),
  r('olan', 'Olan', ['kerala olan', 'ash gourd olan', 'kumbalanga olan'],
    [ashGourd(250), cowpeas(30), coconutMilk(150), water(150), coconutOil(8)], 520, [KATORI]),
  r('erissery', 'Erissery (pumpkin)', ['mathanga erissery', 'pumpkin erissery', 'erisseri'],
    [pumpkin(250), cowpeas(40), coconut(60), water(250), coconutOil(10)], 520, [KATORI]),
  r('kaya-chena-erissery', 'Kaya chena erissery', ['raw banana yam erissery', 'chena erissery'],
    [rawBanana(150), yam(150), coconut(60), water(250), coconutOil(10)], 530, [KATORI]),
  r('kootu-curry', 'Kootu curry (Kerala)', ['koottu curry', 'kerala kootu curry', 'sadhya koottukari'],
    [chana(60), rawBanana(100), yam(100), coconut(60), coconutOil(15), water(300)], 560, [KATORI]),
  r('kerala-veg-stew', 'Kerala vegetable stew', ['ishtu', 'veg stew', 'appam stew', 'vegetable ishtew'],
    [potato(100), carrot(50), beans(40), peas(30), onion(40), coconutMilk(150), water(150), coconutOil(10)], 520, [KATORI]),
  r('pineapple-pachadi', 'Pineapple pachadi', ['kaitha chakka pachadi', 'pineapple pachadi kerala'],
    [pineapple(150), coconut(40), curd(100), sugar(10), oil(5)], 290, [SMALL_KATORI]),
  r('beetroot-pachadi', 'Beetroot pachadi', ['beetroot kichadi', 'beetroot raita kerala'],
    [beetroot(150), coconut(40), curd(100), oil(5)], 270, [SMALL_KATORI]),
  r('vellarikka-kichadi', 'Cucumber kichadi', ['vellarikka kichadi', 'kerala kichadi', 'cucumber pachadi'],
    [cucumber(150), coconut(40), curd(150), oil(5)], 330, [SMALL_KATORI]),
  r('vendakka-kichadi', 'Okra kichadi', ['vendakka kichadi', 'vendakkai thayir pachadi', 'bhindi curd'],
    [okra(120), oil(12), coconut(30), curd(150)], 280, [SMALL_KATORI]),
  r('thayir-pachadi', 'Thayir pachadi', ['curd pachadi', 'perugu pachadi', 'mosaru bajji', 'onion cucumber raita south'],
    [curd(200), cucumber(80), onion(30), coconut(15), oil(3)], 320, [SMALL_KATORI]),
  r('inji-puli', 'Inji puli', ['puli inji', 'inji curry', 'ginger tamarind pickle'],
    [ginger(50), tamarind(40), jaggery(40), water(180), oil(10)], 200, [piece('1 tbsp (15 g)', 15)]),
  r('pineapple-gojju', 'Pineapple gojju', ['ananas gojju', 'pineapple menaskai'],
    [pineapple(200), jaggery(25), tamarind(10), oil(8), water(100)], 260, [SMALL_KATORI]),
  r('kosambari', 'Kosambari', ['hesarubele kosambari', 'moong dal salad', 'cucumber kosambari'],
    [moong(50), water(40), cucumber(100), carrot(50), coconut(20), lemon(10), oil(3)], 270, [SMALL_KATORI]),
  r('kappa-puzhukku', 'Kappa puzhukku', ['tapioca mash', 'kappa vevichathu', 'maravalli kizhangu', 'kappa'],
    [cassava(300), coconut(50), coconutOil(10), water(100), shallots(15)], 420, [KATORI, PLATE]),

  // ---------- Kurma, masala, Andhra and Hyderabadi curries ----------
  r('veg-kurma', 'Vegetable kurma', ['veg kurma', 'kaikari kurma', 'hotel kurma', 'vegetable korma south'],
    [potato(100), carrot(50), beans(50), peas(50), coconut(40), cashews(10), onion(60), tomato(60), oil(15), water(250)], 600, [KATORI]),
  r('chettinad-veg-kurma', 'Chettinad vegetable kurma', ['chettinad kurma', 'chettinad veg curry'],
    [potato(100), carrot(50), beans(50), peas(50), coconut(50), onion(60), tomato(60), oil(20), water(250)], 600, [KATORI]),
  r('chettinad-mushroom', 'Chettinad mushroom masala', ['mushroom chettinad', 'kaalan chettinad', 'mushroom pepper fry'],
    [mushroom(200), onion(80), tomato(80), coconut(30), oil(20), water(100)], 400, [KATORI]),
  r('chettinad-potato-roast', 'Chettinad potato roast', ['urulai roast chettinad', 'chettinad urulaikizhangu'],
    [potato(300), oil(20), onion(30)], 280, [KATORI]),
  r('potato-masala', 'Potato masala (poori masala)', ['poori masala', 'urulaikizhangu masala', 'bangaladumpa kura', 'aloo palya', 'dosa masala'],
    [potato(300), onion(80), oil(12), water(150), chana(5)], 480, [KATORI]),
  r('gutti-vankaya', 'Gutti vankaya kura', ['gutti vankaya', 'stuffed brinjal curry andhra', 'bharwa baingan andhra'],
    [eggplant(250), peanuts(30), sesame(10), coconut(20), onion(60), oil(30), tamarind(10), water(100)], 420, [KATORI]),
  r('bagara-baingan', 'Bagara baingan', ['baghare baingan', 'hyderabadi baingan', 'bagara baigan'],
    [eggplant(250), peanuts(30), sesame(15), desiccated(15), onion(60), oil(30), tamarind(15), water(150), jaggery(5)], 470, [KATORI]),
  r('mirchi-ka-salan', 'Mirchi ka salan', ['mirchi salan', 'hyderabadi mirchi ka salan'],
    [greenChilli(150), peanuts(30), sesame(15), desiccated(15), onion(60), oil(30), tamarind(15), water(200)], 420, [KATORI]),
  r('vankaya-kura', 'Vankaya kura', ['brinjal curry andhra', 'kathirikai kootu masala', 'badanekayi palya'],
    [eggplant(300), onion(60), tomato(60), oil(18)], 340, [KATORI]),
  r('beerakaya-kura', 'Beerakaya kura (ridge gourd with milk)', ['beerakaya pala kura', 'ridge gourd curry', 'peerkangai kootu'],
    [ridgeGourd(300), onion(40), oil(12), milk(50)], 320, [KATORI]),
  r('cabbage-kura', 'Cabbage kura', ['kosu kura', 'cabbage curry andhra'],
    [cabbage(300), chana(10), oil(12), coconut(10)], 270, [KATORI]),

  // ---------- Kootu and masiyal ----------
  r('chow-chow-kootu', 'Chow chow kootu', ['chayote kootu', 'bangalore kathirikai kootu'], kootu(chayote(200)), 430, [KATORI]),
  r('cabbage-kootu', 'Cabbage kootu', ['muttaikose kootu', 'cabbage dal'], kootu(cabbage(200)), 430, [KATORI]),
  r('pumpkin-kootu', 'Pumpkin kootu', ['parangikai kootu', 'yellow pumpkin kootu'], kootu(pumpkin(200)), 430, [KATORI]),
  r('keerai-kootu', 'Keerai kootu', ['spinach kootu', 'palak kootu', 'soppu kootu'], kootu(spinach(200)), 420, [KATORI]),
  r('poosanikai-kootu', 'Ash gourd kootu', ['poosanikai kootu', 'vellai poosani kootu', 'kumbalanga kootu'], kootu(ashGourd(200)), 430, [KATORI]),
  r('avarakkai-kootu', 'Avarakkai kootu', ['broad beans kootu', 'chikkudukaya kootu'], kootu(fieldBeans(200)), 430, [KATORI]),
  r('beans-kootu', 'Beans kootu', ['green beans kootu', 'beans dal curry'], kootu(beans(200)), 430, [KATORI]),
  r('vazhakkai-kootu', 'Raw banana kootu', ['vazhakkai kootu', 'aratikaya kootu'], kootu(rawBanana(200), chana(40)), 430, [KATORI]),
  r('kathirikai-kootu', 'Brinjal kootu', ['kathirikai kootu', 'vankaya kootu'], kootu(eggplant(200)), 430, [KATORI]),
  r('keerai-masiyal', 'Keerai masiyal', ['keerai kadaiyal', 'mashed greens', 'pappu koora'],
    [amaranth(250), moong(30), water(100), oil(5)], 320, [KATORI]),
  r('beans-usili', 'Beans paruppu usili', ['beans usili', 'paruppu usili', 'beans dal crumble'],
    [beans(250), toor(40), chana(30), water(40), oil(15)], 330, [KATORI]),

  // ---------- Poriyal / palya ----------
  r('beans-poriyal', 'Beans poriyal', ['beans palya', 'beans koora', 'french beans stir fry'], poriyal(beans(250)), 230, [KATORI]),
  r('cabbage-poriyal', 'Cabbage poriyal', ['cabbage palya', 'muttaikose poriyal', 'cabbage stir fry'], poriyal(cabbage(250)), 230, [KATORI]),
  r('carrot-poriyal', 'Carrot poriyal', ['carrot palya', 'carrot koora', 'carrot stir fry'], poriyal(carrot(250)), 230, [KATORI]),
  r('beetroot-poriyal', 'Beetroot poriyal', ['beetroot palya', 'beetroot koora', 'beetroot stir fry'], poriyal(beetroot(250)), 230, [KATORI]),
  r('brinjal-poriyal', 'Brinjal poriyal', ['kathirikai poriyal', 'badanekayi palya'], poriyal(eggplant(250)), 220, [KATORI]),
  r('chow-chow-poriyal', 'Chow chow poriyal', ['chayote poriyal', 'seeme badanekai palya'], poriyal(chayote(250)), 220, [KATORI]),
  r('avarakkai-poriyal', 'Avarakkai poriyal', ['broad beans poriyal', 'chikkudukaya fry'], poriyal(fieldBeans(250)), 230, [KATORI]),
  r('cauliflower-poriyal', 'Cauliflower poriyal', ['gobi poriyal', 'cauliflower palya'], poriyal(cauliflower(250)), 230, [KATORI]),
  r('radish-poriyal', 'Radish poriyal', ['mullangi poriyal', 'mullangi palya'], poriyal(radish(250)), 220, [KATORI]),
  r('vazhakkai-poriyal', 'Raw banana poriyal', ['vazhakkai poriyal', 'aratikaya fry', 'balekai palya', 'plantain stir fry'],
    [rawBanana(250), oil(12), coconut(15), urad(3)], 240, [KATORI]),
  r('keerai-poriyal', 'Keerai poriyal', ['amaranth stir fry', 'thotakura vepudu', 'harive soppu palya'],
    [amaranth(250), coconut(20), oil(12), onion(30)], 200, [KATORI]),
  r('murungai-keerai-poriyal', 'Drumstick leaves poriyal', ['murungai keerai poriyal', 'moringa leaves stir fry', 'munagaku vepudu'],
    [drumstickLeaves(80), coconut(40), oil(8), onion(40)], 140, [SMALL_KATORI]),
  r('urulai-roast', 'Potato roast (urulai roast)', ['urulaikizhangu roast', 'potato fry south', 'aloo roast'],
    [potato(300), oil(20)], 250, [KATORI]),
  r('vendakkai-fry', 'Vendakkai fry', ['okra fry south', 'vendakkai poriyal', 'bhindi fry south'],
    [okra(250), oil(20)], 190, [KATORI]),
  r('pavakkai-fry', 'Pavakkai fry', ['bitter gourd fry', 'pavakkai poriyal', 'karela fry south'],
    [bitterGourd(250), oil(20), onion(30), jaggery(5)], 200, [KATORI]),
  r('senai-roast', 'Senai roast', ['yam roast', 'elephant yam fry', 'kanda fry', 'suvarna gadde fry'],
    [yam(250), oil(20)], 220, [KATORI]),
  r('seppankizhangu-roast', 'Seppankizhangu roast', ['arbi roast', 'colocasia fry', 'chamadumpa vepudu', 'kesuvina gadde fry'],
    [taro(250), oil(22)], 220, [KATORI]),
  r('bendakaya-vepudu', 'Bendakaya vepudu', ['okra fry andhra', 'bendakaya fry'],
    [okra(250), oil(25), peanuts(10)], 190, [KATORI]),
  r('aloo-vepudu', 'Bangaladumpa vepudu', ['aloo fry andhra', 'potato fry andhra'],
    [potato(300), oil(25)], 260, [KATORI]),
  r('kakarakaya-fry', 'Kakarakaya fry', ['kakarakaya vepudu', 'bitter gourd fry andhra', 'hagalakai gojju fry'],
    [bitterGourd(250), onion(40), oil(30), jaggery(10)], 210, [KATORI]),

  // ---------- Kerala thoran and mezhukkupuratti ----------
  r('cabbage-thoran', 'Cabbage thoran', ['cabbage thoran kerala', 'muttakose thoran'], thoran(cabbage(250)), 260, [KATORI]),
  r('beans-thoran', 'Beans thoran', ['payar thoran', 'beans upperi'], thoran(beans(250)), 260, [KATORI]),
  r('beetroot-thoran', 'Beetroot thoran', ['beetroot thoran kerala'], thoran(beetroot(250)), 260, [KATORI]),
  r('carrot-thoran', 'Carrot thoran', ['carrot thoran kerala'], thoran(carrot(250)), 260, [KATORI]),
  r('kaya-thoran', 'Raw banana thoran', ['kaya thoran', 'vazhakka thoran', 'plantain thoran'], thoran(rawBanana(250)), 270, [KATORI]),
  r('cheera-thoran', 'Cheera thoran', ['amaranth thoran', 'red spinach thoran', 'cheera upperi'], thoran(amaranth(250)), 220, [KATORI]),
  r('muringa-ila-thoran', 'Muringa ila thoran', ['drumstick leaves thoran', 'moringa thoran'], [drumstickLeaves(100), coconut(50), coconutOil(10), shallots(20)], 160, [SMALL_KATORI]),
  r('kaya-mezhukkupuratti', 'Kaya mezhukkupuratti', ['raw banana mezhukkupuratti', 'kaya upperi'],
    [rawBanana(250), coconutOil(15), shallots(20)], 240, [KATORI]),
  r('beans-mezhukkupuratti', 'Beans mezhukkupuratti', ['payar mezhukkupuratti', 'beans stir fry kerala'],
    [beans(250), coconutOil(12), shallots(20)], 230, [KATORI]),
  r('chena-mezhukkupuratti', 'Chena mezhukkupuratti', ['yam mezhukkupuratti', 'chena upperi'],
    [yam(250), coconutOil(15), shallots(20)], 240, [KATORI]),

  // ---------- Chutneys, pachadi, thogayal ----------
  r('coconut-chutney', 'Coconut chutney', ['thengai chutney', 'kobbari pachadi', 'kayi chutney', 'white chutney'],
    [coconut(100), roastedGram(15), greenChilli(10), water(80), oil(5)], 205, [TBSP2, SMALL_KATORI]),
  r('kerala-coconut-chutney', 'Coconut chutney (without dal)', ['thenga chutney', 'kerala coconut chutney', 'coconut shallot chutney'],
    [coconut(100), shallots(15), greenChilli(8), water(70), coconutOil(5)], 195, [TBSP2, SMALL_KATORI]),
  r('tomato-chutney', 'Tomato chutney', ['thakkali chutney', 'tomato pachadi', 'tomato thokku', 'tomato gojju'],
    [tomato(200), onion(50), oil(12)], 180, [TBSP2, SMALL_KATORI]),
  r('onion-chutney', 'Onion chutney', ['vengaya chutney', 'ullipaya pachadi', 'eerulli chutney'],
    [onion(150), tamarind(5), oil(12), urad(5)], 130, [TBSP2]),
  r('peanut-chutney', 'Peanut chutney', ['verkadalai chutney', 'palli chutney', 'kadalekai chutney', 'groundnut chutney'],
    [peanuts(60), water(80), oil(5), greenChilli(5)], 145, [TBSP2]),
  r('coriander-chutney-south', 'Coriander coconut chutney', ['kothamalli chutney', 'kottambari chutney', 'green chutney south'],
    [coriander(60), coconut(30), urad(10), water(40), oil(3), tamarind(3)], 140, [TBSP2]),
  r('pudina-thuvaiyal', 'Mint chutney (pudina thuvaiyal)', ['pudina chutney', 'pudina thogayal', 'mint coconut chutney'],
    [mint(40), coconut(30), urad(10), oil(5), water(40)], 120, [TBSP2]),
  r('gongura-pachadi', 'Gongura pachadi', ['gongura chutney', 'pulicha keerai thokku', 'gongura thokku'],
    [gongura(150), oil(20), onion(30)], 130, [TBSP2]),
  r('kara-chutney', 'Kara chutney', ['red chutney', 'kaara chutney', 'onion tomato chutney'],
    [onion(100), tomato(50), oil(12)], 120, [TBSP2]),
  r('garlic-chutney-south', 'Garlic chutney', ['poondu chutney', 'vellulli karam', 'bellulli chutney'],
    [garlic(50), tamarind(5), oil(10), chilliPowder(5), water(30)], 90, [piece('1 tbsp (15 g)', 15)]),
  r('kadalai-paruppu-chutney', 'Chana dal chutney', ['kadalai paruppu chutney', 'senagapappu pachadi', 'putani chutney'],
    [chana(40), coconut(30), water(60), oil(5)], 130, [TBSP2]),
  r('paruppu-thogayal', 'Paruppu thogayal', ['paruppu thuvaiyal', 'dal chutney'],
    [toor(30), chana(20), coconut(30), oil(5), water(60)], 140, [TBSP2]),
  r('beerakaya-pachadi', 'Ridge gourd chutney', ['beerakaya pachadi', 'peerkangai thogayal', 'heerekai chutney'],
    [ridgeGourd(150), oil(10), urad(10), chana(5), tamarind(5)], 140, [TBSP2]),
  r('allam-pachadi', 'Allam pachadi (ginger chutney)', ['allam chutney', 'inji chutney', 'ginger chutney'],
    [ginger(50), tamarind(20), jaggery(20), oil(8), water(60)], 140, [piece('1 tbsp (15 g)', 15)]),
  r('kandi-pachadi', 'Kandi pachadi', ['toor dal chutney', 'kandi pappu pachadi'],
    [toor(60), chilliPowder(3), oil(5), water(80)], 145, [TBSP2]),
  r('ellu-chutney', 'Sesame chutney', ['ellu chutney', 'nuvvula pachadi', 'til chutney south'],
    [sesame(40), urad(10), coconut(20), water(60), oil(3)], 130, [TBSP2]),
  r('chammanthi', 'Thenga chammanthi', ['chammanthi', 'coconut chammanthi', 'ulli chammanthi'],
    [coconut(100), shallots(20), coconutOil(5), tamarind(3)], 125, [TBSP2]),
  r('mango-chammanthi', 'Raw mango chammanthi', ['manga chammanthi', 'mangai thogayal'],
    [coconut(80), mango(40), shallots(15), coconutOil(3)], 135, [TBSP2]),
  r('avakaya', 'Avakaya (Andhra mango pickle)', ['avakaya pachadi', 'aavakaaya', 'andhra mango pickle', 'mamidikaya pachadi'],
    [mango(300), sesameOil(150), mustardPowder(30), chilliPowder(50)], 520, [piece('1 tbsp (15 g)', 15)]),

  // ---------- Podi ----------
  r('idli-podi', 'Idli podi (milagai podi)', ['milagai podi', 'gunpowder', 'chutney podi tamil', 'karam podi', 'idly podi'],
    [urad(50), chana(50), sesame(20), chilliPowder(15), oil(3)], 130, [TBSP]),
  r('podi-with-oil', 'Idli podi with sesame oil', ['podi with oil', 'milagai podi ennai', 'gunpowder with oil'],
    [urad(6), chana(6), sesame(2), chilliPowder(1), sesameOil(5)], 20, [piece('2 tsp podi + 1 tsp oil', 20)]),
  r('paruppu-podi', 'Paruppu podi', ['dal powder', 'paruppu podi rice'],
    [toor(60), chana(30), moong(20)], 105, [TBSP]),
  r('kandi-podi', 'Kandi podi', ['andhra gunpowder', 'kandi pappu podi'],
    [toor(60), chana(30), chilliPowder(10)], 96, [TBSP]),
  r('ellu-podi', 'Ellu podi', ['sesame podi', 'nuvvula podi', 'til podi'],
    [sesame(80), urad(20), chilliPowder(10)], 105, [TBSP]),
  r('chutney-pudi', 'Chutney pudi', ['chutney powder', 'karnataka chutney pudi'],
    [chana(40), urad(40), desiccated(40), chilliPowder(10), jaggery(5), tamarind(5)], 135, [TBSP]),
  r('palli-podi', 'Palli podi', ['peanut podi', 'kadalekai pudi', 'verkadalai podi'],
    [peanuts(100), chilliPowder(10), garlic(10)], 112, [TBSP]),
  r('chammanthi-podi', 'Chammanthi podi', ['coconut podi', 'thenga podi', 'kobbari karam'],
    [desiccated(100), urad(20), chilliPowder(10), tamarind(5)], 130, [TBSP]),

  // ---------- Vada, bonda, bajji and fried snacks ----------
  r('medu-vada', 'Medu vada', ['ulundu vadai', 'uddina vade', 'garelu', 'uzhunnu vada', 'vada', 'medu vadai'],
    meduVada(), 240, [piece('1 vada', 40)]),
  r('sambar-vada', 'Sambar vada', ['sambar vadai', 'vada sambar', 'sambar garelu'],
    [...meduVada(), toor(30), water(400), onion(30), tomato(40), oil(5)], 690, [piece('2 vadas with sambar', 230)]),
  r('rasam-vada', 'Rasam vada', ['rasam vadai', 'charu garelu'],
    [...meduVada(), toor(10), tomato(60), tamarind(10), water(400), ghee(4)], 670, [piece('2 vadas with rasam', 220)]),
  r('thayir-vada', 'Thayir vada', ['thayir vadai', 'perugu vada', 'mosaru vade', 'curd vada'],
    [...meduVada(), curd(300), water(50), oil(3)], 600, [piece('1 thayir vada', 100)]),
  r('masala-vada', 'Masala vada', ['paruppu vadai', 'masal vadai', 'chana dal vada', 'ambode', 'masala vade'],
    [chana(100), onion(40), water(20), oil(25)], 170, [piece('1 vada', 28)]),
  r('keerai-vadai', 'Keerai vadai', ['spinach vada', 'soppu ambode'],
    [chana(100), amaranth(50), onion(30), water(15), oil(28)], 190, [piece('1 vada', 30)]),
  r('parippu-vada', 'Parippu vada', ['kerala parippu vada', 'parippuvada'],
    [toor(70), chana(30), shallots(40), water(15), oil(25)], 165, [piece('1 vada', 33)]),
  r('maddur-vada', 'Maddur vada', ['maddur vade', 'maddur vadai'],
    [riceFlour(50), sooji(30), maida(20), onion(60), oil(35), water(20)], 180, [piece('1 vada', 36)]),
  r('mysore-bonda', 'Mysore bonda', ['mysore bajji', 'goli bajji', 'maida bonda'],
    [maida(100), curd(80), riceFlour(15), water(10), oil(35), coconut(10)], 220, [piece('1 bonda', 35)]),
  r('goli-baje', 'Goli baje (Mangalore bajji)', ['goli baje', 'mangalore bajji', 'mangalore bonda'],
    [maida(100), curd(100), riceFlour(10), oil(30)], 210, [piece('1 goli baje', 21)]),
  r('aloo-bonda', 'Aloo bonda', ['urulaikizhangu bonda', 'potato bonda', 'bangaladumpa bonda'],
    [potato(200), onion(30), besan(60), water(60), riceFlour(10), oil(35)], 340, [piece('1 bonda', 42)]),
  r('vazhakkai-bajji', 'Raw banana bajji', ['vazhakkai bajji', 'aratikaya bajji', 'balekai bajji', 'plantain bajji'], fritter(rawBanana(150)), 300, [piece('1 bajji', 30)]),
  r('kathirikai-bajji', 'Brinjal bajji', ['kathirikai bajji', 'vankaya bajji', 'badanekayi bajji'], fritter(eggplant(150)), 280, [piece('1 bajji', 28)]),
  r('ulli-vada', 'Ulli vada (Kerala onion fritter)', ['ullivada', 'kerala onion vada', 'onion vada'],
    [onion(200), maida(40), riceFlour(10), besan(30), oil(30), water(20)], 250, [piece('1 ulli vada', 40)]),
  r('pazham-pori', 'Pazham pori', ['ethakka appam', 'banana fritters', 'vazhakkai pori', 'pazhampori'],
    [ripePlantain(200), maida(60), riceFlour(10), sugar(10), water(60), oil(30)], 320, [piece('1 pazham pori', 55)]),
  r('mangalore-buns', 'Mangalore buns', ['banana buns', 'mangalore banana puri', 'buns udupi'],
    [maida(100), banana(60), sugar(15), curd(20), oil(20)], 190, [piece('1 bun', 48)]),
  r('kerala-pappadam', 'Kerala pappadam, fried', ['pappadam', 'appalam', 'pappadum', 'happala', 'papad fried'],
    [papad(30), oil(8)], 38, [piece('1 pappadam', 10)]),
  r('tapioca-chips', 'Tapioca chips', ['kappa chips', 'kappa varuthathu', 'maravalli kizhangu chips'],
    [cassavaChips(100)], 100, [piece('1 handful (25 g)', 25)]),
  r('thenkuzhal-murukku', 'Murukku', ['thenkuzhal', 'kai murukku', 'chakkuli', 'jantikalu', 'rice murukku'],
    [riceFlour(100), urad(20), butter(10), water(70), oil(30)], 160, [piece('1 murukku', 15)]),
  r('thattai', 'Thattai', ['thattai murukku', 'chekkalu', 'nippattu tamil', 'rice crackers'],
    [riceFlour(100), urad(10), chana(10), butter(10), water(60), oil(30)], 160, [piece('1 thattai', 10)]),
  r('ribbon-pakoda', 'Ribbon pakoda', ['ola pakoda', 'nada murukku', 'ribbon murukku'],
    [riceFlour(50), besan(50), butter(10), water(60), oil(30)], 140, [piece('1 handful (25 g)', 25)]),
  r('chegodilu', 'Chegodilu', ['chegodi', 'ring murukku'],
    [riceFlour(100), water(100), chana(15), butter(5), oil(30)], 160, [piece('1 handful (25 g)', 25)]),
  r('sakinalu', 'Sakinalu', ['chakinalu', 'telangana sakinalu'],
    [riceFlour(100), sesame(15), water(50), oil(25)], 135, [piece('1 sakinam', 15)]),
  r('nippattu', 'Nippattu', ['nippat', 'karnataka nippattu'],
    [riceFlour(70), peanuts(20), chana(10), butter(10), water(40), oil(25)], 130, [piece('1 nippattu', 12)]),
  r('kodubale', 'Kodubale', ['kodbale', 'karnataka kodubale'],
    [riceFlour(70), sooji(15), maida(15), coconut(15), butter(10), water(60), oil(30)], 150, [piece('1 handful (25 g)', 25)]),
  r('sarva-pindi', 'Sarva pindi', ['sarvapindi', 'ginne appa', 'telangana rice roti'],
    [riceFlour(100), chana(15), peanuts(15), sesame(5), oil(15), water(80), onion(30)], 230, [piece('1 sarva pindi', 115)]),

  // ---------- Sundal ----------
  r('chana-sundal', 'Chana sundal', ['kondakadalai sundal', 'senagala guggillu', 'kadale usli', 'chickpea sundal'],
    [chana(100), water(130), coconut(20), oil(5)], 245, [piece('1 cup (100 g)', 100)]),
  r('peanut-sundal', 'Peanut sundal', ['verkadalai sundal', 'boiled peanut sundal', 'kadalekai usli'],
    [peanuts(100), water(80), coconut(15), oil(3)], 185, [piece('1 cup (75 g)', 75)]),
  r('moong-sundal', 'Moong sundal', ['pachai payaru sundal', 'pesara guggillu', 'hesaru kalu usli'],
    [moong(100), water(120), coconut(15), oil(5)], 230, [piece('1 cup (100 g)', 100)]),
  r('karamani-sundal', 'Karamani sundal', ['black eyed peas sundal', 'alasanda guggillu', 'lobia sundal'],
    [cowpeas(100), water(130), coconut(15), oil(5)], 240, [piece('1 cup (100 g)', 100)]),
  r('sweet-corn-sundal', 'Sweet corn sundal', ['corn sundal', 'makka sundal'],
    [sweetCorn(200), coconut(25), oil(12)], 220, [piece('1 cup (100 g)', 100)]),
  r('peas-sundal', 'Green peas sundal', ['pattani sundal', 'batani usli'],
    [peas(200), coconut(15), oil(5)], 210, [piece('1 cup (100 g)', 100)]),
]
