// Prime Urban Service Worker
// Plain JavaScript version for browser compatibility

// Debug flag - set to true only for development
const DEBUG = false

// Helper for conditional logging
const debugLog = (...args) => {
  if (DEBUG) console.log('[SW]', ...args)
}

// Cache name with versioning for easy invalidation
const CACHE_VERSION = 'v2'

// Cache configuration with separate stores for different content types
const CACHE_CONFIG = {
  static: {
    name: 'prime-urban-static-v2',
    urls: ['/', '/imoveis', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png']
  },
  images: {
    name: 'prime-urban-images-v2',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  pages: {
    name: 'prime-urban-pages-v2',
    maxAge: 5 * 60 * 1000 // 5 minutes
  }
}

// Legacy cache name for cleanup compatibility
const CACHE_NAME = `prime-urban-${CACHE_VERSION}`

// Skip waiting - activate immediately
self.skipWaiting()

// Claim control immediately so the service worker is in control
self.clients.claim()

// Install handler - pre-cache critical static assets
self.addEventListener('install', (event) => {
  debugLog('Install event - pre-caching critical assets')
  event.waitUntil(
    caches.open(CACHE_CONFIG.static.name).then((cache) => {
      return cache.addAll(CACHE_CONFIG.static.urls)
    })
  )
  self.skipWaiting()
})

// Activate handler - clean up old caches
self.addEventListener('activate', (event) => {
  debugLog('Activate event - cleaning old caches')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const currentCaches = [
        CACHE_CONFIG.static.name,
        CACHE_CONFIG.images.name,
        CACHE_CONFIG.pages.name
      ]
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete caches that don't match our current version
            return cacheName.startsWith('prime-urban-') && !currentCaches.includes(cacheName)
          })
          .map((cacheName) => {
            debugLog('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch handler - multi-strategy caching based on content type
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Stale-While-Revalidate for navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_CONFIG.pages.name).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
          // Serve from cache immediately, update in background
          return cached || fetchPromise
        })
      })
    )
    return
  }

  // Cache external images from Unsplash (Cache First)
  if (url.hostname.includes('images.unsplash.com')) {
    event.respondWith(
      caches.open(CACHE_CONFIG.images.name).then((cache) => {
        return cache.match(request).then((cached) => {
          return cached || fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          })
        })
      })
    )
    return
  }

  // Skip cross-origin for non-image requests
  if (url.origin !== location.origin) return

  // Network First for API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_CONFIG.static.name).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached
            return new Response('Offline - Please check your connection', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            })
          })
        })
    )
    return
  }

  // Cache First for static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response.status !== 200) return response

        const responseClone = response.clone()
        caches.open(CACHE_CONFIG.static.name).then((cache) => {
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
