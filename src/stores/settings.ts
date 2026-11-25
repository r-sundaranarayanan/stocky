import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { BodyStats } from '@/types'
import { DEFAULT_CALORIE_GOAL } from '@/utils/constants'
import * as userService from '@/services/userService'

export const useSettingsStore = defineStore('settings', () => {
  const calorieGoal = ref(DEFAULT_CALORIE_GOAL)
  const onboardingCompleted = ref(false)
  const stats = ref<BodyStats | null>(null)
  const weeklyChangeLb = ref<number | null>(null)
  const isLoaded = ref(false)
  let inFlight: Promise<void> | null = null

  async function load(uid: string) {
    const profile = await userService.getProfile(uid)
    calorieGoal.value = profile?.calorieGoal ?? DEFAULT_CALORIE_GOAL
    onboardingCompleted.value = profile?.onboardingCompleted ?? false
    stats.value = profile?.stats ?? null
    weeklyChangeLb.value = profile?.weeklyChangeLb ?? null
    isLoaded.value = true
  }

  /** Loads the profile once; concurrent callers share the same request. */
  function ensureLoaded(uid: string): Promise<void> {
    if (isLoaded.value) return Promise.resolve()
    inFlight ??= load(uid).finally(() => {
      inFlight = null
    })
    return inFlight
  }

  async function saveGoal(uid: string, goal: number) {
    await userService.updateCalorieGoal(uid, goal)
    calorieGoal.value = goal
  }

  async function saveOnboarding(
    uid: string,
    newStats: BodyStats,
    newWeeklyChangeLb: number,
    goal: number,
  ) {
    await userService.saveOnboarding(uid, newStats, newWeeklyChangeLb, goal)
    stats.value = newStats
    weeklyChangeLb.value = newWeeklyChangeLb
    calorieGoal.value = goal
    onboardingCompleted.value = true
  }

  async function skipOnboarding(uid: string) {
    await userService.skipOnboarding(uid, calorieGoal.value)
    onboardingCompleted.value = true
  }

  function reset() {
    calorieGoal.value = DEFAULT_CALORIE_GOAL
    onboardingCompleted.value = false
    stats.value = null
    weeklyChangeLb.value = null
    isLoaded.value = false
    inFlight = null
  }

  return {
    calorieGoal,
    onboardingCompleted,
    stats,
    weeklyChangeLb,
    isLoaded,
    load,
    ensureLoaded,
    saveGoal,
    saveOnboarding,
    skipOnboarding,
    reset,
  }
})
