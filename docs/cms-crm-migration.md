# Migração CMS + CRM (sem Payload)

## Contexto atual
- Frontend Next.js App Router em `app/(website)`.
- Catálogo usa `lib/api.ts` com datasource local (`lib/mock-data.ts`).
- Captação de interesse ocorre no `components/contact-form.tsx` (ainda sem persistência de lead).

## Objetivo
Substituir o Payload por uma base própria para CMS + CRM, com referência de UI/arquitetura em:
- `https://github.com/satnaing/shadcn-admin.git` (MIT)

## Proposta de arquitetura
- `apps/web`: site público (já existente).
- `apps/admin`: painel administrativo estilo shadcn-admin.
- `services/cms`: API para gestão de imóveis, mídia, bairros/regiões e páginas.
- `services/crm`: API para funil de leads, atividades, corretores e status comercial.

## Modelo de domínio sugerido
- CMS:
  - `properties`
  - `regions`
  - `media`
  - `pages`
- CRM:
  - `leads`
  - `lead_interactions`
  - `pipeline_stages`
  - `agents`

## Integrações iniciais no web
1. `PropertyFilters` e páginas de imóvel consumindo `GET /properties`.
2. `ContactForm` enviando para `POST /leads`.
3. CTA de WhatsApp registrando evento em `lead_interactions` quando houver clique rastreável.

## Fases
1. Fase 1: manter mock como fallback e criar API real.
2. Fase 2: trocar `lib/api.ts` para consumir CMS real.
3. Fase 3: persistir leads e pipeline no CRM.
4. Fase 4: ativar painel administrativo (shadcn-admin como base visual).
