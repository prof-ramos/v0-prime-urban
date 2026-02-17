# Correção dos Findings do CodeRabbit — Análise de Debug

Análise e plano de correção dos 80+ findings identificados pelo CodeRabbit no repositório `v0-prime-urban`. Os findings foram categorizados por **prioridade** (Crítico → Baixo) e agrupados por componente.

## User Review Required

> [!CAUTION]
> **Credenciais Hardcoded em Produção**: O `payload.config.ts` contém email/senha de auto-login em texto claro e o `seed.ts` imprime senhas no console. Embora só se ativem em dev (`isDevBypassActive()`), isso consttui risco caso o código seja commitado/exposto.

> [!WARNING]
> **Bug de Normalização de Telefone**: A função `normalizeBrazilianPhone` em `validators.ts` só remove o "0" de DDD quando `digits.length === 12`, mas não trata o caso `length === 11` (ex: "06199999999" → deveria ser "6199999999"). Testes assertam valores errados por conta desse bug.

> [!IMPORTANT]
> **Volume de Mudanças**: São 80+ findings. Recomendo executar em fases (Crítico → Alto → Médio → Baixo) com commits isolados por fase. **Você quer que eu proceda com todas as fases ou apenas a Fase Crítica primeiro?**

---

## Proposed Changes

### 🔴 Fase 1: Segurança (Prioridade Crítica)

Findings que expõem credenciais ou criam riscos de segurança em produção.

---

#### [MODIFY] [payload.config.ts](file:///Users/gabrielramos/v0-prime-urban/payload/payload.config.ts)

- **Lines 59-66**: Substituir credenciais hardcoded de `autoLogin` por variáveis de ambiente
- Ler `DEV_AUTOLOGIN_EMAIL`, `DEV_AUTOLOGIN_PASSWORD` e `DEV_AUTOLOGIN_PREFILL` do `process.env`
- Manter fallback `false` quando variáveis não definidas
- Ref. doc Payload CMS: _autoLogin_ só ativa quando `isDevBypassActive()` retorna true, que já verifica `NODE_ENV === 'development'`

```diff
 autoLogin: isDevBypassActive()
   ? {
-      email: 'dev@primeurban.com',
-      password: 'dev-password-123',
-      prefillOnly: false,
+      email: process.env.DEV_AUTOLOGIN_EMAIL || 'dev@primeurban.com',
+      password: process.env.DEV_AUTOLOGIN_PASSWORD || 'dev-password-123',
+      prefillOnly: process.env.DEV_AUTOLOGIN_PREFILL === 'true',
     }
   : false,
```

#### [MODIFY] [seed.ts](file:///Users/gabrielramos/v0-prime-urban/seed.ts)

- **Lines 10-11**: Remover senhas de teste dos console.log
- Referência: "noHardcodedSecrets" das best practices

```diff
  console.log('\n📝 Test users:')
- console.log('  - admin@primeurban.test / test-admin-pass-123 (admin)')
- console.log('  - agent@primeurban.test / test-agent-pass-123 (agent)')
+ console.log('  - admin@primeurban.test (admin)')
+ console.log('  - agent@primeurban.test (agent)')
+ console.log('  ℹ️  Senhas estão definidas nas variáveis de ambiente ou em .env')
```

#### [MODIFY] [DEV_BYPASS_SECURITY_REPORT.md](file:///Users/gabrielramos/v0-prime-urban/DEV_BYPASS_SECURITY_REPORT.md)

- **Linha 10**: Corrigir wording confuso sobre `NODE_ENV` check
- **Lines 30-34**: Remover credenciais literais, usar placeholders
- **Lines 60-65**: Ajustar conclusão com linguagem cautelosa

#### [MODIFY] [CLAUDE.md](file:///Users/gabrielramos/v0-prime-urban/CLAUDE.md)

- **Linha 171**: Adicionar seção documentando a variável `NEXT_PUBLIC_PAYLOAD_URL`

---

### 🟠 Fase 2: Bugs & Comportamento Incorreto (Prioridade Alta)

Findings que causam falhas de testes ou comportamentos errados em produção/testes.

---

#### [MODIFY] [validators.ts](file:///Users/gabrielramos/v0-prime-urban/payload/hooks/validators.ts)

- **Lines 20-22**: Corrigir lógica de remoção do "0" de DDD para aceitar `length === 11` também

```diff
- if (digits.length === 12 && digits.startsWith('0')) {
+ if ((digits.length === 11 || digits.length === 12) && digits.startsWith('0')) {
    digits = digits.slice(1)
  }
```

#### [MODIFY] [test_config.py](file:///Users/gabrielramos/v0-prime-urban/tests/api/test_config.py)

- **Linha 22**: Corrigir versão Python `(3,14)` → `(3,10)` (realista)
- **Linha 16**: Remover import redundante de `pytest`
- **Lines 55-57**: Adicionar docstring ao smoke test

#### [MODIFY] [pytest.ini](file:///Users/gabrielramos/v0-prime-urban/pytest.ini)

- **Linha 27**: Corrigir `--cov=tests` → `--cov=payload` (cobertura do código de produção)
- **Linha 5**: Mover `test-primeurban.py` para `tests/` e renomear para `test_primeurban.py`

#### [MODIFY] [Properties.ts](file:///Users/gabrielramos/v0-prime-urban/payload/collections/Properties.ts)

- **Linha 76**: Reordenar hooks para `preserveGeneratedIdentity` rodar antes de `autoSlug`/`autoCode`
- **Lines 45-55**: Adicionar check defensivo em `preserveGeneratedIdentity` para `originalDoc.code` e `originalDoc.slug`

#### [MODIFY] [test-primeurban.py](file:///Users/gabrielramos/v0-prime-urban/test-primeurban.py)

- **Linha 14**: Extrair URL base para constante/env var `BASE_URL`
- **Lines 49+**: Substituir `wait_for_timeout` por `wait_for_selector`
- **Lines 57-77**: Adicionar asserções reais em `test_property_filters`
- **Lines 79-98**: Adicionar asserções reais em `test_payload_admin_login`

#### [MODIFY] [conftest.py (e2e)](file:///Users/gabrielramos/v0-prime-urban/tests/e2e/conftest.py)

- **Lines 19-29**: Corrigir docstring vs URL real (porta 3000 vs 3002)
- **Lines 121-123**: Sanitizar caracteres proibidos no nome do screenshot

#### [MODIFY] [conftest.py (root)](file:///Users/gabrielramos/v0-prime-urban/tests/conftest.py)

- **Lines 192-215**: Corrigir `agent_user_data` para aceitar status `(200, 201)` como `admin_user_data`
- **Lines 293-329**: Substituir URLs hardcoded em `test_neighborhood` por `payload_config['base_url']`

#### [MODIFY] [test_rbac_and_hooks.py](file:///Users/gabrielramos/v0-prime-urban/tests/api/test_rbac_and_hooks.py)

- **Lines 576-587**: Corrigir asserção de telefone normalizado para `"61999999999"` (11 dígitos)
- **Lines 589-599**: Idem para `test_normalize_phone_handles_plus55`
- **Linha 798-800**: Corrigir typo `CODECI` → `CRECI`

#### [MODIFY] [utils.py (tests/api)](file:///Users/gabrielramos/v0-prime-urban/tests/api/utils.py)

- **Lines 470-473**: Trocar truthiness checks por `is not None` para aceitar 0 como preço válido

---

### 🟡 Fase 3: Qualidade de Código (Prioridade Média)

Melhorias de manutenibilidade, performance e consistência.

---

#### [MODIFY] [middleware.ts](file:///Users/gabrielramos/v0-prime-urban/middleware.ts)

- **Lines 84-85**: Lazy instantiation do `RATE_LIMITER` — só criar instância quando `RATE_LIMIT_ENABLED`

```diff
-const RATE_LIMITER = new RateLimiter(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MINUTES)
 const RATE_LIMIT_ENABLED =
   process.env.NODE_ENV === 'production' && process.env.DISABLE_RATE_LIMIT !== 'true'
+let RATE_LIMITER: RateLimiter | null = null
+const getRateLimiter = (): RateLimiter => {
+  if (!RATE_LIMITER) {
+    RATE_LIMITER = new RateLimiter(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MINUTES)
+  }
+  return RATE_LIMITER
+}
```

#### [MODIFY] [dev-bypass.ts](file:///Users/gabrielramos/v0-prime-urban/payload/access/dev-bypass.ts)

- **Lines 3-8**: Padronizar idioma dos comentários (tudo PT-BR ou tudo EN)

#### [MODIFY] [package.json](file:///Users/gabrielramos/v0-prime-urban/package.json)

- **Lines 12-16**: Adicionar documentação explicando que os scripts `test:*` chamam pytest (testes Python)
- Considerar separação em README ou mover para scripts Python dedicados

#### [MODIFY] [fixtures.py](file:///Users/gabrielramos/v0-prime-urban/tests/api/fixtures.py)

- **Linha 32-35**: Substituir `datetime.utcnow()` por `datetime.now(timezone.utc)`
- **Lines 14-15**: Remover imports não usados (`Optional`, `timedelta`)
- **Lines 29-30**: Mover `import uuid` para top-level
- **Lines 304-309**: Usar `random.choice(ddd)` em vez de `random.randint(0, 7)`

#### [MODIFY] [test_rbac_and_hooks.py](file:///Users/gabrielramos/v0-prime-urban/tests/api/test_rbac_and_hooks.py)

- **Linha 14**: Remover import `json` não usado
- **Lines 170-172**: Usar exceção específica em vez de `Exception` genérica
- **Lines 828-829**: Canonizar formato CRECI para um formato único

#### [MODIFY] [test_leads.py](file:///Users/gabrielramos/v0-prime-urban/tests/api/collections/test_leads.py)

- **Diversos**: Adicionar cleanup/teardown em testes que criam dados
- **Lines 872-927**: Converter testes inline para `pytest.mark.parametrize`

---

### 🟢 Fase 4: Nitpicks (Prioridade Baixa)

Melhorias cosméticas, de estilo e de organização.

---

#### [MODIFY] [logo.tsx](file:///Users/gabrielramos/v0-prime-urban/payload/components/logo.tsx)

- Extrair cores hardcoded para design tokens

#### [MODIFY] [scripts/seed.ts](file:///Users/gabrielramos/v0-prime-urban/scripts/seed.ts)

- Reordenar imports: libs externas primeiro, depois locais

#### [MODIFY] [test.yml](file:///Users/gabrielramos/v0-prime-urban/.github/workflows/test.yml)

- Extrair steps duplicados para composite action
- Pinar versão do pnpm (não usar `latest`)
- Adicionar cache do pnpm store
- Adicionar cache do Python venv

#### [MODIFY] [properties_page.py](file:///Users/gabrielramos/v0-prime-urban/tests/e2e/pages/properties_page.py)

- Usar `data-testid` em vez de classes CSS Tailwind frágeis
- Substituir `wait_for_timeout` por waits explícitos

#### [MODIFY] [property_detail_page.py](file:///Users/gabrielramos/v0-prime-urban/tests/e2e/pages/property_detail_page.py)

- Mover `import re` para top-level
- Remover imports não usados (`List`, `Locator`)
- Melhorar fallback de preço (não usar regex em todo HTML)

#### [MODIFY] [payload-client.ts](file:///Users/gabrielramos/v0-prime-urban/tests/api/helpers/payload-client.ts)

- Substituir tipos `any` por genéricos tipados
- Corrigir dupla barra nas URLs (`/properties` → `properties`)
- Renomear `delete` para evitar shadowing do método pai
- Tratar `response.json()` com try/catch

#### [MODIFY] [test_filters.py](file:///Users/gabrielramos/v0-prime-urban/tests/e2e/test_filters.py)

- Remover import `Browser` não usado
- Parametrizar testes duplicados de filtro
- Substituir `wait_for_timeout` por waits determinísticos
- Adicionar asserções reais nos filtros de tipo de transação

#### [MODIFY] [README_RBAC_HOOKS.md](file:///Users/gabrielramos/v0-prime-urban/tests/api/README_RBAC_HOOKS.md)

- **Linha 145-146**: Corrigir formatação de lista (falta espaço após hífem)

---

## Verification Plan

### Testes Automatizados

Os seguintes comandos validam as correções:

```bash
# Build do Next.js (verifica TypeScript e imports)
pnpm build

# Testes Python de configuração (verifica versão Python, imports)
uv run python -m pytest tests/api/test_config.py -v

# Testes de hooks/RBAC (verifica normalização de telefone e CRECI)
uv run python -m pytest tests/api/test_rbac_and_hooks.py -v -k "normalize_phone"

# Testes de propriedades
uv run python -m pytest tests/api/collections/test_properties.py -v

# Grep para verificar que credenciais foram removidas
grep -rn "test-admin-pass\|test-agent-pass\|dev-password-123" --include="*.ts" --include="*.md" .
```

### Verificação Manual

1. **Credenciais Removidas**: Executar `grep` acima e confirmar zero resultados
2. **Normalização de Telefone**: Rodar o teste `test_normalize_phone_formats_brazilian_numbers` e verificar que "61999999999" (11 dígitos) é o resultado esperado
3. **Build limpo**: `pnpm build` sem erros TypeScript
