import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { isAdmin } from '@/payload/access/is-admin'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // Verificar autorização - apenas admins podem acessar
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    // Nota: Em produção, validar o token JWT com Payload
    // Por enquanto, verificamos se o usuário está autenticado

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
          greater_than: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        },
      },
    })

    // Buscar deals com paginação para não limitar a 100
    let totalRevenue = 0
    let page = 1
    const limit = 100
    let hasMore = true

    while (hasMore) {
      const dealsResult = await payload.find({
        collection: 'deals',
        limit,
        page,
        where: {
          stage: { equals: 'signed' }, // Corrigido de 'closed' para 'signed' conforme schema
        },
      })

      dealsResult.docs.forEach((deal: unknown) => {
        const dealData = deal as { finalPrice?: number }
        totalRevenue += dealData.finalPrice || 0
      })

      hasMore = dealsResult.totalDocs > page * limit
      page++
    }

    return NextResponse.json({
      activeProperties: activeProperties.totalDocs,
      newLeadsToday: newLeadsToday.totalDocs,
      totalRevenue,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
