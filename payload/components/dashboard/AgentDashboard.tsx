'use client'

import { useAuth } from '@payloadcms/ui'
import { Users, Building2, Handshake, TrendingUp, CalendarClock, ShieldCheck } from 'lucide-react'
import { StatsCard } from './stats-card'
import { useAgentStats } from '../../hooks/use-agent-stats'
import { QuickActions } from './QuickActions'
import { RecentLeads } from './RecentLeads'

export function AgentDashboard() {
  const { user } = useAuth()
  const { stats, loading, error } = useAgentStats()
  const userFirstName = user?.name?.split(' ')[0] ?? 'Equipe'
  const now = new Date()
  const formattedDate = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  if (loading) {
    return (
      <div className="pu-admin-dashboard pu-admin-dashboard--loading">
        <div className="pu-admin-hero pu-admin-hero--skeleton animate-pulse">
          <div className="h-4 w-40 rounded bg-white/20" />
          <div className="h-10 w-72 rounded bg-white/20 mt-3" />
          <div className="h-5 w-96 rounded bg-white/15 mt-2 max-w-full" />
        </div>
        <div className="pu-admin-dashboard__stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="pu-stat-card animate-pulse">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-8 w-20 rounded bg-muted mt-3" />
              <div className="h-4 w-32 rounded bg-muted mt-2" />
            </div>
          ))}
        </div>
        <div className="pu-admin-dashboard__bottom">
          <div className="pu-admin-panel animate-pulse">
            <div className="h-6 w-40 rounded bg-muted mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded bg-muted/70 mb-3" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pu-admin-dashboard">
        <div className="pu-admin-panel pu-admin-panel--error">
          <p className="pu-admin-panel__kicker">Dashboard</p>
          <h2 className="pu-admin-panel__title">Falha ao carregar estatísticas</h2>
          <p className="pu-admin-panel__description">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pu-admin-dashboard">
      <section className="pu-admin-hero">
        <div className="pu-admin-hero__header">
          <p className="pu-admin-hero__kicker">Central PrimeUrban</p>
          <div className="pu-admin-hero__meta">
            <span>
              <CalendarClock className="h-4 w-4" />
              {formattedDate}
            </span>
            <span>
              <ShieldCheck className="h-4 w-4" />
              Operação em tempo real
            </span>
          </div>
        </div>
        <div className="pu-admin-hero__content">
          <h1>Bom trabalho, {userFirstName}.</h1>
          <p>
            Seu painel operacional foi redesenhado para priorizar velocidade de ação e leitura de
            negócio em segundos.
          </p>
        </div>
        <div className="pu-admin-hero__actions">
          <QuickActions />
        </div>
      </section>

      <section className="pu-admin-dashboard__stats">
        <StatsCard
          title="Total de Leads"
          value={stats?.totalLeads ?? 0}
          icon={Users}
          variant="featured"
          badge={{
            text: `${stats?.newLeads ?? 0} novos`,
            variant: 'secondary',
          }}
          description="Base ativa no CRM"
        />
        <StatsCard
          title="Imóveis Publicados"
          value={stats?.totalProperties ?? 0}
          icon={Building2}
          description="Portfólio no ar"
        />
        <StatsCard
          title="Negócios Ativos"
          value={stats?.activeDeals ?? 0}
          icon={Handshake}
          description="Em fase de negociação"
        />
        <StatsCard
          title="Fechados este Mês"
          value={stats?.closedThisMonth ?? 0}
          icon={TrendingUp}
          description="Conversões do ciclo atual"
        />
      </section>

      <section className="pu-admin-dashboard__bottom">
        <RecentLeads limit={6} />
        <aside className="pu-admin-panel pu-admin-panel--accent">
          <header className="pu-admin-panel__header">
            <p className="pu-admin-panel__kicker">Resumo tático</p>
            <h2 className="pu-admin-panel__title">Foco do dia</h2>
          </header>
          <div className="pu-admin-insights">
            <article className="pu-admin-insights__item">
              <p className="pu-admin-insights__label">Leads novos</p>
              <p className="pu-admin-insights__value">{stats?.newLeads ?? 0}</p>
              <p className="pu-admin-insights__hint">Priorize contato em até 1h.</p>
            </article>
            <article className="pu-admin-insights__item">
              <p className="pu-admin-insights__label">Negócios ativos</p>
              <p className="pu-admin-insights__value">{stats?.activeDeals ?? 0}</p>
              <p className="pu-admin-insights__hint">Mantenha follow-up diário.</p>
            </article>
            <article className="pu-admin-insights__item">
              <p className="pu-admin-insights__label">Imóveis publicados</p>
              <p className="pu-admin-insights__value">{stats?.totalProperties ?? 0}</p>
              <p className="pu-admin-insights__hint">Atualize anúncios com maior procura.</p>
            </article>
          </div>
        </aside>
      </section>
    </div>
  )
}
