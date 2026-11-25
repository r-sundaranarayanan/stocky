import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '../firebaseErrors'

describe('getErrorMessage', () => {
  it('maps known Firebase auth codes to friendly messages', () => {
    expect(getErrorMessage({ code: 'auth/invalid-credential' })).toBe(
      'Incorrect email or password.',
    )
    expect(getErrorMessage({ code: 'auth/email-already-in-use' })).toContain('already exists')
  })

  it('does not reveal whether an email exists', () => {
    expect(getErrorMessage({ code: 'auth/user-not-found' })).toBe(
      getErrorMessage({ code: 'auth/wrong-password' }),
    )
  })

  it('returns an empty message when the Google popup is closed', () => {
    expect(getErrorMessage({ code: 'auth/popup-closed-by-user' })).toBe('')
    expect(getErrorMessage({ code: 'auth/cancelled-popup-request' })).toBe('')
  })

  it('explains unauthorized domains', () => {
    expect(getErrorMessage({ code: 'auth/unauthorized-domain' })).toContain('localhost')
  })

  it('includes the code for unknown Firebase errors', () => {
    expect(getErrorMessage({ code: 'auth/something-new' })).toContain('auth/something-new')
  })

  it('uses the message of plain Errors', () => {
    expect(getErrorMessage(new Error('Boom'))).toBe('Boom')
  })

  it('falls back to a generic message for other values', () => {
    expect(getErrorMessage('nope')).toBe('Something went wrong. Please try again.')
    expect(getErrorMessage(null)).toBe('Something went wrong. Please try again.')
  })
})
