import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAsyncAction } from './useAsyncAction'

/** Google sign-in flow shared by the login and signup screens. */
export function useGoogleSignIn() {
  const auth = useAuthStore()
  const router = useRouter()
  const { isPending, error, run } = useAsyncAction()

  async function signIn() {
    const isSignedIn = await run(() => auth.signInWithGoogle())
    // Falsy means the sign-in failed, was cancelled, or is redirecting away.
    // The router guard sends users who still need onboarding to that screen.
    if (isSignedIn) await router.push({ name: 'diary' })
  }

  return { isPending, error, signIn }
}
