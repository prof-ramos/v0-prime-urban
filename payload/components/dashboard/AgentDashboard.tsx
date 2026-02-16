'use client'

import { useAuth } from '@payloadcms/ui'
import { Users, Building2, Handshake, TrendingUp } from 'lucide-react'
import { StatsCard } from './stats-card'
import { useAgentStats } from '../../hooks/use-agent-stats'
import { QuickActions } from './QuickActions'
import { RecentLeads } from './RecentLeads'

export function AgentDashboard() {
  const { user } = useAuth()
  const { stats, loading, error } = useAgentStats()

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-destructive">
        <p>Erro ao carregar estatísticas</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Aqui está um resumo da sua atividade</p>
        </div>
        <QuickActions />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Leads"
          value={stats?.totalLeads ?? 0}
          icon={Users}
          badge={{
            text: `${stats?.newLeads ?? 0} novos`,
            variant: 'secondary',
          }}
        />
        <StatsCard title="Imóveis Publicados" value={stats?.totalProperties ?? 0} icon={Building2} />
        <StatsCard title="Negócios Ativos" value={stats?.activeDeals ?? 0} icon={Handshake} />
        <StatsCard title="Fechados este Mês" value={stats?.closedThisMonth ?? 0} icon={TrendingUp} />
      </div>

      <RecentLeads limit={5} />
    </div>
  )
}
