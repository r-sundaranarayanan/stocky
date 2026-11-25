import type { Meal } from '@/types'

export const DEFAULT_CALORIE_GOAL = 2000

export const MEALS: { value: Meal; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' },
]

export const SERVING_UNITS = ['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'slice', 'serving']

export function isMeal(value: unknown): value is Meal {
  return MEALS.some((m) => m.value === value)
}

/** Suggests a meal from the current local time. */
export function defaultMealForNow(now = new Date()): Meal {
  const hour = now.getHours()
  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 17) return 'snack'
  return 'dinner'
}
