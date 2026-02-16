# Implementation Plan

## Overview
Este plano detalha correções de tipagem, hooks do Payload, segurança de rotas e sincronização de documentação.

### Escopo técnico
- Eliminar casts inseguros (`any`/`unknown` sem narrowing).
- Padronizar hooks com gatilhos explícitos por operação (`create`/`update`).
- Reforçar segurança em autenticação e revalidação ISR.
- Consolidar regras de naming/import order e consistência de coleções/hooks.

### Premissas de execução
- Mudanças incrementais com validação contínua em staging.
- Operações de hook com guardas defensivas para evitar execução indevida.
- Estrutura de testes automatizados obrigatória para rotas críticas e hooks.

## Types

### Tipos adicionados/ajustados
- `DashboardStatsResponse`: contrato de resposta da rota `GET /api/dashboard-stats`.
- `SendEmailResult`: retorno tipado de `sendEmail` com `id` e `error` normalizados.
- `RichTextField` / `RichTextNode`: tipagem de rich-text para reduzir `any` nos campos Lexical.
- `SettingsValidation`: nome padronizado para função de validação de URL.

```ts
export type SettingsValidation = (value: unknown) => true | string
```

## Hooks e Collections

### Regras de lifecycle
- `distributeLead` e `updateLeadLastContact` devem rodar somente em criação.
- Se registrados em `afterChange`, manter guarda explícita:

```ts
if (operation !== 'create') return doc
```

### Round-robin (estado persistente)
- Persistir `last_assigned_agent_id` em configuração.
- Atualizar de forma transacional ao atribuir novo lead.
- Fallback: seleção por menor carga com lock/controle de corrida.

### Auto-code
- Busca do próximo código via sufixo numérico (não por ordenação lexicográfica pura).
- Verificação de colisão e retry limitado para concorrência.

## Tests

### Unit tests (Jest/Vitest)
- `distributeLead`:
  - atribui apenas em `create`;
  - respeita regra round-robin;
  - não altera lead quando não há agentes elegíveis.
- `updateLeadLastContact`:
  - atualiza `lastContactAt` somente em eventos válidos;
  - não quebra fluxo em falha de atualização.
- `sendEmail`:
  - retorna `id: null` quando provedor falha;
  - normaliza `error` para `Error`.

### Integration tests (Payload hooks + API)
- `notifyInterestedLeads`:
  - dispara no publish;
  - não dispara em updates não relevantes;
  - processa envios em paralelo com tratamento de falha parcial.
- `revalidateProperty`:
  - revalida slug antigo e novo em mudança de slug;
  - revalida listagem/home em publish/unpublish.
- `POST /api/revalidate`:
  - rejeita segredo inválido;
  - aceita somente `POST`;
  - falha com `405` para métodos não suportados.

### E2E / Smoke tests
- Fluxo de criação de lead -> distribuição -> atualização de dashboard.
- Fluxo de publicação de imóvel -> revalidação -> visibilidade pública.

### CI obrigatório
- `pnpm exec tsc --noEmit`
- `pnpm exec eslint .`
- suíte de testes (`pnpm test` ou comando equivalente do projeto)

## ISR revalidation

### Fluxo padrão
```ts
onPropertyAfterChange(doc, previousDoc, operation) {
  if (operation === 'create' && doc.status === 'published') {
    revalidate(['/imovel/' + doc.slug, '/imoveis', '/'])
  }

  if (operation === 'update') {
    if (slugChanged(previousDoc, doc)) {
      revalidate(['/imovel/' + previousDoc.slug, '/imovel/' + doc.slug, '/imoveis', '/'])
    }

    if (statusChanged(previousDoc, doc)) {
      revalidate(['/imovel/' + (previousDoc?.slug ?? doc.slug), '/imoveis', '/'])
    }
  }
}
```

### Falhas esperadas e mitigação
- Falha de rede/provedor de cache: retry com backoff curto (até 3 tentativas).
- Exceção inesperada em hook: log estruturado + não bloquear persistência do documento.
- Inconsistência temporária de cache: fallback para próxima janela de revalidação.

## Deployment/Rollback

### Estratégia de rollout
- Deploy incremental (canary por porcentagem de tráfego quando possível).
- Feature flags para hooks novos (`distributeLead`, `updateLeadLastContact`, notificações).
- Validação obrigatória em staging antes de merge para produção.

### Critérios de health-check
- Taxa de erro HTTP 5xx.
- Latência p95 de rotas críticas (`/api/leads`, `/api/revalidate`, `/api/dashboard-stats`).
- Falhas de hooks (`notify-leads.ts`, `revalidate-isr.ts`, `auto-code.ts`).

### Procedimento de rollback
1. Desativar feature flags dos hooks novos.
2. Reimplantar último artefato estável.
3. Se necessário, `revert` do commit de feature.
4. Confirmar recuperação por métricas e smoke tests.

### Contingência para incidente crítico
- Congelar deploys.
- Desligar hooks com maior impacto operacional.
- Notificar stakeholders (produto/suporte/operações).
- Executar hotfix com validação mínima + monitoramento reforçado.
