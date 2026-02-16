import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access/is-admin'
import { validateBrazilianPhone } from '../hooks/validators'

export const SETTINGS: GlobalConfig = {
  slug: 'settings',
  label: 'Configurações Gerais',
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
      validate: validateBrazilianPhone,
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
            if (typeof value !== 'string') return true
            try {
              new URL(value)
              return true
            } catch {
              return 'URL deve ser válida (ex: https://instagram.com/primeurban)'
            }
          },
        },
      ],
    },
    {
      name: 'lastAssignedAgentIndex',
      type: 'number',
      admin: {
        hidden: true,
      },
      defaultValue: 0,
    },
  ],
}
