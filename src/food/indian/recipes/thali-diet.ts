// Thalis and combo plates as people log them, fitness and diet versions of
// popular dishes, fasting (vrat) food, Jain versions and soft baby-style food.
// Written by a recipe worker; see docs/indian-food-database.md.
//
// Conventions used here:
// - A thali or combo plate is ONE recipe for ONE plate: it is built from
//   standard single-serving components (1 roti, 1 katori dal, 150 g rice ...).
//   Each component lists its raw ingredients and its own cooked weight; the
//   plate's cooked weight is the sum of the components. So a plate's portion
//   is the whole plate as served.
// - Meat and fish weights are edible raw weight (no bones). Deep-fried items
//   list only the oil absorbed. Spices, salt and herbs under ~5 g are left out.
// - Paneer, soya chunks, ragi, jaggery, makhana and a few vrat flours take
//   values from package labels (see ingredients.ts), so dishes using them wait
//   on those label values.

import type { Portion } from '../../types'
import type { RecipeIngredient } from '../../recipe'
import { CUP, GLASS, KATORI, PLATE, ing, piece, r, usdaIng, type IndianRecipe } from '../define'

// ───────────── Ingredient shorthands ─────────────
const n = (key: string) => (g: number) => ing(key, g)
const u = (id: number) => (g: number) => usdaIng(id, g)

// catalogue
const water = n('water')
const oil = n('oil')
const ghee = n('ghee')
const onion = n('onion')
const tomato = n('tomato')
const potato = n('potato')
const cauliflower = n('cauliflower')
const spinach = n('spinach')
const okra = n('okra')
const carrot = n('carrot')
const curd = n('curd')
const milk = n('milk')
const egg = n('egg')
const chicken = n('chicken')
const paneer = n('paneer')
const atta = n('atta')
const rice = n('rice')
const sooji = n('sooji')
const besan = n('besan')
const toor = n('toor-dal')
const moong = n('moong-dal')
const masoor = n('masoor-dal')
const urad = n('urad-dal')
const rajma = n('rajma')
const chana = n('chana') // kabuli chana; also stands for chana dal (same seed)
const peanuts = n('peanuts')
const sugar = n('sugar')
const jaggery = n('jaggery')
const poha = n('poha')
const soya = n('soya-chunks')
const ragi = n('ragi-flour')
const sattu = n('sattu')
const makhana = n('makhana')
const vermicelli = n('vermicelli')
const methi = n('methi-leaves')
const whey = n('snacks-whey-protein')
const samak = n('north-samak-rice')
const singhara = n('north-singhara-atta')
const foxtail = n('south-foxtail-millet')

// USDA SR Legacy (fdc_id, checked against data/usda/sr_legacy_macros.csv)
const breast = u(171077) // Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw
const goat = u(175303) // Game meat, goat, raw (Indian "mutton")
const rohu = u(171952) // Fish, carp, raw (rohu, katla)
const basa = u(174186) // Fish, catfish, channel, wild, raw (basa)
const bangda = u(173673) // Fish, mackerel, spanish, raw (bangda / surmai stand-in)
const prawn = u(175179) // Crustaceans, shrimp, raw
const eggWhite = u(172183) // Egg, white, raw, fresh
const papad = u(168106) // Papad
const mango = u(169910) // Mangos, raw (also raw mango for pickle)
const milkPowder = u(170876) // Milk, dry, whole (khoya-style sweets, gulab jamun)
const tonedMilk = u(171267) // Milk, reduced fat, 2% (toned milk)
const skimMilk = u(171269) // Milk, nonfat (skim / double toned)
const greekYogurt = u(170894) // Yogurt, Greek, plain, nonfat (hung curd, low fat)
const hungCurd = u(171304) // Yogurt, Greek, plain, whole milk (hung curd)
const lowFatCurd = u(170886) // Yogurt, plain, low fat
const tofu = u(172475) // Tofu, raw, firm
const brownRice = u(169703) // Rice, brown, long-grain, raw (also red/matta rice)
const quinoa = u(168874) // Quinoa, uncooked
const oats = u(173904) // Cereals, oats, regular and quick, dry
const millet = u(169702) // Millet, raw (whole millet grain)
const jowar = u(168943) // Sorghum flour, whole-grain (jowar atta)
const bajra = u(172023) // Millet flour (bajra atta)
const kuttu = u(170687) // Buckwheat flour, whole-groat (kuttu atta)
const rajgira = u(170682) // Amaranth grain (rajgira)
const sabudana = u(169717) // Tapioca, pearl, dry (sabudana)
const sweetPotato = u(168482) // Sweet potato, raw (shakarkandi)
const roastedPeanuts = u(173806) // Peanuts, dry-roasted, without salt
const rawBanana = u(168215) // Plantains, green, raw (kacha kela)
const arbi = u(169308) // Taro, raw (arbi)
const pumpkin = u(168448) // Pumpkin, raw (kaddu)
const cucumber = u(168409) // Cucumber, with peel, raw
const cabbage = u(169975) // Cabbage, raw
const beans = u(169961) // Beans, snap, green, raw
const peas = u(170419) // Peas, green, raw
const capsicum = u(170427) // Peppers, sweet, green, raw
const mushroom = u(169251) // Mushrooms, white, raw
const lauki = u(169232) // Gourd, white-flowered (calabash), raw
const karela = u(168393) // Balsam-pear (bitter gourd), raw
const baingan = u(169228) // Eggplant, raw
const broccoli = u(170379) // Broccoli, raw
const corn = u(169998) // Corn, sweet, yellow, raw
const sprouts = u(169957) // Mung beans, sprouted, raw
const lobia = u(173758) // Cowpeas (lobia, chawli), mature seeds, raw
const moth = u(172425) // Mothbeans, mature seeds, raw (matki)
const soybean = u(174270) // Soybeans, mature seeds, raw
const coconut = u(170169) // Nuts, coconut meat, raw (fresh grated)
const dryCoconut = u(170170) // Nuts, coconut meat, dried (desiccated)
const coconutMilk = u(170172) // Nuts, coconut milk, raw
const mustardOil = u(172337) // Oil, mustard
const coconutOil = u(171412) // Oil, coconut
const oliveOil = u(171413) // Oil, olive
const butter = u(173410) // Butter, salted
const cream = u(170858) // Cream, fluid, light whipping (Indian fresh cream)
const cashew = u(170162) // Nuts, cashew nuts, raw
const almond = u(170567) // Nuts, almonds
const raisin = u(168165) // Raisins, dark, seedless
const dates = u(171726) // Dates, deglet noor
const banana = u(173944) // Bananas, raw
const apple = u(171688) // Apples, raw, with skin
const papaya = u(169926) // Papayas, raw
const pomegranate = u(169134) // Pomegranates, raw
const grapes = u(174683) // Grapes, raw
const brownBread = u(172688) // Bread, whole-wheat, commercially prepared
const bread = u(174924) // Bread, white, commercially prepared
const pav = u(172793) // Rolls, dinner, plain (pav)
const maida = u(169761) // Wheat flour, white, all-purpose, unenriched
const riceFlour = u(169714) // Rice flour, white
const cornflour = u(169698) // Cornstarch
const dalia = u(170688) // Bulgur, dry (dalia, broken wheat)
const tamarind = u(167763) // Tamarinds, raw
const lemon = u(167747) // Lemon juice, raw
const drumstick = u(170483) // Drumstick pods, raw
const coriander = u(169997) // Coriander leaves, raw
const mint = u(173475) // Spearmint, fresh (pudina)
const pasta = u(168927) // Pasta, dry
const ashGourd = u(170069) // Waxgourd, raw (petha, kumbalanga)
const amaranthLeaves = u(168385) // Amaranth leaves, raw (chaulai)
const peanutButter = u(172470) // Peanut butter, smooth, without salt
const iceCream = u(167575) // Ice creams, vanilla
const bananaChips = u(168849) // Snacks, banana chips
const greenChilli = u(170497) // Peppers, hot chili, green, raw
const springOnion = u(170005) // Onions, spring, raw
const soySauce = u(174277) // Soy sauce
const buttermilkLow = u(170874) // Milk, buttermilk, cultured, lowfat

// ───────────── Plate components (one serving each) ─────────────
// A component is its raw ingredients plus its own cooked weight.
interface C {
  i: RecipeIngredient[]
  g: number
}
const c = (g: number, ...i: RecipeIngredient[]): C => ({ i, g })
const round1 = (v: number) => Math.round(v * 10) / 10
/** k servings of a component (k may be fractional, e.g. half a katori). */
const x = (k: number, comp: C): C => ({ i: comp.i.map((v) => ({ ...v, grams: round1(v.grams * k) })), g: Math.round(comp.g * k) })

/** One plate built from components; its portion is the whole plate. */
const plate = (key: string, name: string, aliases: string[], comps: C[], label: string, extra: Portion[] = []): IndianRecipe => {
  const g = comps.reduce((s, v) => s + v.g, 0)
  return r(key, name, aliases, comps.flatMap((v) => v.i), g, [piece(label, g), ...extra])
}

// Breads (per piece)
const ROTI = c(40, atta(30), water(20))
const PHULKA = c(30, atta(22), water(15))
const GHEE_ROTI = c(43, atta(30), water(20), ghee(3))
const TANDOORI_ROTI = c(55, atta(38), water(24), butter(4))
const PARATHA = c(70, atta(45), water(25), ghee(8))
const ALOO_PARATHA = c(120, atta(45), potato(55), water(22), ghee(8))
const PANEER_PARATHA = c(100, atta(45), paneer(35), water(22), ghee(8))
const PURI = c(30, atta(18), water(9), oil(6))
const LUCHI = c(26, maida(15), water(7), oil(6))
const BUTTER_NAAN = c(90, maida(60), curd(8), water(25), butter(6))
const THEPLA = c(40, atta(25), methi(5), curd(5), water(8), oil(5))
const JOWAR_BHAKRI = c(60, jowar(40), water(30))
const BAJRA_ROTLA = c(80, bajra(50), water(35), ghee(5))
const NACHNI_BHAKRI = c(60, ragi(40), water(30))
const PAV2 = c(80, pav(80))
const BAATI = c(110, atta(80), sooji(10), water(30), ghee(10)) // baked, dipped in ghee
const IDLI = c(40, rice(10), urad(4), water(28))
const DOSA = c(80, rice(25), urad(8), water(45), oil(5))
const MEDU_VADA = c(36, urad(15), water(15), oil(8))
const APPAM = c(60, rice(20), coconut(6), sugar(2), water(35))
const PAROTTA = c(90, maida(55), water(25), oil(12))

// Rice (g = cooked grams)
const RICE = (g: number) => c(g, rice(round1(g / 3)), water(round1((g * 2) / 3)))
const JEERA_RICE = (g: number) => c(g, rice(round1(g / 3)), water(round1((g * 2) / 3)), ghee(round1(g * 0.025)))
const BROWN_RICE = (g: number) => c(g, brownRice(round1(g / 2.8)), water(round1(g - g / 2.8)))
const PULAO = (g: number) =>
  c(g, rice(round1(g / 3.3)), peas(round1(g * 0.06)), carrot(round1(g * 0.05)), ghee(round1(g * 0.035)), water(round1(g * 0.62)))
const LEMON_RICE = (g: number) => c(g, rice(round1(g / 3.2)), oil(round1(g * 0.035)), peanuts(round1(g * 0.03)), water(round1(g * 0.65)))
const CURD_RICE = (g: number) => c(g, rice(round1(g * 0.15)), curd(round1(g * 0.35)), milk(round1(g * 0.1)), oil(round1(g * 0.015)), water(round1(g * 0.4)))
const TAMARIND_RICE = (g: number) =>
  c(g, rice(round1(g / 3.2)), oil(round1(g * 0.05)), peanuts(round1(g * 0.03)), tamarind(round1(g * 0.03)), water(round1(g * 0.62)))

// Dals and curries (per katori, 150 g unless noted)
const DAL = c(150, toor(25), onion(10), tomato(15), ghee(4), water(115))
const THIN_DAL = c(150, toor(15), tomato(10), oil(2), water(135))
const DAL_FRY = c(150, toor(25), onion(15), tomato(20), oil(8), water(110))
const DAL_MAKHANI = c(150, urad(22), rajma(4), butter(6), cream(8), tomato(20), onion(8), water(110))
const RAJMA = c(150, rajma(30), onion(20), tomato(35), oil(5), water(90))
const CHOLE = c(150, chana(30), onion(20), tomato(35), oil(6), water(90))
const KADHI = c(150, curd(50), besan(12), oil(7), onion(5), water(100))
const GUJ_DAL = c(150, toor(18), jaggery(5), tomato(10), ghee(2), peanuts(3), water(125))
const GUJ_KADHI = c(150, curd(60), besan(6), sugar(4), ghee(2), water(95))
const VARAN = c(150, toor(25), ghee(3), water(125))
const AMTI = c(150, toor(20), tamarind(3), jaggery(4), oil(4), tomato(10), water(120))
const SAMBAR = c(150, toor(15), drumstick(15), onion(10), tomato(15), pumpkin(10), tamarind(3), oil(3), water(105))
const RASAM = c(150, toor(5), tomato(30), tamarind(4), ghee(2), water(125))
const MOR_KUZHAMBU = c(150, curd(60), coconut(10), ashGourd(30), chana(3), oil(3), water(60))
const PAPPU = c(150, toor(25), tomato(20), spinach(15), ghee(5), water(110))
const PARIPPU = c(80, moong(15), coconut(8), ghee(4), water(60))
const DALMA = c(150, toor(20), pumpkin(20), rawBanana(15), baingan(15), ghee(3), coconut(3), water(95))
const BENGALI_DAL = c(150, masoor(20), mustardOil(4), tomato(10), water(130))
const CHANA_DAL = c(150, chana(25), lauki(20), ghee(4), tomato(10), water(110))
const MADRA = c(130, chana(25), curd(50), ghee(6), water(60))
const GATTE = c(150, besan(25), curd(40), oil(8), water(85))
const USAL = c(150, moth(25), onion(15), tomato(15), oil(6), dryCoconut(3), water(105))
const SPROUTS_USAL = c(100, sprouts(70), onion(10), tomato(10), oil(4), dryCoconut(3), water(10))
const UNDHIYU = c(120, sweetPotato(20), potato(20), beans(25), baingan(20), rawBanana(15), besan(5), oil(10), peanuts(3), dryCoconut(3), methi(5))

// Paneer and veg curries (150 g)
const PANEER_BUTTER_MASALA = c(150, paneer(50), tomato(50), onion(20), cashew(6), butter(6), cream(10), water(30))
const KADAI_PANEER = c(150, paneer(55), capsicum(30), onion(30), tomato(40), oil(10))
const MATAR_PANEER = c(150, paneer(40), peas(30), tomato(40), onion(25), oil(7), water(35))
const PALAK_PANEER = c(150, paneer(40), spinach(90), onion(15), tomato(10), oil(6), cream(5), water(10))
const SHAHI_PANEER = c(150, paneer(50), tomato(40), onion(20), cashew(8), cream(15), ghee(6), water(30))
const DUM_ALOO = c(150, potato(100), curd(20), tomato(20), oil(9), cashew(3), water(25))
const ALOO_RASEDAR = c(150, potato(70), tomato(30), oil(5), water(70))
const MUSHROOM_MATAR = c(150, mushroom(70), peas(30), onion(25), tomato(30), oil(7))
const MALAI_KOFTA = c(150, potato(35), paneer(25), maida(5), oil(14), tomato(40), cashew(6), cream(15), water(30))

// Dry sabzis (100 g)
const MIX_VEG_DRY = c(100, potato(30), carrot(20), beans(20), peas(15), cauliflower(20), onion(10), oil(6))
const ALOO_DRY = c(100, potato(100), onion(10), oil(6))
const ALOO_GOBI = c(100, potato(45), cauliflower(60), tomato(10), oil(7))
const BHINDI = c(100, okra(110), onion(15), oil(8))
const LAUKI = c(100, lauki(120), tomato(10), oil(4))
const CABBAGE = c(100, cabbage(110), peas(10), oil(5))
const BAINGAN = c(100, baingan(100), onion(15), tomato(15), oil(6))
const BEANS_DRY = c(100, beans(100), potato(15), oil(5))
const ALOO_CHOKHA = c(80, potato(80), mustardOil(4))
const PORIYAL = c(100, beans(100), coconut(10), oil(4))
const THORAN = c(100, cabbage(100), coconut(12), coconutOil(4))
const AVIAL = c(100, carrot(20), beans(20), rawBanana(20), pumpkin(20), coconut(15), curd(15), coconutOil(4))
const OLAN = c(100, ashGourd(60), lobia(5), coconutMilk(30), coconutOil(2), water(15))
const KOOTU = c(100, moong(10), lauki(60), coconut(8), oil(2), water(35))
const PACHADI = c(60, curd(40), cucumber(15), coconut(8))
const SHUKTO = c(100, karela(15), baingan(20), rawBanana(20), sweetPotato(20), drumstick(10), milk(15), ghee(3), oil(3), u(170929)(3)) // + Spices, mustard seed, ground (shorshe paste)
const LABRA = c(100, pumpkin(30), potato(25), baingan(20), rawBanana(15), cabbage(20), mustardOil(5))
const ALOO_BHAJA = c(50, potato(60), oil(6))
const BEGUN_BHAJA = c(50, baingan(60), oil(8))
const KOSHIMBIR = c(60, cucumber(45), curd(10), roastedPeanuts(4), greenChilli(2))
const KOSAMBARI = c(60, moong(12), cucumber(35), coconut(6), water(8))
const BATATA_BHAJI = c(100, potato(105), oil(6), peanuts(3))

// Non-veg curries (150 g)
const CHICKEN_CURRY = c(150, chicken(70), onion(30), tomato(25), oil(9), curd(10), water(30))
const BUTTER_CHICKEN = c(150, chicken(60), tomato(45), butter(8), cream(12), cashew(5), onion(10), water(20))
const MUTTON_CURRY = c(150, goat(70), onion(35), tomato(20), oil(10), curd(10), water(30))
const MACHER_JHOL = c(150, rohu(70), potato(30), tomato(15), mustardOil(8), water(45))
const COCONUT_FISH_CURRY = c(150, bangda(70), coconutMilk(35), onion(15), tomato(10), tamarind(3), coconutOil(5), water(30))
const FISH_FRY = c(65, bangda(70), riceFlour(5), oil(6))
const EGG_CURRY = c(150, egg(100), onion(30), tomato(30), oil(8), water(10))
const PRAWN_CURRY = c(150, prawn(70), coconutMilk(35), onion(15), tomato(15), coconutOil(5), water(25))
const CHICKEN_DRY = c(120, chicken(90), onion(30), tomato(15), oil(9))

// Sides and accompaniments
const RAITA = c(100, curd(80), cucumber(25))
const BOONDI_RAITA = c(100, curd(75), besan(6), oil(3), water(18))
const SALAD = c(50, onion(15), cucumber(25), tomato(15))
const PAPAD = c(8, papad(8)) // roasted
const FRIED_PAPAD = c(11, papad(8), oil(3))
const PICKLE = c(10, mango(6), oil(4))
const GREEN_CHUTNEY = c(20, coriander(10), mint(5), lemon(3), water(4))
const COCONUT_CHUTNEY = c(40, coconut(15), chana(5), water(20), oil(1))
const CURD = c(100, curd(100))
const CHAAS = c(200, curd(50), water(150))
const SOL_KADHI = c(150, coconutMilk(40), water(110))
const BANANA_CHIPS = c(15, bananaChips(15))
const SAMOSA = c(60, maida(20), potato(35), peas(5), oil(10))
const DHOKLA = c(60, besan(18), curd(10), oil(3), sugar(2), water(30))
const KACHUMBER = c(60, onion(20), cucumber(25), tomato(15), lemon(3))

// Sweets
const GULAB_JAMUN = c(40, milkPowder(10), maida(3), ghee(1), oil(4), sugar(15), water(9))
const KHEER = c(100, milk(120), rice(6), sugar(10))
const SUJI_HALWA = c(60, sooji(15), ghee(10), sugar(15), water(30))
const SHRIKHAND = c(60, hungCurd(45), sugar(15))
const RASGULLA = c(40, paneer(15), sugar(12), water(13))
const JALEBI = c(30, maida(10), oil(6), sugar(12), water(4))
const AAMRAS = c(150, mango(140), sugar(10))
const MISHTI_DOI = c(100, milk(110), sugar(12))
const CHURMA = c(80, atta(45), ghee(18), sugar(18), water(8))
const PURAN_POLI = c(70, chana(20), jaggery(20), maida(20), water(15), ghee(5))
const PAYASAM = c(100, milk(110), rice(6), sugar(12), ghee(1), cashew(2))
const ADA_PRADHAMAN = c(100, riceFlour(10), jaggery(20), coconutMilk(50), ghee(3), water(30))
const KADA_PRASAD = c(50, atta(12), ghee(12), sugar(12), water(20))
const MOONG_HALWA = c(50, moong(12), ghee(12), sugar(12), milk(20))
const ICE_CREAM = c(60, iceCream(60))


// More plate components used by only a few plates
const CHAI = c(120, milk(50), water(75), sugar(8))
const KHICHDI = c(220, rice(35), moong(15), ghee(5), water(175))
const MEETHA_BHAAT = c(100, rice(25), sugar(15), ghee(6), raisin(3), water(60))
const SEV_TAMETA = c(100, tomato(80), besan(10), oil(9), onion(10))
const KASHMIRI_HAAK = c(100, u(170406)(120), mustardOil(6)) // Collards, raw (haak)
const CHAMAN = c(150, paneer(50), milk(30), oil(10), water(60))
const BAINGAN_CHOKHA = c(80, baingan(90), onion(10), mustardOil(4))
const SAI_BHAJI = c(150, spinach(80), chana(15), potato(15), tomato(20), onion(10), oil(7), water(25))
const BHUGA_RICE = (g: number) => c(g, rice(round1(g / 3.1)), onion(round1(g * 0.1)), oil(round1(g * 0.035)), water(round1(g * 0.6)))
const BROWN_ONION_RICE = c(200, rice(65), sugar(5), oil(6), onion(15), water(130)) // Parsi brown rice
const DHANSAK_MUTTON = c(250, toor(25), masoor(12), pumpkin(25), baingan(25), tomato(25), onion(20), goat(55), oil(8), water(95))
const BHATT_CHURKANI = c(150, soybean(30), riceFlour(5), ghee(5), water(120))
const SOUTH_CHAPATI = c(45, atta(30), water(18), oil(3))
const VEG_KURMA = c(150, carrot(20), beans(20), peas(20), potato(30), coconut(15), cashew(3), oil(7), onion(15), water(30))
const VEG_STEW = c(150, potato(30), carrot(20), beans(15), peas(10), coconutMilk(50), coconutOil(4), onion(10), water(30))
const KERALA_CHICKEN = c(150, chicken(70), onion(35), tomato(15), coconutOil(8), coconutMilk(20), water(20))
const POTATO_MASALA = c(90, potato(75), onion(15), oil(5))
const PONGAL = c(200, rice(40), moong(15), ghee(10), cashew(3), water(150))
const UPMA = c(200, sooji(50), oil(8), onion(15), water(150))
const POHA = c(150, poha(45), oil(6), onion(20), potato(20), peanuts(5), water(70))
const RAVA_KESARI = c(40, sooji(10), ghee(6), sugar(12), water(15))
const PODI_OIL = c(12, chana(4), urad(4), oil(4))
const CHHUNDO = c(15, mango(9), sugar(9))
const TOMATO_CHUTNEY_BENGALI = c(40, tomato(35), sugar(8), oil(1))
const SAGA_BHAJA = c(80, amaranthLeaves(100), mustardOil(4))
const KHAR = c(100, papaya(60), masoor(8), mustardOil(3), water(40))
const FISH_TENGA = c(150, rohu(70), tomato(40), mustardOil(6), water(45))
const ENNEGAI = c(90, baingan(80), peanuts(8), oil(8), dryCoconut(5))
const SHENGA_CHUTNEY = c(15, roastedPeanuts(12), oil(1), greenChilli(2))
const RICE_BHAKRI = c(70, riceFlour(40), water(35))
const MALVANI_VADE = c(45, riceFlour(25), urad(5), water(15), oil(8))
const MALVANI_CHICKEN = c(200, chicken(90), onion(40), dryCoconut(12), tomato(20), oil(12), water(50))
const TAMBDA_RASSA = c(150, chicken(15), onion(10), dryCoconut(5), oil(6), water(120))
const PANDHRA_RASSA = c(150, coconutMilk(30), chicken(10), water(115))
const MUTTON_SUKKA = c(120, goat(90), onion(30), dryCoconut(8), oil(10))
const KOSHA_MANGSHO = c(150, goat(80), onion(35), curd(10), mustardOil(14), potato(20))
const CHICKEN_BIRYANI = c(350, rice(85), chicken(90), onion(40), curd(25), oil(14), ghee(5), water(150))
const MUTTON_BIRYANI = c(350, rice(85), goat(90), onion(40), curd(25), oil(14), ghee(6), water(150))
const VEG_BIRYANI = c(350, rice(90), potato(30), carrot(20), beans(20), peas(20), onion(35), curd(25), oil(12), ghee(5), water(150))
const MIRCHI_SALAN = c(100, greenChilli(40), peanuts(8), dryCoconut(4), oil(7), tamarind(3), water(50))
const ONION_RAITA = c(100, curd(80), onion(25))
const KEEMA = c(150, goat(80), onion(30), peas(20), tomato(20), oil(9))
const TANDOORI_CHICKEN = c(150, chicken(170), curd(20), oil(6), lemon(5)) // half tandoori chicken, edible part
const PANEER_TIKKA_2 = c(55, paneer(40), curd(10), capsicum(10), oil(4))
const LANGAR_DAL = c(150, urad(20), chana(8), butter(4), tomato(10), water(110))
const KADDU = c(100, pumpkin(120), oil(5), jaggery(3))
const MESS_SABZI = c(150, potato(60), peas(20), tomato(25), oil(6), water(50))
const VEG_CUTLET = c(50, potato(35), peas(5), bread(6), oil(6))
const TOMATO_SOUP = c(150, tomato(130), butter(3), cream(5), cornflour(3), sugar(2), water(20))
const BREAD_BUTTER = c(60, bread(50), butter(10))
const BOILED_EGG = c(50, egg(50))
const JEERA_ALOO_DRY = c(100, potato(100), ghee(5))
const BHINDI_TIFFIN = c(80, okra(90), oil(6))
const SPROUTS_SALAD = c(100, sprouts(70), onion(10), tomato(15), cucumber(10), lemon(4))

export const RECIPES_THALI_DIET: IndianRecipe[] = [
  // ───────────── Regional thalis ─────────────
  plate('north-indian-veg-thali', 'North Indian veg thali (restaurant)', ['veg thali', 'north indian thali', 'punjabi veg thali restaurant', 'thali'],
    [x(2, TANDOORI_ROTI), JEERA_RICE(150), DAL_MAKHANI, PANEER_BUTTER_MASALA, MIX_VEG_DRY, RAITA, SALAD, PAPAD, PICKLE, GULAB_JAMUN], '1 thali'),
  plate('ghar-ka-khana-thali', 'Home veg thali (3 roti, dal, sabzi, rice, salad, curd)', ['ghar ka khana', 'home thali', 'simple veg thali', 'dal roti chawal sabzi', 'lunch thali home'],
    [x(3, ROTI), RICE(150), DAL, MIX_VEG_DRY, SALAD, CURD], '1 thali'),
  plate('punjabi-thali', 'Punjabi thali (chole, dal makhani, paneer, roti, rice, kheer)', ['punjabi thali', 'amritsari thali', 'dhaba punjabi thali'],
    [x(2, TANDOORI_ROTI), JEERA_RICE(120), CHOLE, DAL_MAKHANI, SHAHI_PANEER, BOONDI_RAITA, SALAD, PICKLE, KHEER], '1 thali'),
  plate('banarasi-thali', 'Banarasi thali (puri, aloo rasedar, chana dal, rice, kheer)', ['banarasi thali', 'up thali', 'varanasi thali', 'uttar pradesh thali'],
    [x(3, PURI), ALOO_RASEDAR, CHANA_DAL, RICE(100), KHEER, CURD, PAPAD, PICKLE], '1 thali'),
  plate('bihari-thali', 'Bihari thali (dal, bhaat, chokha, roti, bhujia)', ['bihari thali', 'dal bhaat chokha', 'bihar thali'],
    [RICE(200), x(1, THIN_DAL), c(5, ghee(5)), ALOO_CHOKHA, BAINGAN_CHOKHA, x(2, ROTI), ALOO_BHAJA, PAPAD, PICKLE], '1 thali'),
  plate('kashmiri-veg-thali', 'Kashmiri veg thali (rice, rajma, dum aloo, haak, chaman)', ['kashmiri thali', 'kashmiri pandit thali', 'kashmiri veg meal'],
    [RICE(250), RAJMA, DUM_ALOO, KASHMIRI_HAAK, CHAMAN, CURD], '1 thali'),
  plate('himachali-dham', 'Himachali dham (rice, madra, dal, kadhi, meetha bhaat)', ['dham', 'kangri dham', 'himachali thali', 'mandyali dham'],
    [RICE(250), MADRA, x(1, LANGAR_DAL), KADHI, MEETHA_BHAAT], '1 leaf plate'),
  plate('pahadi-thali', 'Pahadi thali (mandua roti, bhatt churkani, aloo gutke, rice, raita)', ['garhwali thali', 'kumaoni thali', 'uttarakhand thali', 'pahadi khana'],
    [x(2, NACHNI_BHAKRI), BHATT_CHURKANI, c(100, potato(100), mustardOil(6)), RICE(150), RAITA], '1 thali'),
  plate('rajasthani-thali', 'Rajasthani thali (dal baati churma, gatte, kadhi, bajra roti)', ['rajasthani thali', 'marwari thali', 'jodhpuri thali'],
    [x(2, BAATI), DAL, CHURMA, GATTE, KADHI, BAJRA_ROTLA, JEERA_RICE(100), FRIED_PAPAD, PICKLE], '1 thali'),
  plate('dal-baati-churma-plate', 'Dal baati churma (2 baati, dal, churma)', ['dal bati churma', 'daal baati churma', 'dal baati churma plate'],
    [x(2, BAATI), DAL, CHURMA], '1 plate'),
  plate('gujarati-thali', 'Gujarati thali (rotli, dal, kadhi, bhaat, shaak, farsan, shrikhand)', ['gujarati thali', 'gujju thali', 'kathiyawadi thali restaurant', 'unlimited gujarati thali'],
    [x(4, c(32, atta(22), water(15), ghee(2))), GUJ_DAL, GUJ_KADHI, RICE(150), UNDHIYU, x(0.8, ALOO_DRY), DHOKLA, SHRIKHAND, PAPAD, CHAAS, KACHUMBER], '1 thali'),
  plate('kathiyawadi-thali', 'Kathiyawadi thali (bajra rotla, ringan olo, sev tameta, khichdi, kadhi)', ['kathiyawadi thali', 'kathiawadi khana', 'saurashtra thali'],
    [x(2, BAJRA_ROTLA), BAINGAN, SEV_TAMETA, KHICHDI, GUJ_KADHI, c(10, jaggery(10)), c(8, butter(8)), CHAAS, x(0.5, SALAD)], '1 thali'),
  plate('maharashtrian-thali', 'Maharashtrian thali (chapati, varan bhaat, bhaji, usal, koshimbir)', ['maharashtrian thali', 'marathi thali', 'puneri thali', 'jevan thali'],
    [x(3, ROTI), VARAN, RICE(150), BATATA_BHAJI, USAL, KOSHIMBIR, PAPAD, PICKLE], '1 thali'),
  plate('puran-poli-thali', 'Puran poli thali (2 puran poli, katachi amti, bhaat, bhaji, ghee)', ['puran poli jevan', 'holi thali', 'puran poli meal'],
    [x(2, PURAN_POLI), c(10, ghee(10)), AMTI, RICE(150), BATATA_BHAJI, KOSHIMBIR, PAPAD], '1 thali'),
  plate('kolhapuri-veg-thali', 'Kolhapuri veg thali (chapati, spicy mix veg, bhakri, rice, koshimbir)', ['kolhapuri thali veg', 'kolhapuri veg meal'],
    [x(2, ROTI), JOWAR_BHAKRI, c(150, potato(30), carrot(20), beans(20), peas(20), cauliflower(20), onion(25), dryCoconut(8), oil(12), water(20)), RICE(150), VARAN, KOSHIMBIR, PAPAD], '1 thali'),
  plate('kolhapuri-chicken-thali', 'Kolhapuri chicken thali (sukka, tambda and pandhra rassa, chapati, rice)', ['kolhapuri chicken thali', 'tambda pandhra rassa thali', 'chicken thali kolhapuri'],
    [x(2, ROTI), CHICKEN_DRY, TAMBDA_RASSA, PANDHRA_RASSA, RICE(150), KACHUMBER], '1 thali'),
  plate('kolhapuri-mutton-thali', 'Kolhapuri mutton thali (sukka, tambda and pandhra rassa, bhakri, rice)', ['mutton thali', 'kolhapuri mutton thali', 'mutton thali kolhapur'],
    [x(2, JOWAR_BHAKRI), MUTTON_SUKKA, c(150, goat(15), onion(10), dryCoconut(5), oil(7), water(120)), c(150, coconutMilk(30), goat(10), water(115)), RICE(150), KACHUMBER], '1 thali'),
  plate('kombdi-vade', 'Kombdi vade (Malvani chicken curry with 3 vade and sol kadhi)', ['kombdi vade', 'chicken vade', 'malvani kombdi vade'],
    [x(3, MALVANI_VADE), MALVANI_CHICKEN, SOL_KADHI, x(0.5, KACHUMBER)], '1 plate'),
  plate('malvani-fish-thali', 'Malvani fish thali (fish curry, fish fry, sol kadhi, rice, bhakri)', ['malvani thali', 'konkani fish thali', 'fish thali malvani', 'surmai thali'],
    [RICE(200), COCONUT_FISH_CURRY, FISH_FRY, SOL_KADHI, RICE_BHAKRI, x(0.5, KACHUMBER)], '1 thali'),
  plate('goan-fish-thali', 'Goan fish thali (red rice, fish curry, fish fry, bhaji, sol kadhi)', ['goan thali', 'goa fish thali', 'xitt kodi thali'],
    [BROWN_RICE(200), COCONUT_FISH_CURRY, FISH_FRY, THORAN, SOL_KADHI, PICKLE], '1 thali'),
  plate('goan-prawn-thali', 'Goan prawn thali (prawn curry, fish fry, red rice, sol kadhi)', ['prawn thali', 'goan prawn curry rice thali'],
    [BROWN_RICE(200), PRAWN_CURRY, FISH_FRY, THORAN, SOL_KADHI], '1 thali'),
  plate('south-indian-veg-meals', 'South Indian veg meals (rice, sambar, rasam, kootu, poriyal, curd, payasam)', ['south indian thali', 'veg meals', 'full meals', 'meals', 'saapadu', 'south indian meals'],
    [RICE(300), SAMBAR, RASAM, KOOTU, PORIYAL, CURD, FRIED_PAPAD, PICKLE, PAYASAM], '1 meals plate'),
  plate('mini-meals', 'Mini meals (sambar rice, curd rice, poriyal, kesari, papad)', ['mini meals', 'mini meal', 'south indian mini meals', 'limited meals'],
    [RICE(100), x(0.67, SAMBAR), CURD_RICE(100), LEMON_RICE(80), x(0.5, PORIYAL), RAVA_KESARI, FRIED_PAPAD], '1 plate'),
  plate('tamil-meals', 'Tamil meals (rice, sambar, kuzhambu, rasam, kootu, poriyal, appalam)', ['tamil nadu meals', 'chettinad veg meals', 'sappadu', 'virunthu'],
    [RICE(300), SAMBAR, MOR_KUZHAMBU, RASAM, KOOTU, PORIYAL, CURD, FRIED_PAPAD, PICKLE, PAYASAM], '1 meals plate'),
  plate('andhra-meals', 'Andhra meals (rice, pappu with ghee, sambar, rasam, kura, curd)', ['andhra thali', 'andhra meals', 'bhojanam', 'telugu meals'],
    [RICE(300), PAPPU, c(5, ghee(5)), SAMBAR, RASAM, BEANS_DRY, CURD, FRIED_PAPAD, PICKLE, PODI_OIL], '1 meals plate'),
  plate('karnataka-oota', 'Karnataka oota (rice, saaru, huli, palya, kosambari, chitranna, payasa)', ['karnataka meals', 'oota', 'udupi thali', 'kannada oota', 'bale ele oota'],
    [RICE(250), RASAM, SAMBAR, PORIYAL, KOSAMBARI, LEMON_RICE(100), CURD, PAPAD, PICKLE, PAYASAM], '1 leaf plate'),
  plate('jolada-rotti-meals', 'Jolada rotti meals (2 jowar rotti, ennegai, kalu palya, shenga chutney, curd)', ['north karnataka meals', 'khanavali meals'],
    [x(2, JOWAR_BHAKRI), ENNEGAI, SPROUTS_USAL, SHENGA_CHUTNEY, RICE(100), SAMBAR, CURD], '1 plate'),
  plate('kerala-sadhya', 'Kerala sadhya (matta rice, parippu, sambar, avial, thoran, olan, payasam)', ['sadhya', 'onam sadhya', 'onasadya', 'kerala feast', 'vishu sadhya'],
    [BROWN_RICE(250), PARIPPU, SAMBAR, RASAM, AVIAL, THORAN, OLAN, PACHADI, x(2, FRIED_PAPAD), BANANA_CHIPS, PICKLE, c(100, buttermilkLow(100)), PAYASAM, ADA_PRADHAMAN, c(60, banana(60))], '1 leaf (sadhya)'),
  plate('kerala-meals-veg', 'Kerala meals, veg (matta rice, sambar, thoran, moru, pappadam)', ['kerala meals', 'kerala oonu', 'kerala veg meals', 'chorum curryum'],
    [BROWN_RICE(300), SAMBAR, THORAN, AVIAL, c(100, buttermilkLow(100)), FRIED_PAPAD, PICKLE], '1 meals plate'),
  plate('kerala-fish-meals', 'Kerala fish meals (matta rice, meen curry, fish fry, thoran)', ['kerala fish meals', 'meen choru', 'fish meals', 'meen curry meals'],
    [BROWN_RICE(300), COCONUT_FISH_CURRY, FISH_FRY, THORAN, c(100, buttermilkLow(100)), FRIED_PAPAD, PICKLE], '1 meals plate'),
  plate('chettinad-chicken-meals', 'Chettinad chicken meals (rice, chicken kuzhambu, rasam, poriyal, curd)', ['chicken meals', 'non veg meals', 'chettinad meals', 'chicken saapadu'],
    [RICE(300), c(150, chicken(70), onion(30), tomato(20), coconut(12), oil(10), water(25)), RASAM, PORIYAL, CURD, FRIED_PAPAD], '1 meals plate'),
  plate('andhra-chicken-meals', 'Andhra chicken meals (rice, chicken curry, pappu, rasam, curd)', ['andhra non veg meals', 'andhra chicken thali', 'kodi kura meals'],
    [RICE(300), c(150, chicken(70), onion(35), tomato(20), oil(12), water(25)), PAPPU, RASAM, CURD, FRIED_PAPAD, PICKLE], '1 meals plate'),
  plate('bengali-veg-thali', 'Bengali veg thali (bhaat, dal, aloo bhaja, shukto, labra, chutney, mishti)', ['bengali thali', 'bangali thali', 'bengali niramish thali'],
    [RICE(250), BENGALI_DAL, ALOO_BHAJA, SHUKTO, LABRA, TOMATO_CHUTNEY_BENGALI, FRIED_PAPAD, MISHTI_DOI, RASGULLA], '1 thali'),
  plate('bengali-fish-thali', 'Bengali fish thali (bhaat, dal, begun bhaja, macher jhol, chutney)', ['macher thali', 'bengali fish thali', 'mach bhaat thali'],
    [RICE(250), BENGALI_DAL, BEGUN_BHAJA, ALOO_BHAJA, MACHER_JHOL, TOMATO_CHUTNEY_BENGALI, FRIED_PAPAD, MISHTI_DOI], '1 thali'),
  plate('luchi-kosha-mangsho', 'Luchi with kosha mangsho (4 luchi + mutton)', ['luchi mangsho', 'luchi kosha mangsho', 'luchi mutton'],
    [x(4, LUCHI), KOSHA_MANGSHO], '1 plate'),
  plate('odia-thali', 'Odia thali (bhata, dalma, saga bhaja, aloo bharta, baigana bhaja, khata)', ['odia thali', 'oriya thali', 'odisha thali'],
    [RICE(250), DALMA, SAGA_BHAJA, ALOO_CHOKHA, BEGUN_BHAJA, TOMATO_CHUTNEY_BENGALI, FRIED_PAPAD, RASGULLA], '1 thali'),
  plate('assamese-thali', 'Assamese thali (bhaat, dal, aloo pitika, khar, xaak, masor tenga)', ['assamese thali', 'axomiya thali', 'assam thali'],
    [RICE(250), BENGALI_DAL, ALOO_CHOKHA, KHAR, SAGA_BHAJA, FISH_TENGA, FRIED_PAPAD], '1 thali'),
  plate('sai-bhaji-chawal', 'Sai bhaji with bhuga chawal (Sindhi plate)', ['sai bhaji chawal', 'sindhi thali', 'sai bhaji chawar'],
    [SAI_BHAJI, BHUGA_RICE(200), FRIED_PAPAD, x(0.5, KACHUMBER)], '1 plate'),
  plate('parsi-dhansak-plate', 'Mutton dhansak with brown rice and kachumber (Parsi)', ['dhansak brown rice', 'dhansak chawal'],
    [DHANSAK_MUTTON, BROWN_ONION_RICE, KACHUMBER], '1 plate'),

  // ───────────── Restaurant, dhaba and non-veg thalis ─────────────
  plate('executive-veg-thali', 'Executive veg thali (2 roti, jeera rice, dal fry, paneer, mix veg, sweet)', ['executive thali', 'office thali', 'standard thali'],
    [x(2, ROTI), JEERA_RICE(150), DAL_FRY, MATAR_PANEER, MIX_VEG_DRY, RAITA, SALAD, PAPAD, SUJI_HALWA], '1 thali'),
  plate('deluxe-veg-thali', 'Deluxe veg thali (naan, puri, paneer, kofta, dal makhani, pulao, sweet)', ['deluxe thali', 'special thali', 'maharaja thali', 'royal thali'],
    [BUTTER_NAAN, x(2, PURI), PULAO(150), DAL_MAKHANI, SHAHI_PANEER, MALAI_KOFTA, BOONDI_RAITA, SALAD, FRIED_PAPAD, GULAB_JAMUN, ICE_CREAM], '1 thali'),
  plate('mini-veg-thali', 'Mini veg thali (2 roti, rice, dal, 1 sabzi, salad)', ['mini thali', 'half thali', 'small thali', 'budget thali'],
    [x(2, ROTI), RICE(100), DAL, x(0.8, MIX_VEG_DRY), x(0.5, SALAD)], '1 thali'),
  plate('dhaba-thali', 'Dhaba thali (tandoori roti, dal makhani, paneer, salad, achaar)', ['dhaba thali', 'highway dhaba thali', 'punjabi dhaba thali'],
    [x(3, TANDOORI_ROTI), DAL_MAKHANI, KADAI_PANEER, SALAD, PICKLE], '1 thali'),
  plate('chicken-thali', 'Chicken thali (2 roti, rice, chicken curry, dal, salad, raita)', ['chicken thali', 'non veg thali', 'murgh thali'],
    [x(2, ROTI), RICE(150), CHICKEN_CURRY, DAL_FRY, ONION_RAITA, SALAD], '1 thali'),
  plate('mutton-thali-north', 'Mutton thali (3 roti, rice, mutton curry, dal, salad)', ['mutton thali', 'gosht thali', 'meat thali'],
    [x(3, ROTI), RICE(150), MUTTON_CURRY, DAL_FRY, SALAD, ONION_RAITA], '1 thali'),
  plate('egg-thali', 'Egg thali (3 roti, rice, egg curry, dal, salad)', ['egg thali', 'anda thali', 'egg curry thali'],
    [x(3, ROTI), RICE(150), EGG_CURRY, DAL, SALAD], '1 thali'),
  plate('butter-chicken-naan', 'Butter chicken with 2 butter naan (combo)', ['butter chicken naan', 'butter chicken combo', 'murgh makhani naan'],
    [x(2, BUTTER_NAAN), BUTTER_CHICKEN, x(0.5, SALAD)], '1 combo'),
  plate('tandoori-chicken-naan-plate', 'Half tandoori chicken with naan and mint chutney', ['tandoori chicken naan', 'tandoori chicken plate', 'tandoori murgh naan'],
    [TANDOORI_CHICKEN, BUTTER_NAAN, GREEN_CHUTNEY, x(0.6, KACHUMBER)], '1 plate'),
  plate('chicken-biryani-combo', 'Chicken biryani combo (biryani, mirchi salan, raita)', ['biryani combo', 'chicken biryani with salan', 'hyderabadi biryani combo', 'biryani raita salan'],
    [CHICKEN_BIRYANI, MIRCHI_SALAN, ONION_RAITA], '1 combo'),
  plate('mutton-biryani-combo', 'Mutton biryani combo (biryani, mirchi salan, raita)', ['mutton biryani with salan', 'gosht biryani combo'],
    [MUTTON_BIRYANI, MIRCHI_SALAN, ONION_RAITA], '1 combo'),
  plate('veg-biryani-combo', 'Veg biryani combo (biryani, mirchi salan, raita)', ['veg biryani with raita', 'veg biryani salan', 'veg biryani combo'],
    [VEG_BIRYANI, MIRCHI_SALAN, RAITA], '1 combo'),
  plate('chicken-curry-rice', 'Chicken curry rice (plate)', ['chicken rice', 'chicken curry chawal', 'chicken curry with rice'],
    [RICE(250), CHICKEN_CURRY, x(0.5, SALAD)], '1 plate'),
  plate('mutton-curry-rice', 'Mutton curry rice (plate)', ['mutton rice', 'mutton curry chawal', 'mangsho bhaat', 'sunday mutton rice'],
    [RICE(250), MUTTON_CURRY, x(0.5, SALAD)], '1 plate'),
  plate('macher-jhol-bhaat', 'Macher jhol bhaat (fish curry rice)', ['maach bhaat', 'fish curry rice', 'macher jhol bhat', 'fish rice bengali'],
    [RICE(250), MACHER_JHOL, BENGALI_DAL], '1 plate'),
  plate('prawn-curry-rice', 'Prawn curry rice (Goan / Konkani)', ['prawn curry rice', 'kolambi rice', 'sungta hooman rice', 'jhinga chawal'],
    [RICE(250), PRAWN_CURRY], '1 plate'),
  plate('fish-curry-rice-coastal', 'Fish curry rice (coastal, coconut)', ['fish curry rice', 'meen curry rice', 'machli chawal', 'fish curry chawal'],
    [RICE(250), COCONUT_FISH_CURRY], '1 plate'),
  plate('paratha-chicken-curry', 'Kerala parotta with chicken curry (2 parotta)', ['parotta chicken curry', 'porotta chicken', 'barotta chicken'],
    [x(2, PAROTTA), KERALA_CHICKEN], '1 plate'),
  plate('appam-egg-curry', 'Appam with egg curry (2 appam)', ['appam egg roast', 'appam mutta curry', 'appam egg curry'],
    [x(2, APPAM), EGG_CURRY], '1 plate'),

  // ───────────── Everyday combos ─────────────
  plate('2-roti-dal-sabzi', '2 roti + dal + sabzi', ['2 roti dal sabzi', 'roti dal sabzi', 'chapati dal sabzi', 'dal roti sabzi'],
    [x(2, ROTI), DAL, MIX_VEG_DRY], '1 plate'),
  plate('3-roti-dal-sabzi-rice', '3 roti + dal + sabzi + rice (full meal)', ['full meal', 'roti dal chawal sabzi', '3 chapati dal rice sabzi'],
    [x(3, ROTI), DAL, MIX_VEG_DRY, RICE(150)], '1 plate'),
  plate('2-roti-dal', '2 roti + dal', ['dal roti', '2 chapati dal', 'roti dal'],
    [x(2, ROTI), DAL], '1 plate'),
  plate('2-roti-aloo-sabzi', '2 roti + aloo sabzi', ['roti aloo sabzi', 'chapati aloo bhaji', 'aloo roti'],
    [x(2, ROTI), ALOO_DRY], '1 plate'),
  plate('3-roti-sabzi', '3 roti + sabzi (seasonal veg)', ['roti sabzi', '3 chapati sabzi', 'roti sabji'],
    [x(3, ROTI), MIX_VEG_DRY], '1 plate'),
  plate('2-roti-matar-paneer', '2 roti + matar paneer', ['roti paneer', 'chapati matar paneer', 'roti paneer sabzi'],
    [x(2, ROTI), MATAR_PANEER], '1 plate'),
  plate('2-roti-palak-paneer', '2 roti + palak paneer', ['roti palak paneer', 'chapati palak paneer'],
    [x(2, ROTI), PALAK_PANEER], '1 plate'),
  plate('2-roti-rajma', '2 roti + rajma', ['rajma roti', 'chapati rajma'],
    [x(2, ROTI), RAJMA], '1 plate'),
  plate('2-roti-chole', '2 roti + chole', ['chole roti', 'chapati chole', 'chana roti'],
    [x(2, ROTI), CHOLE], '1 plate'),
  plate('2-roti-kadhi', '2 roti + kadhi pakora', ['kadhi roti', 'chapati kadhi'],
    [x(2, ROTI), KADHI], '1 plate'),
  plate('aamras-puri', 'Aamras puri (4 puri, aamras, batata bhaji)', ['aamras puri', 'amras puri', 'aamras poori', 'keri no ras puri'],
    [x(4, PURI), AAMRAS, BATATA_BHAJI], '1 plate'),
  plate('2-roti-mushroom-matar', '2 roti + mushroom matar', ['mushroom roti', 'chapati mushroom matar'],
    [x(2, ROTI), MUSHROOM_MATAR], '1 plate'),
  plate('2-roti-chicken-curry', '2 roti + chicken curry', ['chicken roti', 'chapati chicken curry', 'roti chicken'],
    [x(2, ROTI), CHICKEN_CURRY], '1 plate'),
  plate('2-roti-egg-curry', '2 roti + egg curry', ['anda curry roti', 'egg curry chapati', 'roti egg curry'],
    [x(2, ROTI), EGG_CURRY], '1 plate'),
  plate('2-roti-mutton-curry', '2 roti + mutton curry', ['mutton roti', 'chapati mutton curry'],
    [x(2, ROTI), MUTTON_CURRY], '1 plate'),
  plate('2-butter-roti-dal-makhani', '2 butter tandoori roti + dal makhani', ['dal makhani roti', 'dal makhani with roti', 'tandoori roti dal makhani'],
    [x(2, TANDOORI_ROTI), DAL_MAKHANI], '1 plate'),
  plate('2-ghee-roti-bhindi-dal', '2 ghee roti + bhindi + dal', ['bhindi roti dal', 'ghee roti bhindi dal'],
    [x(2, GHEE_ROTI), BHINDI, DAL], '1 plate'),
  plate('dal-chawal-sabzi', 'Dal chawal with aloo gobi (plate)', ['dal rice sabzi', 'dal chawal sabzi', 'rice dal and sabzi'],
    [RICE(200), DAL, ALOO_GOBI, PICKLE], '1 plate'),
  plate('dal-chawal-ghee-papad', 'Dal chawal with ghee, papad and achaar', ['dal chawal papad achar', 'dal rice ghee papad', 'comfort dal chawal'],
    [RICE(200), DAL, c(5, ghee(5)), FRIED_PAPAD, PICKLE], '1 plate'),
  plate('khichdi-kadhi', 'Khichdi with kadhi and papad (plate)', ['khichdi kadhi', 'khichdi kadhi papad', 'gujarati khichdi kadhi'],
    [KHICHDI, GUJ_KADHI, PAPAD], '1 plate'),
  plate('khichdi-ghee-papad-achaar', 'Khichdi with ghee, curd, papad and achaar', ['khichdi ke chaar yaar', 'khichdi papad achar', 'khichdi dahi papad ghee'],
    [x(1.2, KHICHDI), c(8, ghee(8)), CURD, FRIED_PAPAD, PICKLE], '1 plate'),
  plate('aloo-paratha-curd-plate', '2 aloo paratha with butter, curd and achaar', ['aloo paratha dahi', 'aloo paratha with curd', 'aloo paratha butter dahi', 'punjabi breakfast'],
    [x(2, ALOO_PARATHA), c(10, butter(10)), CURD, PICKLE], '1 plate'),
  plate('aloo-paratha-chai', '1 aloo paratha with chai', ['aloo paratha chai', 'paratha and tea', 'aloo paratha with tea'],
    [ALOO_PARATHA, CHAI], '1 combo'),
  plate('paneer-paratha-curd-plate', '2 paneer paratha with curd and achaar', ['paneer paratha dahi', 'paneer paratha with curd'],
    [x(2, PANEER_PARATHA), CURD, PICKLE], '1 plate'),
  plate('puri-chole', 'Puri chole (4 puri with chole)', ['chole puri', 'puri chana', 'poori chole'],
    [x(4, PURI), CHOLE], '1 plate'),
  plate('halwa-puri-chole', 'Halwa puri chole (nashta plate)', ['halwa puri', 'halwa poori', 'halwa puri chana', 'ashtami halwa puri'],
    [x(3, PURI), SUJI_HALWA, CHOLE], '1 plate'),
  plate('poha-jalebi', 'Poha jalebi (Indori nashta)', ['poha jalebi', 'indori poha jalebi', 'pohe jalebi'],
    [POHA, x(2, JALEBI), c(10, besan(5), oil(5))], '1 plate'),
  plate('usal-pav', 'Usal pav (2 pav)', ['usal pav', 'matki usal pav', 'usal pao'],
    [USAL, PAV2, x(0.3, KACHUMBER)], '1 plate'),
  plate('thalipeeth-dahi-loni', 'Thalipeeth with dahi and loni (2 thalipeeth)', ['thalipeeth dahi', 'thalipeeth loni', 'thalipith with curd and butter'],
    [x(2, c(70, jowar(20), bajra(10), besan(10), atta(5), onion(10), water(15), oil(5))), CURD, c(10, butter(10))], '1 plate'),
  plate('thepla-chhundo-dahi', 'Thepla with chhundo and curd (3 thepla)', ['thepla chhundo', 'thepla dahi', 'methi thepla plate'],
    [x(3, THEPLA), CHHUNDO, CURD], '1 plate'),
  plate('upma-chutney', 'Upma with coconut chutney', ['upma chutney', 'uppittu chutney', 'rava upma plate'],
    [UPMA, COCONUT_CHUTNEY], '1 plate'),

  // ───────────── Canteen, mess, tiffin, travel and occasions ─────────────
  plate('office-canteen-veg-meal', 'Office canteen veg meal (2 roti, rice, dal, sabzi, salad)', ['canteen thali', 'office canteen lunch', 'cafeteria veg meal', 'corporate lunch veg'],
    [x(2, ROTI), RICE(150), THIN_DAL, x(1.2, MIX_VEG_DRY), x(0.5, SALAD)], '1 plate'),
  plate('office-canteen-nonveg-meal', 'Office canteen non-veg meal (2 roti, rice, chicken curry, dal)', ['canteen chicken meal', 'cafeteria non veg meal', 'corporate lunch chicken'],
    [x(2, ROTI), RICE(150), CHICKEN_CURRY, THIN_DAL, x(0.5, SALAD)], '1 plate'),
  plate('office-canteen-south-meal', 'Office canteen south meal (rice, sambar, rasam, poriyal, curd)', ['canteen meals', 'cafeteria south indian meal', 'office meals'],
    [RICE(250), SAMBAR, RASAM, PORIYAL, x(0.8, CURD)], '1 plate'),
  plate('hostel-mess-lunch', 'Hostel mess lunch (4 phulka, rice, dal, aloo matar)', ['mess lunch', 'hostel lunch', 'mess food', 'college mess thali'],
    [x(4, PHULKA), RICE(200), THIN_DAL, MESS_SABZI, x(0.5, SALAD)], '1 plate'),
  plate('hostel-mess-dinner', 'Hostel mess dinner (4 phulka, rice, dal, lauki)', ['mess dinner', 'hostel dinner', 'mess khana'],
    [x(4, PHULKA), RICE(150), THIN_DAL, LAUKI], '1 plate'),
  plate('hostel-mess-sunday-special', 'Hostel mess Sunday special (puri, paneer, rice, kheer)', ['mess feast', 'sunday special mess', 'mess special dinner'],
    [x(4, PURI), MATAR_PANEER, RICE(150), THIN_DAL, KHEER], '1 plate'),
  plate('hostel-breakfast-poha-chai', 'Hostel breakfast (poha and chai)', ['mess breakfast', 'poha chai', 'poha with tea'],
    [POHA, CHAI], '1 combo'),
  plate('hostel-breakfast-bread-egg', 'Hostel breakfast (bread butter, 2 boiled eggs, tea)', ['mess breakfast eggs', 'bread butter egg tea', 'bread anda chai'],
    [BREAD_BUTTER, x(2, BOILED_EGG), CHAI], '1 combo'),
  plate('pg-tiffin', 'PG / home tiffin service (4 roti, dal, sabzi, rice)', ['tiffin service', 'dabba', 'pg tiffin', 'tiffin meal', 'ghar ka tiffin'],
    [x(4, PHULKA), DAL, MIX_VEG_DRY, RICE(150)], '1 tiffin'),
  plate('mumbai-dabba', 'Mumbai dabba (3 chapati with ghee, bhaji, varan, bhaat)', ['dabbawala tiffin', 'mumbai tiffin', 'maharashtrian dabba'],
    [x(3, GHEE_ROTI), BATATA_BHAJI, VARAN, RICE(150)], '1 tiffin'),
  plate('langar-plate', 'Langar (3 roti, maah chole di dal, kaddu, kheer)', ['langar', 'gurudwara langar', 'guru ka langar', 'langar prashada'],
    [x(3, ROTI), LANGAR_DAL, KADDU, KHEER], '1 plate'),
  plate('langar-with-kada-prasad', 'Langar with kada prasad', ['langar karah prasad', 'gurudwara meal with prasad'],
    [x(3, ROTI), LANGAR_DAL, KADDU, KHEER, KADA_PRASAD], '1 plate'),
  plate('temple-annadanam', 'Temple annadanam meal (rice, sambar, rasam, poriyal, buttermilk, payasam)', ['annadanam', 'prasadam meal', 'temple meals', 'anna prasadam'],
    [RICE(300), SAMBAR, RASAM, PORIYAL, x(0.75, CHAAS), x(0.8, PAYASAM)], '1 leaf plate'),
  plate('railway-veg-meal', 'Railway veg meal (2 paratha, rice, dal, paneer, curd)', ['irctc veg meal', 'train veg thali', 'railway thali', 'pantry veg meal'],
    [x(2, PARATHA), RICE(150), DAL_FRY, x(0.7, MATAR_PANEER), x(0.8, CURD), PICKLE], '1 tray'),
  plate('railway-egg-meal', 'Railway egg curry meal (2 paratha, rice, dal, egg curry)', ['irctc egg meal', 'train non veg meal', 'railway non veg thali'],
    [x(2, PARATHA), RICE(150), DAL_FRY, EGG_CURRY, PICKLE], '1 tray'),
  plate('railway-chicken-meal', 'Railway chicken meal (2 paratha, rice, dal, chicken curry)', ['irctc chicken meal', 'train chicken thali'],
    [x(2, PARATHA), RICE(150), DAL_FRY, CHICKEN_CURRY, PICKLE], '1 tray'),
  plate('railway-veg-breakfast', 'Railway veg breakfast (bread butter, 2 cutlets, tea)', ['irctc breakfast', 'train breakfast', 'cutlet bread breakfast'],
    [BREAD_BUTTER, x(2, VEG_CUTLET), CHAI], '1 tray'),
  plate('rajdhani-dinner', 'Rajdhani / Shatabdi dinner (soup, roti, rice, dal, paneer, sabzi, ice cream)', ['rajdhani food', 'shatabdi meal', 'rajdhani dinner', 'vande bharat meal'],
    [TOMATO_SOUP, x(2, ROTI), PULAO(120), DAL_FRY, x(0.8, PANEER_BUTTER_MASALA), x(0.8, MIX_VEG_DRY), x(0.8, CURD), ICE_CREAM], '1 tray'),
  plate('wedding-buffet-veg', 'Wedding buffet plate, veg (naan, pulao, paneer, dal makhani, kofta, sweets)', ['shaadi ka khana', 'wedding food', 'shaadi plate', 'wedding buffet', 'reception dinner'],
    [BUTTER_NAAN, PULAO(150), DAL_MAKHANI, SHAHI_PANEER, x(0.7, MALAI_KOFTA), x(0.7, CHOLE), BOONDI_RAITA, SALAD, PANEER_TIKKA_2, GULAB_JAMUN, ICE_CREAM], '1 plate'),
  plate('wedding-buffet-nonveg', 'Wedding buffet plate, non-veg (naan, biryani, butter chicken, mutton, dal, sweets)', ['shaadi non veg', 'wedding non veg plate', 'walima plate'],
    [BUTTER_NAAN, x(0.6, CHICKEN_BIRYANI), BUTTER_CHICKEN, x(0.7, MUTTON_CURRY), x(0.7, DAL_MAKHANI), ONION_RAITA, SALAD, GULAB_JAMUN, ICE_CREAM], '1 plate'),
  plate('wedding-dessert-plate', 'Wedding dessert plate (gulab jamun, jalebi, moong halwa, ice cream)', ['shaadi sweets', 'wedding sweets plate', 'dessert counter plate'],
    [x(2, GULAB_JAMUN), x(2, JALEBI), MOONG_HALWA, ICE_CREAM], '1 plate'),
  plate('party-snack-plate', 'Party snack plate (samosa, paneer tikka, dhokla, gulab jamun)', ['kitty party plate', 'birthday snacks plate', 'party starters plate'],
    [SAMOSA, PANEER_TIKKA_2, DHOKLA, GREEN_CHUTNEY, GULAB_JAMUN], '1 plate'),
  plate('tiffin-roti-aloo', 'School tiffin: 2 ghee roti with aloo sabzi', ['school tiffin', 'kids tiffin roti sabzi', 'lunch box roti aloo'],
    [x(2, GHEE_ROTI), x(0.8, JEERA_ALOO_DRY)], '1 tiffin'),
  plate('tiffin-roti-bhindi', 'School tiffin: 2 ghee roti with bhindi', ['tiffin bhindi roti', 'lunch box bhindi chapati'],
    [x(2, GHEE_ROTI), BHINDI_TIFFIN], '1 tiffin'),
  plate('tiffin-paratha-achaar', 'Tiffin: 2 plain paratha with achaar', ['paratha achar tiffin', 'paratha pickle', 'travel paratha'],
    [x(2, PARATHA), PICKLE], '1 tiffin'),
  plate('tiffin-idli-podi', 'Tiffin: 4 idli with podi and oil', ['idli podi tiffin', 'milagai podi idli', 'idli gunpowder'],
    [x(4, IDLI), PODI_OIL], '1 tiffin'),
  plate('tiffin-lemon-rice-potato', 'Tiffin: lemon rice with potato fry', ['lemon rice tiffin', 'lemon rice potato fry', 'chitranna aloo'],
    [LEMON_RICE(200), x(0.6, ALOO_DRY)], '1 tiffin'),
  plate('tiffin-curd-rice-pickle', 'Tiffin: curd rice with pickle', ['curd rice tiffin', 'thayir sadam pickle', 'mosaranna uppinakayi'],
    [CURD_RICE(250), PICKLE], '1 tiffin'),
  plate('tiffin-puliyogare-chips', 'Tiffin: puliyogare with papad', ['puliyodarai tiffin', 'tamarind rice tiffin', 'pulihora tiffin'],
    [TAMARIND_RICE(220), FRIED_PAPAD], '1 tiffin'),
  plate('lunch-box-rice-dal-sabzi', 'Lunch box: rice, dal and sabzi', ['lunch box', 'office lunch box', 'dal rice sabzi tiffin'],
    [RICE(200), DAL, CABBAGE], '1 tiffin'),
  plate('lunch-box-3-roti-sabzi-dal', 'Lunch box: 3 roti, sabzi and dal', ['office tiffin', 'roti sabzi dal tiffin', '3 chapati tiffin'],
    [x(3, ROTI), x(0.8, ALOO_GOBI), x(0.8, DAL)], '1 tiffin'),
  plate('paneer-butter-masala-naan', 'Paneer butter masala with 2 butter naan (combo)', ['paneer butter masala naan', 'pbm naan combo', 'paneer makhani naan'],
    [x(2, BUTTER_NAAN), PANEER_BUTTER_MASALA, x(0.5, SALAD)], '1 combo'),
  plate('dal-makhani-naan', 'Dal makhani with 2 butter naan (combo)', ['dal makhani naan', 'dal naan combo'],
    [x(2, BUTTER_NAAN), DAL_MAKHANI, x(0.5, SALAD)], '1 combo'),
  plate('dal-fry-jeera-rice', 'Dal fry with jeera rice (combo)', ['dal fry jeera rice', 'dal fry rice', 'jeera rice dal tadka', 'dal rice restaurant'],
    [JEERA_RICE(250), DAL_FRY], '1 combo'),
  plate('veg-pulao-raita', 'Veg pulao with raita (combo)', ['pulao raita', 'veg pulav raita', 'pulao with curd'],
    [PULAO(250), RAITA], '1 combo'),
  plate('paneer-pulao-raita', 'Paneer pulao with boondi raita (combo)', ['paneer pulao raita', 'paneer rice raita'],
    [c(250, rice(70), paneer(50), peas(20), ghee(8), water(140)), BOONDI_RAITA], '1 combo'),
  plate('masala-dosa-filter-coffee', 'Masala dosa with filter coffee', ['dosa coffee', 'masala dosa and coffee', 'dose kaapi'],
    [DOSA, POTATO_MASALA, COCONUT_CHUTNEY, c(150, milk(80), water(60), sugar(10))], '1 combo'),
  plate('sambar-rice-potato-fry', 'Sambar rice with potato fry and papad', ['sambar sadam urulai', 'sambar rice potato fry'],
    [RICE(200), SAMBAR, x(0.8, ALOO_DRY), FRIED_PAPAD], '1 plate'),
  plate('vada-pav-chai', 'Vada pav with cutting chai', ['vada pav chai', 'wada pav tea', 'vadapav cutting'],
    [c(135, pav(40), potato(70), besan(15), oil(12)), x(0.6, CHAI)], '1 combo'),
  plate('samosa-chai', 'Samosa with chai', ['samosa chai', 'samosa and tea', 'chai samosa'],
    [x(1.5, SAMOSA), CHAI], '1 combo'),
  plate('paratha-omelette', '2 paratha with 2-egg omelette (dhaba breakfast)', ['paratha omelette', 'anda paratha plate', 'paratha anda', 'egg paratha breakfast'],
    [x(2, PARATHA), c(110, egg(100), onion(15), oil(6))], '1 plate'),
  plate('egg-bhurji-2-roti', 'Egg bhurji with 2 roti', ['anda bhurji roti', 'egg bhurji chapati', 'bhurji roti'],
    [x(2, ROTI), c(140, egg(100), onion(25), tomato(20), oil(6))], '1 plate'),
  plate('ashtami-prasad-plate', 'Ashtami / kanjak prasad (puri, kala chana, suji halwa)', ['kanjak prasad', 'ashtami prasad', 'navami prasad', 'puri chana halwa'],
    [x(3, PURI), c(80, chana(30), ghee(5), water(55)), SUJI_HALWA], '1 plate'),
  plate('porotta-beef-fry', 'Porotta with beef fry (2 porotta)', ['porotta beef', 'parotta beef fry', 'barotta beef'],
    [x(2, PAROTTA), c(120, u(171206)(110), coconut(10), coconutOil(12), onion(30))], '1 plate'), // Beef, chuck for stew, raw
  plate('bengali-chicken-thali', 'Bengali chicken thali (bhaat, dal, aloo bhaja, murgir jhol)', ['murgir jhol bhaat', 'bengali chicken thali', 'chicken jhol rice'],
    [RICE(250), BENGALI_DAL, ALOO_BHAJA, c(150, chicken(65), potato(30), onion(20), tomato(15), mustardOil(8), water(30)), TOMATO_CHUTNEY_BENGALI], '1 thali'),
  plate('sindhi-kadhi-chawal', 'Sindhi kadhi chawal with aloo tuk', ['sindhi kadhi chawal', 'sindhi kadhi rice', 'kadhi chawal aloo tuk'],
    [c(200, besan(15), drumstick(20), potato(20), beans(20), tomato(40), oil(8), water(100)), RICE(200), c(60, potato(70), oil(8))], '1 plate'),
  plate('wazwan-plate', 'Kashmiri wazwan plate (rice, rogan josh, yakhni, rista)', ['wazwan', 'kashmiri wazwan', 'kashmiri non veg thali'],
    [RICE(250), c(150, goat(70), curd(20), mustardOil(12), water(50)), c(150, goat(50), curd(70), ghee(8), water(40)), c(130, goat(65), mustardOil(6), tomato(10), water(70))], '1 plate'),
  plate('mid-day-meal', 'School mid-day meal (rice, dal, sabzi, egg)', ['mid day meal', 'pm poshan meal', 'school lunch government'],
    [RICE(200), THIN_DAL, x(0.8, MESS_SABZI), BOILED_EGG], '1 plate'),
  plate('airline-veg-meal', 'Airline veg meal (paneer, jeera rice, dal, roll, dessert)', ['flight meal veg', 'airline food', 'in flight veg meal'],
    [JEERA_RICE(120), x(0.8, PANEER_BUTTER_MASALA), x(0.7, DAL_FRY), c(40, pav(30), butter(10)), GULAB_JAMUN], '1 tray'),
  plate('iftar-plate', 'Iftar plate (dates, fruit chaat, pakora, samosa, chana chaat)', ['iftar', 'iftari plate', 'roza iftar plate', 'ramzan iftar'],
    [c(25, dates(25)), c(150, apple(40), banana(40), papaya(40), pomegranate(20), lemon(5), sugar(5)), c(60, onion(40), besan(20), water(10), oil(10)), SAMOSA, c(100, chana(30), onion(15), tomato(15), lemon(5), water(40))], '1 plate'),
  plate('pongal-festival-plate', 'Pongal festival plate (sakkarai pongal, ven pongal, vada)', ['pongal festival', 'thai pongal plate', 'sankranti pongal'],
    [c(150, rice(30), moong(10), jaggery(40), ghee(12), cashew(4), raisin(3), milk(30), water(50)), x(0.75, PONGAL), MEDU_VADA, x(0.5, SAMBAR), COCONUT_CHUTNEY], '1 plate'),
  plate('thali-diet-fat-loss', 'Fat loss thali (1 roti, dal, sabzi, salad, low-fat curd)', ['diet thali', 'weight loss thali', 'fat loss plate', 'low calorie thali'],
    [ROTI, c(150, toor(25), tomato(15), oil(2), water(120)), c(100, cabbage(70), peas(15), capsicum(25), oil(3)), x(2, SALAD), c(100, lowFatCurd(100))], '1 thali'),
  plate('thali-diabetic', 'Diabetic-friendly thali (2 jowar roti, dal, sabzi, salad, curd, no rice)', ['diabetic thali', 'sugar patient thali', 'low gi thali'],
    [x(2, JOWAR_BHAKRI), DAL, BHINDI, x(2, SALAD), CURD], '1 thali'),
  plate('thali-low-carb', 'Low-carb thali (paneer tikka, dal, sabzi, salad, no roti or rice)', ['low carb thali', 'no roti thali', 'keto thali veg'],
    [c(150, paneer(110), hungCurd(25), capsicum(20), onion(20), oil(4)), DAL, PALAK_PANEER, x(2, SALAD)], '1 thali'),
  plate('thali-high-protein-veg', 'High-protein veg thali (2 roti, dal, paneer bhurji, sprouts, Greek curd)', ['high protein veg thali', 'protein thali', 'gym veg thali'],
    [x(2, ROTI), DAL, c(120, paneer(100), onion(20), tomato(20), oil(4)), SPROUTS_SALAD, c(100, greekYogurt(100))], '1 thali'),
  plate('thali-high-protein-nonveg', 'High-protein non-veg thali (2 roti, chicken breast curry, dal, egg whites, salad)', ['high protein non veg thali', 'gym chicken thali', 'protein chicken thali'],
    [x(2, ROTI), c(170, breast(130), onion(30), tomato(30), oil(4)), DAL, c(66, eggWhite(66)), x(2, SALAD)], '1 thali'),
  plate('gym-paneer-roti', 'Gym plate: 100 g paneer with 2 roti and salad', ['paneer roti gym', 'paneer 100g roti', 'paneer chapati gym meal'],
    [x(2, ROTI), c(100, paneer(105), oil(2)), SALAD], '1 plate'),
  plate('gym-chicken-roti', 'Gym plate: 150 g boiled chicken breast with 2 roti and salad', ['chicken roti gym', 'boiled chicken roti', 'chicken breast chapati'],
    [x(2, ROTI), c(150, breast(200)), x(1.5, SALAD)], '1 plate'),
  plate('egg-white-toast', '4 egg-white omelette with 2 brown bread', ['egg white toast', 'egg white omelette bread', 'gym breakfast eggs'],
    [c(120, eggWhite(132), onion(10), oil(1)), c(60, brownBread(60))], '1 plate'),
  plate('boiled-egg-toast', '2 boiled eggs with 2 brown bread', ['anda bread', 'boiled eggs and bread'],
    [x(2, BOILED_EGG), c(60, brownBread(60))], '1 plate'),
  plate('paneer-bhurji-multigrain-roti', 'Paneer bhurji with 2 multigrain roti', ['paneer bhurji roti', 'paneer bhurji chapati'],
    [x(2, c(40, atta(20), jowar(5), bajra(5), water(20))), c(130, paneer(100), onion(20), tomato(20), capsicum(10), oil(5))], '1 plate'),

  // ───────────── Meal-prep bowls ─────────────
  plate('chicken-tikka-brown-rice-bowl', 'Chicken tikka brown rice bowl', ['meal prep chicken bowl'],
    [BROWN_RICE(150), c(100, breast(130), hungCurd(15), oil(2)), c(100, cucumber(30), onion(20), tomato(25), capsicum(25)), c(40, greekYogurt(35), mint(5))], '1 bowl'),
  plate('paneer-tikka-quinoa-bowl', 'Paneer tikka quinoa bowl', ['paneer quinoa bowl', 'quinoa paneer'],
    [c(150, quinoa(50), water(110)), c(110, paneer(100), hungCurd(15), capsicum(15), oil(3)), c(80, cucumber(30), tomato(25), onion(15), lemon(5), corn(5))], '1 bowl'),
  plate('rajma-brown-rice-bowl', 'Rajma brown rice bowl (meal prep)', ['rajma bowl', 'rajma rice bowl', 'meal prep rajma'],
    [BROWN_RICE(150), c(150, rajma(35), onion(20), tomato(35), oil(3), water(80)), x(1.2, SALAD)], '1 bowl'),
  plate('chole-quinoa-bowl', 'Chole quinoa bowl', ['chickpea quinoa bowl', 'chole bowl', 'chana quinoa bowl'],
    [c(150, quinoa(50), water(110)), c(150, chana(35), onion(20), tomato(35), oil(3), water(80)), x(1.2, KACHUMBER)], '1 bowl'),
  plate('dal-brown-rice-sabzi-bowl', 'Dal, brown rice and sabzi bowl (meal prep)', ['dal rice bowl', 'meal prep dal bowl', 'dal chawal bowl'],
    [BROWN_RICE(150), c(150, moong(25), tomato(15), oil(2), water(120)), c(100, cabbage(60), capsicum(30), beans(25), oil(3))], '1 bowl'),
  plate('soya-keema-rice-bowl', 'Soya keema rice bowl', ['soya rice bowl', 'soya keema bowl', 'nutrela rice bowl'],
    [RICE(150), c(150, soya(30), onion(25), tomato(35), peas(20), oil(4), water(55)), x(0.8, SALAD)], '1 bowl'),
  plate('egg-curry-brown-rice-bowl', 'Egg curry brown rice bowl', ['egg rice bowl', 'egg curry bowl'],
    [BROWN_RICE(150), c(150, egg(100), onion(25), tomato(30), oil(3), water(15))], '1 bowl'),
  plate('tofu-millet-bowl', 'Tofu bhurji millet bowl', ['tofu bowl', 'millet bowl', 'tofu millet'],
    [c(150, millet(45), water(115)), c(130, tofu(110), onion(20), tomato(20), oil(3)), c(80, broccoli(40), capsicum(20), carrot(25))], '1 bowl'),
  plate('grilled-fish-rice-bowl', 'Grilled fish rice bowl', ['fish bowl', 'fish rice bowl', 'grilled basa bowl'],
    [RICE(150), c(110, basa(150), lemon(5), oil(3)), c(80, cucumber(30), tomato(25), onion(15), cabbage(15))], '1 bowl'),
  plate('chicken-keema-bowl', 'Chicken keema rice bowl (breast mince, low oil)', ['chicken keema bowl', 'keema rice bowl'],
    [RICE(150), c(150, breast(110), onion(25), tomato(25), peas(15), oil(3))], '1 bowl'),
  plate('greek-curd-rice-bowl', 'High-protein curd rice (Greek yogurt)', ['protein curd rice', 'greek yogurt curd rice', 'hung curd rice'],
    [c(130, rice(40), water(95)), c(150, greekYogurt(150)), c(40, cucumber(30), carrot(10)), c(5, oil(2), peanuts(3))], '1 bowl'),
  plate('millet-buddha-bowl', 'Millet bowl with chana, paneer and veg', ['millet buddha bowl', 'millet salad bowl', 'bajra chana bowl'],
    [c(150, millet(45), water(115)), c(90, chana(35), water(55)), c(50, paneer(50)), c(100, cucumber(30), tomato(30), carrot(20), capsicum(20)), c(10, oliveOil(3), lemon(7))], '1 bowl'),
  plate('chicken-quinoa-veg-bowl', 'Grilled chicken quinoa bowl with veg', ['chicken quinoa bowl', 'quinoa chicken'],
    [c(150, quinoa(50), water(110)), c(100, breast(135), oil(2)), c(120, broccoli(50), capsicum(30), carrot(30), corn(15)), c(3, oliveOil(3))], '1 bowl'),

  // ───────────── Low-oil and oil-free versions ─────────────
  r('low-oil-dal-tadka', 'Dal tadka, low oil (1 tsp per pot)', ['low oil dal', 'diet dal', 'dal tadka less oil', 'oil free dal tadka'],
    [toor(100), water(500), oil(5), onion(30), tomato(50)], 620, [KATORI]),
  r('oil-free-moong-dal', 'Moong dal, oil-free (boiled, dry-roasted jeera)', ['oil free dal', 'zero oil dal', 'boiled moong dal', 'no oil moong dal'],
    [moong(100), water(520), tomato(40)], 600, [KATORI]),
  r('low-oil-rajma', 'Rajma, low oil (gym style)', ['diet rajma', 'low oil rajma', 'rajma less oil'],
    [rajma(100), onion(60), tomato(120), oil(5), water(400)], 600, [KATORI]),
  r('low-oil-chole', 'Chole, low oil (gym style)', ['diet chole', 'low oil chana masala', 'chole less oil'],
    [chana(100), onion(60), tomato(120), oil(5), water(400)], 600, [KATORI]),
  r('low-fat-kadhi', 'Kadhi with low-fat curd, no pakora', ['diet kadhi', 'low fat kadhi', 'plain kadhi low oil'],
    [lowFatCurd(250), besan(30), oil(3), water(300)], 520, [KATORI]),
  r('low-oil-sambar', 'Sambar, low oil', ['diet sambar', 'sambar less oil', 'oil free sambar'],
    [toor(60), drumstick(60), pumpkin(50), onion(40), tomato(60), tamarind(10), oil(3), water(450)], 650, [KATORI]),
  r('low-fat-dal-makhani', 'Dal makhani, light (no cream, 1 tsp butter)', ['diet dal makhani', 'dal makhani without cream', 'low fat dal makhani'],
    [urad(100), rajma(20), tomato(150), onion(40), butter(5), skimMilk(50), water(600)], 700, [KATORI]),
  r('low-oil-palak-paneer', 'Palak paneer, low oil (no cream)', ['diet palak paneer', 'palak paneer less oil'],
    [paneer(150), spinach(400), onion(50), tomato(50), oil(5), lowFatCurd(30)], 600, [KATORI]),
  r('low-oil-paneer-bhurji', 'Paneer bhurji, low oil', ['diet paneer bhurji', 'paneer bhurji less oil', 'gym paneer bhurji'],
    [paneer(200), onion(60), tomato(60), capsicum(40), oil(4)], 320, [KATORI, piece('1 small bowl (100 g)', 100)]),
  r('low-oil-matar-paneer', 'Matar paneer, low oil (no cream)', ['diet matar paneer', 'matar paneer less oil'],
    [paneer(150), peas(120), onion(70), tomato(150), oil(6), water(120)], 560, [KATORI]),
  r('low-oil-paneer-butter-masala', 'Paneer butter masala, light (1 tsp butter, milk instead of cream)', ['diet paneer butter masala', 'healthy paneer makhani', 'low fat paneer butter masala'],
    [paneer(200), tomato(300), cashew(15), butter(8), skimMilk(60)], 520, [KATORI]),
  r('low-oil-aloo-gobi', 'Aloo gobi, low oil', ['diet aloo gobi', 'aloo gobi less oil'],
    [potato(200), cauliflower(300), tomato(50), oil(6)], 450, [KATORI, piece('1 small bowl (100 g)', 100)]),
  r('low-oil-bhindi', 'Bhindi, low oil', ['diet bhindi', 'bhindi less oil', 'okra low oil'],
    [okra(400), onion(60), oil(6)], 360, [piece('1 small bowl (100 g)', 100)]),
  r('low-oil-baingan-bharta', 'Baingan bharta, low oil', ['diet baingan bharta', 'bharta less oil'],
    [baingan(500), onion(60), tomato(80), oil(5)], 480, [KATORI]),
  r('low-oil-mix-veg', 'Mix veg, low oil (dry)', ['diet mix veg', 'mix veg less oil', 'steamed mix veg sabzi'],
    [carrot(100), beans(100), peas(80), cauliflower(120), capsicum(60), oil(6)], 400, [KATORI, piece('1 small bowl (100 g)', 100)]),
  r('low-oil-egg-curry', 'Egg curry, low oil (6 eggs)', ['diet egg curry', 'egg curry less oil', 'gym egg curry'],
    [egg(300), onion(100), tomato(150), oil(5), water(100)], 600, [piece('1 katori (2 eggs)', 200)]),
  r('egg-white-curry', 'Egg white curry (boiled whites, low oil)', ['egg white curry', 'anda safedi curry', 'egg white masala'],
    [eggWhite(300), onion(80), tomato(120), oil(5), water(80)], 520, [KATORI]),
  r('low-oil-fish-curry', 'Fish curry, low oil (basa)', ['diet fish curry', 'low oil fish curry', 'basa curry'],
    [basa(400), onion(80), tomato(120), mustardOil(6), water(150)], 700, [KATORI]),
  r('low-oil-chicken-tikka-masala', 'Chicken tikka masala, light (breast, no cream)', ['diet chicken tikka masala', 'healthy chicken tikka masala'],
    [breast(400), tomato(200), onion(80), lowFatCurd(80), oil(6)], 650, [KATORI]),
  r('diet-butter-chicken', 'Butter chicken, light (breast, 2 tsp butter, no cream)', ['diet butter chicken', 'healthy butter chicken', 'gym butter chicken'],
    [breast(400), tomato(300), lowFatCurd(60), butter(10), cashew(15)], 700, [KATORI]),
  r('low-oil-chicken-biryani', 'Chicken biryani, low oil (breast, gym style)', ['diet biryani', 'healthy chicken biryani', 'low oil biryani'],
    [rice(150), breast(300), curd(80), onion(60), oil(8), water(450)], 950, [PLATE]),
  r('low-oil-poha', 'Poha, low oil (with peas)', ['diet poha', 'poha less oil', 'oil free poha'],
    [poha(100), onion(40), peas(30), oil(4), water(120)], 260, [piece('1 plate (150 g)', 150)]),
  r('low-oil-upma', 'Upma, low oil (vegetable)', ['diet upma', 'upma less oil', 'vegetable upma low oil'],
    [sooji(100), onion(40), carrot(30), peas(20), oil(4), water(300)], 450, [piece('1 plate (200 g)', 200)]),
  r('low-oil-aloo-paratha', 'Aloo paratha, low oil (1/2 tsp)', ['diet aloo paratha', 'aloo paratha less oil', 'oil free aloo paratha'],
    [atta(45), potato(55), water(22), oil(2)], 115, [piece('1 paratha', 115)]),
  r('low-oil-paneer-paratha', 'Paneer paratha, low oil (1/2 tsp)', ['diet paneer paratha', 'paneer paratha less oil'],
    [atta(45), paneer(35), water(22), oil(2)], 95, [piece('1 paratha', 95)]),
  r('low-oil-dosa', 'Dosa, low oil (non-stick, 1/2 tsp)', ['diet dosa', 'oil free dosa', 'dosa less oil'],
    [rice(25), urad(8), water(45), oil(1.5)], 78, [piece('1 dosa', 78)]),
  r('low-oil-masala-dosa', 'Masala dosa, low oil', ['diet masala dosa', 'masala dosa less oil'],
    [rice(25), urad(8), water(45), oil(2), potato(75), onion(15), oil(1.5)], 140, [piece("1 masala dosa", 140)]),
  r('low-butter-pav-bhaji', 'Pav bhaji bhaji, low butter (1 tsp per plate)', ['diet pav bhaji', 'pav bhaji less butter', 'healthy pav bhaji'],
    [potato(200), cauliflower(150), peas(80), capsicum(80), tomato(250), onion(80), butter(10)], 750, [piece('1 plate bhaji (200 g)', 200)]),
  r('sugar-free-kheer', 'Kheer, sugar-free (skim milk, sweetener)', ['sugar free kheer', 'diet kheer', 'diabetic kheer'],
    [skimMilk(600), rice(30)], 480, [piece('1 bowl (120 g)', 120)]),
  r('dates-kheer', 'Kheer sweetened with dates (no sugar)', ['khajur kheer', 'dates kheer', 'no sugar kheer'],
    [milk(500), rice(25), dates(40)], 400, [piece('1 bowl (120 g)', 120)]),
  r('oats-kheer', 'Oats kheer (dates, no sugar)', ['oats kheer', 'oats payasam', 'healthy kheer'],
    [oats(30), milk(300), dates(20)], 300, [piece('1 bowl (150 g)', 150)]),
  r('low-sugar-gajar-halwa', 'Gajar halwa, light (skim milk, less sugar and ghee)', ['diet gajar halwa', 'healthy gajar halwa', 'low sugar gajar halwa'],
    [carrot(500), skimMilk(400), sugar(40), ghee(10), almond(10)], 600, [piece('1 bowl (100 g)', 100)]),

  // ───────────── Air-fryer and baked ─────────────
  r('air-fryer-samosa', 'Air fryer samosa (atta crust)', ['air fried samosa', 'baked samosa', 'oil free samosa', 'healthy samosa'],
    [atta(120), oil(12), water(50), potato(300), peas(40), oil(5), oil(4)], 480, [piece('1 samosa', 60)]),
  r('air-fryer-aloo-tikki', 'Air fryer aloo tikki', ['air fried tikki', 'baked aloo tikki', 'oil free aloo tikki'],
    [potato(400), peas(40), cornflour(20), oil(6)], 420, [piece('1 tikki', 50)]),
  r('air-fryer-onion-pakoda', 'Air fryer onion pakoda', ['air fried pakora', 'baked pakoda', 'oil free bhajiya'],
    [onion(200), besan(80), water(40), oil(6)], 260, [piece('1 plate (100 g)', 100)]),
  r('air-fryer-paneer-tikka', 'Air fryer paneer tikka', ['air fried paneer tikka', 'paneer tikka oven', 'oil free paneer tikka'],
    [paneer(250), hungCurd(60), capsicum(60), onion(60), oil(5)], 380, [piece('1 plate (6 pieces)', 150)]),
  r('air-fryer-chicken-tikka', 'Air fryer chicken tikka (breast)', ['air fried chicken tikka', 'chicken tikka oven', 'diet chicken tikka'],
    [breast(500), hungCurd(80), lemon(10), oil(5)], 420, [piece('1 plate (6 pieces)', 150)]),
  r('air-fryer-tandoori-chicken', 'Air fryer tandoori chicken', ['air fried tandoori chicken', 'oven tandoori chicken', 'tandoori chicken low oil'],
    [chicken(600), curd(80), lemon(10), oil(6)], 480, [piece('1 leg piece (edible part)', 120)]),
  r('air-fryer-fish-fry', 'Air fryer fish fry (surmai / bangda)', ['air fried fish', 'oven fish fry', 'fish fry low oil'],
    [bangda(400), riceFlour(20), oil(5)], 330, [piece('1 piece', 80)]),
  r('air-fryer-french-fries', 'Air fryer French fries', ['air fried fries', 'oil free fries', 'air fryer chips'],
    [potato(400), oil(6)], 250, [piece('1 serving (100 g)', 100)]),
  r('air-fryer-chicken-65', 'Air fryer chicken 65 (breast)', ['air fried chicken 65', 'oven chicken 65', 'low oil chicken 65'],
    [breast(400), cornflour(20), curd(40), oil(8)], 340, [piece('1 plate (150 g)', 150)]),
  r('air-fryer-medu-vada', 'Medu vada, appe pan / air fryer', ['air fried vada', 'appe vada', 'oil free medu vada'],
    [urad(100), water(100), oil(6)], 190, [piece('1 vada', 35)]),
  r('air-fryer-veg-cutlet', 'Air fryer veg cutlet', ['air fried cutlet', 'baked veg cutlet'],
    [potato(250), carrot(50), beans(50), peas(40), bread(30), oil(5)], 380, [piece('1 cutlet', 50)]),
  r('air-fryer-tandoori-gobi', 'Air fryer tandoori gobi', ['air fried gobi', 'oven gobi tikka'],
    [cauliflower(400), curd(60), besan(15), oil(5)], 330, [piece('1 plate (150 g)', 150)]),
  r('air-fryer-prawns', 'Air fryer masala prawns', ['air fried prawns', 'prawn fry low oil'],
    [prawn(300), curd(30), riceFlour(10), oil(4)], 260, [piece('1 plate (120 g)', 120)]),
  r('air-fryer-bhindi', 'Air fryer crispy bhindi', ['air fried bhindi', 'crispy okra air fryer'],
    [okra(250), besan(20), oil(5)], 190, [piece('1 small bowl (80 g)', 80)]),
  r('air-fryer-soya-tikka', 'Air fryer soya chunks tikka', ['soya tikka', 'air fried soya', 'soya chunks tikka'],
    [soya(100), water(200), hungCurd(80), capsicum(50), onion(50), oil(4)], 400, [piece('1 plate (150 g)', 150)]),
  r('air-fryer-tofu-tikka', 'Air fryer tofu tikka', ['tofu tikka', 'air fried tofu'],
    [tofu(300), hungCurd(50), capsicum(50), onion(50), oil(4)], 380, [piece('1 plate (150 g)', 150)]),

  // ───────────── High-protein ─────────────
  r('egg-white-besan-chilla', 'High-protein besan chilla (with egg whites)', ['protein chilla', 'egg white besan chilla', 'high protein cheela'],
    [besan(60), eggWhite(66), onion(20), tomato(20), oil(3), water(40)], 200, [piece('1 chilla', 100)]),
  r('paneer-stuffed-moong-chilla', 'Moong dal chilla stuffed with paneer', ['paneer moong chilla', 'moong dal cheela paneer', 'stuffed moong chilla'],
    [moong(60), water(60), paneer(50), oil(4)], 170, [piece('1 chilla', 85)]),
  r('soya-besan-chilla', 'Soya besan chilla', ['soya chilla', 'soya cheela', 'nutrela chilla'],
    [besan(40), soya(20), water(60), onion(20), oil(3)], 140, [piece('1 chilla', 70)]),
  r('sattu-chilla', 'Sattu chilla', ['sattu cheela', 'sattu pancake'],
    [sattu(50), onion(20), water(50), oil(3)], 120, [piece('1 chilla', 60)]),
  r('ragi-chilla', 'Ragi chilla', ['ragi cheela', 'nachni chilla', 'finger millet pancake'],
    [ragi(60), onion(20), curd(20), water(60), oil(4)], 150, [piece('1 chilla', 75)]),
  r('egg-white-veg-omelette', 'Veg omelette (3 egg whites + 1 whole egg)', ['3 white 1 yolk omelette', 'protein omelette', 'gym omelette'],
    [eggWhite(99), egg(50), onion(20), tomato(20), capsicum(15), oil(2)], 190, [piece('1 omelette', 190)]),
  r('protein-paratha', 'Protein paratha (paneer and soya stuffing)', ['high protein paratha', 'soya paneer paratha', 'gym paratha'],
    [atta(45), paneer(25), soya(10), water(47), oil(3)], 120, [piece('1 paratha', 120)]),
  r('soya-keema', 'Soya keema curry (with peas)', ['soya keema matar', 'soya granules curry'],
    [soya(100), water(300), onion(80), tomato(120), peas(50), oil(8)], 600, [KATORI]),
  r('soya-chunks-curry', 'Soya chunks curry (gravy, low oil)', ['soya curry', 'soya bean curry', 'nutrela curry', 'meal maker curry'],
    [soya(100), water(350), onion(80), tomato(150), oil(6)], 620, [KATORI]),
  r('soya-pulao', 'Soya chunks pulao', ['soya pulao', 'nutrela pulao', 'meal maker rice'],
    [rice(150), soya(50), water(450), onion(40), peas(40), oil(8)], 680, [PLATE]),
  r('tofu-masala', 'Tofu masala (low oil curry)', ['tofu curry', 'tofu masala', 'tofu sabzi'],
    [tofu(300), onion(80), tomato(150), oil(6), water(80)], 560, [KATORI]),
  r('palak-tofu', 'Palak tofu', ['tofu palak', 'spinach tofu'],
    [tofu(200), spinach(400), onion(50), oil(5)], 520, [KATORI]),
  r('chicken-keema-low-oil', 'Chicken keema, low oil (breast mince)', ['diet chicken keema', 'chicken breast keema', 'chicken kheema low oil'],
    [breast(500), onion(100), tomato(120), peas(80), oil(6)], 680, [KATORI]),
  r('chicken-bhurji', 'Chicken bhurji (breast, low oil)', ['chicken bhurji', 'shredded chicken bhurji'],
    [breast(300), onion(60), tomato(60), oil(5)], 360, [piece('1 small bowl (100 g)', 100), KATORI]),
  r('boiled-egg-chaat', 'Boiled egg chaat', ['egg chaat', 'anda chaat', 'boiled egg salad'],
    [egg(200), onion(30), tomato(30), cucumber(30), lemon(5)], 290, [piece('1 plate (4 eggs)', 290), piece('1 egg with veg', 72)]),
  r('protein-lassi', 'Protein lassi (curd + whey)', ['whey lassi', 'protein dahi shake', 'high protein lassi'],
    [curd(200), whey(30), water(100)], 330, [GLASS]),
  r('protein-oats', 'Protein oats (toned milk + whey)', ['oats with whey', 'protein oatmeal', 'whey oats'],
    [oats(40), tonedMilk(200), whey(30)], 260, [piece('1 bowl', 260)]),
  r('greek-yogurt-raita', 'Greek yogurt raita (hung curd, low fat)', ['hung curd raita', 'protein raita', 'greek raita'],
    [greekYogurt(200), cucumber(100)], 290, [piece('1 bowl (100 g)', 100)]),
  r('protein-kheer', 'Protein kheer (skim milk + whey, no sugar)', ['whey kheer', 'high protein kheer'],
    [skimMilk(500), rice(25), whey(30)], 450, [piece('1 bowl (150 g)', 150)]),
  r('protein-ladoo', 'Protein ladoo (dates, oats, peanut butter, whey)', ['protein laddu', 'whey ladoo', 'protein balls'],
    [dates(100), oats(50), peanutButter(30), whey(30), almond(20)], 230, [piece('1 ladoo', 23)]),
  r('high-protein-khichdi', 'High-protein khichdi (moong dal + paneer)', ['protein khichdi', 'paneer khichdi'],
    [rice(60), moong(60), paneer(80), ghee(5), water(400)], 560, [KATORI]),
  r('dal-soya-khichdi', 'Dal soya khichdi', ['soya khichdi', 'protein dal khichdi'],
    [rice(60), moong(50), soya(25), ghee(5), water(400)], 500, [KATORI]),
  r('chicken-tikka-roti-wrap', 'Chicken tikka roti wrap (diet, hung curd)', ['diet chicken roll', 'chicken roti wrap', 'healthy chicken wrap'],
    [atta(40), water(25), breast(110), hungCurd(25), onion(20), cucumber(20), oil(3)], 200, [piece('1 wrap', 200)]),
  r('egg-white-wrap', 'Egg white wrap (whole wheat roti, 4 whites)', ['egg white roll', 'egg white frankie', 'protein wrap egg'],
    [atta(40), water(25), eggWhite(132), onion(20), capsicum(20), oil(3)], 210, [piece('1 wrap', 210)]),

  // ───────────── Millet and whole-grain swaps ─────────────
  r('quinoa-idli', 'Quinoa idli', ['quinoa idly'],
    [quinoa(60), urad(30), rice(30), water(140)], 250, [piece('1 idli', 40)]),
  r('quinoa-curd-rice', 'Quinoa curd rice', ['quinoa thayir sadam', 'quinoa curd bowl'],
    [quinoa(50), water(150), curd(120), cucumber(20)], 320, [piece('1 bowl (200 g)', 200)]),
  r('millet-khichdi', 'Millet khichdi (foxtail millet + moong)', ['millet khichdi', 'thinai khichdi', 'kangni khichdi', 'siridhanya khichdi'],
    [foxtail(60), moong(30), ghee(5), carrot(25), beans(25), water(350)], 450, [KATORI]),
  r('millet-pulao', 'Millet veg pulao', ['millet pulao', 'bajra pulao', 'siridhanya pulao'],
    [millet(100), peas(40), carrot(40), oil(8), water(280)], 420, [PLATE]),
  r('oats-roti', 'Oats roti (half atta)', ['oats chapati', 'oats atta roti'],
    [oats(20), atta(20), water(20)], 50, [piece('1 roti', 50)]),
  r('brown-rice-khichdi', 'Brown rice moong dal khichdi', ['brown rice khichdi', 'healthy khichdi'],
    [brownRice(60), moong(40), ghee(5), water(400)], 450, [KATORI]),
  r('brown-rice-veg-pulao', 'Brown rice veg pulao', ['brown rice pulao', 'brown rice pulav'],
    [brownRice(150), peas(40), carrot(40), oil(8), water(380)], 560, [PLATE]),
  r('cauliflower-rice-pulao', 'Cauliflower rice pulao (low carb)', ['gobi rice', 'cauliflower rice', 'low carb pulao', 'keto rice'],
    [cauliflower(400), peas(40), carrot(30), oil(6)], 400, [PLATE]),
  r('dalia-milk-porridge', 'Dalia with milk (sweet porridge)', ['meetha dalia doodh', 'dalia milk', 'broken wheat porridge', 'daliya with milk'],
    [dalia(40), milk(250), sugar(10)], 280, [piece('1 bowl', 280)]),

  // ───────────── Diet soups ─────────────
  r('moong-dal-soup', 'Moong dal soup', ['dal soup', 'moong soup', 'yellow dal soup diet'],
    [moong(50), water(600), tomato(40), ghee(2)], 600, [piece('1 bowl (250 ml)', 250)]),
  r('lauki-soup', 'Lauki soup', ['bottle gourd soup', 'dudhi soup', 'ghiya soup'],
    [lauki(400), tomato(50), onion(30), oil(2), water(200)], 600, [piece('1 bowl (250 ml)', 250)]),
  r('palak-soup', 'Palak soup (light)', ['palak shorba'],
    [spinach(250), onion(40), skimMilk(100), water(250), butter(3)], 560, [piece('1 bowl (250 ml)', 250)]),
  r('tomato-soup-no-cream', 'Tomato soup, no cream (diet)', ['diet tomato soup', 'clear tomato soup'],
    [tomato(500), onion(40), oil(3), cornflour(5), water(150)], 600, [piece('1 bowl (250 ml)', 250)]),

  // ───────────── Vrat / fasting ─────────────
  plate('navratri-vrat-thali', 'Navratri vrat thali (kuttu puri, vrat aloo, samak rice, raita, sabudana kheer)', ['vrat thali', 'navratri thali', 'falahari thali', 'upvas thali north'],
    [x(2, c(30, kuttu(18), water(10), oil(6))), JEERA_ALOO_DRY, c(150, samak(50), water(110), ghee(3)), c(100, curd(80), lauki(25)), c(100, sabudana(10), milk(110), sugar(10))], '1 thali'),
  plate('upvas-thali', 'Upvas thali (sabudana khichdi, bhagar, shengdana amti, batata bhaji, dahi)', ['upvas thali', 'maharashtrian fasting thali', 'ekadashi thali'],
    [c(150, sabudana(50), roastedPeanuts(15), potato(20), ghee(8), water(70)), c(150, samak(50), water(110), ghee(3)),
      c(150, roastedPeanuts(20), tamarind(3), jaggery(5), ghee(3), water(130)), BATATA_BHAJI, CURD], '1 thali'),
  plate('farali-thali', 'Farali thali (farali pattice, sukhi bhaji, rajgira puri, sabudana khichdi, curd)', ['farali thali', 'gujarati upvas thali', 'farali dish'],
    [x(2, c(55, potato(45), dryCoconut(5), cornflour(4), oil(5))), BATATA_BHAJI, x(2, c(30, rajgira(18), water(9), oil(6))), c(150, sabudana(50), roastedPeanuts(15), potato(20), ghee(8), water(70)), CURD], '1 thali'),
  plate('falahari-fruit-plate', 'Falahari plate (fruits, roasted makhana, glass of milk)', ['phalahar', 'fruit and milk vrat', 'ekadashi phalahar'],
    [c(300, banana(100), apple(100), papaya(100)), c(15, makhana(15)), c(200, milk(185), sugar(15))], '1 plate'),
  plate('karwa-chauth-sargi', 'Karwa chauth sargi plate (feni, mathri, dry fruits, fruits)', ['sargi', 'sargi thali', 'karva chauth sargi'],
    [c(230, vermicelli(30), milk(200), sugar(15), ghee(5)), x(2, c(20, maida(15), ghee(5))), c(20, almond(10), cashew(5), raisin(5)), c(200, banana(100), apple(100))], '1 plate'),
  plate('sabudana-khichdi-dahi', 'Sabudana khichdi with dahi (plate)', ['sabudana khichdi curd', 'sabudana dahi', 'sago khichdi curd'],
    [c(200, sabudana(65), roastedPeanuts(20), potato(30), ghee(10), water(90)), CURD], '1 plate'),
  r('samak-pulao', 'Samak rice pulao (vrat, with potato and peanuts)', ['sama pulao', 'vrat pulao', 'moraiyo pulao', 'bhagar pulao'],
    [samak(100), potato(60), roastedPeanuts(15), ghee(10), water(230)], 380, [PLATE]),
  r('samak-dosa', 'Samak sabudana dosa (vrat dosa)', ['vrat dosa', 'upvas dosa', 'bhagar dosa'],
    [samak(60), sabudana(20), water(100), ghee(4)], 170, [piece('1 dosa', 85)]),
  r('vrat-dhokla', 'Vrat dhokla (samak and sabudana)', ['farali dhokla', 'upvas dhokla', 'sama dhokla'],
    [samak(80), sabudana(20), curd(80), water(80), oil(4)], 250, [piece('1 piece', 40)]),
  r('air-fryer-sabudana-vada', 'Sabudana vada, air fryer', ['air fried sabudana vada', 'baked sabudana vada', 'low oil sabudana vada'],
    [sabudana(100), water(80), potato(200), roastedPeanuts(50), oil(6)], 400, [piece('1 vada', 50)]),
  r('low-oil-sabudana-khichdi', 'Sabudana khichdi, low oil (1 tsp ghee, fewer peanuts)', ['diet sabudana khichdi', 'sabudana khichdi less oil'],
    [sabudana(150), water(150), potato(80), roastedPeanuts(20), ghee(5)], 380, [piece('1 plate (200 g)', 200)]),
  r('singhara-roti', 'Singhara roti (vrat)', ['singhare ki roti', 'water chestnut roti'],
    [singhara(40), potato(20), water(15), ghee(3)], 70, [piece('1 roti', 70)]),
  r('kuttu-pakora', 'Kuttu pakora (vrat, potato)', ['kuttu ke pakode', 'buckwheat pakora', 'vrat pakoda'],
    [kuttu(80), potato(150), water(60), oil(30)], 300, [piece('1 plate (100 g)', 100)]),
  r('kuttu-aloo-paratha', 'Kuttu aloo paratha (vrat)', ['kuttu paratha', 'buckwheat paratha', 'vrat paratha'],
    [kuttu(40), potato(50), water(15), ghee(6)], 100, [piece('1 paratha', 100)]),
  r('vrat-arbi-fry', 'Arbi fry in ghee (vrat)', ['vrat arbi', 'colocasia fry vrat', 'sukhi arbi'],
    [arbi(300), ghee(15)], 260, [piece('1 small bowl (100 g)', 100)]),
  r('vrat-kadhi', 'Vrat kadhi (singhara atta)', ['farali kadhi', 'upvas kadhi', 'singhare ki kadhi'],
    [curd(200), singhara(20), ghee(8), water(200)], 400, [KATORI]),
  r('farali-pattice', 'Farali pattice (coconut-stuffed potato, fried)', ['farali pattice', 'farali patties', 'upvas pattice'],
    [potato(300), dryCoconut(40), cornflour(30), sugar(10), raisin(10), oil(25)], 380, [piece('1 pattice', 50)]),
  r('vrat-fruit-chaat', 'Vrat fruit chaat (sendha namak, lemon)', ['fruit chaat', 'falahari fruit chaat', 'phal chaat'],
    [apple(100), banana(100), papaya(100), pomegranate(50), grapes(50), lemon(5)], 405, [piece('1 bowl (150 g)', 150)]),
  r('makhana-peanut-chivda', 'Vrat makhana peanut chivda', ['farali chivda', 'makhana namkeen', 'vrat namkeen'],
    [makhana(60), roastedPeanuts(30), ghee(8), raisin(10)], 108, [piece('1 small bowl (30 g)', 30)]),

  // ───────────── Jain (no onion, garlic, potato or other roots) ─────────────
  r('jain-dal-tadka', 'Jain dal tadka (no onion, garlic)', ['jain dal', 'dal without onion garlic', 'satvik dal'],
    [toor(100), tomato(60), ghee(10), water(500)], 600, [KATORI]),
  r('jain-paneer-butter-masala', 'Jain paneer butter masala', ['jain paneer makhani', 'paneer butter masala without onion garlic'],
    [paneer(200), tomato(250), cashew(30), butter(25), cream(40), water(80)], 520, [KATORI]),
  r('jain-pav-bhaji', 'Jain pav bhaji bhaji (raw banana instead of potato)', ['jain pav bhaji', 'jain bhaji', 'pav bhaji without onion garlic'],
    [rawBanana(200), cauliflower(150), peas(80), capsicum(80), cabbage(100), tomato(300), butter(40)], 800, [piece('1 plate bhaji (200 g)', 200)]),
  r('jain-chole', 'Jain chole (no onion, garlic)', ['jain chana masala', 'chole without onion garlic'],
    [chana(100), tomato(150), oil(10), water(400)], 600, [KATORI]),
  r('jain-rajma', 'Jain rajma (no onion, garlic)', ['rajma without onion garlic', 'jain rajma masala'],
    [rajma(100), tomato(150), oil(10), water(400)], 600, [KATORI]),
  r('jain-dal-makhani', 'Jain dal makhani', ['dal makhani without onion garlic', 'jain dal makhni'],
    [urad(100), rajma(20), tomato(150), butter(25), cream(40), water(650)], 700, [KATORI]),
  r('jain-kadai-paneer', 'Jain kadai paneer', ['kadai paneer without onion', 'jain kadhai paneer'],
    [paneer(200), capsicum(120), tomato(150), oil(25)], 440, [KATORI]),
  r('jain-mix-veg', 'Jain mix veg (no potato, carrot, onion)', ['jain mix veg', 'jain sabzi', 'jain mixed vegetable'],
    [cauliflower(100), beans(80), peas(80), capsicum(60), tomato(80), oil(15)], 380, [KATORI]),
  r('jain-poha', 'Jain poha (no onion, potato)', ['jain poha', 'poha without onion', 'satvik poha'],
    [poha(100), peanuts(15), oil(8), peas(30), water(100)], 230, [piece('1 plate (150 g)', 150)]),
  r('jain-upma', 'Jain upma (no onion)', ['jain upma', 'upma without onion'],
    [sooji(100), oil(10), peas(30), water(300)], 420, [piece('1 plate (200 g)', 200)]),
  r('jain-samosa', 'Jain samosa (raw banana filling)', ['jain samosa', 'kacha kela samosa', 'samosa without potato'],
    [maida(120), oil(20), water(50), rawBanana(250), peas(50), oil(50)], 480, [piece('1 samosa', 60)]),
  r('jain-raw-banana-tikki', 'Jain tikki (raw banana)', ['kacche kele ki tikki', 'raw banana tikki', 'jain aloo tikki'],
    [rawBanana(300), cornflour(20), peas(40), oil(25)], 330, [piece('1 tikki', 55)]),
  r('jain-veg-biryani', 'Jain veg biryani', ['jain biryani', 'biryani without onion garlic'],
    [rice(200), cauliflower(80), beans(60), peas(60), capsicum(50), curd(80), ghee(20), water(400)], 880, [PLATE]),
  r('jain-fried-rice', 'Jain veg fried rice', ['jain fried rice', 'fried rice without onion garlic'],
    [rice(150), cabbage(100), capsicum(80), beans(60), oil(20), soySauce(15), water(300)], 650, [PLATE]),
  r('jain-hakka-noodles', 'Jain hakka noodles', ['jain noodles', 'jain chowmein', 'noodles without onion garlic'],
    [pasta(150), cabbage(120), capsicum(80), oil(20), soySauce(15), water(200)], 560, [PLATE]),
  r('jain-veg-sandwich', 'Jain veg sandwich (no potato, onion)', ['jain sandwich', 'sandwich without onion potato'],
    [bread(100), butter(10), cucumber(60), tomato(50), capsicum(30), coriander(15), water(5)], 270, [piece('1 sandwich', 135)]),
  r('jain-manchurian', 'Jain veg manchurian (gravy)', ['jain manchurian', 'manchurian without onion garlic'],
    [cabbage(300), maida(40), cornflour(40), oil(35), soySauce(20), water(150)], 520, [KATORI]),
  plate('jain-thali', 'Jain thali (ghee roti, jain dal, sabzi, rice, kadhi, papad)', ['jain thali', 'jain bhojan', 'satvik thali'],
    [x(3, GHEE_ROTI), c(150, toor(25), tomato(15), ghee(4), water(115)), c(100, cabbage(70), capsicum(30), peas(10), oil(5)), RICE(150), GUJ_KADHI, PAPAD, c(40, cucumber(25), tomato(15))], '1 thali'),

  // ───────────── Soft baby-style foods (also eaten by adults when unwell) ─────────────
  r('dal-ka-pani', 'Dal ka pani (moong dal water)', ['dal water', 'moong dal pani', 'dal soup for baby', 'pappu neellu'],
    [moong(25), water(400), ghee(2)], 300, [CUP]),
  r('dal-chawal-mash', 'Dal chawal mash with ghee (soft, baby style)', ['dal rice mash', 'mashed dal rice', 'paruppu sadam baby'],
    [rice(30), toor(15), ghee(5), water(250)], 250, [piece('1 small bowl (100 g)', 100)]),
  r('soft-moong-khichdi-carrot', 'Soft moong dal khichdi with carrot (baby style)', ['baby khichdi', 'toddler khichdi', 'soft khichdi', 'gila khichdi'],
    [rice(30), moong(30), ghee(4), carrot(20), water(350)], 380, [piece('1 small bowl (100 g)', 100), KATORI]),
  r('suji-kheer-baby', 'Suji kheer (thin, baby style)', ['suji porridge baby', 'rava porridge baby', 'baby suji kheer'],
    [sooji(20), milk(200), sugar(8), ghee(3)], 200, [piece('1 small bowl (100 g)', 100)]),
  r('carrot-pumpkin-puree', 'Carrot and pumpkin puree', ['carrot puree', 'pumpkin puree', 'veg puree baby'],
    [carrot(100), pumpkin(100), water(60), ghee(2)], 220, [piece('1 small bowl (100 g)', 100)]),
  r('apple-stew', 'Steamed apple puree (apple stew)', ['apple puree', 'stewed apple', 'apple mash'],
    [apple(200), water(50)], 220, [piece('1 small bowl (100 g)', 100)]),
  r('aloo-mash-ghee', 'Mashed potato with ghee and milk', ['aloo mash', 'potato mash baby', 'mashed aloo'],
    [potato(200), ghee(8), milk(30)], 220, [piece('1 small bowl (100 g)', 100)]),
  r('sweet-potato-mash', 'Sweet potato mash with ghee', ['shakarkandi mash', 'sweet potato puree'],
    [sweetPotato(200), ghee(5), water(30)], 200, [piece('1 small bowl (100 g)', 100)]),
  r('sabudana-porridge', 'Sabudana porridge with milk (soft)', ['sabudana kanji', 'sago porridge', 'javvarisi kanji'],
    [sabudana(20), milk(150), water(50), sugar(5)], 200, [piece('1 small bowl (100 g)', 100)]),
  r('curd-rice-mash', 'Mashed curd rice (no tadka, soft)', ['baby curd rice', 'mosaru anna mash', 'curd rice for baby'],
    [rice(30), curd(60), milk(40), water(120)], 220, [piece('1 small bowl (100 g)', 100)]),
  r('banana-oats-porridge', 'Banana oats porridge (soft)', ['banana oats baby', 'oats banana porridge'],
    [oats(20), banana(50), milk(120), water(50)], 220, [piece('1 small bowl (110 g)', 110)]),
  r('poha-porridge', 'Poha porridge with milk (aval kanji)', ['aval kanji', 'poha kheer baby', 'avalakki ganji'],
    [poha(25), milk(150), water(60), sugar(5)], 220, [piece('1 small bowl (110 g)', 110)]),
  r('ragi-porridge-baby', 'Ragi porridge, plain (no milk, baby style)', ['ragi koozh plain', 'sprouted ragi porridge'],
    [ragi(20), water(200), ghee(2)], 190, [piece('1 small bowl (100 g)', 100)]),

  // ───────────── More plates and diet dishes ─────────────
  plate('manipuri-thali', 'Manipuri thali (chak, dal, eromba, singju, chamthong)', ['manipuri thali', 'meitei thali', 'manipur thali'],
    [RICE(250), BENGALI_DAL, c(100, potato(40), beans(30), pumpkin(30), greenChilli(5)), c(70, cabbage(50), onion(20), besan(5)), c(150, cabbage(40), peas(20), pumpkin(30), springOnion(10), water(60))], '1 thali'),
  plate('meals-with-chapati', 'South meals with chapati and kurma (rice, sambar, rasam, curd)', ['chapati meals', 'meals with chapathi', 'bangalore meals'],
    [x(2, SOUTH_CHAPATI), VEG_KURMA, RICE(200), SAMBAR, RASAM, PORIYAL, CURD, FRIED_PAPAD], '1 meals plate'),
  plate('paneer-special-thali', 'Paneer special thali (kadai paneer, paneer butter masala, dal, rice, roti)', ['paneer thali', 'paneer special thali', 'paneer lovers thali'],
    [x(2, TANDOORI_ROTI), JEERA_RICE(150), KADAI_PANEER, PANEER_BUTTER_MASALA, DAL_FRY, RAITA, SALAD, GULAB_JAMUN], '1 thali'),
  plate('egg-biryani-combo', 'Egg biryani combo (biryani, mirchi salan, raita)', ['egg biryani salan', 'anda biryani combo', 'egg biryani raita'],
    [c(350, rice(85), egg(100), onion(35), curd(20), oil(12), ghee(4), water(140)), MIRCHI_SALAN, ONION_RAITA], '1 combo'),
  plate('neer-dosa-chicken-curry', 'Neer dosa with chicken curry (3 neer dosa)', ['neer dosa kori', 'neer dose chicken', 'neer dosa chicken sukka'],
    [x(3, c(45, rice(20), coconut(3), water(30))), c(150, chicken(70), coconut(15), onion(30), tomato(15), coconutOil(8), water(25))], '1 plate'),
  plate('idiyappam-stew', 'Idiyappam with vegetable stew (3 idiyappam)', ['idiyappam stew', 'string hoppers stew', 'nool puttu stew'],
    [x(3, c(35, riceFlour(15), water(22))), VEG_STEW], '1 plate'),
  plate('ghee-rice-chicken-curry', 'Ghee rice with chicken curry', ['ghee rice chicken', 'neichoru chicken curry', 'ghee rice kori'],
    [c(250, rice(80), ghee(12), onion(15), cashew(4), water(160)), KERALA_CHICKEN], '1 plate'),
  plate('egg-white-dosa', 'Egg white dosa (2 whites)', ['egg white dose', 'protein dosa egg', 'egg dosa diet'],
    [DOSA, c(60, eggWhite(66))], '1 dosa'),
  r('mushroom-soup-light', 'Mushroom soup, light (skim milk)', ['cream of mushroom light', 'diet mushroom soup'],
    [mushroom(250), onion(40), skimMilk(150), butter(5), cornflour(8), water(200)], 600, [piece('1 bowl (250 ml)', 250)]),
  r('masoor-dal-chilla', 'Masoor dal chilla', ['masoor chilla', 'red lentil chilla', 'lentil pancake'],
    [masoor(60), water(60), onion(20), oil(4)], 140, [piece('1 chilla', 70)]),
  r('low-oil-mutton-curry', 'Mutton curry, low oil (2 tsp per pot)', ['diet mutton curry', 'mutton curry less oil'],
    [goat(500), onion(150), tomato(120), curd(60), oil(10), water(200)], 850, [KATORI]),
  r('low-oil-veg-pulao', 'Veg pulao, low oil', ['diet pulao', 'pulao less oil'],
    [rice(150), peas(50), carrot(50), beans(40), oil(5), water(400)], 650, [PLATE]),
  r('atta-veg-momos', 'Whole wheat veg momos (steamed)', ['atta momos', 'wheat momos', 'healthy momos'],
    [atta(100), water(50), cabbage(150), carrot(50), onion(40), oil(3)], 380, [piece('1 plate (6 momos)', 150)]),
  r('kuttu-dosa', 'Kuttu dosa with aloo (vrat)', ['buckwheat dosa', 'kuttu dosa', 'vrat masala dosa'],
    [kuttu(50), water(70), ghee(4), potato(60)], 170, [piece('1 dosa', 170)]),
  r('jain-paneer-tikka', 'Jain paneer tikka (no onion)', ['jain paneer tikka', 'paneer tikka without onion'],
    [paneer(250), curd(60), capsicum(80), oil(10)], 360, [piece('1 plate (6 pieces)', 150)]),
  // ───────────── More everyday combos ─────────────
  plate('2-roti-bhindi', '2 roti + bhindi', ['bhindi roti', 'chapati bhindi', 'roti bhindi sabzi'],
    [x(2, ROTI), BHINDI], '1 plate'),
  plate('2-roti-lauki', '2 roti + lauki sabzi', ['lauki roti', 'chapati lauki', 'ghiya roti'],
    [x(2, ROTI), LAUKI], '1 plate'),
  plate('2-roti-baingan-bharta', '2 roti + baingan bharta', ['bharta roti', 'baingan bharta chapati'],
    [x(2, ROTI), BAINGAN], '1 plate'),
  plate('2-roti-kadai-paneer', '2 roti + kadai paneer', ['kadai paneer roti', 'chapati kadai paneer'],
    [x(2, ROTI), KADAI_PANEER], '1 plate'),
  plate('2-roti-chana-dal', '2 roti + chana dal (with lauki)', ['chana dal roti', 'chapati chana dal'],
    [x(2, ROTI), CHANA_DAL], '1 plate'),
  plate('2-roti-moong-dal', '2 roti + moong dal', ['moong dal roti', 'chapati moong dal'],
    [x(2, ROTI), c(150, moong(22), tomato(10), ghee(3), water(130))], '1 plate'),
  plate('2-roti-butter-chicken', '2 roti + butter chicken', ['butter chicken roti', 'butter chicken chapati'],
    [x(2, ROTI), BUTTER_CHICKEN], '1 plate'),
  plate('2-roti-keema', '2 roti + mutton keema matar', ['keema roti', 'keema chapati'],
    [x(2, ROTI), KEEMA], '1 plate'),
  plate('2-roti-mix-veg-gravy', '2 roti + mix veg curry', ['mix veg roti', 'chapati mix veg'],
    [x(2, ROTI), c(150, potato(30), carrot(20), beans(20), peas(20), cauliflower(20), onion(15), tomato(25), oil(8), cream(5), water(20))], '1 plate'),
  plate('2-roti-omelette', '2 roti + 2-egg omelette', ['omelette roti', 'anda roti', 'egg omelette chapati'],
    [x(2, ROTI), c(110, egg(100), onion(15), oil(4))], '1 plate'),
  plate('roti-ghee-gur', 'Roti with ghee and gur (2 roti)', ['roti ghee gur', 'roti gud ghee', 'churi', 'gud roti'],
    [x(2, ROTI), c(10, ghee(10)), c(20, jaggery(20))], '1 plate'),
  plate('chicken-curry-paratha', '2 paratha + chicken curry', ['chicken paratha', 'paratha chicken curry dhaba'],
    [x(2, PARATHA), CHICKEN_CURRY], '1 plate'),
  plate('shrikhand-puri', 'Shrikhand puri with batata bhaji', ['shrikhand puri', 'shrikhand poori', 'gudi padwa plate'],
    [x(4, PURI), c(100, hungCurd(75), sugar(25)), BATATA_BHAJI], '1 plate'),
  plate('gujarati-home-meal', 'Gujarati home meal (3 rotli, dal, bhaat, shaak)', ['dal bhaat rotli shaak', 'gujarati ghar nu jaman', 'gujarati daily meal'],
    [x(3, c(32, atta(22), water(15), ghee(2))), GUJ_DAL, RICE(150), x(0.8, ALOO_DRY), x(0.5, KACHUMBER)], '1 plate'),
  plate('pithla-bhaat', 'Pithla bhaat', ['pithla bhat', 'pitla bhaat', 'pithla rice'],
    [c(150, besan(25), onion(20), oil(8), water(110)), RICE(200)], '1 plate'),
  plate('kuttu-puri-aloo-plate', 'Kuttu puri with vrat aloo and curd (plate)', ['kuttu puri aloo', 'vrat puri sabzi', 'navratri puri aloo'],
    [x(3, c(30, kuttu(18), water(10), oil(6))), JEERA_ALOO_DRY, CURD], '1 plate'),
  r('bajra-raab', 'Bajra raab (millet porridge with jaggery and ghee)', ['bajri nu raab', 'bajra rab gud ghee', 'gujarati raab'],
    [bajra(30), jaggery(20), ghee(10), water(250)], 280, [CUP]),
  r('jain-paneer-bhurji', 'Jain paneer bhurji (no onion)', ['jain bhurji', 'paneer bhurji without onion'],
    [paneer(200), tomato(80), capsicum(50), oil(10)], 300, [KATORI]),
  r('jain-pulao', 'Jain veg pulao (no onion, potato, carrot)', ['jain pulao', 'pulao without onion'],
    [rice(150), peas(60), beans(40), ghee(15), water(330)], 560, [PLATE]),
  r('jain-bhindi', 'Jain bhindi (no onion)', ['jain bhindi masala', 'bhindi without onion'],
    [okra(400), tomato(50), oil(20)], 340, [piece('1 small bowl (100 g)', 100)]),
  r('jain-palak-paneer', 'Jain palak paneer (no onion, garlic)', ['palak paneer without onion garlic', 'jain palak paneer'],
    [paneer(200), spinach(400), tomato(60), oil(15), cream(20)], 620, [KATORI]),
  r('jain-matar-paneer', 'Jain matar paneer', ['matar paneer without onion garlic', 'jain mutter paneer'],
    [paneer(200), peas(150), tomato(250), cashew(20), oil(20), water(100)], 650, [KATORI]),
  r('jain-masala-dosa', 'Jain masala dosa (raw banana masala)', ['jain dosa', 'masala dosa without potato onion'],
    [rice(25), urad(8), water(45), oil(5), rawBanana(70), oil(3)], 140, [piece('1 dosa', 140)]),
  r('low-oil-kadai-paneer', 'Kadai paneer, low oil', ['diet kadai paneer', 'kadai paneer less oil'],
    [paneer(200), capsicum(150), onion(100), tomato(150), oil(8)], 520, [KATORI]),
  r('protein-pancake', 'Oats banana egg pancake (protein pancake)', ['protein pancake', 'banana oats pancake', 'oats egg pancake'],
    [oats(40), banana(60), egg(50), eggWhite(33), oil(2)], 180, [piece('1 serving (2 pancakes)', 180)]),
  r('air-fryer-sprouts-tikki', 'Moong sprouts tikki (air fryer)', ['sprouts tikki', 'sprouts cutlet', 'moong sprouts kebab'],
    [sprouts(200), besan(30), onion(40), oil(4)], 230, [piece('1 tikki', 45)]),
  r('air-fryer-rajma-tikki', 'Rajma tikki (air fryer)', ['rajma kebab', 'rajma cutlet', 'kidney bean tikki'],
    [rajma(100), water(120), potato(50), bread(20), oil(4)], 270, [piece('1 tikki', 45)]),
  r('hung-curd-sandwich', 'Hung curd sandwich (brown bread)', ['curd sandwich', 'dahi sandwich', 'hung curd veg sandwich'],
    [brownBread(60), hungCurd(50), cucumber(20), carrot(20), capsicum(10)], 160, [piece('1 sandwich', 160)]),
  r('egg-white-sandwich', 'Egg white sandwich (brown bread)', ['egg white toast sandwich', 'protein sandwich egg'],
    [brownBread(60), eggWhite(99), onion(10)], 150, [piece('1 sandwich', 150)]),
  r('protein-shrikhand', 'Protein shrikhand (Greek yogurt, less sugar)', ['greek yogurt shrikhand', 'high protein shrikhand', 'diet shrikhand'],
    [greekYogurt(200), almond(5), sugar(10)], 210, [piece('1 bowl (100 g)', 100)]),
]
