import { ref } from 'vue'
import { getErrorMessage } from '@/utils/firebaseErrors'

/**
 * Wraps an async function with `isPending` and `error` state.
 * `run` resolves to the result, or `undefined` if the action threw.
 */
export function useAsyncAction() {
  const isPending = ref(false)
  const error = ref('')

  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    if (isPending.value) return undefined
    isPending.value = true
    error.value = ''
    try {
      return await action()
    } catch (e) {
      error.value = getErrorMessage(e)
      return undefined
    } finally {
      isPending.value = false
    }
  }

  return { isPending, error, run }
}
