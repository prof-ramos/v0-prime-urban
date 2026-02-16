import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/is-admin'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Mídia',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: isAdmin,
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'centre',
      },
      {
        name: 'featured',
        width: 1200,
        height: 900,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Texto Alternativo (SEO)',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Legenda',
    },
    {
      name: 'folder',
      type: 'select',
      options: [
        { label: 'Imóveis', value: 'properties' },
        { label: 'Bairros', value: 'neighborhoods' },
        { label: 'Posts', value: 'posts' },
        { label: 'Geral', value: 'general' },
      ],
      defaultValue: 'properties',
      label: 'Pasta/Categoria',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
