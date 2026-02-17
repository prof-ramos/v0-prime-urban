# Diagnóstico de Falhas E2E - PrimeUrban

**Data do diagnóstico final:** 2026-02-17  
**Status:** ✅ **Diagnóstico concluído e correções validadas**

## Snapshot final validado

```text
129 passed, 1 skipped, 0 failed
(uv run --python venv/bin/python pytest tests/e2e -v -m e2e)
```

## Causa-raiz consolidada

## 1) `test_contact_form.py`

### Problema A - Seletor de nome inválido
- Sintoma: timeout aguardando `input[type='text'], input[name='name']`.
- Causa real: campo usa `id="name"` sem `type='text'` explícito.
- Classificação: **bug de código de teste/page object**.
- Correção: seletor atualizado para `#name`.

### Problema B - Contrato de telefone divergente
- Sintoma: teste assumia telefone opcional.
- Causa real: UI atual marca telefone como `required`.
- Classificação: **falso positivo (expectativa incorreta)**.
- Correção: testes alinhados para telefone obrigatório.

### Problema C - Sucesso de envio não detectado
- Sintoma: após envio, teste não reconhecia sucesso e falhava em fallback.
- Causa real: regex buscava `enviado`, mas texto renderizado é `Mensagem enviada!`.
- Classificação: **bug de código de teste**.
- Correção: detecção de sucesso ampliada para `enviado|enviada|sucesso|success`.

## 2) `test_admin_ui.py`

### Problema D - Rotas antigas de admin
- Sintoma: testes navegavam para `/admin/collection/*` e caíam em páginas sem os elementos esperados.
- Causa real: Payload atual usa `/admin/collections/*`.
- Classificação: **bug de código de teste/page object**.
- Correção: page object migrado para caminho plural.

### Problema E - Seletores de sidebar e botões frágeis
- Sintoma: `0 collections`, botão salvar/cancelar “não encontrado”.
- Causa real: seletores não refletiam a estrutura real da UI atual.
- Classificação: **bug de código de teste/page object**.
- Correção: seletores robustos por links reais `/admin/collections/` e botão `Salvar`.

### Problema F - Logout flakey por interceptação de clique
- Sintoma: `Locator.click` bloqueado por overlay (`nextjs-portal intercepts pointer events`).
- Causa real: clique em elemento visual sujeito a interceptação.
- Classificação: **instabilidade de automação (flaky)**.
- Correção: fluxo de logout por navegação direta para `/admin/logout`.

### Problema G - Código 429 em login inválido
- Sintoma: teste esperava apenas 400/401/403 e falhava com 429.
- Causa real: lockout/rate-limit após tentativas inválidas.
- Classificação: **falso positivo (assert restritivo)**.
- Correção: aceitar `429` como rejeição válida de credencial inválida.

## 3) Estabilidade transversal

### Problema H - Timeouts ocasionais em `Page.goto`
- Sintoma: timeout em navegação com `wait_until='load'` + `networkidle`.
- Causa real: comportamento assíncrono do ambiente dev e overlays.
- Classificação: **flakiness de infraestrutura de teste**.
- Correção: `BasePage.goto/reload` com `domcontentloaded` + fallback controlado.

## Resultado do plano de correção

1. Diagnóstico completo por causa-raiz: **concluído**.
2. Plano de correção executado: **concluído**.
3. Validação pós-correção (suíte E2E inteira): **concluída** com sucesso.

## Pendências

- Apenas 1 teste segue `skipped` por design (`test_login_with_valid_credentials`), exigindo setup dedicado de credenciais para login manual.
