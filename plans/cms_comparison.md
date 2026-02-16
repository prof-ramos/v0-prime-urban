# Comparativo de CMS Open Source para PrimeUrban

## Requisitos do Projeto

- **Configuração 100% code**: Definição de schemas, campos e relacionamentos via código
- **Integração nativa com Next.js**: SSR/ISR, Server Components, App Router
- **CMS + CRM integrado**: Gestão de imóveis, leads, pipeline, atividades
- **TypeScript end-to-end**: Tipagem forte em todo o stack
- **Autenticação RBAC**: Roles (admin, agent, assistant) com permissões granulares
- **API REST/GraphQL**: Acesso programático aos dados
- **Hooks e automações**: beforeChange, afterChange, afterCreate, etc.

---

## 1. Payload CMS 3.x

**Licença:** MIT
**Site:** https://payloadcms.com
**GitHub:** https://github.com/payloadcms/payload

### Vantagens

1. **Integração perfeita com Next.js**
   - Funciona dentro da mesma aplicação Next.js
   - Usa App Router nativamente
   - Server Components para queries
   - ISR integrado com revalidatePath/revalidateTag

2. **Configuração 100% code**
   - Collections definidas em TypeScript
   - Campos, validações, hooks tudo em código
   - Schema-first approach
   - Geração automática de tipos TypeScript

3. **Auth nativo completo**
   - JWT + sessions
   - Roles e permissões granulares
   - Field-level access control
   - Login, logout, forgot password integrados

4. **CMS + CRM pronto**
   - Admin panel embutido (/admin)
   - Collections para Properties, Leads, Deals, Activities
   - Dashboard customizável
   - Kanban view possível

5. **Performance**
   - Queries otimizadas
   - Connection pooling
   - Dataloader para N+1
   - Cache integrado

6. **Extensibilidade**
   - Plugins oficiais (SEO, Cloud Storage, etc.)
   - Componentes React customizados
   - Hooks em todas as operações

### Desvantagens

1. **Curva de aprendizado**
   - Conceitos próprios (Collections, Globals, Hooks)
   - Documentação extensa mas complexa

2. **Vendor lock-in (leve)**
   - Admin panel estilizado do jeito Payload
   - Difícil migrar para outro CMS depois

3. **Comunidade menor**
   - Comparado a Strapi/Directus
   - Menos tutoriais em português

4. **Tamanho do bundle**
   - Admin panel adiciona ~200KB ao bundle

### Adequação ao Projeto: ⭐⭐⭐⭐⭐ (5/5)

---

## 2. Strapi 5

**Licença:** OSI-approved (com módulos Enterprise proprietários)
**Site:** https://strapi.io
**GitHub:** https://github.com/strapi/strapi

### Vantagens

1. **CMS mais popular**
   - Maior comunidade
   - Muitos tutoriais e plugins
   - Estável e maduro

2. **Admin panel visual**
   - Content Manager intuitivo
   - Media Library integrada
   - Relational fields visual

3. **Flexibilidade de database**
   - MySQL, PostgreSQL, SQLite, MariaDB

4. **API robusta**
   - REST e GraphQL
   - Autenticação JWT
   - Permissões granulares

### Desvantagens

1. **NÃO é 100% code**
   - Schema definido via UI ou JSON files
   - Campos criados no admin, não em código
   - Difícil versionar mudanças

2. **Separação do Next.js**
   - Roda como aplicação separada
   - Precisa de proxy/reverse proxy
   - Mais complexo para deploy na Vercel

3. **TypeScript limitado**
   - Tipos gerados não são tão precisos
   - Menos integração com código

4. **CRM complicado**
   - Não tem estrutura nativa para CRM
   - Precisaria criar custom controllers
   - Sem pipeline Kanban nativo

### Adequação ao Projeto: ⭐⭐⭐ (3/5)

---

## 3. Directus 11

**Licença:** BSL 1.1 (source-available, não é OSI)
**Site:** https://directus.io
**GitHub:** https://github.com/directus/directus

### Vantagens

1. **Database-first**
   - Conecta em banco existente
   - Introspection automático
   - Migrations nativas

2. **Admin panel excelente**
   - Muito bem desenhado
   - Flux editor para automações
   - Dashboards customizáveis

3. **Flows (automações)**
   - Editor visual de workflows
   - Webhooks, emails, operações
   - Sem código para automações simples

4. **Performance**
   - Queries otimizadas
   - Cache agressivo
   - Suporta alta carga

### Desvantagens

1. **NÃO é open source OSI**
   - Licença BSL 1.1 (Business Source License)
   - Restrições em uso comercial
   - Não é "realmente" livre

2. **NÃO é 100% code**
   - Schema definido via UI/API
   - Collections criadas no admin
   - Campos configurados visualmente

3. **Separação da aplicação**
   - Roda como serviço separado
   - Comunicação via API
   - Latência adicional

4. **CRM limitado**
   - Não tem estrutura nativa de CRM
   - Sem pipeline de vendas
   - Precisaria customizar muito

### Adequação ao Projeto: ⭐⭐ (2/5)

---

## 4. Sanity

**Licença:** MIT (client), SaaS (backend)
**Site:** https://sanity.io
**GitHub:** https://github.com/sanity-io/sanity

### Vantagens

1. **Configuração as-code**
   - Schemas em TypeScript/JavaScript
   - Portable Text (rich text estruturado)
   - GROQ (query language poderosa)

2. **Studio customizável**
   - Componentes React customizados
   - Dashboard widgets
   - Plugins extensos

3. **Real-time**
   - Listen API para updates
   - Preview mode instantâneo

4. **CDN global**
   - API distribuída
   - Baixa latência

### Desvantagens

1. **NÃO é open source completo**
   - Backend é SaaS (pago)
   - Planos limitados no free tier
   - Lock-in no Sanity Cloud

2. **NÃO é 100% self-hosted**
   - Não pode rodar na própria infra
   - Dados no Sanity Cloud
   - LGPD complicado

3. **Sem CRM nativo**
   - Apenas CMS
   - CRM teria que ser custom
   - Sem auth embutido

4. **GROQ específico**
   - Linguagem própria
   - Curva de aprendizado
   - Menos intuitivo que SQL

### Adequação ao Projeto: ⭐⭐ (2/5)

---

## 5. KeystoneJS 6

**Licença:** MIT
**Site:** https://keystonejs.com
**GitHub:** https://github.com/keystonejs/keystone

### Vantagens

1. **100% code**
   - Schemas em TypeScript
   - GraphQL API gerada
   - Campos, hooks tudo em código

2. **Integração com Prisma**
   - Migrations automáticas
   - Type-safe queries
   - Suporte múltiplos bancos

3. **GraphQL nativo**
   - Schema gerado automaticamente
   - Playground integrado
   - Subscriptions

4. **Autenticação flexível**
   - Passport.js integrado
   - Múltiplas estratégias
   - Session management

### Desvantagens

1. **NÃO é integrado ao Next.js**
   - Roda como aplicação separada
   - Precisa de setup de proxy
   - Deploy mais complexo

2. **Admin panel básico**
   - Menos refinado que Payload
   - Menos componentes custom
   - UX inferior

3. **Sem CRM nativo**
   - CMS puro
   - CRM teria que ser construído
   - Sem pipeline/visualizações

4. **Menos popular**
   - Comunidade menor
   - Menos recursos online
   - Menos plugins

### Adequação ao Projeto: ⭐⭐⭐ (3/5)

---

## 6. Outline CMS (Headless)

**Licença:** BSL 1.0 (não é OSI)
**Site:** https://www.getoutline.com
**GitHub:** https://github.com/outline/outline

### Vantagens

1. **Wiki/Knowledge base**
   - Excelente para documentação
   - Editor WYSIWYG
   - Colaboração real-time

### Desvantagens

1. **NÃO é CMS genérico**
   - Especializado em wikis
   - Não serve para imóveis/CRM
   - Estrutura fixa

### Adequação ao Projeto: ⭐ (1/5)

---

## 7. ApostropheCMS 4

**Licença:** MIT
**Site:** https://apostrophecms.com
**GitHub:** https://github.com/apostrophecms/apostrophe

### Vantagens

1. **In-context editing**
   - Edição visual na página
   - Widget-based
   - Preview live

2. **100% code**
   - Schemas em código
   - Modules structure
   - TypeScript suportado

3. **Node.js nativo**
   - Express.js base
   - Middleware custom
   - Templates Nunjucks

### Desvantagens

1. **Frontend próprio**
   - Não é headless por padrão
   - Difícil integrar com Next.js moderno
   - Arquitetura "old school"

2. **Curva de aprendizado íngreme**
   - Conceitos muito específicos
   - Documentação dispersa
   - Menos exemplos modernos

3. **Sem CRM**
   - CMS tradicional
   - Não adaptado para leads/pipeline
   - Teria que construir do zero

### Adequação ao Projeto: ⭐⭐ (2/5)

---

## 8. Webiny

**Licença:** MIT
**Site:** https://www.webiny.com
**GitHub:** https://github.com/webiny/webiny-js

### Vantagens

1. **Serverless-first**
   - AWS Lambda
   - Escalabilidade automática
   - Pay-per-use

2. **Multi-tenant**
   - Sites múltiplos
   - Isolamento de dados

3. **Page Builder**
   - Editor visual de páginas
   - Componentes customizáveis

### Desvantagens

1. **Complexidade AWS**
   - Requer conhecimento AWS
   - Setup inicial complicado
   - Custos imprevisíveis

2. **NÃO é simples**
   - Overkill para projeto
   - Muitas camadas
   - Debugging difícil

3. **Lock-in AWS**
   - Difícil sair da AWS
   - Lambda constraints
   - Cold starts

4. **Sem CRM**
   - CMS + Page Builder
   - CRM não é foco

### Adequação ao Projeto: ⭐⭐ (2/5)

---

## 9. Feather CMS

**Licença:** MIT
**Site:** https://feathercms.com
**GitHub:** https://github.com/feathercms/feather

### Vantagens

1. **Leve e rápido**
   - Vapor (Swift) base
   - Alta performance
   - Baixo consumo de recursos

2. **100% code**
   - Schemas em Swift
   - Type-safe

### Desvantagens

1. **Swift/Vapor**
   - Não é Node.js
   - Não integra com Next.js
   - Stack diferente do projeto

2. **Comunidade pequena**
   - Menos recursos
   - Menos plugins
   - Suporte limitado

3. **Sem CRM**
   - CMS básico

### Adequação ao Projeto: ⭐ (1/5)

---

## 10. Builder.io (Qwik-based)

**Licença:** MIT (SDK), SaaS (backend)
**Site:** https://builder.io
**GitHub:** https://github.com/BuilderIO/builder

### Vantagens

1. **Visual CMS**
   - Drag-and-drop
   - Componentes React/Vue/etc
   - A/B testing

2. **SDK open source**
   - Renderização no frontend
   - Framework agnóstico

### Desvantagens

1. **Backend SaaS**
   - Dados na nuvem Builder
   - Plano pago para produção
   - Lock-in

2. **NÃO é 100% code**
   - Conteúdo editado visualmente
   - Schemas híbridos

3. **Sem CRM**
   - CMS visual puro

### Adequação ao Projeto: ⭐ (1/5)

---

## 📊 Tabela Comparativa Resumida

| CMS | Licença | 100% Code | Next.js Native | CRM Nativo | Auth Nativo | Deploy Vercel | Score |
|-----|---------|-----------|----------------|------------|-------------|---------------|-------|
| **Payload 3.x** | MIT | ✅ | ✅ | ✅ | ✅ | ✅ | **5/5** |
| Strapi 5 | OSI | ❌ | ❌ | ❌ | ✅ | ❌ | 3/5 |
| Directus 11 | BSL | ❌ | ❌ | ❌ | ✅ | ❌ | 2/5 |
| Sanity | SaaS | ✅ | ❌ | ❌ | ❌ | Parcial | 2/5 |
| Keystone 6 | MIT | ✅ | ❌ | ❌ | ✅ | ❌ | 3/5 |
| Apostrophe 4 | MIT | ✅ | ❌ | ❌ | ✅ | ❌ | 2/5 |
| Webiny | MIT | Parcial | ❌ | ❌ | ✅ | ❌ | 2/5 |
| Outline | BSL | ❌ | ❌ | ❌ | ❌ | ❌ | 1/5 |
| Feather | MIT | ✅ | ❌ | ❌ | ✅ | ❌ | 1/5 |
| Builder.io | SaaS | ❌ | ❌ | ❌ | ❌ | Parcial | 1/5 |

---

## 🏆 Recomendação: Payload CMS 3.x

### Por que Payload é o vencedor?

1. **Único que atende TODOS os requisitos:**
   - ✅ 100% configuração via código
   - ✅ Integração nativa com Next.js App Router
   - ✅ CMS + CRM no mesmo sistema
   - ✅ TypeScript end-to-end
   - ✅ Auth RBAC completo
   - ✅ Deploy na Vercel

2. **Benefícios específicos para o projeto:**
   - Collections Properties, Leads, Deals, Activities nativas
   - Admin panel pronto com dashboard
   - Hooks para automações (round-robin, notificações)
   - SEO plugin integrado
   - Revalidação ISR automática

3. **Caminho feliz de desenvolvimento:**
   ```typescript
   // Exemplo de como seria no Payload
   export const Properties: CollectionConfig = {
     slug: 'properties',
     fields: [
       { name: 'title', type: 'text', required: true },
       { name: 'price', type: 'number', required: true },
       { name: 'agent', type: 'relationship', relationTo: 'users' },
       // ... todos os campos do PRD
     ],
     hooks: {
       afterChange: [revalidateProperty],
     },
   }
   ```

4. **Vantagem competitiva:**
   - Equipe de corretores pode usar o admin imediatamente
   - Sem necessidade de construir dashboard do zero
   - Foco no negócio, não na infraestrutura

### Contra-indicações (quando NÃO usar Payload):

- Se precisar de um CMS "visual" onde não-coders criem schemas
- Se a equipe não souber TypeScript
- Se o projeto precisar de muitas integrações com plugins de terceiros
- Se for um projeto muito simples (usar JSON files direto)

### Alternativa viável (se Payload falhar):

**KeystoneJS 6** seria a segunda opção, mas requer:
- Setup de proxy para Next.js
- Construção do CRM do zero
- Admin panel mais básico

---

## ✅ Checklist de Validação para Payload

Antes de confirmar a escolha, validar:

- [ ] Consegue criar collection Property com todos os campos do PRD?
- [ ] Consegue criar relacionamentos (Property -> Neighborhood, Property -> User)?
- [ ] Consegue implementar hooks (afterChange para revalidar ISR)?
- [ ] Consegue customizar o admin panel (dashboard)?
- [ ] Consegue implementar autenticação com roles?
- [ ] Consegue fazer deploy na Vercel?

Se todas as respostas forem SIM, **Payload é a escolha certa**.

---

## 📚 Recursos Úteis

- [Payload Docs](https://payloadcms.com/docs)
- [Payload + Next.js Integration](https://payloadcms.com/docs/integrations/nextjs)
- [Payload GitHub](https://github.com/payloadcms/payload)
- [Payload Discord](https://discord.com/invite/payload)

---

*Análise feita em: Fevereiro 2026*
*Revisão recomendada: A cada 6 meses ou nova versão major*
