# T-058: Suggested day of meals (opt-in)

Status: agreed (DK, 13 Oct 2026: "start with the appropriate tasks"); engine built (T-058a), screens next (T-058b)
Tasks: [T-058a, T-058b, T-058c](../tasks/TASKS.md)

## Problem
Most Indian diets are short on protein, not on carbs or fat. A beginner does
not know how much dal, rice or paneer gets them to their target. We want to
offer a starter day of meals that looks like what they already eat, adds the
protein sources they like, and never asks for silly amounts.

## What DK asked for (13 Oct 2026, in his words where possible)
- First ask "do u want a automated planned diet".
- "ask user to select preferred protein sources, carb sources and fat sources
  in simple rookie language and then suggest initial diet plan" with suggested
  calories and macros.
- "protein items user will have to select in such a way that suggested macros
  calories should be reached with those" (a feasibility check).
- "keep food items in limited range one cannot eat 200 gm soya or 500 gm rice
  in a day".
- "mention everything in gram, no portions, and try to make it similar to food
  items entered in typical day page just include additional protein sources
  as selected, in most indian diet as mostly only protein lacks".
- Weights "preferably raw measured" and "preferred raw, can include cooked at
  times".

## Acceptance criteria
1. Given a finished typical day, when the person reaches "Your plan", then
   they are asked "Want us to suggest a day of meals?" with Yes and Not now.
   Not now changes nothing.
2. Given Yes, then they pick protein foods they like, in plain words ("Paneer",
   "Eggs", "Chicken", "Soya chunks", "Dal and chana", "Curd", "Whey protein"),
   filtered by their diet, rules and allergies (T-057). Carb and fat
   preferences default to what their typical day already has and can be
   changed.
3. Given the picks, then the plan starts from the typical-day foods and keeps
   them, changing only amounts, and adds the picked protein foods to cover the
   protein gap.
4. Given any plan, then every amount is in grams, raw (uncooked, dry) weight
   by default, labelled "raw" or "dry", with the cooked weight as a hint
   ("60 g raw rice, about 180 g cooked"). The person can switch any item to
   cooked weight (useful for dal or sabzi made for the family). No katori or
   piece counts.
5. Given any food, then its amount never goes over its per-meal or per-day cap
   (table below), and a capped food says why ("Soya is capped at 50 g dry a
   day").
6. Given the picks cannot reach the protein target within the caps, then the
   app says so before building the plan ("With these foods you can reach
   about 85 g of your 120 g protein") and offers diet-appropriate additions.
   The person can instead accept a lower target; it changes only on their OK,
   with the reason shown.
7. Given a plan, then calories are within 5% and protein within 5 g of target,
   with carbs and fat filling the rest from the person's own carb and fat foods.
8. Given a plan, then protein is spread over at least 3 meals plus a snack,
   aiming at about 0.4 g per kg body weight per meal and never more than
   0.55 g/kg in one meal, and each item has a one-line reason.
9. Given a non-veg-free day, fasting day, onion-garlic rule or allergy, then
   the plan for that day uses only allowed foods (for example paneer instead
   of chicken on Tuesday).
10. Given the plan, then the person can swap any item for another of the same
    kind, and nothing is saved until they press "Use this plan".
11. Given a plan, then it also keeps the basics from ICMR-NIN "My Plate":
    about 400 g raw vegetables (potato not counted) and 100 g fruit a day,
    fats and oils near 27 g per 2,000 kcal, and added sugar at most 25 g.
    Where the typical day falls short, the plan adds vegetables first.
12. Given a vegetarian or vegan plan, then each main meal pairs a cereal with
    a pulse, dairy or soy food, so the protein is complete.
13. Given the health check advised seeing a doctor (for example kidney
    disease, pregnancy, diabetes on medicine), then the app does not offer an
    automatic plan and suggests a coach or doctor instead.
14. Given any suggested plan or target, then it carries this note, in these
    words (DK, 13 Oct 2026): "Please note: these numbers are only
    suggestions, based on nutrition research. They are not medical advice.
    You decide whether to follow them. If you have a health problem, are
    pregnant, or take regular medicine, talk to your doctor first."

## Caps (raw weight, first estimates for DK to check)
| Food | Per meal | Per day |
|---|---|---|
| Soya chunks, dry | 30 g | 50 g |
| Paneer | 100 g | 150 g |
| Tofu | 150 g | 200 g |
| Rice, raw | 100 g | 150 g (about 450 g cooked) |
| Atta (roti), raw | 90 g (3 roti) | 180 g |
| Poha, oats, rava, raw | 60 g | 80 g |
| Dal, chana, rajma, dry | 50 g | 100 g |
| Eggs | 4 eggs (200 g) | 6 eggs (300 g) |
| Chicken, fish, mutton, raw | 200 g | 300 g |
| Curd | 200 g | 400 g |
| Milk | 300 g | 500 g |
| Whey protein | 30 g | 50 g |
| Ghee, oil | 10 g | 25 g |
| Nuts, peanuts, seeds | 30 g | 40 g |

## Evidence checked (13 Oct 2026)
- Raw weights match how ICMR-NIN writes its 2024 guidelines: "My Plate for
  the Day" gives raw grams per food group for 2,000 kcal (cereals 250 g,
  pulses 85 g, milk or curd 300 ml, vegetables 400 g, fruit 100 g, nuts and
  seeds 35 g, fats and oils 27 g), protein about 15% and fat about 30% of
  calories, sugar limited to 25 to 30 g. Eggs, fish or meat may replace part
  of the pulses. Source: ICMR-NIN policy brief, My Plate for the Day
  (nin.res.in).
- Protein target: gains in muscle stop rising past about 1.6 g/kg a day
  (Morton et al., Br J Sports Med 2018, meta-analysis of 49 trials). Our diet
  engine already uses 1.6 g/kg, and 2.2 g/kg only for trained lifters losing
  fat.
- Protein per meal: 0.4 g/kg per meal over at least four meals, up to
  0.55 g/kg per meal at the 2.2 g/kg top end (Schoenfeld and Aragon, JISSN
  2018). This replaces the earlier "no meal over 40%" idea.
- Soya: a meta-analysis of 41 studies found soy protein and isoflavones do
  not change testosterone or estrogen in men (Reed et al., Reprod Toxicol
  2021). The 50 g dry cap is for gut comfort and variety, and the reason the
  app shows must not say soya is harmful to hormones.
- Fat floor: the engine never goes below 0.6 g/kg or 20% of calories, in line
  with the ICMR 30% figure as an upper reference.
- Inferred, not from a study we checked: starting from the person's own
  typical day should make the plan easier to follow than a new menu.

## Rules and reasons
- The engine is a pure function in `src/engine/` that returns the plan and a
  reason per item (rules in `docs/engineering.md`).
- Order of work: keep typical-day foods, scale their amounts toward the
  calorie target within caps, fill the protein gap from the picked protein
  foods (leanest per calorie first), then adjust carbs and fat.
- Targets come from the person or coach. The plan never changes a target
  except through criterion 6, with consent.

## How the engine decides (T-058a)
- The typical day becomes raw foods: 1 roti = 30 g atta, 1 katori rice =
  50 g raw rice, 1 katori dal = 25 g dry dal and 3 g ghee, 1 katori sabzi =
  130 g vegetables and 6 g oil, chai = 60 g milk and 8 g sugar. Fried snacks
  and sweets are not carried into a plan.
- Protein gap: more of the picked foods the person already eats first, then
  the leanest new ones (most protein per calorie). Cereals and vegetables
  bring protein too, so any overshoot is taken back from the last food
  added.
- Fat goes to the person's own oil or ghee, kept near 27 g per 2,000 kcal.
  Cereals are scaled to fit the calories, and a second cereal is added only
  when the first is at its limit.
- Meals: cereals at breakfast, lunch and dinner (rice at lunch and dinner),
  dal, chicken and fish at lunch and dinner, fruit as the snack, protein
  portions to the meal with the least so far. If a meal goes over 0.55 g/kg,
  some dal or soya can move to breakfast and a roti to the snack.
- Paneer, soya chunks and whey use values from a similar USDA food (queso
  fresco, defatted soy flour, whey isolate) until we have Indian packet
  labels (T-031); each such item says so.

## Data and privacy
- New table `meal_plans` (person, plan JSON, created, accepted) with the same
  RLS as food logs; migration named in the build PR.
- Protein, carb and fat picks are stored on the profile.

## Edge cases
- Typical day empty: start from a simple default of their diet type.
- Target lower than the typical day's protein: no additions.
- Only one protein pick: caps may make the target unreachable, criterion 6.

## Out of scope
- Weekly menus, recipes, shopping lists, cost.

## Tests
| Criterion | Test file |
|---|---|
| 1, 2, 10, 13, 14 | `src/profile/MealPlan.test.tsx` |
| 3 to 9, 11, 12 | `src/engine/mealPlan.test.ts` |
