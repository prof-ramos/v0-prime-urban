# Análise de Implementação de CMS: V0 Prime Urban

Este documento apresenta a análise técnica para a escolha do CMS do projeto Prime Urban, comparando opções gratuitas, pagas e auto-hospedadas.

═══════════════════════════════════════════════════════════════

## 1. Diagnóstico Técnico do Repositório

- **Stack Atual:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI, Lucide React.
- **Arquitetura:** Front-end moderno orientado a componentes. Atualmente utiliza dados mockados (`lib/mock-data.ts`).
- **Caso de Uso:** Site imobiliário com listagem de imóveis, filtros de busca, galeria de imagens e integração com WhatsApp.
- **Requisitos Críticos:** SEO, performance de carregamento de imagens, facilidade de edição para o corretor/editor.

## 2. Mapeamento de Necessidades

- **Tipos de Conteúdo:** Imóveis (título, descrição, preço, área, quartos, geolocalização), Bairros, Mídia (galerias), Leads (contatos via formulário).
- **Fluxo Editorial:** 1-2 usuários (Corretor/Admin). Fluxo simples de aprovação.
- **Frequência:** Atualizações semanais de imóveis.
- **SEO:** Necessidade de metadados dinâmicos e sitemap automatizado.

## 3. Avaliação Comparativa

### Opção A: Strapi (Cloud Free Tier)

- **Limitações:** 500 entradas (total), 10GB storage, 2.500 API calls/mês.
- **Compatibilidade:** Excelente, via REST/GraphQL.
- **Esforço de Integração:** Médio (precisa configurar o cliente fetch no Next.js).
- **Custo Oculto:** R$ 0,00 no início, mas o upgrade para o plano "Essential" é caro (~$29/mês se exceder 500 itens).

### Opção B: Payload CMS 3.0 (Recomendação Gratuita/Híbrida)

- **Escolha:** Payload CMS.
- **Justificativa:** É construído _sobre_ o Next.js. Pode rodar na mesma instância do site (monolítico), eliminando latência de rede e simplificando o deployment.
- **Vantagens:**
  - Versionamento de código para o schema.
  - Local API (muito rápida para Server Components).
  - Sem limites de registros (usa seu próprio DB).
- **Desvantagem:** Necessita de um banco de dados (PostgreSQL/MongoDB) e storage (S3/Cloudinary) externos se hospedado em PaaS tipo Vercel.

### Opção C: VPS Contabo (Cloud VPS 10 - R$ 24,50/mês)

- **CMS Sugerido:** Directus ou Strapi self-hosted.
- **Viabilidade:** Alta potência (8GB RAM / 4 vCPU por ~€4,50).
- **TCO (Total Cost of Ownership):**
  - **Infraestrutura:** ~R$ 24,50/mês.
  - **Setup:** ~4-6 horas (Docker, Nginx, SSL, DB).
  - **Manutenção:** 2-4 horas/mês (updates, backups).
- **Overhead:** Monitoramento e segurança são responsabilidade do desenvolvedor.

## 4. Matriz de Decisão Ponderada

| Critério            | Peso | Strapi Free | Payload (Vercel/Neon) | VPS (Self-hosted) |
| :------------------ | :--: | :---------: | :-------------------: | :---------------: |
| Custo Mensal        | 25%  |     10      |   9 (DB Free Tier)    |         6         |
| Facilidade Setup    | 20%  |      8      |           9           |         4         |
| Manutenção          | 20%  |      9      |           8           |         2         |
| Escalabilidade      | 15%  |      5      |           9           |        10         |
| Performance (DX/UX) | 10%  |      7      |          10           |         8         |
| Integração Next.js  | 10%  |      8      |          10           |         7         |
| **SCORE FINAL**     | 100% |  **8,05**   |       **8,95**        |     **5,95**      |

_Nota: Strapi perde pontos no limite de 500 registros. VPS perde na manutenção._

## 5. Análise de Riscos e Mitigações

| Risco                      | Probabilidade | Impacto | Mitigação                                     |
| :------------------------- | :-----------: | :-----: | :-------------------------------------------- |
| Limite de 500 itens Strapi |     Alta      |  Médio  | Usar Payload para controle total do DB        |
| Complexidade VPS           |     Média     |  Alto   | Usar Coolify ou Dokku para automatizar o VPS  |
| Performance de Imagens     |     Alta      |  Alto   | Integração com Cloudinary ou Next/Image cache |

## 6. Roadmap de Implementação (Payload CMS)

**Fase 1 (Semana 1):** Setup Core

- Instalar Payload no projeto Next.js existente (`npx create-payload-app@latest`).
- Definir Collections: `Imoveis`, `Bairros`, `Categorias`.
- Configurar Local API para Server Components.

**Fase 2 (Semana 2):** Migração e Media

- Migrar dados de `lib/mock-data.ts` para o CMS.
- Configurar upload de imagens para Cloudinary/S3.
- Implementar Live Preview do Payload.

**Fase 3 (Semana 3+):** Deployment

- Configurar Postgres (ex: Neon.tech - Free Tier) ou VPS.
- CI/CD via GitHub Actions.

## 7. Recomendação Final

✅ **Solução recomendada:** **Payload CMS 3.0**

**Justificativa:**

- **Sincronia com o Stack:** Payload 3.0 é o "CMS do Next.js". Você não gerencia dois repositórios ou dois domínios diferentes.
- **Custo-Benefício:** Você pode hospedar o Admin e o Site na Vercel (Free) e o banco no Neon.tech (Free), mantendo custo **R$ 0,00** até atingir volumes consideráveis.
- **Performance:** O uso da Local API em Server Components é imbatível comparado a chamadas REST externas.

**Próximos passos:**

1. Inicializar o Payload no diretório raiz (`npx create-payload-app@latest`).
2. Mapear os campos existentes em `lib/types.ts` para o schema do Payload.
3. Criar a primeira rota de Admin em `/admin`.

═══════════════════════════════════════════════════════════════
