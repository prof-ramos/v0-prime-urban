# Scripts de Setup

Este diretório mantém apenas scripts auxiliares não duplicados.

## Seed oficial

Para criar usuários de teste, use apenas o entrypoint canônico:

```bash
pnpm db:seed
```

Esse comando executa `scripts/seed.ts`, que chama `seed.ts` e `payload/seeds/users.ts`.

## Observação

Scripts legados de seed em JS/TS/Python foram removidos para evitar divergência
de credenciais, hash de senha e comportamento entre ambientes.
