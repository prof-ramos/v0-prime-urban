'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Lead } from '@/payload/payload-types'

interface RecentLeadsProps {
  limit?: number
}

const statusConfig: Record<
  string,
  { label: string; color: string }
> = {
  new: { label: 'Novo', color: 'bg-blue-500' },
  contacted: { label: 'Contactado', color: 'bg-yellow-500' },
  qualified: { label: 'Qualificado', color: 'bg-green-500' },
  visit_scheduled: { label: 'Visita', color: 'bg-purple-500' },
  proposal_sent: { label: 'Proposta', color: 'bg-orange-500' },
  negotiation: { label: 'Negociação', color: 'bg-cyan-500' },
  closed_won: { label: 'Ganho', color: 'bg-emerald-600' },
  closed_lost: { label: 'Perdido', color: 'bg-red-500' },
}

export function RecentLeads({ limit = 5 }: RecentLeadsProps) {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      if (!user) return

      try {
        const response = await fetch(
          `/api/leads?where[assignedTo][equals]=${user.id}&sort=-createdAt&limit=${limit}&depth=0`
        )
        if (response.ok) {
          const data = await response.json()
          setLeads(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to fetch leads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [user, limit])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-6 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum lead encontrado</p>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => {
              const config = statusConfig[lead.status] || {
                label: lead.status,
                color: 'bg-gray-500',
              }
              return (
                <div key={lead.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  </div>
                  <Badge className={`${config.color} text-white hover:${config.color}`}>
                    {config.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
