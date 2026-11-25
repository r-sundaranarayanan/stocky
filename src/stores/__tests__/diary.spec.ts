import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { makeEntry } from '@/__tests__/fixtures'
import type { Entry, EntryInput } from '@/types'
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

/** Strips the server-generated fields to get what the store sends when adding. */
function toInput(entry: Entry): EntryInput {
  const { id, createdAt, ...input } = entry
  void id
  void createdAt
  return input
}
const DAY = '2026-11-24'

const breakfast = makeEntry({ id: 'e1', meal: 'breakfast', calories: 100 })
const lunch = makeEntry({ id: 'e2', meal: 'lunch', calories: 250, protein: 10 })
const lunch2 = makeEntry({ id: 'e3', meal: 'lunch', calories: 50, protein: 5 })

describe('diary store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  async function loadedStore() {
    service.listEntriesByDate.mockResolvedValue([breakfast, lunch, lunch2])
    const store = useDiaryStore()
    await store.load('uid1', DAY)
    return store
  }

  it('loads entries for a date and selects that date', async () => {
    const store = await loadedStore()
    expect(service.listEntriesByDate).toHaveBeenCalledWith('uid1', DAY)
    expect(store.date).toBe(DAY)
    expect(store.entries).toHaveLength(3)
  })

  it('groups entries by meal', async () => {
    const store = await loadedStore()
    expect(store.entriesFor('breakfast')).toHaveLength(1)
    expect(store.entriesFor('lunch')).toHaveLength(2)
    expect(store.entriesFor('dinner')).toEqual([])
  })

  it('totals calories and macros for the day', async () => {
    const store = await loadedStore()
    expect(store.totals.calories).toBe(400)
    expect(store.totals.protein).toBe(16)
  })

  it('ignores a stale response when the user switches day while loading', async () => {
    const store = useDiaryStore()
    let resolveSlow!: (entries: ReturnType<typeof makeEntry>[]) => void
    service.listEntriesByDate.mockImplementationOnce(
      () => new Promise((resolve) => (resolveSlow = resolve)),
    )
    const slow = store.load('uid1', '2026-11-23')

    service.listEntriesByDate.mockResolvedValueOnce([makeEntry({ id: 'new', date: DAY })])
    await store.load('uid1', DAY)

    resolveSlow([makeEntry({ id: 'old', date: '2026-11-23' })])
    await slow

    expect(store.date).toBe(DAY)
    expect(store.entries.map((e) => e.id)).toEqual(['new'])
  })

  it('adds an entry for the open day', async () => {
    const store = await loadedStore()
    const created = makeEntry({ id: 'new', date: DAY, meal: 'dinner' })
    service.addEntry.mockResolvedValue(created)
    const input = toInput(created)
    await store.add('uid1', input)
    expect(service.addEntry).toHaveBeenCalledWith('uid1', input)
    expect(store.entriesFor('dinner')).toHaveLength(1)
  })

  it('does not show an entry added for a different day', async () => {
    const store = await loadedStore()
    const created = makeEntry({ id: 'other', date: '2026-11-20' })
    service.addEntry.mockResolvedValue(created)
    await store.add('uid1', toInput(created))
    expect(store.entries).toHaveLength(3)
  })

  it('rescales nutrition when servings change and can move the meal', async () => {
    service.listEntriesByDate.mockResolvedValue([
      makeEntry({ id: 'e1', servings: 2, calories: 200, protein: 10, carbs: 40, fat: 4 }),
    ])
    const store = useDiaryStore()
    await store.load('uid1', DAY)
    const entry = store.entries[0]!

    await store.update('uid1', entry, { meal: 'dinner', servings: 3 })

    expect(service.updateEntry).toHaveBeenCalledWith('uid1', 'e1', {
      meal: 'dinner',
      servings: 3,
      calories: 300,
      protein: 15,
      carbs: 60,
      fat: 6,
    })
    expect(store.entries[0]).toMatchObject({ meal: 'dinner', servings: 3, calories: 300 })
  })

  it('removes an entry', async () => {
    const store = await loadedStore()
    await store.remove('uid1', 'e2')
    expect(service.deleteEntry).toHaveBeenCalledWith('uid1', 'e2')
    expect(store.entries.map((e) => e.id)).toEqual(['e1', 'e3'])
  })

  it('gets an entry from memory before asking the service', async () => {
    const store = await loadedStore()
    expect(await store.getEntry('uid1', 'e2')).toEqual(lunch)
    expect(service.getEntry).not.toHaveBeenCalled()

    service.getEntry.mockResolvedValue(makeEntry({ id: 'remote' }))
    expect((await store.getEntry('uid1', 'remote'))?.id).toBe('remote')
    expect(service.getEntry).toHaveBeenCalledWith('uid1', 'remote')
  })

  it('resets', async () => {
    const store = await loadedStore()
    store.reset()
    expect(store.entries).toEqual([])
  })
})
