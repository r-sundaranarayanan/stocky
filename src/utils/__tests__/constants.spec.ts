import { describe, expect, it } from 'vitest'
import { MEALS, defaultMealForNow, isMeal } from '../constants'

describe('MEALS', () => {
  it('lists the four meals in order', () => {
    expect(MEALS.map((m) => m.value)).toEqual(['breakfast', 'lunch', 'dinner', 'snack'])
  })
})

describe('isMeal', () => {
  it('accepts valid meals and rejects everything else', () => {
    expect(isMeal('lunch')).toBe(true)
    expect(isMeal('brunch')).toBe(false)
    expect(isMeal(undefined)).toBe(false)
    expect(isMeal(['lunch'])).toBe(false)
  })
})

describe('defaultMealForNow', () => {
  const at = (hour: number) => defaultMealForNow(new Date(2026, 0, 1, hour))

  it('suggests a meal by time of day', () => {
    expect(at(8)).toBe('breakfast')
    expect(at(12)).toBe('lunch')
    expect(at(16)).toBe('snack')
    expect(at(19)).toBe('dinner')
    expect(at(2)).toBe('breakfast')
  })

  it('switches at the boundaries', () => {
    expect(at(10)).toBe('breakfast')
    expect(at(11)).toBe('lunch')
    expect(at(14)).toBe('lunch')
    expect(at(15)).toBe('snack')
    expect(at(17)).toBe('dinner')
  })
})
