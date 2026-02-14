# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) trabalhar com este repositório.

## Comandos Essenciais

### Desenvolvimento
```bash
npm run dev        # Inicia servidor de desenvolvimento (localhost:3000)
npm run build      # Cria build de produção
npm run start      # Inicia servidor de produção
```

### Código
```bash
npm run lint       # Executa ESLint
npx tsc --noEmit # Verificação de tipos TypeScript
```

---

## Arquitetura

**Next.js 16 App Router** com arquitetura plana:
- `app/` - Rotas e páginas (Server Components por padrão)
- `components/` - Componentes React reutilizáveis
- `lib/` - Utilitários, tipos e constantes
- `public/` - Assets estáticos (manifesto PWA, Service Worker, ícones)

**Componentes UI** (shadcn/ui baseado em Radix UI):
- `components/ui/` - Componentes base (button, card, input, select, etc.)
- Use estes em vez de criar primitivos UI

**Gestão de Estado** (sem Redux/Zustand):
- `useState/useReducer` - Estado local
- Context API - Estado compartilhado
- React Hook Form + Zod - Formulários com validação
- `useSearchParams` (Next.js) - Estado em URL para filtros

---

## Stack

| Tecnologia | Versão |
|-----------|---------|
| Next.js | 16.1.6 (App Router) |
| React | 19.2.0 |
| TypeScript | 5.x (strict) |
| Tailwind CSS | 4.1.9 |
| Radix UI | shadcn/ui componentes |

---

## Convenções

**Nomes:**
- Componentes: PascalCase (`PropertyCard`, `Header`)
- Funções/hooks: camelCase (`formatCurrency`, `useFilters`)
- Constantes: SCREAMING_SNAKE_CASE (`PROPERTY_TYPE_LABELS`, `WHATSAPP_CONFIG`)
- Tipos/interfaces: PascalCase (`Property`, `FilterState`)

**Imports:**
```typescript
"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { IconName } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Property } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
```

**TypeScript:**
- Usar union types em vez de strings genéricas
- Evitar `any` - usar tipos específicos de `@/lib/types`
- Interfaces para objetos, types para unions

**React:**
- Componentes em listas usam `React.memo` com comparação customizada
- `useMemo` para valores computados
- `useCallback` para funções em dependências de `useEffect`
- Cleanup em `useEffect` (abort controllers, event listeners)

---

## Design Tokens

Cores principais (ver `app/globals.css`):
- `--primary-brand: #1D2D3A` - Elementos primários, CTAs
- `--secondary-brand: #B68863` - Elementos de suporte
- `--accent-brand: #3D4D55` - Badges, preços
- `--background: #F9F6F0` - Fundo da página
- `--whatsapp: #25D366` - Verde WhatsApp

Tipografia:
- Títulos: Playfair Display (H1: 48-56px, H2: 36-44px)
- Corpo: Inter (16-18px base)

---

## Otimizações (v0.4.0)

Já aplicadas 12 otimizações Vercel React Best Practices:
- O(1) lookups com Maps (`lib/constants.ts`)
- Iterações combinadas (filter + map em único loop)
- Early exit quando nenhum filtro ativo
- RegExp hoistada fora de loops
- `content-visibility: auto` para listas longas
- JSX estático extraído fora de componentes
- Dynamic imports (`next/dynamic`) para code splitting
- `React.memo` com comparação customizada
- Estado derivado sem `useEffect`
- Cleanup de event listeners

---

## Componentes Principais

- `PropertyCard` - Card de propriedade (memoizado, O(1) lookup de bairros)
- `PropertyFilters` - Sistema de filtros com debounce 300ms
- `ContactForm` - Formulário com React Hook Form + Zod
- `FeaturedProperties` - Lista de propriedades em destaque na homepage
