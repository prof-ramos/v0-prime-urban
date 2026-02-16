# Implementation Plan - Phase 1: Infrastructure & Foundations

Implementar os blocos fundamentais de infraestrutura que estão pendentes no PRD.

## Proposed Changes

### 1. Email Service (`lib/resend.ts`)

Criar o serviço de integração com a API [Resend](https://resend.com) para permitir o envio de notificações de leads e atualizações.

#### [MODIFY] [package.json](./package.json)

- Adicionar dependência `resend`.

#### [NEW] [resend.ts](./lib/resend.ts)

- Inicializar o client com `RESEND_API_KEY`.
- Exportar função `sendEmail(to, subject, html)`.

### 2. Properties Collection & View Count

Adicionar o rastreio de visualizações para os imóveis, conforme previsto no PRD §8.2.

#### [MODIFY] [properties.ts](./payload/collections/properties.ts)

- Adicionar campo `viewCount` (tipo `number`, `defaultValue: 0`, `admin: { readOnly: true }`).

#### [NEW] [view/route.ts](./app/api/properties/[id]/view/route.ts)

- Rota POST que incrementa o `viewCount` do imóvel via Payload Local API.

### 3. Environment Template

Garantir que todos os desenvolvedores tenham acesso às chaves necessárias.

#### [NEW] [.env.example](./.env.example)

- Incluir todas as variáveis listadas no PRD: `DATABASE_URL`, `PAYLOAD_SECRET`, `RESEND_API_KEY`, etc.

### 4. Hook Integration

Integrar o serviço de e-mail nos hooks existentes que hoje são apenas stubs.

#### [MODIFY] [distribute-lead.ts](./payload/hooks/afterCreate/distribute-lead.ts)

- Enviar e-mail para o corretor quando um lead é atribuído.

#### [MODIFY] [notify-leads.ts](./payload/hooks/afterChange/notify-leads.ts)

- Implementar a lógica de notificação real via `resend`.

## Verification Plan

### Automated Tests

- Simular chamada POST para a rota de views e verificar se o campo no banco incrementa.
- Testar envio de e-mail em modo dry-run (se disponível) ou via logs.

### Manual Verification

- Verificar se o `.env.example` contém todas as chaves mapeadas no PRD.
- Confirmar no Payload Admin se o campo `viewCount` aparece (como somente leitura).
