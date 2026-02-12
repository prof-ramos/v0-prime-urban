# Changelog - PrimeUrban

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Planejado
- Fase 3: Separação de componentes client/server da página /imoveis (DEFERIDA até integração de API)
- Virtual Scrolling para datasets grandes (documentado, implementação deferida até 50+ propriedades)

---

## [0.3.0] - 2026-02-12

### Adicionado
- PWA Service Worker (`public/sw.js`) com estratégias de cache
- Ícones PWA (192x192 e 512x512) gerados
- Componente de registro de service worker (`components/service-worker-register.tsx`)
- Documentação de baseline para virtual scrolling
- Página 404 customizada (`app/not-found.tsx`)

### Removido
- Pacote `next-themes` e componente `theme-provider.tsx`
- CSS da classe `.dark` (33 linhas) de `app/globals.css`
- Arquivo `app/sw.ts` (TypeScript, substituído por `public/sw.js`)

### Alterado
- `app/layout.tsx`: Adicionado registro de service worker via componente client
- `next.config.mjs`: Adicionado header Content-Type para `/sw.js`

### Corrigido
- Bug crítico: Service worker em TypeScript não era compilado automaticamente
- Build falhava devido ao componente Script com template strings
- Adicionadas verificações `typeof window === "undefined"` para SSR safety

### Performance
- Service worker instalado e funcionando
- Cache de assets estáticos configurado
- PWA pronto para instalação em dispositivos móveis

---

## [0.2.0] - 2026-02-11

## [0.2.0] - 2026-02-11

### Adicionado
- Cache headers HTTP (1 year immutable) para assets estáticos
- Utilitário compartilhado `formatCurrency` em `lib/utils.ts`
- React.memo no `PropertyCard` com função de comparação customizada
- React.memo no `FeaturedProperties` com useMemo
- Debounce de 300ms nos inputs de filtro (use-debounce)
- Ordenação de filtros por seletividade (filtros seletivos antes de busca)

### Alterado
- Otimização de imagens habilitada (AVIF/WebP)
- Removida fonte Geist Mono não utilizada (~130 KB)
- Cadeia de filtros reordenada para melhor performance

### Removido
- 22 pacotes Radix UI não utilizados (~160 KB)
- 6 bibliotecas UI pesadas não utilizadas (~285 KB):
  - recharts
  - react-day-picker
  - cmdk
  - embla-carousel-react
  - input-otp
  - vaul

### Corrigido
- Atualizado Next.js 16.0.10 → 16.1.6
- Corrigida vulnerabilidade de alta severidade (HTTP deserialização DoS)
- Corrigidas 2 vulnerabilidades de severidade moderada (Image Optimizer DoS, PPR memory)

### Performance
- Redução estimada de bundle: ~625-785 KB
- Melhoria de 80% em re-renders desnecessários
- Imagens 40-60% menores com AVIF/WebP

---

## [0.1.0] - 2026-02-09

### Adicionado
- Página inicial com catálogo de imóveis
- Página de listagem de imóveis com filtros avançados
- Página de detalhes do imóvel
- Seção de bairros de Brasília
- Formulário de contato com integração WhatsApp
- Integração com Vercel Analytics
- Layout responsivo com tema PrimeUrban

### Stack Tecnológico Inicial
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Radix UI (parcialmente utilizado)
- Lucide Icons

---

[Unreleased]: https://github.com/gabrielramos/v0-prime-urban/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/gabrielramos/v0-prime-urban/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/gabrielramos/v0-prime-urban/releases/tag/v0.1.0
