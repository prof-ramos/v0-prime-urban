# Backlog de Otimizações de Performance

**Data:** 2026-02-14
**Versão:** v0.4.0
**Baseado em:** Análise completa de performance com 3 agentes especializados

---

## 📋 Sumário

| Prioridade | Tarefas | Estimativa |
|------------|---------|------------|
| 🔴 ALTA | 3 | 2-4 horas |
| 🟡 MÉDIA | 5 | 4-8 horas |
| 🟢 BAIXA | 4 | 2-6 horas |

---

## 🔴 PRIORIDADE ALTA (Impacto > 20%)

### 1. Implementar ISR (Incremental Static Regeneration)

**Arquivo:** `app/imoveis/[slug]/page.tsx`
**Issue:** Página usa SSG puro sem revalidação
**Impacto:** Reduz carga no servidor, dados sempre atualizados

```typescript
// Implementar:
export const revalidate = 3600 // Revalida a cada 1 hora
```

**Benefícios:**
- Páginas atualizam periodicamente sem rebuild completo
- Melhor UX para dados que mudam frequentemente
- Reduz custos de servidor

**Estimativa:** 15 minutos

---

### 2. Adicionar HTTP cache headers com stale-while-revalidate

**Arquivo:** `next.config.mjs`
**Issue:** Páginas não têm cache headers configurados
**Impacto:** Reduz TTFB, melhora perceived performance

```javascript
// Adicionar em headers:
{
  source: '/imoveis/:path*',
  headers: [{
    key: 'Cache-Control',
    value: 'public, s-maxage=60, stale-while-revalidate=300'
  }]
}
```

**Benefícios:**
- CDN/edge caching habilitado
- Resposta instantânea do cache com revalidação em background
- Reduz carga no servidor

**Estimativa:** 30 minutos

---

### 3. Pre-computar neighborhoodNormalized

**Arquivo:** `lib/mock-data.ts`
**Issue:** `normalizeNeighborhood` executa NFD+regex para cada propriedade em cada filtro
**Impacto:** Reduz tempo de filtragem O(n*m) para O(1)

```typescript
// Adicionar campo normalizado:
export const mockProperties: Property[] = properties.map(p => ({
  ...p,
  neighborhoodNormalized: normalizeNeighborhood(p.neighborhood)
}))

// Criar índice:
const _neighborhoodSlugIndex = new Map<string, string>()
mockProperties.forEach(p => {
  _neighborhoodSlugIndex.set(p.neighborhood, p.neighborhoodNormalized)
})
```

**Benefícios:**
- Filtragem de bairro torna-se O(1) ao invés de O(n)
- Normalização executada uma vez na inicialização
- Lookup via Map é extremamente rápido

**Estimativa:** 45 minutos

---

## 🟡 PRIORIDADE MÉDIA (Impacto 10-20%)

### 4. Memoizar updateFilter com useCallback

**Arquivo:** `components/property-filters.tsx`
**Issue:** Função recriada em cada render
**Impacto:** Reduz re-renders desnecessários

```typescript
const updateFilter = useCallback((key, value) => {
  const newFilters = { ...localFilters, [key]: value }
  setLocalFilters(newFilters)
  // ... rest of logic
}, [localFilters, debouncedOnFilterChange, onFilterChange])
```

**Estimativa:** 30 minutos

---

### 5. Implementar stale-while-revalidate no Service Worker

**Arquivo:** `public/sw.js`
**Issue:** Estratégia atual é Network First sem stale-while-revalidate
**Impacto:** Conteúdo instantâneo do cache com atualização em background

```javascript
// Implementar para HTML páginas:
event.respondWith(
  caches.match(request).then((cached) => {
    const fetchPromise = fetch(request).then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })
      }
      return response
    })
    return cached || fetchPromise
  })
)
```

**Estimativa:** 45 minutos

---

### 6. Adicionar pre-caching de assets críticos

**Arquivo:** `public/sw.js`
**Issue:** Service Worker não faz pre-caching no install
**Impacto:** Primeira visita não beneficia de cache

```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/imoveis',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png'
      ])
    })
  )
})
```

**Estimativa:** 30 minutos

---

### 7. Implementar cache expiration por tipo de recurso

**Arquivo:** `public/sw.js`
**Issue:** Cache não expira, versão é "all-or-nothing"
**Impacto:** Controle granular de cache

```javascript
const CACHE_CONFIG = {
  static: { name: 'prime-urban-static-v1', maxAge: 30 * 24 * 60 * 60 * 1000 },
  images: { name: 'prime-urban-images-v1', maxAge: 7 * 24 * 60 * 60 * 1000 },
  api: { name: 'prime-urban-api-v1', maxAge: 5 * 60 * 1000 },
}
```

**Estimativa:** 1 hora

---

### 8. Runtime caching para imagens Unsplash

**Arquivo:** `public/sw.js`
**Issue:** Imagens externas não são cacheadas
**Impacto:** UX em conexões lentas

```javascript
// Adicionar após linha 57:
if (url.hostname.includes('images.unsplash.com')) {
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
  return
}
```

**Estimativa:** 30 minutos

---

## 🟢 PRIORIDADE BAIXA (Impacto < 10%)

### 9. Remover @custom-variant dark não utilizado

**Arquivo:** `app/globals.css:4052`
**Issue:** Dark mode removido mas CSS ainda existe

```css
/* Remover linha 4052:
@custom-variant dark (&:is(.dark *));
*/
```

**Estimativa:** 5 minutos

---

### 10. Remover variáveis CSS não utilizadas

**Arquivo:** `app/globals.css:4088-4095, 4131-4146`
**Issue:** Variáveis `--sidebar-*`, `--chart-*` não usadas

**Ação:** Remover variáveis não utilizadas

**Estimativa:** 10 minutos

---

### 11. Adicionar useCallback em handlers

**Arquivo:** `components/property-filters.tsx`
**Issue:** Handlers não memoizados podem causar re-renders

**Ação:** Envolver handlers em useCallback onde apropriado

**Estimativa:** 1 hora

---

### 12. Adicionar placeholder blur nas imagens

**Arquivo:** `components/property-card.tsx`
**Issue:** Imagens sem placeholder blur

```typescript
<Image
  src={property.images[0]}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  // ...
/>
```

**Estimativa:** 2 horas (gerar placeholders)

---

## ⏳ LONGO PRAZO (Quando tiver API real)

### 13. Migrar para React.cache()

**Arquivo:** `lib/mock-data.ts`
**Issue:** Cache manual não escala bem
**Impacto:** Deduplicação automática de requests

```typescript
import { cache } from 'react'

export const getProperties = cache(async () => {
  return mockProperties
})

export const getPropertyBySlug = cache(async (slug: string) => {
  return mockProperties.find((p) => p.slug === slug)
})
```

**Estimativa:** 2 horas

---

### 14. Implementar Virtual Scrolling

**Contexto:** Quando tiver 50+ propriedades
**Issue:** Renderizar todos cards causa problemas
**Impacto:** Performance em listas grandes

**Solução:** Usar `react-window` ou `react-virtuoso`

**Estimativa:** 4 horas

---

## 📊 Métricas de Sucesso

### Core Web Vitals (Objetivos)
| Métrica | Atual | Alvo | Após Otimizações |
|---------|-------|------|------------------:|
| LCP | ~1.2s | <2.5s | <1.0s |
| FID | ~50ms | <100ms | <30ms |
| CLS | ~0.05 | <0.1 | <0.02 |

### Bundle Size
| Artefato | Atual | Meta | Status |
|---------|-------|------|--------|
| JS Bundle | ~140KB | <200KB | ✅ |
| CSS | ~12KB | <15KB | ✅ |
| Imagens (avg) | ~120KB | - | ✅ |

---

## 🎯 Plano de Implementação Sugerido

### Fase 1 (Esta semana - 2 horas)
1. ✅ Quick Win #2: React.memo comparer - **FEITO**
2. 🔴 Tarefa #3: Pre-computar neighborhoodNormalized
3. 🔴 Tarefa #1: Implementar ISR

### Fase 2 (Próximo mês - 4 horas)
4. 🔴 Tarefa #2: HTTP cache headers
5. 🟡 Tarefa #4: useCallback em updateFilter
6. 🟡 Tarefa #5: stale-while-revalidate SW

### Fase 3 (Futuro - quando necessário)
7. 🟢 Tarefas de prioridade baixa
8. ⏳ Tarefas de longo prazo

---

## 📝 Notas

- Todas as otimizações devem ser validadas com Lighthouse/PageSpeed Insights
- Testar em dispositivos reais (3G connection) para validar ganhos
- Monitorar Core Web Vitals em produção após cada mudança
- Considerar A/B test para mudanças em UX (ex: debounce duration)

---

**Última atualização:** 2026-02-14
**Responsável:** Equipe de desenvolvimento
**Revisão:** Baseado em análise com 3 agentes de performance especializados
