import type { Nutrition } from '@/types'

export const EMPTY_NUTRITION: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }

const round1 = (n: number) => Math.round(n * 10) / 10

export function pickNutrition(source: Nutrition): Nutrition {
  return {
    calories: source.calories,
    protein: source.protein,
    carbs: source.carbs,
    fat: source.fat,
  }
}

export function scaleNutrition(source: Nutrition, factor: number): Nutrition {
  return {
    calories: round1(source.calories * factor),
    protein: round1(source.protein * factor),
    carbs: round1(source.carbs * factor),
    fat: round1(source.fat * factor),
  }
}

export function sumNutrition(items: Nutrition[]): Nutrition {
  const total = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { ...EMPTY_NUTRITION },
  )
  return scaleNutrition(total, 1)
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
