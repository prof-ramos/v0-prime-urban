'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@payloadcms/ui'

interface AgentStats {
  totalLeads: number
  newLeads: number
  totalProperties: number
  activeDeals: number
  closedThisMonth: number
}

interface UseAgentStatsReturn {
  stats: AgentStats | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseNumberField = (value: unknown, field: keyof AgentStats): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Resposta inválida: campo "${field}" ausente ou não numérico`)
  }

  return value
}

const parseAgentStats = (value: unknown): AgentStats => {
  if (!isRecord(value)) {
    throw new Error('Resposta inválida: payload de estatísticas não é um objeto')
  }

  return {
    totalLeads: parseNumberField(value.totalLeads, 'totalLeads'),
    newLeads: parseNumberField(value.newLeads, 'newLeads'),
    totalProperties: parseNumberField(value.totalProperties, 'totalProperties'),
    activeDeals: parseNumberField(value.activeDeals, 'activeDeals'),
    closedThisMonth: parseNumberField(value.closedThisMonth, 'closedThisMonth'),
  }
}

async function fetchUserStats(userId: number): Promise<AgentStats> {
  const response = await fetch(`/api/dashboard-stats?agentId=${encodeURIComponent(String(userId))}`)
  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }

  const data: unknown = await response.json()
  return parseAgentStats(data)
}

export function useAgentStats(): UseAgentStatsReturn {
  const { user } = useAuth()
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const normalizedUserId = typeof user?.id === 'number' ? user.id : Number(user?.id)
  const hasValidUserId = Number.isInteger(normalizedUserId) && normalizedUserId > 0

  const fetchStats = useCallback(async () => {
    if (!hasValidUserId) {
      setLoading(false)
      setStats(null)
      setError(new Error('ID de usuário inválido para buscar estatísticas'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const statsData = await fetchUserStats(normalizedUserId)
      setStats(statsData)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [hasValidUserId, normalizedUserId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
