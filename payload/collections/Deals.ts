import type { CollectionConfig } from 'payload'
import { isOwnerOrAdmin } from '../access/is-owner-or-admin'

export type DealStage = 'proposal' | 'contract' | 'signed' | 'cancelled'

export const DEAL_STAGE_OPTIONS: { label: string; value: DealStage }[] = [
  { label: 'Proposta', value: 'proposal' },
  { label: 'Contrato', value: 'contract' },
  { label: 'Assinado', value: 'signed' },
  { label: 'Cancelado', value: 'cancelled' },
]

export const Deals: CollectionConfig = {
  slug: 'deals',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['lead', 'property', 'stage', 'finalPrice', 'agent'],
    group: 'CRM',
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Auto-preencher agent com req.user.id se não definido
        if (!data.agent && req.user?.id) {
          data.agent = req.user.id
        }
        return data
      },
    ],
  },
  access: {
    read: isOwnerOrAdmin,
    create: ({ req }) => !!req.user,
    update: isOwnerOrAdmin,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      admin: {
        readOnly: true,
        description: 'Gerado automaticamente a partir do lead e propriedade',
      },
      hooks: {
        beforeChange: [
          ({ data, siblingData }) => {
            // Compor título de lead + propriedade
            if (!data) return data
            const leadTitle = siblingData?.lead || data.lead || 'Lead'
            const propertyTitle = siblingData?.property || data.property || 'Imóvel'
            return `${leadTitle} - ${propertyTitle}`
          },
        ],
      },
    },
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
      label: 'Lead',
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      label: 'Imóvel',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'askingPrice',
          type: 'number',
          label: 'Preço Original',
        },
        {
          name: 'offerPrice',
          type: 'number',
          label: 'Valor da Proposta',
        },
        {
          name: 'finalPrice',
          type: 'number',
          label: 'Valor de Fechamento',
        },
      ],
    },
    {
      name: 'stage',
      type: 'select',
      required: true,
      defaultValue: 'proposal',
      options: DEAL_STAGE_OPTIONS,
      label: 'Estágio do Negócio',
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Corretor',
      admin: { position: 'sidebar' },
    },
  ],
}
