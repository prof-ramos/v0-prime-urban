import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_CONFLICT = 409
const HTTP_STATUS_NOT_FOUND = 404
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500
const MAX_VIEW_COUNT_RETRIES = 5
const INTERNAL_UPDATE_CONTEXT = { internalUpdate: true }

const parsePropertyId = (id: string): number | null => {
  const parsedId = Number.parseInt(id, 10)
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    return null
  }

  return parsedId
}

/**
 * Incrementa o número de visualizações de um imóvel.
 * POST /api/properties/[id]/view
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let payload: Awaited<ReturnType<typeof getPayloadClient>> | null = null

  const { id } = await params
  const propertyId = parsePropertyId(id)

  if (propertyId === null) {
    return NextResponse.json({ error: 'Invalid property id' }, { status: HTTP_STATUS_BAD_REQUEST })
  }

  try {
    payload = await getPayloadClient()

    for (let attempt = 0; attempt < MAX_VIEW_COUNT_RETRIES; attempt += 1) {
      const property = await payload.findByID({
        collection: 'properties',
        id: propertyId,
        depth: 0,
        select: {
          viewCount: true,
          updatedAt: true,
        },
      })

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: HTTP_STATUS_NOT_FOUND })
      }

      const nextViewCount = (property.viewCount ?? 0) + 1

      const updateResult = await payload.update({
        collection: 'properties',
        where: {
          and: [
            { id: { equals: propertyId } },
            { updatedAt: { equals: property.updatedAt } },
          ],
        },
        limit: 1,
        data: {
          viewCount: nextViewCount,
        },
        context: INTERNAL_UPDATE_CONTEXT,
        depth: 0,
      })

      const updatedDoc = updateResult.docs[0]
      if (updatedDoc) {
        return NextResponse.json({ success: true, newCount: updatedDoc.viewCount ?? nextViewCount })
      }
    }

    return NextResponse.json(
      { error: 'Could not increment view count due to concurrent updates' },
      { status: HTTP_STATUS_CONFLICT },
    )
  } catch (error: unknown) {
    if (payload) {
      payload.logger.error({
        msg: 'Error incrementing view count',
        err: error,
      })
    } else {
      console.error('Error incrementing view count:', error)
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS_INTERNAL_SERVER_ERROR },
    )
  }
}
