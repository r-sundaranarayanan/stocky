import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Food, FoodInput } from '@/types'
import * as foodService from '@/services/foodService'

const RECENT_LIMIT = 20

export const useFoodsStore = defineStore('foods', () => {
  const foods = ref<Food[]>([])
  const isLoaded = ref(false)

  const sortedByName = computed(() => [...foods.value].sort((a, b) => a.name.localeCompare(b.name)))

  const recent = computed(() => {
    const used = foods.value
      .filter((f) => f.lastUsedAt !== null)
      .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0))
    return (used.length > 0 ? used : sortedByName.value).slice(0, RECENT_LIMIT)
  })

  function search(term: string): Food[] {
    const q = term.trim().toLowerCase()
    if (!q) return recent.value
    return sortedByName.value.filter((f) => f.name.toLowerCase().includes(q))
  }

  function findById(id: string): Food | undefined {
    return foods.value.find((f) => f.id === id)
  }

  function findByName(name: string): Food | undefined {
    const n = name.trim().toLowerCase()
    return foods.value.find((f) => f.name.toLowerCase() === n)
  }

  async function load(uid: string, force = false) {
    if (isLoaded.value && !force) return
    foods.value = await foodService.listFoods(uid)
    isLoaded.value = true
  }

  async function create(uid: string, input: FoodInput): Promise<Food> {
    const food = await foodService.createFood(uid, input)
    foods.value.push(food)
    return food
  }

  async function update(uid: string, id: string, input: FoodInput) {
    await foodService.updateFood(uid, id, input)
    foods.value = foods.value.map((f) => (f.id === id ? { ...f, ...input } : f))
  }

  async function remove(uid: string, id: string) {
    await foodService.deleteFood(uid, id)
    foods.value = foods.value.filter((f) => f.id !== id)
  }

  async function markUsed(uid: string, id: string) {
    const usedAt = Date.now()
    await foodService.markFoodUsed(uid, id, usedAt)
    foods.value = foods.value.map((f) => (f.id === id ? { ...f, lastUsedAt: usedAt } : f))
  }

  function reset() {
    foods.value = []
    isLoaded.value = false
  }

  return {
    foods,
    isLoaded,
    sortedByName,
    recent,
    search,
    findById,
    findByName,
    load,
    create,
    update,
    remove,
    markUsed,
    reset,
  }
})
