import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RATE_LIMIT_REQUESTS = 100
const RATE_LIMIT_WINDOW_MINUTES = 15
const FORWARDED_FOR_HEADER = 'x-forwarded-for'
const REAL_IP_HEADER = 'x-real-ip'
const USER_AGENT_HEADER = 'user-agent'
const ACCEPT_LANGUAGE_HEADER = 'accept-language'
const HTTP_STATUS_TOO_MANY_REQUESTS = 429
const RETRY_AFTER_HEADER = 'Retry-After'
const CONTENT_TYPE_HEADER = 'Content-Type'
const CONTENT_TYPE_JSON = 'application/json'

/**
 * Rate limiter for API routes.
 * In-memory storage suitable for single-instance deployments.
 * For production with multiple instances, replace with Redis/Upstash.
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly limit: number
  private readonly window: number // in milliseconds
  private readonly cleanupInterval: ReturnType<typeof setInterval>

  constructor(limit: number, windowMinutes: number) {
    this.limit = limit
    this.window = windowMinutes * 60 * 1000
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.window)

    if (
      this.cleanupInterval &&
      typeof this.cleanupInterval === 'object' &&
      'unref' in this.cleanupInterval &&
      typeof this.cleanupInterval.unref === 'function'
    ) {
      this.cleanupInterval.unref()
    }
  }

  private cleanup(): void {
    const now = Date.now()

    for (const [ip, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((timestamp) => now - timestamp < this.window)
      if (validTimestamps.length === 0) {
        this.requests.delete(ip)
      } else {
        this.requests.set(ip, validTimestamps)
      }
    }
  }

  check(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now()
    const timestamps = this.requests.get(ip) || []

    // Remove timestamps outside the current window
    const validTimestamps = timestamps.filter((timestamp) => now - timestamp < this.window)

    if (validTimestamps.length >= this.limit) {
      // Calculate when the oldest request will expire
      const oldestRequest = validTimestamps[0] ?? now
      const retryAfter = Math.ceil((oldestRequest + this.window - now) / 1000)
      return { allowed: false, retryAfter }
    }

    if (validTimestamps.length === 0) {
      this.requests.delete(ip)
    }

    // Add current request timestamp
    validTimestamps.push(now)
    this.requests.set(ip, validTimestamps)

    return { allowed: true }
  }
}

// Global rate limiter instance: 100 requests per IP per 15 minutes
const RATE_LIMITER = new RateLimiter(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MINUTES)
const RATE_LIMIT_ENABLED =
  process.env.NODE_ENV === 'production' && process.env.DISABLE_RATE_LIMIT !== 'true'

const getClientIp = (request: NextRequest): string => {
  const forwardedForIp = request.headers.get(FORWARDED_FOR_HEADER)?.split(',')[0]?.trim()
  const realIp = request.headers.get(REAL_IP_HEADER)?.trim()
  const fallbackFingerprint = `${request.headers.get(USER_AGENT_HEADER) ?? 'ua'}|${request.headers.get(ACCEPT_LANGUAGE_HEADER) ?? 'lang'}|${Date.now()}`
  const randomFallback = `fallback-${crypto.randomUUID()}-${fallbackFingerprint}`
  const resolvedIp = forwardedForIp ?? realIp ?? randomFallback

  if (!forwardedForIp && !realIp) {
    console.warn('Rate limiting fallback IP used due to missing request IP headers')
  }

  return resolvedIp
}

/**
 * Middleware for API route protection.
 * Applies rate limiting to all /api routes.
 */
export function middleware(request: NextRequest) {
  if (!RATE_LIMIT_ENABLED) {
    return NextResponse.next()
  }

  const ip = getClientIp(request)
  const result = RATE_LIMITER.check(ip)

  if (!result.allowed) {
    const retryAfter = result.retryAfter ?? 1

    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      }),
      {
        status: HTTP_STATUS_TOO_MANY_REQUESTS,
        statusText: 'Too Many Requests',
        headers: {
          [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
          [RETRY_AFTER_HEADER]: retryAfter.toString(),
        },
      },
    )
  }

  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on.
 */
export const config = {
  matcher: '/api/:path*',
}
