import { describe, expect, it } from 'vitest'
import { makeStats } from '@/__tests__/fixtures'
import {
  calculateBmr,
  calculateDailyTarget,
  calculateMaintenance,
  describeWeeklyChange,
} from '../calories'

describe('calculateBmr (Mifflin-St Jeor)', () => {
  it('calculates for a female', () => {
    // 150 lb, 66 in, 30 y, female
    expect(calculateBmr(makeStats())).toBeCloseTo(1417.1, 0)
  })

  it('calculates for a male', () => {
    // 180 lb, 70 in, 30 y, male
    expect(calculateBmr(makeStats({ gender: 'male', weightLb: 180, heightIn: 70 }))).toBeCloseTo(
      1782.7,
      0,
    )
  })

  it('uses the midpoint offset for "other"', () => {
    const female = calculateBmr(makeStats({ gender: 'female' }))
    const male = calculateBmr(makeStats({ gender: 'male' }))
    const other = calculateBmr(makeStats({ gender: 'other' }))
    expect(other).toBeGreaterThan(female)
    expect(other).toBeLessThan(male)
  })

  it('decreases with age and increases with weight', () => {
    const base = calculateBmr(makeStats())
    expect(calculateBmr(makeStats({ age: 50 }))).toBeLessThan(base)
    expect(calculateBmr(makeStats({ weightLb: 200 }))).toBeGreaterThan(base)
  })
})

describe('calculateMaintenance', () => {
  it('applies the activity factor and rounds', () => {
    expect(calculateMaintenance(makeStats({ activityLevel: 'light' }))).toBe(1949)
    expect(calculateMaintenance(makeStats({ activityLevel: 'sedentary' }))).toBe(1701)
  })

  it('increases with higher activity levels', () => {
    const levels = ['sedentary', 'light', 'moderate', 'active'] as const
    const values = levels.map((activityLevel) => calculateMaintenance(makeStats({ activityLevel })))
    expect([...values].sort((a, b) => a - b)).toEqual(values)
  })
})

describe('calculateDailyTarget', () => {
  it('subtracts 500 kcal/day to lose 1 lb/week', () => {
    expect(calculateDailyTarget(2000, -1, 'female')).toEqual({
      calories: 1500,
      adjustment: -500,
      isClamped: false,
      effectiveWeeklyChangeLb: -1,
    })
  })

  it('adds calories to gain weight', () => {
    expect(calculateDailyTarget(2000, 1, 'female').calories).toBe(2500)
    expect(calculateDailyTarget(2000, 0.5, 'female').calories).toBe(2250)
  })

  it('keeps maintenance calories for 0', () => {
    const target = calculateDailyTarget(2000, 0, 'male')
    expect(target.calories).toBe(2000)
    expect(target.adjustment).toBe(0)
    expect(target.isClamped).toBe(false)
  })

  it('clamps to 1200 kcal for females and reports the effective rate', () => {
    const target = calculateDailyTarget(1600, -2, 'female')
    expect(target.calories).toBe(1200)
    expect(target.isClamped).toBe(true)
    expect(target.adjustment).toBe(-400)
    expect(target.effectiveWeeklyChangeLb).toBe(-0.8)
  })

  it('clamps to 1500 kcal for males', () => {
    const target = calculateDailyTarget(1700, -1, 'male')
    expect(target.calories).toBe(1500)
    expect(target.isClamped).toBe(true)
  })

  it('does not clamp when exactly at the floor', () => {
    expect(calculateDailyTarget(1700, -1, 'female').isClamped).toBe(false)
  })
})

describe('describeWeeklyChange', () => {
  it('describes maintain, lose and gain', () => {
    expect(describeWeeklyChange(0)).toBe('Maintain weight')
    expect(describeWeeklyChange(-1)).toBe('Lose 1 lb per week')
    expect(describeWeeklyChange(1.5)).toBe('Gain 1.5 lb per week')
  })
})
