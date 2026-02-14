"use client"

import { useEffect } from "react"

// Logger que só loga em desenvolvimento
const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[SW]', ...args)
    }
  },
  error: (...args: unknown[]) => {
    console.error('[SW]', ...args)
  }
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => logger.log('SW registered:', reg.scope))
      .catch((err) => logger.error('SW registration failed:', err))
  }, [])

  return null
}
