import type { Access } from 'payload'

/**
 * Access control bypass for development environment.
 * ONLY use this in NODE_ENV=development - production must use normal authentication.
 */
export const devBypassAccess: Access = ({ req: _req }) => {
  // Só permite bypass em desenvolvimento quando habilitado explicitamente.
  if (process.env.NODE_ENV !== 'development') {
    return false
  }

  if (process.env.DISABLE_DEV_BYPASS === 'true') {
    return false
  }

  if (process.env.ENABLE_DEV_BYPASS === 'true') {
    return true
  }

  return false
}

/**
 * Check if dev bypass is active
 */
export const isDevBypassActive = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.ENABLE_DEV_BYPASS === 'true' &&
    process.env.DISABLE_DEV_BYPASS !== 'true'
  )
}
