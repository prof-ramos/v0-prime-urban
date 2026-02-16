import type { Payload } from 'payload'
import config from '@payload-config'
import { getPayload } from 'payload'

interface PayloadCache {
  client: Payload | null
  promise: Promise<Payload> | null
}

// Declare a global variable to cache the Payload client and its initialization promise.
// This prevents multiple initializations in development mode.
declare global {
  var payload: PayloadCache | undefined
}

let cached: PayloadCache = global.payload ?? { client: null, promise: null }

if (!global.payload) {
  global.payload = cached
}

/**
 * Global API client for Payload CMS
 * @returns The Payload CMS client instance
 */
export const getPayloadClient = async (): Promise<Payload> => {
  if (!cached.client) {
    // If there's no client, check if there's an ongoing initialization promise.
    if (!cached.promise) {
      // If no promise, start initializing Payload.
      cached.promise = getPayload({ config })
    }

    try {
      // Await the promise to get the Payload client.
      cached.client = await cached.promise
    } catch (e) {
      // If initialization fails, reset the promise to allow retries.
      cached.promise = null
      throw e
    }
  }

  return cached.client
}
