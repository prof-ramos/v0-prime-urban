# CMS e CRM - Product Requirements Document (PRD)

**PrimeUrban - Sistema Imobiliário Completo**
_Última atualização: Fevereiro 2026_
_Versão: 2.0_

---

## 1. Visão Geral do Produto

### 1.1 Propósito

Sistema integrado de CMS e CRM para a PrimeUrban Imobiliária, permitindo gestão completa de imóveis, leads, oportunidades de negócio e relacionamento com clientes em uma única plataforma.

### 1.2 Stack Tecnológico

| Camada         | Tecnologia                         | Justificativa                                             |
| -------------- | ---------------------------------- | --------------------------------------------------------- |
| Framework      | Next.js 16 (App Router)            | SSR/ISR nativo, Server Components                         |
| Linguagem      | TypeScript 5.x (strict)            | Segurança de tipos end-to-end                             |
| Estilização    | Tailwind CSS 4.1.9 + shadcn/ui     | Design system consistente                                 |
| CMS            | Payload CMS 3.x                    | Integração nativa Next.js, admin embutido                 |
| Banco de Dados | PostgreSQL (Neon.tech → VPS)       | Relacional, full-text search nativo                       |
| Busca          | PostgreSQL `tsvector` + `pg_trgm`  | Busca fuzzy sem serviço externo                           |
| Storage        | Vercel Blob (MVP) → MinIO S3 (VPS) | Compatível com API S3                                     |
| Autenticação   | Payload Auth (nativo)              | Evita dependência extra; já integra roles, sessions e JWT |
| Imagens        | Cloudinary (CDN + transformações)  | WebP automático, crop, resize on-the-fly                  |
| E-mail         | Resend (MVP) → AWS SES (escala)    | SDK moderno, templates React                              |
| Cache          | Next.js ISR + `unstable_cache`     | Revalidação sob demanda por webhook do Payload            |
| Monitoramento  | Vercel Analytics + Sentry          | Erros, performance, Web Vitals                            |

### 1.3 Arquitetura de Deployment

**Fase 1 — MVP (Vercel):**

````text
┌─────────────────────────────────────────────────────┐
│                 Vercel Platform                      │
│                                                     │
│  ┌──────────────┐         ┌──────────────────┐      │
│  │  Next.js App │◄───────►│  Payload CMS     │      │
│  │  (Frontend)  │  Local  │  (Admin + API)   │      │
│  │  SSR + ISR   │  API    │  /admin route    │      │
│  └──────┬───────┘         └────────┬─────────┘      │
│         │                          │                │
│         └──────────┬───────────────┘                │
│                    │                                │
│         ┌──────────▼───────────┐                    │
│         │  Neon.tech PostgreSQL │                    │
│         │  (Branching + Pooler) │                    │
│         └──────────────────────┘                    │
│                                                     │
│  ┌─────────────┐  ┌───────────┐  ┌──────────────┐  │
│  │  Cloudinary  │  │  Resend   │  │   Sentry     │  │
│  │  (Imagens)   │  │  (E-mail) │  │  (Erros)     │  │
│  └─────────────┘  └───────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────┘
```text

**Fase 2 — Escala (VPS):**

```text
┌─────────────────────────────────────────────────────┐
│              VPS (Coolify / Docker Compose)          │
│                                                     │
│  ┌──────────────┐         ┌──────────────────┐      │
│  │  Next.js App │◄───────►│  Payload CMS     │      │
│  │  (Standalone) │  Local  │  (Admin + API)   │      │
│  └──────┬───────┘  API    └────────┬─────────┘      │
│         │                          │                │
│  ┌──────▼──────────────────────────▼─────────┐      │
│  │         PostgreSQL (Local + pgBouncer)     │      │
│  └───────────────────────────────────────────┘      │
│                                                     │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────┐  │
│  │  MinIO (S3)   │  │  Caddy    │  │  Uptime Kuma │  │
│  │  (Storage)    │  │  (Proxy)  │  │  (Monitoring)│  │
│  └──────────────┘  └───────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────┘
```text

---

## 2. Personas e Fluxos de Usuário

### 2.1 Persona 1: Comprador/Locador (Usuário Final)

**Perfil:** Maria Silva, 32-45 anos, pesquisa online antes de contatar corretor.

**Jobs to be Done:**

1. Encontrar imóveis que correspondam aos meus critérios
2. Visualizar fotos e detalhes completos do imóvel
3. Entrar em contato com a imobiliária de forma rápida
4. Receber atualizações sobre novos imóveis similares

**Fluxo (Jornada de Compra):**

```text
Entrada              Busca/Filtros          Detalhes do Imóvel     Contato/Conversão
──────────────────   ──────────────────     ──────────────────     ──────────────────
• SEO Orgânico       • Tipo (V/L)           • Galeria de fotos     • Formulário
• Campanhas Ads      • Categoria            • Mapa interativo      • WhatsApp direto
• Redes Sociais      • Bairro               • Ficha técnica        • Agendamento
• Indicação          • Preço (range)        • Vídeo tour             de visita
                     • Quartos/Banheiros    • Comparar imóveis     • Callback
                     • Vagas/Área (m²)      • Imóveis similares
                     • Comodidades
                     • Palavra-chave
```text

**Filtros de Busca:**

| #   | Filtro          | Tipo de Input                 | Observação                                               |
| --- | --------------- | ----------------------------- | -------------------------------------------------------- |
| 1   | Tipo            | Toggle: Comprar / Alugar      | Obrigatório                                              |
| 2   | Categoria       | Multi-select chips            | Apartamento, Casa, Comercial, Terreno, Cobertura, Studio |
| 3   | Bairro          | Multi-select com busca        | Populados dinamicamente do CMS                           |
| 4   | Preço           | Range slider (min/max)        | Formatado em R$                                          |
| 5   | Quartos         | Botões: 1+, 2+, 3+, 4+, 5+    | -                                                        |
| 6   | Banheiros       | Botões: 1+, 2+, 3+, 4+        | -                                                        |
| 7   | Vagas           | Botões: 1+, 2+, 3+, 4+        | -                                                        |
| 8   | Área (m²)       | Range slider                  | -                                                        |
| 9   | Características | Multi-select chips            | Piscina, Academia, etc.                                  |
| 10  | Palavra-chave   | Text input com debounce 300ms | Busca em título, código, descrição                       |

**Ordenação:** Mais recentes · Menor preço · Maior preço · Maior área · Mais visualizados

**Pontos de Conversão → CRM:**

| Ação do Usuário     | Evento no CRM                                    |
| ------------------- | ------------------------------------------------ |
| Visualiza imóvel    | Registro anônimo de interesse (cookie-based)     |
| Clica WhatsApp      | Lead criado automaticamente (source: `whatsapp`) |
| Preenche formulário | Lead qualificado (source: `website`)             |
| Agenda visita       | Oportunidade criada, atividade gerada            |

---

### 2.2 Persona 2: Administrador da Imobiliária

**Perfil:** Carlos Mendes, Corretor/Proprietário. Precisa gerenciar imóveis e acompanhar leads.

**Jobs to be Done:**

1. Cadastrar e atualizar imóveis rapidamente
2. Acompanhar todos os leads em um único lugar
3. Gerenciar o funil de vendas
4. Analisar métricas de desempenho
5. Automatizar comunicações com leads

**Fluxo do Administrador:**

```text
Login (Payload Auth)    Dashboard             Gestão de Conteúdo    Ações de CRM
──────────────────      ──────────────────    ──────────────────    ──────────────────
• Payload Auth nativo   • KPIs:               • CRUD Imóveis        • Pipeline vendas
• Roles:                  - Imóveis ativos    • Upload fotos        • Gestão leads
  - admin                 - Leads do dia      • Categorias          • Tarefas/follow-ups
  - agent                 - Conversão rate    • Bairros             • Relatórios
  - assistant             - Receita potencial • SEO
                        • Alertas pendentes   • Publicação/Revisão
```text

**Permissões por Role:**

| Recurso                        | admin | agent              | assistant       |
| ------------------------------ | ----- | ------------------ | --------------- |
| Imóveis — CRUD completo        | ✅    | ✅                 | Somente leitura |
| Imóveis — Publicar/Despublicar | ✅    | ❌                 | ❌              |
| Leads — Visualizar todos       | ✅    | Somente atribuídos | ❌              |
| Leads — Criar/Editar           | ✅    | ✅                 | ✅              |
| Pipeline — Mover estágios      | ✅    | ✅                 | ❌              |
| Relatórios                     | ✅    | Parcial            | ❌              |
| Configurações do sistema       | ✅    | ❌                 | ❌              |
| Usuários — Gerenciar           | ✅    | ❌                 | ❌              |

---

## 3. Estrutura de Dados (Payload Collections)

### 3.1 Imóveis (Properties)

```typescript
interface Property {
  id: string

  // Identificação
  title: string
  slug: string // auto-generated, unique
  code: string // Código interno (ex: PRM-001), auto-increment
  status: 'draft' | 'published' | 'sold' | 'rented' | 'paused'

  // Tipo e Categoria
  type: 'sale' | 'rent'
  category: 'apartment' | 'house' | 'commercial' | 'land' | 'penthouse' | 'studio'

  // Preço
  price: number
  condominiumFee?: number
  iptu?: number

  // Características Principais
  bedrooms: number
  suites?: number
  bathrooms: number
  parkingSpots: number
  totalArea: number // m²
  privateArea?: number // m² — área privativa
  builtArea?: number // m² — casas
  usableArea?: number // m² — apartamentos

  // Características Detalhadas
  floor?: number
  totalFloors?: number
  constructionYear?: number
  propertyAge?: 'new' | 'under_construction' | 'used' | 'renovated'
  facing?: 'north' | 'south' | 'east' | 'west'
  position?: 'front' | 'back' | 'side'

  // Localização
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: Relationship<Neighborhood> // FK
    city: string
    state: string
    zipCode: string
    latitude?: number
    longitude?: number
  }

  // Descrições
  shortDescription: string // max 160 chars (listagens + meta description fallback)
  fullDescription: RichText // Payload Rich Text (Lexical)

  // Mídia
  featuredImage: Relationship<Media> // FK
  gallery: Relationship<Media>[] // FK[]
  videoUrl?: string // YouTube/Vimeo URL

  // Comodidades e Características
  amenities: Relationship<Amenity>[] // FK[] — collection separada para i18n futuro
  buildingFeatures?: Relationship<Amenity>[]

  // Acabamentos
  flooring?: 'ceramic' | 'porcelain' | 'laminate' | 'hardwood' | 'vinyl' | 'other'
  windowType?: 'aluminum' | 'pvc' | 'wood' | 'iron'

  // Tags e Destaques
  tags?: Relationship<Tag>[] // "Novo", "Oportunidade", "Exclusivo"
  featured: boolean // Exibir na homepage
  highlightText?: string // "Últimas unidades", "Aceita permuta"

  // Relacionamentos
  agent: Relationship<User> // Corretor responsável

  // SEO (Payload SEO Plugin)
  meta: {
    title?: string
    description?: string
    image?: Relationship<Media>
  }

  // Analytics
  viewCount: number // Incrementado via API route
  contactCount: number // Incrementado ao gerar lead

  // Timestamps (Payload auto)
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date

  // Busca (campo virtual, populado por hook)
  _searchIndex?: string // tsvector: title + description + neighborhood + code
}
```text

### 3.1.1 Campos Exibidos no Card de Imóvel (Listagem)

```text
┌─────────────────────────────────────────────┐
│ [Imagem Destaque]           [Tag: Exclusivo] │
│ [Badge: Venda]  [Badge: Apartamento]        │
├─────────────────────────────────────────────┤
│ R$ 850.000                                  │
│ Apartamento à Venda                         │
│ Bairro Nobre, São Paulo - SP                │
├─────────────────────────────────────────────┤
│ 3 quartos  |  2 banheiros                   │
│ 2 vagas    |  120 m²                        │
├─────────────────────────────────────────────┤
│ [Código: PRM-001]     [Ver Detalhes →]      │
└─────────────────────────────────────────────┘
```text

**Campos obrigatórios no card:**

1. Imagem de destaque (`featuredImage`)
2. Badge de tipo — "À Venda" ou "Para Alugar"
3. Badge de categoria — Apartamento, Casa, etc.
4. Preço — Formatado em R$ (`Intl.NumberFormat`)
5. Título — Tipo + ação
6. Localização — Bairro, Cidade - Estado
7. Quartos, Banheiros, Vagas, Área (m²) — com ícones Lucide
8. Código do imóvel
9. Botão CTA — "Ver Detalhes"

**Campos opcionais (quando disponíveis):**

- Suítes — "3 quartos (2 suítes)"
- Condomínio — valor/mês (para aluguel)
- Tags — "Novo", "Oportunidade"
- Indicador de vídeo tour

### 3.1.2 Ficha Técnica Completa (Página de Detalhes)

**Seções da página:**

1. **Hero** — Galeria de fotos (lightbox) + badge tipo/categoria
2. **Informações Principais** — Preço, código, título, localização
3. **Características** — Grid de ícones: quartos, banheiros, vagas, área, andar, posição solar, ano construção
4. **Valores** — Preço, condomínio, IPTU (card separado)
5. **Comodidades** — Grid de ícones com labels
6. **Características do Condomínio** — Grid de ícones
7. **Descrição Completa** — Rich text renderizado
8. **Localização** — Mapa interativo (Google Maps embed) + endereço
9. **Corretor Responsável** — Foto, nome, telefone, botão WhatsApp
10. **Imóveis Similares** — Carousel de cards (mesma faixa de preço e bairro)
11. **CTA Flutuante** — Barra fixa no mobile com WhatsApp + Agendar Visita

---

### 3.2 Bairros (Neighborhoods)

```typescript
interface Neighborhood {
  id: string
  name: string
  slug: string // unique
  description?: RichText
  featuredImage?: Relationship<Media>
  averagePrice?: number // Calculado por hook (média dos imóveis ativos)
  propertyCount?: number // Virtual field — count de imóveis ativos
  city: string
  state: string
  active: boolean
  // SEO
  meta?: {
    title?: string
    description?: string
  }
  createdAt: Date
  updatedAt: Date
}
```text

### 3.3 Mídia (Media)

```typescript
interface Media {
  id: string
  filename: string
  alt: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  url: string // Cloudinary URL
  thumbnailURL?: string
  focalX?: number // Payload focal point
  focalY?: number
  folder?: string // Organização: "properties/PRM-001", "neighborhoods"
  createdAt: Date
  updatedAt: Date
}
```text

### 3.4 Tags

```typescript
interface Tag {
  id: string
  label: string // "Novo", "Oportunidade", "Exclusivo", "Últimas unidades"
  slug: string
  color: string // Hex color para badge
  active: boolean
}
```text

### 3.5 Comodidades (Amenities)

```typescript
interface Amenity {
  id: string
  label: string // "Piscina", "Academia"
  slug: string // "pool", "gym"
  icon: string // Nome do ícone Lucide (ex: "waves", "dumbbell")
  category: 'property' | 'building' // Comodidade do imóvel ou do condomínio
  active: boolean
}
```text

### 3.6 Leads (CRM)

```typescript
interface Lead {
  id: string

  // Dados Pessoais
  name: string
  email?: string
  phone: string // Obrigatório — principal canal de contato
  whatsapp?: string // Se diferente do phone

  // Origem
  source:
    | 'website'
    | 'whatsapp'
    | 'facebook'
    | 'instagram'
    | 'google_ads'
    | 'indication'
    | 'portal'
    | 'other'
  sourceDetails?: string // URL da página, nome da campanha, UTM params
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string

  // Interesse
  interestType: 'buy' | 'rent' | 'sell' | 'invest'
  budget?: { min?: number; max?: number } // Range em vez de valor único
  preferredNeighborhoods?: Relationship<Neighborhood>[]
  preferredCategories?: Property['category'][] // Tipos de imóvel de interesse

  // Imóveis Visualizados/Interessados
  viewedProperties?: Relationship<Property>[] // Rastreio de interesse
  favoriteProperties?: Relationship<Property>[] // Marcados explicitamente

  // Status do Funil
  status:
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'visit_scheduled'
    | 'proposal_sent'
    | 'negotiation'
    | 'closed_won'
    | 'closed_lost'
  priority: 'low' | 'medium' | 'high' | 'hot'
  lostReason?: 'price' | 'location' | 'timing' | 'competitor' | 'no_response' | 'other'
  lostReasonDetails?: string

  // Atribuição
  assignedTo?: Relationship<User> // Corretor responsável

  // Consentimento (LGPD)
  lgpdConsent: boolean
  consentDate: Date
  consentIP?: string

  // Score (calculado)
  score?: number // 0-100, baseado em engajamento

  createdAt: Date
  updatedAt: Date
  lastContactAt?: Date // Atualizado por hook ao registrar atividade
}
```text

### 3.7 Oportunidades (Deals)

```typescript
interface Deal {
  id: string
  lead: Relationship<Lead>
  property: Relationship<Property>
  type: 'sale' | 'rent'

  // Valores
  askingPrice: number // Preço pedido
  offerPrice?: number // Proposta do cliente
  finalPrice?: number // Preço fechado

  // Status
  stage:
    | 'interest'
    | 'visit'
    | 'proposal'
    | 'negotiation'
    | 'documentation'
    | 'closed_won'
    | 'closed_lost'
  probability?: number // % de chance de fechar

  // Comissão
  commissionRate?: number
  commissionValue?: number // Calculado: finalPrice * commissionRate

  // Datas
  expectedCloseDate?: Date
  closedAt?: Date

  agent: Relationship<User>
  notes?: string

  createdAt: Date
  updatedAt: Date
}
```text

### 3.8 Atividades (Activities)

```typescript
interface Activity {
  id: string
  lead: Relationship<Lead>
  deal?: Relationship<Deal>
  type: 'call' | 'whatsapp' | 'email' | 'visit' | 'note' | 'task' | 'proposal' | 'system'
  description: string
  scheduledAt?: Date
  completedAt?: Date
  dueAt?: Date // Para tarefas
  result?: 'success' | 'no_answer' | 'callback' | 'not_interested' | 'rescheduled' | 'other'
  isOverdue?: boolean // Virtual field: dueAt < now && !completedAt
  createdBy: Relationship<User>
  createdAt: Date
}
```text

### 3.9 Usuários (Users — Payload Auth Collection)

```typescript
interface User {
  id: string
  email: string // Unique, usado para login (Payload Auth)
  name: string
  role: 'admin' | 'agent' | 'assistant'
  phone?: string
  avatar?: Relationship<Media>
  creci?: string // Registro profissional do corretor
  bio?: string // Exibido na página do imóvel
  active: boolean
  commissionRate?: number // % padrão para corretores

  // Payload Auth fields (automáticos)
  // hash, salt, loginAttempts, lockUntil, etc.

  createdAt: Date
  updatedAt: Date
}
```text

---

## 4. Módulos do Sistema

### 4.1 CMS — Gestão de Conteúdo

#### 4.1.1 Dashboard Administrativo

- KPIs em cards: imóveis ativos, leads hoje, conversão mês, receita potencial
- Lista de tarefas pendentes (atividades atrasadas)
- Gráfico de leads por fonte (últimos 30 dias)
- Imóveis recém-cadastrados
- Alertas: leads sem contato >24h, tarefas vencidas

#### 4.1.2 Gerenciamento de Imóveis

- **Lista:** Tabela com filtros, ordenação, busca full-text, paginação server-side
- **Cadastro:** Formulário multi-etapas (Payload CMS Admin):
  1. Informações básicas (tipo, categoria, preço, características)
  2. Localização (endereço, mapa para pin de lat/long)
  3. Características detalhadas (acabamentos, comodidades)
  4. Mídia (upload drag-and-drop, reordenação, crop)
  5. SEO e Publicação (meta tags, slug, status)
- **Preview:** Live preview via Payload Draft feature
- **Ações em Lote:** Publicar, pausar, arquivar, atribuir corretor
- **Duplicação:** Duplicar imóvel existente como base para novo cadastro
- **Histórico de Versões:** Payload Versions para auditoria de alterações

#### 4.1.3 Gerenciamento de Bairros

- CRUD completo
- Contagem automática de imóveis ativos por bairro
- Preço médio calculado automaticamente

#### 4.1.4 Upload de Mídia

- Upload via Cloudinary (Payload Cloud Storage Adapter)
- Otimização automática: WebP, resize, lazy loading
- Upload múltiplo com progress bar
- Reordenação de galeria via drag-and-drop
- Organização por pastas (auto: `properties/{code}`)
- Limite: 30 fotos por imóvel, max 10MB por arquivo

### 4.2 CRM — Gestão de Relacionamento

#### 4.2.1 Pipeline de Vendas

```text
Novo → Contactado → Qualificado → Visita Agendada → Proposta Enviada → Negociação → Fechado (Ganho/Perdido)
```text

**Funcionalidades:**

- Visualização Kanban (drag-and-drop entre estágios) e Lista
- Filtros: corretor, data, prioridade, bairro de interesse, fonte
- Indicadores visuais: cor por prioridade, ícone de alerta para overdue
- Contagem e valor potencial por estágio
- Motivo de perda obrigatório ao mover para "Perdido"

#### 4.2.2 Gestão de Leads

- **Perfil do Lead:** Dados + timeline de interações + imóveis visualizados
- **Score automático:** Baseado em ações (visualizações, formulários, visitas)
- **Ações Rápidas:** WhatsApp, Ligar, E-mail, Agendar Visita, Criar Oportunidade
- **Importação:** CSV com mapeamento de colunas
- **Duplicidade:** Detecção automática por telefone + e-mail (merge manual)
- **Distribuição:** Round-robin automático para corretores ativos (configurável)

#### 4.2.3 Oportunidades (Deals)

- Vinculação lead ↔ imóvel específico
- Tracking de propostas e contrapropostas
- Cálculo automático de comissão
- Previsão de receita (pipeline value × probability)

#### 4.2.4 Atividades e Tarefas

- Criação de tarefas com data/hora de vencimento
- Notificação por e-mail: tarefa próxima (1h antes) e atrasada
- Templates de mensagens WhatsApp/e-mail
- Agenda com visão diária/semanal (própria, não Google Calendar no MVP)

#### 4.2.5 Relatórios e Analytics

**Dashboard de Métricas:**

- Leads por fonte (gráfico de barras)
- Funil de conversão por estágio (gráfico de funil)
- Imóveis mais visualizados (top 10)
- Ranking de corretores (leads, conversão, receita)
- Tempo médio de resposta ao lead
- Receita potencial vs. realizada (mês)
- Leads por bairro de interesse (mapa de calor simplificado)

**Relatórios Exportáveis (CSV/PDF):**

- Leads por período com filtros
- Atividades por corretor
- Imóveis: tempo no mercado, visualizações, leads gerados
- Comissões: previstas e realizadas

---

## 5. API Routes

### 5.1 Rotas Públicas (Frontend)

| Método | Rota                        | Descrição                                  |
| ------ | --------------------------- | ------------------------------------------ |
| GET    | `/api/properties`           | Listagem com filtros, paginação, ordenação |
| GET    | `/api/properties/[slug]`    | Detalhes do imóvel                         |
| GET    | `/api/neighborhoods`        | Lista de bairros ativos                    |
| POST   | `/api/leads`                | Criação de lead (formulário de contato)    |
| POST   | `/api/properties/[id]/view` | Incrementar view count                     |
| GET    | `/api/search`               | Full-text search com `pg_trgm`             |

### 5.2 Rotas Autenticadas (Admin — Payload REST/Local API)

Payload CMS expõe automaticamente REST API para todas as collections em `/api/{collection}`. O frontend admin usa a Local API (server-side) para performance.

### 5.3 Webhooks (Payload Hooks)

| Evento                             | Ação                                                           |
| ---------------------------------- | -------------------------------------------------------------- |
| `properties.afterChange` (publish) | Revalidar ISR da página, notificar leads com interesse similar |
| `leads.afterCreate`                | Enviar e-mail para corretor, distribuir via round-robin        |
| `activities.afterCreate`           | Atualizar `lastContactAt` do lead                              |
| `leads.afterChange` (closed_lost)  | Validar preenchimento de `lostReason`                          |

### 5.4 Rate Limiting

| Rota                             | Limite                  |
| -------------------------------- | ----------------------- |
| `POST /api/leads`                | 5 req/min por IP        |
| `POST /api/properties/[id]/view` | 1 req/min por IP+imóvel |
| `GET /api/properties`            | 60 req/min por IP       |
| `GET /api/search`                | 30 req/min por IP       |

---

## 6. Estratégia de Cache e Performance

### 6.1 ISR (Incremental Static Regeneration)

| Página                   | Estratégia    | Revalidação                                    |
| ------------------------ | ------------- | ---------------------------------------------- |
| Homepage                 | ISR           | 60s + on-demand via webhook                    |
| Listagem `/imoveis`      | SSR com cache | `unstable_cache` 30s                           |
| Detalhe `/imovel/[slug]` | ISR           | On-demand via `revalidatePath` no Payload hook |
| Bairros                  | ISR           | 3600s                                          |

### 6.2 Banco de Dados

- **Índices:** `slug` (unique), `status`, `type`, `category`, `price`, `neighborhood_id`, `bedrooms`, `parking_spots`, `total_area`
- **Índice composto:** `(status, type, category, neighborhood_id)` — filtros mais comuns
- **Full-text:** `tsvector` em `title`, `short_description`, `code`
- **Trigram:** `pg_trgm` para busca fuzzy (typo-tolerant)
- **Connection Pooling:** Neon Pooler (MVP) / pgBouncer (VPS)

### 6.3 Imagens

- Cloudinary: transformações on-the-fly (`f_auto,q_auto,w_800`)
- `next/image` com `sizes` prop para responsive
- Placeholder blur (LQIP via Cloudinary)
- Lazy loading nativo

---

## 7. Integrações

### 7.1 WhatsApp

- Botão no site com deep link: `https://wa.me/{number}?text={message}`
- Mensagem pré-preenchida com código e nome do imóvel
- Webhook para registrar clique como lead no CRM
- **Fase 2:** Twilio/Z-API para mensagens automatizadas e templates

### 7.2 E-mail (Resend)

| Trigger               | Template                 | Destinatário                |
| --------------------- | ------------------------ | --------------------------- |
| Novo lead             | "Novo lead recebido"     | Corretor atribuído          |
| Lead sem contato >24h | "Alerta: lead pendente"  | Corretor + Admin            |
| Tarefa próxima (1h)   | "Lembrete de tarefa"     | Corretor                    |
| Imóvel publicado      | "Novo imóvel disponível" | Leads com interesse similar |
| Visita agendada       | "Confirmação de visita"  | Lead + Corretor             |

### 7.3 Google

- Google Analytics 4 — tracking de eventos (view_property, contact_click, form_submit)
- Google Maps — embed na página de detalhes
- Google Tag Manager — gerenciamento de tags
- Google Search Console — indexação e SEO

---

## 8. Fluxos de Automação

### 8.1 Captura e Distribuição de Leads

```text
Lead criado (formulário/WhatsApp)
  → Verificar duplicidade (phone + email)
  → Se duplicado: merge + notificar corretor existente
  → Se novo: distribuir via round-robin para corretor ativo
  → Enviar e-mail de notificação ao corretor
  → Se não contactado em 24h: escalar para admin
```text

### 8.2 Score de Lead

```text
+10 pontos: Visualizou imóvel
+20 pontos: Clicou WhatsApp
+30 pontos: Preencheu formulário
+40 pontos: Agendou visita
+50 pontos: Recebeu proposta
-20 pontos: Sem interação em 7 dias
-50 pontos: Sem interação em 30 dias
```text

### 8.3 Notificação de Novos Imóveis

```text
Imóvel publicado
  → Buscar leads com interesse similar (bairro + faixa de preço + categoria)
  → Enviar e-mail: "Novo imóvel que pode te interessar"
  → Registrar atividade tipo "system" no lead
```text

---

## 9. Segurança e LGPD

### 9.1 Segurança

- Autenticação: Payload Auth (bcrypt + JWT com refresh tokens)
- Rate limiting: `next-rate-limit` nas API routes públicas
- Sanitização: Payload sanitiza inputs automaticamente; Zod validation adicional no frontend
- CSRF: Next.js CSRF protection nativo
- Headers: `next.config` com CSP, X-Frame-Options, HSTS
- Backup: pg_dump diário automatizado (cron) → S3/MinIO

### 9.2 LGPD Compliance

| Requisito               | Implementação                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Consentimento explícito | Checkbox obrigatório no formulário + timestamp + IP                                             |
| Direito de acesso       | API route `/api/lgpd/export?email=` — exporta dados do lead em JSON                             |
| Direito de exclusão     | API route `/api/lgpd/delete?email=` — anonimiza dados (não deleta para integridade referencial) |
| Retenção de dados       | Leads inativos >24 meses: anonimização automática via cron job                                  |
| Portabilidade           | Export CSV/JSON dos dados pessoais                                                              |
| DPO                     | Configurável nas settings do Payload (nome + e-mail do encarregado)                             |
| Política de Privacidade | Página `/privacidade` com texto completo                                                        |
| Cookie consent          | Banner de cookies com opt-in (analytics)                                                        |

---

## 10. Testes

### 10.1 Estratégia

| Tipo        | Ferramenta               | Escopo                                                    |
| ----------- | ------------------------ | --------------------------------------------------------- |
| Unit        | Vitest                   | Utils, hooks, formatters                                  |
| Integration | Vitest + Testing Library | Componentes com estado, formulários                       |
| E2E         | Playwright               | Fluxos críticos: busca, contato, login admin, CRUD imóvel |
| Visual      | Playwright screenshots   | Regressão visual de páginas-chave                         |

### 10.2 Fluxos E2E Críticos

1. Buscar imóvel → Filtrar → Ver detalhes → Clicar WhatsApp
2. Preencher formulário de contato → Verificar lead criado no CRM
3. Login admin → Cadastrar imóvel → Publicar → Verificar no site
4. Login admin → Mover lead no pipeline → Registrar atividade
5. Login admin → Gerar relatório → Exportar CSV

---

## 11. Monitoramento e Observabilidade

| Aspecto     | Ferramenta                       | Métrica                               |
| ----------- | -------------------------------- | ------------------------------------- |
| Erros       | Sentry                           | Error rate, stack traces, breadcrumbs |
| Performance | Vercel Analytics                 | TTFB, FCP, LCP, CLS, INP              |
| Uptime      | Vercel (MVP) / Uptime Kuma (VPS) | Uptime %, response time               |
| Logs        | Vercel Logs (MVP) / Loki (VPS)   | Request logs, error logs              |
| Business    | Dashboard CRM                    | Leads/dia, conversão, receita         |

**Alertas:**

- Error rate > 1% → Sentry → Slack/E-mail
- TTFB > 500ms sustentado → Vercel Alert
- Uptime < 99.5% → Uptime Kuma → E-mail admin

---

## 12. Requisitos Não-Funcionais

### 12.1 Performance

- TTFB < 200ms (páginas ISR)
- FCP < 1.8s
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms
- Suporte a 5000+ imóveis sem degradação
- Upload assíncrono com progress bar

### 12.2 SEO

- URLs: `/imoveis`, `/imovel/[slug]`, `/bairros/[slug]`
- `sitemap.xml` dinâmico (gerado pelo Next.js)
- Schema.org: `RealEstateListing`, `BreadcrumbList`, `Organization`
- Meta tags dinâmicas por imóvel (Payload SEO Plugin)
- Canonical URLs
- Open Graph + Twitter Cards
- `robots.txt` configurado

### 12.3 Acessibilidade

- WCAG 2.1 AA compliance
- Suporte a leitores de tela (aria-labels nos filtros e cards)
- Navegação completa por teclado
- Contraste mínimo 4.5:1
- Focus visible em todos os interativos
- Skip navigation link

### 12.4 Responsividade

- Mobile-first (breakpoints: 640px, 768px, 1024px, 1280px)
- Admin panel: responsivo mas otimizado para desktop (≥1024px)
- Cards: 1 coluna (mobile), 2 colunas (tablet), 3 colunas (desktop)
- Galeria: swipe nativo no mobile

---

## 13. Roadmap de Implementação

### Fase 1 — MVP CMS (Semanas 1-3)

**Objetivo:** CMS funcionando com dados reais no site.

#### Semana 1: Setup e Estrutura

- [ ] Instalar Payload CMS 3.x no projeto existente
- [ ] Configurar PostgreSQL (Neon.tech) + connection pooler
- [ ] Criar collections: Users, Properties, Neighborhoods, Media, Tags, Amenities
- [ ] Configurar Payload Auth (roles: admin, agent, assistant)
- [ ] Configurar Cloudinary adapter para upload
- [ ] Configurar Sentry para error tracking
- [ ] Seed: migrar dados mockados atuais para o banco

#### Semana 2: CMS Core

- [ ] Formulário multi-etapas de cadastro de imóvel
- [ ] Upload de imagens com drag-and-drop e reordenação
- [ ] Live preview de imóveis
- [ ] CRUD de bairros e comodidades
- [ ] SEO plugin configurado
- [ ] Ações em lote (publicar, pausar)

#### Semana 3: Frontend Integration

- [ ] Conectar listagem ao Payload Local API
- [ ] Página de detalhes dinâmica com ISR
- [ ] Filtros funcionais com full-text search
- [ ] Sitemap dinâmico + Schema.org
- [ ] Deploy na Vercel
- [ ] Testes E2E: busca + detalhes + contato

### Fase 2 — CRM (Semanas 4-6)

**Objetivo:** Captura e gestão de leads.

#### Semana 4: Leads e Captura

- [ ] Collection Leads + Deals
- [ ] Formulário de contato com LGPD consent
- [ ] Integração WhatsApp (deep link + webhook de tracking)
- [ ] Captura automática + distribuição round-robin
- [ ] Detecção de duplicidade
- [ ] API routes com rate limiting

#### Semana 5: Pipeline e Atividades

- [ ] Kanban de pipeline (drag-and-drop)
- [ ] Collection Activities
- [ ] Sistema de tarefas com datas de vencimento
- [ ] Timeline de interações no perfil do lead
- [ ] Score automático de leads
- [ ] Notificações por e-mail (Resend)

#### Semana 6: Analytics e Relatórios

- [ ] Dashboard de métricas no admin
- [ ] Relatórios exportáveis (CSV)
- [ ] GA4 tracking de eventos
- [ ] View count + contact count nos imóveis
- [ ] Ranking de corretores
- [ ] Testes E2E: pipeline + lead lifecycle

### Fase 3 — Automações e Hardening (Semanas 7-8)

**Objetivo:** Automações, LGPD completo, preparação para escala.

#### Semana 7: Automações e LGPD

- [ ] Workflow: notificar leads sobre novos imóveis
- [ ] Workflow: escalar leads sem contato >24h
- [ ] Templates de mensagens WhatsApp/e-mail
- [ ] Importação CSV de leads
- [ ] LGPD: rotas de export/delete, anonimização automática, cookie consent
- [ ] Política de privacidade

#### Semana 8: Preparação para Escala

- [ ] Dockerização (Dockerfile + docker-compose)
- [ ] Scripts de backup automatizado (pg_dump → S3)
- [ ] Documentação de deployment (VPS setup guide)
- [ ] Testes de carga (k6 ou Artillery)
- [ ] Otimização de queries lentas (EXPLAIN ANALYZE)
- [ ] Revisão de segurança (headers, rate limits, sanitização)

---

## 14. Modelo de Dados Relacional

```text
┌──────────────┐       ┌──────────────────────────┐       ┌──────────────┐
│    Users     │       │       Properties          │       │Neighborhoods │
├──────────────┤       ├──────────────────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)                  │    ┌──│ id (PK)      │
│ email        │  │    │ agent_id (FK→Users)       │◄───┘  │ name         │
│ name         │  │    │ neighborhood_id (FK)      │───────│ slug         │
│ role         │  │    │ title, slug, code         │       │ city, state  │
│ phone        │  │    │ status, type, category    │       │ active       │
│ creci        │  │    │ price, condo, iptu        │       └──────────────┘
│ active       │  │    │ bedrooms, suites, bath    │
└──────────────┘  │    │ parking, areas (m²)       │       ┌──────────────┐
      │           │    │ floor, year, facing       │       │    Media     │
      │           │    │ featured_image (FK→Media) │───────│ id (PK)      │
      │           │    │ video_url                 │       │ url, alt     │
      │           │    │ meta_title, meta_desc     │       │ mime, size   │
      │           │    │ view_count, contact_count │       │ folder       │
      │           │    │ featured, highlight_text  │       └──────────────┘
      │           │    └──────────────────────────┘
      │           │              │  │  │                    ┌──────────────┐
      │           │    ┌─────────┘  │  └────────────┐      │    Tags      │
      │           │    │            │               │      ├──────────────┤
      │           │    ▼            ▼               ▼      │ id (PK)      │
      │           │ PropertyMedia  PropertyAmenities PropertyTags  │ label, slug  │
      │           │ (FK→Media)     (FK→Amenities)   (FK→Tags)     │ color        │
      │           │                                        └──────────────┘
      │           │    ┌──────────────┐
      │           │    │  Amenities   │
      │           │    ├──────────────┤
      │           │    │ id (PK)      │
      │           │    │ label, slug  │
      │           │    │ icon, category│
      │           │    └──────────────┘
      │           │
      │           │    ┌──────────────────────┐     ┌──────────────┐
      │           │    │       Leads          │     │  Activities  │
      │           │    ├──────────────────────┤     ├──────────────┤
      │           └───▶│ assigned_to (FK)     │◄────│ lead_id (FK) │
      │                │ id (PK)              │     │ deal_id (FK) │
      │                │ name, email, phone   │     │ type, desc   │
      │                │ source, utm_*        │     │ scheduled_at │
      │                │ interest_type        │     │ completed_at │
      │                │ budget (min/max)     │     │ result       │
      │                │ status, priority     │     │ created_by   │
      │                │ score                │     └──────────────┘
      │                │ lgpd_consent         │
      │                │ last_contact_at      │
      │                └──────────────────────┘
      │                          │
      │                ┌─────────▼────────────┐
      │                │       Deals          │
      │                ├──────────────────────┤
      └───────────────▶│ agent_id (FK→Users)  │
                       │ lead_id (FK→Leads)   │
                       │ property_id (FK)     │
                       │ stage                │
                       │ asking/offer/final   │
                       │ commission_rate      │
                       │ probability          │
                       │ expected_close_date  │
                       └──────────────────────┘
````

---

## 15. Checklist de Validação

### CMS

- [ ] Cadastro de imóvel em < 5 minutos
- [ ] Upload de até 30 fotos simultâneas com progress bar
- [ ] Live preview funcional
- [ ] Busca full-text por código/título/bairro (typo-tolerant)
- [ ] Publicação/despublicação em 1 clique
- [ ] Edição em massa (status, preço, corretor)
- [ ] Card exibe: imagem, tipo, preço, localização, quartos, banheiros, vagas, m², código
- [ ] Ficha técnica completa na página de detalhes
- [ ] Filtros por todas as características
- [ ] Schema.org validado (Google Rich Results Test)
- [ ] Sitemap.xml gerado e indexável

### CRM

- [ ] Captura automática de leads do site (formulário + WhatsApp click)
- [ ] Notificação por e-mail ao corretor em < 1 minuto
- [ ] Pipeline Kanban funcional (drag-and-drop)
- [ ] Distribuição round-robin funcionando
- [ ] Detecção de duplicidade por phone + email
- [ ] Histórico completo de interações (timeline)
- [ ] Score de lead calculado corretamente
- [ ] Oportunidade vinculada a lead + imóvel específico
- [ ] Relatórios gerados em < 3 segundos
- [ ] Exportação CSV funcional
- [ ] Motivo de perda obrigatório

### Segurança e LGPD

- [ ] Rate limiting ativo em todas as rotas públicas
- [ ] Consentimento LGPD registrado com timestamp + IP
- [ ] Rota de export de dados funcional
- [ ] Rota de anonimização funcional
- [ ] Backup diário verificado (restore test)
- [ ] Headers de segurança configurados (CSP, HSTS)
- [ ] Cookie consent banner funcional

### Performance

- [ ] TTFB < 200ms em páginas ISR
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Lighthouse score ≥ 90 (Performance, SEO, Accessibility)
- [ ] Zero erros Sentry no primeiro dia pós-deploy

---

_PRD v2.0 — PrimeUrban CMS+CRM. Stack: Next.js 16 + Payload CMS 3.x + PostgreSQL._
