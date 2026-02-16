import type { CollectionConfig } from 'payload'
import { autoCode } from '../hooks/beforeChange/auto-code'
import { autoSlug } from '../hooks/beforeChange/auto-slug'
import { revalidateProperty } from '../hooks/afterChange/revalidate-isr'
import { notifyInterestedLeads } from '../hooks/afterChange/notify-leads'

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'type', 'category', 'price', 'status', 'agent'],
    group: 'Imobiliário',
    listSearchableFields: ['title', 'code', 'address.neighborhood.name'],
  },
  access: {
    create: ({ req }) => ['admin', 'agent'].includes(req.user?.role || ''),
    read: () => true,
    update: ({ req }) => ['admin', 'agent'].includes(req.user?.role || ''),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [autoSlug('title'), autoCode('PRM')],
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
                  label: 'Preço (R$)',
                },
                {
                  name: 'condominiumFee',
                  type: 'number',
                  min: 0,
                  label: 'Condomínio (R$)',
                },
                {
                  name: 'iptu',
                  type: 'number',
                  min: 0,
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
                  ],
                },
                {
                  name: 'neighborhood',
                  type: 'relationship',
                  relationTo: 'neighborhoods',
                  required: true,
                  label: 'Bairro',
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
  ],
}
