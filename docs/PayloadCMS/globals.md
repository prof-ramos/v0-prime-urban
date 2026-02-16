# Gerenciando Globais

Globais são configurações de instância única, usadas para dados que não se repetem (ex: Configurações do Site, Rodapé, Políticas). Elas ficam em `payload/globals/`.

## Estrutura de uma Global

Uma global exporta um objeto `GlobalConfig`. Exemplo baseado em `Settings.ts`:

```typescript
import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/is-admin'

export const SETTINGS: GlobalConfig = {
  slug: 'settings',
  label: 'Configurações Gerais',
  access: {
    // Apenas admins podem atualizar
    update: isAdmin,
    // Leitura pública
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Prime Urban',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'socialMedia',
      type: 'array', // Lista de itens
      fields: [
        { name: 'platform', type: 'select', options: [...] },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}
```

## Diferenças para Coleções

1. **Singleton**: Não existe "lista" de settings. É apenas um documento.
2. **API**: O endpoint é `/api/globals/settings` em vez de `/api/settings`.
3. **Admin**: Aparece em uma seção separada ou sob "Globais" no menu.

## Acessando no Código

Para buscar dados de uma Global na aplicação (Next.js):

Using Local API (Server Components):

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const settings = await payload.findGlobal({
  slug: 'settings',
})

console.log(settings.siteName)
```

## Campos Específicos

Globais também podem ter campos ocultos usados para controle interno.
Exemplo: `lastAssignedAgentIndex` em `Settings.ts` é usado para distribuir leads entre corretores (Round Robin), mas fica oculto no admin (`admin: { hidden: true }`).
