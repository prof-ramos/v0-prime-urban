'use client'

import { Badge } from '@/components/ui/badge'

interface PropertyStatusCellProps {
  cellData?: string
  rowData?: Record<string, unknown>
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  published: { label: 'Publicado', variant: 'default' },
  sold: { label: 'Vendido', variant: 'outline' },
  rented: { label: 'Alugado', variant: 'outline' },
  paused: { label: 'Pausado', variant: 'secondary' },
}

export function PropertyStatusCell({ cellData }: PropertyStatusCellProps) {
  const status = cellData as string
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
