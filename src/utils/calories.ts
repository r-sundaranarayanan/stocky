import type { ActivityLevel, BodyStats, Gender } from '@/types'

const KG_PER_LB = 0.45359237
const CM_PER_INCH = 2.54
/** Approximate energy in one pound of body weight. */
const KCAL_PER_LB = 3500
const DAYS_PER_WEEK = 7

export const MIN_AGE = 18

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other / prefer not to say' },
]

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; factor: number }[] = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', factor: 1.2 },
  { value: 'light', label: 'Light (exercise 1-3 days/week)', factor: 1.375 },
  { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)', factor: 1.55 },
  { value: 'active', label: 'Very active (exercise 6-7 days/week)', factor: 1.725 },
]

/** Lowest daily intake we will suggest, to avoid unsafe plans. */
const MIN_DAILY_CALORIES: Record<Gender, number> = { male: 1500, female: 1200, other: 1200 }

const GENDER_OFFSET: Record<Gender, number> = { male: 5, female: -161, other: -78 }

/** Basal metabolic rate (kcal/day) using the Mifflin-St Jeor equation. */
export function calculateBmr(stats: BodyStats): number {
  const kg = stats.weightLb * KG_PER_LB
  const cm = stats.heightIn * CM_PER_INCH
  return 10 * kg + 6.25 * cm - 5 * stats.age + GENDER_OFFSET[stats.gender]
}

/** Calories needed per day to keep the same weight. */
export function calculateMaintenance(stats: BodyStats): number {
  const level = ACTIVITY_LEVELS.find((a) => a.value === stats.activityLevel)
  return Math.round(calculateBmr(stats) * (level?.factor ?? 1.2))
}

export interface DailyTarget {
  calories: number
  /** Difference from maintenance in kcal/day (negative = deficit). */
  adjustment: number
  /** True when the plan was raised to the minimum safe intake. */
  isClamped: boolean
  /** The weekly change this calorie target actually produces, in lb. */
  effectiveWeeklyChangeLb: number
}

export function calculateDailyTarget(
  maintenance: number,
  weeklyChangeLb: number,
  gender: Gender,
): DailyTarget {
  const wanted = Math.round(maintenance + (weeklyChangeLb * KCAL_PER_LB) / DAYS_PER_WEEK)
  const floor = MIN_DAILY_CALORIES[gender]
  const calories = Math.max(wanted, floor)
  const adjustment = calories - maintenance
  return {
    calories,
    adjustment,
    isClamped: calories !== wanted,
    effectiveWeeklyChangeLb: Math.round(((adjustment * DAYS_PER_WEEK) / KCAL_PER_LB) * 10) / 10,
  }
}

export function describeWeeklyChange(weeklyChangeLb: number): string {
  if (weeklyChangeLb === 0) return 'Maintain weight'
  const verb = weeklyChangeLb < 0 ? 'Lose' : 'Gain'
  return `${verb} ${Math.abs(weeklyChangeLb)} lb per week`
}
