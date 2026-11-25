import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isFutureDate } from '../date'

describe('isFutureDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 24, 23, 59, 0)) // late on 24 Nov 2026, local time
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is false for today and past days', () => {
    expect(isFutureDate('2026-11-24')).toBe(false)
    expect(isFutureDate('2026-11-23')).toBe(false)
    expect(isFutureDate('2025-12-31')).toBe(false)
  })

  it('is true for any later day, including across month and year', () => {
    expect(isFutureDate('2026-11-25')).toBe(true)
    expect(isFutureDate('2026-12-01')).toBe(true)
    expect(isFutureDate('2027-01-01')).toBe(true)
  })
})
