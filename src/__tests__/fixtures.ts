import type { BodyStats, Entry, Food } from '@/types'

export function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 'f1',
    name: 'Banana',
    servingSize: 1,
    servingUnit: 'piece',
    calories: 100,
    protein: 1,
    carbs: 25,
    fat: 0,
    lastUsedAt: null,
    createdAt: 1,
    ...overrides,
  }
}

export function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    date: '2026-11-24',
    meal: 'breakfast',
    status: 'eaten',
    foodId: 'f1',
    foodName: 'Banana',
    servingSize: 1,
    servingUnit: 'piece',
    servings: 1,
    calories: 100,
    protein: 1,
    carbs: 25,
    fat: 0,
    createdAt: 1,
    ...overrides,
  }
}

export function makeStats(overrides: Partial<BodyStats> = {}): BodyStats {
  return {
    gender: 'female',
    age: 30,
    heightIn: 66,
    weightLb: 150,
    activityLevel: 'light',
    ...overrides,
  }
}
