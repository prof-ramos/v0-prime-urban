'use client'

import { Plus, MessageSquare, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="pu-quick-actions" role="group" aria-label="Ações rápidas">
      <Button
        variant="secondary"
        size="sm"
        className="pu-quick-actions__button"
        onClick={() => router.push('/admin/collections/properties/create')}
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Imóvel
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="pu-quick-actions__button"
        onClick={() => router.push('/admin/collections/leads/create')}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Novo Lead
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="pu-quick-actions__button"
        onClick={() => router.push('/admin/collections/activities/create')}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Agendar Visita
      </Button>
    </div>
  )
}
