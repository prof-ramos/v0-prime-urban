# PrimeUrban

Plataforma imobiliaria de alto padrao para compra e locacao em Brasilia-DF.

## Status do projeto

O repositorio esta em transicao para uma arquitetura completa de CMS + CRM.

- Estado atual: frontend Next.js funcional, com foco em listagem de imoveis e captura de contato.
- Estado alvo: stack Payload-first (CMS/Admin/Auth) + CRM + operacao em VPS com Portainer e Traefik.

## Stack atual

| Camada                   | Tecnologia                         |
| ------------------------ | ---------------------------------- |
| Web                      | Next.js 16 + React 19              |
| Linguagem                | TypeScript 5                       |
| UI                       | Tailwind CSS 4 + Radix UI + Lucide |
| Validacao de formularios | React Hook Form + Zod              |
| Analytics                | Vercel Analytics                   |

## Stack alvo (roadmap)

| Camada          | Tecnologia                                |
| --------------- | ----------------------------------------- |
| CMS/Admin/Auth  | Payload CMS 3.x (MIT)                     |
| Banco           | PostgreSQL 16                             |
| Filas e jobs    | Redis 7 + BullMQ                          |
| Storage         | MinIO (S3-compatible)                     |
| Imagens         | imgproxy                                  |
| Observabilidade | Prometheus + Grafana + Loki + Uptime Kuma |
| Orquestracao    | Docker Compose via Portainer              |
| Proxy/TLS       | Traefik                                   |

## Quick Start

### Pre-requisitos

- Node.js 20+
- npm 10+

### Rodando localmente

```bash
git clone https://github.com/gabrielramos/v0-prime-urban.git
cd v0-prime-urban
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts

| Comando         | Descricao                          |
| --------------- | ---------------------------------- |
| `npm run dev`   | Sobe o ambiente de desenvolvimento |
| `npm run build` | Gera build de producao             |
| `npm run start` | Executa build em modo producao     |
| `npm run lint`  | Executa ESLint                     |
| `npm run payload:generate:importmap` | Regenera `app/(payload)/admin/importMap.js` |
| `npm run e2e`   | Executa suíte E2E Playwright (headless) |
| `npm run e2e:headed` | Executa E2E com navegador visível |
| `npm run e2e:ui` | Abre Playwright UI mode |
| `npm run e2e:report` | Abre relatório HTML do Playwright |
| `npm run e2e:install` | Instala Chromium para testes E2E |

### ImportMap do Payload Admin

O arquivo `app/(payload)/admin/importMap.js` é **gerado automaticamente** e deve permanecer versionado para builds determinísticas.  
Para regenerar após mudanças de componentes no admin, execute:

```bash
npm run payload:generate:importmap
```


## Estratégia de testes E2E (Playwright)

A suíte E2E foi estruturada com **planejamento guiado por entrevista** antes da automação. O objetivo é alinhar fluxos críticos, autenticação, dados de teste e execução paralela com o time.

### 1) Roteiro de entrevista (antes de codar)

Use este checklist em reuniões rápidas com produto/negócio/engenharia:

1. **Fluxos críticos do usuário**
   - Quais jornadas geram maior valor/receita?
   - Quais telas não podem quebrar em produção?
   - O que deve ser bloqueante no CI?
2. **Estratégia de autenticação**
   - Haverá login real, stub, ou sessão pré-carregada?
   - Qual perfil de usuário mínimo para cenários autenticados?
   - Como rotacionar credenciais no CI (GitHub Secrets)?
3. **Dados de teste**
   - Usar dados seed fixos, mock, ou ambiente compartilhado?
   - Quais dados precisam ser idempotentes?
   - Como evitar flaky tests por dados mutáveis?
4. **Paralelização e performance**
   - Quais testes podem rodar em paralelo sem colisão?
   - Quantos workers no CI sem saturar ambiente?
   - Quais testes ficam em smoke vs regressão completa?

### 2) Arquitetura implementada

- **Page Object Model (POM)** em `e2e/pages/*` para encapsular seletores e ações.
- **Fixtures customizadas** em `e2e/fixtures/base.fixture.ts`.
- **Persistência de autenticação** em `e2e/tests/auth.setup.ts`, gravando storage state em `e2e/.auth/admin.json`.
- **Visual regression** em `e2e/tests/visual.spec.ts` com máscaras para imagens remotas (evita falsos positivos).
- **CI GitHub Actions** em `.github/workflows/e2e.yml` com artifacts (`playwright-report` e `test-results`).

### 3) Estrutura de pastas E2E

```txt
e2e/
├── fixtures/
│   ├── base.fixture.ts
│   └── test-data.ts
├── pages/
│   ├── admin-login.page.ts
│   ├── home.page.ts
│   ├── properties.page.ts
│   └── property-details.page.ts
└── tests/
    ├── auth.setup.ts
    ├── admin.authenticated.spec.ts
    ├── home.spec.ts
    ├── properties.spec.ts
    └── visual.spec.ts
```

### 4) Execução local

```bash
npm run e2e:install
npm run e2e
```

Para cenários autenticados, configure:

```bash
export E2E_ADMIN_EMAIL="admin@dominio.com"
export E2E_ADMIN_PASSWORD="senha-forte"
npm run e2e
```

Se as credenciais não forem definidas, os testes autenticados são pulados automaticamente.

### 5) Baselines visuais

Na primeira execução do visual regression, gere snapshots:

```bash
npx playwright test e2e/tests/visual.spec.ts --update-snapshots
```

Depois, as diferenças visuais passam a ser validadas no CI.

## Estrutura do projeto

```txt
v0-prime-urban/
├── app/                 # Rotas e paginas (App Router)
├── components/          # Componentes de UI e dominio
├── lib/                 # Tipos, utilitarios e dados
├── public/              # Assets estaticos
├── docs/                # Documentacao de arquitetura e migracao
└── plans/               # PRDs, planos e requisitos de VPS
```

## Documentacao principal

- Plano base CMS/CRM: [`plans/cms_crm_plan.md`](./plans/cms_crm_plan.md)
- Plano MIT/Open Source (Payload-first): [`plans/mit_codex.md`](./plans/mit_codex.md)
- PRD focado em Payload: [`plans/payload-prd.md`](./plans/payload-prd.md)
- Requisitos de VPS: [`plans/vps_requirements.md`](./plans/vps_requirements.md)
- Guia de migracao: [`docs/cms-crm-migration.md`](./docs/cms-crm-migration.md)
- Roadmap tecnico: [`docs/roadmap.md`](./docs/roadmap.md)

## Deploy

### Atual

Deploy continuo na Vercel para validacao rapida de frontend.

### Alvo (producao VPS)

- VPS Linux com Docker
- Portainer para gestao de stacks
- Traefik para roteamento HTTPS
- Persistencia para PostgreSQL e MinIO

## Troubleshooting rapido

### Porta 3000 em uso

```bash
npx kill-port 3000
```

### Erro de build

```bash
rm -rf .next
npm run build
```

### Validacao de tipos

```bash
npx tsc --noEmit
```

## Contribuicao

Consulte [`CONTRIBUTING.md`](./CONTRIBUTING.md) para padroes de commit, fluxo de PR e convencoes do projeto.

## Licenca

Este projeto utiliza a [MIT License](./LICENSE).
