// Prime Urban Service Worker
// Plain JavaScript version for browser compatibility

// Debug flag - set to true only for development
const DEBUG = false

// Helper for conditional logging
const debugLog = (...args) => {
  if (DEBUG) console.log('[SW]', ...args)
}

// Cache name with versioning for easy invalidation
const CACHE_VERSION = 'v1'
const CACHE_NAME = `prime-urban-${CACHE_VERSION}`

// Skip waiting - activate immediately
self.skipWaiting()

// Claim control immediately so the service worker is in control
self.clients.claim()

// Basic install handler - cache static assets
self.addEventListener('install', (event) => {
  debugLog('Install event')
  self.skipWaiting()
})

// Basic activate handler to clean old caches
self.addEventListener('activate', (event) => {
  debugLog('Activate event')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete caches that don't match our current version
            return cacheName.startsWith('prime-urban-') && cacheName !== CACHE_NAME
          })
          .map((cacheName) => {
            debugLog('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
})

// Basic fetch handler - Network First strategy for dynamic content,
// Cache First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return
  // Skip cross-origin requests
  if (url.origin !== location.origin) return

  // Network First for API routes and HTML pages
  if (url.pathname.startsWith('/api/') || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached
            // Return offline fallback for HTML pages
            if (request.headers.get('accept')?.includes('text/html')) {
              return new Response('Offline - Please check your connection', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              })
            }
          })
        })
    )
    return
  }

  // Cache First for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Update cache in background
        fetch(request).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response)
            })
          }
        })
        return cached
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (response.status !== 200) return response

        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })
        return response
      })
    })
  )
})

// Message handler for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})
