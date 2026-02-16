import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'

const REVALIDATE_SECRET_HEADER = 'x-revalidate-secret'
const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_METHOD_NOT_ALLOWED = 405
const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isTimingSafeEqual = (provided: string, expected: string): boolean => {
  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)

  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method Not Allowed' },
    { status: HTTP_STATUS_METHOD_NOT_ALLOWED },
  )
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET
  const secret = request.headers.get(REVALIDATE_SECRET_HEADER)

  if (!expectedSecret) {
    return NextResponse.json(
      { message: 'REVALIDATE_SECRET is not configured' },
      { status: HTTP_STATUS_INTERNAL_SERVER_ERROR },
    )
  }

  if (!secret || !isTimingSafeEqual(secret, expectedSecret)) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: HTTP_STATUS_UNAUTHORIZED })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch (error: unknown) {
    console.error('Invalid revalidation payload:', error)
    return NextResponse.json(
      { message: 'Invalid JSON body' },
      { status: HTTP_STATUS_BAD_REQUEST },
    )
  }

  const pathValue = isObject(body) ? body.path : undefined
  if (typeof pathValue !== 'string' || pathValue.length === 0 || !pathValue.startsWith('/')) {
    return NextResponse.json(
      { message: 'Missing or invalid path' },
      { status: HTTP_STATUS_BAD_REQUEST },
    )
  }

  try {
    revalidatePath(pathValue)
    return NextResponse.json({ revalidated: true, path: pathValue, now: Date.now() })
  } catch (error: unknown) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: HTTP_STATUS_INTERNAL_SERVER_ERROR },
    )
  }
}
