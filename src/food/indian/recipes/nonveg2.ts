// More Indian non-vegetarian dishes, region by region (wave 2).
// Written by a recipe worker; see docs/indian-food-database.md.
//
// Conventions used here:
// - Meat, fish and seafood weights are the edible raw part (no bones, shells
//   or heads). Bone-in dishes give portions as the edible part.
// - Deep-fried items list only the oil absorbed.
// - Each recipe states a yield (cooked weight / raw weight); the cooked
//   weight is the raw total times that yield, rounded. Typical yields:
//   gravy curries 0.8-0.85, dry fries and roasts 0.65-0.72, grills 0.72-0.75,
//   rice dishes with their cooking water 0.9.
// - Indian fish and seafood use the closest USDA species, noted below.

import type { Portion } from '../../types'
import type { RecipeIngredient } from '../../recipe'
import { CUP, GLASS, KATORI, PLATE, ing, piece, r, usdaIng, type IndianRecipe } from '../define'

const n = (key: string) => (g: number) => ing(key, g)
const u = (id: number) => (g: number) => usdaIng(id, g)

/** A recipe whose cooked weight is its raw weight times `yieldFactor`. */
const d = (key: string, name: string, aliases: string[], ings: RecipeIngredient[], yieldFactor: number, portions: Portion[]): IndianRecipe =>
  r(key, name, aliases, ings, Math.round(ings.reduce((s, i) => s + i.grams, 0) * yieldFactor), portions)

// --- catalogue ---
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
const okra = n('okra')
const sugar = n('sugar')
const jaggery = n('jaggery')
const water = n('water')
const rice = n('rice')
const atta = n('atta')
const sooji = n('sooji')
const besan = n('besan')
const toorDal = n('toor-dal')
const moongDal = n('moong-dal')
const masoorDal = n('masoor-dal')
const uradDal = n('urad-dal')
const chana = n('chana') // chickpeas: same seed as chana dal, near-identical macros
const methi = n('methi-leaves')
const gongura = n('south-gongura')
const roastedGram = n('south-roasted-gram')
const rawJackfruit = n('north-raw-jackfruit')
const bombil = n('nonveg2-bombil')
const driedBombil = n('nonveg2-dried-bombil')
const driedPrawns = n('nonveg2-dried-prawns')
const ngari = n('nonveg2-ngari')
const trotters = n('nonveg2-goat-trotters')

// --- meat and offal (USDA SR Legacy) ---
const breast = u(171077) // Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw
const legMeat = u(173619) // Chicken, broilers or fryers, leg, meat only, raw
const wingSkin = u(172390) // Chicken, broilers or fryers, wing, meat and skin, raw
const chickenMince = u(171116) // Chicken, ground, raw
const countryChicken = u(172402) // Chicken, stewing, meat only, raw (desi / natu kodi)
const gizzard = u(171456) // Chicken, gizzard, all classes, raw
const quail = u(172419) // Quail, meat only, raw
const duck = u(172410) // Duck, domesticated, meat only, raw
const goat = u(175303) // Game meat, goat, raw (Indian "mutton"; also its keema)
const lambMince = u(174370) // Lamb, ground, raw (fatty mince for kebabs and rista)
const lambRib = u(174321) // Lamb, rib, lean and fat, raw (fatty ribs)
const lambRibLean = u(172493) // Lamb, rib, lean only, raw (chops; most rendered fat drains off)
const liver = u(172531) // Lamb, variety meats, liver, raw
const kidney = u(174354) // Lamb, variety meats, kidneys, raw
const heart = u(172527) // Lamb, variety meats, heart, raw
const tongue = u(174366) // Lamb, variety meats, tongue, raw
const lungs = u(174359) // Lamb, variety meats, lungs, raw
const tripe = u(170599) // Beef, variety meats, tripe, raw (stands for goat boti / ojri)
const beef = u(171206) // Beef, chuck for stew, lean and fat, raw
const porkShoulder = u(167843) // Pork, fresh, shoulder, whole, lean and fat, raw
const porkBelly = u(167812) // Pork, fresh, belly, raw
const chorizo = u(173859) // Sausage, pork, chorizo, raw (Goan chouris)

// --- fish and seafood (closest USDA species) ---
const rohu = u(171952) // Fish, carp, raw (rohu, katla, Kashmiri gaad)
const hilsa = u(173696) // Fish, shad, american, raw (hilsa is a shad)
const pomfret = u(173682) // Fish, pompano, florida, raw
const surmai = u(175122) // Fish, mackerel, king, raw (seer / kingfish / neymeen / anjal)
const bangda = u(173673) // Fish, mackerel, spanish, raw (Indian mackerel / ayala)
const sardine = u(175116) // Fish, herring, Atlantic, raw (oil sardine / mathi, same family)
const anchovy = u(174182) // Fish, anchovy, european, raw (netholi / nethili)
const catfish = u(174186) // Fish, catfish, channel, wild, raw (basa, tangra, pabda)
const tilapia = u(175176) // Fish, tilapia, raw (karimeen / pearl spot, also a cichlid)
const seaBass = u(175142) // Fish, sea bass, mixed species, raw (bhetki / barramundi)
const perch = u(173678) // Fish, perch, mixed species, raw (koi / climbing perch)
const smelt = u(175146) // Fish, smelt, rainbow, raw (mourala and other small fish)
const whiting = u(173713) // Fish, whiting, raw (kane / ladyfish, a lean white sea fish)
const shark = u(173697) // Fish, shark, mixed species, raw (mori / sura)
const tuna = u(175156) // Fish, tuna, fresh, skipjack, raw (choora)
const cannedTuna = u(173708) // Fish, tuna, light, canned in oil, drained solids
const roe = u(175132) // Fish, roe, mixed species, raw
const driedFish = u(174190) // Fish, cod, Atlantic, dried and salted (stands for karuvadu / shutki)
const prawn = u(175179) // Crustaceans, shrimp, raw
const crab = u(174204) // Crustaceans, crab, blue, raw
const lobster = u(174208) // Crustaceans, lobster, northern, raw
const mussel = u(174216) // Mollusks, mussel, blue, raw (kallummakkaya / kadukka)

// --- eggs and dairy ---
const duckEgg = u(172189) // Egg, duck, whole, raw
const cream = u(170858) // Cream, light whipping (Indian "fresh cream")
const butter = u(173410) // Butter, salted
const cheese = u(171290) // Processed cheese
const greekCurd = u(171304) // Yogurt, Greek, plain, whole milk (hung curd)

// --- nuts, seeds, coconut ---
const cashew = u(170162)
const almond = u(170567)
const raisin = u(168165)
const apricot = u(173941) // Apricots, dried (jardaloo)
const coconut = u(170169) // fresh grated coconut
const dryCoconut = u(170170) // desiccated / dry copra
const coconutMilk = u(170172)
const sesame = u(170150) // also black sesame (Khasi)
const poppy = u(171330) // posto / khus khus
const mustardSeed = u(170929) // ground mustard (shorshe bata)

// --- grains, breads ---
const maida = u(169761) // Wheat flour, white, all-purpose
const riceFlour = u(169714)
const cornstarch = u(169698)
const bulgur = u(170688) // broken wheat (dalia) for haleem and khichda
const pasta = u(169736) // macaroni
const eggNoodles = u(169755) // thukpa noodles
const bread = u(174924) // white bread, also for bread crumbs
const pav = u(172793) // Rolls, dinner, plain (pav / pao)

// --- vegetables, fruit, sauces ---
const garlic = u(169230)
const ginger = u(169231)
const greenChilli = u(170497)
const chilliPowder = u(171319) // only where a dish uses a lot (10 g or more)
const pepper = u(170931) // black pepper, only where a dish uses a lot
const lemon = u(167747)
const tamarind = u(167763)
const coriander = u(169997)
const mint = u(173475)
const shallot = u(170499)
const capsicum = u(170427)
const cabbage = u(169975)
const peas = u(170419)
const brinjal = u(169228)
const drumstick = u(170483)
const lauki = u(169232) // bottle gourd
const ashGourd = u(170069)
const pumpkin = u(168448)
const taro = u(169308) // arbi / colocasia root
const taroLeaves = u(168487) // kochu pata
const turnip = u(170465) // shalgam / gogji
const lotusRoot = u(169250) // nadru / kamal kakdi
const mustardGreens = u(169256) // lai xaak / sarson
const bambooShoot = u(169210)
const cassava = u(169985) // kappa / tapioca
const rawMango = u(169910) // Mangos, raw (stands for raw mango)
const soy = u(174277)
const vinegar = u(172237)
const ketchup = u(168556)
const chilliSauce = u(171186)
const mayo = u(171009)
const coconutOil = u(171412)
const mustardOil = u(172337)
const sesameOil = u(171016)

/** Ginger-garlic paste. */
const gg = (g: number) => [garlic(g / 2), ginger(g / 2)]

const SERVE = piece('1 serving (100 g)', 100)
const BIRYANI = piece('1 restaurant plate (400 g)', 400)
const CUTLET = piece('1 cutlet (50 g)', 50)
const TBSP = piece('1 tbsp (20 g)', 20)

// Common yields
const CURRY = 0.82
const DRY = 0.68
const GRILL = 0.74
const FRIED = 0.8
const RICE = 0.9

// ------------------------------------------------------------------ KERALA AND MALABAR
const KERALA: IndianRecipe[] = [
  d('nadan-kozhi-curry', 'Nadan kozhi curry (Kerala chicken curry)', ['nadan chicken curry', 'kerala chicken curry', 'kozhi curry', 'naadan kozhi curry'],
    [chicken(500), onion(200), shallot(60), tomato(120), coconutOil(40), coconutMilk(200), ...gg(20), water(200)], CURRY, [KATORI]),
  d('chicken-varutharacha-curry', 'Chicken varutharacha curry (roasted coconut)', ['varutharacha kozhi curry', 'roasted coconut chicken curry', 'chicken varutharachathu'],
    [chicken(500), coconut(150), shallot(100), onion(100), tomato(100), coconutOil(40), ...gg(20), water(300)], 0.8, [KATORI]),
  d('pepper-chicken', 'Pepper chicken (Kerala / Chettinad style)', ['chicken pepper fry', 'kurumulaku chicken', 'milagu kozhi varuval', 'chettinad pepper chicken', 'kozhi kurumulakittathu'],
    [chicken(500), onion(200), coconutOil(45), pepper(15), ...gg(20), water(80)], 0.7, [SERVE]),
  d('chicken-mappas', 'Chicken mappas (coconut milk curry)', ['kozhi mappas', 'chicken mappas', 'syrian christian chicken curry'],
    [chicken(500), onion(200), tomato(80), coconutMilk(400), coconutOil(35), ...gg(20)], 0.85, [KATORI]),
  d('kerala-chicken-kurma', 'Kerala chicken kurma (coconut-cashew)', ['kozhi kurma', 'chicken kurma kerala', 'white chicken kurma'],
    [chicken(500), onion(200), tomato(80), coconut(100), cashew(25), coconutOil(35), ...gg(20), water(250)], CURRY, [KATORI]),
  d('kozhi-porichathu', 'Kozhi porichathu (Kerala fried chicken)', ['kerala fried chicken', 'kerala chicken fry', 'nadan chicken fry', 'kozhi varuthathu'],
    [legMeat(600), riceFlour(20), cornstarch(10), lemon(10), ...gg(20), oil(45)], 0.75, [SERVE]),
  d('chicken-kondattam', 'Chicken kondattam', ['kozhi kondattam', 'chicken kondattam kerala'],
    [breast(500), cornstarch(15), oil(50), onion(100), coconutOil(20), chilliPowder(10), ...gg(15)], 0.72, [SERVE]),
  d('mutton-varutharacha-curry', 'Mutton varutharacha curry', ['aattirachi varutharacha', 'mutton roasted coconut curry', 'varutharacha mutton'],
    [goat(500), coconut(150), onion(150), shallot(80), tomato(100), coconutOil(40), ...gg(20), water(400)], 0.78, [KATORI]),
  d('mutton-ularthiyathu', 'Mutton ularthiyathu (Kerala mutton roast)', ['kerala mutton roast', 'nadan mutton roast', 'mutton ularthu', 'mutton olathiyathu'],
    [goat(500), shallot(150), onion(100), coconut(50), coconutOil(45), ...gg(25), water(150)], 0.65, [SERVE]),
  d('beef-varutharacha-curry', 'Beef varutharacha curry', ['beef roasted coconut curry', 'nadan beef varutharacha', 'erachi curry'],
    [beef(500), coconut(150), onion(200), tomato(100), coconutOil(40), ...gg(20), water(400)], 0.8, [KATORI]),
  d('kappa-biryani', 'Kappa biryani (tapioca and beef)', ['ellum kappayum', 'kappa erachi', 'tapioca beef biryani', 'kappa and beef', 'kappa irachi'],
    [cassava(600), beef(400), onion(150), tomato(80), coconut(60), coconutOil(40), ...gg(20), water(200)], 0.85, [PLATE]),
  d('beef-chilli-fry', 'Beef chilli fry (Kerala)', ['chilli beef', 'beef chilli', 'kerala beef chilli'],
    [beef(500), onion(200), capsicum(100), greenChilli(20), soy(20), coconutOil(40), ...gg(20)], DRY, [SERVE]),
  d('beef-biryani', 'Beef biryani', ['beef dum biryani', 'kerala beef biryani', 'erachi biryani'],
    [beef(500), rice(500), onion(300), tomato(100), curd(80), oil(30), ghee(40), ...gg(20), water(900)], RICE, [BIRYANI, PLATE]),
  d('beef-cutlet', 'Beef cutlet (Kerala)', ['kerala beef cutlet', 'beef cutlets', 'erachi cutlet'],
    [beef(300), potato(300), onion(100), oil(15), egg(50), bread(60), oil(40)], 0.78, [CUTLET]),
  d('chicken-cutlet', 'Chicken cutlet', ['chicken cutlets', 'kerala chicken cutlet', 'kolkata chicken cutlet', 'murgh cutlet'],
    [chicken(300), potato(300), onion(100), oil(15), egg(50), bread(60), oil(40)], 0.78, [CUTLET]),
  d('karimeen-pollichathu', 'Karimeen pollichathu (pearl spot in banana leaf)', ['meen pollichathu', 'pearl spot pollichathu', 'fish pollichathu', 'kerala fish in banana leaf'],
    [tilapia(500), onion(150), shallot(80), tomato(100), coconutOil(50), lemon(10), ...gg(20)], 0.72, [piece('1 fish in leaf, edible part (180 g)', 180)]),
  d('karimeen-fry', 'Karimeen fry (pearl spot)', ['karimeen porichathu', 'pearl spot fry', 'karimeen varuthathu'],
    [tilapia(500), riceFlour(10), lemon(10), coconutOil(50), ...gg(15)], 0.72, [piece('1 fish, edible part (120 g)', 120)]),
  d('meen-mappas', 'Meen mappas (fish in coconut milk)', ['fish mappas', 'kerala fish mappas'],
    [surmai(500), onion(200), tomato(100), coconutMilk(400), coconutOil(35), ...gg(20)], 0.85, [KATORI]),
  d('meen-manga-curry', 'Meen manga curry (fish with raw mango)', ['fish mango curry', 'malabar fish curry with mango', 'ayala manga curry', 'manga meen curry'],
    [bangda(500), rawMango(150), coconut(150), shallot(50), coconutOil(25), water(300)], 0.85, [KATORI]),
  d('meen-roast', 'Meen roast (Kerala fish roast)', ['kerala fish roast', 'fish roast', 'neymeen roast'],
    [surmai(500), onion(300), tomato(100), coconutOil(50), ...gg(20)], 0.7, [SERVE]),
  d('fish-pepper-fry', 'Fish pepper fry', ['meen kurumulaku', 'pepper fish fry', 'meen milagu varuval'],
    [surmai(500), onion(150), pepper(15), coconutOil(45), ...gg(15)], 0.7, [SERVE]),
  d('netholi-peera', 'Netholi peera (anchovy with coconut)', ['nethili peera', 'anchovy peera', 'kozhuva peera', 'meen peera'],
    [anchovy(500), coconut(150), shallot(80), greenChilli(15), coconutOil(20)], 0.72, [SERVE]),
  d('mathi-curry', 'Mathi curry (sardine curry)', ['mathi mulakittathu', 'sardine curry', 'chaala curry', 'mathi pattichathu', 'tarle curry'],
    [sardine(500), shallot(100), tomato(100), coconutOil(30), ...gg(15), water(300)], CURRY, [KATORI]),
  d('ayala-curry', 'Ayala curry (Kerala mackerel coconut curry)', ['ayala thenga curry', 'mackerel curry kerala', 'ayala meen curry'],
    [bangda(500), coconut(150), shallot(50), tomato(80), coconutOil(25), water(300)], 0.85, [KATORI]),
  d('choora-curry', 'Choora curry (tuna curry)', ['tuna curry kerala', 'choora meen curry', 'kera curry', 'choora mulakittathu'],
    [tuna(500), coconut(150), shallot(80), tamarind(15), coconutOil(30), water(300)], 0.85, [KATORI]),
  d('chemmeen-manga-curry', 'Chemmeen manga curry (prawns with raw mango)', ['prawn mango curry', 'chemmeen thenga curry', 'konju manga curry'],
    [prawn(500), rawMango(120), coconut(150), shallot(60), coconutOil(25), water(250)], 0.85, [KATORI]),
  d('prawn-pepper-fry', 'Prawn pepper fry', ['chemmeen kurumulaku', 'eral milagu varuval', 'pepper prawns'],
    [prawn(500), onion(150), pepper(15), coconutOil(40), ...gg(15)], 0.7, [SERVE]),
  d('kallummakkaya-fry', 'Kallummakkaya fry (mussel fry)', ['mussel fry', 'kadukka fry', 'kallummakkaya roast', 'mussels masala fry', 'kadukka roast'],
    [mussel(500), onion(100), chilliPowder(10), coconutOil(45), ...gg(15)], 0.7, [SERVE]),
  d('arikkadukka', 'Arikkadukka (Malabar stuffed mussels)', ['stuffed mussels', 'kallummakkaya nirachathu', 'ari kadukka', 'arikadukka'],
    [mussel(300), riceFlour(200), coconut(80), shallot(40), water(120), oil(50)], FRIED, [piece('1 stuffed mussel (30 g)', 30)]),
  d('mutta-thoran', 'Mutta thoran (egg with coconut)', ['egg thoran', 'egg podimas', 'muttai podimas', 'egg scramble kerala'],
    [egg(300), coconut(60), shallot(60), greenChilli(10), coconutOil(15)], 0.85, [SERVE]),
  d('mutta-curry', 'Mutta curry (Kerala egg curry with coconut milk)', ['nadan mutta curry', 'egg curry kerala', 'kerala egg curry'],
    [egg(600), onion(250), tomato(100), coconutMilk(250), coconutOil(35), ...gg(15)], 0.85, [piece('2 eggs with gravy (180 g)', 180)]),
  d('erachi-pathiri', 'Erachi pathiri (Malabar meat-filled pathiri)', ['irachi pathiri', 'meat pathiri', 'chicken pathiri fried', 'malabar erachi pathiri'],
    [maida(300), water(150), chicken(300), onion(200), oil(30), egg(50), oil(60)], FRIED, [piece('1 pathiri (80 g)', 80)]),
  d('chatti-pathiri', 'Chatti pathiri (Malabar layered chicken pathiri)', ['malabar chatti pathiri', 'layered pathiri', 'chicken chatti pathiri'],
    [maida(250), egg(300), milk(100), water(100), chicken(300), onion(200), oil(30), ghee(40)], 0.85, [piece('1 slice (120 g)', 120)]),
  d('mutton-biryani-malabar', 'Malabar / Thalassery mutton biryani', ['thalassery mutton biryani', 'malabar mutton biryani', 'kozhikode mutton biryani'],
    [goat(500), rice(500), onion(300), tomato(100), curd(80), ghee(70), oil(30), cashew(20), raisin(20), ...gg(25), water(800)], RICE, [BIRYANI, PLATE]),
  d('alfaham-chicken', 'Alfaham chicken (Arabic grilled chicken)', ['al faham', 'alfaham', 'alfahm chicken', 'arabic grilled chicken'],
    [legMeat(600), curd(60), u(170459)(20), oil(25), lemon(15), ...gg(20)], 0.75, [piece('Quarter alfaham, edible part (150 g)', 150)]),
  d('chicken-mandi', 'Chicken mandi (kuzhimandi)', ['kuzhimandi', 'chicken kuzhimanthi', 'mandi rice', 'arabic mandi'],
    [legMeat(600), rice(500), onion(100), tomato(80), ghee(40), oil(20), ...gg(15), water(900)], RICE, [BIRYANI]),
  d('mutton-mandi', 'Mutton mandi', ['mutton kuzhimandi', 'lamb mandi', 'mandi mutton'],
    [goat(600), rice(500), onion(100), tomato(80), ghee(40), oil(20), ...gg(15), water(900)], RICE, [BIRYANI]),
  d('kerala-pork-fry', 'Kerala pork fry (pork ularthiyathu)', ['pork ularthiyathu', 'pork roast kerala', 'pandi irachi fry', 'kerala pork roast'],
    [porkShoulder(500), shallot(100), onion(100), coconut(40), coconutOil(25), vinegar(15), ...gg(20), water(100)], DRY, [SERVE]),
]

// ------------------------------------------------------------------ MANGALOREAN, COASTAL KARNATAKA, COORG
const MANGALORE: IndianRecipe[] = [
  d('kori-gassi', 'Kori gassi (Mangalorean chicken curry)', ['kori gassi', 'koli gassi', 'mangalorean chicken curry', 'kori rotti curry'],
    [chicken(500), coconut(200), onion(150), tomato(60), coconutMilk(100), oil(35), ...gg(15), water(250)], CURRY, [KATORI]),
  d('kundapur-koli-saaru', 'Kundapur koli saaru (chicken curry)', ['kundapura koli saaru', 'kundapur chicken curry', 'koli saaru'],
    [chicken(500), coconut(180), onion(150), oil(30), ghee(10), water(350)], CURRY, [KATORI]),
  d('mutton-ghee-roast', 'Mutton ghee roast (Mangalorean)', ['mangalorean mutton ghee roast', 'mutton ghee roast'],
    [goat(500), ghee(80), curd(50), chilliPowder(15), ...gg(20), water(150)], DRY, [SERVE]),
  d('prawn-ghee-roast', 'Prawn ghee roast (Mangalorean)', ['prawns ghee roast', 'mangalorean prawn ghee roast', 'yetti ghee roast'],
    [prawn(500), ghee(70), curd(40), chilliPowder(12), lemon(10), ...gg(20)], 0.72, [SERVE]),
  d('egg-ghee-roast', 'Egg ghee roast', ['mangalorean egg ghee roast', 'mutta ghee roast'],
    [egg(600), onion(150), ghee(60), curd(40), chilliPowder(10), ...gg(15)], 0.85, [piece('2 eggs with masala (130 g)', 130)]),
  d('meen-gassi', 'Meen gassi (Mangalorean fish curry)', ['fish gassi', 'mangalorean fish curry', 'meen kodi', 'meenu gassi'],
    [surmai(500), coconut(200), onion(100), tamarind(15), oil(25), water(300)], 0.85, [KATORI]),
  d('bangude-puli-munchi', 'Bangude puli munchi (mackerel in tamarind)', ['bangude pulimunchi', 'mackerel puli munchi', 'bangda puli munchi'],
    [bangda(500), tamarind(30), chilliPowder(15), oil(30), water(200)], 0.8, [KATORI]),
  d('kane-fry', 'Kane fry (ladyfish rava fry)', ['kane rava fry', 'ladyfish fry', 'muddoshi fry', 'kane masala fry'],
    [whiting(500), sooji(60), riceFlour(20), ...gg(15), oil(50)], 0.75, [piece('1 fish, edible part (90 g)', 90)]),
  d('pork-bafat', 'Pork bafat (Mangalorean)', ['mangalorean pork bafat', 'dukra maas', 'pork bafath'],
    [porkShoulder(500), onion(200), vinegar(30), chilliPowder(15), oil(20), ...gg(20), water(200)], 0.75, [KATORI]),
  d('pork-indad', 'Pork indad (Mangalorean)', ['mangalorean pork indad', 'pork indaad'],
    [porkShoulder(500), onion(300), vinegar(40), sugar(10), oil(25), ...gg(20), water(150)], 0.75, [KATORI]),
  d('crab-sukka', 'Crab sukka (crab with dry coconut)', ['kurlyo sukka', 'kekda sukka', 'crab dry coconut', 'denji sukka'],
    [crab(500), coconut(180), onion(100), oil(25), ghee(10), water(100)], 0.72, [SERVE]),
  d('coorg-koli-curry', 'Coorg koli curry (Kodava chicken)', ['kodava chicken curry', 'coorg chicken curry', 'koli curry coorg'],
    [chicken(500), onion(200), tomato(80), coconut(80), oil(35), ...gg(15), water(250)], CURRY, [KATORI]),
]

// ------------------------------------------------------------------ GOAN AND KONKANI
const GOAN: IndianRecipe[] = [
  d('prawn-balchao', 'Prawn balchao (Goan)', ['camarao balchao', 'balchao', 'goan prawn pickle'],
    [prawn(500), onion(200), tomato(100), vinegar(50), sugar(15), chilliPowder(15), oil(60), ...gg(20)], 0.72, [SERVE, TBSP]),
  d('mackerel-recheado', 'Mackerel recheado (Goan stuffed mackerel)', ['bangda recheado', 'recheado fish', 'goan stuffed mackerel', 'recheado bangda'],
    [bangda(500), vinegar(30), onion(30), chilliPowder(15), sugar(5), ...gg(15), oil(50)], 0.72, [piece('1 mackerel, edible part (120 g)', 120)]),
  d('ambot-tik', 'Ambot tik (Goan sour shark curry)', ['shark ambot tik', 'mori ambot tik', 'goan sour curry', 'ambotik'],
    [shark(500), onion(150), tomato(80), tamarind(25), vinegar(20), oil(30), water(300)], CURRY, [KATORI]),
  d('goan-sausage-pulao', 'Goan sausage pulao (chorizo pulao)', ['chorizo pulao', 'goan choris pulao', 'goa sausage rice'],
    [chorizo(250), rice(400), onion(150), potato(150), oil(15), water(800)], RICE, [PLATE]),
  d('goan-sausage-chilli-fry', 'Goan sausage chilli fry', ['chorizo chilli fry', 'choris chilli fry', 'goa sausage fry'],
    [chorizo(400), onion(250), potato(200), capsicum(100), greenChilli(20), oil(10), water(100)], 0.78, [SERVE]),
  d('choris-pao', 'Choris pao (Goan sausage bread)', ['chorizo pao', 'sausage pav', 'choriz pao'],
    [chorizo(150), onion(60), oil(5), pav(120)], 0.9, [piece('1 choris pao (160 g)', 160)]),
  d('goan-beef-croquettes', 'Goan beef croquettes', ['beef croquettes', 'croquets goan', 'goan croquettes'],
    [beef(400), onion(80), bread(60), egg(50), oil(50)], 0.75, [piece('1 croquette (35 g)', 35)]),
  d('prawn-rissoles', 'Prawn rissois (Goan prawn rissoles)', ['goan prawn rissois', 'rissoles', 'prawn rissoles'],
    [maida(200), water(150), milk(300), butter(20), prawn(250), onion(80), egg(50), bread(40), oil(60)], FRIED, [piece('1 rissole (45 g)', 45)]),
  d('crab-xec-xec', 'Crab xec xec (Goan crab curry)', ['xec xec', 'crab shek shek', 'goan crab curry'],
    [crab(500), coconut(200), onion(150), tomato(60), oil(30), water(250)], CURRY, [KATORI]),
  d('fish-caldine', 'Fish caldine (Goan yellow fish curry)', ['caldin fish', 'fish caldinho', 'goan caldin fish', 'yellow fish curry goa'],
    [pomfret(500), coconutMilk(400), onion(150), vinegar(10), oil(25)], 0.88, [KATORI]),
  d('ros-omelette', 'Ros omelette (Goan omelette in chicken gravy)', ['ros omlet', 'goan ros omelette', 'chicken ros omelette'],
    [egg(300), chicken(300), coconut(120), onion(150), tomato(80), oil(40), water(250)], CURRY, [piece('1 ros omelette with gravy (250 g)', 250)]),
  d('goan-kismur', 'Kismur (Goan dried prawn salad)', ['kismur', 'sukhe sungte kismur', 'dried prawn kismur'],
    [driedPrawns(100), onion(150), coconut(100), tamarind(10), oil(15)], 0.9, [piece('1 serving (60 g)', 60)]),
  d('mutton-xacuti', 'Mutton xacuti (Goan)', ['shagoti mutton', 'goan mutton xacuti', 'xacuti mutton'],
    [goat(500), coconut(200), onion(150), poppy(10), oil(40), water(400)], 0.8, [KATORI]),
  d('goan-pork-roast', 'Goan pork roast', ['goan roast pork', 'porco assado', 'pork assado'],
    [porkShoulder(600), potato(200), onion(100), vinegar(40), garlic(20), oil(20)], 0.72, [SERVE]),
]

// ------------------------------------------------------------------ MALVANI AND MAHARASHTRIAN
const MAHARASHTRA: IndianRecipe[] = [
  d('malvani-chicken-curry', 'Malvani chicken curry (kombdi rassa)', ['kombdi rassa', 'malvani kombdi', 'malvani chicken', 'kombdi curry'],
    [chicken(500), dryCoconut(80), onion(200), tomato(60), chilliPowder(15), oil(45), ...gg(20), water(350)], CURRY, [KATORI]),
  d('kolhapuri-chicken', 'Kolhapuri chicken', ['chicken kolhapuri', 'kolhapuri chicken rassa', 'tambda rassa chicken'],
    [chicken(500), dryCoconut(60), onion(200), tomato(100), sesame(10), chilliPowder(15), oil(55), ...gg(20), water(300)], CURRY, [KATORI]),
  d('tambda-rassa', 'Tambda rassa (Kolhapuri red mutton)', ['kolhapuri mutton', 'mutton tambda rassa', 'red mutton rassa', 'kolhapuri mutton rassa'],
    [goat(500), dryCoconut(70), onion(200), chilliPowder(20), oil(60), ...gg(20), water(600)], 0.85, [KATORI]),
  d('pandhra-rassa', 'Pandhra rassa (Kolhapuri white mutton)', ['white mutton rassa', 'kolhapuri pandhra rassa', 'pandhra rassa'],
    [goat(400), coconutMilk(250), cashew(25), sesame(10), poppy(10), ghee(20), water(600)], 0.85, [KATORI]),
  d('saoji-chicken', 'Saoji chicken (Nagpur)', ['nagpuri saoji chicken', 'varhadi chicken', 'saoji chicken curry'],
    [chicken(500), onion(200), dryCoconut(60), poppy(10), chilliPowder(20), oil(80), ...gg(20), water(350)], CURRY, [KATORI]),
  d('saoji-mutton', 'Saoji mutton (Nagpur)', ['nagpuri mutton', 'varhadi mutton', 'saoji mutton curry'],
    [goat(500), onion(200), dryCoconut(60), poppy(10), chilliPowder(20), oil(90), ...gg(20), water(450)], CURRY, [KATORI]),
  d('bombil-fry', 'Bombil fry (Bombay duck)', ['bombay duck fry', 'bombil rava fry', 'bombli fry'],
    [bombil(500), sooji(60), riceFlour(20), ...gg(10), oil(60)], 0.65, [piece('2 bombil (90 g)', 90)]),
  d('sukha-bombil-masala', 'Sukha bombil masala (dried Bombay duck)', ['dried bombil fry', 'sukat bombil', 'sukhe bombil masala', 'dry bombil fry'],
    [driedBombil(150), onion(150), tomato(80), oil(40)], 0.85, [piece('1 serving (60 g)', 60)]),
  d('javla-chutney', 'Javla chutney (dried prawn chutney)', ['jawla chutney', 'sukat chutney', 'dried prawn chutney', 'kolim chutney', 'sode chutney'],
    [driedPrawns(100), dryCoconut(60), onion(80), tamarind(5), oil(20)], 0.9, [TBSP]),
  d('javla-bhaji', 'Javla bhaji (dried prawns with potato)', ['sukha javla', 'dried prawns masala', 'kolim bhaji', 'javla batata', 'sode bhaji'],
    [driedPrawns(150), onion(250), potato(200), tomato(100), oil(40), water(100)], 0.8, [SERVE]),
  d('kolambi-bhaat', 'Kolambi bhaat (Maharashtrian prawn rice)', ['kolambi bhat', 'prawn rice maharashtrian', 'kolambi pulao', 'koli prawn rice'],
    [prawn(300), rice(400), onion(150), tomato(100), dryCoconut(30), oil(40), ...gg(15), water(800)], RICE, [PLATE]),
  d('fish-koliwada', 'Fish koliwada (batter fried fish)', ['koliwada fish fry', 'fish koliwada'],
    [catfish(500), besan(60), riceFlour(20), lemon(10), ...gg(15), oil(60)], FRIED, [SERVE]),
  d('paplet-curry', 'Paplet curry (pomfret coconut curry)', ['pomfret curry', 'saranga curry', 'paplet kalvan', 'pomfret kalvan'],
    [pomfret(500), coconut(150), onion(100), tamarind(10), oil(30), water(300)], 0.85, [KATORI]),
  d('kheema-ghotala', 'Kheema ghotala (keema with eggs)', ['keema ghotala', 'anda keema ghotala', 'kheema anda ghotala'],
    [goat(300), egg(300), onion(150), tomato(100), butter(30), oil(20), ...gg(15)], CURRY, [SERVE]),
  d('anda-ghotala', 'Anda ghotala (Surti egg ghotala)', ['egg ghotala', 'surti ghotala', 'surti anda ghotala'],
    [egg(400), onion(150), tomato(100), butter(50), cheese(30)], 0.85, [SERVE]),
  d('keema-samosa', 'Keema samosa (mutton)', ['kheema samosa', 'mutton samosa', 'bohri samosa', 'irani keema samosa'],
    [maida(250), ghee(30), water(100), goat(250), onion(100), peas(50), oil(15), oil(70)], 0.85, [piece('1 samosa (50 g)', 50)]),
]

// ------------------------------------------------------------------ PARSI AND BOHRI
const PARSI_BOHRI: IndianRecipe[] = [
  d('mutton-dhansak', 'Mutton dhansak curry (Parsi, without rice)', ['gosht dhansak', 'dhansak curry', 'dhansak dal with mutton'],
    [goat(500), toorDal(150), masoorDal(50), moongDal(30), chana(30), pumpkin(150), brinjal(100), potato(80), methi(30), onion(150), tomato(100), ghee(30), oil(20), ...gg(20), water(1200)], 0.85, [KATORI]),
  d('chicken-dhansak', 'Chicken dhansak (Parsi)', ['murghi dhansak', 'parsi chicken dhansak'],
    [chicken(500), toorDal(150), masoorDal(50), moongDal(30), chana(30), pumpkin(150), brinjal(100), potato(80), methi(30), onion(150), tomato(100), ghee(30), oil(20), ...gg(20), water(1100)], 0.85, [KATORI]),
  d('patra-ni-machhi', 'Patra ni machhi (Parsi steamed fish)', ['patra ni machi', 'parsi steamed fish', 'patrani machhi', 'fish in banana leaf parsi'],
    [pomfret(500), coconut(120), coriander(40), mint(15), greenChilli(15), lemon(15), sugar(5), oil(10)], 0.8, [piece('1 fillet in leaf (100 g)', 100)]),
  d('sali-boti', 'Sali boti (Parsi mutton with potato straws)', ['salli boti', 'sali gosht', 'mutton with potato straws'],
    [goat(500), onion(250), tomato(200), jaggery(15), vinegar(15), oil(40), water(250), potato(150), oil(40)], 0.75, [KATORI]),
  d('sali-murghi', 'Sali murghi (Parsi chicken with potato straws)', ['salli murgh', 'sali chicken', 'sali marghi'],
    [chicken(500), onion(250), tomato(200), jaggery(15), vinegar(15), oil(40), water(200), potato(150), oil(40)], 0.75, [KATORI]),
  d('murghi-jardaloo', 'Jardaloo murghi (Parsi chicken with apricots)', ['jardaloo chicken', 'sali jardaloo murghi', 'apricot chicken parsi'],
    [chicken(500), apricot(100), onion(250), tomato(150), jaggery(20), vinegar(15), oil(40), water(200)], 0.78, [KATORI]),
  d('chicken-farcha', 'Chicken farcha (Parsi fried chicken)', ['parsi fried chicken', 'farcha', 'murghi na farcha'],
    [legMeat(600), egg(100), bread(60), ...gg(15), oil(50)], FRIED, [piece('1 piece, edible part (90 g)', 90)]),
  d('sali-par-eedu', 'Sali par eedu (eggs on potato straws)', ['sali par edu', 'sali pur eedu', 'eggs on potato straws'],
    [egg(300), potato(200), oil(50), onion(50), oil(10)], FRIED, [piece('1 serving, 2 eggs (130 g)', 130)]),
  d('papeta-par-eedu', 'Papeta par eedu (eggs on potatoes)', ['papeta pur eedu', 'papeta par edu', 'potato eggs parsi'],
    [potato(300), onion(100), oil(25), egg(300)], 0.85, [piece('1 serving, 2 eggs (180 g)', 180)]),
  d('tamota-par-eedu', 'Tamota par eedu (eggs on tomatoes)', ['tameta par eedu', 'tomato par eedu', 'eggs on tomato'],
    [tomato(400), onion(100), oil(25), sugar(10), egg(300)], 0.8, [piece('1 serving, 2 eggs (180 g)', 180)]),
  d('bheeda-par-eedu', 'Bheeda par eedu (eggs on okra)', ['bhinda par eedu', 'bheeda pur eedu', 'okra eggs parsi'],
    [okra(300), onion(80), oil(30), egg(300)], 0.82, [piece('1 serving, 2 eggs (160 g)', 160)]),
  d('kolmi-no-patio', 'Kolmi no patio (Parsi prawn patia)', ['kolmi nu patiyu', 'prawn patio', 'parsi prawn patia', 'patia'],
    [prawn(500), onion(250), tomato(250), jaggery(25), vinegar(20), oil(45), ...gg(20)], 0.75, [KATORI]),
  d('mutton-kheema-cutlet', 'Mutton kheema cutlet (Parsi / Anglo-Indian)', ['parsi cutlets', 'mutton cutlace', 'kheema cutlet', 'mince cutlets', 'mutton cutlet'],
    [goat(400), potato(150), onion(80), bread(50), egg(100), oil(50)], 0.78, [CUTLET]),
  d('parsi-pulao-dal', 'Pulao dal (Parsi mutton pulao with dal)', ['parsi pulao dal', 'mutton pulao dal'],
    [goat(400), rice(400), potato(150), onion(200), ghee(50), oil(30), cashew(15), raisin(15), toorDal(150), water(1300)], 0.88, [PLATE]),
  d('dabba-gosht', 'Dabba gosht (Bohri baked mutton with macaroni)', ['bohri dabba gosht', 'baked mutton macaroni', 'dabba ghosht'],
    [goat(400), pasta(150), milk(300), cream(100), egg(200), cashew(20), ghee(40), onion(100), water(300)], 0.8, [piece('1 serving (200 g)', 200)]),
  d('bohri-chicken-biryani', 'Bohri chicken biryani', ['bohri biryani', 'dawoodi bohra biryani', 'bohra biryani'],
    [chicken(500), rice(450), potato(200), onion(300), curd(150), tomato(150), oil(60), ghee(30), water(800)], RICE, [BIRYANI, PLATE]),
  d('bohri-khichda', 'Khichda (Bohri mutton and grain stew)', ['khichda', 'bohri khichda', 'khichra', 'mutton khichda'],
    [goat(500), bulgur(200), chana(60), toorDal(40), masoorDal(20), onion(200), ghee(60), oil(30), water(1500)], 0.8, [KATORI]),
  d('bohri-kaari', 'Kaari (Bohri chicken curry with coconut)', ['bohri kaari', 'chicken kaari', 'kari chawal bohri'],
    [chicken(500), coconutMilk(300), roastedGram(30), onion(150), oil(40), water(300)], 0.85, [KATORI]),
]

// ------------------------------------------------------------------ HYDERABADI AND DECCANI
const HYDERABAD: IndianRecipe[] = [
  d('pathar-ka-gosht', 'Pathar ka gosht (stone-grilled mutton)', ['pathar gosht', 'patthar ka gosht', 'stone cooked mutton'],
    [goat(500), curd(50), onion(100), ghee(30), oil(20), ...gg(20)], 0.7, [SERVE]),
  d('chicken-majestic', 'Chicken majestic (Hyderabadi)', ['majestic chicken', 'hyderabadi chicken majestic'],
    [breast(500), curd(100), cornstarch(30), maida(20), greenChilli(20), oil(15), oil(50)], 0.78, [SERVE]),
  d('mutton-marag', 'Mutton marag (Hyderabadi)', ['marag', 'hyderabadi marag', 'mutton marag soup'],
    [goat(500), curd(100), cashew(30), almond(20), cream(50), ghee(40), onion(100), water(1000)], 0.88, [KATORI]),
  d('talawa-gosht', 'Talawa gosht (fried mutton)', ['tala hua gosht', 'talawa gosht', 'fried mutton hyderabadi'],
    [goat(500), curd(40), oil(60), ...gg(20)], 0.65, [SERVE]),
  d('mutton-dalcha', 'Mutton dalcha (Hyderabadi)', ['hyderabadi dalcha', 'gosht dalcha', 'dal gosht', 'mutton dalcha'],
    [goat(400), chana(150), toorDal(50), lauki(200), tamarind(20), onion(150), tomato(80), oil(45), water(1200)], 0.8, [KATORI]),
  d('chicken-haleem', 'Chicken haleem', ['murgh haleem', 'chicken haleem hyderabadi'],
    [chicken(500), bulgur(200), chana(50), moongDal(30), masoorDal(20), uradDal(20), onion(200), ghee(80), oil(30), cashew(20), water(1400)], 0.78, [KATORI]),
  d('shikampuri-kebab', 'Shikampuri kebab', ['shikampuri', 'shikampuri kabab', 'stuffed shami hyderabadi'],
    [goat(400), chana(80), greekCurd(80), onion(60), egg(30), oil(40), ghee(10), water(200)], 0.7, [piece('1 kebab (50 g)', 50)]),
  d('mutton-paya', 'Mutton paya', ['paya', 'paya curry', 'siri paya', 'paya shorba', 'aattukaal paya', 'kharode', 'trotters soup'],
    [trotters(600), onion(200), tomato(100), curd(50), oil(50), water(1500)], 0.65, [KATORI]),
  d('kalmi-kebab', 'Kalmi kebab (chicken thigh)', ['kalmi kabab', 'murgh kalmi', 'kalmi tikka'],
    [legMeat(500), curd(80), cream(40), cashew(20), oil(15), butter(15), ...gg(20)], GRILL, [piece('1 kalmi kebab, edible part (80 g)', 80)]),
  d('keema-biryani', 'Keema biryani', ['kheema biryani', 'mutton keema biryani', 'qeema biryani'],
    [goat(400), rice(450), onion(250), tomato(100), curd(100), ghee(40), oil(50), water(800)], RICE, [BIRYANI, PLATE]),
  d('dum-ka-murgh', 'Dum ka murgh (Hyderabadi)', ['dum ka murg', 'murgh dum', 'hyderabadi dum chicken'],
    [chicken(500), curd(150), cashew(40), onion(150), oil(50), cream(30), ghee(20)], 0.78, [KATORI]),
  d('lukhmi', 'Lukhmi (Hyderabadi mutton pastry)', ['luqmi', 'hyderabadi lukhmi', 'mutton lukhmi'],
    [maida(250), ghee(40), water(100), goat(200), onion(80), oil(15), oil(60)], 0.85, [piece('1 lukhmi (45 g)', 45)]),
  d('chakna', 'Chakna (Hyderabadi offal curry)', ['hyderabadi chakna', 'offal curry', 'boti kaleji curry'],
    [tripe(300), lungs(150), kidney(100), liver(100), onion(200), tomato(100), curd(50), oil(50), water(600)], 0.75, [KATORI]),
  d('chicken-fry-piece-biryani', 'Chicken fry piece biryani', ['fry piece biryani', 'chicken fry biryani', 'fry piece chicken biryani'],
    [chicken(500), oil(50), rice(500), onion(250), curd(80), oil(40), ghee(30), water(900)], RICE, [BIRYANI, PLATE]),
]

// ------------------------------------------------------------------ TAMIL AND CHETTINAD
const TAMIL: IndianRecipe[] = [
  d('chicken-kothu-parotta', 'Chicken kothu parotta', ['kothu porotta chicken', 'chicken kottu parotta', 'chicken kothu'],
    [maida(300), oil(40), water(150), egg(150), chicken(250), onion(200), tomato(100), oil(30), water(100)], FRIED, [PLATE]),
  d('egg-kothu-parotta', 'Egg kothu parotta', ['muttai kothu parotta', 'egg kottu parotta', 'egg kothu'],
    [maida(300), oil(40), water(150), egg(300), onion(200), tomato(100), oil(30)], FRIED, [PLATE]),
  d('mutton-kothu-parotta', 'Mutton kothu parotta', ['kari kothu parotta', 'mutton kothu', 'mutton kottu parotta'],
    [maida(300), oil(40), water(150), egg(100), goat(250), onion(200), tomato(100), oil(35), water(100)], FRIED, [PLATE]),
  d('chicken-salna', 'Chicken salna (parotta salna)', ['kozhi salna', 'parotta chicken salna'],
    [chicken(400), coconut(120), onion(200), tomato(150), oil(45), water(600)], 0.85, [KATORI]),
  d('mutton-kuzhambu', 'Mutton kuzhambu', ['mutton kulambu', 'kari kuzhambu', 'attukari kuzhambu'],
    [goat(500), coconut(120), onion(150), shallot(50), tomato(150), sesameOil(45), water(500)], CURRY, [KATORI]),
  d('chicken-kuzhambu', 'Chicken kuzhambu', ['kozhi kuzhambu', 'chicken kulambu', 'kozhi kulambu'],
    [chicken(500), coconut(100), onion(150), tomato(150), sesameOil(40), water(400)], CURRY, [KATORI]),
  d('nattu-kozhi-kuzhambu', 'Nattu kozhi kuzhambu (country chicken curry)', ['country chicken curry', 'nattu kozhi kulambu', 'naatu kozhi curry', 'desi murga curry', 'naati koli saaru'],
    [countryChicken(500), shallot(150), tomato(100), coconut(80), sesameOil(40), ...gg(20), water(600)], CURRY, [KATORI]),
  d('kozhi-varuval', 'Kozhi varuval (Tamil chicken fry)', ['chicken varuval', 'tamil chicken fry', 'kozhi fry'],
    [chicken(500), onion(150), chilliPowder(10), oil(50), ...gg(20)], 0.7, [SERVE]),
  d('pallipalayam-chicken', 'Pallipalayam chicken (Erode)', ['pallipalayam chicken fry', 'erode chicken fry'],
    [chicken(500), shallot(150), coconut(80), chilliPowder(10), coconutOil(40)], 0.7, [SERVE]),
  d('kola-urundai', 'Mutton kola urundai (fried meatballs)', ['kola urundai', 'mutton meatball fry', 'kari urundai'],
    [goat(400), roastedGram(50), coconut(50), onion(80), oil(50)], 0.78, [piece('1 kola urundai (25 g)', 25)]),
  d('eral-thokku', 'Eral thokku (prawn thokku)', ['prawn thokku', 'iral thokku', 'eral masala'],
    [prawn(500), onion(250), tomato(200), sesameOil(50), ...gg(20)], 0.7, [SERVE]),
  d('nandu-rasam', 'Nandu rasam (crab rasam)', ['crab rasam', 'njandu rasam', 'crab soup tamil'],
    [crab(300), tomato(200), tamarind(15), pepper(10), ghee(10), water(900)], 0.85, [CUP, GLASS]),
  d('kari-dosa', 'Kari dosa (Madurai mutton keema dosa)', ['kari dosai', 'madurai kari dosa', 'mutton keema dosa'],
    [rice(150), uradDal(50), water(200), goat(200), onion(100), egg(100), oil(40)], 0.85, [piece('1 kari dosa (180 g)', 180)]),
  d('egg-dosa', 'Egg dosa', ['muttai dosai', 'mutta dosa', 'egg dosai', 'anda dosa'],
    [rice(150), uradDal(50), water(200), egg(200), onion(40), oil(25)], 0.9, [piece('1 egg dosa (120 g)', 120)]),
  d('egg-kalakki', 'Egg kalakki (Madurai)', ['kalakki', 'muttai kalakki', 'madurai kalakki'],
    [egg(200), onion(30), water(30), oil(15)], 0.9, [piece('1 kalakki, 2 eggs (125 g)', 125)]),
  d('karuvadu-kuzhambu', 'Karuvadu kuzhambu (dried fish curry)', ['karuvadu kulambu', 'dry fish kuzhambu', 'karuvattu kuzhambu', 'unakka meen curry'],
    [driedFish(120), brinjal(150), drumstick(100), shallot(100), tomato(100), tamarind(30), sesameOil(40), water(600)], CURRY, [KATORI]),
  d('karuvadu-fry', 'Karuvadu fry (dried fish fry)', ['karuvadu varuval', 'dry fish fry', 'unakka meen fry', 'sukha machhi fry'],
    [driedFish(150), onion(150), tomato(50), oil(40)], FRIED, [piece('1 serving (60 g)', 60)]),
  d('sura-puttu', 'Sura puttu (shark puttu)', ['shark puttu', 'sura meen puttu', 'sura puttu'],
    [shark(500), shallot(150), garlic(40), sesameOil(50)], 0.65, [SERVE]),
  d('muttai-kuzhambu', 'Muttai kuzhambu (egg drop curry)', ['egg kuzhambu', 'muttai kulambu', 'egg drop curry', 'mutta kuzhambu'],
    [egg(300), shallot(100), tomato(150), tamarind(20), coconut(60), sesameOil(30), water(400)], 0.85, [KATORI]),
  d('ambur-mutton-biryani', 'Ambur mutton biryani', ['ambur star biryani mutton', 'arcot mutton biryani'],
    [goat(500), rice(500), onion(250), tomato(200), curd(100), oil(80), ghee(20), ...gg(25), water(900)], RICE, [BIRYANI, PLATE]),
  d('dindigul-mutton-biryani', 'Dindigul mutton biryani (seeraga samba)', ['seeraga samba mutton biryani', 'thalappakatti mutton biryani'],
    [goat(500), rice(500), onion(200), tomato(100), curd(100), ghee(60), oil(40), ...gg(25), water(850)], RICE, [BIRYANI, PLATE]),
  d('kaadai-fry', 'Kaadai fry (quail fry)', ['kaadai varuval', 'quail fry', 'bater fry', 'lava pitta fry'],
    [quail(500), onion(100), oil(50), ...gg(20)], 0.7, [piece('1 quail, edible part (80 g)', 80)]),
]

// ------------------------------------------------------------------ ANDHRA AND TELANGANA
const ANDHRA: IndianRecipe[] = [
  d('gongura-mutton', 'Gongura mutton', ['gongura mamsam', 'pulicha keerai mutton', 'gongura gosht'],
    [goat(500), gongura(200), onion(200), oil(60), ...gg(20), water(300)], 0.78, [KATORI]),
  d('gongura-chicken', 'Gongura chicken', ['gongura kodi', 'gongura kodi kura', 'pulicha keerai chicken'],
    [chicken(500), gongura(150), onion(200), oil(50), ...gg(20), water(200)], 0.78, [KATORI]),
  d('natu-kodi-pulusu', 'Natu kodi pulusu (Andhra country chicken)', ['natu kodi curry', 'nattu kodi pulusu', 'country chicken pulusu', 'natu kodi kura'],
    [countryChicken(500), onion(200), tomato(100), tamarind(15), oil(50), ...gg(20), water(500)], CURRY, [KATORI]),
  d('kodi-vepudu', 'Kodi vepudu (Andhra chicken fry)', ['andhra chicken fry', 'chicken vepudu', 'kodi fry'],
    [chicken(500), onion(150), cashew(15), oil(55), ...gg(20)], DRY, [SERVE]),
  d('ankapur-chicken', 'Ankapur chicken (Telangana country chicken fry)', ['ankapur natu kodi', 'telangana country chicken fry', 'ankapur kodi'],
    [countryChicken(500), onion(100), oil(60), chilliPowder(15), ...gg(20)], DRY, [SERVE]),
  d('royyala-iguru', 'Royyala iguru (Andhra prawn masala)', ['prawn iguru', 'andhra prawn masala', 'royyalu iguru', 'royyala vepudu'],
    [prawn(500), onion(200), tomato(100), oil(50), ...gg(20)], 0.72, [SERVE]),
  d('kodi-guddu-pulusu', 'Kodi guddu pulusu (egg in tamarind gravy)', ['egg pulusu', 'guddu pulusu', 'kodi guddu kura'],
    [egg(300), onion(200), tomato(150), tamarind(25), oil(35), water(400)], CURRY, [KATORI]),
  d('bongulo-chicken', 'Bongulo chicken (Araku bamboo chicken)', ['bamboo chicken', 'bongu chicken', 'araku bamboo chicken', 'bongulo kodi'],
    [chicken(500), curd(50), onion(50), oil(15), ...gg(20)], 0.72, [SERVE]),
  d('andhra-mutton-curry', 'Andhra mutton curry (mamsam kura)', ['mamsam kura', 'andhra mutton', 'telangana mutton curry', 'mutton kura'],
    [goat(500), onion(250), tomato(150), coconut(40), chilliPowder(15), oil(60), ...gg(20), water(400)], 0.8, [KATORI]),
  d('boti-curry', 'Boti curry (goat tripe)', ['boti kura', 'boti fry', 'ojri', 'bhuti curry', 'goat tripe curry', 'kudal kuzhambu'],
    [tripe(500), onion(200), tomato(100), oil(50), ...gg(20), water(400)], 0.75, [KATORI]),
  d('chicken-pickle', 'Chicken pickle (Andhra boneless)', ['kodi pachadi', 'chicken achar', 'andhra chicken pickle', 'boneless chicken pickle'],
    [chicken(500), oil(125), chilliPowder(40), lemon(30), ...gg(60)], 0.72, [TBSP]),
  d('mutton-pickle', 'Mutton pickle', ['mamsam pachadi', 'mutton achar', 'gosht ka achar'],
    [goat(500), oil(125), chilliPowder(40), lemon(30), ...gg(60)], 0.72, [TBSP]),
  d('prawn-pickle', 'Prawn pickle', ['royyala pachadi', 'prawn achar', 'chemmeen achar', 'kolambi lonche'],
    [prawn(500), oil(120), chilliPowder(40), lemon(30), ...gg(50)], 0.72, [TBSP]),
  d('fish-pickle', 'Fish pickle', ['meen achar', 'fish achar', 'chepala pachadi', 'meen achaar'],
    [surmai(500), oil(120), chilliPowder(40), vinegar(50), ...gg(50)], 0.75, [TBSP]),
  d('prawn-pulao', 'Prawn pulao', ['royyala pulao', 'prawn pulav', 'jhinga pulao', 'chemmeen pulao'],
    [prawn(300), rice(400), onion(150), tomato(80), coconutMilk(200), oil(40), ghee(15), water(650)], RICE, [PLATE]),
]

// ------------------------------------------------------------------ BENGALI AND ODIA
const BENGAL: IndianRecipe[] = [
  d('ilish-bhaja', 'Ilish bhaja (fried hilsa)', ['fried hilsa', 'ilish mach bhaja', 'hilsa fry'],
    [hilsa(500), mustardOil(40)], 0.75, [piece('1 piece, edible part (70 g)', 70)]),
  d('bhetki-paturi', 'Bhetki paturi (fish in banana leaf)', ['paturi', 'bhetki macher paturi', 'fish paturi', 'ilish paturi'],
    [seaBass(500), mustardSeed(40), coconut(40), greenChilli(15), mustardOil(35)], 0.82, [piece('1 paturi (110 g)', 110)]),
  d('rui-posto', 'Rui posto (rohu in poppy seed)', ['rohu posto', 'fish in poppy seed', 'rui macher posto'],
    [rohu(500), poppy(50), greenChilli(10), mustardOil(50), water(200)], CURRY, [KATORI]),
  d('rui-bhaja', 'Rui bhaja (fried rohu)', ['rui macher bhaja', 'rohu fry', 'katla fry', 'machh bhaja'],
    [rohu(500), mustardOil(40)], 0.75, [piece('1 piece, edible part (70 g)', 70)]),
  d('macher-tok', 'Macher tok (sweet-sour fish)', ['tok macher', 'sour fish bengali', 'macher tauk'],
    [rohu(400), tamarind(30), jaggery(20), mustardOil(30), water(300)], 0.85, [KATORI]),
  d('daab-chingri', 'Daab chingri (prawns in tender coconut)', ['dab chingri', 'prawns in tender coconut', 'daab chingri bengali'],
    [prawn(500), coconut(100), coconutMilk(150), mustardSeed(25), onion(80), mustardOil(30)], 0.85, [piece('1 coconut serving (180 g)', 180)]),
  d('chingri-posto', 'Chingri posto (prawns in poppy seed)', ['prawns in poppy seed', 'chingri posto bata'],
    [prawn(400), poppy(50), onion(60), mustardOil(30)], 0.8, [SERVE]),
  d('tangra-macher-jhal', 'Tangra / pabda macher jhal', ['tangra macher jhal', 'pabda macher jhal', 'tangra jhol', 'pabda jhal'],
    [catfish(500), onion(100), tomato(80), mustardSeed(15), mustardOil(50), water(300)], CURRY, [KATORI]),
  d('tel-koi', 'Tel koi (climbing perch in spicy gravy)', ['koi macher tel jhal', 'tel koi', 'koi mach curry'],
    [perch(500), onion(150), tomato(60), curd(30), mustardOil(60), water(200)], 0.8, [KATORI]),
  d('mourala-bhaja', 'Mourala bhaja (small fish fry)', ['mourala macher bhaja', 'mola fish fry', 'small fish fry bengali', 'mourola bhaja'],
    [smelt(400), riceFlour(20), mustardOil(50)], 0.75, [SERVE]),
  d('muri-ghonto', 'Muri ghonto (fish head with rice)', ['macher matha diye muri ghonto', 'fish head rice', 'muri ghanto'],
    [rohu(300), rice(100), potato(150), onion(100), tomato(80), mustardOil(40), ghee(15), water(400)], 0.8, [KATORI]),
  d('fish-kobiraji', 'Fish kobiraji (Kolkata cutlet)', ['fish kabiraji', 'kobiraji cutlet', 'fish coverage'],
    [seaBass(400), egg(200), bread(60), onion(40), lemon(10), oil(60)], FRIED, [piece('1 kobiraji (130 g)', 130)]),
  d('kolkata-fish-fry', 'Kolkata fish fry (crumb fried bhetki)', ['bhetki fish fry', 'kolkata fish fry', 'crumb fried fish'],
    [seaBass(400), egg(100), bread(80), onion(40), oil(50)], 0.85, [piece('1 fish fry (100 g)', 100)]),
  d('chicken-chaap', 'Chicken chaap (Kolkata)', ['chicken chap', 'kolkata chicken chaap', 'mughlai chicken chaap'],
    [legMeat(500), curd(100), cashew(25), poppy(15), onion(80), ghee(40), oil(40), water(100)], 0.75, [piece('1 piece with masala (150 g)', 150)]),
  d('mutton-chaap', 'Mutton chaap (Kolkata)', ['mutton chap', 'kolkata mutton chaap', 'mughlai mutton chaap'],
    [goat(500), curd(100), cashew(25), poppy(15), onion(80), ghee(50), oil(40), water(150)], 0.72, [piece('1 piece with masala (150 g)', 150)]),
  d('mutton-rezala', 'Mutton rezala (Kolkata)', ['rezala', 'kolkata mutton rezala', 'mutton rejala'],
    [goat(500), curd(200), cashew(30), poppy(15), onion(150), milk(100), ghee(60), water(200)], CURRY, [KATORI]),
  d('chicken-rezala', 'Chicken rezala', ['murgir rezala', 'kolkata chicken rezala', 'chicken rejala'],
    [chicken(500), curd(200), cashew(30), poppy(15), onion(150), milk(100), ghee(50), water(150)], CURRY, [KATORI]),
  d('murgir-jhol', 'Murgir jhol (light chicken curry with potato)', ['chicken jhol', 'aloo chicken curry', 'murgir patla jhol'],
    [chicken(500), potato(250), onion(150), tomato(100), mustardOil(35), ...gg(20), water(500)], 0.85, [KATORI]),
  d('kolkata-chicken-stew', 'Kolkata chicken stew (cabin style)', ['chicken stew kolkata', 'cabin stew', 'bengali chicken stew'],
    [chicken(400), potato(150), carrot(100), u(169961)(80), onion(80), butter(20), milk(150), water(600)], 0.85, [KATORI]),
  d('railway-mutton-curry', 'Railway mutton curry', ['railway lamb curry', 'anglo indian mutton curry', 'railway mutton'],
    [goat(500), potato(200), onion(200), tomato(150), curd(80), oil(50), ...gg(20), water(500)], CURRY, [KATORI]),
  d('chicken-dak-bungalow', 'Chicken dak bungalow', ['dak bungalow chicken', 'dak bunglow murgi'],
    [chicken(500), potato(200), egg(200), onion(200), tomato(100), oil(55), ...gg(20), water(300)], CURRY, [KATORI]),
  d('dimer-devil', 'Dimer devil (Bengali egg chop)', ['egg devil', 'dimer chop', 'egg chop', 'dim devil'],
    [egg(300), potato(250), goat(150), onion(60), oil(15), egg(50), bread(50), oil(50)], FRIED, [piece('1 egg devil (75 g)', 75)]),
  d('mangsher-chop', 'Mangsher chop (Bengali mutton chop)', ['mutton chop bengali', 'keema chop', 'mangsho chop'],
    [potato(400), goat(200), onion(60), oil(15), egg(50), bread(60), oil(50)], FRIED, [piece('1 chop (70 g)', 70)]),
  d('lau-chingri', 'Lau chingri (bottle gourd with prawns)', ['lau chingri', 'bottle gourd with prawns', 'lauki jhinga'],
    [lauki(600), prawn(200), mustardOil(25), ghee(5)], 0.75, [KATORI]),
  d('echor-chingri', 'Echor chingri (raw jackfruit with prawns)', ['enchor chingri', 'raw jackfruit with prawns', 'echorer dalna chingri'],
    [rawJackfruit(500), prawn(200), potato(100), onion(100), tomato(80), mustardOil(35), ghee(10), water(150)], 0.8, [KATORI]),
  d('kochu-pata-chingri', 'Kochu pata chingri (colocasia leaves with prawns)', ['colocasia leaves with prawns', 'kochu bata chingri', 'kochu pata bata'],
    [taroLeaves(300), prawn(150), coconut(60), mustardSeed(15), mustardOil(30)], 0.75, [KATORI]),
  d('macher-dim-bora', 'Macher dimer bora (fish roe fritters)', ['fish roe fritters', 'fish egg pakora', 'maacher dim bhaja', 'macher dim bhaja'],
    [roe(300), besan(40), onion(60), mustardOil(40)], FRIED, [piece('1 bora (30 g)', 30)]),
  d('shutki-bhuna', 'Shutki bhuna (dried fish, Bengali)', ['shutki maach', 'shutki bhorta', 'dried fish bengali', 'shutki macher jhal'],
    [driedFish(150), onion(250), garlic(40), tomato(100), mustardOil(50)], FRIED, [piece('1 serving (60 g)', 60)]),
  d('kakra-jhal', 'Kakra jhal (Bengali crab curry)', ['kankrar jhal', 'bengali crab curry', 'kankada jhola', 'kakrar jhol'],
    [crab(500), potato(100), onion(150), tomato(100), mustardOil(45), water(200)], CURRY, [KATORI]),
  d('chingri-cutlet', 'Chingri cutlet (prawn cutlet)', ['prawn cutlet', 'prawn chop', 'chingri macher chop'],
    [prawn(300), potato(150), onion(50), egg(50), bread(50), oil(40)], FRIED, [CUTLET]),
  d('mutton-kathi-roll', 'Mutton kathi roll', ['mutton roll', 'boti roll', 'mutton frankie'],
    [maida(250), water(100), oil(40), goat(300), oil(15), onion(100), lemon(10)], 0.85, [piece('1 roll (200 g)', 200)]),
  d('mansa-tarkari', 'Mansa tarkari (Odia mutton curry)', ['odia mutton curry', 'mutton kasa odia', 'mansa jhola'],
    [goat(500), potato(200), onion(200), tomato(100), curd(50), mustardOil(50), ...gg(20), water(400)], CURRY, [KATORI]),
  d('machha-besara', 'Machha besara (Odia fish in mustard)', ['macha besara', 'odia fish curry mustard', 'machha besar'],
    [rohu(500), mustardSeed(30), tomato(60), mustardOil(40), water(250)], 0.85, [KATORI]),
  d('hasher-dimer-curry', 'Duck egg curry (hasher dim / tharavu mutta)', ['hasher dimer curry', 'duck egg curry', 'tharavu mutta roast', 'haanh koni curry'],
    [duckEgg(420), potato(150), onion(200), tomato(150), mustardOil(40), water(200)], CURRY, [piece('2 eggs with gravy (200 g)', 200)]),
]

// ------------------------------------------------------------------ ASSAM AND THE NORTHEAST
const NORTHEAST: IndianRecipe[] = [
  d('masor-tenga', 'Masor tenga (Assamese sour fish curry)', ['maasor tenga', 'assamese fish curry', 'tenga maas', 'masor tenga tomato'],
    [rohu(500), tomato(250), lemon(20), mustardOil(30), water(400)], 0.85, [KATORI]),
  d('hah-kumura', 'Hah kumura (Assamese duck with ash gourd)', ['haah kumura', 'duck with ash gourd', 'hanhor mangxo', 'assamese duck curry'],
    [duck(500), ashGourd(400), onion(150), mustardOil(40), ...gg(20), water(300)], 0.8, [KATORI]),
  d('pork-lai-xaak', 'Pork with lai xaak (Assamese mustard greens)', ['gahori lai xaak', 'pork with mustard greens', 'pork lai saak'],
    [porkShoulder(500), mustardGreens(400), mustardOil(15), ...gg(20)], 0.75, [KATORI]),
  d('kukura-mangxo', 'Kukura mangxo (Assamese chicken curry)', ['assamese chicken curry', 'kukura aru alu', 'kukurar mangxo'],
    [chicken(500), potato(150), onion(150), tomato(80), mustardOil(35), ...gg(20), water(300)], CURRY, [KATORI]),
  d('chicken-bamboo-shoot', 'Chicken with bamboo shoot (Naga style)', ['naga chicken bamboo shoot', 'chicken bamboo shoot curry', 'bamboo shoot chicken'],
    [chicken(500), bambooShoot(200), tomato(80), oil(10), water(300)], 0.8, [KATORI]),
  d('jadoh', 'Jadoh (Khasi pork rice)', ['ja doh', 'khasi pork rice', 'jadoh rice'],
    [rice(300), porkShoulder(250), porkBelly(50), onion(80), water(600)], RICE, [PLATE]),
  d('doh-khlieh', 'Doh khlieh (Khasi pork salad)', ['dohkhlieh', 'khasi pork salad', 'doh khleh'],
    [porkShoulder(400), onion(150), greenChilli(10), lemon(10)], 0.8, [SERVE]),
  d('doh-neiiong', 'Doh neiiong (pork in black sesame)', ['dohneiiong', 'pork with black sesame', 'khasi black sesame pork'],
    [porkShoulder(400), porkBelly(100), sesame(80), onion(100), oil(10), water(300)], 0.75, [KATORI]),
  d('ngari-eromba', 'Ngari eromba (with fermented fish)', ['eromba with fish', 'manipuri eromba ngari', 'eromba ngari'],
    [potato(300), ngari(40), greenChilli(20), onion(30)], 0.9, [SERVE]),
  d('nga-thongba', 'Nga thongba (Manipuri fish curry)', ['manipuri fish curry', 'nga thongba', 'nga atoiba thongba'],
    [rohu(500), potato(150), onion(100), tomato(80), oil(25), water(400)], 0.85, [KATORI]),
  d('chicken-thukpa', 'Chicken thukpa', ['thukpa chicken', 'tibetan noodle soup chicken', 'chicken noodle soup thukpa'],
    [eggNoodles(200), chicken(200), cabbage(100), carrot(50), onion(50), oil(10), water(1200)], 0.85, [piece('1 bowl (400 g)', 400)]),
  d('sha-phaley', 'Sha phaley (Tibetan meat bread)', ['shaphaley', 'sha bhaley', 'tibetan meat pie', 'sha phalay'],
    [maida(300), water(150), beef(200), onion(80), cabbage(50), oil(60)], 0.85, [piece('1 phaley (90 g)', 90)]),
  d('sekuwa', 'Sekuwa (Nepali grilled meat)', ['mutton sekuwa', 'chicken sekuwa', 'nepali grilled meat', 'sekua'],
    [goat(500), mustardOil(25), lemon(10), ...gg(20)], 0.72, [piece('1 skewer (60 g)', 60)]),
  d('pork-momos', 'Pork momos (steamed)', ['pork momo', 'pork dumplings', 'steamed pork momos'],
    [maida(250), water(120), porkShoulder(300), onion(100), cabbage(60), oil(5)], 0.95, [piece('1 momo (25 g)', 25), piece('1 plate, 8 momos (200 g)', 200)]),
  d('mutton-momos', 'Mutton momos (steamed)', ['mutton momo', 'mutton dumplings', 'steamed mutton momos'],
    [maida(250), water(120), goat(300), onion(100), cabbage(60), oil(15)], 0.95, [piece('1 momo (25 g)', 25), piece('1 plate, 8 momos (200 g)', 200)]),
  d('arsa-buhchiar', 'Arsa buhchiar (Mizo chicken rice porridge)', ['mizo chicken porridge', 'chicken rice congee mizo', 'arsa buhchiar'],
    [rice(150), chicken(200), onion(50), oil(10), water(1000)], 0.85, [KATORI]),
]

// ------------------------------------------------------------------ KASHMIRI
const KASHMIR: IndianRecipe[] = [
  d('rista', 'Rista (Kashmiri red meatballs)', ['rishta', 'kashmiri red meatballs', 'rista wazwan'],
    [lambMince(500), mustardOil(30), ghee(20), water(800)], 0.62, [piece('2 rista with gravy (220 g)', 220)]),
  d('tabak-maaz', 'Tabak maaz (Kashmiri fried ribs)', ['tabakh maaz', 'kashmiri fried ribs', 'kabargah', 'qabargah'],
    [lambRibLean(400), lambRib(100), milk(100), ghee(30)], 0.62, [piece('2 ribs, edible part (90 g)', 90)]),
  d('methi-maaz', 'Methi maaz (Kashmiri offal with fenugreek)', ['methi kormeh', 'kashmiri offal with fenugreek', 'methi maz'],
    [tripe(400), lungs(100), methi(100), mustardOil(40), water(300)], 0.7, [KATORI]),
  d('aab-gosht', 'Aab gosht (Kashmiri milk mutton)', ['aabgosh', 'kashmiri milk mutton', 'aab gosh'],
    [goat(500), milk(600), ghee(30), water(200)], 0.8, [KATORI]),
  d('marchwangan-korma', 'Marchwangan korma (Kashmiri red chilli mutton)', ['mirchi korma', 'marchwangun qorma', 'kashmiri red chilli mutton'],
    [goat(500), onion(150), chilliPowder(20), mustardOil(50), water(500)], 0.75, [KATORI]),
  d('dhaniwal-korma', 'Dhaniwal korma (Kashmiri coriander mutton)', ['dhaniwal qorma', 'coriander mutton korma', 'kashmiri dhaniwal'],
    [goat(500), curd(250), onion(100), coriander(50), ghee(40), water(300)], 0.8, [KATORI]),
  d('gaad-nadru', 'Gaad nadru (Kashmiri fish with lotus stem)', ['nadru gaad', 'gaad nadur', 'kashmiri fish with lotus stem', 'fish with nadru'],
    [rohu(500), lotusRoot(300), chilliPowder(15), mustardOil(50), water(400)], CURRY, [KATORI]),
  d('kokur-yakhni', 'Kokur yakhni (Kashmiri chicken in curd)', ['chicken yakhni kashmiri', 'kashmiri chicken in curd', 'kokur yakhin'],
    [chicken(500), curd(300), ghee(30), mustardOil(15), water(300)], 0.85, [KATORI]),
  d('mutton-kanti', 'Mutton kanti (Kashmiri stir-fried mutton)', ['kashmiri kanti', 'kanti gosht', 'mutton kanti'],
    [goat(500), onion(200), tomato(80), mustardOil(30), ghee(15)], DRY, [SERVE]),
  d('shalgam-gosht', 'Shalgam gosht (turnip mutton)', ['gogji maaz', 'turnip mutton', 'shaljam gosht', 'gogji rajma gosht'],
    [goat(500), turnip(400), onion(150), tomato(80), mustardOil(45), water(300)], CURRY, [KATORI]),
]

// ------------------------------------------------------------------ AWADHI, RAMPURI, MUGHLAI, RAJASTHANI
const MUGHLAI: IndianRecipe[] = [
  d('murgh-musallam', 'Murgh musallam (whole stuffed chicken)', ['murg musallam', 'murgh mussallam', 'whole stuffed chicken'],
    [chicken(900), egg(200), onion(250), curd(150), cashew(40), almond(20), cream(50), ghee(80), water(200)], 0.8, [piece('1 quarter with egg and gravy (300 g)', 300), KATORI]),
  d('raan', 'Raan (roast leg of mutton)', ['mutton raan', 'raan e sikandari', 'roast leg of mutton', 'raan musallam'],
    [goat(1000), curd(200), ghee(60), oil(20), lemon(20), ...gg(40)], DRY, [SERVE]),
  d('mutton-pasanda', 'Mutton pasanda', ['pasanda', 'gosht pasanda', 'badami pasanda'],
    [goat(500), curd(150), cashew(30), almond(20), onion(150), ghee(50), cream(40), water(150)], 0.8, [KATORI]),
  d('burrah-kebab', 'Burrah kebab (mutton chops tandoori)', ['burra kebab', 'barra kabab', 'burrah', 'tandoori mutton chops'],
    [lambRibLean(600), curd(100), oil(15), ghee(20), ...gg(25)], 0.72, [piece('1 burrah piece, edible part (70 g)', 70)]),
  d('taar-gosht', 'Taar gosht (Rampuri)', ['rampuri taar gosht', 'rampuri taar korma', 'taar korma'],
    [goat(600), onion(200), curd(100), ghee(100), water(300)], 0.75, [KATORI]),
  d('mutton-kofta-curry', 'Mutton kofta curry (ball curry)', ['kofta curry', 'mutton kofta', 'ball curry', 'anglo indian ball curry', 'kheema kofta curry'],
    [goat(500), roastedGram(30), onion(200), tomato(200), curd(80), oil(50), water(300)], CURRY, [KATORI]),
  d('chicken-kofta-curry', 'Chicken kofta curry', ['chicken kofta', 'murgh kofta curry', 'chicken meatball curry'],
    [chickenMince(500), roastedGram(30), onion(200), tomato(200), curd(60), cream(20), oil(45), water(250)], CURRY, [KATORI]),
  d('nargisi-kofta', 'Nargisi kofta (egg in mutton mince)', ['nargisi kofte', 'egg kofta curry', 'nargisi kofta curry'],
    [goat(400), egg(350), roastedGram(40), oil(50), onion(200), tomato(150), curd(80), oil(40), cream(30), water(250)], CURRY, [piece('1 nargisi kofta with gravy (200 g)', 200)]),
  d('chicken-changezi', 'Chicken changezi (Old Delhi)', ['murgh changezi', 'changezi chicken'],
    [chicken(500), onion(200), tomato(200), curd(60), cashew(20), cream(80), butter(40), oil(30), water(150)], 0.8, [KATORI]),
  d('chicken-shami-kebab', 'Chicken shami kebab', ['chicken shami', 'murgh shami kabab', 'chicken shami kabab'],
    [chicken(400), chana(120), onion(60), egg(50), water(300), oil(40)], 0.67, [piece('1 kebab (40 g)', 40)]),
  d('jungli-maas', 'Jungli maas (Rajasthani)', ['jungle maas', 'rajasthani hunter mutton', 'jangli maas'],
    [goat(500), ghee(80), chilliPowder(15), garlic(20), water(400)], 0.7, [KATORI]),
  d('maas-ke-sooley', 'Maas ke sooley (Rajasthani mutton kebab)', ['maas ke soole', 'soola', 'rajasthani mutton kebab', 'sule'],
    [goat(500), curd(80), mustardOil(25), ghee(15), ...gg(20)], 0.7, [SERVE]),
  d('mohan-maas', 'Mohan maas (Rajasthani mutton in milk)', ['rajasthani mutton in milk', 'mohan maans'],
    [goat(500), milk(600), cream(50), ghee(50), cashew(20), almond(20)], 0.8, [KATORI]),
]

// ------------------------------------------------------------------ PUNJABI DHABA AND NORTH INDIAN HOME
const PUNJAB: IndianRecipe[] = [
  d('tawa-chicken', 'Tawa chicken', ['chicken tawa fry', 'tawa murgh', 'tawa chicken masala'],
    [chicken(500), onion(200), tomato(150), capsicum(80), oil(50), butter(20), ...gg(20)], 0.7, [SERVE]),
  d('rara-mutton', 'Rara mutton (with keema)', ['rara gosht', 'rara meat', 'raara mutton'],
    [goat(650), onion(250), tomato(200), curd(60), oil(60), ghee(20), ...gg(20), water(250)], 0.8, [KATORI]),
  d('rara-chicken', 'Rara chicken (with keema)', ['rara murgh', 'raara chicken'],
    [chicken(500), chickenMince(150), onion(250), tomato(200), curd(60), oil(55), ghee(20), ...gg(20), water(200)], 0.8, [KATORI]),
  d('patiala-chicken', 'Patiala chicken', ['chicken patiala', 'patiala murgh', 'patiala shahi chicken'],
    [chicken(500), onion(200), tomato(200), curd(50), cream(50), butter(30), oil(30), water(150)], 0.8, [KATORI]),
  d('bhatti-da-murgh', 'Bhatti da murgh', ['bhatti murgh', 'bhatti chicken', 'bhatti da kukkad'],
    [legMeat(600), curd(100), mustardOil(30), lemon(15), ...gg(20)], GRILL, [piece('Quarter, edible part (150 g)', 150)]),
  d('chicken-angara', 'Chicken angara (gravy)', ['angara chicken curry', 'murgh angara masala', 'smoky chicken angara gravy'],
    [chicken(500), curd(100), onion(150), tomato(150), chilliPowder(15), oil(40), water(100)], 0.78, [KATORI]),
  d('chicken-bharta', 'Chicken bharta (shredded chicken in gravy)', ['murgh bharta', 'chicken bharta punjabi'],
    [chicken(500), egg(100), onion(200), tomato(200), cream(40), butter(30), oil(25), water(100)], 0.8, [KATORI]),
  d('chicken-bhuna', 'Bhuna chicken', ['bhuna murgh', 'chicken bhuna masala', 'chicken bhuna'],
    [chicken(500), onion(250), tomato(150), oil(55), ...gg(20), water(80)], 0.72, [KATORI]),
  d('chicken-rogan-josh', 'Chicken rogan josh', ['murgh rogan josh', 'chicken roghan josh'],
    [chicken(500), curd(150), onion(100), oil(50), chilliPowder(10), water(250)], CURRY, [KATORI]),
  d('achari-chicken', 'Achari chicken', ['achari murgh', 'achar chicken'],
    [chicken(500), curd(150), onion(150), tomato(100), mustardOil(50), ...gg(20)], 0.8, [KATORI]),
  d('achari-gosht', 'Achari gosht (achari mutton)', ['achar gosht', 'achari mutton'],
    [goat(500), curd(150), onion(150), tomato(100), mustardOil(55), ...gg(20), water(300)], 0.78, [KATORI]),
  d('chicken-kali-mirch', 'Chicken kali mirch', ['kali mirch chicken', 'murgh kali mirch', 'black pepper chicken gravy'],
    [chicken(500), curd(100), cream(60), cashew(30), onion(150), butter(20), oil(25), pepper(10), water(100)], 0.8, [KATORI]),
  d('chicken-jalfrezi', 'Chicken jalfrezi', ['chicken jalfrezie', 'jhal frezi chicken', 'murgh jalfrezi'],
    [chicken(500), onion(200), capsicum(200), tomato(200), oil(40), vinegar(5)], 0.8, [KATORI]),
  d('tandoori-chicken-wings', 'Tandoori chicken wings', ['chicken wings tandoori', 'tandoori wings', 'masala wings'],
    [wingSkin(500), curd(60), oil(10), lemon(10), ...gg(15)], 0.72, [piece('4 wings, edible part (100 g)', 100)]),
  d('mutton-do-pyaza', 'Mutton do pyaza', ['gosht do pyaza', 'mutton dopiaza'],
    [goat(500), onion(400), tomato(150), curd(80), oil(55), ...gg(20), water(250)], 0.8, [KATORI]),
  d('kadai-mutton', 'Kadai mutton', ['kadhai gosht', 'karahi gosht', 'mutton karahi'],
    [goat(500), onion(150), tomato(250), capsicum(150), oil(50), ...gg(20), water(300)], 0.8, [KATORI]),
  d('mutton-handi', 'Mutton handi', ['handi gosht', 'handi mutton'],
    [goat(500), onion(200), tomato(200), curd(100), cream(30), oil(55), ...gg(20), water(300)], 0.8, [KATORI]),
  d('mutton-champ-masala', 'Mutton champ masala (chops)', ['mutton chops', 'mutton champ', 'champ masala', 'chaap gosht'],
    [lambRibLean(500), onion(200), tomato(150), curd(80), oil(50), ...gg(20), water(200)], 0.75, [piece('2 chops with masala (150 g)', 150)]),
  d('mutton-chops-fry', 'Mutton chops fry (crumb fried)', ['fried mutton chops', 'mutton chop cutlet', 'lamb chops fry'],
    [lambRibLean(500), egg(100), bread(60), ...gg(15), oil(40)], 0.72, [piece('1 chop, edible part (70 g)', 70)]),
  d('saag-gosht', 'Saag gosht', ['saag meat', 'palak gosht', 'palak mutton', 'sarson saag gosht'],
    [goat(500), mustardGreens(200), spinach(300), onion(150), tomato(100), oil(50), ghee(15), ...gg(20), water(200)], 0.78, [KATORI]),
  d('aloo-gosht', 'Aloo gosht (mutton with potatoes)', ['mutton aloo', 'aloo mutton curry', 'gosht aloo'],
    [goat(500), potato(300), onion(200), tomato(150), curd(50), oil(50), ...gg(20), water(500)], CURRY, [KATORI]),
  d('arbi-gosht', 'Arbi gosht (mutton with colocasia)', ['arvi gosht', 'arbi mutton', 'colocasia mutton'],
    [goat(500), taro(300), onion(200), tomato(150), curd(50), oil(50), ...gg(20), water(400)], CURRY, [KATORI]),
  d('lauki-gosht', 'Lauki gosht (mutton with bottle gourd)', ['kaddu gosht', 'ghiya gosht', 'lauki mutton'],
    [goat(500), lauki(400), onion(200), tomato(150), oil(50), ...gg(20), water(300)], CURRY, [KATORI]),
  d('chana-gosht', 'Chana gosht (mutton with chickpeas)', ['chane ka gosht', 'chole gosht', 'mutton chana'],
    [goat(500), chana(150), onion(200), tomato(150), curd(50), oil(55), ...gg(20), water(900)], 0.85, [KATORI]),
  d('aloo-keema', 'Aloo keema', ['keema aloo', 'aloo kheema', 'mince and potato'],
    [goat(400), potato(300), onion(200), tomato(150), oil(45), ...gg(20), water(200)], 0.8, [KATORI]),
  d('keema-kaleji', 'Keema kaleji', ['kheema kaleji', 'mince and liver', 'keema kalegi'],
    [goat(350), liver(150), onion(200), tomato(150), peas(80), oil(50), ...gg(20), water(100)], 0.78, [KATORI]),
  d('keema-paratha', 'Keema paratha', ['kheema paratha', 'keema parantha', 'mutton keema paratha'],
    [atta(300), water(180), goat(250), onion(80), oil(15), ghee(40)], 0.85, [piece('1 paratha (130 g)', 130)]),
  d('egg-pakora', 'Egg pakora (anda bhajji)', ['egg pakoda', 'anda pakoda', 'anda bhajji', 'egg bajji', 'egg bonda'],
    [egg(300), besan(100), water(100), oil(40)], 0.9, [piece('1 piece, half egg (35 g)', 35)]),
  d('tandoori-prawns', 'Tandoori prawns', ['tandoori jhinga', 'prawn tikka', 'jhinga tikka'],
    [prawn(500), curd(80), oil(15), butter(10), lemon(15), ...gg(15)], 0.75, [piece('6 prawns (90 g)', 90)]),
  d('lobster-masala', 'Lobster masala', ['lobster curry', 'konkan lobster masala', 'lobster fry masala'],
    [lobster(500), onion(200), tomato(150), butter(30), oil(30), ...gg(15)], 0.75, [SERVE]),
]

// ------------------------------------------------------------------ BIHARI, ANGLO-INDIAN, ORGAN MEATS
const OTHERS: IndianRecipe[] = [
  d('champaran-mutton', 'Champaran mutton (ahuna / handi meat)', ['champaran meat', 'ahuna mutton', 'handi meat', 'champaran handi mutton', 'ahuna meat'],
    [goat(500), onion(250), garlic(50), mustardOil(80), ghee(20), ...gg(20), water(150)], 0.75, [KATORI]),
  d('champaran-chicken', 'Champaran chicken (ahuna chicken)', ['ahuna chicken', 'champaran handi chicken', 'champaran murga'],
    [chicken(500), onion(200), garlic(50), mustardOil(70), ...gg(20), water(100)], 0.75, [KATORI]),
  d('bihari-kebab', 'Bihari kebab', ['bihari boti', 'bihari kabab', 'bihari seekh'],
    [goat(500), curd(80), onion(60), poppy(10), mustardOil(50)], 0.7, [piece('1 skewer (60 g)', 60)]),
  d('country-captain', 'Country captain chicken (Anglo-Indian)', ['country captain', 'anglo indian chicken fry'],
    [chicken(500), onion(300), oil(45), water(150)], 0.75, [KATORI]),
  d('anglo-indian-chicken-roast', 'Chicken pot roast (Anglo-Indian)', ['anglo indian chicken roast', 'pot roast chicken', 'chicken roast with potatoes'],
    [legMeat(600), potato(300), onion(150), butter(30), oil(20), water(150)], 0.78, [KATORI]),
  d('devil-chicken', 'Devil chicken (devilled chicken fry)', ['chicken devil fry', 'devilled chicken', 'devil chicken kerala'],
    [chicken(500), onion(200), capsicum(100), ketchup(40), chilliSauce(15), vinegar(10), oil(40)], 0.75, [SERVE]),
  d('gurda-fry', 'Gurda fry (mutton kidney)', ['kidney fry', 'gurda masala', 'mutton kidney fry', 'gurde'],
    [kidney(500), onion(200), tomato(100), oil(45), ...gg(20)], 0.72, [SERVE]),
  d('kaleji-gurda', 'Kaleji gurda dil (liver, kidney, heart fry)', ['kaleji gurda', 'kaleji gurda dil', 'mutton mix fry', 'offal fry'],
    [liver(300), kidney(200), heart(100), onion(200), tomato(100), oil(50), ...gg(20)], 0.72, [SERVE]),
  d('zaban-masala', 'Zaban masala (mutton tongue)', ['zaban', 'mutton tongue masala', 'tongue fry', 'zuban'],
    [tongue(500), onion(200), tomato(150), oil(40), ...gg(20), water(300)], 0.7, [SERVE]),
  d('chicken-gizzard-fry', 'Chicken gizzard fry', ['chicken gizzard', 'pota fry', 'gizzard masala', 'chicken pota'],
    [gizzard(500), onion(200), tomato(100), oil(45), ...gg(20)], 0.7, [SERVE]),
  d('phephda-curry', 'Phephda curry (mutton lungs)', ['phephde', 'fefsa', 'mutton lungs curry', 'kapura curry'],
    [lungs(500), onion(200), tomato(150), oil(45), ...gg(20), water(200)], 0.75, [KATORI]),
]

// ------------------------------------------------------------------ EVERYDAY EGGS
const EGGS: IndianRecipe[] = [
  d('scrambled-eggs', 'Scrambled eggs (butter, plain)', ['scrambled egg', 'egg scramble', 'plain scrambled eggs'],
    [egg(200), milk(30), butter(10)], 0.9, [piece('2 eggs (110 g)', 110)]),
  d('egg-sandwich', 'Egg sandwich (boiled egg mayo)', ['anda sandwich', 'egg mayo sandwich', 'boiled egg sandwich'],
    [bread(200), egg(300), mayo(40), butter(20), onion(40), tomato(50)], 0.97, [piece('1 sandwich (155 g)', 155)]),
  d('masala-egg-toast', 'Masala egg toast (Bombay toast)', ['bombay toast', 'masala french toast', 'eggy bread indian', 'masala bread toast with egg'],
    [bread(200), egg(200), milk(50), onion(40), oil(30)], 0.9, [piece('1 slice (90 g)', 90)]),
  d('anda-fry-masala', 'Anda fry masala (boiled egg fry)', ['egg masala fry', 'anda fry', 'egg fry masala', 'muttai varuval'],
    [egg(600), onion(150), tomato(100), oil(40)], 0.88, [piece('2 eggs with masala (120 g)', 120)]),
  d('egg-65', 'Egg 65', ['anda 65', 'egg sixty five'],
    [egg(600), cornstarch(30), maida(20), curd(30), oil(40)], 0.88, [SERVE]),
  d('egg-chilli', 'Egg chilli (chilli egg)', ['chilli egg', 'egg chilli dry', 'chilli anda'],
    [egg(600), cornstarch(40), oil(40), onion(100), capsicum(100), soy(20), chilliSauce(20), ketchup(20), oil(15)], 0.88, [SERVE]),
  d('egg-pulao', 'Egg pulao', ['anda pulao', 'egg pulav', 'muttai pulao'],
    [rice(400), egg(300), onion(150), tomato(80), oil(30), ghee(15), water(750)], RICE, [PLATE]),
  d('omelette-curry', 'Omelette curry', ['omlet curry', 'amlet curry', 'omelette ki sabzi'],
    [egg(300), oil(20), onion(150), tomato(150), oil(30), water(200)], CURRY, [KATORI]),
  d('egg-korma', 'Egg korma (anda kurma)', ['anda korma', 'egg kurma', 'muttai kurma'],
    [egg(600), onion(200), curd(100), cashew(30), oil(40), water(200)], CURRY, [piece('2 eggs with gravy (180 g)', 180)]),
  d('chicken-keema-samosa', 'Chicken keema samosa', ['chicken samosa', 'chicken kheema samosa'],
    [maida(250), ghee(30), water(100), chickenMince(250), onion(100), oil(15), oil(70)], 0.85, [piece('1 samosa (50 g)', 50)]),
]

// ------------------------------------------------------------------ MORE REGIONAL AND EVERYDAY
const trout = u(173717) // Fish, trout, rainbow, farmed, raw (Kullu / Kashmir trout)
const squid = u(174223) // Mollusks, squid, mixed species, raw (kanava / koonthal)
const horseGram = n('horse-gram')
const peanuts = n('peanuts')

const MORE: IndianRecipe[] = [
  d('chicken-puttu', 'Chicken puttu (erachi puttu)', ['erachi puttu', 'kozhi puttu', 'chicken masala puttu', 'irachi puttu'],
    [riceFlour(300), coconut(80), water(180), chicken(250), onion(150), tomato(60), coconutOil(25)], 0.85, [piece('1 puttu log (180 g)', 180)]),
  d('kozhi-pidi', 'Kozhi pidi (rice dumplings in chicken curry)', ['pidiyum kozhiyum', 'kozhi pidi', 'pidi and chicken curry'],
    [riceFlour(250), coconut(60), water(350), chicken(400), onion(150), coconutMilk(200), coconutOil(30), ...gg(15)], 0.85, [KATORI, PLATE]),
  d('kerala-beef-stew', 'Kerala beef stew (coconut milk)', ['beef ishtu', 'beef stew kerala', 'nadan beef stew'],
    [beef(500), potato(200), carrot(80), onion(150), coconutMilk(400), coconutOil(25), ...gg(15), water(200)], 0.85, [KATORI]),
  d('kanava-thoran', 'Kanava thoran (squid with coconut)', ['squid thoran', 'koonthal thoran', 'kanava peera'],
    [squid(400), coconut(100), shallot(60), coconutOil(15)], 0.75, [SERVE]),
  d('tuna-cutlet', 'Tuna cutlet', ['choora cutlet', 'tuna fish cutlet', 'canned tuna cutlet'],
    [cannedTuna(300), potato(300), onion(100), oil(10), egg(50), bread(60), oil(40)], 0.8, [CUTLET]),
  d('kozhi-rasam', 'Kozhi rasam (pepper chicken soup)', ['chicken rasam', 'nattu kozhi rasam', 'milagu kozhi rasam', 'chicken pepper rasam'],
    [chicken(200), tomato(150), shallot(60), pepper(10), ghee(10), water(900)], 0.85, [CUP, GLASS]),
  d('chepala-iguru', 'Chepala iguru (Andhra dry fish masala)', ['fish iguru', 'chepa iguru', 'chepala vepudu iguru'],
    [surmai(500), onion(200), tomato(100), oil(50), ...gg(15)], 0.72, [SERVE]),
  d('ulavacharu-chicken', 'Ulavacharu chicken (horse gram chicken)', ['ulavacharu kodi', 'horse gram chicken curry', 'ulava charu chicken'],
    [chicken(500), horseGram(100), onion(150), tomato(100), oil(45), cream(20), water(800)], 0.8, [KATORI]),
  d('machli-ka-salan', 'Machli ka salan (Hyderabadi fish curry)', ['machhi ka salan', 'hyderabadi fish curry', 'fish salan'],
    [surmai(500), peanuts(30), sesame(20), dryCoconut(30), tamarind(25), onion(150), oil(50), water(300)], CURRY, [KATORI]),
  d('prawn-recheado', 'Prawn recheado (Goan)', ['recheado prawns', 'prawns recheado masala', 'camarao recheado'],
    [prawn(500), onion(60), vinegar(30), chilliPowder(15), sugar(5), ...gg(15), oil(45)], 0.72, [SERVE]),
  d('ilish-jhol', 'Ilish macher jhol (light hilsa curry)', ['ilish jhol', 'ilish macher patla jhol', 'hilsa jhol', 'ilish begun jhol'],
    [hilsa(500), brinjal(150), potato(100), mustardOil(30), greenChilli(10), water(500)], 0.85, [KATORI]),
  d('chitol-muitha', 'Chitol macher muitha (fish dumpling curry)', ['chital muitha', 'chitol muitha', 'fish kofta bengali'],
    [rohu(500), potato(100), onion(150), tomato(100), curd(50), mustardOil(50), oil(40), water(300)], 0.8, [KATORI]),
  d('chicken-kabiraji', 'Chicken kabiraji (Kolkata cutlet)', ['chicken kobiraji', 'kabiraji cutlet chicken', 'chicken coverage'],
    [breast(400), egg(200), bread(60), onion(40), lemon(10), oil(60)], FRIED, [piece('1 kabiraji (130 g)', 130)]),
  d('mangsher-jhol', 'Mangsher jhol (Bengali Sunday mutton curry)', ['mangshor jhol', 'patla mangsho', 'robibarer mangsho', 'mutton jhol'],
    [goat(500), potato(250), onion(150), tomato(80), curd(60), mustardOil(45), ...gg(20), water(600)], 0.85, [KATORI]),
  d('dim-posto', 'Dim posto (eggs in poppy seed)', ['dimer posto', 'egg posto', 'eggs in poppy seed paste'],
    [egg(400), poppy(50), onion(60), mustardOil(30), water(150)], 0.8, [piece('2 eggs with posto (140 g)', 140)]),
  d('dimer-malaikari', 'Dimer malaikari (egg malai curry)', ['egg malai curry', 'dim malaikari', 'egg coconut milk curry bengali'],
    [egg(400), coconutMilk(250), onion(100), ghee(15), mustardOil(20), sugar(5)], 0.85, [piece('2 eggs with gravy (180 g)', 180)]),
  d('lucknowi-mutton-ishtu', 'Lucknowi mutton ishtu (stew)', ['mutton ishtoo', 'lucknowi mutton stew', 'gosht ishtu'],
    [goat(500), onion(200), curd(100), ghee(50), water(400)], 0.8, [KATORI]),
  d('chicken-nihari', 'Chicken nihari', ['murgh nihari', 'nihari chicken'],
    [chicken(500), atta(30), onion(150), ghee(60), oil(20), water(700)], 0.8, [KATORI]),
  d('chicken-keema-paratha', 'Chicken keema paratha', ['chicken kheema paratha', 'chicken keema parantha'],
    [atta(300), water(180), chickenMince(250), onion(80), oil(15), ghee(40)], 0.85, [piece('1 paratha (130 g)', 130)]),
  d('fish-do-pyaza', 'Fish do pyaza', ['machli do pyaza', 'macher dopiaza', 'fish dopiaza'],
    [rohu(500), onion(350), tomato(100), curd(50), mustardOil(45), water(150)], 0.8, [KATORI]),
  d('hara-masala-murgh', 'Hara masala murgh (green chicken curry)', ['green chicken curry', 'hyderabadi green chicken', 'hariyali murgh curry'],
    [chicken(500), coriander(80), mint(30), greenChilli(20), onion(150), curd(100), oil(45), water(150)], 0.8, [KATORI]),
  d('methi-gosht', 'Methi gosht (mutton with fenugreek)', ['methi mutton', 'methi wala gosht', 'fenugreek mutton'],
    [goat(500), methi(150), onion(200), tomato(150), curd(50), oil(50), ...gg(20), water(300)], 0.8, [KATORI]),
  d('bhindi-gosht', 'Bhindi gosht (mutton with okra)', ['bhindi mutton', 'okra mutton', 'bhendi gosht'],
    [goat(500), okra(300), onion(200), tomato(150), oil(60), ...gg(20), water(300)], 0.8, [KATORI]),
  d('matar-gosht', 'Matar gosht (mutton with peas)', ['mutton matar', 'matar mutton', 'gosht matar'],
    [goat(500), peas(250), onion(200), tomato(150), curd(50), oil(50), ...gg(20), water(400)], CURRY, [KATORI]),
  d('chha-gosht', 'Chha gosht (Himachali mutton in curd)', ['chha ghosht', 'himachali mutton', 'pahadi mutton curry'],
    [goat(500), curd(250), besan(20), onion(150), mustardOil(40), water(300)], 0.82, [KATORI]),
  d('trout-fry', 'Trout fry (Kullu / Kashmiri trout)', ['kullu trout', 'fried trout', 'trout masala fry'],
    [trout(500), riceFlour(15), lemon(10), mustardOil(40), ...gg(10)], 0.75, [piece('1 trout, edible part (150 g)', 150)]),
  d('yen-thongba', 'Yen thongba (Manipuri chicken curry)', ['manipuri chicken curry', 'yen thongba', 'yenna thongba'],
    [chicken(500), potato(150), onion(100), tomato(80), oil(25), water(400)], 0.85, [KATORI]),
  d('egg-do-pyaza', 'Egg do pyaza', ['anda do pyaza', 'egg dopiaza'],
    [egg(600), onion(350), tomato(150), oil(45), water(150)], 0.82, [piece('2 eggs with masala (160 g)', 160)]),
  d('muttai-sadam', 'Muttai sadam (egg rice)', ['egg rice', 'mutta choru', 'egg rice tamil'],
    [rice(300), water(600), egg(250), onion(120), oil(30)], RICE, [PLATE]),
]

// ------------------------------------------------------------------ COASTAL SHELLFISH, BIRYANIS AND MORE
const octopus = u(174218) // Mollusks, octopus, common, raw
const clam = u(174214) // Mollusks, clam, mixed species, raw (tisrya / kakka)
const oyster = u(174219) // Mollusks, oyster, Pacific, raw (kalwa)
const prunes = u(168162) // Plums, dried (aloo bukhara)

const MORE2: IndianRecipe[] = [
  d('octopus-roast', 'Octopus roast (Kerala / Goan)', ['neerali roast', 'polvo masala', 'octopus fry'],
    [octopus(500), onion(200), tomato(80), coconutOil(40), ...gg(20)], 0.68, [SERVE]),
  d('kallummakkaya-curry', 'Kallummakkaya curry (mussel coconut curry)', ['mussel curry', 'kadukka curry', 'xinaneo curry'],
    [mussel(400), coconut(150), onion(100), tomato(60), coconutOil(25), water(250)], 0.85, [KATORI]),
  d('tisryo-curry', 'Tisryo curry (clam coconut curry)', ['clam curry', 'kakka curry', 'tisrya ambat', 'tisreo curry'],
    [clam(400), coconut(150), onion(100), tamarind(10), oil(25), water(300)], 0.85, [KATORI]),
  d('kalwa-sukka', 'Kalwa sukka (oysters with coconut)', ['oyster sukka', 'kalva masala', 'oyster fry'],
    [oyster(400), coconut(120), onion(100), oil(30)], 0.75, [SERVE]),
  d('meen-thala-curry', 'Meen thala curry (fish head curry)', ['fish head curry', 'meen thalai kuzhambu', 'fish head kerala'],
    [surmai(400), shallot(100), tomato(100), coconut(100), tamarind(15), coconutOil(30), water(400)], CURRY, [KATORI]),
  d('beef-pickle', 'Beef pickle (Kerala)', ['beef achar', 'erachi achar', 'kerala beef pickle'],
    [beef(500), oil(120), chilliPowder(40), vinegar(50), ...gg(60)], 0.72, [TBSP]),
  d('pork-balchao', 'Pork balchao (Goan)', ['goan pork balchao', 'pork pickle goan'],
    [porkShoulder(500), onion(200), vinegar(60), sugar(15), chilliPowder(15), oil(30), ...gg(20)], 0.72, [SERVE]),
  d('chingri-bhapa', 'Chingri bhapa (steamed prawns in mustard)', ['bhapa chingri', 'steamed prawns bengali', 'chingri bhapa shorshe'],
    [prawn(500), mustardSeed(35), coconut(50), curd(40), greenChilli(15), mustardOil(35)], 0.85, [SERVE]),
  d('ilish-pulao', 'Ilish pulao (hilsa pulao)', ['ilish polao', 'hilsa pulao', 'ilish biryani'],
    [hilsa(400), rice(400), onion(150), curd(80), ghee(40), mustardOil(30), water(750)], RICE, [PLATE]),
  d('bhatkali-chicken-biryani', 'Bhatkali chicken biryani', ['bhatkal biryani', 'bhatkali biryani', 'navayath biryani'],
    [chicken(500), rice(450), onion(400), tomato(250), curd(100), greenChilli(30), oil(70), ghee(30), water(800)], RICE, [BIRYANI, PLATE]),
  d('bhatkali-mutton-biryani', 'Bhatkali mutton biryani', ['bhatkal mutton biryani', 'navayath mutton biryani'],
    [goat(500), rice(450), onion(400), tomato(250), curd(100), greenChilli(30), oil(70), ghee(30), water(850)], RICE, [BIRYANI, PLATE]),
  d('sindhi-mutton-biryani', 'Sindhi mutton biryani (with potato and plums)', ['sindhi biryani', 'sindhi gosht biryani'],
    [goat(500), rice(450), potato(200), prunes(40), onion(300), tomato(200), curd(150), oil(80), water(850)], RICE, [BIRYANI, PLATE]),
  d('kalyani-biryani', 'Kalyani biryani (Hyderabadi beef biryani)', ['kalyani beef biryani', 'gareebon ki biryani', 'kalyani biryani hyderabad'],
    [beef(400), rice(500), onion(250), tomato(150), curd(80), oil(60), water(900)], RICE, [BIRYANI, PLATE]),
  d('mutton-tahari', 'Mutton tahari', ['gosht tahari', 'mutton tehri', 'mutton tahiri'],
    [goat(400), rice(400), potato(150), onion(200), tomato(100), curd(80), oil(50), ghee(20), water(800)], RICE, [PLATE]),
  d('seyal-gosht', 'Seyal gosht (Sindhi mutton)', ['sindhi seyal gosht', 'sindhi mutton curry'],
    [goat(500), onion(250), tomato(250), coriander(40), oil(55), ...gg(20), water(200)], 0.8, [KATORI]),
  d('nethili-kuzhambu', 'Nethili meen kuzhambu (anchovy curry)', ['nethili kulambu', 'anchovy curry', 'netholi curry'],
    [anchovy(400), shallot(100), tomato(150), tamarind(25), coconut(60), sesameOil(35), water(400)], CURRY, [KATORI]),
  d('bombil-curry', 'Bombil curry (Bombay duck kalvan)', ['bombil kalvan', 'bombay duck curry', 'bombil kalwan'],
    [bombil(400), coconut(120), onion(100), tamarind(10), oil(25), water(250)], 0.85, [KATORI]),
  d('russian-pattice', 'Russian pattice (Parsi chicken croquettes)', ['russian patties', 'chicken russian pattice', 'parsi croquettes'],
    [chicken(300), potato(250), milk(200), maida(30), butter(20), cheese(30), bread(60), egg(50), oil(50)], FRIED, [piece('1 pattice (60 g)', 60)]),
  d('lagan-nu-stew', 'Lagan nu stew (Parsi mutton and vegetable stew)', ['parsi stew', 'lagan stew', 'parsi wedding stew'],
    [goat(400), potato(200), carrot(100), peas(100), u(168482)(150), onion(150), tomato(150), vinegar(15), jaggery(15), oil(40), water(300)], CURRY, [KATORI]),
  d('kid-gosht', 'Kid gosht (Parsi mutton in coconut gravy)', ['parsi kid gosht', 'kid ghosht'],
    [goat(500), coconutMilk(300), cashew(20), poppy(10), onion(200), potato(150), oil(40), water(200)], CURRY, [KATORI]),
  d('kedgeree', 'Kedgeree (Anglo-Indian fish khichdi)', ['anglo indian kedgeree', 'fish khichdi', 'khichri with fish'],
    [rice(250), masoorDal(80), whiting(300), egg(150), butter(40), onion(100), water(800)], RICE, [PLATE]),
  d('chicken-chintamani', 'Chicken chintamani (Erode)', ['chintamani chicken', 'kongu chintamani'],
    [chicken(500), shallot(200), chilliPowder(10), sesameOil(45)], 0.7, [SERVE]),
  d('uppu-kari', 'Uppu kari (Chettinad mutton)', ['uppukari', 'chettinad uppu kari', 'salt mutton fry'],
    [goat(500), shallot(200), sesameOil(45), water(150)], 0.66, [SERVE]),
]

export const RECIPES_NONVEG2: IndianRecipe[] = [
  ...KERALA,
  ...MANGALORE,
  ...GOAN,
  ...MAHARASHTRA,
  ...PARSI_BOHRI,
  ...HYDERABAD,
  ...TAMIL,
  ...ANDHRA,
  ...BENGAL,
  ...NORTHEAST,
  ...KASHMIR,
  ...MUGHLAI,
  ...PUNJAB,
  ...OTHERS,
  ...EGGS,
  ...MORE,
  ...MORE2,
]
