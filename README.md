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
