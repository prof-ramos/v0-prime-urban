import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateDescription, GenerateTitle } from '@payloadcms/plugin-seo/types'
import { pt } from '@payloadcms/translations/languages/pt'

import { isDevBypassActive } from './access/dev-bypass'
import { Activities } from './collections/Activities'
import { Amenities } from './collections/Amenities'
import { Deals } from './collections/Deals'
import { Leads } from './collections/Leads'
import { MEDIA } from './collections/Media'
import { Neighborhoods } from './collections/Neighborhoods'
import { Properties } from './collections/Properties'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'

import { SETTINGS } from './globals/Settings'
import { LGPD_SETTINGS } from './globals/lgpd-settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Validate PAYLOAD_SECRET before building config
const getSecret = (): string => {
  if (process.env.PAYLOAD_SECRET) {
    return process.env.PAYLOAD_SECRET
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('PAYLOAD_SECRET environment variable is required in production')
  }
  // Gerar dev secret não-vazio para desenvolvimento
  const devSecret = 'dev-secret-' + Math.random().toString(36).substring(2, 15)
  console.warn('⚠️  PAYLOAD_SECRET not set. Using insecure fallback for development only.')
  return devSecret
}

interface SEODoc {
  title?: string
  name?: string
  shortDescription?: string
}

type SEOGenerateTitleArgs = Parameters<GenerateTitle<SEODoc>>[0]
type SEOGenerateDescriptionArgs = Parameters<GenerateDescription<SEODoc>>[0]

export default buildConfig({
  i18n: {
    supportedLanguages: { pt },
  },
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: 'users',
    // Auto-login in development only (bypass authentication)
    autoLogin: isDevBypassActive()
      ? {
          email: 'dev@primeurban.com',
          password: 'dev-password-123',
          prefillOnly: false, // true = prefill only, false = auto-login
        }
      : false,
    components: {
      graphics: {
        Logo: '/components/logo#Logo',
      },
      views: {
        dashboard: {
          Component: '/components/dashboard/AgentDashboard#AgentDashboard',
        },
      },
    },
    meta: {
      title: 'PrimeUrban Admin',
      description: 'Painel Administrativo - PrimeUrban Imóveis',
    },
  },
  collections: [Users, MEDIA, Tags, Amenities, Neighborhoods, Properties, Leads, Deals, Activities],
  globals: [SETTINGS, LGPD_SETTINGS],
  editor: lexicalEditor({}),
  secret: getSecret(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./payload.db',
    },
  }),
  plugins: [
    seoPlugin({
      collections: ['properties', 'neighborhoods'],
      globals: ['settings'],
      uploadsCollection: 'media',
      generateTitle: (args: SEOGenerateTitleArgs) => {
        const { doc } = args
        return `PrimeUrban | ${doc?.title || doc?.name || 'Imóveis'}`
      },
      generateDescription: (args: SEOGenerateDescriptionArgs) => {
        const { doc } = args
        return doc?.shortDescription || 'Especialista em imóveis de alto padrão.'
      },
    }),
  ],
})
