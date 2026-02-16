# CLAUDE.md

Orientações para o Claude Code trabalhar com este repositório — PrimeUrban, uma plataforma de listagem de imóveis em Brasília.

## Comandos Essenciais

```bash
# Desenvolvimento
pnpm dev           # Servidor de desenvolvimento (localhost:3000)
pnpm build         # Build de produção
pnpm start         # Servidor de produção

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
├── layout.tsx                # Layout raiz (pt-BR, fontes, analytics, error boundary)
├── page.tsx                  # Homepage (Server Component)
├── not-found.tsx             # Página 404
├── globals.css               # Design tokens e Tailwind config
└── imoveis/
    ├── page.tsx              # Listagem de imóveis (Client Component)
    └── [slug]/page.tsx       # Detalhe do imóvel (Server Component, ISR 1h)

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

lib/
├── types.ts                  # Interfaces e union types
├── constants.ts              # Config, lookups O(1), labels
├── utils.ts                  # cn() (clsx + twMerge), formatCurrency()
└── mock-data.ts              # Dados mock com caching em Map

public/                       # Assets estáticos
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
└── *.png, *.svg              # Ícones e placeholders

styles/
└── globals.css               # Mirror de app/globals.css
```

### Rotas

| Rota | Arquivo | Tipo | Descrição |
|------|---------|------|-----------|
| `/` | `app/page.tsx` | Server Component | Homepage com hero, destaques, bairros |
| `/imoveis` | `app/imoveis/page.tsx` | Client Component | Listagem com filtros, sort, grid/list |
| `/imoveis/[slug]` | `app/imoveis/[slug]/page.tsx` | Server Component (ISR 3600s) | Detalhe com galeria, info, contato |
| 404 | `app/not-found.tsx` | Server Component | Página não encontrada |

---

## Stack

| Tecnologia | Versão | Uso |
|-----------|---------|-----|
| Next.js | 16.1.6 | App Router, ISR, dynamic imports |
| React | 19.2.0 | Server/Client Components |
| TypeScript | 5.x | strict mode |
| Tailwind CSS | 4.1.9 | @theme inline, CSS variables |
| Radix UI | shadcn/ui (new-york) | Componentes primitivos |
| React Hook Form | 7.60.0 | Formulários |
| Zod | 3.25.76 | Validação de schemas |
| use-debounce | 5.2.1 | Debounce de filtros |
| Lucide React | 0.454.0 | Ícones |
| Vercel Analytics | 1.3.1 | Analytics de produção |
| Workbox | 7.4.0 | Service worker / PWA |

---

## Convenções

### Nomenclatura

- **Componentes:** PascalCase — `PropertyCard`, `HeroSection`
- **Funções/hooks:** camelCase — `formatCurrency`, `normalizeNeighborhood`
- **Constantes:** SCREAMING_SNAKE_CASE — `WHATSAPP_CONFIG`, `PRICE_LIMITS`
- **Tipos/interfaces:** PascalCase — `Property`, `FilterState`
- **Arquivos:** kebab-case — `property-card.tsx`, `mock-data.ts`

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
- Evitar `any` — usar tipos de `@/lib/types`
- `interface` para objetos, `type` para unions e aliases
- Filtros incluem `""` para "qualquer" (`TransactionTypeFilter = "venda" | "aluguel" | ""`)

### React

- **Server Components** por padrão; `"use client"` somente quando necessário
- `React.memo` para componentes em listas (ex: `PropertyCard`)
- `useMemo` para valores computados caros
- `useCallback` para funções passadas como props ou em deps de `useEffect`
- Sempre fazer cleanup em `useEffect` (abort controllers, event listeners)
- `next/dynamic` para code splitting de componentes pesados

### Componentes UI

- Sempre usar componentes de `components/ui/` (shadcn/ui) para primitivos
- Não criar novos primitivos UI — estender os existentes
- shadcn/ui config: estilo `new-york`, ícones `lucide`, CSS variables ativadas
- Para adicionar novos componentes shadcn: `npx shadcn@latest add <component>`

---

## Tipos Principais (`lib/types.ts`)

```typescript
// Imóvel
interface Property {
  id, slug, title, type, transactionType,
  address, neighborhood, price, condominiumFee?, iptu?,
  privateArea, totalArea?, bedrooms, suites?, bathrooms, parkingSpaces,
  images[], description?, amenities?, featured?, acceptsPets?, solarOrientation?
}

// Filtros
interface FilterState {
  search, transactionType, propertyType, neighborhood,
  minPrice, maxPrice, bedrooms, parkingSpaces
}

// Union types
type TransactionType = "venda" | "aluguel"
type PropertyType = "apartamento" | "casa" | "cobertura" | "sala_comercial"
```

---

## Design Tokens (`app/globals.css`)

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

### Dados Mock (`lib/mock-data.ts`)

- 6 propriedades mock com dados completos
- Caching com `Map` para lookups O(1): `getPropertyBySlug()`, `getFeaturedProperties()`
- `normalizeNeighborhood()` para buscas sem acentos
- Sem banco de dados ou API externa — tudo in-memory

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

- O(1) lookups com `Map` para propriedades, bairros, tipos (`lib/constants.ts`, `lib/mock-data.ts`)
- Resultados de `getFeaturedProperties()` cacheados em variável de módulo
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
- Plugin: `next`

### Tailwind CSS

- Versão 4.x com `@tailwindcss/postcss`
- Config via `@theme inline` em `app/globals.css` (sem `tailwind.config.js`)
- Animações: `tw-animate-css`
- Dark mode: `@custom-variant dark (&:is(.dark *))`

### shadcn/ui (`components.json`)

- Estilo: `new-york`
- RSC: true
- Ícones: `lucide`
- CSS variables: true
- Aliases: `@/components`, `@/components/ui`, `@/lib/utils`

---

## Acessibilidade

- Botões e links com min-height/min-width 44px (touch targets)
- Focus-visible com ring styling nos componentes interativos
- Idioma da página: `pt-BR`
- ARIA labels nos elementos interativos
