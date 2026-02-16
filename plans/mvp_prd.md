# PrimeUrban MVP - Product Requirements Document

## Visão Geral

Sistema integrado de CMS + CRM para a PrimeUrban Imobiliária, focado em gestão de imóveis e leads, otimizado para o free tier da Vercel.

---

## Stack Tecnológico (Vercel Free Tier)

| Camada    | Tecnologia                            | Justificativa                                 |
| --------- | ------------------------------------- | --------------------------------------------- |
| Framework | Next.js 16 (App Router)               | SSR/ISR nativo, Server Components             |
| Linguagem | TypeScript 5.x                        | Segurança de tipos                            |
| UI        | Tailwind CSS 4 + shadcn/ui            | Design system consistente                     |
| CMS       | Payload CMS 3.x                       | Integração nativa com Next.js, admin embutido |
| Banco     | SQLite (Dev) / Postgres (Prod)        | SQLite local para agilidade; Neon em prod     |
| Storage   | Local Disk (Dev) / Vercel Blob (Prod) | Desenvolvimento rápido local; Blob para prod  |
| Auth      | Payload Auth                          | RBAC nativo, sem custo extra                  |
| Imagens   | Sharp (Vercel)                        | Processamento serverless                      |
| E-mail    | Resend (free tier)                    | 100 emails/dia grátis                         |
| Analytics | Vercel Analytics                      | Incluído no free tier                         |

---

## Limitações do Free Tier Consideradas

| Recurso           | Limite                       | Solução                                    |
| ----------------- | ---------------------------- | ------------------------------------------ |
| Bandwidth         | 100GB/mês                    | Otimização de imagens, lazy loading        |
| Function Duration | 60s (Pro) / 10s (Hobby)      | Processamento em background via API routes |
| Cron Jobs         | Não disponível               | Client-side scheduling com setInterval     |
| Build Time        | 6000 min/mês                 | Otimização de builds                       |
| Blob Storage      | 1GB (Prod) / Ilimitado (Dev) | Local em dev; compressão WebP em prod      |

---

## Personas

### Comprador/Locador

- Encontra imóveis compatíveis
- Visualiza detalhes completos
- Entra em contato via WhatsApp/formulário
- Recebe atualizações sobre novos imóveis

### Corretor/Admin

- Cadastra/atualiza imóveis
- Atende e qualifica leads
- Opera pipeline de vendas
- Mede desempenho por fonte

---

## Requisitos Funcionais

### CMS - Gestão de Imóveis

#### Collections Principais

1. **Properties (Imóveis)**
   - Identificação: título, slug, código (auto-gerado), status
   - Tipo: venda/locação, categoria (apartamento, casa, etc.)
   - Preço, condomínio, IPTU
   - Características: quartos, suítes, banheiros, vagas, área
   - Endereço completo com bairro (relationship)
   - Descrições curta (160 chars) e completa (Rich Text)
   - Mídia: imagem destaque + galeria (max 30)
   - Comodidades (relationship)
   - Tags e destaques
   - Corretor responsável
   - SEO: title, description
   - Contadores: views, contacts

2. **Neighborhoods (Bairros)**
   - Nome, slug, cidade, estado
   - Descrição
   - Imagem destaque
   - Contagem de imóveis (calculado)
   - Preço médio (calculado)

3. **Media (Vercel Blob)**
   - Upload via Payload
   - Alt text obrigatório
   - Pasta de organização
   - Metadados: dimensões, tamanho

4. **Tags**
   - Label, slug, cor

5. **Amenities (Comodidades)**
   - Label, slug, ícone (Lucide), categoria (imóvel/condomínio)

6. **Users (Payload Auth)**
   - Email, nome, role (admin/agent/assistant)
   - Telefone, CRECI, bio
   - Avatar
   - Taxa de comissão
   - Status ativo

### CRM - Gestão de Leads

1. **Leads**
   - Dados pessoais: nome, email, telefone, WhatsApp
   - Origem: website, WhatsApp, Facebook, Instagram, Google Ads, indicação, portal, outro
   - UTM params (source, medium, campaign)
   - Interesse: comprar, alugar, vender, investir
   - Orçamento: min/max
   - Bairros de interesse (relationship)
   - Categorias preferidas
   - Imóveis visualizados (relationship)
   - Status do funil: novo, contactado, qualificado, visita agendada, proposta enviada, negociação, fechado (ganho/perdido)
   - Prioridade: baixa, média, alta, quente
   - Motivo de perda
   - Corretor atribuído
   - LGPD: consentimento, data, IP
   - Score (0-100)
   - Último contato

2. **Deals (Oportunidades)**
   - Lead + imóvel vinculados
   - Tipo: venda/locação
   - Valores: pedido, proposta, final
   - Estágio: interesse, visita, proposta, negociação, documentação, fechado
   - Probabilidade
   - Comissão: taxa e valor calculado
   - Datas: prevista e real de fechamento
   - Corretor

3. **Activities (Atividades)**
   - Lead + deal vinculados
   - Tipo: ligação, WhatsApp, email, visita, nota, tarefa, proposta, sistema
   - Descrição
   - Agendado/em/datas de vencimento e conclusão
   - Resultado
   - Criado por

### Frontend Público

#### Páginas

1. **Homepage**
   - Hero com busca rápida
   - Imóveis em destaque
   - Bairros populares
   - CTA WhatsApp

2. **Listagem `/imoveis`**
   - Grid de cards responsivo
   - Filtros: tipo, categoria, bairro, preço, quartos, banheiros, vagas, área, características, palavra-chave
   - Ordenação: recentes, preço, área, visualizações
   - Paginação server-side

3. **Detalhe `/imovel/[slug]`**
   - Galeria de fotos (lightbox)
   - Ficha técnica completa
   - Mapa (OpenStreetMap via Leaflet)
   - Corretor responsável
   - Imóveis similares
   - CTA flutuante mobile

#### API Routes Públicas

| Método | Rota                        | Descrição                      |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/api/properties`           | Listagem com filtros/paginação |
| GET    | `/api/properties/[slug]`    | Detalhes do imóvel             |
| GET    | `/api/neighborhoods`        | Bairros ativos                 |
| POST   | `/api/leads`                | Criação de lead                |
| POST   | `/api/properties/[id]/view` | Incrementa visualização        |
| GET    | `/api/search`               | Busca full-text                |

### Admin Dashboard

- KPIs: imóveis ativos, leads hoje, conversão mês, receita potencial
- Tarefas pendentes
- Leads sem contato >24h
- Pipeline Kanban
- Timeline de atividades

---

## Requisitos Não-Funcionais

### Performance

- TTFB < 200ms (ISR)
- FCP < 1.8s
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms
- Suporte a 1000+ imóveis no free tier

### SEO

- URLs semânticas: `/imoveis`, `/imovel/[slug]`
- Sitemap dinâmico
- Schema.org: RealEstateListing, BreadcrumbList, Organization
- Meta tags dinâmicas
- Canonical URLs
- Open Graph + Twitter Cards

### Acessibilidade

- WCAG 2.1 AA
- Navegação por teclado
- Contraste 4.5:1
- ARIA labels
- Skip navigation

### Responsividade

- Mobile-first
- Breakpoints: 640/768/1024/1280
- Cards: 1 coluna (mobile), 2 (tablet), 3 (desktop)

---

## Estratégia de Cache

| Página   | Estratégia  | Revalidação           |
| -------- | ----------- | --------------------- |
| Homepage | ISR         | 60s + on-demand       |
| Listagem | SSR + cache | 30s                   |
| Detalhe  | ISR         | On-demand via webhook |
| Bairros  | ISR         | 1h                    |

---

## Automações (Simplificadas para Free Tier)

### Captura de Leads

```text
Lead criado
  -> Verificar duplicidade
  -> Atribuir round-robin
  -> Enviar email (Resend)
```

### Score de Lead

```text
+10: Visualizou imóvel
+20: Clicou WhatsApp
+30: Preencheu formulário
+40: Agendou visita
-20: Sem interação 7 dias
```

---

## Segurança e LGPD

| Requisito     | Implementação                |
| ------------- | ---------------------------- |
| Autenticação  | Payload Auth (bcrypt + JWT)  |
| Rate limiting | Vercel KV + middleware       |
| Sanitização   | Payload + Zod                |
| Headers       | CSP, HSTS, X-Frame-Options   |
| Consentimento | Checkbox + timestamp + IP    |
| Exportação    | API route `/api/lgpd/export` |
| Anonimização  | API route `/api/lgpd/delete` |

---

## Roadmap MVP (6 Semanas)

### Semana 1: Setup Local e Collections

- [ ] Payload CMS instalado localmente nas rotas Next.js
- [ ] SQLite configurado com `@payloadcms/db-sqlite`
- [ ] Schema push inicial via Drizzle (Payload core)
- [ ] Collections: Users, Properties, Neighborhoods, Media, Tags, Amenities
- [ ] RBAC configurado

### Semana 2: CMS Core

- [ ] CRUD completo de imóveis
- [ ] Upload Vercel Blob
- [ ] Filtros e busca
- [ ] Preview de imóvel

### Semana 3: Frontend Público

- [ ] Homepage
- [ ] Listagem com filtros
- [ ] Página de detalhe
- [ ] ISR configurado

### Semana 4: CRM Leads

- [ ] Collection Leads
- [ ] Formulário de contato
- [ ] Captura WhatsApp
- [ ] Distribuição round-robin

### Semana 5: Pipeline e Atividades

- [ ] Kanban de pipeline
- [ ] Deals e Activities
- [ ] Timeline de interações
- [ ] Templates de mensagens

### Semana 6: Hardening e Deploy

- [ ] SEO técnico
- [ ] Rate limiting
- [ ] LGPD compliance
- [ ] Deploy na Vercel

---

## Checklist de Validação

### CMS

- [ ] Cadastro de imóvel em < 5 min
- [ ] Upload de até 30 fotos
- [ ] Busca full-text funcional
- [ ] Preview antes de publicar

### CRM

- [ ] Captura automática de leads
- [ ] Notificação por email < 1 min
- [ ] Pipeline Kanban funcional
- [ ] Timeline completa

### Performance

- [ ] Lighthouse score ≥ 90
- [ ] Core Web Vitals dentro das metas
- [ ] Zero erros críticos

### Segurança/LGPD

- [ ] Rate limiting ativo
- [ ] Consentimento registrado
- [ ] Rotas de export/delete funcionais

---

## Custos Estimados

| Item                  | Custo/Mês (Prod) | Custo (Dev) |
| --------------------- | ---------------- | ----------- |
| Vercel Pro (opcional) | $20              | $0          |
| Vercel Postgres       | $0 (free tier)   | $0 (SQLite) |
| Vercel Blob           | $0 (free tier)   | $0 (Local)  |
| Resend                | $0 (100 emails)  | $0          |
| **Total**             | **$20 ou $0**    | **$0**      |

---

## Limitações Conhecidas do Free Tier

1. **Sem Cron Jobs**: Automações agendadas devem usar client-side ou serviços externos
2. **Function Duration**: Processamento pesado deve ser dividido em chunks
3. **Blob Storage 1GB**: Limite de mídia, exige compressão e política de retenção
4. **Postgres 256MB**: Adequado para MVP, upgrade necessário após crescimento

---

### MVP PRD v1.0 - PrimeUrban CMS+CRM - Otimizado para Vercel Free Tier
