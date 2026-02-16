# CMS e CRM - Product Requirements Document (PRD) — MIT/OpenSource Edition

**PrimeUrban - Sistema Imobiliário Completo**
*Última atualização: Fevereiro 2026*
*Versão: 2.0-MIT*

---

## 1. Visão Geral do Produto

### 1.1 Propósito

Sistema integrado de CMS e CRM para a PrimeUrban Imobiliária, utilizando EXCLUSIVAMENTE ferramentas MIT e OpenSource (exceto VPS), permitindo gestão completa de imóveis, leads, oportunidades de negócio e relacionamento com clientes em uma única plataforma self-hosted com controle total.

### 1.2 Stack Tecnológico

| Camada | Tecnologia | Licença | Justificativa |
|--------|-----------|---------|---------------|
| Framework | Next.js 16 (App Router) | MIT | SSR/ISR nativo, Server Components |
| Linguagem | TypeScript 5.x (strict) | Apache-2.0 | Segurança de tipos end-to-end |
| Estilização | Tailwind CSS 4.1.9 + shadcn/ui | MIT | Design system consistente |
| CMS | Payload CMS 3.x | MIT | Integração nativa Next.js, admin embutido |
| Banco de Dados | PostgreSQL 16+ (Self-hosted) | PostgreSQL License (permissive) | Relacional, full-text search nativo |
| Busca | PostgreSQL `tsvector` + `pg_trgm` | — | Busca fuzzy sem serviço externo |
| Storage | MinIO (S3-compatible) | AGPLv3 | Object storage self-hosted, API compatível com AWS S3 |
| Autenticação | Payload Auth (nativo) | MIT | Evita dependência extra; já integra roles, sessions e JWT |
| Imagens | Sharp (processamento local) | Apache-2.0 | WebP/AVIF, resize, crop, otimização em Node.js |
| E-mail | Nodemailer | MIT | SMTP padrão, zero dependências externas, suporte a OAuth2/DKIM |
| Cache | Next.js ISR + `unstable_cache` | MIT | Revalidação sob demanda por webhook do Payload |
| Error Tracking | GlitchTip (self-hosted) | MIT | Sentry-compatible API, error tracking + uptime monitoring |
| Analytics | PostHog (self-hosted) | MIT | All-in-one: product analytics, session replay, feature flags |
| Monitoring | Uptime Kuma | MIT | Status page + alertas de uptime |
| Logs | Grafana Loki | AGPLv3 | Log aggregation, query language |
| Reverse Proxy | Caddy | Apache-2.0 | HTTPS automático, configuração simples |
| Connection Pool | pgBouncer | BSD-like | Pooling de conexões PostgreSQL |

**Licenças Utilizadas:**
- **MIT License:** 12 componentes (Next.js, Payload, Nodemailer, PostHog, Uptime Kuma, etc.)
- **Apache 2.0:** 3 componentes (TypeScript, Sharp, Caddy)
- **AGPLv3:** 2 componentes (MinIO, Loki) — permitido, não afeta código proprietário quando usado como serviço
- **Permissive:** 2 componentes (PostgreSQL, pgBouncer)

### 1.3 Arquitetura de Deployment (VPS Self-Hosted)

```
┌─────────────────────────────────────────────────────────────────┐
│                        VPS (Docker Compose)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Caddy (Reverse Proxy)                │   │
│  │              HTTPS automático via Let's Encrypt           │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                       │
│         ┌───────────────┼───────────────┐                       │
│         ▼               ▼               ▼                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Next.js App │  │ Payload CMS  │  │  PostHog     │          │
│  │ (Standalone) │  │ (Admin+API)  │  │  (Analytics) │          │
│  │   Port 3000  │  │ Port 3000/ad │  │  Port 8000   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────┬────────┴─────────────────┘                   │
│                  │                                              │
│         ┌────────▼────────────────────────┐                     │
│         │  pgBouncer (Connection Pool)    │                     │
│         │         Port 6432                │                     │
│         └────────┬────────────────────────┘                     │
│                  │                                              │
│         ┌────────▼────────────────────────┐                     │
│         │     PostgreSQL 16+              │                     │
│         │  (Database + Full-Text Search)  │                     │
│         │         Port 5432                │                     │
│         └─────────────────────────────────┘                     │
│                                                                 │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐        │
│  │   MinIO      │  │ GlitchTip  │  │  Uptime Kuma     │        │
│  │ (S3 Storage) │  │  (Errors)  │  │  (Monitoring)    │        │
│  │  Port 9000   │  │ Port 8080  │  │  Port 3001       │        │
│  └──────────────┘  └────────────┘  └──────────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌────────────┐                              │
│  │ Grafana Loki │  │   Promtail │                              │
│  │    (Logs)    │  │(Log Shipper)│                             │
│  │  Port 3100   │  │            │                              │
│  └──────────────┘  └────────────┘                              │
│                                                                 │
│  Volumes persistentes: /data/postgres, /data/minio, /data/logs │
└─────────────────────────────────────────────────────────────────┘
```

**Benefícios da Stack MIT/OpenSource:**

1. **Custo Zero de Licenciamento:** Sem taxas recorrentes de SaaS
2. **Controle Total:** Dados permanecem 100% sob controle da empresa
3. **LGPD Simplificada:** Não há transferência internacional de dados
4. **Customização Ilimitada:** Código aberto permite modificações
5. **Lock-in Zero:** Ferramentas baseadas em padrões (S3, SMTP, PostgreSQL)
6. **Escalabilidade Previsível:** Custo fixo de VPS, não baseado em uso

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

```
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
```

**Filtros de Busca:**

| # | Filtro | Tipo de Input | Observação |
|---|--------|--------------|------------|
| 1 | Tipo | Toggle: Comprar / Alugar | Obrigatório |
| 2 | Categoria | Multi-select chips | Apartamento, Casa, Comercial, Terreno, Cobertura, Studio |
| 3 | Bairro | Multi-select com busca | Populados dinamicamente do CMS |
| 4 | Preço | Range slider (min/max) | Formatado em R$ |
| 5 | Quartos | Botões: 1+, 2+, 3+, 4+, 5+ | - |
| 6 | Banheiros | Botões: 1+, 2+, 3+, 4+ | - |
| 7 | Vagas | Botões: 1+, 2+, 3+, 4+ | - |
| 8 | Área (m²) | Range slider | - |
| 9 | Características | Multi-select chips | Piscina, Academia, etc. |
| 10 | Palavra-chave | Text input com debounce 300ms | Busca em título, código, descrição |

**Ordenação:** Mais recentes · Menor preço · Maior preço · Maior área · Mais visualizados

**Pontos de Conversão → CRM:**

| Ação do Usuário | Evento no CRM |
|-----------------|---------------|
| Visualiza imóvel | Registro anônimo de interesse (cookie-based) + PostHog event |
| Clica WhatsApp | Lead criado automaticamente (source: `whatsapp`) + PostHog capture |
| Preenche formulário | Lead qualificado (source: `website`) + PostHog identify |
| Agenda visita | Oportunidade criada, atividade gerada + PostHog event |

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

```
Login (Payload Auth)    Dashboard             Gestão de Conteúdo    Ações de CRM
──────────────────      ──────────────────    ──────────────────    ──────────────────
• Payload Auth nativo   • KPIs:               • CRUD Imóveis        • Pipeline vendas
• Roles:                  - Imóveis ativos    • Upload fotos        • Gestão leads
  - admin                 - Leads do dia      • Categorias          • Tarefas/follow-ups
  - agent                 - Conversão rate    • Bairros             • Relatórios
  - assistant             - Receita potencial • SEO                 • PostHog Insights
                        • Alertas pendentes   • Publicação/Revisão  • Session Replay
```

**Permissões por Role:**

| Recurso | admin | agent | assistant |
|---------|-------|-------|-----------|
| Imóveis — CRUD completo | ✅ | ✅ | Somente leitura |
| Imóveis — Publicar/Despublicar | ✅ | ❌ | ❌ |
| Leads — Visualizar todos | ✅ | Somente atribuídos | ❌ |
| Leads — Criar/Editar | ✅ | ✅ | ✅ |
| Pipeline — Mover estágios | ✅ | ✅ | ❌ |
| Relatórios | ✅ | Parcial | ❌ |
| Configurações do sistema | ✅ | ❌ | ❌ |
| Usuários — Gerenciar | ✅ | ❌ | ❌ |
| PostHog — Analytics completo | ✅ | Dashboard simplificado | ❌ |
| GlitchTip — Error logs | ✅ | ❌ | ❌ |

---

## 3. Estrutura de Dados (Payload Collections)

### 3.1 Imóveis (Properties)

```typescript
interface Property {
  id: string;

  // Identificação
  title: string;
  slug: string; // auto-generated, unique
  code: string; // Código interno (ex: PRM-001), auto-increment
  status: 'draft' | 'published' | 'sold' | 'rented' | 'paused';

  // Tipo e Categoria
  type: 'sale' | 'rent';
  category: 'apartment' | 'house' | 'commercial' | 'land' | 'penthouse' | 'studio';

  // Preço
  price: number;
  condominiumFee?: number;
  iptu?: number;

  // Características Principais
  bedrooms: number;
  suites?: number;
  bathrooms: number;
  parkingSpots: number;
  totalArea: number;        // m²
  privateArea?: number;     // m² — área privativa
  builtArea?: number;       // m² — casas
  usableArea?: number;      // m² — apartamentos

  // Características Detalhadas
  floor?: number;
  totalFloors?: number;
  constructionYear?: number;
  propertyAge?: 'new' | 'under_construction' | 'used' | 'renovated';
  facing?: 'north' | 'south' | 'east' | 'west';
  position?: 'front' | 'back' | 'side';

  // Localização
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: Relationship<Neighborhood>; // FK
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };

  // Descrições
  shortDescription: string; // max 160 chars (listagens + meta description fallback)
  fullDescription: RichText; // Payload Rich Text (Lexical)

  // Mídia (armazenada no MinIO)
  featuredImage: Relationship<Media>; // FK
  gallery: Relationship<Media>[]; // FK[]
  videoUrl?: string; // YouTube/Vimeo URL

  // Comodidades e Características
  amenities: Relationship<Amenity>[]; // FK[] — collection separada para i18n futuro
  buildingFeatures?: Relationship<Amenity>[];

  // Acabamentos
  flooring?: 'ceramic' | 'porcelain' | 'laminate' | 'hardwood' | 'vinyl' | 'other';
  windowType?: 'aluminum' | 'pvc' | 'wood' | 'iron';

  // Tags e Destaques
  tags?: Relationship<Tag>[]; // "Novo", "Oportunidade", "Exclusivo"
  featured: boolean; // Exibir na homepage
  highlightText?: string; // "Últimas unidades", "Aceita permuta"

  // Relacionamentos
  agent: Relationship<User>; // Corretor responsável

  // SEO (Payload SEO Plugin)
  meta: {
    title?: string;
    description?: string;
    image?: Relationship<Media>;
  };

  // Analytics (PostHog event tracking)
  viewCount: number; // Incrementado via API route + PostHog event
  contactCount: number; // Incrementado ao gerar lead + PostHog capture

  // Timestamps (Payload auto)
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;

  // Busca (campo virtual, populado por hook)
  _searchIndex?: string; // tsvector: title + description + neighborhood + code
}
```

### 3.1.1 Campos Exibidos no Card de Imóvel (Listagem)

```
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
```

**Campos obrigatórios no card:**

1. Imagem de destaque (`featuredImage`) — servida via MinIO com Sharp processing
2. Badge de tipo — "À Venda" ou "Para Alugar"
3. Badge de categoria — Apartamento, Casa, etc.
4. Preço — Formatado em R$ (`Intl.NumberFormat`)
5. Título — Tipo + ação
6. Localização — Bairro, Cidade - Estado
7. Quartos, Banheiros, Vagas, Área (m²) — com ícones Lucide
8. Código do imóvel
9. Botão CTA — "Ver Detalhes" (tracked via PostHog)

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
8. **Localização** — Mapa interativo (OpenStreetMap via Leaflet) + endereço
9. **Corretor Responsável** — Foto, nome, telefone, botão WhatsApp (PostHog tracked)
10. **Imóveis Similares** — Carousel de cards (mesma faixa de preço e bairro)
11. **CTA Flutuante** — Barra fixa no mobile com WhatsApp + Agendar Visita (PostHog tracked)

---

### 3.2 Bairros (Neighborhoods)

```typescript
interface Neighborhood {
  id: string;
  name: string;
  slug: string; // unique
  description?: RichText;
  featuredImage?: Relationship<Media>; // MinIO storage
  averagePrice?: number; // Calculado por hook (média dos imóveis ativos)
  propertyCount?: number; // Virtual field — count de imóveis ativos
  city: string;
  state: string;
  active: boolean;
  // SEO
  meta?: {
    title?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.3 Mídia (Media)

```typescript
interface Media {
  id: string;
  filename: string;
  alt: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  url: string; // MinIO S3 URL (ex: https://minio.primeUrban.com/properties/PRM-001/image.webp)
  thumbnailURL?: string; // Gerado via Sharp (WebP, 400x300)
  focalX?: number; // Payload focal point
  focalY?: number;
  folder?: string; // Organização: "properties/PRM-001", "neighborhoods"

  // Metadados Sharp (gerados no upload hook)
  formats?: {
    webp: { url: string; size: number };
    avif: { url: string; size: number }; // fallback format
    thumbnail: { url: string; size: number };
  };

  createdAt: Date;
  updatedAt: Date;
}
```

**Processamento de Imagens com Sharp:**

```javascript
// Hook de beforeChange para otimizar imagens no upload
import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3'; // MinIO client

export const processImageHook = {
  beforeChange: async ({ data, req }) => {
    if (!data.file) return data;

    const buffer = await data.file.buffer;

    // Gerar versão WebP otimizada
    const webpBuffer = await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toBuffer();

    // Gerar thumbnail
    const thumbBuffer = await sharp(buffer)
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    // Upload para MinIO
    const minioClient = getMinioClient();
    const folder = data.folder || 'uploads';

    await minioClient.send(new PutObjectCommand({
      Bucket: 'primeUrban',
      Key: `${folder}/${data.filename}.webp`,
      Body: webpBuffer,
      ContentType: 'image/webp',
    }));

    await minioClient.send(new PutObjectCommand({
      Bucket: 'primeUrban',
      Key: `${folder}/thumb-${data.filename}.webp`,
      Body: thumbBuffer,
      ContentType: 'image/webp',
    }));

    data.formats = {
      webp: { url: `${MINIO_URL}/${folder}/${data.filename}.webp`, size: webpBuffer.length },
      thumbnail: { url: `${MINIO_URL}/${folder}/thumb-${data.filename}.webp`, size: thumbBuffer.length },
    };

    return data;
  },
};
```

### 3.4 Tags

```typescript
interface Tag {
  id: string;
  label: string; // "Novo", "Oportunidade", "Exclusivo", "Últimas unidades"
  slug: string;
  color: string; // Hex color para badge
  active: boolean;
}
```

### 3.5 Comodidades (Amenities)

```typescript
interface Amenity {
  id: string;
  label: string; // "Piscina", "Academia"
  slug: string; // "pool", "gym"
  icon: string; // Nome do ícone Lucide (ex: "waves", "dumbbell")
  category: 'property' | 'building'; // Comodidade do imóvel ou do condomínio
  active: boolean;
}
```

### 3.6 Leads (CRM)

```typescript
interface Lead {
  id: string;

  // Dados Pessoais
  name: string;
  email?: string;
  phone: string; // Obrigatório — principal canal de contato
  whatsapp?: string; // Se diferente do phone

  // Origem
  source: 'website' | 'whatsapp' | 'facebook' | 'instagram' | 'google_ads' | 'indication' | 'portal' | 'other';
  sourceDetails?: string; // URL da página, nome da campanha, UTM params
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // PostHog Integration
  posthogDistinctId?: string; // Para vincular sessão PostHog ao lead
  posthogSessionId?: string;

  // Interesse
  interestType: 'buy' | 'rent' | 'sell' | 'invest';
  budget?: { min?: number; max?: number }; // Range em vez de valor único
  preferredNeighborhoods?: Relationship<Neighborhood>[];
  preferredCategories?: Property['category'][]; // Tipos de imóvel de interesse

  // Imóveis Visualizados/Interessados
  viewedProperties?: Relationship<Property>[]; // Rastreio de interesse via PostHog events
  favoriteProperties?: Relationship<Property>[]; // Marcados explicitamente

  // Status do Funil
  status: 'new' | 'contacted' | 'qualified' | 'visit_scheduled' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
  priority: 'low' | 'medium' | 'high' | 'hot';
  lostReason?: 'price' | 'location' | 'timing' | 'competitor' | 'no_response' | 'other';
  lostReasonDetails?: string;

  // Atribuição
  assignedTo?: Relationship<User>; // Corretor responsável

  // Consentimento (LGPD)
  lgpdConsent: boolean;
  consentDate: Date;
  consentIP?: string;

  // Score (calculado com base em eventos PostHog)
  score?: number; // 0-100, baseado em engajamento (page views, time on site, form submits)

  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date; // Atualizado por hook ao registrar atividade
}
```

### 3.7 Oportunidades (Deals)

```typescript
interface Deal {
  id: string;
  lead: Relationship<Lead>;
  property: Relationship<Property>;
  type: 'sale' | 'rent';

  // Valores
  askingPrice: number; // Preço pedido
  offerPrice?: number; // Proposta do cliente
  finalPrice?: number; // Preço fechado

  // Status
  stage: 'interest' | 'visit' | 'proposal' | 'negotiation' | 'documentation' | 'closed_won' | 'closed_lost';
  probability?: number; // % de chance de fechar

  // Comissão
  commissionRate?: number;
  commissionValue?: number; // Calculado: finalPrice * commissionRate

  // Datas
  expectedCloseDate?: Date;
  closedAt?: Date;

  agent: Relationship<User>;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

### 3.8 Atividades (Activities)

```typescript
interface Activity {
  id: string;
  lead: Relationship<Lead>;
  deal?: Relationship<Deal>;
  type: 'call' | 'whatsapp' | 'email' | 'visit' | 'note' | 'task' | 'proposal' | 'system';
  description: string;
  scheduledAt?: Date;
  completedAt?: Date;
  dueAt?: Date; // Para tarefas
  result?: 'success' | 'no_answer' | 'callback' | 'not_interested' | 'rescheduled' | 'other';
  isOverdue?: boolean; // Virtual field: dueAt < now && !completedAt
  createdBy: Relationship<User>;
  createdAt: Date;
}
```

### 3.9 Usuários (Users — Payload Auth Collection)

```typescript
interface User {
  id: string;
  email: string; // Unique, usado para login (Payload Auth)
  name: string;
  role: 'admin' | 'agent' | 'assistant';
  phone?: string;
  avatar?: Relationship<Media>; // MinIO storage
  creci?: string; // Registro profissional do corretor
  bio?: string; // Exibido na página do imóvel
  active: boolean;
  commissionRate?: number; // % padrão para corretores

  // PostHog user properties
  posthogDistinctId?: string; // Para tracking de ações no admin

  // Payload Auth fields (automáticos)
  // hash, salt, loginAttempts, lockUntil, etc.

  createdAt: Date;
  updatedAt: Date;
}
```

---

## 4. Módulos do Sistema

### 4.1 CMS — Gestão de Conteúdo

#### 4.1.1 Dashboard Administrativo

- KPIs em cards: imóveis ativos, leads hoje, conversão mês, receita potencial
- Lista de tarefas pendentes (atividades atrasadas)
- Gráfico de leads por fonte (últimos 30 dias) — dados via PostHog API
- Imóveis recém-cadastrados
- Alertas: leads sem contato >24h, tarefas vencidas
- **PostHog Insights Embed:** Dashboards customizados (conversão, funil, session replay)

#### 4.1.2 Gerenciamento de Imóveis

- **Lista:** Tabela com filtros, ordenação, busca full-text, paginação server-side
- **Cadastro:** Formulário multi-etapas (Payload CMS Admin):
  1. Informações básicas (tipo, categoria, preço, características)
  2. Localização (endereço, mapa OpenStreetMap para pin de lat/long)
  3. Características detalhadas (acabamentos, comodidades)
  4. Mídia (upload drag-and-drop → processamento Sharp → storage MinIO)
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

- Upload via interface Payload → processamento Sharp → storage MinIO
- Otimização automática: WebP/AVIF, resize, lazy loading
- Upload múltiplo com progress bar
- Reordenação de galeria via drag-and-drop
- Organização por pastas (auto: `properties/{code}`)
- Limite: 30 fotos por imóvel, max 10MB por arquivo
- **Processamento Sharp:**
  - Conversão para WebP (85% quality) + AVIF fallback
  - Thumbnails automáticos (400x300)
  - Resize inteligente sem distorção
  - EXIF rotation automático

### 4.2 CRM — Gestão de Relacionamento

#### 4.2.1 Pipeline de Vendas

```
Novo → Contactado → Qualificado → Visita Agendada → Proposta Enviada → Negociação → Fechado (Ganho/Perdido)
```

**Funcionalidades:**

- Visualização Kanban (drag-and-drop entre estágios) e Lista
- Filtros: corretor, data, prioridade, bairro de interesse, fonte
- Indicadores visuais: cor por prioridade, ícone de alerta para overdue
- Contagem e valor potencial por estágio
- Motivo de perda obrigatório ao mover para "Perdido"
- **PostHog Integration:** Cada mudança de estágio = event capture para funil analytics

#### 4.2.2 Gestão de Leads

- **Perfil do Lead:** Dados + timeline de interações + imóveis visualizados
- **Score automático:** Baseado em eventos PostHog (page views, session duration, form submits)
- **Ações Rápidas:** WhatsApp, Ligar, E-mail, Agendar Visita, Criar Oportunidade
- **Importação:** CSV com mapeamento de colunas
- **Duplicidade:** Detecção automática por telefone + e-mail (merge manual)
- **Distribuição:** Round-robin automático para corretores ativos (configurável)
- **PostHog Session Replay:** Acesso direto à gravação da sessão do lead no site

#### 4.2.3 Oportunidades (Deals)

- Vinculação lead ↔ imóvel específico
- Tracking de propostas e contrapropostas
- Cálculo automático de comissão
- Previsão de receita (pipeline value × probability)
- **PostHog Events:** Tracked para analytics de conversão

#### 4.2.4 Atividades e Tarefas

- Criação de tarefas com data/hora de vencimento
- Notificação por e-mail via Nodemailer: tarefa próxima (1h antes) e atrasada
- Templates de mensagens WhatsApp/e-mail
- Agenda com visão diária/semanal (própria, não Google Calendar no MVP)

#### 4.2.5 Relatórios e Analytics

**Dashboard de Métricas (PostHog Powered):**

- Leads por fonte (gráfico de barras) — PostHog Insights
- Funil de conversão por estágio (gráfico de funil) — PostHog Funnels
- Imóveis mais visualizados (top 10) — PostHog Trends
- Ranking de corretores (leads, conversão, receita)
- Tempo médio de resposta ao lead
- Receita potencial vs. realizada (mês)
- Leads por bairro de interesse (mapa de calor) — PostHog Heatmaps
- **Session Replay:** Replay de sessões de usuários para análise qualitativa
- **Feature Flags:** A/B testing de CTAs e layouts (PostHog Experiments)

**Relatórios Exportáveis (CSV/PDF):**

- Leads por período com filtros
- Atividades por corretor
- Imóveis: tempo no mercado, visualizações, leads gerados
- Comissões: previstas e realizadas

---

## 5. API Routes

### 5.1 Rotas Públicas (Frontend)

| Método | Rota | Descrição | PostHog Tracking |
|--------|------|-----------|------------------|
| GET | `/api/properties` | Listagem com filtros, paginação, ordenação | Event: `properties_listed` |
| GET | `/api/properties/[slug]` | Detalhes do imóvel | Event: `property_viewed` |
| GET | `/api/neighborhoods` | Lista de bairros ativos | - |
| POST | `/api/leads` | Criação de lead (formulário de contato) | Event: `lead_created`, Identify user |
| POST | `/api/properties/[id]/view` | Incrementar view count | Event: `property_detail_viewed` |
| GET | `/api/search` | Full-text search com `pg_trgm` | Event: `search_performed` |

### 5.2 Rotas Autenticadas (Admin — Payload REST/Local API)

Payload CMS expõe automaticamente REST API para todas as collections em `/api/{collection}`. O frontend admin usa a Local API (server-side) para performance.

### 5.3 Webhooks (Payload Hooks)

| Evento | Ação |
|--------|------|
| `properties.afterChange` (publish) | Revalidar ISR da página, notificar leads com interesse similar (Nodemailer), PostHog event |
| `leads.afterCreate` | Enviar e-mail para corretor (Nodemailer), distribuir via round-robin, PostHog identify |
| `activities.afterCreate` | Atualizar `lastContactAt` do lead, PostHog event |
| `leads.afterChange` (closed_lost) | Validar preenchimento de `lostReason`, PostHog event |
| `media.beforeChange` | Processar imagem com Sharp, fazer upload para MinIO |

### 5.4 Rate Limiting

| Rota | Limite | Implementação |
|------|--------|---------------|
| `POST /api/leads` | 5 req/min por IP | `express-rate-limit` ou custom middleware |
| `POST /api/properties/[id]/view` | 1 req/min por IP+imóvel | Custom middleware |
| `GET /api/properties` | 60 req/min por IP | `express-rate-limit` |
| `GET /api/search` | 30 req/min por IP | `express-rate-limit` |

---

## 6. Estratégia de Cache e Performance

### 6.1 ISR (Incremental Static Regeneration)

| Página | Estratégia | Revalidação |
|--------|-----------|-------------|
| Homepage | ISR | 60s + on-demand via webhook |
| Listagem `/imoveis` | SSR com cache | `unstable_cache` 30s |
| Detalhe `/imovel/[slug]` | ISR | On-demand via `revalidatePath` no Payload hook |
| Bairros | ISR | 3600s |

### 6.2 Banco de Dados

- **Índices:** `slug` (unique), `status`, `type`, `category`, `price`, `neighborhood_id`, `bedrooms`, `parking_spots`, `total_area`
- **Índice composto:** `(status, type, category, neighborhood_id)` — filtros mais comuns
- **Full-text:** `tsvector` em `title`, `short_description`, `code`
- **Trigram:** `pg_trgm` para busca fuzzy (typo-tolerant)
- **Connection Pooling:** pgBouncer (transaction mode, max 100 connections)

**Configuração pgBouncer:**

```ini
[databases]
primeUrban = host=postgres port=5432 dbname=primeUrban

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
```

### 6.3 Imagens (Sharp + MinIO)

**Pipeline de Processamento:**

1. Upload via Payload → Payload hook `beforeChange`
2. Sharp processing:
   - WebP conversion (85% quality, effort 6)
   - Thumbnail generation (400x300)
   - AVIF fallback (para navegadores compatíveis)
   - Metadata extraction (dimensions, EXIF)
3. Upload para MinIO via S3 SDK
4. URL retornada: `https://minio.primeUrban.com/properties/PRM-001/image.webp`
5. `next/image` com `sizes` prop para responsive
6. Lazy loading nativo

**Exemplo de URL gerada:**

```
Original: https://minio.primeUrban.com/properties/PRM-001/hero.jpg
WebP: https://minio.primeUrban.com/properties/PRM-001/hero.webp (processado)
Thumb: https://minio.primeUrban.com/properties/PRM-001/thumb-hero.webp
```

---

## 7. Integrações

### 7.1 WhatsApp

- Botão no site com deep link: `https://wa.me/{number}?text={message}`
- Mensagem pré-preenchida com código e nome do imóvel
- Webhook para registrar clique como lead no CRM (PostHog event capture)
- **Fase 2:** Integração com Baileys (library MIT para WhatsApp Web API) para mensagens automatizadas

### 7.2 E-mail (Nodemailer)

**Configuração SMTP:**

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // ex: smtp.gmail.com, smtp-relay.brevo.com
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Opcional: DKIM signing para deliverability
const transporterDKIM = nodemailer.createTransport({
  ...config,
  dkim: {
    domainName: 'primeUrban.com',
    keySelector: 'default',
    privateKey: fs.readFileSync('./dkim-private.key', 'utf8'),
  },
});
```

| Trigger | Template | Destinatário |
|---------|----------|-------------|
| Novo lead | "Novo lead recebido" | Corretor atribuído |
| Lead sem contato >24h | "Alerta: lead pendente" | Corretor + Admin |
| Tarefa próxima (1h) | "Lembrete de tarefa" | Corretor |
| Imóvel publicado | "Novo imóvel disponível" | Leads com interesse similar |
| Visita agendada | "Confirmação de visita" | Lead + Corretor |

**Templates React Email (MIT):**

```jsx
// emails/new-lead.tsx
import { Html, Button, Text } from '@react-email/components';

export default function NewLeadEmail({ lead, property }) {
  return (
    <Html>
      <Text>Novo lead: {lead.name}</Text>
      <Text>Interesse: {property.title}</Text>
      <Button href={`https://admin.primeUrban.com/leads/${lead.id}`}>
        Ver Lead
      </Button>
    </Html>
  );
}
```

### 7.3 Mapas e Geolocalização

- **OpenStreetMap via Leaflet (MIT):** Embed na página de detalhes
- **Nominatim (OSM):** Geocoding reverso (endereço → lat/long)
- **react-leaflet:** Componente React para mapas interativos

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[property.address.latitude, property.address.longitude]} zoom={15}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
  <Marker position={[property.address.latitude, property.address.longitude]}>
    <Popup>{property.title}</Popup>
  </Marker>
</MapContainer>
```

### 7.4 Analytics (PostHog Self-Hosted)

**Configuração PostHog:**

```javascript
// lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://posthog.primeUrban.com', // Self-hosted instance
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: {
      enabled: true,
      maskAllInputs: false, // LGPD: only mask sensitive fields
      maskTextSelector: '[data-sensitive]',
    },
  });
}
```

**Event Tracking:**

```javascript
// Exemplo: tracking de visualização de imóvel
posthog.capture('property_viewed', {
  property_id: property.id,
  property_code: property.code,
  property_price: property.price,
  property_type: property.type,
  property_category: property.category,
  neighborhood: property.address.neighborhood.name,
});

// Exemplo: tracking de lead creation com identify
posthog.identify(lead.email || lead.phone, {
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  interest_type: lead.interestType,
  source: lead.source,
});

posthog.capture('lead_created', {
  source: lead.source,
  interest_type: lead.interestType,
  budget_range: lead.budget,
});
```

---

## 8. Fluxos de Automação

### 8.1 Captura e Distribuição de Leads

```
Lead criado (formulário/WhatsApp)
  → PostHog identify + capture event
  → Verificar duplicidade (phone + email)
  → Se duplicado: merge + notificar corretor existente (Nodemailer)
  → Se novo: distribuir via round-robin para corretor ativo
  → Enviar e-mail de notificação ao corretor (Nodemailer + React Email template)
  → Se não contactado em 24h: escalar para admin (cron job + Nodemailer)
```

### 8.2 Score de Lead (PostHog Event-Based)

**Cálculo baseado em eventos PostHog:**

```javascript
// Hook afterChange no Lead collection
const calculateLeadScore = async (leadId) => {
  const events = await posthog.api.getEvents({
    distinct_id: lead.posthogDistinctId,
    event: ['property_viewed', 'property_detail_viewed', 'whatsapp_clicked', 'form_submitted', 'visit_scheduled'],
  });

  let score = 0;

  events.forEach((event) => {
    switch (event.event) {
      case 'property_viewed': score += 10; break;
      case 'property_detail_viewed': score += 15; break;
      case 'whatsapp_clicked': score += 20; break;
      case 'form_submitted': score += 30; break;
      case 'visit_scheduled': score += 40; break;
    }
  });

  // Penalizar inatividade
  const daysSinceLastEvent = (Date.now() - new Date(events[0].timestamp)) / (1000 * 60 * 60 * 24);
  if (daysSinceLastEvent > 7) score -= 20;
  if (daysSinceLastEvent > 30) score -= 50;

  // Session duration bonus
  const sessionDuration = events.reduce((acc, e) => acc + (e.properties.$session_duration || 0), 0);
  if (sessionDuration > 300) score += 15; // >5 min

  return Math.max(0, Math.min(100, score));
};
```

### 8.3 Notificação de Novos Imóveis

```
Imóvel publicado
  → PostHog event: property_published
  → Buscar leads com interesse similar (bairro + faixa de preço + categoria)
  → Enviar e-mail via Nodemailer: "Novo imóvel que pode te interessar" (template React Email)
  → Registrar atividade tipo "system" no lead
  → PostHog event: email_sent_new_property
```

---

## 9. Segurança e LGPD

### 9.1 Segurança

- Autenticação: Payload Auth (bcrypt + JWT com refresh tokens)
- Rate limiting: `express-rate-limit` nas API routes públicas
- Sanitização: Payload sanitiza inputs automaticamente; Zod validation adicional no frontend
- CSRF: Next.js CSRF protection nativo
- Headers: `next.config` com CSP, X-Frame-Options, HSTS
- **Backup:** pg_dump diário automatizado (cron) → MinIO bucket privado
- **SSL/TLS:** Caddy com Let's Encrypt automático
- **Firewall:** UFW configurado (apenas portas 80, 443, 22 abertas)
- **MinIO Access Control:** Buckets privados, signed URLs com expiry

**Configuração Caddy (HTTPS automático):**

```caddyfile
primeUrban.com {
  reverse_proxy localhost:3000

  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Frame-Options "SAMEORIGIN"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
    Content-Security-Policy "default-src 'self'; img-src 'self' https://minio.primeUrban.com; script-src 'self' 'unsafe-inline' https://posthog.primeUrban.com"
  }
}

admin.primeUrban.com {
  reverse_proxy localhost:3000
}

posthog.primeUrban.com {
  reverse_proxy localhost:8000
}

minio.primeUrban.com {
  reverse_proxy localhost:9000
}

errors.primeUrban.com {
  reverse_proxy localhost:8080
}

uptime.primeUrban.com {
  reverse_proxy localhost:3001

  basicauth {
    admin $2a$14$... # bcrypt hash
  }
}
```

### 9.2 LGPD Compliance

| Requisito | Implementação |
|-----------|--------------|
| Consentimento explícito | Checkbox obrigatório no formulário + timestamp + IP + PostHog consent event |
| Direito de acesso | API route `/api/lgpd/export?email=` — exporta dados do lead em JSON + eventos PostHog |
| Direito de exclusão | API route `/api/lgpd/delete?email=` — anonimiza dados (não deleta para integridade referencial) + apaga dados PostHog |
| Retenção de dados | Leads inativos >24 meses: anonimização automática via cron job |
| Portabilidade | Export CSV/JSON dos dados pessoais + eventos PostHog |
| DPO | Configurável nas settings do Payload (nome + e-mail do encarregado) |
| Política de Privacidade | Página `/privacidade` com texto completo |
| Cookie consent | Banner de cookies com opt-in (analytics) — PostHog consent mode |

**Anonimização LGPD:**

```javascript
// api/lgpd/delete.ts
export async function anonymizeLead(email: string) {
  const lead = await payload.find({ collection: 'leads', where: { email: { equals: email } } });

  if (!lead.docs[0]) return { success: false, error: 'Lead not found' };

  const leadId = lead.docs[0].id;

  // Anonimizar no PostgreSQL
  await payload.update({
    collection: 'leads',
    id: leadId,
    data: {
      name: 'ANONIMIZADO',
      email: `anonimizado-${leadId}@deleted.local`,
      phone: 'ANONIMIZADO',
      whatsapp: null,
      lgpdConsent: false,
    },
  });

  // Apagar dados do PostHog
  if (lead.docs[0].posthogDistinctId) {
    await fetch(`${POSTHOG_HOST}/api/person/${lead.docs[0].posthogDistinctId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
    });
  }

  return { success: true };
}
```

---

## 10. Testes

### 10.1 Estratégia

| Tipo | Ferramenta | Escopo |
|------|-----------|--------|
| Unit | Vitest | Utils, hooks, formatters |
| Integration | Vitest + Testing Library | Componentes com estado, formulários |
| E2E | Playwright | Fluxos críticos: busca, contato, login admin, CRUD imóvel |
| Visual | Playwright screenshots | Regressão visual de páginas-chave |

### 10.2 Fluxos E2E Críticos

1. Buscar imóvel → Filtrar → Ver detalhes → Clicar WhatsApp (PostHog events validados)
2. Preencher formulário de contato → Verificar lead criado no CRM + e-mail Nodemailer enviado
3. Login admin → Cadastrar imóvel → Upload foto → Sharp processing → Publicar → Verificar no site
4. Login admin → Mover lead no pipeline → Registrar atividade → Verificar PostHog event
5. Login admin → Gerar relatório → Exportar CSV

---

## 11. Monitoramento e Observabilidade

| Aspecto | Ferramenta | Métrica | Licença |
|---------|-----------|---------|---------|
| Erros | GlitchTip (self-hosted) | Error rate, stack traces, breadcrumbs | MIT |
| Performance | PostHog (self-hosted) | TTFB, FCP, LCP, CLS, INP via performance events | MIT |
| Uptime | Uptime Kuma | Uptime %, response time, alertas | MIT |
| Logs | Grafana Loki + Promtail | Request logs, error logs, query language | AGPLv3 |
| Business | Dashboard CRM + PostHog | Leads/dia, conversão, receita, funnels | - |

**Alertas:**

- Error rate > 1% → GlitchTip → E-mail admin via Nodemailer
- TTFB > 500ms sustentado → PostHog Alert → E-mail
- Uptime < 99.5% → Uptime Kuma → E-mail admin
- Disk usage > 80% → Loki alert → E-mail admin

**Configuração GlitchTip:**

```yaml
# docker-compose.yml (GlitchTip)
glitchtip:
  image: glitchtip/glitchtip:latest
  environment:
    DATABASE_URL: postgresql://user:pass@postgres:5432/glitchtip
    SECRET_KEY: ${SECRET_KEY}
    PORT: 8080
    EMAIL_URL: smtp://smtp.primeUrban.com:587
  ports:
    - "8080:8080"
```

**Configuração Loki:**

```yaml
# docker-compose.yml (Loki + Promtail)
loki:
  image: grafana/loki:latest
  ports:
    - "3100:3100"
  volumes:
    - ./loki-config.yaml:/etc/loki/local-config.yaml
    - loki-data:/loki

promtail:
  image: grafana/promtail:latest
  volumes:
    - /var/log:/var/log
    - ./promtail-config.yaml:/etc/promtail/config.yml
  command: -config.file=/etc/promtail/config.yml
```

**Exemplo de Query Loki:**

```logql
{job="primeUrban"} |= "error" | json | error_code >= 500
```

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
- **Sharp processing:** Imagens otimizadas em < 3s (WebP + thumbnail)
- **PostgreSQL:** Queries < 50ms com índices otimizados
- **MinIO:** Download de imagens < 100ms (com CDN Caddy)

### 12.2 SEO

- URLs: `/imoveis`, `/imovel/[slug]`, `/bairros/[slug]`
- `sitemap.xml` dinâmico (gerado pelo Next.js)
- Schema.org: `RealEstateListing`, `BreadcrumbList`, `Organization`
- Meta tags dinâmicas por imóvel (Payload SEO Plugin)
- Canonical URLs
- Open Graph + Twitter Cards
- `robots.txt` configurado
- **Structured Data Validation:** Google Rich Results Test

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
- Galeria: swipe nativo no mobile (Leaflet touch support)

---

## 13. Roadmap de Implementação

### Fase 1 — MVP CMS (Semanas 1-3)

**Objetivo:** CMS funcionando com dados reais no site.

**Semana 1: Setup e Estrutura**

- [ ] Instalar Payload CMS 3.x no projeto existente
- [ ] Configurar PostgreSQL 16+ (Docker) + pgBouncer
- [ ] Criar collections: Users, Properties, Neighborhoods, Media, Tags, Amenities
- [ ] Configurar Payload Auth (roles: admin, agent, assistant)
- [ ] Configurar MinIO (Docker) + S3 SDK
- [ ] Configurar Sharp para processamento de imagens
- [ ] Configurar GlitchTip para error tracking
- [ ] Seed: migrar dados mockados atuais para o banco

**Semana 2: CMS Core**

- [ ] Formulário multi-etapas de cadastro de imóvel
- [ ] Upload de imagens com drag-and-drop e reordenação
- [ ] Hook Sharp: processamento automático (WebP, thumbnails) + upload MinIO
- [ ] Live preview de imóveis
- [ ] CRUD de bairros e comodidades
- [ ] SEO plugin configurado
- [ ] Ações em lote (publicar, pausar)

**Semana 3: Frontend Integration**

- [ ] Conectar listagem ao Payload Local API
- [ ] Página de detalhes dinâmica com ISR
- [ ] Filtros funcionais com full-text search (pg_trgm)
- [ ] Sitemap dinâmico + Schema.org
- [ ] Mapas OpenStreetMap (react-leaflet)
- [ ] Deploy no VPS (Docker Compose + Caddy)
- [ ] Testes E2E: busca + detalhes + contato

### Fase 2 — CRM (Semanas 4-6)

**Objetivo:** Captura e gestão de leads.

**Semana 4: Leads e Captura**

- [ ] Collection Leads + Deals
- [ ] Formulário de contato com LGPD consent
- [ ] Integração WhatsApp (deep link + webhook de tracking)
- [ ] Captura automática + distribuição round-robin
- [ ] Detecção de duplicidade
- [ ] API routes com rate limiting (`express-rate-limit`)
- [ ] PostHog self-hosted deployment (Docker)

**Semana 5: Pipeline e Atividades**

- [ ] Kanban de pipeline (drag-and-drop)
- [ ] Collection Activities
- [ ] Sistema de tarefas com datas de vencimento
- [ ] Timeline de interações no perfil do lead
- [ ] Score automático de leads (PostHog events)
- [ ] Notificações por e-mail (Nodemailer + React Email templates)
- [ ] PostHog event tracking (frontend + backend)

**Semana 6: Analytics e Relatórios**

- [ ] Dashboard de métricas no admin (PostHog Insights embed)
- [ ] Relatórios exportáveis (CSV)
- [ ] PostHog Funnels configurados (busca → detalhes → contato → lead)
- [ ] PostHog Session Replay ativo
- [ ] View count + contact count nos imóveis (PostHog events)
- [ ] Ranking de corretores
- [ ] Testes E2E: pipeline + lead lifecycle

### Fase 3 — Automações e Hardening (Semanas 7-8)

**Objetivo:** Automações, LGPD completo, preparação para escala.

**Semana 7: Automações e LGPD**

- [ ] Workflow: notificar leads sobre novos imóveis (Nodemailer)
- [ ] Workflow: escalar leads sem contato >24h
- [ ] Templates de mensagens WhatsApp/e-mail (React Email)
- [ ] Importação CSV de leads
- [ ] LGPD: rotas de export/delete, anonimização automática (PostHog integration), cookie consent
- [ ] Política de privacidade
- [ ] Uptime Kuma deployment e configuração de alertas

**Semana 8: Preparação para Escala**

- [ ] Dockerização completa (docker-compose.yml final)
- [ ] Scripts de backup automatizado (pg_dump → MinIO bucket privado)
- [ ] Grafana Loki + Promtail para log aggregation
- [ ] Documentação de deployment (VPS setup guide)
- [ ] Testes de carga (k6 ou Artillery)
- [ ] Otimização de queries lentas (EXPLAIN ANALYZE)
- [ ] Revisão de segurança (headers, rate limits, sanitização)
- [ ] Configuração UFW firewall
- [ ] Fail2ban para proteção SSH

---

## 14. Modelo de Dados Relacional

```
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
│posthogDID    │  │    │ parking, areas (m²)       │       ┌──────────────┐
└──────────────┘  │    │ floor, year, facing       │       │    Media     │
      │           │    │ featured_image (FK→Media) │───────│ id (PK)      │
      │           │    │ video_url                 │       │ url (MinIO)  │
      │           │    │ meta_title, meta_desc     │       │ formats JSON │
      │           │    │ view_count, contact_count │       │ mime, size   │
      │           │    │ featured, highlight_text  │       │ folder       │
      │           │    └──────────────────────────┘       └──────────────┘
      │           │              │  │  │
      │           │    ┌─────────┘  │  └────────────┐      ┌──────────────┐
      │           │    │            │               │      │    Tags      │
      │           │    ▼            ▼               ▼      ├──────────────┤
      │           │ PropertyMedia  PropertyAmenities PropertyTags  │ id (PK)      │
      │           │ (FK→Media)     (FK→Amenities)   (FK→Tags)     │ label, slug  │
      │           │                                        │ color        │
      │           │    ┌──────────────┐                    └──────────────┘
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
      │                │posthogDistinctId     │
      │                │posthogSessionId      │
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
```

---

## 15. Checklist de Validação

### CMS

- [ ] Cadastro de imóvel em < 5 minutos
- [ ] Upload de até 30 fotos simultâneas com progress bar
- [ ] Processamento Sharp (WebP + thumbnails) em < 3s por imagem
- [ ] Upload MinIO bem-sucedido e URLs públicas funcionais
- [ ] Live preview funcional
- [ ] Busca full-text por código/título/bairro (typo-tolerant via pg_trgm)
- [ ] Publicação/despublicação em 1 clique
- [ ] Edição em massa (status, preço, corretor)
- [ ] Card exibe: imagem (MinIO), tipo, preço, localização, quartos, banheiros, vagas, m², código
- [ ] Ficha técnica completa na página de detalhes
- [ ] Filtros por todas as características
- [ ] Schema.org validado (Google Rich Results Test)
- [ ] Sitemap.xml gerado e indexável

### CRM

- [ ] Captura automática de leads do site (formulário + WhatsApp click)
- [ ] Notificação por e-mail (Nodemailer) ao corretor em < 1 minuto
- [ ] PostHog event capture funcionando (lead_created, property_viewed, etc.)
- [ ] PostHog identify vinculando leads a sessões
- [ ] Pipeline Kanban funcional (drag-and-drop)
- [ ] Distribuição round-robin funcionando
- [ ] Detecção de duplicidade por phone + email
- [ ] Histórico completo de interações (timeline)
- [ ] Score de lead calculado corretamente (PostHog events)
- [ ] PostHog Session Replay acessível no perfil do lead
- [ ] Oportunidade vinculada a lead + imóvel específico
- [ ] Relatórios gerados em < 3 segundos
- [ ] Exportação CSV funcional
- [ ] Motivo de perda obrigatório

### Analytics (PostHog)

- [ ] Dashboard PostHog acessível em `posthog.primeUrban.com`
- [ ] Funnels configurados (busca → detalhes → contato → lead)
- [ ] Session Replay gravando sessões
- [ ] PostHog Insights embed no admin CRM
- [ ] Feature Flags funcionais (para A/B testing futuro)
- [ ] PostHog API respondendo para cálculo de score

### Segurança e LGPD

- [ ] Rate limiting ativo em todas as rotas públicas
- [ ] Caddy HTTPS funcionando (certificado Let's Encrypt válido)
- [ ] Headers de segurança configurados (CSP, HSTS)
- [ ] Consentimento LGPD registrado com timestamp + IP
- [ ] Rota de export de dados funcional (incluindo PostHog events)
- [ ] Rota de anonimização funcional (PostgreSQL + PostHog person delete)
- [ ] Backup diário verificado (restore test)
- [ ] Cookie consent banner funcional (PostHog consent mode)
- [ ] UFW firewall configurado
- [ ] Fail2ban ativo para SSH

### Monitoramento

- [ ] GlitchTip capturando erros corretamente
- [ ] Uptime Kuma monitorando todos os serviços (Next.js, PostHog, MinIO, PostgreSQL)
- [ ] Loki + Promtail coletando logs
- [ ] Alertas de erro funcionando (GlitchTip → E-mail via Nodemailer)
- [ ] Alertas de uptime funcionando (Uptime Kuma → E-mail)
- [ ] Alertas de disco cheio funcionando (Loki → E-mail)

### Performance

- [ ] TTFB < 200ms em páginas ISR
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Lighthouse score ≥ 90 (Performance, SEO, Accessibility)
- [ ] Zero erros GlitchTip no primeiro dia pós-deploy
- [ ] MinIO response time < 100ms
- [ ] PostgreSQL query time < 50ms (com pgBouncer)

### Deployment (VPS)

- [ ] Docker Compose funcionando com todos os serviços
- [ ] Caddy reverse proxy configurado e HTTPS ativo
- [ ] PostgreSQL + pgBouncer operacionais
- [ ] MinIO operacional e buckets criados
- [ ] PostHog self-hosted acessível
- [ ] GlitchTip self-hosted acessível
- [ ] Uptime Kuma self-hosted acessível
- [ ] Loki + Promtail operacionais
- [ ] Volumes persistentes montados corretamente
- [ ] Auto-restart de containers configurado (`restart: unless-stopped`)

---

## 16. Docker Compose Completo

```yaml
version: '3.9'

services:
  # ==================== Database ====================
  postgres:
    image: postgres:16-alpine
    container_name: primeUrban-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: primeUrban
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
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
      - postgres
    networks:
      - primeUrban-net

  # ==================== Storage ====================
  minio:
    image: minio/minio:latest
    container_name: primeUrban-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio-data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - primeUrban-net

  # ==================== Application ====================
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
      MINIO_ENDPOINT: minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      POSTHOG_HOST: http://posthog:8000
      POSTHOG_API_KEY: ${POSTHOG_API_KEY}
      GLITCHTIP_DSN: ${GLITCHTIP_DSN}
    depends_on:
      - pgbouncer
      - minio
      - posthog
    networks:
      - primeUrban-net

  # ==================== Analytics ====================
  posthog:
    image: posthog/posthog:latest
    container_name: primeUrban-posthog
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/posthog
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${POSTHOG_SECRET_KEY}
      SITE_URL: https://posthog.primeUrban.com
    depends_on:
      - postgres
      - redis
    networks:
      - primeUrban-net

  redis:
    image: redis:7-alpine
    container_name: primeUrban-redis
    restart: unless-stopped
    networks:
      - primeUrban-net

  # ==================== Error Tracking ====================
  glitchtip:
    image: glitchtip/glitchtip:latest
    container_name: primeUrban-glitchtip
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/glitchtip
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
      PORT: 8080
      EMAIL_URL: smtp://${SMTP_USER}:${SMTP_PASS}@${SMTP_HOST}:587
    depends_on:
      - postgres
    networks:
      - primeUrban-net

  # ==================== Monitoring ====================
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    container_name: primeUrban-uptime
    restart: unless-stopped
    volumes:
      - uptime-kuma-data:/app/data
    networks:
      - primeUrban-net

  # ==================== Logs ====================
  loki:
    image: grafana/loki:latest
    container_name: primeUrban-loki
    restart: unless-stopped
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - loki-data:/loki
    networks:
      - primeUrban-net

  promtail:
    image: grafana/promtail:latest
    container_name: primeUrban-promtail
    restart: unless-stopped
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yaml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    networks:
      - primeUrban-net

  # ==================== Reverse Proxy ====================
  caddy:
    image: caddy:latest
    container_name: primeUrban-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
    networks:
      - primeUrban-net

volumes:
  postgres-data:
  minio-data:
  loki-data:
  uptime-kuma-data:
  caddy-data:
  caddy-config:

networks:
  primeUrban-net:
    driver: bridge
```

---

## 17. Comparação: Proprietário vs. MIT/OpenSource

| Aspecto | Stack Proprietária (Original) | Stack MIT/OpenSource |
|---------|-------------------------------|---------------------|
| **Custo Mensal (estimado)** | $180-300/mês (Vercel Pro + Neon + Cloudinary + Resend + Sentry) | $40-80/mês (VPS 8GB RAM + domínio) |
| **Custo Anual** | $2.160-3.600 | $480-960 |
| **Economia em 3 anos** | - | $5.040-7.920 |
| **Controle de Dados** | Dados em múltiplos provedores (EUA) | 100% self-hosted (Brasil) |
| **LGPD Compliance** | DPA necessário com cada provedor | Simplificado (dados locais) |
| **Vendor Lock-in** | Alto (APIs proprietárias) | Zero (padrões abertos) |
| **Escalabilidade** | Baseada em uso ($$) | Baseada em VPS (upgrade simples) |
| **Customização** | Limitada (planos e APIs) | Ilimitada (código aberto) |
| **Latência (Brasil)** | 80-150ms (EUA → BR) | 10-30ms (local) |
| **Backup/Restore** | Dependente de provedor | Controle total (pg_dump + MinIO) |
| **Portabilidade** | Complexa (migração de dados) | Simples (Docker export/import) |
| **Analytics Depth** | Básico (Vercel Analytics) | Profundo (PostHog: session replay, heatmaps, funnels, A/B testing) |
| **Error Tracking** | Robusto (Sentry SaaS) | Equivalente (GlitchTip: Sentry-compatible API) |
| **Image Processing** | CDN global + transformações (Cloudinary) | Local + cache (Sharp + MinIO + Caddy) |
| **Email Deliverability** | Alta (Resend infra) | Alta (SMTP + DKIM configurado) |
| **Deploy Complexity** | Baixa (git push) | Média (Docker + Caddy setup inicial) |
| **Manutenção** | Mínima (managed services) | Média (updates, backups, monitoring) |
| **Licenciamento** | Proprietário | MIT/Apache/AGPLv3 (100% open-source) |

**Vantagens da Stack MIT/OpenSource:**

1. **Econômica:** 70-80% de economia em 3 anos
2. **LGPD-Friendly:** Dados 100% no Brasil, sem transferência internacional
3. **Performance:** Latência menor (servidor local)
4. **Controle Total:** Código aberto, customizações ilimitadas
5. **Lock-in Zero:** Migração simples entre VPS providers
6. **Analytics Avançado:** PostHog > Vercel Analytics (session replay, feature flags)
7. **Escalabilidade Previsível:** Custo fixo de VPS independente de tráfego

**Trade-offs:**

1. **Setup Inicial:** Requer conhecimento de Docker, Linux, Caddy
2. **Manutenção:** Responsabilidade de updates, backups, monitoramento
3. **Deliverability:** Email requer configuração DKIM/SPF (mas é padrão)
4. **Sem CDN Global:** MinIO local (pode adicionar Cloudflare Free CDN na frente)

---

*PRD v2.0-MIT — PrimeUrban CMS+CRM. Stack: Next.js 16 + Payload CMS 3.x + PostgreSQL + Sharp + MinIO + PostHog + GlitchTip + Nodemailer. 100% MIT/OpenSource (exceto VPS).*
