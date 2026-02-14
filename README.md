# PrimeUrban

![PrimeUrban](https://img.shields.io/badge/PrimeUrban-Alto_Padrão-blue?style=for-the-badge)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/gabriel-ramos-projects-c715690c/v0-prime-urban)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

> Plataforma imobiliária de alto padrão especializada em Brasília, DF.

## [🌐 Visite o site](https://vercel.com/gabriel-ramos-projects-c715690c/v0-prime-urban)

## Sobre

A **PrimeUrban** é uma plataforma moderna de imóveis de alto padrão, focada em oferecer uma experiência sofisticada para compra e locação de propriedades de luxio em Brasília. Nosso catálogo inclui apartamentos, casas e coberturas nos bairros mais exclusivos da capital brasileira.

## Funcionalidades

### Busca Inteligente
- Filtragem avançada por tipo de transação (venda/aluguel)
- Busca por bairro ou código do imóvel
- Navegação intuitiva por galeria de imagens

### Catálogo de Imóveis
- Propriedades de alto padrão em destaque
- Informações detalhadas: área, quartos, suítes, vagas
- Valores de condomínio e IPTU
- Características especiais (pet-friendly, orientação solar)

### Exploração por Bairros
- Asa Sul, Asa Norte, Águas Claras
- Sudoeste, Noroeste, Lago Sul
- Contagem de imóveis por região

### Contato Profissional
- Integração direta com WhatsApp
- Formulário de contato com validação
- Atendimento personalizado CRECI-DF

## Stack Tecnológico

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| [Next.js](https://nextjs.org/) | 16.1.6 | Framework React |
| [React](https://react.dev/) | 19.2.0 | Biblioteca UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.9 | Estilização |
| [Radix UI](https://www.radix-ui.com/) | - | Componentes acessíveis |
| [Lucide](https://lucide.dev/) | - | Ícones |
| [Vercel Analytics](https://vercel.com/analytics) | 1.3.1 | Análise de uso |

## Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Passos

1. Clone o repositório:

```bash
git clone https://github.com/gabrielramos/v0-prime-urban.git
cd v0-prime-urban
```

2. Instale as dependências:

```bash
npm install
```

3. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

4. Acesse [http://localhost:3000](http://localhost:3000)

## 📚 Próximos Passos

Depois de configurar o projeto:

1. **Entenda a estrutura** → [Leia sobre arquitetura](#-arquitetura-de-componentes)
2. **Performance** → [Veja o backlog de otimizações](./PERFORMANCE_BACKLOG.md)
3. **Contribua** → [Leia as guidelines](./CONTRIBUTING.md)
4. **Reporte bugs** → [Abra uma issue](https://github.com/gabrielramos/v0-prime-urban/issues)

## 🔧 Troubleshooting

### Porta 3000 em uso
```bash
# Mate o processo na porta 3000
npx kill-port 3000
# ou use outra porta
npm run dev -- -p 3001
```

### Erro de build após mudanças
```bash
# Limpe cache e reinstale
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript errors
```bash
# Type check isolado
npx tsc --noEmit
```

### Imagens não carregam
Verifique se `next.config.mjs` tem o domínio Unsplash configurado:
```javascript
images: {
  remotePatterns: [
    { hostname: 'images.unsplash.com' }
  ]
}
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa linter ESLint |

## Estrutura do Projeto

```
v0-prime-urban/
├── app/              # App Router do Next.js
├── components/       # Componentes React reutilizáveis
├── lib/             # Utilitários e helpers
├── public/          # Arquivos estáticos
└── styles/          # Estilos globais
```

## Licença CRECI

Este projeto é de uso privado e está associado à CRECI-DF para atividades de corretagem de imóveis.

## Performance & Documentação

### Análise de Performance

**Relatórios Disponíveis:**
- 📊 [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md) - Análise completa com 15+ problemas identificados
- 📋 [PERFORMANCE_BACKLOG.md](./PERFORMANCE_BACKLOG.md) - Backlog estruturado com 12+ tarefas priorizadas

### Otimizações Implementadas (v0.4.0)

| Métrica | Antes | Depois | Melhoria |
|---------|--------|---------|----------|
| Bundle JS | ~450 KB | ~140 KB | **69%** |
| Imagens | ~500 KB | ~120 KB | **76%** |
| Re-renders | 6 cards | 0-1 cards | **80%** |
| Lookups de filtro | O(n) | O(1) | **~80%** |
| Renderização off-screen | Full | Skip | **~50%** |
| Vulnerabilidades | 3 (1 alta, 2 moderadas) | 0 | **100%** |

**v0.4.0 - Vercel React Best Practices:**
- ✅ 12 regras Vercel aplicadas em 22 arquivos
- ✅ O(1) lookups com Maps indexados
- ✅ Content-visibility CSS para longas listas
- ✅ JSX estático extraído fora de componentes
- ✅ Dynamic imports para code splitting
- ✅ Memoização otimizada em filtros e cards
- ✅ React.memo comparer corrigido

**v0.3.0 - PWA:**
- ✅ Service Worker com cache strategies
- ✅ PWA manifest e ícones
- ✅ Página 404 customizada

Veja [CHANGELOG.md](./CHANGELOG.md) para histórico completo.

## Roadmap

### Próximas Otimizações (Prioridade ALTA)

🔴 **Alto Impacto (2-4 horas):**
1. Implementar ISR (Incremental Static Regeneration) para páginas de propriedades
2. Adicionar HTTP cache headers com stale-while-revalidate
3. Pre-computar neighborhoodNormalized para O(1) lookup

🟡 **Médio Impacto (4-8 horas):**
4. Memoizar updateFilter com useCallback
5. Implementar stale-while-revalidate no Service Worker
6. Adicionar pre-caching de assets críticos

Veja [PERFORMANCE_BACKLOG.md](./PERFORMANCE_BACKLOG.md) para o backlog completo.

### Longo Prazo (quando necessário)
- Migrar de mock-data para API real
- Implementar Virtual Scrolling para listas grandes (50+ propriedades)
- Usar React.cache() para data fetching (React 19)

## Deploy

O projeto é automaticamente implantado na [Vercel](https://vercel.com) a partir deste repositório.

---

## 🏗️ Arquitetura de Componentes

### Componentes Principais

- **PropertyCard**: Componente memoizado para exibição de cartões de propriedade em listagens. Usa React.memo para evitar re-renders desnecessários.
- **PropertyFilters**: Sistema de filtros com debounce de 300ms para otimização de performance. Suporta filtros por tipo, bairro, preço, quartos e vagas.
- **ContactForm**: Formulário de contato com integração direta ao WhatsApp.
- **FeaturedProperties**: Lista de propriedades em destaque na homepage.

### Padrões Utilizados

- Componentes funcionais com React Hooks
- TypeScript para type safety
- Tailwind CSS para estilização
- Radix UI para componentes de UI base

## 🛠️ Ambiente de Desenvolvimento

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificar código com ESLint
npm run lint

# Type check
npx tsc --noEmit
```

## 📁 Estrutura de Pastas

```
app/
├── layout.tsx          # Layout root com fontes e metadata
├── page.tsx            # Homepage
├── imoveis/            # Rotas de imóveis
│   ├── page.tsx        # Listagem de propriedades
│   └── [slug]/         # Páginas dinâmicas de detalhes

components/
├── ui/                 # Componentes base (shadcn/ui)
└── *.tsx               # Componentes de domínio

lib/
├── constants.ts        # Constantes centralizadas
├── types.ts            # Tipos de domínio
├── utils.ts            # Funções utilitárias
└── mock-data.ts        # Dados mockados

public/
├── sw.js               # Service Worker para PWA
└── manifest.json       # Manifesto PWA
```

## 📝 Padrões de Código

- **Convenção de Nomes**:
  - Componentes: PascalCase (PropertyCard, Header)
  - Funções: camelCase (formatCurrency, handleSubmit)
  - Constantes: SCREAMING_SNAKE_CASE (WHATSAPP_CONFIG)
  - Interfaces/Types: PascalCase (Property, FilterState)

- **TypeScript**:
  - Usar union types em vez de strings genéricas
  - Evitar `any` - usar tipos específicos
  - Interfaces para objetos, types para unions

- **React**:
  - Componentes devem usar React.memo se usados em listas
  - useEffect com cleanup para efeitos colaterais
  - Debounce para inputs de busca

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](./CONTRIBUTING.md) para:

- Guias de desenvolvimento local
- Convenções de commit (Conventional Commits)
- Processo de Pull Request
- Padrões de código

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

Desenvolvido com [v0.dev](https://v0.dev) e integrado com Vercel.
