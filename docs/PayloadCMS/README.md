# Documentação do PayloadCMS

## Visão Geral

O projeto utiliza o **PayloadCMS 3.0** (Beta/RC) como Headless CMS para gerenciar o conteúdo do site (Imóveis, Leads, Configurações, etc.). Ele é integrado diretamente ao Next.js usando o App Router (`app/(payload)`).

## Configuração Inicial

### 1. Instalação

O PayloadCMS já está instalado como dependência do projeto. Para instalar todas as dependências:

```bash
uv run pnpm install
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis essenciais:

```env
# URL do Banco de Dados (SQLite local para desenvolvimento)
DATABASE_URL=file:./payload.db

# Segredo para criptografia de sessões (gerado automaticamente em dev se omitido, mas obrigatório em prod)
PAYLOAD_SECRET=seu-segredo-super-seguro

# URL da Aplicação
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Integrações (CRÍTICO: O projeto falhará se estas não estiverem definidas, mesmo para build)
RESEND_API_KEY=re_123456789 # Necessário para o envio de e-mails (lib/resend.ts)
```

> [!IMPORTANT]
> A inicialização do cliente de e-mail (`lib/resend.ts`) ocorre no carregamento do módulo. Se `RESEND_API_KEY` não estiver definida, comandos do Payload como `generate:types` podem falhar. Para desenvolvimento local sem envio real, defina um valor fictício (ex: `re_mock`).

### 3. Executando Localmente

Para iniciar o servidor de desenvolvimento (Next.js + Payload):

```bash
uv run pnpm dev
```

O painel administrativo estará disponível em: [http://localhost:3000/admin](http://localhost:3000/admin).

## Estrutura de Diretórios

A configuração do Payload fica concentrada no diretório `payload/`:

- **`payload.config.ts`**: Arquivo principal de configuração (Coleções, Globais, Plugins, DB).
- **`collections/`**: Definições das coleções de conteúdo (ex: `Properties.ts`, `Leads.ts`).
- **`globals/`**: Definições de configurações globais (ex: `Settings.ts`).
- **`hooks/`**: Hooks reutilizáveis (ex: `notify-leads.ts`).
- **`access/`**: Funções de controle de acesso (se extraídas).

## Comandos Úteis

- **Gerar Tipos TypeScript**: Gera interfaces baseadas nas suas coleções.
  ```bash
  npx payload generate:types
  ```
  Isso atualiza o arquivo `payload-types.ts` na raiz ou onde configurado.
