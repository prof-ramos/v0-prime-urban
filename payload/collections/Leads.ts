import type { CollectionConfig } from 'payload'
import { distributeLead } from '../hooks/afterCreate/distribute-lead'
import { updateLeadScore } from '../hooks/beforeChange/update-score'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'source', 'status', 'priority', 'assignedTo', 'score'],
    group: 'CRM',
  },
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user?.role === 'agent') return { assignedTo: { equals: req.user.id } }
      return false
    },
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user?.role === 'agent') return { assignedTo: { equals: req.user.id } }
      return false
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [updateLeadScore],
    afterChange: [distributeLead],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome Completo',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Telefone',
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-mail',
    },
    {
      name: 'lastContactAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Último Contato',
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Indicação', value: 'referral' },
        { label: 'Outro', value: 'other' },
      ],
      admin: { position: 'sidebar' },
      label: 'Origem',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'Novo', value: 'new' },
        { label: 'Contactado', value: 'contacted' },
        { label: 'Qualificado', value: 'qualified' },
        { label: 'Visita Agendada', value: 'visit_scheduled' },
        { label: 'Proposta Enviada', value: 'proposal_sent' },
        { label: 'Negociação', value: 'negotiation' },
        { label: 'Fechado - Ganho', value: 'closed_won' },
        { label: 'Fechado - Perdido', value: 'closed_lost' },
      ],
      admin: { position: 'sidebar' },
      label: 'Status',
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Alta', value: 'high' },
        { label: 'Média', value: 'medium' },
        { label: 'Baixa', value: 'low' },
      ],
      admin: { position: 'sidebar' },
      label: 'Prioridade',
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      label: 'Corretor Atribuído',
      admin: { position: 'sidebar' },
    },
    {
      name: 'score',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Score',
    },
  ],
}
