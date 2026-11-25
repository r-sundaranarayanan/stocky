import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

export interface AuthUser {
  uid: string
  email: string
}

export function subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) =>
    callback(user ? { uid: user.uid, email: user.email ?? '' } : null),
  )
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  return { uid: user.uid, email: user.email ?? email }
}

const toAuthUser = (user: User): AuthUser => ({ uid: user.uid, email: user.email ?? '' })

/**
 * Signs in with Google using a popup. If the browser blocks the popup (common on
 * mobile), falls back to a full-page redirect and resolves to `null`; the result is
 * then picked up by `completeRedirectSignIn` when the app reloads.
 */
export async function signInWithGoogle(): Promise<AuthUser | null> {
  const provider = new GoogleAuthProvider()
  try {
    const { user } = await signInWithPopup(auth, provider)
    return toAuthUser(user)
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw error
  }
}

/** Returns the user who just came back from a Google redirect sign-in, if any. */
export async function completeRedirectSignIn(): Promise<AuthUser | null> {
  const result = await getRedirectResult(auth)
  return result ? toAuthUser(result.user) : null
}

export async function logIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function logOut(): Promise<void> {
  await signOut(auth)
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}
