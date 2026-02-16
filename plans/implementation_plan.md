# Plano de Implementação - PrimeUrban CMS+CRM MIT/OpenSource

**Roadmap Executável para Claude Code**
_Base: cms_crm_plan_mit.md_
_Duração estimada: 8 semanas_

---

## Fase 1: Setup e Infraestrutura Base (Semana 1)

### 1.1 Preparação do Ambiente

**Objetivo:** Dockerizar aplicação existente e configurar PostgreSQL + MinIO.

**Comandos:**

```bash
# Criar estrutura de diretórios
mkdir -p docker/{postgres,minio,caddy}
mkdir -p lib/minio lib/email lib/sharp
mkdir -p payload/{collections,hooks,access,components,globals}

# Criar arquivos de configuração
touch docker-compose.yml
touch Dockerfile
touch .env.example
touch .dockerignore
```

**Arquivos a criar:**

#### `Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install Sharp dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install Sharp runtime dependencies
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: primeUrban-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: primeUrban
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: '-E UTF8'
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - primeUrban-net

  pgbouncer:
    image: edoburu/pgbouncer:latest
    container_name: primeUrban-pgbouncer
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/primeUrban
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 1000
      DEFAULT_POOL_SIZE: 25
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - primeUrban-net

  redis:
    image: redis:7-alpine
    container_name: primeUrban-redis
    restart: unless-stopped
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - primeUrban-net

  minio:
    image: minio/minio:latest
    container_name: primeUrban-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
      MINIO_BROWSER: 'on'
    volumes:
      - minio-data:/data
    ports:
      - '9000:9000'
      - '9001:9001'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - primeUrban-net

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: primeUrban-app
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@pgbouncer:6432/primeUrban
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_USE_SSL: false
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      NEXT_PUBLIC_SERVER_URL: http://localhost:3000
    ports:
      - '3000:3000'
    depends_on:
      pgbouncer:
        condition: service_started
      minio:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - primeUrban-net

volumes:
  postgres-data:
  redis-data:
  minio-data:

networks:
  primeUrban-net:
    driver: bridge
```

#### `.env.example`

```bash
# Database
DB_USER=primeUrban
DB_PASSWORD=<gerar_senha_forte>
DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@pgbouncer:6432/primeUrban

# Payload CMS
PAYLOAD_SECRET=<gerar_32_caracteres>

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<gerar_senha_forte>
MINIO_BUCKET=primeUrban
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false

# SMTP (usar Gmail ou Brevo free tier)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=<app_password>

# Next.js
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_TELEMETRY_DISABLED=1
```

#### `docker/postgres/init.sql`

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurações de performance
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '16MB';
```

#### `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Para Docker
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
```

**Validação:**

```bash
# Copiar .env.example para .env e preencher
cp .env.example .env

# Gerar secrets
echo "PAYLOAD_SECRET=$(openssl rand -base64 32)"
echo "DB_PASSWORD=$(openssl rand -base64 24)"
echo "MINIO_ROOT_PASSWORD=$(openssl rand -base64 24)"

# Build e start
docker compose build
docker compose up -d

# Verificar saúde
docker compose ps
docker compose logs -f app

# Acessar
# App: http://localhost:3000
# MinIO: http://localhost:9001
```

---

## Fase 2: Instalação Payload CMS (Semana 1)

### 2.1 Instalar Dependências

**Comandos:**

```bash
pnpm add payload@beta @payloadcms/next@beta @payloadcms/richtext-lexical@beta
pnpm add @payloadcms/db-postgres@beta @payloadcms/storage-s3@beta
pnpm add sharp @aws-sdk/client-s3 @aws-sdk/lib-storage
pnpm add nodemailer @react-email/components
pnpm add -D @types/nodemailer
```

### 2.2 Estrutura Base do Payload

**Arquivos a criar:**

#### `payload.config.ts`

```typescript
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: 'admin@primeUrban.com',
            password: 'admin123',
            prefillOnly: true,
          }
        : false,
  },
  collections: [
    // Será populado na próxima fase
  ],
  globals: [
    // Será populado na próxima fase
  ],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.MINIO_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY!,
          secretAccessKey: process.env.MINIO_SECRET_KEY!,
        },
        region: 'us-east-1',
        endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
        forcePathStyle: true,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
```

#### `app/(payload)/admin/[[...segments]]/page.tsx`

```typescript
import { RootLayout, RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { Metadata } from 'next'
import config from '@/payload.config'

export const generateMetadata = (): Promise<Metadata> => generatePageMetadata({ config })

const Page = RootPage
const Layout = RootLayout

export { Layout, Page }
```

#### `app/(payload)/admin/[[...segments]]/not-found.tsx`

```typescript
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import { Metadata } from 'next'
import config from '@/payload.config'

export const generateMetadata = (): Promise<Metadata> => generatePageMetadata({ config })

const NotFound = NotFoundPage

export default NotFound
```

#### `app/api/(payload)/[...slug]/route.ts`

```typescript
import { REST_GET, REST_POST, REST_PATCH, REST_DELETE } from '@payloadcms/next/routes'

export const GET = REST_GET
export const POST = REST_POST
export const PATCH = REST_PATCH
export const DELETE = REST_DELETE
```

**Validação:**

```bash
# Build
pnpm build

# Restart container
docker compose restart app

# Acessar admin
# http://localhost:3000/admin
```

---

## Fase 3: Collections Básicas (Semana 2)

### 3.1 Collection: Users

**Arquivo:** `payload/collections/Users.ts`

```typescript
import { CollectionConfig } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: { equals: user?.id },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'agent',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Agente', value: 'agent' },
        { label: 'Assistente', value: 'assistant' },
      ],
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'creci',
      type: 'text',
      label: 'CRECI',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'commissionRate',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Percentual de comissão padrão (%)',
      },
    },
  ],
}
```

### 3.2 Collection: Media (com Sharp processing)

**Arquivo:** `payload/collections/Media.ts`

```typescript
import { CollectionConfig } from 'payload/types'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  admin: {
    useAsTitle: 'filename',
  },
  upload: {
    staticDir: '../media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'card',
        width: 800,
        height: 600,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
    ],
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Sharp processing customizado será adicionado na próxima fase
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'folder',
      type: 'text',
      admin: {
        description: 'Organização: properties/PRM-001, neighborhoods, etc.',
      },
    },
  ],
}
```

### 3.3 Collection: Neighborhoods

**Arquivo:** `payload/collections/Neighborhoods.ts`

```typescript
import { CollectionConfig } from 'payload/types'

export const Neighborhoods: CollectionConfig = {
  slug: 'neighborhoods',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'state', 'propertyCount', 'active'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
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
    },
    {
      name: 'state',
      type: 'text',
      required: true,
      defaultValue: 'DF',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'averagePrice',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Calculado automaticamente',
      },
    },
    {
      name: 'propertyCount',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Calculado automaticamente',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}
```

### 3.4 Collections: Tags e Amenities

**Arquivo:** `payload/collections/Tags.ts`

```typescript
import { CollectionConfig } from 'payload/types'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'label',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
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
      admin: {
        description: 'Cor hexadecimal (#RRGGBB)',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.label && !data.slug) {
          data.slug = data.label
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
        }
        return data
      },
    ],
  },
}
```

**Arquivo:** `payload/collections/Amenities.ts`

```typescript
import { CollectionConfig } from 'payload/types'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'category', 'active'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: {
        description: 'Nome do ícone Lucide (ex: waves, dumbbell)',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Imóvel', value: 'property' },
        { label: 'Condomínio', value: 'building' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.label && !data.slug) {
          data.slug = data.label
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
        }
        return data
      },
    ],
  },
}
```

### 3.5 Atualizar payload.config.ts

```typescript
import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Neighborhoods } from './payload/collections/Neighborhoods'
import { Tags } from './payload/collections/Tags'
import { Amenities } from './payload/collections/Amenities'

export default buildConfig({
  // ... configurações anteriores
  collections: [Users, Media, Neighborhoods, Tags, Amenities],
})
```

**Validação:**

```bash
# Build
pnpm build

# Restart
docker compose restart app

# Acessar /admin
# Criar usuário admin
# Testar CRUD de cada collection
```

---

## Fase 4: Collection Properties (Semana 2-3)

### 4.1 Criar Collection Properties

**Arquivo:** `payload/collections/Properties.ts`

```typescript
import { CollectionConfig } from 'payload/types'

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'type', 'price', 'status'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          status: { equals: 'published' },
        }
      }
      return true
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informações Básicas',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'code',
                  type: 'text',
                  required: true,
                  unique: true,
                  admin: {
                    readOnly: true,
                    description: 'Gerado automaticamente (PRM-001)',
                  },
                },
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'draft',
                  options: [
                    { label: 'Rascunho', value: 'draft' },
                    { label: 'Publicado', value: 'published' },
                    { label: 'Vendido', value: 'sold' },
                    { label: 'Alugado', value: 'rented' },
                    { label: 'Pausado', value: 'paused' },
                  ],
                },
              ],
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                readOnly: true,
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Venda', value: 'sale' },
                    { label: 'Aluguel', value: 'rent' },
                  ],
                },
                {
                  name: 'category',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Apartamento', value: 'apartment' },
                    { label: 'Casa', value: 'house' },
                    { label: 'Comercial', value: 'commercial' },
                    { label: 'Terreno', value: 'land' },
                    { label: 'Cobertura', value: 'penthouse' },
                    { label: 'Studio', value: 'studio' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  min: 0,
                },
                {
                  name: 'condominiumFee',
                  type: 'number',
                  min: 0,
                },
                {
                  name: 'iptu',
                  type: 'number',
                  min: 0,
                },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              required: true,
              maxLength: 160,
            },
            {
              name: 'fullDescription',
              type: 'richText',
            },
          ],
        },
        {
          label: 'Características',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'bedrooms',
                  type: 'number',
                  required: true,
                  min: 0,
                },
                {
                  name: 'suites',
                  type: 'number',
                  min: 0,
                },
                {
                  name: 'bathrooms',
                  type: 'number',
                  required: true,
                  min: 1,
                },
                {
                  name: 'parkingSpots',
                  type: 'number',
                  required: true,
                  min: 0,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'totalArea',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    description: 'm²',
                  },
                },
                {
                  name: 'privateArea',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'm² (área privativa)',
                  },
                },
                {
                  name: 'builtArea',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'm² (casas)',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'floor',
                  type: 'number',
                  min: 0,
                },
                {
                  name: 'totalFloors',
                  type: 'number',
                  min: 1,
                },
                {
                  name: 'constructionYear',
                  type: 'number',
                  min: 1900,
                  max: new Date().getFullYear() + 5,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'propertyAge',
                  type: 'select',
                  options: [
                    { label: 'Novo', value: 'new' },
                    { label: 'Em construção', value: 'under_construction' },
                    { label: 'Usado', value: 'used' },
                    { label: 'Reformado', value: 'renovated' },
                  ],
                },
                {
                  name: 'facing',
                  type: 'select',
                  options: [
                    { label: 'Norte', value: 'north' },
                    { label: 'Sul', value: 'south' },
                    { label: 'Leste', value: 'east' },
                    { label: 'Oeste', value: 'west' },
                  ],
                },
                {
                  name: 'position',
                  type: 'select',
                  options: [
                    { label: 'Frente', value: 'front' },
                    { label: 'Fundos', value: 'back' },
                    { label: 'Lateral', value: 'side' },
                  ],
                },
              ],
            },
            {
              name: 'amenities',
              type: 'relationship',
              relationTo: 'amenities',
              hasMany: true,
              filterOptions: {
                category: { equals: 'property' },
              },
            },
            {
              name: 'buildingFeatures',
              type: 'relationship',
              relationTo: 'amenities',
              hasMany: true,
              filterOptions: {
                category: { equals: 'building' },
              },
            },
          ],
        },
        {
          label: 'Localização',
          fields: [
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  name: 'street',
                  type: 'text',
                  required: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'number',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'complement',
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'neighborhood',
                  type: 'relationship',
                  relationTo: 'neighborhoods',
                  required: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'city',
                      type: 'text',
                      required: true,
                      defaultValue: 'Brasília',
                    },
                    {
                      name: 'state',
                      type: 'text',
                      required: true,
                      defaultValue: 'DF',
                      maxLength: 2,
                    },
                    {
                      name: 'zipCode',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'latitude',
                      type: 'number',
                    },
                    {
                      name: 'longitude',
                      type: 'number',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Mídia',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 30,
            },
            {
              name: 'videoUrl',
              type: 'text',
              admin: {
                description: 'URL do YouTube ou Vimeo',
              },
            },
          ],
        },
        {
          label: 'Destaques',
          fields: [
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Exibir na homepage',
              },
            },
            {
              name: 'highlightText',
              type: 'text',
              admin: {
                description: 'Ex: Últimas unidades, Aceita permuta',
              },
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
            },
            {
              name: 'agent',
              type: 'relationship',
              relationTo: 'users',
              required: true,
              filterOptions: {
                role: { in: ['admin', 'agent'] },
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'meta',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  maxLength: 60,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  maxLength: 160,
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'contactCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-gerar code
        if (operation === 'create' && !data.code) {
          // Buscar último code e incrementar
          // Implementar na próxima iteração
          data.code = `PRM-${Date.now().toString().slice(-6)}`
        }

        // Auto-gerar slug
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        return data
      },
    ],
  },
}
```

**Atualizar payload.config.ts:**

```typescript
import { Properties } from './payload/collections/Properties'

export default buildConfig({
  collections: [
    Users,
    Media,
    Neighborhoods,
    Tags,
    Amenities,
    Properties, // Adicionar
  ],
})
```

**Validação:**

```bash
pnpm build
docker compose restart app

# Testar:
# 1. Criar imóvel com todas as abas
# 2. Upload de múltiplas imagens
# 3. Verificar auto-geração de code e slug
# 4. Preview do imóvel
```

---

## Fase 5: Integration Sharp + MinIO (Semana 3)

### 5.1 Criar Lib Sharp Processing

**Arquivo:** `lib/sharp/process-image.ts`

```typescript
import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  region: 'us-east-1',
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  forcePathStyle: true,
})

export interface ProcessImageOptions {
  buffer: Buffer
  filename: string
  folder?: string
}

export interface ProcessedImage {
  webp: { url: string; size: number }
  thumbnail: { url: string; size: number }
  avif?: { url: string; size: number }
}

export async function processAndUploadImage({
  buffer,
  filename,
  folder = 'uploads',
}: ProcessImageOptions): Promise<ProcessedImage> {
  const bucket = process.env.MINIO_BUCKET!
  const baseFilename = filename.replace(/\.[^/.]+$/, '')

  // Processar WebP principal
  const webpBuffer = await sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toBuffer()

  // Processar thumbnail
  const thumbBuffer = await sharp(buffer)
    .resize(400, 300, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toBuffer()

  // Upload WebP
  const webpKey = `${folder}/${baseFilename}.webp`
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: webpKey,
      Body: webpBuffer,
      ContentType: 'image/webp',
    })
  )

  // Upload thumbnail
  const thumbKey = `${folder}/thumb-${baseFilename}.webp`
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: 'image/webp',
    })
  )

  const endpoint = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`

  return {
    webp: {
      url: `${endpoint}/${bucket}/${webpKey}`,
      size: webpBuffer.length,
    },
    thumbnail: {
      url: `${endpoint}/${bucket}/${thumbKey}`,
      size: thumbBuffer.length,
    },
  }
}
```

### 5.2 Criar Hook para Media Collection

**Arquivo:** `payload/hooks/processImageHook.ts`

```typescript
import { CollectionBeforeChangeHook } from 'payload/types'
import { processAndUploadImage } from '@/lib/sharp/process-image'

export const processImageHook: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation === 'create' && req.file) {
    try {
      const folder = data.folder || 'properties'
      const processed = await processAndUploadImage({
        buffer: req.file.buffer,
        filename: req.file.name,
        folder,
      })

      data.formats = processed
    } catch (error) {
      req.payload.logger.error('Failed to process image:', error)
    }
  }

  return data
}
```

**Atualizar Media collection:**

```typescript
import { processImageHook } from '../hooks/processImageHook'

export const Media: CollectionConfig = {
  // ... campos anteriores
  hooks: {
    beforeChange: [processImageHook],
  },
  fields: [
    // ... campos anteriores
    {
      name: 'formats',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Versões processadas (WebP, thumbnail)',
      },
    },
  ],
}
```

**Validação:**

```bash
pnpm build
docker compose restart app

# Testar:
# 1. Upload de imagem via admin
# 2. Verificar processamento Sharp (logs)
# 3. Verificar MinIO console (http://localhost:9001)
# 4. Verificar URLs geradas no campo formats
```

---

## Fase 6: Collections CRM (Semana 4)

### 6.1 Collection: Leads

**Arquivo:** `payload/collections/Leads.ts`

```typescript
import { CollectionConfig } from 'payload/types'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'status', 'source', 'assignedTo', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'agent') {
        return {
          assignedTo: { equals: user.id },
        }
      }
      return false
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
        {
          name: 'whatsapp',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          required: true,
          options: [
            { label: 'Site', value: 'website' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Google Ads', value: 'google_ads' },
            { label: 'Indicação', value: 'indication' },
            { label: 'Portal', value: 'portal' },
            { label: 'Outro', value: 'other' },
          ],
        },
        {
          name: 'sourceDetails',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'utmSource',
          type: 'text',
        },
        {
          name: 'utmMedium',
          type: 'text',
        },
        {
          name: 'utmCampaign',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'interestType',
          type: 'select',
          required: true,
          options: [
            { label: 'Comprar', value: 'buy' },
            { label: 'Alugar', value: 'rent' },
            { label: 'Vender', value: 'sell' },
            { label: 'Investir', value: 'invest' },
          ],
        },
        {
          name: 'budget',
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'min',
                  type: 'number',
                  min: 0,
                },
                {
                  name: 'max',
                  type: 'number',
                  min: 0,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'preferredNeighborhoods',
      type: 'relationship',
      relationTo: 'neighborhoods',
      hasMany: true,
    },
    {
      name: 'preferredCategories',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Apartamento', value: 'apartment' },
        { label: 'Casa', value: 'house' },
        { label: 'Comercial', value: 'commercial' },
        { label: 'Terreno', value: 'land' },
        { label: 'Cobertura', value: 'penthouse' },
        { label: 'Studio', value: 'studio' },
      ],
    },
    {
      name: 'viewedProperties',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
      admin: {
        description: 'Imóveis visualizados (rastreio automático)',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'Novo', value: 'new' },
            { label: 'Contactado', value: 'contacted' },
            { label: 'Qualificado', value: 'qualified' },
            { label: 'Visita Agendada', value: 'visit_scheduled' },
            { label: 'Proposta Enviada', value: 'proposal_sent' },
            { label: 'Negociação', value: 'negotiation' },
            { label: 'Fechado (Ganho)', value: 'closed_won' },
            { label: 'Fechado (Perdido)', value: 'closed_lost' },
          ],
        },
        {
          name: 'priority',
          type: 'select',
          required: true,
          defaultValue: 'medium',
          options: [
            { label: 'Baixa', value: 'low' },
            { label: 'Média', value: 'medium' },
            { label: 'Alta', value: 'high' },
            { label: 'Quente', value: 'hot' },
          ],
        },
      ],
    },
    {
      name: 'lostReason',
      type: 'select',
      admin: {
        condition: (data) => data.status === 'closed_lost',
      },
      options: [
        { label: 'Preço', value: 'price' },
        { label: 'Localização', value: 'location' },
        { label: 'Timing', value: 'timing' },
        { label: 'Concorrente', value: 'competitor' },
        { label: 'Sem resposta', value: 'no_response' },
        { label: 'Outro', value: 'other' },
      ],
    },
    {
      name: 'lostReasonDetails',
      type: 'textarea',
      admin: {
        condition: (data) => data.status === 'closed_lost',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        role: { in: ['admin', 'agent'] },
      },
    },
    {
      name: 'lgpdConsent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'consentDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'consentIP',
      type: 'text',
    },
    {
      name: 'score',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        readOnly: true,
        description: 'Score de engajamento (0-100)',
      },
    },
    {
      name: 'lastContactAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create') {
          // TODO: Enviar email para corretor
          // TODO: Distribuir round-robin
        }
        return doc
      },
    ],
  },
}
```

### 6.2 Collections: Deals e Activities

**Continuar com estrutura similar...**

**Validação após Fase 6:**

```bash
pnpm build
docker compose restart app

# Testar:
# 1. CRUD de Leads
# 2. Filtros por corretor
# 3. Mudança de status
# 4. Deals vinculados a leads e properties
# 5. Activities timeline
```

---

## Fase 7: Frontend Public Routes (Semana 5)

### 7.1 API Routes

**Arquivo:** `app/api/properties/route.ts`

```typescript
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const payload = await getPayloadHMR({ config: configPromise })
  const searchParams = request.nextUrl.searchParams

  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 12
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const neighborhood = searchParams.get('neighborhood')
  const minPrice = Number(searchParams.get('minPrice'))
  const maxPrice = Number(searchParams.get('maxPrice'))
  const bedrooms = Number(searchParams.get('bedrooms'))

  const where: any = {
    status: { equals: 'published' },
  }

  if (type) where.type = { equals: type }
  if (category) where.category = { equals: category }
  if (neighborhood) where['address.neighborhood'] = { equals: neighborhood }
  if (minPrice) where.price = { ...where.price, greater_than_equal: minPrice }
  if (maxPrice) where.price = { ...where.price, less_than_equal: maxPrice }
  if (bedrooms) where.bedrooms = { greater_than_equal: bedrooms }

  const properties = await payload.find({
    collection: 'properties',
    where,
    page,
    limit,
    sort: '-createdAt',
  })

  return NextResponse.json(properties)
}
```

**Arquivo:** `app/api/properties/[slug]/route.ts`

```typescript
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const payload = await getPayloadHMR({ config: configPromise })

  const properties = await payload.find({
    collection: 'properties',
    where: {
      slug: { equals: params.slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })

  if (properties.docs.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(properties.docs[0])
}
```

### 7.2 Server Components

**Arquivo:** `app/imoveis/page.tsx`

```typescript
import { getPayloadHMR } from '@payloadcms/next/utilities';
import configPromise from '@payload-config';
import PropertyFilters from '@/components/property-filters';
import PropertyCard from '@/components/property-card';

export const revalidate = 30; // ISR 30s

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const payload = await getPayloadHMR({ config: configPromise });

  const properties = await payload.find({
    collection: 'properties',
    where: {
      status: { equals: 'published' },
    },
    limit: 12,
    page: Number(searchParams.page) || 1,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertyFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {properties.docs.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Pagination */}
    </div>
  );
}
```

**Validação:**

```bash
# Testar rotas:
curl http://localhost:3000/api/properties
curl http://localhost:3000/api/properties/apartamento-lago-sul

# Acessar páginas:
http://localhost:3000/imoveis
http://localhost:3000/imovel/apartamento-lago-sul
```

---

## Fase 8: Nodemailer + Email Templates (Semana 6)

### 8.1 Configurar Nodemailer

**Arquivo:** `lib/email/transporter.ts`

```typescript
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await transporter.sendMail({
      from: `PrimeUrban <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
```

**Validação:**

```bash
# Testar envio de email
# Criar hook afterChange em Leads para enviar email ao corretor
```

---

## Fase 9: PostHog + GlitchTip (Semana 7)

### 9.1 Adicionar ao docker-compose.yml

```yaml
posthog:
  image: posthog/posthog:latest
  container_name: primeUrban-posthog
  restart: unless-stopped
  environment:
    DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/posthog
    REDIS_URL: redis://redis:6379
    SECRET_KEY: ${POSTHOG_SECRET_KEY}
    SITE_URL: http://localhost:8000
    POSTHOG_DB_TYPE: postgres
  depends_on:
    - postgres
    - redis
  ports:
    - '8000:8000'
  networks:
    - primeUrban-net

glitchtip-web:
  image: glitchtip/glitchtip:latest
  container_name: primeUrban-glitchtip
  restart: unless-stopped
  environment:
    DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/glitchtip
    REDIS_URL: redis://redis:6379
    SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
    PORT: 8080
  depends_on:
    - postgres
    - redis
  ports:
    - '8080:8080'
  networks:
    - primeUrban-net
```

### 9.2 Integrar no Frontend

**Arquivo:** `lib/posthog.ts`

```typescript
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'http://localhost:8000',
    autocapture: true,
    capture_pageview: true,
  })
}

export default posthog
```

**Validação:**

```bash
docker compose up -d posthog glitchtip-web

# Acessar:
# PostHog: http://localhost:8000
# GlitchTip: http://localhost:8080

# Criar projetos e obter API keys
```

---

## Fase 10: Deployment VPS (Semana 8)

### 10.1 Adicionar Caddy ao docker-compose.yml

```yaml
caddy:
  image: caddy:2-alpine
  container_name: primeUrban-caddy
  restart: unless-stopped
  ports:
    - '80:80'
    - '443:443'
    - '443:443/udp'
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile:ro
    - caddy-data:/data
    - caddy-config:/config
  depends_on:
    - app
  networks:
    - primeUrban-net
```

### 10.2 Criar Caddyfile

**Arquivo:** `Caddyfile`

```caddyfile
primeUrban.com {
  reverse_proxy app:3000

  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Frame-Options "SAMEORIGIN"
    X-Content-Type-Options "nosniff"
  }
}

admin.primeUrban.com {
  reverse_proxy app:3000
}

posthog.primeUrban.com {
  reverse_proxy posthog:8000
}

errors.primeUrban.com {
  reverse_proxy glitchtip-web:8080
}

minio.primeUrban.com {
  reverse_proxy minio:9001
}
```

### 10.3 Deploy no VPS

```bash
# No VPS
git clone <repo>
cd primeUrban

# Configurar .env
cp .env.example .env
# Editar .env com valores de produção

# Build e start
docker compose up -d --build

# Aguardar certificados SSL
docker compose logs -f caddy

# Verificar
docker compose ps
```

---

## Checklist Final de Validação

### Infraestrutura

- [ ] Docker Compose rodando com todos os serviços
- [ ] PostgreSQL acessível via pgBouncer
- [ ] MinIO console acessível e bucket criado
- [ ] Caddy com certificados Let's Encrypt válidos

### Payload CMS

- [ ] Admin acessível em /admin
- [ ] 9 collections funcionais (Users, Media, Neighborhoods, Tags, Amenities, Properties, Leads, Deals, Activities)
- [ ] Upload de imagens com processamento Sharp
- [ ] Storage MinIO funcionando
- [ ] Auto-geração de slugs e codes

### Frontend

- [ ] Homepage renderizando
- [ ] Listagem de imóveis com filtros
- [ ] Página de detalhes com ISR
- [ ] Formulário de contato criando leads
- [ ] WhatsApp tracking funcionando

### Integrações

- [ ] Nodemailer enviando emails
- [ ] PostHog capturando eventos
- [ ] GlitchTip recebendo erros
- [ ] Sharp processando imagens para WebP

### Performance

- [ ] TTFB < 200ms (páginas ISR)
- [ ] Imagens servidas em WebP
- [ ] Lighthouse score > 90

---

_Plano de Implementação v1.0 - PrimeUrban MIT/OpenSource Stack_
_Baseado em: cms_crm_plan_mit.md_
