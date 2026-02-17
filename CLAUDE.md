# CLAUDE.md

Orientações para o Claude Code trabalhar com este repositório — PrimeUrban, uma plataforma de listagem de imóveis em Brasília com Payload CMS.

## Comandos Essenciais

```bash
# Desenvolvimento
pnpm dev           # Servidor de desenvolvimento (localhost:3000)
pnpm build         # Build de produção
pnpm start         # Servidor de produção

# Payload CMS
pnpm payload:generate:importmap  # Regenerar import map do Payload

# Qualidade de código
pnpm lint          # ESLint
npx tsc --noEmit   # Verificação de tipos TypeScript
```

> **Gerenciador de pacotes: pnpm** (veja `pnpm-lock.yaml`). Use `pnpm` em vez de `npm` ou `yarn`.

---

## Arquitetura

### Estrutura de Diretórios

```
app/                          # Rotas e páginas (App Router)
├── (payload)/                # Route group para Payload CMS
│   ├── admin/                # Admin do Payload (/admin)
│   │   └── custom.css        # Estilos customizados do admin
│   ├── api/                  # API routes do Payload (/api/*)
│   └── layout.tsx            # Layout do admin
│
├── (website)/                # Route group para site público
│   ├── imoveis/
│   │   ├── page.tsx          # Listagem de imóveis (Client Component)
│   │   └── [slug]/page.tsx   # Detalhe do imóvel (Server Component, ISR 1h)
│   ├── globals.css           # Design tokens e Tailwind config
│   ├── layout.tsx            # Layout raiz (pt-BR, fontes, analytics, error boundary)
│   ├── page.tsx              # Homepage (Server Component)
│   └── not-found.tsx         # Página 404
│
└── api/                      # API routes adicionais

components/                   # Componentes React
├── header.tsx                # Navegação sticky com menu mobile
├── hero-section.tsx          # Banner principal com busca
├── featured-properties.tsx   # Propriedades em destaque (React.memo)
├── neighborhoods-section.tsx # Seção de bairros
├── property-card.tsx         # Card de imóvel (React.memo)
├── property-filters.tsx      # Filtros avançados com debounce 300ms
├── property-gallery.tsx      # Galeria de imagens com fullscreen
├── property-info.tsx         # Informações detalhadas do imóvel
├── contact-form.tsx          # Formulário com React Hook Form + Zod
├── whatsapp-float.tsx        # Botão flutuante WhatsApp
├── whatsapp-cta.tsx          # Seção CTA WhatsApp
├── footer.tsx                # Rodapé
├── error-boundary.tsx        # Error boundary (class component)
├── service-worker-register.tsx # Registro do service worker PWA
└── ui/                       # shadcn/ui (Radix UI)
    ├── button.tsx            # Variantes: default, destructive, outline, secondary, ghost, link
    ├── card.tsx              # Card com @container queries
    ├── badge.tsx             # Variantes: default, secondary, destructive, outline
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx            # Radix Select com portal
    ├── textarea.tsx
    ├── slider.tsx            # Dual-thumb (filtro de preço)
    └── sheet.tsx             # Side drawer (filtros mobile)

payload/                      # Configuração do Payload CMS
├── collections/              # Collections do Payload
│   ├── Users.ts              # Usuários do admin
│   ├── Media.ts              # Biblioteca de mídia
│   ├── Tags.ts               # Tags para propriedades
│   ├── Amenities.ts          # Amenidades (piscina, academia, etc.)
│   ├── Neighborhoods.ts      # Bairros de Brasília
│   ├── Properties.ts         # Imóveis
│   ├── Leads.ts              # Leads de contato
│   ├── Deals.ts              # Negócios/vendas
│   └── Activities.ts         # Atividades do CRM
│
├── globals/                  # Globals do Payload
│   ├── Settings.ts           # Configurações gerais do site
│   └── lgpd-settings.ts      # Configurações LGPD
│
├── access/                   # Controle de acesso
├── components/               # Componentes custom do admin
│   ├── logo.tsx              # Logo do admin
│   └── dashboard/            # Dashboards customizados
│
├── hooks/                    # Hooks do Payload (beforeValidate, afterChange, etc.)
├── payload-types.ts          # Tipos TypeScript gerados
└── payload.config.ts         # Configuração principal do Payload

lib/
├── types.ts                  # Interfaces e union types
├── constants.ts              # Config, lookups O(1), labels
├── utils.ts                  # cn() (clsx + twMerge), formatCurrency()
└── mock-data.ts              # Dados mock para desenvolvimento (DEPRECIADO - usar Payload API)

public/                       # Assets estáticos
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
└── *.png, *.svg              # Ícones e placeholders
```

### Rotas

| Rota | Arquivo | Tipo | Descrição |
|------|---------|------|-----------|
| `/` | `app/(website)/page.tsx` | Server Component | Homepage com hero, destaques, bairros |
| `/imoveis` | `app/(website)/imoveis/page.tsx` | Client Component | Listagem com filtros, sort, grid/list |
| `/imoveis/[slug]` | `app/(website)/imoveis/[slug]/page.tsx` | Server Component (ISR 3600s) | Detalhe com galeria, info, contato |
| `/admin` | `app/(payload)/admin/*` | Payload Admin | Painel administrativo |
| `/api/*` | `app/(payload)/api/*` | Payload API | API REST do Payload |
| 404 | `app/(website)/not-found.tsx` | Server Component | Página não encontrada |

---

## Stack

| Tecnologia | Versão | Uso |
|-----------|---------|-----|
| **Payload CMS** | 3.76.1 | Headless CMS, admin panel, API |
| **Next.js** | 16.1.6 | App Router, ISR, dynamic imports |
| **React** | 19.2.0 | Server/Client Components |
| **TypeScript** | 5.x | strict mode |
| **Tailwind CSS** | 4.1.9 | @theme inline, CSS variables |
| **Radix UI** | shadcn/ui (new-york) | Componentes primitivos |
| **React Hook Form** | 7.60.0 | Formulários |
| **Zod** | 3.25.76 | Validação de schemas |
| **use-debounce** | 5.2.1 | Debounce de filtros |
| **Lucide React** | 0.454.0 | Ícones |
| **Vercel Analytics** | 1.3.1 | Analytics de produção |
| **Workbox** | 7.4.0 | Service worker / PWA |
| **SQLite** | via @payloadcms/db-sqlite | Banco de dados |

---

## Payload CMS

### Collections

| Collection | Descrição | Acesso |
|------------|-----------|--------|
| `users` | Usuários do admin | Admin apenas |
| `media` | Biblioteca de mídia | Admin apenas |
| `tags` | Tags para propriedades | Admin apenas |
| `amenities` | Amenidades (piscina, etc.) | Admin apenas |
| `neighborhoods` | Bairros de Brasília | Admin apenas |
| `properties` | Imóveis | Público (leitura), Admin (escrita) |
| `leads` | Leads de contato | Admin apenas |
| `deals` | Negócios/vendas | Admin apenas |
| `activities` | Atividades do CRM | Admin apenas |

### Globals

| Global | Descrição |
|--------|-----------|
| `settings` | Configurações gerais do site |
| `lgpd-settings` | Configurações LGPD (cookies, privacidade) |

### API Payload

```typescript
// Exemplo de fetch de propriedades
const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/properties?depth=1`)
const { docs } = await response.json()

// Exemplo com filtros
const response = await fetch('/api/properties?where[transactionType][equals]=venda&depth=2')
```

---

## Convenções

### Nomenclatura

- **Componentes:** PascalCase — `PropertyCard`, `HeroSection`
- **Funções/hooks:** camelCase — `formatCurrency`, `normalizeNeighborhood`
- **Constantes:** SCREAMING_SNAKE_CASE — `WHATSAPP_CONFIG`, `PRICE_LIMITS`
- **Tipos/interfaces:** PascalCase — `Property`, `FilterState`
- **Arquivos:** kebab-case — `property-card.tsx`, `payload.config.ts`

### Ordem de Imports

```typescript
"use client"                                    // 1. Diretiva (se Client Component)

import { useState, useMemo } from "react"       // 2. React
import Image from "next/image"                   // 3. Next.js
import { Heart } from "lucide-react"             // 4. Bibliotecas externas
import { Button } from "@/components/ui/button"  // 5. Componentes UI
import type { Property } from "@/lib/types"      // 6. Tipos (import type)
import { formatCurrency } from "@/lib/utils"     // 7. Utilitários locais
```

### TypeScript

- Union types em vez de strings genéricas (`"venda" | "aluguel"`, não `string`)
- Evitar `any` — usar tipos de `@/lib/types` ou `payload-types.ts`
- `interface` para objetos, `type` para unions e aliases
- Filtros incluem `""` para "qualquer" (`TransactionTypeFilter = "venda" | "aluguel" | ""`)
- Usar tipos gerados pelo Payload: `import type { Property } from '@/payload-types'`

### React

- **Server Components** por padrão; `"use client"` somente quando necessário
- `React.memo` para componentes em listas (ex: `PropertyCard`)
- `useMemo` para valores computados caros
- `useCallback` para funções passadas como props ou em deps de `useEffect`
- Sempre fazer cleanup em `useEffect` (abort controllers, event listeners)
- `next/dynamic` para code splitting de componentes pesados

### Payload CMS

- **Never** edit `payload-types.ts` — é gerado automaticamente
- Usar hooks do Payload para lógica de negócio (beforeValidate, afterChange, etc.)
- Collections em `payload/collections/`, globals em `payload/globals/`
- Access control em `payload/access/`
- Componentes custom do admin em `payload/components/`

### Componentes UI

- Sempre usar componentes de `components/ui/` (shadcn/ui) para primitivos
- Não criar novos primitivos UI — estender os existentes
- shadcn/ui config: estilo `new-york`, ícones `lucide`, CSS variables ativadas
- Para adicionar novos componentes shadcn: `npx shadcn@latest add <component>`

---

## Tipos Principais

```typescript
// De payload-types.ts (gerado automaticamente)
import type { Property, Neighborhood, Lead, Deal, Activity } from '@/payload-types'

// De lib/types.ts (types custom)
interface FilterState {
  search: string
  transactionType: "venda" | "aluguel" | ""
  propertyType: "apartamento" | "casa" | "cobertura" | "sala_comercial" | ""
  neighborhood: string
  minPrice: number
  maxPrice: number
  bedrooms: number
  parkingSpaces: number
}

// Union types
type TransactionType = "venda" | "aluguel"
type PropertyType = "apartamento" | "casa" | "cobertura" | "sala_comercial"
```

---

## Design Tokens (`app/(website)/globals.css`)

### Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary-brand` | `#1D2D3A` | CTAs, texto principal, navy |
| `--secondary-brand` | `#B68863` | Destaques, acentos, tan |
| `--accent-brand` | `#3D4D55` | Badges, cinza aço |
| `--background` | `#F9F6F0` | Fundo da página, creme |
| `--card` | `#ffffff` | Fundo de cards |
| `--border` | `#D9C3A9` | Bordas, tan claro |
| `--destructive` | `#B00020` | Erros, ações destrutivas |
| `--whatsapp` | `#25D366` | Verde WhatsApp |

### Tipografia

- **Títulos:** Libre Baskerville (serif) via `--font-serif`
- **Corpo:** Inter (sans-serif) via `--font-sans`
- **Mono:** Geist Mono via `--font-mono`

### Espaçamento

- Border radius base: `--radius: 1.25rem` (20px)
- Derivados: `--radius-sm` (-4px), `--radius-md` (-2px), `--radius-lg` (base), `--radius-xl` (+4px)

---

## Dados e Estado

### Fonte de Dados

- **Payload CMS API** — Fonte única de verdade para dados
- Banco SQLite: `payload.db` (desenvolvimento)
- `payload-types.ts` — Tipos TypeScript gerados automaticamente

### Gestão de Estado

- **Sem Redux/Zustand** — hooks nativos do React
- `useState` para estado local (filtros, UI, formulários)
- Estado de filtros gerenciado no componente `PropertiesPage`
- Debounce de 300ms via `use-debounce` nos filtros não-críticos
- Nenhum Context API ou Provider customizado em uso atualmente

### Constantes (`lib/constants.ts`)

- `WHATSAPP_CONFIG` — número e mensagem padrão
- `PROPERTY_TYPE_LABELS` — labels de tipo de imóvel com lookup reverso O(1)
- `NEIGHBORHOODS` — lista de bairros com O(1) lookup via `getNeighborhoodByValue()`
- `PRICE_LIMITS` — min: 0, max: 10.000.000

---

## Otimizações de Performance

### Caching e Lookups

- O(1) lookups com `Map` para propriedades, bairros, tipos (`lib/constants.ts`)
- Iterações combinadas (filter + map em loop único)
- Early exit quando nenhum filtro ativo

### Renderização

- `content-visibility: auto` para conteúdo off-screen (classe `.content-visibility-auto`)
- `React.memo` em `PropertyCard` e `FeaturedProperties`
- Dynamic imports via `next/dynamic` para: `PropertyFilters`, `PropertyGallery`, `PropertyInfo`, `ContactForm`

### Caching HTTP (configurado em `next.config.mjs`)

- Imagens: `max-age=31536000, immutable`
- Static assets: `max-age=31536000, immutable`
- Páginas de imóveis: `s-maxage=60, stale-while-revalidate=300`
- ISR no detalhe do imóvel: `revalidate = 3600` (1 hora)

### PWA

- Service worker em `public/sw.js` registrado via `service-worker-register.tsx`
- Manifest PWA em `public/manifest.json`
- Ícones em múltiplos tamanhos (192x192, 512x512)

---

## Configuração

### Next.js (`next.config.mjs`)

- `typescript.ignoreBuildErrors: true`
- Imagens remotas: `images.unsplash.com`
- Formatos de imagem: AVIF, WebP
- Headers de cache customizados para SW, imagens, static assets, páginas ISR

### TypeScript (`tsconfig.json`)

- `strict: true`
- Target: ES6, Module: esnext
- Path alias: `@/*` → `./*`
- Payload alias: `@payload-config` → `./payload/payload.config.ts`
- Plugin: `next`

### Tailwind CSS

- Versão 4.x com `@tailwindcss/postcss`
- Config via `@theme inline` em `app/(website)/globals.css` (sem `tailwind.config.js`)
- Animações: `tw-animate-css`
- Dark mode: `@custom-variant dark (&:is(.dark *))`

### shadcn/ui (`components.json`)

- Estilo: `new-york`
- RSC: true
- Ícones: `lucide`
- CSS variables: true
- Aliases: `@/components`, `@/components/ui`, `@/lib/utils`

### Payload CMS (`payload/payload.config.ts`)

- Banco: SQLite via `@payloadcms/db-sqlite`
- Editor: Lexical via `@payloadcms/richtext-lexical`
- Plugins: SEO plugin
- Traduções: Português (pt)
- Admin customizado: Logo, Dashboard

---

## Acessibilidade

- Botões e links com min-height/min-width 44px (touch targets)
- Focus-visible com ring styling nos componentes interativos
- Idioma da página: `pt-BR`
- ARIA labels nos elementos interativos

---

## Desenvolvimento

### Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                    # Inicia servidor em localhost:3000

# Payload
pnpm payload:generate:importmap  # Regenera import map após adicionar componentes

# Qualidade
pnpm lint                   # ESLint
npx tsc --noEmit            # Verifica tipos sem gerar arquivos

# Produção
pnpm build                  # Build para produção
pnpm start                  # Servidor de produção
```

### Links Úteis

- Admin Payload: `http://localhost:3000/admin`
- API Payload: `http://localhost:3000/api`
- Documentação Payload: `https://payloadcms.com/docs`
- Documentação Next.js: `https://nextjs.org/docs`
- Documentação shadcn/ui: `https://ui.shadcn.com`
