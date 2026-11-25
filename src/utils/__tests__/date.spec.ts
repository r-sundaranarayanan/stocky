import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDateLabel, isValidDateString, shiftDate, toDateString, todayString } from '../date'

describe('date utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 24, 12, 0, 0)) // 24 Nov 2026, local time
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats a date as local YYYY-MM-DD with zero padding', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('returns today in local time', () => {
    expect(todayString()).toBe('2026-11-24')
  })

  it('shifts across month and year boundaries', () => {
    expect(shiftDate('2026-01-31', 1)).toBe('2026-02-01')
    expect(shiftDate('2026-03-01', -1)).toBe('2026-02-28')
    expect(shiftDate('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('handles leap years', () => {
    expect(shiftDate('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('validates date strings', () => {
    expect(isValidDateString('2026-11-24')).toBe(true)
    expect(isValidDateString('24-11-2026')).toBe(false)
    expect(isValidDateString('')).toBe(false)
    expect(isValidDateString(undefined)).toBe(false)
    expect(isValidDateString(20261124)).toBe(false)
  })

  it('labels today, yesterday and tomorrow', () => {
    expect(formatDateLabel('2026-11-24')).toBe('Today')
    expect(formatDateLabel('2026-11-23')).toBe('Yesterday')
    expect(formatDateLabel('2026-11-25')).toBe('Tomorrow')
  })

  it('formats other dates with a weekday and day number', () => {
    const label = formatDateLabel('2026-11-20')
    expect(label).not.toBe('Today')
    expect(label).toContain('20')
  })
})
