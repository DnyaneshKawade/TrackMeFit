// Daily protein, carbs, fat and fibre for a calorie level (spec T-068c).
// Pure, no I/O. Evidence: "Track Me Fit: Diet Engine Plan".

import { bmi, type Macros } from './diet'

/** Protein from day 1, for losing and gaining (DK, 15 Oct 2026). Above the
 * 1.3 g/kg point where more adds little muscle (Tagawa 2021). */
export const PROTEIN_PER_KG = 1.4
/** Protein never drops below this to make room for carbs. */
export const MIN_PROTEIN_PER_KG = 1.2
/** Kidney disease: capped, and see a doctor (KDIGO 2024). */
export const KIDNEY_PROTEIN_PER_KG = 0.8
/** From this BMI, protein is worked out on the weight at BMI 25 (Weijs). */
export const PROTEIN_BMI = 25
/** Carbs: at least 130 g and 40 % of calories. */
export const MIN_CARB_G = 130
export const MIN_CARB_SHARE = 0.4
/** Fat: about a quarter of calories, at least 20 % and 0.6 g/kg (ICMR 2024). */
export const FAT_SHARE = 0.25
export const MIN_FAT_SHARE = 0.2
export const MIN_FAT_PER_KG = 0.6
/** Fibre: 14 g per 1,000 kcal, at least 25 g (WHO 2023, Reynolds 2019). */
export const FIBRE_PER_1000_KCAL = 14
export const MIN_FIBRE_G = 25

export interface NutrientInput {
  kcal: number
  weightKg: number
  heightCm: number
  kidneyDisease?: boolean
}

export interface DailyTargets {
  values: Macros
  /** Protein per kg of the weight it is worked out on. */
  perKg: number
  fibreG: number
  /** Protein was lowered this week so carbs stay at their lowest level. */
  proteinLowered: boolean
  reasons: string[]
}

/** The weight protein is worked out on: body weight, or the weight at BMI 25
 * from BMI 25 up, so body fat doesn't raise it. */
export function proteinWeight(weightKg: number, heightCm: number): number {
  return bmi(weightKg, heightCm) >= PROTEIN_BMI ? PROTEIN_BMI * (heightCm / 100) ** 2 : weightKg
}

const carbsLeft = (kcal: number, proteinG: number, fatG: number) => (kcal - proteinG * 4 - fatG * 9) / 4
const round1 = (n: number) => Math.round(n * 10) / 10

/** Protein first, then fat, and carbs fill the rest. When carbs would drop
 * below their lowest level, fat goes down to 20 %, then protein goes down,
 * never below 1.2 g/kg. */
export function dailyTargets(i: NutrientInput): DailyTargets {
  const dose = proteinWeight(i.weightKg, i.heightCm)
  const perKgWanted = i.kidneyDisease ? KIDNEY_PROTEIN_PER_KG : PROTEIN_PER_KG
  let proteinG = perKgWanted * dose
  const minFat = Math.max(MIN_FAT_PER_KG * i.weightKg, (MIN_FAT_SHARE * i.kcal) / 9)
  let fatG = Math.max(MIN_FAT_PER_KG * i.weightKg, (FAT_SHARE * i.kcal) / 9)
  const carbMin = Math.max(MIN_CARB_G, (MIN_CARB_SHARE * i.kcal) / 4)

  // Make room for carbs: fat first, then protein.
  if (carbsLeft(i.kcal, proteinG, fatG) < carbMin) fatG = Math.max(minFat, (i.kcal - proteinG * 4 - carbMin * 4) / 9)
  let proteinLowered = false
  if (!i.kidneyDisease && carbsLeft(i.kcal, proteinG, fatG) < carbMin) {
    proteinG = Math.max(MIN_PROTEIN_PER_KG * dose, (i.kcal - fatG * 9 - carbMin * 4) / 4)
    proteinLowered = true
  }
  const carbG = Math.max(0, carbsLeft(i.kcal, proteinG, fatG))
  const perKg = round1(proteinG / dose)
  const fibreG = Math.max(MIN_FIBRE_G, Math.round((FIBRE_PER_1000_KCAL * i.kcal) / 1000))

  const reasons: string[] = []
  if (i.kidneyDisease) reasons.push(`Protein is kept to ${perKg} g per kg because of kidney disease. Ask your doctor for your own limit.`)
  else if (dose < i.weightKg) reasons.push(`Protein is ${perKg} g per kg of a healthy weight (${Math.round(dose)} kg).`)
  else reasons.push(`Protein is ${perKg} g per kg of body weight. That is enough to build muscle.`)
  if (proteinLowered) reasons.push(`Protein is a little lower for now. Carbs stay at ${Math.round(carbMin)} g or more.`)
  reasons.push('Fat is about a quarter of calories. Carbs fill the rest.')
  reasons.push(`Eat about ${fibreG} g of fibre a day. Dal, vegetables and fruit help.`)

  return {
    values: { kcal: i.kcal, proteinG: Math.round(proteinG), fatG: Math.round(fatG), carbG: Math.round(carbG) },
    perKg,
    fibreG,
    proteinLowered,
    reasons,
  }
}
