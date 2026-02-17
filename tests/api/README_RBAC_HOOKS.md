# Testes de RBAC e Hooks - Payload CMS

## Overview

Este arquivo contém testes abrangentes para **Role-Based Access Control (RBAC)** e **Hooks** do Payload CMS na plataforma PrimeUrban.

## Arquivo

- **Localização**: `tests/api/test_rbac_and_hooks.py`
- **Linhas**: 951
- **Testes**: 47 casos de teste

## Estrutura dos Testes

### 1. Testes de RBAC - Properties (`TestPropertiesRBAC`)
8 testes verificando permissões de acesso para a collection `properties`:

- ✅ Admin pode criar propriedades
- ✅ Agent pode criar propriedades
- ✅ Admin pode atualizar propriedades
- ✅ Agent pode atualizar propriedades
- ✅ Admin pode deletar propriedades
- ✅ Agent **NÃO** pode deletar propriedades
- ✅ Anônimo pode ler propriedades
- ✅ Anônimo **NÃO** pode criar propriedades

### 2. Testes de RBAC - Leads (`TestLeadsRBAC`)
7 testes verificando permissões de acesso para a collection `leads`:

- ✅ Admin pode criar leads
- ✅ Agent pode criar leads
- ✅ Admin pode ler todos os leads
- ✅ Agent só pode ler leads atribuídos a ele
- ✅ Agent **NÃO** pode ler leads não atribuídos
- ✅ Admin pode deletar leads
- ✅ Agent **NÃO** pode deletar leads

### 3. Testes de RBAC - Users (`TestUsersRBAC`)
7 testes verificando permissões de acesso para a collection `users`:

- ✅ Admin pode criar usuários
- ✅ Admin pode atualizar usuários
- ✅ Admin pode deletar usuários
- ✅ Agent **NÃO** pode criar usuários
- ✅ Usuário pode atualizar seu próprio perfil
- ✅ Usuário **NÃO** pode atualizar outros usuários
- ✅ Usuário **NÃO** pode deletar sua própria conta

### 4. Testes de Hooks - Auto Slug (`TestAutoSlugHook`)
3 testes verificando o hook `autoSlug`:

- ✅ Gera slug automaticamente a partir do título
- ✅ Trata caracteres especiais corretamente
- ✅ Não altera slug quando título é atualizado

### 5. Testes de Hooks - Auto Code (`TestAutoCodeHook`)
2 testes verificando o hook `autoCode`:

- ✅ Gera códigos sequenciais (PRM-001, PRM-002...)
- ✅ Respeita código fornecido explicitamente

### 6. Testes de Hooks - Normalize Phone (`TestNormalizePhoneHook`)
4 testes verificando a normalização de telefone:

- ✅ Formata números brasileiros
- ✅ Remove código do país +55
- ✅ Valida tamanho (10 ou 11 dígitos)
- ✅ Normaliza diversos formatos

### 7. Testes de Hooks - Lead Score (`TestLeadScoreHook`)
3 testes verificando o cálculo de score:

- ✅ Lead sem dados tem score 0
- ✅ Lead com telefone tem score > 0
- ✅ Lead com telefone e email tem score máximo

### 8. Testes de Hooks - Lead Distribution (`TestLeadDistributionHook`)
1 teste verificando distribuição automática:

- ✅ Lead sem assignedTo é atribuído automaticamente

### 9. Testes de Hooks - ISR Revalidation (`TestISRRevalidationHook`)
2 testes verificando revalidação de ISR:

- ✅ Publicar propriedade dispara revalidação
- ✅ Mudar status dispara revalidação

### 10. Testes de Hooks - Neighborhood Name Sync (`TestNeighborhoodNameSyncHook`)
1 teste verificando sincronização:

- ✅ Nome do bairro é sincronizado automaticamente

### 11. Testes de Hooks - User Fields Normalization (`TestUserFieldsNormalizationHook`)
3 testes verificando normalização de campos de usuário:

- ✅ Telefone é normalizado
- ✅ CRECI de agent é normalizado
- ✅ CRECI é limpo para não-agentes

### 12. Testes de Autenticação (`TestAuthentication`)
4 testes verificando autenticação JWT:

- ✅ Login com credenciais válidas retorna token
- ✅ Login inválido retorna erro
- ⏭️ Token expirado retorna 401 (skip)
- ✅ Token inválido retorna 401

### 13. Testes de Integração - RBAC + Hooks (`TestRBACWithHooks`)
2 testes verificando interação entre RBAC e hooks:

- ✅ Agent cria propriedade com código automático
- ✅ Admin cria lead com telefone normalizado

## Como Executar

### Executar todos os testes:
```bash
python3 -m pytest tests/api/test_rbac_and_hooks.py -v
```

### Executar apenas testes de RBAC:
```bash
python3 -m pytest tests/api/test_rbac_and_hooks.py -m rbac -v
```

### Executar apenas testes de Hooks:
```bash
python3 -m pytest tests/api/test_rbac_and_hooks.py -m hooks -v
```

### Executar uma classe específica:
```bash
python3 -m pytest tests/api/test_rbac_and_hooks.py::TestPropertiesRBAC -v
```

### Executar um teste específico:
```bash
python3 -m pytest tests/api/test_rbac_and_hooks.py::TestPropertiesRBAC::test_admin_can_create_property -v
```

## Requisitos

- Servidor Payload CMS rodando em `localhost:3000`
- Usuários de teste criados (admin e agent)
-pytest configurado com fixtures do `conftest.py`

## Cobertura de Permissões

| Collection | Admin | Agent | Assistant | Anônimo |
|------------|-------|-------|-----------|---------|
| Properties | CRUD | CRU | - | R |
| Leads | CRUD | CR (own) | - | - |
| Users | CRUD | self | self | - |
| Neighborhoods | CRUD | - | - | R |
| Media | CRUD | - | - | - |

**Legenda**: C=Create, R=Read, U=Update, D=Delete

## Hooks Testados

### BeforeChange
- `autoSlug` - Gera slug a partir de campo
- `autoCode` - Gera código sequencial
- `normalizeLeadPhone` - Normaliza telefone
- `normalizeUserContactFields` - Normaliza telefone e CRECI
- `syncNeighborhoodName` - Sincroniza nome do bairro

### AfterChange
- `revalidateProperty` - Revalida ISR Next.js
- `distributeLead` - Distribui lead para agentes
- `updateLeadScore` - Calcula score do lead

## Aceitação

✅ Permissões por role validadas
✅ Side effects dos hooks validados
✅ Unauthorized access retorna 401/403
✅ 47 casos de teste implementados
