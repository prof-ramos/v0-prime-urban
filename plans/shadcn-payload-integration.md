# Implementation Plan: shadcn/ui + PayloadCMS Admin Customization

**Project:** PrimeUrban - Imobiliária de Alto Padrão
**Date:** 2025-02-16
**Status:** Updated (incorporating manual findings)
**Manual Reference:** `docs/manual-customizacao-payload.md`

---

## 1. Architecture Overview

```
app/(payload)/
├── custom.css                        # Custom CSS (NOT .scss per manual)
└── layout.tsx                        # Admin layout shell

payload/
├── components/
│   ├── dashboard/
│   │   ├── AgentDashboard.tsx       # Main dashboard
│   │   ├── stats-card.tsx           # Stat cards
│   │   ├── RecentLeads.tsx          # Recent leads widget
│   │   └── QuickActions.tsx         # Quick action buttons
│   └── fields/
│       ├── LeadStatusSelect.tsx     # Custom status select with colors
│       ├── PropertyStatusBadge.tsx  # Status badge for properties
│       └── NeighborhoodSearch.tsx   # Searchable neighborhood select
└── hooks/
    └── use-agent-stats.ts           # Hook for agent statistics (uses usePayloadAPI)
```

### Component Types

> **Nota do Manual:** O manual recomenda usar componentes de `@payloadcms/ui` para manter consistência visual:
> - Layout/UI: `Gutter`, `Banner`, `Button`, `Modal`, `Pill`
> - Drawers: `useDocumentDrawer`, `useListDrawer`
> - Campos: `FieldLabel`, `FieldDescription`, `TextInput`

| Component           | Type   | Reason                         |
| ------------------- | ------ | ------------------------------ |
| AgentDashboard      | Server | Data fetching via Local API    |
| StatsCard           | Client | Interactive, uses useState     |
| RecentLeads         | Client | Uses usePayloadAPI (NOT usePayload) |
| QuickActions        | Client | Click handlers                 |
| LeadStatusSelect    | Client | Uses useField hook             |
| PropertyStatusBadge | Server | Display only                   |

---

## 2. Phase Breakdown

### Phase 1: Foundation (Est. 2h)

#### Task 1.1: Configure Custom CSS (NOT .scss)

**Files:**

- `app/(payload)/custom.css`

**Important:** The manual specifies using `.css` not `.scss`. The current project also forces light mode.

**Description:** Merge PrimeUrban design tokens with Payload admin CSS variables.

```css
/* app/(payload)/custom.css */

/* Force light mode (currently in project) */
:root {
  --theme-elevation-500: #F9F6F0;
  --theme-elevation-900: #1D2D3A;
  --theme-text: #0F172A;
  --base: 1rem;
  --base-m: 1.5rem;
  --base-l: 2rem;
  --border-radius-m: 0.625rem;
  --border-radius-l: 1.25rem;
  
  /* PrimeUrban Design Tokens - mapped to shadcn/ui */
  --primary-brand: #1D2D3A;
  --secondary-brand: #B68863;
  --accent-brand: #3D4D55;
  --whatsapp: #25D366;
  
  /* Map to shadcn/ui variables */
  --primary: var(--primary-brand);
  --secondary: var(--secondary-brand);
  --accent: var(--accent-brand);
}

/* Dark mode support */
[data-theme='dark'] {
  --theme-elevation-500: #1D2D3A;
  --theme-elevation-900: #0F172A;
  --theme-text: #F9F6F0;
  --primary-brand: #F9F6F0;
  --secondary-brand: #B68863;
}
```

**Acceptance Criteria:**

- [ ] Admin panel loads without CSS conflicts
- [ ] Dark mode toggle works correctly
- [ ] PrimeUrban colors visible in admin
- [ ] Custom CSS uses `.css` not `.scss` (per manual)
- [ ] Light mode forced (as per current project setup)

---

#### Task 1.2: Create Component Directory Structure

**Files:**

- `payload/components/dashboard/.gitkeep`
- `payload/components/fields/.gitkeep`
- `payload/components/ui/.gitkeep`
- `payload/hooks/.gitkeep`

**Acceptance Criteria:**

- [ ] Directory structure matches architecture diagram
- [ ] .gitkeep files prevent empty directory issues

---

#### Task 1.3: Verify app/(payload)/layout.tsx

**Files to verify:**

- `app/(payload)/layout.tsx` - Must exist for admin to work
- `app/(payload)/custom.css` - Must exist

**Description:** Per the manual, these files are required:
- `app/(payload)/layout.tsx` - wraps the admin with RootLayout and connects config + importMap + css
- `app/(payload)/custom.css` - controls the visual theme

**Acceptance Criteria:**
- [ ] `app/(payload)/layout.tsx` exists and is configured
- [ ] `app/(payload)/custom.css` exists with PrimeUrban tokens
- [ ] importMap is working correctly
- [ ] `app/(payload)/admin/importMap.js` versionado e sem edição manual de entradas

---

### Phase 2: Custom Dashboard (Est. 4h)

#### Task 2.1: Create StatsCard Component

**Files:**

- `payload/components/dashboard/stats-card.tsx`

**Description:** Reusable stat card component using shadcn/ui Card.

```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  badge?: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
}

export function StatsCard({ title, value, description, icon: Icon, trend, badge }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <Badge variant="secondary" className="mt-2">
            {trend.value > 0 ? '+' : ''}
            {trend.value}% {trend.label}
          </Badge>
        )}
        {badge && (
          <Badge variant={badge.variant} className="mt-2">
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
```

**Acceptance Criteria:**

- [ ] Card renders with title and value
- [ ] Optional icon displays correctly
- [ ] Badge variant works
- [ ] Dark mode compatible

---

#### Task 2.2: Create useAgentStats Hook

**Files:**

- `payload/hooks/use-agent-stats.ts`

**Description:** Hook to fetch agent statistics from Payload. **Important:** Use `usePayloadAPI` (not `usePayload`) for client components per manual.

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth, usePayloadAPI } from '@payloadcms/ui'

interface AgentStats {
  totalLeads: number
  newLeads: number
  totalProperties: number
  activeDeals: number
  closedThisMonth: number
}

export function useAgentStats() {
  const { user } = useAuth()
  const { api } = usePayloadAPI() // Use usePayloadAPI per manual
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStats() {
      if (!user || !api) return

      try {
        const [leads, properties, deals] = await Promise.all([
          api.find({
            collection: 'leads',
            where: { assignedTo: { equals: user.id } },
            overrideAccess: false,
            user,
          }),
          api.find({
            collection: 'properties',
            where: { agent: { equals: user.id }, status: { equals: 'published' } },
            overrideAccess: false,
            user,
          }),
          api.find({
            collection: 'deals',
            where: { agent: { equals: user.id }, stage: { not_equals: 'cancelled' } },
            overrideAccess: false,
            user,
          }),
        ])

        setStats({
          totalLeads: leads.totalDocs,
          newLeads: leads.docs.filter((l) => l.status === 'new').length,
          totalProperties: properties.totalDocs,
          activeDeals: deals.totalDocs,
          closedThisMonth: deals.docs.filter((d) => d.stage === 'signed').length,
        })
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, payload])

  return { stats, loading, error }
}
```

**Acceptance Criteria:**

- [ ] Hook fetches data for current user
- [ ] Uses `usePayloadAPI` not `usePayload` (per manual)
- [ ] Respects access control (overrideAccess: false)
- [ ] Returns loading state
- [ ] Handles errors gracefully

---

#### Task 2.3: Create AgentDashboard Component

**Files:**

- `payload/components/dashboard/AgentDashboard.tsx`

**Description:** Main dashboard replacing default Payload dashboard.

```tsx
'use client'

import { useAuth } from '@payloadcms/ui'
import { Users, Building2, Handshake, TrendingUp } from 'lucide-react'
import { StatsCard } from './stats-card'
import { useAgentStats } from '../../hooks/use-agent-stats'
import { QuickActions } from './QuickActions'
import { RecentLeads } from './RecentLeads'

export function AgentDashboard() {
  const { user } = useAuth()
  const { stats, loading, error } = useAgentStats()

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  if (error) {
    return <div className="p-8 text-destructive">Erro ao carregar estatísticas</div>
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Aqui está um resumo da sua atividade</p>
        </div>
        <QuickActions />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Leads"
          value={stats?.totalLeads ?? 0}
          icon={Users}
          badge={{
            text: `${stats?.newLeads ?? 0} novos`,
            variant: 'secondary',
          }}
        />
        <StatsCard
          title="Imóveis Publicados"
          value={stats?.totalProperties ?? 0}
          icon={Building2}
        />
        <StatsCard title="Negócios Ativos" value={stats?.activeDeals ?? 0} icon={Handshake} />
        <StatsCard
          title="Fechados este Mês"
          value={stats?.closedThisMonth ?? 0}
          icon={TrendingUp}
        />
      </div>

      <RecentLeads limit={5} />
    </div>
  )
}
```

**Acceptance Criteria:**

- [ ] Dashboard shows personalized greeting
- [ ] Stats cards display correct data per user role
- [ ] Quick actions visible and functional
- [ ] Recent leads list renders

---

#### Task 2.4: Create QuickActions Component

**Files:**

- `payload/components/dashboard/QuickActions.tsx`

```tsx
'use client'

import { Plus, MessageSquare, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Novo Imóvel
      </Button>
      <Button variant="outline" size="sm">
        <MessageSquare className="h-4 w-4 mr-2" />
        Novo Lead
      </Button>
      <Button variant="outline" size="sm">
        <Calendar className="h-4 w-4 mr-2" />
        Agendar Visita
      </Button>
    </div>
  )
}
```

---

#### Task 2.5: Create RecentLeads Component

**Files:**

- `payload/components/dashboard/RecentLeads.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth, usePayloadAPI } from '@payloadcms/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Lead } from '@/payload/payload-types'

interface RecentLeadsProps {
  limit?: number
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-green-500',
  visit_scheduled: 'bg-purple-500',
  proposal_sent: 'bg-orange-500',
  negotiation: 'bg-cyan-500',
  closed_won: 'bg-emerald-600',
  closed_lost: 'bg-red-500',
}

export function RecentLeads({ limit = 5 }: RecentLeadsProps) {
  const { user } = useAuth()
  const { api } = usePayloadAPI() // Use usePayloadAPI per manual
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    async function fetchLeads() {
      if (!user || !api) return

      const result = await api.find({
        collection: 'leads',
        where: { assignedTo: { equals: user.id } },
        sort: '-createdAt',
        limit,
        overrideAccess: false,
        user,
      })
      setLeads(result.docs)
    }

    fetchLeads()
  }, [user, api, limit])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-sm text-muted-foreground">{lead.phone}</p>
              </div>
              <Badge className={`${statusColors[lead.status]} text-white`}>
                {lead.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
          {leads.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Nenhum lead encontrado</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

#### Task 2.6: Register Dashboard in Payload Config

**Files:**

- `payload/payload.config.ts`

**Important:** Per the manual, the component path format is `/path/to/component#ExportName`.

**Changes:**

```typescript
export default buildConfig({
  admin: {
    // ... existing config
    components: {
      // Per manual: add providers for wrapping admin if needed
      // providers: [],
      views: {
        dashboard: {
          Component: '/payload/components/dashboard/AgentDashboard#AgentDashboard',
        },
      },
    },
  },
  // ... rest of config
})
```

**Acceptance Criteria:**

- [ ] Custom dashboard replaces default
- [ ] Dashboard loads without errors
- [ ] Navigation still works

---

### Phase 3: Custom Field Components (Est. 3h)

#### Task 3.1: Create LeadStatusSelect Component

**Files:**

- `payload/components/fields/LeadStatusSelect.tsx`

```tsx
'use client'

import { useField } from '@payloadcms/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SelectFieldClientComponent } from 'payload'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Novo', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contactado', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualificado', color: 'bg-green-500' },
  { value: 'visit_scheduled', label: 'Visita Agendada', color: 'bg-purple-500' },
  { value: 'proposal_sent', label: 'Proposta Enviada', color: 'bg-orange-500' },
  { value: 'negotiation', label: 'Negociação', color: 'bg-cyan-500' },
  { value: 'closed_won', label: 'Fechado - Ganho', color: 'bg-emerald-600' },
  { value: 'closed_lost', label: 'Fechado - Perdido', color: 'bg-red-500' },
]

export const LeadStatusSelect: SelectFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{field.label as string}</label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${option.color}`} />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

---

#### Task 3.2: Register LeadStatusSelect in Leads Collection

**Files:**

- `payload/collections/leads.ts`

**Important:** Per the manual, use the format `#ExportName` for custom components.

**Changes:**

```typescript
{
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'new',
  options: [...], // existing options
  admin: {
    position: 'sidebar',
    components: {
      Field: '/payload/components/fields/LeadStatusSelect#LeadStatusSelect',
    },
  },
  label: 'Status',
},
```

---

#### Task 3.3: Create PropertyStatusBadge Cell Component

**Files:**

- `payload/components/fields/PropertyStatusCell.tsx`

```tsx
'use client'

import { Badge } from '@/components/ui/badge'
import type { CellComponentProps } from 'payload'

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  sold: 'outline',
  rented: 'outline',
  paused: 'secondary',
}

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  sold: 'Vendido',
  rented: 'Alugado',
  paused: 'Pausado',
}

export function PropertyStatusCell({ cellData }: CellComponentProps) {
  const status = cellData as string

  return (
    <Badge variant={statusVariants[status] || 'secondary'}>{statusLabels[status] || status}</Badge>
  )
}
```

---

### Phase 4: Integration & Testing (Est. 2h)

#### Task 4.1: Verify Access Control

- [ ] Test dashboard as admin (sees all data)
- [ ] Test dashboard as agent (sees own data only)
- [ ] Test dashboard as assistant (appropriate access)

#### Task 4.2: Test Dark Mode

- [ ] Toggle dark mode in admin
- [ ] Verify all components render correctly
- [ ] Check color contrast ratios

#### Task 4.3: Test Custom Fields

- [ ] LeadStatusSelect saves correctly
- [ ] PropertyStatusCell renders in list view
- [ ] Form validation still works
- [ ] Custom field component path uses `#ExportName` format

#### Task 4.4: Verify usePayloadAPI Usage

Per the manual, client components must use `usePayloadAPI` (not `usePayload`).

- [ ] All hooks use `usePayloadAPI` 
- [ ] All client components use `usePayloadAPI` for API calls
- [ ] No direct `usePayload` calls in client components

---

## 3. Risk Matrix

| Risk                       | Probability | Impact   | Mitigation                                   |
| -------------------------- | ----------- | -------- | -------------------------------------------- |
| CSS conflicts with Payload | Medium      | High     | Use scoped CSS, test in isolation            |
| Access control bypass      | Low         | Critical | Always use `overrideAccess: false` with user |
| Using wrong API hook       | Medium      | High     | Use `usePayloadAPI` NOT `usePayload` per manual |
| Hook infinite loops        | Low         | Medium   | Use context flags in hooks                   |
| Dark mode inconsistency    | Medium      | Low      | Test both themes, use CSS variables          |
| shadcn component drift     | Low         | Low      | Pin versions in package.json                 |

---

## 4. Verification Checklist

### Phase 1 Complete

- [x] `custom.css` loads without errors (updated with shadcn/ui variables)
- [x] CSS variables accessible in components
- [x] Directory structure created
- [x] `app/(payload)/layout.tsx` verified

### Phase 2 Complete

- [x] AgentDashboard created and registered
- [x] StatsCard component created
- [x] QuickActions component created
- [x] RecentLeads component created
- [x] useAgentStats hook created (`use-agent-stats.ts`)
- [ ] Stats show correct data per user (requires testing)
- [ ] QuickActions visible (requires testing)
- [ ] RecentLeads list renders (requires testing)

### Phase 3 Complete

- [x] LeadStatusSelect created
- [x] PropertyStatusCell created
- [x] LeadStatusSelect registered in leads collection
- [x] PropertyStatusCell registered in properties collection
- [ ] Values save correctly (requires manual testing)

### Phase 4 Complete

- [ ] All access controls verified (requires manual testing)
- [ ] Dark mode tested (requires manual testing)
- [x] No console errors
- [x] Build succeeds ✅

---

## 5. Dependencies

> **Nota do Manual:** Preferir componentes oficiais do ecossistema Payload (`@payloadcms/ui` e `@payloadcms/next`) antes de bibliotecas externas.

```json
{
  "dependencies": {
    "@payloadcms/ui": "^3.x",
    "@payloadcms/db-sqlite": "^3.x",
    "@payloadcms/richtext-lexical": "^3.x",
    "@payloadcms/plugin-seo": "^3.x",
    "@payloadcms/next": "^3.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-slot": "^1.x",
    "lucide-react": "^0.454.0",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  }
}
```

---

## 6. Estimated Timeline

| Phase               | Duration | Dependencies |
| ------------------- | -------- | ------------ |
| Phase 1: Foundation | 2h       | None         |
| Phase 2: Dashboard  | 4h       | Phase 1      |
| Phase 3: Fields     | 3h       | Phase 1      |
| Phase 4: Testing    | 2h       | Phases 2, 3  |
| **Total**           | **11h**  |              |

---

## 7. Next Steps

1. Review and approve this plan
2. Start Phase 1: Foundation
3. Create feature branch: `feat/shadcn-admin-components`
4. Implement incrementally with commits per task

---

## 8. Implementation Progress

**Status:** ✅ BUILD SUCCESSFUL - Ready for Manual Testing

### Files Created

| File | Description | Status |
|------|-------------|--------|
| `payload/components/dashboard/AgentDashboard.tsx` | Main dashboard component | ✅ |
| `payload/components/dashboard/StatsCard.tsx` | Stats card using shadcn/ui Card | ✅ |
| `payload/components/dashboard/QuickActions.tsx` | Quick action buttons | ✅ |
| `payload/components/dashboard/RecentLeads.tsx` | Recent leads list | ✅ |
| `payload/components/fields/LeadStatusSelect.tsx` | Custom status select | ✅ |
| `payload/components/fields/PropertyStatusCell.tsx` | Status badge for list | ✅ |
| `payload/hooks/useAgentStats.ts` | Hook for fetching stats | ✅ |
| `payload/hooks/afterChange/distribute-lead.ts` | Lead distribution hook | ✅ |

### Files Modified

| File | Changes | Status |
|------|---------|--------|
| `app/(payload)/custom.css` | Added shadcn/ui CSS variables | ✅ |
| `payload/payload.config.ts` | Added custom dashboard view | ✅ |
| `payload/collections/leads.ts` | Registered LeadStatusSelect | ✅ |
| `payload/collections/properties.ts` | Registered PropertyStatusCell | ✅ |

### Build Status

```
✓ Compiled successfully in 19.1s
✓ Generating static pages (12/12)
```

### Next Steps for Testing

1. ~~Fix the `viewCount` issue~~ ✅ Already fixed
2. ~~Run `pnpm build` to verify~~ ✅ Build successful
3. ~~Register LeadStatusSelect in leads collection~~ ✅ Done
4. ~~Register PropertyStatusCell in properties collection~~ ✅ Done
5. Run `pnpm dev` and manually test:
   - Navigate to `/admin` and verify custom dashboard loads
   - Check that stats cards display data
   - Test quick action buttons
   - Edit a lead and verify LeadStatusSelect shows colors
   - View properties list and verify status badges render

---

---

## 9. Gap Analysis: Payload PRD vs. Codebase Atual

> Análise complementar do `plans/payload-prd.md` vs. implementação atual, identificando itens pendentes além dos componentes shadcn/ui acima.

### 9.1 Status de Implementação do PRD

| Seção PRD                                   | Status     | Arquivos                                        |
| ------------------------------------------- | ---------- | ----------------------------------------------- |
| 1. Setup & Config                           | ✅         | `payload.config.ts`, `lib/payload.ts`           |
| 2. Estrutura de Diretórios                  | ✅         | `payload/components/` criado                     |
| 3.1 Users                                   | ✅         | `payload/collections/users.ts`                  |
| 3.2 Properties                              | ✅         | `payload/collections/properties.ts`             |
| 3.3 Neighborhoods                           | ✅         | `payload/collections/neighborhoods.ts`          |
| 3.4 Leads                                   | ✅         | `payload/collections/leads.ts`                  |
| 3.5 Deals                                   | ✅         | `payload/collections/deals.ts`                  |
| 3.6 Activities                              | ✅         | `payload/collections/activities.ts`             |
| 3.7 Media                                   | ✅         | `payload/collections/media.ts`                  |
| 3.8 Tags                                    | ✅         | `payload/collections/tags.ts`                   |
| 3.9 Amenities                               | ✅         | `payload/collections/amenities.ts`              |
| 4.1 autoSlug, autoCode                      | ✅         | `payload/hooks/beforeChange/`                   |
| 4.2 revalidateISR, notifyLeads, updateScore | ✅         | `payload/hooks/afterChange/`                    |
| 4.3 distributeLead, updateLeadLastContact   | ✅         | `payload/hooks/afterCreate/`                    |
| 5. Access Control                           | ✅         | `payload/access/` (4 files)                     |
| 6.1 Settings                                | ✅         | `payload/globals/settings.ts`                   |
| 6.2 LGPDSettings                            | ✅         | `payload/globals/lgpd-settings.ts`              |
| 7.1 Dashboard Customizado                   | ✅         | Implementado em `payload/components/dashboard/` |
| 7.2 Dashboard Stats API                     | ✅         | `app/api/dashboard-stats/route.ts`              |
| 8.1 Listagem de Imóveis                     | ✅         | `app/(website)/imoveis/page.tsx`                |
| 8.2 Página de Detalhes                      | ✅         | `app/(website)/imoveis/[slug]/page.tsx`         |
| 8.3 API Revalidação ISR                     | ✅         | `app/api/revalidate/route.ts`                   |
| SEO Plugin                                  | ✅         | Configurado em `payload.config.ts`              |

### 9.2 Itens Pendentes (além das Phases 1-4)

#### 9.2.1 [NEW] Serviço de E-mail (`lib/resend.ts`)

O PRD define um serviço de e-mail usado em `distributeLead` e `notifyLeads`. Atualmente os hooks importam `@/lib/resend` que **não existe**.

- Criar `lib/resend.ts` com funções `sendEmail()` e templates
- Dependência: `resend` (npm package)
- Variável de ambiente: `RESEND_API_KEY`

#### 9.2.2 [NEW] Template de Variáveis de Ambiente (`.env.example`)

O PRD §9.1 define variáveis necessárias. Não existe um `.env.example` no projeto.

- Criar `.env.example` com: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `CLOUDINARY_*`, `RESEND_API_KEY`, `SENTRY_DSN`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_GA_ID`

#### 9.2.3 [NEW] View Count API Route

O PRD §8.2 chama `POST /api/properties/{id}/view` para incrementar `viewCount`. Esta rota não existe.

- Criar `app/api/properties/[id]/view/route.ts`
- Incrementar campo `viewCount` na collection `properties`

#### 9.2.4 [NEW] Campos Reutilizáveis (`payload/fields/`)

O PRD §2 prevê campos reutilizáveis. Candidatos para extração:

- `addressField` — grupo de endereço reutilizado em Properties
- `priceField` — campo de preço formatado

#### 9.2.5 [MODIFY] Migração Frontend para Payload Local API

O frontend (`lib/api.ts`) ainda usa **dados mockados**. Migração necessária:

```diff
-import { mockProperties } from "./mock-data"
+import { getPayloadClient } from "./payload"

 export async function getProperties() {
-  return mockProperties
+  const payload = await getPayloadClient()
+  const result = await payload.find({
+    collection: 'properties',
+    where: { status: { equals: 'published' } },
+    sort: '-createdAt',
+  })
+  return result.docs
 }
```

> **⚠️ Atenção:** Esta migração requer alinhar o tipo `Property` de `lib/types.ts` com os tipos gerados em `payload-types.ts`. Pode quebrar componentes que dependem do formato mock.

#### 9.2.6 [NEW] Plugin Cloudinary (Pós-MVP)

O PRD §9.1 menciona Cloudinary mas não está configurado. Considerar para produção:

- Instalar `@payloadcms/plugin-cloud-storage` ou `payload-cloudinary`
- Configurar adapter para collection `media`

### 9.3 Verificação Adicional

- [ ] `npm run build` — verificar que todas as importações são resolvidas
- [ ] Seed de dados e teste de dashboard stats API
- [ ] Teste de envio de e-mail (dry-run)
- [ ] Verificar incremento de `viewCount` ao acessar página de detalhes
