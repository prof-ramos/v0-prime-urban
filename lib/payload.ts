import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '@payload-config'

interface PayloadCache {
  client: Payload | null
  promise: Promise<Payload> | null
}

interface GlobalWithPayloadCache {
  payload?: PayloadCache
}

const globalWithPayloadCache = global as unknown as GlobalWithPayloadCache
const payloadCache = globalWithPayloadCache.payload ?? { client: null, promise: null }
globalWithPayloadCache.payload = payloadCache

/**
 * Global API client for Payload CMS
 * @returns The Payload CMS client instance
 */
export const getPayloadClient = async (): Promise<Payload> => {
  if (!payloadCache.client) {
    // If there's no client, check if there's an ongoing initialization promise.
    if (!payloadCache.promise) {
      // If no promise, start initializing Payload.
      payloadCache.promise = getPayload({ config })
    }

    try {
      // Await the promise to get the Payload client.
      payloadCache.client = await payloadCache.promise
    } catch (error: unknown) {
      // If initialization fails, reset the promise to allow retries.
      payloadCache.promise = null
      throw error
    }
  }

  return payloadCache.client
}
