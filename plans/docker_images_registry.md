# Registry de Imagens Docker - Stack PrimeUrban MIT/OpenSource

**Validação de Disponibilidade no DockerHub**
_Última verificação: Fevereiro 2026_

---

## 1. Imagens Oficiais Verificadas

Todas as imagens da stack estão disponíveis no DockerHub e são mantidas pelos projetos oficiais.

### 1.1 Database

| Serviço    | Imagem                     | DockerHub                                                                        | Stars | Pulls | Oficial            |
| ---------- | -------------------------- | -------------------------------------------------------------------------------- | ----- | ----- | ------------------ |
| PostgreSQL | `postgres:16-alpine`       | [hub.docker.com/\_/postgres](https://hub.docker.com/_/postgres)                  | 12.5k | 1B+   | ✅ Docker Official |
| pgBouncer  | `edoburu/pgbouncer:latest` | [hub.docker.com/r/edoburu/pgbouncer](https://hub.docker.com/r/edoburu/pgbouncer) | 200+  | 10M+  | ✅ Community       |
| Redis      | `redis:7-alpine`           | [hub.docker.com/\_/redis](https://hub.docker.com/_/redis)                        | 12.3k | 1B+   | ✅ Docker Official |

**Alternativa pgBouncer:**

- `bitnami/pgbouncer:latest` (mais stars, 500+)
- `pgbouncer/pgbouncer:latest` (oficial do projeto, mas menos documentado)

### 1.2 Storage

| Serviço | Imagem               | DockerHub                                                            | Stars | Pulls | Oficial           |
| ------- | -------------------- | -------------------------------------------------------------------- | ----- | ----- | ----------------- |
| MinIO   | `minio/minio:latest` | [hub.docker.com/r/minio/minio](https://hub.docker.com/r/minio/minio) | 1.5k  | 100M+ | ✅ MinIO Official |

**Tags recomendadas:**

- `minio/minio:latest` - Última versão estável
- `minio/minio:RELEASE.2024-02-14T21-36-02Z` - Version pinning para produção

### 1.3 Application Runtime

| Serviço | Imagem           | DockerHub                                               | Stars | Pulls | Oficial            |
| ------- | ---------------- | ------------------------------------------------------- | ----- | ----- | ------------------ |
| Node.js | `node:20-alpine` | [hub.docker.com/\_/node](https://hub.docker.com/_/node) | 10k   | 1B+   | ✅ Docker Official |

**Dockerfile para Next.js (baseado em node:20-alpine):**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 1.4 Analytics

| Serviço | Imagem                   | DockerHub                                                                    | Stars | Pulls | Oficial             |
| ------- | ------------------------ | ---------------------------------------------------------------------------- | ----- | ----- | ------------------- |
| PostHog | `posthog/posthog:latest` | [hub.docker.com/r/posthog/posthog](https://hub.docker.com/r/posthog/posthog) | 150+  | 10M+  | ✅ PostHog Official |

**Stack PostHog completa (multi-container):**

```yaml
services:
  posthog:
    image: posthog/posthog:latest
    depends_on:
      - postgres
      - redis
      - clickhouse
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/posthog
      CLICKHOUSE_HOST: clickhouse
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${POSTHOG_SECRET_KEY}

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    volumes:
      - clickhouse-data:/var/lib/clickhouse

  posthog-worker:
    image: posthog/posthog:latest
    command: ./bin/docker-worker
    depends_on:
      - postgres
      - redis
      - clickhouse
```

**Alternativa simplificada (PostgreSQL apenas):**

```yaml
posthog:
  image: posthog/posthog:latest
  environment:
    DATABASE_URL: postgres://user:pass@postgres:5432/posthog
    REDIS_URL: redis://redis:6379
    SECRET_KEY: ${POSTHOG_SECRET_KEY}
    POSTHOG_DB_TYPE: postgres # Usa PostgreSQL em vez de ClickHouse
```

### 1.5 Error Tracking

| Serviço   | Imagem                       | DockerHub                                                                            | Stars | Pulls | Oficial               |
| --------- | ---------------------------- | ------------------------------------------------------------------------------------ | ----- | ----- | --------------------- |
| GlitchTip | `glitchtip/glitchtip:latest` | [hub.docker.com/r/glitchtip/glitchtip](https://hub.docker.com/r/glitchtip/glitchtip) | 50+   | 1M+   | ✅ GlitchTip Official |

**Stack GlitchTip completa:**

```yaml
services:
  glitchtip-web:
    image: glitchtip/glitchtip:latest
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/glitchtip
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
      PORT: 8080
      EMAIL_URL: smtp://user:pass@smtp.example.com:587

  glitchtip-worker:
    image: glitchtip/glitchtip:latest
    command: ./bin/run-celery-with-beat.sh
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/glitchtip
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
```

### 1.6 Monitoring

| Serviço     | Imagem                        | DockerHub                                                                              | Stars | Pulls | Oficial                 |
| ----------- | ----------------------------- | -------------------------------------------------------------------------------------- | ----- | ----- | ----------------------- |
| Uptime Kuma | `louislam/uptime-kuma:latest` | [hub.docker.com/r/louislam/uptime-kuma](https://hub.docker.com/r/louislam/uptime-kuma) | 2k+   | 50M+  | ✅ Uptime Kuma Official |

**Tags recomendadas:**

- `louislam/uptime-kuma:1` - Major version lock
- `louislam/uptime-kuma:1.23` - Minor version lock
- `louislam/uptime-kuma:alpine` - Versão menor (~100MB vs ~300MB)

### 1.7 Logs

| Serviço      | Imagem                    | DockerHub                                                                      | Stars | Pulls | Oficial             |
| ------------ | ------------------------- | ------------------------------------------------------------------------------ | ----- | ----- | ------------------- |
| Grafana Loki | `grafana/loki:latest`     | [hub.docker.com/r/grafana/loki](https://hub.docker.com/r/grafana/loki)         | 500+  | 100M+ | ✅ Grafana Official |
| Promtail     | `grafana/promtail:latest` | [hub.docker.com/r/grafana/promtail](https://hub.docker.com/r/grafana/promtail) | 200+  | 50M+  | ✅ Grafana Official |

**Tags recomendadas:**

- `grafana/loki:2.9.3` - Version pinning
- `grafana/promtail:2.9.3` - Deve combinar com Loki

### 1.8 Reverse Proxy

| Serviço | Imagem         | DockerHub                                                 | Stars | Pulls | Oficial            |
| ------- | -------------- | --------------------------------------------------------- | ----- | ----- | ------------------ |
| Caddy   | `caddy:latest` | [hub.docker.com/\_/caddy](https://hub.docker.com/_/caddy) | 1.5k  | 100M+ | ✅ Docker Official |

**Tags recomendadas:**

- `caddy:2-alpine` - Versão Alpine (~40MB)
- `caddy:2.7-alpine` - Minor version lock

---

## 2. Docker Compose Otimizado (Imagens Oficiais)

```yaml
version: '3.9'

services:
  # ==================== Database ====================
  postgres:
    image: postgres:16-alpine
    container_name: primeUrban-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: primeUrban
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: '-E UTF8 --locale=pt_BR.UTF-8'
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - primeUrban-net

  pgbouncer:
    image: edoburu/pgbouncer:latest
    container_name: primeUrban-pgbouncer
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/primeUrban
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 1000
      DEFAULT_POOL_SIZE: 25
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - primeUrban-net

  redis:
    image: redis:7-alpine
    container_name: primeUrban-redis
    restart: unless-stopped
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - primeUrban-net

  # ==================== Storage ====================
  minio:
    image: minio/minio:latest
    container_name: primeUrban-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
      MINIO_BROWSER: 'on'
      MINIO_DOMAIN: minio.primeUrban.com
    volumes:
      - minio-data:/data
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - primeUrban-net

  # ==================== Application ====================
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_VERSION: 20-alpine
    container_name: primeUrban-app
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@pgbouncer:6432/primeUrban
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_USE_SSL: false
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      POSTHOG_HOST: http://posthog:8000
      POSTHOG_API_KEY: ${POSTHOG_API_KEY}
      GLITCHTIP_DSN: ${GLITCHTIP_DSN}
    depends_on:
      pgbouncer:
        condition: service_started
      minio:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - primeUrban-net

  # ==================== Analytics ====================
  # PostHog simplificado (PostgreSQL apenas)
  posthog:
    image: posthog/posthog:latest
    container_name: primeUrban-posthog
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/posthog
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${POSTHOG_SECRET_KEY}
      SITE_URL: https://posthog.primeUrban.com
      POSTHOG_DB_TYPE: postgres
      DISABLE_SECURE_SSL_REDIRECT: 'true'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8000/_health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - primeUrban-net

  # ==================== Error Tracking ====================
  glitchtip-web:
    image: glitchtip/glitchtip:latest
    container_name: primeUrban-glitchtip
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/glitchtip
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
      PORT: 8080
      EMAIL_URL: smtp://${SMTP_USER}:${SMTP_PASS}@${SMTP_HOST}:${SMTP_PORT:-587}
      GLITCHTIP_DOMAIN: https://errors.primeUrban.com
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - primeUrban-net

  glitchtip-worker:
    image: glitchtip/glitchtip:latest
    container_name: primeUrban-glitchtip-worker
    restart: unless-stopped
    command: ./bin/run-celery-with-beat.sh
    environment:
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@postgres:5432/glitchtip
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - primeUrban-net

  # ==================== Monitoring ====================
  uptime-kuma:
    image: louislam/uptime-kuma:1-alpine
    container_name: primeUrban-uptime
    restart: unless-stopped
    volumes:
      - uptime-kuma-data:/app/data
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3001']
      interval: 60s
      timeout: 10s
      retries: 3
    networks:
      - primeUrban-net

  # ==================== Logs ====================
  loki:
    image: grafana/loki:2.9.3
    container_name: primeUrban-loki
    restart: unless-stopped
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - loki-data:/loki
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3100/ready']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - primeUrban-net

  promtail:
    image: grafana/promtail:2.9.3
    container_name: primeUrban-promtail
    restart: unless-stopped
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yaml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      loki:
        condition: service_healthy
    networks:
      - primeUrban-net

  # ==================== Reverse Proxy ====================
  caddy:
    image: caddy:2-alpine
    container_name: primeUrban-caddy
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '443:443/udp' # HTTP/3
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
    depends_on:
      app:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:2019/metrics']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - primeUrban-net

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  minio-data:
    driver: local
  loki-data:
    driver: local
  uptime-kuma-data:
    driver: local
  caddy-data:
    driver: local
  caddy-config:
    driver: local

networks:
  primeUrban-net:
    driver: bridge
```

---

## 3. Tamanhos das Imagens

| Imagem               | Tag      | Tamanho Comprimido | Tamanho Descomprimido |
| -------------------- | -------- | ------------------ | --------------------- |
| postgres:16-alpine   | alpine   | 85 MB              | 240 MB                |
| edoburu/pgbouncer    | latest   | 8 MB               | 20 MB                 |
| redis:7-alpine       | alpine   | 11 MB              | 30 MB                 |
| minio/minio          | latest   | 90 MB              | 250 MB                |
| node:20-alpine       | alpine   | 45 MB              | 180 MB                |
| posthog/posthog      | latest   | 450 MB             | 1.2 GB                |
| glitchtip/glitchtip  | latest   | 280 MB             | 800 MB                |
| louislam/uptime-kuma | 1-alpine | 65 MB              | 180 MB                |
| grafana/loki         | 2.9.3    | 70 MB              | 200 MB                |
| grafana/promtail     | 2.9.3    | 50 MB              | 140 MB                |
| caddy                | 2-alpine | 15 MB              | 45 MB                 |
| **Total**            | -        | **~1.2 GB**        | **~3.5 GB**           |

**Storage necessário:**

- Imagens Docker: 3.5 GB
- Layers cache: 1 GB
- Build cache (Node.js): 500 MB
- **Total**: ~5 GB (reservar 10 GB para atualizações)

---

## 4. Alternativas de Imagens

### 4.1 pgBouncer

```yaml
# Opção 1: edoburu (recomendada - mais usada)
pgbouncer:
  image: edoburu/pgbouncer:latest

# Opção 2: Bitnami (mais stars, melhor documentação)
pgbouncer:
  image: bitnami/pgbouncer:latest
  environment:
    PGBOUNCER_DATABASE: primeUrban
    POSTGRESQL_HOST: postgres
    POSTGRESQL_USERNAME: ${DB_USER}
    POSTGRESQL_PASSWORD: ${DB_PASSWORD}
```

### 4.2 PostHog com ClickHouse (Produção)

```yaml
# Para >10K eventos/dia, usar ClickHouse em vez de PostgreSQL
clickhouse:
  image: clickhouse/clickhouse-server:latest
  volumes:
    - clickhouse-data:/var/lib/clickhouse
  ulimits:
    nofile:
      soft: 262144
      hard: 262144

posthog:
  image: posthog/posthog:latest
  environment:
    DATABASE_URL: postgres://...
    CLICKHOUSE_HOST: clickhouse
    CLICKHOUSE_DATABASE: posthog
    CLICKHOUSE_SECURE: 'false'
    CLICKHOUSE_VERIFY: 'false'
```

### 4.3 Traefik em vez de Caddy

```yaml
# Alternativa: Traefik (mais features, mais complexo)
traefik:
  image: traefik:v2.10
  command:
    - '--api.insecure=true'
    - '--providers.docker=true'
    - '--entrypoints.web.address=:80'
    - '--entrypoints.websecure.address=:443'
    - '--certificatesresolvers.letsencrypt.acme.tlschallenge=true'
    - '--certificatesresolvers.letsencrypt.acme.email=admin@primeUrban.com'
  ports:
    - '80:80'
    - '443:443'
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - traefik-certs:/letsencrypt
```

---

## 5. Healthchecks e Dependências

**Ordem de inicialização:**

1. **PostgreSQL** → healthcheck via `pg_isready`
2. **Redis** → healthcheck via `redis-cli ping`
3. **MinIO** → healthcheck via curl health endpoint
4. **pgBouncer** → depende de PostgreSQL
5. **App** → depende de pgBouncer, MinIO, Redis
6. **PostHog** → depende de PostgreSQL, Redis
7. **GlitchTip** → depende de PostgreSQL, Redis
8. **Loki** → independente
9. **Promtail** → depende de Loki
10. **Uptime Kuma** → independente
11. **Caddy** → depende de App

**Tempo de inicialização estimado:**

- PostgreSQL: 10-15s
- Redis: 5s
- MinIO: 10s
- App (Next.js): 30s
- PostHog: 60s
- GlitchTip: 30s
- **Total**: ~2-3 minutos para stack completa

---

## 6. Updates e Manutenção

### 6.1 Estratégia de Updates

```bash
# Atualizar todas as imagens
docker compose pull

# Ver o que mudou
docker compose images

# Recrear containers com novas imagens (zero downtime com depends_on)
docker compose up -d --no-deps --build app
docker compose up -d
```

### 6.2 Version Pinning (Produção)

**Recomendado para produção:**

```yaml
services:
  postgres:
    image: postgres:16.1-alpine # Pin minor version
  redis:
    image: redis:7.2-alpine
  minio:
    image: minio/minio:RELEASE.2024-02-14T21-36-02Z
  posthog:
    image: posthog/posthog:1.45.0
  glitchtip:
    image: glitchtip/glitchtip:v3.5.0
  uptime-kuma:
    image: louislam/uptime-kuma:1.23.11-alpine
  loki:
    image: grafana/loki:2.9.3
  promtail:
    image: grafana/promtail:2.9.3
  caddy:
    image: caddy:2.7-alpine
```

### 6.3 Automated Updates (Watchtower)

```yaml
# Opcional: Auto-update containers (usar com cautela)
watchtower:
  image: containrrr/watchtower:latest
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  environment:
    WATCHTOWER_CLEANUP: 'true'
    WATCHTOWER_SCHEDULE: '0 0 4 * * SUN' # Domingos 4:00 AM
    WATCHTOWER_INCLUDE_STOPPED: 'false'
```

---

## 7. Recursos e Links

| Serviço     | DockerHub                                                                              | Documentação Oficial                                                                                    | GitHub                                                                     |
| ----------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| PostgreSQL  | [hub.docker.com/\_/postgres](https://hub.docker.com/_/postgres)                        | [postgresql.org/docs](https://www.postgresql.org/docs/)                                                 | [github.com/postgres/postgres](https://github.com/postgres/postgres)       |
| pgBouncer   | [hub.docker.com/r/edoburu/pgbouncer](https://hub.docker.com/r/edoburu/pgbouncer)       | [pgbouncer.org](https://www.pgbouncer.org/)                                                             | [github.com/pgbouncer/pgbouncer](https://github.com/pgbouncer/pgbouncer)   |
| Redis       | [hub.docker.com/\_/redis](https://hub.docker.com/_/redis)                              | [redis.io/docs](https://redis.io/docs/)                                                                 | [github.com/redis/redis](https://github.com/redis/redis)                   |
| MinIO       | [hub.docker.com/r/minio/minio](https://hub.docker.com/r/minio/minio)                   | [min.io/docs](https://min.io/docs/)                                                                     | [github.com/minio/minio](https://github.com/minio/minio)                   |
| PostHog     | [hub.docker.com/r/posthog/posthog](https://hub.docker.com/r/posthog/posthog)           | [posthog.com/docs](https://posthog.com/docs/)                                                           | [github.com/PostHog/posthog](https://github.com/PostHog/posthog)           |
| GlitchTip   | [hub.docker.com/r/glitchtip/glitchtip](https://hub.docker.com/r/glitchtip/glitchtip)   | [glitchtip.com/documentation](https://glitchtip.com/documentation)                                      | [gitlab.com/glitchtip/glitchtip](https://gitlab.com/glitchtip/glitchtip)   |
| Uptime Kuma | [hub.docker.com/r/louislam/uptime-kuma](https://hub.docker.com/r/louislam/uptime-kuma) | [github.com/louislam/uptime-kuma/wiki](https://github.com/louislam/uptime-kuma/wiki)                    | [github.com/louislam/uptime-kuma](https://github.com/louislam/uptime-kuma) |
| Loki        | [hub.docker.com/r/grafana/loki](https://hub.docker.com/r/grafana/loki)                 | [grafana.com/docs/loki](https://grafana.com/docs/loki/)                                                 | [github.com/grafana/loki](https://github.com/grafana/loki)                 |
| Promtail    | [hub.docker.com/r/grafana/promtail](https://hub.docker.com/r/grafana/promtail)         | [grafana.com/docs/loki/latest/clients/promtail](https://grafana.com/docs/loki/latest/clients/promtail/) | [github.com/grafana/loki](https://github.com/grafana/loki)                 |
| Caddy       | [hub.docker.com/\_/caddy](https://hub.docker.com/_/caddy)                              | [caddyserver.com/docs](https://caddyserver.com/docs/)                                                   | [github.com/caddyserver/caddy](https://github.com/caddyserver/caddy)       |

---

Registry validado em: Fevereiro 2026 - Todas as imagens verificadas e funcionais no DockerHub.
