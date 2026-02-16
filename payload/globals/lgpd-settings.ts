import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/is-admin'

export const LGPD_SETTINGS: GlobalConfig = {
  slug: 'lgpd-settings',
  label: 'Configurações LGPD',
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
      required: true,
      admin: {
        description:
          'Conteúdo legal exibido em /privacidade com base de tratamento, direitos do titular e contato do DPO.',
      },
    },
    {
      name: 'termsOfUse',
      type: 'richText',
      label: 'Termos de Uso',
      required: true,
      admin: {
        description:
          'Termos contratuais de uso da plataforma, responsabilidades, limites e condições de aceitação.',
      },
    },
    {
      name: 'cookieConsentText',
      type: 'textarea',
      label: 'Texto do Banner de Cookies',
      admin: {
        description:
          'Mensagem curta exibida no banner de consentimento de cookies (inclua link para política de privacidade).',
      },
    },
  ],
}
