import type { CollectionConfig } from 'payload'
import { autoSlug } from '../hooks/beforeChange/auto-slug'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'icon', 'category', 'active'],
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
      label: 'Nome da Comodidade',
      admin: {
        placeholder: 'Ex: Piscina, Academia, Churrasqueira',
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
      name: 'icon',
      type: 'text',
      required: true,
      label: 'Ícone Lucide',
      admin: {
        placeholder: 'Ex: waves, dumbbell, flame',
        description: 'Nome do ícone do Lucide React (https://lucide.dev)',
      },
    },
    {
      name: 'category',
      type: 'radio',
      required: true,
      defaultValue: 'property',
      options: [
        { label: 'Imóvel', value: 'property' },
        { label: 'Condomínio/Edifício', value: 'building' },
      ],
      admin: {
        description: 'Separar comodidades do imóvel das do condomínio',
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
