import type { CollectionConfig } from 'payload'

import { BRAZILIAN_STATES } from './constants'
import { autoSlug } from '../hooks/beforeChange/auto-slug'

export const Neighborhoods: CollectionConfig = {
  slug: 'neighborhoods',
  labels: {
    singular: 'Bairro',
    plural: 'Bairros',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'propertyCount', 'averagePrice', 'active'],
    group: 'Imóveis',
  },
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [autoSlug('name')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Nome do Bairro',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      defaultValue: 'Brasília',
      label: 'Cidade',
    },
    {
      name: 'state',
      type: 'select',
      required: true,
      defaultValue: 'DF',
      label: 'Estado',
      admin: {
        width: '30%',
      },
      options: BRAZILIAN_STATES,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Descrição do Bairro',
      admin: {
        description: 'Informações sobre infraestrutura, comércio, transporte',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem Destaque',
    },
    {
      name: 'propertyCount',
      type: 'number',
      defaultValue: 0,
      label: 'Total de Imóveis Ativos',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Calculado automaticamente',
      },
    },
    {
      name: 'averagePrice',
      type: 'number',
      defaultValue: 0,
      label: 'Preço Médio (R$)',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Calculado automaticamente',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Ativo',
      admin: {
        position: 'sidebar',
        description: 'Exibir nos filtros do site',
      },
    },
  ],
}
