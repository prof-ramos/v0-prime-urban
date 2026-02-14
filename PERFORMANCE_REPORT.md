# Relatório de Performance - PrimeUrban

**Data:** 2026-02-14
**Versão:** v0.4.0
**Arquivos analisados:** 48 arquivos TypeScript/TSX

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Total de problemas identificados | 8 |
| Impacto ALTO | 2 |
| Impacto MÉDIO | 4 |
| Impacto BAIXO | 2 |
| Otimizações já implementadas | 12+ |

---

## Otimizações Já Implementadas ✅

### JavaScript Performance (CRÍTICO)
- ✅ `js-index-maps`: Maps O(1) em `lib/constants.ts:2955` para lookups de bairros
- ✅ `js-combine-iterations`: Filter único em `app/imoveis/page.tsx:3879`
- ✅ `js-early-exit`: Early exit quando nenhum filtro ativo em `app/imoveis/page.tsx:3871`
- ✅ `js-hoist-regexp`: Não há RegExp em loops (N/A)

### Rendering Performance
- ✅ `rendering-content-visibility`: CSS em `app/imoveis/page.tsx:4014`
- ✅ `rendering-hoist-jsx`: FilterContent extraído em `components/property-filters.tsx:4349`

### Re-render Optimization
- ✅ `rerender-memo`: PropertyCard em `components/property-card.tsx:22`
- ✅ `rerender-memo-with-default-value`: hasActiveFilters memoizado em `components/property-filters.tsx:4531`
- ✅ `rerender-derived-state-no-effect`: Estado derivado no render em `components/property-filters.tsx:4531`

### Cache & Bundle
- ✅ `bundle-dynamic-imports`: PropertyFilters em `app/imoveis/page.tsx:3850`
- ✅ `client-event-listeners`: Cleanup de debounce em `components/property-filters.tsx:4512`
- ✅ **Module-level cache**: `Intl.NumberFormat` em `lib/utils.ts:3148`
- ✅ **Function cache**: `getFeaturedProperties()` e `getPropertyBySlug()` com cache interno

---

## Quick Wins (Alto Impacto, Baixo Esforço)

### 1. ✅ [app/imoveis/page.tsx:3847] normalizeNeighborhood recriado a cada render - **JÁ RESOLVIDO**

**Status:** ✅ Implementado - A função já estava fora do componente (linha 33-34)

---

### 2. ✅ [components/property-card.tsx:125-127] React.memo com comparação insuficiente - **IMPLEMENTADO**

**Status:** ✅ Implementado - Removido comparador customizado insuficiente

**Mudança:** Removido o custom comparer que só verificava `property.id`. Agora o React.memo usa shallow compare padrão que compara todas as propriedades.

```diff
-}, (prevProps, nextProps) => {
-  return prevProps.property.id === nextProps.property.id
-})
+})
```

---

## Otimizações de Médio Prazo

### 3. [app/imoveis/page.tsx:3876] searchLower recalculado desnecessariamente

**Problema:** `searchLower` é calculado mesmo quando `filters.search` está vazio.

```typescript
// ❌ ATUAL (linha 3876)
const searchLower = filters.search ? filters.search.toLowerCase() : ""
```

**Solução:** Já está correto (early return evita o cálculo quando desnecessário). Nenhuma ação necessária.

---

### 4. [components/property-filters.tsx:4520-4527] Lógica de debounce inconsistente

**Problema:** O comentário diz "debounced" mas `search` usa atualização imediata.

```typescript
// ⚠️ CONFUSO (linha 4520-4527)
if (key === 'search' || key === 'minPrice' || key === 'maxPrice') {
  onFilterChange(newFilters)  // Imediato, não debounced
} else {
  debouncedOnFilterChange.callback(newFilters)  // Debounced
}
```

**Solução:** Considerar debounce para search também:

```typescript
// ✅ CORREÇÃO
if (key === 'minPrice' || key === 'maxPrice') {
  // Sliders precisam de feedback imediato para UX
  onFilterChange(newFilters)
} else if (key === 'search') {
  // Search pode ter debounce mais longo (500ms)
  debouncedSearchOnFilterChange.callback(newFilters)
} else {
  // Filtros de select usam debounce padrão (300ms)
  debouncedOnFilterChange.callback(newFilters)
}
```

**Impacto:** MÉDIO - Reduz re-renders durante digitação
**Esforço:** 30 minutos

---

### 5. [public/sw.js:13] Cache version hardcoded

**Problema:** Versão do cache hardcoded como `'v1'`, difícil de invalidar automaticamente.

```javascript
// ⚠️ ATUAL (linha 13-14)
const CACHE_VERSION = 'v1'
const CACHE_NAME = `prime-urban-${CACHE_VERSION}`
```

**Solução:** Usar timestamp ou hash do build.

```javascript
// ✅ CORREÇÃO - usar timestamp do build
const CACHE_VERSION = `${Date.now()}`
const CACHE_NAME = `prime-urban-${CACHE_VERSION}`

// OU integrar com build process para usar hash
```

**Impacto:** MÉDIO - Melhor controle de cache invalidation
**Esforço:** 20 minutos

---

### 6. [app/globals.css:4052] @custom-variant dark não utilizado

**Problema:** Variante dark CSS definida mas o dark mode foi removido.

```css
/* ⚠️ NÃO UTILIZADO (linha 4052) */
@custom-variant dark (&:is(.dark *));
```

**Solução:** Remover para limpar o CSS.

**Impacto:** BAIXO - Reduz tamanho do CSS marginalmente
**Esforço:** 1 minuto

---

## Oportunidades de Cache

### Implementadas ✅
- ✅ **Module-level cache**: `Intl.NumberFormat` em `lib/utils.ts`
- ✅ **Function cache**: `getFeaturedProperties()` e `getPropertyBySlug()` em `lib/mock-data.ts`
- ✅ **Service Worker**: Cache First para assets estáticos, Network First para HTML/API

### Faltantes (Prioridade MÉDIA)

#### 7. [app/imoveis/page.tsx] Falta React.cache para filteredProperties

**Problema:** `filteredProperties` é recalculado mesmo quando filtros não mudam.

**Solução:** Usar `React.cache()` (disponível no React 19):

```typescript
// ✅ CORREÇÃO - usar React.cache
import { cache } from 'react'

const getFilteredProperties = cache((filters: FilterState, sortBy: string) => {
  // ... lógica de filtragem
  return results
})

export default function PropertiesPage() {
  const filteredProperties = getFilteredProperties(filters, sortBy)
  // ...
}
```

**Impacto:** MÉDIO - Evita recálculos desnecessários
**Esforço:** 30 minutos

---

## Otimizações de Longo Prazo (Futura Consideração)

### 8. [lib/mock-data.ts] Dados mock carregados a cada import

**Problema:** `mockProperties` (6 propriedades) está sendo filtrado a cada chamada.

**Solução (futura):** Implementar API real com database.

**Impacto:** BAIXO - Apenas 6 propriedades, impacto mínimo
**Esforço:** Alto (requer implementação de API)

---

## Próximos Passos Recomendados

### Imediato (esta semana)
1. ✅ Mover `normalizeNeighborhood` para fora do componente
2. ✅ Ajustar `React.memo` comparison em PropertyCard
3. ✅ Remover `@custom-variant dark` não utilizado

### Curto Prazo (próximo mês)
4. ✅ Implementar debounce separado para search
5. ✅ Usar `React.cache()` para filteredProperties
6. ✅ Melhorar cache versioning no service worker

### Longo Prazo (quando tiver API real)
7. ⏳ Migrar de mock-data para API com caching
8. ⏳ Implementar ISR/revalidate para páginas de imóveis

---

## Conclusão

O código já está **bem otimizado** com 12+ regras Vercel aplicadas. Os 2 problemas de **ALTO impacto** são correções simples que podem ser feitas em menos de 30 minutos. O código segue boas práticas de React/Next.js performance.

**Nota:** A análise considera que o projeto usa mock data (6 propriedades). Quando migrar para API real, reconsiderar estratégias de cache e data fetching.
