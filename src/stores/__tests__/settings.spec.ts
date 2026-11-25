import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { makeStats } from '@/__tests__/fixtures'
import * as userService from '@/services/userService'
import { DEFAULT_CALORIE_GOAL } from '@/utils/constants'
import { useSettingsStore } from '../settings'

vi.mock('@/services/userService', () => ({
  getProfile: vi.fn(),
  updateCalorieGoal: vi.fn(),
  saveOnboarding: vi.fn(),
  skipOnboarding: vi.fn(),
}))

const service = vi.mocked(userService)

describe('settings store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('starts with defaults', () => {
    const store = useSettingsStore()
    expect(store.calorieGoal).toBe(DEFAULT_CALORIE_GOAL)
    expect(store.onboardingCompleted).toBe(false)
    expect(store.isLoaded).toBe(false)
  })

  it('loads the profile', async () => {
    const stats = makeStats()
    service.getProfile.mockResolvedValue({
      email: 'a@b.c',
      calorieGoal: 1800,
      onboardingCompleted: true,
      stats,
      weeklyChangeLb: -1,
    })
    const store = useSettingsStore()
    await store.load('uid1')
    expect(store.calorieGoal).toBe(1800)
    expect(store.onboardingCompleted).toBe(true)
    expect(store.stats).toEqual(stats)
    expect(store.weeklyChangeLb).toBe(-1)
    expect(store.isLoaded).toBe(true)
  })

  it('uses defaults and needs onboarding when there is no profile yet', async () => {
    service.getProfile.mockResolvedValue(null)
    const store = useSettingsStore()
    await store.load('uid1')
    expect(store.calorieGoal).toBe(DEFAULT_CALORIE_GOAL)
    expect(store.onboardingCompleted).toBe(false)
    expect(store.isLoaded).toBe(true)
  })

  it('shares one request between concurrent ensureLoaded calls', async () => {
    service.getProfile.mockResolvedValue(null)
    const store = useSettingsStore()
    await Promise.all([store.ensureLoaded('uid1'), store.ensureLoaded('uid1')])
    expect(service.getProfile).toHaveBeenCalledTimes(1)
  })

  it('does not reload once loaded', async () => {
    service.getProfile.mockResolvedValue(null)
    const store = useSettingsStore()
    await store.ensureLoaded('uid1')
    await store.ensureLoaded('uid1')
    expect(service.getProfile).toHaveBeenCalledTimes(1)
  })

  it('allows a retry after a failed load', async () => {
    service.getProfile.mockRejectedValueOnce(new Error('offline'))
    const store = useSettingsStore()
    await expect(store.ensureLoaded('uid1')).rejects.toThrow('offline')
    expect(store.isLoaded).toBe(false)

    service.getProfile.mockResolvedValueOnce(null)
    await store.ensureLoaded('uid1')
    expect(store.isLoaded).toBe(true)
  })

  it('saves the calorie goal', async () => {
    const store = useSettingsStore()
    await store.saveGoal('uid1', 2200)
    expect(service.updateCalorieGoal).toHaveBeenCalledWith('uid1', 2200)
    expect(store.calorieGoal).toBe(2200)
  })

  it('saves onboarding results', async () => {
    const store = useSettingsStore()
    const stats = makeStats()
    await store.saveOnboarding('uid1', stats, -1, 1450)
    expect(service.saveOnboarding).toHaveBeenCalledWith('uid1', stats, -1, 1450)
    expect(store.calorieGoal).toBe(1450)
    expect(store.weeklyChangeLb).toBe(-1)
    expect(store.stats).toEqual(stats)
    expect(store.onboardingCompleted).toBe(true)
  })

  it('skips onboarding while keeping the current goal', async () => {
    const store = useSettingsStore()
    await store.skipOnboarding('uid1')
    expect(service.skipOnboarding).toHaveBeenCalledWith('uid1', DEFAULT_CALORIE_GOAL)
    expect(store.onboardingCompleted).toBe(true)
    expect(store.stats).toBeNull()
  })

  it('does not mark onboarding complete when saving fails', async () => {
    service.saveOnboarding.mockRejectedValue(new Error('denied'))
    const store = useSettingsStore()
    await expect(store.saveOnboarding('uid1', makeStats(), 0, 2000)).rejects.toThrow('denied')
    expect(store.onboardingCompleted).toBe(false)
  })

  it('resets to defaults', async () => {
    const store = useSettingsStore()
    await store.saveOnboarding('uid1', makeStats(), -1, 1450)
    store.reset()
    expect(store.calorieGoal).toBe(DEFAULT_CALORIE_GOAL)
    expect(store.onboardingCompleted).toBe(false)
    expect(store.stats).toBeNull()
    expect(store.isLoaded).toBe(false)
  })
})
