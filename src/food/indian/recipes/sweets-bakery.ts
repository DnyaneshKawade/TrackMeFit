// Indian sweets, desserts, bakery and sweet drinks: regional mithai from every
// state, festival foods, Indian bakery and Irani cafe items, cafe desserts,
// kulfi and ice cream, falooda and sharbat. Written by a recipe worker; see
// docs/indian-food-database.md.
//
// Conventions used here:
// - Chhena (fresh Bengali cheese) is modelled as paneer, the same curd.
// - Deep-fried items list only the oil (or ghee) absorbed; syrup-soaked sweets
//   list only the syrup absorbed (sugar and water).
// - Heavily reduced milk starts from evaporated milk (whole milk reduced to
//   about half), so the cooked weight stays within the 60% rule.
// - Bakery cream (pastries, cream rolls) is the non-dairy whipped topping most
//   Indian bakeries use.

import { CUP, GLASS, KATORI, ing, piece, r, usdaIng, type IndianRecipe } from '../define'

const n = (key: string) => (g: number) => ing(key, g)
const u = (id: number) => (g: number) => usdaIng(id, g)

// --- catalogue ---
const milk = n('milk')
const curd = n('curd')
const ghee = n('ghee')
const oil = n('oil')
const sugar = n('sugar')
const jaggery = n('jaggery')
const khoya = n('khoya')
const water = n('water')
const rice = n('rice')
const atta = n('atta')
const sooji = n('sooji')
const besan = n('besan')
const paneer = n('paneer') // also stands for chhena
const poha = n('poha')
const vermicelli = n('vermicelli')
const ragi = n('ragi-flour')
const moongDal = n('moong-dal')
const uradDal = n('urad-dal')
const chanaDal = n('chana') // same seed as chana dal, near-identical macros
const toorDal = n('toor-dal')
const egg = n('egg')
const chicken = n('chicken')
const onion = n('onion')
const potato = n('potato')
const carrot = n('carrot')
const peanuts = n('peanuts')
const roseSyrup = n('rose-syrup')
const gond = n('nonveg-sweets-gond')
const singharaAtta = n('north-singhara-atta')
const samak = n('north-samak-rice')
const roastedGram = n('south-roasted-gram')
const blackRice = n('regional2-black-rice')
const kokum = n('regional2-kokum')
const parwal = n('parwal')
const gulkand = n('sweets-bakery-gulkand')
const nannari = n('sweets-bakery-nannari-syrup')
const bael = n('sweets-bakery-bael-pulp')
const halim = n('sweets-bakery-halim-seeds')

// --- USDA SR Legacy fdc_ids (checked against data/usda/sr_legacy_macros.csv) ---
// dairy and eggs
const cream = u(170859) // Cream, fluid, heavy whipping
const freshCream = u(170858) // Cream, fluid, light whipping (Indian fresh cream)
const butter = u(173410) // Butter, salted
const whiteButter = u(173430) // Butter, without salt (makhan)
const evapMilk = u(171276) // Milk, canned, evaporated
const condMilk = u(171275) // Milk, canned, condensed, sweetened (milkmaid)
const milkPowder = u(170876) // Milk, dry, whole
const greekCurd = u(171304) // Yogurt, Greek, plain, whole milk (hung curd)
const creamCheese = u(173418) // Cheese, cream
const whip = u(170868) // Dessert topping, semi solid, frozen (bakery whipped cream)
const iceCream = u(167575) // Ice creams, vanilla
const iceCreamChoc = u(168809) // Ice creams, chocolate
const iceCreamStraw = u(168810) // Ice creams, strawberry
const softServe = u(167981) // Ice creams, french vanilla, soft-serve
const eggWhite = u(172183) // Egg, white, raw
const eggYolk = u(172184) // Egg, yolk, raw
// nuts, seeds, fruit
const cashew = u(170162)
const almond = u(170567)
const pista = u(170184)
const walnut = u(170187)
const raisin = u(168165)
const coconut = u(170169) // fresh grated coconut
const dryCoconut = u(170170) // desiccated / dry copra
const coconutMilk = u(170172) // fresh, expressed from grated coconut
const coconutWater = u(170174)
const sesame = u(170150)
const poppy = u(171330) // khus khus
const chia = u(170554) // stands for sabja (basil seeds)
const flax = u(169414) // alsi
const fenugreek = u(171324) // methi seeds
const dates = u(171726)
const figs = u(174665) // anjeer, dried
const apricot = u(173941)
const mango = u(169910)
const banana = u(173944)
const plantain = u(169130) // ripe nendran / plantain
const jackfruit = u(174687)
const pineapple = u(169124)
const pineappleCanned = u(169944) // canned in heavy syrup
const strawberry = u(167762)
const sitaphal = u(168175) // Sugar-apples (sweetsop), raw
const chikoo = u(167759) // Sapodilla
const orange = u(169097)
const apple = u(171688)
const grapes = u(174683)
const pomegranate = u(169134)
const papaya = u(169926)
const guava = u(173044)
const watermelon = u(167765)
const blackCurrant = u(173963)
const blueberry = u(171711)
const candiedFruit = u(167781) // tutti frutti
const cherry = u(167766) // maraschino / glace cherries
const fruitCocktail = u(173028) // canned, heavy syrup
const sweetPotato = u(168482)
const ashGourd = u(170069) // waxgourd (petha / kumbalanga)
const lauki = u(169232)
const pumpkin = u(168448)
const lemon = u(167747)
const lime = u(168156)
const bananaChips = u(168849)
// chocolate, sweeteners, starches, bakery bases
const cocoa = u(169593)
const darkChoc = u(170272) // Chocolate, dark, 60-69% cacao
const darkChoc70 = u(170273) // Chocolate, dark, 70-85% cacao
const milkChoc = u(167587)
const chocSyrup = u(168835) // fudge-type chocolate syrup
const caramel = u(168841) // butterscotch or caramel topping
const nutella = u(168000) // chocolate hazelnut spread
const strawTopping = u(168758) // strawberry topping
const honey = u(169640)
const maple = u(169661)
const jam = u(169641)
const frosting = u(169620) // vanilla buttercream-style frosting
const powderedSugar = u(169656)
const brownSugar = u(168833)
const maida = u(169761)
const riceFlour = u(169714)
const stickyRice = u(168883) // glutinous rice (bora saul)
const cornstarch = u(169698) // also custard powder
const sago = u(169717) // sabudana
const bulgur = u(170688) // dalia / broken wheat
const rajgira = u(170682) // amaranth (ramdana)
const bajra = u(172023) // millet flour
const oats = u(173904)
const bread = u(174924) // white bread
const sweetRoll = u(174107) // Rolls, dinner, sweet (bakery bun dough)
const hardRoll = u(172795) // Rolls, french (brun pav)
const puffPastry = u(172738)
const pieCrust = u(175026) // shortcrust, baked
const marie = u(171867) // Marie biscuit
const oreo = u(172718) // chocolate cream sandwich biscuit
const wafer = u(174974) // vanilla wafers
const ladyfinger = u(172821)
const sugarCone = u(175001)
const jellyMix = u(168775) // jelly crystals (gelatin dessert dry mix)
const gelatin = u(169599)
const agar = u(170090) // china grass
const coffee = u(171890) // brewed decoction
const puffedRice = u(173912) // murmura / khoi

/** Sugar syrup absorbed by a fried or soaked sweet. */
const syrup = (s: number, w: number) => [sugar(s), water(w)]
/** A plain egg sponge, as Indian bakeries make it. */
const sponge = (k: number) => [maida(100 * k), sugar(100 * k), egg(120 * k), oil(30 * k)]
/** One brownie base: chocolate, butter, sugar, egg, flour, walnut. */
const brownieBase = () => [darkChoc(25), butter(20), sugar(30), egg(25), maida(15), walnut(8)]

const pc = (label: string, g: number) => piece(`${label} (${g} g)`, g)
const SLICE = pc('1 slice', 50)
const PASTRY = pc('1 pastry', 90)
const SCOOP = pc('1 scoop', 60)
const SMALL_BOWL = pc('1 small katori', 100)

// ================================================================ BENGAL
const BENGAL: IndianRecipe[] = [
  r('rajbhog', 'Rajbhog (stuffed kesar rasgulla)', ['raj bhog', 'rajbhog sweet', 'kesar rajbhog'],
    [paneer(250), maida(10), khoya(30), pista(5), ...syrup(220, 180)], 600, [pc('1 rajbhog', 70)]),
  r('kheer-kadam', 'Kheer kadam (rasakadamba)', ['ras kadam', 'rasakadamba', 'kheer kadam', 'khoya coated rasgulla'],
    [paneer(150), ...syrup(80, 70), khoya(150), sugar(30)], 450, [pc('1 kheer kadam', 40)]),
  r('mihidana', 'Mihidana (Burdwan)', ['mihidana', 'mihi dana', 'burdwan mihidana'],
    [besan(100), riceFlour(30), oil(40), ...syrup(200, 80)], 400, [pc('1 small bowl', 50)]),
  r('sitabhog', 'Sitabhog (Burdwan)', ['sitabhog', 'sita bhog', 'burdwan sitabhog'],
    [riceFlour(50), paneer(150), ghee(30), ...syrup(200, 80)], 460, [pc('1 serving', 100)]),
  r('chhanar-jilipi', 'Chhanar jilipi (chhena jalebi)', ['chhena jalebi', 'chanar jilipi', 'paneer jalebi', 'chhena jilapi'],
    [paneer(200), maida(30), khoya(30), ghee(40), ...syrup(200, 120)], 560, [pc('1 piece', 35)]),
  r('nikhuti', 'Nikhuti (Shantipur)', ['nikhuti', 'nikuti', 'shantipur nikhuti'],
    [paneer(200), maida(25), ghee(35), ...syrup(160, 100)], 470, [pc('2 nikhuti', 30)]),
  r('malai-chomchom', 'Malai chomchom (cham cham with malai)', ['malai cham cham', 'malai chum chum', 'kheer chomchom'],
    [paneer(250), maida(15), ...syrup(150, 100), khoya(60), freshCream(40)], 560, [pc('1 piece', 50)]),
  r('abar-khabo', 'Abar khabo (sandesh)', ['abar khabo', 'abaar khabo', 'abar khabo sandesh'],
    [paneer(250), khoya(60), sugar(80), pista(5)], 370, [pc('1 piece', 40)]),
  r('jolbhora-sandesh', 'Jolbhora sandesh (nolen gur filled)', ['jalbhara sandesh', 'jolbhora talshansh', 'jalbhara', 'gur filled sandesh'],
    [paneer(250), sugar(80), jaggery(60)], 370, [pc('1 jolbhora', 45)]),
  r('aam-sandesh', 'Aam sandesh (mango)', ['mango sandesh', 'aam sondesh', 'mango sondesh'],
    [paneer(250), mango(120), sugar(70)], 380, [pc('1 piece', 35)]),
  r('chocolate-sandesh', 'Chocolate sandesh', ['chocolate sondesh', 'choco sandesh'],
    [paneer(250), sugar(70), cocoa(10), milkChoc(30)], 345, [pc('1 piece', 35)]),
  r('baked-rasgulla', 'Baked rasgulla', ['baked rosogolla', 'baked roshogolla', 'baked rasgulla with rabri'],
    [paneer(200), maida(8), ...syrup(170, 150), evapMilk(300)], 700, [pc('1 piece with milk', 80)]),
  r('nolen-gur-rasgulla', 'Nolen gur rasgulla', ['nolen gurer rosogolla', 'gur rasgulla', 'jaggery rasgulla', 'notun gur rosogolla'],
    [paneer(250), maida(10), jaggery(220), water(300)], 740, [pc('1 rasgulla with syrup', 50)]),
  r('komola-bhog', 'Komola bhog (orange rasgulla)', ['komolabhog', 'kamala bhog', 'orange rasgulla'],
    [paneer(250), orange(50), ...syrup(250, 300)], 780, [pc('1 piece with syrup', 50)]),
  r('bhapa-sandesh', 'Bhapa sandesh (steamed)', ['bhapa sondesh', 'steamed sandesh', 'baked sandesh'],
    [paneer(250), condMilk(100), sugar(30)], 360, [pc('1 piece', 40)]),
  r('bhapa-doi', 'Bhapa doi (steamed sweet yogurt)', ['bhapa dahi', 'baked yogurt', 'steamed doi'],
    [greekCurd(250), condMilk(200), milk(50)], 480, [pc('1 cup', 100)]),
  r('dorbesh', 'Dorbesh (Bengali boondi ladoo with khoya)', ['darbesh', 'dorbesh ladoo', 'rangin boondi ladoo'],
    [besan(150), oil(60), ...syrup(250, 100), khoya(40), cashew(15), raisin(15)], 560, [pc('1 dorbesh', 45)]),
  r('mishti-bonde', 'Mishti bonde (sweet boondi)', ['bonde', 'mithi boondi', 'meethi boondi', 'boondi prasad'],
    [besan(150), oil(60), ...syrup(200, 100)], 440, [pc('1 small bowl', 80)]),
  r('sarbhaja', 'Sarbhaja (Krishnanagar)', ['sar bhaja', 'shor bhaja', 'sarbhaja sweet'],
    [freshCream(150), khoya(100), maida(20), ghee(40), ...syrup(150, 80)], 470, [pc('1 piece', 50)]),
  r('sarpuria', 'Sarpuria (Krishnanagar)', ['sar puria', 'shor puria', 'sarpuriya'],
    [khoya(200), freshCream(100), sugar(100), pista(8), almond(7), ghee(10)], 390, [pc('1 piece', 50)]),
  r('chhena-kheer', 'Chhena kheer (chhanar payesh)', ['chhanar payesh', 'chhena kheeri', 'chena kheer', 'paneer kheer'],
    [paneer(150), milk(1000), sugar(120), pista(10)], 800, [KATORI]),
  r('doodh-puli', 'Doodh puli (puli pithe in milk)', ['dudh puli', 'dudh puli pitha', 'puli pithe', 'pithe puli'],
    [riceFlour(150), water(180), coconut(150), jaggery(120), milk(1000), sugar(50)], 1200, [KATORI]),
  r('gokul-pitha', 'Gokul pitha', ['gokul pithe', 'gokul pitha bengali'],
    [coconut(150), khoya(50), jaggery(100), maida(80), riceFlour(20), milk(80), oil(40), ...syrup(150, 80)], 650, [pc('1 piece', 40)]),
  r('bhapa-pitha', 'Bhapa pitha (steamed rice cake)', ['bhapa pithe', 'bhapa pitha bangladeshi', 'steamed pitha'],
    [riceFlour(200), water(100), coconut(120), jaggery(120)], 520, [pc('1 pitha', 60)]),
  r('chitoi-pitha', 'Chitoi pitha', ['chitoi pithe', 'chitai pitha', 'sara pitha'],
    [riceFlour(200), water(250), oil(5)], 420, [pc('1 pitha', 50)]),
  r('ranga-alur-pithe', 'Ranga alur pithe (sweet potato pitha)', ['ranga aloo pitha', 'sweet potato pithe', 'ranga alur puli'],
    [sweetPotato(300), maida(50), coconut(80), jaggery(80), oil(40), ...syrup(100, 50)], 600, [pc('1 piece', 40)]),
  r('joynagarer-moa', 'Joynagarer moa', ['moa', 'joynagar moa', 'khoi moa', 'nolen gur moa'],
    [puffedRice(150), jaggery(150), khoya(30), ghee(10), cashew(10), raisin(10)], 340, [pc('1 moa', 40)]),
  r('murki', 'Murki (sugar-coated puffed rice)', ['khoi murki', 'kora khai', 'muri murki', 'murki prasad'],
    [puffedRice(150), jaggery(60), sugar(60)], 260, [pc('1 small bowl', 40)]),
  r('batasha', 'Batasha (sugar drops)', ['batasa', 'patasha', 'batashe', 'nakuldana'],
    [sugar(200), water(60)], 200, [pc('5 batasha', 15)]),
  r('rosh-bora', 'Rosh bora / rasabara (urad dal fritters in syrup)', ['rasabara', 'rosh bora', 'roshbora', 'rasa bara'],
    [uradDal(150), water(120), oil(50), ...syrup(200, 120)], 560, [pc('1 piece', 35)]),
  r('chhena-murki', 'Chhena murki', ['chanar murki', 'chena murki', 'paneer murki'],
    [paneer(200), ...syrup(150, 50)], 320, [pc('1 small bowl', 40)]),
  r('lavang-latika', 'Lavang latika / laung lata', ['laung lata', 'lavanga lata', 'lobongo lotika', 'launglata'],
    [maida(150), ghee(30), oil(40), khoya(100), coconut(30), sugar(30), ...syrup(150, 60)], 520, [pc('1 piece', 50)]),
  r('malai-sandwich', 'Malai sandwich (chhena)', ['malai sandwich sweet', 'chhena sandwich', 'cream sandwich sweet'],
    [paneer(250), ...syrup(150, 150), khoya(60), freshCream(30)], 580, [pc('1 piece', 50)]),
]

// ================================================================ ODISHA
const ODISHA: IndianRecipe[] = [
  r('chhena-gaja', 'Chhena gaja', ['chenna gaja', 'chhena gaja odisha', 'chhena gaza'],
    [paneer(250), sooji(30), ghee(40), ...syrup(200, 80)], 520, [pc('1 piece', 40)]),
  r('chhena-jhili', 'Chhena jhili (Nimapara)', ['chenna jhilli', 'chhena jhilli', 'nimapara chhena jhili'],
    [paneer(250), maida(20), sooji(10), ghee(40), ...syrup(200, 120)], 560, [pc('1 piece', 35)]),
  r('rasabali', 'Rasabali (Kendrapara)', ['rasabali', 'rasa bali', 'kendrapara rasabali'],
    [paneer(250), maida(15), ghee(40), evapMilk(400), sugar(100)], 700, [pc('1 rasabali with milk', 80)]),
  r('kakara-pitha', 'Kakara pitha', ['kakara', 'kakra pitha', 'suji kakara'],
    [sooji(150), milk(200), coconut(120), jaggery(100), oil(40), ghee(10)], 560, [pc('1 kakara', 50)]),
  r('enduri-pitha', 'Enduri pitha (steamed in turmeric leaf)', ['enduri', 'haladi patra pitha', 'endure pitha'],
    [rice(150), uradDal(60), water(250), coconut(120), jaggery(100)], 640, [pc('1 pitha', 70)]),
  r('poda-pitha', 'Poda pitha (baked rice cake)', ['podo pitha', 'poda pitha odia', 'burnt pitha'],
    [rice(200), uradDal(50), jaggery(120), coconut(100), ghee(15), water(200)], 560, [pc('1 slice', 80)]),
  r('pheni', 'Pheni / sutarfeni', ['feni', 'sutar feni', 'soothar pheni', 'sutarfeni', 'phenori'],
    [maida(200), ghee(100), sugar(100)], 380, [pc('1 piece', 40)]),
  r('pana', 'Pana (Odia festive sweet drink)', ['pana sankranti pana', 'bela pana', 'odia pana', 'mitha pana'],
    [water(800), jaggery(100), curd(50), banana(50), paneer(30)], 1000, [GLASS]),
]

// ========================================== BIHAR, UP, MP, CHHATTISGARH
const CENTRAL_EAST: IndianRecipe[] = [
  r('tilkut', 'Tilkut (Gaya)', ['tilkut', 'tilkuta', 'gaya tilkut', 'til kut'],
    [sesame(150), jaggery(150)], 290, [pc('1 piece', 25)]),
  r('anarsa', 'Anarsa / anarse (rice-jaggery, poppy seed)', ['anarse', 'anarasa', 'anarsa bihar', 'diwali anarse', 'anarsa goli'],
    [riceFlour(200), jaggery(150), poppy(15), oil(60)], 400, [pc('1 anarsa', 30)]),
  r('parwal-ki-mithai', 'Parwal ki mithai (khoya stuffed)', ['parwal mithai', 'potol mishti', 'parval sweet', 'potoler mishti'],
    [parwal(200), khoya(150), ...syrup(150, 100), pista(5)], 520, [pc('1 piece', 40)]),
  r('rajgira-ladoo', 'Rajgira ladoo (ramdana / lai)', ['ramdana ladoo', 'rajgira laddu', 'chaulai ladoo', 'lai', 'amaranth ladoo', 'rajgira chikki'],
    [rajgira(150), jaggery(120), ghee(5)], 265, [pc('1 ladoo', 25)]),
  r('malaiyo', 'Malaiyo / daulat ki chaat (milk foam)', ['daulat ki chaat', 'makhan malai', 'nimish', 'malai makhan', 'malaiyyo'],
    [milk(1000), cream(100), sugar(60), pista(5)], 1000, [pc('1 kulhad', 100)]),
  r('khurchan', 'Khurchan', ['khurchan mithai', 'khurchan rabri', 'malai khurchan'],
    [evapMilk(500), milkPowder(60), sugar(80)], 400, [pc('1 serving', 50)]),
  r('mawa-bati', 'Mawa bati (Bhopal)', ['mava bati', 'mawa baati', 'bhopali mawa bati'],
    [khoya(250), paneer(50), maida(30), almond(15), pista(15), ghee(40), ...syrup(200, 100)], 640, [pc('1 piece', 50)]),
  r('mawa-jalebi', 'Mawa jalebi (Burhanpur)', ['khoya jalebi', 'mava jalebi', 'burhanpur jalebi'],
    [khoya(200), maida(60), ghee(50), ...syrup(220, 120)], 580, [pc('1 piece', 40)]),
  r('dehrori', 'Dehrori (Chhattisgarh)', ['dehrauri', 'dehrori sweet', 'chhattisgarhi dehrori'],
    [rice(200), curd(50), ghee(60), ...syrup(200, 100)], 560, [pc('1 piece', 40)]),
  r('gulgule', 'Gulgule (atta-jaggery fritters)', ['gulgula', 'meethe pakode', 'gud ke gulgule', 'gulgulas'],
    [atta(200), jaggery(100), water(150), oil(50)], 450, [pc('1 piece', 30)]),
  r('meethi-mathri', 'Meethi mathri (sugar-glazed)', ['sweet mathri', 'meethi mathi', 'gud mathri'],
    [maida(200), ghee(50), oil(40), ...syrup(80, 60)], 360, [pc('1 mathri', 20)]),
  r('chandrakala', 'Chandrakala / suryakala', ['chandrakala', 'suryakala', 'chandra kala', 'surya kala'],
    [maida(200), ghee(40), oil(50), khoya(150), sugar(40), ...syrup(180, 80)], 660, [pc('1 piece', 50)]),
  r('rabri-jalebi', 'Rabri jalebi', ['jalebi rabri', 'jalebi with rabdi', 'rabdi jalebi'],
    [maida(50), curd(10), oil(15), ...syrup(60, 25), evapMilk(120), sugar(15)], 230, [pc('1 plate (2 jalebi with rabri)', 150)]),
  r('bread-gulab-jamun', 'Bread gulab jamun', ['bread jamun', 'instant bread gulab jamun'],
    [bread(200), milk(80), oil(50), ...syrup(220, 120)], 580, [pc('1 jamun', 35)]),
]

// ============================== PUNJAB, HIMALAYA, KASHMIR, DELHI, VRAT
const NORTH: IndianRecipe[] = [
  r('shufta', 'Shufta (Kashmiri dry fruit sweet)', ['shufta', 'kashmiri shufta', 'kashmiri dry fruit mithai'],
    [paneer(100), almond(50), walnut(50), cashew(30), raisin(30), dates(50), apricot(30), sugar(80), ghee(30), water(50)], 450, [pc('1 small bowl', 60)]),
  r('kashmiri-kahwa', 'Kashmiri kahwa (with sugar and almonds)', ['kahwa', 'kehwa', 'qehwa', 'kashmiri green tea', 'kahwah'],
    [water(400), sugar(20), almond(10)], 400, [CUP]),
  r('patande', 'Patande (Himachali sweet pancake)', ['patande', 'pateande', 'himachali sweet pancake'],
    [atta(150), milk(200), sugar(50), ghee(20)], 380, [pc('1 patanda', 60)]),
  r('singori', 'Singori (Almora khoya cone)', ['singodi', 'singhori', 'almora singori'],
    [khoya(250), sugar(60), coconut(20)], 320, [pc('1 singori', 25)]),
  r('samak-kheer', 'Samak kheer (jhangora / vrat kheer)', ['jhangora kheer', 'sama ke chawal ki kheer', 'vrat ki kheer', 'moraiyo kheer', 'barnyard millet kheer'],
    [samak(80), milk(1000), sugar(100), almond(10)], 800, [KATORI]),
  r('rot-uttarakhand', 'Rot (Uttarakhand sweet roti)', ['rot', 'mitha rot', 'meetha rot garhwali'],
    [atta(250), jaggery(100), ghee(40), milk(80)], 400, [pc('1 rot', 70)]),
  r('meethe-pude', 'Meethe pude (jaggery pancakes)', ['mithe poore', 'meetha pooda', 'gur ke pude', 'meethe chille'],
    [atta(150), jaggery(60), water(200), oil(20)], 380, [pc('1 puda', 60)]),
  r('sohan-halwa', 'Sohan halwa (Multani)', ['sohan halwa', 'multani sohan halwa', 'ajmeri sohan halwa'],
    [cornstarch(50), sugar(250), ghee(120), milk(300), almond(40), pista(20)], 520, [pc('1 piece', 30)]),
  r('habshi-halwa', 'Habshi halwa', ['habshi halwa', 'hapshi halwa', 'black halwa'],
    [evapMilk(800), sugar(150), ghee(80), atta(50), almond(40), walnut(30)], 720, [pc('1 piece', 40)]),
  r('kaju-pista-roll', 'Kaju pista roll', ['kaju roll', 'cashew pista roll', 'kaju pista roll sweet'],
    [cashew(200), sugar(120), pista(60), water(60)], 400, [pc('1 piece', 20)]),
  r('moong-dal-barfi', 'Moong dal barfi', ['moong barfi', 'moong dal burfi', 'moong ki barfi'],
    [moongDal(200), ghee(100), sugar(180), khoya(50), milk(100)], 540, [pc('1 piece', 30)]),
  r('alsi-pinni', 'Alsi pinni (flaxseed ladoo)', ['alsi ladoo', 'flaxseed ladoo', 'alsi ki pinni', 'javas ladoo'],
    [flax(150), atta(100), ghee(80), jaggery(150), almond(30), gond(15)], 510, [pc('1 pinni', 35)]),
  r('methi-ladoo', 'Methi ladoo (winter)', ['methi laddu', 'methi pak', 'fenugreek ladoo', 'methi na ladva'],
    [atta(200), ghee(120), jaggery(150), fenugreek(30), gond(20), almond(20)], 520, [pc('1 ladoo', 35)]),
  r('gur-ke-chawal', 'Gur ke chawal (jaggery rice)', ['gur wale chawal', 'gud ke chawal', 'jaggery rice', 'lohri chawal'],
    [rice(200), jaggery(150), ghee(30), water(450)], 720, [KATORI]),
  r('zarda', 'Zarda (saffron sweet rice)', ['meethe chawal', 'kesari chawal', 'sakharbhat', 'mittha', 'sweet rice', 'zarda pulao', 'meetha bhaat'],
    [rice(200), sugar(150), ghee(40), cashew(15), raisin(15), almond(10), water(400)], 720, [KATORI]),
  r('shakarkandi-halwa', 'Shakarkandi halwa (vrat)', ['sweet potato halwa', 'shakarkand ka halwa', 'ratalyacha sheera'],
    [sweetPotato(500), ghee(40), sugar(100), milk(100)], 520, [SMALL_BOWL]),
  r('singhare-ka-halwa', 'Singhare ka halwa (vrat)', ['singhara halwa', 'water chestnut flour halwa', 'singhare ke atte ka halwa'],
    [singharaAtta(100), ghee(60), sugar(100), water(300)], 420, [SMALL_BOWL]),
  r('aloo-halwa', 'Aloo halwa (vrat)', ['aloo ka halwa', 'potato halwa', 'batata sheera'],
    [potato(400), ghee(50), sugar(100), milk(100)], 480, [SMALL_BOWL]),
  r('kaddu-halwa', 'Kaddu ka halwa (pumpkin)', ['pumpkin halwa', 'kaddu halwa', 'sitaphal halwa', 'lal kaddu halwa'],
    [pumpkin(600), ghee(50), sugar(120), khoya(50), milk(100)], 600, [SMALL_BOWL]),
  r('lauki-kheer', 'Lauki kheer', ['doodhi kheer', 'ghiya kheer', 'bottle gourd kheer', 'sorakaya payasam'],
    [lauki(300), milk(800), sugar(100)], 850, [KATORI]),
  r('makhan-mishri', 'Makhan mishri (Janmashtami)', ['makhan mishri', 'white butter with mishri', 'makkhan mishri'],
    [whiteButter(100), sugar(30)], 130, [pc('1 tbsp', 15)]),
  r('panchamrit', 'Panchamrit / charnamrit', ['panchamrit', 'charnamrit', 'panchamrutham', 'charanamrit'],
    [milk(200), curd(100), ghee(10), honey(20), sugar(30)], 360, [pc('2 tbsp', 30)]),
]

// ================================================================ RAJASTHAN
const RAJASTHAN: IndianRecipe[] = [
  r('mawa-kachori', 'Mawa kachori (Jodhpur)', ['mava kachori', 'jodhpuri mawa kachori', 'sweet kachori'],
    [maida(200), ghee(50), oil(50), khoya(150), sugar(30), almond(15), pista(15), ...syrup(150, 60)], 650, [pc('1 kachori', 80)]),
  r('bajra-churma', 'Bajra churma (bajre ka malida)', ['bajre ka churma', 'bajre ka malida', 'bajra malida'],
    [bajra(200), water(150), ghee(60), jaggery(100)], 420, [SMALL_BOWL]),
  r('makhaniya-lassi', 'Makhaniya lassi (Jodhpur)', ['makhaniya lassi', 'jodhpuri lassi', 'butter lassi'],
    [curd(250), sugar(40), butter(20), milk(50)], 360, [GLASS]),
]

// ================================================================ GUJARAT
const GUJARAT: IndianRecipe[] = [
  r('ghari', 'Ghari (Surti)', ['surti ghari', 'ghari sweet', 'chandni padva ghari'],
    [maida(150), ghee(80), khoya(200), sugar(80), almond(20), pista(20), powderedSugar(20)], 540, [pc('1 ghari', 60)]),
  r('adadiya-pak', 'Adadiya pak (urad dal winter sweet)', ['adadiya', 'adadia pak', 'urad pak'],
    [uradDal(200), ghee(150), sugar(200), gond(20), almond(30), milk(50)], 620, [pc('1 piece', 30)]),
  r('halvasan', 'Halvasan (Khambhat)', ['halvasan', 'khambhati halvasan', 'halwasan'],
    [milk(1000), bulgur(50), sugar(150), ghee(60), gond(15), almond(15), pista(15)], 800, [pc('1 piece', 35)]),
  r('aamras', 'Aamras (mango pulp)', ['aam ras', 'keri no ras', 'amras', 'mango ras', 'mango pulp'],
    [mango(500), sugar(30), milk(50)], 580, [KATORI]),
]

// ======================================== MAHARASHTRA, GOA, KONKAN
const WEST: IndianRecipe[] = [
  r('chirote', 'Chirote / chiroti', ['chiroti', 'chirote', 'pakatil chirote', 'padhir peni'],
    [maida(200), ghee(50), oil(50), powderedSugar(40), water(80)], 360, [pc('1 chirote', 25)]),
  r('aliv-ladoo', 'Aliv ladoo (halim seeds)', ['halim ladoo', 'aliv che ladoo', 'haleem ladoo', 'garden cress ladoo'],
    [coconut(200), jaggery(150), halim(40), ghee(10)], 380, [pc('1 ladoo', 30)]),
  r('gulachi-poli', 'Gulachi poli (tilgul poli)', ['gul poli', 'tilgul poli', 'gulpoli'],
    [atta(200), maida(50), oil(30), jaggery(150), sesame(40), besan(20), ghee(20), water(100)], 520, [pc('1 poli', 70)]),
  r('sanjori', 'Sanjori (rava sweet poli)', ['sanja poli', 'sanjori', 'rava poli'],
    [maida(150), sooji(100), ghee(40), sugar(100), milk(150), oil(30)], 480, [pc('1 sanjori', 50)]),
  r('satori', 'Satori (khoya poli)', ['satori', 'satorya', 'khoya poli', 'mawa poli'],
    [maida(150), ghee(40), khoya(100), besan(30), sugar(80), water(70)], 420, [pc('1 satori', 50)]),
  r('mango-mastani', 'Mango mastani (Pune)', ['mastani', 'pune mastani', 'mango mastani shake'],
    [mango(200), milk(150), sugar(30), iceCream(100), almond(5), pista(5)], 490, [pc('1 glass', 350)]),
  r('piyush', 'Piyush (shrikhand drink)', ['piyush', 'piyush drink', 'shrikhand lassi'],
    [greekCurd(120), powderedSugar(50), milk(100), curd(50)], 320, [GLASS]),
  r('panchakhadya', 'Panchakhadya (Ganesh prasad)', ['panchkhadya', 'panch khadya', 'ganpati prasad'],
    [dryCoconut(100), jaggery(80), dates(30), poppy(10), raisin(20), almond(20)], 255, [pc('1 tbsp', 20)]),
  r('ambe-barfi', 'Mango barfi', ['amba barfi', 'aam barfi', 'mango burfi'],
    [khoya(250), mango(200), sugar(100), dryCoconut(50)], 480, [pc('1 piece', 30)]),
  r('narali-bhat', 'Narali bhat (coconut jaggery rice)', ['narali bhaat', 'naralachi bhat', 'sweet coconut rice', 'coconut jaggery rice'],
    [rice(200), jaggery(200), coconut(150), ghee(40), cashew(15), water(400)], 860, [KATORI]),
  r('bebinca', 'Bebinca (Goan layered cake)', ['bebinka', 'bibik', 'goan bebinca'],
    [coconutMilk(600), eggYolk(200), sugar(300), maida(150), ghee(120)], 1100, [pc('1 slice', 60)]),
  r('dodol', 'Dodol (Goan)', ['goan dodol', 'dodol sweet'],
    [riceFlour(150), coconutMilk(800), jaggery(350), cashew(40)], 850, [pc('1 piece', 40)]),
  r('doce-de-grao', 'Doce de grao (Goan chana dal sweet)', ['doce', 'goan doce', 'chana dal doce'],
    [chanaDal(200), coconut(200), sugar(250), ghee(30), water(400)], 800, [pc('1 piece', 30)]),
  r('kulkuls', 'Kulkuls (Goan Christmas sweet)', ['kul kuls', 'kidiyo', 'kokkisan curls', 'christmas kulkul'],
    [maida(250), egg(50), coconutMilk(120), butter(30), oil(50), sugar(60)], 480, [pc('5 kulkuls', 25)]),
  r('rose-cookies', 'Rose cookies / achappam', ['achappam', 'achu murukku', 'rosette cookies', 'gulabi phool', 'rose cookie'],
    [riceFlour(200), maida(30), coconutMilk(200), sugar(60), egg(50), oil(70)], 400, [pc('3 rose cookies', 30)]),
  r('cashew-marzipan', 'Cashew marzipan (Goan Christmas)', ['marzipan', 'goan marzipan', 'kaju marzipan'],
    [cashew(250), sugar(220), eggWhite(30), water(80)], 470, [pc('1 piece', 15)]),
  r('guava-cheese', 'Guava cheese (perad)', ['perad', 'goan guava cheese', 'guava barfi'],
    [guava(1000), sugar(600), butter(30), lime(10)], 1000, [pc('1 piece', 30)]),
  r('goan-milk-cream', 'Milk cream (Goan Christmas sweet)', ['milk cream sweet', 'goan milk cream', 'cashew milk cream'],
    [milk(1000), sugar(250), cashew(150), butter(30)], 870, [pc('1 piece', 20)]),
  r('serradura', 'Serradura (sawdust pudding)', ['sawdust pudding', 'goan serradura', 'macau pudding'],
    [cream(250), condMilk(200), marie(100)], 550, [pc('1 cup', 100)]),
  r('bolinhas', 'Bolinhas (Goan coconut cookies)', ['bolinhas de coco', 'coconut bolinhas'],
    [dryCoconut(150), sooji(150), sugar(150), butter(50), eggYolk(60)], 480, [pc('1 bolinha', 20)]),
  r('baath-cake', 'Baath cake (Goan semolina coconut cake)', ['batica', 'baath', 'goan coconut cake'],
    [sooji(250), coconut(250), sugar(250), butter(120), egg(150)], 900, [pc('1 slice', 60)]),
  r('alle-belle', 'Alle belle (Goan coconut pancakes)', ['alebele', 'alle belle', 'goan coconut crepe'],
    [maida(120), egg(50), milk(200), coconut(150), jaggery(120), oil(10)], 580, [pc('1 piece', 60)]),
  r('coconut-toffee', 'Coconut toffee', ['coconut candy', 'nariyal toffee', 'goan coconut sweet'],
    [coconut(200), sugar(200), milk(100), butter(20)], 420, [pc('1 toffee', 15)]),
  r('mangane', 'Mangane (Konkani chana dal-sago payasam)', ['madgane', 'mangane payasam', 'konkani mangane'],
    [chanaDal(100), sago(50), jaggery(200), coconutMilk(300), water(600), cashew(10)], 1000, [KATORI]),
  r('ela-ada', 'Ela ada / patoleo (leaf-steamed rice parcels)', ['elayada', 'patoleo', 'patholi', 'patolyo', 'arishina ele kadubu', 'ela ada'],
    [riceFlour(200), water(220), coconut(200), jaggery(160)], 740, [pc('1 ada', 60)]),
  r('kokum-sharbat', 'Kokum sharbat', ['kokum sarbat', 'amsul sharbat', 'kokum juice', 'kokam sharbat'],
    [kokum(20), sugar(60), water(700)], 740, [GLASS]),
]

// ================================================================ KARNATAKA
const KARNATAKA: IndianRecipe[] = [
  r('kayi-holige', 'Kayi holige (coconut obbattu)', ['kobbari obbattu', 'coconut holige', 'kayi obbattu', 'thengai poli', 'kobbari bobbatlu'],
    [maida(150), oil(30), coconut(200), jaggery(150), riceFlour(20), ghee(20), water(80)], 560, [pc('1 holige', 60)]),
  r('belgaum-kunda', 'Belgaum kunda', ['kunda', 'belgavi kunda', 'kunda sweet'],
    [khoya(300), sugar(150), curd(50), milk(100)], 500, [pc('1 serving', 50)]),
  r('haalbai', 'Haalbai (rice-coconut-jaggery fudge)', ['halbai', 'akki halbai', 'rice halbai'],
    [rice(200), coconut(150), jaggery(200), ghee(40), water(400)], 800, [pc('1 piece', 40)]),
  r('karadantu', 'Karadantu (Gokak edible gum sweet)', ['gokak karadantu', 'amingad karadantu', 'karadant'],
    [gond(40), ghee(80), jaggery(250), almond(60), cashew(60), dryCoconut(60), poppy(10), raisin(40)], 580, [pc('1 piece', 30)]),
  r('ellu-bella', 'Ellu bella (Sankranti mix)', ['ellu bella', 'yellu bella', 'sankranti ellu', 'ellu'],
    [sesame(100), peanuts(100), dryCoconut(100), roastedGram(100), jaggery(150)], 550, [pc('1 handful', 30)]),
  r('gothambu-payasam', 'Gothambu payasam / godhi huggi (broken wheat)', ['godhi huggi', 'godhi payasa', 'broken wheat payasam', 'nurukku gothambu payasam'],
    [bulgur(100), jaggery(200), coconutMilk(300), water(500), ghee(20), cashew(15)], 850, [KATORI]),
  r('badam-puri', 'Badam puri (Karnataka)', ['badam poori sweet', 'badam puri sweet'],
    [maida(200), ghee(40), oil(50), ...syrup(150, 70), almond(10)], 450, [pc('1 piece', 30)]),
  r('mandige', 'Mandige (Karnataka paper sweet)', ['mandige', 'mande', 'manda sweet'],
    [maida(150), sooji(50), ghee(60), powderedSugar(120)], 340, [pc('1 piece', 50)]),
  r('hayagreeva', 'Hayagreeva (Udupi chana dal sweet)', ['hayagriva', 'hayagreeva maddi', 'kadalebele sihi'],
    [chanaDal(200), jaggery(200), ghee(50), coconut(50), cashew(15), water(400)], 650, [SMALL_BOWL]),
]

// ===================================== ANDHRA, TELANGANA, HYDERABAD
const ANDHRA: IndianRecipe[] = [
  r('pootharekulu', 'Pootharekulu (Atreyapuram paper sweet)', ['putharekulu', 'paper sweet', 'atreyapuram pootharekulu', 'pootharekhulu'],
    [riceFlour(50), ghee(60), powderedSugar(100), cashew(20), almond(20)], 245, [pc('1 piece', 25)]),
  r('gavvalu', 'Bellam gavvalu', ['gavvalu', 'sweet gavvalu', 'bellam gavvalu', 'shell sweet'],
    [maida(200), ghee(20), oil(50), jaggery(120), water(60)], 370, [pc('1 small bowl', 40)]),
  r('bandar-laddu', 'Bandar laddu (Machilipatnam)', ['bandaru laddu', 'tokkudu laddu', 'machilipatnam laddu'],
    [besan(250), ghee(120), ...syrup(250, 100), cashew(20)], 650, [pc('1 laddu', 40)]),
  r('boorelu', 'Boorelu / poornalu', ['purnalu', 'poornam boorelu', 'suzhiyan', 'poorna boorelu'],
    [chanaDal(200), jaggery(200), coconut(50), rice(100), uradDal(50), oil(60), water(100)], 700, [pc('1 boorelu', 50)]),
  r('chalividi', 'Chalividi', ['chalimidi', 'chalividi sweet', 'rice flour chalimidi'],
    [riceFlour(200), jaggery(150), coconut(80), ghee(30), water(80)], 480, [pc('1 small bowl', 50)]),
  r('palathalikalu', 'Palathalikalu', ['pala thalikalu', 'paala thalikalu', 'rice noodles in milk'],
    [riceFlour(150), water(150), milk(1000), sugar(150)], 1000, [KATORI]),
  r('gil-e-firdaus', 'Gil-e-firdaus (Hyderabadi)', ['gile firdaus', 'gil e firdous', 'lauki rice kheer hyderabadi'],
    [milk(1000), lauki(150), rice(30), sugar(120), khoya(50), almond(15), pista(15)], 900, [KATORI]),
  r('badam-ki-jaali', 'Badam ki jaali (Hyderabadi)', ['badam jali', 'badam ki jali', 'almond lattice sweet'],
    [almond(200), sugar(150), water(50)], 360, [pc('1 piece', 20)]),
  r('ande-ka-halwa', 'Ande ka halwa (Hyderabadi egg halwa)', ['egg halwa', 'anda halwa', 'ande ka meetha'],
    [egg(300), ghee(120), sugar(200), khoya(100), milk(100), almond(30)], 650, [pc('1 serving', 50)]),
  r('kakinada-kaja', 'Kakinada kaja (gottam kaja)', ['gottam kaja', 'kakinada khaja', 'kaja sweet'],
    [maida(200), ghee(30), oil(60), ...syrup(200, 80)], 490, [pc('1 kaja', 40)]),
  r('palkova', 'Palkova (Srivilliputhur)', ['paal kova', 'palkhova', 'srivilliputhur palkova', 'milk khova sweet'],
    [evapMilk(600), milkPowder(100), sugar(120)], 520, [pc('1 serving', 30)]),
]

// ================================================================ TAMIL NADU
const TAMIL: IndianRecipe[] = [
  r('sakkarai-pongal', 'Sakkarai pongal (sweet pongal)', ['sweet pongal', 'chakkara pongali', 'sakkara pongal', 'bellam pongali', 'sihi pongal'],
    [rice(150), moongDal(50), jaggery(250), ghee(60), cashew(15), raisin(15), milk(200), water(600)], 1100, [KATORI]),
  r('akkaravadisal', 'Akkaravadisal', ['akkara adisil', 'akkaravadisal', 'iyengar sweet pongal'],
    [rice(100), moongDal(25), milk(1000), jaggery(250), ghee(80), cashew(20)], 1000, [KATORI]),
  r('kasi-halwa', 'Kasi halwa (ash gourd)', ['kashi halwa', 'poosanikai halwa', 'white pumpkin halwa', 'kumbalakai halwa'],
    [ashGourd(1000), sugar(300), ghee(100), cashew(20)], 900, [pc('1 small katori', 80)]),
  r('kavuni-arisi', 'Kavuni arisi (black rice sweet)', ['kavuni arisi sweet', 'karuppu kavuni', 'black rice halwa'],
    [blackRice(150), water(500), sugar(150), coconut(80), ghee(20)], 700, [SMALL_BOWL]),
  r('maa-laddu', 'Maa laddu (roasted gram laddu)', ['maladu', 'pottukadalai laddu', 'dalia ladoo', 'maa urundai'],
    [roastedGram(200), powderedSugar(180), ghee(100), cashew(15)], 490, [pc('1 laddu', 35)]),
  r('tirunelveli-halwa', 'Tirunelveli halwa (wheat halwa)', ['iruttukadai halwa', 'godhumai halwa', 'wheat halwa', 'tirunelveli wheat halwa'],
    [atta(250), water(800), sugar(500), ghee(250), cashew(20)], 1150, [pc('1 piece', 60)]),
  r('kandarappam', 'Kandarappam (Chettinad)', ['kandarappam', 'chettinad kandarappam'],
    [rice(200), uradDal(20), jaggery(150), coconut(30), oil(60), water(150)], 520, [pc('1 piece', 35)]),
  r('pal-kozhukattai', 'Paal kozhukattai (rice balls in coconut milk)', ['pal kozhukattai', 'paal kozhukattai', 'kozhukattai payasam'],
    [riceFlour(150), water(400), coconutMilk(300), jaggery(150)], 900, [KATORI]),
  r('aval-kesari', 'Aval kesari (poha sweet)', ['poha kesari', 'avalakki kesari', 'atukula kesari'],
    [poha(150), ghee(60), sugar(180), water(350), cashew(15)], 600, [SMALL_BOWL]),
  r('pineapple-kesari', 'Pineapple kesari', ['pineapple sheera', 'pineapple rava kesari', 'pineapple kesari bath'],
    [sooji(150), ghee(70), sugar(200), pineapple(150), water(400), cashew(15)], 800, [SMALL_BOWL]),
  r('ulundu-kali', 'Ulundu kali (urad dal and jaggery)', ['ulundhu kali', 'urad dal kali', 'uzhunnu kali'],
    [uradDal(50), riceFlour(50), jaggery(150), oil(50), water(400)], 500, [SMALL_BOWL]),
  r('kalkandu-sadam', 'Kalkandu sadam (sugar candy rice)', ['kalkandu bath', 'kalkandu pongal', 'kalkandu rice'],
    [rice(150), milk(500), sugar(200), ghee(50), cashew(15), water(300)], 950, [KATORI]),
  r('mundhiri-kothu', 'Mundhiri kothu', ['munthiri kothu', 'mundiri kothu', 'payaru urundai'],
    [moongDal(200), jaggery(150), coconut(30), riceFlour(80), water(80), oil(40)], 520, [pc('1 piece', 30)]),
  r('vella-seedai', 'Vella seedai (jaggery seedai)', ['inippu seedai', 'sweet seedai', 'vellam seedai'],
    [riceFlour(200), jaggery(120), coconut(30), sesame(10), oil(50), water(60)], 400, [pc('1 small bowl', 40)]),
  r('jigarthanda', 'Jigarthanda (Madurai)', ['jigarthanda', 'jigar thanda', 'madurai jigarthanda'],
    [evapMilk(100), milk(100), nannari(20), iceCream(60), sugar(15)], 295, [pc('1 glass', 295)]),
  r('nannari-sarbath', 'Nannari sarbath', ['nannari sharbat', 'sarsaparilla sharbat', 'nannari lemon'],
    [nannari(40), water(200), lemon(10)], 250, [GLASS]),
  r('bread-halwa', 'Bread halwa (wedding style)', ['bread halwa', 'bread ka halwa', 'bread sweet'],
    [bread(200), ghee(80), sugar(150), milk(200), cashew(20)], 520, [SMALL_BOWL]),
  r('badam-kheer', 'Badam kheer (badam payasam)', ['badam payasam', 'almond kheer', 'badam payasa'],
    [almond(80), milk(800), sugar(100)], 800, [KATORI]),
  r('aval-payasam', 'Aval payasam (poha kheer)', ['poha kheer', 'avalakki payasa', 'atukula payasam'],
    [poha(60), milk(800), sugar(100), ghee(10), cashew(10)], 800, [KATORI]),
]

// ================================================================ KERALA
const KERALA: IndianRecipe[] = [
  r('chakka-varatti', 'Chakka varatti (jackfruit jam)', ['chakka varattiyathu', 'jackfruit halwa', 'chakka jam'],
    [jackfruit(1000), jaggery(500), ghee(80)], 1000, [pc('1 tbsp', 25)]),
  r('chakka-ada', 'Chakka ada (jackfruit ada)', ['chakka ada', 'jackfruit ela ada', 'chakka appam'],
    [riceFlour(200), jackfruit(200), jaggery(120), coconut(80), water(80)], 650, [pc('1 ada', 60)]),
  r('ari-unda', 'Ari unda (rice-jaggery ladoo)', ['avalose unda', 'ari unda', 'kasar ladoo', 'rice ladoo'],
    [rice(200), jaggery(150), coconut(100), ghee(20)], 460, [pc('1 unda', 30)]),
  r('kinnathappam', 'Kinnathappam', ['kinnathappam', 'kinnathappam malabar'],
    [riceFlour(200), coconutMilk(400), sugar(200), ghee(30)], 750, [pc('1 piece', 50)]),
  r('vattayappam', 'Vattayappam (steamed sweet rice cake)', ['vattayappam', 'vatteppam', 'kerala steamed cake'],
    [riceFlour(250), coconut(100), sugar(120), water(300), cashew(10), raisin(10)], 740, [pc('1 piece', 60)]),
  r('unnakaya', 'Unnakaya (Malabar)', ['unnakkaya', 'unnakai', 'banana unnakaya'],
    [plantain(400), egg(50), coconut(60), sugar(50), cashew(15), raisin(15), ghee(10), oil(40)], 560, [pc('1 piece', 50)]),
  r('pazham-nirachathu', 'Pazham nirachathu (stuffed banana)', ['pazham nirachathu', 'stuffed banana fry', 'kai nirachathu'],
    [plantain(300), coconut(100), sugar(40), ghee(10), cashew(10), raisin(10), maida(30), oil(30)], 470, [pc('1 piece', 80)]),
  r('kalathappam', 'Kalathappam (Malabar)', ['kalthappam', 'kalathappam', 'cooker appam'],
    [rice(200), jaggery(180), coconut(30), onion(20), ghee(20), water(300)], 640, [pc('1 piece', 60)]),
  r('sharkara-upperi', 'Sharkara upperi (jaggery banana chips)', ['sharkara varatti', 'sarkara upperi', 'jaggery banana chips'],
    [bananaChips(300), jaggery(150)], 430, [pc('1 small bowl', 30)]),
  r('pazham-pradhaman', 'Pazham pradhaman (banana payasam)', ['ethapazham pradhaman', 'banana payasam', 'nenthrapazham payasam'],
    [plantain(500), jaggery(300), coconutMilk(450), ghee(30), cashew(15), coconut(20), water(350)], 1250, [KATORI]),
  r('kadala-pradhaman', 'Kadala pradhaman (chana dal payasam)', ['kadala parippu pradhaman', 'kadalebele payasa', 'chana dal payasam', 'senaga pappu payasam'],
    [chanaDal(150), jaggery(250), coconutMilk(450), water(650), ghee(20)], 1200, [KATORI]),
  r('elaneer-payasam', 'Elaneer payasam (tender coconut)', ['tender coconut payasam', 'ilaneer payasam', 'tender coconut kheer'],
    [milk(500), condMilk(100), coconut(80), coconutWater(100)], 760, [KATORI]),
  r('mutta-mala', 'Mutta mala (egg yolk threads)', ['mutta maala', 'egg garland sweet', 'malabar mutta mala'],
    [eggYolk(200), ...syrup(250, 150)], 450, [pc('1 serving', 50)]),
  r('aval-vilayichathu', 'Aval vilayichathu (jaggery poha)', ['aval nanachathu', 'avil vilayichathu', 'sweet poha kerala', 'vella aval', 'bellam atukulu'],
    [poha(200), jaggery(180), coconut(150), ghee(10), sesame(10), water(60)], 560, [SMALL_BOWL]),
  r('sukhiyan', 'Sukhiyan (green gram sweet fritters)', ['suhiyan', 'sughiyan', 'sukhiyan kerala'],
    [moongDal(200), jaggery(150), coconut(80), maida(100), riceFlour(20), water(100), oil(50)], 650, [pc('1 piece', 50)]),
]

// ================================================================ NORTHEAST
const NORTHEAST: IndianRecipe[] = [
  r('til-pitha', 'Til pitha (Assam)', ['til pithe', 'assamese til pitha', 'bihu til pitha'],
    [stickyRice(200), sesame(60), jaggery(100), water(50)], 380, [pc('1 pitha', 30)]),
  r('ghila-pitha', 'Ghila pitha (Assam)', ['ghila pithe', 'tel pitha', 'assamese ghila pitha'],
    [stickyRice(200), jaggery(120), water(80), oil(50)], 400, [pc('1 pitha', 30)]),
  r('sunga-pitha', 'Sunga pitha (bamboo rice cake)', ['chunga pitha', 'sunga saul', 'bamboo pitha'],
    [stickyRice(200), water(150), coconut(50), sugar(40)], 420, [pc('1 piece', 80)]),
  r('chak-hao-kheer', 'Chak-hao kheer (Manipuri black rice)', ['chakhao kheer', 'chak hao amubi kheer', 'black rice kheer', 'manipuri kheer'],
    [blackRice(100), milk(1000), sugar(120)], 850, [KATORI]),
  r('pukhlein', 'Pukhlein (Khasi sweet rice fritter)', ['pukhlein', 'khasi pukhlein', 'meghalaya pukhlein'],
    [riceFlour(200), jaggery(120), water(120), oil(50)], 440, [pc('1 piece', 40)]),
  r('khapse', 'Khapse (Losar fried biscuit)', ['khapsey', 'kapse', 'losar khapse'],
    [maida(250), butter(50), sugar(60), egg(50), milk(60), oil(50)], 450, [pc('1 piece', 30)]),
]

// ===================================== SINDHI, PARSI, BOHRI, IRANI
const COMMUNITY: IndianRecipe[] = [
  r('mithi-lolli', 'Mithi lolli (Sindhi sweet koki)', ['mithi loli', 'meethi lolo', 'sindhi lolo', 'mitho lolo'],
    [atta(250), sugar(80), ghee(50), water(80)], 400, [pc('1 lolli', 80)]),
  r('singhar-ji-mithai', 'Singhar ji mithai (Sindhi sev barfi)', ['singhar mithai', 'sev mithai', 'sindhi sev barfi'],
    [besan(150), oil(40), khoya(150), ...syrup(150, 60)], 480, [pc('1 piece', 35)]),
  r('lagan-nu-custard', 'Lagan nu custard (Parsi)', ['lagan nu custard', 'parsi wedding custard', 'parsi custard'],
    [milk(1000), condMilk(200), egg(250), sugar(80), almond(10), pista(10)], 1300, [pc('1 serving', 120)]),
  r('parsi-ravo', 'Ravo (Parsi sooji)', ['ravo', 'parsi ravo', 'parsi sooji'],
    [sooji(60), ghee(40), milk(750), sugar(100), almond(10), raisin(10)], 750, [KATORI]),
  r('kumas', 'Kumas (Parsi cake)', ['kumas cake', 'parsi kumas'],
    [sooji(150), maida(50), sugar(150), butter(120), egg(150), milk(100)], 640, [pc('1 slice', 60)]),
  r('malido', 'Malido (Parsi / Bohri)', ['malida', 'parsi malido', 'bohri malida'],
    [atta(150), sooji(50), ghee(120), sugar(200), egg(100), milk(200), almond(30), raisin(20)], 720, [pc('1 serving', 60)]),
  r('dar-ni-pori', 'Dar ni pori (Parsi sweet dal pie)', ['daar ni pori', 'dal ni pori', 'parsi dar ni pori'],
    [maida(200), butter(100), toorDal(150), sugar(180), water(250), almond(20)], 700, [pc('1 slice', 60)]),
  r('bhakhra', 'Bhakhra (Parsi fried sweet)', ['bhakra', 'parsi bhakhra'],
    [atta(150), sooji(50), sugar(100), ghee(30), oil(40), water(50)], 360, [pc('1 piece', 30)]),
  r('chapat', 'Chapat (Parsi coconut pancake)', ['parsi chapat', 'chapat pancake'],
    [maida(100), milk(150), egg(50), sugar(40), butter(10), coconut(30)], 340, [pc('1 chapat', 60)]),
  r('doodh-na-puff', 'Doodh na puff (Parsi milk froth)', ['dudh na puff', 'parsi milk froth', 'doodh puff'],
    [milk(300), sugar(20)], 320, [GLASS]),
  r('lab-e-shireen', 'Lab-e-shireen (fruit custard with jelly)', ['lab e shireen', 'labe shireen', 'fruit cream jelly'],
    [milk(500), sugar(80), cornstarch(25), fruitCocktail(200), jellyMix(30), water(200)], 1000, [KATORI]),
  r('bun-maska', 'Bun maska (Irani cafe)', ['bun maska', 'maska bun', 'irani bun maska'],
    [sweetRoll(80), butter(15), sugar(5)], 100, [pc('1 bun maska', 100)]),
  r('brun-maska', 'Brun maska (Irani cafe)', ['brun pav', 'gutli pav', 'brun maska pav', 'hard bun butter'],
    [hardRoll(90), butter(15)], 105, [pc('1 brun maska', 105)]),
  r('osmania-biscuit', 'Osmania biscuit', ['osmania biscuits', 'hyderabadi osmania biscuit', 'irani biscuit'],
    [maida(200), butter(100), sugar(80), milkPowder(20), milk(30)], 400, [pc('2 biscuits', 20)]),
  r('karachi-biscuit', 'Karachi fruit biscuit', ['fruit biscuit', 'karachi biscuits', 'tutti frutti biscuit'],
    [maida(200), butter(130), powderedSugar(100), candiedFruit(60), cashew(20), milk(20)], 490, [pc('2 biscuits', 20)]),
  r('shrewsbury-biscuit', 'Shrewsbury biscuit (Pune)', ['shrewsbury biscuits', 'kayani biscuit', 'shrewsbury cookies'],
    [maida(200), butter(130), powderedSugar(100), milk(20)], 420, [pc('2 biscuits', 24)]),
  r('mawa-cake', 'Mawa cake (Irani bakery)', ['mava cake', 'irani mawa cake', 'parsi mawa cake'],
    [maida(200), khoya(150), butter(150), sugar(180), egg(200), cashew(20)], 810, [pc('1 cup cake', 60)]),
  r('mawa-samosa', 'Mawa samosa (sweet)', ['mava samosa', 'sweet samosa', 'khoya samosa'],
    [maida(100), ghee(15), oil(30), khoya(100), sugar(40), almond(10), cashew(10)], 280, [pc('1 samosa', 40)]),
  r('caramel-custard', 'Caramel custard', ['caramel pudding', 'creme caramel', 'egg pudding'],
    [milk(500), egg(200), sugar(160)], 800, [pc('1 serving', 120)]),
]

// ================================================================ BAKERY
const BAKERY: IndianRecipe[] = [
  r('nankhatai', 'Nankhatai', ['nan khatai', 'nankatai', 'naan khatai', 'ghee biscuit'],
    [maida(150), besan(30), sooji(20), ghee(100), powderedSugar(100)], 370, [pc('1 nankhatai', 15)]),
  r('cream-roll', 'Cream roll (bakery)', ['cream horn', 'cream roll puff', 'bakery cream roll'],
    [puffPastry(25), frosting(15)], 40, [pc('1 cream roll', 40)]),
  r('egg-puff', 'Egg puff (bakery)', ['egg patties', 'egg puffs', 'mutta puffs', 'egg patty'],
    [puffPastry(50), egg(30), onion(20), oil(3)], 100, [pc('1 egg puff', 100)]),
  r('chicken-puff', 'Chicken puff (bakery)', ['chicken patties', 'chicken patty', 'chicken puffs'],
    [puffPastry(50), chicken(35), onion(15), oil(3)], 100, [pc('1 chicken puff', 100)]),
  r('dilkhush', 'Dilkhush / dilpasand (bakery)', ['dil pasand', 'dilpasand', 'dilkush', 'coconut stuffed bread'],
    [sweetRoll(100), coconut(25), sugar(15), candiedFruit(10), cashew(5)], 150, [pc('1 slice', 75)]),
  r('coconut-bun', 'Coconut bun', ['coconut bun', 'nariyal bun', 'thengai bun'],
    [sweetRoll(70), coconut(20), sugar(10)], 100, [pc('1 bun', 100)]),
  r('cream-bun', 'Cream bun', ['cream bun', 'butter cream bun'],
    [sweetRoll(60), frosting(25)], 85, [pc('1 bun', 85)]),
  r('jam-bun', 'Jam bun', ['jam bun', 'jam pav'],
    [sweetRoll(60), jam(15)], 75, [pc('1 bun', 75)]),
  r('fruit-bun', 'Fruit bun (tutti frutti)', ['tutti frutti bun', 'fruit bun', 'raisin bun'],
    [sweetRoll(70), candiedFruit(10), raisin(10)], 90, [pc('1 bun', 90)]),
  r('sweet-bun', 'Sweet bun (tea bun)', ['meetha bun', 'tea bun', 'milk bun', 'sweet pav'],
    [sweetRoll(60)], 60, [pc('1 bun', 60)]),
  r('honey-cake', 'Honey cake (bakery)', ['honey cake', 'bakery honey cake', 'jam coconut cake'],
    [...sponge(2), honey(60), jam(60), dryCoconut(30), water(50)], 780, [pc('1 piece', 60)]),
  r('plum-cake', 'Plum cake (Christmas)', ['kerala plum cake', 'christmas cake', 'christmas fruit cake', 'rich plum cake'],
    [maida(200), butter(180), brownSugar(180), egg(200), raisin(100), candiedFruit(80), dates(50), cashew(40)], 920, [SLICE]),
  r('vanilla-sponge-cake', 'Vanilla sponge cake (tea cake)', ['tea cake', 'sponge cake', 'vanilla cake', 'bakery cake', 'plain cake'],
    [maida(200), sugar(200), egg(200), oil(60), milk(60)], 640, [SLICE]),
  r('eggless-vanilla-cake', 'Eggless vanilla cake (condensed milk)', ['eggless cake', 'eggless sponge cake', 'condensed milk cake'],
    [maida(250), condMilk(200), butter(100), milk(150), sugar(50)], 680, [SLICE]),
  r('chocolate-tea-cake', 'Chocolate tea cake', ['chocolate sponge cake', 'chocolate cake plain', 'choco cake'],
    [maida(180), cocoa(30), sugar(200), egg(200), oil(80), milk(80)], 690, [SLICE]),
  r('marble-cake', 'Marble cake', ['marble cake', 'zebra cake'],
    [maida(200), butter(150), sugar(180), egg(200), milk(50), cocoa(15)], 720, [SLICE]),
  r('tutti-frutti-cake', 'Tutti frutti cake', ['fruit cake bakery', 'tutti frutti cake', 'tutti fruity cake'],
    [maida(200), sugar(180), butter(120), egg(150), candiedFruit(80), milk(50)], 700, [SLICE]),
  r('banana-cake', 'Banana cake / banana bread', ['banana bread', 'banana walnut cake', 'kela cake'],
    [maida(200), banana(250), sugar(150), oil(100), egg(100), walnut(30)], 720, [pc('1 slice', 60)]),
  r('date-walnut-cake', 'Date and walnut cake', ['dates walnut cake', 'khajur cake', 'date cake'],
    [maida(200), dates(200), milk(200), sugar(100), butter(100), walnut(60)], 760, [pc('1 slice', 60)]),
  r('black-forest-cake', 'Black forest cake / pastry', ['black forest pastry', 'black forest', 'blackforest cake'],
    [maida(100), cocoa(20), sugar(110), egg(120), oil(30), whip(250), cherry(60), darkChoc(40), ...syrup(30, 50)], 790, [PASTRY, pc('1 slice', 100)]),
  r('pineapple-cake', 'Pineapple cake / pastry', ['pineapple pastry', 'pineapple cream cake'],
    [...sponge(1), whip(250), pineappleCanned(150), water(50)], 790, [PASTRY, pc('1 slice', 100)]),
  r('butterscotch-cake', 'Butterscotch cake / pastry', ['butterscotch pastry', 'butterscotch cream cake'],
    [...sponge(1), whip(250), caramel(60), cashew(30), sugar(30)], 710, [PASTRY, pc('1 slice', 100)]),
  r('chocolate-truffle-cake', 'Chocolate truffle cake / pastry', ['truffle pastry', 'chocolate truffle pastry', 'truffle cake', 'ganache cake'],
    [maida(100), cocoa(20), sugar(100), egg(120), oil(40), darkChoc(200), cream(200)], 760, [PASTRY, pc('1 slice', 100)]),
  r('red-velvet-cake', 'Red velvet cake / pastry', ['red velvet pastry', 'red velvet', 'red velvet cream cheese cake'],
    [maida(150), cocoa(8), sugar(150), oil(100), curd(120), egg(100), creamCheese(150), butter(50), powderedSugar(150)], 920, [PASTRY]),
  r('strawberry-cake', 'Strawberry cake / pastry', ['strawberry pastry', 'strawberry cream cake'],
    [...sponge(1), whip(250), strawTopping(60), strawberry(50), water(50)], 760, [PASTRY]),
  r('swiss-roll', 'Swiss roll (jam roll)', ['jam roll', 'swiss roll cake', 'jelly roll'],
    [maida(100), sugar(100), egg(150), jam(120)], 430, [pc('1 slice', 35)]),
  r('cupcake', 'Cupcake (with frosting)', ['cup cake', 'frosted cupcake', 'vanilla cupcake'],
    [maida(150), sugar(120), butter(100), egg(100), milk(60), frosting(150)], 620, [pc('1 cupcake', 60)]),
  r('chocolate-muffin', 'Chocolate chip muffin', ['choco chip muffin', 'chocolate muffin', 'double chocolate muffin'],
    [maida(200), cocoa(30), sugar(150), oil(100), egg(100), milk(150), darkChoc(60)], 700, [pc('1 muffin', 80)]),
  r('blueberry-muffin', 'Blueberry muffin', ['blueberry muffin', 'muffin'],
    [u(172765)(100)], 100, [pc('1 muffin', 80)]),
  r('brownie', 'Chocolate walnut brownie', ['brownie', 'walnut brownie', 'fudge brownie', 'chocolate brownie'],
    [darkChoc(150), butter(120), sugar(200), egg(150), maida(80), walnut(50), cocoa(20)], 680, [pc('1 brownie', 60)]),
  r('glazed-doughnut', 'Glazed doughnut', ['donut', 'doughnut', 'sugar glazed donut'],
    [u(172758)(100)], 100, [pc('1 doughnut', 60)]),
  r('chocolate-doughnut', 'Chocolate doughnut', ['chocolate donut', 'choco donut', 'chocolate frosted doughnut'],
    [u(174991)(100)], 100, [pc('1 doughnut', 65)]),
  r('butter-croissant', 'Butter croissant', ['croissant', 'plain croissant'],
    [u(174987)(100)], 100, [pc('1 croissant', 60)]),
  r('chocolate-croissant', 'Chocolate croissant', ['pain au chocolat', 'choco croissant'],
    [u(174987)(60), darkChoc(12)], 72, [pc('1 croissant', 72)]),
  r('cinnamon-roll', 'Cinnamon roll', ['cinnamon bun', 'cinnamon swirl'],
    [u(167940)(100)], 100, [pc('1 roll', 90)]),
  r('chocolate-eclair', 'Chocolate eclair', ['eclair', 'cream eclair', 'chocolate eclairs pastry'],
    [u(167534)(100)], 100, [pc('1 eclair', 70)]),
  r('apple-pie', 'Apple pie', ['apple pie slice', 'apple tart'],
    [u(175012)(100)], 100, [pc('1 slice', 120)]),
  r('jam-tart', 'Jam tart (bakery)', ['jam tart', 'jam tarts', 'strawberry jam tart'],
    [pieCrust(30), jam(15)], 45, [pc('1 tart', 45)]),
  r('coconut-tart', 'Coconut tart (bakery)', ['coconut tarts', 'goan coconut tart', 'mangalore coconut tart'],
    [pieCrust(30), dryCoconut(12), sugar(8), egg(5)], 53, [pc('1 tart', 53)]),
  r('coconut-cookies', 'Coconut cookies', ['coconut biscuit', 'nariyal biscuit', 'coconut crunch biscuit'],
    [maida(150), dryCoconut(80), butter(100), sugar(100)], 400, [pc('2 cookies', 20)]),
  r('jeera-biscuit', 'Jeera biscuit (bakery)', ['jeera cookies', 'cumin biscuit', 'jeera butter biscuit'],
    [maida(200), butter(100), sugar(40), milk(40)], 350, [pc('2 biscuits', 20)]),
  r('atta-biscuit', 'Atta jaggery biscuit', ['wheat biscuit', 'atta cookies', 'gur atta biscuit', 'whole wheat jaggery cookies'],
    [atta(200), ghee(100), jaggery(100), milk(30)], 400, [pc('2 biscuits', 20)]),
  r('kaju-biscuit', 'Kaju biscuit (cashew cookies)', ['cashew cookies', 'kaju cookies', 'kaju pista biscuit'],
    [maida(200), butter(120), powderedSugar(100), cashew(60)], 450, [pc('2 biscuits', 20)]),
  r('butter-cookies', 'Butter cookies (bakery)', ['butter biscuit', 'danish butter cookies', 'butter cookie'],
    [maida(200), butter(150), powderedSugar(100)], 420, [pc('2 cookies', 20)]),
  r('choco-chip-cookies', 'Chocolate chip cookie', ['choco chip cookies', 'chocolate chip cookies', 'cafe cookie'],
    [maida(200), butter(120), brownSugar(150), egg(50), darkChoc(100)], 560, [pc('1 cookie', 25)]),
  r('oats-cookies', 'Oats cookies', ['oatmeal cookies', 'oats biscuit', 'oats raisin cookies'],
    [oats(150), atta(100), butter(100), brownSugar(100), raisin(40)], 450, [pc('2 cookies', 25)]),
  r('coconut-macaroon', 'Coconut macaroon', ['coconut macaroons', 'macaroon'],
    [dryCoconut(200), condMilk(200)], 360, [pc('1 macaroon', 20)]),
  r('fruit-bread', 'Fruit bread (tutti frutti)', ['tutti frutti bread', 'fruit bread', 'sweet bread'],
    [maida(250), water(150), sugar(30), butter(20), milkPowder(10), candiedFruit(50)], 450, [pc('1 slice', 30)]),
  r('rum-ball', 'Rum ball (bakery chocolate cake ball)', ['rum balls', 'cake ball', 'chocolate rum ball'],
    [...sponge(1), darkChoc(50), condMilk(60), cocoa(10), jam(20), dryCoconut(20)], 400, [pc('1 rum ball', 30)]),
  r('carrot-cake', 'Carrot cake (cream cheese frosting)', ['carrot walnut cake', 'carrot cake slice'],
    [maida(150), carrot(200), brownSugar(150), oil(120), egg(100), walnut(50), creamCheese(100), powderedSugar(80), butter(30)], 880, [pc('1 slice', 90)]),
  r('chocolate-walnut-cake', 'Chocolate walnut cake (Irani)', ['choco walnut cake', 'walnut chocolate cake'],
    [maida(200), cocoa(30), sugar(200), butter(150), egg(200), walnut(80), milk(50)], 820, [SLICE]),
]

// ================================================== CAFE DESSERTS, CHOCOLATE
const CAFE: IndianRecipe[] = [
  r('sizzling-brownie', 'Sizzling brownie with ice cream', ['sizzling brownie', 'brownie sizzler', 'hot brownie sizzler'],
    [...brownieBase(), iceCream(80), chocSyrup(40)], 225, [pc('1 sizzler', 225)]),
  r('brownie-ice-cream', 'Brownie with ice cream', ['brownie with vanilla ice cream', 'brownie a la mode', 'hot brownie with ice cream'],
    [...brownieBase(), iceCream(70)], 175, [pc('1 serving', 175)]),
  r('choco-lava-cake', 'Choco lava cake', ['chocolate lava cake', 'molten lava cake', 'choco lava'],
    [darkChoc(50), butter(40), sugar(30), egg(50), maida(15)], 170, [pc('1 lava cake', 85)]),
  r('chocolate-mousse', 'Chocolate mousse', ['choco mousse', 'dark chocolate mousse'],
    [darkChoc(150), cream(300), egg(100), sugar(50)], 590, [pc('1 cup', 100)]),
  r('tiramisu', 'Tiramisu', ['tiramisu cake', 'coffee tiramisu'],
    [creamCheese(250), cream(200), sugar(100), egg(100), ladyfinger(120), coffee(150), cocoa(10)], 900, [pc('1 serving', 100)]),
  r('baked-cheesecake', 'Baked cheesecake (blueberry)', ['blueberry cheesecake', 'cheesecake', 'new york cheesecake'],
    [marie(120), butter(60), creamCheese(400), sugar(120), egg(100), cream(100), jam(40), blueberry(40)], 900, [pc('1 slice', 100)]),
  r('oreo-cheesecake', 'Oreo cheesecake (no bake)', ['oreo cheese cake', 'no bake cheesecake'],
    [oreo(150), butter(40), creamCheese(250), cream(150), powderedSugar(80)], 660, [pc('1 slice', 100)]),
  r('banoffee-pie', 'Banoffee pie', ['banoffee', 'banana toffee pie'],
    [marie(150), butter(70), condMilk(300), banana(200), cream(200), sugar(20)], 920, [pc('1 slice', 100)]),
  r('tres-leches', 'Tres leches cake', ['three milk cake', 'tres leches', 'rasmalai tres leches'],
    [maida(100), sugar(100), egg(150), milk(150), condMilk(150), evapMilk(100), whip(100)], 840, [pc('1 piece', 100)]),
  r('death-by-chocolate', 'Death by chocolate (DBC sundae)', ['dbc', 'death by chocolate', 'corner house dbc'],
    [maida(25), cocoa(5), sugar(30), egg(30), oil(10), iceCreamChoc(120), chocSyrup(60), cream(30), walnut(15), cherry(10)], 330, [pc('1 serving', 330)]),
  r('hot-chocolate-fudge', 'Hot chocolate fudge (HCF sundae)', ['hcf', 'hot chocolate fudge', 'chocolate fudge sundae'],
    [iceCream(150), chocSyrup(70), cashew(10), peanuts(10)], 240, [pc('1 sundae', 240)]),
  r('gadbad-ice-cream', 'Gadbad ice cream (Mangalore)', ['gadbad', 'gad bad', 'mangalore gadbad'],
    [iceCream(80), iceCreamStraw(60), iceCreamChoc(60), fruitCocktail(80), jellyMix(10), water(50), cashew(10), cherry(10)], 360, [pc('1 glass', 360)]),
  r('banana-split', 'Banana split', ['banana split sundae', 'banana boat ice cream'],
    [banana(120), iceCream(60), iceCreamChoc(60), iceCreamStraw(60), chocSyrup(30), whip(20), cherry(5), cashew(10)], 365, [pc('1 serving', 365)]),
  r('fruit-salad-ice-cream', 'Fruit salad with ice cream', ['fruit salad ice cream', 'fruit cream ice cream', 'fruit sundae'],
    [apple(60), banana(60), pomegranate(30), pineapple(40), papaya(40), iceCream(80)], 310, [pc('1 bowl', 310)]),
  r('fruit-custard', 'Fruit custard', ['custard', 'fruit custard bowl', 'vanilla custard with fruits'],
    [milk(500), sugar(60), cornstarch(25), banana(100), apple(100), grapes(80), pomegranate(50)], 880, [KATORI]),
  r('bread-pudding', 'Baked bread and butter pudding', ['baked bread pudding', 'bread and butter pudding', 'bread custard pudding'],
    [bread(200), milk(400), egg(150), sugar(100), butter(30), raisin(30)], 800, [pc('1 serving', 100)]),
  r('trifle-pudding', 'Trifle pudding (custard, jelly, cake)', ['trifle', 'custard trifle', 'fruit trifle'],
    [...sponge(0.5), milk(400), sugar(50), cornstarch(25), jellyMix(40), water(200), fruitCocktail(150), whip(80)], 1080, [pc('1 bowl', 150)]),
  r('chocolate-pudding', 'Chocolate pudding (cornflour)', ['choco pudding', 'chocolate custard', 'cornflour chocolate pudding'],
    [milk(500), cocoa(20), sugar(80), cornstarch(30)], 580, [pc('1 cup', 100)]),
  r('mango-mousse', 'Mango mousse', ['mango pudding', 'mango cream', 'mango delight'],
    [mango(300), cream(200), condMilk(100), gelatin(10)], 600, [pc('1 cup', 100)]),
  r('china-grass-pudding', 'China grass pudding (agar)', ['china grass', 'agar agar pudding', 'milk china grass'],
    [milk(500), sugar(80), agar(5), condMilk(50)], 600, [pc('1 piece', 80)]),
  r('waffle-chocolate', 'Waffle with chocolate sauce', ['belgian waffle', 'chocolate waffle', 'waffle'],
    [maida(100), milk(100), egg(50), butter(30), sugar(20), chocSyrup(40)], 300, [pc('1 waffle with sauce', 150)]),
  r('pancakes-maple', 'Pancakes with maple syrup', ['pancakes', 'maple pancakes', 'american pancakes'],
    [maida(120), milk(180), egg(50), butter(20), sugar(20), maple(60)], 400, [pc('3 pancakes with syrup', 200)]),
  r('nutella-crepe', 'Nutella banana crepe', ['nutella crepe', 'chocolate crepe', 'crepe'],
    [maida(60), milk(120), egg(50), butter(10), nutella(50), banana(60)], 310, [pc('1 crepe', 155)]),
  r('chocolate-truffles', 'Chocolate truffles (homemade)', ['truffles', 'chocolate truffle balls', 'ganache truffles'],
    [darkChoc(200), cream(100), cocoa(15), butter(10)], 320, [pc('1 truffle', 15)]),
  r('chocolate-fudge', 'Chocolate walnut fudge', ['fudge', 'chocolate fudge', 'condensed milk fudge'],
    [condMilk(300), darkChoc(200), butter(30), walnut(40)], 560, [pc('1 piece', 20)]),
  r('homemade-chocolate', 'Homemade milk chocolate with almonds', ['homemade chocolate', 'almond chocolate', 'chocolate bar homemade'],
    [milkChoc(200), almond(40)], 240, [pc('1 piece', 10)]),
  r('dark-chocolate', 'Dark chocolate (70-85%)', ['dark chocolate', 'bitter chocolate', '70 percent chocolate'],
    [darkChoc70(100)], 100, [pc('2 squares', 20)]),
  r('rasmalai-cake', 'Rasmalai cake', ['rasmalai pastry', 'rasmalai cream cake'],
    [maida(150), sugar(150), egg(150), oil(50), paneer(100), sugar(50), whip(200), evapMilk(150), pista(15)], 1000, [PASTRY]),
]

// =========================================== KULFI, ICE CREAM, GOLA
const FROZEN: IndianRecipe[] = [
  r('paan-kulfi', 'Paan kulfi', ['paan ice cream', 'pan kulfi', 'betel leaf kulfi', 'gulkand kulfi'],
    [evapMilk(500), sugar(50), gulkand(40), milkPowder(20)], 600, [pc('1 kulfi', 60)]),
  r('chocolate-kulfi', 'Chocolate kulfi', ['choco kulfi', 'chocolate matka kulfi'],
    [evapMilk(500), sugar(60), cocoa(15), milkChoc(40), milkPowder(20)], 620, [pc('1 kulfi', 60)]),
  r('sitaphal-kulfi', 'Sitaphal kulfi', ['custard apple kulfi', 'seethaphal kulfi'],
    [evapMilk(400), sitaphal(200), sugar(50), milkPowder(20)], 660, [pc('1 kulfi', 60)]),
  r('chikoo-kulfi', 'Chikoo kulfi', ['sapota kulfi', 'chiku kulfi'],
    [evapMilk(400), chikoo(200), sugar(50)], 640, [pc('1 kulfi', 60)]),
  r('sitaphal-ice-cream', 'Sitaphal ice cream', ['custard apple ice cream', 'seethaphal ice cream'],
    [milk(300), cream(200), sugar(100), sitaphal(250)], 840, [SCOOP]),
  r('tender-coconut-ice-cream', 'Tender coconut ice cream', ['coconut ice cream', 'elaneer ice cream'],
    [milk(300), cream(200), sugar(100), coconut(150)], 740, [SCOOP]),
  r('kaju-kishmish-ice-cream', 'Kaju kishmish ice cream', ['kaju draksh', 'rum and raisin ice cream', 'cashew raisin ice cream'],
    [iceCream(900), cashew(60), raisin(60)], 1020, [SCOOP]),
  r('black-currant-ice-cream', 'Black currant ice cream', ['blackcurrant ice cream', 'black current ice cream'],
    [milk(300), cream(250), sugar(120), blackCurrant(150)], 810, [SCOOP]),
  r('tutti-frutti-ice-cream', 'Tutti frutti ice cream', ['tutti fruity ice cream', 'tutti frutti'],
    [iceCream(900), candiedFruit(100)], 1000, [SCOOP]),
  r('anjeer-ice-cream', 'Anjeer ice cream', ['fig ice cream', 'anjir ice cream'],
    [milk(300), cream(250), sugar(80), figs(150)], 770, [SCOOP]),
  r('rajbhog-ice-cream', 'Rajbhog ice cream (kesar dry fruit)', ['rajbhog ice cream', 'kesar dry fruit ice cream', 'dry fruit ice cream'],
    [iceCream(900), cashew(30), almond(30), pista(30)], 990, [SCOOP]),
  r('cassata', 'Cassata ice cream slice', ['cassata', 'casatta', 'cassata slice'],
    [iceCream(500), iceCreamStraw(200), ...sponge(0.5), candiedFruit(50), cashew(30)], 940, [pc('1 slice', 90)]),
  r('choco-bar', 'Choco bar (ice cream bar)', ['chocobar', 'choco bar ice cream', 'chocolate bar ice cream'],
    [iceCream(60), milkChoc(15)], 75, [pc('1 bar', 75)]),
  r('ice-candy', 'Orange ice candy / ice lolly', ['orange bar', 'ice lolly', 'pepsi ice', 'ice candy', 'orange candy'],
    [sugar(60), water(300), orange(100)], 460, [pc('1 candy', 60)]),
  r('ice-gola', 'Ice gola (baraf ka gola)', ['baraf ka gola', 'kala khatta gola', 'chuski', 'snow cone', 'gola'],
    [water(220), sugar(35), lime(5)], 260, [pc('1 gola', 260)]),
  r('malai-gola', 'Malai gola (with condensed milk)', ['malai gola', 'dish gola', 'cream gola'],
    [water(200), sugar(35), condMilk(30), freshCream(20), lime(5)], 290, [pc('1 gola', 290)]),
  r('softy-cone', 'Softy cone (soft serve)', ['softy', 'soft serve', 'soft serve cone', 'softy ice cream'],
    [softServe(80), sugarCone(12)], 92, [pc('1 cone', 92)]),
  r('ice-cream-sandwich', 'Ice cream sandwich (wafer)', ['ice cream biscuit', 'wafer ice cream sandwich', 'ice cream slab sandwich'],
    [iceCream(60), wafer(20)], 80, [pc('1 sandwich', 80)]),
]

// ==================================================== SWEET DRINKS
const DRINKS: IndianRecipe[] = [
  r('kesar-pista-falooda', 'Kesar pista falooda', ['kesar falooda', 'saffron falooda', 'pista falooda'],
    [milk(200), sugar(25), iceCream(70), vermicelli(15), chia(5), pista(10), almond(5), water(40)], 370, [pc('1 glass', 370)]),
  r('mango-falooda', 'Mango falooda', ['mango faluda', 'aam falooda'],
    [milk(150), mango(100), sugar(20), iceCream(60), vermicelli(15), chia(5), water(40), almond(5)], 395, [pc('1 glass', 395)]),
  r('chocolate-falooda', 'Chocolate falooda', ['choco falooda', 'chocolate faluda'],
    [milk(200), chocSyrup(30), iceCreamChoc(70), vermicelli(15), chia(5), water(40), almond(5)], 365, [pc('1 glass', 365)]),
  r('rabri-falooda', 'Rabri falooda', ['rabdi falooda', 'rabri faluda'],
    [milk(100), evapMilk(100), sugar(20), roseSyrup(20), vermicelli(15), chia(5), water(40)], 300, [pc('1 glass', 300)]),
  r('sharbat-e-mohabbat', 'Sharbat-e-mohabbat (watermelon rose milk)', ['mohabbat ka sharbat', 'pyaar mohabbat sharbat', 'watermelon rose milk'],
    [milk(150), watermelon(100), roseSyrup(30), sugar(10), water(50)], 340, [GLASS]),
  r('kulukki-sarbath', 'Kulukki sarbath', ['kulukki sharbat', 'shaken lime soda kerala', 'kulukki'],
    [lime(20), sugar(30), water(200), chia(3)], 253, [GLASS]),
  r('sabja-sharbat', 'Sabja lemon sharbat', ['sabja drink', 'tukmaria sharbat', 'basil seed lemonade', 'falooda seeds drink'],
    [chia(5), sugar(25), water(200), lemon(10)], 240, [GLASS]),
  r('gur-sharbat', 'Gur ka sharbat (jaggery lemon)', ['gud ka sharbat', 'jaggery sharbat', 'gur nimbu pani'],
    [jaggery(40), water(250), lemon(10)], 300, [GLASS]),
  r('bael-sharbat', 'Bael sharbat', ['bel sharbat', 'bel pana', 'wood apple juice', 'bael ka sharbat'],
    [bael(100), sugar(30), water(200)], 330, [GLASS]),
  r('sitaphal-shake', 'Sitaphal milkshake', ['custard apple milkshake', 'sitaphal shake', 'seethaphal milkshake'],
    [sitaphal(150), milk(200), sugar(15)], 365, [GLASS]),
  r('butterscotch-shake', 'Butterscotch milkshake', ['butterscotch shake', 'butter scotch milkshake'],
    [milk(200), iceCream(80), caramel(30)], 310, [GLASS]),
  r('nutella-shake', 'Nutella milkshake', ['nutella shake', 'hazelnut chocolate shake'],
    [milk(200), nutella(30), iceCream(60)], 290, [GLASS]),
]

// ============================== MORE MITHAI, KHEER, HALWA, LADOO
const MORE_MITHAI: IndianRecipe[] = [
  r('pista-barfi', 'Pista barfi', ['pista burfi', 'pistachio barfi', 'pista katli'],
    [pista(200), sugar(120), milkPowder(30), ghee(10), water(60)], 380, [pc('1 piece', 20)]),
  r('energy-ladoo', 'Energy ladoo (oats, peanut, dates)', ['energy balls', 'oats dates ladoo', 'no sugar energy ladoo'],
    [oats(100), peanuts(100), dates(150), almond(50)], 395, [pc('1 ladoo', 30)]),
  r('bajra-ladoo', 'Bajra ladoo (winter)', ['bajre ke laddu', 'bajra laddu', 'pearl millet ladoo'],
    [bajra(200), ghee(100), jaggery(150), sesame(20)], 460, [pc('1 ladoo', 35)]),
  r('moong-dal-ladoo', 'Moong dal ladoo', ['moong ladoo', 'moong dal laddu', 'pesara laddu'],
    [moongDal(200), ghee(100), powderedSugar(150)], 440, [pc('1 ladoo', 30)]),
  r('sattu-ladoo', 'Sattu ladoo', ['sattu laddu', 'sattu ke laddu', 'chana sattu ladoo'],
    [n('sattu')(200), ghee(80), jaggery(150)], 425, [pc('1 ladoo', 30)]),
  r('gur-chana', 'Gur chana (jaggery coated roasted chana)', ['gud chana', 'gur chane', 'jaggery chana'],
    [chanaDal(200), jaggery(100)], 290, [pc('1 small bowl', 30)]),
  r('mango-kheer', 'Mango kheer', ['aam ki kheer', 'mango payasam', 'aam kheer'],
    [rice(60), milk(800), sugar(80), mango(200)], 850, [KATORI]),
  r('rava-kheer', 'Rava kheer (sooji kheer)', ['sooji kheer', 'suji ki kheer', 'rava payasam', 'semolina kheer'],
    [sooji(50), milk(800), sugar(90), almond(10), cashew(5)], 800, [KATORI]),
  r('besan-halwa', 'Besan halwa', ['besan ka halwa', 'besan sheera', 'gram flour halwa'],
    [besan(100), ghee(80), sugar(100), milk(300), water(100)], 500, [SMALL_BOWL]),
  r('ragi-halwa', 'Ragi halwa', ['nachni halwa', 'ragi sheera', 'finger millet halwa'],
    [ragi(100), ghee(80), jaggery(150), water(400)], 500, [SMALL_BOWL]),
  r('khajur-halwa', 'Khajur halwa (dates halwa)', ['dates halwa', 'khajoor ka halwa', 'date halwa'],
    [dates(300), ghee(50), milk(300), almond(15), cashew(15)], 520, [SMALL_BOWL]),
  r('gur-paratha', 'Gur paratha (sweet jaggery paratha)', ['meetha paratha', 'gud ka paratha', 'sweet paratha', 'cheeni paratha'],
    [atta(200), jaggery(80), ghee(40), water(100)], 380, [pc('1 paratha', 80)]),
  r('shenga-holige', 'Shenga holige (peanut obbattu)', ['peanut holige', 'shenga obbattu', 'groundnut poli'],
    [maida(150), oil(30), peanuts(150), jaggery(150), sesame(20), water(80)], 510, [pc('1 holige', 60)]),
  r('manoharam', 'Manoharam (jaggery murukku)', ['manoharam sweet', 'sweet murukku', 'vella murukku'],
    [riceFlour(150), uradDal(30), oil(50), jaggery(150), water(50)], 380, [pc('1 small bowl', 40)]),
  r('narikol-pitha', 'Narikol pitha (coconut stuffed, fried)', ['narikolor pitha', 'coconut pitha', 'narkel pitha'],
    [stickyRice(150), coconut(120), sugar(50), oil(40), water(60)], 380, [pc('1 pitha', 35)]),
  r('vella-puttu', 'Sweet puttu (vella puttu)', ['vella puttu', 'sweet puttu', 'navaratri puttu', 'arisi vella puttu'],
    [riceFlour(200), water(100), jaggery(150), coconut(60), ghee(20)], 500, [SMALL_BOWL]),
  r('doodh-pheni', 'Doodh pheni (pheni in milk)', ['pheni kheer', 'feni with milk', 'karwa chauth pheni'],
    [maida(30), ghee(15), sugar(30), milk(300)], 360, [pc('1 bowl', 200)]),
]

// ============================== MORE CAKES, BISCUITS, CHOCOLATE, CAFE
const MORE_BAKERY: IndianRecipe[] = [
  r('white-forest-cake', 'White forest cake / pastry', ['white forest pastry', 'white forest'],
    [...sponge(1), whip(250), u(167571)(40), cherry(40), ...syrup(30, 50)], 750, [PASTRY]),
  r('mango-pastry', 'Mango cake / pastry', ['mango pastry', 'mango cream cake'],
    [...sponge(1), whip(250), mango(150), water(30)], 760, [PASTRY]),
  r('fresh-fruit-cake', 'Fresh fruit cream cake / pastry', ['fresh fruit pastry', 'fruit cream cake', 'mixed fruit pastry'],
    [...sponge(1), whip(250), fruitCocktail(150), water(30)], 760, [PASTRY]),
  r('butter-cake', 'Butter cake / pound cake', ['pound cake', 'butter sponge', 'dry cake slice'],
    [maida(200), butter(200), sugar(200), egg(200)], 720, [SLICE]),
  r('eggless-chocolate-cake', 'Eggless chocolate cake', ['eggless choco cake', 'eggless chocolate sponge'],
    [maida(200), cocoa(40), sugar(180), oil(80), curd(150), milk(150)], 720, [SLICE]),
  r('atta-jaggery-cake', 'Atta jaggery cake (whole wheat)', ['whole wheat cake', 'atta cake', 'jaggery cake', 'healthy wheat cake'],
    [atta(200), jaggery(150), oil(80), curd(150), milk(100), walnut(30)], 640, [SLICE]),
  r('marie-biscuit', 'Marie biscuit', ['marie', 'marie gold', 'tea biscuit marie'],
    [marie(100)], 100, [pc('4 biscuits', 25)]),
  r('glucose-biscuit', 'Glucose biscuit', ['glucose biscuits', 'parle g type biscuit', 'tea biscuit'],
    [u(168014)(100)], 100, [pc('4 biscuits', 25)]),
  r('cream-biscuit', 'Cream biscuit (vanilla sandwich)', ['cream biscuits', 'vanilla cream biscuit'],
    [u(172737)(100)], 100, [pc('2 biscuits', 25)]),
  r('chocolate-cream-biscuit', 'Chocolate cream biscuit', ['chocolate sandwich biscuit', 'oreo type biscuit', 'choco cream biscuit', 'bourbon type biscuit'],
    [oreo(100)], 100, [pc('2 biscuits', 22)]),
  r('cream-wafer', 'Cream wafer biscuit', ['wafers biscuit', 'cream wafers', 'wafer sticks'],
    [u(172736)(100)], 100, [pc('4 wafers', 30)]),
  r('chocolate-wafer-bar', 'Chocolate coated wafer bar', ['chocolate wafer', 'wafer chocolate bar', 'choco wafer'],
    [u(174088)(100)], 100, [pc('1 bar', 37)]),
  r('milk-chocolate', 'Milk chocolate bar', ['milk chocolate', 'chocolate bar', 'dairy milk type chocolate'],
    [milkChoc(100)], 100, [pc('1 small bar', 25)]),
  r('white-chocolate', 'White chocolate', ['white chocolate bar', 'white choco'],
    [u(167571)(100)], 100, [pc('1 small bar', 25)]),
  r('panna-cotta', 'Panna cotta', ['pannacotta', 'vanilla panna cotta'],
    [cream(300), milk(200), sugar(70), gelatin(8)], 570, [pc('1 cup', 100)]),
  r('malai-toast', 'Malai toast (bread with cream and sugar)', ['malai bread', 'malai pav', 'cream sugar toast'],
    [bread(60), freshCream(30), sugar(10)], 100, [pc('2 slices', 100)]),
  r('strawberry-kulfi', 'Strawberry kulfi', ['strawberry malai kulfi'],
    [evapMilk(400), strawberry(150), sugar(60)], 600, [pc('1 kulfi', 60)]),
  r('cookies-cream-ice-cream', 'Cookies and cream ice cream', ['oreo ice cream', 'cookies n cream'],
    [iceCream(900), oreo(100)], 1000, [SCOOP]),
  r('guava-ice-cream', 'Guava ice cream (chilli guava)', ['peru ice cream', 'chilli guava ice cream', 'amrood ice cream'],
    [milk(300), cream(200), sugar(100), guava(200)], 790, [SCOOP]),
  r('gulkand-ice-cream', 'Gulkand ice cream', ['gulkand flavour ice cream', 'rose petal ice cream'],
    [iceCream(900), gulkand(80)], 980, [SCOOP]),
  r('frozen-yogurt', 'Frozen yogurt (vanilla)', ['froyo', 'fro yo', 'frozen yoghurt'],
    [u(168815)(100)], 100, [pc('1 cup', 100)]),
  r('jackfruit-ice-cream', 'Jackfruit ice cream', ['chakka ice cream', 'kathal ice cream', 'jackfruit ice cream naturals style'],
    [milk(300), cream(200), sugar(80), jackfruit(200)], 770, [SCOOP]),
  r('nolen-gur-ice-cream', 'Nolen gur ice cream', ['jaggery ice cream', 'gur ice cream', 'notun gur ice cream'],
    [milk(300), cream(200), jaggery(120)], 610, [SCOOP]),
  r('chocolate-chip-ice-cream', 'Chocolate chip ice cream', ['choco chip ice cream', 'vanilla choco chip ice cream'],
    [iceCream(900), darkChoc(80)], 980, [SCOOP]),
  r('mango-cheesecake', 'Mango cheesecake (no bake)', ['mango cheese cake', 'alphonso cheesecake'],
    [marie(120), butter(60), creamCheese(300), cream(150), sugar(80), mango(200), gelatin(8)], 900, [pc('1 slice', 100)]),
  r('orange-cake', 'Orange cake', ['orange tea cake', 'orange sponge cake'],
    [maida(200), sugar(180), butter(150), egg(150), orange(150)], 740, [SLICE]),
  r('chocolate-cupcake', 'Chocolate cupcake (with frosting)', ['choco cupcake', 'chocolate cup cake'],
    [maida(130), cocoa(25), sugar(130), butter(100), egg(100), milk(60), u(168795)(150)], 630, [pc('1 cupcake', 60)]),
  r('milk-biscuit', 'Milk biscuit', ['milk biscuits', 'milk bikis type', 'doodh biscuit'],
    [u(174980)(100)], 100, [pc('4 biscuits', 25)]),
  r('atta-nankhatai', 'Atta nankhatai (whole wheat)', ['wheat nankhatai', 'whole wheat nankhatai', 'atta biscuit ghee'],
    [atta(150), besan(20), ghee(100), powderedSugar(90)], 340, [pc('1 nankhatai', 15)]),
  r('ragi-cookies', 'Ragi cookies', ['ragi biscuit', 'nachni cookies', 'finger millet cookies'],
    [ragi(100), atta(50), butter(80), jaggery(70)], 280, [pc('2 cookies', 20)]),
  r('rabri-malpua', 'Rabri malpua', ['malpua with rabri', 'malpua rabdi', 'rabdi malpua'],
    [maida(40), milk(50), sugar(10), ghee(15), ...syrup(25, 10), evapMilk(100), sugar(10)], 210, [pc('2 malpua with rabri', 150)]),
  r('mango-sheera', 'Mango sheera', ['aamras sheera', 'mango rava kesari', 'mango halwa sooji'],
    [sooji(100), ghee(50), sugar(80), mango(150), milk(200)], 470, [SMALL_BOWL]),
  r('mango-ice-candy', 'Mango ice candy', ['mango dolly', 'aam ki candy', 'mango ice lolly'],
    [mango(150), sugar(30), water(100)], 280, [pc('1 candy', 60)]),
]

export const RECIPES_SWEETS_BAKERY: IndianRecipe[] = [
  ...BENGAL,
  ...ODISHA,
  ...CENTRAL_EAST,
  ...NORTH,
  ...RAJASTHAN,
  ...GUJARAT,
  ...WEST,
  ...KARNATAKA,
  ...ANDHRA,
  ...TAMIL,
  ...KERALA,
  ...NORTHEAST,
  ...COMMUNITY,
  ...BAKERY,
  ...CAFE,
  ...FROZEN,
  ...DRINKS,
  ...MORE_MITHAI,
  ...MORE_BAKERY,
]
