// More South Indian vegetarian dishes, state by state: Karnataka (Udupi,
// Bangalore darshini, Mangalorean, Kodava, North Karnataka), Andhra Pradesh and
// Telangana (Guntur, Rayalaseema, Hyderabadi veg), Tamil Nadu (Chettinad, Kongu,
// Tirunelveli, Madurai, temple food), Kerala (Malabar, Travancore, sadhya,
// tea-shop), Lakshadweep, plus hotel tiffin combos, mixed rice, podi, thokku and
// millet dishes. Sweets live elsewhere. Typical home or hotel batch amounts,
// written by us; see docs/indian-food-database.md. Deep-fried items list only
// the oil absorbed. Small amounts of spices, salt and herbs are left out.

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
const flaxseed = u(169414) // Seeds, flaxseed
const cashews = u(170162) // Nuts, cashew nuts, raw
const raisins = u(168165) // Raisins, dark, seedless
const butter = u(173410) // Butter, salted
const cheese = u(171290) // Cheese, pasteurized process, American, without added vitamin D
const buttermilk = u(170874) // Milk, buttermilk, fluid, cultured, lowfat
const riceFlour = u(169714) // Rice flour, white, unenriched
const parboiled = u(169758) // Rice, white, long-grain, parboiled, unenriched, dry
const puffedRice = u(173912) // Cereals ready-to-eat, rice, puffed, fortified
const maida = u(169761) // Wheat flour, white, all-purpose, unenriched
const bulgur = u(170688) // Bulgur, dry
const oats = u(173904) // Cereals, oats, regular and quick, not fortified, dry
const sorghumFlour = u(168943) // Sorghum flour, whole-grain
const sorghum = u(169716) // Sorghum grain
const cornmeal = u(169697) // Cornmeal, whole-grain, yellow
const cornstarch = u(169698) // Cornstarch
const sago = u(169717) // Tapioca, pearl, dry
const bread = u(174924) // Bread, white, commercially prepared
const cowpeas = u(173758) // Cowpeas, common, mature seeds, raw (karamani, vanpayar)
const fieldBeansDry = u(175210) // Hyacinth beans, mature seeds, raw (mochai)
const fieldBeans = u(169234) // Hyacinth-beans, immature seeds, raw (avarakkai, avarekalu)
const splitPeas = u(172428) // Peas, green, split, mature seeds, raw (dried green peas)
const moongSprouts = u(169957) // Mung beans, mature seeds, sprouted, raw
const tamarind = u(167763) // Tamarinds, raw
const lemon = u(167747) // Lemon juice, raw
const lime = u(168155) // Limes, raw
const eggplant = u(169228) // Eggplant, raw
const drumstick = u(170483) // Drumstick pods, raw
const drumstickLeaves = u(168416) // Drumstick leaves, raw
const ashGourd = u(170069) // Waxgourd, raw
const pumpkin = u(168448) // Pumpkin, raw
const rawBanana = u(168215) // Plantains, green, raw
const ripePlantain = u(169130) // Plantains, yellow, raw
const banana = u(173944) // Bananas, raw
const bananaChips = u(168849) // Snacks, banana chips
const yam = u(170071) // Yam, raw
const taro = u(169308) // Taro, raw
const taroLeaves = u(168487) // Taro leaves, raw
const sweetPotato = u(168482) // Sweet potato, raw, unprepared
const bitterGourd = u(168393) // Balsam-pear (bitter gourd), pods, raw
const ridgeGourd = u(168414) // Gourd, dishcloth (towelgourd), raw
const bottleGourd = u(169232) // Gourd, white-flowered (calabash), raw
const cabbage = u(169975) // Cabbage, raw
const beans = u(169961) // Beans, snap, green, raw
const yardlong = u(169222) // Yardlong bean, raw (achinga payar)
const beetroot = u(169145) // Beets, raw
const amaranth = u(168385) // Amaranth leaves, raw (cheera, thotakura)
const cucumber = u(168409) // Cucumber, with peel, raw
const shallots = u(170499) // Shallots, raw
const garlic = u(169230) // Garlic, raw
const ginger = u(169231) // Ginger root, raw
const mango = u(169910) // Mangos, raw (ripe)
const cassava = u(169985) // Cassava, raw
const sweetCorn = u(169998) // Corn, sweet, yellow, raw
const peas = u(170419) // Peas, green, raw
const capsicum = u(170427) // Peppers, sweet, green, raw
const greenChilli = u(170497) // Peppers, hot chili, green, raw
const redChilli = u(170106) // Peppers, hot chili, red, raw
const chilliPowder = u(171319) // Spices, chili powder
const pepper = u(170931) // Spices, pepper, black
const corianderSeed = u(170922) // Spices, coriander seed
const fenugreek = u(171324) // Spices, fenugreek seed
const poppy = u(171330) // Spices, poppy seed
const mustardPowder = u(170929) // Spices, mustard seed, ground
const pineapple = u(168193) // Pineapple, raw, traditional varieties
const radish = u(169276) // Radishes, raw
const chayote = u(170402) // Chayote, fruit, raw
const jackfruit = u(174687) // Jackfruit, raw (ripe)
const dill = u(172233) // Dill weed, fresh
const coriander = u(169997) // Coriander (cilantro) leaves, raw
const mushroom = u(169251) // Mushrooms, white, raw
const bambooShoot = u(169210) // Bamboo shoots, raw
const catsup = u(168556) // Catsup
const papad = u(168106) // Papad
const tea = u(173227) // Beverages, tea, black, brewed, prepared with tap water
const coffee = u(171890) // Beverages, coffee, brewed, prepared with tap water

// Catalogue ingredients
const rice = (g: number) => ing('rice', g)
const urad = (g: number) => ing('urad-dal', g)
const toor = (g: number) => ing('toor-dal', g)
const moong = (g: number) => ing('moong-dal', g)
const masoor = (g: number) => ing('masoor-dal', g)
const chana = (g: number) => ing('chana', g) // chickpeas / bengal gram: chana dal, kala chana
const rajma = (g: number) => ing('rajma', g)
const besan = (g: number) => ing('besan', g)
const sooji = (g: number) => ing('sooji', g)
const atta = (g: number) => ing('atta', g)
const poha = (g: number) => ing('poha', g)
const water = (g: number) => ing('water', g)
const oil = (g: number) => ing('oil', g)
const ghee = (g: number) => ing('ghee', g)
const curd = (g: number) => ing('curd', g)
const milk = (g: number) => ing('milk', g)
const paneer = (g: number) => ing('paneer', g)
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
const methi = (g: number) => ing('methi-leaves', g)
const horseGram = (g: number) => ing('horse-gram', g)
const schezwan = (g: number) => ing('schezwan-sauce', g)
const roastedGram = (g: number) => ing('south-roasted-gram', g)
const gongura = (g: number) => ing('south-gongura', g)
const foxtail = (g: number) => ing('south-foxtail-millet', g)
const littleMillet = (g: number) => ing('south-little-millet', g)
const pearlMillet = (g: number) => ing('south-pearl-millet', g)
const mattaRice = (g: number) => ing('south-matta-rice', g)
const samak = (g: number) => ing('north-samak-rice', g) // barnyard millet (kuthiraivali)
const rawJackfruit = (g: number) => ing('north-raw-jackfruit', g)
const tindora = (g: number) => ing('westeast-tindora', g)
const gavar = (g: number) => ing('westeast-gavar', g)
const bananaFlower = (g: number) => ing('westeast-banana-flower', g)
// Label ingredients from extra-ingredients/south2.ts
const snakeGourd = (g: number) => ing('south2-snake-gourd', g)
const bananaStem = (g: number) => ing('south2-banana-stem', g)
const kodo = (g: number) => ing('south2-kodo-millet', g)
const jackSeeds = (g: number) => ing('south2-jackfruit-seeds', g)
const amla = (g: number) => ing('south2-amla', g)
const malabarSpinach = (g: number) => ing('south2-malabar-spinach', g)
const rawMango = (g: number) => ing('regional2-raw-mango', g)
const morMilagai = (g: number) => ing('south2-mor-milagai', g)
const curryLeaves = (g: number) => ing('south2-curry-leaves', g)
const nigerSeeds = (g: number) => ing('south2-niger-seeds', g)

// Common portions
const TBSP = piece('1 tbsp (8 g)', 8)
const TBSP15 = piece('1 tbsp (15 g)', 15)
const TBSP2 = piece('2 tbsp (30 g)', 30)
const SMALL_KATORI = piece('1 small katori (100 g)', 100)
const BOWL = piece('1 bowl (250 g)', 250)

// Shared parts
const dosaBatter = (riceG: number, uradG: number): RecipeIngredient[] => [rice(riceG), urad(uradG), water(Math.round((riceG + uradG) * 1.4))]
const potatoMasala = (potatoG: number): RecipeIngredient[] => [potato(potatoG), onion(Math.round(potatoG * 0.3)), oil(5), water(20), chana(3)]
const cookedRice = (riceG: number): RecipeIngredient[] => [rice(riceG), water(Math.round(riceG * 2.5))]
const bajji = (veg: RecipeIngredient): RecipeIngredient[] => [veg, besan(80), riceFlour(15), water(90), oil(35)]
const sambar = (veg: RecipeIngredient[]): RecipeIngredient[] => [toor(50), water(550), onion(40), tomato(50), tamarind(10), oil(10), ...veg]
const tambuli = (veg: RecipeIngredient[]): RecipeIngredient[] => [coconut(50), curd(150), water(100), ghee(4), ...veg]
const usili = (veg: RecipeIngredient): RecipeIngredient[] => [veg, toor(40), chana(40), oil(20), water(50)]
const thoran = (veg: RecipeIngredient): RecipeIngredient[] => [veg, coconut(50), coconutOil(10), shallots(15)]
const kootu = (veg: RecipeIngredient, dal: RecipeIngredient = moong(40)): RecipeIngredient[] => [veg, dal, coconut(30), water(200), oil(5)]
const pulusu = (veg: RecipeIngredient[]): RecipeIngredient[] => [...veg, onion(40), tamarind(30), jaggery(8), oil(12), riceFlour(6), water(320)]
const sundal = (dry: RecipeIngredient[]): RecipeIngredient[] => [...dry, water(300), coconut(20), oil(5)]
const millet = (grain: RecipeIngredient, extra: RecipeIngredient[]): RecipeIngredient[] => [grain, ...extra]
const podiRice = (podi: RecipeIngredient[], fat: RecipeIngredient): RecipeIngredient[] => [...cookedRice(100), ...podi, fat]
const ghee65 = (main: RecipeIngredient): RecipeIngredient[] => [main, ghee(25), onion(40), tomato(30), curd(30), chilliPowder(8), tamarind(5), jaggery(5), water(60)]
const fry65 = (main: RecipeIngredient): RecipeIngredient[] => [main, riceFlour(20), maida(20), cornstarch(15), curd(30), oil(40)]

// Combo plates: each part is a batch with its cooked weight; take(part, grams)
// scales it to the grams served.
type Part = { ings: RecipeIngredient[]; cooked: number }
const part = (ings: RecipeIngredient[], cooked: number): Part => ({ ings, cooked })
const take = (p: Part, grams: number): RecipeIngredient[] =>
  p.ings.map((i) => ({ ...i, grams: Math.round((i.grams * grams * 10) / p.cooked) / 10 }))
const combo = (key: string, name: string, aliases: string[], parts: [Part, number][], label: string): IndianRecipe => {
  const total = parts.reduce((s, [, g]) => s + g, 0)
  return r(key, name, aliases, parts.flatMap(([p, g]) => take(p, g)), total, [piece(`${label} (${total} g)`, total)])
}

const SET_DOSA = part([rice(70), urad(15), water(100), oil(6)], 180) // 3 set dosas
const COCONUT_CHUTNEY = part([coconut(100), roastedGram(15), greenChilli(10), water(80), oil(5)], 205)
const PONGAL = part([rice(80), moong(30), water(400), ghee(20), cashews(8)], 500)
const KESARI = part([sooji(100), sugar(150), ghee(60), water(300), cashews(15), raisins(10)], 520)
const KHARA_BATH = part([sooji(100), oil(15), ghee(5), onion(40), tomato(40), carrot(20), peas(20), water(300)], 480)
const POORI = part([atta(60), water(30), oil(15)], 93) // 3 pooris
const POTATO_MASALA = part([potato(300), onion(80), oil(12), water(150), chana(5)], 480)
const SAGU = part([potato(80), carrot(50), beans(50), peas(40), coconut(50), onion(40), tomato(40), oil(12), water(250), roastedGram(10)], 560)
const PUTTU = part([riceFlour(100), water(80), coconut(40)], 215)
const KADALA = part([chana(100), water(400), coconut(50), onion(60), tomato(40), coconutOil(15)], 600)
const APPAM = part([rice(100), coconut(30), sugar(5), water(140), oil(2)], 240) // 4 appams
const IDIYAPPAM = part([riceFlour(100), water(150), oil(2)], 230)
const KURMA = part([potato(100), carrot(50), beans(50), peas(50), coconut(40), cashews(10), onion(60), tomato(60), oil(15), water(250)], 600)
const ADAI = part([rice(40), toor(15), chana(15), urad(10), water(100), onion(30), coconut(10), oil(12)], 200)
const AVIAL = part([rawBanana(80), yam(80), carrot(50), beans(50), drumstick(50), ashGourd(80), coconut(80), curd(60), coconutOil(15), water(50)], 530)
const KAPPA = part([cassava(500), coconut(60), coconutOil(10), shallots(20), water(100)], 620)
const MATTA_KANJI = part([mattaRice(60), water(500)], 500)
const CHERUPAYAR = part([moong(100), coconut(40), water(400), oil(10), onion(40)], 530)
const CHAMMANTHI = part([coconut(100), shallots(20), coconutOil(5), tamarind(3)], 125)
const STEAMED_RICE = part(cookedRice(100), 320)
const MUDDA_PAPPU = part([toor(100), water(450)], 500)
const AVAKAYA = part([rawMango(300), sesameOil(150), mustardPowder(30), chilliPowder(50)], 520)
const UGGANI = part([puffedRice(80), onion(60), tomato(40), oil(12), peanuts(15), roastedGram(15), water(100)], 300)
const MIRCHI_BAJJI = part(bajji(greenChilli(150)), 290)
const PAPPADAM = part([papad(30), oil(8)], 38)
const KADLE_GASSI = part([chana(100), coconut(80), coconutOil(10), onion(30), tamarind(5), water(450)], 600)
const GOTHSU = part([eggplant(200), onion(40), tomato(50), tamarind(15), moong(20), oil(12), water(300)], 550)

export const RECIPES_SOUTH2: IndianRecipe[] = [
  // ---------- Bangalore darshini and hotel dosas ----------
  r('open-butter-masala-dosa', 'Open butter masala dosa', ['open dosa', 'open benne masala dosa', 'bangalore open dosa', 'open masala dose'],
    [...dosaBatter(40, 12), butter(15), potato(80), onion(20), oil(3), coconut(10), redChilli(5)], 210, [piece('1 dosa', 210)]),
  r('cheese-dosa', 'Cheese dosa', ['cheese dosai', 'cheese dose', 'plain cheese dosa'],
    [...dosaBatter(50, 15), oil(6), cheese(30)], 160, [piece('1 dosa', 160)]),
  r('cheese-masala-dosa', 'Cheese masala dosa', ['cheese masala dosai', 'cheese masale dose', 'cheese potato dosa'],
    [...dosaBatter(40, 13), oil(7), ...potatoMasala(100), cheese(25)], 280, [piece('1 dosa', 280)]),
  r('paneer-dosa', 'Paneer dosa', ['paneer dosai', 'paneer masala dosa', 'paneer bhurji dosa'],
    [...dosaBatter(50, 15), oil(8), paneer(50), onion(20), capsicum(15), tomato(15)], 230, [piece('1 dosa', 230)]),
  r('schezwan-dosa', 'Schezwan dosa', ['schezwan masala dosa', 'szechuan dosa', 'chinese dosa'],
    [...dosaBatter(40, 13), oil(10), schezwan(15), potato(80), onion(25), cabbage(20), capsicum(15)], 250, [piece('1 dosa', 250)]),
  r('spring-roll-dosa', 'Spring roll dosa', ['spring dosa', 'veg spring roll dosa', 'chinese roll dosa'],
    [...dosaBatter(40, 13), oil(12), cabbage(50), carrot(30), capsicum(20), onion(20), schezwan(10)], 230, [piece('1 dosa', 230)]),
  r('jini-dosa', 'Jini dosa', ['jinni dosa', 'mumbai jini dosa', 'street jini dosa', 'cheese jini dosa'],
    [...dosaBatter(40, 13), butter(15), cabbage(40), onion(30), capsicum(20), cheese(20), schezwan(10)], 235, [piece('1 dosa', 235)]),
  r('mushroom-masala-dosa', 'Mushroom masala dosa', ['mushroom dosa', 'kalan dosai', 'mushroom dose'],
    [...dosaBatter(40, 13), oil(10), mushroom(80), onion(30), tomato(30)], 230, [piece('1 dosa', 230)]),
  r('pav-bhaji-dosa', 'Pav bhaji dosa', ['pav bhaji masala dosa', 'bhaji dosa'],
    [...dosaBatter(40, 13), butter(12), potato(60), peas(20), tomato(40), onion(25), capsicum(15)], 265, [piece('1 dosa', 265)]),
  r('palak-dosa', 'Palak dosa', ['spinach dosa', 'keerai dosai', 'palakura dosa', 'soppu dose'],
    [...dosaBatter(60, 20), spinach(50), oil(8)], 220, [piece('1 dosa', 110)]),
  r('menthya-dosa', 'Menthya dosa (methi dosa)', ['menthe dose', 'vendhaya dosai', 'methi dosa', 'menthulu dosa', 'fenugreek dosa'],
    [rice(100), urad(20), fenugreek(6), poha(20), water(160), oil(15)], 275, [piece('1 dosa', 90)]),
  r('erra-karam-dosa', 'Erra karam dosa (Rayalaseema red chutney dosa)', ['kadapa karam dosa', 'rayalaseema karam dosa', 'red chutney dosa', 'erra karam dosa'],
    [...dosaBatter(60, 20), oil(10), onion(30), redChilli(8), garlic(5)], 220, [piece('1 dosa', 110)]),
  r('aval-dosai', 'Aval dosai (poha dosa)', ['atukula dosa', 'avalakki dose', 'poha dosa', 'sponge poha dosa'],
    [rice(60), poha(25), curd(30), water(90), oil(8)], 190, [piece('1 dosa', 63)]),
  r('horse-gram-dosa', 'Horse gram dosa', ['kollu dosai', 'ulava dosa', 'huruli dose', 'kulith dosa'],
    [rice(60), horseGram(25), water(110), oil(8)], 180, [piece('1 dosa', 90)]),
  r('jowar-dosa', 'Jowar dosa', ['jolada dose', 'jonna dosa', 'cholam dosai', 'sorghum dosa'],
    [sorghumFlour(60), riceFlour(20), curd(30), water(120), onion(20), oil(10)], 215, [piece('1 dosa', 72)]),
  r('varagu-dosa', 'Kodo millet dosa', ['varagu dosai', 'arikelu dosa', 'haraka dose', 'kodo dosa'],
    [kodo(50), urad(15), water(90), oil(8)], 145, [piece('1 dosa', 72)]),
  r('samai-dosa', 'Little millet dosa', ['samai dosai', 'saame dose', 'little millet dosai'],
    [littleMillet(50), urad(15), water(90), oil(8)], 145, [piece('1 dosa', 72)]),
  r('cheese-uttapam', 'Cheese uttapam', ['cheese uthappam', 'cheese onion uttapam'],
    [...dosaBatter(50, 15), oil(8), onion(30), cheese(25)], 190, [piece('1 uttapam', 190)]),
  r('podi-uttapam', 'Podi uttapam', ['podi uthappam', 'ghee podi uttapam', 'gunpowder uttapam'],
    [...dosaBatter(50, 15), ghee(8), onion(30), urad(4), chana(4), sesame(2), chilliPowder(1)], 175, [piece('1 uttapam', 175)]),

  // ---------- Idli varieties ----------
  r('chilli-idli', 'Chilli idli', ['idli chilli', 'idli manchurian', 'chinese idli fry'],
    [rice(60), urad(20), water(90), oil(15), onion(40), capsicum(40), catsup(15), cornstarch(5)], 280, [KATORI, PLATE]),
  r('vegetable-idli', 'Vegetable idli', ['veg idli', 'masala vegetable idli', 'carrot beans idli'],
    [rice(60), urad(20), water(90), carrot(30), peas(15), beans(15), oil(3)], 225, [piece('1 idli', 50)]),
  r('semiya-idli', 'Semiya idli', ['vermicelli idli', 'shavige idli', 'semiya rava idli'],
    [vermicelli(60), sooji(30), curd(100), water(40), oil(4)], 225, [piece('1 idli', 45)]),
  r('aval-idli', 'Aval idli (poha idli)', ['poha idli', 'avalakki idli', 'atukula idli'],
    [rice(60), poha(30), urad(10), water(100)], 195, [piece('1 idli', 45)]),
  r('moode', 'Moode (Mangalorean idli in screwpine)', ['moode idli', 'mudde idli', 'kotte kadubu', 'kotte', 'khotto', 'gunda'],
    [parboiled(100), urad(50), water(160)], 290, [piece('1 moode', 100)]),
  r('pundi', 'Pundi (Mangalorean rice dumplings)', ['undi', 'pundi gatti', 'akki undi', 'rice balls mangalore'],
    [parboiled(150), coconut(40), water(350), oil(8)], 500, [piece('1 pundi', 40), KATORI]),
  r('kadambuttu', 'Kadambuttu (Kodava rice balls)', ['kadambattu', 'coorg rice balls', 'kodava kadambuttu'],
    [parboiled(150), water(300), coconut(20), ghee(5)], 430, [piece('1 ball', 60)]),
  r('akki-otti', 'Akki otti (Kodava rice roti)', ['akki ottis', 'coorg otti', 'kodava otti', 'rice otti'],
    [riceFlour(100), water(110), ghee(5)], 180, [piece('1 otti', 60)]),
  r('paaputtu', 'Paaputtu (Kodava rice cake)', ['paputtu', 'coorg paputtu', 'kodava paaputtu'],
    [parboiled(150), coconutMilk(150), water(200), coconut(30)], 480, [piece('1 piece', 80)]),

  // ---------- Karnataka: rice, poha, upma ----------
  r('menthya-bath', 'Menthya bath (methi rice)', ['menthya soppu bath', 'methi rice', 'vendhaya keerai sadam', 'methi pulao south'],
    [...cookedRice(100), methi(80), onion(40), oil(15), peanuts(10)], 460, [KATORI, PLATE]),
  r('vegetable-bath', 'Vegetable bath', ['veg bath', 'vegetable bhath', 'tarkari bath', 'mixed vegetable rice'],
    [...cookedRice(100), carrot(40), beans(40), peas(30), capsicum(30), onion(40), oil(15), coconut(10)], 520, [KATORI, PLATE]),
  r('cabbage-bath', 'Cabbage bath', ['cabbage rice', 'kosu bath', 'muttaikose sadam'],
    [...cookedRice(100), cabbage(150), onion(40), peas(30), oil(15)], 540, [KATORI, PLATE]),
  r('avarekalu-anna', 'Avarekalu anna (field bean rice)', ['avarekalu bath', 'avarekalu pulao', 'hyacinth bean rice', 'avare kalu anna'],
    [...cookedRice(100), fieldBeans(100), onion(40), oil(15), coconut(15)], 500, [KATORI, PLATE]),
  r('karnataka-veg-pulao', 'Karnataka veg pulao (darshini pulao)', ['bangalore pulao', 'darshini pulao', 'pulav karnataka', 'green masala pulao'],
    [rice(100), water(220), carrot(30), beans(30), peas(30), potato(40), onion(50), oil(15), ghee(5), coconut(10)], 490, [KATORI, PLATE]),
  r('mosaru-avalakki', 'Mosaru avalakki (curd poha)', ['curd poha', 'thayir aval', 'perugu atukulu', 'dahi poha south'],
    [poha(60), curd(150), milk(30), water(30), oil(3)], 260, [KATORI]),
  r('huli-avalakki', 'Huli avalakki (tamarind poha)', ['gojju avalakki', 'puli aval', 'tamarind poha', 'chintapandu atukulu'],
    [poha(80), tamarind(15), jaggery(8), peanuts(15), oil(12), water(70)], 190, [KATORI]),
  r('lemon-aval', 'Lemon aval', ['elumichai aval', 'nimbe avalakki', 'nimmakaya atukulu', 'lemon poha south'],
    [poha(80), lemon(10), peanuts(15), oil(10), chana(3), water(40)], 155, [KATORI]),
  r('thengai-aval', 'Thengai aval (coconut poha)', ['coconut aval', 'kayi avalakki', 'kobbari atukulu', 'coconut poha'],
    [poha(80), coconut(40), oil(8), water(40)], 160, [KATORI]),
  r('avarekalu-uppittu', 'Avarekalu uppittu', ['avarekalu upma', 'avarekai uppittu', 'field bean upma'],
    [sooji(100), fieldBeans(80), onion(40), oil(15), coconut(10), water(250)], 440, [KATORI, PLATE]),
  r('avarekalu-akki-rotti', 'Avarekalu akki rotti', ['avarekai rotti', 'avarekalu rotti', 'field bean akki roti'],
    [riceFlour(100), fieldBeans(50), onion(20), coconut(15), water(100), oil(12)], 245, [piece('1 rotti', 80)]),
  r('rava-vade', 'Rava vade', ['instant rava vada', 'sooji vada', 'rava vadai'],
    [sooji(100), curd(80), onion(30), water(20), oil(30)], 230, [piece('1 vade', 40)]),
  r('nuchinunde', 'Nuchinunde (steamed lentil dumplings)', ['nuchina unde', 'steamed dal dumplings', 'paruppu urundai steamed'],
    [toor(50), chana(50), coconut(30), onion(30), water(80), oil(5)], 220, [piece('1 unde', 40)]),

  // ---------- Karnataka: saaru, huli, gojju, tambuli ----------
  r('bassaru', 'Bassaru', ['bassaru', 'bas saaru', 'soppu bassaru', 'bassaru palya'],
    [toor(60), spinach(100), beans(50), coconut(30), onion(30), oil(10), water(600)], 800, [KATORI]),
  r('basale-soppu-saaru', 'Basale soppu saaru', ['basale saaru', 'malabar spinach saaru', 'pasalai keerai kootu'],
    [malabarSpinach(150), toor(50), coconut(30), onion(20), oil(8), water(500)], 700, [KATORI]),
  r('hesaru-kalu-saaru', 'Hesaru kalu saaru', ['whole moong saaru', 'green gram saaru', 'hesarukalu saaru'],
    [moong(60), coconut(30), onion(30), tomato(40), oil(8), water(500)], 600, [KATORI]),
  r('obbattu-saaru', 'Obbattu saaru (holige saaru)', ['holige saaru', 'obbattu saru', 'bele holige saaru'],
    [toor(50), chana(30), jaggery(20), tamarind(15), coconut(20), ghee(5), water(600)], 680, [KATORI]),
  r('southekayi-huli', 'Southekayi huli (cucumber sambar)', ['mangalore cucumber sambar', 'dosakaya sambar', 'magge huli', 'cucumber sambar'],
    sambar([cucumber(150), coconut(20)]), 780, [KATORI]),
  r('veg-sagu', 'Veg sagu', ['sagu', 'saagu', 'mixed vegetable sagu', 'karnataka sagu', 'tarkari sagu'],
    SAGU.ings, SAGU.cooked, [KATORI]),
  r('bendekai-gojju', 'Bendekai gojju (okra gojju)', ['bhindi gojju', 'okra gojju', 'bendekayi gojju'],
    [okra(200), tamarind(15), jaggery(15), oil(12), sesame(5), water(150)], 320, [SMALL_KATORI]),
  r('hagalakai-gojju', 'Hagalakai gojju (bitter gourd tamarind gravy)', ['karela gojju', 'bitter gourd gojju', 'hagalkayi gojju'],
    [bitterGourd(200), tamarind(20), jaggery(25), oil(15), sesame(5), water(120)], 300, [SMALL_KATORI]),
  r('menasinakai-gojju', 'Menasinakai gojju (chilli gojju)', ['chilli gojju', 'menasinakayi gojju', 'mirchi gojju'],
    [greenChilli(100), tamarind(20), jaggery(20), oil(15), sesame(10), water(100)], 210, [TBSP2, SMALL_KATORI]),
  r('mavinakayi-menaskai', 'Mavinakayi menaskai (raw mango menaskai)', ['mango menaskai', 'ambe menaskai', 'mavinakai gojju'],
    [rawMango(200), jaggery(40), coconut(40), sesame(5), oil(8), water(100)], 330, [SMALL_KATORI]),
  r('kayi-saasive', 'Southekayi saasive (cucumber coconut mustard raita)', ['saasive', 'saasmi', 'cucumber saasive', 'kayi saasive'],
    [cucumber(150), coconut(60), curd(100), mustardPowder(3), oil(3)], 300, [SMALL_KATORI]),
  r('mavinahannu-saasive', 'Mavinahannu saasive (ripe mango saasive)', ['mango saasive', 'ripe mango saasmi', 'mavina hannu sasive'],
    [mango(200), coconut(50), jaggery(15), mustardPowder(3), water(50), oil(3)], 300, [SMALL_KATORI]),
  r('menthya-tambuli', 'Menthya tambuli', ['methi tambuli', 'menthe tambli', 'fenugreek tambuli'],
    tambuli([methi(50)]), 340, [KATORI]),
  r('shunti-tambuli', 'Shunti tambuli (ginger tambuli)', ['ginger tambuli', 'shunti tambli'],
    tambuli([ginger(15)]), 310, [KATORI]),
  r('southekayi-tambuli', 'Southekayi tambuli (cucumber tambuli)', ['cucumber tambuli', 'cucumber tambli'],
    tambuli([cucumber(100)]), 390, [KATORI]),

  // ---------- Karnataka: palya and North Karnataka ----------
  r('tondekayi-palya', 'Tondekayi palya (ivy gourd stir fry)', ['tondekai palya', 'kovakkai poriyal', 'kovakka thoran', 'tendli palya', 'ivy gourd poriyal'],
    [tindora(250), oil(10), coconut(25), urad(3)], 230, [KATORI]),
  r('menthya-soppu-palya', 'Menthya soppu palya (methi leaves palya)', ['methi palya', 'menthe soppu palya', 'methi kura'],
    [methi(250), onion(50), moong(20), oil(12), coconut(15)], 230, [SMALL_KATORI]),
  r('girmit', 'Girmit (North Karnataka puffed rice)', ['girmit hubli', 'mandakki girmit', 'hubli girmit'],
    [puffedRice(50), onion(40), tomato(40), oil(10), besan(10), peanuts(10), roastedGram(10), water(20)], 175, [PLATE]),
  r('gurellu-chutney-pudi', 'Gurellu chutney pudi (niger seed powder)', ['gurellu pudi', 'huchellu chutney pudi', 'niger seed chutney powder'],
    [nigerSeeds(100), garlic(10), chilliPowder(10), tamarind(5)], 118, [TBSP]),
  r('agase-chutney-pudi', 'Agase chutney pudi (flaxseed powder)', ['agase pudi', 'flaxseed chutney powder', 'avise ginjala podi', 'alsi podi'],
    [flaxseed(100), roastedGram(20), garlic(10), chilliPowder(10)], 135, [TBSP]),
  r('huruli-chutney', 'Huruli chutney (horse gram chutney)', ['kollu thuvaiyal', 'ulava pachadi', 'horse gram chutney', 'kulith chutney'],
    [horseGram(50), coconut(30), tamarind(5), oil(5), water(40)], 120, [TBSP2]),

  // ---------- Mangalorean, Udupi and Kodava ----------
  r('southekayi-dose', 'Southekayi dose (Mangalore cucumber dosa)', ['cucumber dosa', 'taushe polo', 'southekai dosa', 'mangalore cucumber dosa'],
    [rice(100), cucumber(150), coconut(30), jaggery(10), water(40), oil(12)], 290, [piece('1 dosa', 72)]),
  r('pathrode', 'Pathrode (Mangalorean colocasia leaf rolls)', ['patrado', 'pathrade', 'alu vadi mangalore', 'kesuvina pathrode'],
    [taroLeaves(100), rice(100), coconut(40), tamarind(10), jaggery(10), water(100), oil(15)], 330, [piece('1 slice', 50)]),
  r('kadle-manoli', 'Kadle manoli (ivy gourd with black chana)', ['kadle tendle', 'chana tondekayi', 'manoli kadle', 'tendli chana sukka'],
    [chana(60), tindora(200), coconut(50), coconutOil(10), onion(20), water(300)], 520, [KATORI]),
  r('kadle-gassi', 'Kadle gassi (Mangalorean black chana curry)', ['chana gassi', 'kadale gassi', 'kadle curry mangalore'],
    KADLE_GASSI.ings, KADLE_GASSI.cooked, [KATORI]),
  r('biscuit-rotti', 'Biscuit rotti (Mangalorean stuffed fried snack)', ['biscuit roti', 'mangalore biscuit rotti', 'biskut roti'],
    [maida(100), sooji(40), coconut(40), onion(20), water(70), oil(40)], 270, [piece('1 biscuit rotti', 45)]),
  r('gobi-ghee-roast', 'Gobi ghee roast', ['cauliflower ghee roast', 'mangalorean gobi ghee roast'],
    [...ghee65(cauliflower(300)), maida(15), cornstarch(10), oil(25)], 380, [KATORI]),
  r('paneer-ghee-roast', 'Paneer ghee roast', ['mangalorean paneer ghee roast', 'paneer ghee roast dry'],
    ghee65(paneer(250)), 380, [KATORI]),
  r('mushroom-ghee-roast', 'Mushroom ghee roast', ['mangalorean mushroom ghee roast', 'kalan ghee roast'],
    ghee65(mushroom(300)), 360, [KATORI]),
  r('baimbale-curry', 'Baimbale curry (Kodava bamboo shoot curry)', ['bamboo shoot curry coorg', 'kodava baimbale', 'kanile curry'],
    [bambooShoot(250), onion(60), coconut(30), oil(12), water(150)], 400, [KATORI]),
  r('kumm-curry', 'Kumm curry (Kodava mushroom curry)', ['coorg mushroom curry', 'kodava kumm', 'kumme curry'],
    [mushroom(300), onion(80), tomato(50), coconut(40), oil(15), water(150)], 520, [KATORI]),
  r('chekke-curry', 'Chekke curry (raw jackfruit curry)', ['kodava chekke curry', 'halasina kayi palya', 'raw jackfruit curry south', 'idichakka curry'],
    [rawJackfruit(300), onion(60), coconut(40), oil(15), water(150)], 480, [KATORI]),

  // ---------- Bangalore street and snacks ----------
  r('bangalore-masala-puri', 'Bangalore masala puri chaat', ['masalpuri', 'masala puri chaat', 'bangalore masala puri', 'mysore masala puri'],
    [maida(30), oil(16), peas(80), onion(30), tomato(20), besan(15), water(100)], 255, [PLATE]),
  r('mirchi-bajji-south', 'Mirchi bajji (South Indian chilli bajji)', ['menasinakai bajji', 'mulaku bajji', 'milagai bajji', 'guntur mirchi bajji', 'mirapakaya bajji', 'chilli bajji'],
    MIRCHI_BAJJI.ings, MIRCHI_BAJJI.cooked, [piece('1 bajji', 45)]),
  r('cut-mirchi', 'Cut mirchi (Guntur double-fried chilli bajji)', ['cut mirchi bajji', 'guntur cut mirchi', 'mirchi cut'],
    [...bajji(greenChilli(150)), oil(8), onion(40), lemon(5)], 320, [PLATE, piece('1 piece', 25)]),
  r('heerekai-bajji', 'Heerekai bajji (ridge gourd bajji)', ['ridge gourd bajji', 'beerakaya bajji', 'peerkangai bajji'],
    bajji(ridgeGourd(150)), 275, [piece('1 bajji', 25)]),
  r('bonda-soup', 'Bonda soup (urad bonda in dal soup)', ['bonda soup bangalore', 'uddina bonda soup', 'darshini bonda soup'],
    [urad(50), water(55), oil(18), moong(30), water(300), tomato(30), ghee(3)], 420, [piece('1 bowl (2 bondas)', 210)]),
  r('bread-bajji', 'Bread bajji', ['bread pakoda kerala', 'bread bonda', 'bread bajji kerala'],
    [bread(60), besan(50), riceFlour(10), water(60), oil(25)], 175, [piece('1 bajji', 44)]),
  r('ragi-pakoda', 'Ragi pakoda', ['ragi pakoda tea shop', 'kezhvaragu pakoda', 'ragi onion pakoda'],
    [ragi(100), onion(80), peanuts(15), water(40), oil(30)], 215, [piece('1 handful (50 g)', 50)]),
  r('pulikachal', 'Pulikachal (tamarind rice paste)', ['puliyogare gojju', 'puliyodharai paste', 'pulihora paste', 'puli kaichal'],
    [tamarind(100), sesameOil(80), jaggery(20), chana(10), urad(10), peanuts(20), water(150), sesame(10)], 280, [TBSP2]),

  // ---------- Hotel tiffin combos ----------
  combo('chow-chow-bath', 'Chow chow bath (khara bath and kesari bath)', ['chow chow bhath', 'khara kesari bath', 'chowchow bath'],
    [[KHARA_BATH, 150], [KESARI, 100]], '1 plate'),
  combo('set-dosa-sagu', 'Set dosa sagu', ['set dose sagu', 'set dosa with sagu', 'sponge dosa sagu'],
    [[SET_DOSA, 180], [SAGU, 120]], '1 plate (3 dosas)'),
  combo('poori-sagu', 'Poori sagu', ['puri sagu', 'poori saagu', 'puri with sagu'],
    [[POORI, 93], [SAGU, 150]], '1 plate (3 pooris)'),
  combo('pongal-gothsu', 'Pongal gothsu', ['pongal gotsu', 'ven pongal with gothsu', 'chidambaram gothsu pongal'],
    [[PONGAL, 200], [GOTHSU, 100]], '1 plate'),
  combo('adai-avial', 'Adai avial', ['adai aviyal', 'adai with avial'],
    [[ADAI, 200], [AVIAL, 100]], '1 plate (2 adais)'),
  combo('puttu-kadala', 'Puttu with kadala curry (plate)', ['puttu kadala plate', 'puttum kadalayum', 'puttu and kadala curry'],
    [[PUTTU, 150], [KADALA, 150]], '1 plate'),
  combo('puttu-pazham-pappadam', 'Puttu pazham pappadam', ['puttu banana pappadam', 'puttum pazhavum'],
    [[PUTTU, 150], [part([banana(100)], 100), 100], [PAPPADAM, 10]], '1 plate'),
  combo('idiyappam-kurma', 'Idiyappam with kurma', ['idiyappam kurma', 'string hoppers kurma', 'idiyappam veg kurma'],
    [[IDIYAPPAM, 120], [KURMA, 150]], '1 plate (3 idiyappams)'),
  combo('kappa-kadala', 'Kappa and kadala curry', ['kappa kadala', 'tapioca and kadala', 'kappa kadala curry'],
    [[KAPPA, 200], [KADALA, 150]], '1 plate'),
  combo('kanji-payar', 'Kanji with cherupayar (plate)', ['kanjiyum payarum', 'kanji payar plate', 'kanji payar pappadam'],
    [[MATTA_KANJI, 300], [CHERUPAYAR, 100], [CHAMMANTHI, 20], [PAPPADAM, 10]], '1 bowl'),
  combo('kadle-bajil', 'Kadle bajil (Mangalorean chana curry with poha)', ['kadle bajil', 'bajil kadle', 'avalakki kadle'],
    [[KADLE_GASSI, 150], [part([poha(50), coconut(20), oil(5), onion(10), water(20)], 100), 100]], '1 plate'),
  combo('uggani-bajji', 'Uggani bajji', ['uggani mirchi bajji', 'borugula upma bajji', 'kurnool uggani bajji'],
    [[UGGANI, 200], [MIRCHI_BAJJI, 90]], '1 plate (2 bajjis)'),
  combo('muddapappu-avakaya-annam', 'Mudda pappu avakaya annam', ['pappu avakaya annam', 'dal rice with avakaya', 'pappu annam neyyi avakaya'],
    [[STEAMED_RICE, 200], [MUDDA_PAPPU, 100], [AVAKAYA, 15], [part([ghee(10)], 10), 5]], '1 plate'),

  // ---------- Andhra and Telangana: rice, podi, pickles ----------
  r('gongura-annam', 'Gongura annam (gongura rice)', ['gongura rice', 'gongura pulihora', 'pulicha keerai sadam', 'gongura bath'],
    [...cookedRice(100), gongura(60), oil(15), onion(30), peanuts(10)], 430, [KATORI, PLATE]),
  r('avakaya-annam', 'Avakaya annam (mango pickle rice)', ['avakaya rice', 'mango pickle rice', 'avakai annam'],
    [...cookedRice(100), rawMango(30), sesameOil(15), mustardPowder(3), chilliPowder(5), ghee(5)], 370, [KATORI, PLATE]),
  r('pulagam', 'Pulagam (Andhra rice and moong dal)', ['pulagam andhra', 'pesara pappu annam', 'katte pongali'],
    [rice(100), moong(50), water(450), ghee(10)], 560, [KATORI]),
  r('nalla-karam', 'Nalla karam (Guntur chutney podi)', ['nallakaram', 'guntur karam podi', 'andhra karam podi'],
    [chilliPowder(40), urad(40), chana(20), corianderSeed(20), tamarind(10), garlic(15), oil(5)], 145, [TBSP]),
  r('karivepaku-podi', 'Karivepaku podi (curry leaf podi)', ['karuveppilai podi', 'curry leaves powder', 'karibevu chutney pudi'],
    [curryLeaves(50), urad(30), chana(30), chilliPowder(5), oil(3)], 105, [TBSP]),
  r('putnala-podi', 'Putnala podi (roasted gram podi)', ['putnala pappu podi', 'pottukadalai podi', 'hurigadale pudi'],
    [roastedGram(80), chilliPowder(8), garlic(10), desiccated(15)], 110, [TBSP]),
  r('munagaku-podi', 'Munagaku podi (drumstick leaf podi)', ['murungai keerai podi', 'drumstick leaves powder', 'moringa podi'],
    [drumstickLeaves(100), urad(30), chana(30), chilliPowder(5), sesame(10)], 115, [TBSP]),
  r('lemon-pickle', 'Lemon pickle (South Indian)', ['nimmakaya pachadi', 'naranga achar', 'elumichai oorugai', 'nimbe uppinakayi', 'lime pickle'],
    [lime(300), oil(30), chilliPowder(30), mustardPowder(10), fenugreek(5)], 350, [TBSP15]),
  r('usirikaya-pachadi', 'Amla pickle (usirikaya pachadi)', ['nellikka achar', 'nellikai oorugai', 'usirikaya pickle', 'amla achar south'],
    [amla(300), sesameOil(80), chilliPowder(30), mustardPowder(15)], 400, [TBSP15]),
  r('tomato-pickle', 'Tomato pickle (Andhra tomato pachadi)', ['tomato nilava pachadi', 'thakkali oorugai', 'tomato achar'],
    [tomato(500), tamarind(40), sesameOil(80), chilliPowder(30), fenugreek(5), garlic(20)], 420, [TBSP15]),
  r('pandu-mirchi-pachadi', 'Pandu mirchi pachadi (red chilli pickle)', ['pandu mirapakaya pachadi', 'red chilli pickle', 'guntur pandu mirchi'],
    [redChilli(300), tamarind(50), sesameOil(50), garlic(20), mustardPowder(10)], 380, [TBSP15]),
  r('kadumanga-achar', 'Kadumanga achar (Kerala cut mango pickle)', ['kadumanga', 'manga achar', 'mangai oorugai', 'cut mango pickle'],
    [rawMango(300), sesameOil(40), chilliPowder(30), mustardPowder(10)], 360, [TBSP15]),
  r('vadu-mangai', 'Vadu mangai (tender mango pickle)', ['maavadu', 'vadu manga', 'midi uppinakai', 'baby mango pickle'],
    [rawMango(300), sesameOil(30), chilliPowder(30), mustardPowder(15)], 350, [TBSP15]),

  // ---------- Andhra and Telangana: curries, pappu, pulusu ----------
  r('dondakaya-vepudu', 'Dondakaya vepudu (ivy gourd fry)', ['dondakaya fry', 'kovakkai fry', 'tondekayi fry', 'tindora fry'],
    [tindora(300), oil(25), onion(30), chilliPowder(3)], 250, [KATORI]),
  r('aratikaya-ava-pettina-kura', 'Aratikaya ava pettina kura (raw banana with mustard)', ['aratikaya avapettina kura', 'raw banana mustard curry', 'aratikaya kura'],
    [rawBanana(300), oil(15), mustardPowder(5), tamarind(5), water(50)], 320, [KATORI]),
  r('kanda-bachali-kura', 'Kanda bachali kura (yam and Malabar spinach)', ['kanda bachali', 'yam bachali curry', 'kanda bachhali koora'],
    [yam(250), malabarSpinach(200), tamarind(10), mustardPowder(3), oil(15), water(100)], 450, [KATORI]),
  r('potlakaya-perugu-pachadi', 'Potlakaya perugu pachadi (snake gourd raita)', ['snake gourd curd chutney', 'pudalangai thayir pachadi'],
    [snakeGourd(150), curd(200), oil(5)], 330, [SMALL_KATORI]),
  r('sorakaya-perugu-pachadi', 'Sorakaya perugu pachadi (bottle gourd raita)', ['bottle gourd curd chutney', 'sorakaya pachadi', 'lauki raita south'],
    [bottleGourd(150), curd(200), oil(5)], 330, [SMALL_KATORI]),
  r('potlakaya-kura', 'Potlakaya kura (snake gourd with chana dal)', ['potlakaya senagapappu kura', 'snake gourd curry andhra'],
    [snakeGourd(300), chana(30), oil(12), onion(30), coconut(15)], 320, [KATORI]),
  r('menthi-kura-pappu', 'Menthi kura pappu (methi dal)', ['methi pappu', 'menthya soppu bele', 'fenugreek leaves dal', 'vendhaya keerai paruppu'],
    [toor(100), methi(80), tomato(50), onion(30), oil(10), water(450)], 620, [KATORI]),
  r('bachali-kura-pappu', 'Bachali kura pappu (Malabar spinach dal)', ['bachali pappu', 'basale soppu bele', 'pasalai keerai paruppu'],
    [toor(100), malabarSpinach(150), tomato(40), onion(30), oil(10), water(450)], 650, [KATORI]),
  r('mukkala-pulusu', 'Mukkala pulusu (mixed vegetable pulusu)', ['mukkala pulusu', 'kaayagura pulusu', 'mixed veg pulusu'],
    pulusu([pumpkin(100), eggplant(80), drumstick(60), okra(60)]), 650, [KATORI]),
  r('ulli-pulusu', 'Ulli pulusu (onion pulusu)', ['ullipaya pulusu', 'vengaya puli kuzhambu', 'onion tamarind curry'],
    pulusu([shallots(200)]), 540, [KATORI]),
  r('vankaya-pulusu', 'Vankaya pulusu (brinjal pulusu)', ['brinjal pulusu', 'vankaya chintapandu pulusu'],
    pulusu([eggplant(250)]), 590, [KATORI]),
  r('chamagadda-pulusu', 'Chamagadda pulusu (colocasia pulusu)', ['arbi pulusu', 'seppankizhangu puli kuzhambu', 'chamadumpa pulusu'],
    pulusu([taro(250)]), 590, [KATORI]),
  r('kakarakaya-pulusu', 'Kakarakaya pulusu (bitter gourd pulusu)', ['bitter gourd pulusu', 'pavakkai puli kuzhambu', 'kakarakaya bellam pulusu'],
    [...pulusu([bitterGourd(200)]), jaggery(15)], 540, [KATORI]),
  r('vankaya-pachadi', 'Vankaya pachadi (roasted brinjal chutney)', ['kalchina vankaya pachadi', 'brinjal chutney andhra', 'kathirikai thuvaiyal'],
    [eggplant(300), tamarind(10), greenChilli(15), oil(12), garlic(5)], 260, [TBSP2, SMALL_KATORI]),
  r('dosakaya-pachadi', 'Dosakaya pachadi (yellow cucumber chutney)', ['dosakaya chutney', 'dosakaya roti pachadi', 'yellow cucumber chutney'],
    [cucumber(200), tamarind(5), greenChilli(10), oil(10), mustardPowder(3)], 210, [TBSP2]),
  r('pesara-punugulu', 'Pesara punugulu (moong dal fritters)', ['moong dal punugulu', 'pesarapappu punukulu', 'moong bonda andhra'],
    [moong(100), water(100), onion(30), oil(35)], 225, [piece('1 punugulu', 15)]),
  r('alasanda-vada', 'Alasanda vada (black-eyed pea vada)', ['alasanda garelu', 'karamani vadai', 'alsande vade', 'lobia vada'],
    [cowpeas(100), water(90), onion(30), oil(35)], 210, [piece('1 vada', 35)]),
  r('masala-borugulu', 'Masala borugulu (spiced puffed rice)', ['borugula mixture', 'kara pori', 'churumuri', 'mandakki oggarane dry', 'masala pori'],
    [puffedRice(50), onion(30), tomato(20), oil(5), peanuts(15), roastedGram(10), lemon(5)], 130, [PLATE]),
  r('sorghum-sankati', 'Jonna sankati (sorghum mudde)', ['jonna sankati', 'jowar kali', 'cholam kali', 'jolada mudde'],
    [sorghum(100), water(350)], 420, [piece('1 ball', 150)]),

  // ---------- Hyderabadi veg ----------
  r('khatti-dal', 'Khatti dal (Hyderabadi sour dal)', ['hyderabadi khatti dal', 'khatti daal', 'tamarind dal hyderabad'],
    [toor(100), tamarind(20), tomato(60), oil(10), garlic(5), water(500)], 620, [KATORI]),
  r('tamate-ka-kut', 'Tamate ka kut', ['tamatar ka kut', 'hyderabadi tomato kut', 'tomato kut'],
    [tomato(400), besan(20), sesame(10), desiccated(10), oil(15), water(150)], 480, [KATORI]),
  r('lauki-dalcha', 'Lauki dalcha (veg dalcha)', ['sorakaya dalcha', 'veg dalcha', 'bottle gourd dalcha', 'kaddu ka dalcha'],
    [chana(80), bottleGourd(200), tamarind(15), onion(50), tomato(50), oil(15), water(500)], 800, [KATORI]),
  r('qubooli', 'Qubooli (Hyderabadi chana dal biryani)', ['qabooli', 'kubooli', 'qubooli biryani', 'chana dal biryani'],
    [rice(150), chana(60), water(400), onion(80), ghee(20), oil(10), curd(50)], 650, [KATORI, PLATE]),
  r('hyderabadi-khichdi', 'Hyderabadi khichdi (masoor khichdi)', ['khichdi hyderabadi', 'hyderabadi khichri', 'masoor dal khichdi'],
    [rice(100), masoor(50), water(450), ghee(15), onion(30)], 580, [KATORI]),

  // ---------- Tamil Nadu: Chettinad and kuzhambu ----------
  r('vellai-paniyaram', 'Vellai paniyaram (Chettinad white paniyaram)', ['vellai paniyaram', 'chettinad white paniyaram', 'vella paniyaram savoury'],
    [rice(100), urad(30), water(130), oil(30)], 240, [piece('1 paniyaram', 30)]),
  r('chettinad-kosumalli', 'Chettinad kosumalli (brinjal potato mash)', ['kosumalli', 'kathirikai kosumalli', 'brinjal potato kosu'],
    [eggplant(200), potato(150), onion(60), tomato(50), oil(15), water(100)], 450, [KATORI]),
  r('cauliflower-milagu-varuval', 'Cauliflower pepper fry (gobi milagu varuval)', ['gobi pepper fry', 'cauliflower milagu varuval', 'chettinad gobi fry'],
    [cauliflower(300), onion(50), oil(20), pepper(5)], 290, [KATORI]),
  r('karuveppilai-kuzhambu', 'Karuveppilai kuzhambu (curry leaf kuzhambu)', ['curry leaf kuzhambu', 'karivepaku pulusu', 'karuveppilai kulambu'],
    [curryLeaves(30), tamarind(30), sesameOil(20), pepper(5), garlic(15), shallots(30), chana(5), water(350)], 400, [KATORI]),
  r('vendhaya-kuzhambu', 'Vendhaya kuzhambu (fenugreek kuzhambu)', ['menthya huli', 'vendhaya kulambu', 'fenugreek tamarind curry'],
    [fenugreek(10), tamarind(30), sesameOil(20), shallots(50), tomato(40), jaggery(5), water(350)], 420, [KATORI]),
  r('thakkali-kuzhambu', 'Thakkali kuzhambu (tomato kuzhambu)', ['tomato kuzhambu', 'tomato kulambu', 'tomato curry tamil'],
    [tomato(300), onion(60), coconut(30), oil(15), water(250)], 560, [KATORI]),
  r('kathirikai-gothsu', 'Kathirikai gothsu (brinjal gotsu)', ['gothsu', 'gotsu', 'brinjal gothsu', 'chidambaram gothsu'],
    GOTHSU.ings, GOTHSU.cooked, [KATORI]),
  r('kollu-kuzhambu', 'Kollu kuzhambu (horse gram kuzhambu)', ['kollu kulambu', 'ulava pulusu', 'huruli huli', 'horse gram curry'],
    [horseGram(80), tamarind(15), shallots(50), tomato(40), coconut(30), oil(12), water(500)], 620, [KATORI]),
  r('pavakkai-pitlai', 'Pavakkai pitlai', ['pitlai', 'bitter gourd pitlai', 'pavakka pitla'],
    [bitterGourd(150), toor(60), chana(15), coconut(40), tamarind(20), oil(12), jaggery(5), water(450)], 650, [KATORI]),
  r('pongal-kuzhambu', 'Pongal kuzhambu (festival mixed vegetable kuzhambu)', ['pongal kootu kuzhambu', 'ezhu kari kuzhambu', 'pongal special kuzhambu'],
    [pumpkin(70), sweetPotato(60), taro(60), fieldBeans(60), eggplant(60), rawBanana(50), yam(50), toor(50), tamarind(25), coconut(30), oil(15), jaggery(5), water(500)], 900, [KATORI]),
  r('thalagam', 'Thalagam (Thiruvathirai kootu)', ['thiruvathirai kootu', 'ezhukari kootu', 'thalagam kuzhambu', 'thiruvadhirai thalagam'],
    [pumpkin(80), sweetPotato(60), yam(60), rawBanana(60), taro(60), fieldBeans(60), eggplant(60), tamarind(15), coconut(40), sesame(5), oil(12), jaggery(5), water(300)], 650, [KATORI]),
  r('kumbakonam-kadappa', 'Kumbakonam kadappa', ['kadappa', 'kumbakonam kadapa', 'moong dal potato kadappa'],
    [moong(60), potato(100), onion(60), tomato(40), coconut(40), poppy(5), oil(12), water(400)], 650, [KATORI]),
  r('pattani-kurma', 'Pattani kurma (green peas kurma)', ['green peas kurma', 'peas kurma south', 'batani kurma'],
    [peas(200), onion(60), tomato(60), coconut(50), cashews(8), oil(15), water(250)], 560, [KATORI]),
  r('mor-kootu', 'Mor kootu (ash gourd in buttermilk)', ['more kootu', 'majjige kootu', 'pooshanikai mor kootu'],
    [ashGourd(200), chana(15), coconut(40), curd(150), coconutOil(8), water(100)], 450, [KATORI]),

  // ---------- Tamil Nadu: sambar and rasam ----------
  r('beans-sambar', 'Beans sambar', ['beans kuzhambu', 'french beans sambar', 'beans huli'],
    sambar([beans(120)]), 770, [KATORI]),
  r('capsicum-sambar', 'Capsicum sambar', ['kudamilagai sambar', 'shimla mirch sambar', 'capsicum huli'],
    sambar([capsicum(120)]), 770, [KATORI]),
  r('potato-sambar', 'Potato sambar', ['urulaikizhangu sambar', 'aloo sambar', 'potato huli'],
    sambar([potato(150)]), 790, [KATORI]),
  r('avarakkai-sambar', 'Avarakkai sambar (broad beans sambar)', ['avarekai huli', 'chikkudukaya sambar', 'flat beans sambar'],
    sambar([fieldBeans(130)]), 780, [KATORI]),
  r('mangai-sambar', 'Mangai sambar (raw mango sambar)', ['raw mango sambar', 'mamidikaya sambar', 'mavinakayi huli'],
    sambar([rawMango(100), jaggery(5)]), 760, [KATORI]),
  r('mor-rasam', 'Mor rasam (buttermilk rasam)', ['buttermilk rasam', 'majjige saaru', 'moru rasam'],
    [buttermilk(300), toor(15), tomato(30), ghee(3), water(150)], 470, [KATORI, GLASS]),
  r('beetroot-rasam', 'Beetroot rasam', ['beetroot saaru', 'beetroot charu'],
    [beetroot(100), toor(30), tomato(50), tamarind(8), ghee(3), water(500)], 620, [KATORI, GLASS]),
  r('mango-rasam', 'Raw mango rasam', ['mangai rasam', 'mamidikaya charu', 'mavinakayi saaru', 'mango charu'],
    [rawMango(100), toor(30), jaggery(8), ghee(3), water(500)], 580, [KATORI, GLASS]),
  r('coriander-rasam', 'Coriander rasam', ['kothamalli rasam', 'kothimeera charu', 'kottambari saaru'],
    [toor(30), tomato(60), tamarind(8), ghee(3), coriander(30), water(500)], 580, [KATORI, GLASS]),
  r('moong-dal-rasam', 'Moong dal rasam', ['pasi paruppu rasam', 'pesara pappu charu', 'hesarubele saaru'],
    [moong(40), tomato(50), ghee(5), lemon(10), water(600)], 640, [KATORI, GLASS]),
  r('veg-mulligatawny-soup', 'Vegetarian mulligatawny soup', ['veg mulligatawny', 'milagu thanni', 'pepper water soup', 'mulligatani veg'],
    [masoor(60), onion(60), carrot(50), coconutMilk(100), rice(20), butter(10), water(600)], 800, [KATORI]),

  // ---------- Tamil Nadu: poriyal, usili, kootu ----------
  r('vazhaipoo-usili', 'Vazhaipoo paruppu usili (banana flower usili)', ['vazhaipoo usili', 'banana flower usili', 'arati puvvu usili'],
    usili(bananaFlower(250)), 320, [KATORI]),
  r('kothavarangai-usili', 'Kothavarangai paruppu usili (cluster beans usili)', ['kothavarangai usili', 'cluster beans usili', 'goru chikkudu usili'],
    usili(gavar(250)), 320, [KATORI]),
  r('kothavarangai-poriyal', 'Kothavarangai poriyal (cluster beans poriyal)', ['cluster beans poriyal', 'goruchikkudu kura', 'gori kayi palya'],
    [gavar(250), oil(10), coconut(20), urad(3)], 220, [KATORI]),
  r('pudalangai-poriyal', 'Pudalangai poriyal (snake gourd stir fry)', ['snake gourd poriyal', 'padavalanga thoran', 'padavalakai palya', 'potlakaya vepudu'],
    [snakeGourd(300), moong(20), coconut(25), oil(10)], 270, [KATORI]),
  r('pudalangai-kootu', 'Pudalangai kootu (snake gourd kootu)', ['snake gourd kootu', 'padavalakai kootu', 'potlakaya pappu'],
    kootu(snakeGourd(250)), 450, [KATORI]),
  r('vazhaithandu-poriyal', 'Vazhaithandu poriyal (banana stem stir fry)', ['banana stem poriyal', 'vazhapindi thoran', 'arati doota kura', 'bale dindu palya'],
    [bananaStem(300), moong(20), coconut(25), oil(10), urad(3)], 280, [KATORI]),
  r('vazhaithandu-kootu', 'Vazhaithandu kootu (banana stem kootu)', ['banana stem kootu', 'vazhaithandu mor kootu', 'bale dindu kootu'],
    kootu(bananaStem(250)), 450, [KATORI]),
  r('pumpkin-poriyal', 'Parangikai poriyal (yellow pumpkin stir fry)', ['parangikai poriyal', 'pumpkin poriyal', 'kumbalakayi palya', 'gummadikaya kura'],
    [pumpkin(300), coconut(25), oil(10), jaggery(5)], 280, [KATORI]),
  r('peerkangai-poriyal', 'Peerkangai poriyal (ridge gourd stir fry)', ['ridge gourd poriyal', 'heerekai palya', 'beerakaya vepudu'],
    [ridgeGourd(300), moong(20), coconut(20), oil(10)], 260, [KATORI]),
  r('urulai-podimas', 'Urulai podimas (potato podimas)', ['potato podimas', 'urulaikizhangu podimas', 'aloo podimas'],
    [potato(300), oil(12), coconut(20), onion(30), chana(5), lemon(5)], 320, [KATORI]),
  r('vazhakkai-podimas', 'Vazhakkai podimas (raw banana podimas)', ['raw banana podimas', 'plantain podimas'],
    [rawBanana(300), coconut(30), oil(10), lemon(5)], 300, [KATORI]),

  // ---------- Tamil Nadu: hotel starters and parotta ----------
  r('gobi-65', 'Gobi 65', ['cauliflower 65', 'gobi sixty five', 'gobi 65 dry'],
    fry65(cauliflower(250)), 300, [KATORI, piece('1 plate (200 g)', 200)]),
  r('mushroom-65', 'Mushroom 65', ['kalan 65', 'mushroom sixty five'],
    fry65(mushroom(250)), 290, [KATORI, piece('1 plate (200 g)', 200)]),
  r('chilli-parotta', 'Chilli parotta', ['chilli porotta', 'chilli barotta', 'parotta chilli'],
    [maida(100), water(50), oil(27), sugar(2), onion(50), capsicum(40), catsup(20)], 255, [PLATE]),
  r('bun-parotta', 'Bun parotta (Madurai)', ['madurai bun parotta', 'bun porotta', 'soft bun parotta'],
    [maida(100), water(45), oil(20), milk(10), sugar(3)], 155, [piece('1 bun parotta', 78)]),
  r('poricha-parotta', 'Poricha parotta (Virudhunagar fried parotta)', ['virudhunagar parotta', 'fried parotta', 'virudhunagar poricha parotta'],
    [maida(100), water(50), oil(35)], 160, [piece('1 parotta', 80)]),
  r('wheat-parotta', 'Wheat parotta', ['godhumai parotta', 'atta parotta', 'wheat porotta', 'whole wheat kerala parotta'],
    [atta(100), water(55), oil(15)], 155, [piece('1 parotta', 78)]),

  // ---------- Tamil Nadu: tiffin varieties ----------
  r('rava-kichadi', 'Rava kichadi (hotel style)', ['rava khichdi', 'kichadi tamil hotel', 'sooji kichadi', 'rava kichdi'],
    [sooji(100), ghee(15), oil(10), onion(40), carrot(40), beans(30), peas(30), tomato(40), water(350), cashews(5)], 600, [KATORI, PLATE]),
  r('thavala-adai', 'Thavala adai', ['thavalai adai', 'kunukku adai', 'vadaam adai'],
    [rice(80), toor(15), chana(15), urad(10), moong(10), coconut(20), water(120), oil(20)], 245, [piece('1 adai', 80)]),
  r('karadaiyan-nombu-adai', 'Karadaiyan nombu uppu adai', ['uppu adai', 'nombu adai savoury', 'karadai uppu adai'],
    [riceFlour(100), cowpeas(20), coconut(30), water(220), oil(5)], 330, [piece('1 adai', 55)]),
  r('mor-kali', 'Mor kali (buttermilk rice flour cake)', ['mor koozh', 'morkali', 'moru kali'],
    [riceFlour(100), buttermilk(300), oil(20), morMilagai(5)], 340, [SMALL_KATORI]),
  r('ragi-kozhukattai', 'Ragi kozhukattai (savoury)', ['kezhvaragu kozhukattai', 'ragi pidi kozhukattai', 'ragi undi'],
    [ragi(100), coconut(20), water(150), oil(5), onion(20)], 270, [piece('1 kozhukattai', 40)]),
  r('kezhvaragu-adai', 'Kezhvaragu adai (ragi adai)', ['ragi drumstick leaves adai', 'kezhvaragu adai', 'nachni adai'],
    [ragi(80), onion(30), drumstickLeaves(20), water(90), oil(12)], 195, [piece('1 adai', 97)]),
  r('ragi-idiyappam', 'Ragi idiyappam', ['ragi sevai', 'kezhvaragu idiyappam', 'ragi string hoppers', 'ragi shavige'],
    [ragi(60), riceFlour(40), water(150), oil(2)], 230, [piece('1 idiyappam', 40)]),
  r('ragi-upma', 'Ragi rava upma', ['ragi upma', 'ragi uppittu', 'kezhvaragu upma'],
    [ragi(80), water(200), onion(40), oil(10), carrot(20)], 310, [KATORI]),
  r('millet-paniyaram', 'Millet kuzhi paniyaram', ['thinai paniyaram', 'millet paddu', 'siridhanya paddu'],
    [foxtail(60), urad(20), water(90), onion(30), oil(12)], 190, [piece('1 paniyaram', 20)]),
  r('vendhaya-kanji', 'Vendhaya kanji (fenugreek rice porridge)', ['menthya ganji', 'fenugreek kanji', 'uluva kanji', 'vendhaya kali kanji'],
    [rice(60), fenugreek(10), garlic(10), coconutMilk(60), water(500)], 600, [KATORI, BOWL]),
  r('veg-nombu-kanji', 'Nombu kanji (vegetarian)', ['nombu kanji veg', 'ramzan kanji', 'iftar kanji', 'nonbu kanji'],
    [rice(60), moong(20), water(600), onion(30), tomato(30), coconutMilk(50), ghee(5), oil(5)], 740, [KATORI, BOWL]),
  r('vishu-kanji', 'Vishu kanji', ['vishu kanji kerala', 'coconut milk kanji', 'thenga paal kanji'],
    [rice(80), coconutMilk(150), water(400), cowpeas(20)], 600, [KATORI, BOWL]),
  r('chukku-kaapi', 'Chukku kaapi (dry ginger coffee)', ['sukku coffee', 'sukku malli kaapi', 'chukku kappi', 'dry ginger coffee'],
    [coffee(200), jaggery(15), ginger(3)], 210, [CUP, GLASS]),
  r('sulaimani', 'Sulaimani (Malabar lemon black tea)', ['sulaimani chai', 'kattan chaya', 'lemon black tea malabar'],
    [tea(180), sugar(10), lemon(8)], 195, [GLASS]),

  // ---------- Tamil Nadu: Kongu, Tirunelveli, temple ----------
  r('arisi-paruppu-sadam', 'Arisi paruppu sadam (Kongu rice and dal)', ['arisi paruppu saadam', 'kovai arisi paruppu', 'rice dal one pot'],
    [rice(100), toor(50), water(450), shallots(40), tomato(40), oil(10), ghee(10)], 620, [KATORI, PLATE]),
  r('kambu-koozh', 'Kambu koozh (pearl millet porridge drink)', ['kambu koozh', 'kambang koozh', 'bajra koozh', 'sajja ambali'],
    [pearlMillet(50), water(300), buttermilk(150), onion(20)], 480, [GLASS]),
  r('kambu-sadam', 'Kambu sadam (cooked pearl millet)', ['kambu choru', 'bajra rice', 'sajja annam'],
    [pearlMillet(100), water(350)], 420, [KATORI]),
  r('pachai-payaru-kadaiyal', 'Pachai payaru kadaiyal (Kongu green gram mash)', ['payaru kadaiyal', 'green moong kadaiyal', 'pachai payir masiyal'],
    [moong(100), water(400), onion(40), tomato(40), oil(10), garlic(5)], 520, [KATORI]),
  r('sodhi', 'Sodhi (Tirunelveli coconut milk stew)', ['sothi', 'tirunelveli sodhi', 'sodhi kuzhambu'],
    [moong(50), coconutMilk(200), potato(60), carrot(50), drumstick(50), beans(40), onion(40), coconutOil(10), water(200), lemon(5)], 620, [KATORI]),
  r('kootanchoru', 'Kootanchoru (Nanjil mixed vegetable rice)', ['koottanchoru', 'kootan choru', 'nanjil nadu kootanchoru'],
    [rice(100), toor(50), water(500), pumpkin(60), eggplant(50), carrot(40), drumstick(40), beans(40), coconut(40), oil(15), tamarind(10)], 850, [KATORI, PLATE]),
  r('ulundhu-sadam', 'Ulundhu sadam (Tirunelveli urad dal rice)', ['ulunthu sadam', 'urad dal rice', 'ulundu choru'],
    [rice(100), urad(40), water(400), coconut(30), garlic(10), sesameOil(10)], 520, [KATORI, PLATE]),
  r('milagu-vadai', 'Milagu vadai (temple pepper vada)', ['hanuman vadai', 'vadai malai vadai', 'temple vadai', 'milagu vada'],
    [urad(100), pepper(5), water(30), oil(35)], 150, [piece('1 vadai', 25)]),
  r('vazhaipoo-vadai', 'Vazhaipoo vadai (banana flower vada)', ['banana flower vada', 'vazhaipoo vada', 'mochar vada south'],
    [bananaFlower(100), chana(100), water(60), onion(40), oil(35)], 270, [piece('1 vadai', 35)]),
  r('kadamba-sadam', 'Kadamba sadam (temple mixed vegetable rice)', ['kadambam sadam', 'kadamba sambar sadam', 'temple kadambam'],
    [rice(100), toor(50), water(550), pumpkin(50), eggplant(50), beans(40), sweetPotato(40), rawBanana(40), tamarind(15), ghee(15), oil(5), coconut(20)], 880, [KATORI, PLATE]),

  // ---------- Tamil Nadu: mixed rice, podi and thokku ----------
  r('paruppu-podi-sadam', 'Paruppu podi sadam (dal podi rice)', ['kandi podi annam', 'pappula podi annam', 'podi annam'],
    podiRice([toor(12), chana(6), chilliPowder(2)], ghee(15)), 360, [KATORI, PLATE]),
  r('idli-podi-sadam', 'Idli podi sadam (podi rice)', ['podi sadam', 'milagai podi rice', 'gunpowder rice', 'karam podi annam'],
    podiRice([urad(8), chana(8), sesame(3), chilliPowder(2)], sesameOil(15)), 360, [KATORI, PLATE]),
  r('milagu-sadam', 'Milagu sadam (pepper rice)', ['pepper rice', 'miriyala annam', 'menasina anna'],
    [...cookedRice(100), ghee(12), pepper(4), cashews(8), urad(4)], 345, [KATORI, PLATE]),
  r('poondu-sadam', 'Poondu sadam (garlic rice)', ['garlic rice south', 'vellulli annam', 'bellulli anna'],
    [...cookedRice(100), garlic(30), oil(12), peanuts(10)], 370, [KATORI, PLATE]),
  r('vengaya-sadam', 'Vengaya sadam (onion rice)', ['onion rice', 'ullipaya annam', 'eerulli bath'],
    [...cookedRice(100), onion(120), oil(15)], 450, [KATORI, PLATE]),
  r('nellikai-sadam', 'Nellikai sadam (amla rice)', ['amla rice', 'usirikaya pulihora', 'nellikayi chitranna', 'gooseberry rice'],
    [...cookedRice(100), amla(60), oil(12), peanuts(10)], 400, [KATORI, PLATE]),
  r('murungai-keerai-sadam', 'Murungai keerai sadam (drumstick leaves rice)', ['drumstick leaves rice', 'moringa rice', 'munagaku annam'],
    [...cookedRice(100), drumstickLeaves(50), oil(12), coconut(10), onion(30)], 420, [KATORI, PLATE]),
  r('vepampoo-sadam', 'Vepampoo sadam (neem flower rice)', ['neem flower rice', 'vepampoo rice', 'bevina hoovina anna'],
    [...cookedRice(100), ghee(10), oil(5), urad(3)], 340, [KATORI, PLATE]),
  r('beetroot-rice', 'Beetroot rice', ['beetroot sadam', 'beetroot bath', 'beetroot pulao south'],
    [...cookedRice(100), beetroot(120), onion(40), oil(15)], 490, [KATORI, PLATE]),
  r('thengai-paal-sadam', 'Thengai paal sadam (coconut milk rice)', ['coconut milk rice', 'thengai paal pulao', 'kobbari paala annam'],
    [rice(100), coconutMilk(150), water(100), onion(40), oil(10), ghee(5), peas(30)], 400, [KATORI, PLATE]),
  r('kuska', 'Kuska (plain biryani rice)', ['kushka', 'plain biryani', 'biryani rice without meat', 'kuska biryani'],
    [rice(150), oil(15), ghee(10), onion(80), tomato(60), curd(40), water(330)], 620, [KATORI, PLATE]),
  r('thayir-semiya', 'Thayir semiya (curd vermicelli)', ['curd semiya', 'mosaru shavige', 'perugu semiya', 'curd vermicelli'],
    [vermicelli(60), water(200), curd(150), milk(40), oil(5)], 420, [KATORI]),
  r('kothamalli-thokku', 'Kothamalli thokku (coriander thokku)', ['coriander thokku', 'kothimeera pachadi', 'coriander pickle'],
    [coriander(200), tamarind(20), sesameOil(30), chilliPowder(5)], 180, [TBSP15]),
  r('mangai-thokku', 'Mangai thokku (grated mango thokku)', ['mango thokku', 'manga thokku', 'mavinakayi thokku', 'grated mango pickle'],
    [rawMango(300), sesameOil(60), chilliPowder(25), fenugreek(3), jaggery(10)], 300, [TBSP15]),
  r('vengaya-thokku', 'Vengaya thokku (onion thokku)', ['onion thokku', 'ullipaya thokku', 'onion pickle south'],
    [onion(300), tamarind(20), sesameOil(40), chilliPowder(15), jaggery(10)], 260, [TBSP15]),
  r('nellikai-thokku', 'Nellikai thokku (amla thokku)', ['amla thokku', 'usirikaya thokku', 'gooseberry thokku'],
    [amla(250), sesameOil(40), chilliPowder(15)], 230, [TBSP15]),
  r('mor-milagai-fry', 'Mor milagai (fried curd chillies)', ['fried mor milagai', 'majjiga mirapakaya', 'sandige menasinakai fry', 'curd chilli fry'],
    [morMilagai(30), oil(5)], 33, [piece('3 chillies', 6)]),

  // ---------- Tamil Nadu: sundal and festival snacks ----------
  r('kollu-sundal', 'Kollu sundal (horse gram sundal)', ['ulava guggillu', 'huruli usli', 'horse gram sundal', 'kulith usal dry'],
    sundal([horseGram(100)]), 270, [SMALL_KATORI]),
  r('chana-dal-sundal', 'Kadalai paruppu sundal (chana dal sundal)', ['kadalai paruppu sundal', 'senaga pappu guggillu', 'kadale bele usli'],
    sundal([chana(100)]), 280, [SMALL_KATORI]),
  r('mochai-sundal', 'Mochai sundal (field beans sundal)', ['mochai kottai sundal', 'avarekalu usli dry', 'field beans sundal'],
    sundal([fieldBeansDry(100)]), 290, [SMALL_KATORI]),
  r('navadhanya-sundal', 'Navadhanya sundal (mixed pulses sundal)', ['navadhanya sundal', 'nava dhanya sundal', 'mixed legume sundal'],
    sundal([chana(20), moong(20), cowpeas(20), rajma(20), horseGram(20)]), 290, [SMALL_KATORI]),
  r('uppu-seedai', 'Uppu seedai', ['seedai', 'salt seedai', 'krishna jayanthi seedai', 'uppu cheedai'],
    [riceFlour(100), urad(10), coconut(15), butter(10), water(60), oil(30)], 180, [piece('1 handful (30 g)', 30)]),
  r('mullu-murukku', 'Mullu murukku', ['mullu thenkuzhal', 'spiky murukku', 'moong dal murukku'],
    [riceFlour(100), moong(20), butter(10), water(70), oil(30)], 165, [piece('1 murukku', 15)]),
  r('butter-murukku', 'Butter murukku', ['benne murukku', 'benne chakli', 'vennai murukku'],
    [riceFlour(100), roastedGram(20), butter(20), water(70), oil(30)], 170, [piece('1 murukku', 12)]),

  // ---------- Millet dishes ----------
  r('varagu-pongal', 'Kodo millet pongal', ['varagu pongal', 'arikelu pongali', 'kodo pongal'],
    millet(kodo(80), [moong(30), water(400), ghee(15), cashews(5)]), 480, [KATORI]),
  r('varagu-curd-rice', 'Kodo millet curd rice', ['varagu thayir sadam', 'kodo curd rice', 'arikelu perugu annam'],
    millet(kodo(80), [water(250), curd(200), milk(50), oil(5)]), 560, [KATORI]),
  r('kuthiraivali-upma', 'Barnyard millet upma', ['kuthiraivali upma', 'oodalu uppittu', 'barnyard upma'],
    millet(samak(80), [water(220), onion(40), carrot(30), oil(12)]), 340, [KATORI]),
  r('kuthiraivali-curd-rice', 'Barnyard millet curd rice', ['kuthiraivali thayir sadam', 'barnyard curd rice'],
    millet(samak(80), [water(250), curd(200), milk(40), oil(5)]), 550, [KATORI]),
  r('samai-upma', 'Little millet upma', ['samai upma', 'saame uppittu', 'little millet uppuma'],
    millet(littleMillet(80), [water(250), onion(40), carrot(30), oil(12)]), 370, [KATORI]),
  r('millet-bisi-bele-bath', 'Millet bisi bele bath', ['siridhanya bisi bele bath', 'thinai bisibelebath', 'millet sambar rice'],
    millet(foxtail(70), [toor(50), water(450), carrot(40), beans(30), peas(20), potato(40), onion(40), tamarind(10), ghee(15), oil(5), coconut(15)]), 740, [KATORI, PLATE]),
  r('godhuma-rava-pongal', 'Broken wheat pongal', ['godhumai rava pongal', 'dalia pongal', 'wheat rava pongal'],
    [bulgur(80), moong(30), water(380), ghee(15), cashews(5)], 470, [KATORI]),
  r('oats-pongal', 'Oats pongal', ['oats ven pongal', 'oats khara pongal'],
    [oats(70), moong(30), water(350), ghee(10)], 420, [KATORI]),

  // ---------- Kerala: breakfast ----------
  r('kappa-puttu', 'Kappa puttu (tapioca puttu)', ['tapioca puttu', 'maravalli kizhangu puttu', 'kappa podi puttu'],
    [cassava(150), riceFlour(30), coconut(40), water(20)], 220, [piece('1 puttu (cylinder)', 110)]),
  r('rava-puttu', 'Rava puttu (semolina puttu)', ['sooji puttu', 'semolina puttu', 'rava puttu kerala'],
    [sooji(100), coconut(40), water(50)], 180, [piece('1 puttu (cylinder)', 90)]),
  r('corn-puttu', 'Corn puttu (maize puttu)', ['cholam puttu', 'makka puttu', 'maize puttu'],
    [cornmeal(100), coconut(40), water(70)], 200, [piece('1 puttu (cylinder)', 100)]),
  r('chemba-puttu', 'Chemba puttu (red rice puttu)', ['matta rice puttu', 'chemba ari puttu', 'red rice puttu'],
    [mattaRice(100), coconut(40), water(80)], 210, [piece('1 puttu (cylinder)', 105)]),
  r('puttu-upma', 'Puttu upma (puttu stir fry)', ['puttu uppumavu', 'leftover puttu upma', 'puttu masala'],
    [riceFlour(100), water(80), coconut(40), onion(40), coconutOil(10)], 240, [KATORI]),
  r('ottada', 'Ottada (rice ada on banana leaf)', ['ottada kerala', 'ottappam', 'ari ada'],
    [riceFlour(100), water(150), coconut(40), oil(3)], 260, [piece('1 ottada', 65)]),
  r('neypathiri', 'Neypathiri (fried rice puri)', ['ney pathiri', 'poricha pathiri', 'malabar neypathiri'],
    [riceFlour(100), coconut(30), shallots(10), water(80), oil(25)], 210, [piece('1 neypathiri', 35)]),
  r('malabar-pidi', 'Pidi (Malabar rice balls in coconut milk)', ['pidi', 'kozhi pidi without chicken', 'ari pidi', 'pidiyum'],
    [riceFlour(100), coconut(30), water(220), coconutMilk(100)], 420, [KATORI]),
  r('pazham-puzhungiyathu', 'Pazham puzhungiyathu (steamed nendran banana)', ['steamed nendran', 'puzhungiya pazham', 'steamed plantain kerala', 'nendran pazham steamed'],
    [ripePlantain(150)], 145, [piece('1 nendran banana', 145)]),
  r('kilanji', 'Kilanji (Lakshadweep rice crepe)', ['kilanji lakshadweep', 'lakshadweep pancake', 'kilanchi'],
    [riceFlour(80), water(150)], 190, [piece('1 kilanji', 40)]),
  r('karkidaka-kanji', 'Karkidaka kanji (Kerala monsoon herbal porridge)', ['oushadha kanji', 'marunnu kanji', 'njavara kanji', 'karkidakam kanji'],
    [rice(60), fenugreek(5), coconutMilk(80), water(500)], 600, [KATORI, BOWL]),
  r('pazhaya-sadam', 'Pazhaya sadam (fermented rice with buttermilk)', ['pazhaya soru', 'neeragaram', 'pazhaiya sadham', 'fermented rice water rice'],
    [...cookedRice(100), water(200), buttermilk(100), onion(30)], 640, [KATORI, BOWL]),

  // ---------- Kerala: curries, thoran, mezhukkupuratti ----------
  r('paal-kappa', 'Paal kappa (tapioca in coconut milk)', ['pal kappa', 'kappa in coconut milk', 'tapioca coconut milk curry'],
    [cassava(400), coconutMilk(200), water(200), shallots(20), coconutOil(10)], 700, [KATORI]),
  r('kappa-ularthiyathu', 'Kappa ularthiyathu (tapioca stir fry)', ['kappa ularthu', 'tapioca fry kerala', 'kappa mezhukkupuratti'],
    [cassava(400), coconutOil(20), shallots(30), coconut(30), water(100)], 470, [KATORI]),
  r('vazhuthananga-theeyal', 'Vazhuthananga theeyal (brinjal theeyal)', ['brinjal theeyal', 'kathirikka theeyal', 'vazhuthana theeyal'],
    [eggplant(250), coconut(100), shallots(40), tamarind(20), coconutOil(15), water(250)], 560, [KATORI]),
  r('vanpayar-thoran', 'Vanpayar thoran (red cowpeas thoran)', ['van payar thoran', 'red cowpea stir fry', 'vanpayar mezhukkupuratti'],
    [cowpeas(100), water(300), coconut(40), coconutOil(10), shallots(15)], 330, [KATORI]),
  r('achinga-payar-thoran', 'Achinga payar thoran (long beans thoran)', ['long beans thoran', 'yard long beans stir fry', 'karamani poriyal'],
    thoran(yardlong(250)), 265, [KATORI]),
  r('idichakka-thoran', 'Idichakka thoran (tender jackfruit thoran)', ['idi chakka thoran', 'tender jackfruit stir fry', 'kathal thoran'],
    thoran(rawJackfruit(250)), 270, [KATORI]),
  r('vazhakoombu-thoran', 'Vazhakoombu thoran (banana flower thoran)', ['vazhachundu thoran', 'banana blossom thoran', 'vazhaipoo poriyal'],
    thoran(bananaFlower(250)), 260, [KATORI]),
  r('chakka-puzhukku', 'Chakka puzhukku (raw jackfruit mash)', ['chakka vevichathu', 'jackfruit puzhukku', 'idichakka puzhukku'],
    [rawJackfruit(400), coconut(80), coconutOil(10), shallots(20), water(100)], 520, [KATORI]),
  r('chakka-erissery', 'Chakka erissery (raw jackfruit erissery)', ['jackfruit erissery', 'chakka payar erissery'],
    [rawJackfruit(250), cowpeas(40), coconut(70), coconutOil(10), water(250)], 520, [KATORI]),
  r('chakkakuru-mezhukkupuratti', 'Chakkakuru mezhukkupuratti (jackfruit seed stir fry)', ['jackfruit seed fry', 'chakkakuru ularthiyathu', 'palakottai poriyal'],
    [jackSeeds(200), water(150), coconutOil(15), shallots(20)], 280, [KATORI]),
  r('chakkakuru-manga-curry', 'Chakkakuru manga curry (jackfruit seed and raw mango)', ['chakkakuru mango curry', 'jackfruit seed curry', 'chakkakuru manga'],
    [jackSeeds(150), rawMango(80), coconut(60), coconutOil(10), water(300)], 500, [KATORI]),
  r('padavalanga-parippu-curry', 'Padavalanga parippu curry (snake gourd dal)', ['snake gourd dal', 'padavalanga curry', 'pudalangai kootu kerala'],
    [snakeGourd(200), moong(60), coconut(40), coconutOil(8), water(350)], 580, [KATORI]),
  r('cheera-parippu-curry', 'Cheera parippu curry (amaranth dal)', ['cheera parippu', 'thotakura pappu kerala', 'red spinach dal'],
    [amaranth(150), moong(60), coconut(40), coconutOil(8), water(350)], 540, [KATORI]),
  r('muringakka-curry', 'Muringakka curry (drumstick coconut curry)', ['drumstick curry kerala', 'muringakka theeyal', 'murungakkai thengai curry'],
    [drumstick(150), coconut(60), shallots(30), tomato(40), coconutOil(10), water(250)], 480, [KATORI]),
  r('koon-ularthiyathu', 'Koon ularthiyathu (Kerala mushroom roast)', ['kerala mushroom roast', 'koon roast', 'koon thoran'],
    [mushroom(300), onion(80), tomato(40), coconut(20), coconutOil(15)], 330, [KATORI]),
  r('kerala-green-peas-curry', 'Kerala green peas curry (for appam)', ['green peas masala kerala', 'pattani curry kerala', 'dried peas curry'],
    [splitPeas(100), water(400), onion(60), tomato(50), coconut(30), coconutOil(12)], 560, [KATORI]),
  r('thakkali-curry', 'Thakkali curry (Kerala tomato curry)', ['kerala tomato curry', 'tomato coconut milk curry', 'thakkali kootan'],
    [tomato(250), onion(60), coconutMilk(150), coconutOil(10), water(100)], 520, [KATORI]),
  r('veg-mappas', 'Vegetable mappas', ['veg mappas', 'kerala veg mappas', 'vegetable mappas coconut milk'],
    [potato(100), carrot(50), beans(40), onion(60), tomato(40), coconutMilk(150), coconutOil(15), water(150)], 540, [KATORI]),
  r('kesuvina-gassi', 'Kesuvina gassi (colocasia leaves coconut curry)', ['chembila curry', 'alu leaves curry', 'kesu gassi', 'taro leaf curry'],
    [taroLeaves(200), coconut(80), tamarind(10), coconutOil(10), jaggery(5), water(250)], 480, [KATORI]),
  r('pavakka-kichadi', 'Pavakka kichadi (bitter gourd in curd)', ['bitter gourd kichadi', 'pavakkai pachadi', 'karela raita kerala'],
    [bitterGourd(100), coconutOil(20), coconut(50), curd(150), mustardPowder(2)], 280, [SMALL_KATORI]),
  r('manga-pachadi', 'Manga pachadi (raw mango curd pachadi)', ['mango pachadi', 'pacha manga pachadi', 'mavinakayi mosaru gojju'],
    [rawMango(150), coconut(60), curd(150), jaggery(10), coconutOil(5)], 350, [SMALL_KATORI]),
  r('thalassery-veg-biryani', 'Thalassery veg biryani', ['malabar veg biryani', 'thalassery vegetable biriyani', 'kaima rice veg biryani'],
    [rice(150), ghee(25), oil(15), onion(100), carrot(50), beans(40), potato(60), peas(30), curd(40), cashews(10), raisins(10), water(330)], 860, [KATORI, PLATE]),

  // ---------- Kerala: tea-shop snacks ----------
  r('kaya-varuthathu', 'Kaya varuthathu (Kerala banana chips)', ['banana chips', 'nendran chips', 'ethakka upperi', 'kaya chips', 'kele chips'],
    [bananaChips(100)], 100, [piece('1 handful (25 g)', 25)]),
  r('pappada-vada', 'Pappada vada', ['pappadavada', 'pappadam vada', 'papad vada kerala'],
    [papad(30), riceFlour(30), water(40), oil(15)], 90, [piece('1 pappada vada', 22)]),
  r('capsicum-bajji', 'Capsicum bajji', ['kudamilagai bajji', 'shimla mirch bajji', 'capsicum bhaji south'],
    bajji(capsicum(150)), 285, [piece('1 bajji', 30)]),

  // ---------- More Karnataka ----------
  r('menthya-akki-rotti', 'Menthya akki rotti (methi rice roti)', ['methi akki roti', 'menthe soppu rotti', 'methi rice rotti'],
    [riceFlour(100), methi(40), onion(30), coconut(15), water(100), oil(10)], 240, [piece('1 rotti', 80)]),
  r('sabsige-akki-rotti', 'Sabsige soppu akki rotti (dill rice roti)', ['dill akki roti', 'sabbasige rotti', 'suva akki rotti'],
    [riceFlour(100), dill(30), onion(30), coconut(15), water(100), oil(10)], 230, [piece('1 rotti', 77)]),
  r('akki-vade', 'Akki vade (rice flour vada)', ['rice vada', 'kodava akki vade', 'akki vada'],
    [riceFlour(100), coconut(30), onion(20), water(60), oil(30)], 200, [piece('1 vade', 30)]),
  r('nippattu-masala', 'Nippattu masala (Bangalore chaat)', ['nippat masala', 'masala nippattu', 'nippattu chaat'],
    [riceFlour(20), peanuts(5), roastedGram(3), oil(7), onion(25), carrot(20), tomato(15), lemon(3)], 95, [piece('1 plate (95 g)', 95)]),
  r('sasive-anna', 'Sasive anna (mustard coconut rice)', ['saasive chitranna', 'mustard rice', 'kadugu sadam', 'avalu anna'],
    [...cookedRice(100), coconut(40), mustardPowder(4), oil(10)], 380, [KATORI, PLATE]),
  r('kadale-bele-kosambari', 'Kadale bele kosambari (chana dal salad)', ['kadalebele kosambari', 'chana dal kosambari', 'senagapappu salad'],
    [chana(50), water(40), cucumber(80), carrot(30), coconut(20), lemon(10), oil(3)], 220, [SMALL_KATORI]),
  r('badanekai-gojju', 'Badanekai gojju (Mysore brinjal gojju)', ['brinjal gojju', 'vankaya gojju', 'kathirikai gotsu karnataka'],
    [eggplant(250), tamarind(20), jaggery(20), oil(15), sesame(5), water(150)], 380, [KATORI]),
  r('nellikai-tambuli', 'Nellikai tambuli (amla tambuli)', ['amla tambuli', 'gooseberry tambli', 'nellikayi tambuli'],
    tambuli([amla(40)]), 330, [KATORI]),
  r('alasande-gassi', 'Alasande gassi (black-eyed beans coconut curry)', ['alsande gassi', 'black eyed beans gassi', 'lobia coconut curry mangalore'],
    [cowpeas(100), coconut(80), coconutOil(10), tamarind(5), water(450)], 560, [KATORI]),
  r('kongu-thengai-kuzhambu', 'Kongu thengai kuzhambu (coconut vegetable kuzhambu)', ['thengai kuzhambu', 'kongunadu kuzhambu', 'coconut kuzhambu'],
    [coconut(80), tomato(60), shallots(50), drumstick(60), eggplant(60), oil(12), water(300)], 540, [KATORI]),

  // ---------- More Andhra, Telangana and Tamil Nadu ----------
  r('tomato-kura', 'Tomato kura (Andhra tomato curry)', ['tomato koora', 'tamatar kura', 'tomato curry andhra'],
    [tomato(400), onion(80), oil(15), chilliPowder(5)], 380, [KATORI]),
  r('ulli-karam', 'Ulli karam (onion chilli paste)', ['ullikaram', 'onion karam', 'ulli kaaram'],
    [onion(200), chilliPowder(15), oil(20), tamarind(10)], 200, [TBSP2]),
  r('garlic-pickle', 'Garlic pickle (vellulli pachadi)', ['vellulli pachadi', 'poondu oorugai', 'bellulli uppinakayi', 'lahsun achar south'],
    [garlic(250), sesameOil(60), chilliPowder(25), tamarind(30), mustardPowder(10)], 340, [TBSP15]),
  r('cauliflower-pickle', 'Cauliflower pickle (Andhra)', ['cauliflower avakaya', 'gobi pachadi', 'cauliflower oorugai'],
    [cauliflower(300), sesameOil(60), chilliPowder(25), mustardPowder(15)], 380, [TBSP15]),
  r('kollu-podi', 'Kollu podi (horse gram podi)', ['ulava podi', 'huruli chutney pudi', 'horse gram powder'],
    [horseGram(60), chana(20), chilliPowder(5), garlic(5)], 88, [TBSP]),
  r('pudina-podi', 'Pudina podi (mint podi)', ['mint podi', 'pudina karam podi', 'mint chutney powder'],
    [u(173475)(50), urad(40), chana(20), chilliPowder(5)], 85, [TBSP]),
  r('karuveppilai-thuvaiyal', 'Karuveppilai thuvaiyal (curry leaf chutney)', ['curry leaf chutney', 'karivepaku pachadi', 'karibevu chutney'],
    [curryLeaves(40), urad(20), coconut(30), tamarind(5), oil(5), water(40)], 135, [TBSP2]),
  r('kathirikai-rasavangi', 'Kathirikai rasavangi', ['rasavangi', 'brinjal rasavangi', 'kathirikai rasavaangi'],
    [eggplant(200), toor(50), tamarind(15), coconut(30), oil(10), water(350)], 560, [KATORI]),
  r('karunai-kizhangu-masiyal', 'Karunai kizhangu masiyal (yam mash)', ['senai masiyal', 'yam masiyal', 'elephant yam mash'],
    [yam(250), tamarind(10), oil(10), water(100)], 320, [KATORI]),
  r('kathirikai-varuval', 'Kathirikai varuval (brinjal fry)', ['vankaya vepudu', 'badanekai fry', 'eggplant fry south'],
    [eggplant(300), oil(25), riceFlour(10), chilliPowder(5)], 240, [KATORI]),
  r('vazhakkai-kola-urundai', 'Vazhakkai kola urundai (raw banana balls)', ['veg kola urundai', 'raw banana kola', 'plantain kofta fry'],
    [rawBanana(200), roastedGram(30), coconut(30), onion(40), oil(30)], 260, [piece('1 urundai', 25)]),
  r('kaalan', 'Kaalan (Chennai street mushroom masala)', ['kalan street', 'chennai kaalan', 'mushroom kaalan'],
    [mushroom(150), maida(30), cornstarch(20), oil(30), onion(60), tomato(40), water(100)], 340, [PLATE]),
  r('kothu-chapathi', 'Kothu chapathi', ['chapati kothu', 'kothu chapati', 'veg kothu chapathi'],
    [atta(100), water(55), oil(25), onion(60), tomato(40), capsicum(30), cabbage(30)], 290, [PLATE]),
  r('paneer-kothu-parotta', 'Paneer kothu parotta', ['paneer kothu', 'paneer kothu porotta'],
    [maida(100), water(50), oil(25), paneer(60), onion(50), tomato(40)], 290, [PLATE]),
  r('murungai-keerai-adai', 'Murungai keerai adai (drumstick leaves adai)', ['drumstick leaves adai', 'moringa adai', 'keerai adai'],
    [rice(40), toor(15), chana(15), urad(10), water(100), drumstickLeaves(30), onion(30), oil(12)], 225, [piece('1 adai', 112)]),
  r('puli-sevai', 'Puli sevai (tamarind rice noodles)', ['tamarind sevai', 'puliyodharai sevai', 'pulihora semiya'],
    [riceFlour(100), water(150), tamarind(15), sesameOil(15), peanuts(15), jaggery(5)], 280, [KATORI]),
  r('thayir-sevai', 'Thayir sevai (curd rice noodles)', ['curd sevai', 'mosaru shavige', 'curd idiyappam'],
    [riceFlour(80), water(120), curd(150), oil(5)], 340, [KATORI]),
  r('ellu-sevai', 'Ellu sevai (sesame rice noodles)', ['sesame sevai', 'ellu idiyappam', 'til sevai'],
    [riceFlour(100), water(150), sesame(20), sesameOil(10), urad(5)], 270, [KATORI]),
  r('corn-rice', 'Sweet corn rice', ['corn pulao south', 'makka annam', 'sweet corn sadam'],
    [...cookedRice(100), sweetCorn(100), onion(40), oil(12), ghee(5)], 470, [KATORI, PLATE]),
  r('javvarisi-vadam', 'Javvarisi vadam, fried (sago fryums)', ['sago vadam', 'sabudana papad', 'saggubiyyam vadiyalu', 'sandige'],
    [sago(30), oil(10)], 38, [piece('1 handful (10 g)', 10)]),
  r('thattu-vadai-set', 'Thattu vadai set (Salem street snack)', ['thattu vada set', 'salem thattu vadai', 'nippat sandwich'],
    [riceFlour(20), roastedGram(3), butter(2), oil(6), water(12), carrot(10), beetroot(10), onion(10), coconut(8), tomato(10), redChilli(1)], 85, [piece('1 set', 85)]),

  // ---------- Millets (more) ----------
  r('thinai-sadam', 'Foxtail millet, cooked', ['thinai arisi sadam', 'korralu annam', 'navane anna', 'kangni rice'],
    millet(foxtail(100), [water(250)]), 320, [KATORI]),
  r('panivaragu-pongal', 'Proso millet pongal', ['panivaragu pongal', 'baragu pongal', 'proso pongal'],
    millet(u(169702)(80), [moong(30), water(380), ghee(15)]), 460, [KATORI]),
  r('varagu-kichadi', 'Kodo millet vegetable kichadi', ['varagu khichdi', 'kodo khichdi', 'arikelu kichadi'],
    millet(kodo(80), [moong(30), water(350), carrot(30), beans(30), peas(20), ghee(10), onion(30)]), 540, [KATORI]),
  r('varagu-upma', 'Kodo millet upma', ['varagu upma', 'arikelu upma', 'haraka uppittu'],
    millet(kodo(80), [water(250), onion(40), carrot(30), oil(12)]), 370, [KATORI]),
  r('kuthiraivali-dosa', 'Barnyard millet dosa', ['kuthiraivali dosai', 'oodalu dose', 'barnyard dosa'],
    [samak(50), urad(15), water(90), oil(8)], 145, [piece('1 dosa', 72)]),
  r('varagu-idli', 'Kodo millet idli', ['varagu idli', 'arikelu idli', 'kodo idli'],
    [kodo(60), urad(20), water(90)], 165, [piece('1 idli', 42)]),
  r('molake-kalu-palya', 'Molake kalu palya (sprouted moong stir fry)', ['mulaikattiya payaru poriyal', 'sprouts palya', 'molakettina pesalu kura', 'sprouted moong poriyal'],
    [moongSprouts(250), coconut(25), oil(10), onion(30)], 270, [KATORI]),
  r('karupatti-kaapi', 'Karupatti kaapi (palm jaggery coffee)', ['karupatti coffee', 'palm jaggery coffee', 'panai vellam coffee'],
    [milk(100), coffee(50), jaggery(12)], 160, [CUP]),

  // ---------- More dosa, idli, paniyaram ----------
  r('ragi-uttapam', 'Ragi uttapam', ['ragi onion uttapam', 'ragi uthappam', 'finger millet uttapam'],
    [ragi(50), riceFlour(20), curd(30), water(80), onion(40), oil(8)], 190, [piece('1 uttapam', 95)]),
  r('paneer-uttapam', 'Paneer uttapam', ['paneer uthappam', 'paneer onion uttapam'],
    [...dosaBatter(50, 15), oil(8), onion(30), paneer(40)], 205, [piece('1 uttapam', 205)]),
  r('podi-masala-dosa', 'Ghee podi masala dosa', ['podi masala dosa', 'gunpowder masala dosa', 'ghee podi masala'],
    [...dosaBatter(40, 13), ghee(10), ...potatoMasala(100), urad(4), chana(4), sesame(2), chilliPowder(1)], 265, [piece('1 dosa', 265)]),
  r('halasina-hannu-dose', 'Halasina hannu dose (jackfruit dosa)', ['jackfruit dosa', 'chakka dosa', 'halasina dose'],
    [rice(100), jackfruit(100), jaggery(15), coconut(30), water(60), oil(12)], 270, [piece('1 dosa', 68)]),
  r('kambu-idli', 'Pearl millet idli', ['kambu idli', 'sajja idli', 'bajra idli'],
    [pearlMillet(50), urad(15), water(90)], 150, [piece('1 idli', 40)]),
  r('ragi-paniyaram', 'Ragi kuzhi paniyaram', ['ragi paniyaram', 'ragi paddu', 'ragi gunta ponganalu'],
    [ragi(50), riceFlour(20), curd(40), onion(30), water(60), oil(12)], 185, [piece('1 paniyaram', 20)]),
  r('rava-rotti', 'Rava rotti (sajjige rotti)', ['sajjige rotti', 'rava roti', 'semolina rotti'],
    [sooji(100), curd(50), onion(30), coconut(15), water(40), oil(12)], 210, [piece('1 rotti', 70)]),
  r('kara-seeyam', 'Kara seeyam (Chettinad savoury fritters)', ['seeyam', 'chettinad seeyam', 'masala seeyam'],
    [urad(60), rice(40), water(100), onion(30), coconut(20), oil(35)], 240, [piece('1 seeyam', 30)]),
  combo('neer-dosa-chutney', 'Neer dosa with coconut chutney', ['neer dose chutney', 'neer dosa plate veg', 'neer dosa with chutney'],
    [[part([rice(60), coconut(15), water(180), oil(5)], 170), 126], [COCONUT_CHUTNEY, 40]], '1 plate (3 neer dosas)'),
  combo('paniyaram-chutney', 'Kuzhi paniyaram with chutney', ['paniyaram chutney', 'paddu chutney', 'ponganalu chutney'],
    [[part([rice(60), urad(20), water(90), onion(30), oil(15)], 190), 120], [COCONUT_CHUTNEY, 40]], '1 plate (6 paniyarams)'),

  // ---------- More curries and sides ----------
  r('gobi-kurma', 'Cauliflower kurma', ['gobi kurma', 'cauliflower korma south', 'phool gobi kurma'],
    [cauliflower(250), coconut(50), cashews(8), onion(60), tomato(60), oil(15), water(250)], 600, [KATORI]),
  r('mushroom-kurma', 'Mushroom kurma', ['kalan kurma', 'mushroom korma south'],
    [mushroom(250), coconut(50), cashews(8), onion(60), tomato(60), oil(15), water(250)], 600, [KATORI]),
  r('paneer-pepper-fry', 'Paneer pepper fry', ['paneer milagu varuval', 'pepper paneer dry', 'chettinad pepper paneer'],
    [paneer(250), onion(60), capsicum(50), oil(15), pepper(5)], 320, [KATORI]),
  r('jeedipappu-kura', 'Jeedipappu kura (Andhra cashew curry)', ['jeedipappu koora', 'andhra kaju kura', 'pachi jeedipappu kura'],
    [cashews(150), onion(80), tomato(60), oil(20), water(250)], 460, [KATORI]),
  r('vada-curry', 'Vada curry (Saidapet style)', ['vadacurry', 'saidapet vada curry', 'vadai curry'],
    [chana(100), water(360), onion(120), tomato(80), oil(45)], 620, [KATORI]),
  r('pulinkari', 'Pulinkari (Travancore tamarind vegetable curry)', ['puli curry kerala', 'pulingari', 'tamarind vegetable curry'],
    [drumstick(80), eggplant(80), pumpkin(90), tamarind(25), coconut(50), coconutOil(10), water(300)], 540, [KATORI]),
  r('pineapple-pulissery', 'Pineapple pulissery', ['kaithachakka pulissery', 'pineapple moru curry', 'pineapple mor kuzhambu'],
    [pineapple(200), curd(250), coconut(60), coconutOil(8), water(100)], 560, [KATORI]),
  r('tendli-bibbe-upkari', 'Tendli bibbe upkari (ivy gourd with tender cashew)', ['tendle bibbe upkari', 'kaju tendli', 'bibbe upkari'],
    [tindora(200), cashews(60), coconut(40), oil(15)], 270, [KATORI]),
  r('cabbage-pesarapappu-kura', 'Cabbage pesarapappu kura', ['cabbage moong dal kura', 'cabbage paruppu poriyal', 'kosu bele palya'],
    [cabbage(300), moong(40), oil(12), coconut(15)], 300, [KATORI]),
  r('munakkaya-tomato-kura', 'Munakkaya tomato kura (drumstick tomato curry)', ['mulakkada tomato kura', 'drumstick tomato curry', 'munagakaya kura'],
    [drumstick(200), tomato(200), onion(60), oil(15), water(100)], 480, [KATORI]),
  r('sorakaya-pulusu', 'Sorakaya pulusu (bottle gourd pulusu)', ['bottle gourd pulusu', 'surakkai puli kuzhambu', 'sorekayi huli'],
    pulusu([bottleGourd(250)]), 560, [KATORI]),
  r('senai-puli-kuzhambu', 'Senai puli kuzhambu (yam tamarind curry)', ['yam puli kuzhambu', 'kanda pulusu', 'suvarna gadde huli'],
    pulusu([yam(250)]), 590, [KATORI]),
  r('surakkai-kootu', 'Surakkai kootu (bottle gourd kootu)', ['bottle gourd kootu', 'sorakaya kootu', 'lauki kootu'],
    kootu(bottleGourd(250)), 450, [KATORI]),
  r('vazhaipoo-kootu', 'Vazhaipoo kootu (banana flower kootu)', ['banana flower kootu', 'arati puvvu kootu'],
    kootu(bananaFlower(250)), 450, [KATORI]),
  r('carrot-beans-poriyal', 'Carrot beans poriyal', ['carrot beans palya', 'beans carrot thoran', 'carrot beans stir fry'],
    [carrot(150), beans(150), coconut(25), oil(10)], 290, [KATORI]),
  r('boodu-kumbalakai-palya', 'Boodu kumbalakai palya (ash gourd stir fry)', ['ash gourd palya', 'poosanikai poriyal', 'kumbalanga thoran'],
    [ashGourd(300), coconut(25), oil(10), moong(15)], 270, [KATORI]),
  r('vazhakkai-varuval', 'Vazhakkai varuval (spicy raw banana fry)', ['raw banana fry spicy', 'vazhakkai fry', 'kaya varuval'],
    [rawBanana(300), oil(25), chilliPowder(5), riceFlour(10)], 250, [KATORI]),
  r('murungakkai-rasam', 'Murungakkai rasam (drumstick rasam)', ['drumstick rasam', 'munakkaya charu', 'nugge saaru'],
    [drumstick(100), toor(30), tomato(50), tamarind(8), ghee(3), water(500)], 620, [KATORI, GLASS]),
  r('dill-rice', 'Sabsige soppu anna (dill rice)', ['dill rice', 'sabsige soppu bath', 'shepu rice'],
    [...cookedRice(100), dill(60), onion(40), oil(15), peas(30)], 470, [KATORI, PLATE]),
  r('jonna-ambali', 'Jonna ambali (sorghum buttermilk drink)', ['jowar ambali', 'jonna java', 'jolada ambli'],
    [sorghumFlour(40), buttermilk(200), water(250)], 450, [GLASS]),

  // ---------- More chutneys, podi, pickles, snacks ----------
  r('chow-chow-thuvaiyal', 'Chow chow thuvaiyal (chayote chutney)', ['chayote chutney', 'seeme badanekai chutney', 'bangalore kathirikai thogayal'],
    [chayote(200), urad(15), oil(8), tamarind(5)], 200, [TBSP2]),
  r('mullangi-chutney', 'Mullangi chutney (radish chutney)', ['radish chutney south', 'mullangi thuvaiyal', 'mullangi pachadi'],
    [radish(200), urad(15), oil(8), tamarind(5)], 200, [TBSP2]),
  r('kothamalli-podi', 'Kothamalli podi (coriander seed podi)', ['dhaniya podi', 'dhaniyala podi', 'kottambari pudi'],
    [corianderSeed(40), urad(40), chana(30), chilliPowder(5)], 112, [TBSP]),
  r('green-chilli-pickle', 'Green chilli pickle (South Indian)', ['pachai milagai oorugai', 'pachi mirapakaya pachadi', 'hasi menasinakayi uppinakayi'],
    [greenChilli(300), sesameOil(50), lemon(30), mustardPowder(10)], 360, [TBSP15]),
  r('ginger-pickle', 'Ginger pickle (inji oorugai)', ['inji oorugai', 'allam avakaya', 'shunti uppinakayi'],
    [ginger(200), sesameOil(40), chilliPowder(15), lemon(20)], 250, [TBSP15]),
  r('cashew-pakoda', 'Cashew pakoda (mundhiri pakoda)', ['mundhiri pakoda', 'kaju pakoda', 'cashew pakora'],
    [cashews(100), besan(50), riceFlour(15), water(40), oil(30)], 200, [piece('1 handful (30 g)', 30)]),
  r('cabbage-pakoda', 'Cabbage pakoda', ['muttaikose pakoda', 'cabbage pakora', 'cabbage pakodi'],
    bajji(cabbage(150)), 280, [piece('1 handful (50 g)', 50)]),
  r('congress-kadlekai', 'Congress kadlekai (spiced split peanuts)', ['congress kadalekai', 'congress peanuts', 'bangalore masala kadlekai'],
    [peanuts(100), oil(5), chilliPowder(3)], 105, [piece('1 handful (30 g)', 30)]),

  // ---------- More combos ----------
  combo('akki-rotti-chutney', 'Akki rotti with chutney', ['akki roti chutney', 'akki rotti plate'],
    [[part([riceFlour(100), water(100), onion(30), coconut(15), oil(10)], 200), 130], [COCONUT_CHUTNEY, 40]], '1 plate (2 rottis)'),
  combo('rava-idli-sagu', 'Rava idli with sagu and chutney', ['rava idli sagu', 'mtr rava idli plate', 'rava idli chutney sagu'],
    [[part([sooji(50), curd(50), water(30), ghee(5), cashews(5), carrot(15)], 150), 110], [SAGU, 100], [COCONUT_CHUTNEY, 30]], '1 plate (2 rava idlis)'),
  combo('benne-dosa-plate', 'Davangere benne dosa with palya and chutney', ['benne dosa palya', 'davangere benne dose plate', 'benne dosa chutney'],
    [[part([rice(50), urad(12), water(75), butter(15)], 130), 130], [POTATO_MASALA, 60], [COCONUT_CHUTNEY, 30]], '1 plate (2 dosas)'),
  combo('pesarattu-allam-combo', 'Pesarattu with allam pachadi', ['pesarattu ginger chutney', 'pesarattu allam', 'pesarattu combo'],
    [[part([moong(60), rice(10), water(90), onion(20), oil(8)], 160), 160], [part([ginger(50), tamarind(30), jaggery(30), oil(10), chilliPowder(5), water(40)], 140), 30]], '1 plate (2 pesarattu)'),
  combo('ghee-rice-kurma', 'Ghee rice with veg kurma', ['nei choru kurma', 'ghee rice kurma', 'malabar ghee rice veg curry'],
    [[part([rice(100), water(200), ghee(20), onion(30), cashews(8)], 330), 200], [KURMA, 150]], '1 plate'),
  combo('kappa-chammanthi', 'Kappa with chammanthi', ['kappa chammanthi', 'kappa mulaku chammanthi', 'tapioca with chutney'],
    [[KAPPA, 250], [CHAMMANTHI, 30]], '1 plate'),
  combo('appam-kadala-curry', 'Appam with kadala curry', ['appam kadala', 'appam and chickpea curry'],
    [[APPAM, 120], [KADALA, 150]], '1 plate (2 appams)'),
]
