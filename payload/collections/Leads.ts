import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { distributeLead } from '../hooks/afterChange/distribute-lead'
import { updateLeadScore } from '../hooks/afterChange/update-score'
import { normalizeBrazilianPhone, validateBrazilianPhone } from '../hooks/validators'

const normalizeLeadPhone: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data) return data

  if (typeof data.phone === 'string') {
    data.phone = normalizeBrazilianPhone(data.phone)
  }

  return data
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: {
    singular: 'Lead',
    plural: 'Leads',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'source', 'status', 'priority', 'assignedTo', 'score'],
    group: 'CRM',
  },
  access: {
    create: ({ req }) => ['admin', 'agent'].includes(req.user?.role || ''),
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
    beforeChange: [normalizeLeadPhone],
    afterChange: [updateLeadScore, distributeLead],
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
      required: false,
      label: 'Telefone',
      validate: validateBrazilianPhone,
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
      admin: {
        position: 'sidebar',
        components: {
          Field: '/components/fields/LeadStatusSelect#LeadStatusSelect',
        },
      },
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
