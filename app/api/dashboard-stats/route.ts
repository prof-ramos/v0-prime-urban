import { NextRequest, NextResponse } from 'next/server'
import { executeAuthStrategies } from 'payload'
import { getPayloadClient } from '@/lib/payload'

const AUTHORIZATION_HEADER = 'authorization'
const BEARER_PREFIX = 'Bearer '
const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_STATUS_FORBIDDEN = 403
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500
const DEALS_PAGE_LIMIT = 100
const SIGNED_DEAL_STAGE = 'signed'
const START_OF_DAY_HOURS = 0

interface DashboardStatsResponse {
  activeProperties: number
  newLeadsToday: number
  totalRevenue: number
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    const authorizationHeader = request.headers.get(AUTHORIZATION_HEADER)
    if (!authorizationHeader?.startsWith(BEARER_PREFIX)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS_UNAUTHORIZED })
    }

    const authResult = await executeAuthStrategies({
      headers: request.headers,
      payload,
    })

    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS_UNAUTHORIZED })
    }

    if (authResult.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: HTTP_STATUS_FORBIDDEN })
    }

    // KPIs básicos para o dashboard
    const activeProperties = await payload.count({
      collection: 'properties',
      where: {
        status: { equals: 'published' },
      },
    })

    const newLeadsToday = await payload.count({
      collection: 'leads',
      where: {
        createdAt: {
          greater_than: new Date(
            new Date().setHours(START_OF_DAY_HOURS, START_OF_DAY_HOURS, START_OF_DAY_HOURS, 0),
          ).toISOString(),
        },
      },
    })

    let totalRevenue = 0
    let page = 1
    let hasMore = true

    while (hasMore) {
      const dealsResult = await payload.find({
        collection: 'deals',
        limit: DEALS_PAGE_LIMIT,
        page,
        select: {
          finalPrice: true,
        },
        where: {
          stage: { equals: SIGNED_DEAL_STAGE },
        },
      })

      totalRevenue += dealsResult.docs.reduce((sum, deal) => sum + (deal.finalPrice ?? 0), 0)

      hasMore = dealsResult.totalDocs > page * DEALS_PAGE_LIMIT
      page++
    }

    const response: DashboardStatsResponse = {
      activeProperties: activeProperties.totalDocs,
      newLeadsToday: newLeadsToday.totalDocs,
      totalRevenue,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json<DashboardStatsResponse>(response)
  } catch (error: unknown) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: HTTP_STATUS_INTERNAL_SERVER_ERROR },
    )
  }
}
