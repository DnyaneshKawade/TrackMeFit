// Restaurant, dhaba, cafe, food court and cloud kitchen dishes as Indian menus
// list them: Punjabi and Mughlai gravies, tandoor starters, Indo-Chinese,
// Indian-style pizza, burgers, wraps, sandwiches, pasta, sizzlers, cafe drinks
// and restaurant versions (more butter, cream and oil) of home dishes.
// Amounts are for one restaurant batch (or one serving for burgers, pizzas,
// rolls and drinks). Spices, salt and herbs under ~5 g are left out.

import type { RecipeIngredient } from '../../recipe'
import type { Portion } from '../../types'
import { KATORI, PLATE, ing, piece, r, usdaIng, type IndianRecipe } from '../define'

type Ing = RecipeIngredient
const n = (key: string) => (g: number): Ing => ing(key, g)
const u = (id: number) => (g: number): Ing => usdaIng(id, g)

// Catalogue ingredients
const water = n('water')
const oil = n('oil')
const ghee = n('ghee')
const onion = n('onion')
const tomato = n('tomato')
const potato = n('potato')
const carrot = n('carrot')
const cauliflower = n('cauliflower')
const spinach = n('spinach')
const okra = n('okra')
const curd = n('curd')
const paneer = n('paneer')
const milk = n('milk')
const sugar = n('sugar')
const egg = n('egg')
const chicken = n('chicken') // meat only, boneless curry cut
const rice = n('rice')
const besan = n('besan')
const toorDal = n('toor-dal')
const moongDal = n('moong-dal')
const peanuts = n('peanuts')
const soyaChaap = n('north-soya-chaap')
const schezwan = n('schezwan-sauce')
const babyCorn = n('restaurant-baby-corn')
const blueCuracao = n('restaurant-blue-curacao-syrup')
const hazelnutSyrup = n('restaurant-hazelnut-syrup')

// USDA SR Legacy (fdc_id)
const maida = u(169761) // Wheat flour, white, all-purpose, unenriched
const cornflour = u(169698) // Cornstarch
const riceFlour = u(169714) // Rice flour, white
const breadCrumbs = u(174928) // Bread, crumbs, dry, grated, plain
const pasta = u(169736) // Pasta, dry, enriched (penne, spaghetti, macaroni)
const noodles = u(169731) // Noodles, egg, dry (hakka noodles)
const riceNoodles = u(169742) // Rice noodles, dry
const bread = u(174924) // Bread, white, commercially prepared
const bun = u(172796) // Rolls, hamburger or hotdog, plain
const pav = u(172793) // Rolls, dinner, plain (pav)
const subRoll = u(172795) // Rolls, french (sub roll, baguette)
const pita = u(174915) // Bread, pita, white (kuboos)
const tortilla = u(175037) // Tortillas, flour
const nachoChips = u(167558) // Snacks, tortilla chips, plain
const wontonWrapper = u(172802) // Wonton wrappers
const butter = u(173410) // Butter, salted
const cream = u(170858) // Cream, fluid, light whipping (Indian fresh cream)
const hungCurd = u(171304) // Yogurt, Greek, plain, whole milk (hung curd)
const mozzarella = u(170846) // Cheese, mozzarella, whole milk, low moisture
const cheeseSlice = u(171290) // Cheese, pasteurized process, American (cheese slice / cube)
const cheddar = u(173414) // Cheese, cheddar
const parmesan = u(171247) // Cheese, parmesan, grated
const cheeseSauce = u(171191) // Sauce, cheese, ready-to-serve (cheese dip)
const mayo = u(171009) // Salad dressing, mayonnaise, regular
const ketchup = u(168556) // Catsup
const chilliSauce = u(174527) // Sauce, pepper or hot (red chilli sauce)
const soy = u(174277) // Soy sauce
const vinegar = u(172237) // Vinegar, distilled
const sweetSour = u(174066) // Sauce, sweet and sour
const tomatoPuree = u(170460) // Tomato puree, canned
const pastaSauce = u(171192) // Sauce, pasta, marinara (pizza and pasta sauce)
const bbqSauce = u(171830) // Sauce, barbecue
const pesto = u(171579) // Sauce, pesto, ready-to-serve
const salsa = u(174524) // Sauce, salsa, ready-to-serve
const hummus = u(174289) // Hummus, commercial
const falafel = u(172455) // Falafel, home-prepared (already fried)
const refriedBeans = u(172438) // Refried beans, canned
const rajmaBoiled = u(173734) // Beans, black, mature seeds, raw (burrito beans)
const honey = u(169640) // Honey
const sesame = u(170150) // Seeds, sesame seeds, whole, dried
const oliveOil = u(171413) // Oil, olive
const coconutMilk = u(170173) // Coconut milk, canned
const cashew = u(170162) // Nuts, cashew nuts, raw
const almond = u(170567) // Nuts, almonds
const raisin = u(168165) // Raisins, dark, seedless
const dryCoconut = u(170170) // Coconut, dried (desiccated)
const olives = u(169094) // Olives, ripe, canned
const jalapeno = u(170080) // Peppers, jalapeno, canned
const mustard = u(172234) // Mustard, prepared, yellow
const sourCream = u(171257) // Cream, sour, cultured
const croutons = u(172752) // Croutons, seasoned
const feta = u(173420) // Cheese, feta
const tofu = u(172475) // Tofu, raw, firm
// vegetables and fruit
const capsicum = u(170427) // Peppers, sweet, green, raw
const redCapsicum = u(170108) // Peppers, sweet, red, raw
const peas = u(170419) // Peas, green, raw
const beans = u(169961) // Beans, snap, green, raw
const cabbage = u(169975) // Cabbage, raw
const mushroom = u(169251) // Mushrooms, white, raw
const corn = u(169998) // Corn, sweet, yellow, raw
const broccoli = u(170379) // Broccoli, raw
const zucchini = u(169291) // Squash, zucchini, raw
const springOnion = u(170005) // Onions, spring or scallions, raw
const garlic = u(169230) // Garlic, raw
const ginger = u(169231) // Ginger root, raw
const greenChilli = u(170497) // Peppers, hot chili, green, raw
const celery = u(169988) // Celery, raw
const lettuce = u(169248) // Lettuce, iceberg, raw
const romaine = u(169247) // Lettuce, cos or romaine, raw
const cucumber = u(168409) // Cucumber, with peel, raw
const baingan = u(169228) // Eggplant, raw
const lauki = u(169232) // Gourd, white-flowered (calabash), raw
const lotusStem = u(169250) // Lotus root, raw (kamal kakdi)
const bambooShoot = u(169210) // Bamboo shoots, raw
const beanSprouts = u(169957) // Mung beans, sprouted, raw
const lemon = u(167747) // Lemon juice, raw
const lime = u(168156) // Lime juice, raw
const mint = u(173475) // Spearmint, fresh (pudina)
const pineapple = u(169124) // Pineapple, raw
const pineappleJuice = u(169947) // Pineapple juice, unsweetened
const watermelon = u(167765) // Watermelon, raw
const peach = u(169928) // Peaches, yellow, raw
const mango = u(169910) // Mangos, raw
const apple = u(171688) // Apples, raw, with skin
const avocado = u(171705) // Avocados, raw
const pumpkin = u(168448) // Pumpkin, raw
const strawberry = u(167762) // Strawberries, raw
const blueberry = u(171711) // Blueberries, raw
const orangeJuice = u(169098) // Orange juice, raw
const frenchBread = u(172675) // Bread, french or vienna
const teriyaki = u(171167) // Sauce, teriyaki
const oysterSauce = u(174529) // Sauce, oyster
const basil = u(172232) // Basil, fresh
const pistachio = u(170184) // Nuts, pistachio, raw
// meat and fish
const breast = u(171077) // Chicken breast, skinless, boneless, raw
const legMeat = u(173619) // Chicken leg, meat only, raw
const wings = u(172390) // Chicken wing, meat and skin, raw
const chickenMince = u(171116) // Chicken, ground, raw
const chickenSausage = u(171624) // Frankfurter, chicken (chicken sausage)
const pepperoni = u(174575) // Pepperoni, sliced
const goat = u(175303) // Game meat, goat, raw (Indian "mutton")
const lambMince = u(174370) // Lamb, ground, raw (mutton keema)
const prawn = u(175179) // Crustaceans, shrimp, raw
const basa = u(174186) // Fish, catfish, channel, raw (basa)
// cafe
const espresso = u(171891) // Coffee, brewed, espresso
const instantCoffee = u(171893) // Coffee, instant, powder
const blackTea = u(173227) // Tea, black, brewed
const iceCream = u(167575) // Ice creams, vanilla
const chocIceCream = u(168809) // Ice creams, chocolate
const chocSyrup = u(168835) // Syrups, chocolate, fudge-type
const cocoa = u(169593) // Cocoa, dry powder, unsweetened
const whippedCream = u(170860) // Cream, whipped, pressurized topping
const caramel = u(168841) // Toppings, butterscotch or caramel
const kitkat = u(167992) // Candies, wafer bar (KitKat)
const brownie = u(172713) // Cookies, brownies, commercially prepared
const soda = u(174842) // Club soda
const lemonSoda = u(173205) // Lemon-lime soda (Sprite, 7Up)

/** Ginger-garlic paste, split evenly. */
const gg = (g: number): Ing[] => [garlic(g / 2), ginger(g / 2)]
const total = (ings: Ing[]) => ings.reduce((s, i) => s + i.grams, 0)

/** Cooked weight = raw total x yield factor (an estimate until weighed). */
const d = (key: string, name: string, aliases: string[], ings: Ing[], yieldF: number, portions: Portion[]): IndianRecipe =>
  r(key, name, aliases, ings, Math.round(total(ings) * yieldF), portions)

/** One serving (a burger, a roll, a glass): the whole batch is the portion. */
const one = (key: string, name: string, aliases: string[], ings: Ing[], yieldF: number, what: string): IndianRecipe => {
  const w = Math.round(total(ings) * yieldF)
  return r(key, name, aliases, ings, w, [piece(`${what} (${w} g)`, w)])
}

const SOUP = piece('1 bowl (250 ml)', 250)
const STARTER = piece('1 plate starter (200 g)', 200)
const KEBAB = (g: number) => piece(`1 piece (${g} g)`, g)
const RICE_PLATE = piece('1 restaurant plate (350 g)', 350)
const BIRYANI_PLATE = piece('1 restaurant plate (400 g)', 400)
const BOWL = piece('1 bowl meal (400 g)', 400)

// Restaurant gravy bases
/** Makhani (butter-tomato-cashew) gravy for one batch. */
const MAKHANI: Ing[] = [tomato(400), onion(60), cashew(30), butter(50), cream(60), sugar(8), water(120)]
/** White (Mughlai) gravy: onion, cashew, curd, cream. */
const WHITE: Ing[] = [onion(150), cashew(50), curd(80), cream(60), butter(20), oil(15), water(150)]
/** Indo-Chinese sauce for a gravy dish. */
const CHINESE_GRAVY: Ing[] = [soy(20), chilliSauce(15), ketchup(15), vinegar(10), cornflour(20), water(300), ...gg(20)]
/** Batter for Indo-Chinese fried starters. */
const BATTER = (g: number): Ing[] => [cornflour(g * 0.6), maida(g * 0.4), water(g * 0.6)]
/** Indo-Chinese toss: onion, capsicum and sauces. */
const TOSS: Ing[] = [onion(80), capsicum(80), springOnion(20), soy(12), chilliSauce(12), ketchup(12), vinegar(5), ...gg(16)]

// ============================================================ NORTH INDIAN VEG GRAVIES
const VEG_GRAVIES: IndianRecipe[] = [
  d('kaju-curry', 'Kaju curry (restaurant)', ['kaju masala', 'cashew curry', 'kaju butter masala', 'kaju ki sabzi'],
    [cashew(180), onion(150), tomato(300), curd(40), butter(30), cream(50), oil(30), water(200)], 0.8, [KATORI]),
  d('kaju-paneer', 'Kaju paneer masala', ['kaju paneer', 'paneer kaju curry', 'cashew paneer'],
    [paneer(150), cashew(80), onion(120), tomato(250), butter(30), cream(50), oil(20), water(150)], 0.8, [KATORI]),
  d('paneer-kolhapuri', 'Paneer Kolhapuri', ['kolhapuri paneer', 'spicy paneer kolhapuri'],
    [paneer(200), onion(150), tomato(200), dryCoconut(30), oil(45), ...gg(20), water(150)], 0.8, [KATORI]),
  d('veg-kolhapuri', 'Veg Kolhapuri', ['kolhapuri veg', 'mix veg kolhapuri', 'vegetable kolhapuri'],
    [potato(100), carrot(60), beans(60), peas(60), cauliflower(100), paneer(50), onion(150), tomato(200), dryCoconut(30), oil(45), water(150)], 0.82, [KATORI]),
  d('paneer-angara', 'Paneer angara (smoky spicy gravy)', ['angara paneer', 'paneer angaara'],
    [paneer(200), onion(150), tomato(250), curd(40), cream(40), butter(20), oil(30), ...gg(20), water(100)], 0.8, [KATORI]),
  d('paneer-patiala', 'Paneer Patiala', ['patiala paneer', 'paneer patialashahi'],
    [paneer(200), onion(150), tomato(250), cashew(30), cream(50), butter(20), oil(25), capsicum(50), water(100)], 0.8, [KATORI]),
  d('paneer-khurchan', 'Paneer khurchan (dry, tawa)', ['khurchan paneer', 'paneer khurchan masala'],
    [paneer(250), capsicum(100), onion(120), tomato(150), butter(20), oil(25)], 0.82, [KATORI]),
  d('paneer-peshawari', 'Paneer Peshawari', ['peshawari paneer'],
    [paneer(200), onion(150), tomato(250), curd(60), oil(35), butter(15), ...gg(20), water(80)], 0.8, [KATORI]),
  d('paneer-amritsari', 'Amritsari paneer masala (dhaba)', ['amritsari paneer', 'paneer amritsari'],
    [paneer(200), onion(150), tomato(200), curd(50), butter(30), oil(20), ...gg(20), water(100)], 0.8, [KATORI]),
  d('paneer-kali-mirch', 'Paneer kali mirch (white gravy)', ['kali mirch paneer', 'pepper paneer white gravy', 'paneer white gravy'],
    [paneer(200), ...WHITE], 0.8, [KATORI]),
  d('cheese-butter-masala', 'Cheese butter masala', ['cheese masala', 'cheese makhani', 'cheese butter'],
    [cheeseSlice(150), ...MAKHANI, oil(10)], 0.82, [KATORI]),
  d('veg-hyderabadi', 'Veg Hyderabadi (green gravy)', ['hyderabadi veg', 'veg hyderabadi green'],
    [carrot(80), beans(80), peas(60), cauliflower(100), potato(80), spinach(150), onion(120), cashew(20), curd(60), oil(40), water(150)], 0.82, [KATORI]),
  d('veg-kheema', 'Veg kheema masala', ['vegetable kheema', 'veg kheema pav'],
    [peas(150), carrot(80), beans(80), capsicum(60), paneer(60), onion(150), tomato(150), butter(20), oil(25), water(50)], 0.82, [KATORI]),
  d('veg-jaipuri', 'Veg Jaipuri', ['jaipuri veg', 'vegetable jaipuri', 'veg jaipuri with papad'],
    [carrot(80), beans(80), peas(60), cauliflower(100), potato(80), capsicum(50), paneer(50), cashew(20), onion(150), tomato(200), oil(40), cream(30), water(100)], 0.82, [KATORI]),
  d('veg-tawa-masala', 'Tawa sabzi (mixed veg on tawa)', ['tawa sabzi', 'tawa veg', 'tawa mix veg'],
    [potato(150), baingan(100), capsicum(80), okra(100), onion(100), tomato(100), oil(50)], 0.8, [KATORI]),
  d('palak-mushroom', 'Palak mushroom', ['mushroom palak', 'spinach mushroom curry'],
    [mushroom(200), spinach(400), onion(100), tomato(80), cream(30), oil(25), ...gg(16), water(60)], 0.78, [KATORI]),
  d('mushroom-shahi-korma', 'Shahi mushroom korma', ['mushroom korma', 'shahi mushroom', 'mushroom white gravy'],
    [mushroom(350), ...WHITE], 0.8, [KATORI]),
  d('methi-malai-mushroom', 'Methi malai mushroom', ['mushroom methi malai', 'methi mushroom'],
    [mushroom(300), n('methi-leaves')(100), onion(120), cashew(30), cream(80), butter(20), oil(15), milk(100)], 0.8, [KATORI]),
  d('paneer-bhuna-masala', 'Paneer bhuna masala', ['bhuna paneer', 'paneer bhuna'],
    [paneer(250), onion(250), tomato(200), oil(45), butter(10), ...gg(20)], 0.78, [KATORI]),
  d('mushroom-tikka-masala', 'Mushroom tikka masala', ['mushroom tikka gravy', 'tandoori mushroom masala'],
    [mushroom(300), curd(60), onion(120), tomato(250), cream(50), butter(25), oil(25), water(80)], 0.8, [KATORI]),
  d('baby-corn-masala', 'Baby corn masala', ['babycorn masala', 'baby corn curry'],
    [babyCorn(250), capsicum(80), onion(150), tomato(200), cream(30), oil(35), water(100)], 0.8, [KATORI]),
  d('kadai-baby-corn', 'Kadai baby corn', ['baby corn kadai', 'kadhai babycorn'],
    [babyCorn(250), capsicum(120), onion(150), tomato(200), oil(35), butter(10), water(60)], 0.8, [KATORI]),
  d('corn-capsicum-masala', 'Corn capsicum masala', ['sweet corn capsicum sabzi', 'makai shimla mirch'],
    [corn(250), capsicum(150), onion(120), tomato(200), cream(30), butter(15), oil(25), water(80)], 0.8, [KATORI]),
  d('chole-paneer', 'Chole paneer', ['paneer chole', 'chana paneer masala'],
    [ing('chana', 150), water(500), paneer(120), onion(150), tomato(200), oil(35), butter(15), ...gg(20)], 0.8, [KATORI]),
  d('chaap-tikka-masala', 'Soya chaap tikka masala', ['chaap tikka masala', 'tandoori chaap masala', 'chaap makhani'],
    [soyaChaap(300), curd(60), ...MAKHANI, oil(15)], 0.8, [KATORI]),
  d('mushroom-matar-restaurant', 'Matar mushroom (restaurant)', ['mushroom matar restaurant', 'matar mushroom masala'],
    [mushroom(250), peas(150), onion(150), tomato(250), cashew(20), cream(40), butter(20), oil(30), water(100)], 0.8, [KATORI]),
  d('lauki-kofta-restaurant', 'Lauki kofta (restaurant, cream gravy)', ['dudhi kofta restaurant', 'ghiya kofta restaurant'],
    [lauki(400), besan(80), oil(45), onion(120), tomato(250), cashew(20), cream(40), butter(15), water(150)], 0.75, [KATORI]),
  d('bhindi-masala-restaurant', 'Bhindi masala (restaurant)', ['bhindi masala dhaba', 'okra masala restaurant'],
    [okra(400), onion(150), tomato(150), oil(55), ...gg(10)], 0.75, [KATORI]),
  d('baingan-bharta-dhaba', 'Baingan bharta (dhaba style, butter)', ['dhaba baingan bharta', 'bharta restaurant', 'baingan ka bharta punjabi'],
    [baingan(700), onion(150), tomato(150), peas(50), oil(30), butter(25), ...gg(16)], 0.72, [KATORI]),
  d('kadhi-pakora-dhaba', 'Kadhi pakora (dhaba, ghee tadka)', ['dhaba kadhi', 'punjabi kadhi restaurant'],
    [curd(400), besan(90), water(600), onion(80), oil(35), ghee(20)], 0.8, [KATORI]),
  d('aloo-matar-dhaba', 'Aloo matar (dhaba style)', ['dhaba aloo matar', 'aloo mutter restaurant'],
    [potato(300), peas(200), onion(150), tomato(200), oil(40), butter(10), water(250)], 0.85, [KATORI]),
  d('jeera-aloo-dhaba', 'Jeera aloo (restaurant, ghee)', ['jeera aloo restaurant', 'aloo jeera dhaba'],
    [potato(500), ghee(30), oil(15)], 0.85, [KATORI]),
  d('keema-matar-dhaba', 'Keema matar (dhaba, ghee)', ['dhaba keema', 'mutton keema matar restaurant', 'kheema mutter dhaba'],
    [lambMince(500), peas(150), onion(200), tomato(200), ghee(30), oil(20), curd(50), ...gg(20), water(100)], 0.78, [KATORI]),
]

// ============================================================ VEG TANDOOR STARTERS
const VEG_STARTERS: IndianRecipe[] = [
  d('bharwan-khumb', 'Bharwan khumb (stuffed tandoori mushroom)', ['stuffed mushroom tandoori', 'bharwan mushroom', 'stuffed tandoori khumb'],
    [mushroom(300), paneer(60), cheeseSlice(20), cashew(10), curd(50), cream(20), oil(15)], 0.8, [STARTER]),
  d('tandoori-aloo', 'Tandoori aloo (bharwan)', ['bharwan aloo', 'stuffed tandoori potato', 'tandoori bharwa aloo'],
    [potato(400), paneer(60), cashew(15), raisin(10), curd(60), oil(25), butter(10)], 0.8, [STARTER, KEBAB(50)]),
  d('tandoori-gobi', 'Tandoori gobi (restaurant)', ['gobi tikka', 'tandoori cauliflower restaurant'],
    [cauliflower(400), curd(80), besan(20), oil(25)], 0.78, [STARTER]),
  d('mushroom-tikka', 'Mushroom tikka (tandoori)', ['tandoori mushroom', 'mushroom tikka dry', 'malai mushroom'],
    [mushroom(300), curd(60), besan(10), oil(20), capsicum(60), onion(60)], 0.75, [STARTER]),
  d('malai-broccoli', 'Tandoori malai broccoli', ['broccoli tikka', 'malai broccoli', 'tandoori broccoli'],
    [broccoli(300), cream(40), cheeseSlice(20), curd(40), cashew(15)], 0.8, [STARTER]),
  d('hara-bhara-kebab', 'Hara bhara kebab', ['hara bhara kabab', 'spinach peas kebab', 'green kebab'],
    [spinach(200), peas(100), potato(150), besan(30), cashew(10), oil(40)], 0.75, [STARTER, KEBAB(35)]),
  d('dahi-ke-kebab', 'Dahi ke kebab', ['dahi kebab', 'hung curd kebab', 'curd kebab'],
    [hungCurd(250), paneer(50), breadCrumbs(60), onion(30), cashew(10), oil(40)], 0.85, [STARTER, KEBAB(35)]),
  d('veg-seekh-kebab', 'Veg seekh kebab', ['veg sheekh kebab', 'vegetable seekh kabab'],
    [potato(150), carrot(80), beans(80), peas(60), paneer(50), besan(30), breadCrumbs(20), oil(25)], 0.8, [STARTER, KEBAB(40)]),
  d('paneer-seekh-kebab', 'Paneer seekh kebab', ['paneer sheekh kebab', 'paneer seekh'],
    [paneer(200), potato(50), capsicum(40), onion(40), besan(20), oil(20)], 0.85, [STARTER, KEBAB(40)]),
  d('achari-chaap', 'Achari soya chaap (tandoori)', ['achari chaap', 'chaap achari tikka'],
    [soyaChaap(300), curd(80), oil(25), butter(10)], 0.85, [STARTER]),
  d('cheese-corn-balls', 'Cheese corn balls', ['corn cheese balls', 'cheese balls', 'cheesy corn bites'],
    [corn(100), potato(150), mozzarella(60), cheeseSlice(30), breadCrumbs(40), maida(20), water(30), oil(45)], 0.82, [STARTER, KEBAB(25)]),
  d('paneer-popcorn', 'Paneer popcorn', ['crispy paneer bites', 'paneer nuggets'],
    [paneer(200), maida(30), cornflour(20), breadCrumbs(30), water(40), oil(30)], 0.85, [STARTER]),
]

// ============================================================ INDO-CHINESE
const IC_SOUPS: IndianRecipe[] = [
  d('veg-lung-fung-soup', 'Lung fung soup (veg)', ['lung fung soup', 'lungfung soup veg'],
    [cabbage(50), carrot(30), mushroom(30), beans(20), cornflour(18), soy(12), oil(8), water(550), ...gg(10)], 0.88, [SOUP]),
  d('chicken-lung-fung-soup', 'Lung fung soup (chicken)', ['chicken lung fung soup'],
    [chicken(100), egg(30), cabbage(40), mushroom(30), cornflour(18), soy(12), oil(8), water(550), ...gg(10)], 0.88, [SOUP]),
  d('burnt-garlic-soup', 'Burnt garlic soup (veg)', ['burnt garlic vegetable soup', 'garlic soup'],
    [garlic(25), cabbage(50), carrot(30), broccoli(30), cornflour(15), oil(10), water(550)], 0.88, [SOUP]),
  d('tom-kha-soup', 'Tom kha soup (Thai coconut, veg)', ['tom kha', 'thai coconut soup', 'tom kha gai veg'],
    [coconutMilk(200), mushroom(80), onion(30), lime(20), sugar(5), chilliSauce(5), water(350)], 0.9, [SOUP]),
  d('lemon-coriander-soup', 'Lemon coriander soup (veg)', ['lemon coriander soup', 'lemon dhania soup'],
    [cabbage(40), carrot(30), beans(20), cornflour(15), lemon(20), oil(5), water(550), ...gg(10)], 0.88, [SOUP]),
  d('veg-wonton-soup', 'Veg wonton soup', ['wonton soup', 'won ton soup veg'],
    [wontonWrapper(50), cabbage(60), carrot(30), oil(8), soy(10), water(550), ...gg(10)], 0.88, [SOUP]),
  d('talumein-soup', 'Talumein soup (veg)', ['tai lu mein soup', 'talumein', 'noodle soup veg'],
    [noodles(40), cabbage(50), carrot(30), mushroom(30), cornflour(10), soy(10), oil(8), water(550)], 0.88, [SOUP]),
  d('chicken-lemon-coriander-soup', 'Chicken lemon coriander soup', ['lemon coriander chicken soup'],
    [chicken(100), cabbage(30), carrot(20), cornflour(15), lemon(20), oil(5), water(550), ...gg(10)], 0.88, [SOUP]),
  d('chicken-hot-and-sour-soup', 'Chicken hot and sour soup', ['hot n sour chicken soup', 'chicken hot sour'],
    [chicken(100), egg(30), cabbage(30), carrot(20), mushroom(30), cornflour(18), soy(15), vinegar(15), chilliSauce(10), oil(8), water(500)], 0.88, [SOUP]),
  d('chicken-wonton-soup', 'Chicken wonton soup', ['wonton soup chicken', 'chicken won ton soup'],
    [wontonWrapper(50), chickenMince(80), cabbage(40), oil(5), soy(10), water(550), ...gg(10)], 0.88, [SOUP]),
  d('chicken-talumein-soup', 'Chicken talumein soup', ['chicken noodle soup chinese', 'chicken tai lu mein'],
    [noodles(40), chicken(80), egg(30), cabbage(40), carrot(20), cornflour(10), soy(10), oil(8), water(550)], 0.88, [SOUP]),
  d('egg-drop-soup', 'Egg drop soup', ['egg flower soup', 'egg soup chinese'],
    [egg(100), cornflour(15), springOnion(20), soy(10), oil(5), water(550)], 0.88, [SOUP]),
  d('veg-tom-yum-soup', 'Tom yum soup (veg)', ['tom yum veg', 'thai soup veg'],
    [mushroom(80), tomato(60), onion(30), lime(20), chilliSauce(10), sugar(5), oil(5), water(550)], 0.88, [SOUP]),
  d('chicken-tom-yum-soup', 'Tom yum soup (chicken)', ['tom yum chicken', 'thai chicken soup'],
    [chicken(100), mushroom(60), tomato(60), onion(30), lime(20), chilliSauce(10), sugar(5), oil(5), water(550)], 0.88, [SOUP]),
]

const IC_VEG: IndianRecipe[] = [
  d('veg-crispy', 'Crispy veg (Indo-Chinese)', ['veg crispy', 'crispy vegetables', 'crispy chilli veg'],
    [carrot(100), beans(100), cauliflower(100), capsicum(50), ...BATTER(80), oil(55), soy(10), chilliSauce(10), ...gg(10)], 0.78, [STARTER]),
  d('crispy-baby-corn', 'Crispy baby corn', ['baby corn crispy', 'crispy babycorn salt and pepper'],
    [babyCorn(250), ...BATTER(60), oil(45), ...TOSS], 0.8, [STARTER]),
  d('baby-corn-chilli', 'Chilli baby corn (dry)', ['baby corn chilli', 'chilli babycorn dry'],
    [babyCorn(250), ...BATTER(50), oil(40), ...TOSS], 0.8, [STARTER]),
  d('baby-corn-manchurian', 'Baby corn manchurian (dry)', ['babycorn manchurian', 'baby corn manchurian dry'],
    [babyCorn(250), ...BATTER(60), oil(45), soy(15), ketchup(15), chilliSauce(10), springOnion(20), ...gg(16)], 0.8, [STARTER]),
  d('honey-chilli-lotus-stem', 'Honey chilli lotus stem', ['crispy lotus stem', 'honey chilli kamal kakdi', 'crispy honey chilli lotus'],
    [lotusStem(250), ...BATTER(60), oil(50), honey(30), chilliSauce(10), soy(10), sesame(5)], 0.78, [STARTER]),
  d('pepper-mushroom-dry', 'Mushroom pepper salt (dry)', ['pepper mushroom', 'salt and pepper mushroom', 'mushroom pepper dry'],
    [mushroom(300), ...BATTER(50), oil(40), onion(60), capsicum(50), soy(8), ...gg(10)], 0.75, [STARTER]),
  d('mushroom-manchurian-dry', 'Mushroom manchurian (dry)', ['mushroom manchurian', 'manchurian mushroom'],
    [mushroom(300), ...BATTER(60), oil(40), soy(15), ketchup(15), chilliSauce(10), springOnion(20), ...gg(16)], 0.75, [STARTER]),
  d('paneer-manchurian-dry', 'Paneer manchurian (dry)', ['paneer manchurian', 'manchurian paneer'],
    [paneer(250), ...BATTER(40), oil(30), soy(15), ketchup(15), chilliSauce(10), springOnion(20), ...gg(16)], 0.85, [STARTER]),
  d('paneer-manchurian-gravy', 'Paneer manchurian (gravy)', ['paneer manchurian gravy', 'gravy paneer manchurian'],
    [paneer(250), ...BATTER(40), oil(35), onion(60), capsicum(50), ...CHINESE_GRAVY], 0.8, [KATORI]),
  d('schezwan-paneer-dry', 'Schezwan paneer (dry)', ['paneer schezwan', 'szechuan paneer'],
    [paneer(250), ...BATTER(40), oil(30), schezwan(50), onion(60), capsicum(60), springOnion(15)], 0.82, [STARTER]),
  d('paneer-salt-and-pepper', 'Salt and pepper paneer', ['paneer salt pepper', 'crispy pepper paneer'],
    [paneer(250), ...BATTER(40), oil(30), onion(60), capsicum(60), ...gg(10)], 0.85, [STARTER]),
  d('chilli-tofu', 'Chilli tofu (dry)', ['tofu chilli', 'crispy chilli tofu'],
    [tofu(300), ...BATTER(40), oil(35), ...TOSS], 0.82, [STARTER]),
  d('veg-fried-wontons', 'Fried wontons (veg)', ['veg wontons', 'crispy wontons veg', 'fried wonton'],
    [wontonWrapper(120), cabbage(100), carrot(40), onion(30), soy(5), oil(45)], 0.85, [STARTER, KEBAB(18)]),
  d('baby-corn-65', 'Baby corn 65', ['babycorn 65', 'baby corn sixty five'],
    [babyCorn(250), cornflour(25), riceFlour(15), curd(30), water(20), oil(40), ...gg(10)], 0.82, [STARTER]),
  d('veg-hot-garlic-sauce', 'Veg in hot garlic sauce', ['hot garlic veg', 'mixed veg hot garlic sauce', 'exotic veg hot garlic'],
    [cabbage(80), carrot(80), beans(60), broccoli(60), mushroom(60), babyCorn(60), capsicum(50), oil(30), garlic(25), ...CHINESE_GRAVY], 0.82, [KATORI]),
  d('paneer-hot-garlic-sauce', 'Paneer in hot garlic sauce', ['hot garlic paneer', 'paneer hot garlic'],
    [paneer(250), ...BATTER(30), oil(35), onion(60), capsicum(60), garlic(25), ...CHINESE_GRAVY], 0.8, [KATORI]),
  d('sweet-and-sour-veg', 'Sweet and sour vegetables', ['sweet n sour veg', 'veg sweet and sour'],
    [cabbage(60), carrot(80), capsicum(80), pineapple(80), onion(60), ...BATTER(40), oil(35), sweetSour(80), ketchup(20), water(150)], 0.82, [KATORI]),
  d('veg-chinese-chopsuey', 'Chinese chopsuey (veg, soft noodles)', ['chinese chopsuey', 'veg chop suey'],
    [noodles(100), water(200), cabbage(80), carrot(60), beanSprouts(60), mushroom(40), oil(30), soy(15), cornflour(15), water(200)], 0.85, [PLATE]),
  d('veg-thai-green-curry', 'Thai green curry (veg) with jasmine rice', ['veg thai green curry', 'green curry veg', 'thai curry rice'],
    [coconutMilk(300), zucchini(80), broccoli(60), babyCorn(60), bambooShoot(40), capsicum(50), oil(15), sugar(8), water(100), rice(150), water(300)], 0.88, [BOWL]),
  d('veg-thai-red-curry', 'Thai red curry (veg) with jasmine rice', ['veg thai red curry', 'red curry veg'],
    [coconutMilk(300), zucchini(80), broccoli(60), babyCorn(60), bambooShoot(40), redCapsicum(50), oil(15), sugar(8), water(100), rice(150), water(300)], 0.88, [BOWL]),
  d('thai-fried-rice', 'Thai fried rice (veg)', ['thai veg fried rice', 'thai basil fried rice'],
    [rice(200), water(420), broccoli(50), redCapsicum(40), corn(40), onion(40), oil(30), soy(15), sugar(5)], 0.92, [PLATE]),
  d('veg-pad-thai', 'Pad thai (veg)', ['veg pad thai', 'pad thai noodles'],
    [riceNoodles(150), water(200), tofu(80), beanSprouts(60), carrot(40), peanuts(25), oil(30), sugar(15), soy(15), lime(15)], 0.88, [PLATE]),
]

const IC_RICE_NOODLES: IndianRecipe[] = [
  d('triple-schezwan-rice', 'Triple schezwan fried rice (veg)', ['triple schezwan', 'triple szechuan rice', 'veg triple schezwan'],
    [rice(150), water(300), noodles(60), water(80), cabbage(60), carrot(40), capsicum(40), oil(45), schezwan(50), ...CHINESE_GRAVY.slice(0, 6)], 0.88, [RICE_PLATE]),
  d('chicken-triple-schezwan-rice', 'Chicken triple schezwan rice', ['chicken triple schezwan', 'triple schezwan chicken'],
    [rice(150), water(300), noodles(60), water(80), chicken(150), egg(50), cabbage(60), capsicum(40), oil(50), schezwan(50), ...CHINESE_GRAVY.slice(0, 6)], 0.88, [RICE_PLATE]),
  d('burnt-garlic-fried-rice', 'Burnt garlic fried rice (veg)', ['burnt garlic rice', 'garlic fried rice'],
    [rice(200), water(420), garlic(30), cabbage(50), carrot(40), beans(30), springOnion(20), oil(35), soy(10)], 0.92, [RICE_PLATE]),
  d('chicken-chilli-garlic-fried-rice', 'Chicken chilli garlic fried rice', ['chilli garlic chicken rice'],
    [rice(200), water(420), chicken(150), egg(50), garlic(20), greenChilli(10), cabbage(40), oil(38), soy(10), chilliSauce(15)], 0.92, [RICE_PLATE]),
  d('chicken-burnt-garlic-fried-rice', 'Chicken burnt garlic fried rice', ['burnt garlic chicken rice', 'chicken garlic fried rice'],
    [rice(200), water(420), chicken(150), egg(50), garlic(30), cabbage(40), springOnion(20), oil(38), soy(10)], 0.92, [RICE_PLATE]),
  d('chilli-garlic-fried-rice', 'Chilli garlic fried rice (veg)', ['chilli garlic rice', 'chili garlic fried rice'],
    [rice(200), water(420), garlic(20), greenChilli(10), cabbage(50), carrot(40), capsicum(30), oil(35), soy(10), chilliSauce(15)], 0.92, [RICE_PLATE]),
  d('mushroom-fried-rice', 'Mushroom fried rice', ['mushroom rice chinese'],
    [rice(200), water(420), mushroom(150), cabbage(40), springOnion(20), oil(30), soy(15)], 0.92, [RICE_PLATE]),
  d('egg-schezwan-fried-rice', 'Egg schezwan fried rice', ['schezwan egg fried rice', 'egg schezwan rice'],
    [rice(200), water(420), egg(150), cabbage(50), carrot(30), oil(35), schezwan(40)], 0.92, [RICE_PLATE]),
  d('mixed-fried-rice', 'Mixed fried rice (chicken, egg, prawn)', ['mix fried rice', 'mixed non veg fried rice', 'special fried rice'],
    [rice(200), water(420), chicken(100), prawn(60), egg(100), cabbage(40), springOnion(20), oil(38), soy(15)], 0.92, [RICE_PLATE]),
  d('prawn-fried-rice', 'Prawn fried rice', ['prawns fried rice', 'shrimp fried rice'],
    [rice(200), water(420), prawn(150), egg(50), cabbage(40), springOnion(20), oil(32), soy(15)], 0.92, [RICE_PLATE]),
  d('singapore-noodles', 'Singapore noodles (veg)', ['singapore rice noodles', 'singapuri noodles'],
    [riceNoodles(150), water(200), cabbage(60), carrot(40), capsicum(40), beanSprouts(50), oil(30), soy(15)], 0.88, [PLATE]),
  d('chicken-singapore-noodles', 'Chicken Singapore noodles', ['singapore noodles chicken'],
    [riceNoodles(150), water(200), chicken(120), prawn(40), egg(50), cabbage(50), beanSprouts(50), oil(32), soy(15)], 0.88, [PLATE]),
  d('pan-fried-noodles', 'Pan fried noodles (veg, in sauce)', ['crispy noodles in sauce', 'pan fried noodles veg'],
    [noodles(150), water(200), oil(40), cabbage(60), carrot(50), mushroom(40), beanSprouts(40), soy(15), cornflour(15), water(200)], 0.85, [PLATE]),
  d('burnt-garlic-noodles', 'Burnt garlic noodles (veg)', ['burnt garlic hakka noodles'],
    [noodles(150), water(220), garlic(25), cabbage(70), carrot(40), capsicum(40), springOnion(20), oil(30), soy(10)], 0.88, [PLATE]),
  d('chicken-chilli-garlic-noodles', 'Chicken chilli garlic noodles', ['chilli garlic chicken noodles'],
    [noodles(150), water(220), chicken(120), garlic(20), cabbage(60), capsicum(40), oil(32), soy(12), chilliSauce(15)], 0.88, [PLATE]),
  d('mixed-hakka-noodles', 'Mixed hakka noodles (chicken, egg, prawn)', ['mix noodles', 'mixed noodles', 'special hakka noodles'],
    [noodles(150), water(220), chicken(80), prawn(50), egg(80), cabbage(60), carrot(30), oil(35), soy(15)], 0.88, [PLATE]),
  d('prawn-hakka-noodles', 'Prawn hakka noodles', ['prawns noodles', 'shrimp noodles'],
    [noodles(150), water(220), prawn(130), cabbage(60), carrot(30), capsicum(30), oil(32), soy(15)], 0.88, [PLATE]),
  d('paneer-hakka-noodles', 'Paneer hakka noodles', ['paneer noodles', 'paneer chowmein'],
    [noodles(150), water(220), paneer(100), cabbage(70), carrot(30), capsicum(40), oil(32), soy(12)], 0.88, [PLATE]),
  d('egg-schezwan-noodles', 'Egg schezwan noodles', ['schezwan egg noodles', 'egg szechuan noodles'],
    [noodles(150), water(220), egg(100), cabbage(70), capsicum(40), oil(30), schezwan(40)], 0.88, [PLATE]),
  d('chicken-american-chopsuey', 'Chicken American chopsuey', ['american chopsuey chicken', 'chicken chopsuey'],
    [noodles(80), oil(40), chicken(120), egg(50), cabbage(60), carrot(40), capsicum(40), ketchup(50), sweetSour(30), cornflour(15), water(250)], 0.82, [PLATE]),
  d('chicken-pad-thai', 'Pad thai (chicken)', ['chicken pad thai'],
    [riceNoodles(150), water(200), chicken(120), egg(50), beanSprouts(60), peanuts(25), oil(30), sugar(15), soy(15), lime(15)], 0.88, [PLATE]),
]

const IC_NONVEG: IndianRecipe[] = [
  d('chicken-salt-and-pepper', 'Salt and pepper chicken', ['chicken salt pepper', 'pepper salt chicken'],
    [chicken(400), ...BATTER(50), egg(40), oil(45), onion(60), capsicum(60), ...gg(10)], 0.8, [STARTER]),
  d('honey-chilli-chicken', 'Honey chilli chicken', ['crispy honey chilli chicken', 'chicken honey chilli'],
    [chicken(400), ...BATTER(60), egg(40), oil(50), honey(40), chilliSauce(15), soy(10), sesame(5), springOnion(20)], 0.8, [STARTER]),
  d('kung-pao-chicken', 'Kung pao chicken', ['kung pao', 'chicken kung pao'],
    [chicken(400), cornflour(20), oil(35), peanuts(40), capsicum(80), onion(60), soy(20), sugar(10), vinegar(10), ...gg(16)], 0.82, [STARTER]),
  d('chicken-schezwan-dry', 'Schezwan chicken (dry)', ['chicken schezwan', 'szechuan chicken'],
    [chicken(400), ...BATTER(50), egg(40), oil(45), schezwan(60), onion(60), capsicum(60)], 0.8, [STARTER]),
  d('chicken-pepper-dry-chinese', 'Black pepper chicken (Indo-Chinese)', ['chicken black pepper', 'chinese pepper chicken', 'chicken in black pepper sauce'],
    [chicken(400), ...BATTER(40), oil(40), onion(80), capsicum(60), soy(20), cornflour(10), water(80), ...gg(16)], 0.8, [STARTER]),
  d('crispy-chicken-chinese', 'Crispy chicken (Indo-Chinese)', ['chicken crispy', 'crispy fried chicken chinese'],
    [chicken(400), ...BATTER(60), egg(40), oil(55), ...TOSS], 0.8, [STARTER]),
  d('chicken-manchurian-dry', 'Chicken manchurian (dry)', ['dry chicken manchurian', 'chicken manchurian dry'],
    [chicken(400), ...BATTER(60), egg(40), oil(50), soy(20), ketchup(20), chilliSauce(12), springOnion(25), ...gg(20)], 0.8, [STARTER]),
  d('lemon-chicken', 'Lemon chicken (Indo-Chinese)', ['chicken lemon sauce', 'chinese lemon chicken'],
    [chicken(400), ...BATTER(50), egg(40), oil(45), lemon(40), sugar(40), cornflour(15), water(200)], 0.8, [KATORI]),
  d('chicken-hot-garlic-sauce', 'Chicken in hot garlic sauce', ['hot garlic chicken', 'chicken hot garlic'],
    [chicken(400), ...BATTER(40), oil(40), onion(60), capsicum(60), garlic(25), ...CHINESE_GRAVY], 0.8, [KATORI]),
  d('sweet-and-sour-chicken', 'Sweet and sour chicken', ['sweet n sour chicken', 'chicken sweet sour'],
    [chicken(400), ...BATTER(50), egg(40), oil(45), capsicum(70), onion(60), pineapple(80), sweetSour(100), ketchup(20), water(100)], 0.82, [KATORI]),
  d('chicken-thai-green-curry', 'Thai green curry (chicken) with jasmine rice', ['chicken thai green curry', 'green curry chicken'],
    [chicken(250), coconutMilk(300), zucchini(60), bambooShoot(40), capsicum(50), oil(15), sugar(8), water(100), rice(150), water(300)], 0.88, [BOWL]),
  d('chicken-thai-red-curry', 'Thai red curry (chicken) with jasmine rice', ['chicken thai red curry', 'red curry chicken'],
    [chicken(250), coconutMilk(300), zucchini(60), bambooShoot(40), redCapsicum(50), oil(15), sugar(8), water(100), rice(150), water(300)], 0.88, [BOWL]),
  d('thai-basil-chicken', 'Thai basil chicken (stir fry)', ['basil chicken', 'thai chilli basil chicken', 'chicken basil'],
    [chicken(400), oil(30), onion(80), redCapsicum(60), soy(20), u(174529)(25), sugar(8), ...gg(16)], 0.82, [STARTER]),
  d('chicken-satay', 'Chicken satay with peanut sauce', ['satay chicken', 'chicken satay skewers'],
    [chicken(400), oil(15), soy(15), u(172470)(60), coconutMilk(60), sugar(10), lime(10)], 0.85, [piece('4 skewers (160 g)', 160)]),
  d('korean-fried-chicken', 'Korean fried chicken (spicy glaze)', ['korean chicken', 'kfc korean', 'gochujang chicken', 'korean chicken wings'],
    [chicken(400), ...BATTER(70), oil(55), chilliSauce(25), honey(30), ketchup(20), sugar(10), soy(10), sesame(5), ...gg(10)], 0.8, [STARTER]),
  d('veg-noodles-manchurian-combo', 'Veg hakka noodles with manchurian gravy (combo)', ['noodles manchurian combo', 'hakka noodles with manchurian', 'manchurian noodles'],
    [noodles(100), water(150), cabbage(140), carrot(40), capsicum(30), maida(30), cornflour(30), oil(45), soy(15), ketchup(15), water(100)], 0.88, [BOWL]),
  d('chilli-chicken-noodles-combo', 'Chilli chicken with hakka noodles (combo)', ['chilli chicken noodles', 'noodles chilli chicken combo'],
    [noodles(100), water(150), cabbage(50), carrot(30), oil(38), chicken(150), cornflour(20), egg(20), capsicum(50), onion(50), soy(15), chilliSauce(10)], 0.88, [BOWL]),
  d('schezwan-chicken-gravy', 'Schezwan chicken (gravy)', ['chicken schezwan gravy', 'szechuan chicken gravy'],
    [chicken(400), ...BATTER(40), egg(30), oil(40), schezwan(60), onion(60), capsicum(60), cornflour(15), water(300)], 0.82, [KATORI]),
  d('chicken-oyster-sauce', 'Chicken in oyster sauce', ['oyster sauce chicken', 'chicken oyster'],
    [chicken(400), cornflour(20), oil(30), oysterSauce(50), soy(10), sugar(5), broccoli(80), mushroom(80), springOnion(20), water(150), ...gg(16)], 0.82, [KATORI]),
  d('chicken-noodles-manchurian-combo', 'Chicken manchurian with hakka noodles (combo)', ['chicken manchurian noodles', 'noodles chicken manchurian combo'],
    [noodles(100), water(150), cabbage(50), carrot(30), oil(40), chicken(150), cornflour(25), maida(10), egg(20), soy(15), ketchup(15), water(100)], 0.88, [BOWL]),
  d('chilli-paneer-noodles-combo', 'Chilli paneer with hakka noodles (combo)', ['chilli paneer noodles', 'noodles chilli paneer combo'],
    [noodles(100), water(150), cabbage(50), carrot(30), oil(30), paneer(100), cornflour(15), capsicum(50), onion(50), soy(15), chilliSauce(10)], 0.88, [BOWL]),
  d('thai-chicken-fried-rice', 'Thai chicken fried rice', ['thai fried rice chicken', 'khao pad chicken'],
    [rice(200), water(420), chicken(150), egg(50), onion(40), redCapsicum(40), oil(32), soy(15), sugar(5)], 0.92, [PLATE]),
  d('crystal-dumplings', 'Crystal dumplings (veg dimsum)', ['veg crystal dumplings', 'crystal dimsum', 'veg dim sum'],
    [cornflour(60), maida(20), water(60), cabbage(60), carrot(30), mushroom(40), corn(30), oil(6)], 0.92, [piece('1 plate (6 pieces)', 150)]),
  d('chicken-bao', 'Chicken bao (steamed bun)', ['bao chicken', 'chicken bao bun', 'gua bao chicken'],
    [maida(80), water(40), milk(10), sugar(6), oil(4), chicken(100), oil(10), soy(8), honey(8), mayo(10), cucumber(20)], 0.9, [piece('2 bao (260 g)', 260)]),
  d('paneer-bao', 'Paneer bao (steamed bun)', ['bao paneer', 'paneer bao bun', 'veg bao'],
    [maida(80), water(40), milk(10), sugar(6), oil(4), paneer(70), oil(5), soy(8), chilliSauce(8), mayo(10), cucumber(20)], 0.9, [piece('2 bao (255 g)', 255)]),
  d('chilli-fish', 'Chilli fish (dry)', ['fish chilli', 'chilli fish dry', 'chilli basa'],
    [basa(400), ...BATTER(50), egg(40), oil(45), ...TOSS], 0.8, [STARTER]),
  d('fish-manchurian', 'Fish manchurian', ['manchurian fish'],
    [basa(400), ...BATTER(50), egg(40), oil(45), onion(60), capsicum(50), ...CHINESE_GRAVY], 0.8, [KATORI]),
  d('golden-fried-prawns', 'Golden fried prawns', ['fried prawns chinese', 'crispy prawns', 'prawn tempura'],
    [prawn(300), ...BATTER(60), egg(40), breadCrumbs(30), oil(50)], 0.85, [STARTER]),
  d('egg-manchurian', 'Egg manchurian', ['manchurian egg', 'egg manchurian gravy'],
    [egg(400), ...BATTER(40), oil(35), onion(60), capsicum(50), ...CHINESE_GRAVY], 0.82, [KATORI]),
  d('chicken-spring-roll', 'Chicken spring roll', ['spring roll chicken', 'chicken rolls chinese'],
    [maida(60), water(40), chicken(100), cabbage(60), carrot(30), onion(20), soy(5), oil(35)], 0.85, [piece('1 roll', 60), piece('1 plate (4 rolls)', 240)]),
  d('chicken-fried-wontons', 'Fried wontons (chicken)', ['chicken wontons', 'crispy chicken wontons'],
    [wontonWrapper(120), chickenMince(150), cabbage(50), onion(30), soy(5), oil(45)], 0.85, [STARTER, KEBAB(20)]),
  d('chicken-shashlik', 'Chicken shashlik (with sauce)', ['shashlik', 'chicken shaslik'],
    [chicken(400), capsicum(120), onion(120), tomato(80), oil(30), butter(15), ketchup(40), chilliSauce(15), soy(10)], 0.8, [STARTER]),
]

const MOMOS: IndianRecipe[] = [
  d('afghani-veg-momos', 'Afghani momos (veg)', ['veg afghani momos', 'malai momos veg', 'afghani momo'],
    [maida(80), water(40), cabbage(100), carrot(30), onion(30), oil(15), cream(40), curd(30), cashew(10), butter(10)], 0.85, [piece('1 plate (6 momos)', 180)]),
  d('afghani-chicken-momos', 'Afghani momos (chicken)', ['chicken afghani momos', 'malai chicken momos'],
    [maida(80), water(40), chickenMince(150), onion(30), oil(10), cream(40), curd(30), cashew(10), butter(10)], 0.85, [piece('1 plate (6 momos)', 180)]),
  d('chilli-momos', 'Chilli momos (veg)', ['veg chilli momos', 'momos chilli', 'chilli garlic momos'],
    [maida(80), water(40), cabbage(100), carrot(30), onion(30), oil(30), ...TOSS], 0.82, [piece('1 plate (6 momos)', 200)]),
  d('chilli-chicken-momos', 'Chilli chicken momos', ['chicken chilli momos'],
    [maida(80), water(40), chickenMince(150), onion(30), oil(30), ...TOSS], 0.82, [piece('1 plate (6 momos)', 200)]),
  d('cheese-corn-momos', 'Cheese corn momos', ['corn cheese momos', 'cheese momos'],
    [maida(80), water(40), corn(80), mozzarella(50), cabbage(40), onion(20), oil(6)], 0.9, [piece('1 momo', 25), piece('1 plate (6 momos)', 150)]),
  d('jhol-momos', 'Jhol momos (chicken)', ['jhol momo', 'momos in soup', 'nepali jhol momo'],
    [maida(80), water(40), chickenMince(150), onion(30), oil(15), tomato(150), sesame(15), water(250)], 0.85, [piece('1 bowl (6 momos with jhol)', 300)]),
  d('chicken-kurkure-momos', 'Kurkure momos (chicken)', ['chicken kurkure momos', 'crispy chicken momos'],
    [maida(80), water(40), chickenMince(150), onion(30), cornflour(30), breadCrumbs(30), water(40), oil(45)], 0.85, [piece('1 plate (6 momos)', 190)]),
]

// ============================================================ NON-VEG TANDOOR
const NV_TANDOOR: IndianRecipe[] = [
  d('murgh-malai-seekh', 'Murgh malai seekh kebab', ['chicken malai seekh', 'malai seekh kebab'],
    [chickenMince(500), cream(50), cheeseSlice(30), cashew(20), onion(50), butter(20), oil(10)], 0.82, [piece('2 seekh (120 g)', 120)]),
  d('shish-tawook', 'Shish tawook (Arabic chicken skewers with garlic sauce)', ['shish taouk', 'chicken shish tawook', 'arabic chicken skewers'],
    [chicken(400), curd(60), oliveOil(20), lemon(20), garlic(10), tomatoPuree(20), mayo(40)], 0.82, [piece('1 plate skewers (180 g)', 180)]),
  d('chicken-banjara-kebab', 'Chicken banjara kebab', ['banjara tikka', 'murgh banjara'],
    [chicken(500), curd(80), oil(20), besan(15), lemon(15), ...gg(20)], 0.8, [piece('6 pieces (180 g)', 180)]),
  d('chicken-angara-tikka', 'Chicken angara tikka', ['angara kebab', 'angara chicken tikka'],
    [chicken(500), curd(80), oil(25), butter(10), lemon(15), ...gg(20)], 0.8, [piece('6 pieces (180 g)', 180)]),
  d('chicken-lasooni-tikka', 'Lasooni chicken tikka (garlic)', ['garlic chicken tikka', 'lehsuni tikka', 'murgh lasooni'],
    [chicken(500), curd(80), garlic(30), cream(30), oil(20), butter(10)], 0.8, [piece('6 pieces (180 g)', 180)]),
  d('chicken-achari-tikka', 'Achari chicken tikka', ['achari tikka', 'murgh achari tikka'],
    [chicken(500), curd(80), oil(30), lemon(15), ...gg(20)], 0.8, [piece('6 pieces (180 g)', 180)]),
  d('murgh-cheese-tikka', 'Chicken cheese tikka', ['cheese chicken tikka', 'murgh cheese kebab'],
    [breast(500), hungCurd(60), cheddar(40), cream(40), oil(15), butter(10)], 0.8, [piece('6 pieces (180 g)', 180)]),
]

// ============================================================ NON-VEG GRAVIES
const NV_GRAVIES: IndianRecipe[] = [
  d('chicken-lababdar', 'Chicken lababdar', ['murgh lababdar', 'lababdar chicken'],
    [chicken(500), curd(80), onion(150), ...MAKHANI, oil(25)], 0.8, [KATORI]),
  d('chicken-methi-malai', 'Methi malai chicken', ['murgh methi malai', 'chicken methi'],
    [chicken(500), n('methi-leaves')(100), onion(150), cashew(30), cream(80), butter(20), oil(25), curd(50), water(100)], 0.8, [KATORI]),
  d('chicken-mughlai', 'Mughlai chicken', ['chicken mughlai', 'murgh mughlai', 'shahi chicken'],
    [chicken(500), onion(150), almond(30), cashew(30), curd(100), cream(60), ghee(30), oil(15), ...gg(20), water(100)], 0.8, [KATORI]),
  d('dhaba-chicken', 'Dhaba chicken curry (bone-in, ghee)', ['dhaba style chicken', 'highway chicken curry', 'desi chicken dhaba'],
    [chicken(500), onion(250), tomato(200), ghee(30), oil(30), curd(50), ...gg(25), water(250)], 0.8, [KATORI]),
  d('chicken-reshmi-butter-masala', 'Reshmi butter masala (chicken)', ['reshmi butter masala', 'chicken reshmi masala'],
    [breast(500), cream(40), cashew(20), ...MAKHANI, oil(10)], 0.8, [KATORI]),
  d('afghani-chicken-curry', 'Afghani chicken curry (white gravy)', ['afghani murgh curry', 'afghani chicken gravy restaurant'],
    [chicken(500), cream(80), cashew(40), curd(80), onion(100), butter(25), oil(15), water(80)], 0.8, [KATORI]),
  d('egg-kheema', 'Anda kheema (egg keema)', ['anda keema', 'egg kheema masala', 'anda kheema'],
    [egg(400), onion(200), tomato(200), peas(60), oil(30), butter(20), ...gg(16)], 0.82, [KATORI]),
  d('egg-butter-masala', 'Egg butter masala', ['anda makhani', 'egg makhani', 'butter egg masala'],
    [egg(400), ...MAKHANI, oil(10)], 0.82, [KATORI]),
  d('fish-tikka-masala', 'Fish tikka masala', ['machli tikka masala', 'fish tikka gravy'],
    [basa(500), curd(60), onion(150), tomato(250), cream(50), butter(25), oil(30), ...gg(20), water(80)], 0.8, [KATORI]),
  d('butter-garlic-prawns', 'Butter garlic prawns', ['prawns butter garlic', 'garlic butter prawns', 'butter garlic shrimp'],
    [prawn(400), butter(60), garlic(30), lemon(15), springOnion(20)], 0.8, [STARTER]),
  d('kadai-prawns', 'Kadai prawns', ['prawn kadai', 'kadhai jhinga', 'karahi prawns'],
    [prawn(400), capsicum(120), onion(150), tomato(200), oil(40), butter(10), ...gg(16)], 0.8, [KATORI]),
]

// ============================================================ BREADS
const BREADS: IndianRecipe[] = [
  d('chur-chur-naan', 'Chur chur naan (Amritsari, stuffed)', ['chur chur paratha', 'amritsari chur chur naan'],
    [maida(80), curd(10), water(30), potato(50), paneer(20), onion(15), butter(15), ghee(5)], 0.85, [piece('1 naan', 190)]),
  d('aloo-naan', 'Aloo naan (stuffed)', ['stuffed aloo naan', 'potato naan'],
    [maida(70), curd(10), milk(10), water(25), potato(60), oil(4), butter(8)], 0.85, [piece('1 naan', 160)]),
  d('keema-naan', 'Keema naan', ['kheema naan', 'mutton keema naan', 'stuffed keema naan'],
    [maida(70), curd(10), milk(10), water(25), lambMince(50), onion(15), oil(4), butter(8)], 0.85, [piece('1 naan', 160)]),
  d('bhatura', 'Bhatura (single, restaurant)', ['bhature', 'bhatoora', 'plain bhatura'],
    [maida(60), curd(15), water(22), sugar(2), oil(12)], 0.88, [piece('1 bhatura', 98)]),
]

// ============================================================ RICE, BIRYANI AND BOWLS
const RICE: IndianRecipe[] = [
  d('chicken-tikka-biryani', 'Chicken tikka biryani', ['tikka biryani', 'chicken tikka dum biryani'],
    [rice(500), water(850), chicken(500), curd(180), onion(250), oil(70), ghee(40), butter(20), ...gg(30)], 0.93, [PLATE, BIRYANI_PLATE]),
  d('chicken-65-biryani', 'Chicken 65 biryani', ['65 biryani', 'chicken sixty five biryani'],
    [rice(500), water(850), chicken(500), cornflour(30), curd(150), onion(250), oil(90), ghee(30), ...gg(30)], 0.93, [PLATE, BIRYANI_PLATE]),
  d('butter-chicken-biryani', 'Butter chicken biryani', ['makhani biryani', 'butter chicken dum biryani'],
    [rice(500), water(850), chicken(450), curd(100), tomato(250), butter(60), cream(80), cashew(30), onion(150), oil(40), ghee(20)], 0.92, [PLATE, BIRYANI_PLATE]),
  d('paneer-tikka-biryani', 'Paneer tikka biryani', ['paneer tikka dum biryani'],
    [rice(500), water(850), paneer(300), curd(150), onion(250), capsicum(80), oil(70), ghee(40), ...gg(20)], 0.93, [PLATE, BIRYANI_PLATE]),
  d('kaju-pulao', 'Kaju pulao', ['cashew pulao', 'kaju pulav', 'shahi kaju pulao'],
    [rice(300), water(550), cashew(60), ghee(40), onion(60), peas(50)], 0.95, [PLATE]),
  d('dal-khichdi-tadka', 'Dal khichdi (restaurant, ghee tadka)', ['khichdi restaurant', 'dal khichdi with ghee tadka', 'hotel khichdi'],
    [rice(200), moongDal(80), toorDal(50), water(1000), onion(60), tomato(80), ghee(40), oil(10)], 0.95, [KATORI, PLATE]),
  d('jeera-rice-restaurant', 'Jeera rice (restaurant, ghee)', ['jeera rice restaurant', 'zeera rice ghee', 'cumin rice restaurant'],
    [rice(400), water(700), ghee(40)], 0.95, [KATORI, PLATE]),
  d('veg-pulao-restaurant', 'Veg pulao (restaurant)', ['veg pulav restaurant', 'subz pulao'],
    [rice(400), water(700), carrot(60), beans(60), peas(60), cauliflower(60), cashew(20), ghee(40), oil(10)], 0.94, [KATORI, PLATE]),
  d('paneer-makhani-rice-bowl', 'Paneer makhani rice bowl', ['paneer butter masala rice bowl', 'paneer rice combo'],
    [rice(150), water(280), paneer(120), tomato(150), butter(25), cream(30), cashew(10), sugar(3), oil(8)], 0.9, [BOWL]),
  d('chilli-chicken-rice-bowl', 'Chilli chicken with fried rice (bowl)', ['chilli chicken rice bowl', 'chilli chicken fried rice combo'],
    [rice(150), water(300), cabbage(40), carrot(30), oil(35), chicken(150), cornflour(20), egg(20), capsicum(50), onion(50), soy(15), chilliSauce(10)], 0.9, [BOWL]),
  d('chilli-paneer-rice-bowl', 'Chilli paneer with fried rice (bowl)', ['chilli paneer rice bowl', 'chilli paneer fried rice combo'],
    [rice(150), water(300), cabbage(40), carrot(30), oil(32), paneer(120), cornflour(15), capsicum(50), onion(50), soy(15), chilliSauce(10)], 0.9, [BOWL]),
  d('chicken-tikka-rice-bowl', 'Chicken tikka rice bowl (makhani gravy)', ['chicken tikka makhani rice bowl', 'tikka masala rice bowl'],
    [rice(150), water(280), chicken(150), curd(30), oil(10), onion(60), tomato(120), butter(15), cream(20)], 0.9, [BOWL]),
  d('paneer-tikka-rice-bowl', 'Paneer tikka rice bowl (makhani gravy)', ['paneer tikka makhani rice bowl', 'paneer tikka with rice'],
    [rice(150), water(280), paneer(120), curd(30), oil(10), onion(60), tomato(120), butter(15), cream(20)], 0.9, [BOWL]),
  d('chicken-manchurian-rice-bowl', 'Chicken manchurian with fried rice (bowl)', ['chicken manchurian rice', 'chicken manchurian fried rice combo'],
    [rice(150), water(300), cabbage(40), oil(40), chicken(150), cornflour(25), maida(10), egg(20), soy(15), ketchup(15), water(100)], 0.9, [BOWL]),
  d('veg-burrito-bowl', 'Veg burrito bowl (rajma, rice, salsa)', ['burrito bowl veg', 'mexican rice bowl', 'veg mexican bowl'],
    [rice(120), water(240), rajmaBoiled(50), water(100), corn(60), salsa(60), lettuce(30), onion(30), cheddar(25), sourCream(30), oil(10)], 0.9, [BOWL]),
  d('teriyaki-chicken-rice-bowl', 'Teriyaki chicken rice bowl', ['chicken teriyaki bowl', 'teriyaki chicken with rice'],
    [rice(150), water(280), chicken(150), teriyaki(40), honey(10), oil(12), broccoli(50), carrot(30), sesame(5)], 0.9, [BOWL]),
  d('peri-peri-chicken-rice-bowl', 'Peri peri chicken rice bowl', ['peri peri chicken rice', 'piri piri chicken bowl'],
    [rice(150), water(280), legMeat(150), oil(15), chilliSauce(20), lemon(10), corn(40), redCapsicum(40), mayo(15)], 0.9, [BOWL]),
  d('mexican-rice', 'Mexican rice', ['mexican tomato rice', 'spanish rice'],
    [rice(200), water(380), tomatoPuree(100), onion(50), corn(50), capsicum(40), rajmaBoiled(30), oil(20)], 0.92, [KATORI, PLATE]),
  d('chicken-burrito-bowl', 'Chicken burrito bowl', ['burrito bowl chicken', 'chicken mexican bowl'],
    [rice(120), water(240), chicken(130), rajmaBoiled(40), water(80), corn(50), salsa(60), lettuce(30), cheddar(25), sourCream(30), oil(12)], 0.9, [BOWL]),
]

// ============================================================ SOUPS (Indian restaurant and continental)
const SOUPS: IndianRecipe[] = [
  d('cream-of-tomato-soup', 'Cream of tomato soup', ['tomato soup', 'tamatar soup', 'cream tomato soup'],
    [tomato(600), onion(50), carrot(40), butter(20), cream(50), sugar(10), cornflour(10), water(250)], 0.85, [SOUP]),
  d('cream-of-mushroom-soup', 'Cream of mushroom soup', ['creamy mushroom soup', 'mushroom cream soup'],
    [mushroom(250), onion(50), butter(25), maida(20), milk(250), cream(50), water(250)], 0.85, [SOUP]),
  d('cream-of-chicken-soup', 'Cream of chicken soup', ['creamy chicken soup', 'chicken cream soup'],
    [chicken(150), onion(50), butter(25), maida(20), milk(250), cream(50), water(300)], 0.85, [SOUP]),
  d('cream-of-spinach-soup', 'Cream of spinach soup', ['cream of palak soup', 'creamy spinach soup'],
    [spinach(300), onion(50), butter(20), cream(50), milk(100), cornflour(10), water(250)], 0.85, [SOUP]),
  d('cream-of-broccoli-soup', 'Cream of broccoli soup', ['creamy broccoli soup'],
    [broccoli(250), onion(50), butter(20), almond(15), cream(50), milk(150), water(250)], 0.85, [SOUP]),
  d('tamatar-dhaniya-shorba', 'Tamatar dhaniya shorba', ['tamatar shorba', 'tomato coriander shorba'],
    [tomato(500), ghee(15), besan(10), sugar(8), water(300)], 0.82, [SOUP]),
  d('minestrone-soup', 'Minestrone soup', ['minestrone', 'italian vegetable soup'],
    [pasta(30), tomato(200), carrot(60), beans(50), zucchini(60), celery(30), rajmaBoiled(30), oliveOil(15), water(700)], 0.85, [SOUP]),
  d('roasted-pumpkin-soup', 'Roasted pumpkin soup', ['pumpkin soup', 'cream of pumpkin soup', 'kaddu soup'],
    [pumpkin(500), onion(60), butter(15), cream(40), water(300)], 0.85, [SOUP]),
  d('mutton-shorba', 'Mutton shorba (yakhni)', ['gosht shorba', 'mutton yakhni shorba', 'mutton soup'],
    [goat(250), onion(60), ghee(15), water(1000)], 0.75, [SOUP]),
]

// ============================================================ SIZZLERS
const SIZZLERS: IndianRecipe[] = [
  d('veg-sizzler', 'Veg sizzler (cutlets, rice, fries, sauce)', ['vegetable sizzler', 'continental veg sizzler'],
    [potato(250), oil(45), rice(80), water(160), carrot(60), beans(60), corn(40), broccoli(40), butter(20), peas(30), breadCrumbs(20), pastaSauce(80), cheeseSlice(15)], 0.85, [piece('1 sizzler plate', 600)]),
  d('paneer-shashlik-sizzler', 'Paneer shashlik sizzler', ['paneer sizzler', 'paneer shashlik'],
    [paneer(180), capsicum(80), onion(80), tomato(50), rice(80), water(160), potato(150), oil(30), butter(20), carrot(50), beans(50), ketchup(40), chilliSauce(10)], 0.85, [piece('1 sizzler plate', 650)]),
  d('chicken-sizzler', 'Chicken sizzler (grilled chicken, rice, fries)', ['chicken steak sizzler', 'grilled chicken sizzler'],
    [chicken(220), rice(80), water(160), potato(150), oil(30), butter(25), carrot(50), beans(50), corn(40), maida(10), milk(80), pastaSauce(40)], 0.85, [piece('1 sizzler plate', 650)]),
  d('chinese-veg-sizzler', 'Chinese sizzler (veg)', ['veg chinese sizzler', 'manchurian sizzler'],
    [rice(80), water(160), noodles(50), water(70), cabbage(120), carrot(50), maida(20), cornflour(30), oil(45), capsicum(50), soy(15), chilliSauce(10), ketchup(15), water(80)], 0.85, [piece('1 sizzler plate', 600)]),
  d('chicken-chinese-sizzler', 'Chinese sizzler (chicken)', ['chicken chinese sizzler'],
    [rice(80), water(160), noodles(50), water(70), chicken(200), cornflour(25), egg(20), oil(45), capsicum(60), cabbage(60), soy(15), chilliSauce(10), ketchup(15), water(80)], 0.85, [piece('1 sizzler plate', 650)]),
  d('fish-sizzler', 'Fish sizzler (grilled fish, rice, vegetables)', ['grilled fish sizzler', 'fish steak sizzler'],
    [basa(220), lemon(15), butter(25), rice(80), water(160), potato(150), oil(25), carrot(50), beans(50), maida(10), milk(80)], 0.85, [piece('1 sizzler plate', 600)]),
]

// ============================================================ PIZZA
/** Pizza: base dough (maida, water, oil, sugar) plus toppings; baked loses ~15% water. */
const pizza = (key: string, name: string, aliases: string[], maidaG: number, toppings: Ing[]): IndianRecipe => {
  const ings = [maida(maidaG), water(Math.round(maidaG * 0.6)), oil(Math.round(maidaG * 0.07)), sugar(Math.round(maidaG * 0.03)), ...toppings]
  const w = Math.round(total(ings) * 0.85)
  return r(key, name, aliases, ings, w, [piece(`1 medium pizza, 10 in (${w} g)`, w), piece('1 slice (1/6 of medium)', Math.round(w / 6))])
}

const PIZZAS: IndianRecipe[] = [
  pizza('margherita-pizza', 'Margherita pizza', ['margherita', 'cheese pizza', 'margarita pizza'], 150,
    [pastaSauce(60), mozzarella(110)]),
  pizza('veggie-pizza', 'Veg pizza (onion, capsicum, tomato, mushroom)', ['farmhouse pizza', 'veggie pizza', 'veg supreme pizza', 'country special pizza'], 150,
    [pastaSauce(60), mozzarella(100), onion(40), capsicum(40), tomato(40), mushroom(40)]),
  pizza('onion-capsicum-pizza', 'Onion capsicum pizza', ['onion pizza', 'capsicum pizza', 'double cheese onion capsicum'], 150,
    [pastaSauce(60), mozzarella(100), onion(50), capsicum(50)]),
  pizza('paneer-tikka-pizza', 'Paneer tikka pizza', ['tandoori paneer pizza', 'paneer pizza', 'peppy paneer pizza'], 150,
    [pastaSauce(50), mozzarella(90), paneer(70), curd(15), capsicum(40), onion(40), oil(5)]),
  pizza('corn-cheese-pizza', 'Corn and cheese pizza', ['corn cheese pizza', 'golden corn pizza', 'sweet corn pizza'], 150,
    [pastaSauce(60), mozzarella(110), corn(70)]),
  pizza('mushroom-olive-pizza', 'Mushroom and olive pizza', ['mushroom pizza', 'olive pizza', 'jalapeno olive pizza'], 150,
    [pastaSauce(60), mozzarella(100), mushroom(60), olives(25), jalapeno(20)]),
  pizza('cheese-burst-pizza', 'Cheese burst pizza (veg)', ['cheese burst', 'cheese burst margherita', 'stuffed crust pizza'], 150,
    [pastaSauce(60), mozzarella(110), cheeseSauce(90)]),
  pizza('paneer-makhani-pizza', 'Paneer makhani pizza', ['makhani paneer pizza', 'butter paneer pizza'], 150,
    [tomato(60), butter(10), cream(15), mozzarella(90), paneer(70), onion(30), capsicum(30)]),
  pizza('chicken-tikka-pizza', 'Chicken tikka pizza', ['tandoori chicken pizza', 'chicken tikka pizza', 'chicken pizza'], 150,
    [pastaSauce(50), mozzarella(90), chicken(80), curd(15), onion(40), capsicum(40), oil(5)]),
  pizza('chicken-supreme-pizza', 'Chicken supreme pizza', ['chicken loaded pizza', 'non veg supreme pizza'], 150,
    [pastaSauce(60), mozzarella(100), chicken(60), chickenSausage(30), onion(30), capsicum(30), olives(10)]),
  pizza('bbq-chicken-pizza', 'BBQ chicken pizza', ['barbeque chicken pizza', 'bbq chicken'], 150,
    [bbqSauce(50), mozzarella(90), chicken(80), onion(40), oil(5)]),
  pizza('pepperoni-pizza', 'Pepperoni pizza', ['chicken pepperoni pizza', 'pepperoni'], 150,
    [pastaSauce(60), mozzarella(100), pepperoni(50)]),
  pizza('chicken-sausage-pizza', 'Chicken sausage pizza', ['sausage pizza', 'chicken sausage'], 150,
    [pastaSauce(60), mozzarella(100), chickenSausage(60), onion(30)]),
  pizza('peri-peri-chicken-pizza', 'Peri peri chicken pizza', ['peri peri pizza', 'piri piri chicken pizza'], 150,
    [pastaSauce(50), chilliSauce(15), mozzarella(90), chicken(80), redCapsicum(40), onion(30), oil(5)]),
  pizza('double-cheese-margherita', 'Double cheese margherita pizza', ['double cheese pizza', 'extra cheese margherita'], 150,
    [pastaSauce(60), mozzarella(170)]),
  pizza('chicken-keema-pizza', 'Chicken keema pizza', ['keema pizza', 'chicken kheema pizza'], 150,
    [pastaSauce(60), mozzarella(90), chickenMince(90), onion(40), oil(5)]),
  d('garlic-breadsticks', 'Garlic breadsticks', ['bread sticks', 'garlic bread sticks', 'breadsticks'],
    [maida(150), water(90), oil(10), butter(30), garlic(10)], 0.85, [piece('4 sticks (130 g)', 130)]),
  d('stuffed-garlic-bread', 'Stuffed garlic bread (cheese, corn, jalapeno)', ['stuffed garlic bread', 'garlic bread stuffed'],
    [maida(150), water(90), oil(10), butter(25), mozzarella(80), corn(40), jalapeno(20), garlic(10)], 0.85, [piece('4 pieces (210 g)', 210)]),
]

// ============================================================ BURGERS, WRAPS, ROLLS, MEXICAN
const FASTFOOD: IndianRecipe[] = [
  one('chicken-burger', 'Chicken burger (grilled patty)', ['chicken patty burger', 'chicken burger'],
    [bun(60), chickenMince(90), breadCrumbs(10), oil(6), mayo(15), lettuce(15), tomato(15), onion(10)], 0.9, '1 burger'),
  one('crispy-chicken-burger', 'Crispy fried chicken burger', ['zinger burger', 'crispy chicken burger', 'fried chicken burger'],
    [bun(60), breast(100), maida(12), cornflour(8), oil(14), mayo(15), lettuce(15)], 0.9, '1 burger'),
  one('chicken-cheese-burger', 'Chicken cheese burger', ['cheese chicken burger', 'chicken burger with cheese'],
    [bun(60), chickenMince(90), breadCrumbs(10), oil(6), cheeseSlice(20), mayo(15), lettuce(15), tomato(15), onion(10)], 0.9, '1 burger'),
  one('chicken-tikka-burger', 'Chicken tikka burger', ['tandoori chicken burger', 'tikka burger'],
    [bun(60), chicken(90), curd(15), oil(6), mayo(15), onion(15), lettuce(15)], 0.9, '1 burger'),
  one('mushroom-cheese-burger', 'Mushroom cheese burger', ['mushroom swiss burger', 'mushroom burger'],
    [bun(60), potato(50), peas(10), breadCrumbs(10), oil(10), mushroom(60), butter(5), cheeseSlice(20), mayo(15), lettuce(15)], 0.9, '1 burger'),
  one('egg-burger', 'Egg burger', ['anda burger', 'egg omelette burger'],
    [bun(60), egg(100), oil(8), mayo(15), ketchup(10), onion(15), lettuce(10), cheeseSlice(15)], 0.92, '1 burger'),
  one('fish-burger', 'Fish burger (fried fillet)', ['fish fillet burger', 'fish patty burger'],
    [bun(60), basa(90), maida(10), breadCrumbs(10), oil(10), mayo(15), lettuce(15)], 0.88, '1 burger'),
  one('crispy-veg-burger', 'Crispy veg burger', ['veg crispy burger', 'veg patty burger crispy'],
    [bun(60), potato(50), peas(15), carrot(15), beans(10), breadCrumbs(15), maida(10), oil(12), mayo(15), lettuce(10), tomato(15)], 0.9, '1 burger'),
  one('chicken-hot-dog', 'Chicken hot dog', ['hot dog', 'chicken hotdog', 'sausage hot dog'],
    [bun(60), chickenSausage(60), mayo(10), ketchup(10), mustard(5), onion(15)], 0.95, '1 hot dog'),
  one('paneer-tikka-roll', 'Paneer tikka roll (paratha)', ['paneer tikka kathi roll', 'paneer tikka frankie', 'paneer tikka wrap'],
    [maida(70), water(35), oil(10), paneer(75), curd(15), oil(3), onion(30), capsicum(20), mayo(8), ketchup(5)], 0.9, '1 roll'),
  one('mutton-seekh-kebab-roll', 'Mutton seekh kebab roll', ['seekh kebab roll', 'mutton seekh roll', 'kebab roll'],
    [maida(70), water(35), oil(12), lambMince(100), onion(30), ketchup(10), lemon(5)], 0.88, '1 roll'),
  one('chicken-seekh-kebab-roll', 'Chicken seekh kebab roll', ['chicken seekh roll', 'chicken kebab roll'],
    [maida(70), water(35), oil(12), chickenMince(100), oil(4), onion(30), mayo(10), ketchup(5)], 0.88, '1 roll'),
  one('chicken-malai-tikka-roll', 'Chicken malai tikka roll', ['malai tikka roll', 'chicken malai roll'],
    [maida(70), water(35), oil(12), breast(90), cream(15), cheeseSlice(10), onion(30), mayo(10)], 0.88, '1 roll'),
  one('chicken-65-roll', 'Chicken 65 roll', ['chicken 65 wrap', 'chicken 65 frankie'],
    [maida(70), water(35), oil(12), chicken(90), cornflour(10), curd(10), oil(10), onion(30), mayo(10)], 0.88, '1 roll'),
  one('chaap-roll', 'Soya chaap roll', ['chaap roll', 'malai chaap roll', 'tandoori chaap roll'],
    [maida(70), water(35), oil(12), soyaChaap(100), curd(15), butter(5), onion(30), mayo(8)], 0.9, '1 roll'),
  one('peri-peri-paneer-wrap', 'Peri peri paneer wrap', ['piri piri paneer wrap', 'paneer peri peri wrap'],
    [tortilla(70), paneer(80), oil(5), chilliSauce(10), lettuce(20), onion(20), capsicum(20), mayo(15)], 0.93, '1 wrap'),
  one('egg-paneer-roll', 'Egg paneer roll', ['paneer egg roll', 'anda paneer roll'],
    [maida(70), water(35), oil(16), egg(50), paneer(70), onion(30), ketchup(10)], 0.9, '1 roll'),
  one('chilli-paneer-roll', 'Chilli paneer roll', ['chilli paneer frankie', 'chinese paneer roll'],
    [maida(70), water(35), oil(14), paneer(70), cornflour(8), capsicum(25), onion(25), soy(5), chilliSauce(8), mayo(10)], 0.9, '1 roll'),
  one('chilli-chicken-roll', 'Chilli chicken roll', ['chilli chicken frankie', 'chinese chicken roll'],
    [maida(70), water(35), oil(18), chicken(90), cornflour(8), capsicum(25), onion(25), soy(5), chilliSauce(8), mayo(10)], 0.9, '1 roll'),
  one('paneer-shawarma', 'Paneer shawarma', ['paneer shawarma roll', 'veg shawarma'],
    [pita(70), paneer(90), curd(15), oil(8), mayo(20), garlic(5), cabbage(30), cucumber(20), tomato(20)], 0.92, '1 roll'),
  d('chicken-shawarma-plate', 'Chicken shawarma plate (with kuboos and fries)', ['shawarma plate', 'arabic shawarma platter', 'chicken shawarma platter'],
    [pita(100), chicken(150), curd(20), oil(10), mayo(30), garlic(8), potato(120), oil(14), cabbage(40), cucumber(30), tomato(30)], 0.88, [piece('1 plate', 500)]),
  one('falafel-wrap', 'Falafel wrap', ['falafel roll', 'falafel pita', 'falafel shawarma'],
    [pita(70), falafel(90), hummus(30), lettuce(20), tomato(20), cucumber(20), mayo(10)], 0.95, '1 wrap'),
  d('hummus-pita', 'Hummus with pita bread', ['hummus pita', 'pita hummus platter', 'hummus and pita'],
    [hummus(120), oliveOil(10), pita(100)], 1, [piece('1 plate (230 g)', 230)]),
  one('cafe-chicken-tikka-wrap', 'Chicken tikka wrap (cafe, tortilla, mayo)', ['chicken tikka tortilla wrap', 'tandoori chicken wrap cafe'],
    [tortilla(70), chicken(100), curd(15), oil(6), lettuce(20), onion(20), mayo(15), cheeseSlice(15)], 0.92, '1 wrap'),
  one('crispy-chicken-wrap', 'Crispy chicken wrap', ['fried chicken wrap', 'zinger wrap', 'crispy chicken tortilla'],
    [tortilla(70), breast(100), maida(12), cornflour(8), oil(16), lettuce(20), tomato(20), mayo(20)], 0.9, '1 wrap'),
  one('chicken-fajita-wrap', 'Chicken fajita wrap', ['chicken fajitas', 'fajita wrap', 'chicken fajita'],
    [tortilla(90), chicken(100), oil(8), redCapsicum(30), capsicum(30), onion(30), salsa(30), sourCream(20)], 0.9, '1 wrap'),
  one('veg-mexican-wrap', 'Mexican bean wrap (veg)', ['veg mexican wrap', 'bean wrap', 'rajma wrap'],
    [tortilla(70), refriedBeans(80), corn(30), salsa(30), lettuce(20), cheddar(20), sourCream(20)], 0.95, '1 wrap'),
  one('veg-burrito', 'Veg burrito', ['bean burrito', 'veg rice burrito'],
    [tortilla(90), rice(30), water(60), refriedBeans(80), corn(30), salsa(40), cheddar(25), lettuce(20), sourCream(20)], 0.92, '1 burrito'),
  one('chicken-burrito', 'Chicken burrito', ['burrito chicken', 'chicken rice burrito'],
    [tortilla(90), rice(30), water(60), chicken(100), oil(6), refriedBeans(50), salsa(40), cheddar(25), lettuce(20), sourCream(20)], 0.92, '1 burrito'),
  one('veg-quesadilla', 'Veg quesadilla', ['quesadilla', 'cheese quesadilla', 'veg quesadillas'],
    [tortilla(110), cheddar(30), mozzarella(25), corn(40), capsicum(30), onion(30), butter(8), salsa(40)], 0.92, '1 quesadilla'),
  one('chicken-quesadilla', 'Chicken quesadilla', ['quesadilla chicken'],
    [tortilla(110), cheddar(30), mozzarella(25), chicken(90), capsicum(30), onion(30), butter(8), salsa(40)], 0.9, '1 quesadilla'),
  one('paneer-tikka-quesadilla', 'Paneer tikka quesadilla', ['paneer quesadilla', 'tandoori paneer quesadilla'],
    [tortilla(110), paneer(70), curd(10), oil(4), cheddar(25), mozzarella(25), capsicum(30), onion(30), salsa(30)], 0.92, '1 quesadilla'),
  d('veg-enchiladas', 'Veg enchiladas (baked)', ['enchiladas', 'bean enchiladas', 'veg enchilada'],
    [tortilla(140), refriedBeans(120), corn(50), capsicum(40), pastaSauce(120), cheddar(50), mozzarella(30)], 0.9, [piece('2 enchiladas (300 g)', 300)]),
  d('chicken-enchiladas', 'Chicken enchiladas (baked)', ['chicken enchilada'],
    [tortilla(140), chicken(150), oil(8), onion(40), capsicum(40), pastaSauce(120), cheddar(50), mozzarella(30)], 0.88, [piece('2 enchiladas (300 g)', 300)]),
  d('nachos-with-cheese', 'Nachos with cheese and salsa', ['nachos', 'cheese nachos', 'loaded nachos veg'],
    [nachoChips(100), cheeseSauce(80), salsa(60), jalapeno(20), sourCream(20)], 1, [piece('1 plate (280 g)', 280)]),
  d('loaded-chicken-nachos', 'Loaded chicken nachos', ['chicken nachos', 'nachos with chicken'],
    [nachoChips(100), cheeseSauce(80), chicken(80), oil(5), salsa(60), jalapeno(20), refriedBeans(40)], 0.95, [piece('1 plate (360 g)', 360)]),
  d('veg-tacos', 'Veg tacos (2 pieces)', ['tacos', 'bean tacos', 'veg taco'],
    [nachoChips(40), refriedBeans(80), lettuce(30), tomato(30), salsa(30), cheddar(25), sourCream(20)], 1, [piece('2 tacos (255 g)', 255)]),
  d('chicken-tacos', 'Chicken tacos (2 pieces)', ['chicken taco'],
    [nachoChips(40), chicken(100), oil(6), lettuce(30), tomato(30), salsa(30), cheddar(25), sourCream(20)], 0.95, [piece('2 tacos (265 g)', 265)]),
]

// ============================================================ SANDWICHES
const SANDWICHES: IndianRecipe[] = [
  one('veg-club-sandwich', 'Veg club sandwich', ['club sandwich', 'veg club', 'triple decker sandwich'],
    [bread(90), butter(12), mayo(15), cheeseSlice(20), cucumber(30), tomato(30), lettuce(15), potato(40), oil(8)], 0.95, '1 sandwich (3 slices)'),
  one('chicken-club-sandwich', 'Chicken club sandwich', ['club sandwich chicken', 'chicken triple decker'],
    [bread(90), butter(12), mayo(20), chicken(80), egg(50), oil(5), cheeseSlice(20), lettuce(15), tomato(30)], 0.93, '1 sandwich (3 slices)'),
  one('paneer-tikka-sandwich', 'Paneer tikka sandwich (grilled)', ['paneer tikka grilled sandwich', 'tandoori paneer sandwich'],
    [bread(60), butter(10), paneer(70), curd(10), oil(4), capsicum(20), onion(20), mayo(12)], 0.93, '1 sandwich'),
  one('chicken-tikka-sandwich', 'Chicken tikka sandwich (grilled)', ['chicken tikka grilled sandwich', 'tandoori chicken sandwich'],
    [bread(60), butter(10), chicken(80), curd(10), oil(4), onion(20), mayo(15), cheeseSlice(15)], 0.92, '1 sandwich'),
  one('cheese-toast', 'Cheese toast', ['cheese chilli toast plain', 'open cheese toast'],
    [bread(60), butter(8), cheeseSlice(20), mozzarella(30)], 0.95, '2 slices'),
  one('chilli-cheese-toast', 'Chilli cheese toast', ['chili cheese toast', 'cheese chilli toast'],
    [bread(60), butter(10), mozzarella(40), cheeseSlice(15), greenChilli(5), capsicum(15), onion(10)], 0.93, '2 slices'),
  d('bruschetta', 'Bruschetta (tomato basil)', ['tomato bruschetta', 'bruschetta tomato basil'],
    [frenchBread(100), oliveOil(15), tomato(120), onion(20), basil(5), garlic(5), parmesan(8)], 0.92, [piece('4 pieces (250 g)', 250)]),
  d('mushroom-on-toast', 'Mushroom on toast (creamy)', ['creamy mushroom toast', 'mushrooms on toast'],
    [bread(60), butter(15), mushroom(150), cream(30), garlic(5)], 0.85, [piece('1 plate (220 g)', 220)]),
  d('avocado-toast', 'Avocado toast', ['avocado on toast', 'avo toast'],
    [frenchBread(70), avocado(80), oliveOil(5), lemon(5), tomato(30)], 0.98, [piece('1 plate (185 g)', 185)]),
  one('pesto-paneer-sandwich', 'Pesto paneer sandwich (grilled)', ['paneer pesto sandwich', 'pesto sandwich'],
    [bread(60), pesto(20), paneer(60), tomato(25), capsicum(15), mozzarella(20)], 0.93, '1 sandwich'),
  one('paneer-tikka-sub', 'Paneer tikka sub sandwich (6 inch)', ['paneer tikka sub', 'tandoori paneer sub'],
    [subRoll(75), paneer(70), curd(10), oil(4), lettuce(20), tomato(25), onion(15), capsicum(15), mayo(15)], 0.95, '1 sub, 6 in'),
  one('veg-sub', 'Veg sub sandwich (6 inch)', ['veg sub', 'veggie delite sub', 'vegetable sub'],
    [subRoll(75), lettuce(20), tomato(25), cucumber(20), onion(15), capsicum(15), olives(10), jalapeno(10), mayo(15), cheeseSlice(15)], 1, '1 sub, 6 in'),
  one('chicken-sub', 'Chicken sub sandwich (6 inch)', ['chicken tikka sub', 'chicken teriyaki sub', 'chicken sub'],
    [subRoll(75), chicken(70), oil(4), lettuce(20), tomato(25), onion(15), mayo(15), cheeseSlice(15)], 0.95, '1 sub, 6 in'),
]

// ============================================================ PASTA AND CONTINENTAL
const PASTA_CONT: IndianRecipe[] = [
  d('pink-sauce-pasta', 'Pink sauce pasta', ['pink pasta', 'mix sauce pasta', 'rosa pasta'],
    [pasta(100), water(150), pastaSauce(100), milk(100), butter(15), maida(8), cream(25), mozzarella(20), capsicum(30), corn(30)], 0.85, [PLATE]),
  d('penne-arrabbiata', 'Penne arrabbiata', ['arrabbiata pasta', 'arrabiata', 'spicy red penne'],
    [pasta(100), water(150), pastaSauce(150), oliveOil(15), garlic(8), parmesan(10), olives(10)], 0.85, [PLATE]),
  d('chicken-white-sauce-pasta', 'Chicken white sauce pasta (alfredo)', ['chicken alfredo', 'chicken alfredo pasta', 'chicken white pasta'],
    [pasta(100), water(150), chicken(100), oil(5), butter(20), maida(15), milk(200), cream(30), mozzarella(20), parmesan(8)], 0.85, [PLATE]),
  d('chicken-red-sauce-pasta', 'Chicken red sauce pasta', ['chicken arrabbiata', 'chicken red pasta'],
    [pasta(100), water(150), chicken(100), oliveOil(15), pastaSauce(150), garlic(6), parmesan(10)], 0.85, [PLATE]),
  d('pesto-pasta', 'Pesto pasta', ['basil pesto pasta', 'pesto penne', 'pasta pesto'],
    [pasta(100), water(150), pesto(50), oliveOil(5), cream(20), parmesan(10), redCapsicum(30), zucchini(30)], 0.85, [PLATE]),
  d('aglio-olio', 'Spaghetti aglio e olio', ['aglio olio', 'garlic olive oil spaghetti', 'aglio e olio'],
    [pasta(100), water(150), oliveOil(25), garlic(15), greenChilli(5), parmesan(10)], 0.85, [PLATE]),
  d('mac-and-cheese', 'Mac and cheese', ['macaroni and cheese', 'mac n cheese', 'cheese macaroni'],
    [pasta(100), water(150), butter(20), maida(12), milk(200), cheddar(50), cheeseSlice(20)], 0.85, [PLATE]),
  d('baked-pasta', 'Baked pasta (veg, cheese)', ['baked penne', 'cheese baked pasta', 'pasta bake'],
    [pasta(100), water(150), pastaSauce(80), butter(15), maida(10), milk(150), mozzarella(60), corn(30), capsicum(30), mushroom(30)], 0.85, [PLATE]),
  d('spaghetti-bolognese', 'Spaghetti bolognese (chicken keema)', ['bolognese', 'spaghetti with meat sauce', 'chicken bolognese'],
    [pasta(100), water(150), chickenMince(120), oliveOil(12), onion(40), pastaSauce(150), parmesan(10)], 0.85, [PLATE]),
  d('veg-lasagna', 'Veg lasagna', ['lasagne', 'vegetable lasagna', 'lasagna'],
    [pasta(100), water(80), pastaSauce(150), zucchini(60), mushroom(60), spinach(60), butter(15), maida(10), milk(150), mozzarella(80)], 0.82, [piece('1 portion (250 g)', 250)]),
  d('chicken-pesto-pasta', 'Chicken pesto pasta', ['pesto chicken pasta', 'chicken basil pesto pasta'],
    [pasta(100), water(150), chicken(100), oliveOil(8), pesto(45), cream(20), parmesan(10)], 0.85, [PLATE]),
  d('chicken-lasagna', 'Chicken lasagna', ['chicken lasagne', 'chicken keema lasagna'],
    [pasta(100), water(80), pastaSauce(150), chickenMince(150), oliveOil(10), butter(15), maida(10), milk(150), mozzarella(80)], 0.82, [piece('1 portion (250 g)', 250)]),
  d('chicken-stroganoff', 'Chicken stroganoff with rice', ['stroganoff', 'chicken stroganoff'],
    [chicken(250), mushroom(150), onion(80), butter(25), cream(80), maida(10), water(100), rice(150), water(300)], 0.88, [piece('1 plate (400 g)', 400)]),
  d('butter-chicken-pasta', 'Butter chicken pasta', ['makhani pasta chicken', 'butter chicken penne'],
    [pasta(100), water(150), chicken(100), curd(15), tomato(120), butter(25), cream(40), cashew(10), sugar(3)], 0.85, [PLATE]),
  d('mushroom-risotto', 'Mushroom risotto', ['risotto', 'creamy mushroom risotto'],
    [rice(150), water(500), mushroom(150), onion(40), butter(30), cream(30), parmesan(25)], 0.85, [PLATE]),
  d('veg-stroganoff', 'Veg stroganoff with rice', ['vegetable stroganoff', 'mushroom stroganoff'],
    [mushroom(150), carrot(60), beans(60), corn(40), onion(60), butter(25), cream(80), maida(10), water(100), rice(150), water(300)], 0.88, [piece('1 plate (400 g)', 400)]),
  d('paneer-steak', 'Grilled paneer steak with pepper sauce', ['paneer steak with mash', 'cottage cheese steak'],
    [paneer(150), oil(8), butter(12), maida(5), milk(60), cream(15), potato(150), milk(30), butter(8), carrot(50), beans(50)], 0.85, [piece('1 plate', 500)]),
  d('fish-lemon-butter', 'Grilled fish in lemon butter sauce', ['fish lemon butter', 'lemon butter fish', 'grilled basa lemon butter'],
    [basa(200), oil(6), butter(20), lemon(20), maida(5), cream(15), broccoli(60), carrot(50), potato(150), butter(6)], 0.85, [piece('1 plate', 480)]),
  d('veg-au-gratin', 'Veg au gratin (baked vegetables)', ['baked vegetables', 'veg augratin', 'baked veg in white sauce'],
    [carrot(80), beans(80), cauliflower(100), corn(50), peas(50), butter(25), maida(20), milk(300), cheddar(30), mozzarella(40)], 0.85, [KATORI, PLATE]),
  d('pasta-salad', 'Pasta salad', ['macaroni salad', 'cold pasta salad'],
    [pasta(80), water(120), mayo(40), corn(40), capsicum(30), cucumber(30), carrot(20)], 0.92, [KATORI]),
  d('russian-salad', 'Russian salad', ['russian salad mayo', 'olivier salad veg'],
    [potato(150), carrot(80), peas(60), pineapple(60), apple(60), mayo(70), cream(20), sugar(5)], 0.95, [KATORI]),
  d('chicken-caesar-salad', 'Chicken caesar salad', ['caesar salad', 'grilled chicken caesar'],
    [romaine(150), chicken(100), oil(5), croutons(20), parmesan(10), mayo(30), lemon(10)], 0.92, [piece('1 bowl (300 g)', 300)]),
  d('tandoori-chicken-salad', 'Tandoori chicken salad', ['chicken tikka salad', 'grilled chicken salad indian'],
    [chicken(120), curd(20), oil(5), lettuce(60), cucumber(50), tomato(50), onion(30), lemon(10), hungCurd(30)], 0.9, [piece('1 bowl (340 g)', 340)]),
  d('veg-caesar-salad', 'Caesar salad (veg)', ['veg caesar salad', 'classic caesar salad veg'],
    [romaine(180), croutons(25), parmesan(12), mayo(30), lemon(10)], 0.95, [piece('1 bowl (240 g)', 240)]),
  d('greek-salad', 'Greek salad', ['greek salad with feta', 'mediterranean salad'],
    [cucumber(100), tomato(100), capsicum(50), onion(30), olives(20), feta(40), oliveOil(15)], 0.95, [piece('1 bowl (330 g)', 330)]),
  d('coleslaw', 'Coleslaw', ['cole slaw', 'cabbage mayo salad'],
    [cabbage(200), carrot(60), mayo(60), sugar(5), vinegar(10)], 0.95, [KATORI]),
  d('sauteed-vegetables', 'Sauteed vegetables (butter garlic)', ['butter garlic vegetables', 'grilled vegetables', 'stir fried veggies'],
    [broccoli(100), zucchini(80), carrot(80), redCapsicum(60), mushroom(80), babyCorn(60), butter(20), garlic(8)], 0.85, [KATORI]),
  d('chicken-steak', 'Grilled chicken steak with pepper sauce', ['chicken steak', 'pepper chicken steak', 'grilled chicken with mash'],
    [breast(200), oil(10), butter(15), maida(5), milk(60), cream(20), potato(150), milk(30), butter(10), carrot(50), beans(50)], 0.85, [piece('1 plate', 500)]),
  d('mashed-potatoes', 'Mashed potatoes', ['mashed potato', 'potato mash', 'butter mash'],
    [potato(500), butter(40), milk(100), cream(30)], 0.9, [KATORI]),
]

// ============================================================ FRIES AND FRIED SIDES
const SIDES: IndianRecipe[] = [
  d('peri-peri-fries', 'Peri peri fries', ['piri piri fries', 'masala french fries peri peri'],
    [potato(170), oil(18), chilliSauce(3)], 0.6, [piece('1 medium portion', 115)]),
  d('cheese-fries', 'Cheese fries', ['cheesy fries', 'fries with cheese sauce', 'loaded fries'],
    [potato(170), oil(18), cheeseSauce(60)], 0.7, [piece('1 portion', 175)]),
  d('masala-fries', 'Masala fries', ['masala french fries', 'chatpata fries'],
    [potato(170), oil(18), ketchup(5)], 0.6, [piece('1 medium portion', 115)]),
  d('potato-wedges', 'Potato wedges', ['wedges', 'masala wedges', 'spicy potato wedges'],
    [potato(200), maida(10), oil(18)], 0.65, [piece('1 portion', 150)]),
  d('hash-brown', 'Hash brown', ['hash browns', 'potato hash brown'],
    [potato(80), cornflour(5), oil(10)], 0.7, [piece('1 hash brown', 60)]),
  d('onion-rings', 'Onion rings', ['fried onion rings', 'crispy onion rings'],
    [onion(200), maida(40), cornflour(15), breadCrumbs(30), water(60), oil(40)], 0.75, [piece('1 portion (8 rings)', 120)]),
  d('mozzarella-sticks', 'Mozzarella cheese sticks', ['cheese sticks', 'mozzarella sticks', 'fried cheese sticks'],
    [mozzarella(200), maida(25), egg(50), breadCrumbs(40), oil(25)], 0.95, [piece('1 portion (6 sticks)', 150)]),
  d('chicken-nuggets', 'Chicken nuggets', ['nuggets', 'chicken nuggets fried'],
    [chickenMince(300), maida(30), breadCrumbs(50), egg(40), oil(45)], 0.85, [piece('6 nuggets (100 g)', 100), KEBAB(17)]),
  d('chicken-popcorn', 'Chicken popcorn', ['popcorn chicken', 'chicken bites fried'],
    [breast(300), maida(40), cornflour(20), breadCrumbs(20), egg(40), water(30), oil(50)], 0.82, [piece('1 regular box (110 g)', 110)]),
  d('fried-chicken', 'Fried chicken (crispy, bone-in)', ['crispy fried chicken', 'kfc style chicken', 'fried chicken bucket', 'hot and crispy chicken'],
    [legMeat(500), maida(60), cornflour(20), egg(50), water(40), oil(70)], 0.85, [piece('1 piece, edible part (90 g)', 90), piece('2 pieces (180 g)', 180)]),
  d('chicken-strips', 'Chicken strips', ['chicken tenders', 'crispy chicken strips', 'chicken fingers'],
    [breast(300), maida(30), breadCrumbs(50), egg(40), oil(45)], 0.85, [piece('3 strips (100 g)', 100)]),
  d('bbq-chicken-wings', 'BBQ chicken wings', ['barbeque wings', 'bbq wings', 'chicken wings'],
    [wings(500), oil(20), bbqSauce(80)], 0.75, [piece('6 wings, edible part (160 g)', 160)]),
  d('fish-fingers', 'Fish fingers', ['fish finger', 'fried fish fingers'],
    [basa(300), maida(30), egg(40), breadCrumbs(50), oil(45)], 0.85, [piece('6 fingers (150 g)', 150)]),
  d('fish-and-chips', 'Fish and chips', ['fish n chips', 'battered fish with fries'],
    [basa(180), maida(40), water(50), oil(25), potato(200), oil(20), mayo(20)], 0.78, [piece('1 plate', 420)]),
  d('jalapeno-poppers', 'Jalapeno cheese poppers', ['jalapeno poppers', 'cheese jalapeno poppers', 'cheesy jalapeno bites'],
    [jalapeno(60), cheeseSlice(60), mozzarella(60), potato(60), breadCrumbs(50), maida(20), water(30), oil(35)], 0.88, [piece('6 poppers (120 g)', 120)]),
  d('veg-nuggets', 'Veg nuggets', ['vegetable nuggets', 'veggie nuggets'],
    [potato(200), carrot(50), peas(40), corn(40), breadCrumbs(50), maida(20), water(30), oil(40)], 0.85, [piece('6 nuggets (100 g)', 100)]),
  d('peri-peri-chicken-wings', 'Peri peri chicken wings', ['piri piri wings', 'peri peri wings', 'hot wings'],
    [wings(500), oil(25), chilliSauce(40), lemon(15), ...gg(10)], 0.75, [piece('6 wings, edible part (160 g)', 160)]),
  d('masala-papad', 'Masala papad (fried)', ['masala papadum', 'papad masala', 'fried masala papad'],
    [n('westeast-papad')(15), oil(4), onion(15), tomato(15), cucumber(5)], 0.95, [piece('1 masala papad (50 g)', 50)]),
  d('green-salad', 'Green salad (restaurant: onion, cucumber, tomato)', ['green salad', 'kachumber plate', 'restaurant salad plate'],
    [onion(80), cucumber(100), tomato(80), carrot(40), lemon(10), greenChilli(5)], 1, [piece('1 plate (150 g)', 150)]),
]

// ============================================================ CAFE, IRANI CAFE AND DRINKS
const CAFE: IndianRecipe[] = [
  one('bhurji-pav', 'Bhurji pav (egg bhurji with 2 pav)', ['anda bhurji pav', 'egg bhurji pav'],
    [egg(150), onion(40), tomato(40), oil(8), butter(12), pav(80)], 0.92, '1 plate'),
  one('bun-omelette', 'Bun omelette', ['omelette pav', 'anda pav', 'bun omelet'],
    [bun(60), egg(100), onion(20), oil(8), butter(8), ketchup(10)], 0.92, '1 bun omelette'),
  one('cold-brew-coffee', 'Cold brew coffee (black)', ['cold brew', 'iced black coffee', 'iced americano'],
    [u(171890)(250), water(50)], 1, '1 glass'),
  d('french-toast', 'French toast (cafe, with honey)', ['french toast', 'eggy bread sweet', 'bread egg toast sweet'],
    [bread(60), egg(50), milk(30), butter(10), sugar(5), honey(15)], 0.92, [piece('2 slices (157 g)', 157)]),
  d('baked-beans-toast', 'Baked beans on toast', ['beans on toast', 'baked beans toast'],
    [bread(60), butter(8), u(175182)(150)], 0.97, [piece('1 plate (210 g)', 210)]),
  d('chicken-sausages-grilled', 'Grilled chicken sausages (2)', ['chicken sausages', 'breakfast sausages', 'grilled sausages'],
    [chickenSausage(100), oil(3)], 0.92, [piece('2 sausages (95 g)', 95)]),
  one('cappuccino', 'Cappuccino (no sugar)', ['cappuccino', 'cafe cappuccino'],
    [espresso(60), milk(150)], 1, '1 cup'),
  one('cafe-latte', 'Cafe latte (no sugar)', ['latte', 'caffe latte', 'hot latte'],
    [espresso(60), milk(230)], 1, '1 cup'),
  one('espresso', 'Espresso (single shot)', ['espresso shot', 'single espresso'],
    [espresso(30)], 1, '1 shot'),
  one('hazelnut-latte', 'Hazelnut latte', ['hazelnut cafe latte', 'hot hazelnut coffee'],
    [espresso(60), milk(220), hazelnutSyrup(20)], 1, '1 cup'),
  one('caramel-latte', 'Caramel latte', ['caramel macchiato', 'caramel cafe latte'],
    [espresso(60), milk(220), caramel(25)], 1, '1 cup'),
  one('flat-white', 'Flat white', ['flatwhite', 'flat white coffee'],
    [espresso(60), milk(130)], 1, '1 cup'),
  one('kadhai-doodh', 'Kadhai doodh (dhaba hot milk with malai)', ['kadhai wala doodh', 'kadai milk', 'malai doodh', 'garam doodh dhaba'],
    [milk(300), cream(20), sugar(18)], 0.85, '1 kulhad glass'),
  one('cafe-mocha', 'Cafe mocha', ['mocha', 'mocha coffee', 'caffe mocha'],
    [espresso(60), milk(180), chocSyrup(25), whippedCream(15)], 1, '1 cup'),
  one('iced-latte', 'Iced latte (no sugar)', ['iced coffee latte', 'cold latte'],
    [espresso(60), milk(200), water(60)], 1, '1 glass'),
  one('iced-mocha', 'Iced mocha', ['iced cafe mocha', 'cold mocha'],
    [espresso(60), milk(200), chocSyrup(25), water(60)], 1, '1 glass'),
  one('caramel-frappe', 'Caramel frappe', ['caramel frappuccino', 'caramel cold coffee', 'caramel frappe coffee'],
    [milk(220), espresso(60), caramel(40), iceCream(40), whippedCream(15), water(40)], 1, '1 tall glass'),
  one('mocha-frappe', 'Mocha frappe', ['mocha frappuccino', 'java chip frappe', 'chocolate cold coffee'],
    [milk(220), espresso(60), chocSyrup(40), iceCream(40), whippedCream(15), water(40)], 1, '1 tall glass'),
  one('hazelnut-cold-coffee', 'Hazelnut cold coffee', ['hazelnut frappe', 'hazelnut coffee cold'],
    [milk(220), instantCoffee(4), hazelnutSyrup(25), iceCream(40), water(40)], 1, '1 tall glass'),
  one('dalgona-coffee', 'Dalgona coffee', ['whipped coffee', 'dalgona'],
    [instantCoffee(8), sugar(15), water(10), milk(200)], 0.98, '1 glass'),
  one('peach-iced-tea', 'Peach iced tea', ['peach ice tea', 'iced tea peach'],
    [blackTea(250), peach(40), sugar(25), lemon(5)], 1, '1 glass'),
  one('virgin-mojito', 'Virgin mojito', ['mint mojito', 'mojito', 'mint lime mojito'],
    [lime(30), mint(8), sugar(25), lemonSoda(150), soda(80)], 1, '1 glass'),
  one('watermelon-mojito', 'Watermelon mojito', ['watermelon mint mojito'],
    [watermelon(150), lime(25), mint(6), sugar(20), soda(120)], 1, '1 glass'),
  one('strawberry-mojito', 'Strawberry mojito', ['strawberry mint mojito'],
    [strawberry(80), lime(25), mint(6), sugar(25), soda(150)], 1, '1 glass'),
  one('fruit-punch', 'Fruit punch mocktail', ['fruit punch', 'mixed fruit mocktail'],
    [orangeJuice(100), pineappleJuice(100), mango(40), n('rose-syrup')(15), lemonSoda(50)], 1, '1 glass'),
  one('blue-lagoon', 'Blue lagoon mocktail', ['blue lagoon', 'blue curacao mocktail'],
    [blueCuracao(40), lemon(20), lemonSoda(200)], 1, '1 glass'),
  one('mint-lemonade', 'Mint lemonade', ['pudina lemonade', 'lemon mint cooler', 'mint lime cooler'],
    [lemon(30), mint(8), sugar(25), water(220)], 1, '1 glass'),
  one('virgin-pina-colada', 'Virgin pina colada', ['pina colada', 'pineapple coconut mocktail'],
    [pineappleJuice(180), coconutMilk(60), sugar(10), iceCream(30)], 1, '1 glass'),
  one('kitkat-shake', 'KitKat shake', ['kitkat milkshake', 'kit kat shake'],
    [milk(220), kitkat(40), iceCream(60), chocSyrup(15)], 1, '1 tall glass'),
  one('brownie-shake', 'Brownie shake', ['brownie milkshake', 'chocolate brownie shake'],
    [milk(220), brownie(50), chocIceCream(60), chocSyrup(15)], 1, '1 tall glass'),
  one('vanilla-milkshake', 'Vanilla milkshake', ['vanilla shake', 'vanilla thick shake'],
    [milk(220), iceCream(90), sugar(10)], 1, '1 tall glass'),
  one('mango-smoothie', 'Mango smoothie', ['mango yogurt smoothie', 'aam smoothie'],
    [mango(150), curd(100), milk(80), honey(15)], 1, '1 glass'),
  one('mixed-berry-smoothie', 'Mixed berry smoothie', ['berry smoothie', 'strawberry blueberry smoothie'],
    [strawberry(80), blueberry(60), curd(120), milk(60), honey(15)], 1, '1 glass'),
  one('kesar-pista-shake', 'Kesar pista milkshake', ['kesar pista shake', 'saffron pistachio shake'],
    [milk(250), pistachio(15), iceCream(50), sugar(12)], 1, '1 tall glass'),
  one('ginger-lemon-honey-tea', 'Ginger lemon honey tea', ['lemon ginger honey tea', 'adrak nimbu shahad chai', 'honey ginger tea'],
    [water(220), ginger(8), lemon(15), honey(15)], 0.95, '1 cup'),
  one('cold-chocolate', 'Cold chocolate (thick)', ['cold cocoa', 'iced chocolate', 'chocolate frappe'],
    [milk(250), cocoa(8), chocSyrup(30), chocIceCream(50)], 1, '1 tall glass'),
]

export const RECIPES_RESTAURANT: IndianRecipe[] = [
  ...VEG_GRAVIES,
  ...VEG_STARTERS,
  ...IC_SOUPS,
  ...IC_VEG,
  ...IC_RICE_NOODLES,
  ...IC_NONVEG,
  ...MOMOS,
  ...NV_TANDOOR,
  ...NV_GRAVIES,
  ...BREADS,
  ...RICE,
  ...SOUPS,
  ...SIZZLERS,
  ...PIZZAS,
  ...FASTFOOD,
  ...SANDWICHES,
  ...PASTA_CONT,
  ...SIDES,
  ...CAFE,
]
