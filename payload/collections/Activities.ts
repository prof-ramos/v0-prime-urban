import type { CollectionConfig } from 'payload'
import { updateLeadLastContact } from '../hooks/afterCreate/update-lead-last-contact'

export const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'lead', 'agent', 'createdAt'],
    group: 'CRM',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { agent: { equals: req.user.id } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { agent: { equals: req.user.id } }
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    afterChange: [updateLeadLastContact],
  },
  fields: [
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
      index: true,
      label: 'Lead',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Ligação', value: 'call' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'E-mail', value: 'email' },
        { label: 'Visita', value: 'visit' },
        { label: 'Nota', value: 'note' },
        { label: 'Tarefa', value: 'task' },
      ],
      label: 'Tipo de Atividade',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descrição/Resumo',
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      label: 'Responsável',
      admin: { position: 'sidebar' },
    },
  ],
}
