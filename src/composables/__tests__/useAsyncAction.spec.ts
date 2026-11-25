import { describe, expect, it } from 'vitest'
import { useAsyncAction } from '../useAsyncAction'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useAsyncAction', () => {
  it('returns the result and clears pending state on success', async () => {
    const { isPending, error, run } = useAsyncAction()
    const result = await run(async () => 42)
    expect(result).toBe(42)
    expect(isPending.value).toBe(false)
    expect(error.value).toBe('')
  })

  it('is pending while the action runs', async () => {
    const { isPending, run } = useAsyncAction()
    const gate = deferred<string>()
    const promise = run(() => gate.promise)
    expect(isPending.value).toBe(true)
    gate.resolve('done')
    await promise
    expect(isPending.value).toBe(false)
  })

  it('captures a friendly error message and returns undefined on failure', async () => {
    const { isPending, error, run } = useAsyncAction()
    const result = await run(async () => {
      throw { code: 'auth/invalid-credential' }
    })
    expect(result).toBeUndefined()
    expect(error.value).toBe('Incorrect email or password.')
    expect(isPending.value).toBe(false)
  })

  it('clears the previous error when run again', async () => {
    const { error, run } = useAsyncAction()
    await run(async () => {
      throw new Error('first')
    })
    expect(error.value).toBe('first')
    await run(async () => 'ok')
    expect(error.value).toBe('')
  })

  it('ignores a second call while one is already pending', async () => {
    const { run } = useAsyncAction()
    const gate = deferred<string>()
    let calls = 0
    const first = run(() => {
      calls += 1
      return gate.promise
    })
    const second = await run(async () => {
      calls += 1
      return 'second'
    })
    expect(second).toBeUndefined()
    gate.resolve('first')
    expect(await first).toBe('first')
    expect(calls).toBe(1)
  })
})
