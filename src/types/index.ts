export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Food extends Nutrition {
  id: string
  name: string
  servingSize: number
  servingUnit: string
  lastUsedAt: number | null
  createdAt: number
}

export type FoodInput = Omit<Food, 'id' | 'lastUsedAt' | 'createdAt'>

/** `planned` entries are for a future meal and do not count as eaten until confirmed. */
export type EntryStatus = 'eaten' | 'planned'

export interface Entry extends Nutrition {
  id: string
  date: string
  meal: Meal
  status: EntryStatus
  foodId: string | null
  foodName: string
  servingSize: number
  servingUnit: string
  servings: number
  createdAt: number
}

export type EntryInput = Omit<Entry, 'id' | 'createdAt'>

export type Gender = 'male' | 'female' | 'other'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'

/** Body details collected during onboarding (imperial units). */
export interface BodyStats {
  gender: Gender
  age: number
  heightIn: number
  weightLb: number
  activityLevel: ActivityLevel
}

export interface UserProfile {
  email: string
  calorieGoal: number
  onboardingCompleted: boolean
  stats: BodyStats | null
  /** Chosen weekly change in lb: negative to lose, positive to gain, 0 to maintain. */
  weeklyChangeLb: number | null
}

export type ThemePreference = 'system' | 'light' | 'dark'
