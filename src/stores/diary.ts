import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Entry, EntryInput, Meal } from '@/types'
import * as entryService from '@/services/entryService'
import { isFutureDate, todayString } from '@/utils/date'
import { pickNutrition, scaleNutrition, sumNutrition } from '@/utils/nutrition'

export const useDiaryStore = defineStore('diary', () => {
  const date = ref(todayString())
  const entries = ref<Entry[]>([])

  const eatenEntries = computed(() => entries.value.filter((e) => e.status === 'eaten'))
  const plannedEntries = computed(() => entries.value.filter((e) => e.status === 'planned'))

  /** Only food that has actually been eaten counts towards the day's totals. */
  const totals = computed(() => sumNutrition(eatenEntries.value))
  const plannedTotals = computed(() => sumNutrition(plannedEntries.value))

  function entriesFor(meal: Meal): Entry[] {
    return entries.value.filter((e) => e.meal === meal)
  }

  async function load(uid: string, targetDate = date.value) {
    date.value = targetDate
    entries.value = []
    const loaded = await entryService.listEntriesByDate(uid, targetDate)
    // Ignore the result if the user navigated to another day while loading.
    if (date.value === targetDate) entries.value = loaded
  }

  async function getEntry(uid: string, id: string): Promise<Entry | null> {
    return entries.value.find((e) => e.id === id) ?? (await entryService.getEntry(uid, id))
  }

  async function add(uid: string, input: EntryInput) {
    const entry = await entryService.addEntry(uid, input)
    if (entry.date === date.value) entries.value.push(entry)
    return entry
  }

  async function update(uid: string, entry: Entry, changes: { meal: Meal; servings: number }) {
    const perServing = scaleNutrition(pickNutrition(entry), 1 / entry.servings)
    const totalsForServings = scaleNutrition(perServing, changes.servings)
    const updated = { ...changes, ...totalsForServings }
    await entryService.updateEntry(uid, entry.id, updated)
    entries.value = entries.value.map((e) => (e.id === entry.id ? { ...e, ...updated } : e))
  }

  /** Marks a planned entry as eaten. Only allowed on or after the day it was planned for. */
  async function confirm(uid: string, id: string) {
    const entry = entries.value.find((e) => e.id === id)
    if (!entry || entry.status !== 'planned') return
    if (isFutureDate(entry.date)) {
      throw new Error('Planned food can be confirmed on the day you eat it.')
    }
    await entryService.updateEntry(uid, id, { status: 'eaten' })
    entries.value = entries.value.map((e) => (e.id === id ? { ...e, status: 'eaten' } : e))
  }

  async function remove(uid: string, id: string) {
    await entryService.deleteEntry(uid, id)
    entries.value = entries.value.filter((e) => e.id !== id)
  }

  function reset() {
    date.value = todayString()
    entries.value = []
  }

  return {
    date,
    entries,
    totals,
    plannedTotals,
    entriesFor,
    load,
    getEntry,
    add,
    update,
    confirm,
    remove,
    reset,
  }
})
