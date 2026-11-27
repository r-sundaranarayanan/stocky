import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

declare module 'vue-router' {
  interface RouteMeta {
    /** Route needs a logged-in user. */
    requiresAuth?: boolean
    /** Route is only for logged-out users. */
    guestOnly?: boolean
    /** Show the bottom tab bar. */
    showTabs?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignupView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/reset',
      name: 'reset',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      name: 'diary',
      component: () => import('@/views/DiaryView.vue'),
      meta: { requiresAuth: true, showTabs: true },
    },
    {
      path: '/log-food',
      name: 'log-food',
      component: () => import('@/views/LogFoodView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/foods',
      name: 'foods',
      component: () => import('@/views/FoodsView.vue'),
      meta: { requiresAuth: true, showTabs: true },
    },
    {
      path: '/foods/new',
      name: 'food-new',
      component: () => import('@/views/FoodEditView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/foods/:id',
      name: 'food-edit',
      component: () => import('@/views/FoodEditView.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/entries/:id',
      name: 'entry-edit',
      component: () => import('@/views/EntryEditView.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true, showTabs: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: 'diary' }
  if (to.meta.requiresAuth && to.name !== 'onboarding') {
    const settings = useSettingsStore()
    try {
      await settings.ensureLoaded(auth.requireUid())
    } catch {
      // Profile could not be loaded (e.g. offline); do not lock the user out of the app.
      return true
    }
    if (!settings.onboardingCompleted) return { name: 'onboarding' }
  }
  return true
})

export default router
