import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as authService from '@/services/authService'
import * as userService from '@/services/userService'
import type { AuthUser } from '@/services/authService'
import router from '../index'

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
vi.mock('@/services/foodService', () => ({
  listFoods: vi.fn(),
  createFood: vi.fn(),
  updateFood: vi.fn(),
  deleteFood: vi.fn(),
  markFoodUsed: vi.fn(),
}))
vi.mock('@/services/entryService', () => ({
  listEntriesByDate: vi.fn(),
  getEntry: vi.fn(),
  addEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
}))

const auth = vi.mocked(authService)
const users = vi.mocked(userService)

const alice: AuthUser = { uid: 'u1', email: 'alice@example.com' }

const profile = (onboardingCompleted: boolean) => ({
  email: alice.email,
  calorieGoal: 2000,
  onboardingCompleted,
  stats: null,
  weeklyChangeLb: null,
})

/** Starts a fresh app session whose first auth state is `user`, then goes to `path`. */
async function visit(path: string, user: AuthUser | null) {
  setActivePinia(createPinia())
  auth.subscribeToAuth.mockImplementation((listener) => {
    void listener(user)
    return () => undefined
  })
  await router.push(path)
  return router.currentRoute.value
}

describe('router guard', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    auth.completeRedirectSignIn.mockResolvedValue(null)
    users.getProfile.mockResolvedValue(profile(true))
    // Park the router on a neutral page so every test really navigates.
    await visit('/login', null)
  })

  describe('logged out', () => {
    it('sends protected pages to the login page', async () => {
      expect((await visit('/', null)).name).toBe('login')
      expect((await visit('/foods', null)).name).toBe('login')
      expect((await visit('/log', null)).name).toBe('login')
      expect((await visit('/onboarding', null)).name).toBe('login')
    })

    it('allows the login, signup and reset pages', async () => {
      expect((await visit('/signup', null)).name).toBe('signup')
      expect((await visit('/reset', null)).name).toBe('reset')
      expect((await visit('/login', null)).name).toBe('login')
    })
  })

  describe('logged in and onboarded', () => {
    it('opens protected pages', async () => {
      expect((await visit('/', alice)).name).toBe('diary')
      expect((await visit('/foods', alice)).name).toBe('foods')
      expect((await visit('/settings', alice)).name).toBe('settings')
    })

    it('keeps guest-only pages away from signed-in users', async () => {
      expect((await visit('/signup', alice)).name).toBe('diary')
      expect((await visit('/reset', alice)).name).toBe('diary')
    })

    it('still allows the onboarding page (to recalculate the goal)', async () => {
      expect((await visit('/onboarding', alice)).name).toBe('onboarding')
    })

    it('sends unknown pages to the diary', async () => {
      expect((await visit('/does/not/exist', alice)).name).toBe('diary')
    })
  })

  describe('onboarding not completed', () => {
    beforeEach(() => {
      users.getProfile.mockResolvedValue(profile(false))
    })

    it('redirects every protected page to onboarding', async () => {
      expect((await visit('/', alice)).name).toBe('onboarding')
      expect((await visit('/foods', alice)).name).toBe('onboarding')
      expect((await visit('/log', alice)).name).toBe('onboarding')
      expect((await visit('/settings', alice)).name).toBe('onboarding')
    })

    it('does not loop when already on the onboarding page', async () => {
      expect((await visit('/onboarding', alice)).name).toBe('onboarding')
    })

    it('treats a user without a profile document as needing onboarding', async () => {
      users.getProfile.mockResolvedValue(null)
      expect((await visit('/', alice)).name).toBe('onboarding')
    })

    it('sends a signed-in user opening the signup page on to onboarding', async () => {
      // Guest-only pages redirect to the diary, which in turn requires onboarding.
      expect((await visit('/signup', alice)).name).toBe('onboarding')
    })
  })

  describe('profile cannot be loaded', () => {
    it('does not lock the user out of the app', async () => {
      users.getProfile.mockRejectedValue(new Error('offline'))
      expect((await visit('/', alice)).name).toBe('diary')
    })
  })
})
