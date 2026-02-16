import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/is-admin'

export const SETTINGS: GlobalConfig = {
  slug: 'settings',
  typescript: {
    interface: 'Settings',
  },
  graphQL: {
    name: 'Settings',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Prime Urban',
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'socialMedia',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Twitter', value: 'twitter' },
            { label: 'YouTube', value: 'youtube' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
          validate: (value: unknown) => {
            if (!value || (typeof value === 'string' && value.trim() === '')) return true
            const stringValue = Array.isArray(value) ? value[0] : value
            if (typeof stringValue !== 'string') return true
            try {
              new URL(stringValue)
              return true
            } catch {
              return 'URL deve ser válida (ex: https://instagram.com/primeurban)'
            }
          },
        },
      ],
    },
  ],
}
