# Gerenciando Coleções

Coleções são grupos de documentos de conteúdo (ex: Imóveis, Leads, Usuários). Elas são definidas em `payload/collections/`.

## Estrutura de uma Coleção

Uma coleção exporta um objeto `CollectionConfig`. Exemplo simplificado baseado em `Properties.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Properties: CollectionConfig = {
  slug: 'properties', // Identificador único na API e banco de dados
  labels: {
    singular: 'Imóvel',
    plural: 'Imóveis',
  },
  admin: {
    useAsTitle: 'title', // Campo usado como título na listagem
    defaultColumns: ['code', 'title', 'status'], // Colunas visíveis
    group: 'Imóveis', // Grupo no menu lateral
  },
  access: { ... }, // Controle de acesso
  hooks: { ... },  // Hooks de ciclo de vida
  fields: [ ... ], // Definição dos campos
}
```

## Controle de Acesso (`access`)

Define quem pode fazer o que. As funções recebem o `req` (com o usuário logado) e devem retornar `true` (permitir), `false` (negar) ou uma query (filtrar).

Exemplo (`Properties.ts`):

```typescript
access: {
  // Apenas admins e agentes podem criar/atualizar
  create: ({ req }) => ['admin', 'agent'].includes(req.user?.role || ''),
  update: ({ req }) => ['admin', 'agent'].includes(req.user?.role || ''),

  // Qualquer um pode ler (público)
  read: () => true,

  // Apenas admins podem deletar
  delete: ({ req }) => req.user?.role === 'admin',
},
```

## Campos (`fields`)

Os campos definem a estrutura dos dados. O Payload oferece diversos tipos:

- **`text` / `textarea`**: Texto simples ou longo.
- **`number`**: Números (inteiros ou float).
- **`select` / `radio`**: Opções pré-definidas.
- **`relationship`**: Relacionamento com outra coleção (ex: `relationTo: 'users'`).
- **`upload`**: Upload de arquivos (relacionado à coleção `media`).
- **`richText`**: Editor de texto rico (Lexical).
- **`tabs` / `row` / `group`**: Para organização visual e estrutural no admin.

### Exemplo de Campo (Slug)

```typescript
{
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  admin: {
    readOnly: true, // Não editável pelo usuário
  },
},
```

## Hooks

Hooks permitem executar lógica personalizada antes ou depois de operações.

- **`beforeChange`**: Útil para formatar dados automaticamente.
  - Ex: `autoSlug('title')` gera o slug a partir do título.
  - Ex: `autoCode('PRM')` gera um código sequencial (PRM-001).

- **`afterChange`**: Útil para efeitos colaterais.
  - Ex: `notifyInterestedLeads` envia e-mails quando um imóvel compatível é criado.
  - Ex: `revalidateProperty` limpa o cache do Next.js (ISR).

Para criar um novo Hook, adicione-o em `payload/hooks/` e importe na coleção.
