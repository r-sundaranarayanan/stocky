import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { makeFood } from '@/__tests__/fixtures'
import * as authService from '@/services/authService'
import * as userService from '@/services/userService'
import type { AuthUser } from '@/services/authService'
import { useFoodsStore } from '../foods'
import { useSettingsStore } from '../settings'
import { useAuthStore } from '../auth'

vi.mock('@/services/firebase', () => ({ auth: {}, db: {} }))
vi.mock('@/services/authService', () => ({
  subscribeToAuth: vi.fn(),
  completeRedirectSignIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  logIn: vi.fn(),
  logOut: vi.fn(),
  resetPassword: vi.fn(),
}))
vi.mock('@/services/userService', () => ({
  getProfile: vi.fn(),
  createProfile: vi.fn(),
  updateCalorieGoal: vi.fn(),
  saveOnboarding: vi.fn(),
  skipOnboarding: vi.fn(),
}))
vi.mock('@/services/foodService', () => ({ listFoods: vi.fn() }))
vi.mock('@/services/entryService', () => ({ listEntriesByDate: vi.fn() }))

const auth = vi.mocked(authService)
const users = vi.mocked(userService)

const alice: AuthUser = { uid: 'u1', email: 'alice@example.com' }
type AuthListener = (user: AuthUser | null) => Promise<void>

describe('auth store', () => {
  let emitAuth: AuthListener
  let subscribeCount: number

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    subscribeCount = 0
    auth.subscribeToAuth.mockImplementation((listener) => {
      subscribeCount += 1
      emitAuth = listener as unknown as AuthListener
      return () => undefined
    })
    auth.completeRedirectSignIn.mockResolvedValue(null)
    users.getProfile.mockResolvedValue(null)
  })

  describe('init', () => {
    it('starts the auth listener only once', () => {
      const store = useAuthStore()
      void store.init()
      void store.init()
      expect(subscribeCount).toBe(1)
    })

    it('is not ready until the first auth state arrives', async () => {
      const store = useAuthStore()
      const ready = store.init()
      expect(store.isReady).toBe(false)
      await emitAuth(null)
      await ready
      expect(store.isReady).toBe(true)
      expect(store.isLoggedIn).toBe(false)
    })

    it('stores the signed-in user and loads their settings', async () => {
      users.getProfile.mockResolvedValue({
        email: alice.email,
        calorieGoal: 1800,
        onboardingCompleted: true,
        stats: null,
        weeklyChangeLb: null,
      })
      const store = useAuthStore()
      const ready = store.init()
      await emitAuth(alice)
      await ready
      expect(store.user).toEqual(alice)
      expect(store.isLoggedIn).toBe(true)
      expect(users.getProfile).toHaveBeenCalledWith('u1')
      expect(useSettingsStore().calorieGoal).toBe(1800)
    })

    it('still becomes ready when loading the profile fails', async () => {
      users.getProfile.mockRejectedValue(new Error('offline'))
      const store = useAuthStore()
      const ready = store.init()
      await emitAuth(alice)
      await ready
      expect(store.isReady).toBe(true)
      expect(store.isLoggedIn).toBe(true)
    })

    it('clears per-user data when the user signs out', async () => {
      const store = useAuthStore()
      const ready = store.init()
      await emitAuth(alice)
      await ready
      useFoodsStore().foods.push(makeFood())
      await useSettingsStore().saveOnboarding(
        'u1',
        {
          gender: 'female',
          age: 30,
          heightIn: 66,
          weightLb: 150,
          activityLevel: 'light',
        },
        -1,
        1450,
      )

      await emitAuth(null)

      expect(store.user).toBeNull()
      expect(useFoodsStore().foods).toEqual([])
      expect(useSettingsStore().onboardingCompleted).toBe(false)
      expect(useSettingsStore().stats).toBeNull()
    })

    it('creates a profile for a user returning from a Google redirect', async () => {
      auth.completeRedirectSignIn.mockResolvedValue(alice)
      const store = useAuthStore()
      const ready = store.init()
      await emitAuth(alice)
      await ready
      await vi.waitFor(() => expect(users.createProfile).toHaveBeenCalledWith('u1', alice.email))
    })

    it('does not overwrite an existing profile after a Google redirect', async () => {
      auth.completeRedirectSignIn.mockResolvedValue(alice)
      users.getProfile.mockResolvedValue({
        email: alice.email,
        calorieGoal: 2000,
        onboardingCompleted: true,
        stats: null,
        weeklyChangeLb: null,
      })
      const store = useAuthStore()
      const ready = store.init()
      await emitAuth(alice)
      await ready
      await vi.waitFor(() => expect(users.getProfile).toHaveBeenCalled())
      expect(users.createProfile).not.toHaveBeenCalled()
    })

    it('survives a failed redirect sign-in', async () => {
      auth.completeRedirectSignIn.mockRejectedValue(new Error('redirect failed'))
      const store = useAuthStore()
      const ready = store.init()
      await emitAuth(null)
      await ready
      expect(store.isReady).toBe(true)
    })
  })

  describe('requireUid', () => {
    it('throws when nobody is signed in', () => {
      expect(() => useAuthStore().requireUid()).toThrow('Not signed in')
    })

    it('returns the uid of the signed-in user', async () => {
      const store = useAuthStore()
      const ready = store.init()
      await emitAuth(alice)
      await ready
      expect(store.requireUid()).toBe('u1')
    })
  })

  describe('signUp', () => {
    it('creates the account and then the user profile', async () => {
      auth.signUp.mockResolvedValue(alice)
      await useAuthStore().signUp('alice@example.com', 'secret1')
      expect(auth.signUp).toHaveBeenCalledWith('alice@example.com', 'secret1')
      expect(users.createProfile).toHaveBeenCalledWith('u1', alice.email)
    })

    it('does not create a profile when sign up fails', async () => {
      auth.signUp.mockRejectedValue({ code: 'auth/email-already-in-use' })
      await expect(useAuthStore().signUp('a@b.c', 'secret1')).rejects.toMatchObject({
        code: 'auth/email-already-in-use',
      })
      expect(users.createProfile).not.toHaveBeenCalled()
    })
  })

  describe('signInWithGoogle', () => {
    it('creates a profile for a new Google user', async () => {
      auth.signInWithGoogle.mockResolvedValue(alice)
      expect(await useAuthStore().signInWithGoogle()).toBe(true)
      expect(users.createProfile).toHaveBeenCalledWith('u1', alice.email)
    })

    it('keeps the profile of a returning Google user', async () => {
      auth.signInWithGoogle.mockResolvedValue(alice)
      users.getProfile.mockResolvedValue({
        email: alice.email,
        calorieGoal: 2200,
        onboardingCompleted: true,
        stats: null,
        weeklyChangeLb: null,
      })
      expect(await useAuthStore().signInWithGoogle()).toBe(true)
      expect(users.createProfile).not.toHaveBeenCalled()
    })

    it('returns false and touches no profile while redirecting away', async () => {
      auth.signInWithGoogle.mockResolvedValue(null)
      expect(await useAuthStore().signInWithGoogle()).toBe(false)
      expect(users.getProfile).not.toHaveBeenCalled()
      expect(users.createProfile).not.toHaveBeenCalled()
    })

    it('passes errors on to the caller', async () => {
      auth.signInWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' })
      await expect(useAuthStore().signInWithGoogle()).rejects.toMatchObject({
        code: 'auth/popup-closed-by-user',
      })
    })
  })

  describe('delegating actions', () => {
    it('logs in with email and password', async () => {
      await useAuthStore().logIn('a@b.c', 'pw')
      expect(auth.logIn).toHaveBeenCalledWith('a@b.c', 'pw')
    })

    it('logs out', async () => {
      await useAuthStore().logOut()
      expect(auth.logOut).toHaveBeenCalledTimes(1)
    })

    it('sends a password reset email', async () => {
      await useAuthStore().resetPassword('a@b.c')
      expect(auth.resetPassword).toHaveBeenCalledWith('a@b.c')
    })
  })
})
