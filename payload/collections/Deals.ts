import type { CollectionBeforeChangeHook, CollectionConfig, FieldHook } from 'payload'

import { isOwnerOrAdmin } from '../access/is-owner-or-admin'

export type DealStage = 'proposal' | 'contract' | 'signed' | 'cancelled'

export interface DealStageOption {
  label: string
  value: DealStage
}

export const DEAL_STAGE_OPTIONS: DealStageOption[] = [
  { label: 'Proposta', value: 'proposal' },
  { label: 'Contrato', value: 'contract' },
  { label: 'Assinado', value: 'signed' },
  { label: 'Cancelado', value: 'cancelled' },
]

const assignAgentOnCreate: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return data

  if (!data.agent && req.user?.id) {
    data.agent = req.user.id
  }

  return data
}

const getRelationshipId = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (!value || typeof value !== 'object' || !('id' in value)) return null

  const id = (value as { id?: unknown }).id
  if (typeof id === 'string') return id
  if (typeof id === 'number') return String(id)

  return null
}

const getRelationshipTitle = async ({
  id,
  collection,
  fallback,
  req,
}: {
  id: string | null
  collection: 'leads' | 'properties'
  fallback: string
  req: Parameters<FieldHook>[0]['req']
}): Promise<string> => {
  if (!id) return fallback

  try {
    const doc = await req.payload.findByID({
      collection,
      id,
      depth: 0,
    })

    if (collection === 'leads') {
      const leadName = 'name' in doc ? doc.name : undefined
      return typeof leadName === 'string' && leadName.trim().length > 0 ? leadName : fallback
    }

    const propertyTitle = 'title' in doc ? doc.title : undefined
    return typeof propertyTitle === 'string' && propertyTitle.trim().length > 0
      ? propertyTitle
      : fallback
  } catch {
    return fallback
  }
}

const composeDealTitle: FieldHook = async ({ siblingData, data, req }) => {
  const leadId = getRelationshipId(siblingData?.lead ?? data?.lead)
  const propertyId = getRelationshipId(siblingData?.property ?? data?.property)

  if (!leadId || !propertyId) return undefined

  const [leadTitle, propertyTitle] = await Promise.all([
    getRelationshipTitle({ id: leadId, collection: 'leads', fallback: 'Lead', req }),
    getRelationshipTitle({ id: propertyId, collection: 'properties', fallback: 'Imóvel', req }),
  ])

  return `${leadTitle} - ${propertyTitle}`
}

export const Deals: CollectionConfig = {
  slug: 'deals',
  labels: {
    singular: 'Negócio',
    plural: 'Negócios',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['lead', 'property', 'stage', 'finalPrice', 'agent'],
    group: 'CRM',
  },
  hooks: {
    beforeChange: [assignAgentOnCreate],
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
        beforeChange: [composeDealTitle],
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
