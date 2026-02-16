# Configuração do PayloadCMS

A configuração central do CMS reside em `payload/payload.config.ts`. Este arquivo exporta a configuração construída pela função `buildConfig`.

## Arquivo `payload.config.ts`

### Principais Seções

1. **`collections`**: Lista de todas as coleções registradas.

   ```typescript
   collections: [Users, Media, Properties, Leads, ...],
   ```

   Sempre que criar uma nova coleção em `payload/collections/`, você deve importá-la e adicioná-la a este array.

2. **`globals`**: Lista de configurações globais.

   ```typescript
   globals: [SETTINGS, LGPD_SETTINGS],
   ```

3. **`db` (Database Adapter)**: Configuração do banco de dados via `@payloadcms/db-sqlite`.

   ```typescript
   db: sqliteAdapter({
     client: {
       url: process.env.DATABASE_URL || 'file:./payload.db',
     },
   }),
   ```

   Por padrão, usa um arquivo SQLite local. Para produção ou outros ambientes, basta alterar a variável `DATABASE_URL`.

4. **`plugins`**: Plugins estendem a funcionalidade do CMS.
   - **SEO Plugin**: Gera campos de meta-dados (título, descrição, imagem) automaticamente para as coleções configuradas (`properties`, `neighborhoods`).
     ```typescript
     seoPlugin({
       collections: ['properties', 'neighborhoods'],
       uploadsCollection: 'media',
       // ... funções para gerar títulos automáticos
     }),
     ```

5. **`admin`**: Configurações da interface administrativa.
   - `user`: Define qual coleção é usada para autenticação de administradores (`users`).
   - `meta`: Título e ícones do painel.

## Adicionando Plugins

Para adicionar um novo plugin:

1. Instale o pacote: `uv add @payloadcms/plugin-nome`.
2. Importe-o em `payload.config.ts`.
3. Adicione-o ao array `plugins`.

## Localização (i18n)

O projeto está configurado para Português (pt-BR).

```typescript
i18n: {
  supportedLanguages: { pt },
},
```

As traduções da interface do admin vêm do pacote `@payloadcms/translations`.
