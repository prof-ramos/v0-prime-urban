# Documentação da API PrimeUrban

Esta documentação descreve todos os endpoints públicos disponíveis na plataforma PrimeUrban, uma plataforma de listagem de imóveis em Brasília.

**Base URL:** `https://api.primeurban.com.br` (ou `http://localhost:3000` em desenvolvimento)

---

## Sumário

1. [Autenticação](#autenticação)
2. [Endpoints Personalizados](#endpoints-personalizados)
3. [API do Payload CMS](#api-do-payload-cms)
4. [Coleções](#coleções)
5. [Globais](#globais)
6. [Limitações e Restrições](#limitações-e-restrições)

---

## Autenticação

### Bearer Token

A maioria dos endpoints administrativos requer autenticação via Bearer token no header `Authorization`:

```http
Authorization: Bearer <token>
```

**Obtenção de Token:**
- POST `/api/users/login` com credenciais de usuário
- Token expira em **7200 segundos (2 horas)**
- Máximo de 5 tentativas de login com bloqueio de 10 minutos

**Comportamento de Expiração:**
- Quando o token expira, endpoints protegidos retornam **401 Unauthorized**.
- Exemplo de payload de erro esperado:
  ```json
  {
    "errors": [
      {
        "message": "Token expirado",
        "code": "TOKEN_EXPIRED"
      }
    ]
  }
  ```
- Estratégia recomendada no cliente:
  - Armazenar `exp` do JWT (ou `now + ttl`) ao autenticar.
  - Antes de cada request, verificar tempo restante do token.
  - Se faltar menos de 5 minutos, forçar novo login antes da chamada.
  - Ao receber `401` com `code = TOKEN_EXPIRED`, limpar sessão e redirecionar para login.
- Fluxo curto de reautenticação:
  1. Detectar token expirado.
  2. Solicitar novas credenciais ao usuário.
  3. Obter novo token e restaurar contexto local.
  4. Reexecutar a requisição original uma única vez.
- Não há refresh token neste MVP.

---

## Endpoints Personalizados

### 1. Dashboard Stats

Retorna KPIs para o dashboard administrativo.

**Endpoint:** `GET /api/dashboard-stats`

**Autenticação:** Bearer Token (apenas admins)

**Query Parameters:** Nenhum

**Response (200 OK):**
```json
{
  "activeProperties": 42,
  "newLeadsToday": 7,
  "totalRevenue": 1250000,
  "timestamp": "2025-02-16T14:30:00.000Z"
}
```

**Campos:**
- `activeProperties`: Número de propriedades publicadas
- `newLeadsToday`: Leads criados desde as 00:00 de hoje
- `totalRevenue`: Soma de `finalPrice` de todos os deals com status `signed`
- `timestamp`: ISO 8601 timestamp da resposta

**Erros:**
- `401 Unauthorized`: Token ausente ou inválido
- `500 Internal Server Error`: Erro ao buscar dados

**Exemplo:**
```bash
curl -X GET https://api.primeurban.com.br/api/dashboard-stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Revalidação de Cache

Invalida cache ISR (Incremental Static Regeneration) on-demand.

**Endpoint:** `POST /api/revalidate`

**Autenticação:** Header `X-Revalidate-Secret` (REVALIDATE_SECRET)

**Body (JSON):**
| Parâmetro | Tipo   | Obrigatório | Descrição         |
|-----------|--------|-------------|-------------------|
| path      | string | Sim         | Caminho a revalidar |

**Headers:**
| Header              | Tipo   | Obrigatório | Descrição         |
|---------------------|--------|-------------|-------------------|
| X-Revalidate-Secret | string | Sim         | Segredo do ambiente |

**Response (200 OK):**
```json
{
  "revalidated": true,
  "path": "/imoveis/apartamento-asa-norte",
  "now": 1739704200000
}
```

**Erros:**
- `400 Bad Request`: Parâmetro `path` ausente
- `401 Unauthorized`: Segredo inválido ou ausente
- `500 Internal Server Error`: Erro na revalidação

**Exemplo:**
```bash
curl -X POST "https://api.primeurban.com.br/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: SECRET" \
  -d '{\"path\":\"/imoveis/apartamento-asa-norte\"}'
```

> **Nota:** O uso de query parameter `secret` foi depreciado por questões de segurança. Use sempre o header `X-Revalidate-Secret`.
> **Métodos não suportados:** `GET` (e demais métodos) retornam `405 Method Not Allowed`.

**Importante:** Este endpoint deve ser chamado sempre que uma propriedade for atualizada para garantir que a página pública mostre dados atualizados.

---

## API do Payload CMS

### REST Handler

**Base Path:** `/api/[...slug]`

Todos os métodos REST são suportados:

```typescript
GET    /api/{collection}    // Listar documentos
GET    /api/{collection}/{id}  // Obter documento
POST   /api/{collection}    // Criar documento
PATCH  /api/{collection}/{id}  // Atualizar documento
PUT    /api/{collection}/{id}  // Substituir documento
DELETE /api/{collection}/{id}  // Deletar documento
```

---

## Coleções

### Users (Usuários)

**Slug:** `users`

**Campos:**
| Campo        | Tipo   | Descrição                          |
|--------------|--------|------------------------------------|
| email        | string | Email único (obrigatório)          |
| password     | string | Hash da senha (obrigatório)        |
| name         | string | Nome completo                      |
| role         | string | `admin` ou `agent`                 |
| phone        | string | Telefone de contato                |
| creci        | string | Número CRECI                       |
| bio          | text   | Biografia                          |
| avatar       | upload | Foto de perfil                     |
| commissionRate| number | Taxa de comissão (0-100)          |
| active       | boolean | Status ativo/inativo              |

**Endpoints:**

#### Criar Usuário
```http
POST /api/users
Content-Type: application/json

{
  "email": "agente@primeurban.com.br",
  "password": "SenhaSegura123!",
  "name": "João Silva",
  "role": "agent",
  "phone": "+5561999999999",
  "creci": "12345-DF"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "agente@primeurban.com.br",
  "password": "SenhaSegura123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "123",
    "email": "agente@primeurban.com.br",
    "name": "João Silva",
    "role": "agent"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Listar Usuários
```http
GET /api/users
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "docs": [
    {
      "id": "123",
      "email": "agente@primeurban.com.br",
      "name": "João Silva",
      "role": "agent",
      "phone": "+5561999999999",
      "creci": "12345-DF",
      "active": true,
      "createdAt": "2025-02-16T14:30:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1,
  "pagingCounter": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

**Controle de Acesso:**
| Operação | Permissão         |
|----------|-------------------|
| create   | Admin ou Agent    |
| read     | Próprio usuário ou Admin |
| update   | Próprio usuário ou Admin |
| delete   | Admin             |

---

### Properties (Propriedades)

**Slug:** `properties`

**Campos:**
| Campo            | Tipo     | Descrição                                  |
|------------------|----------|--------------------------------------------|
| title            | string   | Título do imóvel (obrigatório)             |
| code             | string   | Código único (auto-gerado: PRM-XXXX)       |
| slug             | string   | Slug para URL (auto-gerado do título)      |
| type             | string   | `apartamento`, `casa`, `cobertura`, `sala_comercial` |
| category         | string   | `padrao`, `luxo`, `econômico`              |
| status           | string   | `draft`, `published`, `archived`, `sold`   |
| price            | number   | Preço principal (obrigatório)              |
| condominiumFee   | number   | Valor do condomínio                        |
| iptu             | number   | Valor do IPTU                              |
| privateArea      | number   | Área privativa em m²                       |
| totalArea        | number   | Área total em m²                           |
| bedrooms         | number   | Número de quartos                          |
| suites           | number   | Número de suítes                           |
| bathrooms        | number   | Número de banheiros                        |
| parkingSpaces    | number   | Vagas de garagem                           |
| address          | string   | Endereço completo                          |
| neighborhood     | string   | Bairro (lookup para Neighborhoods)         |
| description      | text     | Descrição detalhada                        |
| images           | array    | Uploads de imagens                         |
| amenities        | array    | Comodidades (lookup para Amenities)        |
| featured         | boolean  | Destaque na homepage                       |
| acceptsPets      | boolean  | Aceita pets                                |
| solarOrientation | string   | `norte`, `sul`, `leste`, `oeste`           |
| tags             | array    | Tags (lookup para Tags)                    |
| createdBy        | string   | ID do criador                              |

**Hooks Automáticos:**
- `autoSlug`: Gera slug automaticamente a partir do título
- `autoCode`: Gera código único (PRM-XXXX)
- `revalidateProperty`: Revalida cache ISR após publicação
- `notifyInterestedLeads`: Notifica leads interessados ao publicar

**Detalhes de `notifyInterestedLeads`:**
- **Registro de interesse (fonte de dados):**
  - campos no lead (`neighborhood`, `propertyType`, `priceRangeMin`, `priceRangeMax`, `doNotContact`);
  - opcionalmente entidade `saved-searches` com os mesmos filtros para segmentação.
- **Semântica de trigger:**
  - dispara no hook `notifyInterestedLeads` quando o imóvel muda para `status: published`;
  - em updates de preço/status pode disparar novamente somente se configurado (`NOTIFY_ON_PRICE_CHANGE=true`);
  - envio é processado por lote e com tolerância a falhas parciais.
- **Canais suportados:**
  - `email` (ativo no MVP),
  - `sms`, `whatsapp`, `push` (opcionais via feature flag e provider configurado).
- **Payload de notificação padrão:**
  - `title`, `price`, `primaryPhotoUrl`, `propertyUrl`, `ctaLabel`, `unsubscribeUrl`.
- **Consentimento e LGPD:**
  - respeitar `doNotContact`, consentimento por finalidade e unsubscribe;
  - revogação remove o lead da elegibilidade em execuções futuras.

**Exemplo de configuração + contexto de hooks:**
```ts
hooks: {
  beforeChange: [autoSlug('title'), autoCode('PRM')],
  afterChange: [revalidateProperty, notifyInterestedLeads],
}
```

**Exemplo de Criação:**
```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Apartamento Moderno na Asa Norte",
  "type": "apartamento",
  "category": "padrao",
  "status": "published",
  "price": 850000,
  "condominiumFee": 1200,
  "iptu": 350,
  "privateArea": 85,
  "totalArea": 95,
  "bedrooms": 3,
  "suites": 2,
  "bathrooms": 3,
  "parkingSpaces": 2,
  "address": "SQN 212, Bloco C, Apt 402",
  "neighborhood": "asa-norte",
  "description": "Lindo apartamento...",
  "featured": true,
  "acceptsPets": true
}
```

**Query com Filtros:**
```http
GET /api/properties?where[type][equals]=apartamento&where[status][equals]=published&sort=-price
```

**Controle de Acesso:**
| Operação | Permissão              |
|----------|------------------------|
| create   | Admin ou Agent         |
| read     | Público                |
| update   | Admin ou Agent         |
| delete   | Admin                  |

---

### Leads (Leads/Contatos)

**Slug:** `leads`

**Campos:**
| Campo          | Tipo      | Descrição                                  |
|----------------|-----------|--------------------------------------------|
| name           | string    | Nome do lead (obrigatório)                 |
| phone          | string    | Telefone (obrigatório)                     |
| email          | string    | Email                                      |
| lastContactAt  | datetime  | Data do último contato                     |
| source         | string    | Origem do lead                             |
| status         | string    | `novo`, `contatado`, `negociacao`, `concluido` |
| priority       | string    | `baixa`, `media`, `alta`                   |
| assignedTo     | string    | ID do agente atribuído (auto round-robin)  |
| score          | number    | Score de qualificação (0-100, auto)        |
| property       | string    | ID da propriedade de interesse             |
| notes          | text      | Observações                                |

**Hooks Automáticos:**
- `updateLeadScore`: Atualiza score baseado em campos preenchidos (beforeChange)
- `distributeLead`: Distribui round-robin para agentes ativos (afterCreate)
- `updateLeadLastContact`: Atualiza `lastContactAt` em atividades (afterCreate)

**Exemplo de Criação:**
```http
POST /api/leads
Content-Type: application/json

{
  "name": "Maria Santos",
  "phone": "+5561988888888",
  "email": "maria@email.com",
  "source": "whatsapp",
  "property": "prop-123"
}
```

**Response (com distribuição automática):**
```json
{
  "id": "lead-456",
  "name": "Maria Santos",
  "phone": "+5561988888888",
  "email": "maria@email.com",
  "source": "whatsapp",
  "status": "novo",
  "priority": "media",
  "score": 60,
  "assignedTo": "agent-789",
  "createdAt": "2025-02-16T14:30:00.000Z"
}
```

**Controle de Acesso:**
| Operação | Permissão                           |
|----------|-------------------------------------|
| create   | Público                             |
| read     | Apenas leads atribuídos ao usuário ou Admin |
| update   | Apenas leads atribuídos ao usuário ou Admin |
| delete   | Admin                               |

---

### Deals (Negócios)

**Slug:** `deals`

**Campos:**
| Campo        | Tipo      | Descrição                          |
|--------------|-----------|------------------------------------|
| title        | string    | Título do negócio (obrigatório)    |
| stage        | string    | `prospect`, `visit`, `proposal`, `negotiation`, `signed` |
| property     | string    | ID da propriedade (obrigatório)    |
| lead         | string    | ID do lead (obrigatório)           |
| agent        | string    | ID do agente responsável           |
| finalPrice   | number    | Preço final da transação           |
| commission   | number    | Valor da comissão                  |
| closingDate  | datetime  | Data de fechamento                 |
| notes        | text      | Observações                        |

**Controle de Acesso:**
| Operação | Permissão              |
|----------|------------------------|
| create   | Admin ou Agent         |
| read     | Próprios deals ou Admin |
| update   | Próprios deals ou Admin |
| delete   | Admin                  |

---

### Activities (Atividades)

**Slug:** `activities`

**Campos:**
| Campo        | Tipo      | Descrição                          |
|--------------|-----------|------------------------------------|
| title        | string    | Título (obrigatório)               |
| type         | string    | `call`, `email`, `visit`, `whatsapp`, `note` |
| lead         | string    | ID do lead (obrigatório)           |
| deal         | string    | ID do deal relacionado             |
| agent        | string    | ID do agente                       |
| notes        | text      | Conteúdo da atividade              |
| scheduledFor | datetime  | Data agendada                      |

**Hook Automático:**
- `updateLeadLastContact`: Atualiza `lastContactAt` do lead relacionado

**Controle de Acesso:**
| Operação | Permissão                           |
|----------|-------------------------------------|
| create   | Admin ou Agent                      |
| read     | Apenas próprias atividades ou Admin |
| update   | Apenas próprias atividades ou Admin |
| delete   | Admin                               |

---

### Neighborhoods (Bairros)

**Slug:** `neighborhoods`

**Campos:**
| Campo        | Tipo    | Descrição                              |
|--------------|---------|----------------------------------------|
| name         | string  | Nome do bairro (obrigatório)           |
| slug         | string  | Slug para URL (auto-gerado)            |
| description  | text    | Descrição                              |
| city         | string  | Cidade (padrão: "Brasília")            |
| zone         | string  | Zona da cidade                         |

**Controle de Acesso:**
| Operação | Permissão              |
|----------|------------------------|
| create   | Admin                  |
| read     | Público                |
| update   | Admin                  |
| delete   | Admin                  |

---

### Amenities (Comodidades)

**Slug:** `amenities`

**Campos:**
| Campo        | Tipo    | Descrição                              |
|--------------|---------|----------------------------------------|
| name         | string  | Nome (obrigatório)                     |
| icon         | string  | Ícone (opcional)                       |
| category     | string  | Categoria para agrupamento             |

**Controle de Acesso:**
| Operação | Permissão              |
|----------|------------------------|
| create   | Admin                  |
| read     | Público                |
| update   | Admin                  |
| delete   | Admin                  |

---

### Tags (Etiquetas)

**Slug:** `tags`

**Campos:**
| Campo        | Tipo    | Descrição                              |
|--------------|---------|----------------------------------------|
| name         | string  | Nome (obrigatório, único)              |
| color        | string  | Cor hexadecimal para visualização      |

**Controle de Acesso:**
| Operação | Permissão              |
|----------|------------------------|
| create   | Admin                  |
| read     | Público                |
| update   | Admin                  |
| delete   | Admin                  |

---

### Media (Mídia)

**Slug:** `media`

**Campos:**
| Campo        | Tipo   | Descrição                      |
|--------------|--------|--------------------------------|
| alt          | string | Texto alternativo              |
| caption      | string | Legenda                        |
| url          | string | URL da imagem (upload)         |

**Controle de Acesso:**
| Operação | Permissão              |
|----------|------------------------|
| create   | Admin ou Agent         |
| read     | Público                |
| update   | Admin                  |
| delete   | Admin                  |

---

## Globais

### Settings

**Slug:** `settings`

**Campos:**
| Campo        | Tipo   | Descrição                              |
|--------------|--------|----------------------------------------|
| siteName     | string | Nome do site (padrão: "Prime Urban")   |
| contactEmail | string | Email de contato (obrigatório)         |
| phoneNumber  | string | Telefone de contato                    |
| address      | text   | Endereço                               |
| socialMedia  | array  | Array de redes sociais                 |

**SocialMedia Item:**
```typescript
{
  platform: "instagram" | "facebook" | "linkedin" | "twitter" | "youtube",
  url: string // URL válida
}
```

**Controle de Acesso:**
| Operação | Permissão              |
|----------|------------------------|
| read     | Público                |
| update   | Admin                  |

---

### LGPD Settings

**Slug:** `lgpd-settings`

**Campos:**
| Campo             | Tipo   | Descrição                              |
|-------------------|--------|----------------------------------------|
| privacyPolicy     | textarea | Política de privacidade              |
| termsOfService    | textarea | Termos de uso                        |
| cookiePolicy      | textarea | Política de cookies                  |
| dataRetentionDays | number  | Dias de retenção de dados              |

**Controle de Acesso:**
| Operação | Permissão              |
|----------|------------------------|
| read     | Público                |
| update   | Admin                  |

**Endpoints LGPD (Roadmap Q2 2026):**

#### Exportar Dados Pessoais (Portabilidade)
**Endpoint:** `GET /api/users/me/export`

**Autenticação:** Bearer Token (próprio usuário)

**Descrição:** Retorna todos os dados pessoais do usuário autenticado em formato JSON, conforme direito de portabilidade previsto na LGPD.

**Response (200 OK):**
```json
{
  "user": {
    "id": "123",
    "email": "usuario@email.com",
    "name": "Nome Completo",
    "phone": "+5561999999999",
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "leads": [
    {
      "id": "lead-456",
      "name": "Lead associado",
      "createdAt": "2025-02-01T14:20:00.000Z"
    }
  ],
  "activities": [
    {
      "id": "activity-789",
      "type": "call",
      "notes": "Contato realizado",
      "scheduledFor": "2025-02-10T16:00:00.000Z"
    }
  ],
  "exportedAt": "2025-02-16T15:00:00.000Z"
}
```

#### Exportar Dados de um Lead Específico (Admin/Agente)
**Endpoint:** `GET /api/leads/{id}/export`

**Autenticação:** Bearer Token (admin ou agente com acesso ao lead)

**Descrição:** Exporta dados do lead solicitado, incluindo trilha de atividades e consentimentos vinculados.

**Response (200 OK):**
```json
{
  "lead": {
    "id": "lead-456",
    "name": "Lead associado",
    "email": "lead@email.com",
    "phone": "+5561999999999"
  },
  "consents": [
    {
      "id": "cons-1",
      "policyVersion": "2026-01",
      "channel": "website",
      "grantedAt": "2026-02-01T12:00:00.000Z"
    }
  ],
  "activities": [],
  "exportedAt": "2026-02-16T15:10:00.000Z"
}
```

#### Solicitar Exclusão de Dados (Direito ao Esquecimento)
**Endpoint:** `POST /api/users/request-deletion`

**Autenticação:** Bearer Token (próprio usuário)

**Descrição:** Inicia processo de exclusão de dados pessoais conforme LGPD. Os dados são anonimizados e mantidos por período determinado em `dataRetentionDays` antes da remoção permanente.

**Request Body:**
```json
{
  "reason": "Não desejo mais utilizar a plataforma",
  "confirmation": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Solicitação de exclusão recebida. Seus dados serão anonimizados em 30 dias.",
  "ticketId": "del-123456",
  "estimatedDeletionDate": "2025-03-18T00:00:00.000Z"
}
```

#### Gestão de Consentimento
**Endpoints (escopo do usuário autenticado):**
- `POST /api/users/me/consents`
- `GET /api/users/me/consents`
- `DELETE /api/users/me/consents/{purpose}`

**Finalidades padrão (`purpose`):**
- `marketing_emails`
- `usage_analytics`
- `essential_only`

**Modelo de dados (`users.consents[]`):**
```json
{
  "purpose": "marketing_emails",
  "granted": true,
  "grantedAt": "2026-02-16T15:00:00.000Z",
  "revokedAt": null
}
```

**Exemplo de Request (`POST /api/users/me/consents`):**
```json
{
  "purpose": "marketing_emails",
  "granted": true,
  "grantedAt": "2026-02-16T15:00:00.000Z"
}
```

**Exemplo de revogação (`DELETE /api/users/me/consents/marketing_emails`):**
```json
{
  "purpose": "marketing_emails",
  "granted": false,
  "revokedAt": "2026-02-16T15:10:00.000Z",
  "ticketId": "consent-revoke-123"
}
```

**Status esperados:**
- `201 Created`: consentimento registrado
- `200 OK`: listagem de consentimentos atuais
- `204 No Content`: consentimento revogado
- `400 Bad Request`: payload inválido
- `403 Forbidden`: sem permissão para o usuário autenticado
- `404 Not Found`: usuário ou consentimento inexistente

**Controle de acesso das rotas LGPD:**
| Endpoint | Público | Autenticado | Admin |
|----------|---------|-------------|-------|
| `GET /api/users/me/export` | Não | Sim (próprio usuário) | Sim |
| `GET /api/leads/{id}/export` | Não | Sim (com acesso ao lead) | Sim |
| `POST /api/users/request-deletion` | Não | Sim (próprio usuário) | Sim |
| `POST /api/users/me/consents` | Não | Sim (próprio usuário) | Sim |
| `GET /api/users/me/consents` | Não | Sim (próprio usuário) | Sim |
| `DELETE /api/users/me/consents/{purpose}` | Não | Sim (próprio usuário) | Sim |

> **Nota:** `privacyPolicy`, `termsOfService`, `cookiePolicy` e `dataRetentionDays` governam a retenção e o texto exibido na UI de consentimento. O fluxo de exclusão deve respeitar `dataRetentionDays` antes da remoção permanente.

---

## Limitações e Restrições

### Autenticação

1. **Token Expiration**: Tokens JWT expiram em 7200 segundos (2 horas)
2. **Max Login Attempts**: 5 tentativas antes de bloqueio por 10 minutos
3. **Bearer Token Required**: Endpoints administrativos exigem header `Authorization`

### Rate Limiting

Implementado via middleware (in-memory).

**Configurações:**
- **Limite**: 100 requisições por IP a cada 15 minutos
- **Resposta ao exceder**: `429 Too Many Requests`
- **Header Retry-After**: Tempo em segundos até poder tentar novamente
- **Rotas sensíveis priorizadas**: `/api/users/login`, `/api/leads`, `/api/properties`, `/api/neighborhoods`, distribuição round-robin de leads

#### Configuração via Variáveis de Ambiente

- `RATE_LIMIT_WINDOW_MS`: janela da regra (ms).  
  Padrão recomendado: `900000` (15 minutos).
- `RATE_LIMIT_MAX_REQUESTS`: máximo de requisições por janela.  
  Padrão recomendado: `100`.
- `RATE_LIMIT_SKIP_SUCCESSFUL`: ignora respostas 2xx na contagem (`true|false`).  
  Padrão recomendado: `false`.
- `REDIS_URL` (opcional): habilita armazenamento distribuído (produção multi-instância).

#### Endpoints com rate limiting mais restritivo

- `POST /api/users/login`: **5 requisições / 10 minutos**
- `POST /api/leads`: **20 criações / hora**
- `POST /api/revalidate`: **10 requisições / 5 minutos**
- `POST /api/users/me/consents`: **30 requisições / hora**

> **Nota para Produção**: Para ambientes com múltiplas instâncias, recomenda-se usar Redis para rate limiting distribuído ao invés de armazenamento in-memory.
> **Backlog relacionado**: priorização do hardening de rate limit antes de go-live (ver plano de segurança/LGPD).

### Paginação

- **Default Limit**: 10 documentos por página
- **Max Limit**: 100 documentos por página
- Use parâmetros `page` e `limit` para controle

### Query Constraints

- **Maximum Depth**: Consultas aninhadas limitadas a profundidade de 10 níveis
- **Sort**: Payload CMS suporta ordenação múltipla. Use o parâmetro `sort` com campos separados por vírgula:
  - `sort=-price` (ordena por preço decrescente)
  - `sort=createdAt,price` (ordena por data ASC e preço ASC)
  - `sort=-createdAt,-price` (ordena por data DESC e preço DESC)
  - Use prefixo `-` para ordem decrescente

### Upload de Arquivos

- **Max File Size**: Configurado no Payload CMS (padrão: 10MB)
- **Allowed Types**: Imagens (JPG, PNG, WebP, AVIF)

### Revalidação de Cache

- Requer `REVALIDATE_SECRET` configurado em variáveis de ambiente
- Caminho deve existir no Next.js

### Acesso a Dados

- Leads só podem ser acessados pelo agente atribuído ou admins
- Deals só podem ser acessados pelo agente responsável ou admins
- Activities só podem ser acessadas pelo criador ou admins

### Hooks e Efeitos Colaterais

1. **Leads**: Ao criar lead, distribuição automática round-robin para agentes ativos
2. **Properties**: Ao publicar, cache ISR é revalidado automaticamente
3. **Score Calculation**: Score de lead é calculado automaticamente baseado em campos preenchidos

### Variáveis de Ambiente Obrigatórias

```bash
## Development
PAYLOAD_SECRET=dev-secret-local
DATABASE_URL=./payload.db
REVALIDATE_SECRET=dev-revalidate-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL=false

## Production (Recommended)
PAYLOAD_SECRET=<gerar-segredo-forte>
REVALIDATE_SECRET=<gerar-segredo-forte>
DATABASE_URL=postgresql://user:password@host:5432/primeurban
# DATABASE_URL=mysql://user:password@host:3306/primeurban
REDIS_URL=redis://user:password@host:6379
```

> **Importante:** SQLite é adequado para desenvolvimento/local. Para produção, priorize PostgreSQL ou MySQL por concorrência, observabilidade e escalabilidade.

---

## Exemplos de Uso

### Criar Propriedade e Publicar

```bash
# 1. Login
LOGIN_RESPONSE=$(curl -s -X POST https://api.primeurban.com.br/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@primeurban.com.br","password":"Admin123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 2. Criar Propriedade
curl -X POST https://api.primeurban.com.br/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Apartamento de Luxo na Lago Sul",
    "type": "apartamento",
    "category": "luxo",
    "status": "published",
    "price": 1500000,
    "privateArea": 180,
    "bedrooms": 4,
    "suites": 3,
    "bathrooms": 4,
    "parkingSpaces": 3,
    "address": "SHIS QI 23, Bloco A",
    "neighborhood": "lago-sul",
    "featured": true
  }'
```

### Buscar Propriedades com Filtros

```bash
curl -X GET "https://api.primeurban.com.br/api/properties?where[type][equals]=apartamento&where[bedrooms][greater_than]=2&where[price][less_than]=1000000&sort=-price&limit=20"
```

### Criar Lead (Público)

```bash
curl -X POST https://api.primeurban.com.br/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Oliveira",
    "phone": "+5561999999999",
    "email": "joao@email.com",
    "source": "website",
    "property": "prop-id-123"
  }'
```

### Dashboard Stats

```bash
curl -X GET https://api.primeurban.com.br/api/dashboard-stats \
  -H "Authorization: Bearer $TOKEN"
```

### Revalidar Cache

```bash
curl -X POST "https://api.primeurban.com.br/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: $REVALIDATE_SECRET" \
  -d '{"path":"/imoveis/apartamento-lago-sul"}'
```

---

## Status Codes

| Código | Descrição                      |
|--------|--------------------------------|
| 200    | OK                             |
| 201    | Created                        |
| 400    | Bad Request                    |
| 401    | Unauthorized                   |
| 403    | Forbidden                      |
| 404    | Not Found                      |
| 500    | Internal Server Error          |

---

## Suporte

Para dúvidas ou problemas, contate: contato@primeurban.com.br

---

**Última atualização:** 16 de fevereiro de 2026
