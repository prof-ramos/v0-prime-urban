import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/is-admin'

export const LGPD_SETTINGS: GlobalConfig = {
  slug: 'lgpd-settings',
  typescript: {
    interface: 'LGPDSettings',
  },
  graphQL: {
    name: 'LGPDSettings',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'privacyPolicy',
      type: 'richText',
      label: 'Política de Privacidade',
    },
    {
      name: 'termsOfUse',
      type: 'richText',
      label: 'Termos de Uso',
    },
    {
      name: 'cookieConsentText',
      type: 'textarea',
      label: 'Texto do Banner de Cookies',
    },
  ],
}
