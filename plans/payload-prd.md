# Payload CMS - Especificação Técnica de Implementação

**PrimeUrban - Configuração e Arquitetura**
*Versão: 1.0 | Fevereiro 2026*

---

## 1. Setup Inicial

### 1.1 Instalação

```bash
npm install payload@beta @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/plugin-cloud-storage @payloadcms/plugin-seo
npm install -D @payloadcms/bundler-webpack
```

### 1.2 Estrutura de Diretórios

```
primeUrban/
├── app/
│   ├── (app)/                    # Rotas públicas do site
│   │   ├── imoveis/
│   │   └── imovel/[slug]/
│   └── (payload)/
│       ├── admin/[[...segments]]/page.tsx   # Admin UI do Payload
│       └── api/[...slug]/route.ts            # REST API do Payload
├── payload/
│   ├── collections/              # Definições de collections
│   │   ├── Properties.ts
│   │   ├── Neighborhoods.ts
│   │   ├── Leads.ts
│   │   ├── Deals.ts
│   │   ├── Activities.ts
│   │   ├── Media.ts
│   │   ├── Tags.ts
│   │   ├── Amenities.ts
│   │   └── Users.ts
│   ├── globals/                  # Settings globais
│   │   ├── Settings.ts           # Config gerais (telefone, e-mail, redes sociais)
│   │   └── LGPDSettings.ts       # Config LGPD (DPO, retenção)
│   ├── components/               # Componentes React customizados
│   │   ├── Dashboard.tsx         # Dashboard principal
│   │   ├── LeadKanban.tsx        # Pipeline de vendas
│   │   ├── PropertyPreview.tsx   # Preview de imóvel
│   │   └── Analytics.tsx         # Métricas e relatórios
│   ├── hooks/                    # Business logic
│   │   ├── beforeChange/
│   │   │   ├── autoSlug.ts
│   │   │   ├── autoCode.ts       # Auto-incrementa código PRM-XXX
│   │   │   └── validateLead.ts
│   │   ├── afterChange/
│   │   │   ├── revalidateISR.ts
│   │   │   ├── notifyLeads.ts
│   │   │   └── updateScore.ts
│   │   └── afterCreate/
│   │       ├── distributeLead.ts # Round-robin
│   │       └── sendEmail.ts
│   ├── access/                   # Controle de acesso por role
│   │   ├── isAdmin.ts
│   │   ├── isAgent.ts
│   │   └── isOwnerOrAdmin.ts
│   ├── fields/                   # Custom fields reutilizáveis
│   │   ├── slug.ts
│   │   ├── address.ts
│   │   └── meta.ts
│   └── payload.config.ts         # Config principal
├── lib/
│   └── payload.ts                # Payload client (Local API)
└── .env
```

---

## 2. Configuração Principal

### 2.1 payload.config.ts

```typescript
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { cloudinaryAdapter } from '@payloadcms/plugin-cloud-storage/cloudinary'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'

// Collections
import { Users } from './collections/Users'
import { Properties } from './collections/Properties'
import { Neighborhoods } from './collections/Neighborhoods'
import { Leads } from './collections/Leads'
import { Deals } from './collections/Deals'
import { Activities } from './collections/Activities'
import { Media } from './collections/Media'
import { Tags } from './collections/Tags'
import { Amenities } from './collections/Amenities'

// Globals
import { Settings } from './globals/Settings'
import { LGPDSettings } from './globals/LGPDSettings'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  admin: {
    bundler: webpackBundler(),
    user: Users.slug,
    meta: {
      titleSuffix: '- PrimeUrban Admin',
      favicon: '/favicon.ico',
      ogImage: '/og-admin.png',
    },
    components: {
      graphics: {
        Logo: './components/Logo',
        Icon: './components/Icon',
      },
      views: {
        Dashboard: './components/Dashboard',
      },
    },
  },

  editor: lexicalEditor({}),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    migrationDir: path.resolve(__dirname, './migrations'),
  }),

  collections: [
    Users,
    Properties,
    Neighborhoods,
    Leads,
    Deals,
    Activities,
    Media,
    Tags,
    Amenities,
  ],

  globals: [
    Settings,
    LGPDSettings,
  ],

  plugins: [
    cloudStorage({
      collections: {
        media: {
          adapter: cloudinaryAdapter({
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
            folder: 'primeUrban',
          }),
        },
      },
    }),
    seoPlugin({
      collections: ['properties', 'neighborhoods'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title} | PrimeUrban Imobiliária`,
      generateDescription: ({ doc }) => doc?.shortDescription || doc?.meta?.description,
    }),
  ],

  typescript: {
    outputFile: path.resolve(__dirname, '../payload-types.ts'),
  },

  graphQL: {
    schemaOutputFile: path.resolve(__dirname, '../generated-schema.graphql'),
  },

  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),

  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),
})
```

### 2.2 Local API Client (lib/payload.ts)

```typescript
import { getPayload } from 'payload'
import config from '@/payload/payload.config'

let cachedPayload: any = null

export const getPayloadClient = async () => {
  if (cachedPayload) return cachedPayload

  cachedPayload = await getPayload({ config })
  return cachedPayload
}
```

---

## 3. Collections Detalhadas

### 3.1 Users (Autenticação Nativa)

```typescript
// payload/collections/Users.ts
import type { CollectionConfig } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 horas
    verify: false, // Sem verificação de e-mail no MVP
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutos
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'active'],
    group: 'Configurações',
  },
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: () => true,
    update: ({ req, id }) => {
      if (req.user?.role === 'admin') return true
      return req.user?.id === id // Usuário pode editar próprio perfil
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome Completo',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'agent',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Corretor', value: 'agent' },
        { label: 'Assistente', value: 'assistant' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefone',
      admin: {
        placeholder: '(11) 99999-9999',
      },
    },
    {
      name: 'creci',
      type: 'text',
      label: 'CRECI',
      admin: {
        condition: (data) => data.role === 'agent',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biografia',
      maxLength: 300,
      admin: {
        description: 'Exibida na página de detalhes do imóvel',
        condition: (data) => data.role === 'agent',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto de Perfil',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'commissionRate',
      type: 'number',
      label: 'Taxa de Comissão (%)',
      defaultValue: 6,
      min: 0,
      max: 100,
      admin: {
        description: 'Percentual padrão para este corretor',
        condition: (data) => data.role === 'agent',
        step: 0.5,
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Ativo',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Desative para remover do round-robin',
      },
    },
  ],
}
```

### 3.2 Properties (Imóveis)

```typescript
// payload/collections/Properties.ts
import type { CollectionConfig } from 'payload/types'
import { autoSlug } from '../hooks/beforeChange/autoSlug'
import { autoCode } from '../hooks/beforeChange/autoCode'
import { revalidateProperty } from '../hooks/afterChange/revalidateISR'
import { notifyInterestedLeads } from '../hooks/afterChange/notifyLeads'
import { isAdmin, isAgent } from '../access'

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['code', 'title', 'type', 'category', 'price', 'status', 'agent'],
    group: 'Imobiliário',
    listSearchableFields: ['title', 'code', 'address.neighborhood.name'],
    components: {
      views: {
        Edit: {
          Default: {
            actions: ['./components/PropertyPreview'],
          },
        },
      },
    },
  },
  access: {
    create: isAgent,
    read: () => true, // Público pode ler via API
    update: isAgent,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      autoSlug('title'),
      autoCode('PRM'),
    ],
    afterChange: [
      revalidateProperty,
      notifyInterestedLeads,
    ],
  },
  fields: [
    // ===== IDENTIFICAÇÃO =====
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
                  name: 'title',
                  type: 'text',
                  required: true,
                  label: 'Título do Anúncio',
                  admin: {
                    placeholder: 'Ex: Apartamento 3 quartos no Centro',
                  },
                },
                {
                  name: 'code',
                  type: 'text',
                  required: true,
                  unique: true,
                  label: 'Código',
                  admin: {
                    readOnly: true,
                    description: 'Gerado automaticamente (PRM-001, PRM-002...)',
                  },
                },
              ],
            },
            {
              name: 'slug',
              type: 'text',
              unique: true,
              label: 'URL Slug',
              admin: {
                readOnly: true,
                description: 'Gerado automaticamente a partir do título',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'radio',
                  required: true,
                  defaultValue: 'sale',
                  options: [
                    { label: 'Venda', value: 'sale' },
                    { label: 'Locação', value: 'rent' },
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
                  admin: {
                    position: 'sidebar',
                  },
                },
              ],
            },

            // ===== PREÇO =====
            {
              type: 'collapsible',
              label: 'Valores',
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'price',
                      type: 'number',
                      required: true,
                      label: 'Preço (R$)',
                      min: 0,
                      admin: {
                        step: 1000,
                        placeholder: '850000',
                      },
                    },
                    {
                      name: 'condominiumFee',
                      type: 'number',
                      label: 'Condomínio (R$/mês)',
                      min: 0,
                      admin: {
                        step: 10,
                        condition: (data, siblingData) =>
                          ['apartment', 'penthouse', 'commercial'].includes(siblingData.category),
                      },
                    },
                    {
                      name: 'iptu',
                      type: 'number',
                      label: 'IPTU (R$/ano)',
                      min: 0,
                      admin: {
                        step: 100,
                      },
                    },
                  ],
                },
              ],
            },

            // ===== CARACTERÍSTICAS PRINCIPAIS =====
            {
              type: 'collapsible',
              label: 'Características',
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'bedrooms',
                      type: 'number',
                      required: true,
                      label: 'Quartos',
                      min: 0,
                      max: 20,
                    },
                    {
                      name: 'suites',
                      type: 'number',
                      label: 'Suítes',
                      min: 0,
                      admin: {
                        description: 'Incluído no total de quartos',
                      },
                    },
                    {
                      name: 'bathrooms',
                      type: 'number',
                      required: true,
                      label: 'Banheiros',
                      min: 1,
                      max: 20,
                    },
                    {
                      name: 'parkingSpots',
                      type: 'number',
                      required: true,
                      label: 'Vagas de Garagem',
                      min: 0,
                      max: 20,
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
                      label: 'Área Total (m²)',
                      min: 1,
                      admin: {
                        step: 0.01,
                      },
                    },
                    {
                      name: 'privateArea',
                      type: 'number',
                      label: 'Área Privativa (m²)',
                      min: 0,
                      admin: {
                        description: 'Sem áreas comuns',
                        condition: (data, siblingData) =>
                          ['apartment', 'penthouse'].includes(siblingData.category),
                      },
                    },
                    {
                      name: 'builtArea',
                      type: 'number',
                      label: 'Área Construída (m²)',
                      admin: {
                        condition: (data, siblingData) =>
                          siblingData.category === 'house',
                      },
                    },
                    {
                      name: 'usableArea',
                      type: 'number',
                      label: 'Área Útil (m²)',
                      admin: {
                        condition: (data, siblingData) =>
                          ['apartment', 'penthouse'].includes(siblingData.category),
                      },
                    },
                  ],
                },
              ],
            },

            // ===== CARACTERÍSTICAS DETALHADAS =====
            {
              type: 'collapsible',
              label: 'Detalhes Adicionais',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'floor',
                      type: 'number',
                      label: 'Andar',
                      admin: {
                        condition: (data, siblingData) =>
                          ['apartment', 'penthouse', 'commercial'].includes(siblingData.category),
                      },
                    },
                    {
                      name: 'totalFloors',
                      type: 'number',
                      label: 'Total de Andares do Prédio',
                      admin: {
                        condition: (data, siblingData) =>
                          ['apartment', 'penthouse', 'commercial'].includes(siblingData.category),
                      },
                    },
                    {
                      name: 'constructionYear',
                      type: 'number',
                      label: 'Ano de Construção',
                      min: 1900,
                      max: new Date().getFullYear() + 2,
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'propertyAge',
                      type: 'select',
                      label: 'Estado do Imóvel',
                      options: [
                        { label: 'Novo/Na Planta', value: 'new' },
                        { label: 'Em Construção', value: 'under_construction' },
                        { label: 'Usado', value: 'used' },
                        { label: 'Reformado', value: 'renovated' },
                      ],
                    },
                    {
                      name: 'facing',
                      type: 'select',
                      label: 'Posição Solar',
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
                      label: 'Posição no Lote/Prédio',
                      options: [
                        { label: 'Frente', value: 'front' },
                        { label: 'Fundos', value: 'back' },
                        { label: 'Lateral', value: 'side' },
                      ],
                    },
                  ],
                },
              ],
            },

            // ===== DESCRIÇÕES =====
            {
              name: 'shortDescription',
              type: 'textarea',
              required: true,
              label: 'Descrição Curta',
              maxLength: 160,
              admin: {
                description: 'Usado em cards e como fallback de meta description',
              },
            },
            {
              name: 'fullDescription',
              type: 'richText',
              required: true,
              label: 'Descrição Completa',
              admin: {
                description: 'Rich text com formatação',
              },
            },
          ],
        },

        // ===== ABA LOCALIZAÇÃO =====
        {
          label: 'Localização',
          fields: [
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'street',
                      type: 'text',
                      required: true,
                      label: 'Rua/Avenida',
                    },
                    {
                      name: 'number',
                      type: 'text',
                      required: true,
                      label: 'Número',
                      admin: {
                        width: '20%',
                      },
                    },
                  ],
                },
                {
                  name: 'complement',
                  type: 'text',
                  label: 'Complemento',
                  admin: {
                    placeholder: 'Apto 101, Bloco A, etc.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'neighborhood',
                      type: 'relationship',
                      relationTo: 'neighborhoods',
                      required: true,
                      label: 'Bairro',
                      hasMany: false,
                    },
                    {
                      name: 'city',
                      type: 'text',
                      required: true,
                      label: 'Cidade',
                      defaultValue: 'São Paulo',
                    },
                    {
                      name: 'state',
                      type: 'text',
                      required: true,
                      label: 'Estado',
                      defaultValue: 'SP',
                      admin: {
                        width: '20%',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'zipCode',
                      type: 'text',
                      required: true,
                      label: 'CEP',
                      admin: {
                        placeholder: '01234-567',
                      },
                    },
                    {
                      name: 'latitude',
                      type: 'number',
                      label: 'Latitude',
                      admin: {
                        description: 'Para mapa (opcional)',
                        step: 0.000001,
                      },
                    },
                    {
                      name: 'longitude',
                      type: 'number',
                      label: 'Longitude',
                      admin: {
                        description: 'Para mapa (opcional)',
                        step: 0.000001,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ===== ABA MÍDIA =====
        {
          label: 'Mídia',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Imagem Destaque',
              admin: {
                description: 'Foto principal exibida no card',
              },
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Galeria de Fotos',
              minRows: 3,
              maxRows: 30,
              admin: {
                description: 'Até 30 fotos. Arraste para reordenar.',
              },
            },
            {
              name: 'videoUrl',
              type: 'text',
              label: 'URL do Vídeo Tour',
              admin: {
                placeholder: 'https://www.youtube.com/watch?v=...',
                description: 'YouTube ou Vimeo',
              },
            },
          ],
        },

        // ===== ABA COMODIDADES =====
        {
          label: 'Comodidades',
          fields: [
            {
              name: 'amenities',
              type: 'relationship',
              relationTo: 'amenities',
              hasMany: true,
              label: 'Comodidades do Imóvel',
              filterOptions: {
                category: { equals: 'property' },
              },
            },
            {
              name: 'buildingFeatures',
              type: 'relationship',
              relationTo: 'amenities',
              hasMany: true,
              label: 'Características do Condomínio',
              filterOptions: {
                category: { equals: 'building' },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'flooring',
                  type: 'select',
                  label: 'Tipo de Piso',
                  options: [
                    { label: 'Cerâmica', value: 'ceramic' },
                    { label: 'Porcelanato', value: 'porcelain' },
                    { label: 'Laminado', value: 'laminate' },
                    { label: 'Madeira', value: 'hardwood' },
                    { label: 'Vinílico', value: 'vinyl' },
                    { label: 'Outro', value: 'other' },
                  ],
                },
                {
                  name: 'windowType',
                  type: 'select',
                  label: 'Tipo de Janela',
                  options: [
                    { label: 'Alumínio', value: 'aluminum' },
                    { label: 'PVC', value: 'pvc' },
                    { label: 'Madeira', value: 'wood' },
                    { label: 'Ferro', value: 'iron' },
                  ],
                },
              ],
            },
          ],
        },

        // ===== ABA DESTAQUES =====
        {
          label: 'Destaques & Tags',
          fields: [
            {
              name: 'featured',
              type: 'checkbox',
              label: 'Imóvel em Destaque',
              defaultValue: false,
              admin: {
                description: 'Exibir na homepage',
              },
            },
            {
              name: 'highlightText',
              type: 'text',
              label: 'Texto de Destaque',
              admin: {
                placeholder: 'Ex: Últimas unidades, Aceita permuta',
                condition: (data) => data.featured === true,
              },
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              label: 'Tags',
              admin: {
                description: 'Ex: Novo, Oportunidade, Exclusivo',
              },
            },
          ],
        },
      ],
    },

    // ===== SIDEBAR =====
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Corretor Responsável',
      filterOptions: {
        role: { equals: 'agent' },
        active: { equals: true },
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      label: 'Visualizações',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Incrementado via API',
      },
    },
    {
      name: 'contactCount',
      type: 'number',
      defaultValue: 0,
      label: 'Contatos Recebidos',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Leads gerados por este imóvel',
      },
    },

    // ===== BUSCA (campo virtual) =====
    {
      name: '_searchIndex',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data, siblingData }) => {
            // Concatena campos para busca full-text
            const neighborhood = siblingData?.address?.neighborhood?.name || ''
            return `${siblingData.title} ${siblingData.code} ${siblingData.shortDescription} ${neighborhood}`.toLowerCase()
          },
        ],
      },
    },
  ],

  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
}
```

### 3.3 Neighborhoods (Bairros)

```typescript
// payload/collections/Neighborhoods.ts
import type { CollectionConfig } from 'payload/types'
import { autoSlug } from '../hooks/beforeChange/autoSlug'
import { isAdmin } from '../access'

export const Neighborhoods: CollectionConfig = {
  slug: 'neighborhoods',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'propertyCount', 'averagePrice', 'active'],
    group: 'Imobiliário',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [autoSlug('name')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Nome do Bairro',
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
      type: 'row',
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
          defaultValue: 'São Paulo',
          label: 'Cidade',
        },
        {
          name: 'state',
          type: 'text',
          required: true,
          defaultValue: 'SP',
          label: 'Estado',
          admin: {
            width: '30%',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Descrição do Bairro',
      admin: {
        description: 'Informações sobre infraestrutura, comércio, transporte',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem Destaque',
    },
    {
      name: 'propertyCount',
      type: 'number',
      defaultValue: 0,
      label: 'Total de Imóveis Ativos',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Calculado automaticamente',
      },
    },
    {
      name: 'averagePrice',
      type: 'number',
      label: 'Preço Médio (R$)',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Calculado automaticamente',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Ativo',
      admin: {
        position: 'sidebar',
        description: 'Exibir nos filtros do site',
      },
    },
  ],
}
```

### 3.4 Leads (CRM)

```typescript
// payload/collections/Leads.ts
import type { CollectionConfig } from 'payload/types'
import { distributeLead } from '../hooks/afterCreate/distributeLead'
import { updateLeadScore } from '../hooks/afterChange/updateScore'
import { isAdmin, isOwnerOrAdmin } from '../access'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'source', 'status', 'priority', 'assignedTo', 'score'],
    group: 'CRM',
    listSearchableFields: ['name', 'email', 'phone'],
    components: {
      views: {
        List: './components/LeadKanban', // Substitui lista por Kanban
      },
    },
  },
  access: {
    create: () => true, // Público pode criar (formulário do site)
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user?.role === 'agent') {
        return {
          assignedTo: { equals: req.user.id },
        }
      }
      return false
    },
    update: isOwnerOrAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterCreate: [distributeLead],
    afterChange: [updateLeadScore],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dados Pessoais',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  label: 'Nome Completo',
                },
                {
                  name: 'phone',
                  type: 'text',
                  required: true,
                  label: 'Telefone',
                  admin: {
                    placeholder: '(11) 99999-9999',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  label: 'E-mail',
                },
                {
                  name: 'whatsapp',
                  type: 'text',
                  label: 'WhatsApp',
                  admin: {
                    description: 'Se diferente do telefone',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Origem & Interesse',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'source',
                  type: 'select',
                  required: true,
                  defaultValue: 'website',
                  label: 'Fonte',
                  options: [
                    { label: 'Site', value: 'website' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'Google Ads', value: 'google_ads' },
                    { label: 'Indicação', value: 'indication' },
                    { label: 'Portal (ZAP, Viva Real)', value: 'portal' },
                    { label: 'Outro', value: 'other' },
                  ],
                },
                {
                  name: 'interestType',
                  type: 'select',
                  required: true,
                  defaultValue: 'buy',
                  label: 'Tipo de Interesse',
                  options: [
                    { label: 'Comprar', value: 'buy' },
                    { label: 'Alugar', value: 'rent' },
                    { label: 'Vender', value: 'sell' },
                    { label: 'Investir', value: 'invest' },
                  ],
                },
              ],
            },
            {
              name: 'sourceDetails',
              type: 'textarea',
              label: 'Detalhes da Origem',
              admin: {
                description: 'URL da página, nome da campanha, UTM params',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'utmSource',
                  type: 'text',
                  label: 'UTM Source',
                },
                {
                  name: 'utmMedium',
                  type: 'text',
                  label: 'UTM Medium',
                },
                {
                  name: 'utmCampaign',
                  type: 'text',
                  label: 'UTM Campaign',
                },
              ],
            },
            {
              name: 'budget',
              type: 'group',
              label: 'Orçamento',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'min',
                      type: 'number',
                      label: 'Mínimo (R$)',
                      admin: {
                        step: 10000,
                      },
                    },
                    {
                      name: 'max',
                      type: 'number',
                      label: 'Máximo (R$)',
                      admin: {
                        step: 10000,
                      },
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
              label: 'Bairros de Interesse',
            },
            {
              name: 'preferredCategories',
              type: 'select',
              hasMany: true,
              label: 'Tipos de Imóvel de Interesse',
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
          label: 'Imóveis',
          fields: [
            {
              name: 'viewedProperties',
              type: 'relationship',
              relationTo: 'properties',
              hasMany: true,
              label: 'Imóveis Visualizados',
              admin: {
                description: 'Rastreados automaticamente',
                readOnly: true,
              },
            },
            {
              name: 'favoriteProperties',
              type: 'relationship',
              relationTo: 'properties',
              hasMany: true,
              label: 'Imóveis Favoritos',
              admin: {
                description: 'Marcados explicitamente pelo lead',
              },
            },
          ],
        },
        {
          label: 'LGPD',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'lgpdConsent',
                  type: 'checkbox',
                  required: true,
                  defaultValue: false,
                  label: 'Consentimento LGPD',
                  admin: {
                    description: 'Aceite dos termos de privacidade',
                  },
                },
                {
                  name: 'consentDate',
                  type: 'date',
                  label: 'Data do Consentimento',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
                {
                  name: 'consentIP',
                  type: 'text',
                  label: 'IP do Consentimento',
                  admin: {
                    readOnly: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // ===== SIDEBAR =====
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: '🆕 Novo', value: 'new' },
        { label: '📞 Contactado', value: 'contacted' },
        { label: '✅ Qualificado', value: 'qualified' },
        { label: '📅 Visita Agendada', value: 'visit_scheduled' },
        { label: '📄 Proposta Enviada', value: 'proposal_sent' },
        { label: '💬 Negociação', value: 'negotiation' },
        { label: '🎉 Fechado - Ganho', value: 'closed_won' },
        { label: '❌ Fechado - Perdido', value: 'closed_lost' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: '🔥 Hot', value: 'hot' },
        { label: '⚠️ Alta', value: 'high' },
        { label: '➡️ Média', value: 'medium' },
        { label: '⬇️ Baixa', value: 'low' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lostReason',
      type: 'select',
      label: 'Motivo da Perda',
      options: [
        { label: 'Preço', value: 'price' },
        { label: 'Localização', value: 'location' },
        { label: 'Timing', value: 'timing' },
        { label: 'Comprou com Concorrente', value: 'competitor' },
        { label: 'Não Respondeu', value: 'no_response' },
        { label: 'Outro', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'closed_lost',
      },
    },
    {
      name: 'lostReasonDetails',
      type: 'textarea',
      label: 'Detalhes da Perda',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'closed_lost',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      label: 'Corretor Responsável',
      filterOptions: {
        role: { equals: 'agent' },
        active: { equals: true },
      },
      admin: {
        position: 'sidebar',
        description: 'Auto-atribuído via round-robin',
      },
    },
    {
      name: 'score',
      type: 'number',
      defaultValue: 0,
      label: 'Score (0-100)',
      min: 0,
      max: 100,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculado automaticamente',
      },
    },
    {
      name: 'lastContactAt',
      type: 'date',
      label: 'Último Contato',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
```

### 3.5 Deals (Oportunidades)

```typescript
// payload/collections/Deals.ts
import type { CollectionConfig } from 'payload/types'
import { isAdmin, isOwnerOrAdmin } from '../access'

export const Deals: CollectionConfig = {
  slug: 'deals',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['lead', 'property', 'stage', 'askingPrice', 'finalPrice', 'agent'],
    group: 'CRM',
  },
  access: {
    create: ({ req }) => req.user?.role !== 'assistant',
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user?.role === 'agent') {
        return { agent: { equals: req.user.id } }
      }
      return false
    },
    update: isOwnerOrAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'lead',
          type: 'relationship',
          relationTo: 'leads',
          required: true,
          label: 'Lead',
        },
        {
          name: 'property',
          type: 'relationship',
          relationTo: 'properties',
          required: true,
          label: 'Imóvel',
        },
        {
          name: 'type',
          type: 'radio',
          required: true,
          options: [
            { label: 'Venda', value: 'sale' },
            { label: 'Locação', value: 'rent' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Valores',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'askingPrice',
              type: 'number',
              required: true,
              label: 'Preço Pedido (R$)',
              admin: {
                step: 1000,
              },
            },
            {
              name: 'offerPrice',
              type: 'number',
              label: 'Proposta do Cliente (R$)',
              admin: {
                step: 1000,
              },
            },
            {
              name: 'finalPrice',
              type: 'number',
              label: 'Preço Final (R$)',
              admin: {
                step: 1000,
                condition: (data) => ['closed_won'].includes(data.stage),
              },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Comissão',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'commissionRate',
              type: 'number',
              label: 'Taxa (%)',
              defaultValue: 6,
              min: 0,
              max: 100,
              admin: {
                step: 0.5,
              },
            },
            {
              name: 'commissionValue',
              type: 'number',
              label: 'Valor da Comissão (R$)',
              admin: {
                readOnly: true,
                description: 'Calculado: finalPrice × commissionRate',
              },
              hooks: {
                beforeChange: [
                  ({ data, siblingData }) => {
                    if (siblingData.finalPrice && siblingData.commissionRate) {
                      return (siblingData.finalPrice * siblingData.commissionRate) / 100
                    }
                    return 0
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      name: 'stage',
      type: 'select',
      required: true,
      defaultValue: 'interest',
      options: [
        { label: 'Interesse', value: 'interest' },
        { label: 'Visita Realizada', value: 'visit' },
        { label: 'Proposta Enviada', value: 'proposal' },
        { label: 'Negociação', value: 'negotiation' },
        { label: 'Documentação', value: 'documentation' },
        { label: 'Fechado - Ganho', value: 'closed_won' },
        { label: 'Fechado - Perdido', value: 'closed_lost' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'probability',
      type: 'number',
      label: 'Probabilidade de Fechar (%)',
      min: 0,
      max: 100,
      admin: {
        position: 'sidebar',
        step: 5,
      },
    },
    {
      name: 'expectedCloseDate',
      type: 'date',
      label: 'Data Prevista de Fechamento',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'closedAt',
      type: 'date',
      label: 'Data de Fechamento',
      admin: {
        position: 'sidebar',
        condition: (data) => ['closed_won', 'closed_lost'].includes(data.stage),
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Corretor Responsável',
      filterOptions: {
        role: { equals: 'agent' },
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Observações',
    },
  ],
}
```

### 3.6 Activities (Atividades)

```typescript
// payload/collections/Activities.ts
import type { CollectionConfig } from 'payload/types'
import { updateLeadLastContact } from '../hooks/afterCreate/updateLeadLastContact'

export const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['type', 'lead', 'description', 'scheduledAt', 'completedAt', 'createdBy'],
    group: 'CRM',
  },
  hooks: {
    afterCreate: [updateLeadLastContact],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'lead',
          type: 'relationship',
          relationTo: 'leads',
          required: true,
          label: 'Lead',
        },
        {
          name: 'deal',
          type: 'relationship',
          relationTo: 'deals',
          label: 'Oportunidade',
          admin: {
            description: 'Opcional - vincular a uma oportunidade específica',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'note',
          options: [
            { label: '📞 Ligação', value: 'call' },
            { label: '💬 WhatsApp', value: 'whatsapp' },
            { label: '✉️ E-mail', value: 'email' },
            { label: '🏠 Visita', value: 'visit' },
            { label: '📝 Nota', value: 'note' },
            { label: '✅ Tarefa', value: 'task' },
            { label: '📄 Proposta', value: 'proposal' },
            { label: '🤖 Sistema', value: 'system' },
          ],
        },
        {
          name: 'result',
          type: 'select',
          label: 'Resultado',
          options: [
            { label: '✅ Sucesso', value: 'success' },
            { label: '📵 Não Atendeu', value: 'no_answer' },
            { label: '🔙 Retornar Ligação', value: 'callback' },
            { label: '❌ Não Interessado', value: 'not_interested' },
            { label: '📅 Reagendado', value: 'rescheduled' },
            { label: '🤷 Outro', value: 'other' },
          ],
          admin: {
            condition: (data) => ['call', 'whatsapp', 'email', 'visit'].includes(data.type),
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Descrição',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'scheduledAt',
          type: 'date',
          label: 'Data Agendada',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            description: 'Para tarefas e visitas futuras',
          },
        },
        {
          name: 'dueAt',
          type: 'date',
          label: 'Data de Vencimento',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            condition: (data) => data.type === 'task',
          },
        },
        {
          name: 'completedAt',
          type: 'date',
          label: 'Concluído em',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'isOverdue',
      type: 'checkbox',
      label: 'Atrasada',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Calculado automaticamente',
      },
      hooks: {
        beforeChange: [
          ({ data, siblingData }) => {
            if (siblingData.type === 'task' && siblingData.dueAt && !siblingData.completedAt) {
              return new Date(siblingData.dueAt) < new Date()
            }
            return false
          },
        ],
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Criado por',
      admin: {
        position: 'sidebar',
      },
      defaultValue: ({ user }) => user?.id,
    },
  ],
}
```

### 3.7 Media

```typescript
// payload/collections/Media.ts
import type { CollectionConfig } from 'payload/types'

export const Media: CollectionConfig = {
  slug: 'media',
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
  admin: {
    group: 'Mídia',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Texto Alternativo (ALT)',
      admin: {
        description: 'Importante para SEO e acessibilidade',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Legenda',
    },
    {
      name: 'folder',
      type: 'text',
      label: 'Pasta de Organização',
      admin: {
        description: 'Ex: properties/PRM-001, neighborhoods',
        position: 'sidebar',
      },
    },
  ],
}
```

### 3.8 Tags

```typescript
// payload/collections/Tags.ts
import type { CollectionConfig } from 'payload/types'
import { autoSlug } from '../hooks/beforeChange/autoSlug'
import { isAdmin } from '../access'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'color', 'active'],
    group: 'Configurações',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
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
```

### 3.9 Amenities (Comodidades)

```typescript
// payload/collections/Amenities.ts
import type { CollectionConfig } from 'payload/types'
import { autoSlug } from '../hooks/beforeChange/autoSlug'
import { isAdmin } from '../access'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'icon', 'category', 'active'],
    group: 'Configurações',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
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
```

---

## 4. Hooks e Automações

### 4.1 beforeChange Hooks

#### autoSlug.ts

```typescript
// payload/hooks/beforeChange/autoSlug.ts
import slugify from 'slugify'

export const autoSlug = (fieldToSlugify: string) => {
  return ({ data, operation }) => {
    if (operation === 'create' || !data.slug) {
      const valueToSlugify = data[fieldToSlugify]
      if (valueToSlugify) {
        data.slug = slugify(valueToSlugify, {
          lower: true,
          strict: true,
          locale: 'pt',
        })
      }
    }
    return data
  }
}
```

#### autoCode.ts

```typescript
// payload/hooks/beforeChange/autoCode.ts
export const autoCode = (prefix: string) => {
  return async ({ data, operation, req }) => {
    if (operation === 'create' && !data.code) {
      // Buscar último código do tipo
      const lastDoc = await req.payload.find({
        collection: req.collection.slug,
        sort: '-createdAt',
        limit: 1,
        where: {
          code: {
            like: `${prefix}-%`,
          },
        },
      })

      let nextNumber = 1
      if (lastDoc.docs.length > 0) {
        const lastCode = lastDoc.docs[0].code
        const lastNumber = parseInt(lastCode.split('-')[1])
        nextNumber = lastNumber + 1
      }

      data.code = `${prefix}-${String(nextNumber).padStart(3, '0')}`
    }
    return data
  }
}
```

### 4.2 afterChange Hooks

#### revalidateISR.ts

```typescript
// payload/hooks/afterChange/revalidateISR.ts
export const revalidateProperty = async ({ doc, req, operation, previousDoc }) => {
  if (operation === 'update') {
    const statusChanged = previousDoc.status !== doc.status
    const published = doc.status === 'published'

    if (statusChanged && published) {
      // Revalidar página do imóvel
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate?path=/imovel/${doc.slug}&secret=${process.env.REVALIDATE_SECRET}`)

        // Revalidar listagem
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate?path=/imoveis&secret=${process.env.REVALIDATE_SECRET}`)

        // Revalidar homepage
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/revalidate?path=/&secret=${process.env.REVALIDATE_SECRET}`)
      } catch (error) {
        req.payload.logger.error(`Erro ao revalidar ISR: ${error}`)
      }
    }
  }
}
```

#### notifyLeads.ts

```typescript
// payload/hooks/afterChange/notifyLeads.ts
import { sendEmail } from '@/lib/resend'

export const notifyInterestedLeads = async ({ doc, req, operation, previousDoc }) => {
  if (operation === 'update') {
    const wasPublished = previousDoc.status !== 'published' && doc.status === 'published'

    if (wasPublished) {
      // Buscar leads interessados no bairro e faixa de preço
      const leads = await req.payload.find({
        collection: 'leads',
        where: {
          and: [
            {
              'preferredNeighborhoods': {
                equals: doc.address.neighborhood,
              },
            },
            {
              'budget.min': {
                less_than_equal: doc.price,
              },
            },
            {
              'budget.max': {
                greater_than_equal: doc.price,
              },
            },
            {
              status: {
                not_in: ['closed_won', 'closed_lost'],
              },
            },
          ],
        },
      })

      // Enviar e-mail para cada lead
      for (const lead of leads.docs) {
        if (lead.email) {
          await sendEmail({
            to: lead.email,
            subject: 'Novo imóvel que pode te interessar - PrimeUrban',
            template: 'new-property',
            data: {
              leadName: lead.name,
              propertyTitle: doc.title,
              propertyPrice: doc.price,
              propertyUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/imovel/${doc.slug}`,
            },
          })

          // Registrar atividade
          await req.payload.create({
            collection: 'activities',
            data: {
              lead: lead.id,
              type: 'system',
              description: `Sistema enviou e-mail sobre novo imóvel: ${doc.title}`,
              createdBy: req.user.id,
            },
          })
        }
      }
    }
  }
}
```

#### updateScore.ts

```typescript
// payload/hooks/afterChange/updateScore.ts
export const updateLeadScore = async ({ doc, req, operation }) => {
  let score = 0

  // Base: número de imóveis visualizados
  score += (doc.viewedProperties?.length || 0) * 10

  // Formulário preenchido
  if (doc.source === 'website' && doc.email) {
    score += 30
  }

  // WhatsApp clicado
  if (doc.source === 'whatsapp') {
    score += 20
  }

  // Visita agendada
  const activities = await req.payload.find({
    collection: 'activities',
    where: {
      and: [
        { lead: { equals: doc.id } },
        { type: { equals: 'visit' } },
      ],
    },
  })
  if (activities.totalDocs > 0) {
    score += 40
  }

  // Proposta recebida
  if (doc.status === 'proposal_sent') {
    score += 50
  }

  // Penalizar inatividade
  if (doc.lastContactAt) {
    const daysSinceContact = Math.floor(
      (new Date().getTime() - new Date(doc.lastContactAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceContact > 30) {
      score -= 50
    } else if (daysSinceContact > 7) {
      score -= 20
    }
  }

  // Limitar entre 0-100
  score = Math.max(0, Math.min(100, score))

  // Atualizar se mudou
  if (doc.score !== score) {
    await req.payload.update({
      collection: 'leads',
      id: doc.id,
      data: { score },
    })
  }
}
```

### 4.3 afterCreate Hooks

#### distributeLead.ts

```typescript
// payload/hooks/afterCreate/distributeLead.ts
import { sendEmail } from '@/lib/resend'

export const distributeLead = async ({ doc, req }) => {
  // Buscar corretores ativos
  const agents = await req.payload.find({
    collection: 'users',
    where: {
      and: [
        { role: { equals: 'agent' } },
        { active: { equals: true } },
      ],
    },
  })

  if (agents.docs.length === 0) {
    req.payload.logger.warn('Nenhum corretor ativo para distribuir lead')
    return
  }

  // Round-robin: buscar último lead criado e pegar próximo corretor
  const lastLead = await req.payload.find({
    collection: 'leads',
    sort: '-createdAt',
    limit: 1,
    where: {
      assignedTo: {
        exists: true,
      },
    },
  })

  let assignedAgent
  if (lastLead.docs.length === 0) {
    // Primeiro lead, atribuir ao primeiro corretor
    assignedAgent = agents.docs[0]
  } else {
    const lastAssignedAgentId = lastLead.docs[0].assignedTo
    const currentIndex = agents.docs.findIndex(a => a.id === lastAssignedAgentId)
    const nextIndex = (currentIndex + 1) % agents.docs.length
    assignedAgent = agents.docs[nextIndex]
  }

  // Atualizar lead
  await req.payload.update({
    collection: 'leads',
    id: doc.id,
    data: {
      assignedTo: assignedAgent.id,
    },
  })

  // Enviar e-mail de notificação ao corretor
  if (assignedAgent.email) {
    await sendEmail({
      to: assignedAgent.email,
      subject: `Novo lead atribuído: ${doc.name}`,
      template: 'new-lead-assigned',
      data: {
        agentName: assignedAgent.name,
        leadName: doc.name,
        leadPhone: doc.phone,
        leadEmail: doc.email,
        leadSource: doc.source,
        leadInterest: doc.interestType,
        leadUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/collections/leads/${doc.id}`,
      },
    })
  }
}
```

#### updateLeadLastContact.ts

```typescript
// payload/hooks/afterCreate/updateLeadLastContact.ts
export const updateLeadLastContact = async ({ doc, req }) => {
  // Atualizar lastContactAt do lead ao registrar atividade
  if (doc.lead && doc.type !== 'system') {
    await req.payload.update({
      collection: 'leads',
      id: doc.lead,
      data: {
        lastContactAt: new Date(),
      },
    })
  }
}
```

---

## 5. Access Control

### 5.1 access/isAdmin.ts

```typescript
// payload/access/isAdmin.ts
import type { Access } from 'payload/types'

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}
```

### 5.2 access/isAgent.ts

```typescript
// payload/access/isAgent.ts
import type { Access } from 'payload/types'

export const isAgent: Access = ({ req: { user } }) => {
  return ['admin', 'agent'].includes(user?.role)
}
```

### 5.3 access/isOwnerOrAdmin.ts

```typescript
// payload/access/isOwnerOrAdmin.ts
import type { Access } from 'payload/types'

export const isOwnerOrAdmin: Access = ({ req: { user }, id }) => {
  if (user?.role === 'admin') return true

  // Permitir se o usuário for o dono do recurso
  // (para collections com campo assignedTo ou createdBy)
  return {
    or: [
      {
        assignedTo: {
          equals: user?.id,
        },
      },
      {
        createdBy: {
          equals: user?.id,
        },
      },
      {
        agent: {
          equals: user?.id,
        },
      },
    ],
  }
}
```

---

## 6. Globals (Configurações Globais)

### 6.1 Settings.ts

```typescript
// payload/globals/Settings.ts
import type { GlobalConfig } from 'payload/types'
import { isAdmin } from '../access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Configurações',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informações da Empresa',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              required: true,
              defaultValue: 'PrimeUrban Imobiliária',
              label: 'Nome da Empresa',
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
              label: 'Telefone Principal',
              admin: {
                placeholder: '(11) 3333-3333',
              },
            },
            {
              name: 'whatsapp',
              type: 'text',
              required: true,
              label: 'WhatsApp',
              admin: {
                placeholder: '5511999999999',
                description: 'Formato: código país + DDD + número (sem espaços ou caracteres)',
              },
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              label: 'E-mail de Contato',
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Endereço Completo',
            },
            {
              name: 'creci',
              type: 'text',
              label: 'CRECI da Empresa',
            },
          ],
        },
        {
          label: 'Redes Sociais',
          fields: [
            {
              name: 'social',
              type: 'group',
              fields: [
                {
                  name: 'facebook',
                  type: 'text',
                  label: 'Facebook',
                  admin: {
                    placeholder: 'https://facebook.com/primeUrban',
                  },
                },
                {
                  name: 'instagram',
                  type: 'text',
                  label: 'Instagram',
                  admin: {
                    placeholder: 'https://instagram.com/primeUrban',
                  },
                },
                {
                  name: 'youtube',
                  type: 'text',
                  label: 'YouTube',
                  admin: {
                    placeholder: 'https://youtube.com/@primeUrban',
                  },
                },
                {
                  name: 'linkedin',
                  type: 'text',
                  label: 'LinkedIn',
                  admin: {
                    placeholder: 'https://linkedin.com/company/primeUrban',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO Global',
          fields: [
            {
              name: 'seoTitle',
              type: 'text',
              label: 'Título Padrão do Site',
              defaultValue: 'PrimeUrban Imobiliária - Imóveis em São Paulo',
            },
            {
              name: 'seoDescription',
              type: 'textarea',
              maxLength: 160,
              label: 'Descrição Padrão',
              defaultValue: 'Encontre o imóvel dos seus sonhos com a PrimeUrban. Apartamentos, casas e coberturas nos melhores bairros de São Paulo.',
            },
            {
              name: 'seoImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagem OG Padrão',
            },
          ],
        },
        {
          label: 'Integrações',
          fields: [
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: 'Google Analytics GA4 ID',
              admin: {
                placeholder: 'G-XXXXXXXXXX',
              },
            },
            {
              name: 'googleTagManagerId',
              type: 'text',
              label: 'Google Tag Manager ID',
              admin: {
                placeholder: 'GTM-XXXXXXX',
              },
            },
            {
              name: 'facebookPixelId',
              type: 'text',
              label: 'Facebook Pixel ID',
            },
          ],
        },
      ],
    },
  ],
}
```

### 6.2 LGPDSettings.ts

```typescript
// payload/globals/LGPDSettings.ts
import type { GlobalConfig } from 'payload/types'
import { isAdmin } from '../access'

export const LGPDSettings: GlobalConfig = {
  slug: 'lgpd-settings',
  admin: {
    group: 'Configurações',
  },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      name: 'dpoName',
      type: 'text',
      required: true,
      label: 'Nome do Encarregado (DPO)',
      admin: {
        description: 'Data Protection Officer',
      },
    },
    {
      name: 'dpoEmail',
      type: 'email',
      required: true,
      label: 'E-mail do Encarregado',
    },
    {
      name: 'dataRetentionMonths',
      type: 'number',
      required: true,
      defaultValue: 24,
      min: 12,
      max: 60,
      label: 'Retenção de Dados (meses)',
      admin: {
        description: 'Leads inativos serão anonimizados após este período',
      },
    },
    {
      name: 'privacyPolicyUrl',
      type: 'text',
      label: 'URL da Política de Privacidade',
      admin: {
        placeholder: '/privacidade',
      },
    },
    {
      name: 'termsOfServiceUrl',
      type: 'text',
      label: 'URL dos Termos de Uso',
      admin: {
        placeholder: '/termos',
      },
    },
  ],
}
```

---

## 7. Componentes Customizados do Admin

### 7.1 Dashboard.tsx

```typescript
// payload/components/Dashboard.tsx
'use client'

import React from 'react'
import { useConfig } from 'payload/components/utilities'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const Dashboard: React.FC = () => {
  const { serverURL } = useConfig()
  const [stats, setStats] = React.useState<any>(null)

  React.useEffect(() => {
    fetch(`${serverURL}/api/dashboard-stats`)
      .then(res => res.json())
      .then(data => setStats(data))
  }, [serverURL])

  if (!stats) return <div>Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard PrimeUrban</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Imóveis Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary-brand">
              {stats.activeProperties}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary-brand">
              {stats.leadsToday}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversão (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-accent-brand">
              {stats.conversionRate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita Potencial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              R$ {stats.potentialRevenue.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {stats.alerts && stats.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.alerts.map((alert: any, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span>{alert.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 7.2 API Route para Dashboard Stats

```typescript
// app/api/dashboard-stats/route.ts
import { getPayloadClient } from '@/lib/payload'
import { NextResponse } from 'next/server'

export async function GET() {
  const payload = await getPayloadClient()

  // Imóveis ativos
  const activeProperties = await payload.find({
    collection: 'properties',
    where: {
      status: { equals: 'published' },
    },
  })

  // Leads de hoje
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const leadsToday = await payload.find({
    collection: 'leads',
    where: {
      createdAt: {
        greater_than_equal: today.toISOString(),
      },
    },
  })

  // Conversão do mês
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const leadsThisMonth = await payload.find({
    collection: 'leads',
    where: {
      createdAt: {
        greater_than_equal: firstDayOfMonth.toISOString(),
      },
    },
  })

  const closedWonThisMonth = await payload.find({
    collection: 'leads',
    where: {
      and: [
        {
          createdAt: {
            greater_than_equal: firstDayOfMonth.toISOString(),
          },
        },
        {
          status: { equals: 'closed_won' },
        },
      ],
    },
  })

  const conversionRate =
    leadsThisMonth.totalDocs > 0
      ? Math.round((closedWonThisMonth.totalDocs / leadsThisMonth.totalDocs) * 100)
      : 0

  // Receita potencial (deals em aberto)
  const activeDeals = await payload.find({
    collection: 'deals',
    where: {
      stage: {
        not_in: ['closed_won', 'closed_lost'],
      },
    },
  })

  const potentialRevenue = activeDeals.docs.reduce((sum, deal) => {
    const value = deal.finalPrice || deal.offerPrice || deal.askingPrice || 0
    const probability = deal.probability || 50
    return sum + (value * probability) / 100
  }, 0)

  // Alertas
  const alerts = []

  // Leads sem contato >24h
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const uncontactedLeads = await payload.find({
    collection: 'leads',
    where: {
      and: [
        {
          createdAt: {
            less_than: yesterday.toISOString(),
          },
        },
        {
          status: { equals: 'new' },
        },
      ],
    },
  })

  if (uncontactedLeads.totalDocs > 0) {
    alerts.push({
      message: `${uncontactedLeads.totalDocs} leads não contactados há mais de 24h`,
    })
  }

  // Tarefas atrasadas
  const overdueTasks = await payload.find({
    collection: 'activities',
    where: {
      and: [
        { type: { equals: 'task' } },
        { dueAt: { less_than: new Date().toISOString() } },
        { completedAt: { exists: false } },
      ],
    },
  })

  if (overdueTasks.totalDocs > 0) {
    alerts.push({
      message: `${overdueTasks.totalDocs} tarefas atrasadas`,
    })
  }

  return NextResponse.json({
    activeProperties: activeProperties.totalDocs,
    leadsToday: leadsToday.totalDocs,
    conversionRate,
    potentialRevenue: Math.round(potentialRevenue),
    alerts,
  })
}
```

---

## 8. Integração com Next.js Frontend

### 8.1 Buscar Imóveis (Local API)

```typescript
// app/(app)/imoveis/page.tsx
import { getPayloadClient } from '@/lib/payload'
import { PropertyCard } from '@/components/PropertyCard'

export const revalidate = 30 // ISR: 30 segundos

interface SearchParams {
  type?: 'sale' | 'rent'
  category?: string
  neighborhood?: string
  priceMin?: string
  priceMax?: string
  bedrooms?: string
  page?: string
}

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const payload = await getPayloadClient()

  const where: any = {
    status: { equals: 'published' },
  }

  if (searchParams.type) {
    where.type = { equals: searchParams.type }
  }

  if (searchParams.category) {
    where.category = { equals: searchParams.category }
  }

  if (searchParams.neighborhood) {
    where['address.neighborhood'] = { equals: searchParams.neighborhood }
  }

  if (searchParams.priceMin || searchParams.priceMax) {
    where.price = {}
    if (searchParams.priceMin) {
      where.price.greater_than_equal = parseInt(searchParams.priceMin)
    }
    if (searchParams.priceMax) {
      where.price.less_than_equal = parseInt(searchParams.priceMax)
    }
  }

  if (searchParams.bedrooms) {
    where.bedrooms = { greater_than_equal: parseInt(searchParams.bedrooms) }
  }

  const page = parseInt(searchParams.page || '1')

  const properties = await payload.find({
    collection: 'properties',
    where,
    limit: 12,
    page,
    sort: '-createdAt',
  })

  return (
    <div>
      <h1>Imóveis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.docs.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      {/* Pagination */}
    </div>
  )
}
```

### 8.2 Página de Detalhes (ISR com Revalidação On-Demand)

```typescript
// app/(app)/imovel/[slug]/page.tsx
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const payload = await getPayloadClient()

  const properties = await payload.find({
    collection: 'properties',
    where: {
      status: { equals: 'published' },
    },
    limit: 1000, // Gerar páginas estáticas para os primeiros 1000
  })

  return properties.docs.map((property) => ({
    slug: property.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const payload = await getPayloadClient()

  const properties = await payload.find({
    collection: 'properties',
    where: {
      slug: { equals: params.slug },
    },
    limit: 1,
  })

  if (!properties.docs[0]) return {}

  const property = properties.docs[0]

  return {
    title: property.meta?.title || `${property.title} | PrimeUrban`,
    description: property.meta?.description || property.shortDescription,
    openGraph: {
      images: [property.featuredImage?.url || '/og-default.png'],
    },
  }
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const payload = await getPayloadClient()

  const properties = await payload.find({
    collection: 'properties',
    where: {
      slug: { equals: params.slug },
    },
    limit: 1,
  })

  if (!properties.docs[0]) {
    notFound()
  }

  const property = properties.docs[0]

  // Incrementar view count (via API route)
  fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/properties/${property.id}/view`, {
    method: 'POST',
  }).catch(() => {}) // Fire and forget

  return (
    <div>
      {/* Renderizar detalhes do imóvel */}
    </div>
  )
}
```

### 8.3 API Route Revalidação ISR

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const path = request.nextUrl.searchParams.get('path')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  if (!path) {
    return NextResponse.json({ message: 'Missing path' }, { status: 400 })
  }

  try {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
```

---

## 9. Deploy

### 9.1 Variáveis de Ambiente

```bash
# .env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Payload
PAYLOAD_SECRET="your-secret-key-min-32-chars"
NEXT_PUBLIC_SERVER_URL="https://primeUrban.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

# Resend
RESEND_API_KEY="re_xxxxx"

# Sentry
SENTRY_DSN="https://xxx@sentry.io/xxx"

# Revalidation
REVALIDATE_SECRET="your-revalidate-secret"

# Google
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### 9.2 Scripts de Migração

```bash
# Gerar migration
npx payload migrate:create

# Rodar migrations
npx payload migrate
```

### 9.3 Build para Produção

```bash
# Build Next.js + Payload
npm run build

# Standalone mode (VPS)
npm run start
```

---

*Payload CMS v3.x — PrimeUrban Technical Specification*
