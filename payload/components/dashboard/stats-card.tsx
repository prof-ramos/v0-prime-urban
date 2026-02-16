import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  badge?: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <Badge variant="secondary" className="mt-2">
            {trend.value > 0 ? '+' : ''}
            {trend.value}% {trend.label}
          </Badge>
        )}
        {badge && (
          <Badge variant={badge.variant} className="mt-2">
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
