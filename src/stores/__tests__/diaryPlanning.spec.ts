import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { makeEntry } from '@/__tests__/fixtures'
import * as entryService from '@/services/entryService'
import { useDiaryStore } from '../diary'

vi.mock('@/services/entryService', () => ({
  listEntriesByDate: vi.fn(),
  getEntry: vi.fn(),
  addEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
}))

const service = vi.mocked(entryService)
const TODAY = '2026-11-24'
const TOMORROW = '2026-11-25'

describe('diary store: planned vs eaten food', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 24, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function loadDay(date: string, entries: ReturnType<typeof makeEntry>[]) {
    service.listEntriesByDate.mockResolvedValue(entries)
    const store = useDiaryStore()
    await store.load('uid1', date)
    return store
  }

  it('counts only eaten food in the totals', async () => {
    const store = await loadDay(TODAY, [
      makeEntry({ id: 'a', status: 'eaten', calories: 300 }),
      makeEntry({ id: 'b', status: 'planned', calories: 500 }),
    ])
    expect(store.totals.calories).toBe(300)
    expect(store.plannedTotals.calories).toBe(500)
  })

  it('shows nothing as eaten on a future day with only planned food', async () => {
    const store = await loadDay(TOMORROW, [
      makeEntry({ id: 'a', date: TOMORROW, status: 'planned', calories: 400, protein: 20 }),
      makeEntry({ id: 'b', date: TOMORROW, status: 'planned', calories: 200, protein: 5 }),
    ])
    expect(store.totals.calories).toBe(0)
    expect(store.plannedTotals).toMatchObject({ calories: 600, protein: 25 })
  })

  it('still lists planned entries under their meal', async () => {
    const store = await loadDay(TOMORROW, [
      makeEntry({ id: 'a', date: TOMORROW, meal: 'dinner', status: 'planned' }),
    ])
    expect(store.entriesFor('dinner')).toHaveLength(1)
  })

  it('confirms a planned entry for today as eaten', async () => {
    const store = await loadDay(TODAY, [makeEntry({ id: 'a', status: 'planned', calories: 500 })])
    await store.confirm('uid1', 'a')
    expect(service.updateEntry).toHaveBeenCalledWith('uid1', 'a', { status: 'eaten' })
    expect(store.entries[0]?.status).toBe('eaten')
    expect(store.totals.calories).toBe(500)
    expect(store.plannedTotals.calories).toBe(0)
  })

  it('confirms a planned entry from a past day', async () => {
    const store = await loadDay('2026-11-20', [
      makeEntry({ id: 'a', date: '2026-11-20', status: 'planned' }),
    ])
    await store.confirm('uid1', 'a')
    expect(store.entries[0]?.status).toBe('eaten')
  })

  it('refuses to confirm food planned for a future day', async () => {
    const store = await loadDay(TOMORROW, [
      makeEntry({ id: 'a', date: TOMORROW, status: 'planned' }),
    ])
    await expect(store.confirm('uid1', 'a')).rejects.toThrow('on the day')
    expect(service.updateEntry).not.toHaveBeenCalled()
    expect(store.entries[0]?.status).toBe('planned')
    expect(store.totals.calories).toBe(0)
  })

  it('does nothing when the entry is already eaten or unknown', async () => {
    const store = await loadDay(TODAY, [makeEntry({ id: 'a', status: 'eaten' })])
    await store.confirm('uid1', 'a')
    await store.confirm('uid1', 'missing')
    expect(service.updateEntry).not.toHaveBeenCalled()
  })

  it('keeps the entry planned when the save fails', async () => {
    const store = await loadDay(TODAY, [makeEntry({ id: 'a', status: 'planned' })])
    service.updateEntry.mockRejectedValue(new Error('offline'))
    await expect(store.confirm('uid1', 'a')).rejects.toThrow('offline')
    expect(store.entries[0]?.status).toBe('planned')
  })

  it('keeps the status when servings are edited', async () => {
    const store = await loadDay(TOMORROW, [
      makeEntry({ id: 'a', date: TOMORROW, status: 'planned', servings: 1, calories: 100 }),
    ])
    await store.update('uid1', store.entries[0]!, { meal: 'lunch', servings: 2 })
    expect(store.entries[0]).toMatchObject({ status: 'planned', calories: 200 })
  })
})
