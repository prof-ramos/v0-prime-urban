import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  badge?: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  variant?: 'default' | 'featured'
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  variant = 'default',
}: StatsCardProps) {
  return (
    <article className={cn('pu-stat-card', variant === 'featured' && 'pu-stat-card--featured')}>
      <header className="pu-stat-card__header">
        <p className="pu-stat-card__title">{title}</p>
        {Icon && (
          <span className="pu-stat-card__icon" aria-hidden>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </header>
      <div className="pu-stat-card__body">
        <p className="pu-stat-card__value">{value}</p>
        {description && <p className="pu-stat-card__description">{description}</p>}
      </div>
      {(trend || badge) && (
        <footer className="pu-stat-card__footer">
          {trend && (
            <Badge variant="secondary">
              {trend.value > 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </Badge>
          )}
          {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
        </footer>
      )}
    </article>
  )
}
