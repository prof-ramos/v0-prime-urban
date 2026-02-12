# Contexto do Projeto PrimeUrban

Este documento contém informações sobre o projeto para orientar desenvolvimento e design.

---

## Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|------|
| Next.js | 16.1.6 | Framework React |
| React | 19.2.0 | Biblioteca UI |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.1.9 | Estilização com design tokens |
| Lucide React | - | Ícones |
| Vercel Analytics | 1.3.1 | Análise de uso |

---

## Design Tokens (Paleta de Cores)

```css
/* Cores da Marca */
--primary-brand: #1D2D3A      /* Azul marinho profundo */
--secondary-brand: #B68863    /* Azul acinzentado */
--accent-brand: #3D4D55       /* Dourado */
--base-cream: #F9F6F0        /* Creme claro */
--base-tan: #D9C3A9          /* Bege claro */
--base-mauve: #A78E9C        /* Malha suave */

/* Semântico */
--background: #F9F6F0        /* Fundo da página */
--foreground: #1D2D3A        /* Texto principal */
--card: #ffffff               /* Fundo dos cards */
--card-foreground: #1D2D3A   /* Texto dos cards */
--primary: #1D2D3A           /* Elementos primários */
--primary-foreground: #F9F6F0 /* Texto sobre primário */
--accent: #3D4D55            /* Destaques */
--accent-foreground: #F9F6F0  /* Texto sobre destaque */
--border: #D9C3A9            /* Bordas sutis */
--muted: #D9C3A9             /* Texto mutado */
--muted-foreground: #F9F6F0  /* Fundo de texto mutado */

/* WhatsApp */
--whatsapp: #25D366            /* Verde WhatsApp */
```

---

## Tipografia

```css
/* Font Config */
--font-sans: 'Inter', sans-serif           /* Texto de corpo */
--font-serif: 'Libre Baskerville', serif   /* Títulos e serifados */
--font-mono: 'Geist Mono' (não usado)  /* Removido na Fase 3 */
```

**Uso Atual:**
- **Inter** para texto de corpo (leitura)
- **Playfair Display** para títulos (elegância, sofisticação)
- **Libre Baskerville** como fallback serif

**Hierarquia Típica:**
- H1: Playfair Display, 48-56px
- H2: Playfair Display, 36-44px
- H3: Playfair Display, 28-32px
- Body: Inter, 16-18px (base)
- Small: Inter, 14px

---

## Espaçamento e Layout

```css
/* Radius */
--radius: 1.25rem               /* Bordas arredondadas */
--radius-sm: calc(var(--radius) - 4px)
--radius-md: calc(var(--radius) - 2px)
--radius-lg: var(--radius)
--radius-xl: calc(var(--radius) + 4px)
```

**Características do Layout:**
- Container centralizado com max-width
- Espaçamentos generosos (padding adequado)
- Grid responsivo para cards de propriedades
- Sidebar de navegação em desktop
- Header fixo com informações de contato

---

## Padrões de Componentes

### Cards de Propriedade
- Fundo branco (#ffffff)
- Imagem de destaque no topo
- Informações em sobreposição (overlay)
- Bordas arredondadas sutis
- Hover com elevação sutil

### Botões
- Primário: background #1D2D3A, texto branco
- Secundário: outline ou background transparente
- Borda arredondada: --radius
- Padding generoso
- Transições suaves

### Formulários
- Inputs com borda sutil (#D9C3A9)
- Focus com ring (#1D2D3A)
- Labels claros e legíveis
- Validação em tempo real

---

## Funcionalidades Principais

### Catálogo de Imóveis
- Listagem com filtros avançados
- Cards de propriedade com imagem, preço, características
- Página de detalhes com galeria de imagens
- Contador de resultados

### Filtros
- Tipo de transação (venda/aluguel)
- Tipo de imóvel (apartamento, casa, cobertura)
- Faixa de preço
- Número de quartos e vagas
- Busca por texto ou código
- Filtro por bairro

### Contato
- Botão flutuante do WhatsApp
- Formulário com validação
- Informações de contato no header e footer

---

## Diretrizes de Design

### 1. Sofisticação e Exclusividade
O design deve transmitir **luxo e elegância**:
- Usar Playfair Display para títulos (serifa clássica e sofisticada)
- Espaçamentos generosos para respiração visual
- Cores sóbrias e bem combinadas
- Imagens de alta qualidade

### 2. Hierarquia Visual Clara
- **Primário**: Azul marinho (#1D2D3A) para CTAs e informações importantes
- **Secundário**: Azul acinzentado (#B68863) para elementos de suporte
- **Destaque**: Dourado (#3D4D55) para badges e preços
- **Fundo**: Creme claro (#F9F6F0) para amplitude

### 3. Acessibilidade
- Contraste adequado (WCAG AA mínimo)
- Tamanho de fonte mínimo 16px para corpo
- Labels claros em formulários
- Estados de foco visíveis
- Alt text em imagens

### 4. Responsividade
- Mobile-first approach
- Grid de 1 coluna em mobile, 2-3 em desktop
- Navegação adaptativa (menu hambúrguer em mobile)
- Imagens responsivas com Next.js Image

### 5. Performance
- Otimização de imagens (AVIF/WebP) habilitada
- React.memo em componentes pesados
- Debounce em filtros de busca
- Cache de assets estáticos
- Service Worker para PWA

---

## Status Atual

### Implementado (v0.3.0 - Fase 3)
- ✅ PWA Service Worker com estratégias de cache
- ✅ Ícones PWA (192x192, 512x512)
- ✅ Página 404 customizada
- ✅ Dark mode removido (código mais limpo)

### Otimizações Anteriores (v0.2.0)
- ✅ Otimização de imagens AVIF/WebP
- ✅ React.memo em PropertyCard e FeaturedProperties
- ✅ Debounce de 300ms em filtros
- ✅ Remoção de pacotes não utilizados
- ✅ Cache headers HTTP

---

## Princípios para Desenvolvimento Futuro

Ao adicionar novas funcionalidades ou componentes:

1. **Manter consistência** com tokens de design existentes
2. **Usar tipografia apropriada** (Inter para corpo, Playfair para títulos)
3. **Seguir hierarquia de cores** (Primary > Secondary > Accent)
4. **Priorizar performance** (imagens otimizadas, memoização)
5. **Garantir acessibilidade** (contraste, labels, foco)
6. **Manter mobile-first** (responsividade em todos os componentes)
7. **Usar espaços consistentes** (múltiplos de 8px ou 16px)
8. **Testar em ambos os estados** (hover, focus, active, disabled)

---

## Estrutura de Arquivos

```
app/
├── layout.tsx              # Layout root com fontes e metadata
├── page.tsx                # Homepage
├── globals.css             # Design tokens e estilos globais
├── imoveis/
│   ├── page.tsx           # Listagem de propriedades
│   └── [slug]/page.tsx     # Detalhes do imóvel
└── not-found.tsx           # Página 404

components/
├── header.tsx              # Cabeçalho com navegação
├── footer.tsx              # Rodapé com links
├── property-card.tsx        # Card de propriedade (com memo)
├── property-filters.tsx     # Componente de filtros
├── featured-properties.tsx  # Propriedades em destaque
├── contact-form.tsx        # Formulário de contato
├── whatsapp-float.tsx      # Botão flutuante do WhatsApp
└── service-worker-register.tsx # Registro do PWA SW

lib/
├── utils.ts                # Utilitários (formatCurrency)
├── mock-data.ts            # Dados mock de propriedades
└── utils.ts                # Funções helper

public/
├── manifest.json           # Manifesto PWA
├── sw.js                 # Service Worker
└── icon-*.png            # Ícones da aplicação
```

---

## Metadados SEO

```typescript
title: 'PrimeUrban | Imóveis de Alto Padrão em Brasília'
description: 'Encontre apartamentos e casas de alto padrão em Brasília. Curadoria exclusiva de imóveis na Asa Sul, Asa Norte, Águas Claras, Sudoeste e mais.'
keywords: [
  'imóveis Brasília',
  'apartamentos Asa Sul',
  'casas Asa Norte',
  'imobiliária Brasília',
  'imóveis alto padrão DF'
]
```

---

**Última atualização:** 2026-02-12
**Versão:** v0.3.0 (Fase 3 concluída)
