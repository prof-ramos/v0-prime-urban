import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { seoPlugin } from '@payloadcms/plugin-seo'

import { Users } from './collections/users'
import { Media } from './collections/media'
import { Tags } from './collections/tags'
import { Amenities } from './collections/amenities'
import { Neighborhoods } from './collections/neighborhoods'
import { Properties } from './collections/properties'
import { Leads } from './collections/leads'
import { Deals } from './collections/deals'
import { Activities } from './collections/activities'

import { SETTINGS } from './globals/settings'
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

interface SEOArgs {
  doc: {
    title?: string
    name?: string
    shortDescription?: string
  }
}

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: 'users',
  },
  collections: [Users, Media, Tags, Amenities, Neighborhoods, Properties, Leads, Deals, Activities],
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
      generateTitle: (args: unknown) => {
        const { doc } = args as SEOArgs
        return `PrimeUrban | ${doc?.title || doc?.name || 'Imóveis'}`
      },
      generateDescription: (args: unknown) => {
        const { doc } = args as SEOArgs
        return doc?.shortDescription || 'Especialista em imóveis de alto padrão.'
      },
    }),
  ],
})
