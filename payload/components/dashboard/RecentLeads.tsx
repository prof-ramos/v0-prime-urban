'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import { Badge } from '@/components/ui/badge'
import type { Lead } from '@/payload/payload-types'
import { cn } from '@/lib/utils'

interface RecentLeadsProps {
  limit?: number
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  new: { label: 'Novo', className: 'pu-status-badge pu-status-badge--new' },
  contacted: { label: 'Contactado', className: 'pu-status-badge pu-status-badge--contacted' },
  qualified: { label: 'Qualificado', className: 'pu-status-badge pu-status-badge--qualified' },
  visit_scheduled: { label: 'Visita', className: 'pu-status-badge pu-status-badge--visit' },
  proposal_sent: { label: 'Proposta', className: 'pu-status-badge pu-status-badge--proposal' },
  negotiation: { label: 'Negociação', className: 'pu-status-badge pu-status-badge--negotiation' },
  closed_won: { label: 'Ganho', className: 'pu-status-badge pu-status-badge--won' },
  closed_lost: { label: 'Perdido', className: 'pu-status-badge pu-status-badge--lost' },
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
    <section className="pu-admin-panel">
      <header className="pu-admin-panel__header">
        <p className="pu-admin-panel__kicker">Pipeline</p>
        <h2 className="pu-admin-panel__title">Leads recentes</h2>
        <p className="pu-admin-panel__description">
          Acompanhe os contatos mais novos e priorize os próximos passos.
        </p>
      </header>
      <div className="pu-admin-panel__content">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pu-lead-row animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-6 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <p className="pu-admin-panel__empty">Nenhum lead encontrado no momento.</p>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => {
              const config = statusConfig[lead.status] || {
                label: lead.status,
                className: 'pu-status-badge',
              }
              return (
                <article key={lead.id} className="pu-lead-row">
                  <div className="pu-lead-row__main">
                    <p className="pu-lead-row__name">{lead.name}</p>
                    <p className="pu-lead-row__meta">{lead.phone}</p>
                  </div>
                  <Badge className={cn(config.className)}>
                    {config.label}
                  </Badge>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
