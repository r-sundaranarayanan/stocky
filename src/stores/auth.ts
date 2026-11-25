import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/authService'
import type { AuthUser } from '@/services/authService'
import { createProfile, getProfile } from '@/services/userService'
import { useDiaryStore } from './diary'
import { useFoodsStore } from './foods'
import { useSettingsStore } from './settings'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isReady = ref(false)
  let readyPromise: Promise<void> | null = null

  const isLoggedIn = computed(() => user.value !== null)

  /** Starts the auth listener once; resolves after the first auth state is known. */
  function init(): Promise<void> {
    if (readyPromise) return readyPromise
    readyPromise = new Promise<void>((resolve) => {
      // Finish a Google redirect sign-in (used when popups are blocked).
      authService
        .completeRedirectSignIn()
        .then((redirected) => (redirected ? ensureProfile(redirected) : undefined))
        .catch(() => undefined)

      authService.subscribeToAuth(async (authUser) => {
        user.value = authUser
        if (authUser) {
          try {
            await useSettingsStore().load(authUser.uid)
          } catch {
            // Goal falls back to the default; the Settings screen lets the user retry.
          }
        } else {
          useSettingsStore().reset()
          useFoodsStore().reset()
          useDiaryStore().reset()
        }
        isReady.value = true
        resolve()
      })
    })
    return readyPromise
  }

  /** Returns the current user's id; only call from routes guarded by `requiresAuth`. */
  function requireUid(): string {
    if (!user.value) throw new Error('Not signed in')
    return user.value.uid
  }

  async function signUp(email: string, password: string) {
    const created = await authService.signUp(email, password)
    await createProfile(created.uid, created.email)
  }

  /** Creates the profile document if this account does not have one yet. */
  async function ensureProfile(authUser: AuthUser): Promise<void> {
    if (await getProfile(authUser.uid)) return
    await createProfile(authUser.uid, authUser.email)
  }

  /** Returns false when the browser is redirecting away to finish sign-in. */
  async function signInWithGoogle(): Promise<boolean> {
    const authUser = await authService.signInWithGoogle()
    if (!authUser) return false
    await ensureProfile(authUser)
    return true
  }

  async function logIn(email: string, password: string) {
    await authService.logIn(email, password)
  }

  async function logOut() {
    await authService.logOut()
  }

  async function resetPassword(email: string) {
    await authService.resetPassword(email)
  }

  return {
    user,
    isReady,
    isLoggedIn,
    init,
    requireUid,
    signUp,
    signInWithGoogle,
    logIn,
    logOut,
    resetPassword,
  }
})
