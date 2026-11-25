const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  // Closing the Google popup is not an error worth showing (empty message hides the alert).
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/unauthorized-domain':
    'This address is not authorized for sign-in. Open the app at http://localhost instead, or add this domain in Firebase Authentication settings.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase yet.',
  'permission-denied': 'You do not have permission to do that.',
  unavailable: 'Service unavailable. Check your connection and try again.',
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: unknown }).code)
    return MESSAGES[code] ?? `Something went wrong (${code}). Please try again.`
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
