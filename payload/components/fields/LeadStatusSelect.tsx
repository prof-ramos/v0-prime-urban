'use client'

import { useField } from '@payloadcms/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldLabel } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contactado', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualificado', color: 'bg-green-500' },
  { value: 'visit_scheduled', label: 'Visita Agendada', color: 'bg-purple-500' },
  { value: 'proposal_sent', label: 'Proposta Enviada', color: 'bg-orange-500' },
  { value: 'negotiation', label: 'Negociação', color: 'bg-cyan-500' },
  { value: 'closed_won', label: 'Fechado - Ganho', color: 'bg-emerald-600' },
  { value: 'closed_lost', label: 'Fechado - Perdido', color: 'bg-red-500' },
]

export const LeadStatusSelect: SelectFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div className="space-y-2">
      <FieldLabel label={field.label as string} />
      <Select value={value || ''} onValueChange={setValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${option.color}`} />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
