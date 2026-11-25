import { describe, expect, it } from 'vitest'
import {
  EMPTY_NUTRITION,
  formatNumber,
  pickNutrition,
  scaleNutrition,
  sumNutrition,
} from '../nutrition'

describe('nutrition utils', () => {
  it('picks only the nutrition fields', () => {
    const food = { id: 'x', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 }
    expect(pickNutrition(food)).toEqual({ calories: 95, protein: 0.5, carbs: 25, fat: 0.3 })
  })

  it('scales nutrition by a factor', () => {
    expect(scaleNutrition({ calories: 100, protein: 10, carbs: 20, fat: 4 }, 2.5)).toEqual({
      calories: 250,
      protein: 25,
      carbs: 50,
      fat: 10,
    })
  })

  it('rounds scaled values to one decimal place', () => {
    const result = scaleNutrition({ calories: 100, protein: 1, carbs: 1, fat: 1 }, 1 / 3)
    expect(result.calories).toBe(33.3)
  })

  it('scaling by zero gives zeros', () => {
    expect(scaleNutrition({ calories: 100, protein: 5, carbs: 5, fat: 5 }, 0)).toEqual(
      EMPTY_NUTRITION,
    )
  })

  it('sums a list of items', () => {
    const total = sumNutrition([
      { calories: 100, protein: 1, carbs: 20, fat: 0 },
      { calories: 50, protein: 2, carbs: 5, fat: 3 },
    ])
    expect(total).toEqual({ calories: 150, protein: 3, carbs: 25, fat: 3 })
  })

  it('sums an empty list to zeros', () => {
    expect(sumNutrition([])).toEqual(EMPTY_NUTRITION)
  })

  it('does not mutate the shared EMPTY_NUTRITION constant', () => {
    sumNutrition([{ calories: 10, protein: 1, carbs: 1, fat: 1 }])
    expect(EMPTY_NUTRITION).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  })

  it('formats whole numbers without decimals and others with one', () => {
    expect(formatNumber(2)).toBe('2')
    expect(formatNumber(2.5)).toBe('2.5')
    expect(formatNumber(0)).toBe('0')
  })
})
