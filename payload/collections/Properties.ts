import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { autoCode } from '../hooks/beforeChange/auto-code'
import { autoSlug } from '../hooks/beforeChange/auto-slug'
import { revalidateProperty } from '../hooks/afterChange/revalidate-isr'
import { notifyInterestedLeads } from '../hooks/afterChange/notify-leads'

const MAX_PRICE_VALUE = 999999999

const getRelationshipId = (value: unknown): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (!value || typeof value !== 'object' || !('id' in value)) return null

  const id = (value as { id?: unknown }).id
  if (typeof id === 'string' || typeof id === 'number') return id

  return null
}

const syncNeighborhoodName: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data?.address) return data

  const neighborhoodId = getRelationshipId(data.address.neighborhood)
  if (!neighborhoodId) return data

  try {
    const neighborhood = await req.payload.findByID({
      collection: 'neighborhoods',
      id: neighborhoodId,
      depth: 0,
      select: {
        name: true,
      },
    })

    if (typeof neighborhood.name === 'string' && neighborhood.name.trim().length > 0) {
      data.address.neighborhoodName = neighborhood.name
    }
  } catch {
    // Mantém o valor atual de neighborhoodName caso a busca falhe.
  }

  return data
}

const preserveGeneratedIdentity: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
}) => {
  if (!data || operation !== 'update' || !originalDoc) return data

  data.code = originalDoc.code
  data.slug = originalDoc.slug
  return data
}

export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: {
    singular: 'Imóvel',
    plural: 'Imóveis',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'type', 'category', 'price', 'status', 'agent'],
    group: 'Imóveis',
    listSearchableFields: ['title', 'code', 'address.neighborhoodName'],
  },
  access: {
    create: ({ req }) => ['admin', 'agent'].includes(req.user?.role || ''),
    read: () => true,
    update: ({ req }) => ['admin', 'agent'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [autoSlug('title'), autoCode('PRM'), syncNeighborhoodName, preserveGeneratedIdentity],
    afterChange: [revalidateProperty, notifyInterestedLeads],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informações Básicas',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  label: 'Título do Anúncio',
                },
                {
                  name: 'code',
                  type: 'text',
                  required: true,
                  unique: true,
                  label: 'Código',
                  admin: {
                    readOnly: true,
                    description: 'Gerado automaticamente (PRM-001, PRM-002...)',
                  },
                },
              ],
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              label: 'URL Slug',
              admin: {
                readOnly: true,
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'radio',
                  required: true,
                  defaultValue: 'sale',
                  options: [
                    { label: 'Venda', value: 'sale' },
                    { label: 'Locação', value: 'rent' },
                  ],
                },
                {
                  name: 'category',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Apartamento', value: 'apartment' },
                    { label: 'Casa', value: 'house' },
                    { label: 'Comercial', value: 'commercial' },
                    { label: 'Terreno', value: 'land' },
                    { label: 'Cobertura', value: 'penthouse' },
                    { label: 'Studio', value: 'studio' },
                  ],
                },
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'draft',
                  options: [
                    { label: 'Rascunho', value: 'draft' },
                    { label: 'Publicado', value: 'published' },
                    { label: 'Vendido', value: 'sold' },
                    { label: 'Alugado', value: 'rented' },
                    { label: 'Pausado', value: 'paused' },
                  ],
                  admin: {
                    position: 'sidebar',
                    components: {
                      Cell: '/components/fields/PropertyStatusCell#PropertyStatusCell',
                    },
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: MAX_PRICE_VALUE,
                  label: 'Preço (R$)',
                },
                {
                  name: 'condominiumFee',
                  type: 'number',
                  min: 0,
                  max: MAX_PRICE_VALUE,
                  label: 'Condomínio (R$)',
                },
                {
                  name: 'iptu',
                  type: 'number',
                  min: 0,
                  max: MAX_PRICE_VALUE,
                  label: 'IPTU (R$)',
                },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              required: true,
              label: 'Descrição Curta',
              maxLength: 160,
            },
            {
              name: 'fullDescription',
              type: 'richText',
              required: true,
              label: 'Descrição Completa',
            },
          ],
        },
        {
          label: 'Localização',
          fields: [
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'street', type: 'text', required: true, label: 'Rua' },
                    { name: 'number', type: 'text', required: true, label: 'Número' },
                    { name: 'complement', type: 'text', label: 'Complemento' },
                  ],
                },
                {
                  name: 'zipCode',
                  type: 'text',
                  label: 'CEP',
                },
                {
                  name: 'neighborhood',
                  type: 'relationship',
                  relationTo: 'neighborhoods',
                  required: true,
                  label: 'Bairro',
                },
                {
                  name: 'neighborhoodName',
                  type: 'text',
                  label: 'Nome do Bairro',
                  admin: {
                    readOnly: true,
                    hidden: true,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Mídia',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Imagem Destaque',
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Galeria',
            },
          ],
        },
      ],
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Corretor Responsável',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Visualizações',
    },
  ],
}
