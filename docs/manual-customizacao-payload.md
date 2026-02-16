# Manual de Customizacao do Payload (Projeto PrimeUrban)

Guia prático para entender exatamente quais arquivos mudam o que no Admin do Payload e quais pontos de customização são oficiais.

Baseado no projeto atual (`payload@3.76.x`) e na documentacao oficial do Payload.

---

## 1. Mapa de Arquivos: Quem Faz o Que

### Arquivos do App Router do Payload

| Arquivo | Responsabilidade | O que voce altera aqui |
| --- | --- | --- |
| `app/(payload)/layout.tsx` | Envolve todo o Admin com `RootLayout` do Payload | Integracao de `config`, `importMap`, wrappers globais e CSS do Admin |
| `app/(payload)/custom.css` | Tema visual do Admin | Cores, tipografia, espacamento, estados de botoes, estilo de nav/listas/cards |
| `app/(payload)/admin/[[...segments]]/page.tsx` | Renderiza as rotas do Admin (`/admin/...`) com `RootPage` | Normalmente nao mexer na logica; so se for trocar pipeline de renderizacao |
| `app/(payload)/admin/[[...segments]]/not-found.tsx` | 404 do Admin (`NotFoundPage`) | Comportamento da pagina nao encontrada do painel |
| `app/(payload)/admin/importMap.js` | Mapa de componentes resolvidos para o Admin | Nao editar manualmente (arquivo gerado). Manter versionado para garantir build/review reproduziveis |
| `app/(payload)/api/[...slug]/route.ts` | Endpoints REST do Payload no Next App Router | Exposicao dos handlers `GET/POST/PATCH/PUT/DELETE` do Payload |

### Arquivos de Config do Payload

| Arquivo | Responsabilidade | O que voce altera aqui |
| --- | --- | --- |
| `payload/payload.config.ts` | Fonte principal de configuracao do CMS | `admin.components`, `admin.meta`, `admin.routes`, colecoes, globals, plugins, editor |
| `payload/icon.svg` | Logo usada no Admin | Branding visual (atualmente ligado em `admin.components.graphics.Logo`) |
| `payload/collections/*.ts` | Schema e comportamento de cada colecao | Campos, hooks, access, endpoints custom, componentes em nivel de colecao |
| `payload/globals/*.ts` | Config de entidades globais | Campos, hooks, access, componentes em nivel de global |

### Resposta direta do exemplo que voce citou

- `app/(payload)/custom.css`: controla o visual do Admin. No projeto atual ele também força light mode e sobrescreve variáveis/classes do Payload.
- `app/(payload)/layout.tsx`: monta o shell do Admin (`RootLayout`) e conecta `config + importMap + css`. Sem ele, o Admin nao sobe corretamente.

---

## 2. Fluxo de Renderizacao do Admin (resumido)

1. `app/(payload)/layout.tsx` inicializa o shell (`RootLayout`).
2. `app/(payload)/admin/[[...segments]]/page.tsx` chama `RootPage` para resolver cada rota do Admin.
3. `importMap.js` liga paths de componentes customizados aos modulos reais.
4. `custom.css` aplica o tema/overrides de UI.
5. `payload/payload.config.ts` define o que existe de fato no Admin (colecoes, globals, views, componentes, plugins).

### Decisao de versionamento do `importMap.js`

- **Versionar no Git:** sim (rastreabilidade e previsibilidade em CI/review).
- **Edicao manual de entradas:** nao (sempre regenerado automaticamente pelo fluxo do Payload).
- **Quando revisar:** apenas diff estrutural (adicao/remocao de componentes), sem alterar hashes/aliases manualmente.

---

## 3. O Que Pode Ser Customizado (Oficial)

### 3.1 Nivel global do Admin (`config.admin.components`)

Pontos oficiais principais:

- `actions`
- `afterDashboard`, `beforeDashboard`
- `afterLogin`, `beforeLogin`
- `afterNav`, `beforeNav`
- `afterNavLinks`, `beforeNavLinks`
- `graphics.Icon`, `graphics.Logo`
- `header`
- `logout.Button`
- `Nav`
- `providers`
- `settingsMenu`
- `views` (`account`, `dashboard`, e rotas custom)

Também é oficial customizar:

- `admin.meta` (titulo/descricao/favicon/og)
- `admin.routes` (rotas como `/login`, `/logout`, `/account`, etc.)
- `admin.theme` (`light`, `dark`, `all`)

### 3.2 Nivel de colecao (`collection.admin.components`)

Pontos oficiais principais:

- Lista: `beforeList`, `beforeListTable`, `afterList`, `afterListTable`, `listMenuItems`
- Edicao de documento: `edit.beforeDocumentControls`, `edit.editMenuItems`, `edit.PreviewButton`, `edit.PublishButton`, `edit.SaveButton`, `edit.SaveDraftButton`, `edit.Status`, `edit.UnpublishButton`, `edit.Upload`
- Views: `views.list`, `views.edit` (inclui document views custom via `path`)
- `Description` para descricao custom da entidade

### 3.3 Nivel de global (`global.admin.components`)

Pontos oficiais principais:

- `elements.beforeDocumentControls`
- `elements.Description`
- `elements.PreviewButton`
- `elements.PublishButton`
- `elements.SaveButton`
- `elements.SaveDraftButton`
- `elements.Status`
- `elements.UnpublishButton`
- `views.edit`

### 3.4 Nivel de campo (`field.admin.components`)

Comum para campos:

- `Field`
- `Cell`
- `Filter` (client component)
- `Description`
- `Diff`

Por tipo de campo, tambem existem slots adicionais como:

- `beforeInput`, `afterInput`
- `Label`, `Error`
- `RowLabel` (ex.: arrays)

### 3.5 Exemplos práticos

- **Botão extra na list view**  
  1. Crie um componente Client (ex: `components/ListViewButton.tsx`) que chama validate e mostra `useConfig()`/`usePayloadAPI`.  
  2. No `payload/payload.config.ts`, adicione o componente à coleção:

  ```ts
  import { Properties } from './collections/properties'
  export default buildConfig({
    collections: [
      {
        ...Properties,
        admin: {
          ...Properties.admin,
          components: {
            ...Properties.admin?.components,
            listMenuItems: [
              ...(Properties.admin?.components?.listMenuItems || []),
              {
                path: '/components/ListViewButton',
                exportName: 'ListViewButton',
                clientProps: { label: 'Reprocessar fichas' },
              },
            ],
          },
        },
      },
    ],
    // restante da configuração...
  })
  ```

  Esse botão aparece no menu da list view. `ListViewButton` pode chamar uma rota customizada ou disparar `usePayloadAPI()` para tarefas administrativas.

- **Campo customizado via `Field`**  
  1. Crie `components/HighlightField.tsx` como Client Component:

  ```tsx
  'use client'
  import type { TextFieldClientComponent } from 'payload'
  import { TextInput, useField } from '@payloadcms/ui'

  export const HighlightField: TextFieldClientComponent = ({ field }) => {
    const { value, setValue } = useField<string>()
    return (
      <div className="border-l-4 border-amber-400 pl-3">
        <TextInput value={value || ''} onChange={(event) => setValue(event.target.value)} />
        <p className="text-xs text-gray-500">{field.description}</p>
      </div>
    )
  }
  ```

  2. Lembre-se de exportar o componente e referenciá-lo no CSV:

  ```ts
  {
    name: 'corDestaque',
    type: 'text',
    admin: {
      components: {
        Field: '/components/HighlightField#HighlightField',
      },
    },
  }
  ```

  Esse `Field` substitui o input padrão do Payload e pode adicionar wrappers, dicas ou lógica extra antes/depois do `TextInput`.

---

## 4. Componentes e APIs Recomendados pela Documentacao

### 4.1 Componentes oficiais para construir UI no Admin

Prefira usar `@payloadcms/ui` para manter consistencia visual e de comportamento.

Exemplos utilitários:

- Layout/UI: `Gutter`, `Banner`, `Button`, `Modal`, `Pill`
- Drawers: `useDocumentDrawer`, `useListDrawer`
- Campos: `FieldLabel`, `FieldDescription`, `TextInput`
- Acoes de documento: `PreviewButton`, `SaveButton`, `SaveDraftButton`, `PublishButton`, `UnpublishButton`

### 4.2 Views/Layouts oficiais do pacote Next

De `@payloadcms/next`:

- Layout: `RootLayout`
- Views: `RootPage`, `NotFoundPage`, `generatePageMetadata`
- Templates: `DefaultTemplate`, `MinimalTemplate`

### 4.3 Hooks recomendados no client

No admin custom, os hooks de `@payloadcms/ui` mais usados:

- `useAuth`
- `useConfig`
- `useDocumentInfo`
- `useField`
- `useForm`, `useFormFields`
- `useLocale`
- `useTranslation`
- `usePayloadAPI` (nao `usePayload`)

---

## 5. O Que a Documentacao Recomenda na Pratica

- Preferir componentes oficiais do ecossistema Payload (`@payloadcms/ui` e `@payloadcms/next`) antes de bibliotecas externas.
- Usar customizacao por `admin.components` em vez de forkar telas internas.
- Manter `importMap` gerado automaticamente.
- Usar Server Components por padrão; Client Components apenas quando houver interatividade/hook.
- Se alterar `admin.routes`, alinhar as rotas/folders no App Router.
- Evitar dependencias com CSS global agressivo dentro do Admin.
- Escopar regras CSS em um wrapper do Admin (ex.: `.pu-admin-scope`) para evitar vazamento de estilos.
- Cobrir acessibilidade minima de UI custom (foco visivel, reduced motion e contraste de componentes interativos).
- Incluir fallback de scrollbar para Firefox (`scrollbar-width` + `scrollbar-color`) quando houver customizacao visual.
- `admin.disable` esta deprecado: para desativar admin/API, remova os diretórios `(payload)` correspondentes.

---

## 6. Repositorios GitHub Recomendados (Oficiais)

| Repositorio | Uso recomendado |
| --- | --- |
| `https://github.com/payloadcms/payload` | Codigo-fonte principal, discussoes, changelog e referencia de implementacao |
| `https://github.com/payloadcms/payload/tree/main/examples` | Exemplos oficiais completos (patterns reais) |
| `https://github.com/payloadcms/payload/tree/main/templates` | Templates oficiais para bootstrap de projetos |

Complemento util (nao GitHub): `https://payloadcms.com/docs` e `https://withpayload.com`.

---

## 7. Checklist Rápido: "Quero mudar X, edito onde?"

- Tema do Admin (cores, botoes, nav): `app/(payload)/custom.css`
- Shell global do Admin / providers / importMap: `app/(payload)/layout.tsx`
- Branding (logo e metadados): `payload/payload.config.ts` e `payload/icon.svg`
- Rotas/telas custom de Admin: `payload/payload.config.ts` em `admin.components.views`
- Endpoints REST do Payload no Next: `app/(payload)/api/[...slug]/route.ts`
- Campos e UI por coleção/global: `payload/collections/*.ts` e `payload/globals/*.ts`
