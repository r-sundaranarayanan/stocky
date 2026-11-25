import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { makeFood } from '@/__tests__/fixtures'
import * as foodService from '@/services/foodService'
import { useFoodsStore } from '../foods'

vi.mock('@/services/foodService', () => ({
  listFoods: vi.fn(),
  createFood: vi.fn(),
  updateFood: vi.fn(),
  deleteFood: vi.fn(),
  markFoodUsed: vi.fn(),
}))

const service = vi.mocked(foodService)

const apple = makeFood({ id: 'a', name: 'Apple', lastUsedAt: null })
const banana = makeFood({ id: 'b', name: 'Banana', lastUsedAt: 200 })
const cherry = makeFood({ id: 'c', name: 'Cherry pie', lastUsedAt: 300 })

describe('foods store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  async function loadedStore(foods = [apple, banana, cherry]) {
    service.listFoods.mockResolvedValue(foods)
    const store = useFoodsStore()
    await store.load('uid1')
    return store
  }

  it('loads the foods of the given user', async () => {
    const store = await loadedStore()
    expect(service.listFoods).toHaveBeenCalledWith('uid1')
    expect(store.foods).toHaveLength(3)
    expect(store.isLoaded).toBe(true)
  })

  it('does not reload unless forced', async () => {
    const store = await loadedStore()
    await store.load('uid1')
    expect(service.listFoods).toHaveBeenCalledTimes(1)
    await store.load('uid1', true)
    expect(service.listFoods).toHaveBeenCalledTimes(2)
  })

  it('sorts foods by name', async () => {
    const store = await loadedStore([cherry, apple, banana])
    expect(store.sortedByName.map((f) => f.name)).toEqual(['Apple', 'Banana', 'Cherry pie'])
  })

  it('lists recently used foods first when searching with an empty term', async () => {
    const store = await loadedStore()
    expect(store.search('').map((f) => f.id)).toEqual(['c', 'b'])
    expect(store.search('   ').map((f) => f.id)).toEqual(['c', 'b'])
  })

  it('falls back to all foods by name when none were used yet', async () => {
    const store = await loadedStore([apple, makeFood({ id: 'z', name: 'Zucchini' })])
    expect(store.search('').map((f) => f.name)).toEqual(['Apple', 'Zucchini'])
  })

  it('limits recent foods to 20', async () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      makeFood({ id: `f${i}`, name: `Food ${i}`, lastUsedAt: i + 1 }),
    )
    const store = await loadedStore(many)
    expect(store.recent).toHaveLength(20)
    expect(store.recent[0]?.id).toBe('f29')
  })

  it('searches by name, case-insensitively, as a substring', async () => {
    const store = await loadedStore()
    expect(store.search('PIE').map((f) => f.id)).toEqual(['c'])
    expect(store.search('an').map((f) => f.id)).toEqual(['b'])
    expect(store.search('zzz')).toEqual([])
  })

  it('finds foods by id and by exact name', async () => {
    const store = await loadedStore()
    expect(store.findById('b')?.name).toBe('Banana')
    expect(store.findById('nope')).toBeUndefined()
    expect(store.findByName('  banana ')?.id).toBe('b')
    expect(store.findByName('ban')).toBeUndefined()
  })

  it('creates a food and adds it to the list', async () => {
    const store = await loadedStore([apple])
    const created = makeFood({ id: 'new', name: 'Kiwi' })
    service.createFood.mockResolvedValue(created)
    const input = {
      name: 'Kiwi',
      servingSize: 1,
      servingUnit: 'piece',
      calories: 40,
      protein: 1,
      carbs: 9,
      fat: 0,
    }
    const result = await store.create('uid1', input)
    expect(service.createFood).toHaveBeenCalledWith('uid1', input)
    expect(result).toEqual(created)
    expect(store.foods.map((f) => f.id)).toEqual(['a', 'new'])
  })

  it('updates a food in place', async () => {
    const store = await loadedStore()
    const input = {
      name: 'Green apple',
      servingSize: 2,
      servingUnit: 'g',
      calories: 90,
      protein: 0,
      carbs: 20,
      fat: 0,
    }
    await store.update('uid1', 'a', input)
    expect(service.updateFood).toHaveBeenCalledWith('uid1', 'a', input)
    expect(store.findById('a')).toMatchObject({ name: 'Green apple', calories: 90 })
    expect(store.findById('b')?.name).toBe('Banana')
  })

  it('removes a food', async () => {
    const store = await loadedStore()
    await store.remove('uid1', 'a')
    expect(service.deleteFood).toHaveBeenCalledWith('uid1', 'a')
    expect(store.foods.map((f) => f.id)).toEqual(['b', 'c'])
  })

  it('marks a food as used', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(999)
    const store = await loadedStore()
    await store.markUsed('uid1', 'a')
    expect(service.markFoodUsed).toHaveBeenCalledWith('uid1', 'a', 999)
    expect(store.findById('a')?.lastUsedAt).toBe(999)
  })

  it('does not change state when a service call fails', async () => {
    const store = await loadedStore()
    service.deleteFood.mockRejectedValue(new Error('nope'))
    await expect(store.remove('uid1', 'a')).rejects.toThrow('nope')
    expect(store.foods).toHaveLength(3)
  })

  it('resets', async () => {
    const store = await loadedStore()
    store.reset()
    expect(store.foods).toEqual([])
    expect(store.isLoaded).toBe(false)
  })
})
