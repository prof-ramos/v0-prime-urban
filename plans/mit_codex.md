# CMS e CRM - Product Requirements Document (PRD)

**PrimeUrban - Sistema Imobiliário Completo (MIT/Open Source)**  
*Última atualização: Fevereiro 2026*  
*Versão: 3.1 (MIT Codex)*

---

## 1. Visão Geral do Produto

### 1.1 Propósito

Sistema integrado de CMS + CRM para a PrimeUrban, com foco em:

1. Gestão de imóveis com workflow editorial
2. Captação, qualificação e acompanhamento de leads
3. Gestão de pipeline comercial com tarefas e SLAs
4. Operação 100% baseada em ferramentas MIT/Open Source (infra em VPS)

### 1.2 Stack Tecnológico (MIT/Open Source)

| Camada | Tecnologia | Licença | Justificativa |
|---|---|---|---|
| Framework web | Next.js 16 (App Router) | MIT | SSR/ISR, Route Handlers, cache tagging |
| Linguagem | TypeScript 5.x | Open Source | Tipagem end-to-end |
| UI | Tailwind CSS 4 + shadcn/ui + Radix | MIT | Design system consistente |
| CMS/Admin | Payload CMS 3.x (integrado ao Next.js) | MIT | Admin pronto, collections tipadas, APIs REST/GraphQL |
| ORM/Query | Payload DB Adapter + SQL nativo (Prisma opcional) | MIT / Apache-2.0 | Menos camadas no core; Prisma opcional para BI/relatórios |
| Banco | PostgreSQL 16 + extensões `pg_trgm`/FTS | Open Source | Relacional, busca textual, consistência |
| Cache/Filas | Redis 7 + BullMQ | BSD-3 / MIT | Jobs, retries, backoff, rate limiting |
| Storage | MinIO (S3-compatible) | AGPLv3 | Armazenamento de mídia self-hosted |
| Processamento de imagem | imgproxy | MIT | Resize/crop on-the-fly sem SaaS |
| Auth | Payload Auth (roles/sessions/JWT) | MIT | RBAC nativo no admin e integração direta com collections |
| E-mail transacional | Nodemailer + SMTP self-host (Postfix) | MIT / Open Source | Sem dependência de fornecedor proprietário |
| Observabilidade | Prometheus + Grafana + Loki + Uptime Kuma | Open Source | Métricas, logs, alertas, uptime |
| Reverse proxy/TLS | Caddy | Apache-2.0 | HTTPS automático e configuração simples |
| Analytics web | Matomo self-hosted | GPL | Métricas de produto sem SaaS proprietário |

### 1.3 Arquitetura de Deployment

**Fase 1 — MVP em VPS única (Docker Compose):**

```txt
┌────────────────────────────────────────────────────────────┐
│                    VPS (Ubuntu 24.04 LTS)                 │
│                                                            │
│  ┌────────────────────┐       ┌─────────────────────────┐  │
│  │ Next.js App        │◄─────►│ Payload CMS            │  │
│  │ Frontend público   │ local │ (/admin + REST/GraphQL)│  │
│  └──────────┬─────────┘       └──────────┬──────────────┘  │
│             │                             │                 │
│     ┌───────▼────────┐       ┌───────────▼───────────┐     │
│     │ PostgreSQL 16   │       │ Redis 7 + BullMQ      │     │
│     └───────┬────────┘       └───────────┬───────────┘     │
│             │                             │                 │
│     ┌───────▼────────┐       ┌───────────▼───────────┐     │
│     │ MinIO + imgproxy│      │ Worker (automações)   │     │
│     └────────────────┘       └───────────────────────┘     │
│                                                            │
│  Caddy (TLS) + Prometheus + Grafana + Loki + Uptime Kuma  │
└────────────────────────────────────────────────────────────┘
```

**Fase 2 — Escala (2 VPS + DB dedicado):**

- VPS-A: App + Admin + Workers + Proxy
- VPS-B: PostgreSQL + Redis + MinIO (discos dedicados)
- Backup remoto versionado e restore testado
- Failover operacional via runbooks

---

## 2. Personas e Fluxos de Usuário

### 2.1 Persona 1: Comprador/Locador

**Perfil:** usuário final que compara imóveis digitalmente antes do contato humano.

**Jobs to be Done:**

1. Encontrar imóveis compatíveis com critérios reais
2. Entender detalhes (fotos, metragem, localização, custos)
3. Entrar em contato rápido (WhatsApp/formulário)
4. Receber oportunidades parecidas depois

**Fluxo resumido:**

```txt
Entrada (SEO/Ads/Indicação)
  -> Busca/Filtros
  -> Listagem (cards)
  -> Detalhes do imóvel
  -> Conversão (WhatsApp/Form/Agendamento)
  -> Lead no CRM + atividade automática
```

**Filtros obrigatórios do catálogo:**

| # | Filtro | Input |
|---|---|---|
| 1 | Tipo (Compra/Aluguel) | Toggle |
| 2 | Categoria | Multi-select |
| 3 | Bairro | Multi-select com busca |
| 4 | Faixa de preço | Range |
| 5 | Quartos | 1+, 2+, 3+, 4+ |
| 6 | Banheiros | 1+, 2+, 3+ |
| 7 | Vagas | 1+, 2+, 3+ |
| 8 | Área | Range |
| 9 | Características | Chips |
| 10 | Palavra-chave | Input com debounce |

### 2.2 Persona 2: Corretor/Admin

**Perfil:** equipe interna que publica imóveis e acompanha funil comercial.

**Jobs to be Done:**

1. Cadastrar/atualizar imóveis rápido
2. Atender e qualificar leads sem perder timing
3. Operar pipeline de vendas/aluguel
4. Medir desempenho por fonte, corretor e bairro

**Roles e permissões:**

| Recurso | admin | agent | assistant |
|---|---|---|---|
| Imóveis CRUD | ✅ | ✅ | leitura |
| Publicar/despublicar | ✅ | ❌ | ❌ |
| Leads (todos) | ✅ | atribuídos | ❌ |
| Pipeline (mover estágio) | ✅ | ✅ | ❌ |
| Relatórios | ✅ | parcial | ❌ |
| Configurações | ✅ | ❌ | ❌ |

---

## 3. Estrutura de Dados (Domínio + Payload Collections)

### 3.1 Imóveis (`properties`)

```ts
interface Property {
  id: string;
  title: string;
  slug: string;
  code: string;
  status: 'draft' | 'published' | 'sold' | 'rented' | 'paused';

  type: 'sale' | 'rent';
  category: 'apartment' | 'house' | 'commercial' | 'land' | 'penthouse' | 'studio';

  price: number;
  condominiumFee?: number;
  iptu?: number;

  bedrooms: number;
  suites?: number;
  bathrooms: number;
  parkingSpots: number;
  totalArea: number;
  privateArea?: number;

  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhoodId: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };

  shortDescription: string;
  fullDescription: string;

  featuredImageId?: string;
  galleryImageIds: string[];
  videoUrl?: string;

  amenityIds: string[];
  buildingFeatureIds?: string[];
  tagIds?: string[];

  featured: boolean;
  highlightText?: string;

  agentId: string;

  seoTitle?: string;
  seoDescription?: string;

  viewCount: number;
  contactCount: number;

  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
```

### 3.1.1 Campos de card (listagem)

Obrigatórios no card:

1. Imagem de destaque
2. Tipo + categoria
3. Preço formatado em BRL
4. Título e bairro/cidade
5. Quartos, banheiros, vagas, área
6. Código do imóvel
7. CTA: Ver detalhes

### 3.1.2 Ficha técnica (detalhes)

Seções obrigatórias:

1. Galeria (lightbox)
2. Bloco principal (preço, código, localização)
3. Características
4. Custos (condomínio/IPTU)
5. Comodidades
6. Descrição completa
7. Mapa (Leaflet + OSM)
8. Corretor responsável
9. Imóveis similares
10. CTA flutuante mobile

### 3.2 Bairros (`neighborhoods`)

```ts
interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  description?: string;
  averagePrice?: number;
  propertyCount?: number;
  active: boolean;
}
```

### 3.3 Mídia (`media`)

```ts
interface Media {
  id: string;
  filename: string;
  alt: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  objectKey: string; // MinIO key
  folder?: string;
  createdAt: Date;
}
```

### 3.4 Tags (`tags`)

```ts
interface Tag {
  id: string;
  label: string;
  slug: string;
  color: string;
  active: boolean;
}
```

### 3.5 Comodidades (`amenities`)

```ts
interface Amenity {
  id: string;
  label: string;
  slug: string;
  icon: string;
  category: 'property' | 'building';
  active: boolean;
}
```

### 3.6 Leads (`leads`)

```ts
interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;

  source: 'website' | 'whatsapp' | 'facebook' | 'instagram' | 'google_ads' | 'indication' | 'portal' | 'other';
  sourceDetails?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  interestType: 'buy' | 'rent' | 'sell' | 'invest';
  budgetMin?: number;
  budgetMax?: number;

  preferredNeighborhoodIds?: string[];
  preferredCategories?: string[];

  viewedPropertyIds?: string[];
  favoritePropertyIds?: string[];

  status: 'new' | 'contacted' | 'qualified' | 'visit_scheduled' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
  priority: 'low' | 'medium' | 'high' | 'hot';
  lostReason?: 'price' | 'location' | 'timing' | 'competitor' | 'no_response' | 'other';

  assignedToId?: string;

  lgpdConsent: boolean;
  consentDate: Date;
  consentIP?: string;

  score?: number;
  lastContactAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.7 Oportunidades (`deals`)

```ts
interface Deal {
  id: string;
  leadId: string;
  propertyId: string;
  type: 'sale' | 'rent';

  askingPrice: number;
  offerPrice?: number;
  finalPrice?: number;

  stage: 'interest' | 'visit' | 'proposal' | 'negotiation' | 'documentation' | 'closed_won' | 'closed_lost';
  probability?: number;

  commissionRate?: number;
  commissionValue?: number;

  expectedCloseDate?: Date;
  closedAt?: Date;

  agentId: string;
  notes?: string;
}
```

### 3.8 Atividades (`activities`)

```ts
interface Activity {
  id: string;
  leadId: string;
  dealId?: string;
  type: 'call' | 'whatsapp' | 'email' | 'visit' | 'note' | 'task' | 'proposal' | 'system';
  description: string;
  scheduledAt?: Date;
  dueAt?: Date;
  completedAt?: Date;
  result?: 'success' | 'no_answer' | 'callback' | 'not_interested' | 'rescheduled' | 'other';
  createdById: string;
  createdAt: Date;
}
```

### 3.9 Usuários (`users`)

```ts
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'agent' | 'assistant';
  phone?: string;
  creci?: string;
  bio?: string;
  active: boolean;
  commissionRate?: number;
  createdAt: Date;
}
```

---

## 4. Módulos do Sistema

### 4.1 CMS (conteúdo imobiliário)

#### 4.1.1 Dashboard

- Cards de KPI: imóveis ativos, leads do dia, conversão do mês, receita potencial
- Fila de pendências: tarefas vencidas, leads sem contato > 24h
- Gráfico de leads por fonte (30 dias)

#### 4.1.2 Gestão de imóveis

- Lista com filtros, busca, ordenação e paginação server-side
- Operação no Admin do Payload (`/admin`) com controle por role
- Formulário multi-etapas:
  1. Básico
  2. Localização
  3. Características
  4. Mídia
  5. SEO + publicação
- Preview antes de publicar
- Bulk actions (publicar, pausar, atribuir corretor)
- Duplicar imóvel
- Histórico de versão (auditoria)

#### 4.1.3 Gestão de taxonomias

- CRUD para bairros, tags e comodidades
- Atualização automática de contagens e preço médio por bairro

#### 4.1.4 Mídia

- Upload para MinIO
- Processamento em imgproxy (`webp`, `avif`, resize responsivo)
- Reordenação da galeria
- Limites: até 30 fotos/imóvel, até 12MB/foto

### 4.2 CRM (relacionamento e funil)

#### 4.2.1 Pipeline

```txt
Novo -> Contactado -> Qualificado -> Visita -> Proposta -> Negociação -> Fechado (Ganho/Perdido)
```

- Kanban + lista
- Filtros por corretor, prioridade, origem, bairro
- Motivo de perda obrigatório

#### 4.2.2 Leads

- Perfil completo com timeline
- Ações rápidas: WhatsApp, ligação, e-mail, agendar visita
- Importação CSV
- Merge de duplicados (telefone/e-mail)
- Distribuição round-robin configurável

#### 4.2.3 Deals

- Lead <-> imóvel
- Proposta/contraproposta
- Comissão calculada
- Previsão de receita por probabilidade

#### 4.2.4 Atividades e tarefas

- SLA por etapa
- Alertas de tarefa próxima e vencida
- Templates operacionais

#### 4.2.5 Relatórios

- Leads por fonte
- Conversão por etapa
- Top imóveis (views/leads)
- Ranking de corretores
- Receita potencial vs realizada
- Exportação CSV

---

## 5. API Routes

### 5.1 Rotas públicas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/properties` | Listagem com filtros/paginação |
| GET | `/api/properties/[slug]` | Detalhes do imóvel |
| GET | `/api/neighborhoods` | Bairros ativos |
| POST | `/api/leads` | Criação de lead |
| POST | `/api/properties/[id]/view` | Incrementa visualização |
| GET | `/api/search` | Busca full-text/fuzzy |

### 5.2 Rotas autenticadas (admin)

| Método | Rota | Escopo |
|---|---|---|
| GET/POST/PATCH/DELETE | `/api/properties` | CRUD imóveis (Payload REST + ACL) |
| GET/POST/PATCH/DELETE | `/api/leads` | Gestão de leads (Payload REST + ACL) |
| PATCH | `/api/leads/[id]` | Atualização de estágio/motivo de perda |
| GET/POST/PATCH/DELETE | `/api/deals` | Oportunidades |
| GET/POST/PATCH/DELETE | `/api/activities` | Atividades e tarefas |
| GET | `/api/admin/reports/*` | Relatórios agregados customizados |

### 5.3 Revalidação e eventos

- `POST /api/internal/revalidate` (token interno)
- `POST /api/internal/jobs/lead-score`
- `POST /api/internal/jobs/notify-similar`

### 5.4 Rate limiting

| Rota | Limite |
|---|---|
| `POST /api/leads` | 5 req/min por IP |
| `POST /api/properties/[id]/view` | 1 req/min por IP+imóvel |
| `GET /api/properties` | 60 req/min por IP |
| `GET /api/search` | 30 req/min por IP |

---

## 6. Estratégia de Cache e Performance

### 6.1 Next.js (base Context7)

- ISR para páginas de imóvel e bairro
- Revalidação por evento usando `revalidatePath` e `revalidateTag`
- Cache com tags de domínio (`property:{id}`, `neighborhood:{id}`)

| Página | Estratégia | Revalidação |
|---|---|---|
| Home | ISR | 60s + on-demand |
| `/imoveis` | SSR com cache curto | 30s |
| `/imovel/[slug]` | ISR | on-demand após update |
| `/bairros/[slug]` | ISR | 1h |

### 6.2 Banco de dados (base Context7 + Payload/PostgreSQL)

- Índices obrigatórios: `slug`, `status`, `type`, `category`, `price`, `neighborhood_id`
- Índice composto: `(status, type, category, neighborhood_id)`
- Índices em FKs com alta cardinalidade (via migração SQL/adapter)
- Busca com `tsvector` + `pg_trgm`
- Migrações versionadas e revisadas em ambiente de staging

### 6.3 Imagens

- Armazenamento em MinIO (bucket privado + URL assinada quando necessário)
- Transformação em imgproxy
- `next/image` com `sizes`, lazy loading e formatos modernos

---

## 7. Integrações Open Source

### 7.1 WhatsApp

- Deep link `wa.me` com mensagem contextual
- Evento de clique gera atividade e sinal de intenção no CRM
- Opcional: integração posterior com stack open source de atendimento (ex.: Chatwoot)

### 7.2 E-mail

| Trigger | Ação |
|---|---|
| Novo lead | Notifica corretor responsável |
| Sem contato >24h | Escala para admin |
| Tarefa próxima | Lembrete para responsável |
| Imóvel publicado | Notifica leads com perfil similar |

### 7.3 Analytics e mapas

- Matomo para eventos (`view_property`, `lead_submit`, `whatsapp_click`)
- Leaflet + OpenStreetMap para mapa de imóvel

---

## 8. Fluxos de Automação (BullMQ)

### 8.1 Captura e distribuição de lead

```txt
Lead criado
  -> validar duplicidade (phone/email)
  -> merge ou criação
  -> atribuição round-robin
  -> notificação ao corretor
  -> SLA 24h (job de escalonamento)
```

### 8.2 Score de lead

```txt
+10 visualização de imóvel
+20 clique em WhatsApp
+30 formulário enviado
+40 visita agendada
+50 proposta enviada
-20 sem interação em 7 dias
-50 sem interação em 30 dias
```

### 8.3 Boas práticas de fila (base Context7 BullMQ)

- `attempts` + `backoff` (fixed/exponential)
- tratamento de rate limit via mecanismo nativo
- filas separadas: `lead-ingest`, `notifications`, `maintenance`
- workers idempotentes e com DLQ (fila de falhas)

---

## 9. Segurança e LGPD

### 9.1 Segurança

- Sessão com cookie HTTP-only + Secure + SameSite
- Hash de senha forte (`argon2id` ou `bcrypt` com custo alto)
- RBAC por role e escopo de dados
- Validação com Zod nas entradas públicas
- CSP, HSTS, X-Frame-Options, Referrer-Policy
- Backup diário de DB e storage

### 9.2 LGPD

| Requisito | Implementação |
|---|---|
| Consentimento | Checkbox obrigatório + timestamp + IP |
| Acesso do titular | Export JSON/CSV por e-mail verificado |
| Exclusão/anonimização | Job de anonimização preservando integridade relacional |
| Retenção | Anonimização automática após período configurável |
| Registro de operações | Audit log de leitura/edição/exportação |

---

## 10. Testes

### 10.1 Estratégia

| Tipo | Ferramenta | Escopo |
|---|---|---|
| Unit | Vitest | regras de negócio e utilitários |
| Integration | Vitest + Testing Library | componentes e formulários |
| API | Supertest (ou equivalente) | rotas e auth |
| E2E | Playwright | fluxos críticos ponta a ponta |
| Carga | k6 | endpoints e concorrência |

### 10.2 Fluxos E2E críticos

1. Buscar imóvel -> aplicar filtros -> abrir detalhe -> WhatsApp
2. Enviar formulário -> lead criado -> atividade registrada
3. Login admin -> cadastrar imóvel -> publicar -> página pública revalidada
4. Mover lead no pipeline -> criar tarefa -> concluir atividade
5. Gerar relatório e exportar CSV

---

## 11. Monitoramento e Observabilidade

| Camada | Ferramenta | Métrica-chave |
|---|---|---|
| Uptime | Uptime Kuma | disponibilidade e latência |
| Métricas | Prometheus | CPU, RAM, conexões, filas |
| Dashboards | Grafana | visão técnica + negócio |
| Logs | Loki | erros, requests, jobs |
| Produto | Matomo + CRM | conversão, origem, receita |

**Alertas mínimos:**

- erro 5xx > 1% por 5 min
- fila com backlog acima do limite
- disco > 80%
- sem backup válido no dia

---

## 12. Requisitos Não-Funcionais

### 12.1 Performance

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- TTFB < 300ms (ISR/cache quente)
- capacidade inicial: 5.000+ imóveis e 50.000+ leads

### 12.2 SEO

- URLs limpas e semânticas
- sitemap dinâmico
- Schema.org (`RealEstateListing`, `BreadcrumbList`, `Organization`)
- canonical + OpenGraph + robots

### 12.3 Acessibilidade

- WCAG 2.1 AA
- navegação por teclado
- contraste mínimo 4.5:1
- labels e landmarks corretos

### 12.4 Responsividade

- mobile-first
- breakpoints: 640 / 768 / 1024 / 1280
- grade de cards responsiva

---

## 13. Roadmap de Implementação (8 semanas)

### Fase 1 - Base CMS (Semanas 1-3)

**Semana 1**

- [ ] Setup de infraestrutura local e VPS
- [ ] Payload CMS + PostgreSQL + migrações iniciais
- [ ] Payload Auth + RBAC
- [ ] Modelos: users, properties, neighborhoods, media, tags, amenities

**Semana 2**

- [ ] CRUD completo de imóveis
- [ ] Upload MinIO + processamento imgproxy
- [ ] Preview e publicação
- [ ] Busca com filtros principais

**Semana 3**

- [ ] Página de listagem + detalhe em ISR
- [ ] SEO técnico base
- [ ] E2E de busca e detalhe

### Fase 2 - CRM (Semanas 4-6)

**Semana 4**

- [ ] Leads + formulário + consentimento LGPD
- [ ] Round-robin de distribuição
- [ ] Deduplicação de lead

**Semana 5**

- [ ] Pipeline Kanban
- [ ] Deals + Activities
- [ ] SLA de contato e alertas

**Semana 6**

- [ ] Relatórios operacionais
- [ ] Exportações CSV
- [ ] Dashboard comercial

### Fase 3 - Hardening e escala (Semanas 7-8)

**Semana 7**

- [ ] BullMQ completo (retries, backoff, DLQ)
- [ ] Rotinas LGPD automatizadas
- [ ] Auditoria de segurança

**Semana 8**

- [ ] Testes de carga
- [ ] Otimização de queries
- [ ] Runbooks e simulação de restore
- [ ] Go-live checklist

---

## 14. Modelo de Dados Relacional (resumo)

```txt
users 1---N properties
users 1---N leads (assigned_to)
users 1---N activities (created_by)

neighborhoods 1---N properties

properties N---N amenities
properties N---N tags
properties 1---N media (gallery) + 1 featured

leads 1---N activities
leads 1---N deals
properties 1---N deals
```

Regras:

- exclusão lógica para entidades centrais
- histórico de alterações em tabelas de auditoria
- constraints e índices revisados por carga real

---

## 15. Checklist de Validação

### CMS

- [ ] Cadastro completo de imóvel em até 5 minutos
- [ ] Upload múltiplo de fotos funcionando
- [ ] Card de listagem com todos os campos obrigatórios
- [ ] Busca por código/título/bairro com tolerância a erro
- [ ] Publicação e atualização refletindo no frontend com revalidação

### CRM

- [ ] Captação automática por formulário e clique WhatsApp
- [ ] Distribuição round-robin operante
- [ ] Pipeline Kanban funcional
- [ ] Timeline de interações correta
- [ ] Relatórios e exportações dentro do SLA

### Segurança/LGPD

- [ ] Consentimento salvo corretamente
- [ ] Exportação de dados do titular funcional
- [ ] Anonimização funcional
- [ ] Backups restauráveis

### Performance

- [ ] Core Web Vitals dentro das metas
- [ ] Índices cobrindo consultas críticas
- [ ] Sem gargalo de fila em carga de pico

---

## 16. Requisitos para VPS

### 16.1 Perfil de capacidade recomendado

| Perfil | vCPU | RAM | Disco | Uso |
|---|---|---|---|---|
| Mínimo (MVP) | 4 vCPU | 8 GB | 160 GB NVMe | validação inicial |
| Recomendado (produção inicial) | 8 vCPU | 16 GB | 320 GB NVMe | operação estável |
| Escala (produção) | 12-16 vCPU | 32 GB | 500+ GB NVMe | tráfego alto e mais mídia |

### 16.2 Requisitos de sistema

- SO: Ubuntu Server 24.04 LTS
- Docker Engine + Docker Compose plugin
- Firewall ativo (ufw/nftables)
- Swap configurada (2-4 GB no mínimo)
- Sincronização de horário (chrony)

### 16.3 Requisitos de rede

- IP público fixo
- DNS gerenciado para `app`, `admin`, `api`, `monitoring`
- Portas expostas: 80/443
- Portas internas restritas (5432, 6379, 9000, 9090, 3000)

### 16.4 Requisitos de armazenamento e backup

- Volume dedicado para PostgreSQL
- Volume dedicado para MinIO
- Backup diário de DB + objetos
- Política: retenção 30-90 dias + cópia offsite
- Teste de restore quinzenal obrigatório

### 16.5 Requisitos de segurança operacional

- SSH por chave (sem senha)
- Fail2ban (ou equivalente)
- Atualizações automáticas de segurança
- Secrets em `.env` fora de repositório
- Rotação de credenciais trimestral

### 16.6 Requisitos de observabilidade

- Dashboards técnicos e de negócio
- Alertas por e-mail/Telegram/Slack
- Logs centralizados com retenção definida
- SLI/SLO mínimo:
  - disponibilidade >= 99.5%
  - tempo de resposta P95 <= 500ms

### 16.7 Requisitos de operação

- Runbook de deploy e rollback
- Janela de manutenção definida
- Procedimento de incidente e pós-mortem
- Ambiente de staging separado do ambiente de produção

---

## 17. Stacks Alternativas (DockerHub + VPS com Portainer e Traefik)

### 17.1 Stack principal recomendada (mantida neste PRD)

- **Next.js + Payload + PostgreSQL + Redis/BullMQ + MinIO + Traefik + Portainer**
- Motivo: Payload cobre CMS/Admin/Auth com licença MIT e integra bem com Next.js.
- Deploy: imagem da app gerada por Dockerfile multi-stage (padrão recomendado pelo próprio Payload), orquestrada por Compose Stack no Portainer.

### 17.2 Outras opções viáveis

| Stack | Licença | DockerHub / instalação | Compatível com Portainer + Traefik | Observação |
|---|---|---|---|---|
| Next.js + Payload + Twenty CRM | MIT + GPLv3 | `twentycrm/twenty` + app Payload custom | ✅ | Boa separação CMS e CRM; exige SSO/integr. |
| Next.js + Payload + EspoCRM | MIT + AGPLv3 | `espocrm/espocrm` | ✅ | CRM estável e maduro; integração via API/webhook. |
| Next.js + Strapi + CRM separado | OSS (com módulos enterprise em licença própria) | Strapi com Dockerfile próprio + Postgres/Redis oficiais | ✅ | Válido, mas requer mais cuidado de versionamento e plugins. |
| Appwrite + Next.js + CRM custom | BSD-3 + OSS | `appwrite/appwrite` + app Next.js | ✅ | Forte em backend BaaS; CMS editorial exige customização. |
| Directus + CRM separado | BSL 1.1 (source-available) | `directus/directus` | ✅ | Tecnicamente excelente, mas não é licença OSI clássica. |

### 17.3 Regras de escolha prática

1. Se prioridade é **MIT/Open Source com CMS forte**: Payload-first.
2. Se prioridade é **CRM pronto sem construir muito**: Payload + Twenty ou Payload + EspoCRM.
3. Se prioridade é **velocidade de backend genérico**: Appwrite + módulos específicos.
4. Se houver exigência jurídica de licença OSI estrita: evitar opções source-available (ex.: BSL).

### 17.4 Padrão mínimo para Portainer + Traefik

- Stacks definidas em `docker-compose.yml` com labels Traefik por serviço HTTP.
- TLS automático via resolver ACME do Traefik.
- Rede externa compartilhada (`traefik-public`).
- `healthcheck` obrigatório para app, DB, Redis e workers.

Exemplo de labels (serviço web):

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.primeurban.rule=Host(`app.seudominio.com`)"
  - "traefik.http.routers.primeurban.entrypoints=websecure"
  - "traefik.http.routers.primeurban.tls.certresolver=letsencrypt"
  - "traefik.http.services.primeurban.loadbalancer.server.port=3000"
```

---

## 18. Base Context7 e Fontes Oficiais

Este plano foi estruturado com base nas referências técnicas abaixo obtidas via Context7:

1. Payload deployment/self-hosting (Docker multi-stage, standalone)
   - https://github.com/payloadcms/payload/blob/main/docs/production/deployment.mdx
2. Strapi Docker deployment (Compose com PostgreSQL)
   - https://github.com/strapi/documentation/blob/main/docusaurus/docs/cms/installation/docker.md
3. Twenty self-hosting com Docker Compose
   - https://twenty.com/developers/section/self-hosting/docker-compose
4. Next.js App Router caching/revalidation (`revalidatePath`, `revalidateTag`, ISR)
   - https://github.com/vercel/next.js/blob/v16.1.5/docs/01-app/02-guides/caching.mdx
   - https://github.com/vercel/next.js/blob/v16.1.5/docs/01-app/02-guides/incremental-static-regeneration.mdx
5. BullMQ filas, retries/backoff e rate limiting
   - https://github.com/taskforcesh/bullmq/blob/master/docs/gitbook/guide/rate-limiting.md
   - https://github.com/taskforcesh/bullmq/blob/master/docs/gitbook/patterns/stop-retrying-jobs.md

Fontes complementares para licenças/imagens e operação com Portainer/Traefik:

1. Payload repository (MIT)
   - https://github.com/payloadcms/payload
2. Twenty repository (GPLv3)
   - https://github.com/twentyhq/twenty
3. Twenty Docker image
   - https://hub.docker.com/r/twentycrm/twenty
4. EspoCRM Docker image (AGPLv3)
   - https://hub.docker.com/r/espocrm/espocrm
5. Appwrite Docker image
   - https://hub.docker.com/r/appwrite/appwrite
6. Directus Docker image (BSL 1.1)
   - https://hub.docker.com/r/directus/directus
7. Traefik Docker provider
   - https://doc.traefik.io/traefik/providers/docker/
8. Portainer Stacks
   - https://docs.portainer.io/user/docker/stacks/add
9. Strapi + Traefik guidance (nota sobre imagens oficiais)
   - https://strapi.io/blog/how-to-run-strapi-with-docker-and-traefik

---

*PRD v3.1 — PrimeUrban CMS+CRM (Payload-first, MIT/Open Source).*
