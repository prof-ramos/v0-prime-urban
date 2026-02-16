import type { CollectionConfig } from 'payload'
import { autoSlug } from '../hooks/beforeChange/auto-slug'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'color', 'active'],
    group: 'Configurações',
  },
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [autoSlug('label')],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      unique: true,
      label: 'Texto da Tag',
      admin: {
        placeholder: 'Ex: Novo, Oportunidade, Exclusivo',
      },
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
      name: 'color',
      type: 'text',
      required: true,
      defaultValue: '#B68863',
      label: 'Cor (Hex)',
      admin: {
        placeholder: '#B68863',
        description: 'Cor do badge no site',
      },
      validate: (value: unknown) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) return true
        const stringValue = Array.isArray(value) ? value[0] : value
        if (typeof stringValue !== 'string') return true
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
        if (!hexRegex.test(stringValue)) {
          return 'Cor deve estar no formato hexadecimal (ex: #B68863 ou #B65)'
        }
        return true
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Ativo',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
