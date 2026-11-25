import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGoogleSignIn } from '../useGoogleSignIn'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ signInWithGoogle: mocks.signInWithGoogle }),
}))

describe('useGoogleSignIn', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('goes to the diary after a successful sign-in', async () => {
    mocks.signInWithGoogle.mockResolvedValue(true)
    const { signIn, error } = useGoogleSignIn()
    await signIn()
    expect(mocks.push).toHaveBeenCalledWith({ name: 'diary' })
    expect(error.value).toBe('')
  })

  it('stays on the page while the browser redirects away', async () => {
    mocks.signInWithGoogle.mockResolvedValue(false)
    await useGoogleSignIn().signIn()
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('shows a friendly message and does not navigate when sign-in fails', async () => {
    mocks.signInWithGoogle.mockRejectedValue({ code: 'auth/unauthorized-domain' })
    const { signIn, error } = useGoogleSignIn()
    await signIn()
    expect(error.value).toContain('localhost')
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('shows no error when the user closes the Google popup', async () => {
    mocks.signInWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' })
    const { signIn, error } = useGoogleSignIn()
    await signIn()
    expect(error.value).toBe('')
    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('is pending only while signing in', async () => {
    let finish!: (value: boolean) => void
    mocks.signInWithGoogle.mockReturnValue(new Promise<boolean>((resolve) => (finish = resolve)))
    const { signIn, isPending } = useGoogleSignIn()
    const done = signIn()
    expect(isPending.value).toBe(true)
    finish(true)
    await done
    expect(isPending.value).toBe(false)
  })
})
