// Regional vegetarian home food from thinly covered regions: Kashmir, Ladakh,
// Himachal, Uttarakhand, Haryana, village Punjab, Rajasthan, Gujarat
// (Kathiyawadi, Surti, Kutchi), Maharashtra (Varhadi, Khandeshi, Kolhapuri,
// Konkan), Goa, Madhya Pradesh, Chhattisgarh, Jharkhand, Bihar (Mithila),
// Odisha, Bengal, Assam and the Northeast, Sikkim, plus Sindhi community food.
// Daily dals, sabzis, breads, rice and snacks; no sweets, no non-veg.
// Typical home-style batch amounts, written by us; see docs/indian-food-database.md.
// Cooked weights are first estimates (yieldVerified: false). Spices, salt and
// herbs under ~5 g are left out.

import type { RecipeIngredient } from '../../recipe'
import { CUP, GLASS, KATORI, PLATE, ing, piece, r, usdaIng, type IndianRecipe } from '../define'

// USDA SR Legacy fdc_ids used below (raw state unless noted).
const U = {
  maida: 168894, // Wheat flour, white, all-purpose
  millet: 172023, // Millet flour (bajra atta)
  jowar: 168943, // Sorghum flour, whole-grain
  makki: 169697, // Cornmeal, whole-grain, yellow (makki atta)
  riceFlour: 169714, // Rice flour, white, unenriched
  glutinousRice: 168883, // Rice, white, glutinous, uncooked (bora saul, sticky rice)
  brownRice: 169703, // Rice, brown, long-grain, raw (stands in for hill red rice)
  barley: 170284, // Barley, pearled, raw (jau)
  barleyFlour: 169739, // Barley flour or meal (tsampa, sattu of barley)
  kuttu: 170687, // Buckwheat flour, whole-groat (kuttu, phapar)
  amaranth: 170682, // Amaranth grain, uncooked (rajgira, chaulai dana)
  bulgur: 170688, // Bulgur, dry (dalia)
  pasta: 168927, // Pasta, dry, unenriched (skyu, chutagi, thenthuk dough stand-in)
  sabudana: 169717, // Tapioca, pearl, dry
  gluten: 168147, // Vital wheat gluten (chakki)
  bread: 174924, // Bread, white, commercially prepared (pav, double roti)
  urad: 174259, // Mungo beans, mature seeds, raw (whole urad)
  moongWhole: 174256, // Mung beans, mature seeds, raw (sabut moong)
  lentilWhole: 172420, // Lentils, raw (whole masoor)
  rajma: 175193, // Beans, kidney, all types, mature seeds, raw
  blackBeans: 173734, // Beans, black, mature seeds, raw (Himalayan black rajma)
  soybean: 174270, // Soybeans, mature seeds, raw (bhatt, bhatmas, fermented soybean)
  cowpea: 173758, // Cowpeas, common, mature seeds, raw (lobia, rongi, chawli)
  moth: 172425, // Mothbeans, mature seeds, raw (matki)
  dryPeas: 172428, // Peas, green, split, mature seeds, raw (dried vatana)
  adzuki: 173727, // Beans, adzuki, mature seeds, raw (red beans in kwati)
  peas: 170419, // Peas, green, raw (matar)
  hemp: 170148, // Seeds, hemp seed, hulled (bhang dana)
  lilva: 170025, // Pigeonpeas, immature seeds, raw (lilva tuver)
  val: 175210, // Hyacinth beans, mature seeds, raw (val, dalimbi)
  papdi: 169234, // Hyacinth-beans, immature seeds, raw (papdi, sem)
  broadBeans: 170377, // Broadbeans, immature seeds, raw (bakla)
  beans: 169961, // Beans, snap, green, raw
  yardlong: 169222, // Yardlong bean, raw (barbati, long beans)
  sprouts: 169957, // Mung beans, sprouted, raw
  corn: 169998, // Corn, sweet, yellow, raw (bhutta)
  cabbage: 169975, // Cabbage, raw
  bottleGourd: 169232, // Gourd, white-flowered (calabash), raw (lauki, lau)
  ridgeGourd: 168414, // Gourd, dishcloth (towelgourd), raw (turai, jhinge)
  bitterGourd: 168393, // Balsam-pear (bitter gourd), pods, raw
  ashGourd: 170069, // Waxgourd, raw (petha, kumhda)
  chayote: 170402, // Chayote, fruit, raw (iskus, squash)
  brinjal: 169228, // Eggplant, raw
  pumpkin: 168448, // Pumpkin, raw
  zucchini: 170487, // Squash, summer, all varieties, raw (Ladakhi summer squash)
  capsicum: 170427, // Peppers, sweet, green, raw
  greenChilli: 170497, // Peppers, hot chili, green, raw
  radish: 168451, // Radishes, oriental, raw (mooli)
  driedRadish: 168453, // Radishes, oriental, dried (sinki stand-in)
  turnip: 170465, // Turnips, raw (gogji, shalgam)
  kohlrabi: 168424, // Kohlrabi, raw (monji)
  beet: 169145, // Beets, raw
  sweetPotato: 168482, // Sweet potato, raw
  yam: 170071, // Yam, raw (suran, ol, jimikand, garadu)
  taro: 169308, // Taro, raw (arbi, gaderi, pindalu, kochu)
  taroLeaves: 168487, // Taro leaves, raw (arbi patta, kosu xaak)
  cassava: 169985, // Cassava, raw (tapioca root)
  rawBanana: 168215, // Plantains, green, raw
  lotusRoot: 169250, // Lotus root, raw (nadru, bhee, kamal kakdi)
  bamboo: 169210, // Bamboo shoots, raw
  mushroom: 169251, // Mushrooms, white, raw
  morel: 168423, // Mushrooms, morel, raw (gucchi)
  oyster: 168580, // Mushrooms, oyster, raw (dhingri, rugra stand-in)
  spinach: 168462, // Spinach, raw
  mustardGreens: 169256, // Mustard greens, raw (sarson, lai)
  collards: 170406, // Collards, raw (Kashmiri haak)
  bathua: 169244, // Lambsquarters, raw
  amaranthLeaves: 168385, // Amaranth leaves, raw (chaulai, lal shak, khada saag)
  fiddlehead: 169405, // Fiddlehead ferns, raw (lingri, dhekia, ningro)
  nettle: 169819, // Stinging nettles, blanched (kandali, bichhu buti, sisnu)
  pumpkinLeaves: 169272, // Pumpkin leaves, raw (kaddu ke patte, lau shak stand-in)
  waterSpinach: 169301, // Water convolvulus, raw (kolmi shak)
  malabar: 170474, // Vinespinach (basella), raw (poi saag)
  jute: 168419, // Jute, potherb, raw (nalita, chech bhaji)
  drumstickLeaves: 168416, // Drumstick leaves, raw (sajana saga, munga bhaji)
  drumstick: 170483, // Drumstick pods, raw
  sesbania: 168459, // Sesbania flower, raw (agasti phool)
  pumpkinFlowers: 169270, // Pumpkin flowers, raw
  springOnion: 170005, // Onions, spring or scallions, raw (hari pyaz)
  garlic: 169230, // Garlic, raw
  ginger: 169231, // Ginger root, raw
  coriander: 169997, // Coriander leaves, raw
  dill: 172233, // Dill weed, fresh (shepu, soya saag)
  cucumber: 168409, // Cucumber, with peel, raw
  jackfruit: 174687, // Jackfruit, raw (ripe; used for paka kathal)
  tamarind: 167763, // Tamarinds, raw
  lemonJuice: 167747, // Lemon juice, raw
  amla: 173030, // Gooseberries, raw (amla stand-in)
  coconut: 170169, // Nuts, coconut meat, raw (fresh grated)
  dryCoconut: 170170, // Nuts, coconut meat, dried, not sweetened (kopra)
  coconutMilk: 170172, // Nuts, coconut milk, raw
  cashew: 170162, // Nuts, cashew nuts, raw
  almond: 170567, // Nuts, almonds
  walnut: 170187, // Nuts, walnuts, english (doon, akhrot)
  raisins: 168165, // Raisins, dark, seedless
  sesame: 170150, // Seeds, sesame seeds, whole, dried (til)
  flaxseed: 169414, // Seeds, flaxseed (alsi, tisi, javas)
  poppy: 171330, // Spices, poppy seed (posto, khus khus)
  mustardSeed: 170929, // Spices, mustard seed, ground (rai, sarso paste)
  fenugreekSeed: 171324, // Spices, fenugreek seed (methi dana)
  butter: 173410, // Butter, salted (makhan)
  cream: 170858, // Cream, fluid, light whipping (malai)
  buttermilk: 170874, // Milk, buttermilk, cultured, lowfat (chaas)
  tofu: 172475, // Tofu, raw, firm
  mustardOil: 172337, // Oil, mustard
  sesameOil: 171016, // Oil, sesame
  coconutOil: 171412, // Oil, coconut
  lemons: 167746, // Lemons, raw, without peel (pahadi nimbu)
  peanutsRaw: 172430, // Peanuts, all types, raw
  murmura: 173912, // Cereals ready-to-eat, rice, puffed (murmura, muri)
  roastedSoy: 172441, // Soybeans, mature seeds, dry roasted (bhatmas)
  wheatBran: 169722, // Wheat bran, crude (poie)
}
const u = (k: keyof typeof U, grams: number): RecipeIngredient => usdaIng(U[k], grams)

// Catalogue shorthands.
const water = (g: number) => ing('water', g)
const oil = (g: number) => ing('oil', g)
const ghee = (g: number) => ing('ghee', g)
const onion = (g: number) => ing('onion', g)
const tomato = (g: number) => ing('tomato', g)
const potato = (g: number) => ing('potato', g)
const curd = (g: number) => ing('curd', g)
const milk = (g: number) => ing('milk', g)
const atta = (g: number) => ing('atta', g)
const besan = (g: number) => ing('besan', g)
const rice = (g: number) => ing('rice', g)
const sugar = (g: number) => ing('sugar', g)
const mOil = (g: number) => u('mustardOil', g)

const BOWL = piece('1 bowl (300 g)', 300)
const TBSP2 = piece('2 tbsp (30 g)', 30)
const ROTI = (g: number) => piece(`1 roti (${g} g)`, g)

export const RECIPES_REGIONAL2: IndianRecipe[] = [
  // ───────────────────────── Kashmir ─────────────────────────
  r('nadru-monje', 'Nadru monje (lotus stem fritters)', ['nadur monje', 'nadru monji', 'kamal kakdi pakora', 'lotus stem fritters', 'nadru pakora'],
    [u('lotusRoot', 200), u('riceFlour', 60), besan(20), water(70), oil(40)], 330,
    [piece('1 plate (8 pieces)', 120), piece('1 piece', 15)]),
  r('nadir-palak', 'Nadir palak (lotus stem with spinach)', ['nadru palak', 'nadur palak', 'lotus stem spinach', 'palak nadru'],
    [u('lotusRoot', 200), ing('spinach', 400), mOil(30), water(150)], 620, [KATORI]),
  r('gogji-rajma', 'Gogji rajma (Kashmiri rajma with turnip)', ['gogji razma', 'razma gogji', 'rajma shalgam', 'kashmiri rajma turnip'],
    [ing('rajma', 150), u('turnip', 250), mOil(25), water(800)], 950, [KATORI]),
  r('gogji-tamatar', 'Gogji tamatar (Kashmiri turnip in tomato)', ['gogji', 'kashmiri shalgam', 'gogji ruwangun', 'turnip tomato curry'],
    [u('turnip', 500), tomato(150), mOil(25), water(150)], 680, [KATORI]),
  r('haak-wadi', 'Haak with wadi (Kashmiri collard greens with spice cake)', ['haakh wadi', 'haak vadi', 'kashmiri saag wadi'],
    [u('collards', 500), mOil(30), ing('urad-dal', 20), water(300)], 720, [KATORI]),
  r('kanguch-yakhni', 'Kanguch yakhni (morels in yogurt gravy)', ['gucchi yakhni', 'kanguch', 'morel yakhni', 'guchhi curry'],
    [u('morel', 250), curd(300), ghee(25), besan(10), water(150)], 620, [KATORI]),
  r('gucchi-pulao', 'Gucchi pulao (morel pulao)', ['morel pulao', 'guchhi pulao', 'kanguch pulao'],
    [rice(250), u('morel', 150), ghee(30), onion(60), water(500)], 850, [PLATE, KATORI]),
  r('tahar', 'Tahar (Kashmiri yellow rice with mustard oil)', ['tahar', 'tehar', 'kashmiri yellow rice', 'tahri kashmiri'],
    [rice(250), mOil(30), water(500)], 700, [PLATE, KATORI]),
  r('ruwangan-chetin', 'Ruwangan chetin (Kashmiri tomato chutney)', ['ruwangan chatin', 'kashmiri tomato chutney', 'tamatar chetin'],
    [tomato(400), mOil(20), sugar(10)], 300, [TBSP2]),
  r('doon-chetin', 'Doon chetin (walnut and curd chutney)', ['dodh chetin', 'walnut chutney', 'akhrot chutney', 'doon chatin'],
    [u('walnut', 80), curd(200), u('greenChilli', 10), onion(30)], 310, [TBSP2]),
  r('mujh-chetin', 'Mujh chetin (radish walnut chutney)', ['muj chetin', 'mooli akhrot chutney', 'radish chutney kashmiri'],
    [u('radish', 250), u('walnut', 30), curd(150)], 420, [TBSP2]),
  r('al-chaman', 'Al chaman (Kashmiri paneer with bottle gourd)', ['ale chaman', 'lauki paneer kashmiri', 'al chaman'],
    [ing('paneer', 200), u('bottleGourd', 300), mOil(25), curd(80), water(150)], 680, [KATORI]),
  r('wangun-ruwangun', 'Ruwangun wangun (Kashmiri brinjal in tomato)', ['wangun ruwangun', 'kashmiri baingan tamatar', 'brinjal tomato kashmiri'],
    [u('brinjal', 400), tomato(200), mOil(40), water(100)], 600, [KATORI]),
  r('dum-nadru', 'Dum nadru (lotus stem in spiced gravy)', ['nadru dum', 'kashmiri dum nadru', 'lotus stem dum'],
    [u('lotusRoot', 400), curd(150), mOil(35), water(200)], 680, [KATORI]),
  r('kashmiri-moong-dal', 'Kashmiri moong dal with nadru', ['mong dal nadru', 'nadru moong dal', 'kashmiri dal'],
    [ing('moong-dal', 120), u('lotusRoot', 120), mOil(15), water(650)], 820, [KATORI]),
  r('kashmiri-razma-chawal', 'Kashmiri rajma chawal (bhaderwahi)', ['bhaderwahi rajma chawal', 'kashmiri rajma rice'],
    [ing('rajma', 80), mOil(12), water(450), rice(100), water(220)], 800, [PLATE]),
  r('noon-chai', 'Noon chai (Kashmiri pink salt tea)', ['nun chai', 'sheer chai', 'pink chai', 'kashmiri pink tea', 'namkeen chai'],
    [milk(300), water(200), u('butter', 5)], 420, [CUP, GLASS]),
  r('kashmiri-lavasa', 'Lavasa (Kashmiri thin flatbread)', ['lavas', 'lavasa', 'kashmiri lavas'],
    [u('maida', 100), atta(50), water(85), ghee(5)], 210, [piece('1 lavasa', 70)]),
  r('tschot', 'Tschot (Kashmiri round bread)', ['tchot', 'czot', 'kashmiri tsot', 'telwor', 'tsochvoru'],
    [u('maida', 150), water(85), ghee(10), u('sesame', 5)], 225, [piece('1 tschot', 75)]),

  // ───────────────────────── Ladakh ─────────────────────────
  r('skyu', 'Skyu (Ladakhi pasta and vegetable stew)', ['skyu', 'sku', 'ladakhi skyu', 'thumb pasta stew'],
    [atta(150), water(80), potato(150), ing('carrot', 60), u('turnip', 80), u('spinach', 60), milk(100), water(700)], 1250, [BOWL]),
  r('chutagi', 'Chutagi (bow-shaped pasta soup)', ['chhutagi', 'chu tagi', 'ladakhi bowtie pasta soup'],
    [atta(150), water(80), potato(100), u('cabbage', 80), onion(40), tomato(60), oil(10), water(800)], 1250, [BOWL]),
  r('veg-thenthuk', 'Veg thenthuk (hand-pulled noodle soup)', ['thenthuk', 'thentuk', 'then thuk', 'tibetan noodle soup'],
    [atta(150), water(80), u('spinach', 80), u('cabbage', 60), ing('carrot', 40), tomato(60), oil(10), water(850)], 1250, [BOWL]),
  r('paba', 'Paba (barley and pea flour dough)', ['paba', 'ladakhi paba', 'barley pea dough'],
    [u('barleyFlour', 150), u('dryPeas', 50), water(200), u('butter', 10)], 380, [piece('1 portion (120 g)', 120)]),
  r('tagi-khambir', 'Tagi khambir (Ladakhi bread)', ['khambir', 'ladakhi bread', 'tagi khambir', 'kambir'],
    [atta(200), water(130), oil(5)], 310, [piece('1 khambir', 100)]),
  r('tingmo', 'Tingmo (steamed Tibetan bread)', ['tingmo', 'ting momo', 'tibetan steamed bread'],
    [u('maida', 200), water(110), oil(8)], 300, [piece('1 tingmo', 50)]),
  r('butter-tea', 'Butter tea (gur gur chai)', ['gur gur chai', 'po cha', 'tibetan butter tea', 'ladakhi butter tea', 'cha suma'],
    [water(300), milk(100), u('butter', 15)], 400, [CUP]),
  r('tsampa', 'Tsampa (roasted barley flour with butter tea)', ['tsampa', 'tsamba', 'ngamphe', 'kholak', 'roasted barley flour porridge'],
    [u('barleyFlour', 60), water(70), milk(30), u('butter', 8)], 160, [piece('1 serving (160 g)', 160)]),
  r('mokthuk', 'Veg mokthuk (momos in soup)', ['mothuk', 'mok thuk', 'momo soup', 'momo thukpa'],
    [u('maida', 80), water(40), u('cabbage', 100), onion(30), oil(8), tomato(60), water(500)], 760, [BOWL]),
  r('ladakhi-veg-sabzi', 'Ladakhi summer squash and potato sabzi', ['ladakhi sabzi', 'squash aloo sabzi', 'ladakh veg'],
    [u('zucchini', 300), potato(150), tomato(80), oil(20), water(60)], 540, [KATORI]),

  // ───────────────────────── Himachal ─────────────────────────
  r('babru', 'Babru (Himachali urad-stuffed kachori)', ['babru', 'himachali kachori', 'urad dal puri himachal'],
    [atta(200), water(110), ing('urad-dal', 60), water(40), oil(50)], 420, [piece('1 babru', 60)]),
  r('patande-namkeen', 'Namkeen patande (Himachali savory wheat crepes)', ['namkeen patande', 'savory patande', 'himachali savory pancake'],
    [atta(150), milk(150), water(150), ghee(15)], 420, [piece('1 patanda', 60)]),
  r('teliya-maah', 'Teliya maah (Chamba black urad dal)', ['teliya mah', 'tellia maah', 'chamba urad dal', 'teliya urad'],
    [u('urad', 150), mOil(25), curd(50), water(700)], 820, [KATORI]),
  r('mahni', 'Mahni (Kangra tamarind gravy with chickpeas)', ['mahni', 'maani kangra', 'kangri mahni', 'khatta chana kangra'],
    [ing('chana', 80), u('tamarind', 30), ing('jaggery', 15), oil(15), water(600)], 650, [KATORI]),
  r('rongi-madra', 'Rongi madra (lobia in curd)', ['lobia madra', 'rongi ka madra', 'himachali lobia'],
    [u('cowpea', 150), curd(250), ghee(20), water(450)], 820, [KATORI]),
  r('himachali-khatta', 'Kaddu ka khatta (Himachali pumpkin)', ['khatta kaddu himachal', 'pahadi kaddu', 'kangri khatta'],
    [u('pumpkin', 500), u('tamarind', 20), ing('jaggery', 15), mOil(20), water(100)], 560, [KATORI]),
  r('dham-moong-dal', 'Dham moong dal (whole green moong)', ['dham dal', 'himachali dham dal', 'sabut moong dham'],
    [u('moongWhole', 150), ghee(20), water(800)], 880, [KATORI]),
  r('himachali-kadhi', 'Himachali kadhi (dham style)', ['dham kadhi', 'pahadi kadhi', 'kangri kadhi', 'mandyali kadhi'],
    [curd(400), besan(40), ghee(15), water(500)], 900, [KATORI]),
  r('bhey-sabzi', 'Bhey (Himachali lotus stem with gram flour)', ['bhey', 'bhe himachali', 'kamal kakdi besan'],
    [u('lotusRoot', 350), besan(30), oil(25), onion(60)], 420, [KATORI]),
  r('aloo-palda', 'Aloo palda (potato in curd gravy)', ['palda', 'aloo palda', 'himachali palda'],
    [potato(300), curd(250), ghee(15), ing('rice', 10), water(200)], 720, [KATORI]),
  r('kullu-red-rice', 'Himachali red rice (lal chawal)', ['lal chawal', 'red rice', 'matta himachali', 'kullu rice'],
    [u('brownRice', 150), water(450)], 420, [PLATE, KATORI]),
  r('kodra-roti', 'Kodre ki roti (Himachali ragi roti with ghee)', ['kodra roti', 'kodre di roti', 'koda roti ghee'],
    [ing('ragi-flour', 35), water(28), ghee(5)], 62, [ROTI(62)]),

  // ───────────────────────── Uttarakhand (Garhwali, Kumaoni) ─────────────────────────
  r('jholi', 'Jholi (Kumaoni kadhi)', ['jhoi', 'jholi', 'kumaoni kadhi', 'garhwali jhoi'],
    [curd(400), besan(40), mOil(15), water(500)], 900, [KATORI]),
  r('kandali-saag', 'Kandali ka saag (nettle greens)', ['kandali saag', 'sisunak saag', 'bichhu ghas saag', 'nettle saag', 'sisuna'],
    [u('nettle', 400), ing('rice', 15), mOil(15), water(150)], 500, [KATORI]),
  r('dubuk', 'Dubuk (Kumaoni ground pulse curry)', ['dubke', 'dubuk', 'bhatt ke dubke', 'kumaoni dubuk', 'pahadi dubuk'],
    [u('soybean', 100), ing('rice', 20), mOil(15), water(650)], 700, [KATORI]),
  r('rus', 'Ras / rus (Kumaoni mixed pulse broth)', ['ras kumaoni', 'rus', 'pahadi ras', 'kumaoni ras'],
    [u('soybean', 30), ing('horse-gram', 30), u('urad', 30), ing('rice', 10), ghee(10), water(800)], 750, [KATORI]),
  r('jaula', 'Jaula (Garhwali rice and pulse porridge)', ['jaula', 'jholi bhaat', 'pahadi khichdi', 'bhatt ka jaula'],
    [rice(150), u('soybean', 40), ghee(10), water(800)], 900, [KATORI, PLATE]),
  r('bhang-ki-chutney', 'Bhang ki chutney (hemp seed chutney)', ['bhangjeera chutney', 'bhang chutney', 'hemp seed chutney', 'pahadi chutney'],
    [u('hemp', 80), u('lemonJuice', 20), u('greenChilli', 10), water(40)], 140, [TBSP2]),
  r('gaderi-sabzi', 'Gaderi ki sabzi (Kumaoni taro curry)', ['gaderi', 'pindalu ki sabzi', 'pahadi arbi', 'kumaoni arbi'],
    [u('taro', 400), curd(100), mOil(20), water(250)], 680, [KATORI]),
  r('gahat-paratha', 'Gahat ke paranthe (horse gram stuffed)', ['gahat paratha', 'kulath paratha', 'gahat ki roti', 'bharwa gahat roti'],
    [atta(150), water(80), ing('horse-gram', 60), water(60), ghee(20)], 330, [piece('1 paratha', 80)]),
  r('swale', 'Swale (Garhwali stuffed puri)', ['swali', 'swale', 'garhwali puri'],
    [atta(200), water(100), ing('urad-dal', 50), water(30), oil(45)], 380, [piece('1 swala', 45)]),
  r('lai-ki-sabzi', 'Lai ki sabzi (pahadi mustard greens)', ['lai saag', 'lai ka saag', 'rai ka saag', 'pahadi sarson'],
    [u('mustardGreens', 500), potato(100), mOil(20)], 450, [KATORI]),
  r('jhangora-khichdi', 'Jhangora khichdi (barnyard millet with moong)', ['jhangore ki khichdi', 'sanwa khichdi pahadi'],
    [ing('north-samak-rice', 120), ing('moong-dal', 40), ghee(10), water(550)], 650, [KATORI]),
  r('mandua-jhangora-roti', 'Mandua roti with ghee and bhang chutney', ['koda roti chutney', 'mandua roti plate'],
    [ing('ragi-flour', 60), atta(20), water(50), ghee(10), u('hemp', 15)], 150, [piece('1 plate (2 roti)', 150)]),
  r('pahadi-palak-kapa', 'Palak ka kapa (Kumaoni spinach in rice paste)', ['kapa', 'kappa kumaoni', 'palak kapa', 'kapa saag'],
    [ing('spinach', 450), ing('rice', 25), ghee(12), water(200)], 560, [KATORI]),

  // ───────────────────────── Haryana and village Punjab ─────────────────────────
  r('bajra-raabdi', 'Bajre ki raabdi (fermented bajra and chaas drink)', ['raabdi', 'bajre ki rabdi haryanvi', 'bajra raab', 'raab', 'rajasthani raab', 'khatti raabdi'],
    [u('millet', 50), u('buttermilk', 400), water(250)], 640, [GLASS]),
  r('makki-raab', 'Makki ki raab (maize and chaas drink)', ['makki raab', 'makai ki raab', 'maize raab'],
    [u('makki', 50), u('buttermilk', 400), water(250)], 640, [GLASS]),
  r('choliya-sabzi', 'Hare chane (choliya) ki sabzi', ['choliya sabzi', 'hara chana sabzi', 'hare chane ki sabzi', 'cholia masala'],
    [ing('regional2-green-chana', 300), onion(80), tomato(100), oil(20), water(150)], 560, [KATORI]),
  r('choliya-pulao', 'Hare chane (choliya) ka pulao', ['hara chana pulao', 'choliya pulao', 'green chickpea pulao'],
    [rice(200), ing('regional2-green-chana', 150), ghee(20), onion(60), water(420)], 780, [PLATE, KATORI]),
  r('singri-dahi-sabzi', 'Singri ki sabzi (Haryanvi, in curd)', ['singri sabzi', 'singri ki sabzi', 'khejri phali dahi'],
    [ing('westeast-sangri', 80), water(300), curd(150), oil(25)], 450, [KATORI]),
  r('bathua-paratha', 'Bathua paratha', ['bathue ka paratha', 'bathua parantha', 'bathua roti'],
    [atta(200), u('bathua', 120), water(80), ghee(25)], 400, [piece('1 paratha', 80)]),
  r('moongi-masar-dal', 'Moongi masar di dal (Punjabi moong masoor)', ['moong masoor dal', 'moongi masri', 'moong masar dal punjabi'],
    [ing('moong-dal', 60), ing('masoor-dal', 60), ghee(15), onion(40), tomato(60), water(650)], 820, [KATORI]),
  r('wadiyan-wale-chawal', 'Wadiyan wale chawal (Amritsari wadi pulao)', ['wadi pulao', 'wadiyan chawal', 'vadiyan wale chawal', 'amritsari wadi rice'],
    [rice(200), ing('urad-dal', 40), ghee(25), onion(60), water(450)], 720, [PLATE, KATORI]),
  r('saag-makki-plate', 'Sarson saag with makki roti and makhan (plate)', ['saag makki', 'makki di roti sarson da saag', 'saag makki plate'],
    [u('mustardGreens', 200), ing('spinach', 50), u('makki', 15), ghee(8), u('makki', 90), water(70), ghee(6), u('butter', 15)], 420,
    [piece('1 plate (2 roti + 1 katori saag)', 420)]),
  r('kachi-lassi', 'Kachi lassi (milk and water cooler)', ['kacchi lassi', 'kachi lassi', 'doodh pani lassi'],
    [milk(150), water(150), sugar(10)], 310, [GLASS]),
  r('kali-gajar-kanji', 'Kali gajar ki kanji (fermented black carrot drink)', ['gajar kanji', 'black carrot kanji', 'kaali gajar kanji', 'holi kanji'],
    [ing('carrot', 250), u('beet', 50), u('mustardSeed', 15), water(1000)], 1150, [GLASS]),
  r('gobhi-shalgam-sabzi', 'Gobhi shalgam di sabzi (Punjabi winter veg)', ['gobhi shalgam', 'shalgam gobhi', 'gobi turnip sabzi'],
    [ing('cauliflower', 300), u('turnip', 200), oil(20), onion(60), tomato(60)], 560, [KATORI]),

  // ───────────────────────── Rajasthan (Marwari, Mewari) ─────────────────────────
  r('methi-dana-sabzi', 'Methi dana ki sabzi (Marwari fenugreek seed)', ['methi dana sabzi', 'methi dane ki launji', 'fenugreek seed curry', 'methi dana marwari'],
    [u('fenugreekSeed', 50), water(300), ing('jaggery', 30), u('raisins', 20), oil(15)], 300, [TBSP2, piece('1 small katori (60 g)', 60)]),
  r('mirchi-ke-tipore', 'Mirchi ke tipore (Marwari green chilli fry)', ['tipore', 'mirchi tipore', 'hari mirch ki sabzi', 'mirch ke tapore'],
    [u('greenChilli', 250), besan(30), oil(25)], 230, [TBSP2]),
  r('rajasthani-lahsun-chutney', 'Lahsun ki chutney (Rajasthani red garlic)', ['lehsun chutney', 'lasun ki chutney', 'garlic chutney rajasthani', 'marwari lahsun chutney'],
    [u('garlic', 100), oil(20), water(30)], 140, [piece('1 tbsp (15 g)', 15)]),
  r('kanji-vada', 'Kanji vada (moong vada in mustard water)', ['kanji wada', 'kanji bada', 'rajasthani kanji vada'],
    [ing('moong-dal', 100), water(60), oil(25), u('mustardSeed', 15), water(1000)], 1150, [GLASS, piece('1 glass with 3 vadas', 250)]),
  r('govind-gatte', 'Govind gatte (paneer-stuffed gatte curry)', ['govind gatte', 'paneer gatte', 'shahi gatte'],
    [besan(150), ing('paneer', 80), curd(180), oil(40), water(300)], 700, [KATORI]),
  r('haldi-ki-sabzi', 'Kachi haldi ki sabzi (Marwari fresh turmeric)', ['haldi ki sabzi', 'kachi haldi sabzi', 'fresh turmeric sabzi', 'haldi matar'],
    [ing('regional2-fresh-turmeric', 200), ghee(80), curd(200), u('peas', 100), onion(80)], 560, [piece('1 small katori (100 g)', 100), KATORI]),
  r('jodhpuri-kabuli', 'Jodhpuri kabuli (vegetable rice bake)', ['kabuli jodhpuri', 'jodhpuri kabuli pulao', 'marwari kabuli'],
    [rice(200), potato(100), u('peas', 80), ing('carrot', 60), ghee(35), milk(100), water(400)], 900, [PLATE, KATORI]),
  r('makki-ki-ghaat', 'Makki ki ghaat (Mewari maize porridge with chaas)', ['ghaat', 'makki ghaat', 'raab ghaat', 'mewari ghaat', 'makki ka daliya'],
    [u('makki', 100), u('buttermilk', 300), water(300)], 650, [KATORI]),
  r('jaisalmeri-chane', 'Jaisalmeri kala chana (in curd gravy)', ['jaisalmeri chana', 'jaisalmeri kale chane', 'kala chana dahi'],
    [ing('chana', 150), curd(150), oil(25), water(550)], 760, [KATORI]),
  r('chakki-ki-sabzi', 'Chakki ki sabzi (wheat gluten curry)', ['chakki ki shaak', 'chakki ki sabji', 'gehun ki chakki', 'wheat gluten curry'],
    [u('gluten', 120), water(150), curd(150), oil(35), onion(80), tomato(80), water(250)], 780, [KATORI]),
  r('pitod-ki-sabzi', 'Pitod ki sabzi (besan cake in curd gravy)', ['pitod', 'patod ki sabzi', 'besan chakki ki sabzi', 'besan ki chakki'],
    [besan(150), water(250), curd(150), oil(35), water(250)], 760, [KATORI]),
  r('rajasthani-bhindi-dahi', 'Dahi wali bhindi (Marwari)', ['dahi bhindi', 'bhindi dahi wali', 'marwari bhindi'],
    [ing('okra', 400), curd(150), oil(30), besan(10)], 480, [KATORI]),
  r('aloo-pyaz-marwari', 'Marwari aloo pyaz ki sabzi (with dry mango)', ['aloo pyaz ki sabzi', 'marwari aloo', 'rajasthani aloo pyaz'],
    [potato(400), onion(200), oil(30), water(100)], 600, [KATORI]),
  r('bajra-dhokli', 'Bajra dhokli (millet dumplings in curd)', ['bajre ki dhokli', 'bajra dhokla curry', 'marwari bajra dhokli'],
    [u('millet', 120), water(100), curd(150), oil(20), water(250)], 580, [KATORI]),

  // ───────────────────────── Madhya Pradesh ─────────────────────────
  r('indori-garadu', 'Garadu (Indori fried yam chaat)', ['garadu', 'garadu chaat', 'indori garadu', 'fried yam chaat'],
    [u('yam', 400), oil(40), u('lemonJuice', 10)], 330, [piece('1 plate (150 g)', 150)]),
  r('panya', 'Panya / dal panya (Nimari maize bread)', ['panya', 'dal panya', 'nimari panya', 'makke ke panye'],
    [u('makki', 150), water(110), ghee(10)], 240, [piece('1 panya', 80)]),
  r('khopra-patties', 'Khopra patties (Indori coconut-stuffed potato patties)', ['khopra pattice', 'indori patties', 'khopra patis'],
    [potato(300), u('dryCoconut', 40), ing('peanuts', 20), u('cashew', 10), oil(40)], 360, [piece('1 patty', 45)]),

  // ───────────────────────── Gujarat (Kathiyawadi, Surti, Kutchi) ─────────────────────────
  r('fafda', 'Fafda', ['fafda', 'fafada', 'fafda gathiya'],
    [besan(200), oil(25), water(70), oil(45)], 280, [piece('1 plate (100 g)', 100), piece('1 fafda', 15)]),
  r('bhavnagri-gathiya', 'Bhavnagri gathiya', ['bhavnagari gathiya', 'tikha gathiya', 'gathia', 'gathiya'],
    [besan(200), oil(20), water(70), oil(60)], 280, [piece('1 bowl (30 g)', 30)]),
  r('methi-na-gota', 'Methi na gota (Dakor gota)', ['gota', 'dakor na gota', 'methi gota', 'methi pakoda gujarati'],
    [besan(150), ing('methi-leaves', 60), curd(40), sugar(10), water(50), oil(50)], 310, [piece('1 plate (6 gota)', 120), piece('1 gota', 20)]),
  r('akha-adad', 'Akha adad (Kathiyawadi whole urad)', ['akha urad', 'kathiyawadi adad', 'adad ni dal', 'adad'],
    [u('urad', 150), oil(15), ghee(10), curd(50), water(700)], 860, [KATORI]),
  r('dhokli-nu-shaak', 'Dhokli nu shaak (besan dhokli in gravy)', ['dhokli shaak', 'besan dhokli', 'kathiyawadi dhokli'],
    [besan(150), water(200), oil(30), tomato(100), water(300)], 720, [KATORI]),
  r('sev-dungri', 'Sev dungri nu shaak (spring onion with sev)', ['sev dungri', 'lili dungri sev', 'spring onion sev sabzi', 'kathiyawadi sev dungri'],
    [u('springOnion', 300), besan(50), oil(20), oil(20), tomato(80)], 400, [KATORI]),
  r('lilva-kachori', 'Lilva kachori (green pigeon pea kachori)', ['lili tuver kachori', 'lilva kachori', 'tuver kachori'],
    [u('maida', 150), oil(20), water(60), u('lilva', 200), sugar(10), u('coconut', 20), oil(10), oil(50)], 470, [piece('1 kachori', 40)]),
  r('jamnagari-ghughra', 'Jamnagari ghughra (savory fried pastry)', ['ghughra jamnagar', 'veg ghughra', 'masala ghughra', 'aloo ghughra'],
    [u('maida', 150), oil(15), water(60), potato(200), u('peas', 50), oil(45)], 460, [piece('1 ghughra', 35)]),
  r('kutchi-kadhi', 'Kutchi kadhi (spicy, no sugar)', ['kutchi kadhi', 'kachchhi kadhi', 'khati kadhi'],
    [curd(400), besan(40), ghee(12), water(450)], 860, [KATORI]),
  r('kantola-sabzi', 'Kantola sabzi (spine gourd)', ['kankoda nu shaak', 'kantola', 'kakoda sabzi', 'kartoli bhaji', 'spine gourd sabzi'],
    [ing('regional2-kantola', 400), onion(60), oil(25)], 360, [KATORI]),

  // ───────────────────────── Maharashtra (Varhadi, Khandeshi, Kolhapuri, Konkan) ─────────────────────────
  r('patodi-rassa', 'Patodi rassa (Varhadi besan wadi in spicy gravy)', ['patodi', 'patodi rassa', 'besan vadi rassa', 'varhadi patodi'],
    [besan(150), water(300), oil(15), oil(30), onion(100), u('dryCoconut', 30), water(400)], 850, [KATORI]),
  r('gola-bhaat', 'Gola bhaat (Vidarbha rice with besan dumplings)', ['gola bhat', 'golyacha bhaat', 'vidarbha gola bhaat'],
    [rice(200), besan(100), oil(30), water(550)], 820, [PLATE, KATORI]),
  r('tarri-poha', 'Tarri poha (Nagpur poha with chana rassa)', ['tari poha', 'nagpuri tarri poha', 'poha with tarri'],
    [ing('poha', 150), oil(15), onion(60), ing('chana', 60), oil(25), water(400)], 640, [PLATE]),
  r('ambadichi-bhaji', 'Ambadichi bhaji (sorrel leaves with dal)', ['ambadi bhaji', 'ambadi chi bhaji', 'ambadi sabzi', 'pitwa bhaji'],
    [ing('south-gongura', 400), ing('toor-dal', 30), ing('peanuts', 20), oil(20), water(150)], 520, [KATORI]),
  r('bhakarwadi', 'Bhakarwadi', ['bhakar wadi', 'bakarwadi', 'chitale bhakarwadi'],
    [besan(100), u('maida', 100), oil(30), u('dryCoconut', 40), u('sesame', 15), sugar(10), water(70), oil(50)], 330, [piece('1 bowl (30 g)', 30)]),
  r('kalnyachi-bhakri', 'Kalnyachi bhakri (Khandeshi jowar-urad bhakri)', ['kalna bhakri', 'kalnyachi bhakri', 'khandeshi bhakri'],
    [u('jowar', 60), ing('urad-dal', 15), water(50)], 105, [piece('1 bhakri', 105)]),
  r('shengolya', 'Shengolya (horse gram spirals in gravy)', ['shengole', 'shengolya', 'kulthache shengole'],
    [ing('horse-gram', 80), u('jowar', 60), water(60), oil(25), onion(60), water(500)], 700, [KATORI]),
  r('kat-vada', 'Kat vada (Kolhapuri vada in spicy rassa)', ['kat wada', 'kolhapuri kat vada', 'vada rassa'],
    [potato(300), besan(100), water(80), oil(40), oil(25), u('dryCoconut', 30), onion(60), water(600)], 1100, [PLATE]),
  r('bhadang', 'Bhadang (Sangli spicy puffed rice)', ['bhadang', 'sangli bhadang', 'kolhapuri bhadang'],
    [u('murmura', 100), ing('peanuts', 25), oil(20), u('garlic', 10)], 150, [piece('1 bowl (30 g)', 30)]),
  r('kaju-usal', 'Olya kajuchi usal (Konkan tender cashew)', ['kaju usal', 'kajuchi usal', 'olya kajuchi bhaji', 'tender cashew curry'],
    [u('cashew', 150), u('coconut', 60), oil(20), onion(60), water(250)], 480, [KATORI]),
  r('amsul-saar', 'Amsul saar (kokum saar)', ['kokum saar', 'amsulache saar', 'kokum kadhi without coconut', 'kokum rasam'],
    [ing('regional2-kokum', 30), ing('jaggery', 20), ghee(5), water(600)], 600, [KATORI, GLASS]),
  r('methkut', 'Methkut (Maharashtrian dal-rice powder)', ['methkoot', 'metkut', 'methkut powder'],
    [rice(50), ing('toor-dal', 50), ing('urad-dal', 50), ing('chana', 50)], 190, [piece('1 tbsp (10 g)', 10)]),
  r('javas-chutney', 'Javas / tisi chutney (dry flaxseed chutney)', ['javas chutney', 'alsi chutney', 'tisi ki chutney', 'flaxseed chutney', 'jawas chutney'],
    [u('flaxseed', 100), u('garlic', 15)], 110, [piece('1 tbsp (10 g)', 10)]),
  r('vada-pav-lasun-chutney', 'Dry garlic chutney (vada pav lasun chutney)', ['lasun chutney', 'vada pav chutney', 'sukhi lahsun chutney', 'dry garlic chutney'],
    [u('dryCoconut', 60), u('garlic', 30), ing('peanuts', 20), oil(5)], 110, [piece('1 tbsp (10 g)', 10)]),
  r('phanasachi-bhaji', 'Phanasachi bhaji (Konkan raw jackfruit)', ['phanas bhaji', 'kadgi chakko', 'raw jackfruit konkani', 'phanasachi bhaji'],
    [ing('north-raw-jackfruit', 500), u('coconut', 50), oil(20)], 480, [KATORI]),
  r('kulith-usal', 'Kulith usal (sprouted horse gram)', ['kulthachi usal', 'kulith usal', 'horse gram usal'],
    [ing('horse-gram', 120), oil(20), onion(60), u('coconut', 30), water(450)], 600, [KATORI]),
  r('kolache-pohe', 'Kolache pohe (Konkan poha in tamarind coconut milk)', ['kolache pohe', 'kolache pohe pathare prabhu'],
    [ing('poha', 120), u('coconutMilk', 150), u('tamarind', 15), ing('jaggery', 15), oil(10)], 300, [PLATE]),
  r('phunke', 'Phunke (Khandeshi steamed dal dumplings)', ['funke', 'phunke', 'dal phunke'],
    [ing('chana', 100), ing('toor-dal', 50), water(120), oil(15)], 275, [piece('1 plate (6 pieces)', 120)]),
  r('ghadichi-poli', 'Ghadichi poli (layered chapati)', ['ghadi chi poli', 'ghadichi chapati', 'layered poli', 'pudachi poli'],
    [atta(35), water(20), oil(4)], 55, [piece('1 poli', 55)]),
  r('dalimbi-bhaat', 'Dalimbi bhaat (val beans rice)', ['dalimbi bhat', 'val bhaat', 'valachi khichdi'],
    [rice(200), u('val', 60), oil(25), u('coconut', 30), water(500)], 760, [PLATE, KATORI]),
  r('khandeshi-dal-ganda', 'Dal ganda (Khandeshi dal with raw onion)', ['dal kanda', 'dal ganda', 'khandeshi dal'],
    [ing('toor-dal', 120), oil(20), water(650), onion(80)], 820, [KATORI]),
  r('bharli-tondli', 'Bharli tondli (stuffed ivy gourd)', ['stuffed tendli', 'bharleli tondli', 'bharwa kundru'],
    [ing('westeast-tindora', 400), ing('peanuts', 40), u('dryCoconut', 30), oil(25)], 420, [KATORI]),

  // ───────────────────────── Goa ─────────────────────────
  r('moong-gathi', 'Moong gathi (Goan sprouted moong in coconut)', ['mooga gathi', 'moong gathi', 'sprouted moong goan'],
    [u('sprouts', 300), u('coconut', 80), oil(15), onion(50), water(250)], 600, [KATORI]),
  r('goan-poie', 'Poie (Goan wholewheat pocket bread)', ['poi', 'poee', 'goan poi', 'poie bread'],
    [atta(200), u('maida', 100), u('wheatBran', 20), water(190), oil(10)], 440, [piece('1 poie', 70)]),
  r('val-val', 'Val val (Goan vegetables in coconut milk)', ['valval', 'goan val val', 'mixed veg coconut milk goan'],
    [potato(150), u('pumpkin', 100), u('beans', 80), ing('carrot', 60), u('coconutMilk', 200), oil(10)], 560, [KATORI]),
  r('suran-phodi', 'Suran phodi (rava-fried yam slices)', ['suran fry', 'yam rava fry', 'suranachi kaap', 'goan suran fodi'],
    [u('yam', 300), ing('sooji', 40), oil(35)], 300, [piece('1 slice', 25), piece('1 plate (6 slices)', 150)]),
  r('goan-pumpkin-foogath', 'Goan pumpkin foogath (kuvalyache)', ['pumpkin foogath', 'kuvalyache foogath', 'goan pumpkin coconut'],
    [u('pumpkin', 450), u('coconut', 50), oil(15)], 420, [KATORI]),

  // ───────────────────────── Chhattisgarh ─────────────────────────
  r('iddhar', 'Iddhar (Chhattisgarhi colocasia leaf rolls in curry)', ['iddhar', 'idhar', 'rakhia badi', 'arbi patta curry chhattisgarh'],
    [u('taroLeaves', 150), ing('urad-dal', 100), water(80), oil(30), curd(100), water(250)], 560, [KATORI]),
  r('chech-bhaji', 'Chech bhaji (jute leaves stir fry)', ['chech bhaji', 'chench bhaji', 'jute leaf sabzi'],
    [u('jute', 400), oil(15), u('garlic', 10), ing('toor-dal', 20)], 330, [KATORI]),
  r('lal-bhaji-cg', 'Lal bhaji with dal (Chhattisgarhi)', ['lal bhaji dal', 'chhattisgarhi lal bhaji', 'red amaranth dal'],
    [u('amaranthLeaves', 300), ing('moong-dal', 40), oil(15), water(250)], 500, [KATORI]),
  r('pej', 'Pej (Chhattisgarhi rice gruel drink)', ['pej', 'peja', 'chhattisgarhi pej', 'rice pej'],
    [rice(60), water(700), u('buttermilk', 100)], 780, [GLASS]),
  r('cg-chawal-muthia', 'Muthia (Chhattisgarhi rice flour steamed dumplings)', ['muthia chhattisgarhi', 'chawal ke muthiya', 'rice muthia'],
    [u('riceFlour', 150), water(170), oil(12)], 310, [piece('1 plate (150 g)', 150)]),

  // ───────────────────────── Jharkhand ─────────────────────────
  r('rugra-sabzi', 'Rugra sabzi (Jharkhand wild mushroom curry)', ['rugra', 'putu', 'rugda', 'jharkhand mushroom'],
    [u('oyster', 400), oil(20), onion(80), tomato(80), water(100)], 520, [KATORI]),
  r('kudrum-chutney', 'Kudrum chutney (roselle leaf chutney)', ['kudrum', 'kudrum ki chutney', 'roselle chutney'],
    [ing('south-gongura', 200), mOil(10), u('garlic', 10)], 160, [TBSP2]),
  r('dhuska-ghugni', 'Dhuska with ghugni (plate)', ['dhuska ghugni', 'dhuska aloo', 'jharkhand dhuska plate'],
    [rice(60), ing('chana', 20), water(40), oil(20), u('dryPeas', 40), oil(5), potato(30), water(150)], 330, [piece('1 plate (3 dhuska + ghugni)', 330)]),
  r('bamboo-karil', 'Karil (bamboo shoot curry, Jharkhand)', ['karil', 'karil ki sabzi', 'bans karil'],
    [u('bamboo', 400), mOil(20), onion(60), tomato(60), water(150)], 600, [KATORI]),
  r('marua-roti-saag-plate', 'Marua roti with chana saag (Jharkhand plate)', ['marua roti saag', 'jharkhandi roti saag'],
    [ing('ragi-flour', 80), water(70), u('spinach', 150), mOil(10)], 280, [piece('1 plate', 280)]),

  // ───────────────────────── Bihar (Mithila, Magahi, Bhojpuri) ─────────────────────────
  r('tarua', 'Tarua (Mithila batter-fried vegetable slices)', ['taruaa', 'tarua', 'mithila tarua', 'baingan tarua', 'tilkor tarua'],
    [u('brinjal', 150), potato(150), besan(60), u('riceFlour', 20), water(80), mOil(40)], 400, [piece('1 piece', 20), piece('1 plate (6 pieces)', 120)]),
  r('ol-chokha', 'Ol ka chokha (mashed yam)', ['ol chokha', 'suran chokha', 'jimikand chokha', 'ol bharta'],
    [u('yam', 400), mOil(15), onion(30), u('greenChilli', 10)], 410, [KATORI]),
  r('ol-ki-sabzi', 'Ol ki sabzi (yam curry)', ['ol ki sabzi', 'suran ki sabzi', 'jimikand ki sabzi', 'elephant yam curry'],
    [u('yam', 400), mOil(25), onion(80), tomato(80), water(250)], 700, [KATORI]),
  r('arikanchan', 'Arikanchan (Mithila taro leaf rolls in curry)', ['arikanchan', 'arikanchan ki sabzi', 'arbi patta mithila', 'kanchan'],
    [u('taroLeaves', 200), besan(100), water(80), mOil(30), u('mustardSeed', 10), water(200)], 520, [KATORI]),
  r('chura-matar', 'Chura matar (poha with green peas)', ['chuda matar', 'chiwda matar', 'matar poha', 'chura matar bihari'],
    [ing('poha', 150), u('peas', 150), ghee(15), onion(40)], 330, [PLATE]),
  r('baingan-bhujia', 'Bihari baingan bhujia', ['baingan bhujia', 'bhanta bhujia', 'brinjal bhujia'],
    [u('brinjal', 400), potato(100), mOil(25), onion(60)], 440, [KATORI]),
  r('saag-bhaat', 'Saag bhaat (rice with mustard-greens saag)', ['saag bhat', 'saag chawal', 'saag rice'],
    [rice(100), water(220), u('mustardGreens', 150), u('spinach', 100), mOil(12)], 480, [PLATE]),
  r('bihari-khichdi-chokha', 'Saturday khichdi with chokha, papad, ghee (Bihari plate)', ['khichdi chokha', 'shanivar khichdi', 'bihari khichdi plate', 'khichdi ke char yaar'],
    [rice(70), ing('moong-dal', 30), ghee(12), water(350), potato(80), mOil(5), ing('westeast-papad', 10)], 520, [piece('1 plate', 520)]),
  r('bharua-baingan', 'Sattu-stuffed baingan (bharua baingan, Bihari)', ['bharua baingan', 'sattu baingan', 'bharwa baingan sattu'],
    [u('brinjal', 400), ing('sattu', 80), mOil(30)], 450, [KATORI]),
  r('bihari-chana-dal-kachori', 'Chana dal kachori (Bihari)', ['bihari kachori', 'chana dal kachori', 'dal kachauri'],
    [atta(200), water(100), ing('chana', 60), water(30), oil(50)], 400, [piece('1 kachori', 40)]),
  r('bajka', 'Bajka (Bihari mixed vegetable pakoda)', ['bajka', 'bajke', 'bihari pakoda'],
    [besan(150), onion(80), potato(80), water(100), mOil(45)], 380, [piece('1 plate (8 pieces)', 120)]),

  // ───────────────────────── Odisha ─────────────────────────
  r('dahi-bara-aloo-dum', 'Dahi bara aloo dum (Cuttack street)', ['dahibara aloodum', 'dahi bara aloo dum', 'cuttack dahi bara'],
    [ing('urad-dal', 150), water(120), oil(40), curd(300), water(200), potato(300), oil(20), water(150)], 1150, [PLATE]),
  r('sajana-saga-bhaja', 'Sajana saga bhaja (drumstick leaves stir fry)', ['sajana saga', 'munga saag', 'drumstick leaves sabzi', 'moringa leaves fry'],
    [u('drumstickLeaves', 300), mOil(15), u('garlic', 10)], 220, [piece('1 small katori (100 g)', 100)]),
  r('bara-ghuguni', 'Bara ghuguni (Odia vada with pea curry)', ['bara ghugni', 'bara ghuguni', 'odia bara ghugni'],
    [ing('urad-dal', 100), water(80), oil(30), u('dryPeas', 100), oil(15), water(400)], 650, [PLATE]),
  r('tomato-khatta', 'Tomato khatta (Odia sweet-sour tomato chutney)', ['tomato khata', 'tamato khatta', 'odia tomato chutney'],
    [tomato(300), ing('jaggery', 30), u('raisins', 10), oil(5)], 280, [TBSP2]),
  r('sajana-chhuin-tarkari', 'Sajana chhuin aloo tarkari (drumstick curry)', ['sajana chhuin', 'drumstick curry odia', 'munga aloo'],
    [u('drumstick', 250), potato(150), mOil(20), onion(50), water(250)], 640, [KATORI]),
  r('kadali-manja-tarkari', 'Kadali manja tarkari (banana stem with mustard)', ['kadali manja', 'banana stem curry', 'thor tarkari'],
    [ing('south2-banana-stem', 400), u('mustardSeed', 15), mOil(15), water(100)], 450, [KATORI]),

  // ───────────────────────── Bengal ─────────────────────────
  r('echor-dalna', 'Echor dalna (raw jackfruit curry)', ['echorer dalna', 'enchorer dalna', 'echor kalia', 'kathal curry bengali', 'gacch patha'],
    [ing('north-raw-jackfruit', 500), potato(150), mOil(35), ghee(5), tomato(60), water(250)], 820, [KATORI]),
  r('aam-tok-dal', 'Aam diye tok dal (raw mango masoor dal)', ['tok dal', 'aam dal', 'kancha aam musur dal', 'tauk dal'],
    [ing('masoor-dal', 100), ing('regional2-raw-mango', 100), sugar(15), mOil(10), water(600)], 780, [KATORI]),
  r('kolmi-shak-bhaja', 'Kolmi shak bhaja (water spinach)', ['kolmi shaak', 'kalmi saag', 'water spinach stir fry', 'kangkong'],
    [u('waterSpinach', 400), mOil(15), u('garlic', 8)], 260, [KATORI]),
  r('beguni', 'Beguni (brinjal fritters)', ['beguni', 'begun bhaja besan', 'baingan pakora bengali', 'begun er beguni'],
    [u('brinjal', 250), besan(80), water(90), oil(45)], 380, [piece('1 beguni', 30)]),
  r('aloor-chop', 'Aloor chop (Bengali potato fritter)', ['alur chop', 'aloo chop', 'potato chop'],
    [potato(300), besan(80), water(80), oil(45)], 420, [piece('1 chop', 60)]),
  r('phuluri', 'Phuluri (besan fritters)', ['fuluri', 'phuluri', 'besan phuluri'],
    [besan(150), water(120), oil(40)], 280, [piece('1 plate (8 pieces)', 80)]),
  r('mochar-chop', 'Mochar chop (banana flower cutlet)', ['mochar chop', 'banana flower chop', 'mocha chop'],
    [ing('westeast-banana-flower', 300), potato(150), besan(50), u('bread', 30), water(40), oil(50)], 470, [piece('1 chop', 50)]),
  r('beetroot-chop', 'Vegetable chop (Kolkata beetroot chop)', ['veg chop', 'vegetable chop', 'beet chop', 'kolkata veg chop'],
    [u('beet', 200), ing('carrot', 100), potato(150), ing('peanuts', 20), u('bread', 50), oil(50)], 470, [piece('1 chop', 55)]),
  r('jhalmuri', 'Jhalmuri', ['jhal muri', 'masala muri', 'jhaal muri', 'kolkata jhalmuri'],
    [u('murmura', 40), mOil(5), ing('peanuts', 10), onion(20), u('cucumber', 20), ing('chana', 10)], 105, [piece('1 paper cone', 105)]),
  r('thor-chhechki', 'Thor chhechki (banana stem stir fry)', ['thor chechki', 'thor ghonto', 'banana stem bengali'],
    [ing('south2-banana-stem', 400), ing('chana', 30), mOil(15), u('coconut', 20)], 400, [KATORI]),
  r('palong-shaak-ghonto', 'Palong shaak er ghonto (spinach with vegetables and bori)', ['palong shak', 'palong ghonto', 'spinach ghonto'],
    [ing('spinach', 400), potato(100), u('brinjal', 100), u('radish', 80), ing('urad-dal', 20), mOil(20)], 560, [KATORI]),
  r('begun-basanti', 'Begun basanti (brinjal in mustard curd)', ['begun basanti', 'doi begun', 'brinjal mustard yogurt'],
    [u('brinjal', 400), u('mustardSeed', 20), curd(150), mOil(40)], 520, [KATORI]),
  r('doi-potol', 'Doi potol (pointed gourd in curd)', ['doi potol', 'dahi parwal', 'potoler doi'],
    [ing('parwal', 400), curd(150), mOil(30), water(50)], 520, [KATORI]),
  r('kumro-bhaja', 'Kumro bhaja (pumpkin fry)', ['kumro bhaja', 'kaddu fry', 'pumpkin bhaja'],
    [u('pumpkin', 300), mOil(20)], 230, [KATORI]),
  r('kakrol-bhaja', 'Kakrol bhaja (spine gourd fry)', ['kakrol bhaja', 'kankoda fry', 'kantola fry', 'kakroler bhaja'],
    [ing('regional2-kantola', 300), besan(20), mOil(30)], 260, [KATORI]),
  r('sajne-data-chorchori', 'Sajne data chorchori (drumstick with mustard)', ['sajne data', 'drumstick chorchori', 'shojne data'],
    [u('drumstick', 300), potato(100), u('mustardSeed', 10), mOil(20), water(150)], 480, [KATORI]),
  r('shim-aloo-chhechki', 'Shim aloo chhechki (flat beans with potato)', ['shim chhechki', 'sheem aloo', 'flat beans bengali'],
    [u('papdi', 300), potato(150), mOil(20)], 400, [KATORI]),
  r('lau-diye-moong-dal', 'Lau diye moong dal (bottle gourd moong dal)', ['lau moong dal', 'lau diye muger dal', 'lauki moong dal bengali'],
    [ing('moong-dal', 100), u('bottleGourd', 200), ghee(10), water(500)], 760, [KATORI]),

  // ───────────────────────── Assam ─────────────────────────
  r('matimah-dal', 'Mati mahor dail (Assamese whole urad dal)', ['matimah', 'mati mah', 'mati mahor dal', 'black gram assamese'],
    [u('urad', 120), mOil(10), water(650)], 760, [KATORI]),
  r('outenga-dal', 'Outenga diya masoor dal (elephant apple dal)', ['outenga dal', 'ou tenga dail', 'elephant apple dal'],
    [ing('masoor-dal', 100), ing('regional2-elephant-apple', 100), mOil(10), water(600)], 780, [KATORI]),
  r('dhekia-xaak-bhaji', 'Dhekia xaak bhaji (fiddlehead fern)', ['dhekia xaak', 'dhekia saag', 'fiddlehead stir fry', 'dheki shak'],
    [u('fiddlehead', 400), potato(80), mOil(15)], 400, [KATORI]),
  r('amitar-khar', 'Amitar khar (raw papaya khar)', ['amita khar', 'omita khar', 'papaya khar'],
    [ing('regional2-raw-papaya', 400), ing('moong-dal', 20), mOil(10), water(200)], 540, [KATORI]),
  r('kosu-xaak', 'Kosu xaak (taro leaves and corms)', ['kosu xak', 'kochu xaak', 'taro leaves assamese'],
    [u('taroLeaves', 300), u('taro', 150), mOil(15), water(150)], 500, [KATORI]),
  r('lau-khar', 'Lau khar (bottle gourd khar)', ['lao khar', 'lau khar', 'bottle gourd khar'],
    [u('bottleGourd', 400), ing('moong-dal', 20), mOil(10), water(100)], 470, [KATORI]),

  // ───────────────────────── Manipur, Nagaland, Mizoram, Tripura, Arunachal ─────────────────────────
  r('morok-metpa', 'Morok metpa (Manipuri chilli chutney)', ['morok metpa', 'morok mepta', 'manipuri chilli chutney'],
    [u('greenChilli', 100), onion(50), u('springOnion', 30)], 170, [piece('1 tbsp (15 g)', 15)]),
  r('kelli-chana', 'Kelli chana (Manipuri spicy chickpeas)', ['kelli chana', 'kelli chana manipur', 'manipuri chana'],
    [ing('chana', 200), oil(15), onion(60), water(500)], 650, [KATORI]),
  r('soibum-thongba', 'Soibum thongba (bamboo shoot curry)', ['soibum thongba', 'soibum', 'bamboo shoot curry manipur'],
    [u('bamboo', 300), potato(150), u('peas', 60), oil(15), water(300)], 750, [KATORI]),
  r('chakhao-bhaat', 'Chak-hao (steamed black rice)', ['chakhao rice', 'black rice steamed', 'chak hao bhaat'],
    [ing('regional2-black-rice', 150), water(300)], 420, [KATORI]),
  r('manipuri-bora', 'Manipuri bora (vegetable fritters)', ['manipuri bora', 'bora manipur', 'veg bora'],
    [besan(100), u('riceFlour', 30), onion(80), u('bottleGourd', 70), water(80), oil(40)], 320, [piece('1 plate (6 pieces)', 120)]),
  r('pakoura-thongba', 'Pakoura thongba (pakora curry, Manipuri)', ['pakora thongba', 'pakoura thongba', 'manipuri pakora curry'],
    [besan(120), water(80), oil(30), potato(100), oil(10), water(400)], 640, [KATORI]),
  r('hinkejvu', 'Hinkejvu (Sumi Naga colocasia and greens stew)', ['hinkejvu', 'hinkejvu naga', 'sumi stew'],
    [u('taro', 200), u('cabbage', 150), u('beans', 100), u('mustardGreens', 100), water(400)], 800, [BOWL, KATORI]),
  r('naga-tomato-chutney', 'Raja mircha tomato chutney (Naga)', ['naga chutney', 'raja mirchi chutney', 'king chilli chutney', 'bhut jolokia chutney'],
    [tomato(300), u('greenChilli', 30)], 280, [piece('1 tbsp (15 g)', 15)]),
  r('chhum-han', 'Chhum han (Mizo steamed vegetables)', ['chhum han', 'mizo boiled vegetables', 'steamed vegetables mizo'],
    [u('mustardGreens', 150), u('pumpkin', 150), u('beans', 100), u('brinjal', 100), water(200)], 650, [KATORI]),
  r('chakhwi', 'Chakhwi (Tripuri bamboo shoot and papaya stew)', ['chakhwi', 'chakhoi', 'tripuri chakhwi'],
    [u('bamboo', 250), ing('regional2-raw-papaya', 150), u('riceFlour', 20), water(400)], 700, [KATORI]),
  r('muya-awandru', 'Muya awandru (bamboo shoot with rice flour)', ['muya awandru', 'awandru', 'tripuri bamboo shoot'],
    [u('bamboo', 300), u('riceFlour', 40), oil(5), water(400)], 650, [KATORI]),
  r('mosdeng-serma', 'Mosdeng serma (Tripuri tomato chilli chutney)', ['mosdeng', 'mosdeng serma', 'tripuri chutney'],
    [tomato(250), u('greenChilli', 20), onion(40)], 280, [piece('1 tbsp (15 g)', 15)]),
  r('awan-bangwi', 'Awan bangwi (Tripuri sticky rice in leaves)', ['awan bangwi', 'bangwi', 'tripura rice cake'],
    [u('glutinousRice', 200), ghee(10), u('cashew', 15), ing('peanuts', 10), water(250)], 450, [piece('1 piece', 75)]),
  r('pehak', 'Pehak (Arunachali fermented soybean chutney)', ['pehak', 'peha', 'apatani chutney'],
    [u('soybean', 100), u('greenChilli', 50), water(30)], 170, [piece('1 tbsp (15 g)', 15)]),
  r('khura', 'Khura (Monpa buckwheat pancake)', ['khura', 'buckwheat pancake', 'phapar ko roti', 'kuttu pancake monpa'],
    [u('kuttu', 150), water(200), oil(10)], 330, [piece('1 khura', 70)]),
  r('chura-sabzi', 'Chura sabzi (Monpa chhurpi with chillies)', ['chura sabji', 'churpi chilli', 'monpa chura', 'ema datshi indian'],
    [ing('regional2-chhurpi', 200), u('greenChilli', 50), onion(50), oil(10), water(100)], 340, [KATORI]),

  // ───────────────────────── Sikkim and the Darjeeling hills ─────────────────────────
  r('gundruk-ko-jhol', 'Gundruk ko jhol (fermented greens soup)', ['gundruk soup', 'gundruk jhol', 'gundruk ko jhol'],
    [ing('regional2-gundruk', 30), tomato(100), onion(40), potato(100), oil(10), water(600)], 800, [BOWL, KATORI]),
  r('sinki-ko-jhol', 'Sinki ko jhol (fermented radish soup)', ['sinki soup', 'sinki ko jhol', 'sinki'],
    [u('driedRadish', 30), potato(100), tomato(80), oil(10), water(600)], 780, [BOWL, KATORI]),
  r('kinema-curry', 'Kinema curry (fermented soybean, Nepali)', ['kinema', 'kinema ko tarkari', 'kinema curry'],
    [u('soybean', 120), potato(150), tomato(100), oil(15), water(300)], 620, [KATORI]),
  r('ningro-chhurpi', 'Ningro with chhurpi (fiddlehead fern curry)', ['ningro', 'niguro', 'ningro churpi'],
    [u('fiddlehead', 300), ing('regional2-chhurpi', 100), oil(15), water(100)], 440, [KATORI]),
  r('kwati', 'Kwati (sprouted nine-bean soup)', ['kwati', 'kwanti', 'mixed bean soup nepali'],
    [ing('rajma', 30), ing('chana', 30), u('moongWhole', 30), u('soybean', 30), u('adzuki', 30), ghee(15), water(1000)], 1000, [BOWL, KATORI]),
  r('bhatmas-sadeko', 'Bhatmas sadeko (roasted soybean salad)', ['bhatmas sadeko', 'bhatmas', 'roasted soybean chaat'],
    [u('roastedSoy', 100), onion(40), tomato(40), mOil(10), u('lemonJuice', 10)], 195, [piece('1 small plate (60 g)', 60)]),
  r('aloo-tama', 'Aloo tama (potato, bamboo shoot and beans)', ['aloo tama', 'alu tama', 'tama curry'],
    [potato(200), u('bamboo', 150), u('cowpea', 50), oil(15), water(600)], 850, [KATORI, BOWL]),
  r('aloo-ko-achar', 'Aloo ko achar (Nepali potato sesame salad)', ['aloo achar', 'alu ko achar', 'nepali potato salad'],
    [potato(400), u('sesame', 30), mOil(20), u('lemonJuice', 20)], 440, [KATORI]),
  r('sisnu-soup', 'Sisnu ko jhol (nettle soup)', ['sisnu', 'nettle soup', 'sisnu ko tarkari'],
    [u('nettle', 300), u('makki', 20), ghee(10), water(400)], 650, [BOWL]),
  r('veg-phaley', 'Veg phaley (fried stuffed bread)', ['phaley', 'phalay', 'veg phale', 'shaphaley veg'],
    [u('maida', 200), water(110), u('cabbage', 150), onion(40), oil(40)], 450, [piece('1 phaley', 75)]),
  r('dhindo', 'Dhindo (buckwheat or millet mush)', ['dhindo', 'dhido', 'kodo ko dhindo', 'phapar dhindo'],
    [u('kuttu', 100), water(400), ghee(5)], 450, [KATORI]),

  // ───────────────────────── Sindhi ─────────────────────────
  r('tidali-dal', 'Tidali dal (Sindhi three-lentil dal)', ['tidali dal', 'tiddali dal', 'sindhi teen dal'],
    [ing('chana', 40), ing('moong-dal', 40), ing('masoor-dal', 40), oil(15), tomato(60), water(650)], 780, [KATORI]),
  r('seyal-double-roti', 'Seyal double roti (bread in tomato onion gravy)', ['seyal bread', 'seyal double roti', 'sindhi seyal bread'],
    [u('bread', 200), tomato(200), onion(60), oil(20), water(100)], 500, [PLATE]),
  r('sanna-pakora', 'Sanna pakora (Sindhi double-fried pakora)', ['sanna pakora', 'sindhi pakora', 'sana pakora'],
    [besan(150), onion(100), water(70), oil(50)], 300, [piece('1 plate (6 pieces)', 120)]),
  r('bhee-tikki', 'Bhee tikki (lotus stem cutlet)', ['bhee ki tikki', 'lotus stem tikki', 'kamal kakdi tikki'],
    [u('lotusRoot', 200), potato(150), besan(30), oil(30)], 340, [piece('1 tikki', 45)]),
  r('dhodho', 'Dhodho (Sindhi jowar-bajra onion roti)', ['dhodho', 'dhodo', 'sindhi jowar roti'],
    [u('jowar', 60), u('millet', 20), onion(30), water(60), ghee(8)], 165, [piece('1 dhodho', 85)]),
  r('kachalu-tuk', 'Kachalu tuk (Sindhi fried arbi)', ['kachalu', 'arbi tuk', 'sindhi arbi', 'kachalu fry'],
    [u('taro', 400), oil(50)], 330, [KATORI]),

  // ───────────────────────── More from the hills ─────────────────────────
  r('nadur-haak', 'Nadur haak (lotus stem with Kashmiri collards)', ['nadru haak', 'nadir haakh', 'lotus stem haak'],
    [u('lotusRoot', 150), u('collards', 400), mOil(25), water(200)], 700, [KATORI]),
  r('bhatooru', 'Bhatooru (Himachali fermented wheat bread)', ['bhaturu', 'bhatoori himachali', 'kullu bhatooru', 'himachali bread'],
    [atta(200), water(120), oil(5)], 300, [piece('1 bhatooru', 75)]),
  r('garhwali-til-chutney', 'Til ki chutney (Garhwali sesame chutney)', ['til chutney pahadi', 'bhuna til chutney', 'sesame chutney garhwali'],
    [u('sesame', 80), u('lemonJuice', 20), u('greenChilli', 10), water(20)], 125, [piece('1 tbsp (15 g)', 15)]),
  r('namkeen-pude', 'Namkeen pude (Punjabi savory wheat pancakes)', ['namkeen pude', 'pooda', 'atta pude', 'namkeen cheela atta'],
    [atta(150), water(200), onion(40), oil(20)], 380, [piece('1 puda', 65)]),
  r('marwari-pyaz-sabzi', 'Pyaz ki sabzi (Marwari onion curry)', ['pyaz ki sabzi', 'kanda sabzi marwari', 'onion sabzi rajasthani'],
    [onion(500), oil(30), curd(50)], 440, [KATORI]),
  r('moong-dal-chilla', 'Moong dal chilla', ['moong dal cheela', 'mag ni dal na pudla', 'moong chilla', 'dal cheela'],
    [ing('moong-dal', 100), water(120), onion(30), oil(15)], 250, [piece('1 chilla', 60)]),

  // ───────────────────────── More from Gujarat and Maharashtra ─────────────────────────
  r('bhinda-ni-kadhi', 'Bhinda ni kadhi (okra kadhi)', ['bhindi kadhi', 'bhinda kadhi', 'okra kadhi'],
    [curd(300), besan(30), ing('okra', 150), oil(15), water(300)], 750, [KATORI]),
  r('fafda-kadhi-chutney', 'Kadhi chutney (for fafda and gathiya)', ['fafda chutney', 'kadhi chutney', 'besan chutney fafda'],
    [besan(30), curd(100), sugar(10), oil(5), water(300)], 420, [TBSP2, CUP]),
  r('chorafali', 'Chorafali', ['chorafali', 'chorafari', 'chorafali diwali snack'],
    [besan(100), ing('urad-dal', 50), water(50), oil(40)], 210, [piece('1 bowl (30 g)', 30)]),
  r('farsi-puri', 'Farsi puri', ['farsi poori', 'farsi puri', 'gujarati farsi puri'],
    [u('maida', 200), ghee(30), water(70), oil(40)], 300, [piece('1 puri', 15)]),
  r('ratalu-puri', 'Ratalu puri (Surti purple yam fritters)', ['ratalu puri', 'kand puri', 'kand na bhajiya', 'purple yam fritters'],
    [u('yam', 300), besan(80), water(60), oil(40)], 400, [piece('1 piece', 25)]),
  r('bhungla-bateta', 'Bhungla bateta (Bhavnagar garlic potatoes with fryums)', ['bhungla batata', 'bhungla bateta', 'bhavnagri bhungla bataka'],
    [potato(300), oil(25), u('garlic', 15), ing('westeast-papad', 40), oil(15)], 360, [PLATE]),
  r('chora-nu-shaak', 'Chora nu shaak (yardlong beans)', ['chora shaak', 'chawli sheng bhaji', 'long beans sabzi', 'barbati sabzi'],
    [u('yardlong', 400), oil(20), tomato(60)], 400, [KATORI]),
  r('guvar-dhokli', 'Guvar dhokli (cluster beans with wheat dumplings)', ['gavar dhokli', 'guvar dhokli nu shaak'],
    [ing('westeast-gavar', 300), atta(60), besan(20), water(40), oil(25), water(200)], 560, [KATORI]),
  r('pudachi-wadi', 'Pudachi wadi (Nagpur coriander rolls)', ['pudachi vadi', 'nagpuri pudachi wadi', 'kothimbir pudachi wadi'],
    [u('maida', 100), besan(50), oil(20), u('coriander', 100), u('dryCoconut', 40), u('poppy', 15), u('sesame', 10), water(60), oil(50)], 350,
    [piece('1 piece', 25)]),
  r('shevgyachya-shenganchi-amti', 'Shevgyachya shenganchi amti (drumstick amti)', ['shevga amti', 'drumstick amti', 'shevga varan'],
    [ing('toor-dal', 80), u('drumstick', 150), u('coconut', 30), oil(10), water(500)], 700, [KATORI]),
  r('dangar', 'Dangar (Malvani urad flour raita)', ['dangar', 'udid dangar', 'malvani dangar'],
    [ing('urad-dal', 60), curd(100), onion(40)], 190, [TBSP2, piece('1 small katori (75 g)', 75)]),
  r('ambe-dal', 'Ambe dal (raw mango chana dal relish)', ['kairi dal', 'ambe dal', 'aambe daal', 'chaitra dal'],
    [ing('chana', 100), water(100), ing('regional2-raw-mango', 50), oil(10)], 250, [piece('1 small katori (60 g)', 60)]),
  r('kakdi-dhirde', 'Kakdi dhirde (cucumber rice pancakes)', ['dhirde', 'kakdiche dhirde', 'cucumber dhirde'],
    [u('riceFlour', 100), u('cucumber', 150), water(50), oil(10)], 280, [piece('1 dhirda', 70)]),

  // ───────────────────────── More from the east ─────────────────────────
  r('thethari', 'Thethari (Chhattisgarhi besan snack)', ['thethari', 'thethri', 'chhattisgarhi thethari'],
    [besan(150), water(40), oil(45)], 220, [piece('1 bowl (30 g)', 30)]),
  r('kancha-kolar-dalna', 'Kancha kolar dalna (raw banana curry)', ['kanchkolar dalna', 'raw banana dalna', 'kancha kola torkari'],
    [u('rawBanana', 300), potato(100), mOil(25), ghee(5), tomato(50), water(250)], 640, [KATORI]),
  r('potoler-dorma', 'Potoler dorma (stuffed pointed gourd)', ['potol dorma', 'potoler dolma', 'stuffed parwal bengali'],
    [ing('parwal', 400), ing('paneer', 100), mOil(40), curd(50), water(100)], 560, [KATORI]),
  r('aloo-kabli', 'Aloo kabli (Kolkata potato and pea chaat)', ['alu kabli', 'aloo kabli', 'kolkata aloo kabli'],
    [potato(200), u('dryPeas', 40), water(80), onion(30), u('tamarind', 15), u('cucumber', 30)], 380, [PLATE]),
  r('musur-dal-bora', 'Musur dal bora (red lentil fritters)', ['masoor dal bora', 'dal bora', 'musurir dal er bora'],
    [ing('masoor-dal', 150), water(100), onion(40), mOil(40)], 300, [piece('1 bora', 15)]),
  r('khorisa-dal', 'Khorisa diya dal (bamboo shoot dal)', ['khorisa dal', 'bamboo shoot dal', 'khorikha dail'],
    [ing('masoor-dal', 100), u('bamboo', 100), mOil(10), water(600)], 780, [KATORI]),
  r('dal-bhat-tarkari', 'Dal bhat tarkari (Nepali plate)', ['dal bhat', 'dal bhaat tarkari', 'nepali thali'],
    [rice(80), water(180), ing('masoor-dal', 30), water(200), ghee(5), potato(80), ing('cauliflower', 50), oil(10)], 580, [piece('1 plate', 580)]),
  r('mula-ko-achar', 'Mula ko achar (Nepali radish sesame salad)', ['mula achar', 'radish achar nepali', 'mula ko achaar'],
    [u('radish', 300), u('sesame', 20), mOil(15), u('lemonJuice', 10)], 330, [piece('1 small katori (60 g)', 60)]),
  r('kathal-kofta', 'Kathal ke kofte (Kayastha raw jackfruit kofta curry)', ['kathal kofta', 'kathal ke kofte', 'jackfruit kofta curry'],
    [ing('north-raw-jackfruit', 400), besan(50), oil(50), onion(80), tomato(100), curd(80), water(300)], 900, [KATORI]),
  r('shalgam-bharta', 'Shalgam ka bharta (turnip mash)', ['shaljam bharta', 'turnip bharta', 'shalgam bharta'],
    [u('turnip', 500), ghee(15), onion(60), tomato(60)], 500, [KATORI]),

  // ───────────────────────── Pickles, chutneys and a few more ─────────────────────────
  r('gogji-aanchaar', 'Gogji aanchaar (Kashmiri turnip pickle)', ['gogji achar', 'shalgam achar kashmiri', 'turnip pickle'],
    [u('turnip', 500), mOil(60), u('mustardSeed', 20)], 520, [piece('1 tbsp (20 g)', 20)]),
  r('lingri-achaar', 'Lingri ka achaar (fiddlehead fern pickle)', ['lingri achar', 'lingdi achar', 'fiddlehead pickle'],
    [u('fiddlehead', 400), mOil(60), u('mustardSeed', 20)], 420, [piece('1 tbsp (20 g)', 20)]),
  r('nimbu-sana', 'Nimbu sana (Kumaoni citrus salad with curd)', ['sana hua nimbu', 'nimbu sana', 'pahadi nimbu sana'],
    [u('lemons', 300), curd(150), sugar(20), u('hemp', 15)], 470, [KATORI]),
  r('lesu-roti', 'Lesu (Garhwali mandua-stuffed roti)', ['lesu', 'lesu roti', 'mandua stuffed roti'],
    [atta(30), ing('ragi-flour', 20), water(30), ghee(6)], 80, [ROTI(80)]),
  r('gajar-marcha-athanu', 'Gajar marcha nu athanu (instant carrot chilli pickle)', ['gajar mirch achar', 'gajar marcha athanu', 'instant carrot pickle'],
    [ing('carrot', 200), u('greenChilli', 100), u('mustardSeed', 20), oil(30), u('lemonJuice', 20)], 360, [piece('1 tbsp (20 g)', 20)]),
  r('vainganachi-phodi', 'Vainganachi phodi (rava-fried brinjal slices)', ['vangi kaap', 'brinjal rava fry', 'baingan rava fry', 'vaingan fodi'],
    [u('brinjal', 300), ing('sooji', 40), oil(35)], 300, [piece('1 slice', 25), piece('1 plate (6 slices)', 150)]),
  r('newari-bara', 'Bara / wo (Newari lentil pancake)', ['wo', 'newari bara', 'woh', 'urad pancake'],
    [ing('urad-dal', 150), water(100), oil(25)], 250, [piece('1 bara', 50)]),
  r('chatamari', 'Chatamari (Newari rice crepe with vegetables)', ['chatamari', 'newari pizza', 'rice crepe nepali'],
    [u('riceFlour', 150), water(200), onion(40), tomato(40), oil(15)], 420, [piece('1 chatamari', 105)]),
  r('gundruk-sadeko', 'Gundruk sadeko (gundruk salad)', ['gundruk achar', 'gundruk sadeko', 'gundruk salad'],
    [ing('regional2-gundruk', 50), water(100), onion(40), tomato(40), mOil(10)], 220, [piece('1 small katori (60 g)', 60)]),
  r('kachri-chutney', 'Kachri ki chutney', ['kachri chutney', 'kachari chutney', 'rajasthani kachri'],
    [ing('regional2-kachri', 50), u('garlic', 15), curd(50), oil(10), water(30)], 150, [piece('1 tbsp (15 g)', 15)]),
  r('kachri-ki-sabzi', 'Kachri ki sabzi (Haryanvi-Marwari)', ['kachri sabzi', 'kachri ki sabji'],
    [ing('regional2-kachri', 60), water(200), onion(80), oil(20), curd(80)], 380, [piece('1 small katori (80 g)', 80)]),
  r('pepe-dalna', 'Pepe-r dalna (raw papaya curry)', ['pepe dalna', 'raw papaya curry', 'kacha pepe torkari'],
    [ing('regional2-raw-papaya', 400), potato(100), mOil(25), tomato(50), water(200)], 680, [KATORI]),
]
